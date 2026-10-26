import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNewsEdition, filterNews, restoreNewsReading } from '../src/apps/Pulse/newsModel.ts';

test('public news follows world exposure without copying private records or modifying progress', () => {
  const world = { cycle: 28, corruption: 21.4, worldEventLog: [{ title: 'Secret suspect', summary: 'sealed evidence' }], player: { credits: 500 } };
  const before = JSON.stringify(world);
  const edition = buildNewsEdition(world);
  assert.equal(edition.length, 8);
  assert.equal(new Set(edition.map(item => item.id)).size, edition.length);
  assert.match(edition[0].headline, /elevated/);
  assert.match(edition[0].summary, /21.4%/);
  assert.doesNotMatch(JSON.stringify(edition), /Secret suspect|sealed evidence/);
  assert.equal(JSON.stringify(world), before);
  assert.notEqual(buildNewsEdition({ cycle: 28, corruption: 2 })[0].headline, edition[0].headline);
  assert.equal(buildNewsEdition({ cycle: 29, corruption: 2 })[0].id, edition[0].id, 'saved live coverage remains available across cycles');
  assert.match(buildNewsEdition({ corruption: NaN })[0].summary, /0.0%/);
});
test('sections, article-body search, saved filtering and empty results combine', () => {
  const edition = buildNewsEdition({ cycle: 28 });
  assert.equal(filterNews(edition, 'Economy', 'contract compensation', false, []).length, 1);
  assert.equal(filterNews(edition, 'Health', '', true, ['faith-recovery'])[0].id, 'faith-recovery');
  assert.deepEqual(filterNews(edition, 'Security', '', true, ['faith-recovery']), []);
  assert.deepEqual(filterNews(edition, 'All news', 'unfindable', false, []), []);
});
test('reading preferences restore safely from old and malformed saves', () => {
  assert.deepEqual(restoreNewsReading(undefined), { saved: [], read: [] });
  assert.deepEqual(restoreNewsReading({ saved: ['civic-network', null, 'civic-network'], read: 6 }), { saved: ['civic-network'], read: [] });
  const value = restoreNewsReading({ saved: ['faith-recovery'], read: ['employment-guide'] });
  assert.deepEqual(restoreNewsReading(JSON.parse(JSON.stringify(value))), value);
});
