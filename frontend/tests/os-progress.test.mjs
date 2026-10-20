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
function discoverFactoryLead(store) {
  store.getState().visitAurelinePlace('platform');
  store.getState().observeDiscovery('platform-hum');
  store.getState().recordFileInspection('net-relay');
  store.getState().visitAurelinePlace('junction');
  assert.equal(store.getState().observeDiscovery('old-factory-lead').ok, true);
}

test('unknown and reserved assignment IDs are rejected without changing progress', async () => {
  memoryStorage();
  const store = await freshStore();
  const before = store.getState().gameplay;
  for (const id of ['missing-assignment', 'constructor', '__proto__', 'toString']) {
    assert.equal(store.getState().openWorknetOrder(id).ok, false);
    assert.equal(store.getState().completeWorknetDomainTask(id, 'anything').ok, false);
    assert.equal(store.getState().completeWorknetMission({ id, track: 'engineer', rewardCredits: 100, rewardXP: 100 }).ok, false);
    assert.equal(store.getState().startAssignment(id).ok, false);
    assert.equal(store.getState().claimActivityUnlock(id).ok, false);
    store.getState().openAssignment(id);
  }
  assert.deepEqual(store.getState().gameplay, before);
});

test('malformed work-stage values return validation feedback instead of throwing', async () => {
  const { WORK_DEFINITIONS, validateWorkStage } = await import('../src/gameplay/ActivityEngine.ts');
  const stage = Object.values(WORK_DEFINITIONS).flatMap(definition => definition.stages).find(stage => stage.fields.some(field => field.dangerous?.length));
  for (const invalid of [null, {}, { nested: true }, true, 42]) {
    const values = invalid === null ? null : Object.fromEntries(stage.fields.map(field => [field.id, invalid]));
    const result = validateWorkStage(stage, values);
    assert.equal(result.ok, false);
    assert.equal(result.severity, 'minor');
  }
});

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

  // A correct plan is only one task; it cannot stand in for the containment operation.
  const rightDomain = store.getState().completeWorknetDomainTask(mission.id, 'dga-512-valid');
  assert.equal(rightDomain.ok, true);
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  assert.equal(store.getState().openWorknetOrder(mission.id).ok, true);
  assert.equal(store.getState().acknowledgeAssignmentBriefing(mission.id).ok, true);
  assert.equal(store.getState().submitWorknetStage(mission.id, 'inspect', { pid: '512', frequency: '88.2' }).ok, true);
  assert.equal(store.getState().submitWorknetStage(mission.id, 'contain', { team: 'Hazmat-01 and Patrol-12', seal: 'SealLockCrypt' }).ok, true);
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  assert.equal(store.getState().submitWorknetStage(mission.id, 'report', { report: 'PID 512 at Tunnel 09 emitted 88.2 MHz memory bleed; the containment seal is verified.' }).ok, true);

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

