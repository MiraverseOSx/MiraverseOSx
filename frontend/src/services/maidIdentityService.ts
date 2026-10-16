/**
 * MIRAVERSE OS x — Official MAID Identity Registry Service
 * Directives:
 * - MAID is the official, permanent identity number: MAID-<REGISTRATION_REGION_CODE>-<8 DIGITS>
 * - Approved region code: OR (Orynvell). Other regions require confirmation before issuance.
 * - MAID is immutable once assigned. Never regenerates on edit/reopen.
 * - Existing MRD IDs remain permanent legacy aliases and resolve to the same person.
 * - Two distinct workflows: Add Person and Look Up MAID.
 * - Non-destructive and idempotent migration with pre-migration backup.
 * - Backed by durable offline storage (IndexedDB idb-keyval + localStorage fallback/cache).
 */

import { get as idbGet, set as idbSet } from 'idb-keyval';

export type RegistrationRegionCode = 'OR';

export const CONFIRMED_REGISTRATION_REGIONS: Record<string, { code: RegistrationRegionCode; name: string }> = {
  Orynvell: { code: 'OR', name: 'Orynvell (Celestial Crown Center)' },
};

export interface CanonicalPerson {
  id: string; // Internal stable UUID
  maid: string | null; // e.g. "MAID-OR-00481926" or null if pending migration
  maidStatus: 'active' | 'pending_migration';
  registrationRegionCode: RegistrationRegionCode | null;
  registrationDate: string;
  legacyAliases: string[]; // e.g. ["MRD-8492-319"]
  legacyRecord: string; // For backward compatibility with older components

  // Master Identity Attributes
  name: string;
  dob: string;
  place: string; // Birthplace
  home: string; // Current residence
  address: string;
  phone: string;
  email: string;
  district: string;
  passport: string;
  alias?: string;

  // Biometrics & Physical Descriptors
  height: string;
  eyes: string;
  hair: string;
  build: string;
  blood: string;
  mark: string;
  biometricSeed: string; // Seed for deterministic 10-prints
  portraitData?: string;

  // World & Lineage
  species: string;
  ancestry: string;
  abilities: string;
  powerSource: string;
  affinity: string;
  faction?: string;
  lore?: string;

  // Civic & Institutional
  category: string;
  affiliation: string;
  occupation: string;
  clearance: string;
  aura?: string;
  medical: string;
  residency: string;
  history: string;
  status: string;
  links: string;
  relationships?: string;
  relationshipIds?: { id: string; type: string; notes?: string }[];
  household?: string;
  timeline?: string;
  origin?: string;
  storyMode?: string;
  isRestricted?: boolean;
}

export interface LookupResult {
  status: 'found' | 'not_found' | 'pending_migration' | 'restricted';
  person: CanonicalPerson | null;
  matchedBy: 'maid' | 'legacy_alias' | 'name' | null;
  matchedQuery: string;
  message?: string;
}

export interface NewPersonInput {
  name: string;
  registrationRegion: 'Orynvell' | 'OR';
  dob: string;
  place: string;
  home: string;
  species: string;
  ancestry: string;
  abilities: string;
  powerSource: string;
  affinity: string;
  faction?: string;
  lore?: string;
  category?: string;
  affiliation?: string;
  occupation?: string;
  clearance?: string;
  address?: string;
  phone?: string;
  email?: string;
  district?: string;
  passport?: string;
  alias?: string;
  height?: string;
  eyes?: string;
  hair?: string;
  build?: string;
  blood?: string;
  mark?: string;
  portraitData?: string;
  storyMode?: string;
  status?: string;
  links?: string;
  relationships?: string;
  relationshipIds?: { id: string; type: string; notes?: string }[];
  household?: string;
  timeline?: string;
  legacyRecordId?: string; // Optional legacy MRD ID if transitioning
}

