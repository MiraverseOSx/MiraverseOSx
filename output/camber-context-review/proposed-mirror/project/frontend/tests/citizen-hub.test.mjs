import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { resolvePersonalCitizen, personalIssuanceHistory } = await import('../src/integration/personalCitizen.ts');
const { MaidIdentityService } = await import('../src/services/maidIdentityService.ts');
const { getIssuedSnapshots, recordIssuedSnapshot } = await import('../src/services/documentPacketGenerator.ts');
const { restoreDesktopPreferences } = await import('../src/store/desktopPreferences.ts');
const people = [
  { id: 'person-one', maid: 'MAID-OR-00000001', legacyRecord: 'MRD-01', legacyAliases: ['OLD-01'], name: 'Same Name', isRestricted: false, home: 'Original residence' },
  { id: 'person-two', maid: 'MAID-OR-00000002', legacyRecord: 'MRD-02', legacyAliases: [], name: 'Same Name', isRestricted: false, home: 'Another residence' },
  { id: 'restricted', maid: 'MAID-OR-00000003', legacyAliases: [], isRestricted: true },
];
let sequence = 0;
function storage() {
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  } });
  return values;
}
async function fresh() { return (await import(`../src/store/useOSStore.ts?citizen-hub=${sequence++}`)).useOSStore; }
const issue = (id, citizenId, documentType = 'Aura Citizen ID') => ({ id, citizenId, citizenName: 'Original issued name', documentType, issuedAt: '2026-10-01', issuingAuthority: 'Original authority', version: '1', hash: 'ORIGINAL-HASH' });

test('personal identity resolves stable IDs and legacy aliases, never names or the first citizen', () => {
  for (const citizenId of ['person-one', 'MAID-OR-00000001', 'mrd-01', ' OLD-01 ']) assert.equal(resolvePersonalCitizen(people, { citizenId }), people[0]);
  for (const citizenId of [null, 'missing', 'Same Name', 'MAID-OR-00000003']) assert.equal(resolvePersonalCitizen(people, { citizenId }), null);
  assert.equal(resolvePersonalCitizen(people, { citizenId: 'MRD-01', canonicalPersonId: 'person-two' }), people[1]);
  assert.equal(resolvePersonalCitizen(people, { citizenId: 'MRD-01', canonicalPersonId: 'deleted-person' }), null);
  assert.equal(resolvePersonalCitizen([...people, { ...people[1], legacyAliases: ['OLD-01'] }], { citizenId: 'OLD-01' }), null);
  assert.equal(resolvePersonalCitizen([null, {}, ...people], { citizenId: 'MRD-01' }), people[0]);
});

test('personal issuance history excludes other citizens and agency records without rewriting issued facts', () => {
  const older = { ...issue('older', undefined, 'Birth Certificate'), citizenRecordId: 'MRD-01' };
  const saved = [issue('own', 'MAID-OR-00000001'), older, issue('other', 'MRD-02'), issue('agency', 'MRD-01', 'Investigative Profile'), issue('packet', 'MRD-01', 'FULL_NINE_DOCUMENT_PACKET'), null, { ...issue('broken', 'MRD-01'), citizenName: {} }];
  const copy = structuredClone(saved);
  const renamed = { ...people[0], name: 'New current name', home: 'New residence' };
  const result = personalIssuanceHistory(saved, renamed);
  assert.deepEqual(result.map(item => item.id), ['own', 'older']);
  assert.equal(result[0].citizenName, 'Original issued name');
  assert.equal(result[0].hash, 'ORIGINAL-HASH');
  assert.deepEqual(saved, copy);
  assert.deepEqual(personalIssuanceHistory(saved, null), []);
  assert.deepEqual(personalIssuanceHistory({}, people[0]), []);
});

test('reading personal records never seeds, migrates, or changes registry and issuance data', async () => {
  const values = storage();
  assert.deepEqual(await MaidIdentityService.readExistingPersons(), []);
  assert.equal(values.size, 0);
  values.set('miraverse-canonical-identities-v1', JSON.stringify(people));
  values.set('miraverse-issued-documents', JSON.stringify([issue('own', 'MRD-01')]));
  const before = [...values];
  const loaded = await MaidIdentityService.readExistingPersons();
  assert.equal(resolvePersonalCitizen(loaded, { citizenId: 'MRD-01' }).id, 'person-one');
  assert.deepEqual([...values], before);
});

