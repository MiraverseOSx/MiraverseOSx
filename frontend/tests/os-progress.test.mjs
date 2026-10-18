import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';

// Match Vite's extensionless TypeScript imports using Node's built-in TS support.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try { return nextResolve(specifier, context); }
    catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});

const key = 'miraverse-os-progress';
let instance = 0;
function memoryStorage() {
  const data = new Map();
  const storage = {
    getItem: (name) => data.get(name) ?? null,
    setItem: (name, value) => data.set(name, value),
    removeItem: (name) => data.delete(name),
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  return storage;
}
async function freshStore() {
  const module = await import(`../src/store/useOSStore.ts?instance=${instance++}`);
  return module.useOSStore;
}

test('gameplay and wallpaper survive a fresh store while runtime windows are excluded', async () => {
  const storage = memoryStorage();
  const store = await freshStore();
  store.getState().loginUser({ name: 'Test Citizen', credits: 500, level: 1 });
  store.getState().addCredits(123);
  store.getState().addSkillXP('Research', 25);
  store.getState().completeIdentityScan({ citizenId: 'TEST-01' });
  store.getState().damageAura(40);
  store.getState().removeCondition('Veilwilt');
  store.getState().setWallpaper('https://example.com/wallpaper.jpg');
  store.getState().toggleApp({ id: 'passport', icon: () => null });

  const saved = JSON.parse(storage.getItem(key)).state;
  assert.equal(saved.windows, undefined);
  assert.equal(saved.activeWindowId, undefined);
  const restored = await freshStore();
  assert.deepEqual(restored.getState().gameplay, store.getState().gameplay);
  assert.equal(restored.getState().wallpaper, 'https://example.com/wallpaper.jpg');
  assert.equal(restored.getState().isLoggedIn, true);
  assert.deepEqual(restored.getState().windows, []);
});

test('signing back in resumes earned credits, level, and onboarding', async () => {
  memoryStorage();
  const store = await freshStore();
  store.getState().loginUser({ name: 'Test Citizen', credits: 500, level: 1 });
  store.getState().addCredits(321);
  store.getState().addXP(350);
  store.getState().completeIdentityScan({ citizenId: 'TEST-01' });
  store.getState().logoutUser();
  const restored = await freshStore();
  assert.equal(restored.getState().isLoggedIn, false);
  const progress = restored.getState().gameplay;
  restored.getState().loginUser({ name: 'test citizen', credits: 500, level: 1 });
  assert.equal(restored.getState().isLoggedIn, true);
  assert.deepEqual(restored.getState().gameplay, progress);
});

test('notice completion requires verified world objective and pays exactly once, including after reload', async () => {
  memoryStorage();
  const store = await freshStore();
  const before = store.getState().gameplay.player;

  // Attempting to complete n-02 before tracing/quarantining an anomaly must fail and pay nothing
  const premature = store.getState().completeNotice('n-02');
  assert.equal(premature, false);
  assert.deepEqual(store.getState().gameplay.player, before);

  // Fulfill n-02 objective via recordFileInspection('system-audit')
  store.getState().recordFileInspection('system-audit');
  const afterInspect = store.getState().gameplay.player;

  const fulfilled = store.getState().completeNotice('n-02');
  assert.equal(fulfilled, true);
  const after = store.getState().gameplay.player;
  assert.equal(after.credits - afterInspect.credits, 300);
  assert.equal(after.xp - afterInspect.xp, 250);
  assert.equal(after.bits - afterInspect.bits, 2);
  assert.equal(after.level, Math.floor(after.xp / 100) + 1);
  store.getState().completeNotice('n-02');
  store.getState().completeNotice('n-01');
  store.getState().completeNotice('unknown');
  assert.deepEqual(store.getState().gameplay.player, after);
  const restored = await freshStore();
  restored.getState().completeNotice('n-02');
  assert.deepEqual(restored.getState().gameplay.player, after);
});

test('WorkNet missions require all 3 verification steps and persist completion across reloads', async () => {
  memoryStorage();
  const store = await freshStore();
  const mission = {
    id: 'ms-spec-01',
    rewardCredits: 400,
    rewardBits: 10,
    rewardXP: 180,
    track: 'dga',
    primaryAttribute: 'Investigation',
  };

  // Cannot complete before all 3 steps are verified
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  store.getState().advanceWorknetMissionStep(mission.id, 'tool_calibrated');
  store.getState().advanceWorknetMissionStep(mission.id, 'subject_inspected');
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);

  store.getState().advanceWorknetMissionStep(mission.id, 'directive_executed');
  const res = store.getState().completeWorknetMission(mission);
  assert.equal(res.ok, true);
  assert.ok(store.getState().gameplay.player.completedWorknetMissionIds.includes(mission.id));

  // Cannot repeat for extra payout even after reload
  const afterFirst = store.getState().gameplay.player;
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  const restored = await freshStore();
  assert.ok(restored.getState().gameplay.player.completedWorknetMissionIds.includes(mission.id));
  assert.equal(restored.getState().completeWorknetMission(mission).ok, false);
  assert.equal(restored.getState().gameplay.player.credits, afterFirst.credits);
});

