import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium, expect } from '../frontend/node_modules/@playwright/test/index.mjs';

// Audit an isolated production build. This never starts or contacts the real save API.
const directory = path.resolve(process.argv[2]);
const results = { directory, artifacts: {}, browser: {} };
const source = await readFile(path.join(directory, 'sw.js'), 'utf8');
const cacheName = JSON.parse(source.match(/^const CACHE_NAME = (.+);$/m)[1]);
const precache = JSON.parse(source.match(/^const PRECACHE = (.+);$/m)[1]);
assert.equal(new Set(precache).size, precache.length, 'No duplicate precache entries');
for (const url of precache) {
  assert.ok(url.startsWith('/') && !url.startsWith('/api'), `Only local public resources: ${url}`);
  assert.ok((await stat(path.join(directory, decodeURIComponent(url)))).isFile(), `Cached asset exists: ${url}`);
}
const walk = async (folder, prefix = '') => (await Promise.all((await readdir(folder, { withFileTypes: true })).map(async entry => entry.isDirectory() ? walk(path.join(folder, entry.name), `${prefix}${entry.name}/`) : `${prefix}${entry.name}`))).flat();
const files = await walk(directory);
const bundles = files.filter(file => /\.(js|css|woff2?|ttf)$/.test(file) && file !== 'sw.js');
for (const file of bundles) assert.ok(precache.includes(`/${file}`), `Every built code/font asset is precached: ${file}`);
assert.ok(files.some(file => /^assets\/framer-motion-.*\.js$/.test(file)), 'Motion chunk survives');
assert.ok(files.some(file => /^assets\/lucide-icons-.*\.js$/.test(file)), 'Lucide chunk survives');
const manifest = JSON.parse(await readFile(path.join(directory, '.vite/manifest.json'), 'utf8'));
for (const record of Object.values(manifest)) {
  for (const dependency of [...(record.imports || []), ...(record.dynamicImports || [])]) assert.ok(manifest[dependency], `Manifest dependency resolves: ${dependency}`);
  for (const file of [record.file, ...(record.css || []), ...(record.assets || [])]) assert.ok(files.includes(file), `Manifest file resolves: ${file}`);
}
results.artifacts = { cacheName, precacheEntries: precache.length, manifestEntries: Object.keys(manifest).length, coveredBundles: bundles.length, namedChunks: true };

const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.wav': 'audio/wav' };
const server = http.createServer(async (request, response) => {
  if (request.url.startsWith('/api')) { response.writeHead(503, { 'Content-Type': 'application/json' }); response.end('{"error":"Isolated migration audit"}'); return; }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    const target = path.resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!target.startsWith(directory + path.sep)) throw new Error('Invalid path');
    const body = await readFile(target);
    response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await context.route(/^https:\/\//, route => route.abort());
  await context.addInitScript(() => { if (location.search.includes('seed-cache')) void caches.open('miraverse-shell-obsolete-audit'); });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${url}/?seed-cache`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Sign In / Login Boot', exact: true }).click();
  await page.getByPlaceholder('e.g. CY-9021-PLAYER or admin').fill('admin');
  await page.getByRole('button', { name: 'START LOGIN BOOT', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open Orbit', exact: true })).toBeVisible({ timeout: 30000 });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, { timeout: 30000 });
  await page.waitForFunction(async () => (await caches.keys()).filter(key => key.startsWith('miraverse-shell-')).length === 1);
  assert.deepEqual(await page.evaluate(() => caches.keys()), [cacheName], 'Activation removes obsolete Miraverse shell caches');
  await context.setOffline(true);
  await page.goto(`${url}/?offline-check`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Open Orbit', exact: true })).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: 'Open Orbit', exact: true }).click();
  await page.getByRole('button', { name: 'Select DGAOS', exact: true }).dblclick();
  await page.getByRole('button', { name: 'UNLOCK DGA COMMAND SHELL', exact: true }).click();
  await expect(page.getByRole('button', { name: 'DGA COMMAND CORE', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'TRACE FORENSIC LAB', exact: true })).toBeVisible();
  assert.deepEqual(errors, [], 'No runtime module errors, including after offline reload');
  await page.screenshot({ path: path.join(directory, 'offline-browser.png') });
  results.browser = { offlineReload: true, savedSessionRestored: true, obsoleteCacheRemoved: true, dgaosLazyLoad: true, runtimeErrors: errors };
  await context.close();
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
await writeFile(path.join(directory, 'audit-result.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
