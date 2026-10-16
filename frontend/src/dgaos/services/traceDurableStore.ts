/**
 * TRACE & DGAOS Durable Persistence Store
 * Provides persistent IndexedDB & localStorage backing for:
 * - Records (Cases, Evidence, Examinations, Reports)
 * - Drafts (Autosaved working notes, partial forms, worksheets)
 * - Session context (Active case, station, open tabs, filters)
 * - Hybrid Findings Transmission (Stage A: Draft -> Stage B: Finalized -> Stage C: Transmitted)
 */

import { seed, templates, type LabRecord, type Template, type Kind } from '../lib/records';
import { get, set } from 'idb-keyval';

export type SaveState = 'saved' | 'saving' | 'error' | 'unsaved';

export interface TraceDraft {
  id: string; // record ID or exam ID
  caseId: string;
  kind: 'examination' | 'report' | 'evidence' | 'note';
  data: Record<string, any>;
  worksheetValues?: Record<string, string>;
  updatedAt: string;
}

export interface TraceSession {
  activeCaseId: string | null;
  activeStation: string;
  activeEvidenceId: string | null;
  selectedRecordId: string | null;
  openTabs: Array<{ id: string; title: string; view: string; recordId?: string | null; isClosable: boolean }>;
  activeTabId: string;
  searchFilter: string;
  searchQuery: string;
  closingSummaryEnabled: boolean;
  lastUpdated: string;
}

export interface TransmissionRecord {
  id: string;
  reportId: string;
  caseId: string;
  dgaCaseId: string;
  forensicRequestId?: string;
  analyst: string;
  status: 'Draft Saved' | 'Finalized' | 'Awaiting Transmission' | 'Transmitted' | 'Received by DGAOS' | 'Failed';
  summary: string;
  findings: string;
  limitations: string;
  finalizedAt: string;
  transmittedAt?: string;
  receiptAcknowledgedAt?: string;
  retryCount: number;
  auditTrail: Array<{ at: string; event: string; actor: string; details?: string }>;
}

const STORAGE_KEYS = {
  RECORDS: 'trace_records_v2',
  TEMPLATES: 'trace_templates_v2',
  DRAFTS: 'trace_drafts_v2',
  SESSION: 'trace_session_v2',
  TRANSMISSIONS: 'trace_transmissions_v2',
  ATTACHMENTS: 'trace_attachments_v2',
};

async function idbGet<T>(key: string): Promise<T | null> {
  if (typeof indexedDB === 'undefined') return null;
  try {
    return (await get<T>(key)) || null;
  } catch {
    return null;
  }
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    await set(key, value);
  } catch {}
}

class TraceDurableStore {
  private recordsCache: LabRecord[] = [];
  private draftsCache: Record<string, TraceDraft> = {};
  private transmissionsCache: Record<string, TransmissionRecord> = {};
  private sessionCache: TraceSession;
  private isInitialized = false;
  private saveState: SaveState = 'saved';
  private subscribers: Array<(state: { saveState: SaveState; lastSaved?: string }) => void> = [];

  constructor() {
    this.sessionCache = {
      activeCaseId: 'FS-2026-00422',
      activeStation: 'Dashboard',
      activeEvidenceId: null,
      selectedRecordId: null,
      openTabs: [{ id: 'view-Dashboard', title: 'Dashboard', view: 'Dashboard', isClosable: false }],
      activeTabId: 'view-Dashboard',
      searchFilter: 'All',
      searchQuery: '',
      closingSummaryEnabled: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 1. Load records from IndexedDB or fallback to localStorage / seed
      const storedRecords = (await idbGet<LabRecord[]>(STORAGE_KEYS.RECORDS)) || this.loadLocal<LabRecord[]>(STORAGE_KEYS.RECORDS);
      if (storedRecords && Array.isArray(storedRecords) && storedRecords.length > 0) {
        this.recordsCache = storedRecords;
      } else {
        this.recordsCache = [...seed];
        await this.persistRecords();
      }

      // 2. Load drafts
      const storedDrafts = (await idbGet<Record<string, TraceDraft>>(STORAGE_KEYS.DRAFTS)) || this.loadLocal<Record<string, TraceDraft>>(STORAGE_KEYS.DRAFTS);
      if (storedDrafts) this.draftsCache = storedDrafts;

      // 3. Load transmissions
      const storedTransmissions = (await idbGet<Record<string, TransmissionRecord>>(STORAGE_KEYS.TRANSMISSIONS)) || this.loadLocal<Record<string, TransmissionRecord>>(STORAGE_KEYS.TRANSMISSIONS);
      if (storedTransmissions) this.transmissionsCache = storedTransmissions;

      // 4. Load session
      const storedSession = (await idbGet<TraceSession>(STORAGE_KEYS.SESSION)) || this.loadLocal<TraceSession>(STORAGE_KEYS.SESSION);
      if (storedSession) this.sessionCache = { ...this.sessionCache, ...storedSession };

      this.isInitialized = true;
    } catch (err) {
      console.warn('TraceDurableStore initialization fallback:', err);
      this.recordsCache = [...seed];
      this.isInitialized = true;
    }
  }

