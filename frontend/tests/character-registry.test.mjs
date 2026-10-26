import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';
import { CHARACTER_IDENTITIES, CHARACTER_LINKS, getCharacterById, resolveCharacterReference, findCharactersByName } from '../src/game-content/characters/registry.ts';
registerHooks({ resolve(specifier,context,next) { try {return next(specifier,context);} catch(error) {if(error.code!=='ERR_MODULE_NOT_FOUND'||!specifier.startsWith('.')) throw error; return next(`${specifier}.ts`,context);} } });
const read = name => JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8'));
const manifest=read('../src/game-content/characters/manifest.json');
const baseline=read('../../docs/data/character-migration-baseline.json');
const allRecords=manifest.characters.flatMap(person=>person.files.flatMap(file=>read(`../src/game-content/characters/${file}`)));
const uniqueRecords=[...new Map(allRecords.map(record=>[JSON.stringify([record.collection,record.key]),record])).values()];

test('every old character ID survives and every complete source record is preserved',()=>{
  assert.equal(CHARACTER_IDENTITIES.length,76);
  for(const old of baseline.oldIdentities) assert.ok(getCharacterById(old.id),`${old.id} was lost`);
  assert.equal(uniqueRecords.length,baseline.records.length);
  for(const old of baseline.records) {
    const record=uniqueRecords.find(record=>record.collection===old.collection&&record.key===old.key);
    assert.ok(record,`${old.collection}/${old.key} was lost`);
    assert.equal(createHash('sha256').update(JSON.stringify(record.original)).digest('hex'),old.sha256);
    assert.ok(resolveCharacterReference(old.collection,old.key));
    const omit=(value)=>Array.isArray(value)?value:Object.fromEntries(Object.entries(value).filter(([key])=>!['name','legacyName','maid','legacyMaid','npcKey','legacyNpcKey','patientMaid','legacyPatientMaid','systemContext'].includes(key)));
    assert.deepEqual(omit(record.data),omit(record.original),`Non-identity content changed in ${old.collection}/${old.key}`);
  }
});

test('name variants merge under document names without merging distinct characters',()=>{
  for(const [oldId,id,name] of [
    ['char-aelita-schaeffer','char-aelita-hopper','Aelita Hopper'],
    ['char-odd-della-robbia','char-odd-della-robia','Odd Della Robia'],
    ['char-elisabeth-delmas','char-sissi-delmas','Sissi Delmas'],
    ['char-riven-asterwind','char-riven-kalbera','Riven Kalbera'],
    ['char-k-vesper','char-kieran-vesper','Kieran Vesper'],
    ['char-miracle-jerome-agent','char-miracle-jerome','Dr. Miracle Jerome'],
    ['char-elena-rostova-crash','char-elena-rostova','Elena Rostova'],
  ]) {assert.equal(getCharacterById(oldId),getCharacterById(id));assert.equal(getCharacterById(id).name,name);}
  assert.equal(findCharactersByName('Aelita Schaeffer')[0].id,'char-aelita-hopper');
  assert.equal(resolveCharacterReference('PEOPLE','aelita').id,resolveCharacterReference('story-bible','Aelita Hopper').id);
  assert.notEqual(resolveCharacterReference('PEOPLE','rowan').id,resolveCharacterReference('AUREMAIL_DIRECTORY','dir-elara-vale').id);
  assert.notEqual(resolveCharacterReference('seedPeople','P-104').id,resolveCharacterReference('INV_26_402_STARTING_PAYLOAD','P-402').id);
  assert.notEqual(getCharacterById('char-vael'),getCharacterById('char-vaelen'));
  assert.notEqual(getCharacterById('char-kaelen'),getCharacterById('char-kaelen-vance'));
  for(const key of ['constructor','__proto__','toString','Vance']) assert.equal(resolveCharacterReference('PEOPLE',key),undefined);
});

