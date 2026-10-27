import { worldStorageKeys, validWorldEntries, validWorldRecord, type StorageLike, type WorldEntries } from './worldRecords.ts';
export { WORLD_KEYS, type WorldEntries } from './worldRecords.ts';
export interface WorldSnapshot { serverId: string; revision: number; updatedAt: string | null; entries: WorldEntries }
export interface SaveStatus { state: 'loading' | 'saved' | 'saving' | 'offline' | 'conflict'; message: string; updatedAt?: string | null }
interface SyncMeta { serverId: string; revision: number; hash: string }
const META_KEY = 'miraverse-world-sync-v1';
export function serializeEntries(entries: WorldEntries) { return JSON.stringify(Object.fromEntries(Object.keys(entries).sort().map(key => [key, entries[key]]))); }
export function readWorldEntries(storage: StorageLike): WorldEntries {
  const entries: WorldEntries = {};
  for (const key of worldStorageKeys(storage)) {
    const raw = storage.getItem(key);
    if (raw !== null) {
      if (!validWorldRecord(key, raw)) throw new Error(`Cannot save malformed world record: ${key}`);
      entries[key] = raw;
    }
  }
  return entries;
}
export function validSnapshot(value: any): value is WorldSnapshot {
  if (!value || typeof value.serverId !== 'string' || !Number.isSafeInteger(value.revision) || value.revision < 0 || !value.entries || typeof value.entries !== 'object' || Array.isArray(value.entries)) return false;
  return validWorldEntries(value.entries);
}
async function fingerprint(entries: WorldEntries) {
  const bytes = new TextEncoder().encode(serializeEntries(entries));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}
export class WorldSyncClient {
  private meta: SyncMeta | null = null;
  private remote: WorldSnapshot | null = null;
  private connected = false;
  private busy = false;
  private reconnectFailures = 0;
  private nextReconnectAt = 0;
  private listeners = new Set<() => void>();
  private status: SaveStatus = { state: 'loading', message: 'Restoring saved world…' };
  private storage: StorageLike;
  private request: typeof fetch;
  private apply: (entries: WorldEntries) => Promise<void>;
  private reload: () => void;
  constructor(storage: StorageLike, request: typeof fetch, apply: (entries: WorldEntries) => Promise<void>, reload: () => void = () => {}) {
    this.storage = storage; this.request = request; this.apply = apply; this.reload = reload;
    try { const value = JSON.parse(storage.getItem(META_KEY) || 'null'); if (value && typeof value.serverId === 'string' && Number.isSafeInteger(value.revision) && typeof value.hash === 'string') this.meta = value; } catch { /* Old clients have no sync metadata. */ }
  }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  getStatus = () => this.status;
  private report(state: SaveStatus['state'], message: string, updatedAt?: string | null) { this.status = { state, message, updatedAt }; this.listeners.forEach(listener => listener()); }
  private async call(method: 'GET' | 'PUT', body?: object) {
    const response = await this.request('/api/world', { method, cache: 'no-store', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(method === 'GET' ? 2000 : 8000) });
    const result = await response.json();
    if ((response.ok || response.status === 409) && validSnapshot(result)) return { ok: response.ok, snapshot: result };
    throw new Error(typeof result?.error === 'string' ? result.error : 'The world server is unavailable.');
  }
  private async remember(snapshot: WorldSnapshot) {
    this.reconnectFailures = 0; this.nextReconnectAt = 0;
    this.meta = { serverId: snapshot.serverId, revision: snapshot.revision, hash: await fingerprint(snapshot.entries) };
    try { this.storage.setItem(META_KEY, JSON.stringify(this.meta)); } catch { /* The backend copy remains durable. */ }
    this.remote = snapshot; this.connected = true;
    this.report('saved', 'World saved', snapshot.updatedAt);
  }
  async start(allowRestore = true) {
    if (this.busy) return;
    this.busy = true;
    try {
      const local = readWorldEntries(this.storage); const localHash = await fingerprint(local);
      const { snapshot } = await this.call('GET'); this.remote = snapshot;
      const remoteHash = await fingerprint(snapshot.entries);
      const sameServer = this.meta?.serverId === snapshot.serverId;
      if (localHash === remoteHash) await this.remember(snapshot);
      else if (snapshot.revision === 0) { this.meta = { serverId: snapshot.serverId, revision: 0, hash: remoteHash }; this.connected = true; await this.upload(local); }
      else if (allowRestore && (!Object.keys(local).length || (sameServer && localHash === this.meta?.hash))) { await this.apply(snapshot.entries); await this.remember(snapshot); }
      else if (sameServer && this.meta?.revision === snapshot.revision) { this.connected = true; await this.upload(local); }
      else this.report('conflict', 'Review saved world');
    } catch (error) { this.offline(); }
    finally { this.busy = false; }
  }
  private async upload(entries: WorldEntries) {
    if (!this.meta) return;
    this.report('saving', 'Saving world…');
    const result = await this.call('PUT', { serverId: this.meta.serverId, expectedRevision: this.meta.revision, entries });
    if (!result.ok) { this.remote = result.snapshot; this.report('conflict', 'Review saved world'); return; }
    await this.remember(result.snapshot);
  }
  private offline() {
    this.connected = false;
    this.nextReconnectAt = Date.now() + Math.min(60000, 5000 * 2 ** Math.min(this.reconnectFailures++, 4));
    this.report('offline', 'Saved on this device · reconnect to sync');
  }
  async sync(reconnectNow = false) {
    if (this.busy || this.status.state === 'conflict') return;
    if (!this.connected) { if (reconnectNow || Date.now() >= this.nextReconnectAt) await this.start(false); return; }
    this.busy = true;
    try { const entries = readWorldEntries(this.storage); if (await fingerprint(entries) !== this.meta?.hash) await this.upload(entries); }
    catch { this.offline(); }
    finally { this.busy = false; }
  }
  // Explicit conflict choices preserve a backup; a newer concurrent commit still wins a 409.
  async keepDeviceCopy() {
    if (this.busy || !this.remote) return;
    this.busy = true;
    try {
      this.storage.setItem(`miraverse-world-backup-${crypto.randomUUID()}`, JSON.stringify({ source: 'database', savedAt: new Date().toISOString(), ...this.remote }));
      this.meta = { serverId: this.remote.serverId, revision: this.remote.revision, hash: await fingerprint(this.remote.entries) };
      await this.upload(readWorldEntries(this.storage));
    } catch { this.report('conflict', 'Could not save this choice. Both copies are retained.'); }
    finally { this.busy = false; }
  }
  async loadDatabaseCopy() {
    if (this.busy) return;
    this.busy = true;
    try {
      const { snapshot } = await this.call('GET');
      await this.apply(snapshot.entries); await this.remember(snapshot); this.reload();
    } catch { this.report('conflict', 'Could not restore the database copy. Your device progress is retained.'); }
    finally { this.busy = false; }
  }
  getRemoteSummary() { return this.remote ? { revision: this.remote.revision, updatedAt: this.remote.updatedAt } : null; }
}
