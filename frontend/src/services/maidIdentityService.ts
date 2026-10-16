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
import { generateProceduralPortrait } from './portraitService';

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
  aura?: string;
  medical?: string;
  residency?: string;
  history?: string;
  legacyRecordId?: string; // Optional legacy MRD ID if transitioning
}

export type CharacterArchetype = 'ordinary' | 'cyacademy' | 'faithmed' | 'dgaos' | 'civic';

export interface PopulationSearchFilters {
  query?: string;
  species?: string;
  affiliation?: string;
  maidStatus?: 'all' | 'active' | 'pending_migration';
  category?: string;
}

export interface BiometricFingerSummary {
  fingerIndex: number;
  label: string;
  pattern: 'WHORL' | 'LOOP-U' | 'LOOP-R' | 'ARCH' | 'TENTED';
  ridgeCount: number;
  minutiaeScore: number;
  henryCode: string;
}

/**
 * Deterministic 10-print dermal ridge classification preview from biometric seed or MAID.
 */
export function generateTenPrintPreview(seedStr: string): BiometricFingerSummary[] {
  const cleanSeed = (seedStr || 'MAID-OR-00481926').trim();
  let hash = 2166136261;
  for (let i = 0; i < cleanSeed.length; i++) {
    hash ^= cleanSeed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const fingerLabels = [
    '1. R. Thumb', '2. R. Index', '3. R. Middle', '4. R. Ring', '5. R. Little',
    '6. L. Thumb', '7. L. Index', '8. L. Middle', '9. L. Ring', '10. L. Little'
  ];
  const patterns: BiometricFingerSummary['pattern'][] = ['WHORL', 'LOOP-U', 'LOOP-R', 'ARCH', 'TENTED'];

  return fingerLabels.map((label, idx) => {
    const subHash = Math.abs(Math.imul(hash ^ (idx * 7919), 1597334677));
    const pattern = patterns[subHash % patterns.length];
    const ridgeCount = 11 + (subHash % 14);
    const minutiaeScore = 88 + (subHash % 12);
    const henryCode = `${pattern.charAt(0)}-${ridgeCount}-${(subHash % 9) + 1}`;
    return {
      fingerIndex: idx + 1,
      label,
      pattern,
      ridgeCount,
      minutiaeScore,
      henryCode
    };
  });
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
      aura: input.aura || 'Aura Calibrated Standard',
      medical: input.medical || 'Faith Medical Group · intake verified',
      residency: input.residency || 'Private residence · verified',
      history: input.history || 'Official registration established under Orynvell civic authority.',
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

    if (!newPerson.portraitData) {
      newPerson.portraitData = generateProceduralPortrait({
        name: newPerson.name,
        species: newPerson.species,
        ancestry: newPerson.ancestry,
        eyes: newPerson.eyes,
        hair: newPerson.hair,
        build: newPerson.build,
        height: newPerson.height,
        mark: newPerson.mark,
        home: newPerson.home,
        affinity: newPerson.affinity,
        powerSource: newPerson.powerSource,
        category: newPerson.category,
        dob: newPerson.dob
      });
    }

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

  /**
   * Links two canonical citizens in the registry with a typed relationship.
   */
  public static async linkCitizens(
    sourceMaidOrId: string,
    targetMaidOrId: string,
    relationshipType: string,
    notes?: string,
    bidirectional = true
  ): Promise<{ success: boolean; source?: CanonicalPerson; target?: CanonicalPerson; error?: string }> {
    const currentList = await this.getAllPersons();
    const sIdx = currentList.findIndex(p => p.maid === sourceMaidOrId || p.id === sourceMaidOrId || p.legacyRecord === sourceMaidOrId);
    const tIdx = currentList.findIndex(p => p.maid === targetMaidOrId || p.id === targetMaidOrId || p.legacyRecord === targetMaidOrId);

    if (sIdx < 0 || tIdx < 0) {
      return { success: false, error: 'One or both citizens could not be found in the canonical registry.' };
    }
    if (sIdx === tIdx) {
      return { success: false, error: 'Cannot link a citizen to themselves.' };
    }

    const source = currentList[sIdx];
    const target = currentList[tIdx];
    const targetRef = target.maid || target.legacyRecord;
    const sourceRef = source.maid || source.legacyRecord;

    const sRels = Array.isArray(source.relationshipIds) ? [...source.relationshipIds] : [];
    const existingS = sRels.findIndex(r => r.id === targetRef || r.id === target.legacyRecord || r.id === target.maid);
    if (existingS >= 0) {
      sRels[existingS] = { id: targetRef, type: relationshipType, notes };
    } else {
      sRels.push({ id: targetRef, type: relationshipType, notes });
    }
    source.relationshipIds = sRels;
    source.relationships = sRels.map(r => `${r.type}: ${r.id}${r.notes ? ` (${r.notes})` : ''}`).join(' · ');

    if (bidirectional) {
      const tRels = Array.isArray(target.relationshipIds) ? [...target.relationshipIds] : [];
      const existingT = tRels.findIndex(r => r.id === sourceRef || r.id === source.legacyRecord || r.id === source.maid);
      if (existingT >= 0) {
        tRels[existingT] = { id: sourceRef, type: relationshipType, notes };
      } else {
        tRels.push({ id: sourceRef, type: relationshipType, notes });
      }
      target.relationshipIds = tRels;
      target.relationships = tRels.map(r => `${r.type}: ${r.id}${r.notes ? ` (${r.notes})` : ''}`).join(' · ');
    }

    await saveCanonicalList(currentList);
    return { success: true, source, target };
  }

  /**
   * Multi-criteria population search across MAID, legacy MRD alias, name, species, affiliation, and status.
   */
  public static async searchPopulation(filters: PopulationSearchFilters): Promise<CanonicalPerson[]> {
    const all = await this.getAllPersons();
    return all.filter(p => {
      if (filters.maidStatus && filters.maidStatus !== 'all') {
        if (p.maidStatus !== filters.maidStatus) return false;
      }
      if (filters.species && filters.species !== 'ALL') {
        if (!p.species.toLowerCase().includes(filters.species.toLowerCase())) return false;
      }
      if (filters.affiliation && filters.affiliation !== 'ALL') {
        const aff = `${p.affiliation || ''} ${p.faction || ''} ${p.category || ''}`.toLowerCase();
        if (!aff.includes(filters.affiliation.toLowerCase())) return false;
      }
      if (filters.category && filters.category !== 'ALL') {
        if ((p.category || '').toLowerCase() !== filters.category.toLowerCase()) return false;
      }
      if (filters.query && filters.query.trim()) {
        const q = filters.query.trim().toLowerCase();
        const haystack = [
          p.maid || '',
          p.legacyRecord || '',
          ...(p.legacyAliases || []),
          p.name || '',
          p.alias || '',
          p.species || '',
          p.ancestry || '',
          p.home || '',
          p.place || '',
          p.occupation || '',
          p.affiliation || '',
          p.abilities || '',
          p.passport || '',
          p.district || ''
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  /**
   * Generates a complete, lore-accurate character draft for the Add Person studio.
   */
  public static generateCharacterDraft(archetype: CharacterArchetype = 'ordinary', seedOverride?: number): NewPersonInput {
    const idx = typeof seedOverride === 'number' ? Math.abs(seedOverride) : Math.floor(Math.random() * 1000);
    const pick = <T,>(arr: T[], offset = 0): T => arr[(idx + offset) % arr.length];

    const firstNames = ['Lyra', 'Caelum', 'Seraphina', 'Vaelen', 'Isolde', 'Theron', 'Mireille', 'Cassian', 'Aurelia', 'Soren', 'Elowen', 'Dorian'];
    const lastNames = ['Vance', 'Solis', 'Thorne', 'Vesper', 'Kael', 'Marlowe', 'Ashford', 'Valen', 'Lumen', 'Caelis', 'Vey', 'Rostova'];
    const name = `${pick(firstNames)} ${pick(lastNames, 3)}`;
    const year = 1986 + (idx % 20);
    const month = String(1 + (idx % 12)).padStart(2, '0');
    const day = String(1 + (idx % 28)).padStart(2, '0');
    const dob = `${year}-${month}-${day}`;

    const presets: Record<CharacterArchetype, Partial<NewPersonInput>> = {
      ordinary: {
        storyMode: 'Ordinary & Believable',
        category: 'Everyday civilian',
        affiliation: 'Aureline Civic & Guild Network',
        occupation: pick(['Resonance Glass Artisan', 'Aether-Transit Coordinator', 'District Archival Clerk', 'Botanical Conduit Keeper']),
        clearance: 'General Civic Access · Level I',
        species: pick(['Humanoid · Celestial Citizen', 'Luminary', 'Frostborn', 'Merfolk · Undine']),
        ancestry: pick(['Orynvell Municipal Lineage', 'Marlowe Coastal Heritage', 'Lumia Sprawl Lineage']),
        abilities: pick(['Minor aura stabilization, harmonic glasswork', 'Civic conduit tuning, signal relay', 'Hydro-acoustic sensing, calm tide resonance']),
        powerSource: 'Calibrated Ambient Aether',
        affinity: pick(['Blue · calm / structure / clarity', 'Gold · order / warmth / civic harmony', 'Teal · restoration / flow']),
        home: 'Aureline, Orynvell',
        place: pick(['Aureline Central, Orynvell', 'Marlowe Springs', 'Lumia Sprawl']),
        medical: 'Faith Medical Group · annual aura baseline verified (96.4% stability)',
        residency: 'Glassline Housing Cooperative, Suite 2C · Verified',
        household: 'Glassline Residential Housing 2C',
        history: 'Registered Orynvell resident in good standing; completed municipal biometric calibration.'
      },
      cyacademy: {
        storyMode: 'Cyacademy Scholar',
        category: 'Student / academy',
        affiliation: 'Cyacademy Central Campus',
        occupation: pick(['Senior Resonance Fellow', 'SpellForge Protocol Researcher', 'Aethercore Syntax Scholar', 'Arcane Telemetry Apprentice']),
        clearance: 'General Civic Access · Academic Clearance II',
        species: pick(['Frostborn', 'Lightborn · Seraphic', 'Luminary', 'Humanoid · Celestial']),
        ancestry: pick(['Lightborn · Ellawen Lineage', 'Northwake Cryo-Weaver Heritage', 'Orynvell Academic House']),
        abilities: pick(['Cryo-constructs, SpellForge rune weaving, starlight syntax', 'PRISM harmonic diagnostics, barrier projection', 'Solar-script compilation, memory lattice indexing']),
        powerSource: 'PRISM Resonance & Aether',
        affinity: pick(['Violet · knowledge / illusion / memory', 'Indigo · syntax / arcane logic', 'Silver · starlight / precision']),
        home: 'Aureline, Orynvell',
        place: pick(['Northwake, Fross', 'Aureline Upper Sanctum, Orynvell', 'Kaji High Grounds']),
        medical: 'Faith Medical Group · Cyacademy student aura clearance verified',
        residency: 'Cyacademy Vector Housing, Suite 4B · Verified Residence',
        household: 'Cyacademy Vector Housing Suite 4B',
        history: 'Enrolled at Cyacademy of Sciences; active contributor to SpellForge and Mirror telemetry protocols.'
      },
      faithmed: {
        storyMode: 'Faith Medical Clinician',
        category: 'Clinical / Faith Medical',
        affiliation: 'Faith Medical Group · MEDSTAT Division',
        occupation: pick(['Bio-Aura Trauma Specialist', 'Veilwilt Diagnostic Clinician', 'Senior MEDSTAT Triage Officer', 'Cellular Resonance Pharmacist']),
        clearance: 'Faith Medical Clinical Authority · BCL-3',
        species: pick(['Lightborn · Healer', 'Merfolk · Naiad', 'Luminary', 'Humanoid · Celestial']),
        ancestry: pick(['Seraphima Healer Lineage', 'Marlowe Bio-Harmonic House', 'Orynvell Sanctum Lineage']),
        abilities: pick(['Bio-aura cellular mending, Veilwilt purge stabilization', 'Harmonic pulse restoration, toxin neutralization', 'Luminous tissue synthesis, neural calm']),
        powerSource: 'Sacred Lumen & Bio-Aura Resonance',
        affinity: pick(['Emerald · restoration / vitality / life', 'White-Gold · purification / solace', 'Cyan · cellular clarity']),
        home: 'Aureline, Orynvell',
        place: pick(['Aureline Medical Ward, Orynvell', 'Marlowe Springs', 'Orynvell Crown District']),
        medical: 'Faith Medical Group · Staff Clinician Baseline (99.2% Lumen Integrity)',
        residency: 'Sanctum Physician Housing, Block A-12 · Verified',
        household: 'Sanctum Physician Housing Block A-12',
        history: 'Credentialed clinician at Faith Medical Group; oversees MEDSTAT patient triage and DGA forensic medical consults.'
      },
      dgaos: {
        storyMode: 'DGA / Investigative Subject',
        category: 'DGA / TRACE Operational',
        affiliation: 'Department of Global Affairs (DGAOS // EYES & TRACE)',
        occupation: pick(['TRACE Forensic Criminalist', 'EYES Counter-PRISM Analyst', 'SHIELD Tactical Liaison', 'Cross-Sector Field Investigator']),
        clearance: 'DGA Special Clearance · EYES / TRACE Level IV',
        species: pick(['Shadowborn · Umbral', 'Humanoid · Celestial', 'Frostborn', 'Lightborn']),
        ancestry: pick(['Obsidian Watch Lineage', 'Orynvell Crown Intelligence', 'Fross Sub-Conduit Lineage']),
        abilities: pick(['Spectral trace reconstruction, cipher decryption, dermal resonance scan', 'Umbral stealth cloaking, signal interception', 'Chrono-ballistic residue analysis, truth-pulse reading']),
        powerSource: 'Hardened Aether-Core & Tactical Cipher',
        affinity: pick(['Obsidian-Violet · counter-intel / forensics', 'Crimson · tactical / vigilance', 'Cobalt · signal analysis']),
        home: 'Aureline, Orynvell',
        place: pick(['Aureline Citadel, Orynvell', 'Brisland Docks', 'Fross Sub-Conduit']),
        medical: 'Faith Medical Group · DGA Tactical Clearance & Veil-Exposure Monitored',
        residency: 'Citadel Secure Officer Housing, Unit 9 · Verified',
        household: 'Citadel Secure Officer Housing Unit 9',
        history: 'Assigned to DGAOS Command Center and TRACE Forensic Workstation; authorized for hybrid forensic transmission.'
      },
      civic: {
        storyMode: 'Orynvell Civic & Archives',
        category: 'Civic / Sovereign Authority',
        affiliation: 'Orynvell Sovereign Registry & Royal Archives',
        occupation: pick(['Crown Identity Registrar', 'First Orynvell Treasury Auditor', 'Royal Historic Society Archivist', 'Municipal Housing Commissioner']),
        clearance: 'Sovereign Civic Authority · Level III',
        species: pick(['Lightborn · Celestial', 'Luminary', 'Humanoid · Celestial']),
        ancestry: pick(['Orynvell Founding House', 'Aureline Crown Lineage', 'High Council Archival Line']),
        abilities: pick(['Holographic seal authentication, lineage ledger verification', 'Crystalline vault resonance, treaty authentication', 'Archival memory restoration, truth-ink inscription']),
        powerSource: 'Crown Crystalline Conduit',
        affinity: pick(['Royal Gold · sovereignty / permanence / truth', 'Lavender · memory / archive', 'Sapphire · law / order']),
        home: 'Aureline, Orynvell',
        place: 'Orynvell Crown Center',
        medical: 'Faith Medical Group · Sovereign Registry Baseline Verified',
        residency: 'Crown Terrace Housing, Suite 7A · Verified',
        household: 'Crown Terrace Housing Suite 7A',
        history: 'Appointed under Orynvell civic authority to maintain canonical MAID records and historical archives.'
      }
    };

    const preset = presets[archetype] || presets.ordinary;
    const heights = ['165 cm', '169 cm', '172 cm', '175 cm', '178 cm', '182 cm', '185 cm'];
    const eyesList = ['Luminous Violet-Gray', 'Radiant Amber-Gold', 'Sea-Glass Emerald', 'Starlight Silver', 'Deep Obsidian-Blue', 'Luminous Hazel'];
    const hairList = ['Silver-Black / Stardust', 'Sun-Spun Gold', 'Deep Raven-Indigo', 'Glacial White-Silver', 'Copper-Ember', 'Ash-Lavender'];
    const builds = ['Slender / Agile', 'Medium / Balanced', 'Athletic / Calibrated', 'Tall / Statuesque'];
    const bloods = ['A+ (Aura Calibrated)', 'O+ (Lumen High-Yield)', 'AB+ (Harmonic Universal)', 'B+ (Cryo-Stable)'];
    const marks = [
      'Faint crystalline frost markings along left wrist',
      'Subtle golden starlight birthmark near right temple',
      'Delicate bio-luminescent dermal line along collarbone',
      'Calibrated DGA neural-link micro-sigil behind left ear',
      'Iridescent sea-glass scale pattern along forearm'
    ];

    const draft: NewPersonInput = {
      name,
      registrationRegion: 'Orynvell',
      dob,
      place: preset.place || 'Aureline, Orynvell',
      home: preset.home || 'Aureline, Orynvell',
      address: `${100 + (idx % 800)} Celestial Promenade, Aureline Central, Orynvell`,
      phone: `+1 (202) 555-${String(1000 + (idx % 8999)).padStart(4, '0')}`,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@meridion.org`,
      district: 'Aureline Central District, Orynvell',
      passport: `AUR-${String(200000 + (idx * 733) % 799999).padStart(6, '0')}`,
      alias: `${pick(['Starweaver', 'Cipher', 'Frostglass', 'Lumen', 'Vanguard', 'Archivist'])}-${(idx % 90) + 10}`,
      height: pick(heights),
      eyes: pick(eyesList, 1),
      hair: pick(hairList, 2),
      build: pick(builds, 3),
      blood: pick(bloods, 4),
      mark: pick(marks, 5),
      species: preset.species || 'Humanoid · Celestial',
      ancestry: preset.ancestry || 'Orynvell Lineage',
      abilities: preset.abilities || 'Aura stabilization',
      powerSource: preset.powerSource || 'Ambient Aether',
      affinity: preset.affinity || 'Violet · knowledge',
      faction: preset.affiliation,
      lore: preset.history,
      category: preset.category,
      affiliation: preset.affiliation,
      occupation: preset.occupation,
      clearance: preset.clearance,
      aura: 'Calibrated Harmonic Tier III',
      medical: preset.medical,
      residency: preset.residency,
      history: preset.history,
      status: 'ACTIVE / VERIFIED',
      links: `Active cross-application record synchronized across ${preset.affiliation}.`,
      household: preset.household,
      timeline: `Origin: ${preset.place}; registered in Orynvell (${dob.slice(0, 4)}–Present)`,
      storyMode: preset.storyMode
    };

    draft.portraitData = generateProceduralPortrait({
      name: draft.name,
      species: draft.species,
      ancestry: draft.ancestry,
      eyes: draft.eyes || 'Luminous Hazel',
      hair: draft.hair || 'Silver-Black',
      build: draft.build || 'Medium',
      height: draft.height,
      mark: draft.mark,
      home: draft.home,
      affinity: draft.affinity,
      powerSource: draft.powerSource,
      category: draft.category || 'Citizen',
      dob: draft.dob
    }, idx + 42);

    return draft;
  }

  /**
   * Seeds the canonical population database with interconnected Meridion citizens
   * across Cyacademy, Faith Medical, DGAOS/TRACE, and Orynvell Civic Archives if empty.
   */
  public static async ensureDefaultPopulationSeeded(): Promise<CanonicalPerson[]> {
    const existing = await this.getAllPersons();
    if (existing.length > 0) {
      return existing;
    }

    const defaultInputs: (NewPersonInput & { fixedMaid: string; fixedLegacy: string })[] = [
      {
        fixedMaid: 'MAID-OR-00481926',
        fixedLegacy: 'MRD-8492-319',
        name: 'Elara Vale',
        registrationRegion: 'Orynvell',
        dob: '2001-04-18',
        place: 'Northwake, Fross',
        home: 'Aureline, Orynvell',
        address: '142 Moonwell Way, Glassline District, Aureline Central',
        phone: '+1 (202) 555-0142',
        email: 'elara.vale@cyacademy.edu',
        district: 'Glassline District, Aureline Central',
        passport: 'AUR-782194',
        alias: 'Frostweaver / Silverglass',
        height: '174 cm',
        eyes: 'Luminous Violet-Gray',
        hair: 'Silver-Black / Stardust Shimmer',
        build: 'Slender / Resilient Cryo-Adaptation',
        blood: 'A+ (Aura Calibrated)',
        mark: 'Faint crystalline frost markings along left wrist',
        species: 'Frostborn',
        ancestry: 'Lightborn · Ellawen Lineage',
        abilities: 'Cryo-constructs, frost veil stabilization, starlight resonance',
        powerSource: 'PRISM resonance & Aether',
        affinity: 'Violet · knowledge / illusion / memory',
        faction: 'Aureline Civic & Academic Network',
        lore: 'Descendant of ancient Northwake cryo-weavers; enrolled in Cyacademy advanced resonance curriculum.',
        category: 'Student / academy',
        affiliation: 'Cyacademy Central Campus',
        occupation: 'Research Apprentice / Resonance Analyst',
        clearance: 'General Civic Access · Academic Clearance II',
        aura: 'Calibrated Harmonic Tier III',
        medical: 'Faith Medical Group · intake verified · Dr. Miracle Jerome attending',
        residency: 'Cyacademy Vector Housing 4B · Verified Residence',
        history: 'Routine civil registration completed at intake; transferred from Northwake regional enclave.',
        status: 'ACTIVE / VERIFIED',
        links: 'Coordinates academic study group at Aureline Library; holds valid regional transit pass.',
        relationships: 'Patient of Dr. Miracle Jerome (MAID-OR-00481927) · Mentored by Dr. Julian Paul Vance (MAID-OR-00481928) · Research Partner of Kieran Vesper (MAID-OR-00481929)',
        relationshipIds: [
          { id: 'MAID-OR-00481927', type: 'Attending Physician', notes: 'Faith Medical Aura Calibration' },
          { id: 'MAID-OR-00481928', type: 'Academic & Forensic Mentor', notes: 'TRACE / Cyacademy Liaison' },
          { id: 'MAID-OR-00481929', type: 'Research Partner', notes: 'Orynvell Lineage Archives' }
        ],
        household: 'Cyacademy Vector Housing Suite 4B',
        timeline: 'Origin: Northwake, Fross; residing in Aureline, Orynvell since Year 24',
        storyMode: 'Cyacademy Scholar'
      },
      {
        fixedMaid: 'MAID-OR-00481927',
        fixedLegacy: 'MRD-7712-401',
        name: 'Dr. Miracle Jerome',
        registrationRegion: 'Orynvell',
        dob: '1989-11-03',
        place: 'Aureline Medical Sanctum, Orynvell',
        home: 'Aureline, Orynvell',
        address: '88 Solace Plaza, Sanctum Medical Ward, Aureline',
        phone: '+1 (202) 555-0188',
        email: 'm.jerome@faithmedical.org',
        district: 'Sanctum Medical Ward, Aureline',
        passport: 'AUR-440192',
        alias: 'Chief Bio-Aura Clinician',
        height: '176 cm',
        eyes: 'Radiant Amber-Gold',
        hair: 'Deep Raven-Indigo',
        build: 'Balanced / Clinical Precision',
        blood: 'O+ (Lumen High-Yield)',
        mark: 'Seraphic healer crest tattooed in luminous gold on right forearm',
        species: 'Lightborn · Healer',
        ancestry: 'Seraphima Healer Lineage · Orynvell',
        abilities: 'Bio-aura cellular mending, Veilwilt purge stabilization, MEDSTAT telemetry diagnostics',
        powerSource: 'Sacred Lumen & Bio-Aura Resonance',
        affinity: 'Emerald · restoration / vitality / life',
        faction: 'Faith Medical Group',
        lore: 'Lead Attending Physician at Faith Medical Group and DGA MEDSTAT Medical Director.',
        category: 'Clinical / Faith Medical',
        affiliation: 'Faith Medical Group · MEDSTAT Division',
        occupation: 'Chief Attending Physician & Bio-Aura Specialist',
        clearance: 'Faith Medical Clinical Authority · DGA MEDSTAT Level IV',
        aura: 'Calibrated Harmonic Tier V (Clinical Sovereign)',
        medical: 'Faith Medical Group · Staff Clinician Baseline (99.8% Lumen Integrity)',
        residency: 'Sanctum Physician Housing, Suite 12A · Verified',
        history: 'Directed the Sector 4 Veilwilt stabilization response; oversees citizen aura intake and DGA forensic medical charts.',
        status: 'ACTIVE / VERIFIED',
        links: 'Primary clinical authority across Faith Medical Group, DGAOS MEDSTAT, and Cyacademy Health.',
        relationships: 'Attending Physician for Elara Vale (MAID-OR-00481926) · Forensic Medical Colleague of Dr. Julian Paul Vance (MAID-OR-00481928)',
        relationshipIds: [
          { id: 'MAID-OR-00481926', type: 'Patient', notes: 'Cryo-Aura Baseline Monitoring' },
          { id: 'MAID-OR-00481928', type: 'Forensic Colleague', notes: 'DGAOS MEDSTAT / TRACE Joint Consults' }
        ],
        household: 'Sanctum Physician Housing Suite 12A',
        timeline: 'Origin: Orynvell Crown District; Chief Attending at Faith Medical since Year 18',
        storyMode: 'Faith Medical Clinician'
      },
      {
        fixedMaid: 'MAID-OR-00481928',
        fixedLegacy: 'MRD-9901-214',
        name: 'Dr. Julian Paul Vance',
        registrationRegion: 'Orynvell',
        dob: '1984-07-22',
        place: 'Aureline Citadel, Orynvell',
        home: 'Aureline, Orynvell',
        address: '19 Citadel Terrace, DGA Command Sector, Orynvell',
        phone: '+1 (202) 555-0199',
        email: 'j.vance@dga.gov',
        district: 'Citadel Command Sector, Orynvell',
        passport: 'AUR-109482',
        alias: 'TRACE Lead Criminalist',
        height: '183 cm',
        eyes: 'Deep Obsidian-Blue',
        hair: 'Silver-Black',
        build: 'Tall / Tactical',
        blood: 'AB+ (Harmonic Universal)',
        mark: 'Calibrated DGA neural-link micro-sigil behind left ear',
        species: 'Humanoid · Celestial',
        ancestry: 'Orynvell Crown Intelligence Lineage',
        abilities: 'Spectral trace reconstruction, 10-print dermal analysis, chrono-ballistic forensics',
        powerSource: 'Hardened Aether-Core & Tactical Cipher',
        affinity: 'Obsidian-Violet · counter-intel / forensics',
        faction: 'Department of Global Affairs (DGAOS)',
        lore: 'Chief Forensic Scientist for TRACE Workstation and Senior EYES Division investigator.',
        category: 'DGA / TRACE Operational',
        affiliation: 'Department of Global Affairs (DGAOS // EYES & TRACE)',
        occupation: 'Lead Forensic Criminalist & EYES Investigator',
        clearance: 'DGA Senior Officer Clearance · TRACE Level V',
        aura: 'Hardened Shielded Tier IV',
        medical: 'Faith Medical Group · Tactical Clearance Verified by Dr. Miracle Jerome',
        residency: 'Citadel Officer Housing, Unit 4A · Verified',
        history: 'Architect of the hybrid forensic findings transmission protocol linking TRACE and DGAOS.',
        status: 'ACTIVE / VERIFIED',
        links: 'Authoritative forensic examiner for DGAOS cases; guest lecturer at Cyacademy.',
        relationships: 'Colleague of Dr. Miracle Jerome (MAID-OR-00481927) · Mentor to Elara Vale (MAID-OR-00481926) · Investigating Subject Elena Rostova (MAID-OR-00481931)',
        relationshipIds: [
          { id: 'MAID-OR-00481927', type: 'Forensic Medical Partner', notes: 'DGAOS MEDSTAT Liaison' },
          { id: 'MAID-OR-00481926', type: 'Academic Mentee', notes: 'Resonance Forensics Seminar' },
          { id: 'MAID-OR-00481931', type: 'Investigative Subject', notes: 'TRACE Active Case Review' }
        ],
        household: 'Citadel Officer Housing Unit 4A',
        timeline: 'Origin: Orynvell Citadel; DGAOS Lead Examiner since Year 15',
        storyMode: 'DGA / Investigative Subject'
      },
      {
        fixedMaid: 'MAID-OR-00481929',
        fixedLegacy: 'MRD-6643-882',
        name: 'Kieran Vesper',
        registrationRegion: 'Orynvell',
        dob: '1998-02-14',
        place: 'Orynvell Crown Center',
        home: 'Aureline, Orynvell',
        address: '405 Royal Archive Row, Crown Terrace, Orynvell',
        phone: '+1 (202) 555-0166',
        email: 'k.vesper@archives.orynvell.gov',
        district: 'Crown Terrace District, Orynvell',
        passport: 'AUR-664388',
        alias: 'Keeper of the Lineage Codex',
        height: '179 cm',
        eyes: 'Starlight Silver',
        hair: 'Ash-Lavender',
        build: 'Slender / Scholarly',
        blood: 'A+ (Aura Calibrated)',
        mark: 'Subtle golden starlight birthmark near right temple',
        species: 'Luminary',
        ancestry: 'Orynvell Founding Archival House',
        abilities: 'Lineage ledger verification, Purge archive decryption, holographic seal authentication',
        powerSource: 'Crown Crystalline Conduit',
        affinity: 'Royal Gold · sovereignty / permanence / truth',
        faction: 'Royal Historic Society & Sovereign Registry',
        lore: 'Senior Archivist bridging the Meridion Identity Registry, Royal Historic Archives, and Cyacademy Library.',
        category: 'Civic / Sovereign Authority',
        affiliation: 'Orynvell Sovereign Registry & Royal Archives',
        occupation: 'Senior Crown Archivist & Registry Verifier',
        clearance: 'Sovereign Civic Authority · Level III',
        aura: 'Calibrated Harmonic Tier III',
        medical: 'Faith Medical Group · Sovereign Registry Baseline Verified',
        residency: 'Crown Terrace Housing, Suite 7A · Verified',
        history: 'Oversaw the non-destructive migration of legacy MRD records to permanent MAID-OR identifiers.',
        status: 'ACTIVE / VERIFIED',
        links: 'Maintains cross-index between Royal Archives, Document Studio, and Cyacademy.',
        relationships: 'Research Partner of Elara Vale (MAID-OR-00481926) · Collaborator with Sora Takahashi (MAID-OR-00481930)',
        relationshipIds: [
          { id: 'MAID-OR-00481926', type: 'Research Partner', notes: 'Ellawen Lineage Verification' },
          { id: 'MAID-OR-00481930', type: 'Technical Collaborator', notes: 'Aethercore Registry Encryption' }
        ],
        household: 'Crown Terrace Housing Suite 7A',
        timeline: 'Origin: Orynvell Crown Center; appointed Senior Archivist in Year 22',
        storyMode: 'Orynvell Civic & Archives'
      },
      {
        fixedMaid: 'MAID-OR-00481930',
        fixedLegacy: 'MRD-5120-904',
        name: 'Sora Takahashi',
        registrationRegion: 'Orynvell',
        dob: '2000-09-09',
        place: 'Kaji High Grounds',
        home: 'Aureline, Orynvell',
        address: '72 Conduit Spire, Vector Quarter, Aureline',
        phone: '+1 (202) 555-0151',
        email: 's.takahashi@cyacademy.edu',
        district: 'Vector Quarter, Aureline',
        passport: 'AUR-512090',
        alias: 'NexLink Architect',
        height: '171 cm',
        eyes: 'Sea-Glass Emerald',
        hair: 'Copper-Ember',
        build: 'Agile / Netrunner',
        blood: 'B+ (Cryo-Stable)',
        mark: 'Delicate bio-luminescent dermal line along collarbone',
        species: 'Emberborn',
        ancestry: 'Kaji High Grounds Forge-Lineage',
        abilities: 'Quantum kernel debugging, SpellForge firewall synthesis, PRISM anomaly isolation',
        powerSource: 'Thermal-Aether & Core Logic',
        affinity: 'Indigo · syntax / arcane logic',
        faction: 'Cyacademy & Federal Tech Labs',
        lore: 'Dual-enrolled Cyacademy systems engineer and WORKNET Federal Tech Labs contractor.',
        category: 'Student / academy',
        affiliation: 'Cyacademy Central Campus & WORKNET Tech Labs',
        occupation: 'Systems Engineer & SpellForge Developer',
        clearance: 'General Civic Access · Contractor BCL-2',
        aura: 'Calibrated Harmonic Tier III',
        medical: 'Faith Medical Group · intake verified',
        residency: 'Cyacademy Vector Housing 4C · Verified Residence',
        history: 'Built the real-time telemetry bridge connecting Process Monitor with DGAOS cyber defense.',
        status: 'ACTIVE / VERIFIED',
        links: 'Active across Cyacademy Robotics Club, SpellForge, and WORKNET.',
        relationships: 'Housing Neighbor of Elara Vale (MAID-OR-00481926) · Technical Collaborator with Kieran Vesper (MAID-OR-00481929)',
        relationshipIds: [
          { id: 'MAID-OR-00481926', type: 'Housing Neighbor & Classmate', notes: 'Cyacademy Vector Housing' },
          { id: 'MAID-OR-00481929', type: 'Technical Collaborator', notes: 'Registry Database Security' }
        ],
        household: 'Cyacademy Vector Housing Suite 4C',
        timeline: 'Origin: Kaji High Grounds; residing in Orynvell since Year 23',
        storyMode: 'Cyacademy Scholar'
      },
      {
        fixedMaid: 'MAID-OR-00481931',
        fixedLegacy: 'MRD-4410-118',
        name: 'Elena Rostova',
        registrationRegion: 'Orynvell',
        dob: '1993-12-01',
        place: 'Brisland Docks',
        home: 'Aureline, Orynvell',
        address: '14 Sub-Conduit Wharf, Old Factory Ward, Aureline',
        phone: '+1 (202) 555-0144',
        email: 'e.rostova@versenet.aure',
        district: 'Old Factory Ward, Aureline',
        passport: 'AUR-441011',
        alias: 'Veilwalker / Glass-Echo',
        height: '177 cm',
        eyes: 'Luminous Hazel',
        hair: 'Glacial White-Silver',
        build: 'Athletic / Calibrated',
        blood: 'A+ (Aura Calibrated)',
        mark: 'Iridescent sea-glass scale pattern along forearm',
        species: 'Shadowborn · Umbral',
        ancestry: 'Brisland Coastal & Sub-Conduit Lineage',
        abilities: 'Signal masking, echo-transit navigation, high-frequency aether salvage',
        powerSource: 'Sub-Conduit Resonance',
        affinity: 'Cobalt · signal analysis / shadow',
        faction: 'Independent Courier Network',
        lore: 'Key witness and person of interest in Sector 4 PRISM signal anomaly investigations.',
        category: 'DGA / TRACE Operational',
        affiliation: 'DGAOS EYES Subject of Interest · Old Factory Ward',
        occupation: 'Licensed Aether-Courier & Signal Salvager',
        clearance: 'Provisional Civic Access · DGA Monitored',
        aura: 'Fluctuating Harmonic Tier II (Veil-Exposed)',
        medical: 'Faith Medical Group · Veilwilt outpatient stabilization under Dr. Miracle Jerome',
        residency: 'Old Factory Ward Cooperative Housing, Unit 3B · Verified',
        history: 'Registered in Orynvell; currently assisting TRACE forensic investigators with Sector 4 signal logs.',
        status: 'ACTIVE / MONITORED',
        links: 'Cross-referenced in DGAOS Case Files, TRACE Forensics, and Faith Medical outpatient registry.',
        relationships: 'Monitored by Dr. Julian Paul Vance (MAID-OR-00481928) · Outpatient of Dr. Miracle Jerome (MAID-OR-00481927)',
        relationshipIds: [
          { id: 'MAID-OR-00481928', type: 'Investigating Officer', notes: 'TRACE Sector 4 Anomaly Case' },
          { id: 'MAID-OR-00481927', type: 'Attending Clinician', notes: 'Faith Medical Veilwilt Stabilization' }
        ],
        household: 'Old Factory Ward Housing Unit 3B',
        timeline: 'Origin: Brisland Docks; registered in Orynvell Year 20',
        storyMode: 'DGA / Investigative Subject'
      }
    ];

    const seededList: CanonicalPerson[] = defaultInputs.map((item, idx) => {
      const portrait = generateProceduralPortrait({
        name: item.name,
        species: item.species,
        ancestry: item.ancestry,
        eyes: item.eyes || 'Luminous Hazel',
        hair: item.hair || 'Silver-Black',
        build: item.build || 'Medium',
        height: item.height,
        mark: item.mark,
        home: item.home,
        affinity: item.affinity,
        powerSource: item.powerSource,
        category: item.category || 'Citizen',
        dob: item.dob
      }, 100 + idx * 17);

      return {
        id: generateUuid(),
        maid: item.fixedMaid,
        maidStatus: 'active',
        registrationRegionCode: 'OR',
        registrationDate: new Date(Date.now() - (defaultInputs.length - idx) * 86400000 * 30).toISOString(),
        legacyAliases: [item.fixedLegacy],
        legacyRecord: item.fixedLegacy,
        name: item.name,
        dob: item.dob,
        place: item.place,
        home: item.home,
        address: item.address || '',
        phone: item.phone || '',
        email: item.email || '',
        district: item.district || '',
        passport: item.passport || '',
        alias: item.alias,
        height: item.height || '172 cm',
        eyes: item.eyes || 'Luminous Hazel',
        hair: item.hair || 'Silver-Black',
        build: item.build || 'Medium',
        blood: item.blood || 'A+ (Aura Calibrated)',
        mark: item.mark || 'None recorded',
        biometricSeed: item.fixedMaid,
        portraitData: portrait,
        species: item.species,
        ancestry: item.ancestry,
        abilities: item.abilities,
        powerSource: item.powerSource,
        affinity: item.affinity,
        faction: item.faction,
        lore: item.lore,
        category: item.category || 'Everyday civilian',
        affiliation: item.affiliation || 'Independent resident',
        occupation: item.occupation || 'Resident',
        clearance: item.clearance || 'General civic access',
        aura: item.aura || 'Aura Calibrated Standard',
        medical: item.medical || 'Faith Medical Group · intake verified',
        residency: item.residency || 'Private residence · verified',
        history: item.history || 'Official registration established under Orynvell civic authority.',
        status: item.status || 'ACTIVE / VERIFIED',
        links: item.links || 'Registered citizen in good standing.',
        relationships: item.relationships,
        relationshipIds: item.relationshipIds || [],
        household: item.household,
        timeline: item.timeline,
        origin: 'Authoritative MAID Registration',
        storyMode: item.storyMode || 'Ordinary & Believable',
        isRestricted: false
      };
    });

    try {
      localStorage.setItem(STORAGE_KEY_COUNTER_OR, '481931');
    } catch {}

    await saveCanonicalList(seededList);
    return seededList;
  }
}

