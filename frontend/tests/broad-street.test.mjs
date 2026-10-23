import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { createJSONStorage } from 'zustand/middleware';
import outlines from '../src/data/report-outlines.json' with { type: 'json' };
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { CASE_MISSION, CASE_MAIL, CASE_ID, CASE_FINDINGS, BROAD_STREET, restoreCaseProgress, reviewBroadStreet, legacyCaseComplete } = await import('../src/gameplay/BroadStreetCase.ts');
const { WORKNET_ASSIGNMENTS } = await import('../src/gameplay/ActivityEngine.ts');
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem: () => {}, removeItem: () => {} } });
globalThis.window = { localStorage: globalThis.localStorage };
const { useCommsStore: mail } = await import('../src/store/useCommsStore.ts');
const { publicCaseSearch, publication } = await import('../src/apps/investigation/publication.ts');
const { readWorldEntries, validSnapshot } = await import('../src/backend/worldSync.ts');
let sequence = 0;
function storage() { const values = new Map(); Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } }); globalThis.window = { localStorage: globalThis.localStorage }; mail.persist.setOptions({ storage: createJSONStorage(() => globalThis.localStorage) }); mail.setState({ emails: [], mailRequest: undefined }); return values; }
async function freshOS() { return (await import(`../src/store/useOSStore.ts?broadstreet=${sequence++}`)).useOSStore; }
const draft = () => ({ text: 'The records support these selected findings. Each source has limits, and the precise timing and individual roles still need independent corroboration.', html: '<p>The records support these selected findings. Each source has limits, and the precise timing and individual roles still need independent corroboration.</p>', findings: Object.fromEntries(CASE_FINDINGS.map(finding => [finding.id, { choice: finding.expected, citations: [...finding.required] }])) });
test('editing then undoing an accepted report restores its receipt without duplicate reviews or rewards', async () => {
  storage(); let os = await freshOS(); os.getState().loginUser({ name: 'Undo Reviewer', isAdmin: true, clearance: 3, credits: 500 });
  os.getState().openWorknetOrder(CASE_MISSION); os.getState().acknowledgeAssignmentBriefing(CASE_MISSION);
  for (const source of BROAD_STREET.sources) {
    if (source.app === 'mail') os.getState().requestCaseStatement();
    os.getState().acquireCaseSource(source.id, source.app);
  }
  const original = draft(); os.getState().saveCaseReport(original);
  assert.equal(os.getState().reviewCaseReport().ok, true);
  const order = structuredClone(os.getState().gameplay.player.worknetOrders[CASE_MISSION]);
  const before = os.getState().gameplay.player.credits;
  os.getState().saveCaseReport({ ...original, text: original.text + ' Temporary edit.', html: `<p>${original.text} Temporary edit.</p>` });
  assert.equal(os.getState().gameplay.player.worknetOrders[CASE_MISSION].resultIds.length, 0);
  os.getState().saveCaseReport(original);
  os = await freshOS();
  assert.equal(os.getState().reviewCaseReport().ok, true);
  assert.equal(os.getState().reviewCaseReport().ok, true);
  const restored = os.getState().gameplay.player.worknetOrders[CASE_MISSION];
  assert.deepEqual(restored.caseProgress.reviews, order.caseProgress.reviews);
  assert.deepEqual(restored.resultIds, [`${order.id}:case-review`]);
  assert.equal(os.getState().gameplay.player.taskResults[restored.resultIds[0]].output.reviewId, order.caseProgress.reviews[0].id);
  assert.equal(os.getState().gameplay.player.credits, before);
  assert.equal(os.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[CASE_MISSION]).ok, true);
  assert.equal(os.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[CASE_MISSION]).ok, false);
  assert.equal(os.getState().gameplay.player.credits, before + 300);
});

