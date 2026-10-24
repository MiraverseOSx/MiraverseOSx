import fs from 'fs';
import path from 'path';
import postcss from '../frontend/node_modules/postcss/lib/postcss.mjs';

const globalsPath = 'frontend/src/dgaos/globals.css';
const featuresPath = 'frontend/src/dgaos/features.css';
const outputPath = 'frontend/src/dgaos/styles/dgaos-integrated.css';

const scopePrefixes = [
  '.dga-workstation-root',
  '.workbench-root',
  '[data-dga-scope]',
  '[data-slot="dialog-content"]',
  '[data-slot="select-content"]',
  '[data-slot="popover-content"]'
];

function cleanPrePostcss(css) {
  // Replace Tailwind v4 @utility scrollbar-none
  css = css.replace(/@utility\s+scrollbar-none\s*\{[\s\S]*?&::-webkit-scrollbar\s*\{[\s\S]*?\}\s*\}/g, `
.scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
`);

  // Unwrap @layer base
  css = css.replace(/@layer\s+base\s*\{([\s\S]*?)\}/g, '$1');

  return css;
}

function transformSelector(sel) {
  const parts = sel.split(',').map(s => s.trim()).filter(Boolean);
  return parts.map(p => {
    // Preserve root tokens
    if (p.startsWith(':root')) {
      return ':root, .dga-workstation-root, .workbench-root, [data-dga-scope]';
    }
    // Replace body or html
    if (p === 'body' || p === 'html' || p === 'html, body' || p === 'body, html') {
      return '.dga-workstation-root, .workbench-root, [data-dga-scope]';
    }
    if (/^(body|html)\s+/.test(p)) {
      const rest = p.replace(/^(body|html)\s+/, '');
      return scopePrefixes.map(pref => `${pref} ${rest}`).join(', ');
    }
    // If selector already targets .dga-workstation-root or .workbench-root
    if (p.startsWith('.dga-workstation-root') || p.startsWith('.workbench-root') || p.startsWith('[data-dga-scope]')) {
      return p;
    }
    // Avoid double prefixing
    return scopePrefixes.map(pref => `${pref} ${p}`).join(', ');
  }).join(', ');
}

function processCssFile(filePath) {
  let raw = fs.readFileSync(filePath, 'utf8');
  raw = cleanPrePostcss(raw);

  const root = postcss.parse(raw);

  root.walkRules(rule => {
    // Don't scope keyframes or page rules
    if (rule.parent && rule.parent.type === 'atrule') {
      if (['keyframes', 'page'].includes(rule.parent.name)) return;
    }

    rule.selector = transformSelector(rule.selector);

    // Replace 100vh / 100vw container sizing with 100% inside embedded window
    rule.walkDecls(decl => {
      // In print or dialogs, allow natural sizes, but in layout containers ensure 100%
      if (decl.prop === 'min-height' && decl.value.includes('100vh')) {
        decl.value = decl.value.replace(/100vh/g, '100%');
      }
      if (decl.prop === 'height' && decl.value.includes('100vh')) {
        decl.value = decl.value.replace(/100vh/g, '100%');
      }
      if (decl.prop === 'max-height' && decl.value.includes('100vh')) {
        decl.value = decl.value.replace(/100vh/g, '100%');
      }
      if (decl.prop === 'width' && decl.value.includes('100vw')) {
        decl.value = decl.value.replace(/100vw/g, '100%');
      }
      if (decl.prop === 'max-width' && decl.value.includes('100vw')) {
        decl.value = decl.value.replace(/100vw/g, '100%');
      }
    });
  });

  return root.toResult().css;
}

