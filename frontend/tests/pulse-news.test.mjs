import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNewsEdition, filterNews, newsExposure, restoreNewsReading } from '../src/apps/Pulse/newsModel.ts';
import { NEWS_SITE, newsUrl, parseNewsLocation, newsSearchRecords } from '../src/apps/Browser/news/newsSite.ts';

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

test('briefing and article use the same bounded world exposure from old saves', () => {
  for (const [input, expected] of [[-10, 0], [150, 100], [14.8, 14.8], [NaN, 0], [Infinity, 0], ['14.8', 0], [undefined, 0]]) {
    assert.equal(newsExposure(input), expected);
    assert.ok(buildNewsEdition({ corruption: input })[0].summary.includes(`${expected.toFixed(1)}%`));
  }
});
test('reading preferences restore safely from old and malformed saves', () => {
  assert.deepEqual(restoreNewsReading(undefined), { saved: [], read: [] });
  assert.deepEqual(restoreNewsReading({ saved: ['civic-network', null, 'civic-network'], read: 6 }), { saved: ['civic-network'], read: [] });
  const value = restoreNewsReading({ saved: ['faith-recovery'], read: ['employment-guide'] });
  assert.deepEqual(restoreNewsReading(JSON.parse(JSON.stringify(value))), value);
});

test('publication addresses preserve sections, searches and saved article context', () => {
  assert.equal(newsUrl(), NEWS_SITE.url);
  for (const input of [
    { section: 'Economy', query: 'contract compensation' },
    { savedOnly: true, section: 'Health' },
    { articleId: 'story/with spaces', section: 'Economy', query: 'terms & pay', savedOnly: true },
  ]) {
    assert.deepEqual(parseNewsLocation(newsUrl(input)), {
      section: 'All news', query: '', savedOnly: false, articleId: null, ...input, valid: true,
    });
  }
  for (const address of ['https://other.mer', 'https://dispatch.mer/unknown',
    'https://dispatch.mer/section/unknown', 'https://dispatch.mer/article/%XX',
    'https://dispatch.mer/?section=unknown', 'https://user@dispatch.mer', 'not an address']) {
    assert.equal(parseNewsLocation(address).valid, false, address);
  }
});

test('publication search points to article URLs and excludes private world data', () => {
  const records = newsSearchRecords({ cycle: 28, worldEventLog: [{ title: 'Sealed secret' }] });
  assert.equal(records.length, 8);
  assert.doesNotMatch(JSON.stringify(records), /Sealed secret/);
  for (const record of records) {
    assert.equal(record.publisher, NEWS_SITE.name);
    assert.equal(parseNewsLocation(record.url).valid, true);
    assert.ok(parseNewsLocation(record.url).articleId);
  }
});