test('malformed legacy docket collections do not interrupt dispatch and valid closed records stay closed', async () => {
  for (const cases of [{}, 'broken', 42, null, [null, false, 'broken', {}]]) {
    assert.equal(legacyCaseComplete({}, { cases }), false);
  }
  assert.equal(legacyCaseComplete({ solvedInvestigationCaseIds: {}, completedWorknetMissionIds: {}, rewardedWorkOrderIds: {} }, { cases: [] }), false);
  assert.equal(legacyCaseComplete({}, { cases: [null, 42, { linkedTraceCaseId: CASE_ID, status: 'CLOSED' }] }), true);
  storage(); const os = await freshOS(); os.getState().loginUser({ name: 'Legacy Reader', isAdmin: true, clearance: 3 });
  localStorage.setItem('DGAOS_WORKSTATION_STATE_V3', JSON.stringify({ cases: {} }));
  assert.doesNotThrow(() => os.getState().refreshAssignmentDispatches());
  assert.ok(mail.getState().emails.some(item => item.id === `JOB-DISPATCH:${CASE_MISSION}`));
  assert.ok(mail.getState().emails.some(item => item.id === 'JOB-DISPATCH:ms-shift-04'));
});

test('report outlines and headings do not replace a player explanation, including cached old acceptances', async () => {
  const acquired = BROAD_STREET.sources.map(source => source.id);
  for (const outline of outlines) {
    const template = outline.sections.map(section => `${section}\n[Your findings]`).join('\n');
    const value = { ...draft(), text: template, html: '' };
    assert.ok(reviewBroadStreet(restoreCaseProgress({ acquired, draft: value })).some(message => message.includes('your own explanation')));
    assert.deepEqual(reviewBroadStreet(restoreCaseProgress({ acquired, draft: { ...value, text: template + '\n' + draft().text } })), []);
  }
  storage(); const os = await freshOS(); os.getState().loginUser({ name: 'Outline Reviewer', isAdmin: true, clearance: 3 });
  os.getState().openWorknetOrder(CASE_MISSION); os.getState().acknowledgeAssignmentBriefing(CASE_MISSION);
  const template = outlines[0].sections.map(section => `${section}\n[Your findings]`).join('\n');
  const value = { ...draft(), text: template, html: `<p>${template}</p>` };
  os.setState(state => {
    const player = state.gameplay.player, order = player.worknetOrders[CASE_MISSION];
    const progress = restoreCaseProgress({ acquired, draft: value });
    progress.reviews = [{ id: 'old-acceptance', submittedAt: '2026-10-23T00:00:00Z', version: progress.version, acquired, draft: progress.draft, accepted: true, feedback: ['Accepted by the previous length check.'] }];
    return { gameplay: { ...state.gameplay, player: { ...player, worknetOrders: { ...player.worknetOrders, [CASE_MISSION]: { ...order, caseProgress: progress } } } } };
  });
  assert.equal(os.getState().reviewCaseReport().ok, false);
  assert.equal(os.getState().gameplay.player.worknetOrders[CASE_MISSION].caseProgress.reviews.length, 2);
  assert.equal(os.getState().gameplay.player.worknetOrders[CASE_MISSION].caseProgress.reviews[0].accepted, true);
  assert.equal(os.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[CASE_MISSION]).ok, false);
});
test('source actions require current credentials and briefing, and do not issue credentials', async () => {
  storage(); const os = await freshOS(); os.getState().loginUser({ name: 'Citizen', clearance: 3 });
  os.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, isAdmin: false, dgaVerified: false, careers: {}, skills: {}, organizationMemberships: {}, employmentContracts: {} } } }));
  assert.equal(os.getState().broadStreetEligible(), false);
  assert.equal(os.getState().openWorknetOrder(CASE_MISSION).ok, false);
  assert.equal(os.getState().acquireCaseSource('dna', 'dgaos').ok, false);
  assert.equal(os.getState().requestCaseStatement().ok, false);
  os.getState().loginUser({ name: 'Investigator', isAdmin: true, clearance: 3 });
  const memberships = structuredClone(os.getState().gameplay.player.organizationMemberships);
  assert.equal(os.getState().openWorknetOrder(CASE_MISSION).ok, true);
  assert.equal(os.getState().acquireCaseSource('dna', 'dgaos').ok, false);
  os.getState().acknowledgeAssignmentBriefing(CASE_MISSION);
  assert.equal(os.getState().acquireCaseSource('dna', 'files').ok, false);
  assert.equal(os.getState().acquireCaseSource('not-a-source', 'dgaos').ok, false);
  assert.equal(os.getState().acquireCaseSource('guard-statement', 'mail').ok, false);
  assert.deepEqual(os.getState().gameplay.player.organizationMemberships, memberships);
  os.getState().logoutUser();
  assert.equal(os.getState().saveCaseReport(draft()).ok, false);
  assert.equal(os.getState().reviewCaseReport().ok, false);
});
test('five-app workflow supports different source orders, reload, revisions, immutable reports and one-time rewards', async () => {
  for (const reversed of [false, true]) {
    storage(); let os = await freshOS(); os.getState().loginUser({ name: 'Case Reviewer', isAdmin: true, clearance: 3, credits: 500 });
    os.getState().refreshAssignmentDispatches(); os.getState().refreshAssignmentDispatches();
    assert.equal(mail.getState().emails.filter(item => item.id === `JOB-DISPATCH:${CASE_MISSION}`).length, 1);
    os.getState().openAssignment(CASE_MISSION);
    assert.equal(os.getState().activeWindowId, 'jobs');
    assert.equal(os.getState().openWorknetOrder(CASE_MISSION).ok, true);
    os.getState().acknowledgeAssignmentBriefing(CASE_MISSION);
    const player = structuredClone(os.getState().gameplay.player);
    assert.equal(os.getState().submitWorknetStage(CASE_MISSION, 'case-review', {}).ok, false);
    const sources = reversed ? [...BROAD_STREET.sources].reverse() : BROAD_STREET.sources;
    for (const source of sources) {
      os.getState().openCaseSource(source.id);
      assert.equal(os.getState().activeWindowId, source.app);
      if (source.app === 'files' || source.app === 'dgaos') assert.equal(os.getState().workspaceRequests[source.app].section, `broadstreet:${source.id}`);
      if (source.app === 'browser') assert.equal(os.getState().browserState.tabs.find(tab => tab.id === os.getState().browserState.activeTabId).url, source.url);
      if (source.app === 'mail') { os.getState().requestCaseStatement(); assert.equal(mail.getState().mailRequest.id, CASE_MAIL); }
      assert.equal(os.getState().acquireCaseSource(source.id, source.app).ok, true);
      assert.equal(os.getState().acquireCaseSource(source.id, source.app).ok, true);
    }
    assert.equal(mail.getState().emails.filter(item => item.id === CASE_MAIL).length, 1);
    assert.equal(os.getState().gameplay.player.worknetOrders[CASE_MISSION].caseProgress.acquired.length, 6);
    assert.equal(os.getState().gameplay.player.credits, player.credits);
    const bad = draft(); bad.findings.identity.choice = 'verdict';
    os.getState().saveCaseReport(bad);
    assert.equal(os.getState().reviewCaseReport().ok, false);
    assert.equal(os.getState().reviewCaseReport().ok, false);
    assert.equal(os.getState().gameplay.player.worknetOrders[CASE_MISSION].caseProgress.reviews.length, 1);
    assert.equal(os.getState().gameplay.player.worknetOrders[CASE_MISSION].evaluation, 100);
    os = await freshOS();
    assert.equal(os.getState().gameplay.player.worknetOrders[CASE_MISSION].caseProgress.draft.findings.identity.choice, 'verdict');
    os.getState().saveCaseReport(draft());
    assert.equal(os.getState().reviewCaseReport().ok, true);
    assert.equal(os.getState().reviewCaseReport().ok, true);
    assert.equal(os.getState().gameplay.player.worknetOrders[CASE_MISSION].caseProgress.reviews.length, 2);
    const revised = draft(); revised.text += ' Revised.'; revised.html = `<p>${revised.text}</p>`;
    os.getState().saveCaseReport(revised);
    assert.equal(os.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[CASE_MISSION]).ok, false);
    assert.equal(os.getState().reviewCaseReport().ok, true);
    const entries = readWorldEntries(localStorage);
    assert.ok(validSnapshot({ serverId: 'test', revision: 1, entries }));
    assert.ok(JSON.parse(entries['miraverse-os-progress']).state.gameplay.player.worknetOrders[CASE_MISSION].caseProgress);
    assert.ok(JSON.parse(entries['miraverse-comms']).state.emails.some(item => item.id === CASE_MAIL));
    assert.equal(os.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[CASE_MISSION]).ok, true);
    assert.equal(os.getState().gameplay.player.credits, player.credits + 300);
    assert.equal(os.getState().gameplay.player.xp, player.xp + 150);
    assert.equal(os.getState().gameplay.player.bits, player.bits);
    assert.ok(os.getState().gameplay.player.assignmentJournal.files[`completion:WORK:${CASE_MISSION}:once`]);
    const receiptText = os.getState().gameplay.player.assignmentJournal.files[`completion:WORK:${CASE_MISSION}:once`].body;
    assert.ok(receiptText.includes('SUPPORTED FINDINGS'));
    assert.ok(!receiptText.includes('__html'));
    assert.ok(receiptText.includes('Vault access audit'));
    const reviews = structuredClone(os.getState().gameplay.player.worknetOrders[CASE_MISSION].caseProgress.reviews);
    assert.equal(reviews[0].draft.findings.identity.choice, 'verdict');
    assert.equal(reviews.at(-1).draft.text, revised.text);
    os = await freshOS();
    assert.equal(os.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[CASE_MISSION]).ok, false);
    assert.equal(os.getState().openWorknetOrder(CASE_MISSION).ok, false);
    assert.equal(os.getState().saveCaseReport(draft()).ok, false);
    os.getState().openCaseSource('guard-statement'); assert.equal(os.getState().activeWindowId, 'mail');
    assert.deepEqual(os.getState().gameplay.player.worknetOrders[CASE_MISSION].caseProgress.reviews, reviews);
  }
});
test('review rejects missing, foreign, unacquired and unrelated evidence without judging prose keywords', () => {
  const progress = restoreCaseProgress({ acquired: BROAD_STREET.sources.map(s => s.id), draft: draft() });
  assert.deepEqual(reviewBroadStreet(progress), []);
  for (const id of ['unknown', 'maintenance', 'guard-statement']) {
    const copy = structuredClone(progress); copy.draft.findings.entry.citations.push(id);
    assert.ok(reviewBroadStreet(copy).length);
  }
  const missing = structuredClone(progress); missing.acquired = missing.acquired.filter(id => id !== 'dna'); assert.ok(reviewBroadStreet(missing).length);
  const unsupported = structuredClone(progress); unsupported.draft.findings.entry.citations = []; assert.ok(reviewBroadStreet(unsupported).length);
  const empty = structuredClone(progress); empty.draft.text = ''; assert.ok(reviewBroadStreet(empty).length);
  const stale = structuredClone(progress); stale.version = 'old'; assert.ok(reviewBroadStreet(stale).length);
  assert.equal(restoreCaseProgress({ acquired: ['unknown', 'dna', 'dna'], reviews: [{ id: 'bad' }] }).acquired.length, 1);
});
test('public index exposes only the fixed publication; older completed cases cannot become new paid work', async () => {
  assert.equal(publicCaseSearch('First Federal maintenance')[0].url, publication.url);
  assert.deepEqual(publicCaseSearch('EV-0011 DNA Silas Drake'), []);
  assert.ok(!JSON.stringify(publication).includes('EV-0011'));
  assert.ok(!JSON.stringify(publication).includes('Silas Drake'));
  assert.equal(legacyCaseComplete({}, { cases: [{ id: 'legacy-id', linkedTraceCaseId: CASE_ID, status: 'CLOSED' }] }), true);
  assert.equal(legacyCaseComplete({}, null, { meta: { id: CASE_ID, status: 'Closed' } }), true);
  storage(); const os = await freshOS(); os.getState().loginUser({ name: 'Old Investigator', isAdmin: true });
  os.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, solvedInvestigationCaseIds: [CASE_ID] } } }));
  assert.equal(os.getState().openWorknetOrder(CASE_MISSION).ok, false);
  assert.ok(os.getState().gameplay.player.solvedInvestigationCaseIds.includes(CASE_ID));
});