test('GAMEPLAY-012 & GAMEPLAY-013: Rest restores stamina/health conditionally without repeatable XP, and career promotions require profession qualifications beyond raw XP', async () => {
  memoryStorage();
  const store = await freshStore();

  // 1. GAMEPLAY-012 (Option C): Ordinary sleep does NOT grant repeatable general XP; recovery scales with duration, upgrades, and conditions
  store.getState().damageAura(40); // Aura drops to 60
  const xpBeforeRest = store.getState().gameplay.player.xp;
  const cycleBeforeRest = store.getState().gameplay.timeCycleCount;

  // First calibration rest unlocks Special Lore Dream #05, advances cycle, and recovers Stamina/Aura (capped at 90/85 due to untreated Veilwilt and no Aura Lamp)
  const firstRest = store.getState().restInDorm('full');
  assert.equal(firstRest.ok, true);
  assert.ok(firstRest.unlockedSpecialDream);
  assert.equal(store.getState().gameplay.player.xp, xpBeforeRest); // 0 general XP from sleeping!
  assert.equal(store.getState().gameplay.timeCycleCount, cycleBeforeRest + 1);
  assert.equal(store.getState().gameplay.player.auraHealth, 85); // Capped at 85 while Veilwilt is untreated and no Aura Lamp

  // Subsequent ordinary sleep grants 0 XP and does not re-trigger the already unlocked special dream
  const secondRest = store.getState().restInDorm('short');
  assert.equal(store.getState().gameplay.player.xp, xpBeforeRest);
  assert.equal(secondRest.unlockedSpecialDream, null);

  // Installing Aura Lamp and resting overnight restores Aura to 100% and soothes Veilwilt
  store.getState().addCredits(1000);
  store.getState().purchaseHousingUpgrade('aura_lamp', 600);
  const xpAfterUpgrade = store.getState().gameplay.player.xp;
  store.getState().restInDorm('full');
  assert.equal(store.getState().gameplay.player.xp, xpAfterUpgrade);
  assert.equal(store.getState().gameplay.player.auraHealth, 100);
  assert.equal(store.getState().gameplay.player.stamina, 100);

  // 2. GAMEPLAY-013 (Options C + D): Accumulating Career XP alone does NOT auto-promote a physician or an artist
  store.getState().addCareerXP('medical', 300);
  assert.equal(store.getState().gameplay.player.careers.medical.xp, 300);
  assert.equal(store.getState().gameplay.player.careers.medical.rankIndex, 0);

  // Attempting promotion to Junior Bio-Aura Clinician (Rank 1) without clinical patient care or forensic case is rejected
  const deniedMedPromo = store.getState().requestCareerPromotion('medical');
  assert.equal(deniedMedPromo.ok, false);
  assert.equal(store.getState().gameplay.player.careers.medical.rankIndex, 0);

  // Completing actual clinical patient care ('pc-mercer') + Faith reputation satisfies the Clinical Credentials pathway
  const careRes = store.getState().completePatientCareAssignment('pc-mercer', 'diag-veilwilt-desync', 'tx-warm-compress-vitals');
  assert.equal(careRes.ok, true);
  const approvedMedPromo = store.getState().requestCareerPromotion('medical');
  assert.equal(approvedMedPromo.ok, true);
  assert.equal(store.getState().gameplay.player.careers.medical.rankIndex, 1);
  assert.equal(store.getState().gameplay.player.careers.medical.title, 'Junior Bio-Aura Clinician');

  // Artist pathway: Accumulating XP alone does not promote; portfolio/commissions + reputation unlocks promotion without needing a medical/DGA degree
  store.getState().addCareerXP('artist', 150);
  assert.equal(store.getState().gameplay.player.careers.artist.rankIndex, 0);
  const deniedArtPromo = store.getState().requestCareerPromotion('artist');
  assert.equal(deniedArtPromo.ok, false);

  // Synthesizing a new work in SpellForge builds the portfolio and allows Artist Rank 1 promotion
  store.getState().compileSpellProtocol({
    name: 'Luminous Chorus',
    combo: 'Light.mod + Resonance.mod',
    type: 'Performance Synthesis',
    desc: 'Holographic harmonic projection',
    power: 130,
    isCanonical: true,
  });
  const approvedArtPromo = store.getState().requestCareerPromotion('artist');
  assert.equal(approvedArtPromo.ok, true);
  assert.equal(store.getState().gameplay.player.careers.artist.rankIndex, 1);
  assert.equal(store.getState().gameplay.player.careers.artist.title, 'Independent Commission Artist');
});




const { WORK_DEFINITIONS, WORKNET_ASSIGNMENTS, evaluateLinkedActivities } = await import('../src/gameplay/ActivityEngine.ts');
const { evaluateWorknetObjective } = await import('../src/gameplay/WorldEventEngine.ts');
const repairWork = [
  ['preflight', { site: 'Terminal Junction 12', kit: 'Oscilloscope, flasher and soldering kit' }],
  ['inspect', { node: 'C4', loss: '18' }],
  ['diagnose', { test: 'Voltage across C4', drop: '4.2', component: 'C4' }],
  ['repair', { power: 'Isolated and locked out', part: '470 µF capacitor at C4', bus: 'Reconnected after replacement' }],
  ['verify', { firmware: 'Bus Telemetry v2.4', voltage: '5', loss: '0' }],
  ['report', { report: 'GL-12A: isolated power, replaced C4 with 470 µF capacitor, restored v2.4 firmware. Final output 5 V, packet loss 0%.' }],
];
test('opportunity availability reflects clearance, paid shifts, new cycles and permanent completions', async () => {
  const { getOpportunity, opportunityStatus, OPPORTUNITIES } = await import('../src/gameplay/AssignmentFlow.ts');
  assert.deepEqual(new Set(OPPORTUNITIES.map(item => item.kind)), new Set(['quest', 'mission', 'journey', 'adventure']));
  const player = { clearanceLevel: 0, completedWorknetMissionIds: [], worknetOrders: {} };
  assert.equal(opportunityStatus(getOpportunity('ms-shift-04'), player, 2), 'Clearance 1 required');
  player.clearanceLevel = 2;
  player.worknetOrders['ms-shift-04'] = { status: 'accepted', cycle: 2 };
  assert.equal(opportunityStatus(getOpportunity('ms-shift-04'), player, 2), 'Completed');
  assert.equal(opportunityStatus(getOpportunity('ms-shift-04'), player, 3), 'Available');
  player.completedWorknetMissionIds.push('qn-02');
  assert.equal(opportunityStatus(getOpportunity('qn-02'), player, 3), 'Completed');
});
function submitWork(store, id, entries) {
  for (const [stage, values] of entries) assert.equal(store.getState().submitWorknetStage(id, stage, values).ok, true, `${id}/${stage}`);
}
function openRepair(store) {
  assert.equal(store.getState().acceptEmployment('engineer').ok, true);
  assert.equal(store.getState().openWorknetOrder('ms-shift-04').ok, true);
  assert.equal(store.getState().acknowledgeAssignmentBriefing('ms-shift-04').ok, true);
}

