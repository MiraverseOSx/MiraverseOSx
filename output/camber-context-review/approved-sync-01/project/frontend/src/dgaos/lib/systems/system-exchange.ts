import type { SystemBusPayload } from '@/lib/dga-types';
import { subscribeDgaEvent } from '@/lib/dga-events';
import { getDGAState, initDGAStore } from '@/lib/dga-store';
import { getSystemAdapter } from './system-registry';

let stopActiveExchange: (() => void) | null = null;

function dispatchRequest(requestId: string): void {
  const request = getDGAState().systemExchange.requests.find((r) => r.id === requestId);
  if (!request || request.status !== 'PENDING') return;

  const adapter = getSystemAdapter(request.targetSystem);
  if (!adapter) return;

  adapter.handleIncomingRequest(request).catch((err) => {
    console.error(`[DGA-EXCHANGE] ${request.targetSystem} failed to handle ${request.id}:`, err);
  });
}

/** Re-delivers requests persisted while no exchange was listening (reloads, offline gaps). */
export function replayPendingSystemRequests(): void {
  for (const request of getDGAState().systemExchange.requests) {
    if (request.status === 'PENDING') dispatchRequest(request.id);
  }
}

/**
 * Routes exchange traffic over the shared event bus to whichever adapter a request targets.
 * Safe to call repeatedly; returns a stop function.
 */
export function startSystemExchange(): () => void {
  if (stopActiveExchange) return stopActiveExchange;

  let stopped = false;
  const unsubscribe = subscribeDgaEvent<SystemBusPayload>('SYSTEM_REQUEST_CREATED', (event) => {
    if (event.payload.refId) dispatchRequest(event.payload.refId);
  });

  initDGAStore()
    .then(() => {
      if (!stopped) replayPendingSystemRequests();
    })
    .catch((err) => console.error('[DGA-EXCHANGE] Failed to replay pending requests:', err));

  stopActiveExchange = () => {
    stopped = true;
    unsubscribe();
    stopActiveExchange = null;
  };
  return stopActiveExchange;
}