const STORAGE_KEY_CANONICAL = 'miraverse-canonical-identities-v1';
const STORAGE_KEY_LEGACY = 'miraverse-identity-registry-v3';
const STORAGE_KEY_BACKUP = 'miraverse-identity-registry-v3-backup-pre-maid';
const STORAGE_KEY_COUNTER_OR = 'miraverse-maid-counter-OR';

/**
 * Validates the official MAID format: MAID-<REGISTRATION_REGION_CODE>-<8 DIGITS>
 */
export function validateMaidFormat(maid: string): { valid: boolean; region?: string; sequence?: string; error?: string } {
  if (!maid || typeof maid !== 'string') {
    return { valid: false, error: 'MAID cannot be empty.' };
  }
  const match = maid.trim().toUpperCase().match(/^MAID-([A-Z]{2})-(\d{8})$/);
  if (!match) {
    return { valid: false, error: 'Invalid MAID format. Must follow MAID-<REGION>-<8 DIGITS> (e.g. MAID-OR-00481926).' };
  }
  const region = match[1];
  const sequence = match[2];

  if (region !== 'OR') {
    return { valid: false, region, sequence, error: `Registration region code '${region}' is not yet confirmed by the Creative Director. Only 'OR' (Orynvell) is authorized.` };
  }

  return { valid: true, region, sequence };
}

// In-memory mutex for atomic sequence allocation
let isAllocating = false;

/**
 * Atomically allocates the next sequential 8-digit MAID for Orynvell (OR).
 */
