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

const CASE_STORAGE_KEY = 'trace_active_case_data_v2';

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
    return caseData001 as unknown as FullCaseData;
  }
  try {
    const stored = localStorage.getItem(CASE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as FullCaseData;
    }
  } catch (err) {
    console.error('Failed to parse stored case data, falling back to default:', err);
  }
  return caseData001 as unknown as FullCaseData;
}

export function saveActiveCaseData(caseData: FullCaseData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(caseData));
  } catch (err) {
    console.error('Failed to persist case data:', err);
  }
}

export function loadCaseById(caseId: string): FullCaseData {
  const targetCase = CASE_PRESETS[caseId] || CASE_PRESETS['CASE-2026-001'];
  saveActiveCaseData(targetCase);
  return targetCase;
}

export function resetToDefaultCase(): FullCaseData {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CASE_STORAGE_KEY);
    } catch {}
  }
  return caseData001 as unknown as FullCaseData;
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
  if (!parsed.meta || !parsed.medical) {
    throw new Error('Invalid TRACE Case JSON: missing meta or medical docket.');
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
    const vaccineId = `VAC-${Date.now().toString().slice(-4)}`;
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
    const testId = `TEST-${Date.now().toString().slice(-4)}`;
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
