import { WorldSyncClient, readWorldEntries, type WorldEntries } from './worldSync';
import { applyWorldEntries } from './worldRecords';
import { mirrorWorldEntries } from './worldMirrors';

export async function restoreWorldEntries(entries: WorldEntries) {
  const previous = readWorldEntries(localStorage);
  // Never replace existing progress without first making a restorable device backup.
  if (Object.keys(previous).length) localStorage.setItem(`miraverse-world-backup-${crypto.randomUUID()}`, JSON.stringify({ source: 'device', savedAt: new Date().toISOString(), entries: previous }));
  const apply = (records: WorldEntries) => applyWorldEntries(localStorage, records);
  try {
    apply(entries);
    await mirrorWorldEntries(entries);
  } catch (error) { apply(previous); await mirrorWorldEntries(previous); throw error; }
}
export const worldConnection = new WorldSyncClient({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value), removeItem: key => localStorage.removeItem(key), get length() { return localStorage.length; }, key: index => localStorage.key(index) }, (...args) => fetch(...args), restoreWorldEntries, () => location.reload());
export async function connectWorld() {
  await worldConnection.start();
  // App stores keep their existing offline persistence. Capture their records together
  // after synchronous WorkNet → mail → file changes have finished.
  window.setInterval(() => { if (!document.hidden) void worldConnection.sync(); }, 1500);
  window.addEventListener('online', () => void worldConnection.sync(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) void worldConnection.sync(); });
}