test('assignment dispatches arrive once by email and phone, with persistent call history', async () => {
  memoryStorage();
  const store = await freshStore();
  const { useCommsStore } = await import('../src/store/useCommsStore.ts');
  useCommsStore.setState({ emails: useCommsStore.getState().emails.filter(mail => !mail.id.startsWith('JOB-DISPATCH:')) });
  store.getState().loginUser({ name: 'Dispatch Tester', credits: 500, level: 1 });
  const before = store.getState().gameplay.player.credits;
  store.getState().refreshAssignmentDispatches();
  const emails = useCommsStore.getState().emails.filter(mail => mail.id.startsWith('JOB-DISPATCH:'));
  assert.ok(emails.length >= 2);
  assert.ok(emails.every(mail => mail.assignmentId && mail.attachments.every(attachment => !attachment.isReward)));
  assert.equal(store.getState().gameplay.player.assignmentJournal.dispatches['adventure-old-factory'], undefined, 'mystery invitation waits for a contextual lead');
  discoverFactoryLead(store);
  assert.ok(store.getState().gameplay.player.assignmentJournal.dispatches['adventure-old-factory']);
  store.getState().refreshAssignmentDispatches();
  assert.equal(useCommsStore.getState().emails.filter(mail => mail.id.startsWith('JOB-DISPATCH:')).length, emails.length);
  store.getState().answerAssignmentCall('adventure-old-factory');
  const heardAt = store.getState().gameplay.player.assignmentJournal.dispatches['adventure-old-factory'].heardAt;
  store.getState().answerAssignmentCall('adventure-old-factory');
  assert.equal(store.getState().gameplay.player.credits, before);
  const restored = await freshStore();
  assert.equal(restored.getState().gameplay.player.assignmentJournal.dispatches['adventure-old-factory'].heardAt, heardAt);
  restored.getState().refreshAssignmentDispatches();
  assert.equal(useCommsStore.getState().emails.filter(mail => mail.id.startsWith('JOB-DISPATCH:')).length, emails.length);
});

test('choosing a quest saves its briefing, requires review, and produces one accepted completion receipt', async () => {
  memoryStorage();
  const store = await freshStore();
  const mission = WORKNET_ASSIGNMENTS['qn-02'];
  store.getState().openAssignment(mission.id);
  store.getState().openAssignment(mission.id);
  assert.equal(store.getState().windows.filter(window => window.id === 'jobs').length, 1);
  assert.equal(store.getState().windows.find(window => window.id === 'jobs').isMinimized, false);
  const initial = store.getState().gameplay.player.credits;
  assert.equal(store.getState().startAssignment(mission.id).ok, true);
  let journal = store.getState().gameplay.player.assignmentJournal;
  assert.match(journal.files[`briefing:${mission.id}`].body, /East Fountain Bench/);
  assert.equal(journal.files[`objectives:${mission.id}`].dir, '/assignments/qn-02');
  assert.equal(store.getState().gameplay.player.credits, initial);
  assert.match(store.getState().submitWorknetStage(mission.id, 'search', { site: 'East Fountain Bench' }).message, /briefing/);
  assert.equal(store.getState().acknowledgeAssignmentBriefing(mission.id).ok, true);
  submitWork(store, mission.id, [ ['search', { site: 'East Fountain Bench' }], ['identify', { metal: 'silver', movement: 'Mechanical gears' }], ['return', { receipt: 'WATCH-RETURN' }] ]);
  assert.equal(store.getState().completeWorknetMission(mission).ok, true);
  const order = store.getState().gameplay.player.worknetOrders[mission.id];
  journal = store.getState().gameplay.player.assignmentJournal;
  assert.match(journal.files[`completion:${order.id}`].body, /WATCH-RETURN/);
  assert.equal(store.getState().gameplay.player.credits, initial + mission.rewardCredits);
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  const restored = await freshStore();
  assert.ok(restored.getState().gameplay.player.assignmentJournal.files[`completion:${order.id}`]);
  assert.ok(restored.getState().gameplay.player.worknetOrders[mission.id].briefingReadAt);
  assert.equal(restored.getState().startAssignment(mission.id).ok, false);
});

