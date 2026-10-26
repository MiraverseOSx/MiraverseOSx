// Inventory person-owned authored content without executing gameplay or modifying saves.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const base = 'frontend/src/game-content/characters/';
const read = file => JSON.parse(readFileSync(path.join(root,file),'utf8'));
const manifest = read(base+'manifest.json');
const conflicts = read('docs/data/character-conflicts.json');
const bible = read('docs/data/story-bible-characters.json');
const identities = read(base+'people.json');
const links = read(base+'legacy-links.json');
const openIssues = conflicts.filter(issue => issue.status !== 'resolved');
const records = [];
const directories = [];
for (const item of manifest.characters) {
  const person = read(base+`people/${item.folder}/character.json`);
  directories.push(person);
  for (const ref of person.references) {
    const profile = read(base+ref.file).find(entry => entry.collection === ref.collection && entry.key === ref.key);
    if (!profile) throw new Error(`Missing person-owned record ${ref.collection}/${ref.key}`);
    const value = profile.data;
    records.push({ source:base+ref.file, collection:ref.collection, key:ref.key, characterId:person.id, name:person.name,
      role:value.role || value.title || value.occupation || '', institution:value.affiliation || value.organization || value.institution || value.department || '',
      maid:value.fixedMaid || value.maid || value.patientMaid || null, aliases:person.aliases, originalSource:profile.origin });
  }
}
const sources = [...new Set(records.map(record=>record.collection))];
const cell = value => String(value).replaceAll('|','\\|').replaceAll('\n',' ');
const outputs = new Map();
outputs.set('docs/data/character-sources.json',JSON.stringify({version:2,scope:sources,records},null,2)+'\n');
const report = [
  '# Character directory and resolved conflicts','',
  `${directories.length} named character folders own ${records.length} complete records across ${sources.length} collections. ${conflicts.length} documented conflicts are resolved; ${openIssues.length} remain open. No character was deleted: previous shared IDs resolve through explicit redirects, and each extracted source record is retained in full alongside its corrected version.`, '',
  '## Where to edit a character','',
  'Open the character’s folder under frontend/src/game-content/characters/people. character.json owns identity, aliases, legacy IDs and references. Other files hold social, mail, dialogue, phone, registry, workplace, agency, relationship, story or investigation records. Only relevant files are created.', '',
  'For example, aelita-hopper contains character.json, social.json, mail.json, dialogue.json, phone.json and story.json. dr-miracle-jerome is stored under miracle-jerome with agency, mail, registry and relationship records. The README in each folder lists its files.', '',
  '## Merge policy','',
  'Game Doc names take precedence for Aelita Hopper, Odd Della Robia, Sissi Delmas and Riven Kalbera. Previous names remain aliases. K. Vesper is consolidated with Kieran Vesper. Miracle Jerome’s agency and medical appointments belong to one character. Elena Rostova’s case and registry facts belong to one identity but retain explicit source contexts; no global alive/dead state is inferred.', '',
  'Headmistress Vael, scholar Vaelen and Dean Cassian Rook remain distinct. Broker Kaelen, supervisor Kaelen Vance and subject Kaelen Voss remain distinct. The two Marcus Vance records remain distinct people in role-labelled folders. Archivist Rowan remains separate from Elara Vale.', '',
  'The three conflicting mail MAIDs now use their existing registry-seed IDs. Previous wrong values are retained as source history only, not as alternate issued credentials. Student S. Mercer has no issued MAID recorded rather than borrowing Elara Vale’s. Existing player-owned saved IDs and mailboxes are not reassigned.', '',
  '## Resolution register','',
  ...conflicts.map(issue=>`- **${issue.id} — ${issue.status}:** ${issue.resolution || issue.description}`),'',
  '## Named folders','',
  '| Character | Shared ID | Folder | Records |','| --- | --- | --- | --- |',
  ...directories.map(person=>`| ${cell(person.name)}${person.disambiguation ? ` (${person.disambiguation})` : ''} | ${person.id} | [${person.folder}](../../${base}people/${person.folder}/README.md) | ${person.references.length} |`),'',
  '## Source index','',
  '| Character | Collection | Existing key | Person-owned file |','| --- | --- | --- | --- |',
  ...records.map(record=>`| ${cell(record.name)} | ${record.collection} | ${cell(record.key)} | ${record.source} |`),'',
  '## Provenance and access','',
  `The user-supplied ${bible.document} is identified by SHA-256 ${bible.sha256}. Its named-figure references remain in story-bible-characters.json. No document-only character is automatically inserted into gameplay.`, '',
  'Each profile entry contains corrected data plus its complete original source record and origin. Case knowledge, secrets, patient histories and answers are imported through their owning collections only; the shared identity lookup does not load those records or grant access.', '',
  'The migrated scope is the previous structured inventory plus authored agency relationships. Prose-only names and incidental clinician signatures outside those sources are not claimed to have been exhaustively resolved. Shared cases, locations, organizations and story logic remain in their owning modules.', '',
  'Run node scripts/build_character_content.mjs after changing identity metadata or adding references. Run node scripts/audit_characters.mjs to rebuild this directory. Both scripts support --check. Run node --test frontend/tests/character-registry.test.mjs for identity and preservation checks.','',
].join('\n');
outputs.set('docs/data/CHARACTER_INVENTORY.md',report);
for(const [file,content] of outputs) {
  const target=path.join(root,file);
  if(process.argv.includes('--check')) { if(readFileSync(target,'utf8')!==content) throw new Error(`Stale character report: ${file}`); }
  else {mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,content);}
}
if(records.length!==manifest.order.length||records.length!==links.length) throw new Error('Character record count mismatch');
for(const record of records) if(!links.some(link=>link.collection===record.collection&&link.key===record.key&&link.characterId===record.characterId)) throw new Error('Character link mismatch');
if(identities.length!==directories.length) throw new Error('Identity index is stale');
console.log(`Inventoried ${directories.length} named folders and ${records.length} records. ${openIssues.length} unresolved conflicts.`);
