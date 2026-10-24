import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { FIELD_MISSION, FIELD_TARGETS, restoreFieldSession, interactField } = await import('../src/gameplay/FieldOperations.ts');
const { WORKNET_ASSIGNMENTS } = await import('../src/gameplay/ActivityEngine.ts');
let sequence = 0;
function storage() {
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } });
  globalThis.window = { localStorage: globalThis.localStorage };
}
async function freshOS() { return (await import(`../src/store/useOSStore.ts?field=${sequence++}`)).useOSStore; }
test('field sessions recover bounded positions and known evidence from older or malformed saves', () => {
  assert.deepEqual(restoreFieldSession(null), { x: 110, y: 330, evidence: [], interviewed: false, sealed: false });
  assert.deepEqual(restoreFieldSession({ x: Infinity, y: -100, evidence: ['relay', 'relay', '__proto__', null], interviewed: 'yes' }), { x: 110, y: 110, evidence: ['relay'], interviewed: false, sealed: false });
  assert.equal(interactField(restoreFieldSession(null), 'terminal').ok, false);
  assert.equal(interactField(restoreFieldSession({ x: 470, y: 120 }), 'seal').ok, false);
});
test('field actions require an active briefed order; close/reload preserves findings and pays an operation once', async () => {
  storage(); let os = await freshOS();
  os.getState().loginUser({ name: 'Field Investigator', clearance: 3, credits: 400 });
  assert.equal(os.getState().fieldAction('record').ok, false);
  assert.equal(os.getState().openWorknetOrder(FIELD_MISSION).ok, true);
  assert.equal(os.getState().fieldAction('move', { x: 100, y: 100 }).ok, false);
  assert.equal(os.getState().acknowledgeAssignmentBriefing(FIELD_MISSION).ok, true);
  assert.equal(os.getState().fieldAction('move', { x: NaN, y: 50 }).ok, false);
  assert.equal(os.getState().fieldAction('interact', { id: 'terminal' }).ok, false);
  assert.equal(os.getState().fieldAction('record').ok, false);
  const before = os.getState().gameplay.player.credits;
  for (const target of FIELD_TARGETS) {
    if (target.id === 'seal') continue;
    assert.equal(os.getState().fieldAction('move', target).ok, true);
    assert.equal(os.getState().fieldAction('interact', { id: target.id }).ok, true);
    assert.equal(os.getState().fieldAction('interact', { id: target.id }).ok, true);
  }
  os = await freshOS();
  assert.equal(os.getState().gameplay.player.worknetOrders[FIELD_MISSION].fieldSession.evidence.length, 3);
  assert.equal(os.getState().gameplay.player.worknetOrders[FIELD_MISSION].fieldSession.interviewed, true);
  assert.equal(os.getState().fieldAction('record').ok, false);
  const seal = FIELD_TARGETS.find(t => t.id === 'seal');
  os.getState().fieldAction('move', seal);
  assert.equal(os.getState().fieldAction('interact', { id: 'seal' }).ok, true);
  assert.equal(os.getState().fieldAction('record').ok, true);
  assert.equal(os.getState().gameplay.player.worknetOrders[FIELD_MISSION].resultIds.length, 2);
  const skills = structuredClone(os.getState().gameplay.player.skills);
  assert.equal(os.getState().fieldAction('record').ok, true);
  assert.equal(os.getState().gameplay.player.worknetOrders[FIELD_MISSION].resultIds.length, 2);
  assert.deepEqual(os.getState().gameplay.player.skills, skills);
  assert.equal(os.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[FIELD_MISSION]).ok, false);
  assert.equal(os.getState().submitWorknetStage(FIELD_MISSION, 'report', { report: 'Nothing to report.' }).ok, false);
  assert.equal(os.getState().submitWorknetStage(FIELD_MISSION, 'report', { report: 'PID 512 leaked at 88.2 MHz in Tunnel 09. Hazmat-01 and Patrol-12 deployed a SealLockCrypt seal.' }).ok, true);
  assert.equal(os.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[FIELD_MISSION]).ok, true);
  assert.equal(os.getState().gameplay.player.credits, before + WORKNET_ASSIGNMENTS[FIELD_MISSION].rewardCredits);
  os = await freshOS();
  assert.equal(os.getState().completeWorknetMission(WORKNET_ASSIGNMENTS[FIELD_MISSION]).ok, false);
  assert.equal(os.getState().fieldAction('record').ok, false);
  assert.equal(os.getState().gameplay.player.credits, before + WORKNET_ASSIGNMENTS[FIELD_MISSION].rewardCredits);
});
