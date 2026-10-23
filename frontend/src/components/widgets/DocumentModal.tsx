import React, { useEffect, useRef, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { Paperclip, FileText, Download, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { normalizeDocument } from './documentModel';
import DocumentContent from './DocumentContent';
import { canReadDocument, documentActionDestination } from './documentAccess';
import '../../styles/apps/DocumentReader.css';

export default function DocumentModal({ file: source, onClose, onSubmitForm }) {
  const file = source ? normalizeDocument(source) : null;
  const player = useOSStore((s) => s.gameplay.player);
  const openAppWorkspace = useOSStore((s) => s.openAppWorkspace);
  const recordFileInspection = useOSStore((s) => s.recordFileInspection);

  const [formData, setFormData] = useState(() => Object.fromEntries((file?.content.formFields || []).map(field => [field.id, field.defaultValue || ''])));
  const [decryptKey, setDecryptKey] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decryptError, setDecryptError] = useState(false);
  const [activeAttachmentNotice, setActiveAttachmentNotice] = useState(null);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);

  const showEncrypted = file ? !canReadDocument(file, player, isDecrypted) : false;
  useEffect(() => {
    if (file?.inspectionKey && !showEncrypted) recordFileInspection(file.inspectionKey);
  }, [file?.inspectionKey, showEncrypted, recordFileInspection]);

  if (!file) return null;

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleActionClick = (actionTrigger) => {
    if (onSubmitForm) {
      onSubmitForm(actionTrigger, formData);
      return;
    }

    const destination = documentActionDestination(actionTrigger);
    if (!destination) { setActiveAttachmentNotice('This document has no connected action. Your progress is unchanged.'); return; }
    openAppWorkspace(destination.appId, destination.section);
    onClose();
  };

  const isPrism = file.extension === '.prism' || file.type === 'prism' || file.type === 'corrupt';
  const cryptoLevel = player?.skills?.Cryptography?.level || 1;

  const handleDecryptAttempt = () => {
    const key = decryptKey.trim().toUpperCase();
    if (key === 'LIGHTBORN' || key === 'AETHERCORE') {
      setIsDecrypted(true);
      setDecryptError(false);
    } else {
      setDecryptError(true);
      setTimeout(() => setDecryptError(false), 2000);
    }
  };

  const handleOpenAttachment = (att) => {
    setActiveAttachmentNotice(`Opening attachment [${att.name}] (${att.desc})...`);
    setTimeout(() => setActiveAttachmentNotice(null), 3000);
  };

  return (
    <div className="document-overlay">
      {/* Rose, Yellow & Lavender Window Frame */}
      <div ref={dialog} tabIndex={-1} className="document-reader" data-kind={file.kind} role="dialog" aria-modal="true" aria-label={file.name} onKeyDown={event => {
        if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
        if (event.key !== 'Tab') return;
        const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]') || []);
        const first = controls[0]; const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}>
        
        {/* Window Header Bar */}
        <div className={`flex items-center justify-between px-4 py-3 ${isPrism ? 'bg-rose-950/80 border-b border-rose-800/40' : 'bg-[#1b162b] border-b border-[#2d2642]'}`}>
          <div className="flex items-center gap-2.5">
            <span className={isPrism ? 'text-rose-400' : 'text-[#f4d35e]'}>
              {isPrism ? <ShieldAlert size={16} /> : <FileText size={16} />}
            </span>
            <span className="font-bold tracking-wide text-white">{file.name || file.filename}</span>
          </div>
          <button 
            aria-label="Close document"
            onClick={onClose}
            className="px-2.5 py-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 font-bold transition text-xs"
          >
            ✕
          </button>
        </div>

        {/* Metadata Header */}
        <div className="px-4 py-2.5 border-b border-[#2a233d] bg-[#100d1c] grid grid-cols-2 gap-2 text-[10px] text-white/60 font-mono">
          <div><span className="text-[#f4d35e]">TYPE:</span> {file.extension.toUpperCase()} · {file.meta.classification}</div>
          <div><span className="text-[#f4d35e]">AUTHOR:</span> {file.meta?.author || 'SYSTEM RECORD'}</div>
          <div><span className="text-[#f4d35e]">TIMESTAMP:</span> {file.meta?.timestamp || 'WINTER'}</div>
          <div><span className="text-[#f4d35e]">SIZE:</span> {file.meta?.fileSize || file.size || '4.0 KB'}</div>
        </div>

        {/* Body Content */}
        <div className="document-reader-body">
          <div>
            <h2 className="text-sm font-bold text-[#f4d35e] tracking-wide uppercase">{file.content?.title || file.name}</h2>
            <p className="text-[10px] text-rose-300/80 tracking-wider uppercase mt-0.5">{file.content?.subtitle || file.desc}</p>
          </div>

          {/* Attachment Alert Banner */}
          {activeAttachmentNotice && (
            <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] flex items-center gap-2 animate-fadeIn">
              <CheckCircle size={14} className="text-amber-400" />
              <span>{activeAttachmentNotice}</span>
            </div>
          )}

          {/* Encrypted Lock Warning */}
          {showEncrypted ? (
            <div className="p-4 rounded-xl border border-[#f4d35e]/40 bg-[#f4d35e]/10 text-[#f4d35e] space-y-3">
              <p className="font-bold flex items-center gap-2 text-xs">🔒 ARCHIVE LOCK ACTIVE</p>
              <p className="text-[11px] text-white/80">This historical catalog is encrypted. Cryptography Level {file.security.requiredLevel} or Lineage bypass key required.</p>
              <p className="text-[10px] text-[#f4d35e]/80">Your Cryptography Level: {cryptoLevel} / 3</p>
              
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Bypass Key..."
                  value={decryptKey}
                  onChange={(e) => setDecryptKey(e.target.value)}
                  className="bg-[#0b0814] border border-[#f4d35e]/40 rounded-lg p-2 text-white focus:outline-none focus:border-[#f4d35e] text-xs uppercase tracking-widest max-w-[160px]"
                />
                <button
                  onClick={handleDecryptAttempt}
                  className="bg-[#f4d35e] hover:bg-[#ffe6a7] text-black px-4 py-1.5 rounded-lg font-bold text-xs uppercase transition"
                >
                  Decrypt
                </button>
              </div>
              {decryptError && <p className="text-[10px] text-rose-400 uppercase tracking-wide">Decryption Failed: Invalid Cipher Key</p>}
            </div>
          ) : (
            /* Main Content Rendering */
            <>
              {/* Plain text / log content */}
              <DocumentContent file={file} />

              {/* Embedded Attachments / Enclosures Section */}
              {file.attachments && file.attachments.length > 0 && (
                <div className="pt-3 border-t border-[#2a233d] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <Paperclip size={14} className="text-[#f4d35e]" />
                    <span>Attached Enclosures ({file.attachments.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {file.attachments.map((att) => (
                      <div
                        key={att.id}
                        onClick={() => handleOpenAttachment(att)}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-[#2d2543] bg-[#181329] hover:bg-[#221c38] hover:border-rose-400/40 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2">
                          <Download size={14} className="text-[#f4d35e]" />
                          <div>
                            <div className="font-mono text-xs font-bold text-white leading-tight">{att.name}</div>
                            <div className="text-[10px] text-white/50">{att.desc}</div>
                          </div>
                        </div>
                        <span className="font-mono text-[9px] text-rose-300/80 bg-white/5 px-1.5 py-0.5 rounded">{att.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form inputs (.osform) */}
              {file.content?.formFields && (
                <div className="space-y-3 pt-3 border-t border-[#2a233d]">
                  {file.content.formFields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-1.5">
                      <label htmlFor={`doc-field-${field.id}`} className="text-[10px] text-rose-300 font-bold uppercase">{field.label}:</label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          id={`doc-field-${field.id}`}
                          placeholder={field.placeholder}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="bg-[#0b0814] border border-[#362e4f] p-2 text-white focus:outline-none focus:border-rose-400 text-xs rounded-lg"
                          required={field.required}
                        />
                      )}

                      {field.type === 'select' && (
                        <Form.Select
                          id={`doc-field-${field.id}`}
                          aria-label={field.label || 'Select option'}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="bg-[#0b0814] border border-[#362e4f] p-2 text-white focus:outline-none focus:border-rose-400 text-xs rounded-lg"
                          required={field.required}
                        >
                          <option value="">-- Select Option --</option>
                          {field.options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </Form.Select>
                      )}

                      {field.type === 'checkbox' && (
                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                          <input
                            type="checkbox"
                            id={`doc-field-${field.id}`}
                            checked={formData[field.id] ?? field.default ?? false}
                            onChange={(e) => handleInputChange(field.id, e.target.checked)}
                            className="accent-rose-500 h-3.5 w-3.5"
                          />
                          <span className="text-[10px] text-white/80 uppercase tracking-wide">{field.label}</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Action Button */}
          {file.content?.actionButton && !showEncrypted && (
            <button
              type="button"
              onClick={() => handleActionClick(file.content.actionButton.actionTrigger)}
              className={`w-full py-2.5 mt-4 font-bold tracking-wider uppercase transition-colors rounded-xl flex items-center justify-center gap-2 ${
                isPrism 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md' 
                  : 'bg-[#f4d35e] hover:bg-[#ffe6a7] text-black shadow-md'
              }`}
            >
              {file.content.actionButton.label} <ExternalLink size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
