'use client';
import type {
  FullCaseData,
  VaccineRecord,
  DiagnosticTestRecord,
  MedicalIntakeRecord,
} from './case-schema';
import caseData001 from '@/data/cases/case-001-conservatory-homicide.json';
import caseData002 from '@/data/cases/case-002-broad-street-vault.json';
import caseData003 from '@/data/cases/case-003-harbor-staged-overdose.json';
import caseCatalog from '@/data/banks/case-catalog.json';
import { createRecordId } from './record-id';

const CASE_STORAGE_KEY = 'trace_active_case_data_v2';
const CASE_LIBRARY_KEY = 'trace_case_library_v1';
function validCase(value: any): value is FullCaseData {
  const uniqueIds = (items: any[], field: string) => Array.isArray(items)
    && items.every(item => typeof item?.[field] === 'string' && item[field].trim())
    && new Set(items.map(item => item[field])).size === items.length;
  return !!value && typeof value.meta?.id === 'string' && !!value.meta.id.trim()
    && uniqueIds(value.medical?.subjects, 'subjectId') && Array.isArray(value.timeline)
    && uniqueIds(value.evidence, 'id') && uniqueIds(value.citizens, 'id')
    && Array.isArray(value.interrogations) && Array.isArray(value.crimeScene?.placards)
    && !!value.courtroom && typeof value.courtroom === 'object';
}
function caseLibrary(): Record<string, FullCaseData> {
  const raw = localStorage.getItem(CASE_LIBRARY_KEY);
  if (!raw) return Object.create(null);
  const value = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('The TRACE case library is unreadable. Restore a backup before changing cases.');
  const library: Record<string, FullCaseData> = Object.create(null);
  for (const [id, item] of Object.entries(value)) {
    if (!validCase(item) || item.meta.id !== id) throw new Error('A saved TRACE case is invalid. Your library was retained.');
    library[id] = item;
  }
  return library;
}

export const CASE_PRESETS: Record<string, FullCaseData> = {
  'CASE-2026-001': caseData001 as unknown as FullCaseData,
  'CASE-2026-002': caseData002 as unknown as FullCaseData,
  'CASE-2026-003': caseData003 as unknown as FullCaseData,
};

export function getCaseCatalog() {
  return caseCatalog.catalog;
}

