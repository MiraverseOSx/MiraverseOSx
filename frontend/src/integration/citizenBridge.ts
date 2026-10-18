/**
 * MIRAVERSE OS x — Central Citizen Bridge & Cross-Application Ecosystem
 * Provides authoritative access to canonical citizens, supporting both
 * official MAID numbers and legacy MRD alias resolution across:
 * - Meridion Identity Registry (AURA / MAID)
 * - Official Document Studio (9-Document Packet)
 * - Faith Medical Group (MEDSTAT & WORKNET Clinical Triage)
 * - Cyacademy (MIRROR Profile, Housing & Academic Records)
 * - DGAOS & TRACE Forensic Workstation
 */

import { MaidIdentityService, type CanonicalPerson, type LookupResult } from '../services/maidIdentityService';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/contents';

export interface CitizenRecordRef {
  id: string; // MAID or legacy ID
  maid?: string | null;
  legacyRecord?: string;
  name: string;
  species: string;
  home: string;
  affiliation?: string;
  occupation?: string;
  clearance?: string;
  medical?: string;
  registrationRegion?: string | null;
  status?: string;
  legacyAliases?: string[];
}

export interface ActiveCitizenContext {
  citizenId: string; // MAID or legacyRecord
  targetDocId?: number;
  sourceApp?: string;
  targetTab?: string;
  timestamp: number;
}

const STORAGE_KEY_CANONICAL = 'miraverse-canonical-identities-v1';
const STORAGE_KEY_LEGACY = 'miraverse-identity-registry-v3';
const STORAGE_KEY_ACTIVE_CITIZEN = 'miraverse-active-citizen-context-v1';

/**
 * Synchronous reference loader for UI lists and selector dropdowns.
 */
export function loadCitizenRefs(): CitizenRecordRef[] {
  try {
    const rawCanonical = localStorage.getItem(STORAGE_KEY_CANONICAL);
    if (rawCanonical) {
      const records = JSON.parse(rawCanonical);
      if (Array.isArray(records) && records.length > 0) {
        return records.map((r: any) => ({
          id: r.maid || r.legacyRecord || r.id,
          maid: r.maid || null,
          legacyRecord: r.legacyRecord || r.record,
          name: String(r.name || 'Unnamed'),
          species: String(r.species || 'Unknown'),
          home: String(r.home || 'Unknown'),
          affiliation: r.affiliation || 'Independent resident',
          occupation: r.occupation || 'Resident',
          clearance: r.clearance || 'General civic access',
          medical: r.medical || 'Faith Medical Group · intake verified',
          registrationRegion: r.registrationRegionCode || null,
          status: r.status || 'ACTIVE',
          legacyAliases: r.legacyAliases || []
        }));
      }
    }

    const rawLegacy = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (rawLegacy) {
      const records = JSON.parse(rawLegacy);
      if (Array.isArray(records)) {
        return records.map((r: any) => ({
          id: r.maid || r.record || 'Unknown',
          maid: r.maid || null,
          legacyRecord: r.record,
          name: String(r.name || 'Unnamed'),
          species: String(r.species || 'Unknown'),
          home: String(r.home || 'Unknown'),
          affiliation: r.affiliation || 'Independent resident',
          occupation: r.occupation || 'Resident',
          clearance: r.clearance || 'General civic access',
          medical: r.medical || 'Faith Medical Group · intake verified',
          registrationRegion: r.registrationRegionCode || null,
          status: r.status || 'ACTIVE',
          legacyAliases: r.legacyAliases || [r.record].filter(Boolean)
        }));
      }
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Ensures the canonical population database is seeded and returns all canonical records.
 */
export async function getCanonicalCitizens(): Promise<CanonicalPerson[]> {
  return await MaidIdentityService.ensureDefaultPopulationSeeded();
}

/**
 * Authoritative citizen lookup by MAID, legacy MRD number, or name.
 */
export async function lookupCitizenAuthoritative(query: string): Promise<LookupResult> {
  await MaidIdentityService.ensureDefaultPopulationSeeded();
  return await MaidIdentityService.lookupPerson(query);
}

/**
 * Gets the currently focused citizen context shared across MiraverseOSx applications.
 */
export function getActiveCitizenContext(): ActiveCitizenContext | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_CITIZEN);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveCitizenContext;
  } catch {
    return null;
  }
}