test('adventure unlocks require started activities and accepted work, persist, and do not repay shared tasks', async () => {
  memoryStorage();
  const store = await freshStore();
  store.getState().loginUser({ name: 'Adventure Tester', credits: 500, level: 1 });
  store.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, clearanceLevel: 5, stamina: 100 } } }));
  assert.equal(store.getState().claimActivityUnlock('adventure-old-factory').ok, false);
  discoverFactoryLead(store);
  assert.equal(store.getState().startAssignment('adventure-old-factory').ok, true);
  assert.equal(store.getState().chooseAdventureApproach('adventure-old-factory', 'coordinate').ok, true);
  const initial = store.getState().gameplay.player.credits;
  let pay = 0;
  for (const id of ['ms-shift-04', 'ms-spec-01', 'ms-spec-03']) {
    const definition = WORK_DEFINITIONS[id];
    if (definition.kind === 'shift') store.getState().acceptEmployment(definition.track);
    assert.equal(store.getState().startAssignment(id).ok, true);
    assert.equal(store.getState().acknowledgeAssignmentBriefing(id).ok, true);
    for (const stage of definition.stages) {
      const values = Object.fromEntries(stage.fields.map(field => [field.id, field.kind === 'report' ? `Verified field report: ${field.contains.join(' ')}. Findings and equipment reviewed and preserved.` : field.expected]));
      assert.equal(store.getState().submitWorknetStage(id, stage.id, values).ok, true);
    }
    assert.equal(store.getState().claimActivityUnlock('adventure-old-factory').ok, false, 'final work must be submitted for acceptance');
    assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[id]).ok, true);
    pay += WORKNET_ASSIGNMENTS[id].rewardCredits;
  }
  assert.equal(store.getState().claimActivityUnlock('adventure-old-factory').ok, true);
  assert.equal(store.getState().gameplay.player.credits, initial + pay);
  const journal = store.getState().gameplay.player.assignmentJournal;
  assert.ok(journal.unlocks.includes('Old Factory Ward sealed archive'));
  assert.match(journal.files['unlock:adventure-old-factory'].body, /Seraphima/);
  assert.equal(store.getState().claimActivityUnlock('adventure-old-factory').ok, false);
  assert.ok(journal.dispatches['journey-engineering'], 'accepted engineering work releases a follow-up opportunity');
  const restored = await freshStore();
  assert.equal(restored.getState().claimActivityUnlock('adventure-old-factory').ok, false);
  assert.equal(restored.getState().gameplay.player.credits, initial + pay);
});

test('GAMEPLAY-018: unrelated activity, legacy completion flags and procedure plans cannot verify any assignment', async () => {
  memoryStorage();
  const store = await freshStore();
  const unrelated = { ...store.getState().gameplay.player,
    completedPatientCareIds: ['pc-vale'], quarantinedProcessPids: [512, 660], forgedSpells: ['Reflect Shield', 'Seal Lock'],
    inspectedFiles: ['purge-archive', 'aethercore-sys'], solvedInvestigationCaseIds: ['CASE-FM-401', 'CASE-DGA-402'],
    claimedPortalActionIds: ['bank-wire-0994'], discoveredShrines: ['Orynvell'], housingCalibrated: true, lineageDecrypted: true,
    worknetMissionProgress: Object.fromEntries(Object.keys(WORK_DEFINITIONS).map(id => [id, ['domain_objective_verified']])),
  };
  for (const [id, definition] of Object.entries(WORK_DEFINITIONS)) {
    assert.equal(evaluateWorknetObjective(id, definition.track, unrelated).verified, false, id);
  }
  assert.equal(evaluateWorknetObjective('unknown', 'medical', unrelated).verified, false);
});

test('GAMEPLAY-018: engineering requires all six stages; drafts, outputs and pay survive reload', async () => {
  memoryStorage();
  let store = await freshStore();
  const mission = WORKNET_ASSIGNMENTS['ms-shift-04'];
  assert.equal(store.getState().openWorknetOrder(mission.id).ok, false, 'employment is distinct from work');
  openRepair(store);
  assert.equal(store.getState().submitWorknetStage(mission.id, 'report', repairWork[5][1]).ok, false);
  submitWork(store, mission.id, repairWork.slice(0, 2));
  store.getState().saveWorknetDraft(mission.id, 'diagnose', { test: 'Voltage across C4', drop: '4.2', component: 'C4' });
  store = await freshStore();
  assert.equal(store.getState().gameplay.player.worknetOrders[mission.id].drafts.diagnose.drop, '4.2');
  submitWork(store, mission.id, repairWork.slice(2, 5));
  assert.equal(store.getState().completeWorknetMission(mission).ok, false, 'report is required');
  const beforeReport = store.getState().gameplay.player;
  submitWork(store, mission.id, repairWork.slice(5));
  assert.equal(Object.keys(store.getState().gameplay.player.taskResults).length, 6);
  const beforeClaim = store.getState().gameplay.player;
  assert.equal(store.getState().completeWorknetMission({ ...mission, rewardCredits: 999999 }).ok, true);
  const afterClaim = store.getState().gameplay.player;
  assert.equal(afterClaim.credits - beforeClaim.credits, 230, 'catalog compensation is authoritative');
  assert.equal(afterClaim.careers.engineer.xp - beforeClaim.careers.engineer.xp, 150);
  assert.equal(store.getState().submitWorknetStage(mission.id, 'report', repairWork[5][1]).ok, false);
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  assert.equal(store.getState().gameplay.player.credits, afterClaim.credits);
  assert.equal(store.getState().gameplay.player.taskResults[Object.keys(beforeReport.taskResults)[0]].subject, 'GL-12A');
  store = await freshStore();
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  assert.equal(store.getState().gameplay.player.worknetOrders[mission.id].status, 'accepted');
  assert.equal(Object.keys(store.getState().gameplay.player.taskResults).length, 6);
});

