import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { WorldSyncClient, readWorldEntries, validSnapshot } from '../src/backend/worldSync.ts';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });

const OS = 'miraverse-os-progress'; const MAIL = 'miraverse-comms';
const save = name => JSON.stringify({ state: { gameplay: { player: { name, credits: 100 } } }, version: 1 });
function memory(initial = {}) { const data = new Map(Object.entries(initial)); return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; }
function backend(entries = {}, revision = 0) {
  let world = { serverId: 'test-world', revision, updatedAt: null, entries };
  const api = { offline: false, puts: 0, beforePut: null, get world() { return structuredClone(world); }, replace(entries) { world = { ...world, entries, revision: world.revision + 1 }; }, async fetch(_url, options) {
    if (api.offline) throw new Error('Offline');
    if (options.method === 'GET') return Response.json(world);
    api.puts++; if (api.beforePut) { const hook = api.beforePut; api.beforePut = null; hook(); }
    const input = JSON.parse(options.body);
    if (input.serverId !== world.serverId || input.expectedRevision !== world.revision) return Response.json(world, { status: 409 });
    world = { ...world, revision: world.revision + 1, updatedAt: new Date().toISOString(), entries: input.entries };
    return Response.json(world);
  } }; return api;
}
function client(storage, api) { const restored = []; let reloads = 0; return { restored, get reloads() { return reloads; }, sync: new WorldSyncClient(storage, api.fetch, async entries => { restored.push(readWorldEntries(storage)); for (const key of Object.keys(readWorldEntries(storage))) storage.removeItem(key); for (const [key,value] of Object.entries(entries)) storage.setItem(key,value); }, () => reloads++) }; }

test('first connection imports existing progress and mail together without resetting local state', async () => {
  const storage = memory({ [OS]: save('Existing player'), [MAIL]: JSON.stringify({ state: { emails: [{ id: 'dispatch' }] } }) });
  const api = backend(); const { sync } = client(storage, api); await sync.start();
  assert.equal(api.world.revision, 1); assert.deepEqual(api.world.entries, readWorldEntries(storage)); assert.equal(sync.getStatus().state, 'saved');
});
test('a fresh browser restores the database world before stores initialize', async () => {
  const entries = { [OS]: save('Database player'), [MAIL]: JSON.stringify({ state: { trashedEmailIds: ['gone'] } }) };
  const storage = memory(); const { sync, restored } = client(storage, backend(entries, 3)); await sync.start();
  assert.equal(restored.length, 1); assert.deepEqual(readWorldEntries(storage), entries); assert.equal(sync.getStatus().state, 'saved');
});
test('offline changes remain local and upload safely after reconnection', async () => {
  const storage = memory({ [OS]: save('Offline player') }); const api = backend(); api.offline = true;
  const { sync } = client(storage, api); await sync.start(); assert.equal(sync.getStatus().state, 'offline');
  storage.setItem(OS, save('Progress while offline')); api.offline = false; await sync.sync(true);
  assert.equal(api.world.entries[OS], save('Progress while offline')); assert.equal(sync.getStatus().state, 'saved');
});
test('unchanged local progress adopts a newer database revision on next boot', async () => {
  const storage = memory({ [OS]: save('Original') }); const api = backend(); await client(storage, api).sync.start();
  api.replace({ [OS]: save('Newer database') }); await client(storage, api).sync.start();
  assert.equal(storage.getItem(OS), save('Newer database'));
});
test('independent changed copies cannot silently overwrite one another', async () => {
  const storage = memory({ [OS]: save('Original') }); const api = backend(); await client(storage, api).sync.start();
  storage.setItem(OS, save('Local changes')); api.replace({ [OS]: save('Other browser changes') });
  const { sync } = client(storage, api); await sync.start(); await sync.sync();
  assert.equal(sync.getStatus().state, 'conflict'); assert.equal(storage.getItem(OS), save('Local changes')); assert.equal(api.world.entries[OS], save('Other browser changes'));
});
test('a stale write receives conflict instead of clobbering a concurrent commit', async () => {
  const storage = memory({ [OS]: save('Original') }); const api = backend(); const { sync } = client(storage, api); await sync.start();
  storage.setItem(OS, save('Our pending work')); api.beforePut = () => api.replace({ [OS]: save('Concurrent work') }); await sync.sync();
  assert.equal(sync.getStatus().state, 'conflict'); assert.equal(api.world.entries[OS], save('Concurrent work'));
});
test('explicitly keeping the device copy preserves the displaced database snapshot', async () => {
  const storage = memory({ [OS]: save('Device') }); const api = backend({ [OS]: save('Database') }, 5); const { sync } = client(storage, api);
  await sync.start(); assert.equal(sync.getStatus().state, 'conflict'); await sync.keepDeviceCopy();
  assert.equal(api.world.entries[OS], save('Device'));
  const backup = [...storage.data.entries()].find(([key]) => key.startsWith('miraverse-world-backup-'));
  assert.equal(JSON.parse(backup[1]).entries[OS], save('Database'));
});
test('explicitly loading the database restores the whole snapshot and requests a fresh app hydration', async () => {
  const storage = memory({ [OS]: save('Device') }); const api = backend({ [OS]: save('Database') }, 4); const instance = client(storage, api);
  await instance.sync.start(); await instance.sync.loadDatabaseCopy(); assert.equal(instance.reloads, 1); assert.equal(storage.getItem(OS), save('Database')); assert.equal(instance.restored[0][OS], save('Device'));
});
test('changes made during an in-flight save are committed on the following sync', async () => {
  const storage = memory({ [OS]: save('First') }); const api = backend(); const { sync } = client(storage, api);
  api.beforePut = () => storage.setItem(OS, save('Changed during upload')); await sync.start(); await sync.sync();
  assert.equal(api.world.entries[OS], save('Changed during upload')); assert.equal(api.world.revision, 2);
});
test('unsupported endpoints and malformed snapshots keep device progress usable', async () => {
  const storage = memory({ [OS]: save('Retained') });
  const { sync } = client(storage, { fetch: async () => new Response('<html>Not an API</html>') }); await sync.start();
  assert.equal(sync.getStatus().state, 'offline'); assert.equal(storage.getItem(OS), save('Retained'));
  assert.equal(validSnapshot({ serverId: 'test', revision: 1, entries: { credentials: '{}' } }), false);
  assert.equal(validSnapshot({ serverId: 'test', revision: -1, entries: {} }), false);
});
test('unrelated local storage and credentials never enter the world snapshot', () => {
  const storage = memory({ [OS]: save('Player'), password: 'private', unrelated: 'not JSON' });
  assert.deepEqual(Object.keys(readWorldEntries(storage)), [OS]);
});