test('Housing upgrades and SpellForge discoveries persist and prevent infinite credit farming', async () => {
  memoryStorage();
  const store = await freshStore();
  store.getState().addCredits(1000);

  // Housing upgrade persists across store reload
  const buyRes = store.getState().purchaseHousingUpgrade('mattress', 350);
  assert.equal(buyRes.ok, true);
  assert.equal(store.getState().purchaseHousingUpgrade('mattress', 350).ok, false);

  // SpellForge canonical discovery awards +200 credits once, repeat cast awards 0 credits
  const spell = {
    name: 'Seal Lock',
    type: 'Veil Stabilization',
    desc: 'Stabilizes leaks.',
    power: 135,
    comboLabel: 'Encryption.mod + Anchor.mod',
    isCanonical: true,
    regions: ['Core'],
  };
  const creditsBeforeSpell = store.getState().gameplay.player.credits;
  const firstCast = store.getState().compileSpellProtocol(spell);
  assert.equal(firstCast.ok, true);
  assert.equal(firstCast.isNewDiscovery, true);
  assert.equal(store.getState().gameplay.player.credits, creditsBeforeSpell + 200);

  const secondCast = store.getState().compileSpellProtocol(spell);
  assert.equal(secondCast.ok, true);
  assert.equal(secondCast.isNewDiscovery, false);
  assert.equal(store.getState().gameplay.player.credits, creditsBeforeSpell + 200);

  const restored = await freshStore();
  assert.ok(restored.getState().gameplay.player.unlockedHousingUpgrades.includes('mattress'));
  assert.ok(restored.getState().gameplay.player.forgedSpells.includes('Seal Lock'));
});

