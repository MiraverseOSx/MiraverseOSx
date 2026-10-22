import type { CanonicalPerson } from '../services/maidIdentityService';

export interface PersonalIdentity { citizenId?: string | null; canonicalPersonId?: string | null }
const normalize = (value: unknown) => typeof value === 'string' ? value.trim().toUpperCase() : '';
export function citizenReferenceIds(person: CanonicalPerson): string[] {
  if (!person || typeof person !== 'object') return [];
  return [person.id, person.maid, person.legacyRecord, ...(Array.isArray(person.legacyAliases) ? person.legacyAliases : [])].map(normalize).filter(Boolean);
}

/** Personal identity never follows an agency's active subject or a name search. */
export function resolvePersonalCitizen(persons: CanonicalPerson[], identity: PersonalIdentity): CanonicalPerson | null {
  const binding = normalize(identity.canonicalPersonId);
  const key = binding || normalize(identity.citizenId);
  if (!key) return null;
  const matches = persons.filter(person => person && typeof person === 'object' && (binding ? normalize(person.id) === key : citizenReferenceIds(person).includes(key)));
  return matches.length === 1 && !matches[0].isRestricted ? matches[0] : null;
}

const personalDocumentTypes = new Set([
  'AURA CITIZEN ID', 'AURA ID CARD', 'AURA PASSPORT', 'BIRTH CERTIFICATE',
  'RESIDENCY RECORD', 'RESIDENCY & HOUSING', 'EDUCATION / SERVICE', 'EDUCATION & SERVICE',
]);
/** Only personal issuance metadata; never an agency packet or another citizen's history. */
export function personalIssuanceHistory(saved: unknown, person: CanonicalPerson | null): Record<string, string>[] {
  if (!person || !Array.isArray(saved)) return [];
  const ids = citizenReferenceIds(person);
  return saved.filter(item => item && typeof item === 'object'
    && ids.includes(normalize(item.citizenId || item.citizenRecordId))
    && personalDocumentTypes.has(normalize(item.documentType))
    && ['id', 'issuedAt', 'citizenName', 'issuingAuthority', 'hash'].every(key => typeof item[key] === 'string'));
}
