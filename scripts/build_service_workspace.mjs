import { build } from '../frontend/node_modules/esbuild/lib/main.js';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const result = await build({ entryPoints: [path.join(root, 'frontend/src/apps/Browser/StandaloneWorkspace.tsx')], bundle: true, write: false, minify: true, format: 'iife', define: { 'process.env.NODE_ENV': '"production"' } });
const css = await readFile(path.join(root, 'frontend/src/styles/apps/versenet-browser.css'), 'utf8');
const studioCss = await readFile(path.join(root, 'frontend/src/styles/studio-design.css'), 'utf8');
const extraCss = '*{box-sizing:border-box}body{margin:0}.vn-standalone{height:100vh}.vn-workspace-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:12px;background:#f1f1f4;border-bottom:1px solid #dedde3}.vn-workspace-tabs span{display:flex}.vn-workspace-tabs button,.vn-workspace-address button{background:white;color:#39234f;border:1px solid #dedde3;padding:8px 12px;border-radius:5px}.vn-workspace-tabs button[aria-pressed=true]{background:#39234f;color:white}.vn-workspace-address{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:12px}.vn-workspace-address input{flex:1;min-width:160px;padding:10px;border:1px solid #dedde3;border-radius:5px}.vn-workspace-address label{font-size:11px;color:#6b6872}.vn-workspace-error{padding:0 16px;color:#9c3038}';
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Miraverse Service Workspace</title><style>${css}${extraCss}${studioCss}</style></head><body><div id="root"></div><script>${result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')}</script></body></html>`;
await mkdir(path.join(root, 'output'), { recursive: true });
await writeFile(path.join(root, 'output/service-workspace.html'), html);
console.log('Created output/service-workspace.html (self-contained, no server required).');
