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

test('WORKNET-002: WorkNet missions require actual domain work (not generic buttons) and persist completion', async () => {
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

  // Generic verification buttons alone CANNOT complete a WorkNet assignment (WORKNET-002 Option B)
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  store.getState().advanceWorknetMissionStep(mission.id, 'tool_calibrated');
  store.getState().advanceWorknetMissionStep(mission.id, 'subject_inspected');
  store.getState().advanceWorknetMissionStep(mission.id, 'directive_executed');
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);

  // Submitting the wrong domain analysis option is rejected
  const wrongDomain = store.getState().completeWorknetDomainTask(mission.id, 'dga-512-ignore');
  assert.equal(wrongDomain.ok, false);
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);

  // Completing the actual forensic domain analysis (or quarantining PID 512) unlocks mission completion
  const rightDomain = store.getState().completeWorknetDomainTask(mission.id, 'dga-512-valid');
  assert.equal(rightDomain.ok, true);

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

test('HOMECRAFT-001 & SpellForge: Housing purchases grant +40 XP & +10 roomComfort permanently, and SpellForge prevents infinite farming', async () => {
  memoryStorage();
  const store = await freshStore();
  store.getState().addCredits(1000);

  const beforeBuy = store.getState().gameplay.player;
  const buyRes = store.getState().purchaseHousingUpgrade('mattress', 350);
  assert.equal(buyRes.ok, true);

  const afterBuy = store.getState().gameplay.player;
  assert.equal(afterBuy.credits, beforeBuy.credits - 350);
  assert.equal(afterBuy.xp, beforeBuy.xp + 40);
  assert.equal(afterBuy.roomComfort, (beforeBuy.roomComfort ?? 50) + 10);
  assert.equal(afterBuy.dormComfort, (beforeBuy.dormComfort ?? 50) + 10);
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
  assert.equal(restored.getState().gameplay.player.roomComfort, (beforeBuy.roomComfort ?? 50) + 10);
  assert.ok(restored.getState().gameplay.player.forgedSpells.includes('Seal Lock'));
});

