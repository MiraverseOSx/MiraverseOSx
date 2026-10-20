import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
let sequence = 0;
function storage() { const values = new Map(); globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; return values; }
async function fresh() { return (await import(`../src/store/useOSStore.ts?register=${sequence++}`)).useOSStore; }
const { WORK_DEFINITIONS, WORKNET_ASSIGNMENTS, evaluateLinkedActivities } = await import('../src/gameplay/ActivityEngine.ts');
const { visibleOpportunities, getOpportunity, opportunityStatus, journeyChapterReady } = await import('../src/gameplay/AssignmentFlow.ts');
const { ACTIVITY_HIERARCHY, STARTER_CONCEPTS, availableDiscoveryPoints, dailyActivityPlan } = await import('../src/gameplay/ProgressionEngine.ts');
async function playable() { storage(); const store = await fresh(); store.getState().loginUser({ name: 'Register Tester', level: 1, credits: 500 }); store.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, clearanceLevel: 5, stamina: 100 } } })); return store; }
function prepare(store, id) { const definition = WORK_DEFINITIONS[id]; if (definition.kind === 'shift') store.getState().acceptEmployment(definition.track); assert.equal(store.getState().openWorknetOrder(id).ok, true); assert.equal(store.getState().acknowledgeAssignmentBriefing(id).ok, true); }
function valuesFor(stage) { return Object.fromEntries(stage.fields.map(field => [field.id, field.kind === 'report' ? `Field report: ${field.contains.join(' ')}. Procedure verified and evidence preserved.` : field.expected])); }
function perform(store, id, stages = WORK_DEFINITIONS[id].stages) { for (const stage of stages) assert.equal(store.getState().submitWorknetStage(id, stage.id, valuesFor(stage)).ok, true, `${id}/${stage.id}`); }
function finish(store, id) { prepare(store, id); perform(store, id); assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[id]).ok, true); }

test('hierarchy expresses scope and Tasks exist only as assigned objectives', async () => {
  const store = await playable();
  assert.deepEqual(ACTIVITY_HIERARCHY, ['journey', 'adventure', 'mission', 'quest', 'task']);
  assert.equal(getOpportunity('ms-shift-04').kind, 'mission');
  assert.equal(visibleOpportunities(store.getState().gameplay.player).some(item => item.kind === 'task'), false);
  assert.equal(store.getState().startAssignment('ms-shift-04::inspect').ok, false);
  prepare(store, 'ms-shift-04');
  const tasks = visibleOpportunities(store.getState().gameplay.player).filter(item => item.kind === 'task');
  assert.equal(tasks.length, WORK_DEFINITIONS['ms-shift-04'].stages.length);
  assert.ok(tasks.every(task => task.parentMissionId === 'ms-shift-04'));
  const credits = store.getState().gameplay.player.credits;
  store.getState().openAssignment('ms-shift-04::inspect');
  assert.equal(store.getState().gameplay.player.assignmentJournal.selectedId, 'ms-shift-04');
  assert.equal(store.getState().gameplay.player.credits, credits);
});

test('mysteries and hidden places cannot be listed or opened before contextual knowledge', async () => {
  const store = await playable();
  const before = store.getState().gameplay.player;
  assert.ok(!visibleOpportunities(before).some(item => item.id === 'adventure-old-factory'));
  assert.equal(store.getState().startAssignment('adventure-old-factory').ok, false);
  store.getState().saveAssignmentBriefing('adventure-old-factory');
  assert.equal(store.getState().gameplay.player.assignmentJournal.files['briefing:adventure-old-factory'], undefined);
  store.getState().visitAurelinePlace('platform');
  assert.ok(!availableDiscoveryPoints(store.getState().gameplay.player).some(point => point.id === 'quiet-overlook'));
  assert.equal(store.getState().observeDiscovery('quiet-overlook').ok, false);
  assert.equal(store.getState().observeDiscovery('old-factory-lead').ok, false, 'cannot inspect a different place');
});