const customBootstrapNeutralizers = `
/* ==========================================================================
   DGAOS & TRACE BOOTSTRAP OVERRIDES & WORKSTATION ISOLATION
   Ensures complete visual parity with standalone localhost:3001
   ========================================================================== */

.dga-workstation-root,
.workbench-root,
[data-dga-scope] {
  box-sizing: border-box;
  font-family: inherit;
  color: #0f0d1a;
  background-color: #ebe9f3;
  line-height: 1.5;
}

.dga-workstation-root *,
.workbench-root *,
[data-dga-scope] * {
  box-sizing: border-box;
}

/* Neutralize Bootstrap table resets */
.dga-workstation-root table,
.workbench-root table,
[data-dga-scope] table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin-bottom: 0 !important;
  caption-side: top !important;
  border-spacing: 0 !important;
  background-color: transparent !important;
}

.dga-workstation-root table th,
.workbench-root table th,
[data-dga-scope] table th {
  text-align: left !important;
  font-size: 11px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
  color: #3b3749 !important;
  padding: 12px 16px !important;
  border-bottom: 1.5px solid #a89bc2 !important;
  background: #f7f5fa !important;
  font-weight: 700 !important;
  vertical-align: middle !important;
}

.dga-workstation-root table td,
.workbench-root table td,
[data-dga-scope] table td {
  padding: 12px 16px !important;
  border-bottom: 1px solid #ebe6f5 !important;
  font-size: 12.5px !important;
  color: #0f0d1a !important;
  vertical-align: middle !important;
  background-color: #ffffff !important;
}

.dga-workstation-root table tr:hover td,
.workbench-root table tr:hover td,
[data-dga-scope] table tr:hover td {
  background-color: #fcfbfe !important;
}

/* Neutralize Bootstrap card resets on panels and stats */
.dga-workstation-root .panel,
.workbench-root .panel,
[data-dga-scope] .panel {
  border: 1.5px solid #a89bc2 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  overflow: hidden !important;
  color: #0f0d1a !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  margin-bottom: 0 !important;
}

.dga-workstation-root .stat,
.workbench-root .stat,
[data-dga-scope] .stat {
  border: 1.5px solid #a89bc2 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  padding: 20px !important;
  color: #0f0d1a !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
  text-align: left !important;
}

.dga-workstation-root .practice-card,
.workbench-root .practice-card,
[data-dga-scope] .practice-card {
  border: 1.5px solid #a89bc2 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  padding: 20px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
}

.dga-workstation-root .overview-banner,
.workbench-root .overview-banner,
[data-dga-scope] .overview-banner {
  border: 1.5px solid #a89bc2 !important;
  background: #ffffff !important;
  padding: 24px 28px !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  color: #0f0d1a !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  margin-bottom: 24px !important;
}

/* Neutralize Bootstrap button / link defaults */
.dga-workstation-root button,
.workbench-root button,
[data-dga-scope] button {
  font-family: inherit;
}

.dga-workstation-root .primary,
.workbench-root .primary,
[data-dga-scope] .primary {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  border-radius: 6px !important;
  padding: 10px 18px !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  border: 1px solid #312e81 !important;
  background: #4338ca !important;
  color: #ffffff !important;
  text-decoration: none !important;
}

.dga-workstation-root .primary:hover,
.workbench-root .primary:hover,
[data-dga-scope] .primary:hover {
  background: #3730a3 !important;
  border-color: #1e1b4b !important;
  color: #ffffff !important;
}

.dga-workstation-root .secondary,
.workbench-root .secondary,
[data-dga-scope] .secondary {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  border-radius: 6px !important;
  padding: 10px 18px !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  border: 1.5px solid #a89bc2 !important;
  background: #c1b4d9 !important;
  color: #0f0d1a !important;
  text-decoration: none !important;
}

.dga-workstation-root .secondary:hover,
.workbench-root .secondary:hover,
[data-dga-scope] .secondary:hover {
  background: #b3a4ce !important;
  border-color: #8c7ea9 !important;
  color: #0c0a14 !important;
}
`;

console.log('Processing globals.css...');
const processedGlobals = processCssFile(globalsPath);

console.log('Processing features.css...');
const processedFeatures = processCssFile(featuresPath);

const finalCss = [
  '/* Auto-generated Scoped DGAOS & TRACE Workstation Stylesheet */',
  customBootstrapNeutralizers,
  '/* --- GLOBALS (SCOPED) --- */',
  processedGlobals,
  '/* --- FEATURES (SCOPED) --- */',
  processedFeatures
].join('\n\n');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, finalCss, 'utf8');
console.log(`Generated ${outputPath} (${(finalCss.length / 1024).toFixed(1)} KB)`);
