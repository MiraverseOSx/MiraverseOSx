import { WORLD_KEYS, readWorldEntries, type WorldEntries } from '../backend/worldSync';
import { communicationsAuthority } from './communicationsAccess';

export const CREATOR_STUDIO_STORAGE_KEY = 'miraverse-creator-studio-state-v1';
const ISSUED_SNAPSHOTS_KEY = 'miraverse-issued-document-snapshots-v1';
const CANONICAL_IDENTITIES_KEY = 'miraverse-canonical-identities-v1';
const MAID_COUNTER_KEY = 'miraverse-maid-counter-OR';
const OS_PROGRESS_KEY = 'miraverse-os-progress';

export type CreatorDraftCategory =
  | 'world_event'
  | 'notice'
  | 'versenet_page'
  | 'citizen_dossier'
  | 'comms_broadcast'
  | 'world_patch';

export interface CreatorDraft {
  id: string;
  title: string;
  summary: string;
  category: CreatorDraftCategory;
  payload: Record<string, any>;
  status: 'draft' | 'validated' | 'published' | 'archived';
  version: number;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  checkpointId?: string;
}

export interface WorldCheckpoint {
  id: string;
  label: string;
  reason: 'manual' | 'pre_publish' | 'pre_restore' | 'pause_snapshot';
  createdAt: string;
  createdBy: string;
  entries: WorldEntries;
  issuedSnapshotsRaw: string | null;
}

export interface PublishedRecord {
  id: string;
  draftId: string;
  title: string;
  category: CreatorDraftCategory;
  publishedAt: string;
  publishedBy: string;
  checkpointId: string;
  historicalEventId: string;
}

export interface CreatorStudioState {
  isPaused: boolean;
  pausedAt: string | null;
  pausedBy: string | null;
  pauseReason: string | null;
  drafts: CreatorDraft[];
  checkpoints: WorldCheckpoint[];
  publishedHistory: PublishedRecord[];
}

function defaultCreatorStudioState(): CreatorStudioState {
  return {
    isPaused: false,
    pausedAt: null,
    pausedBy: null,
    pauseReason: null,
    drafts: [],
    checkpoints: [],
    publishedHistory: [],
  };
}

function getStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadCreatorStudioState(): CreatorStudioState {
  const storage = getStorage();
  if (!storage) return defaultCreatorStudioState();
  try {
    const raw = storage.getItem(CREATOR_STUDIO_STORAGE_KEY);
    if (!raw) return defaultCreatorStudioState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaultCreatorStudioState();
    return {
      isPaused: Boolean(parsed.isPaused),
      pausedAt: typeof parsed.pausedAt === 'string' ? parsed.pausedAt : null,
      pausedBy: typeof parsed.pausedBy === 'string' ? parsed.pausedBy : null,
      pauseReason: typeof parsed.pauseReason === 'string' ? parsed.pauseReason : null,
      drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
      checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints : [],
      publishedHistory: Array.isArray(parsed.publishedHistory) ? parsed.publishedHistory : [],
    };
  } catch {
    return defaultCreatorStudioState();
  }
}

function saveCreatorStudioState(state: CreatorStudioState): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(CREATOR_STUDIO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep session usable if quota is reached
  }
}

function requireCreatorAuthorization(actorOverride?: { isLoggedIn?: boolean; isAdmin?: boolean; name?: string }): {
  authorized: boolean;
  actorName: string;
  reason?: string;
} {
  if (actorOverride) {
    if (!actorOverride.isLoggedIn || !actorOverride.isAdmin) {
      return {
        authorized: false,
        actorName: actorOverride.name || 'Unauthorized User',
        reason: 'Creator Studio state management requires the signed-in World Administrator.',
      };
    }
    return { authorized: true, actorName: actorOverride.name || 'World Administrator' };
  }
  const auth = communicationsAuthority();
  if (!auth.isLoggedIn || !auth.player?.isAdmin) {
    return {
      authorized: false,
      actorName: auth.player?.name || 'Citizen',
      reason: 'Creator Studio state management requires the signed-in World Administrator.',
    };
  }
  return { authorized: true, actorName: auth.player.name || 'World Administrator' };
}

export function isWorldPaused(): boolean {
  return loadCreatorStudioState().isPaused;
}

export function getWorldPauseState(): Pick<CreatorStudioState, 'isPaused' | 'pausedAt' | 'pausedBy' | 'pauseReason'> {
  const state = loadCreatorStudioState();
  return {
    isPaused: state.isPaused,
    pausedAt: state.pausedAt,
    pausedBy: state.pausedBy,
    pauseReason: state.pauseReason,
  };
}

