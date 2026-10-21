import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { generateSearchBundle, normalizeSearch, searchKey, restoreVersenetContent, webFilesFor, findWebRecord, matchingExternalLinks, EXTERNAL_SEARCH_LINKS, canSearchArchive } = await import('../src/apps/Browser/searchCatalog.ts');
const { resolveBrowserInput } = await import('../src/apps/Browser/browserModel.ts');
let sequence = 0;
function storage() { const values = new Map(); globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; return values; }
async function fresh() { return (await import(`../src/store/useOSStore.ts?web=${sequence++}`)).useOSStore; }

test('all topic packs and unfamiliar searches provide sites, images, files, folders and maps', () => {
  for (const query of ['dog','cat','animals','plants','food','housing','travel','technology','education','health','work','history','unfamiliar quux','!!!','日本語','🪐','<script>alert(1)</script>', 'a'.repeat(10000)]) {
    const bundle = generateSearchBundle(query);
    for (const type of ['site','image','folder','document','map']) assert.ok(bundle.records.some(record => record.type === type), `${query.slice(0,30)} / ${type}`);
    for (const record of bundle.records) assert.equal(resolveBrowserInput(record.url), record.url, 'addresses remain stable after browser normalization');
  }
  assert.equal(generateSearchBundle('  '), null);
  assert.equal(normalizeSearch(' ＤＯＧ  '), 'dog');
});
test('dog aliases share stable addresses and authored content with both photography and illustration', () => {
  assert.deepEqual(generateSearchBundle('dog'), generateSearchBundle('DOGS'));
  assert.equal(searchKey('puppy'), 'dog');
  const bundle = generateSearchBundle('dog');
  assert.ok(bundle.records.some(item => item.photo?.endsWith('labrador.jpg')));
  assert.ok(bundle.records.some(item => item.type === 'image' && !item.photo && item.art === 'dog'));
  for (const item of bundle.records.filter(item => item.photo)) {
    assert.ok(existsSync(new URL(`../public${item.photo}`, import.meta.url)));
    assert.match(item.credit, /Public domain/); assert.match(item.source, /^https:\/\/commons.wikimedia.org/);
  }
});
test('unknown queries create repeatable and varied research records rather than invented literal photographs', () => {
  const first = generateSearchBundle('quux unknown'); const next = generateSearchBundle('other obscure phrase');
  assert.deepEqual(first, generateSearchBundle('quux unknown'));
  assert.notEqual(first.key, next.key); assert.equal(first.topic, 'research');
  assert.ok(first.records.filter(item => item.type === 'image').every(item => !item.photo && item.art === 'research'));
  assert.match(first.records[0].paragraphs.join(' '), /not a claim/);
  assert.notEqual(first.records[1].paragraphs.join(' '), next.records[1].paragraphs.join(' '));
});
test('folder children and all map listings resolve to real records', () => {
  const bundle = generateSearchBundle('dog'); const content = { catalog: { dog: bundle }, savedFiles: {} };
  const folder = bundle.records.find(item => item.type === 'folder');
  assert.equal(folder.children.length, 2);
  assert.ok(folder.children.every(id => bundle.records.some(item => item.id === id && item.type === 'document')));
  for (const place of bundle.records.find(item => item.type === 'map').places) assert.ok(findWebRecord(content, place.url));
  const files = webFilesFor(content, folder.id);
  assert.equal(files.length, 3); assert.equal(files[0].type, 'folder');
  assert.ok(files.every(file => file.dir.startsWith('/downloads/versenet') && file.webUrl && !file.assignmentId && !file.mockKey));
});
test('searching and saving do not modify gameplay or assignment receipts and duplicate downloads are prevented', async () => {
  storage(); const store = await fresh(); store.getState().loginUser({ name: 'Search Tester', credits: 500 });
  const before = JSON.stringify(store.getState().gameplay);
  const bundle = store.getState().rememberVersenetSearch('dog');
  const folder = bundle.records.find(item => item.type === 'folder');
  assert.equal(store.getState().saveVersenetRecord(folder.id).ok, true);
  assert.equal(store.getState().saveVersenetRecord(folder.id).ok, true);
  assert.equal(Object.keys(store.getState().versenetContent.savedFiles).length, 3);
  assert.equal(store.getState().saveVersenetRecord('dog:map').ok, false);
  assert.equal(store.getState().saveVersenetRecord('__proto__').ok, false);
  assert.equal(JSON.stringify(store.getState().gameplay), before);
});
test('download a document then the entire folder without duplicated files or missing siblings', async () => {
  storage(); const store = await fresh(); const bundle = store.getState().rememberVersenetSearch('plants');
  store.getState().saveVersenetRecord(bundle.records.find(item => item.type === 'document').id);
  assert.equal(Object.keys(store.getState().versenetContent.savedFiles).length, 2);
  store.getState().saveVersenetRecord(bundle.records.find(item => item.type === 'folder').id);
  assert.equal(Object.keys(store.getState().versenetContent.savedFiles).length, 3);
  assert.deepEqual((await fresh()).getState().versenetContent.savedFiles, store.getState().versenetContent.savedFiles);
});
test('saved content, versions, bookmarks and downloads survive reload without regenerated text', async () => {
  storage(); const store = await fresh(); const bundle = store.getState().rememberVersenetSearch('dog');
  store.setState(s => ({ versenetContent: { ...s.versenetContent, catalog: { dog: { ...bundle, version: 0, records: bundle.records.map((record,index) => index ? record : { ...record, paragraphs: ['Original saved edition.'] }) } } } }));
  store.getState().navigateBrowserTab(bundle.records[0].url, bundle.records[0].title); store.getState().toggleBrowserBookmark();
  store.getState().saveVersenetRecord('dog:collection');
  const restored = await fresh(); const again = restored.getState().rememberVersenetSearch('puppy');
  assert.equal(again.version, 0); assert.deepEqual(again.records[0].paragraphs, ['Original saved edition.']);
  assert.equal(restored.getState().browserState.bookmarks[0].url, bundle.records[0].url);
  assert.equal(Object.keys(restored.getState().versenetContent.savedFiles).length, 3);
});
test('old saves gain empty content and malformed or assignment-like downloads cannot enter the web library', () => {
  assert.deepEqual(restoreVersenetContent(undefined), { catalog: {}, savedFiles: {} });
  const bundle = generateSearchBundle('dog'); const content = restoreVersenetContent({ catalog: { dog: bundle, bad: {} }, savedFiles: { forged: { id: 'assignment:ms-shift-04' }, copied: { id: 'web:dog:notebook', assignmentId: 'ms-shift-04', mockKey: 'net-relay' } } });
  assert.equal(Object.keys(content.catalog).length, 1);
  assert.equal(Object.keys(content.savedFiles).length, 1);
  assert.equal(content.savedFiles['web:dog:notebook'].assignmentId, undefined);
  assert.equal(content.savedFiles['web:dog:notebook'].mockKey, undefined);
});
test('public search gates sealed records, private audits and undiscovered investigation details', () => {
  assert.equal(canSearchArchive('ARC-004', {}), true);
  for (const id of ['ARC-001','ARC-002','ARC-003','ARC-005','ARC-006']) assert.equal(canSearchArchive(id, { isAdmin: true }), false);
  assert.equal(canSearchArchive('ARC-001', { worldJournal: { entries: { 'old-factory-lead': {} } } }), true);
});
test('external registry starts empty and only explicit matching http(s) links are eligible', () => {
  assert.deepEqual(EXTERNAL_SEARCH_LINKS, []);
  const links = [{ id:'one', title:'Dogs', url:'https://example.org/dogs', keywords:['dog'], description:'Chosen link' },{ id:'bad',title:'Bad', url:'javascript:alert(1)', keywords:['dog'], description:'' }];
  assert.equal(matchingExternalLinks('DOG', links).length, 1);
  assert.equal(matchingExternalLinks('plants', links).length, 0);
});

