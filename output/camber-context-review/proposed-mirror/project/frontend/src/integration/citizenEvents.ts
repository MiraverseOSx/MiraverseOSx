export interface CitizenUpdate {
  citizenId?: string;
  targetDocId?: number;
}

const populationKeys = new Set(['miraverse-canonical-identities-v1', 'miraverse-identity-registry-v3']);
const contextKey = 'miraverse-active-citizen-context-v1';

export function citizenSelection(value: unknown): CitizenUpdate | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const context = value as Record<string, unknown>;
  if (typeof context.citizenId !== 'string' || !context.citizenId.trim()) return undefined;
  return {
    citizenId: context.citizenId,
    targetDocId: typeof context.targetDocId === 'number' && Number.isInteger(context.targetDocId) && context.targetDocId >= 1 && context.targetDocId <= 9 ? context.targetDocId : undefined,
  };
}

/** Subscribe only to citizen changes, and release every listener when the app closes. */
export function subscribeCitizenUpdates(onUpdate: (update: CitizenUpdate) => void, target: Window = window): () => void {
  const onContext = (event: Event) => {
    const selection = citizenSelection((event as CustomEvent).detail);
    if (selection) onUpdate(selection);
  };
  const onMessage = (event: MessageEvent) => {
    if (event.source !== target || event.origin !== target.location.origin) return;
    if (event.data?.source === 'meridion-registry' && event.data.type === 'citizens-changed') onUpdate({});
    if (event.data?.source === 'citizen-bridge' && event.data.type === 'active-citizen-changed') {
      const selection = citizenSelection(event.data.payload);
      if (selection) onUpdate(selection);
    }
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || populationKeys.has(event.key)) onUpdate({});
    else if (event.key === contextKey && event.newValue) {
      try {
        const selection = citizenSelection(JSON.parse(event.newValue));
        if (selection) onUpdate(selection);
      } catch { /* An incomplete context must not replace the current citizen. */ }
    }
  };
  target.addEventListener('miraverse-citizen-context', onContext);
  target.addEventListener('message', onMessage);
  target.addEventListener('storage', onStorage);
  return () => {
    target.removeEventListener('miraverse-citizen-context', onContext);
    target.removeEventListener('message', onMessage);
    target.removeEventListener('storage', onStorage);
  };
}