export function pauseWorld(
  reason = 'Creator Studio inspection & draft staging',
  actorOverride?: { isLoggedIn?: boolean; isAdmin?: boolean; name?: string }
): { ok: boolean; isPaused: boolean; checkpoint?: WorldCheckpoint; message: string } {
  const auth = requireCreatorAuthorization(actorOverride);
  if (!auth.authorized) {
    return { ok: false, isPaused: isWorldPaused(), message: auth.reason! };
  }
  const state = loadCreatorStudioState();
  const checkpoint = captureWorldCheckpointInternal(state, `Pause snapshot (${reason})`, 'pause_snapshot', auth.actorName);
  state.isPaused = true;
  state.pausedAt = new Date().toISOString();
  state.pausedBy = auth.actorName;
  state.pauseReason = reason;
  saveCreatorStudioState(state);
  return {
    ok: true,
    isPaused: true,
    checkpoint,
    message: `World simulation paused by ${auth.actorName}. Time progression and background agency ticks are frozen.`,
  };
}

export function resumeWorld(
  actorOverride?: { isLoggedIn?: boolean; isAdmin?: boolean; name?: string }
): { ok: boolean; isPaused: boolean; message: string } {
  const auth = requireCreatorAuthorization(actorOverride);
  if (!auth.authorized) {
    return { ok: false, isPaused: isWorldPaused(), message: auth.reason! };
  }
  const state = loadCreatorStudioState();
  state.isPaused = false;
  state.pausedAt = null;
  state.pausedBy = null;
  state.pauseReason = null;
  saveCreatorStudioState(state);
  return {
    ok: true,
    isPaused: false,
    message: `World simulation resumed by ${auth.actorName}.`,
  };
}

function captureWorldCheckpointInternal(
  state: CreatorStudioState,
  label: string,
  reason: WorldCheckpoint['reason'],
  actorName: string
): WorldCheckpoint {
  const storage = getStorage();
  const entries: WorldEntries = storage ? readWorldEntries(storage) : {};
  const issuedSnapshotsRaw = storage ? storage.getItem(ISSUED_SNAPSHOTS_KEY) : null;
  const checkpoint: WorldCheckpoint = {
    id: `CHK-${crypto.randomUUID()}`,
    label: label.trim() || 'World State Checkpoint',
    reason,
    createdAt: new Date().toISOString(),
    createdBy: actorName,
    entries,
    issuedSnapshotsRaw,
  };
  state.checkpoints = [checkpoint, ...state.checkpoints.slice(0, 19)];
  return checkpoint;
}

export function captureWorldCheckpoint(
  label = 'Manual Creator Checkpoint',
  actorOverride?: { isLoggedIn?: boolean; isAdmin?: boolean; name?: string }
): { ok: boolean; checkpoint?: WorldCheckpoint; message: string } {
  const auth = requireCreatorAuthorization(actorOverride);
  if (!auth.authorized) {
    return { ok: false, message: auth.reason! };
  }
  const state = loadCreatorStudioState();
  const checkpoint = captureWorldCheckpointInternal(state, label, 'manual', auth.actorName);
  saveCreatorStudioState(state);
  return {
    ok: true,
    checkpoint,
    message: `World checkpoint [${checkpoint.id}] saved (${Object.keys(checkpoint.entries).length} state stores captured).`,
  };
}

export function listWorldCheckpoints(): WorldCheckpoint[] {
  return loadCreatorStudioState().checkpoints;
}

/**
 * Restores a saved world checkpoint while preserving immutable historical records:
 * - Issued document snapshots are merged additively (never deleted).
 * - Canonical MAIDs and the monotonic MAID counter are preserved so permanent identities are never lost or reused.
 * - Historical worldEventLog entries are merged additively so historical lore/published records remain intact.
 */