test('GAMEPLAY-019: minor errors are correctable; unsafe repair loses supplies and requires remediation', async () => {
  memoryStorage();
  let store = await freshStore();
  openRepair(store);
  submitWork(store, 'ms-shift-04', repairWork.slice(0, 2));
  assert.equal(store.getState().submitWorknetStage('ms-shift-04', 'diagnose', { test: 'Voltage across C4', drop: '1', component: 'C1' }).ok, false);
  let order = store.getState().gameplay.player.worknetOrders['ms-shift-04'];
  assert.equal(order.evaluation, 98);
  assert.equal(order.resourcesUsed, 0);
  assert.equal(order.resultIds.length, 2);
  submitWork(store, 'ms-shift-04', repairWork.slice(2, 3));
  assert.equal(store.getState().submitWorknetStage('ms-shift-04', 'repair', { power: 'Energized', part: '470 µF capacitor at C4', bus: 'Reconnected after replacement' }).ok, false);
  store = await freshStore();
  order = store.getState().gameplay.player.worknetOrders['ms-shift-04'];
  assert.equal(order.evaluation, 83);
  assert.equal(order.resourcesUsed, 1);
  assert.equal(order.remediationRequired, true);
  assert.equal(store.getState().submitWorknetStage('ms-shift-04', 'repair', repairWork[3][1]).ok, false);
  assert.equal(store.getState().remediateWorknetOrder('ms-shift-04', 'done').ok, false);
  assert.equal(store.getState().remediateWorknetOrder('ms-shift-04', 'Isolated transit equipment and requested supervisor review before a safe repair.').ok, true);
  submitWork(store, 'ms-shift-04', repairWork.slice(3));
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['ms-shift-04']).ok, true);
  assert.equal(store.getState().gameplay.player.worknetOrders['ms-shift-04'].evaluation, 83);
});

test('GAMEPLAY-018: the same diagnostic receipt feeds separate quest, journey and adventure requirements', async () => {
  memoryStorage();
  const store = await freshStore();
  openRepair(store);
  submitWork(store, 'ms-shift-04', repairWork.slice(0, 3));
  const player = store.getState().gameplay.player;
  let progress = evaluateLinkedActivities(player.taskResults);
  const diagnosticId = `${player.worknetOrders['ms-shift-04'].id}:diagnose`;
  assert.deepEqual(progress.find(activity => activity.kind === 'quest').milestones[0].resultIds, [diagnosticId]);
  assert.equal(progress.find(activity => activity.kind === 'adventure').milestones[0].complete, false, 'repair report is still required');
  assert.ok(progress.every(activity => !activity.complete));
  const before = store.getState().gameplay.player;
  evaluateLinkedActivities(before.taskResults);
  assert.deepEqual(store.getState().gameplay.player, before, 'reading progress cannot re-award task rewards');
  submitWork(store, 'ms-shift-04', repairWork.slice(3));
  progress = evaluateLinkedActivities(store.getState().gameplay.player.taskResults);
  assert.equal(progress.find(activity => activity.kind === 'journey').milestones[0].complete, true);
  assert.ok(progress.find(activity => activity.kind === 'adventure').milestones[0].resultIds.includes(diagnosticId));
  assert.ok(progress.every(activity => !activity.complete), 'one repair cannot complete a career or an adventure');
});

