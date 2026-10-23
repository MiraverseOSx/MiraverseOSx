import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
globalThis.window = { localStorage: globalThis.localStorage };
globalThis.location = { hostname: '127.0.0.1' };
const { useOSStore: os } = await import('../src/store/useOSStore.ts');
const { ORGANIZATIONS, membershipSource } = await import('../src/integration/communicationsAccess.ts');
const { resolveDGAAuthority } = await import('../src/dgaos/lib/dga-permissions.ts');

test('local full access persists credentials without resetting the character or issuing rewards', async () => {
  os.getState().loginUser({ name: 'Local Player', clearance: 1, credits: 500 });
  const before = structuredClone(os.getState().gameplay.player);
  assert.equal(os.getState().grantLocalFullAccess().ok, true);
  const player = os.getState().gameplay.player;
  for (const key of Object.keys(before).filter(key => !['isAdmin', 'clearanceLevel', 'dgaVerified', 'organizationMemberships'].includes(key))) assert.deepEqual(player[key], before[key], key);
  assert.equal(player.clearanceLevel, 5);
  assert.ok(ORGANIZATIONS.every(org => membershipSource(player, org.id)));
  assert.equal(resolveDGAAuthority({ player, isLoggedIn: true }).canAccessTrace, true);
  assert.equal(resolveDGAAuthority({ player, isLoggedIn: true }).canTransmitTraceFindings, true);
  assert.equal(os.getState().broadStreetEligible(), true);
  os.getState().grantLocalFullAccess();
  assert.deepEqual(os.getState().gameplay.player, player);
  const restored = (await import('../src/store/useOSStore.ts?credentials-reload')).useOSStore;
  assert.equal(restored.getState().gameplay.player.isAdmin, true);
  assert.equal(restored.getState().gameplay.player.clearanceLevel, 5);
});

test('the explicit local credential grant is unavailable on remote hosts and when signed out', () => {
  location.hostname = 'miraverse.example';
  const before = structuredClone(os.getState().gameplay);
  assert.equal(os.getState().grantLocalFullAccess().ok, false);
  assert.deepEqual(os.getState().gameplay, before);
  location.hostname = 'localhost';
  os.setState({ isLoggedIn: false });
  assert.equal(os.getState().grantLocalFullAccess().ok, false);
});