export function restoreWorldCheckpoint(
  checkpointId: string,
  actorOverride?: { isLoggedIn?: boolean; isAdmin?: boolean; name?: string }
): { ok: boolean; restoredCheckpoint?: WorldCheckpoint; backupCheckpoint?: WorldCheckpoint; message: string } {
  const auth = requireCreatorAuthorization(actorOverride);
  if (!auth.authorized) {
    return { ok: false, message: auth.reason! };
  }
  const storage = getStorage();
  if (!storage) {
    return { ok: false, message: 'Local storage is unavailable for checkpoint restoration.' };
  }
  const state = loadCreatorStudioState();
  const target = state.checkpoints.find(c => c.id === checkpointId);
  if (!target) {
    return { ok: false, message: `Checkpoint '${checkpointId}' not found.` };
  }

  // 1. Capture pre-restore safety backup
  const backupCheckpoint = captureWorldCheckpointInternal(
    state,
    `Pre-restore backup before ${target.id}`,
    'pre_restore',
    auth.actorName
  );

  // 2. Preserve current historical records before applying checkpoint entries
  const currentSnapshotsRaw = storage.getItem(ISSUED_SNAPSHOTS_KEY);
  const currentIdentitiesRaw = storage.getItem(CANONICAL_IDENTITIES_KEY);
  const currentCounterRaw = storage.getItem(MAID_COUNTER_KEY);
  const currentOsProgressRaw = storage.getItem(OS_PROGRESS_KEY);

  // 3. Restore all WORLD_KEYS from target checkpoint
  for (const key of WORLD_KEYS) {
    const val = target.entries[key];
    if (typeof val === 'string') {
      storage.setItem(key, val);
    }
  }

  // 4. Preserve monotonic MAID counter (never roll back counter below highest allocated sequence)
  const prevCounter = parseInt(currentCounterRaw || '0', 10);
  const restoredCounter = parseInt(storage.getItem(MAID_COUNTER_KEY) || '0', 10);
  if (!isNaN(prevCounter) && prevCounter > (isNaN(restoredCounter) ? 0 : restoredCounter)) {
    storage.setItem(MAID_COUNTER_KEY, String(prevCounter));
  }

  // 5. Preserve canonical citizen identities additively so issued MAIDs are never destroyed
  try {
    const currentPersons: any[] = currentIdentitiesRaw ? JSON.parse(currentIdentitiesRaw) : [];
    const restoredPersons: any[] = storage.getItem(CANONICAL_IDENTITIES_KEY)
      ? JSON.parse(storage.getItem(CANONICAL_IDENTITIES_KEY)!)
      : [];
    if (Array.isArray(currentPersons) && Array.isArray(restoredPersons)) {
      const byIdOrMaid = new Map<string, any>();
      restoredPersons.forEach(p => {
        if (p && (p.maid || p.id)) byIdOrMaid.set(p.maid || p.id, p);
      });
      currentPersons.forEach(p => {
        const key = p && (p.maid || p.id);
        if (key && !byIdOrMaid.has(key)) {
          restoredPersons.push(p);
          byIdOrMaid.set(key, p);
        }
      });
      storage.setItem(CANONICAL_IDENTITIES_KEY, JSON.stringify(restoredPersons));
    }
  } catch {
    // Keep restored copy if JSON parsing fails
  }

  // 6. Preserve issued document snapshots additively
  try {
    const currentSnaps: any[] = currentSnapshotsRaw ? JSON.parse(currentSnapshotsRaw) : [];
    const targetSnaps: any[] = target.issuedSnapshotsRaw ? JSON.parse(target.issuedSnapshotsRaw) : [];
    const mergedMap = new Map<string, any>();
    [...targetSnaps, ...currentSnaps].forEach(snap => {
      if (snap && typeof snap.id === 'string') mergedMap.set(snap.id, snap);
    });
    if (mergedMap.size > 0) {
      storage.setItem(ISSUED_SNAPSHOTS_KEY, JSON.stringify(Array.from(mergedMap.values())));
    }
  } catch {
    // Ignore malformed snapshot JSON
  }

  // 7. Preserve historical worldEventLog entries additively in miraverse-os-progress
  try {
    const restoredOsRaw = storage.getItem(OS_PROGRESS_KEY);
    if (currentOsProgressRaw && restoredOsRaw) {
      const currentOs = JSON.parse(currentOsProgressRaw);
      const restoredOs = JSON.parse(restoredOsRaw);
      const currentLog: any[] = currentOs?.state?.gameplay?.worldEventLog || [];
      const restoredLog: any[] = restoredOs?.state?.gameplay?.worldEventLog || [];
      if (Array.isArray(currentLog) && Array.isArray(restoredLog)) {
        const seenIds = new Set(restoredLog.map(e => e?.id).filter(Boolean));
        const combinedLog = [...restoredLog];
        for (const evt of currentLog) {
          if (evt && typeof evt.id === 'string' && !seenIds.has(evt.id)) {
            combinedLog.push(evt);
            seenIds.add(evt.id);
          }
        }
        if (restoredOs?.state?.gameplay) {
          restoredOs.state.gameplay.worldEventLog = combinedLog;
          storage.setItem(OS_PROGRESS_KEY, JSON.stringify(restoredOs));
        }
      }
    }
  } catch {
    // Keep restored OS progress if parsing fails
  }

  saveCreatorStudioState(state);
  return {
    ok: true,
    restoredCheckpoint: target,
    backupCheckpoint,
    message: `Restored checkpoint [${target.id}] while preserving canonical MAIDs, issued document snapshots, and historical logs.`,
  };
}