test('hybrid discovery uses clues, journal entries, optional Quests, Adventure invitations and exploration rewards', async () => {
  const store = await playable();
  const before = store.getState().gameplay.player;
  store.getState().visitAurelinePlace('platform');
  assert.equal(store.getState().observeDiscovery('platform-hum').ok, true);
  let world = store.getState().gameplay.player.worldJournal;
  assert.equal(world.entries['platform-hum'].presentation, 'clue');
  assert.equal(world.notifications['platform-hum'], undefined, 'mystery is a contextual observation, not a Quest alert');
  assert.equal(store.getState().observeDiscovery('etched-token').ok, true);
  world = store.getState().gameplay.player.worldJournal;
  assert.equal(world.entries['etched-token'].presentation, 'journal');
  assert.equal(world.entries['etched-token'].opportunityId, undefined);
  assert.deepEqual(store.getState().gameplay.player.worknetOrders, {});
  store.getState().visitAurelinePlace('garden');
  assert.equal(store.getState().observeDiscovery('garden-request').ok, true);
  assert.equal(store.getState().gameplay.player.worldJournal.notifications['garden-request'].presentation, 'quest');
  assert.equal(store.getState().gameplay.player.worknetOrders['qn-02'], undefined, 'optional offer does not accept work');
  assert.equal(store.getState().gameplay.player.xp, before.xp);
  store.getState().recordFileInspection('net-relay');
  const inspected = store.getState().gameplay.player;
  store.getState().visitAurelinePlace('junction');
  assert.equal(store.getState().observeDiscovery('glassline-inquiry').ok, true);
  assert.equal(store.getState().observeDiscovery('old-factory-lead').ok, true);
  world = store.getState().gameplay.player.worldJournal;
  assert.equal(world.notifications['old-factory-lead'].presentation, 'adventure');
  assert.ok(visibleOpportunities(store.getState().gameplay.player).some(item => item.id === 'adventure-old-factory'));
  assert.ok(store.getState().gameplay.player.assignmentJournal.dispatches['adventure-old-factory']);
  assert.equal(store.getState().gameplay.player.assignmentJournal.started['adventure-old-factory'], undefined);
  store.getState().visitAurelinePlace('platform');
  assert.equal(store.getState().observeDiscovery('quiet-overlook').ok, true);
  assert.equal(store.getState().observeDiscovery('quiet-overlook').ok, false);
  const after = store.getState().gameplay.player;
  assert.deepEqual(after.worldJournal.explorationRewards, ['Glassline overlook sketch']);
  assert.equal(after.worldJournal.entries['quiet-overlook'].opportunityId, undefined);
  assert.equal(after.xp, inspected.xp, 'exploration does not reissue the separate file-inspection reward');
  assert.equal(after.credits, inspected.credits);
  store.getState().markDiscoveryRead('etched-token');
  const restored = await fresh();
  assert.equal(restored.getState().gameplay.player.worldJournal.notifications['etched-token'].read, true);
  assert.ok(restored.getState().gameplay.player.worldJournal.entries['platform-hum']);
});

test('an established relationship can reveal directions without assigning a Task', async () => {
  const store = await playable();
  store.getState().visitAurelinePlace('garden');
  assert.equal(store.getState().observeDiscovery('neighbor-directions').ok, false);
  store.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, maiSpaceProfile: { ...state.gameplay.player.maiSpaceProfile, acceptedFriends: ['aelita'] } } } }));
  assert.equal(store.getState().observeDiscovery('neighbor-directions').ok, true);
  store.getState().visitAurelinePlace('platform');
  assert.equal(store.getState().observeDiscovery('neighbor-overlook').ok, true);
  assert.deepEqual(store.getState().gameplay.player.worknetOrders, {});
});

test('daily routines remain manual, adapt to familiarity, and do not generate formal progress or XP', async () => {
  const store = await playable();
  const before = store.getState().gameplay.player;
  assert.equal(store.getState().performDailyActivity('cook', 'Vegetable soup', 1).ok, false);
  for (let index = 0; index < 3; index++) {
    const plan = dailyActivityPlan('cook', store.getState().gameplay.player);
    assert.equal(plan.steps.length, 3);
    assert.equal(store.getState().performDailyActivity('cook', 'Vegetable soup', plan.steps.length).ok, true);
  }
  const familiar = dailyActivityPlan('cook', store.getState().gameplay.player);
  assert.equal(familiar.steps.length, 2);
  assert.ok(familiar.minutes < 25);
  assert.equal(store.getState().performDailyActivity('cook', 'Vegetable soup', familiar.steps.length).ok, true);
  const decor = dailyActivityPlan('decorate', store.getState().gameplay.player);
  store.getState().performDailyActivity('decorate', 'Plant by the window', decor.steps.length);
  const after = store.getState().gameplay.player;
  assert.equal(after.worldJournal.life.arrangement, 'Plant by the window');
  assert.equal(after.worldJournal.life.history.length, 5);
  assert.equal(after.xp, before.xp);
  assert.equal(after.credits, before.credits);
  assert.deepEqual(after.skills, before.skills);
  assert.deepEqual(after.worknetOrders, before.worknetOrders);
  assert.deepEqual(after.completedQuests, before.completedQuests);
  assert.deepEqual(after.assignmentJournal, before.assignmentJournal);
  const restored = await fresh();
  assert.equal(dailyActivityPlan('cook', restored.getState().gameplay.player).steps.length, 2);
});