export function allocateNextMaid(existingPersons: CanonicalPerson[]): string {
  const region: RegistrationRegionCode = 'OR';
  
  // Find highest existing sequence in storage
  let maxSeq = 481925; // Default canonical starting threshold
  try {
    const storedCounter = localStorage.getItem(STORAGE_KEY_COUNTER_OR);
    if (storedCounter) {
      const parsed = parseInt(storedCounter, 10);
      if (!isNaN(parsed) && parsed > maxSeq) maxSeq = parsed;
    }
  } catch {
    // fallback
  }

  // Scan existing persons for sequence collision protection
  existingPersons.forEach(p => {
    if (p.maid && p.maid.startsWith('MAID-OR-')) {
      const parts = p.maid.split('-');
      if (parts[2]) {
        const seqNum = parseInt(parts[2], 10);
        if (!isNaN(seqNum) && seqNum > maxSeq) {
          maxSeq = seqNum;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const maid = `MAID-OR-${String(nextSeq).padStart(8, '0')}`;

  try {
    localStorage.setItem(STORAGE_KEY_COUNTER_OR, String(nextSeq));
  } catch {
    // localStorage fallback
  }

  return maid;
}

/**
 * Helper to safely read from IndexedDB or localStorage
 */
async function loadStoredCanonicalList(): Promise<CanonicalPerson[]> {
  try {
    if (typeof indexedDB !== 'undefined') {
      const idbData = await idbGet<CanonicalPerson[]>(STORAGE_KEY_CANONICAL);
      if (Array.isArray(idbData) && idbData.length > 0) {
        return idbData;
      }
    }
  } catch {
    // fallback to localStorage
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CANONICAL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Helper to persist canonical persons to both IndexedDB and localStorage
 */
async function saveCanonicalList(list: CanonicalPerson[]): Promise<void> {
  // Sync to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_CANONICAL, JSON.stringify(list));
    // Also sync to legacy storage for complete backward compatibility with older components
    localStorage.setItem(STORAGE_KEY_LEGACY, JSON.stringify(list.map(p => ({
      ...p,
      record: p.maid || p.legacyRecord,
      maid: p.maid,
      maidStatus: p.maidStatus,
      registrationRegionCode: p.registrationRegionCode,
      legacyAliases: p.legacyAliases
    }))));
  } catch (err) {
    console.error('Failed to sync canonical identities to localStorage:', err);
  }

  // Sync to IndexedDB
  try {
    if (typeof indexedDB !== 'undefined') {
      await idbSet(STORAGE_KEY_CANONICAL, list);
    }
  } catch (err) {
    console.error('Failed to sync canonical identities to IndexedDB:', err);
  }

  // Broadcast event across windows and iframes
  if (typeof window !== 'undefined') {
    window.postMessage({ source: 'meridion-registry', type: 'citizens-changed' }, window.location.origin);
    window.dispatchEvent(new Event('storage'));
  }
}

/**
 * Generates a stable UUID v4 identifier.
 */
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'urn:uuid:' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class MaidIdentityService {
  /**
   * Performs an idempotent, non-destructive migration of existing legacy MRD records.
   */
  public static async migrateLegacyRegistry(): Promise<{
    migratedCount: number;
    pendingCount: number;
    alreadyMigratedCount: number;
    backupCreated: boolean;
  }> {
    let rawLegacy: string | null = null;
    try {
      rawLegacy = localStorage.getItem(STORAGE_KEY_LEGACY);
    } catch {
      return { migratedCount: 0, pendingCount: 0, alreadyMigratedCount: 0, backupCreated: false };
    }

    if (!rawLegacy) {
      return { migratedCount: 0, pendingCount: 0, alreadyMigratedCount: 0, backupCreated: false };
    }

    let legacyList: any[] = [];
    try {
      legacyList = JSON.parse(rawLegacy);
      if (!Array.isArray(legacyList)) return { migratedCount: 0, pendingCount: 0, alreadyMigratedCount: 0, backupCreated: false };
    } catch {
      return { migratedCount: 0, pendingCount: 0, alreadyMigratedCount: 0, backupCreated: false };
    }

    // Step 1: Create a safe, permanent pre-migration backup if not already present
    let backupCreated = false;
    try {
      if (!localStorage.getItem(STORAGE_KEY_BACKUP)) {
        localStorage.setItem(STORAGE_KEY_BACKUP, rawLegacy);
        backupCreated = true;
      }
    } catch {
      // backup error
    }

    const currentCanonical = await loadStoredCanonicalList();
    const existingById = new Map<string, CanonicalPerson>();
    const existingByRecord = new Map<string, CanonicalPerson>();
    const existingByMaid = new Map<string, CanonicalPerson>();

    currentCanonical.forEach(p => {
      existingById.set(p.id, p);
      if (p.maid) existingByMaid.set(p.maid, p);
      if (p.legacyRecord) existingByRecord.set(p.legacyRecord, p);
      p.legacyAliases.forEach(alias => existingByRecord.set(alias, p));
    });

    let migratedCount = 0;
    let pendingCount = 0;
    let alreadyMigratedCount = 0;

    for (const legacy of legacyList) {
      const recordKey = String(legacy.record || legacy.legacyRecord || '');
      if (!recordKey) continue;

      // Check if already in canonical registry (Idempotency guarantee)
      if (existingByRecord.has(recordKey) || (legacy.maid && existingByMaid.has(legacy.maid))) {
        alreadyMigratedCount++;
        continue;
      }

      // Check registration region
      // Rule 3: DO NOT derive registration region from home or place.
      // If cannot be confirmed, preserve the person and mark MAID assignment as pending migration.
      let regionCode: RegistrationRegionCode | null = null;
      let maidStatus: 'active' | 'pending_migration' = 'pending_migration';
      let allocatedMaid: string | null = null;

      if (legacy.registrationRegion === 'Orynvell' || legacy.registrationRegionCode === 'OR') {
        regionCode = 'OR';
        maidStatus = 'active';
        allocatedMaid = legacy.maid && validateMaidFormat(legacy.maid).valid 
          ? legacy.maid 
          : allocateNextMaid(currentCanonical);
        migratedCount++;
      } else {
        // Unknown or unconfirmed registration region: Mark as pending migration
        regionCode = null;
        maidStatus = 'pending_migration';
        allocatedMaid = null;
        pendingCount++;
      }

      const canonicalPerson: CanonicalPerson = {
        id: legacy.id || generateUuid(),
        maid: allocatedMaid,
        maidStatus,
        registrationRegionCode: regionCode,
        registrationDate: legacy.registrationDate || new Date().toISOString(),
        legacyAliases: Array.from(new Set([recordKey, ...(legacy.legacyAliases || [])])),
        legacyRecord: recordKey,

        name: legacy.name || 'Unnamed Citizen',
        dob: legacy.dob || '2000-01-01',
        place: legacy.place || 'Unknown',
        home: legacy.home || 'Unknown',
        address: legacy.address || 'Address on file',
        phone: legacy.phone || '+1 (202) 555-0100',
        email: legacy.email || 'citizen@example.com',
        district: legacy.district || 'Municipal District',
        passport: legacy.passport || 'AUR-000000',
        alias: legacy.alias,

        height: legacy.height || '170 cm',
        eyes: legacy.eyes || 'Dark brown',
        hair: legacy.hair || 'Black',
        build: legacy.build || 'Medium',
        blood: legacy.blood || 'Not verified',
        mark: legacy.mark || 'None recorded',
        biometricSeed: legacy.biometricSeed || recordKey,
        portraitData: legacy.portraitData,

        species: legacy.species || 'Humanoid',
        ancestry: legacy.ancestry || 'Not specified',
        abilities: legacy.abilities || 'None',
        powerSource: legacy.powerSource || 'Not specified',
        affinity: legacy.affinity || 'Undetermined',
        faction: legacy.faction,
        lore: legacy.lore,

        category: legacy.category || 'Everyday civilian',
        affiliation: legacy.affiliation || 'Independent resident',
        occupation: legacy.occupation || 'Resident',
        clearance: legacy.clearance || 'General civic access',
        aura: legacy.aura,
        medical: legacy.medical || 'Faith Medical Group · intake pending',
        residency: legacy.residency || 'Private residence',
        history: legacy.history || 'Migrated from legacy MRD register',
        status: legacy.status || 'ACTIVE',
        links: legacy.links || 'Legacy archive registration',
        relationships: legacy.relationships,
        relationshipIds: legacy.relationshipIds,
        household: legacy.household,
        timeline: legacy.timeline,
        origin: legacy.origin,
        storyMode: legacy.storyMode,
        isRestricted: !!legacy.isRestricted
      };

      currentCanonical.push(canonicalPerson);
      existingByRecord.set(recordKey, canonicalPerson);
      if (canonicalPerson.maid) existingByMaid.set(canonicalPerson.maid, canonicalPerson);
    }

    if (migratedCount > 0 || pendingCount > 0) {
      await saveCanonicalList(currentCanonical);
    }

    return { migratedCount, pendingCount, alreadyMigratedCount, backupCreated };
  }

  /**
   * Retrieves all canonical persons in the registry.
   */
  public static async getAllPersons(): Promise<CanonicalPerson[]> {
    const list = await loadStoredCanonicalList();
    if (list.length === 0) {
      // Auto-migrate if legacy records exist
      await this.migrateLegacyRegistry();
      return await loadStoredCanonicalList();
    }
    return list;
  }

  /**
   * Authoritative MAID / Legacy Alias / Name Lookup.
   */
  public static async lookupPerson(query: string, options?: { allowRestricted?: boolean }): Promise<LookupResult> {
    if (!query || typeof query !== 'string') {
      return { status: 'not_found', person: null, matchedBy: null, matchedQuery: '' };
    }

    const trimmed = query.trim();
    const upperQuery = trimmed.toUpperCase();
    const persons = await this.getAllPersons();

    // 1. Exact MAID Match
    const byMaid = persons.find(p => p.maid && p.maid.toUpperCase() === upperQuery);
    if (byMaid) {
      if (byMaid.isRestricted && !options?.allowRestricted) {
        return {
          status: 'restricted',
          person: null,
          matchedBy: 'maid',
          matchedQuery: trimmed,
          message: 'Access Restricted: Compartmented classification level required.'
        };
      }
      return { status: 'found', person: byMaid, matchedBy: 'maid', matchedQuery: trimmed };
    }

    // 2. Exact Legacy Alias Match (e.g. MRD-8492-319)
    const byAlias = persons.find(p => 
      p.legacyAliases.some(alias => alias.toUpperCase() === upperQuery) ||
      (p.legacyRecord && p.legacyRecord.toUpperCase() === upperQuery)
    );

    if (byAlias) {
      if (byAlias.isRestricted && !options?.allowRestricted) {
        return {
          status: 'restricted',
          person: null,
          matchedBy: 'legacy_alias',
          matchedQuery: trimmed,
          message: 'Access Restricted: Classified subject record.'
        };
      }

      if (byAlias.maidStatus === 'pending_migration') {
        return {
          status: 'pending_migration',
          person: byAlias,
          matchedBy: 'legacy_alias',
          matchedQuery: trimmed,
          message: `Record located by legacy alias '${trimmed}'. Official MAID allocation is pending registration region confirmation.`
        };
      }

      return { status: 'found', person: byAlias, matchedBy: 'legacy_alias', matchedQuery: trimmed };
    }

    // 3. Name or Attribute Match (Case-insensitive)
    const lowerQuery = trimmed.toLowerCase();
    const byName = persons.find(p => p.name.toLowerCase() === lowerQuery || p.name.toLowerCase().includes(lowerQuery));

    if (byName) {
      if (byName.isRestricted && !options?.allowRestricted) {
        return {
          status: 'restricted',
          person: null,
          matchedBy: 'name',
          matchedQuery: trimmed,
          message: 'Access Restricted: Record sealed by DGA authority.'
        };
      }

      if (byName.maidStatus === 'pending_migration') {
        return {
          status: 'pending_migration',
          person: byName,
          matchedBy: 'name',
          matchedQuery: trimmed,
          message: `Subject '${byName.name}' located. Official MAID allocation is pending registration region confirmation.`
        };
      }

      return { status: 'found', person: byName, matchedBy: 'name', matchedQuery: trimmed };
    }

    return {
      status: 'not_found',
      person: null,
      matchedBy: null,
      matchedQuery: trimmed,
      message: `No citizen record found matching '${trimmed}'.`
    };
  }

  /**
   * Workflow 1: Add Person
   * Atomically issues a permanent MAID upon successful authoritative save.
   */
  public static async addPerson(input: NewPersonInput): Promise<{ success: boolean; person: CanonicalPerson; error?: string }> {
    // Enforce initial registration region validation
    if (input.registrationRegion !== 'Orynvell' && input.registrationRegion !== 'OR') {
      return {
        success: false,
        person: null as any,
        error: `Registration region '${input.registrationRegion}' is not authorized for new MAID issuance. Only 'OR' (Orynvell) is confirmed.`
      };
    }

    const currentList = await this.getAllPersons();

    // Check for duplicate name + dob combination
    const existing = currentList.find(p => 
      p.name.toLowerCase() === input.name.trim().toLowerCase() && 
      p.dob === input.dob
    );

    if (existing) {
      return {
        success: false,
        person: existing,
        error: `A person named '${existing.name}' with date of birth '${existing.dob}' already exists (${existing.maid || existing.legacyRecord}). Duplicate creation rejected.`
      };
    }

    // Allocate atomic, unique MAID
    const maid = allocateNextMaid(currentList);
    const id = generateUuid();
    const legacyRecord = input.legacyRecordId || `MRD-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;

    const newPerson: CanonicalPerson = {
      id,
      maid,
      maidStatus: 'active',
      registrationRegionCode: 'OR',
      registrationDate: new Date().toISOString(),
      legacyAliases: [legacyRecord],
      legacyRecord,

      name: input.name.trim(),
      dob: input.dob,
      place: input.place,
      home: input.home,
      address: input.address || `${input.place}, Meridion (fictional)`,
      phone: input.phone || '+1 (202) 555-' + Math.floor(1000 + Math.random() * 9000),
      email: input.email || `${input.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
      district: input.district || `${input.home} District`,
      passport: input.passport || `AUR-${Math.floor(100000 + Math.random() * 900000)}`,
      alias: input.alias,

      height: input.height || '172 cm',
      eyes: input.eyes || 'Luminous Hazel',
      hair: input.hair || 'Silver-Black',
      build: input.build || 'Medium',
      blood: input.blood || 'A+ (Aura Calibrated)',
      mark: input.mark || 'None recorded',
      biometricSeed: maid,
      portraitData: input.portraitData,

      species: input.species,
      ancestry: input.ancestry,
      abilities: input.abilities,
      powerSource: input.powerSource,
      affinity: input.affinity,
      faction: input.faction,
      lore: input.lore,

      category: input.category || 'Everyday civilian',
      affiliation: input.affiliation || 'Independent resident',
      occupation: input.occupation || 'Resident',
      clearance: input.clearance || 'General civic access',
      aura: 'Aura Calibrated Standard',
      medical: 'Faith Medical Group · intake verified',
      residency: 'Private residence · verified',
      history: 'Official registration established under Orynvell civic authority.',
      status: input.status || 'ACTIVE / VERIFIED',
      links: input.links || 'Registered citizen in good standing.',
      relationships: input.relationships,
      relationshipIds: input.relationshipIds || [],
      household: input.household,
      timeline: input.timeline,
      origin: 'Authoritative MAID Registration',
      storyMode: input.storyMode || 'Ordinary & Believable',
      isRestricted: false
    };

    currentList.push(newPerson);
    await saveCanonicalList(currentList);

    return { success: true, person: newPerson };
  }

  /**
   * Updates a saved person without changing their permanent MAID.
   */
  public static async updatePerson(
    maidOrId: string, 
    updates: Partial<Omit<CanonicalPerson, 'id' | 'maid' | 'registrationRegionCode' | 'legacyAliases'>>
  ): Promise<{ success: boolean; person: CanonicalPerson; error?: string }> {
    const currentList = await this.getAllPersons();
    const idx = currentList.findIndex(p => p.maid === maidOrId || p.id === maidOrId || p.legacyRecord === maidOrId);

    if (idx < 0) {
      return { success: false, person: null as any, error: `Person '${maidOrId}' not found.` };
    }

    const current = currentList[idx];

    // Guarantee MAID, region code, and ID are immutable
    const updatedPerson: CanonicalPerson = {
      ...current,
      ...updates,
      id: current.id,
      maid: current.maid,
      registrationRegionCode: current.registrationRegionCode,
      legacyAliases: current.legacyAliases,
      legacyRecord: current.legacyRecord
    };

    currentList[idx] = updatedPerson;
    await saveCanonicalList(currentList);

    return { success: true, person: updatedPerson };
  }

  /**
   * Confirms registration region for a legacy record marked pending_migration and allocates their official MAID.
   */
  public static async confirmPendingRegistration(
    personIdOrRecord: string,
    region: 'Orynvell' | 'OR'
  ): Promise<{ success: boolean; person: CanonicalPerson; error?: string }> {
    if (region !== 'Orynvell' && region !== 'OR') {
      return { success: false, person: null as any, error: `Only 'OR' (Orynvell) is currently confirmed for MAID issuance.` };
    }

    const currentList = await this.getAllPersons();
    const person = currentList.find(p => p.id === personIdOrRecord || p.legacyRecord === personIdOrRecord);

    if (!person) {
      return { success: false, person: null as any, error: 'Person not found in registry.' };
    }

    if (person.maid && person.maidStatus === 'active') {
      return { success: true, person }; // Already has active MAID
    }

    // Allocate official MAID
    const maid = allocateNextMaid(currentList);
    person.maid = maid;
    person.maidStatus = 'active';
    person.registrationRegionCode = 'OR';
    person.biometricSeed = person.biometricSeed || maid;

    await saveCanonicalList(currentList);
    return { success: true, person };
  }
}
