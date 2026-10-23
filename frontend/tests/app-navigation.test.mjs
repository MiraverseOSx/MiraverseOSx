import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';

registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context); }
    catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error;
      return next(`${specifier}.ts`, context);
    }
  },
});
const { resolveAppDestination, retiredWindowDestination } = await import('../src/store/appNavigation.ts');
const { restoreDesktopPreferences, DESKTOP_APP_IDS } = await import('../src/store/desktopPreferences.ts');
const destinations = [
  ['traceForensics', 'dgaos', 'trace'],
  ['board', 'jobs', 'notices'],
  ['chronicle', 'jobs', 'notices'],
  ['questnotice', 'jobs', 'civic-jobs'],
  ['spellforge', 'campus', 'magic'],
  ['serviceDirectory', 'browser', 'services'],
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
async function fresh() { return (await import(`../src/store/useOSStore.ts?navigation=${sequence++}`)).useOSStore; }

test('a driver reference and unrelated archive career XP do not reveal the protected lineage story', async () => {
  storage(); const store = await fresh();
  store.getState().loginUser({ name: 'Archive Reader', clearance: 1, credits: 500 });
  store.getState().recordFileInspection('aethercore-sys');
  let player = store.getState().gameplay.player;
  assert.equal(player.lineageDecrypted, false);
  const { evaluateNoticeObjective } = await import('../src/data/notices.ts');
  const { SPECIAL_LORE_DREAMS } = await import('../src/gameplay/WorldEventEngine.ts');
  assert.equal(evaluateNoticeObjective('n-04', { ...player, careers: { archivist: { rankIndex: 2, xp: 500 } } }).met, false);
  const dream = SPECIAL_LORE_DREAMS.find(entry => entry.id === 'dream-lightborn-lineage') || SPECIAL_LORE_DREAMS.find(entry => entry.title === 'The Year-0 Lineage Ledger');
  assert.equal(dream.conditionCheck(player), false);
  store.getState().recordFileInspection('purge-archive');
  player = store.getState().gameplay.player;
  assert.equal(player.lineageDecrypted, true);
  assert.equal(dream.conditionCheck(player), true);
  const xp = player.xp;
  store.getState().recordFileInspection('purge-archive');
  assert.equal(store.getState().gameplay.player.xp, xp);
});

test('legacy destinations resolve without treating inherited object keys as aliases', () => {
  for (const [oldId, appId, section] of destinations) {
    assert.deepEqual(resolveAppDestination(oldId), { appId, section });
    assert.deepEqual(retiredWindowDestination({ id: 'old-custom-window', contentKey: oldId }), { appId, section });
  }
  for (const id of ['constructor', '__proto__', 'toString', 'maispace', 'pulse']) {
    assert.deepEqual(resolveAppDestination(id), { appId: id });
    assert.equal(retiredWindowDestination(id), null);
  }
  for (const malformed of [null, undefined, 42, {}, { id: {} }]) assert.equal(retiredWindowDestination(malformed), null);
});

test('every old launcher route opens only its owning workspace and delivers the section', async () => {
  for (const method of ['toggleApp', 'addWindow']) {
    for (const [id, owner, section] of destinations) {
      storage(); const store = await fresh();
      store.getState()[method]({ id, contentKey: id, title: 'Old standalone title' });
      assert.deepEqual(store.getState().windows.map(window => window.id), [owner]);
      assert.equal(store.getState().windows[0].contentKey, owner);
      assert.equal(store.getState().workspaceRequests[owner].section, section);
      store.getState()[method]({ id, contentKey: id });
      assert.equal(store.getState().windows.length, 1);
      assert.equal(store.getState().windows[0].isMinimized, false);
      assert.equal(store.getState().activeWindowId, owner);
    }
  }
});

test('string aliases and custom window IDs cannot recreate retired app content', async () => {
  storage(); const store = await fresh();
  store.getState().toggleApp('traceForensics');
  store.getState().toggleApp({ id: 'old-trace-popout', contentKey: 'traceForensics' });
  store.getState().addWindow({ id: 'old-spell-popout', contentKey: 'spellforge' });
  assert.deepEqual(store.getState().windows.map(window => window.id), ['dgaos', 'campus']);
});

test('repeated section requests survive stale consumption and refocus a minimized owner', async () => {
  storage(); const store = await fresh();
  store.getState().openAppWorkspace('jobs', 'notices');
  const first = store.getState().workspaceRequests.jobs.revision;
  store.getState().consumeWorkspaceRequest('jobs', first);
  store.getState().toggleMinimize('jobs');
  store.getState().openAppWorkspace('questnotice');
  const latest = store.getState().workspaceRequests.jobs;
  assert.ok(latest.revision > first);
  store.getState().consumeWorkspaceRequest('jobs', first);
  assert.equal(store.getState().workspaceRequests.jobs.section, 'civic-jobs');
  assert.equal(store.getState().windows.length, 1);
  assert.equal(store.getState().windows[0].isMinimized, false);
  store.getState().consumeWorkspaceRequest('jobs', latest.revision);
  assert.equal(store.getState().workspaceRequests.jobs, undefined);
});

test('old shortcuts migrate in order, merge duplicate owners and preserve appearance', () => {
  const preferences = restoreDesktopPreferences({ themeId: 'pine', shortcutIds: ['traceForensics', 'dgaos', 'board', 'spellforge', 'serviceDirectory', 'questnotice', 'maispace'] });
  assert.deepEqual(preferences, { themeId: 'pine', shortcutIds: ['dgaos', 'jobs', 'campus', 'browser', 'maispace'] });
  for (const [id] of destinations) assert.equal(DESKTOP_APP_IDS.includes(id), false);
  assert.ok(DESKTOP_APP_IDS.includes('maispace'));
  assert.ok(DESKTOP_APP_IDS.includes('pulse'));
});

test('consolidated navigation preserves saved progress and external records, with no runtime requests persisted', async () => {
  const values = storage(); const store = await fresh();
  store.getState().loginUser({ name: 'Migration Citizen', credits: 400 });
  store.getState().completeIdentityScan({ citizenId: 'MIGRATION-01' });
  store.getState().recordFileInspection('system-audit');
  store.getState().completeNotice('n-02');
  store.getState().claimPortalAction('qn-web-1', 60, 0, 35, 'Earlier civic listing');
  store.getState().setWallpaper('/saved-wallpaper.png');
  store.getState().navigateBrowserTab('worknet.aure');
  store.getState().toggleBrowserBookmark();
  const saved = JSON.parse(values.get('miraverse-os-progress'));
  saved.state.desktopPreferences = { themeId: 'autumn', shortcutIds: ['board', 'traceForensics', 'spellforge'] };
  values.set('miraverse-os-progress', JSON.stringify(saved));
  values.set('DGAOS_WORKSTATION_STATE_V3', JSON.stringify({ cases: [{ id: 'preserved-case', notes: 'Keep original record' }] }));
  values.set('independent-document-history', 'unchanged');
  const restored = await fresh();
  const gameplay = structuredClone(restored.getState().gameplay);
  const browser = structuredClone(restored.getState().browserState);
  for (const [id] of destinations) restored.getState().openAppWorkspace(id);
  assert.deepEqual(restored.getState().gameplay, gameplay);
  assert.deepEqual(restored.getState().browserState, browser);
  assert.equal(values.get('DGAOS_WORKSTATION_STATE_V3'), JSON.stringify({ cases: [{ id: 'preserved-case', notes: 'Keep original record' }] }));
  assert.equal(values.get('independent-document-history'), 'unchanged');
  const reloaded = await fresh();
  assert.deepEqual(reloaded.getState().gameplay, saved.state.gameplay);
  assert.equal(reloaded.getState().wallpaper, '/saved-wallpaper.png');
  assert.deepEqual(reloaded.getState().desktopPreferences, { themeId: 'autumn', shortcutIds: ['jobs', 'dgaos', 'campus'] });
  assert.deepEqual(reloaded.getState().windows, []);
  assert.deepEqual(reloaded.getState().workspaceRequests, {});
  const afterReload = structuredClone(reloaded.getState().gameplay.player);
  reloaded.getState().completeNotice('n-02');
  assert.deepEqual(reloaded.getState().gameplay.player, afterReload);
  const persisted = JSON.parse(values.get('miraverse-os-progress')).state;
  assert.equal(persisted.workspaceRequests, undefined);
  assert.equal(persisted.workspaceRequestSequence, undefined);
});