test('everyday time advances the simulation without creating reward loops', async () => {
  const store = await playable();
  store.setState(state => ({ gameplay: { ...state.gameplay, timeSegmentIndex: 3, timeCycleCount: 7, player: { ...state.gameplay.player, worldJournal: { ...state.gameplay.player.worldJournal, life: { ...state.gameplay.player.worldJournal.life, minutesSpent: 350 } } } } }));
  store.getState().performDailyActivity('clean', 'Desk and shelves', 3);
  assert.equal(store.getState().gameplay.timeCycleCount, 8);
  assert.equal(store.getState().gameplay.timeSegmentIndex, 0);
  assert.equal(store.getState().gameplay.player.xp, 0);
});

test('Journey chapters complete independently while the Journey remains ongoing', async () => {
  const store = await playable();
  store.getState().startAssignment('journey-engineering');
  assert.equal(store.getState().claimJourneyChapter('journey-engineering', 'accreditation').ok, false);
  finish(store, 'ms-shift-04');
  assert.equal(journeyChapterReady('journey-engineering', 'field-experience', store.getState().gameplay.player), true);
  let credits = store.getState().gameplay.player.credits;
  assert.equal(store.getState().claimJourneyChapter('journey-engineering', 'field-experience').ok, true);
  assert.equal(store.getState().gameplay.player.credits, credits);
  assert.equal(store.getState().claimJourneyChapter('journey-engineering', 'accreditation').ok, false);
  finish(store, 'ms-dev-01');
  credits = store.getState().gameplay.player.credits;
  assert.equal(store.getState().claimJourneyChapter('journey-engineering', 'accreditation').ok, true);
  const journey = evaluateLinkedActivities(store.getState().gameplay.player.taskResults).find(item => item.kind === 'journey');
  assert.equal(journey.complete, false);
  assert.equal(journey.chaptersComplete, true);
  assert.equal(journey.continuing, true);
  assert.equal(opportunityStatus(getOpportunity(journey.id), store.getState().gameplay.player, 1), 'Journey ongoing');
  assert.equal(store.getState().gameplay.player.credits, credits);
  assert.equal(store.getState().claimActivityUnlock(journey.id).ok, false);
  const restored = await fresh();
  assert.equal(restored.getState().claimJourneyChapter(journey.id, 'accreditation').ok, false);
  assert.ok(restored.getState().gameplay.player.assignmentJournal.files['chapter:journey-engineering:accreditation']);
});

test('incidents plus exploration can develop an emergent Adventure with a persistent branch consequence', async () => {
  const store = await playable();
  store.getState().visitAurelinePlace('platform');
  store.getState().observeDiscovery('platform-hum');
  prepare(store, 'ms-shift-04');
  perform(store, 'ms-shift-04', WORK_DEFINITIONS['ms-shift-04'].stages.slice(0, 3));
  assert.equal(store.getState().submitWorknetStage('ms-shift-04', 'repair', { power: 'Energized', part: '470 µF capacitor at C4', bus: 'Reconnected after replacement' }).ok, false);
  assert.equal(store.getState().remediateWorknetOrder('ms-shift-04', 'Isolated the unsafe supply and received supervisor review before proceeding.').ok, true);
  perform(store, 'ms-shift-04', WORK_DEFINITIONS['ms-shift-04'].stages.slice(3));
  const id = 'adventure-relay-response';
  assert.ok(store.getState().gameplay.player.worldJournal.revealedOpportunities.includes(id));
  assert.equal(store.getState().gameplay.player.assignmentJournal.started[id], undefined);
  assert.equal(store.getState().startAssignment(id).ok, true);
  assert.equal(store.getState().chooseAdventureApproach(id, 'coordinate').ok, true);
  assert.equal(store.getState().chooseAdventureApproach(id, 'independent').ok, false);
  store.getState().visitAurelinePlace('junction');
  assert.ok(availableDiscoveryPoints(store.getState().gameplay.player).some(point => point.id === 'dispatch-review'));
  assert.ok(!availableDiscoveryPoints(store.getState().gameplay.player).some(point => point.id === 'independent-sketch'));
  const restored = await fresh();
  assert.equal(restored.getState().gameplay.player.worldJournal.branches[id].choice, 'coordinate');
  assert.equal(store.getState().gameplay.player.worknetOrders['ms-shift-04'].resourcesUsed, 1);
});

