/**
 * TRACE Forensic Science System — Dedicated Print & Output Engine
 * 
 * Provides isolated, pixel-perfect printing for evidence tags, laboratory bench sheets,
 * and certificates of analysis without interference from modal dialog overlays,
 * scroll locks, or viewport constraints.
 */

export interface PrintOptions {
  /** Document title shown in print dialog & PDF output */
  title?: string;
  /** Format size preset */
  format?: 'bag_tag' | 'bin_card' | 'vial_strip' | 'full_sheet' | 'report' | 'bench_sheet';
  /** Target physical stock: exact thermal roll size or standard 8.5"x11" office paper */
  paperMode?: 'thermal' | 'sheet';
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
}

/**
 * Extracts and prints a target element inside a clean, isolated iframe.
 * Avoids modal clipping, portal backdrop artifacts, and scroll lock bugs.
 */
export function printElement(
  target: HTMLElement | string,
  options: PrintOptions = {}
): void {
  const {
    title = 'TRACE Forensic Document',
    format = 'bag_tag',
    paperMode = 'thermal',
    orientation = 'portrait',
  } = options;

  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) {
    console.error('[Print] Target element not found:', target);
    window.print();
    return;
  }

  // Determine physical page size based on format & paperMode
  let pageSizeCss = 'auto';
  let bodyPadding = '0';
  let sheetWrapOpen = '';
  let sheetWrapClose = '';

  if (paperMode === 'sheet' && format !== 'report' && format !== 'bench_sheet' && format !== 'full_sheet') {
    // Printing a small label on standard 8.5" x 11" office paper with cut guides
    pageSizeCss = 'letter portrait';
    bodyPadding = '20mm 15mm';
    sheetWrapOpen = `
      <div class="sheet-print-layout">
        <div class="sheet-print-header">
          <span class="sheet-print-title">TRACE FORENSIC LABORATORY — EVIDENCE CONTROL TAG</span>
          <span class="sheet-print-hint">Standard Letter / A4 Print Sheet · Cut along dashed boundary</span>
        </div>
        <div class="sheet-print-stage">
    `;
    sheetWrapClose = `
        </div>
        <div class="sheet-print-footer">
          <span>Printed from TRACE Evidence System · ISO/IEC 17025 Custody Benchmark</span>
        </div>
      </div>
    `;
  } else {
    // Thermal roll / direct label stock
    switch (format) {
      case 'bag_tag':
        pageSizeCss = '4in 3in landscape';
        break;
      case 'bin_card':
        pageSizeCss = '3in 2in landscape';
        break;
      case 'vial_strip':
        pageSizeCss = '2in 1in landscape';
        break;
      case 'full_sheet':
      case 'report':
      case 'bench_sheet':
      default:
        pageSizeCss = `letter ${orientation}`;
        bodyPadding = '12mm 15mm';
        break;
    }
  }

  // Create isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  // Extract all existing CSS styles from the main page
  const styleNodes = document.querySelectorAll('link[rel="stylesheet"], style');
  let combinedStyles = '';
  styleNodes.forEach((node) => {
    if (node.tagName.toLowerCase() === 'style') {
      combinedStyles += node.innerHTML + '\n';
    } else if (node.tagName.toLowerCase() === 'link') {
      const href = (node as HTMLLinkElement).href;
      combinedStyles += `@import url("${href}");\n`;
    }
  });

  const printCss = `
    @page {
      size: ${pageSizeCss};
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: ${bodyPadding} !important;
      background: #ffffff !important;
      color: #111827 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
    }
    .no-print, [data-slot="dialog-overlay"], .dialog-header, .label-format-tabs {
      display: none !important;
    }

    /* Isolated print wrapper styles */
    .sheet-print-layout {
      width: 100%;
      max-width: 7.5in;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .sheet-print-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px dashed #9ca3af;
      padding-bottom: 6px;
      font-size: 8pt;
      color: #6b7280;
      font-family: monospace;
    }
    .sheet-print-title {
      font-weight: bold;
      color: #111827;
    }
    .sheet-print-stage {
      padding: 12px;
      border: 1px dashed #d1d5db;
      border-radius: 4px;
      background: #ffffff;
      display: inline-block;
    }
    .sheet-print-footer {
      width: 100%;
      border-top: 1px dashed #9ca3af;
      padding-top: 6px;
      font-size: 7.5pt;
      color: #9ca3af;
      text-align: center;
      font-family: monospace;
    }

    /* Thermal label exact sizes */
    .evidence-label-card.format-standard {
      width: 4in !important;
      height: 3in !important;
      max-width: 4in !important;
      max-height: 3in !important;
      border: 2px solid #000000 !important;
      box-shadow: none !important;
      margin: 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .evidence-label-card.format-bin {
      width: 3in !important;
      height: 2in !important;
      max-width: 3in !important;
      max-height: 2in !important;
      border: 2px solid #000000 !important;
      box-shadow: none !important;
      margin: 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .evidence-label-card.format-vial {
      width: 2in !important;
      height: 1in !important;
      max-width: 2in !important;
      max-height: 1in !important;
      border: 1.5px solid #000000 !important;
      box-shadow: none !important;
      margin: 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .evidence-label-card.format-sheet {
      width: 100% !important;
      max-width: 7.5in !important;
      border: 2px solid #000000 !important;
      box-shadow: none !important;
      margin: 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Reports & Bench Sheets */
    #printable-report-sheet, #printable-bench-sheet {
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      margin: 0 !important;
    }
  `;

  iframeDoc.documentElement.innerHTML = `
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        ${combinedStyles}
        ${printCss}
      </style>
    </head>
    <body>
      ${sheetWrapOpen}
      ${element.outerHTML}
      ${sheetWrapClose}
    </body>
  `;

  // Trigger print after iframe renders and fonts load
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('[Print] Iframe print failed, falling back to window.print()', err);
      window.print();
    } finally {
      // Remove iframe after sufficient print dialog delay
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        } catch {}
      }, 3000);
    }
  };

  // Wait for resources
  if (iframe.contentWindow) {
    if (iframe.contentDocument?.readyState === 'complete') {
      setTimeout(triggerPrint, 150);
    } else {
      iframe.contentWindow.onload = () => setTimeout(triggerPrint, 150);
    }
  } else {
    triggerPrint();
  }
}
