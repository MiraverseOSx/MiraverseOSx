/** Read-only Registry citizen index, keyed by persistent civic identity number. */
const KEY = 'miraverse-identity-registry-v3';
export interface CitizenRecordRef { id: string; name: string; species: string; home: string }
export function loadCitizenRefs(): CitizenRecordRef[] {
  try {
    const records: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(records)) return [];
    const seen = new Set<string>();
    return records.flatMap((record: any) => {
      if (!record || typeof record.record !== 'string' || !record.record || seen.has(record.record)) return [];
      seen.add(record.record);
      return [{ id: record.record, name: String(record.name || 'Unnamed'), species: String(record.species || 'Unknown'), home: String(record.home || 'Unknown') }];
    });
  } catch { return []; }
}
