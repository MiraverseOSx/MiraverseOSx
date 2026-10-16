/**
 * MIRAVERSE OS x — Central Citizen Bridge & MAID Resolution
 * Provides authoritative access to canonical citizens, supporting both
 * official MAID numbers and legacy MRD alias resolution across TRACE, DGAOS,
 * Document Studio, and Living World apps.
 */

import { MaidIdentityService, type CanonicalPerson, type LookupResult } from '../services/maidIdentityService';

export interface CitizenRecordRef {
  id: string; // MAID or legacy ID
  maid?: string | null;
  name: string;
  species: string;
  home: string;
  registrationRegion?: string | null;
  status?: string;
  legacyAliases?: string[];
}

const STORAGE_KEY_CANONICAL = 'miraverse-canonical-identities-v1';
const STORAGE_KEY_LEGACY = 'miraverse-identity-registry-v3';

/**
 * Synchronous reference loader for UI lists and selector dropdowns.
 */
export function loadCitizenRefs(): CitizenRecordRef[] {
  try {
    // Prefer canonical registry
    const rawCanonical = localStorage.getItem(STORAGE_KEY_CANONICAL);
    if (rawCanonical) {
      const records = JSON.parse(rawCanonical);
      if (Array.isArray(records) && records.length > 0) {
        return records.map((r: any) => ({
          id: r.maid || r.legacyRecord || r.id,
          maid: r.maid || null,
          name: String(r.name || 'Unnamed'),
          species: String(r.species || 'Unknown'),
          home: String(r.home || 'Unknown'),
          registrationRegion: r.registrationRegionCode || null,
          status: r.status || 'ACTIVE',
          legacyAliases: r.legacyAliases || []
        }));
      }
    }

    // Fallback to legacy registry if migration hasn't written canonical key yet
    const rawLegacy = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (rawLegacy) {
      const records = JSON.parse(rawLegacy);
      if (Array.isArray(records)) {
        return records.map((r: any) => ({
          id: r.maid || r.record || 'Unknown',
          maid: r.maid || null,
          name: String(r.name || 'Unnamed'),
          species: String(r.species || 'Unknown'),
          home: String(r.home || 'Unknown'),
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
 * Authoritative citizen lookup by MAID, legacy MRD number, or name.
 */
export async function lookupCitizenAuthoritative(query: string): Promise<LookupResult> {
  return await MaidIdentityService.lookupPerson(query);
}
