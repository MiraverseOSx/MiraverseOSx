import { DGACase, SuggestionDisposition } from './dga-types';

export type SuggestionCategory =
  | 'PEOPLE'
  | 'EVIDENCE'
  | 'LAB'
  | 'MEDICAL'
  | 'TASKS'
  | 'FINDINGS'
  | 'DISPOSITION';

export type SuggestionPriority = 'routine' | 'important' | 'urgent';

export type SuggestionStatus = 'suggested' | 'accepted' | 'dismissed' | 'deferred';

export interface InvestigativeSuggestion {
  id: string;
  caseId: string;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  title: string;
  explanation: string;
  rationale: string;
  actionLabel: string;
  actionType: string;
  supportingRecordIds: string[];
  status: SuggestionStatus;
  targetTab:
    | 'overview'
    | 'people'
    | 'medical'
    | 'evidence'
    | 'forensics'
    | 'requests'
    | 'findings'
    | 'documents'
    | 'tasks'
    | 'timeline'
    | 'disposition';
  modalName?: 'add_person' | 'log_evidence' | 'request_medstat' | 'requisition_trace' | 'add_task' | 'record_finding' | 'add_note';
  dismissed?: boolean;
  deferred?: boolean;
  accepted?: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_PREFIX = 'DGAOS_SUGGESTION_STATE_';

interface SuggestionInteractionState {
  dismissed: Record<string, boolean>;
  deferred: Record<string, boolean>;
  accepted: Record<string, boolean>;
}

const MEDICAL_CONTEXT = [
  'collapse',
  'collapsed',
  'patient',
  'hospital',
  'unresponsive',
  'injury',
  'injured',
  'medical',
  'overdose',
  'poison',
  'toxin',
  'icu',
  'cardiac',
  'deceased',
  'wound',
  'examination'
];

function getStoredInteractionState(caseId: string): SuggestionInteractionState {
  if (typeof window === 'undefined') return { dismissed: {}, deferred: {}, accepted: {} };
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${caseId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // Stored suggestion state is optional. The case record is authoritative when present.
  }
  return { dismissed: {}, deferred: {}, accepted: {} };
}

function saveStoredInteractionState(caseId: string, state: SuggestionInteractionState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${caseId}`, JSON.stringify(state));
  } catch {
    // Ignore quota failures. The case record copy is written by the store.
  }
}

export function dismissSuggestion(caseId: string, suggestionId: string) {
  const state = getStoredInteractionState(caseId);
  state.dismissed[suggestionId] = true;
  saveStoredInteractionState(caseId, state);
}

export function deferSuggestion(caseId: string, suggestionId: string) {
  const state = getStoredInteractionState(caseId);
  state.deferred[suggestionId] = true;
  saveStoredInteractionState(caseId, state);
}

export function acceptSuggestion(caseId: string, suggestionId: string) {
  const state = getStoredInteractionState(caseId);
  state.accepted[suggestionId] = true;
  saveStoredInteractionState(caseId, state);
}

export function resetSuggestions(caseId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${caseId}`);
  } catch {
    // ignore
  }
}

function dispositionFor(caseData: DGACase, suggestionId: string): SuggestionDisposition | undefined {
  const fromCase = caseData.suggestionState?.find((item) => item.suggestionId === suggestionId);
  if (fromCase) return fromCase;
  const stored = getStoredInteractionState(caseData.id);
  const now = caseData.updatedAt || new Date().toISOString();
  if (stored.dismissed[suggestionId]) {
    return { suggestionId, status: 'dismissed', updatedAt: now, updatedBy: 'local' };
  }
  if (stored.deferred[suggestionId]) {
    return { suggestionId, status: 'deferred', updatedAt: now, updatedBy: 'local' };
  }
  if (stored.accepted[suggestionId]) {
    return { suggestionId, status: 'accepted', updatedAt: now, updatedBy: 'local' };
  }
  return undefined;
}

function textMentionsMedical(...parts: Array<string | undefined>): boolean {
  const haystack = parts.filter(Boolean).join(' ').toLowerCase();
  return MEDICAL_CONTEXT.some((word) => haystack.includes(word));
}

function isOpenMedicalStatus(status: string): boolean {
  return !['Completed', 'Rejected', 'Cancelled', 'Partially Fulfilled'].includes(status);
}

function sameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const bag = new Set(right);
  return left.every((item) => bag.has(item));
}

export function evaluateCaseSuggestions(caseData: DGACase): InvestigativeSuggestion[] {
  if (!caseData) return [];

  const now = caseData.updatedAt || new Date().toISOString();
  const suggestions: InvestigativeSuggestion[] = [];
  const push = (suggestion: Omit<InvestigativeSuggestion, 'caseId' | 'rationale' | 'status' | 'dismissed' | 'deferred' | 'accepted' | 'createdAt' | 'updatedAt' | 'actionType'> & { actionType?: string }) => {
    suggestions.push({
      ...suggestion,
      caseId: caseData.id,
      rationale: suggestion.explanation,
      actionType: suggestion.actionType || (suggestion.modalName ? 'OPEN_MODAL' : 'NAVIGATE'),
      status: 'suggested',
      createdAt: now,
      updatedAt: now
    });
  };

  if (caseData.people.length === 0) {
    push({
      id: `sug-people-${caseData.id}`,
      category: 'PEOPLE',
      priority: 'urgent',
      title: 'Consider identifying and adding involved persons.',
      explanation: 'This case has no linked people. The narrative alone does not establish who was involved.',
      actionLabel: 'Add Person',
      targetTab: 'people',
      modalName: 'add_person',
      supportingRecordIds: [caseData.id]
    });
  }

  const victims = caseData.people.filter((person) => person.role.toLowerCase().includes('victim'));
  const medicalRequests = caseData.medicalRequests || [];
  const medicalContext = textMentionsMedical(caseData.summary, caseData.incidentLocationText, ...victims.map((person) => `${person.notes || ''} ${person.role}`)) || caseData.department === 'Medical';

  for (const victim of victims) {
    const related = medicalRequests.some(
      (request) =>
        request.subjectPersonId === victim.personId ||
        request.subjectName.toLowerCase() === victim.name.toLowerCase()
    );
    if (!related && !caseData.medicalRecordId && medicalContext) {
      push({
        id: `sug-med-victim-${caseData.id}-${victim.personId}`,
        category: 'MEDICAL',
        priority: 'important',
        title: 'Medical documentation may be relevant.',
        explanation: `${victim.name} is recorded as a victim and the case context describes a medical concern. Consider requesting records if appropriate. This does not create a report.`,
        actionLabel: 'Request Medical Records',
        targetTab: 'medical',
        modalName: 'request_medstat',
        supportingRecordIds: [victim.personId]
      });
    }
  }

  for (const request of medicalRequests.filter((item) => isOpenMedicalStatus(item.status))) {
    push({
      id: `sug-med-open-${request.id}`,
      category: 'MEDICAL',
      priority: request.priority === 'Critical' || request.priority === 'High' ? 'urgent' : 'important',
      title: 'Medical records request awaiting response.',
      explanation: `${request.id} for ${request.subjectName} is ${request.status}. Open the request to review its status.`,
      actionLabel: 'Open Request',
      targetTab: 'medical',
      supportingRecordIds: [request.id, request.subjectPersonId || request.subjectName]
    });
  }

  const pendingEvidenceIds = new Set(
    caseData.forensicRequests
      .filter((request) => !['Completed', 'Cancelled', 'Rejected', 'COMPLETE', 'CANCELLED'].includes(request.status))
      .flatMap((request) => request.evidenceIds)
  );

  const unsubmitted = caseData.evidence.filter(
    (item) => !item.linkedTraceEvidenceId && !pendingEvidenceIds.has(item.id)
  );
  if (unsubmitted.length > 0) {
    push({
      id: `sug-lab-review-${caseData.id}-${unsubmitted.map((item) => item.id).sort().join('-')}`,
      category: 'LAB',
      priority: 'important',
      title: 'Review whether laboratory examination is appropriate.',
      explanation: `${unsubmitted.length} evidence item(s), starting with "${unsubmitted[0].title}", have no laboratory request. Examination is optional until you submit it.`,
      actionLabel: 'Request Laboratory Analysis',
      targetTab: 'forensics',
      modalName: 'requisition_trace',
      supportingRecordIds: unsubmitted.map((item) => item.id)
    });
  } else if (caseData.evidence.length === 0) {
    push({
      id: `sug-evidence-${caseData.id}`,
      category: 'EVIDENCE',
      priority: 'routine',
      title: 'No evidence has been registered for this case.',
      explanation: 'Add an evidence item only when something was actually collected or received. Empty custody is expected on a new report.',
      actionLabel: 'Add Evidence',
      targetTab: 'evidence',
      modalName: 'log_evidence',
      supportingRecordIds: [caseData.id]
    });
  }

  for (const request of caseData.forensicRequests) {
    const released = request.resultSummary && ['Completed', 'COMPLETE', 'Completed'].includes(request.status);
    if (!released || !request.resultSummary) continue;
    const alreadyRecorded = (caseData.findings || []).some(
      (finding) => finding.kind === 'Laboratory Finding' && finding.supportingRecordIds.includes(request.id)
    );
    if (alreadyRecorded) continue;
    push({
      id: `sug-lab-report-${request.id}`,
      category: 'LAB',
      priority: 'urgent',
      title: 'New TRACE report available for review.',
      explanation: `${request.id} has a released laboratory result. Review it before recording any investigative finding. The result does not close the case.`,
      actionLabel: 'Open Report',
      targetTab: 'forensics',
      supportingRecordIds: [request.id, request.linkedTraceCaseId || ''].filter(Boolean)
    });
  }

  const disputed = (caseData.findings || []).filter((finding) => finding.kind === 'Disputed Information');
  const verified = (caseData.findings || []).filter((finding) => finding.kind === 'Verified Fact' || finding.kind === 'Laboratory Finding' || finding.kind === 'Medical Finding');
  if (disputed.length > 0 && verified.length > 0) {
    const ids = [...disputed, ...verified].map((finding) => finding.id);
    push({
      id: `sug-conflict-${caseData.id}-${ids.sort().join('-')}`,
      category: 'FINDINGS',
      priority: 'important',
      title: 'Potential inconsistency identified between existing records.',
      explanation: `Disputed information (${disputed.map((finding) => finding.id).join(', ')}) is on file alongside other recorded findings (${verified.map((finding) => finding.id).join(', ')}). The system does not decide which statement is true.`,
      actionLabel: 'Review Findings',
      targetTab: 'findings',
      supportingRecordIds: ids
    });
  }

  const overdue = caseData.tasks.filter((task) => !task.completed && task.dueDate && Date.parse(task.dueDate) < Date.now());
  if (overdue.length > 0) {
    push({
      id: `sug-overdue-${caseData.id}-${overdue.map((task) => task.id).sort().join('-')}`,
      category: 'TASKS',
      priority: 'urgent',
      title: 'Overdue investigative tasks need review.',
      explanation: `${overdue.length} task(s) are past the recorded due date, including "${overdue[0].title}".`,
      actionLabel: 'Open Tasks',
      targetTab: 'tasks',
      supportingRecordIds: overdue.map((task) => task.id)
    });
  } else if (caseData.tasks.length === 0) {
    push({
      id: `sug-tasks-${caseData.id}`,
      category: 'TASKS',
      priority: 'routine',
      title: 'Consider assigning an investigative task.',
      explanation: 'No tasks are linked to this case. A task is optional and is not created automatically.',
      actionLabel: 'Add Task',
      targetTab: 'tasks',
      modalName: 'add_task',
      supportingRecordIds: [caseData.id]
    });
  }

  const rank: Record<SuggestionPriority, number> = { urgent: 0, important: 1, routine: 2 };
  return suggestions
    .map((suggestion) => {
      const disposition = dispositionFor(caseData, suggestion.id);
      const status = disposition?.status || 'suggested';
      return {
        ...suggestion,
        status,
        dismissed: status === 'dismissed',
        deferred: status === 'deferred',
        accepted: status === 'accepted',
        updatedAt: disposition?.updatedAt || suggestion.updatedAt
      };
    })
    .filter((suggestion) => suggestion.status !== 'dismissed' && suggestion.status !== 'deferred')
    .sort((a, b) => rank[a.priority] - rank[b.priority]);
}

export function suggestionIdsMatchRecords(left: string[], right: string[]): boolean {
  return sameMembers(left, right);
}
