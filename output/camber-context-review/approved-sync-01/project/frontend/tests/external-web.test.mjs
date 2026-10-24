import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { DEFAULT_SERVICES, externalWebUrl, serviceLaunchUrl, isInternalAddress, restoreServices, localHtmlWrapper } = await import('../src/apps/Browser/externalWeb.ts');

test('external destinations preserve fictional aliases and reject executable schemes or credentials', () => {
  for (const host of ['versenet.aure', 'dga.gov', 'cyacademy.edu', 'records.orynvell.gov', 'mai.space', 'civinet', 'faithmed.aure', 'shipping.aure', 'vectornet.onion', 'services.aure', 'new.mer']) {
    assert.equal(isInternalAddress(`https://${host}/path`), true, host);
    assert.equal(externalWebUrl(`https://${host}/path`), null);
  }
  assert.equal(externalWebUrl('https://example.com/path?q=work'), 'https://example.com/path?q=work');
  assert.equal(externalWebUrl('http://localhost:8080/tool.html'), 'http://localhost:8080/tool.html');
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'ftp://example.com', 'file:///C:/tool.html', 'https://user:pass@example.com', 'https://example.com@dga.gov', 'not a url']) assert.equal(externalWebUrl(value), null, value);
});

test('local destinations are restricted to explicit local HTML files', () => {
  assert.equal(serviceLaunchUrl('file:///C:/Tools/My%20App/index.html'), 'file:///C:/Tools/My%20App/index.html');
  assert.equal(serviceLaunchUrl('file:///C:/Tools/index.HTM'), 'file:///C:/Tools/index.HTM');
  for (const value of ['file://server/share/app.html', 'file:///C:/app.exe', 'file:///C:/app.html?run=1', 'file:///C:/app.html#code', 'file:///C:/app.html.exe', 'javascript:alert(1)']) assert.equal(serviceLaunchUrl(value), null, value);
});

test('directory has the supplied 11 applications and safely restores edited links', () => {
  assert.equal(DEFAULT_SERVICES.length, 11);
  assert.equal(new Set(DEFAULT_SERVICES.map(service => service.id)).size, 11);
  assert.equal(DEFAULT_SERVICES.find(service => service.name === 'MedCore').url, '');
  const valid = DEFAULT_SERVICES[0];
  assert.deepEqual(restoreServices([null, valid, valid, { ...valid, id: 'bad', url: 'javascript:alert(1)' }, { ...valid, id: 'local', url: 'file:///C:/app.html' }]).map(service => service.id), ['medcore', 'local']);
  assert.deepEqual(restoreServices({}), []);
  assert.deepEqual(restoreServices([]), []);
  assert.ok(DEFAULT_SERVICES.every(service => !service.url.includes('utm_source')));
});

test('local HTML is escaped into a restricted child frame rather than the app origin', () => {
  const untrusted = '"><script>parent.localStorage.clear()</script><iframe src="https://example.com"></iframe>';
  const wrapper = localHtmlWrapper(untrusted);
  assert.ok(wrapper.includes('sandbox="allow-scripts allow-forms"'));
  assert.ok(!wrapper.includes('allow-same-origin'));
  assert.ok(!wrapper.includes('<script>'));
  assert.ok(wrapper.includes('&lt;script&gt;'));
  assert.equal((wrapper.match(/<iframe /g) || []).length, 1);
});

test('native launcher removes its capability from the URL and handles acknowledged failures', async () => {
  let receive;
  let sent;
  let replaced;
  globalThis.sessionStorage = new Map();
  sessionStorage.setItem = sessionStorage.set.bind(sessionStorage);
  sessionStorage.getItem = sessionStorage.get.bind(sessionStorage);
  globalThis.window = {
    location: { search: '?nativeLaunchToken=test-token&keep=yes', pathname: '/index.html', hash: '' },
    history: { state: null, replaceState: (_state, _unused, url) => { replaced = url; } },
    setTimeout, external: { receiveMessage: callback => { receive = callback; }, sendMessage: raw => { sent = JSON.parse(raw); } },
  };
  const launcher = await import('../src/services/externalLauncher.ts?native-test');
  assert.equal(replaced, '/index.html?keep=yes');
  const success = launcher.launchExternal('https://example.com');
  assert.equal(sent.payload.token, 'test-token');
  receive(JSON.stringify({ action: 'other_ack', requestId: sent.requestId }));
  receive(JSON.stringify({ action: 'open_external_ack', requestId: sent.requestId, payload: { status: 'opened' } }));
  await success;
  const failure = launcher.launchExternal('file:///C:/tool.html');
  receive(JSON.stringify({ action: 'open_external_ack', requestId: sent.requestId, payload: { status: 'rejected' } }));
  await assert.rejects(failure, /could not be opened/);
  await assert.rejects(launcher.launchExternal('javascript:alert(1)'));
  window.location.search = '';
  const reloaded = await import('../src/services/externalLauncher.ts?native-reload-test');
  assert.equal(reloaded.hasNativeLauncher(), true, 'native capability survives a top-level reload in session storage');
});
