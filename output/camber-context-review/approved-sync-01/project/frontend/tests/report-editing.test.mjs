import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
let sequence = 0;
async function freshOS() { return (await import(`../src/store/useOSStore.ts?report=${sequence++}`)).useOSStore; }
test('report formatting is sanitized, survives reload, and preserves plain-text validation and accepted receipts', async () => {
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } });
  globalThis.window = { localStorage: globalThis.localStorage };
  let os = await freshOS(); os.getState().loginUser({ name: 'Report Author', clearance: 3 });
  os.getState().openWorknetOrder('ms-spec-01'); os.getState().acknowledgeAssignmentBriefing('ms-spec-01');
  os.getState().submitWorknetStage('ms-spec-01', 'inspect', { pid: '512', frequency: '88.2' });
  os.getState().submitWorknetStage('ms-spec-01', 'contain', { team: 'Hazmat-01 and Patrol-12', seal: 'SealLockCrypt' });
  const report = 'PID 512 in Tunnel 09 at 88.2 MHz isolated with a seal.';
  os.getState().saveWorknetDraft('ms-spec-01', 'report', { report, report__html: `<p onclick="bad()"><strong>${report}</strong></p><script>bad()</script>`, arbitrary__html: 'bad' });
  os = await freshOS();
  const draft = os.getState().gameplay.player.worknetOrders['ms-spec-01'].drafts.report;
  assert.equal(draft.report, report);
  assert.equal(draft.report__html, `<p><strong>${report}</strong></p>`);
  assert.equal(draft.arbitrary__html, undefined);
  assert.equal(os.getState().submitWorknetStage('ms-spec-01', 'report', { report: 'Missing facts', report__html: `<p>${report}</p>` }).ok, false);
  assert.equal(os.getState().submitWorknetStage('ms-spec-01', 'report', draft).ok, true);
  const order = os.getState().gameplay.player.worknetOrders['ms-spec-01'];
  const receipt = os.getState().gameplay.player.taskResults[`${order.id}:report`];
  assert.equal(receipt.output.report__html, draft.report__html);
  assert.equal(receipt.output.report, report);
});
