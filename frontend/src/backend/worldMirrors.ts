import { set, del } from 'idb-keyval';
import { INDEXED_WORLD_KEYS, type WorldEntries } from './worldRecords';

export async function mirrorWorldEntries(entries: WorldEntries): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  for (const key of INDEXED_WORLD_KEYS) {
    if (entries[key] === undefined) await del(key);
    else await set(key, JSON.parse(entries[key]));
  }
}
