import type { DGACase, ScheduledEvent } from '../dga-types';

export function hasEmbassyScenario(caseFile?: DGACase): boolean {
  return caseFile?.id === 'DGA-26-194' && caseFile.creationSource !== 'manual';
}

// Legacy scripted responses have no reusable custom-case meaning. Generic system
// requests retain their own originating-case and evidence validation.
export function canRunScheduledEvent(event: ScheduledEvent, caseFile?: DGACase): boolean {
  if (!event.caseId) return true;
  if (!caseFile || caseFile.id !== event.caseId) return false;
  if (event.type === 'SYSTEM_REQUEST_DUE') return true;
  return caseFile.creationSource !== 'manual';
}
