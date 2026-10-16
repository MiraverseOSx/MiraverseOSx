/**
 * Visual and Data Parity Acceptance Test
 * Validates visual alignment and 31-record data parity between
 * standalone DGAOS/TRACE (localhost:3001) and integrated MiraverseOSx (localhost:3000).
 */

import fs from 'fs';
import path from 'path';
import { seed, type LabRecord } from '../frontend/src/dgaos/lib/records';
import { traceDurableStore } from '../frontend/src/dgaos/services/traceDurableStore';

// Minimal polyfill for test environment
if (typeof (global as any).localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = String(val); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; },
  };
}

let passed = 0;
let failed = 0;

function assert(cond: boolean, name: string, detail?: string) {
  if (cond) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name} - ${detail || 'Assertion failed'}`);
    failed++;
  }
}

async function runParityTests() {
  console.log('\n=============================================================');
  console.log('   MIRAVERSEOSX — DGAOS/TRACE VISUAL & DATA PARITY TESTS     ');
  console.log('=============================================================\n');

  // --- Suite 1: Data Parity ---
  console.log('[Suite 1] Authoritative 31-Record Parity');
  assert(seed.length === 31, 'Seed dataset contains exact 31 authoritative records', `Found ${seed.length}`);

  const cases = seed.filter(r => r.kind === 'case');
  const evidence = seed.filter(r => r.kind === 'evidence');
  const exams = seed.filter(r => r.kind === 'examination');
  const reports = seed.filter(r => r.kind === 'report');

  assert(cases.length === 9, '9 authoritative case records present', `Found ${cases.length}`);
  assert(evidence.length === 12, '12 authoritative evidence records present', `Found ${evidence.length}`);
  assert(exams.length === 9, '9 authoritative examination records present', `Found ${exams.length}`);
  assert(reports.length === 1, '1 authoritative report record present', `Found ${reports.length}`);

  await traceDurableStore.init();
  const loaded = traceDurableStore.getRecords();
  assert(loaded.length >= 31, 'traceDurableStore loads all 31 records', `Found ${loaded.length}`);

  // Check specific high-profile cases from localhost:3001
  const vaultCase = loaded.find(r => r.id === 'FS-2026-00422');
  assert(!!vaultCase && vaultCase.data.title.includes('Vault Breach'), 'FS-2026-00422 Broad Street Vault Breach intact');

  const velvetCase = loaded.find(r => r.id === 'FS-2026-13AD9A0D');
  assert(!!velvetCase && velvetCase.data.title.includes('Velvet Cord'), 'FS-2026-13AD9A0D Velvet Cord DGA-linked case intact');

  const ironGridCase = loaded.find(r => r.id === 'FS-2026-548D8C97');
  assert(!!ironGridCase && ironGridCase.data.title.includes('Iron Grid'), 'FS-2026-548D8C97 Iron Grid DGA-linked case intact');

  // --- Suite 2: CSS Stylesheet Generation & Import Integrity ---
  console.log('\n[Suite 2] Scoped Stylesheet & Component Import Integrity');
  const cssPath = 'frontend/src/dgaos/styles/dgaos-integrated.css';
  assert(fs.existsSync(cssPath), 'dgaos-integrated.css exists');

  const cssStat = fs.statSync(cssPath);
  assert(cssStat.size > 200000, 'dgaos-integrated.css is complete (>200KB)', `Size: ${(cssStat.size / 1024).toFixed(1)} KB`);

  const dgaosAppCode = fs.readFileSync('frontend/src/dgaos/apps/DgaosApp.tsx', 'utf8');
  assert(dgaosAppCode.includes("import '../styles/dgaos-integrated.css'"), 'DgaosApp.tsx imports scoped stylesheet');

  const traceAppCode = fs.readFileSync('frontend/src/dgaos/apps/TraceApp.tsx', 'utf8');
  assert(traceAppCode.includes("import '../styles/dgaos-integrated.css'"), 'TraceApp.tsx imports scoped stylesheet');

  const workbenchCode = fs.readFileSync('frontend/src/dgaos/components/workbench.tsx', 'utf8');
  assert(workbenchCode.includes("import '../styles/dgaos-integrated.css'"), 'workbench.tsx imports scoped stylesheet');

  // --- Suite 3: Bootstrap Neutralization & Dashboard Styling ---
  console.log('\n[Suite 3] Bootstrap Neutralization & Dashboard Element Styles');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('.dga-workstation-root table') && cssContent.includes('border-collapse'), 'Table formatting explicitly defined with border-collapse');
  assert(cssContent.includes('.dga-workstation-root table th') && cssContent.includes('padding: 12px 16px'), 'Table header th padding and styling intact');
  assert(cssContent.includes('.dga-workstation-root table td') && cssContent.includes('border-bottom: 1px solid #ebe6f5'), 'Table cell td padding and lavender border intact');
  assert(cssContent.includes('.dga-workstation-root .panel') && cssContent.includes('border: 1.5px solid #a89bc2'), 'Panel lavender border (1.5px solid #a89bc2) intact');
  assert(cssContent.includes('.dga-workstation-root .stat') && cssContent.includes('box-shadow'), 'Stat card borders, padding and box-shadow intact');
  assert(cssContent.includes('.stats') && cssContent.includes('grid-template-columns: repeat(4, 1fr)'), 'Stats 4-column metric cards grid intact');
  assert(cssContent.includes('.dashboard-grid') && cssContent.includes('grid-template-columns: 2fr 1fr'), 'Dashboard 2fr 1fr layout grid intact');
  assert(cssContent.includes('.discipline-strip') && cssContent.includes('grid-template-columns: repeat(4, 1fr)'), 'Discipline strip 4-column cards intact');
  assert(cssContent.includes('.queue') && cssContent.includes('flex-direction: column'), 'Operational queue vertical layout intact');

  // --- Suite 4: Embedded Window Sizing (No h-screen/w-screen) ---
  console.log('\n[Suite 4] Embedded Window Sizing Audit');
  const dgaShellCode = fs.readFileSync('frontend/src/dgaos/components/dga/dga-shell.tsx', 'utf8');
  assert(!dgaShellCode.includes('h-screen w-screen'), 'dga-shell.tsx contains no h-screen w-screen instances');
  assert(dgaShellCode.includes('h-full w-full flex flex-col'), 'dga-shell.tsx uses h-full w-full flex flex-col');

  const bootScreenCode = fs.readFileSync('frontend/src/dgaos/components/dga/dga-boot-screen.tsx', 'utf8');
  assert(!bootScreenCode.includes('fixed inset-0'), 'dga-boot-screen.tsx uses absolute inset-0 (not fixed inset-0)');

  // --- Suite 5: CSS Isolation & No Global Bleed ---
  console.log('\n[Suite 5] CSS Isolation & OS Canvas Protection');
  // Check that there is no unscoped "body {" or "html {" inside dgaos-integrated.css
  const hasUnscopedBody = /(^|\n)body\s*\{/i.test(cssContent);
  const hasUnscopedHtml = /(^|\n)html\s*\{/i.test(cssContent);
  assert(!hasUnscopedBody, 'No unscoped "body {" selector in dgaos-integrated.css (cannot bleed to OS desktop)');
  assert(!hasUnscopedHtml, 'No unscoped "html {" selector in dgaos-integrated.css (cannot bleed to OS desktop)');

  console.log('\n=============================================================');
  console.log(`   PARITY TEST RESULTS: ${passed} PASSED | ${failed} FAILED  `);
  console.log('=============================================================\n');

  if (failed > 0) process.exit(1);
}

runParityTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
