import peopleData from './people.json' with { type: 'json' };
import linkData from './legacy-links.json' with { type: 'json' };
import idAliases from './id-aliases.json' with { type: 'json' };

export interface CharacterIdentity {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly aliases: readonly string[];
  readonly status: string;
  readonly notes: readonly string[];
  readonly legacyIds: readonly string[];
}
export interface CharacterLink {
  readonly collection: string;
  readonly key: string;
  readonly characterId: string;
}

// This catalog resolves authored identities only. It does not issue a MAID,
// authorize access, reveal secrets, or merge player-owned citizen records.
export const CHARACTER_IDENTITIES: readonly CharacterIdentity[] = Object.freeze(peopleData.map(person => Object.freeze({
  ...person, aliases: Object.freeze([...person.aliases]), notes: Object.freeze([...person.notes]), legacyIds: Object.freeze([...person.legacyIds]),
})));
export const CHARACTER_LINKS: readonly CharacterLink[] = Object.freeze(linkData.map(link => Object.freeze({ ...link })));
const byId = new Map(CHARACTER_IDENTITIES.map(person => [person.id, person]));
const redirects = new Map(Object.entries(idAliases));
const referenceKey = (collection: string, key: string) => JSON.stringify([collection, key]);
const byReference = new Map(CHARACTER_LINKS.map(link => [referenceKey(link.collection, link.key), link.characterId]));

export function getCharacterById(id: string): CharacterIdentity | undefined {
  return byId.get(redirects.get(id) || id);
}
export function resolveCharacterReference(collection: string, key: string): CharacterIdentity | undefined {
  const id = byReference.get(referenceKey(collection, key));
  return id ? byId.get(id) : undefined;
}
export function findCharactersByName(name: string): readonly CharacterIdentity[] {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return [];
  return CHARACTER_IDENTITIES.filter(person => [person.name, ...person.aliases].some(value => value.toLowerCase().replace(/\s+/g, ' ') === normalized));
}

// Add an identity reference while keeping legacy IDs, names, handles, and all
// app-specific fields intact. Existing saves continue to use the old keys.
export function attachCharacterIds<T extends { id: string }>(collection: string, records: readonly T[]): (T & { characterId?: string })[] {
  return records.map(record => ({ ...record, characterId: resolveCharacterReference(collection, record.id)?.id }));
}
