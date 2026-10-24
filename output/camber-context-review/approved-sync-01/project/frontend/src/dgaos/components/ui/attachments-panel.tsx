/* eslint-disable @next/next/no-img-element */
'use client';
import { Image as ImageIcon, Trash2, Upload, Download, Maximize2, X, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AttachmentItem {
  id: string;
  record_id?: string;
  filename: string;
  size?: number;
  mime_type?: string;
  data?: string;
  uploaded_at?: string;
}

interface AttachmentsPanelProps {
  recordId: string;
  attachments?: { id: string; filename: string; mimeType?: string }[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
}

export function AttachmentsPanel({
  recordId,
  attachments = [],
  onUpload,
  onDelete,
  disabled = false,
}: AttachmentsPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<AttachmentItem[]>([]);
  const [previewItem, setPreviewItem] = useState<AttachmentItem | null>(null);
  const [errorNotice, setErrorNotice] = useState('');
  const [reloadCounter, setReloadCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingItems = items.length === 0 && attachments.length > 0;

  useEffect(() => {
    let ignore = false;
    if (!recordId) return;
    fetch(`/api/records?action=attachments&recordId=${encodeURIComponent(recordId)}`)
      .then((res) => (res.ok ? (res.json() as Promise<AttachmentItem[]>) : []))
      .then((data) => {
        if (!ignore && Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [recordId, attachments.length, reloadCounter]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image MIME type
    if (!file.type.startsWith('image/')) {
      setErrorNotice('Only image files (JPEG, PNG, WEBP) are supported.');
      setTimeout(() => setErrorNotice(''), 4000);
      return;
    }

    // Enforce 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setErrorNotice('File size exceeds 5MB limit. Please select a compressed image.');
      setTimeout(() => setErrorNotice(''), 4000);
      return;
    }

    setUploading(true);
    setErrorNotice('');
    try {
      await onUpload(file);
      setReloadCounter((c) => c + 1);
    } catch (err) {
      setErrorNotice(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this evidence photo?')) return;
    try {
      await onDelete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (previewItem?.id === id) setPreviewItem(null);
    } catch (err) {
      setErrorNotice(err instanceof Error ? err.message : 'Delete failed.');
    }
  }

  // Display items: combine fetched full items with any prop stubs
  const displayItems: AttachmentItem[] = items.length > 0
    ? items
    : attachments.map((a) => ({ id: a.id, filename: a.filename, mime_type: a.mimeType }));

  return (
    <section className="panel panel-padding attachments-panel-box">
      <div className="panel-title">
        <div>
          <h2>Evidence Documentation Photos</h2>
          <p>Contemporaneous photography with integrity tracking (Max 5MB per file)</p>
        </div>
        <button
          type="button"
          className="primary flex items-center gap-1.5 text-xs"
          disabled={uploading || disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={14} />
          {uploading ? 'Uploading…' : 'Attach photo'}
        </button>
      </div>

      {errorNotice && (
        <div role="alert" className="error mb-3 text-xs">
          <AlertCircle size={14} /> {errorNotice}
        </div>
      )}

      {loadingItems && displayItems.length === 0 ? (
        <p className="subtext text-xs py-2">Loading photo records…</p>
      ) : displayItems.length > 0 ? (
        <div className="attachments-grid">
          {displayItems.map((a) => (
            <div key={a.id} className="attachment-card">
              {/* Thumbnail Container */}
              <button
                type="button"
                className="attachment-thumb-box cursor-pointer"
                onClick={() => a.data && setPreviewItem(a)}
                title={a.data ? 'Click to enlarge photo' : 'No preview available'}
                disabled={!a.data}
              >
                {a.data ? (
                  <img src={a.data} alt={a.filename} className="attachment-thumbnail-img" />
                ) : (
                  <div className="attachment-placeholder">
                    <ImageIcon size={28} className="text-gray-400" />
                  </div>
                )}
                {a.data && (
                  <span className="attachment-zoom-badge">
                    <Maximize2 size={11} />
                  </span>
                )}
              </button>

              {/* Attachment Info */}
              <div className="attachment-meta">
                <strong className="filename truncate" title={a.filename}>
                  {a.filename}
                </strong>
                <span className="subtext text-[10px]">
                  {a.size ? `${Math.round(a.size / 1024)} KB` : 'Attached image'}
                  {a.uploaded_at ? ` · ${new Date(a.uploaded_at).toLocaleDateString()}` : ''}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="attachment-actions">
                {a.data && (
                  <a
                    href={a.data}
                    download={a.filename}
                    className="icon-button"
                    title="Download original photo"
                  >
                    <Download size={14} />
                  </a>
                )}
                <button
                  type="button"
                  className="icon-button delete-btn"
                  disabled={uploading || disabled}
                  onClick={() => handleDelete(a.id)}
                  title="Delete photo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="subtext text-xs py-3 text-gray-500">
          No photos attached to this evidence record. Click &quot;Attach photo&quot; to upload microscopy, macroscopic scene, or bench images.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={handleFileSelect}
      />

      {/* Lightbox Modal */}
      {previewItem && previewItem.data && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 border-none w-full h-full max-w-none max-h-none m-0"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setPreviewItem(null);
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-purple-600" />
                <strong className="text-sm text-gray-800">{previewItem.filename}</strong>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewItem.data}
                  download={previewItem.filename}
                  className="secondary text-xs flex items-center gap-1 px-2.5 py-1"
                >
                  <Download size={13} /> Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="icon-button"
                  aria-label="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={previewItem.data}
                alt={previewItem.filename}
                className="max-w-full max-h-[72vh] object-contain rounded"
              />
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
