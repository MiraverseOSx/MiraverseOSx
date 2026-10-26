import { readFileSync, writeFileSync } from 'node:fs';
const dir = 'frontend/src/game-content/characters/';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const save = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const people = read(dir + 'people.json'), links = read(dir + 'legacy-links.json');
const records = read('docs/data/character-sources.json').records;
const decisions = {
  'P-101': 'christian-vance', 'P-102': 'gregory-thorne', 'P-103': 'viktor-krell',
  'P-401': 'elena-rostova-crash', 'P-402': 'marcus-vance-technician', 'P-403': 'dominic-sterling',
  'P-404': 'unidentified-driver-p404', 'P-405': 'travis-miller',
  'PAT-88194': 'christian-vance', 'PAT-94102': 'tyler-ross', 'PAT-95881': 'unidentified-patient-pat95881',
  'CASE-FM-401': 'elara-vale', 'CASE-DGA-402': 'kaelen-voss', 'pc-mercer': 's-mercer', 'pc-vale': 'elara-vale',
};
for (const record of records) {
  if (links.some(link => link.collection === record.collection && link.key === record.key)) continue;
  const suffix = decisions[record.key];
  if (!suffix) throw new Error(`Unreviewed reference ${record.collection}/${record.key}`);
  const id = 'char-' + suffix;
  let person = people.find(person => person.id === id);
  if (!person) { person = { id, name: record.name, kind: 'person', aliases: [], status: 'existing', notes: [] }; people.push(person); }
  links.push({ collection: record.collection, key: record.key, characterId: id });
}
for (const id of ['char-yumi-ishiyuma', 'char-ulrich-stern']) {
  const person = people.find(person => person.id === id);
  person.status = 'existing'; person.notes = ['Full name from the Game Doc; existing phone thread linked explicitly by the established first-name contact.'];
}
const conflicts = read('docs/data/character-conflicts.json');
conflicts.push(
  { id: 'elena-case-identity', status: 'needs-review', characterIds: ['char-elena-rostova', 'char-elena-rostova-crash'], description: 'Agency person P-105 is an active SCADA engineer. Case person P-401 is a deceased crash victim with a separate person ID. Kept separate despite the same full name; resolve timeline or identity before merging.' },
  { id: 'marcus-vance-identity', status: 'needs-review', characterIds: ['char-marcus-vance', 'char-marcus-vance-technician'], description: 'Courier P-104 and motorcycle technician P-402 use different person IDs and roles. They remain separate; a shared name does not establish identity.' },
);
const document = read('docs/data/story-bible-characters.json');
const lines = readFileSync('output/character-audit/game-doc.txt', 'utf8').split(/\r?\n/);
for (const record of document.records) {
  const index = lines.findIndex((line, index) => index >= 299 && line.includes(record.name));
  if (index < 0) throw new Error(`Missing document evidence for ${record.name}`);
  record.line = index + 1;
}
save('docs/data/story-bible-characters.json', document);
save(dir + 'people.json', people); save(dir + 'legacy-links.json', links);
save('docs/data/character-conflicts.json', conflicts);
console.log(`${people.length} identities; ${links.length} links; ${conflicts.length} conflicts.`);