export function saveCreatorDraft(
  input: {
    id?: string;
    title: string;
    summary?: string;
    category: CreatorDraftCategory;
    payload?: Record<string, any>;
  },
  actorOverride?: { isLoggedIn?: boolean; isAdmin?: boolean; name?: string }
): { ok: boolean; draft?: CreatorDraft; message: string } {
  const auth = requireCreatorAuthorization(actorOverride);
  if (!auth.authorized) {
    return { ok: false, message: auth.reason! };
  }
  const title = (input.title || '').trim();
  if (!title) {
    return { ok: false, message: 'Draft title is required.' };
  }
  const validCategories: CreatorDraftCategory[] = [
    'world_event',
    'notice',
    'versenet_page',
    'citizen_dossier',
    'comms_broadcast',
    'world_patch',
  ];
  if (!validCategories.includes(input.category)) {
    return { ok: false, message: `Invalid draft category '${input.category}'.` };
  }

  const state = loadCreatorStudioState();
  const now = new Date().toISOString();
  const existingIdx = input.id ? state.drafts.findIndex(d => d.id === input.id) : -1;

  if (existingIdx >= 0) {
    const existing = state.drafts[existingIdx];
    if (existing.status === 'published') {
      return { ok: false, message: 'Published drafts are sealed in the historical record. Create a new draft revision instead.' };
    }
    const updated: CreatorDraft = {
      ...existing,
      title,
      summary: input.summary !== undefined ? input.summary.trim() : existing.summary,
      category: input.category,
      payload: input.payload !== undefined ? { ...input.payload } : existing.payload,
      status: 'draft',
      version: existing.version + 1,
      updatedAt: now,
    };
    state.drafts[existingIdx] = updated;
    saveCreatorStudioState(state);
    return { ok: true, draft: updated, message: `Saved draft '${updated.title}' (v${updated.version}). Live world state is unchanged.` };
  }

  const created: CreatorDraft = {
    id: input.id || `DRF-CS-${crypto.randomUUID()}`,
    title,
    summary: (input.summary || '').trim(),
    category: input.category,
    payload: { ...(input.payload || {}) },
    status: 'draft',
    version: 1,
    author: auth.actorName,
    createdAt: now,
    updatedAt: now,
  };
  state.drafts.unshift(created);
  saveCreatorStudioState(state);
  return { ok: true, draft: created, message: `Created staging draft '${created.title}' [${created.id}]. Live world state is unchanged.` };
}

export function listCreatorDrafts(filterStatus?: CreatorDraft['status']): CreatorDraft[] {
  const drafts = loadCreatorStudioState().drafts;
  return filterStatus ? drafts.filter(d => d.status === filterStatus) : drafts;
}

export function discardCreatorDraft(
  draftId: string,
  actorOverride?: { isLoggedIn?: boolean; isAdmin?: boolean; name?: string }
): { ok: boolean; message: string } {
  const auth = requireCreatorAuthorization(actorOverride);
  if (!auth.authorized) {
    return { ok: false, message: auth.reason! };
  }
  const state = loadCreatorStudioState();
  const target = state.drafts.find(d => d.id === draftId);
  if (!target) {
    return { ok: false, message: `Draft '${draftId}' not found.` };
  }
  if (target.status === 'published') {
    return { ok: false, message: 'Published records cannot be deleted; historical records are permanent.' };
  }
  state.drafts = state.drafts.filter(d => d.id !== draftId);
  saveCreatorStudioState(state);
  return { ok: true, message: `Discarded unpublished draft '${target.title}'.` };
}