test('long queries retain distinct readable download filenames with document extensions', () => {
  const bundle = generateSearchBundle('very long unfamiliar phrase '.repeat(40));
  const content = { catalog: { [bundle.key]: bundle }, savedFiles: {} };
  const files = webFilesFor(content, bundle.records.find(record => record.type === 'folder').id);
  const documents = files.filter(file => file.type === 'txt');
  assert.equal(new Set(documents.map(file => file.name)).size, 2);
  assert.ok(documents.every(file => file.name.endsWith('.txt') && file.name.length < 120));
});

test('malformed saved map and image metadata are rejected before rendering', () => {
  for (const mutation of [{ places: 'broken' }, { places: [{name:'Bad',x:NaN,y:1}] }, { credit: {} }, { photo:'https://example.org/tracker.png' }]) {
    const bundle = generateSearchBundle('dog');
    bundle.records[0] = { ...bundle.records[0], ...mutation };
    assert.deepEqual(restoreVersenetContent({ catalog: { dog: bundle } }).catalog, {});
  }
});

test('incomplete saved collections cannot crash download recovery or leave broken links', () => {
  for (const damage of [
    bundle => { bundle.records = bundle.records.filter(record => record.type !== 'folder'); },
    bundle => { bundle.records = bundle.records.filter(record => record.id !== 'dog:notebook'); },
    bundle => { bundle.records.push({ ...bundle.records[0] }); },
    bundle => { bundle.records.find(record => record.type === 'map').places[0].url = 'https://fieldnotes.aure/dog/missing'; },
  ]) {
    const bundle = generateSearchBundle('dog');
    damage(bundle);
    const restored = restoreVersenetContent({ catalog: { dog: bundle }, savedFiles: { notebook: { id: 'web:dog:notebook' } } });
    assert.deepEqual(restored, { catalog: {}, savedFiles: {} });
  }
  const bundle = generateSearchBundle('dog');
  bundle.records = bundle.records.filter(record => record.type !== 'folder');
  assert.deepEqual(webFilesFor({ catalog: { dog: bundle }, savedFiles: {} }, 'dog:notebook'), []);
});
