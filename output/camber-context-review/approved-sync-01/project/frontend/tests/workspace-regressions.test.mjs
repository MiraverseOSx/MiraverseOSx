import assert from 'node:assert/strict';
import test from 'node:test';
import { citizenSelection, subscribeCitizenUpdates } from '../src/integration/citizenEvents.ts';
import { parseTreasuryTelemetry } from '../src/services/treasuryTelemetry.ts';

class TestWindow extends EventTarget {
  location = { origin: 'http://localhost:3018' };
  listeners = new Set();
  addEventListener(type, handler) { this.listeners.add(handler); super.addEventListener(type, handler); }
  removeEventListener(type, handler) { this.listeners.delete(handler); super.removeEventListener(type, handler); }
  emit(type, properties) { this.dispatchEvent(Object.assign(new Event(type), properties)); }
}

test('citizen refresh ignores unrelated saves and preserves explicit focus changes', () => {
  const target = new TestWindow();
  const updates = [];
  const unsubscribe = subscribeCitizenUpdates(update => updates.push(update), target);
  assert.equal(target.listeners.size, 3);
  target.emit('storage', { key: 'miraverse-os-progress', newValue: '{}' });
  assert.deepEqual(updates, []);
  target.emit('storage', { key: 'miraverse-canonical-identities-v1' });
  assert.deepEqual(updates, [{}]);
  target.emit('storage', { key: 'miraverse-active-citizen-context-v1', newValue: '{broken' });
  assert.equal(updates.length, 1);
  target.emit('storage', { key: 'miraverse-active-citizen-context-v1', newValue: JSON.stringify({ citizenId: 'MAID-02', targetDocId: 8 }) });
  assert.deepEqual(updates.at(-1), { citizenId: 'MAID-02', targetDocId: 8 });
  target.emit('miraverse-citizen-context', { detail: { citizenId: 'MAID-03', targetDocId: 500 } });
  assert.deepEqual(updates.at(-1), { citizenId: 'MAID-03', targetDocId: undefined });
  const before = updates.length;
  unsubscribe();
  assert.equal(target.listeners.size, 0);
  target.emit('storage', { key: null });
  target.emit('miraverse-citizen-context', { detail: { citizenId: 'MAID-04' } });
  assert.equal(updates.length, before);
});

test('citizen messages require the current window and origin', () => {
  const target = new TestWindow();
  const updates = [];
  const unsubscribe = subscribeCitizenUpdates(update => updates.push(update), target);
  const data = { source: 'citizen-bridge', type: 'active-citizen-changed', payload: { citizenId: 'MAID-01', targetDocId: 5 } };
  target.emit('message', { source: {}, origin: target.location.origin, data });
  target.emit('message', { source: target, origin: 'http://other.test', data });
  assert.equal(updates.length, 0);
  target.emit('message', { source: target, origin: target.location.origin, data });
  assert.deepEqual(updates, [{ citizenId: 'MAID-01', targetDocId: 5 }]);
  target.emit('message', { source: target, origin: target.location.origin, data: { source: 'meridion-registry', type: 'citizens-changed' } });
  assert.deepEqual(updates.at(-1), {});
  unsubscribe();
  assert.equal(citizenSelection({ citizenId: 12 }), undefined);
});

test('Treasury accepts numeric strings and safely formats network readings', () => {
  const stats = parseTreasuryTelemetry({ data: { blocks: '892416', difficulty: '1.1376e14', hashrate_24h: 842600000000000000000, mempool_transactions: 0 }, context: { code: 200 } });
  assert.equal(stats.blocks, 892416);
  assert.equal(stats.difficulty.toExponential(4), '1.1376e+14');
  assert.equal(stats.hashrate_24h, '842.6 EH/s');
  assert.equal(stats.mempool_transactions, 0);
  assert.equal(parseTreasuryTelemetry({ hashrate_24h: '842.6 EH' }).hashrate_24h, '842.6 EH');
});

test('Treasury rejects error envelopes and invalid values instead of rendering them', () => {
  for (const response of [null, [], '<html>', { data: null, context: { code: 429 } }, { data: { blocks: 2 }, context: { code: '500' } }, { error: 'Unavailable', blocks: 2 }, { blocks: {}, difficulty: 'invalid', transactions: -1 }, { data: { difficulty: true } }]) {
    assert.equal(parseTreasuryTelemetry(response), null);
  }
  const partial = parseTreasuryTelemetry({ blocks: 20, difficulty: {}, hashrate_24h: { invalid: true } });
  assert.equal(partial.blocks, 20);
  assert.equal(partial.difficulty, undefined);
  assert.equal(partial.hashrate_24h, undefined);
});
