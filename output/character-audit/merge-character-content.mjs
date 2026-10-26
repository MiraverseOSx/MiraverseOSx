import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import path from 'node:path';
const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { parse, parseExpression } = require('@babel/parser');
const dir = 'frontend/src/game-content/characters';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const save = (file, data) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); };
const oldPeople = read(`${dir}/people.json`), links = read(`${dir}/legacy-links.json`);
const inventory = read('docs/data/character-sources.json');
const redirects = {
  'char-aelita-schaeffer': 'char-aelita-hopper', 'char-odd-della-robbia': 'char-odd-della-robia',
  'char-elisabeth-delmas': 'char-sissi-delmas', 'char-riven-asterwind': 'char-riven-kalbera',
  'char-k-vesper': 'char-kieran-vesper', 'char-miracle-jerome-agent': 'char-miracle-jerome',
  'char-elena-rostova-crash': 'char-elena-rostova',
};
const primary = id => redirects[id] || id;
const groups = new Map();
for (const identity of oldPeople) {
  const id = primary(identity.id);
  const preferred = oldPeople.find(person => person.id === id);
  if (!groups.has(id)) groups.set(id, { ...preferred, aliases: [], notes: [], legacyIds: [], references: [], maid: null, legacyMaids: [] });
  const person = groups.get(id);
  person.aliases.push(identity.name, ...identity.aliases);
  person.legacyIds.push(identity.id);
  if (identity.status === 'existing') person.status = 'existing';
}
for (const person of groups.values()) {
  person.aliases = [...new Set(person.aliases)].filter(name => name !== person.name);
  person.legacyIds = [...new Set(person.legacyIds)].filter(id => id !== person.id);
  person.folder = person.id.slice(5);
}
groups.get('char-marcus-vance').folder = 'marcus-vance-courier';
groups.get('char-marcus-vance').disambiguation = 'Diplomatic courier';
groups.get('char-marcus-vance-technician').disambiguation = 'Motorcycle technician';
groups.get('char-elena-rostova').notes.push('Life status is scoped to each case or registry profile. Case P-401 records death; earlier agency/civic records are retained as source-specific records, not a global alive/dead flag.');
groups.get('char-miracle-jerome').notes.push('Medical and agency appointments are retained as separate professional profiles of the same character.');
groups.get('char-kieran-vesper').notes.push('Senior Archivist K. Vesper is the abbreviated professional form of Kieran Vesper.');
const caches = new Map();
const key = node => node?.name ?? node?.value;
function literal(n) {
  if (!n) throw new Error('Missing literal');
  if (['StringLiteral', 'NumericLiteral', 'BooleanLiteral'].includes(n.type)) return n.value;
  if (n.type === 'NullLiteral') return null;
  if (n.type === 'Identifier' && n.name === 'undefined') return { $characterUndefined: true };
  if (['TSAsExpression','TSSatisfiesExpression'].includes(n.type)) return literal(n.expression);
  if (n.type === 'UnaryExpression' && n.operator === '-') return -literal(n.argument);
  if (n.type === 'ArrayExpression') return n.elements.map(literal);
  if (n.type === 'ObjectExpression') return Object.fromEntries(n.properties.map(p => {
    if (p.type !== 'ObjectProperty' || p.computed) throw new Error(`Nonliteral property at ${p.loc.start.line}`);
    return [key(p.key), literal(p.value)];
  }));
  throw new Error(`Unsupported ${n.type} at ${n.loc?.start.line}`);
}
function source(file) {
  if (!caches.has(file)) {
    const text = readFileSync(file, 'utf8');
    caches.set(file, { text, ast: file.endsWith('.json') ? parseExpression(text) : parse(text, { sourceType: 'module', plugins: ['typescript','jsx'] }), changes: [], collections: new Set() });
  }
  return caches.get(file);
}
function nodes(ast, pred) {
  const result = [];
  function visit(n) { if (!n?.type) return; if (pred(n)) result.push(n); for (const value of Object.values(n)) if (Array.isArray(value)) value.forEach(visit); else if (value?.type) visit(value); }
  visit(ast); return result;
}
const category = collection => ({ NPCS: 'world', PEOPLE: 'social', AUREMAIL_DIRECTORY: 'mail', defaultInputs: 'registry', personas: 'dialogue', 'phone-contact': 'phone', 'story-bible': 'story', INSTITUTIONAL_REGISTRY: 'workplace', seedPeople: 'agency', seedNPCs: 'agency', primarySeedAgent: 'agency', seedRelationships: 'relationships' }[collection] || 'investigations');
const records = [], baseline = [];
for (const reference of inventory.records) {
  const cached = source(reference.source);
  let node;
  if (reference.collection === 'phone-contact') node = nodes(cached.ast, n => n.type === 'ObjectProperty' && n.loc.start.line === reference.line && key(n.key) === reference.key)[0]?.value;
  else node = nodes(cached.ast, n => n.type === 'ObjectExpression' && n.loc.start.line === reference.line)[0];
  if (!node) throw new Error(`Cannot locate ${reference.collection}/${reference.key}`);
  const original = literal(node);
  const binding = links.find(link => link.collection === reference.collection && link.key === reference.key);
  const character = groups.get(primary(binding.characterId));
  const data = structuredClone(original);
  if (reference.collection === 'defaultInputs') character.maid = data.fixedMaid;
  records.push({ character, reference, node, data, original });
  baseline.push({ collection: reference.collection, key: reference.key, characterId: binding.characterId, sha256: createHash('sha256').update(JSON.stringify(original)).digest('hex'), originalSource: `${reference.source}:${reference.line}` });
}
for (const record of records) {
  const { character, reference, data } = record;
  if (!Array.isArray(data)) {
    if (data.name && data.name !== character.name) { data.legacyName = data.name; data.name = character.name; }
    if (reference.collection === 'AUREMAIL_DIRECTORY' && character.maid) {
      if (data.maid && data.maid !== character.maid) { character.legacyMaids.push(data.maid); data.legacyMaid = data.maid; }
      data.maid = character.maid;
    }
    if (reference.key === 'dir-elara-vale' || reference.key === 'dir-miracle-jerome') { data.legacyNpcKey = data.npcKey; delete data.npcKey; }
    if (reference.collection === 'PATIENT_CARE_ASSIGNMENTS' && reference.key === 'pc-mercer') { data.legacyPatientMaid = data.patientMaid; data.patientMaid = ''; }
    if (data.systemContext) for (const alias of character.aliases) if (alias.length > 8) data.systemContext = data.systemContext.replaceAll(alias, character.name);
  }
}
// Retain authored relationship edges with their owning character.
const relationshipFile = 'frontend/src/dgaos/data/seed/relationships.ts';
const relationshipSource = source(relationshipFile);
const relationshipInit = nodes(relationshipSource.ast, n => n.type === 'VariableDeclarator' && n.id.name === 'seedRelationships')[0].init;
for (const node of relationshipInit.elements) {
  const original = literal(node);
  const binding = links.find(link => link.collection === (original.sourceId === 'DGA-SA-8804' ? 'primarySeedAgent' : 'seedPeople') && link.key === original.sourceId);
  if (!binding) throw new Error(`Unowned relationship ${original.id}`);
  const character = groups.get(primary(binding.characterId));
  const reference = { source: relationshipFile, collection: 'seedRelationships', key: original.id, line: node.loc.start.line, name: character.name };
  records.push({ character, reference, node, data: original, original });
  baseline.push({ collection: reference.collection, key: reference.key, characterId: binding.characterId, sha256: createHash('sha256').update(JSON.stringify(original)).digest('hex'), originalSource: `${reference.source}:${reference.line}` });
}
const profileFiles = new Map();
for (const { character, reference, data, original, node } of records) {
  const file = `people/${character.folder}/${category(reference.collection)}.json`;
  if (!profileFiles.has(file)) profileFiles.set(file, []);
  profileFiles.get(file).push({ collection: reference.collection, key: reference.key, origin: `${reference.source}:${reference.line}`, context: reference.collection, data, original });
  character.references.push({ collection: reference.collection, key: reference.key, file });
  if (!reference.source.endsWith('.json')) {
    const cached = source(reference.source);
    const alias = reference.collection.replaceAll('-', '_') + 'Profile';
    cached.collections.add(reference.collection);
    cached.changes.push({ start: node.start, end: node.end, text: `${alias}(${JSON.stringify(reference.key)})` });
  }
}
// Metadata stays public; restricted records are imported only by their owning domain.
for (const person of groups.values()) {
  person.legacyMaids = [...new Set(person.legacyMaids)];
  if (person.id === 'char-s-mercer') person.notes.push('No issued MAID is recorded. The previous care assignment incorrectly borrowed Elara Vale’s identifier and is retained only in source history.');
  save(`${dir}/people/${person.folder}/character.json`, person);
  const filenames = [...new Set(person.references.map(ref => path.basename(ref.file)))];
  writeFileSync(`${dir}/people/${person.folder}/README.md`, `# ${person.name}\n\nShared identity: \`${person.id}\`.${person.disambiguation ? ` ${person.disambiguation}.` : ''}\n\n${person.aliases.length ? `Also recorded as: ${person.aliases.join('; ')}.\n\n` : ''}${filenames.map(file => `- [${file}](${file})`).join('\n')}\n\nEdit character.json for identity and the relevant profile file for authored details. Original source records are retained for compatibility and provenance. Case statuses and knowledge remain scoped to their source context; these files do not change player progress.\n`);
}
for (const [file, data] of profileFiles) save(`${dir}/${file}`, data);
save('docs/data/character-migration-baseline.json', { oldIdentities: oldPeople.map(({ id, name }) => ({ id, name })), records: baseline });
save(`${dir}/id-aliases.json`, redirects);
save(`${dir}/manifest.json`, { version: 2, characters: [...groups.values()].map(person => ({ id: person.id, name: person.name, folder: person.folder, files: [...new Set(person.references.map(ref => ref.file))] })), order: records.map(record => ({ collection: record.reference.collection, key: record.reference.key })) });
// Rewrite domain imports to load the person-owned records, preserving legacy IDs.
for (const [file, cached] of caches) {
  if (!cached.changes.length) continue;
  let text = cached.text;
  for (const change of cached.changes.sort((a,b) => b.start - a.start)) text = text.slice(0, change.start) + change.text + text.slice(change.end);
  const imports = [...cached.collections].map(collection => {
    let relative = path.relative(path.dirname(file), `${dir}/collections/${collection}`).replaceAll('\\', '/');
    if (!relative.startsWith('.')) relative = './' + relative;
    return `import { getProfile as ${collection.replaceAll('-', '_')}Profile } from '${relative}';`;
  });
  writeFileSync(file, imports.join('\n') + '\n' + text);
}
for (const [file, collection, oldImport, oldExpression] of [
  ['frontend/src/db/miraverseDb.ts','NPCS', "import worldNpcData from '../game-content/characters/worldNpcs.json' with { type: 'json' };", "attachCharacterIds('NPCS', worldNpcData)"],
  ['frontend/src/apps/social/socialModel.ts','PEOPLE', "import socialProfileData from '../../game-content/characters/socialProfiles.json' with { type: 'json' };", "attachCharacterIds('PEOPLE', socialProfileData)"],
]) {
  let relative = path.relative(path.dirname(file), `${dir}/collections/${collection}`).replaceAll('\\','/');
  if (!relative.startsWith('.')) relative = './' + relative;
  let text = readFileSync(file,'utf8').replace(oldImport, `import { getProfiles } from '${relative}';`).replace(/^import \{ attachCharacterIds \}[^\n]*\n/m,'').replace(oldExpression,'getProfiles()');
  writeFileSync(file,text);
}
const resolutions = {
  'aelita-name': 'Merged under Aelita Hopper from the Game Doc. Schaeffer remains a name alias and its former shared ID redirects to Hopper.',
  'odd-spelling': 'Merged under the Game Doc spelling Odd Della Robia. Robbia remains a spelling alias; profile and phone IDs are unchanged.',
  'sissi-name': 'Merged under Sissi Delmas. Elisabeth Delmas remains an alias, preserving the established Sissi dialogue and social keys.',
  'riven-name': 'Merged under Riven Kalbera from the Game Doc; Asterwind is retained as an alias.',
  'vesper-identity': 'Merged under Kieran Vesper. K. Vesper is the abbreviated professional name; the world NPC ID remains npc-vesper.',
  'miracle-agent': 'Merged under Dr. Miracle Jerome with separate medical and agency professional profiles. Both role histories and the agency badge remain intact.',
  'elena-roles': 'Consolidated under Elena Rostova with separate agency, civic and case-context profiles; professional and investigative details are preserved.',
  'elara-maid': 'Mail now references the existing issued seed MAID-OR-00481926. The old mail MAID is source history only; the unrelated Rowan NPC key is removed. Archivist Rowan remains a separate character.',
  'miracle-maid': 'Mail now references MAID-OR-00481927. The previous mail MAID and borrowed ilyra key remain provenance only. Medical reply routing uses the actual contact ID.',
  'julian-maid': 'Mail now references MAID-OR-00481928; its previous MAID is retained in source history, not used as an automatic identity alias.',
  'faculty-coverage': 'Resolved as distinct characters with separate folders: Headmistress Vael, scholar Vaelen and Dean Cassian Rook. No faculty member was removed.',
  'kaelen-identity': 'Resolved as distinct characters: broker Kaelen, supervisor Kaelen Vance and investigative subject Kaelen Voss. Each retains a separate folder and ID.',
  'elena-case-identity': 'Merged identity, scoped records: active agency/civic records and the deceased P-401 case profile remain separate contexts. No global life status is inferred and no case outcome is overwritten.',
  'marcus-vance-identity': 'Resolved as distinct people: Marcus Vance the diplomatic courier and Marcus Vance the motorcycle technician. Separate role-labelled folders preserve both.',
};
const conflicts = read('docs/data/character-conflicts.json').map(issue => ({ ...issue, status: 'resolved', characterIds: [...new Set(issue.characterIds.map(primary))], resolution: resolutions[issue.id] }));
conflicts.push({ id:'student-mercer-maid',status:'resolved',characterIds:['char-s-mercer','char-elara-vale'],description:'Student S. Mercer’s care assignment incorrectly reused Elara Vale’s MAID.',resolution:'Removed the wrong association. Student S. Mercer is retained with no issued MAID; Elara’s existing registry identity is untouched. The original value remains provenance only.' });
save('docs/data/character-conflicts.json',conflicts);
console.log(`Consolidated ${oldPeople.length} identity records into ${groups.size} character folders; preserved ${records.length} complete source records.`);