test('linking is an existing-administrator action, persists one reference and leaves source records intact', async () => {
  const values = storage(); const store = await fresh();
  values.set('miraverse-canonical-identities-v1', JSON.stringify(people));
  values.set('miraverse-issued-documents', JSON.stringify([issue('own', 'MRD-01')]));
  store.getState().loginUser({ name: 'Ordinary Citizen', credits: 400 });
  const before = structuredClone(store.getState().gameplay);
  assert.equal((await store.getState().linkCitizenHubIdentity('person-one')).ok, false);
  assert.deepEqual(store.getState().gameplay, before);
  store.getState().loginUser({ name: 'World Administrator', isAdmin: true });
  const player = structuredClone(store.getState().gameplay.player);
  const identity = structuredClone(store.getState().gameplay.identity);
  assert.equal((await store.getState().linkCitizenHubIdentity('missing')).ok, false);
  assert.equal((await store.getState().linkCitizenHubIdentity('restricted')).ok, false);
  assert.equal((await store.getState().linkCitizenHubIdentity('person-one')).ok, true);
  assert.deepEqual(store.getState().gameplay.identity, { ...identity, canonicalPersonId: 'person-one' });
  assert.deepEqual(store.getState().gameplay.player, player);
  assert.equal(values.get('miraverse-canonical-identities-v1'), JSON.stringify(people));
  assert.equal(values.get('miraverse-issued-documents'), JSON.stringify([issue('own', 'MRD-01')]));
  values.set('miraverse-active-citizen-context-v1', JSON.stringify({ citizenId: 'MRD-02' }));
  const restored = await fresh();
  assert.equal(resolvePersonalCitizen(people, restored.getState().gameplay.identity).id, 'person-one');
  restored.getState().logoutUser();
  assert.equal((await restored.getState().linkCitizenHubIdentity('person-two')).ok, false);
});

test('a player switch during an asynchronous link cannot attach the previous administrator selection', async () => {
  const values = storage(); values.set('miraverse-canonical-identities-v1', JSON.stringify(people));
  const store = await fresh(); store.getState().loginUser({ name: 'Administrator', isAdmin: true });
  const promise = store.getState().linkCitizenHubIdentity('person-one');
  store.getState().logoutUser();
  assert.equal((await promise).ok, false);
  assert.equal(store.getState().gameplay.identity.canonicalPersonId ?? null, null);
});

test('identity calibration preserves pre-existing IDs and cannot repeat payouts or change a linked identity', async () => {
  storage(); const store = await fresh();
  store.getState().loginUser({ name: 'Calibration Citizen', credits: 400 });
  store.setState(s => ({ gameplay: { ...s.gameplay, identity: { ...s.gameplay.identity, citizenId: 'LEGACY-PERSONAL-ID', barcode: 'LEGACY-BARCODE' } } }));
  const player = structuredClone(store.getState().gameplay.player);
  store.getState().completeIdentityScan({ citizenId: 'replacement', barcode: 'replacement', canonicalPersonId: 'person-two', fingerprint: true });
  const after = structuredClone(store.getState().gameplay);
  assert.equal(after.identity.citizenId, 'LEGACY-PERSONAL-ID');
  assert.equal(after.identity.barcode, 'LEGACY-BARCODE');
  assert.equal(after.identity.canonicalPersonId, null);
  assert.equal(after.player.credits, player.credits + 150);
  store.getState().completeIdentityScan({ citizenId: 'another-replacement' });
  assert.deepEqual(store.getState().gameplay, after);
  const restored = await fresh(); restored.getState().completeIdentityScan({ citizenId: 'after-reload' });
  assert.deepEqual(restored.getState().gameplay, after);
});

test('CIVINET claim history and old shortcuts survive the Citizen Hub consolidation', async () => {
  storage(); const store = await fresh();
  store.getState().claimPortalAction('civinet-monthly-stipend', 100, 0, 25, 'Original CIVINET claim');
  const player = structuredClone(store.getState().gameplay.player);
  const restored = await fresh();
  restored.getState().openAppWorkspace('civinet');
  assert.deepEqual(restored.getState().windows.map(window => window.id), ['passport']);
  assert.equal(restored.getState().workspaceRequests.passport.section, 'services');
  assert.equal(restored.getState().claimPortalAction('civinet-monthly-stipend', 100, 0, 25).ok, false);
  assert.deepEqual(restored.getState().gameplay.player, player);
  assert.deepEqual(restoreDesktopPreferences({ shortcutIds: ['mirror', 'civinet', 'citizenHub', 'meridionRegistry'] }).shortcutIds, ['passport', 'meridionRegistry']);
});

test('issuance reads support both stored identity keys and do not reissue documents', () => {
  const values = storage();
  const saved = [issue('own', 'MRD-01'), { ...issue('older', undefined), citizenRecordId: 'MRD-01' }, issue('other', 'MRD-02'), null];
  values.set('miraverse-issued-documents', JSON.stringify(saved));
  assert.deepEqual(getIssuedSnapshots('MRD-01').map(item => item.id), ['own', 'older']);
  assert.equal(values.get('miraverse-issued-documents'), JSON.stringify(saved));
  values.set('miraverse-issued-documents', '[]');
  const created = recordIssuedSnapshot({ documentType: 'Aura Citizen ID', citizenId: 'MRD-01', citizenName: 'Issued name', issuedAt: '2026-10-22', issuingAuthority: 'AURA', version: '1' });
  assert.equal(getIssuedSnapshots('MRD-01')[0].id, created.id);
});
