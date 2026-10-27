import { readWorldEntries } from './worldSync.ts';
import { validWorldEntries, type StorageLike, type WorldEntries } from './worldRecords.ts';

export function createWorldBackup(storage: StorageLike) {
  return { format: 'miraverse-world-backup', version: 1, createdAt: new Date().toISOString(), entries: readWorldEntries(storage) };
}
export function parseWorldBackup(raw: string): WorldEntries {
  if (new TextEncoder().encode(raw).length > 16 * 1024 * 1024) throw new Error('Choose a backup smaller than 16 MB.');
  const value = JSON.parse(raw);
  const portable = value?.format === 'miraverse-world-backup' && value.version === 1;
  const automatic = ['device', 'database'].includes(value?.source) && typeof value.savedAt === 'string';
  if ((!portable && !automatic) || !validWorldEntries(value.entries) || !Object.keys(value.entries).length) {
    throw new Error('This file is not a supported Miraverse world backup.');
  }
  return value.entries;
}