test('unavailable save servers back off, cap retries, and permit explicit reconnection', async () => {
  const storage = memory({ [OS]: save('Retained offline') });
  let requests = 0; let available = false; let now = 100000;
  const originalNow = Date.now;
  Date.now = () => now;
  try {
    const api = backend();
    const { sync } = client(storage, { fetch: async (...args) => { requests++; if (!available) return new Response('Unavailable', { status: 500 }); return api.fetch(...args); } });
    await sync.start();
    for (const advance of [1500, 1500, 1999]) { now += advance; await sync.sync(); }
    assert.equal(requests, 1);
    now++; await sync.sync(); assert.equal(requests, 2);
    now += 9999; await sync.sync(); assert.equal(requests, 2);
    now++; await sync.sync(); assert.equal(requests, 3);
    for (const delay of [20000, 40000, 60000]) { now += delay; await sync.sync(); }
    const before = requests;
    now += 59999; await sync.sync(); assert.equal(requests, before);
    now++; await sync.sync(); assert.equal(requests, before + 1);
    assert.equal(storage.getItem(OS), save('Retained offline'));
    available = true;
    await sync.sync(true);
    assert.equal(sync.getStatus().state, 'saved');
    assert.equal(api.world.entries[OS], save('Retained offline'));
  } finally { Date.now = originalNow; }
});
test('WorkNet acceptance, mail, briefing files, completion receipts and career progress restore as one world', async () => {
  const storage = memory(); globalThis.localStorage = storage; globalThis.window = { localStorage: storage };
  const { useCommsStore } = await import('../src/store/useCommsStore.ts');
  const { useOSStore } = await import('../src/store/useOSStore.ts?backend-flow=one');
  const { WORKNET_ASSIGNMENTS } = await import('../src/gameplay/ActivityEngine.ts');
  useOSStore.getState().loginUser({ name: 'Connected world tester', credits: 500, level: 1 });
  const initialCredits = useOSStore.getState().gameplay.player.credits;
  assert.equal(useOSStore.getState().startAssignment('qn-02').ok, true);
  assert.equal(useOSStore.getState().startAssignment('qn-02').ok, true);
  const order = useOSStore.getState().gameplay.player.worknetOrders['qn-02'];
  const openedId = `JOB-OPENED:${order.id}`;
  assert.equal(useCommsStore.getState().emails.filter(mail => mail.id === openedId).length, 1);
  assert.equal(useOSStore.getState().gameplay.player.credits, initialCredits);
  assert.equal(useOSStore.getState().acknowledgeAssignmentBriefing('qn-02').ok, true);
  for (const [stage, values] of [['search', { site: 'East Fountain Bench' }], ['identify', { metal: 'silver', movement: 'Mechanical gears' }], ['return', { receipt: 'WATCH-RETURN' }]]) assert.equal(useOSStore.getState().submitWorknetStage('qn-02', stage, values).ok, true);
  assert.equal(useOSStore.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['qn-02']).ok, true);
  assert.equal(useOSStore.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['qn-02']).ok, false);
  const api = backend(); const instance = client(storage, api); await instance.sync.start();
  const alternate = memory(); await client(alternate, api).sync.start();
  globalThis.localStorage = alternate; globalThis.window = { localStorage: alternate };
  const restoredOS = (await import('../src/store/useOSStore.ts?backend-flow=two')).useOSStore.getState();
  const restoredMail = (await import('../src/store/useCommsStore.ts?backend-flow=two')).useCommsStore.getState();
  assert.equal(restoredOS.gameplay.player.credits, initialCredits + WORKNET_ASSIGNMENTS['qn-02'].rewardCredits);
  assert.ok(restoredOS.gameplay.player.assignmentJournal.files[`briefing:qn-02`]);
  assert.match(restoredOS.gameplay.player.assignmentJournal.files[`completion:${order.id}`].body, /WATCH-RETURN/);
  assert.equal(restoredMail.emails.filter(mail => mail.id === `JOB-COMPLETED:${order.id}`).length, 1);
  assert.ok(restoredMail.emails.find(mail => mail.id === `JOB-COMPLETED:${order.id}`).attachments.every(attachment => !attachment.isReward));
});