test('FAITH-003, MAI.SPACE-004, and Formal Case Reasoning enforce canonical progression rules', async () => {
  memoryStorage();
  const store = await freshStore();

  // 1. FAITH-003 (Option C): Personal healthcare vs. Professional patient-care assignments
  store.getState().damageAura(45); // Lower aura to 55% to verify personal health restoration
  const preScanTreat = store.getState().treatFaithCondition('Veilwilt');
  assert.equal(preScanTreat.ok, false);
  assert.ok(store.getState().gameplay.player.conditions.includes('Veilwilt'));

  // Routine personal scan restores +20% Aura Integrity & +10 Stamina, with 0 Credits and 0 XP
  const beforeScan = store.getState().gameplay.player;
  const scan1 = store.getState().runFaithDiagnosticScan();
  assert.equal(scan1.ok, true);
  assert.equal(store.getState().gameplay.player.credits, beforeScan.credits);
  assert.equal(store.getState().gameplay.player.xp, beforeScan.xp);
  assert.equal(store.getState().gameplay.player.auraHealth, beforeScan.auraHealth + 20);
  assert.equal(store.getState().gameplay.player.faithDiagnosed, true);

  // Repeat scan in same cycle is blocked
  assert.equal(store.getState().runFaithDiagnosticScan().ok, false);

  // Cannot treat a condition the player does NOT have
  assert.equal(store.getState().treatFaithCondition('Frostlung').ok, false);

  // Treating active Veilwilt restores +25% Aura Integrity and clears condition, with 0 Credits and 0 XP
  const beforeTreat = store.getState().gameplay.player;
  const validTreat = store.getState().treatFaithCondition('Veilwilt');
  assert.equal(validTreat.ok, true);
  assert.ok(!store.getState().gameplay.player.conditions.includes('Veilwilt'));
  assert.equal(store.getState().gameplay.player.xp, beforeTreat.xp);
  assert.equal(store.getState().gameplay.player.credits, beforeTreat.credits);
  assert.equal(store.getState().gameplay.player.auraHealth, Math.min(100, beforeTreat.auraHealth + 25));

  // Repeat treatment of already-cured Veilwilt is rejected
  assert.equal(store.getState().treatFaithCondition('Veilwilt').ok, false);

  // Professional Medical Work: Completing inpatient care awards Medical Career XP & Credits and unlocks ms-shift-01
  const beforePatientCare = store.getState().gameplay.player;
  const badPatientCare = store.getState().completePatientCareAssignment('pc-mercer', 'diag-frostlung', 'tx-cryo-immersion');
  assert.equal(badPatientCare.ok, false);

  const goodPatientCare = store.getState().completePatientCareAssignment('pc-mercer', 'diag-veilwilt-desync', 'tx-warm-compress-vitals');
  assert.equal(goodPatientCare.ok, true);
  const afterPatientCare = store.getState().gameplay.player;
  assert.ok(
    afterPatientCare.careers.medical.rankIndex > (beforePatientCare.careers.medical.rankIndex || 0) ||
    afterPatientCare.careers.medical.xp > (beforePatientCare.careers.medical.xp || 0)
  );
  assert.equal(afterPatientCare.credits, beforePatientCare.credits + 220);
  assert.ok(afterPatientCare.completedPatientCareIds.includes('pc-mercer'));

  // 2. MAI.SPACE-004 (Option C): First-time onboarding grants +75 XP & +100 credits; ongoing social actions affect relationships/reputation only
  const beforeJeremie = store.getState().gameplay.player;
  assert.equal(store.getState().acceptMaiSpaceFriend('jeremie').ok, true);
  const afterJeremie = store.getState().gameplay.player;
  assert.equal(afterJeremie.credits, beforeJeremie.credits + 100);
  assert.equal(afterJeremie.xp, beforeJeremie.xp + 75);
  assert.equal(store.getState().acceptMaiSpaceFriend('jeremie').ok, false);

  store.getState().updateMaiSpaceProfile({ handle: 'Cipher_Valkyrie', headerFont: 'Yeseva One' });
  const beforeSocial = store.getState().gameplay.player;
  assert.equal(store.getState().postMaiSpaceBulletin('Verified Sector 7 conduit telemetry.').ok, true);
  assert.equal(store.getState().pingMaiSpaceFriend('aelita').ok, true);
  const afterSocial = store.getState().gameplay.player;
  // Ongoing social actions grant 0 XP and 0 credits, while increasing campus reputation & NPC friendship/trust
  assert.equal(afterSocial.xp, beforeSocial.xp);
  assert.equal(afterSocial.credits, beforeSocial.credits);
  assert.ok(afterSocial.reputation.campus > beforeSocial.reputation.campus);
  assert.ok(afterSocial.npcVectors.aelita.friendship > beforeSocial.npcVectors.aelita.friendship);

  // 3. Formal Case Reasoning: rejects wrong hypothesis or unverified rumor exhibit, rewards valid reasoning once
  const badCase = store.getState().submitInvestigationCase(
    'CASE-FM-401',
    ['ev-aura-scan', 'ev-cafeteria-log'],
    'hyp-coolant'
  );
  assert.equal(badCase.ok, false);

  const goodCase = store.getState().submitInvestigationCase(
    'CASE-FM-401',
    ['ev-aura-scan', 'ev-prism-pid512'],
    'hyp-prism-bleed'
  );
  assert.equal(goodCase.ok, true);
  assert.ok(store.getState().gameplay.player.solvedInvestigationCaseIds.includes('CASE-FM-401'));

  // Cannot claim case reward a second time
  const duplicateCase = store.getState().submitInvestigationCase(
    'CASE-FM-401',
    ['ev-aura-scan', 'ev-prism-pid512'],
    'hyp-prism-bleed'
  );
  assert.equal(duplicateCase.ok, false);

  // Verify persistence across reload and WorldEventLog population
  const reloaded = await freshStore();
  assert.equal(reloaded.getState().gameplay.player.faithDiagnosed, true);
  assert.ok(!reloaded.getState().gameplay.player.conditions.includes('Veilwilt'));
  assert.ok(reloaded.getState().gameplay.player.completedPatientCareIds.includes('pc-mercer'));
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

test('AureMail Decisions 006-011 enforce multi-account MAID links, persisted mailbox state, hybrid replies, clearance gates, and separated file vs. reward attachments', async () => {
  memoryStorage();
  const osStore = await freshStore();
  const commsMod = await import(`../src/store/useCommsStore.ts?t=${Date.now()}-${Math.random()}`);
  const maidMod = await import(`../src/services/maidIdentityService.ts?t=${Date.now()}-${Math.random()}`);
  const comms = commsMod.useCommsStore;

  // 1. Decision 009 & 010: Multiple verified accounts per citizen & player
  assert.ok(comms.getState().playerAccounts.length >= 4);
  const persons = await maidMod.MaidIdentityService.getAllPersons();
  assert.ok(persons.length >= 3);
  assert.ok(Array.isArray(persons[0].emailAccounts) && persons[0].emailAccounts.length >= 2);
  const lookupBySecondaryEmail = await maidMod.MaidIdentityService.lookupPerson(persons[0].emailAccounts[1].address);
  assert.equal(lookupBySecondaryEmail.status, 'found');
  assert.equal(lookupBySecondaryEmail.person.maid, persons[0].maid);

  // 2. Persisted star, archive, trash, and read states
  comms.getState().toggleStarEmail('MSG-001');
  comms.getState().toggleArchiveEmail('MSG-002');
  comms.getState().markEmailRead('MSG-001', true);
  assert.ok(comms.getState().starredEmailIds.includes('MSG-001'));
  assert.ok(comms.getState().archivedEmailIds.includes('MSG-002'));
  assert.ok(comms.getState().readEmailIds.includes('MSG-001'));

  // 3. Decision 011: Ordinary file/record/form attachments NEVER award automatic credits/XP
  const msg1 = comms.getState().emails.find((m) => m.id === 'MSG-001');
  const regDoc = msg1.attachments.find((a) => a.id === 'att-reg-card');
  const regGrant = msg1.attachments.find((a) => a.id === 'att-reg-grant');
  assert.equal(regDoc.isReward, false);
  assert.equal(regDoc.amount, 0);
  assert.equal(regGrant.isReward, true);
  assert.equal(regGrant.amount, 100);

  const beforeFileSave = osStore.getState().gameplay.player;
  const vaultRes = comms.getState().saveAttachmentToVault('MSG-001', 'att-reg-card');
  assert.equal(vaultRes.ok, true);
  // Attempting to call claimCommsAttachment with 0 or undefined values awards nothing
  osStore.getState().claimCommsAttachment('MSG-001_att-reg-card', 0, 0);
  assert.equal(osStore.getState().gameplay.player.credits, beforeFileSave.credits);
  assert.equal(osStore.getState().gameplay.player.xp, beforeFileSave.xp);

  // Claiming the verified grant awards +100 credits and +50 XP exactly once
  osStore.getState().claimCommsAttachment('MSG-001_att-reg-grant', regGrant.amount, regGrant.xp);
  assert.equal(osStore.getState().gameplay.player.credits, beforeFileSave.credits + 100);
  assert.equal(osStore.getState().gameplay.player.xp, beforeFileSave.xp + 50);
  osStore.getState().claimCommsAttachment('MSG-001_att-reg-grant', regGrant.amount, regGrant.xp);
  assert.equal(osStore.getState().gameplay.player.credits, beforeFileSave.credits + 100);

  // Submitting an .osform attachment creates an official filing receipt without awarding currency
  const formRes = comms.getState().submitAttachmentForm('MSG-004', 'att-aura-consent', 'Verified citizen attestation');
  assert.equal(formRes.ok, true);
  assert.ok(formRes.replyEmail.subject.includes('Form Filing Receipt'));

  // 4. Decision 007 & 008: Replying to an email appends to thread and generates a hybrid institutional/NPC response
  const replyRes = comms.getState().replyToEmail('MSG-009', 'I analyzed the 88.2 MHz harmonic trace in Lab 4!', {
    fromAddress: 'scholar@cyacademy.edu',
    playerClearance: 1,
  });
  assert.equal(replyRes.ok, true);
  assert.equal(replyRes.sentMessage.folder, 'sent');
  assert.equal(replyRes.autoReplyMessage.folder, 'inbox');
  assert.equal(replyRes.autoReplyMessage.threadId, 'THR-009');
  assert.ok(replyRes.autoReplyMessage.body.includes('88.2 MHz'));

  // Clearance gate: Sending to Level 3 DGA High Command with Level 1 clearance holds message in Outbox
  const blockedRes = comms.getState().sendEmail({
    fromAddress: 'liaison@dga.gov',
    toAddress: 'command.classified@dga.gov',
    subject: 'Requesting Compartmented Dossier',
    body: 'Requesting Level 3 access.',
    playerClearance: 1,
  });
  assert.equal(blockedRes.ok, false);
  assert.equal(blockedRes.deliveryStatus, 'blocked_clearance');
  assert.equal(blockedRes.sentMessage.folder, 'outbox');
});