test('work-order scope: copied receipts and wrong tracks cannot verify a different assignment', async () => {
  memoryStorage();
  const store = await freshStore();
  openRepair(store);
  submitWork(store, 'ms-shift-04', repairWork);
  const player = store.getState().gameplay.player;
  assert.equal(evaluateWorknetObjective('ms-shift-04', 'medical', player).verified, false);
  assert.equal(evaluateWorknetObjective('ms-shift-02', 'archivist', { ...player, worknetOrders: { 'ms-shift-02': player.worknetOrders['ms-shift-04'] } }).verified, false);
  const broken = { ...player, taskResults: { ...player.taskResults } };
  const resultId = player.worknetOrders['ms-shift-04'].resultIds[0];
  broken.taskResults[resultId] = { ...broken.taskResults[resultId], subject: 'GL-OTHER' };
  assert.equal(evaluateWorknetObjective('ms-shift-04', 'engineer', broken).verified, false);
});

test('repeat shifts use new cycle identities and require fresh work without reopening one-time rewards', async () => {
  memoryStorage();
  let store = await freshStore();
  openRepair(store);
  submitWork(store, 'ms-shift-04', repairWork);
  const mission = WORKNET_ASSIGNMENTS['ms-shift-04'];
  const firstId = store.getState().gameplay.player.worknetOrders[mission.id].id;
  assert.equal(store.getState().completeWorknetMission(mission).ok, true);
  assert.equal(store.getState().openWorknetOrder(mission.id).ok, false);
  store.getState().restInDorm('full');
  assert.equal(store.getState().openWorknetOrder(mission.id).ok, true);
  assert.equal(store.getState().acknowledgeAssignmentBriefing(mission.id).ok, true);
  assert.notEqual(store.getState().gameplay.player.worknetOrders[mission.id].id, firstId);
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  submitWork(store, mission.id, repairWork);
  const before = store.getState().gameplay.player.credits;
  assert.equal(store.getState().completeWorknetMission(mission).ok, true);
  assert.equal(store.getState().gameplay.player.credits - before, 230);
  store = await freshStore();
  assert.equal(store.getState().gameplay.player.rewardedWorkOrderIds.length, 2);
  assert.equal(Object.keys(store.getState().gameplay.player.taskResults).length, 12);
  assert.equal(store.getState().openWorknetOrder(mission.id).ok, false);
});

test('clinical receipt: correct patient care supplies one task, requires a chart, and pays only once across apps', async () => {
  memoryStorage();
  const store = await freshStore();
  store.getState().completePatientCareAssignment('pc-vale', 'diag-frostlung-exposure', 'tx-thermal-thaw-seal');
  assert.equal(store.getState().acceptEmployment('medical').ok, true);
  assert.equal(store.getState().openWorknetOrder('ms-shift-01').ok, true);
  assert.equal(store.getState().acknowledgeAssignmentBriefing('ms-shift-01').ok, true);
  assert.equal(store.getState().gameplay.player.worknetOrders['ms-shift-01'].resultIds.length, 0, 'another patient is not Mercer');
  const before = store.getState().gameplay.player;
  assert.equal(store.getState().completePatientCareAssignment('pc-mercer', 'diag-veilwilt-desync', 'tx-warm-compress-vitals').ok, true);
  assert.equal(store.getState().gameplay.player.credits - before.credits, 220);
  const receipt = store.getState().gameplay.player.worknetOrders['ms-shift-01'].resultIds[0];
  assert.equal(evaluateWorknetObjective('ms-shift-01', 'medical', store.getState().gameplay.player).verified, false);
  submitWork(store, 'ms-shift-01', [['report', { report: 'Mercer presented with 39.1 C thermal flux and Veilwilt desync. Applied BioCompress-04 and calibrated VITALS telemetry.' }]]);
  const paid = store.getState().gameplay.player;
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['ms-shift-01']).ok, true);
  assert.equal(store.getState().gameplay.player.credits, paid.credits);
  assert.equal(store.getState().gameplay.player.careers.medical.xp, paid.careers.medical.xp);
  assert.equal(store.getState().gameplay.player.worknetOrders['ms-shift-01'].resultIds[0], receipt);
  store.getState().restInDorm('full');
  assert.equal(store.getState().openWorknetOrder('ms-shift-01').ok, false, 'same clinical chart is not a new paid shift');
});

test('clinical work completed before opening WorkNet links the same saved receipt', async () => {
  memoryStorage();
  const store = await freshStore();
  store.getState().completePatientCareAssignment('pc-mercer', 'diag-veilwilt-desync', 'tx-warm-compress-vitals');
  const receipts = Object.keys(store.getState().gameplay.player.taskResults);
  store.getState().acceptEmployment('medical');
  store.getState().openWorknetOrder('ms-shift-01');
  assert.equal(store.getState().acknowledgeAssignmentBriefing('ms-shift-01').ok, true);
  assert.deepEqual(Object.keys(store.getState().gameplay.player.taskResults), receipts);
  assert.deepEqual(store.getState().gameplay.player.worknetOrders['ms-shift-01'].resultIds, receipts);
});

