import React from 'react';
import RichTextEditor from './RichTextEditor';
import outlines from '../../data/report-outlines.json';
import { escapeMailText, sanitizeMailHtml, mailHtmlToText } from '../../apps/mail/richText';

export default function ReportEditor({ label, text, html, onChange }: { label: string; text: string; html?: string; onChange: (text: string, html: string) => void }) {
  // A stale imported HTML draft must never replace newer plain-text findings.
  const content = html && mailHtmlToText(html).trim() === text.trim() ? sanitizeMailHtml(html) : `<p>${escapeMailText(text).replace(/\n/g, '<br>')}</p>`;
  return <div>
    <label className="mira-report-outline">Report outline<select aria-label={`${label} outline`} value="" disabled={Boolean(text.trim())} onChange={event => {
      const selected = outlines.find(item => item.id === event.target.value);
      if (selected) { const value = selected.sections.map(section => `<p><strong>${escapeMailText(section)}</strong></p><p>[Your findings]</p>`).join(''); onChange(mailHtmlToText(value), value); }
    }}><option value="">Start with a blank report or choose an outline…</option>{outlines.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
    <RichTextEditor label={label} value={content} onChange={(html, text) => onChange(text, html)} />
    <p className="mira-report-note">Formatting and text save together. Outlines contain prompts; add your own findings. Clear the report to choose another outline.</p>
  </div>;
}
