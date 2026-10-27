import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const root = new URL('../src/dgaos/', import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    let result;
    const name = specifier.startsWith('@/') ? new URL(specifier.slice(2), root).href : specifier;
    try { result = next(name, context); }
    catch (error) {
      if (!name.startsWith('.') && !name.startsWith('file:')) throw error;
      const base = new URL(name, context.parentURL);
      const candidate = [new URL(`${base.href}.ts`), new URL(`${base.href}/index.ts`)].find(url => existsSync(fileURLToPath(url)));
      if (!candidate) throw error;
      result = next(candidate.href, context);
    }
    return result.url.endsWith('.json') ? { ...result, importAttributes: { type: 'json' } } : result;
  },
  load(url, context, next) {
    if (url.startsWith('file:') && url.endsWith('.ts') && !url.includes('node_modules')) {
      return { format: 'module', shortCircuit: true, source: transformSync(readFileSync(new URL(url), 'utf8'), {
        loader: 'ts', target: 'es2022', format: 'esm',
      }).code };
    }
    return next(url, context);
  },
});
function memory() {
  const data = new Map();
  const storage = { data, get length() { return data.size; }, key: i => [...data.keys()][i] ?? null,
    getItem: key => data.get(key) ?? null, setItem: (key, raw) => data.set(key, raw), removeItem: key => data.delete(key) };
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage, dispatchEvent() {}, addEventListener() {}, removeEventListener() {} };
  return storage;
}
memory();
const store = await import('../src/dgaos/lib/dga-store.ts');
const { buildManualIncidentCase } = await import('../src/dgaos/lib/dga-incident.ts');
const { processSimulationTick, processOfflineProgression } = await import('../src/dgaos/lib/simulation/simulation-engine.ts');
const { evaluateTaskCompletionReaction } = await import('../src/dgaos/lib/simulation/reaction-engine.ts');
const trace = await import('../src/dgaos/lib/case-store.ts');
const task = { id: 'task', title: 'Interview witness and request TRACE', description: 'Submit case evidence to TRACE', completed: true };

test('custom cases do not receive embassy story events, even after many ticks or matching task titles', () => {
  const state = store.createDefaultDGAState();
  const custom = buildManualIncidentCase({ narrative: 'A missing bicycle was reported.' }, 'INC-26-1001', 'Investigator');
  state.cases = [custom]; state.activeCaseId = custom.id;
  const before = structuredClone(custom);
  let current = state;
  for (let i = 0; i < 26; i++) current = processSimulationTick(current).updatedState;
  assert.deepEqual(current.cases[0], before);
  assert.equal(current.communications.some(item => item.caseId === custom.id), false);
  assert.deepEqual(evaluateTaskCompletionReaction(custom, task, [custom]).newScheduledEvents, []);
  const embassy = { ...structuredClone(custom), id: 'DGA-26-194', creationSource: 'seed' };
  assert.equal(evaluateTaskCompletionReaction(embassy, task, [embassy]).newScheduledEvents.length, 2);
});

test('legacy scheduled events cannot inject unrelated findings into custom or missing cases', () => {
  const state = store.createDefaultDGAState();
  const custom = buildManualIncidentCase({ narrative: 'An incident.' }, 'INC-26-1002', 'Investigator');
  state.cases = [custom];
  state.scheduledEvents = ['INC-26-1002', 'deleted-case'].map((caseId, index) => ({ id: `old-${index}`, type: 'LAB_RESULT_READY',
    caseId, scheduledAt: '2000-01-01T00:00:00Z', status: 'scheduled', payload: { caseId, resultSummary: 'Unrelated Phoenix Biotech finding' } }));
  const online = processSimulationTick(structuredClone(state)).updatedState;
  assert.equal(online.alerts.some(item => item.message?.includes('Phoenix')), false);
  assert.equal(online.cases[0].linkedTraceCaseId, undefined);
  state.session.lastActiveTime = '2000-01-01T00:00:00Z';
  const offline = processOfflineProgression(state).updatedState;
  assert.equal(offline.alerts.some(item => item.message?.includes('Phoenix')), false);
});

test('registry links retain citizen IDs across cases and distinguish different people with the same name', async () => {
  memory(); await store.resetDGAWorld();
  const a = await store.createManualIncidentCase({ narrative: 'First case.' });
  const b = await store.createManualIncidentCase({ narrative: 'Second case.' });
  store.getDGAState().people.push({ id: 'CIT-A', name: 'Alex Vale' }, { id: 'CIT-B', name: 'Alex Vale' });
  await store.linkExistingPersonToCase(a.id, 'CIT-A', 'Witness');
  await store.linkExistingPersonToCase(b.id, 'CIT-A', 'Reporting party');
  await store.linkExistingPersonToCase(a.id, 'CIT-B', 'Other person');
  assert.deepEqual(a.people.map(item => item.personId).sort(), ['CIT-A', 'CIT-B']);
  assert.equal(b.people[0].personId, 'CIT-A');
  assert.equal(a.people.find(item => item.personId === 'CIT-A').role, 'Witness');
  assert.equal(store.getDGAState().people.find(item => item.id === 'CIT-A').role, undefined);
  await store.addDGACasePerson(a.id, { personId: 'CIT-A', name: 'Alex Vale', role: 'Witness updated' }, { allowDuplicateName: true });
  assert.equal(a.people.filter(item => item.personId === 'CIT-A').length, 1);
});