test('environmental work requires three separately labeled specimens, analysis and a report', async () => {
  memoryStorage();
  const store = await freshStore();
  const mission = WORKNET_ASSIGNMENTS['ms-field-01'];
  assert.equal(store.getState().openWorknetOrder(mission.id).ok, true);
  assert.equal(store.getState().acknowledgeAssignmentBriefing(mission.id).ok, true);
  submitWork(store, mission.id, [['collect-soil', { zone: 'C14', specimen: 'soil', container: 'Sealed and labeled' }]]);
  assert.equal(store.getState().submitWorknetStage(mission.id, 'assay', { ionization: '18.4', remedy: 'Crystalline flora chelator' }).ok, false);
  submitWork(store, mission.id, [
    ['collect-water', { zone: 'C14', specimen: 'water', container: 'Sealed and labeled' }],
    ['collect-flora', { zone: 'C14', specimen: 'flora', container: 'Sealed and labeled' }],
    ['assay', { ionization: '18.4', remedy: 'Crystalline flora chelator' }],
  ]);
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  submitWork(store, mission.id, [['report', { report: 'C14 soil, water and flora specimens show 18.4% Veil ionization. Chelator remediation recorded in the grid.' }]]);
  assert.equal(store.getState().completeWorknetMission(mission).ok, true);
});

test('accreditation requires its practical and thesis; civic quests remain available without employment', async () => {
  memoryStorage();
  const store = await freshStore();
  const mission = WORKNET_ASSIGNMENTS['ms-dev-01'];
  assert.equal(store.getState().openWorknetOrder(mission.id).ok, true);
  assert.equal(store.getState().acknowledgeAssignmentBriefing(mission.id).ok, true);
  submitWork(store, mission.id, [
    ['configure', { mode: 'Adaptive harmonic quarantine' }],
    ['practical', { quarantine: '12', preserved: '8' }],
  ]);
  assert.equal(store.getState().completeWorknetMission(mission).ok, false);
  submitWork(store, mission.id, [['report', { report: 'ENG-404 adaptive quarantine isolated 12 PRISM packets while preserving 8 legitimate packets; assessment verified.' }]]);
  assert.equal(store.getState().completeWorknetMission(mission).ok, true);
  store.getState().restInDorm('full');
  assert.equal(store.getState().openWorknetOrder(mission.id).ok, false);
  assert.deepEqual(store.getState().gameplay.player.employmentContracts, {});
  assert.equal(store.getState().openWorknetOrder('qn-02').ok, true);
  assert.equal(store.getState().acknowledgeAssignmentBriefing('qn-02').ok, true);
  submitWork(store, 'qn-02', [
    ['search', { site: 'East Fountain Bench' }], ['identify', { metal: 'silver', movement: 'Mechanical gears' }], ['return', { receipt: 'WATCH-RETURN' }],
  ]);
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['qn-02']).ok, true);
});


test('remaining profession workflows accept their own deliverables and clear exactly once', async (t) => {
  const work = {
    'ms-shift-02': [
      ['restore', { batch: 'LN-892', method: 'Low-field FoilRestorer pass' }],
      ['classify', { index: 'ARC-PRE-892', category: 'Cartography' }],
      ['report', { report: 'LN-892 foil was restored and indexed at ARC-PRE-892 as Pre-Collapse cartography, with preservation complete.' }],
    ],
    'ms-shift-03': [
      ['reconcile', { variance: '1400', account: 'Regional scholarships' }],
      ['validate', { total: '14820', balance: '0' }],
      ['sign', { report: 'Roll 401 scholarship adjustment of 1400 credits reconciles routing with municipal debits.', signature: 'Assigned treasury operator' }],
    ],
    'ms-spec-02': [
      ['decode', { key: 'lightborn', carrier: '88.2' }], ['trace', { recipient: 'Sector 3 relay' }],
      ['report', { report: 'Stream 88A decoded with lightborn on carrier 88.2 MHz; recipient traced to Sector 3 relay.' }],
    ],
    'ms-spec-03': [
      ['decrypt', { dossier: 'RHS-001', key: 'Seraphima harmonic resonance' }], ['verify', { charter: 'Pre-Collapse Seraphima succession' }],
      ['report', { report: 'RHS-001 opened with Seraphima resonance; the succession charter was verified without damaging the parchment.' }],
    ],
    'ms-dev-02': [
      ['hear', { fross: 'solar cores', lumia: 'cryo-coolant' }],
      ['draft', { report: 'Reciprocal cryo-coolant and solar core exchange under parity pricing, with Council arbitration for disputes.' }],
      ['consensus', { fross: 'Signed', lumia: 'Signed' }],
    ],
    'ms-field-02': [
      ['scan', { node: 'BLK-99', anchors: '5' }], ['anchor', { locked: '5', phase: 'Counter-phase' }],
      ['purge', { tool: 'RootPurgeKey', remaining: '0' }],
      ['report', { report: 'BLK-99 stabilized with 5 anchors in counter-phase. Root purge verified 0 recursive glitch blocks remaining.' }],
    ],
    'qn-01': [
      ['pack', { bag: 'Sealed insulated courier bag' }], ['route', { route: 'Shaded Sub-Plaza Conduit', destination: 'Faith Clinic 2' }],
      ['receipt', { receipt: 'CL2-ESSENCE', condition: 'Intact and chilled' }],
    ],
    'qn-03': [
      ['classify', { sequence: '100, 500, 900' }], ['shelve', { count: '40', wing: 'East Wing' }], ['preserve', { method: 'Dry microfiber cloth' }],
    ],
  };
  for (const [id, stages] of Object.entries(work)) await t.test(id, async () => {
    memoryStorage();
    const store = await freshStore();
    const definition = WORK_DEFINITIONS[id];
    if (definition.kind === 'shift') assert.equal(store.getState().acceptEmployment(definition.track).ok, true);
    assert.equal(store.getState().openWorknetOrder(id).ok, true);
    assert.equal(store.getState().acknowledgeAssignmentBriefing(id).ok, true);
    submitWork(store, id, stages);
    const before = store.getState().gameplay.player.credits;
    assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[id]).ok, true);
    assert.equal(store.getState().gameplay.player.credits - before, WORKNET_ASSIGNMENTS[id].rewardCredits);
    assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[id]).ok, false);
  });
});

