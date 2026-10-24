import { set as idbSet, del as idbDelete } from 'idb-keyval';
import { WORLD_KEYS, WorldSyncClient, readWorldEntries, type WorldEntries } from './worldSync';

async function restore(entries: WorldEntries) {
  const previous = readWorldEntries(localStorage);
  // Never replace existing progress without first making a restorable device backup.
  if (Object.keys(previous).length) localStorage.setItem(`miraverse-world-backup-${crypto.randomUUID()}`, JSON.stringify({ source: 'device', savedAt: new Date().toISOString(), entries: previous }));
  const apply = (records: WorldEntries) => { for (const key of WORLD_KEYS) { if (records[key] === undefined) localStorage.removeItem(key); else localStorage.setItem(key, records[key]!); } };
  try {
    apply(entries);
    const identities = entries['miraverse-canonical-identities-v1'];
    if (identities === undefined) await idbDelete('miraverse-canonical-identities-v1');
    else await idbSet('miraverse-canonical-identities-v1', JSON.parse(identities));
  } catch (error) { apply(previous); throw error; }
}
export const worldConnection = new WorldSyncClient({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value), removeItem: key => localStorage.removeItem(key) }, (...args) => fetch(...args), restore, () => location.reload());
export async function connectWorld() {
  await worldConnection.start();
  // App stores keep their existing offline persistence. Capture their records together
  // after synchronous WorkNet → mail → file changes have finished.
  window.setInterval(() => { if (!document.hidden) void worldConnection.sync(); }, 1500);
  window.addEventListener('online', () => void worldConnection.sync(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) void worldConnection.sync(); });
}
