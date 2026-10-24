import type {
  DGACase,
  DGAState,
  DGASystem,
  DocumentReference,
  Classification,
  Priority,
  ScheduledEvent,
  SharedCasePatch,
  SystemActor,
  SystemBusPayload,
  SystemCaseLink,
  SystemExchangeState,
  SystemFinding,
  SystemRequest,
  SystemRequestStatus,
  FindingConfidence,
  TimelineEvent
} from '@/lib/dga-types';
import type { DGAEventInput, DGAEventType } from '@/lib/dga-events';
import { createScheduledEvent } from '@/lib/simulation/scheduler';
import { actorLabel, getSystemProfile } from './system-profiles';

/**
 * Pure exchange reducers. Each one mutates the given state in place (matching the store's
 * convention) and returns the bus events the caller must emit once the state is persisted.
 */
export interface ExchangeResult<T> {
  result: T;
  events: DGAEventInput<SystemBusPayload>[];
}

const EVENT_LOG_LIMIT = 150;
const TERMINAL_STATUSES: SystemRequestStatus[] = ['COMPLETED', 'REJECTED', 'CANCELLED'];

export function makeExchangeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function createEmptySystemExchange(): SystemExchangeState {
  return { links: [], requests: [], findings: [], eventLog: [] };
}

export function ensureSystemExchange(state: DGAState): SystemExchangeState {
  if (!state.systemExchange) state.systemExchange = createEmptySystemExchange();
  return state.systemExchange;
}