test('old paid patient charts can be reviewed for evidence without another clinical reward', async () => {
  memoryStorage();
  const store = await freshStore();
  store.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, completedPatientCareIds: ['pc-mercer'] } } }));
  store.getState().acceptEmployment('medical');
  store.getState().openWorknetOrder('ms-shift-01');
  assert.equal(store.getState().acknowledgeAssignmentBriefing('ms-shift-01').ok, true);
  const before = store.getState().gameplay.player.credits;
  submitWork(store, 'ms-shift-01', [
    ['care', { diagnosis: 'Acute Veilwilt Desync', treatment: 'BioCompress-04 and VITALS-Sync' }],
    ['report', { report: 'Mercer 39.1 C thermal flux: Veilwilt treated with BioCompress-04 and VITALS calibration; legacy chart reviewed.' }],
  ]);
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['ms-shift-01']).ok, true);
  assert.equal(store.getState().gameplay.player.credits, before);
});


test('WorkNet clinical stages share the Faith Medical receipt and cannot claim duplicate pay', async () => {
  memoryStorage();
  let store = await freshStore();
  store.getState().acceptEmployment('medical');
  store.getState().openWorknetOrder('ms-shift-01');
  assert.equal(store.getState().acknowledgeAssignmentBriefing('ms-shift-01').ok, true);
  const before = store.getState().gameplay.player;
  submitWork(store, 'ms-shift-01', [['care', { diagnosis: 'Acute Veilwilt Desync', treatment: 'BioCompress-04 and VITALS-Sync' }]]);
  assert.equal(store.getState().gameplay.player.credits - before.credits, 220);
  assert.equal(store.getState().completePatientCareAssignment('pc-mercer', 'diag-veilwilt-desync', 'tx-warm-compress-vitals').ok, false);
  submitWork(store, 'ms-shift-01', [['report', { report: 'Mercer: 39.1 C thermal flux with Veilwilt desync, treated using BioCompress-04 and VITALS calibration.' }]]);
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['ms-shift-01']).ok, true);
  assert.equal(store.getState().gameplay.player.credits - before.credits, 220);
  store = await freshStore();
  assert.equal(store.getState().gameplay.player.taskResults['WORK:ms-shift-01:once:care'].compensationPaid, true);
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['ms-shift-01']).ok, false);
});

test('professional clearance and stamina gates preserve saved work while ordinary quests stay open', async () => {
  memoryStorage();
  const store = await freshStore();
  store.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, clearanceLevel: 0 } } }));
  assert.equal(store.getState().openWorknetOrder('ms-spec-01').ok, false);
  assert.equal(store.getState().acceptEmployment('engineer').ok, false);
  assert.equal(store.getState().openWorknetOrder('qn-02').ok, true);
  assert.equal(store.getState().acknowledgeAssignmentBriefing('qn-02').ok, true);
  store.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, clearanceLevel: 2 } } }));
  openRepair(store);
  submitWork(store, 'ms-shift-04', repairWork);
  store.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, stamina: 0 } } }));
  const before = store.getState().gameplay.player.credits;
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['ms-shift-04']).ok, false);
  assert.equal(store.getState().gameplay.player.credits, before);
  store.getState().restInDorm('full');
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['ms-shift-04']).ok, true);
});
