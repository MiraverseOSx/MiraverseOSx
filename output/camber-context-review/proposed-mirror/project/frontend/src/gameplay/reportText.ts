import outlines from '../data/report-outlines.json' with { type: 'json' };

const outlineHeadings = new Set(outlines.flatMap(outline => outline.sections).map(section => section.trim().toLowerCase()));

// Count the explanation separately from the scaffolding inserted by ReportEditor.
export function authoredReportText(text: string): string {
  return text.replace(/\[your findings\]/gi, '').split(/\r?\n/)
    .filter(line => !outlineHeadings.has(line.trim().toLowerCase()))
    .join('\n').trim();
}