export function isTerminalRequestStatus(status: SystemRequestStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

function recordEvent(
  state: DGAState,
  type: DGAEventType,
  caseId: string | undefined,
  payload: SystemBusPayload
): DGAEventInput<SystemBusPayload> {
  const id = makeExchangeId('EVT');
  const timestamp = new Date().toISOString();
  const exchange = ensureSystemExchange(state);
  exchange.eventLog.unshift({
    id,
    type,
    timestamp,
    source: payload.source,
    target: payload.target,
    caseId,
    refId: payload.refId,
    summary: payload.summary
  });
  if (exchange.eventLog.length > EVENT_LOG_LIMIT) exchange.eventLog.length = EVENT_LOG_LIMIT;
  return { id, timestamp, type, caseId, actor: actorLabel(payload.source), payload };
}

function findCase(state: DGAState, caseId: string): DGACase | undefined {
  return state.cases.find((c) => c.id === caseId);
}

function addTimeline(c: DGACase, type: TimelineEvent['type'], actor: string, description: string) {
  const now = new Date().toISOString();
  c.timeline.unshift({ id: makeExchangeId('TL'), timestamp: now, type, actor, description });
  c.updatedAt = now;
}

function addActivity(
  state: DGAState,
  system: DGASystem,
  headline: string,
  details: string,
  caseId?: string,
  priority?: Priority
) {
  state.agencyActivityFeed.unshift({
    id: makeExchangeId('ACT'),
    timestamp: new Date().toISOString(),
    system,
    headline,
    details,
    caseId,
    priority
  });
}

export function findSystemRequest(state: DGAState, requestId: string): SystemRequest | undefined {
  return ensureSystemExchange(state).requests.find((r) => r.id === requestId);
}

export function findSystemRequestByLegacyId(state: DGAState, legacyForensicRequestId: string): SystemRequest | undefined {
  return ensureSystemExchange(state).requests.find((r) => r.legacyForensicRequestId === legacyForensicRequestId);
}

/* ------------------------------------------------------------------------- */

export interface LinkCaseInput {
  caseId: string;
  system: DGASystem;
  from: SystemActor;
  externalRef?: string;
  note?: string;
}

export function linkCaseToSystem(state: DGAState, input: LinkCaseInput): ExchangeResult<SystemCaseLink | null> {
  const c = findCase(state, input.caseId);
  if (!c) return { result: null, events: [] };

  const exchange = ensureSystemExchange(state);
  let link = exchange.links.find((l) => l.caseId === input.caseId && l.system === input.system);

  if (link) {
    if (!input.externalRef || link.externalRef === input.externalRef) {
      return { result: link, events: [] };
    }
    link.externalRef = input.externalRef;
  } else {
    link = {
      id: makeExchangeId('LNK'),
      caseId: input.caseId,
      system: input.system,
      role: c.leadSystem === input.system ? 'lead' : 'supporting',
      receivedFrom: input.from,
      receivedAt: new Date().toISOString(),
      externalRef: input.externalRef,
      note: input.note
    };
    exchange.links.unshift(link);
  }

  if (c.leadSystem !== input.system && !c.supportingSystems.includes(input.system)) {
    c.supportingSystems.push(input.system);
  }

  const summary = `Case ${c.id} received by ${input.system} from ${actorLabel(input.from)}${
    input.externalRef ? ` (ref ${input.externalRef})` : ''
  }`;
  addTimeline(c, 'SYSTEM_LINKED', getSystemProfile(input.system).actorName, summary);

  return {
    result: link,
    events: [
      recordEvent(state, 'SYSTEM_CASE_RECEIVED', c.id, {
        source: input.from,
        target: input.system,
        refId: link.id,
        summary,
        data: link
      })
    ]
  };
}

/* ------------------------------------------------------------------------- */

export interface OpenRequestInput {
  caseId: string;
  requestedBy: SystemActor;
  targetSystem: DGASystem;
  requestType: string;
  summary?: string;
  priority?: Priority;
  payload?: Record<string, unknown>;
  evidenceIds?: string[];
  externalRef?: string;
  legacyForensicRequestId?: string;
  /** Skip timeline/activity entries when a legacy record already logged this request. */
  logToTimeline?: boolean;
}

export function openSystemRequest(state: DGAState, input: OpenRequestInput): ExchangeResult<SystemRequest | null> {
  const c = findCase(state, input.caseId);
  if (!c || input.requestedBy === input.targetSystem) return { result: null, events: [] };

  const linked = linkCaseToSystem(state, {
    caseId: c.id,
    system: input.targetSystem,
    from: input.requestedBy,
    externalRef: input.externalRef
  });

  const now = new Date().toISOString();
  const summary = input.summary || `${input.requestType.replace(/_/g, ' ')} requested for ${c.id}`;
  const request: SystemRequest = {
    id: makeExchangeId(`REQ-${input.targetSystem}`),
    caseId: c.id,
    requestedBy: input.requestedBy,
    targetSystem: input.targetSystem,
    requestType: input.requestType,
    summary,
    priority: input.priority || c.priority,
    status: 'PENDING',
    payload: input.payload || {},
    evidenceIds: input.evidenceIds || [],
    createdAt: now,
    updatedAt: now,
    externalRef: input.externalRef,
    legacyForensicRequestId: input.legacyForensicRequestId
  };
  ensureSystemExchange(state).requests.unshift(request);

  if (input.logToTimeline !== false) {
    addTimeline(
      c,
      'SYSTEM_REQUEST',
      actorLabel(input.requestedBy),
      `Request ${request.id} sent to ${input.targetSystem} (${input.requestType}): ${summary}`
    );
    addActivity(state, input.targetSystem, `Request Received: ${input.requestType.replace(/_/g, ' ')}`, summary, c.id, request.priority);
  }

  return {
    result: request,
    events: [
      ...linked.events,
      recordEvent(state, 'SYSTEM_REQUEST_CREATED', c.id, {
        source: input.requestedBy,
        target: input.targetSystem,
        refId: request.id,
        summary,
        data: request
      })
    ]
  };
}

/* ------------------------------------------------------------------------- */

export interface RequestStatusOptions {
  by: SystemActor;
  note?: string;
  dueAt?: string;
  externalRef?: string;
}

export function updateSystemRequestStatus(
  state: DGAState,
  requestId: string,
  status: SystemRequestStatus,
  options: RequestStatusOptions
): ExchangeResult<SystemRequest | null> {
  const request = findSystemRequest(state, requestId);
  if (!request || isTerminalRequestStatus(request.status)) return { result: null, events: [] };

  const { by } = options;
  if (by !== request.targetSystem && by !== request.requestedBy && by !== 'DGA_CORE') {
    return { result: null, events: [] };
  }

  const now = new Date().toISOString();
  request.status = status;
  request.updatedAt = now;
  if (options.note !== undefined) request.statusNote = options.note;
  if (options.dueAt) request.dueAt = options.dueAt;
  if (options.externalRef) request.externalRef = options.externalRef;
  if (status === 'COMPLETED') request.completedAt = now;

  const summary = `${request.id} ${status.replace(/_/g, ' ')}${options.note ? `: ${options.note}` : ''}`;
  const c = findCase(state, request.caseId);
  if (c && (status === 'REJECTED' || status === 'CANCELLED')) {
    addTimeline(c, 'SYSTEM_UPDATE', actorLabel(by), summary);
  }

  return {
    result: request,
    events: [
      recordEvent(state, 'SYSTEM_REQUEST_UPDATED', request.caseId, {
        source: by,
        target: by === request.targetSystem ? request.requestedBy : request.targetSystem,
        refId: request.id,
        summary,
        data: request
      })
    ]
  };
}

/** Target system takes a pending request and schedules its simulated turnaround. */
export function acceptSystemRequest(
  state: DGAState,
  requestId: string,
  system: DGASystem,
  processingSeconds: number
): ExchangeResult<SystemRequest | null> {
  const request = findSystemRequest(state, requestId);
  if (!request || request.status !== 'PENDING' || request.targetSystem !== system) {
    return { result: null, events: [] };
  }

  const due: ScheduledEvent = createScheduledEvent(
    'SYSTEM_REQUEST_DUE',
    processingSeconds,
    { requestId },
    request.caseId,
    system
  );
  state.scheduledEvents.push(due);

  return updateSystemRequestStatus(state, requestId, 'IN_PROGRESS', {
    by: system,
    dueAt: due.scheduledAt,
    note: `Processing, ETA ${processingSeconds}s`
  });
}

/* ------------------------------------------------------------------------- */

export interface AttachDocumentInput {
  system: DGASystem;
  caseId: string;
  title: string;
  content: string;
  classification?: Classification;
  author?: string;
  requestId?: string;
  findingId?: string;
}

export function attachSystemDocument(state: DGAState, input: AttachDocumentInput): ExchangeResult<DocumentReference | null> {
  const c = findCase(state, input.caseId);
  if (!c) return { result: null, events: [] };

  const doc: DocumentReference = {
    id: makeExchangeId('DOC'),
    title: input.title,
    classification: input.classification || c.classification,
    date: new Date().toISOString(),
    author: input.author || getSystemProfile(input.system).actorName,
    content: input.content,
    sourceSystem: input.system,
    requestId: input.requestId,
    findingId: input.findingId
  };
  c.documents.unshift(doc);
  addTimeline(c, 'DOCUMENT_ATTACHED', doc.author, `${input.system} attached document: ${doc.title}`);

  return {
    result: doc,
    events: [
      recordEvent(state, 'SYSTEM_DOCUMENT_ATTACHED', c.id, {
        source: input.system,
        refId: doc.id,
        summary: doc.title,
        data: doc
      })
    ]
  };
}

/* ------------------------------------------------------------------------- */

export interface ReturnFindingInput {
  system: DGASystem;
  requestId?: string;
  /** Required when the finding is unsolicited (no requestId). */
  caseId?: string;
  summary: string;
  details?: string;
  confidence?: FindingConfidence;
  documents?: Array<{ title: string; content: string; classification?: Classification }>;
  priority?: Priority;
  returnTo?: SystemActor;
}

export function recordSystemFinding(state: DGAState, input: ReturnFindingInput): ExchangeResult<SystemFinding | null> {
  const request = input.requestId ? findSystemRequest(state, input.requestId) : undefined;
  if (input.requestId && !request) return { result: null, events: [] };
  if (request && (request.targetSystem !== input.system || isTerminalRequestStatus(request.status))) {
    return { result: null, events: [] };
  }

  const caseId = request?.caseId || input.caseId;
  const c = caseId ? findCase(state, caseId) : undefined;
  if (!c) return { result: null, events: [] };

  const now = new Date().toISOString();
  const findingId = makeExchangeId('FND');
  const events: DGAEventInput<SystemBusPayload>[] = [];
  const documentIds: string[] = [];

  for (const docInput of input.documents || []) {
    const attached = attachSystemDocument(state, {
      ...docInput,
      system: input.system,
      caseId: c.id,
      requestId: request?.id,
      findingId
    });
    if (attached.result) documentIds.push(attached.result.id);
    events.push(...attached.events);
  }

  const finding: SystemFinding = {
    id: findingId,
    caseId: c.id,
    requestId: request?.id,
    system: input.system,
    returnedTo: request?.requestedBy || input.returnTo || 'DGA_CORE',
    summary: input.summary,
    details: input.details,
    confidence: input.confidence || 'MODERATE',
    documentIds,
    createdAt: now
  };
  ensureSystemExchange(state).findings.unshift(finding);

  if (request) {
    request.status = 'COMPLETED';
    request.completedAt = now;
    request.updatedAt = now;
    request.findingId = findingId;

    if (request.legacyForensicRequestId) {
      const legacy = c.forensicRequests.find((r) => r.id === request.legacyForensicRequestId);
      if (legacy && legacy.status !== 'Completed') {
        legacy.status = 'Completed';
        legacy.resultSummary = input.summary;
        legacy.completedAt = now;
      }
    }
  }

  const profile = getSystemProfile(input.system);
  addTimeline(c, 'SYSTEM_FINDING', profile.actorName, `${profile.findingTimelineLabel}: ${input.summary}`);
  state.alerts.unshift({
    id: makeExchangeId('ALT'),
    level: 'FLASH',
    title: `${profile.findingAlertTitle} // CASE ${c.id}`,
    message: input.summary,
    source: profile.alertSource,
    timestamp: now,
    actionRequired: false,
    caseId: c.id
  });
  addActivity(
    state,
    input.system,
    `${profile.findingHeadline}: ${c.id}`,
    input.summary,
    c.id,
    input.priority || request?.priority || c.priority
  );

  events.push(
    recordEvent(state, 'SYSTEM_FINDING_RETURNED', c.id, {
      source: input.system,
      target: finding.returnedTo,
      refId: finding.id,
      summary: input.summary,
      data: finding
    })
  );

  return { result: finding, events };
}

/* ------------------------------------------------------------------------- */

export function applySharedCasePatch(
  state: DGAState,
  system: SystemActor,
  caseId: string,
  patch: SharedCasePatch,
  reason?: string
): ExchangeResult<DGACase | null> {
  const c = findCase(state, caseId);
  if (!c) return { result: null, events: [] };

  const changes: string[] = [];

  if (patch.status && patch.status !== c.status) {
    changes.push(`status ${c.status} → ${patch.status}`);
    c.status = patch.status;
  }
  if (patch.priority && patch.priority !== c.priority) {
    changes.push(`priority ${c.priority} → ${patch.priority}`);
    c.priority = patch.priority;
  }
  for (const tag of patch.addTags || []) {
    c.tags = c.tags || [];
    if (!c.tags.includes(tag)) {
      c.tags.push(tag);
      changes.push(`tag ${tag}`);
    }
  }
  for (const sys of patch.addSupportingSystems || []) {
    if (sys !== c.leadSystem && !c.supportingSystems.includes(sys)) {
      c.supportingSystems.push(sys);
      changes.push(`supporting system ${sys}`);
    }
  }
  for (const objectiveId of patch.completeObjectiveIds || []) {
    const objective = c.objectives.find((o) => o.id === objectiveId);
    if (objective && !objective.completed) {
      objective.completed = true;
      changes.push(`objective ${objective.id} completed`);
    }
  }
  for (const item of patch.addEvidence || []) {
    if (!c.evidence.some((e) => e.id === item.id)) {
      c.evidence.push(item);
      changes.push(`evidence ${item.id} logged`);
    }
  }
  for (const { evidenceId, custodyStatus } of patch.evidenceCustody || []) {
    const item = c.evidence.find((e) => e.id === evidenceId);
    if (item && item.custodyStatus !== custodyStatus) {
      item.custodyStatus = custodyStatus;
      changes.push(`evidence ${evidenceId} custody → ${custodyStatus}`);
    }
  }
  if (patch.linkedTraceCaseId && patch.linkedTraceCaseId !== c.linkedTraceCaseId) {
    c.linkedTraceCaseId = patch.linkedTraceCaseId;
    changes.push(`TRACE case ${patch.linkedTraceCaseId}`);
  }
  if (patch.customFields) {
    c.customFields = { ...c.customFields, ...patch.customFields };
    changes.push(`fields ${Object.keys(patch.customFields).join(', ')}`);
  }

  if (changes.length === 0) return { result: c, events: [] };

  const summary = `${actorLabel(system)} updated ${c.id}: ${changes.join('; ')}${reason ? ` (${reason})` : ''}`;
  addTimeline(c, patch.status ? 'STATUS_CHANGED' : 'SYSTEM_UPDATE', actorLabel(system), summary);

  return {
    result: c,
    events: [
      recordEvent(state, 'SYSTEM_CASE_UPDATED', c.id, {
        source: system,
        refId: c.id,
        summary,
        data: { changes, patch }
      })
    ]
  };
}

/* ------------------------------------------------------------------------- */

export interface SystemSignalInput {
  system: DGASystem;
  signal: string;
  summary: string;
  caseId?: string;
  target?: SystemActor;
  data?: Record<string, unknown>;
  priority?: Priority;
  logActivity?: boolean;
}

export function recordSystemSignal(state: DGAState, input: SystemSignalInput): ExchangeResult<null> {
  if (input.logActivity !== false) {
    addActivity(state, input.system, input.signal.replace(/_/g, ' '), input.summary, input.caseId, input.priority);
  }
  return {
    result: null,
    events: [
      recordEvent(state, 'SYSTEM_SIGNAL', input.caseId, {
        source: input.system,
        target: input.target,
        refId: input.signal,
        summary: input.summary,
        data: { signal: input.signal, ...input.data }
      })
    ]
  };
}

/* ------------------------------------------------------------------------- */

/** Resolves a SYSTEM_REQUEST_DUE scheduled event into a finding from the target system. */
export function completeDueSystemRequest(state: DGAState, event: ScheduledEvent): ExchangeResult<SystemFinding | null> {
  const requestId = typeof event.payload.requestId === 'string' ? event.payload.requestId : '';
  const request = findSystemRequest(state, requestId);
  if (!request || request.status !== 'IN_PROGRESS') return { result: null, events: [] };

  const profile = getSystemProfile(request.targetSystem);
  const c = findCase(state, request.caseId);
  const described = profile.describeFinding(request, c);
  const summary = described.charAt(0).toUpperCase() + described.slice(1);

  return recordSystemFinding(state, {
    system: request.targetSystem,
    requestId: request.id,
    summary,
    confidence: 'HIGH',
    documents: [
      {
        title: `${profile.name} Report: ${request.requestType.replace(/_/g, ' ')} (${request.id})`,
        content: [
          `ORIGINATING: ${actorLabel(request.requestedBy)}`,
          `PROCESSED BY: ${profile.actorName}`,
          `REQUEST: ${request.summary}`,
          '',
          `FINDING: ${summary}`
        ].join('\n')
      }
    ]
  });
}

/** Keeps the exchange request in sync when the legacy LAB_RESULT_READY path completes a ForensicRequest. */
export function completeLegacyForensicMirror(
  state: DGAState,
  legacyForensicRequestId: string,
  summary: string
): ExchangeResult<SystemRequest | null> {
  const request = findSystemRequestByLegacyId(state, legacyForensicRequestId);
  if (!request) return { result: null, events: [] };
  return updateSystemRequestStatus(state, request.id, 'COMPLETED', { by: request.targetSystem, note: summary });
}
