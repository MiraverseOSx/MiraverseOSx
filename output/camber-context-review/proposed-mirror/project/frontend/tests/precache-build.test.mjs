import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, mkdir, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import config from '../vite.config.js';

test('offline manifest contains final emitted assets after CSS-only JavaScript chunks are removed', async () => {
  const temporaryRoot = path.resolve(tmpdir());
  const fixture = await mkdtemp(path.join(temporaryRoot, 'miraverse-precache-test-'));
  try {
    await writeFile(path.join(fixture, 'index.html'), '<html><body><script type="module" src="/main.js"></script></body></html>');
    await writeFile(path.join(fixture, 'main.js'), 'Promise.all([import("./a.js"), import("./b.js"), import("./standalone.css")]).then(items => document.body.dataset.loaded = items.slice(0,2).map(item => item.text).join(" "));');
    await writeFile(path.join(fixture, 'a.js'), 'import "./shared.css"; export const text = "alpha";');
    await writeFile(path.join(fixture, 'b.js'), 'import "./shared.css"; export const text = "beta";');
    await writeFile(path.join(fixture, 'shared.css'), 'body { color: #241d20; }');
    await writeFile(path.join(fixture, 'standalone.css'), 'body { background: #fffcf9; }');
    const output = path.join(fixture, 'built');
    const result = await build({ ...config, configFile: false, root: fixture, publicDir: false, logLevel: 'silent', build: { ...config.build, outDir: output, manifest: true } });
    const sw = await readFile(path.join(output, 'sw.js'), 'utf8');
    const urls = JSON.parse(sw.match(/^const PRECACHE = (.+);$/m)[1]);
    const emitted = result.output.filter(file => /\.(js|css|woff2?|ttf)$/.test(file.fileName) && file.fileName !== 'sw.js').map(file => `/${file.fileName}`);
    assert.ok(emitted.some(url => url.endsWith('.css')), 'Fixture emits extracted CSS');
    assert.deepEqual([...urls.filter(url => url.startsWith('/assets/'))].sort(), emitted.sort());
    for (const url of emitted) assert.ok((await stat(path.join(output, url))).isFile(), url);
    assert.equal(new Set(urls).size, urls.length);
    assert.ok(!urls.some(url => url.startsWith('/api')));
  } finally {
    // Only remove this test's newly created direct child of the verified temp root.
    assert.equal(path.dirname(path.resolve(fixture)), temporaryRoot);
    assert.ok(path.basename(fixture).startsWith('miraverse-precache-test-'));
    await rm(fixture, { recursive: true, force: true });
  }
});
