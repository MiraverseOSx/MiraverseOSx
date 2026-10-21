import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source = await readFile(new URL('../offline-worker.js', import.meta.url), 'utf8');
function worker() {
  const listeners = {}; const added = []; const deleted = [];
  const cached = new Response('<html>Offline shell</html>', { headers: { 'content-type': 'text/html' } });
  vm.runInNewContext(source, { CACHE_NAME: 'miraverse-shell-current', PRECACHE: ['/index.html', '/assets/mail.js'], URL, Response,
    self: { location: { origin: 'https://miraverse.test' }, clients: { claim: async () => {} }, addEventListener: (name, handler) => listeners[name] = handler },
    caches: { open: async () => ({ addAll: async urls => added.push(...urls), put: async () => {} }), match: async key => key === '/index.html' ? cached : undefined, keys: async () => ['miraverse-shell-old', 'miraverse-shell-current', 'unrelated-cache'], delete: async key => deleted.push(key) },
    fetch: async () => { throw new Error('Offline'); },
  });
  return { listeners, added, deleted };
}
test('offline worker precaches the shell and removes only its own obsolete caches', async () => {
  const { listeners, added, deleted } = worker();
  let pending;
  listeners.install({ waitUntil: value => pending = value }); await pending;
  assert.deepEqual(added, ['/index.html','/assets/mail.js']);
  listeners.activate({ waitUntil: value => pending = value }); await pending;
  assert.deepEqual(deleted, ['miraverse-shell-old']);
});
test('offline navigation falls back to the shell while APIs and foreign requests are untouched', async () => {
  const { listeners } = worker(); let response;
  listeners.fetch({ request: { method: 'GET', url: 'https://miraverse.test/', mode: 'navigate' }, respondWith: value => response = value });
  assert.match(await (await response).text(), /Offline shell/);
  for (const [method, url] of [['GET','https://miraverse.test/api/citizens'], ['GET','https://other.test/images/picture.jpg'], ['POST','https://miraverse.test/api/save']]) {
    let handled = false; listeners.fetch({ request: {method, url}, respondWith: () => handled = true }); assert.equal(handled, false);
  }
});
