import type {
  Classification,
  DGACase,
  DGASystem,
  DocumentReference,
  FindingConfidence,
  IntegratedSystemId,
  Priority,
  SharedCasePatch,
  SystemActor,
  SystemBusPayload,
  SystemCaseLink,
  SystemFinding,
  SystemRequest,
  SystemRequestStatus
} from '@/lib/dga-types';
import type { DGAEvent, DGAEventType } from '@/lib/dga-events';
import type { DgaSystemProfile } from './system-profiles';

export interface ReceiveCaseOptions {
  from?: SystemActor;
  externalRef?: string;
  note?: string;
}

export interface CreateRequestInput {
  caseId: string;
  targetSystem: DGASystem;
  requestType: string;
  summary?: string;
  priority?: Priority;
  payload?: Record<string, unknown>;
  evidenceIds?: string[];
  externalRef?: string;
}

export interface ReturnFindingOptions {
  requestId?: string;
  caseId?: string;
  summary: string;
  details?: string;
  confidence?: FindingConfidence;
  documents?: Array<{ title: string; content: string; classification?: Classification }>;
  priority?: Priority;
  returnTo?: SystemActor;
}

export interface AttachDocumentOptions {
  caseId: string;
  title: string;
  content: string;
  classification?: Classification;
  requestId?: string;
  findingId?: string;
}

export interface EmitSystemEventOptions {
  summary: string;
  caseId?: string;
  target?: SystemActor;
  data?: Record<string, unknown>;
  priority?: Priority;
  logActivity?: boolean;
}

export type SystemEventHandler = (event: DGAEvent<SystemBusPayload>) => void;

/**
 * Contract every agency system implements. Adapters only talk to the shared store and the
 * event bus; they never hold references to each other.
 */
export interface DgaSystemAdapter {
  readonly id: IntegratedSystemId;
  readonly profile: DgaSystemProfile;

  receiveCase(caseId: string, options?: ReceiveCaseOptions): Promise<SystemCaseLink | null>;
  createRequest(input: CreateRequestInput): Promise<SystemRequest | null>;
  updateRequest(requestId: string, status: SystemRequestStatus, note?: string): Promise<SystemRequest | null>;
  returnFinding(input: ReturnFindingOptions): Promise<SystemFinding | null>;
  emitEvent(signal: string, options: EmitSystemEventOptions): Promise<void>;
  attachDocument(input: AttachDocumentOptions): Promise<DocumentReference | null>;
  updateCase(caseId: string, patch: SharedCasePatch, reason?: string): Promise<DGACase | null>;

  /** Exchange events addressed to this system or broadcast, excluding ones it emitted itself. */
  subscribe(type: DGAEventType | '*', handler: SystemEventHandler): () => void;

  getInbox(): SystemRequest[];
  getOutbox(): SystemRequest[];
  getFindings(): SystemFinding[];
  getLinkedCaseIds(): string[];

  /** Invoked by the exchange when a pending request targeting this system is delivered. */
  handleIncomingRequest(request: SystemRequest): Promise<void>;
}
