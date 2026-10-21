import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { DEFAULT_SHORTCUT_IDS, DESKTOP_APP_IDS, restoreDesktopPreferences } = await import('../src/store/desktopPreferences.ts');
let sequence = 0;
function storage() { const values = new Map(); globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; return values; }
async function fresh() { return (await import(`../src/store/useOSStore.ts?desktop=${sequence++}`)).useOSStore; }

test('old saves receive independent defaults while empty shortcut choices remain empty', () => {
  const defaults = restoreDesktopPreferences(undefined);
  assert.deepEqual(defaults.shortcutIds, DEFAULT_SHORTCUT_IDS);
  defaults.shortcutIds.pop();
  assert.equal(restoreDesktopPreferences({}).shortcutIds.length, 6);
  assert.deepEqual(restoreDesktopPreferences({ shortcutIds: [] }).shortcutIds, []);
  assert.deepEqual(restoreDesktopPreferences({ shortcutIds: 'broken' }).shortcutIds, DEFAULT_SHORTCUT_IDS);
});
test('saved shortcut IDs discard invalid values and duplicates, retain order and cap at eight', () => {
  assert.deepEqual(restoreDesktopPreferences({ shortcutIds: ['lore', null, 'unknown', 'browser', 'lore', 3] }).shortcutIds, ['lore', 'browser']);
  assert.deepEqual(restoreDesktopPreferences({ shortcutIds: DESKTOP_APP_IDS }).shortcutIds, DESKTOP_APP_IDS.slice(0, 8));
});
test('adding, removing, ordering and clearing shortcuts survive a reload', async () => {
  storage(); const store = await fresh();
  store.getState().setDesktopShortcuts(['lore', 'mail', 'browser']);
  assert.deepEqual((await fresh()).getState().desktopPreferences.shortcutIds, ['lore', 'mail', 'browser']);
  store.getState().setDesktopShortcuts(['browser', 'lore']);
  assert.deepEqual((await fresh()).getState().desktopPreferences.shortcutIds, ['browser', 'lore']);
  store.getState().setDesktopShortcuts([]);
  assert.deepEqual((await fresh()).getState().desktopPreferences.shortcutIds, []);
  store.getState().resetDesktopShortcuts();
  assert.deepEqual((await fresh()).getState().desktopPreferences.shortcutIds, DEFAULT_SHORTCUT_IDS);
});
test('older progress preserves gameplay, browser bookmarks and custom wallpaper when gaining desktop defaults', async () => {
  const saved = storage(); const store = await fresh();
  store.getState().loginUser({ name: 'Desktop Tester', credits: 400 });
  store.getState().setWallpaper('/custom-wallpaper.png');
  store.getState().navigateBrowserTab('worknet.aure'); store.getState().toggleBrowserBookmark();
  const progress = JSON.parse(saved.get('miraverse-os-progress'));
  delete progress.state.desktopPreferences;
  saved.set('miraverse-os-progress', JSON.stringify(progress));
  const restored = (await fresh()).getState();
  assert.equal(restored.gameplay.player.name, 'Desktop Tester');
  assert.equal(restored.wallpaper, '/custom-wallpaper.png');
  assert.equal(restored.browserState.bookmarks[0].url, 'https://worknet.aure');
  assert.deepEqual(restored.desktopPreferences.shortcutIds, DEFAULT_SHORTCUT_IDS);
});
