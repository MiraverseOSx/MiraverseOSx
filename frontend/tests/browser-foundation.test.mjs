import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { BROWSER_HOME, MAX_BROWSER_TABS, STARTER_SITES, resolveBrowserInput, restoreBrowserState } = await import('../src/apps/Browser/browserModel.ts');
let sequence = 0;
function storage() { const values = new Map(); globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; return values; }
async function fresh() { return (await import(`../src/store/useOSStore.ts?browser=${sequence++}`)).useOSStore; }

test('addresses normalize and unsupported schemes become inert network searches', () => {
  assert.equal(resolveBrowserInput('  WORKNET.AURE/  '), 'https://worknet.aure');
  assert.equal(resolveBrowserInput('medical work'), `${BROWSER_HOME}/find?q=medical%20work`);
  assert.match(resolveBrowserInput('javascript:alert(1)'), /find\?q=/);
  assert.match(resolveBrowserInput('https://user:secret@worknet.aure'), /find\?q=/);
  assert.equal(STARTER_SITES.length, 5);
  assert.equal(new Set(STARTER_SITES.map(site => site.domain)).size, 5);
});

test('tabs are independent, have one shared limit, and clean up when closed', async () => {
  storage(); const store = await fresh(); const actions = store.getState();
  actions.openBrowserTab(); actions.openBrowserTab();
  assert.equal(store.getState().browserState.tabs.length, 3, 'new tab must create another home page');
  const closed = store.getState().browserState.activeTabId;
  actions.navigateBrowserTab('worknet.aure'); actions.closeBrowserTab(closed);
  assert.equal(store.getState().browserState.historyMap[closed], undefined);
  assert.equal(store.getState().browserState.tabs.find(tab => tab.id === store.getState().browserState.activeTabId).url, BROWSER_HOME);
  actions.setActiveBrowserTab(-1); actions.closeBrowserTab(-1);
  assert.equal(store.getState().browserState.tabs.length, 2);
  for (let index = 0; index < 15; index++) actions.openBrowserTab();
  assert.equal(store.getState().browserState.tabs.length, MAX_BROWSER_TABS);
  actions.setBrowserUrl('faithmed.aure');
  assert.equal(store.getState().browserUrl, 'https://faithmed.aure');
  assert.equal(store.getState().browserState.tabs.length, MAX_BROWSER_TABS);
});

test('back/forward restore titles and a new route drops only the forward branch', async () => {
  storage(); const store = await fresh(); const actions = store.getState();
  actions.navigateBrowserTab('worknet.aure'); actions.navigateBrowserTab('faithmed.aure'); actions.goBrowserBack();
  assert.equal(store.getState().browserState.tabs[0].title, 'WorkNet');
  actions.goBrowserForward(); assert.equal(store.getState().browserState.tabs[0].title, 'Faith Medical');
  actions.goBrowserBack(); actions.navigateBrowserTab('civinet.mer'); actions.goBrowserForward();
  assert.equal(store.getState().browserState.tabs[0].title, 'CIVINET');
  actions.navigateBrowserTab('civinet.mer');
  assert.deepEqual(store.getState().browserState.historyMap[1].stack, [BROWSER_HOME, 'https://worknet.aure', 'https://civinet.mer']);
});

test('bookmarks, tabs and history survive hydration without resetting gameplay', async () => {
  storage(); const store = await fresh();
  store.getState().loginUser({ name: 'Browser tester', credits: 500 });
  store.getState().navigateBrowserTab('cyacademy.edu'); store.getState().toggleBrowserBookmark(); store.getState().openBrowserTab('worknet.aure');
  const reloaded = await fresh();
  assert.equal(reloaded.getState().gameplay.player.name, 'Browser tester');
  assert.equal(reloaded.getState().browserState.bookmarks[0].url, 'https://cyacademy.edu');
  assert.equal(reloaded.getState().browserState.tabs.length, 2);
  assert.equal(reloaded.getState().browserState.visits[0].url, 'https://worknet.aure');
  reloaded.getState().setActiveBrowserTab(1); reloaded.getState().toggleBrowserBookmark();
  assert.equal(reloaded.getState().browserState.bookmarks.length, 0);
});

test('clearing history removes visit records and tab stacks while preserving bookmarks', async () => {
  storage(); const store = await fresh();
  store.getState().navigateBrowserTab('worknet.aure'); store.getState().toggleBrowserBookmark(); store.getState().navigateBrowserTab('civinet.mer');
  store.getState().clearBrowserHistory(); store.getState().goBrowserBack();
  const state = (await fresh()).getState().browserState;
  assert.equal(state.visits.length, 0);
  assert.equal(state.bookmarks.length, 1);
  assert.deepEqual(state.historyMap[1], { stack: ['https://civinet.mer'], index: 0 });
});

test('old and partially malformed saves recover to usable navigation', () => {
  assert.equal(restoreBrowserState(undefined).tabs[0].url, BROWSER_HOME);
  const recovered = restoreBrowserState({ tabs: [{ id: 7, url: 'worknet.aure' }, { id: 7, url: 'bad.aure' }], activeTabId: 99, historyMap: { 7: { stack: [], index: 50 } }, bookmarks: [null, { url: 'faithmed.aure' }], visits: [{ url: 'worknet.aure', visitedAt: 'bad' }] });
  assert.equal(recovered.tabs.length, 1); assert.equal(recovered.activeTabId, 7);
  assert.equal(recovered.nextTabId, 8); assert.equal(recovered.historyMap[7].index, 0);
  assert.equal(recovered.bookmarks.length, 1); assert.equal(recovered.visits.length, 0);
});