test('rapid task and evidence creation does not reuse IDs when the clock is unchanged', async () => {
  memory(); await store.resetDGAWorld();
  const c = await store.createManualIncidentCase({ narrative: 'Same-clock test.' });
  const original = Date.now; Date.now = () => 1234567890;
  try {
    for (let i = 0; i < 20; i++) {
      await store.createDGATask(c.id, { title: `Task ${i}`, description: '', phase: 'Preliminary' });
      await store.addDGACaseEvidence(c.id, { title: `Exhibit ${i}`, category: 'Physical Item' });
    }
  } finally { Date.now = original; }
  const ids = [...c.tasks.map(item => item.id), ...c.evidence.map(item => item.id), ...c.timeline.map(item => item.id)];
  assert.equal(new Set(ids).size, ids.length);
});

test('TRACE case switching preserves edits and rejects unknown or incomplete imports', () => {
  const storage = memory();
  const first = trace.loadCaseById('CASE-2026-001');
  first.meta.summary = 'Saved investigator revision'; trace.saveActiveCaseData(first);
  trace.loadCaseById('CASE-2026-002');
  assert.equal(trace.loadCaseById(first.meta.id).meta.summary, 'Saved investigator revision');
  assert.notEqual(trace.CASE_PRESETS[first.meta.id].meta.summary, 'Saved investigator revision');
  const before = storage.getItem('trace_active_case_data_v2');
  assert.throws(() => trace.loadCaseById('unknown-case'), /not found/);
  assert.throws(() => trace.importCaseFromJson('{"meta":{"id":"bad"},"medical":{}}'), /Invalid TRACE case/);
  assert.equal(storage.getItem('trace_active_case_data_v2'), before);
  const duplicate = structuredClone(first); duplicate.evidence.push(duplicate.evidence[0]);
  assert.throws(() => trace.importCaseFromJson(JSON.stringify(duplicate)), /Invalid TRACE case/);
  storage.removeItem('trace_case_library_v1');
  first.meta.id = 'LEGACY-CUSTOM'; trace.saveActiveCaseData(first);
  storage.removeItem('trace_case_library_v1');
  assert.equal(trace.loadCaseById('LEGACY-CUSTOM').meta.summary, 'Saved investigator revision');
});

test('TRACE findings cannot attach through a missing or mismatched request', async () => {
  memory(); await store.resetDGAWorld();
  const c = await store.createManualIncidentCase({ narrative: 'An independent custom incident.' });
  const before = JSON.stringify(c);
  assert.equal(await store.attachTraceResultToDgaCase(c.id, 'FREQ-194-01', 'Unrelated result', 'FS-old'), false);
  assert.equal(JSON.stringify(c), before);
  c.forensicRequests.push({ id: 'REQ-this', evidenceIds: [], status: 'Pending', linkedTraceCaseId: 'FS-this' });
  assert.equal(await store.attachTraceResultToDgaCase(c.id, 'REQ-this', 'Another result', 'FS-other'), false);
  assert.equal(c.linkedTraceCaseId, undefined);
});

test('TRACE retains both the active case and library after a failed storage write', () => {
  const storage = memory(); const first = trace.loadCaseById('CASE-2026-001');
  const previous = new Map(storage.data);
  const write = storage.setItem; let fail = true;
  storage.setItem = (key, value) => { if (key === 'trace_active_case_data_v2' && fail) { fail = false; throw new Error('Storage full'); } write(key, value); };
  const changed = structuredClone(first); changed.meta.summary = 'Should not replace the previous saved copy';
  assert.throws(() => trace.saveActiveCaseData(changed), /Storage full/);
  assert.deepEqual(storage.data, previous);
});

test('TRACE respects restored empty records and reloads unfinished drafts', async () => {
  const storage = memory(); storage.setItem('trace_records_v2', '[]');
  storage.setItem('trace_drafts_v2', '{"EX-test":{"id":"EX-test","caseId":"custom","data":{"notes":"Keep me"}}}');
  const { traceDurableStore } = await import('../src/dgaos/services/traceDurableStore.ts');
  await traceDurableStore.init();
  assert.deepEqual(traceDurableStore.getRecords(), []);
  assert.equal(traceDurableStore.getDraft('EX-test').data.notes, 'Keep me');
});