test('Quest approaches produce different interactions and one shared completion reward', async () => {
  const store = await playable();
  prepare(store, 'qn-02');
  assert.equal(store.getState().submitWorknetStage('qn-02', 'search', { _approach: 'invented' }).ok, false);
  const answer = { _approach: 'owner-account', location: 'East Fountain Bench', permission: 'Owner confirmed engraving and permission' };
  store.getState().saveWorknetDraft('qn-02', 'search', answer);
  assert.equal(store.getState().submitWorknetStage('qn-02', 'search', answer).ok, true);
  const receipt = store.getState().gameplay.player.taskResults['WORK:qn-02:once:search'];
  assert.equal(receipt.mechanic, 'dialogue');
  assert.equal(receipt.output._approach, 'owner-account');
  perform(store, 'qn-02', WORK_DEFINITIONS['qn-02'].stages.slice(1));
  const credits = store.getState().gameplay.player.credits;
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['qn-02']).ok, true);
  assert.equal(store.getState().gameplay.player.credits, credits + WORKNET_ASSIGNMENTS['qn-02'].rewardCredits);
  assert.equal(store.getState().completeWorknetMission(WORKNET_ASSIGNMENTS['qn-02']).ok, false);
});

test('high skill and Career XP still require actual relevant professional experience', async () => {
  const store = await playable();
  store.getState().addCareerXP('engineer', 900);
  store.setState(state => ({ gameplay: { ...state.gameplay, player: { ...state.gameplay.player, skills: { ...state.gameplay.player.skills, Engineering: { level: 9, xp: 900 }, Programming: { level: 9, xp: 900 } } } } }));
  assert.equal(store.getState().requestCareerPromotion('engineer').ok, false);
  finish(store, 'ms-shift-04');
  assert.equal(store.getState().requestCareerPromotion('engineer').ok, true);
});

test('old saves retain earned unlocks and receive empty new systems without canonizing proposed concepts', async () => {
  const values = storage();
  values.set('miraverse-os-progress', JSON.stringify({ state: { gameplay: { player: { assignmentJournal: { claimed: { 'journey-engineering': 'old-reward' }, started: { 'journey-engineering': 'old-start' }, unlocks: ['Accredited engineer field manual'] } } } }, version: 1 }));
  const store = await fresh();
  const player = store.getState().gameplay.player;
  assert.deepEqual(player.worldJournal.entries, {});
  assert.deepEqual(player.assignmentJournal.chapterClaims, {});
  assert.equal(opportunityStatus(getOpportunity('journey-engineering'), player, 1), 'Journey ongoing');
  assert.equal(player.assignmentJournal.claimed['journey-engineering'], 'old-reward');
  const { OPPORTUNITIES } = await import('../src/gameplay/AssignmentFlow.ts');
  assert.ok(STARTER_CONCEPTS.every(title => !OPPORTUNITIES.some(item => item.title === title)), 'proposed starter stories are not silently finalized');
});

test('cinematic scenes are optional story records with no repeatable rewards', async () => {
  const store = await playable();
  assert.equal(store.getState().finishAdventureScene('old-factory-arrival').ok, false);
  store.getState().visitAurelinePlace('platform');
  store.getState().observeDiscovery('platform-hum');
  store.getState().recordFileInspection('net-relay');
  store.getState().visitAurelinePlace('junction');
  store.getState().observeDiscovery('old-factory-lead');
  store.getState().startAssignment('adventure-old-factory');
  const before = store.getState().gameplay.player;
  store.getState().finishAdventureScene('old-factory-arrival');
  store.getState().finishAdventureScene('old-factory-arrival');
  const after = store.getState().gameplay.player;
  assert.deepEqual(after.worldJournal.scenesSeen, ['old-factory-arrival']);
  assert.equal(after.credits, before.credits);
  assert.equal(after.xp, before.xp);
  assert.deepEqual(after.taskResults, before.taskResults);
});