test('all app projections read person-owned profiles and keep stable app IDs',async()=>{
  const {getProfiles:worlds}=await import('../src/game-content/characters/collections/NPCS.ts');
  const {getProfiles:social}=await import('../src/game-content/characters/collections/PEOPLE.ts');
  assert.equal(worlds().length,9);assert.equal(social().length,8);
  assert.equal(worlds().find(person=>person.id==='npc-vesper').name,'Kieran Vesper');
  assert.equal(social().find(person=>person.id==='aelita').name,'Aelita Hopper');
  assert.equal(social().find(person=>person.id==='aelita').characterId,'char-aelita-hopper');
  const first=social();first[0].name='View mutation';assert.notEqual(social()[0].name,'View mutation');
  assert.equal(new Set(CHARACTER_LINKS.map(link=>JSON.stringify([link.collection,link.key]))).size,CHARACTER_LINKS.length);
  assert.ok(CHARACTER_IDENTITIES.every(person=>!Object.hasOwn(person,'secrets')&&!Object.hasOwn(person,'knowledge')&&!Object.hasOwn(person,'maid')));
});

test('mail uses existing registry identities and wrong patient and NPC associations are removed',async()=>{
  const {getProfile:mail}=await import('../src/game-content/characters/collections/AUREMAIL_DIRECTORY.ts');
  const {getProfile:registry}=await import('../src/game-content/characters/collections/defaultInputs.ts');
  for(const [key,maid] of [['dir-elara-vale','MAID-OR-00481926'],['dir-miracle-jerome','MAID-OR-00481927'],['dir-julian-vance','MAID-OR-00481928']]) assert.equal(mail(key).maid,registry(maid).fixedMaid);
  assert.equal(mail('dir-elara-vale').npcKey,undefined);assert.equal(mail('dir-miracle-jerome').npcKey,undefined);
  const {getProfile:care}=await import('../src/game-content/characters/collections/PATIENT_CARE_ASSIGNMENTS.ts');
  assert.equal(care('pc-mercer').patientMaid,'');assert.equal(care('pc-vale').patientMaid,'MAID-OR-00481926');
  assert.equal(getCharacterById('char-vael').status,'document-only');
  assert.ok(read('../../docs/data/character-conflicts.json').every(issue=>issue.status==='resolved'&&issue.resolution));
});

test('case contexts, clinical fields, dialogue keys and immutable identities survive consolidation',async()=>{
  const {getProfile:casePerson}=await import('../src/game-content/characters/collections/INV_26_402_STARTING_PAYLOAD.ts');
  const {getProfile:agencyPerson}=await import('../src/game-content/characters/collections/seedPeople.ts');
  assert.equal(casePerson('P-401').characterId,agencyPerson('P-105').characterId);
  assert.match(casePerson('P-401').status,/Deceased/);assert.equal(agencyPerson('P-105').status,'Active');
  const {getProfile:chart}=await import('../src/game-content/characters/collections/INITIAL_MEDICAL_CHART.ts');
  assert.equal(chart('PAT-88194').linkedInvestigationCaseId,undefined);
  assert.ok(Object.hasOwn(chart('PAT-88194'),'linkedInvestigationCaseId'));
  const {getProfile:persona}=await import('../src/game-content/characters/collections/personas.ts');
  assert.match(persona('Aelita').systemContext,/Aelita Hopper/);assert.doesNotMatch(persona('Aelita').systemContext,/Schaeffer/);
  const { npcEngine }=await import('../src/gameplay/NPCEngine.ts');
  assert.equal(npcEngine.getPersona('Aelita Hopper'),npcEngine.getPersona('Aelita'));
  assert.equal(npcEngine.getPersona('Aelita Schaeffer'),npcEngine.getPersona('Aelita'));
  assert.equal(npcEngine.getPersona('constructor'),undefined);
  assert.throws(()=>{getCharacterById('char-aelita-hopper').aliases.push('overwrite');},TypeError);
});