export function validateCreatorDraft(
  draftId: string,
  actorOverride?: { isLoggedIn?: boolean; isAdmin?: boolean; name?: string }
): { ok: boolean; draft?: CreatorDraft; errors: string[]; message: string } {
  const auth = requireCreatorAuthorization(actorOverride);
  if (!auth.authorized) {
    return { ok: false, errors: [auth.reason!], message: auth.reason! };
  }
  const state = loadCreatorStudioState();
  const idx = state.drafts.findIndex(d => d.id === draftId);
  if (idx < 0) {
    return { ok: false, errors: ['Draft not found.'], message: `Draft '${draftId}' not found.` };
  }
  const draft = state.drafts[idx];
  const errors: string[] = [];
  if (!draft.title || draft.title.trim().length < 3) {
    errors.push('Draft title must be at least 3 characters.');
  }
  if (!draft.summary || draft.summary.trim().length < 5) {
    errors.push('Draft summary must be at least 5 characters.');
  }
  if (!draft.payload || typeof draft.payload !== 'object') {
    errors.push('Draft payload must be a valid structured object.');
  }

  if (errors.length > 0) {
    return { ok: false, draft, errors, message: `Draft validation failed: ${errors.join(' ')}` };
  }

  draft.status = 'validated';
  draft.updatedAt = new Date().toISOString();
  state.drafts[idx] = draft;
  saveCreatorStudioState(state);
  return { ok: true, draft, errors: [], message: `Draft '${draft.title}' validated and ready for controlled publishing.` };
}

export function publishCreatorDraft(
  draftId: string,
  actorOverride?: { isLoggedIn?: boolean; isAdmin?: boolean; name?: string }
): {
  ok: boolean;
  publishedRecord?: PublishedRecord;
  checkpoint?: WorldCheckpoint;
  message: string;
} {
  const auth = requireCreatorAuthorization(actorOverride);
  if (!auth.authorized) {
    return { ok: false, message: auth.reason! };
  }
  const validation = validateCreatorDraft(draftId, actorOverride);
  if (!validation.ok || !validation.draft) {
    return { ok: false, message: validation.message };
  }

  const state = loadCreatorStudioState();
  const idx = state.drafts.findIndex(d => d.id === draftId);
  const draft = state.drafts[idx];
  if (draft.status === 'published') {
    return { ok: false, message: `Draft '${draft.title}' has already been published.` };
  }

  // 1. Capture pre-publish checkpoint
  const checkpoint = captureWorldCheckpointInternal(
    state,
    `Pre-publish snapshot for ${draft.title}`,
    'pre_publish',
    auth.actorName
  );

  const now = new Date().toISOString();
  const historicalEventId = `EVT-PUB-${crypto.randomUUID()}`;

  // 2. Append to OS worldEventLog in storage if present (non-destructive)
  const storage = getStorage();
  if (storage) {
    try {
      const osRaw = storage.getItem(OS_PROGRESS_KEY);
      if (osRaw) {
        const parsed = JSON.parse(osRaw);
        if (parsed?.state?.gameplay) {
          const existingLog = Array.isArray(parsed.state.gameplay.worldEventLog)
            ? parsed.state.gameplay.worldEventLog
            : [];
          parsed.state.gameplay.worldEventLog = [
            {
              id: historicalEventId,
              category: draft.payload?.eventCategory || 'civic',
              title: draft.title,
              summary: draft.summary,
              institution: draft.payload?.institution || 'Creator Studio // Sovereign Archive',
              cycle: parsed.state.gameplay.timeCycleCount ?? 28,
              timestamp: now,
              tags: ['published', draft.category],
            },
            ...existingLog,
          ];
          storage.setItem(OS_PROGRESS_KEY, JSON.stringify(parsed));
        }
      }
    } catch {
      // Continue publishing record in Creator Studio state
    }
  }

  // 3. Seal draft as published and record in permanent publishedHistory
  draft.status = 'published';
  draft.publishedAt = now;
  draft.updatedAt = now;
  draft.checkpointId = checkpoint.id;
  state.drafts[idx] = draft;

  const publishedRecord: PublishedRecord = {
    id: `PUB-${crypto.randomUUID()}`,
    draftId: draft.id,
    title: draft.title,
    category: draft.category,
    publishedAt: now,
    publishedBy: auth.actorName,
    checkpointId: checkpoint.id,
    historicalEventId,
  };
  state.publishedHistory.unshift(publishedRecord);
  saveCreatorStudioState(state);

  return {
    ok: true,
    publishedRecord,
    checkpoint,
    message: `Published '${draft.title}' [${publishedRecord.id}] with pre-publish checkpoint [${checkpoint.id}]. Historical records preserved.`,
  };
}

export function getPublishedHistory(): PublishedRecord[] {
  return loadCreatorStudioState().publishedHistory;
}
