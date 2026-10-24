import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { renderToString } from 'react-dom/server';
import React from 'react';
import path from 'node:path';

test('MEDSTAT renders its chart while the asynchronous citizen registry is still loading', async () => {
  const result = await build({ entryPoints: ['src/dgaos/components/dga/medstat/dga-medical-chart.tsx'], bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external', plugins: [{ name: 'chart-dependencies', setup(builder) {
    builder.onResolve({ filter: /^@\/lib\/medical-data$/ }, () => ({ path: path.resolve('src/dgaos/lib/medical-data.ts') }));
    builder.onResolve({ filter: /^@\// }, args => ({ path: args.path, namespace: 'chart-stub' }));
    builder.onResolve({ filter: /citizenBridge|dga-medical-request-queue/ }, args => ({ path: args.path, namespace: 'chart-stub' }));
    builder.onLoad({ filter: /.*/, namespace: 'chart-stub' }, args => ({ contents: args.path.includes('citizenBridge')
      ? 'export async function getCanonicalCitizens(){return []} export function getActiveCitizenContext(){return null} export function openCitizenInApp(){} export async function syncFaithMedicalUpdate(){return {success:true}}'
      : args.path.includes('dga-medical-request-queue') ? 'export function DgaMedicalRequestQueue(){return null}'
      : 'export function playCardiacBeep(){} export async function escalateMedicalCaseToInvestigation(){}' }));
  } }] });
  const module = { exports: {} };
  const require = createRequire(import.meta.url);
  const icons = new Proxy({}, { get: () => () => null });
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(name => name === 'lucide-react' ? icons : require(name), module, module.exports);
  const html = renderToString(React.createElement(module.exports.DgaMedicalChart));
  assert.match(html, /Loading citizens/);
  assert.match(html, /Sync Chart Vitals to MAID/);
  assert.match(html, /disabled=""/);
  assert.match(html, /Vance/);
});