/**
 * Sets the active citizen context and broadcasts it to all open MiraverseOSx windows.
 */
export function setActiveCitizenContext(ctx: ActiveCitizenContext): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CITIZEN, JSON.stringify(ctx));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('miraverse-citizen-context', { detail: ctx }));
      window.postMessage({ source: 'citizen-bridge', type: 'active-citizen-changed', payload: ctx }, window.location.origin);
    }
  } catch {
    // ignore
  }
}

/**
 * Opens a citizen record directly inside a target MiraverseOSx application
 * (e.g., 'meridionRegistry', 'documentStudio', 'dgaos', 'traceForensics', 'jobs', 'passport', 'housing').
 */
export function openCitizenInApp(
  citizenIdOrMaid: string,
  targetAppId: 'meridionRegistry' | 'documentStudio' | 'dgaos' | 'traceForensics' | 'jobs' | 'passport' | 'housing',
  options?: { targetDocId?: number; targetTab?: string; sourceApp?: string }
): void {
  const ctx: ActiveCitizenContext = {
    citizenId: citizenIdOrMaid,
    targetDocId: options?.targetDocId,
    targetTab: options?.targetTab,
    sourceApp: options?.sourceApp || 'system',
    timestamp: Date.now()
  };
  setActiveCitizenContext(ctx);

  try {
    const store = useOSStore.getState();
    const appMeta = APPS.find(a => a.id === targetAppId) || { id: targetAppId, title: targetAppId };
    const existingWin = (store.windows || []).find(w => w.id === targetAppId);
    if (existingWin) {
      if (existingWin.isMinimized) {
        store.toggleMinimize(targetAppId);
      }
      store.focusWindow(targetAppId);
    } else {
      store.addWindow(appMeta);
    }
  } catch {
    // Fallback if store not mounted
  }
}

/**
 * Launches or focuses any MiraverseOSx desktop application by its app ID.
 */
export function launchDesktopApp(targetAppId: string): void {
  try {
    const store = useOSStore.getState();
    const appMeta = APPS.find(a => a.id === targetAppId) || { id: targetAppId, title: targetAppId };
    const existingWin = (store.windows || []).find(w => w.id === targetAppId);
    if (existingWin) {
      if (existingWin.isMinimized) {
        store.toggleMinimize(targetAppId);
      }
      store.focusWindow(targetAppId);
    } else {
      store.addWindow(appMeta);
    }
  } catch {
    // Fallback if store not mounted
  }
}

/**
 * Synchronizes a Faith Medical / MEDSTAT clinical update back to the citizen's canonical MAID record.
 */
export async function syncFaithMedicalUpdate(
  citizenIdOrMaid: string,
  clinicalUpdate: {
    medicalSummary: string;
    auraStatus?: string;
    bloodType?: string;
    attendingClinician?: string;
  }
): Promise<{ success: boolean; person?: CanonicalPerson; error?: string }> {
  const lookup = await lookupCitizenAuthoritative(citizenIdOrMaid);
  if (!lookup.person) {
    return { success: false, error: `Citizen '${citizenIdOrMaid}' not found in MAID registry.` };
  }
  const p = lookup.person;
  const stamp = new Date().toISOString().slice(0, 10);
  const clinicianNote = clinicalUpdate.attendingClinician ? ` (${clinicalUpdate.attendingClinician})` : '';
  const updatedMedical = `Faith Medical Group [${stamp}]${clinicianNote} · ${clinicalUpdate.medicalSummary}`;

  const res = await MaidIdentityService.updatePerson(p.maid || p.id, {
    medical: updatedMedical,
    aura: clinicalUpdate.auraStatus || p.aura,
    blood: clinicalUpdate.bloodType || p.blood,
    history: `${p.history} | [${stamp}] Faith Medical clinical sync: ${clinicalUpdate.medicalSummary}`
  });

  if (res.success) {
    try {
      useOSStore.getState().recordWorldEvent({
        category: 'medical',
        pillar: 'Medical & Forensic Investigations',
        sourceApp: 'Faith Medical / CitizenBridge',
        citizenMaid: p.maid || p.id,
        citizenName: p.name,
        title: `Clinical Record Sync: ${p.name}`,
        summary: `Faith Medical updated ${p.name} (${p.maid || p.id}): ${clinicalUpdate.medicalSummary}.`,
        tags: ['faith-medical', 'citizen-bridge', p.maid || p.id]
      });
    } catch {
      // ignore if store unmounted
    }
  }
  return res;
}