test('Faith Medical diagnostic-first treatment, Mai.space persistence, and Formal Case Reasoning', async () => {
  memoryStorage();
  const store = await freshStore();

  // 1. Faith Medical: Cannot treat Veilwilt before running baseline diagnostic scan
  const preScanTreat = store.getState().treatFaithCondition('Veilwilt');
  assert.equal(preScanTreat.ok, false);
  assert.ok(store.getState().gameplay.player.conditions.includes('Veilwilt'));

  // Run baseline diagnostic scan (+150 credits first time, +75 XP)
  const scan1 = store.getState().runFaithDiagnosticScan();
  assert.equal(scan1.ok, true);
  assert.equal(scan1.rewardedCredits, 150);
  assert.equal(store.getState().gameplay.player.faithDiagnosed, true);

  // Repeat scan in same cycle is blocked
  const scan2 = store.getState().runFaithDiagnosticScan();
  assert.equal(scan2.ok, false);

  // Cannot treat a condition the player does NOT have (e.g. Frostlung)
  const unownedTreat = store.getState().treatFaithCondition('Frostlung');
  assert.equal(unownedTreat.ok, false);

  // Treating active Veilwilt succeeds once and removes it
  const xpBeforeTreat = store.getState().gameplay.player.xp;
  const validTreat = store.getState().treatFaithCondition('Veilwilt');
  assert.equal(validTreat.ok, true);
  assert.ok(!store.getState().gameplay.player.conditions.includes('Veilwilt'));
  assert.equal(store.getState().gameplay.player.xp, xpBeforeTreat + 60);

  // Repeat treatment of already-cured Veilwilt is rejected
  const repeatTreat = store.getState().treatFaithCondition('Veilwilt');
  assert.equal(repeatTreat.ok, false);

  // 2. Mai.space friend acceptance & profile edits persist and cannot be farmed
  const creditsBeforeJeremie = store.getState().gameplay.player.credits;
  assert.equal(store.getState().acceptMaiSpaceFriend('jeremie'), true);
  assert.equal(store.getState().gameplay.player.credits, creditsBeforeJeremie + 100);
  assert.equal(store.getState().acceptMaiSpaceFriend('jeremie'), false);
  assert.equal(store.getState().gameplay.player.credits, creditsBeforeJeremie + 100);

  store.getState().updateMaiSpaceProfile({ handle: 'Cipher_Valkyrie', headerFont: 'Yeseva One' });
  assert.equal(store.getState().postMaiSpaceBulletin('Verified Sector 7 conduit telemetry.'), true);

  // 3. Formal Case Reasoning: rejects wrong hypothesis or unverified rumor exhibit, rewards valid reasoning once
  const badCase = store.getState().submitInvestigationCase(
    'CASE-FM-401',
    ['ev-fm-telemetry', 'ev-fm-rumor'],
    'hyp-fm-sabotage'
  );
  assert.equal(badCase.ok, false);

  const goodCase = store.getState().submitInvestigationCase(
    'CASE-FM-401',
    ['ev-fm-telemetry', 'ev-fm-dispensary'],
    'hyp-fm-conduit'
  );
  assert.equal(goodCase.ok, true);
  assert.ok(store.getState().gameplay.player.solvedInvestigationCaseIds.includes('CASE-FM-401'));

  // Cannot claim case reward a second time
  const duplicateCase = store.getState().submitInvestigationCase(
    'CASE-FM-401',
    ['ev-fm-telemetry', 'ev-fm-dispensary'],
    'hyp-fm-conduit'
  );
  assert.equal(duplicateCase.ok, false);

  // Verify persistence across reload and WorldEventLog population
  const reloaded = await freshStore();
  assert.equal(reloaded.getState().gameplay.player.faithDiagnosed, true);
  assert.ok(!reloaded.getState().gameplay.player.conditions.includes('Veilwilt'));
  assert.ok(reloaded.getState().gameplay.player.maiSpaceProfile.acceptedFriends.includes('jeremie'));
  assert.equal(reloaded.getState().gameplay.player.maiSpaceProfile.handle, 'Cipher_Valkyrie');
  assert.ok(reloaded.getState().gameplay.player.solvedInvestigationCaseIds.includes('CASE-FM-401'));
  assert.ok(reloaded.getState().gameplay.worldEventLog.length >= 4);
});

test('partial saves gain new defaults without restoring cleared conditions', async () => {
  const storage = memoryStorage();
  storage.setItem(key, JSON.stringify({ version: 1, state: {
    gameplay: { player: { name: 'Returning Citizen', credits: 42, conditions: [] } },
  } }));
  const store = await freshStore();
  const player = store.getState().gameplay.player;
  assert.equal(player.name, 'Returning Citizen');
  assert.equal(player.credits, 42);
  assert.deepEqual(player.conditions, []);
  assert.deepEqual(player.completedNoticeIds, ['n-01']);
  assert.ok(player.skills.Research);
  assert.ok(store.getState().gameplay.identity);
});

test('corrupt or unavailable storage leaves a playable session', async (t) => {
  const storage = memoryStorage();
  storage.setItem(key, '{invalid json');
  const store = await freshStore();
  assert.equal(store.getState().gameplay.player.credits, 500);
  store.getState().addCredits(10);
  assert.equal(JSON.parse(storage.getItem(key)).state.gameplay.player.credits, 510);

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() { throw new Error('Storage unavailable'); },
  });
  t.mock.method(console, 'warn', () => {});
  const blockedStore = await freshStore();
  assert.doesNotThrow(() => blockedStore.getState().addCredits(10));
  assert.equal(blockedStore.getState().gameplay.player.credits, 510);
});