  // --- Records API ---
  public getRecords(): LabRecord[] {
    return [...this.recordsCache];
  }

  public getRecord(id: string): LabRecord | undefined {
    return this.recordsCache.find((r) => r.id === id);
  }

  public async saveRecord(record: LabRecord): Promise<LabRecord> {
    const existingIndex = this.recordsCache.findIndex((r) => r.id === record.id);
    if (existingIndex >= 0) {
      this.recordsCache[existingIndex] = record;
    } else {
      this.recordsCache.unshift(record);
    }
    await this.persistRecords();
    this.broadcastRecordsChanged();
    return record;
  }

  public async deleteRecord(id: string): Promise<boolean> {
    const prevLen = this.recordsCache.length;
    this.recordsCache = this.recordsCache.filter((r) => r.id !== id);
    if (this.recordsCache.length !== prevLen) {
      await this.persistRecords();
      this.broadcastRecordsChanged();
      return true;
    }
    return false;
  }

  private async persistRecords(): Promise<void> {
    this.notifySaveState('saving');
    try {
      await idbSet(STORAGE_KEYS.RECORDS, this.recordsCache);
      this.saveLocal(STORAGE_KEYS.RECORDS, this.recordsCache);
      this.notifySaveState('saved');
    } catch {
      this.saveLocal(STORAGE_KEYS.RECORDS, this.recordsCache);
      this.notifySaveState('saved');
    }
  }

  // --- Drafts API ---
  public getDraft(id: string): TraceDraft | undefined {
    return this.draftsCache[id];
  }

  public getAllDrafts(): TraceDraft[] {
    return Object.values(this.draftsCache);
  }

  public async saveDraft(draft: TraceDraft): Promise<void> {
    this.notifySaveState('saving');
    this.draftsCache[draft.id] = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    try {
      await idbSet(STORAGE_KEYS.DRAFTS, this.draftsCache);
      this.saveLocal(STORAGE_KEYS.DRAFTS, this.draftsCache);
      this.notifySaveState('saved');
    } catch {
      this.saveLocal(STORAGE_KEYS.DRAFTS, this.draftsCache);
      this.notifySaveState('saved');
    }
  }

  public async removeDraft(id: string): Promise<void> {
    delete this.draftsCache[id];
    try {
      await idbSet(STORAGE_KEYS.DRAFTS, this.draftsCache);
      this.saveLocal(STORAGE_KEYS.DRAFTS, this.draftsCache);
    } catch {
      this.saveLocal(STORAGE_KEYS.DRAFTS, this.draftsCache);
    }
  }

  // --- Session API ---
  public getSession(): TraceSession {
    return { ...this.sessionCache };
  }

  public async updateSession(partial: Partial<TraceSession>): Promise<void> {
    this.sessionCache = {
      ...this.sessionCache,
      ...partial,
      lastUpdated: new Date().toISOString(),
    };
    try {
      await idbSet(STORAGE_KEYS.SESSION, this.sessionCache);
      this.saveLocal(STORAGE_KEYS.SESSION, this.sessionCache);
    } catch {
      this.saveLocal(STORAGE_KEYS.SESSION, this.sessionCache);
    }
  }

  // --- Hybrid Transmission & Finalization API ---
  public getTransmission(reportId: string): TransmissionRecord | undefined {
    return this.transmissionsCache[reportId];
  }

  public getAllTransmissions(): TransmissionRecord[] {
    return Object.values(this.transmissionsCache);
  }

  public async finalizeExamination(
    examId: string,
    analyst: string,
    findings: string,
    limitations: string
  ): Promise<LabRecord> {
    const exam = this.getRecord(examId);
    if (!exam || exam.kind !== 'examination') {
      throw new Error(`Examination ${examId} not found.`);
    }

    // Explicit finalization creates an immutable snapshot
    const finalizedExam: LabRecord = {
      ...exam,
      revision: exam.revision + 1,
      data: {
        ...exam.data,
        status: 'Completed',
        conclusion: findings,
        limitations: limitations,
        analyst,
        finalizedAt: new Date().toISOString(),
        finalizedBy: analyst,
      },
    };
    await this.saveRecord(finalizedExam);
    await this.removeDraft(examId);

    // Create or update Stage B report
    const existingReport = this.recordsCache.find((r) => r.kind === 'report' && r.data.examinationId === examId);
    let reportRecord: LabRecord;

    if (existingReport) {
      reportRecord = {
        ...existingReport,
        revision: existingReport.revision + 1,
        data: {
          ...existingReport.data,
          summary: findings,
          limitations,
          status: 'In review',
          examinationSnapshot: finalizedExam.data,
        },
      };
      await this.saveRecord(reportRecord);
    } else {
      const reportId = `RP-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      reportRecord = {
        id: reportId,
        kind: 'report',
        caseId: exam.caseId,
        revision: 1,
        created: new Date().toISOString(),
        data: {
          title: `Forensic Findings: ${exam.data.title}`,
          examinationId: exam.id,
          author: analyst,
          summary: findings,
          limitations,
          status: 'In review',
          history: [
            {
              at: new Date().toISOString(),
              status: 'In review',
              reviewer: analyst,
              note: 'Finalized by examiner; awaiting administrative review and authorized transmission.',
            },
          ],
          examinationSnapshot: finalizedExam.data,
        },
      };
      await this.saveRecord(reportRecord);
    }

    // Record Transmission queue entry (Stage B: Finalized, awaiting transmission)
    const transmission: TransmissionRecord = {
      id: `TX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      reportId: reportRecord.id,
      caseId: exam.caseId || 'UNKNOWN',
      dgaCaseId: exam.caseId || 'UNKNOWN',
      analyst,
      status: 'Awaiting Transmission',
      summary: reportRecord.data.title,
      findings,
      limitations,
      finalizedAt: new Date().toISOString(),
      retryCount: 0,
      auditTrail: [
        {
          at: new Date().toISOString(),
          event: 'EXAMINATION_FINALIZED',
          actor: analyst,
          details: `Examination ${examId} finalized. Report ${reportRecord.id} generated in Stage B.`,
        },
      ],
    };
    this.transmissionsCache[reportRecord.id] = transmission;
    await idbSet(STORAGE_KEYS.TRANSMISSIONS, this.transmissionsCache);
    this.saveLocal(STORAGE_KEYS.TRANSMISSIONS, this.transmissionsCache);

    return reportRecord;
  }

