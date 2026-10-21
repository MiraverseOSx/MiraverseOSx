import React, { useEffect, useRef } from 'react';
import { mailHtmlToText, sanitizeMailHtml } from './richText';

export default function RichMailEditor({ value, onChange }: { value: string; onChange: (html: string, text: string) => void }) {
  const editor = useRef<HTMLDivElement>(null); const emitted = useRef<string | null>(null);
  useEffect(() => { if (editor.current && value !== emitted.current) editor.current.innerHTML = sanitizeMailHtml(value); }, [value]);
  const update = () => { const html = sanitizeMailHtml(editor.current?.innerHTML || ''); emitted.current = html; onChange(html, mailHtmlToText(html)); };
  function format(command: string) { editor.current?.focus(); document.execCommand(command, false); update(); }
  return <div className="mail-rich-editor">
    <div className="mail-format-bar" role="toolbar" aria-label="Email formatting">
      {[['bold', 'Bold'], ['italic', 'Italic'], ['underline', 'Underline'], ['insertUnorderedList', 'Bullet list'], ['insertOrderedList', 'Numbered list'], ['undo', 'Undo'], ['removeFormat', 'Clear formatting']].map(([command, label]) => <button key={command} type="button" onMouseDown={event => event.preventDefault()} onClick={() => format(command)}>{label}</button>)}
    </div>
    <div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-label="Email message" aria-multiline="true" className="mail-editable" onInput={update} onPaste={event => { event.preventDefault(); document.execCommand('insertText', false, event.clipboardData.getData('text/plain')); update(); }} />
  </div>;
}
export function RichMailBody({ html, text }: { html?: string; text: string }) {
  return html ? <div className="mail-rich-body" dangerouslySetInnerHTML={{ __html: sanitizeMailHtml(html) }} /> : <div className="mail-plain-body">{text}</div>;
}