export function getActiveCaseData(): FullCaseData {
  if (typeof window === 'undefined') {
    return structuredClone(caseData001) as unknown as FullCaseData;
  }
  try {
    const stored = localStorage.getItem(CASE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (validCase(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse stored case data, falling back to default:', err);
  }
  return structuredClone(caseData001) as unknown as FullCaseData;
}

export function saveActiveCaseData(caseData: FullCaseData): void {
  if (typeof window === 'undefined') return;
  if (!validCase(caseData)) throw new Error('The TRACE case is incomplete and was not saved.');
  const previousLibrary = localStorage.getItem(CASE_LIBRARY_KEY);
  const previousActive = localStorage.getItem(CASE_STORAGE_KEY);
  const library = caseLibrary();
  if (previousActive) {
    const previous = JSON.parse(previousActive);
    if (validCase(previous)) library[previous.meta.id] = previous;
  }
  library[caseData.meta.id] = caseData;
  try {
    localStorage.setItem(CASE_LIBRARY_KEY, JSON.stringify(library));
    localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(caseData));
  } catch (error) {
    if (previousLibrary === null) localStorage.removeItem(CASE_LIBRARY_KEY);
    else localStorage.setItem(CASE_LIBRARY_KEY, previousLibrary);
    if (previousActive === null) localStorage.removeItem(CASE_STORAGE_KEY);
    else localStorage.setItem(CASE_STORAGE_KEY, previousActive);
    throw error;
  }
}

export function loadCaseById(caseId: string): FullCaseData {
  const stored = typeof window === 'undefined' ? undefined : caseLibrary()[caseId];
  const activeRaw = typeof window === 'undefined' ? null : localStorage.getItem(CASE_STORAGE_KEY);
  const active = activeRaw ? JSON.parse(activeRaw) : null;
  const targetCase = (validCase(active) && active.meta.id === caseId ? active : undefined)
    || stored || (Object.hasOwn(CASE_PRESETS, caseId) ? CASE_PRESETS[caseId] : undefined);
  if (!targetCase) throw new Error(`TRACE case ${caseId} was not found. The active case was retained.`);
  const copy = structuredClone(targetCase);
  saveActiveCaseData(copy);
  return copy;
}

export function resetToDefaultCase(): FullCaseData {
  const fresh = structuredClone(caseData001) as unknown as FullCaseData;
  saveActiveCaseData(fresh);
  return fresh;
}

export function exportCaseAsJson(caseData: FullCaseData): void {
  if (typeof window === 'undefined') return;
  const jsonStr = JSON.stringify(caseData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `${caseData.meta.caseNumber || 'TRACE-CASE'}-${caseData.meta.id || 'export'}.json`;
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importCaseFromJson(jsonString: string): FullCaseData {
  const parsed = JSON.parse(jsonString) as FullCaseData;
  if (!validCase(parsed)) {
    throw new Error('Invalid TRACE case: provide metadata, medical subjects, timeline, scene, evidence, citizens, interviews, and courtroom records.');
  }
  saveActiveCaseData(parsed);
  return parsed;
}

export function addVaccineToSubject(
  subjectId: string,
  newVaccine: Omit<VaccineRecord, 'id'>,
  caseData: FullCaseData
): FullCaseData {
  const updatedSubjects = caseData.medical.subjects.map((subj) => {
    if (subj.subjectId !== subjectId) return subj;
    const vaccineId = createRecordId('VAC', caseData.meta.id);
    return {
      ...subj,
      vaccines: [...subj.vaccines, { ...newVaccine, id: vaccineId }],
    };
  });

  const updatedCase: FullCaseData = {
    ...caseData,
    medical: {
      ...caseData.medical,
      subjects: updatedSubjects,
    },
  };
  saveActiveCaseData(updatedCase);
  return updatedCase;
}

export function addDiagnosticTestToSubject(
  subjectId: string,
  newTest: Omit<DiagnosticTestRecord, 'id'>,
  caseData: FullCaseData
): FullCaseData {
  const updatedSubjects = caseData.medical.subjects.map((subj) => {
    if (subj.subjectId !== subjectId) return subj;
    const testId = createRecordId('TEST', caseData.meta.id);
    return {
      ...subj,
      diagnosticTests: [...subj.diagnosticTests, { ...newTest, id: testId }],
    };
  });

  const updatedCase: FullCaseData = {
    ...caseData,
    medical: {
      ...caseData.medical,
      subjects: updatedSubjects,
    },
  };
  saveActiveCaseData(updatedCase);
  return updatedCase;
}

export function updateIntakeRecord(
  subjectId: string,
  updatedIntake: Partial<MedicalIntakeRecord>,
  caseData: FullCaseData
): FullCaseData {
  const updatedSubjects = caseData.medical.subjects.map((subj) => {
    if (subj.subjectId !== subjectId) return subj;
    return {
      ...subj,
      intake: {
        ...subj.intake,
        ...updatedIntake,
      },
    };
  });

  const updatedCase: FullCaseData = {
    ...caseData,
    medical: {
      ...caseData.medical,
      subjects: updatedSubjects,
    },
  };
  saveActiveCaseData(updatedCase);
  return updatedCase;
}

export function acceptAndSignTraceCase(
  caseId: string,
  investigatorName: string,
  signature: string
): FullCaseData {
  const currentCase = loadCaseById(caseId);
  const updatedCase: FullCaseData = {
    ...currentCase,
    meta: {
      ...currentCase.meta,
      status: 'Active',
      leadInvestigator: investigatorName,
      primaryInvestigatorSignature: signature,
      acceptedAt: new Date().toISOString()
    }
  };
  saveActiveCaseData(updatedCase);
  return updatedCase;
}
