import React from 'react';
import { sanitizeMailHtml } from './richText';
import RichTextEditor from '../../components/editor/RichTextEditor';

export default function RichMailEditor({ value, onChange }: { value: string; onChange: (html: string, text: string) => void }) {
  return <RichTextEditor value={value} onChange={onChange} label="Email message" />;
}
export function RichMailBody({ html, text }: { html?: string; text: string }) {
  return html ? <div className="mail-rich-body" dangerouslySetInnerHTML={{ __html: sanitizeMailHtml(html) }} /> : <div className="mail-plain-body">{text}</div>;
}
