import {
  DGACase,
  Priority,
  CaseDepartment,
  DocumentReference
} from './dga-types';

export interface ManualIncidentAttachment {
  name: string;
  content?: string;
}

export interface ManualIncidentInput {
  narrative: string;
  title?: string;
  incidentDate?: string;
  incidentTime?: string;
  location?: string;
  reportingParty?: string;
  priority?: Priority;
  department?: CaseDepartment;
  initialNotes?: string;
  attachments?: ManualIncidentAttachment[];
}

export function allocateIncidentCaseId(existingIds: Iterable<string>, now = new Date()): string {
  const year = String(now.getFullYear()).slice(-2);
  const prefix = `INC-${year}-`;
  let max = 1000;
  for (const id of existingIds) {
    const match = /^INC-(\d{2})-(\d+)$/.exec(id);
    if (match && match[1] === year) {
      const value = Number.parseInt(match[2], 10);
      if (Number.isFinite(value) && value >= max) max = value;
    }
  }

  const taken = new Set(existingIds);
  let sequence = max + 1;
  let candidate = `${prefix}${String(sequence).padStart(4, '0')}`;
  while (taken.has(candidate)) {
    sequence += 1;
    candidate = `${prefix}${String(sequence).padStart(4, '0')}`;
  }
  return candidate;
}

export function workingTitleFromNarrative(narrative: string, caseId: string): string {
  const cleaned = narrative.replace(/\s+/g, ' ').trim();
  if (!cleaned) return `Incident report ${caseId}`;
  const slice = cleaned.slice(0, 72);
  const cut = slice.length < cleaned.length ? slice.replace(/\s+\S*$/, '').trim() : slice;
  return `Reported incident: ${cut || caseId}`;
}

function combineOccurredAt(date?: string, time?: string): string | undefined {
  const day = date?.trim();
  const clock = time?.trim();
  if (!day && !clock) return undefined;
  if (day && clock) return `${day}T${clock}`;
  return day || clock;
}

export function buildManualIncidentCase(
  input: ManualIncidentInput,
  caseId: string,
  investigatorName: string,
  now = new Date().toISOString()
): DGACase {
  const narrative = input.narrative.trim();
  const title = input.title?.trim() || workingTitleFromNarrative(narrative, caseId);
  const location = input.location?.trim() || undefined;
  const reportingParty = input.reportingParty?.trim() || undefined;
  const notes = input.initialNotes?.trim();
  const investigator = investigatorName.trim() || 'Unassigned investigator';

  const documents: DocumentReference[] = (input.attachments || [])
    .filter((file) => file.name.trim())
    .map((file, index) => ({
      id: `DOC-${caseId}-INTAKE-${index + 1}`,
      title: file.name.trim(),
      classification: 'UNCLASSIFIED // FOUO',
      date: now,
      author: investigator,
      content:
        file.content?.trim() ||
        'Attachment recorded at intake. File contents were not transcribed into the case narrative.',
      sourceSystem: 'ARCHIVE'
    }));

  return {
    id: caseId,
    title,
    classification: 'UNCLASSIFIED // FOUO',
    status: 'Active',
    priority: input.priority || 'Routine',
    department: input.department || 'Investigation',
    leadSystem: 'CIVITAS',
    supportingSystems: [],
    assignedAgents: [investigator],
    primaryInvestigator: investigator,
    summary: narrative,
    creationSource: 'manual',
    incidentOccurredAt: combineOccurredAt(input.incidentDate, input.incidentTime),
    incidentLocationText: location,
    reportingParty,
    incidentRevisions: [],
    medicalRequests: [],
    findings: [],
    suggestionState: [],
    workflowStage: 'Incident Intake',
    objectives: [],
    tasks: [],
    evidence: [],
    people: [],
    organizations: [],
    locations: [],
    communications: [],
    documents,
    forensicRequests: [],
    timeline: [
      {
        id: `TL-INTAKE-${caseId}`,
        timestamp: now,
        type: 'CASE_OPENED',
        actor: investigator,
        description: `Incident report ${caseId} opened from the investigator's narrative. No people, evidence, or specialist requests were created with the file.`
      }
    ],
    notes: notes
      ? [
          {
            id: `NOTE-${caseId}-INTAKE`,
            agentId: 'OPERATOR',
            agentName: investigator,
            timestamp: now,
            content: notes
          }
        ]
      : [],
    createdAt: now,
    updatedAt: now
  };
}