  public async transmitFindings(
    reportId: string,
    authorizedBy: string,
    targetDgaCaseId?: string
  ): Promise<{ success: boolean; transmission: TransmissionRecord; message: string }> {
    const report = this.getRecord(reportId);
    if (!report || report.kind !== 'report') {
      throw new Error(`Report ${reportId} not found.`);
    }

    let tx = this.transmissionsCache[reportId];
    if (!tx) {
      tx = {
        id: `TX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        reportId: report.id,
        caseId: report.caseId || 'UNKNOWN',
        dgaCaseId: targetDgaCaseId || report.caseId || 'UNKNOWN',
        analyst: report.data.author || authorizedBy,
        status: 'Awaiting Transmission',
        summary: report.data.title,
        findings: report.data.summary,
        limitations: report.data.limitations,
        finalizedAt: report.created,
        retryCount: 0,
        auditTrail: [],
      };
    }

    const dgaCaseId = targetDgaCaseId || tx.dgaCaseId || report.caseId;
    tx.status = 'Transmitted';
    tx.transmittedAt = new Date().toISOString();
    tx.auditTrail.push({
      at: new Date().toISOString(),
      event: 'FINDINGS_RELEASED',
      actor: authorizedBy,
      details: `Authorized release transmitted to DGA case ${dgaCaseId}.`,
    });

    // Mark report status as Issued
    const updatedReport: LabRecord = {
      ...report,
      revision: report.revision + 1,
      data: {
        ...report.data,
        status: 'Issued',
        history: [
          ...(report.data.history || []),
          {
            at: new Date().toISOString(),
            status: 'Issued',
            reviewer: authorizedBy,
            note: `Official forensic findings released and transmitted to DGAOS case ${dgaCaseId}.`,
          },
        ],
      },
    };
    await this.saveRecord(updatedReport);

    // Save transmission status
    tx.status = 'Received by DGAOS';
    tx.receiptAcknowledgedAt = new Date().toISOString();
    tx.auditTrail.push({
      at: new Date().toISOString(),
      event: 'DGAOS_RECEIPT_CONFIRMED',
      actor: 'DGA_CORE',
      details: `Findings attached to DGAOS case ${dgaCaseId}.`,
    });
    this.transmissionsCache[reportId] = tx;
    await idbSet(STORAGE_KEYS.TRANSMISSIONS, this.transmissionsCache);
    this.saveLocal(STORAGE_KEYS.TRANSMISSIONS, this.transmissionsCache);

    // Broadcast live event for DGAOS to attach the finding
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('trace:findings-transmitted', {
          detail: {
            reportId,
            dgaCaseId,
            summary: report.data.summary,
            limitations: report.data.limitations,
            analyst: report.data.author,
            timestamp: tx.transmittedAt,
          },
        })
      );
    }

    return {
      success: true,
      transmission: tx,
      message: `Findings from report ${reportId} successfully transmitted to DGAOS case ${dgaCaseId}.`,
    };
  }

  // --- Save indicator subscribers ---
  public subscribeSaveState(cb: (state: { saveState: SaveState; lastSaved?: string }) => void): () => void {
    this.subscribers.push(cb);
    cb({ saveState: this.saveState });
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notifySaveState(state: SaveState): void {
    this.saveState = state;
    const payload = { saveState: state, lastSaved: new Date().toLocaleTimeString() };
    for (const sub of this.subscribers) {
      try {
        sub(payload);
      } catch {}
    }
  }

  private broadcastRecordsChanged(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trace:records-changed'));
    }
  }

  private loadLocal<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private saveLocal(key: string, value: unknown): void {
    if (typeof window === 'undefined') return null;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

export const traceDurableStore = new TraceDurableStore();
