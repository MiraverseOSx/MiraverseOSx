import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(name, context, next) { try { return next(name, context); } catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND' || !name.startsWith('.')) throw error;
  return next(`${name}.ts`, context);
} } });
const { createWorldBackup, parseWorldBackup } = await import('../src/backend/worldBackup.ts');
const { applyWorldEntries } = await import('../src/backend/worldRecords.ts');
const { readWorldEntries } = await import('../src/backend/worldSync.ts');
const { restoreWorldEntries } = await import('../src/backend/worldConnection.ts');
function memory(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { data, get length() { return data.size; }, key: i => [...data.keys()][i] ?? null,
    getItem: key => data.get(key) ?? null, setItem: (key, raw) => data.set(key, raw), removeItem: key => data.delete(key) };
}
const records = {
  DGAOS_WORKSTATION_STATE_V3: '{"cases":[{"id":"case-A"}]}',
  trace_records_v2: '[{"id":"exhibit","caseId":"case-A"}]', trace_drafts_v2: '{"draft":{"caseId":"case-A"}}',
  trace_transmissions_v2: '{"report":{"dgaCaseId":"case-A"}}', trace_case_library_v1: '{}',
  trace_open_lab_notes: 'Unfinished notes - not JSON', trace_open_lab_logs: '[]',
  'trace_exam_draft_EX-1': '{"draft":"unsubmitted"}', 'DGAOS_SUGGESTION_STATE_case-A': '{"dismissed":["one"]}',
  'miraverse-issued-document-snapshots-v1': '[{"id":"issued"}]',
};
test('portable backups round-trip agency, TRACE, draft, issued-document and per-case records', () => {
  const storage = memory({ ...records, password: 'do not export', unrelated: '{}' });
  const backup = createWorldBackup(storage);
  assert.deepEqual(parseWorldBackup(JSON.stringify(backup)), records);
  const target = memory({ 'trace_exam_draft_stale': '{}', password: 'keep' });
  applyWorldEntries(target, backup.entries);
  assert.deepEqual(readWorldEntries(target), records);
  assert.equal(target.getItem('trace_exam_draft_stale'), null);
  assert.equal(target.getItem('password'), 'keep');
});
test('unknown keys and invalid record shapes are rejected before any restore writes', () => {
  const storage = memory(records);
  assert.throws(() => applyWorldEntries(storage, { ...records, credentials: '{}' }), /invalid records/);
  assert.deepEqual(readWorldEntries(storage), records);
  assert.throws(() => parseWorldBackup(JSON.stringify({ format: 'miraverse-world-backup', version: 1, entries: { trace_records_v2: '{}' } })), /not a supported/);
  assert.throws(() => parseWorldBackup('{"format":"miraverse-world-backup","version":99,"entries":{}}'), /not a supported/);
});
test('restore preserves the displaced device world and rolls back a failed write', async () => {
  const storage = memory(records); globalThis.localStorage = storage;
  let failOnce = true;
  const original = storage.setItem;
  storage.setItem = (key, value) => { if (key === 'trace_records_v2' && failOnce) { failOnce = false; throw new Error('Storage full'); } original(key, value); };
  await assert.rejects(restoreWorldEntries({ trace_records_v2: '[]' }), /Storage full/);
  assert.deepEqual(readWorldEntries(storage), records);
  const raw = [...storage.data.entries()].find(([key]) => key.startsWith('miraverse-world-backup-'))[1];
  assert.deepEqual(parseWorldBackup(raw), records);
});