/**
 * Synchronizes a Cyacademy / Housing / Career update back to the citizen's canonical MAID record.
 */
export async function syncCyacademyOrCivicUpdate(
  citizenIdOrMaid: string,
  civicUpdate: {
    affiliation?: string;
    occupation?: string;
    clearance?: string;
    residency?: string;
    household?: string;
    academicNote?: string;
  }
): Promise<{ success: boolean; person?: CanonicalPerson; error?: string }> {
  const lookup = await lookupCitizenAuthoritative(citizenIdOrMaid);
  if (!lookup.person) {
    return { success: false, error: `Citizen '${citizenIdOrMaid}' not found in MAID registry.` };
  }
  const p = lookup.person;
  const stamp = new Date().toISOString().slice(0, 10);

  const res = await MaidIdentityService.updatePerson(p.maid || p.id, {
    affiliation: civicUpdate.affiliation || p.affiliation,
    occupation: civicUpdate.occupation || p.occupation,
    clearance: civicUpdate.clearance || p.clearance,
    residency: civicUpdate.residency || p.residency,
    household: civicUpdate.household || p.household,
    history: civicUpdate.academicNote
      ? `${p.history} | [${stamp}] Cyacademy/Civic sync: ${civicUpdate.academicNote}`
      : p.history
  });

  if (res.success) {
    try {
      useOSStore.getState().recordWorldEvent({
        category: 'civic',
        pillar: 'Living-World Simulation',
        sourceApp: 'Cyacademy / CitizenBridge',
        citizenMaid: p.maid || p.id,
        citizenName: p.name,
        title: `Civic & Academic Sync: ${p.name}`,
        summary: civicUpdate.academicNote || `Updated civic affiliation/residency for ${p.name} (${p.maid || p.id}).`,
        tags: ['cyacademy', 'citizen-bridge', p.maid || p.id]
      });
    } catch {
      // ignore
    }
  }
  return res;
}

/**
 * Synchronizes a DGAOS / TRACE investigative or clearance update back to the citizen's canonical MAID record.
 */
export async function syncDgaInvestigativeUpdate(
  citizenIdOrMaid: string,
  dgaUpdate: {
    status?: string;
    clearance?: string;
    investigativeNote: string;
    caseId?: string;
  }
): Promise<{ success: boolean; person?: CanonicalPerson; error?: string }> {
  const lookup = await lookupCitizenAuthoritative(citizenIdOrMaid);
  if (!lookup.person) {
    return { success: false, error: `Citizen '${citizenIdOrMaid}' not found in MAID registry.` };
  }
  const p = lookup.person;
  const stamp = new Date().toISOString().slice(0, 10);
  const caseTag = dgaUpdate.caseId ? ` [Case ${dgaUpdate.caseId}]` : '';

  const res = await MaidIdentityService.updatePerson(p.maid || p.id, {
    status: dgaUpdate.status || p.status,
    clearance: dgaUpdate.clearance || p.clearance,
    links: `${p.links} · DGAOS/TRACE${caseTag}: ${dgaUpdate.investigativeNote}`,
    history: `${p.history} | [${stamp}] DGAOS/TRACE${caseTag}: ${dgaUpdate.investigativeNote}`
  });

  if (res.success) {
    try {
      useOSStore.getState().recordWorldEvent({
        category: 'forensic',
        pillar: 'Medical & Forensic Investigations',
        sourceApp: 'DGAOS / TRACE',
        citizenMaid: p.maid || p.id,
        citizenName: p.name,
        caseId: dgaUpdate.caseId,
        title: `DGAOS Investigative Sync${caseTag}: ${p.name}`,
        summary: dgaUpdate.investigativeNote,
        tags: ['dgaos', 'trace', 'citizen-bridge', p.maid || p.id]
      });
    } catch {
      // ignore
    }
  }
  return res;
}

