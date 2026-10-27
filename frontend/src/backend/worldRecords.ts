export const WORLD_KEYS = [
  'miraverse-os-progress', 'miraverse-comms', 'miraverse-phone-preferences',
  'miraverse-canonical-identities-v1', 'miraverse-identity-registry-v3', 'miraverse-maid-counter-OR',
  'DGAOS_WORKSTATION_STATE_V3', 'trace_active_case_data_v2', 'trace_case_library_v1',
  'trace_records_v2', 'trace_templates_v2', 'trace_drafts_v2', 'trace_session_v2', 'trace_transmissions_v2',
  'trace_open_lab_notes', 'trace_open_lab_logs',
  'miraverse-creator-studio-state-v1', 'miraverse-issued-document-snapshots-v1',
  'miraverse-external-services-v1', 'miraverse-active-citizen-context-v1',
] as const;
export const INDEXED_WORLD_KEYS = [
  'miraverse-canonical-identities-v1', 'trace_records_v2', 'trace_templates_v2',
  'trace_drafts_v2', 'trace_session_v2', 'trace_transmissions_v2',
] as const;
export type WorldEntries = Record<string, string>;
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  readonly length?: number;
  key?(index: number): string | null;
}
const arrays = new Set(['miraverse-canonical-identities-v1', 'miraverse-identity-registry-v3',
  'trace_records_v2', 'trace_templates_v2', 'trace_open_lab_logs',
  'miraverse-issued-document-snapshots-v1', 'miraverse-external-services-v1']);
export function isWorldKey(key: string): boolean {
  return (WORLD_KEYS as readonly string[]).includes(key)
    || /^(?:trace_exam_draft_|DGAOS_SUGGESTION_STATE_)[\w-]{1,200}$/.test(key);
}
export function validWorldRecord(key: string, raw: unknown): raw is string {
  if (!isWorldKey(key) || typeof raw !== 'string') return false;
  if (key === 'trace_open_lab_notes') return true;
  try {
    const value = JSON.parse(raw);
    if (key === 'miraverse-maid-counter-OR') return Number.isSafeInteger(value) && value >= 0;
    if (arrays.has(key)) return Array.isArray(value);
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  } catch { return false; }
}
export function validWorldEntries(input: unknown): input is WorldEntries {
  return !!input && typeof input === 'object' && !Array.isArray(input)
    && Object.entries(input).every(([key, raw]) => validWorldRecord(key, raw));
}
export function worldStorageKeys(storage: StorageLike): string[] {
  const keys = new Set<string>(WORLD_KEYS);
  for (let i = 0; i < (storage.length || 0); i++) {
    const key = storage.key?.(i);
    if (key && isWorldKey(key)) keys.add(key);
  }
  return [...keys].sort();
}
export function applyWorldEntries(storage: StorageLike, entries: WorldEntries): void {
  if (!validWorldEntries(entries)) throw new Error('The saved world contains invalid records.');
  for (const key of new Set([...worldStorageKeys(storage), ...Object.keys(entries)])) {
    if (entries[key] === undefined) storage.removeItem(key);
    else storage.setItem(key, entries[key]);
  }
}
