export const FIELD_MISSION = 'ms-spec-01';
export const FIELD_TARGETS = [
  { id: 'relay', x: 210, y: 190, label: 'Signal relay', detail: 'Transit carrier: 88.2 MHz. The interference originates inside Tunnel 09.' },
  { id: 'terminal', x: 720, y: 190, label: 'Service terminal', detail: 'An unsigned PRISM thread, PID 512, is feeding memory into the transit carrier.' },
  { id: 'residue', x: 650, y: 465, label: 'Conduit residue', detail: 'The conduit shows fresh harmonic scoring. The leak follows the signal line, not the public platform.' },
  { id: 'witness', x: 300, y: 440, label: 'Technician Iona', detail: 'The lights flickered after the service terminal restarted. I heard the carrier surge, then sealed the public platform.' },
  { id: 'seal', x: 470, y: 120, label: 'Containment console', detail: 'Deploy Hazmat-01 and Patrol-12 with SealLockCrypt after recording the source and witness account.' },
] as const;
export interface FieldSession { x: number; y: number; evidence: string[]; interviewed: boolean; sealed: boolean }
export function restoreFieldSession(value: unknown): FieldSession {
  const saved = value as Partial<FieldSession> | null;
  return { x: Number.isFinite(saved?.x) ? Math.max(70, Math.min(890, saved!.x!)) : 110,
    y: Number.isFinite(saved?.y) ? Math.max(110, Math.min(510, saved!.y!)) : 330,
    evidence: Array.isArray(saved?.evidence) ? [...new Set(saved.evidence.filter(id => ['relay', 'terminal', 'residue'].includes(id)))] : [],
    interviewed: saved?.interviewed === true, sealed: saved?.sealed === true };
}
export function fieldReady(session: FieldSession) { return ['relay', 'terminal', 'residue'].every(id => session.evidence.includes(id)) && session.interviewed; }
export function interactField(session: FieldSession, id: string): { session: FieldSession; ok: boolean; message: string } {
  const target = FIELD_TARGETS.find(item => item.id === id);
  if (!target || Math.hypot(session.x - target.x, session.y - target.y) > 100) return { session, ok: false, message: 'Move closer to inspect this location.' };
  if (id === 'seal' && !fieldReady(session)) return { session, ok: false, message: 'Collect all three findings and interview Iona before deploying containment.' };
  const next = id === 'seal' ? { ...session, sealed: true } : id === 'witness' ? { ...session, interviewed: true }
    : { ...session, evidence: [...new Set([...session.evidence, id])] };
  return { session: next, ok: true, message: target.detail };
}
