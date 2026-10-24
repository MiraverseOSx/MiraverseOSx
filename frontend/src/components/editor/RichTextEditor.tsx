import React, { useEffect, useRef } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { sanitizeMailHtml, mailHtmlToText } from '../../apps/mail/richText';
import './rich-text-editor.css';

export default function RichTextEditor({ value, onChange, label = 'Report text' }: { value: string; onChange: (html: string, text: string) => void; label?: string }) {
  const callback = useRef(onChange);
  callback.current = onChange;
  const emitted = useRef<string | null>(null);
  const editor = useEditor({
    // Create the view after mount; lazy app loading can replay mount effects.
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: false, link: false, code: false, codeBlock: false, horizontalRule: false, strike: false })],
    content: sanitizeMailHtml(value),
    editorProps: { attributes: { role: 'textbox', 'aria-label': label, 'aria-multiline': 'true', class: 'mira-rich-content' }, transformPastedHTML: html => sanitizeMailHtml(html) },
    onUpdate: ({ editor }) => { const html = sanitizeMailHtml(editor.getHTML()); emitted.current = html; callback.current(html, mailHtmlToText(html)); },
  });
  const active = useEditorState({ editor, selector: ({ editor }) => editor && !editor.isDestroyed ? ({ bold: editor.isActive('bold'), italic: editor.isActive('italic'), underline: editor.isActive('underline'), bullet: editor.isActive('bulletList'), ordered: editor.isActive('orderedList'), quote: editor.isActive('blockquote'), undo: editor.can().undo(), redo: editor.can().redo() }) : null });
  useEffect(() => { if (editor && !editor.isDestroyed && value !== emitted.current) editor.commands.setContent(sanitizeMailHtml(value), { emitUpdate: false }); }, [editor, value]);
  useEffect(() => { if (editor && !editor.isDestroyed) editor.setOptions({ editorProps: { ...editor.options.editorProps, attributes: { role: 'textbox', 'aria-label': label, 'aria-multiline': 'true', class: 'mira-rich-content' } } }); }, [editor, label]);
  return <div className="mira-rich-editor">
    <div className="mira-rich-toolbar" role="toolbar" aria-label={`${label} formatting`}>
      <button type="button" aria-pressed={active?.bold || false} onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
      <button type="button" aria-pressed={active?.italic || false} onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
      <button type="button" aria-pressed={active?.underline || false} onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleUnderline().run()}>Underline</button>
      <button type="button" aria-pressed={active?.bullet || false} onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBulletList().run()}>Bullet list</button>
      <button type="button" aria-pressed={active?.ordered || false} onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>Numbered list</button>
      <button type="button" aria-pressed={active?.quote || false} onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Quote</button>
      <button type="button" disabled={!active?.undo} onClick={() => editor?.chain().focus().undo().run()}>Undo</button>
      <button type="button" disabled={!active?.redo} onClick={() => editor?.chain().focus().redo().run()}>Redo</button>
      <button type="button" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>Clear formatting</button>
    </div>
    <EditorContent editor={editor} />
  </div>;
}
