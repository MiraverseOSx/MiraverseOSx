import type {
  DGACase,
  DocumentReference,
  IntegratedSystemId,
  SharedCasePatch,
  SystemBusPayload,
  SystemCaseLink,
  SystemFinding,
  SystemRequest,
  SystemRequestStatus
} from '@/lib/dga-types';
import { subscribeDgaEvent } from '@/lib/dga-events';
import type { DGAEventType } from '@/lib/dga-events';
import {
  getDGAState,
  linkDGACaseToSystem,
  createDGASystemRequest,
  updateDGASystemRequest,
  acceptDGASystemRequest,
  returnDGASystemFinding,
  attachDGASystemDocument,
  updateDGACaseFromSystem,
  emitDGASystemSignal
} from '@/lib/dga-store';
import { getSystemProfile } from './system-profiles';
import type { DgaSystemProfile } from './system-profiles';
import type {
  AttachDocumentOptions,
  CreateRequestInput,
  DgaSystemAdapter,
  EmitSystemEventOptions,
  ReceiveCaseOptions,
  ReturnFindingOptions,
  SystemEventHandler
} from './system-contract';

function isExchangePayload(payload: unknown): payload is SystemBusPayload {
  return !!payload && typeof payload === 'object' && 'source' in payload;
}

export class BaseDgaSystemAdapter implements DgaSystemAdapter {
  readonly profile: DgaSystemProfile;

  constructor(readonly id: IntegratedSystemId) {
    this.profile = getSystemProfile(id);
  }

  receiveCase(caseId: string, options: ReceiveCaseOptions = {}): Promise<SystemCaseLink | null> {
    return linkDGACaseToSystem({
      caseId,
      system: this.id,
      from: options.from || 'DGA_CORE',
      externalRef: options.externalRef,
      note: options.note
    });
  }

  createRequest(input: CreateRequestInput): Promise<SystemRequest | null> {
    return createDGASystemRequest({ ...input, requestedBy: this.id });
  }

  updateRequest(requestId: string, status: SystemRequestStatus, note?: string): Promise<SystemRequest | null> {
    return updateDGASystemRequest(requestId, status, { by: this.id, note });
  }

  returnFinding(input: ReturnFindingOptions): Promise<SystemFinding | null> {
    return returnDGASystemFinding({ ...input, system: this.id });
  }

  emitEvent(signal: string, options: EmitSystemEventOptions): Promise<void> {
    return emitDGASystemSignal({ ...options, signal, system: this.id });
  }

  attachDocument(input: AttachDocumentOptions): Promise<DocumentReference | null> {
    return attachDGASystemDocument({ ...input, system: this.id });
  }

  updateCase(caseId: string, patch: SharedCasePatch, reason?: string): Promise<DGACase | null> {
    return updateDGACaseFromSystem(this.id, caseId, patch, reason);
  }

  subscribe(type: DGAEventType | '*', handler: SystemEventHandler): () => void {
    return subscribeDgaEvent<SystemBusPayload>(type, (event) => {
      const payload = event.payload;
      if (!isExchangePayload(payload) || payload.source === this.id) return;
      if (payload.target && payload.target !== this.id) return;
      handler(event);
    });
  }

  getInbox(): SystemRequest[] {
    return getDGAState().systemExchange.requests.filter((r) => r.targetSystem === this.id);
  }

  getOutbox(): SystemRequest[] {
    return getDGAState().systemExchange.requests.filter((r) => r.requestedBy === this.id);
  }

  getFindings(): SystemFinding[] {
    return getDGAState().systemExchange.findings.filter((f) => f.system === this.id);
  }

  getLinkedCaseIds(): string[] {
    return getDGAState()
      .systemExchange.links.filter((l) => l.system === this.id)
      .map((l) => l.caseId);
  }

  async handleIncomingRequest(request: SystemRequest): Promise<void> {
    if (request.status !== 'PENDING' || request.targetSystem !== this.id) return;
    await acceptDGASystemRequest(request.id, this.id, this.profile.processingSeconds);
  }
}

/**
 * TRACE runs a real laboratory backed by /api/records. Requests that were pushed into the lab
 * (they carry an externalRef) wait for an examiner to transmit results instead of auto-completing.
 */
export class TraceSystemAdapter extends BaseDgaSystemAdapter {
  constructor() {
    super('TRACE');
  }

  async receiveCase(caseId: string, options: ReceiveCaseOptions = {}): Promise<SystemCaseLink | null> {
    const link = await super.receiveCase(caseId, options);
    if (link && options.externalRef) {
      await this.updateCase(caseId, { linkedTraceCaseId: options.externalRef }, 'TRACE laboratory case opened');
    }
    return link;
  }

  async handleIncomingRequest(request: SystemRequest): Promise<void> {
    if (request.status !== 'PENDING' || request.targetSystem !== this.id) return;
    if (request.externalRef) {
      await this.updateRequest(request.id, 'IN_PROGRESS', `Queued in TRACE lab case ${request.externalRef}; awaiting examiner transmit`);
      return;
    }
    await super.handleIncomingRequest(request);
  }
}
