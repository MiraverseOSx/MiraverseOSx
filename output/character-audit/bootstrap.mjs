import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { parse } = require('@babel/parser');
const out = 'frontend/src/game-content/characters/';
mkdirSync(out, { recursive: true });
const save = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
function literal(n) {
  if (n?.type === 'StringLiteral' || n?.type === 'NumericLiteral' || n?.type === 'BooleanLiteral') return n.value;
  if (n?.type === 'ArrayExpression') return n.elements.map(literal);
  if (n?.type === 'ObjectExpression') return Object.fromEntries(n.properties.filter(p => p.type === 'ObjectProperty').map(p => [p.key.name ?? p.key.value, literal(p.value)]));
}
for (const [file, variable, target] of [
  ['frontend/src/db/miraverseDb.ts', 'NPCS', 'worldNpcs.json'],
  ['frontend/src/apps/social/socialModel.ts', 'PEOPLE', 'socialProfiles.json'],
]) {
  const text = readFileSync(file, 'utf8');
  const ast = parse(text, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  const declaration = ast.program.body.find(n => n.type === 'ExportNamedDeclaration' && n.declaration?.declarations?.some(d => d.id.name === variable));
  const init = declaration.declaration.declarations[0].init;
  save(out + target, literal(init));
  writeFileSync(file, text.slice(0, declaration.start) + `export const ${variable} = attachCharacterIds('${variable}', ${variable === 'NPCS' ? 'worldNpcData' : 'socialProfileData'});` + text.slice(declaration.end));
}
const inventory = JSON.parse(readFileSync('docs/data/character-sources.json', 'utf8')).records;
const slug = name => name.toLowerCase().replace(/\([^)]*\)/g, '').replace(/^(dr\.|queen|high warden|chancellor|lord|grand dispatcher|high forge-master|seer|senior archivist|ambassador|courier|director|specialist|sergeant|dean|archivist)\s+/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const overrides = {
  'NPC-KRELL': 'viktor-krell', 'DGA-SA-8804': 'miracle-jerome-agent',
  'Jeremie': 'jeremie-belpois', 'Aelita': 'aelita-schaeffer', 'Sissi': 'elisabeth-delmas',
  'npc-vesper': 'k-vesper',
};
const groups = new Map();
const links = [];
for (const record of inventory) {
  const id = 'char-' + (overrides[record.key] || slug(record.name));
  if (!groups.has(id)) groups.set(id, { id, name: record.name, kind: id === 'char-mai' ? 'companion' : 'person', aliases: [], status: 'existing', notes: [] });
  const entry = groups.get(id);
  for (const name of [record.name, ...record.aliases]) if (name !== entry.name && !entry.aliases.includes(name)) entry.aliases.push(name);
  links.push({ collection: record.collection, key: record.key, characterId: id });
}
const docRows = [
  ['maeryn-seraphima', 'Queen Maeryn Seraphima', 'Founder of Meridion', 301],
  ['vael', 'Headmistress Vael', 'Cyacademy leadership', 308],
  ['idris', 'Professor Idris', 'Systems and Anomaly Studies', 316],
  ['rhen', 'Coach Rhen', 'Combat Arts', 319],
  ['lyse', 'Instructor Lyse', 'Social Dynamics and student council', 322],
  ['oryn', 'Professor Oryn', 'Systems Engineering', 325],
  ['aelita-hopper', 'Aelita Hopper', 'Cyacademy social circle', 331],
  ['jeremie-belpois', 'Jeremie Belpois', 'Research and technical problem-solving', 331],
  ['odd-della-robia', 'Odd Della Robia', 'Cyacademy social circle', 333],
  ['yumi-ishiyuma', 'Yumi Ishiyuma', 'Cyacademy social circle', 333],
  ['ulrich-stern', 'Ulrich Stern', 'Cyacademy social circle', 333],
  ['sissi-delmas', 'Sissi Delmas', 'Cyacademy social circle', 335],
  ['franz-hopper', 'Franz Hopper', 'Elder researcher', 335],
  ['echo-neket', 'Echo Neket', 'Hidden data routes', 337],
  ['solis-agni', 'Solis Agni', 'Faith Medical healer', 339],
  ['riven-kalbera', 'Riven Kalbera', 'Social circle', 341],
  ['lyric-enya', 'Lyric Enya', 'House Aurelith and The Velvet', 341],
];
const references = docRows.map(([slug, name, role, line]) => {
  const id = 'char-' + slug;
  if (!groups.has(id)) groups.set(id, { id, name, kind: 'person', aliases: [], status: 'document-only', notes: ['Not seeded into gameplay. Identity correspondence requires review before merging with a differently named existing character.'] });
  links.push({ collection: 'story-bible', key: name, characterId: id });
  return { key: name, name, role, line, characterId: id };
});
const doc = 'C:/Users/mirav/Downloads/Game Doc.docx';
save('docs/data/story-bible-characters.json', { document: 'Game Doc.docx (user attachment)', sha256: createHash('sha256').update(readFileSync(doc)).digest('hex'), section: 'XI. Figures, Relationships, and Hidden Histories', lineReference: 'Paragraph-per-line extraction; blank paragraphs retained', records: references });
// Keep short phone labels source-qualified; they are not global name aliases.
const phone = literal(parse(readFileSync('frontend/src/data/phoneData.ts', 'utf8'), { sourceType: 'module', plugins: ['typescript'] }).program.body.find(n => n.declaration?.declarations?.[0]?.id.name === 'INITIAL_SMS_THREADS').declaration.declarations[0].init);
const phoneIds = { Aelita: 'aelita-schaeffer', Jeremie: 'jeremie-belpois', 'Dr. Voss': 'sharon-voss', Odd: 'odd-della-robbia', Yumi: 'yumi-ishiyuma', Ulrich: 'ulrich-stern', Sissi: 'elisabeth-delmas', Nerya: 'nerya', 'Null Cantor': 'null-cantor' };
for (const key of Object.keys(phone)) {
  const id = 'char-' + phoneIds[key];
  if (!groups.has(id)) groups.set(id, { id, name: key, kind: 'person', aliases: [], status: 'existing', notes: ['Known from an existing phone thread; no surname or biography inferred.'] });
  links.push({ collection: 'phone-contact', key, characterId: id });
}
const conflicts = [
  ['aelita-name', ['char-aelita-schaeffer', 'char-aelita-hopper'], 'The Game Doc names Aelita Hopper; social, mail and dialogue sources use Aelita Schaeffer. Kept separate pending confirmation; existing screens retain Schaeffer.'],
  ['odd-spelling', ['char-odd-della-robbia', 'char-odd-della-robia'], 'The document spells the surname Robia; code uses Robbia. Do not infer a rename from spelling similarity.'],
  ['sissi-name', ['char-elisabeth-delmas', 'char-sissi-delmas'], 'The document names Sissi Delmas; social uses Elisabeth Delmas and dialogue identifies Sissi as Elisabeth. Document correspondence remains pending.'],
  ['riven-name', ['char-riven-asterwind', 'char-riven-kalbera'], 'The code uses Riven Asterwind; the document uses Riven Kalbera. No surname merge.'],
  ['vesper-identity', ['char-k-vesper', 'char-kieran-vesper'], 'World NPC K. Vesper and registry Kieran Vesper have similar roles; an initial is insufficient to establish identity.'],
  ['miracle-agent', ['char-miracle-jerome-agent', 'char-miracle-jerome'], 'The primary DGA agent and medical citizen share a name but different identifiers and roles. They remain separate.'],
  ['elena-roles', ['char-elena-rostova'], 'Elena Rostova occurs as an agency SCADA engineer and a registry citizen with a separate investigative profile. Name-linked for reference only; roles and saves remain source-owned.'],
  ['elara-maid', ['char-elara-vale'], 'Mail declares MAID-OR-00000001; registry seed declares MAID-OR-00481926. No MAID is reassigned. Mail npcKey rowan also conflicts with the independent Archivist Rowan social profile.'],
  ['miracle-maid', ['char-miracle-jerome'], 'Mail declares MAID-OR-00000002; registry seed declares MAID-OR-00481927. Mail npcKey ilyra is not a proven character alias.'],
  ['julian-maid', ['char-julian-paul-vance'], 'Mail declares MAID-OR-00000003; registry seed declares MAID-OR-00481928. Both existing records are preserved.'],
  ['faculty-coverage', ['char-vael', 'char-vaelen', 'char-cassian-rook'], 'The document Headmistress Vael, dialogue scholar Vaelen and code Dean Cassian Rook are separate entries. Similar names and institutional overlap do not prove identity.'],
  ['kaelen-identity', ['char-kaelen', 'char-kaelen-vance'], 'The shadow broker Kaelen and workplace supervisor Kaelen Vance remain separate. No surname is inferred from a short dialogue label.'],
];
save(out + 'people.json', [...groups.values()]);
save(out + 'legacy-links.json', links);
save('docs/data/character-conflicts.json', conflicts.map(([id, characterIds, description]) => ({ id, status: 'needs-review', characterIds, description })));
console.log(`${groups.size} shared character IDs; ${links.length} source-qualified links; ${conflicts.length} open conflicts.`);
