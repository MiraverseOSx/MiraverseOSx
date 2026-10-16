'use client';
import { useState, useMemo } from 'react';
import {
  Printer,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Tag,
  Archive,
  FlaskConical,
  FileText,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import type { LabRecord } from '@/lib/records';
import { printElement } from '@/lib/print';

interface EvidenceLabelProps {
  record: LabRecord | null;
  onClose: () => void;
}

export type LabelFormat = 'bag_tag' | 'bin_card' | 'vial_strip' | 'full_sheet';
export type PaperMode = 'thermal' | 'sheet';

// Generates procedural Code-128 style barcode bars
function BarcodeSvg({
  value,
  height = 40,
  showText = true,
}: {
  value: string;
  height?: number;
  showText?: boolean;
}) {
  const { bars, totalWidth } = useMemo(() => {
    let x = 8;
    const list: { x: number; width: number }[] = [];

    // Guard pattern
    list.push({ x, width: 2 }); x += 4;
    list.push({ x, width: 1 }); x += 3;
    list.push({ x, width: 2 }); x += 4;

    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      const p1 = (code % 3) + 1;
      const p2 = ((code >> 2) % 2) + 1;
      const p3 = ((code >> 4) % 3) + 1;
      const p4 = ((code * 5) % 2) + 1;

      list.push({ x, width: p1 }); x += p1 + 1;
      x += p2; // space
      list.push({ x, width: p3 }); x += p3 + 1;
      x += p4; // space
    }

    // End guard pattern
    list.push({ x, width: 2 }); x += 3;
    list.push({ x, width: 3 }); x += 4;
    list.push({ x, width: 1 }); x += 3;

    return { bars: list, totalWidth: x + 8 };
  }, [value]);

  return (
    <div className="barcode-wrapper">
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="barcode-svg"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        aria-label={`Barcode for ${value}`}
      >
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={0} width={b.width} height={height} fill="#111827" />
        ))}
      </svg>
      {showText && <div className="barcode-text">*{value}*</div>}
    </div>
  );
}

// Procedural 2D DataMatrix / QR placeholder
function DataMatrixSvg({ value, sizePx = 36 }: { value: string; sizePx?: number }) {
  const cells = useMemo(() => {
    const grid: boolean[][] = [];
    const size = 10;
    let seedVal = 0;
    for (let i = 0; i < value.length; i++) {
      seedVal = (seedVal * 31 + value.charCodeAt(i)) % 100000;
    }

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Border finder pattern: solid left & bottom, alternating right & top
        if (c === 0 || r === size - 1) {
          row.push(true);
        } else if (r === 0 || c === size - 1) {
          row.push((r + c) % 2 === 0);
        } else {
          seedVal = (seedVal * 1103515245 + 12345) % 2147483648;
          row.push((seedVal % 100) > 42);
        }
      }
      grid.push(row);
    }
    return grid;
  }, [value]);

  return (
    <svg
      viewBox="0 0 10 10"
      style={{ width: sizePx, height: sizePx }}
      className="datamatrix-svg"
      shapeRendering="crispEdges"
      aria-label="Evidence 2D DataMatrix"
    >
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#111827" /> : null
        )
      )}
    </svg>
  );
}

interface CustodyLogEntry {
  from?: string;
  to?: string;
  reason?: string;
  location?: string;
  at?: string;
  seal?: string;
}

export function EvidenceLabel({ record, onClose }: EvidenceLabelProps) {
  const [format, setFormat] = useState<LabelFormat>('bag_tag');
  const [paperMode, setPaperMode] = useState<PaperMode>('thermal');
  const [copied, setCopied] = useState(false);

  if (!record || record.kind !== 'evidence') return null;

  const { data } = record;
  const isIntact = data.seal === 'Intact';
  const initialReceipt = (data.custody?.[0] || {}) as CustodyLogEntry;
  const custodyHistory = (data.custody || []) as CustodyLogEntry[];
  const formattedDate = new Date(record.created).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const handlePrint = () => {
    printElement('printable-evidence-tag', {
      title: `TRACE-${record.id}-${format}`,
      format,
      paperMode,
      orientation: format === 'full_sheet' ? 'portrait' : 'landscape',
    });
  };

  const handleCopyBarcode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(record.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={!!record} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="evidence-label-dialog sm:max-w-4xl w-[900px] max-w-[95vw] p-0 overflow-hidden" showCloseButton={false}>
        {/* Header toolbar */}
        <DialogHeader className="p-4 border-b bg-gray-50 flex flex-row items-center justify-between no-print gap-3">
          <div>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Shield size={18} className="text-purple-600" />
              Evidence Control Barcode &amp; Tag Center
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              High-fidelity ISO/IEC 17025 physical custody identifiers and print generator.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBarcode}
              className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
              title="Copy Item ID / Barcode"
            >
              {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Barcode'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1.5 shadow-sm"
              title="Print evidence label or document"
            >
              <Printer size={14} />
              <span>Print Label</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </DialogHeader>

        {/* Format & Output Mode Toolbar */}
        <div className="label-format-tabs no-print">
          <div className="label-format-btn-group">
            <button
              type="button"
              className={`label-format-btn ${format === 'bag_tag' ? 'active' : ''}`}
              onClick={() => setFormat('bag_tag')}
            >
              <Tag size={13} />
              <span>Bag Tag (4&quot; × 3&quot;)</span>
            </button>
            <button
              type="button"
              className={`label-format-btn ${format === 'bin_card' ? 'active' : ''}`}
              onClick={() => setFormat('bin_card')}
            >
              <Archive size={13} />
              <span>Vault Bin Card (3&quot; × 2&quot;)</span>
            </button>
            <button
              type="button"
              className={`label-format-btn ${format === 'vial_strip' ? 'active' : ''}`}
              onClick={() => setFormat('vial_strip')}
            >
              <FlaskConical size={13} />
              <span>Vial Strip (2&quot; × 1&quot;)</span>
            </button>
            <button
              type="button"
              className={`label-format-btn ${format === 'full_sheet' ? 'active' : ''}`}
              onClick={() => setFormat('full_sheet')}
            >
              <FileText size={13} />
              <span>Intake Docket (8.5&quot; × 11&quot;)</span>
            </button>
          </div>

          {format !== 'full_sheet' && (
            <div className="label-paper-mode-select">
              <span className="font-medium text-slate-500 flex items-center gap-1">
                <Layers size={12} /> Stock:
              </span>
              <button
                type="button"
                className={`label-paper-mode-btn ${paperMode === 'thermal' ? 'active' : ''}`}
                onClick={() => setPaperMode('thermal')}
                title="1:1 scale for Zebra/Dymo thermal roll printers"
              >
                Thermal Roll (1:1)
              </button>
              <button
                type="button"
                className={`label-paper-mode-btn ${paperMode === 'sheet' ? 'active' : ''}`}
                onClick={() => setPaperMode('sheet')}
                title="Print on standard office paper with cut guides"
              >
                Letter Sheet (Cut Guides)
              </button>
            </div>
          )}
        </div>

        {/* Printable Area Wrapper */}
        <div className="printable-label-wrapper overflow-auto">
          {/* FORMAT 1: Standard Evidence Bag Tag (4" x 3") */}
          {format === 'bag_tag' && (
            <div className="evidence-label-card format-standard" id="printable-evidence-tag">
              {/* Security Header */}
              <div className="evidence-label-header">
                <div className="agency-badge">
                  <Shield size={18} className="text-gray-900" />
                </div>
                <div className="agency-text">
                  <div className="agency-title">TRACE FORENSIC LABORATORY</div>
                  <div className="agency-subtitle">OFFICIAL EVIDENCE IDENTIFICATION &amp; CUSTODY TAG</div>
                </div>
                <div className="matrix-wrapper">
                  <DataMatrixSvg value={`${record.caseId || 'CASE'}:${record.id}`} sizePx={34} />
                </div>
              </div>

              {/* Barcode Strip */}
              <div className="evidence-barcode-section">
                <BarcodeSvg value={record.id} height={36} />
              </div>

              {/* Key Identifiers Grid */}
              <div className="evidence-meta-grid">
                <div className="meta-cell">
                  <span className="cell-label">CASE REFERENCE</span>
                  <span className="cell-value font-mono font-bold text-gray-900">{record.caseId || 'UNASSIGNED'}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">EVIDENCE ITEM ID</span>
                  <span className="cell-value font-mono font-extrabold text-purple-900">{record.id}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">DATE &amp; TIME RECEIVED</span>
                  <span className="cell-value">{formattedDate}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">MATERIAL / ITEM CLASS</span>
                  <span className="cell-value font-semibold">{data.type || 'Trace Physical Evidence'}</span>
                </div>
              </div>

              {/* Physical Description */}
              <div className="evidence-desc-cell">
                <span className="cell-label">DESCRIPTION &amp; PACKAGING CONDITION</span>
                <p className="cell-text font-medium text-gray-900">
                  {data.title}{data.description ? ` — ${data.description}` : ''}
                </p>
              </div>

              {/* Custody Chain & Locker Location */}
              <div className="evidence-meta-grid">
                <div className="meta-cell">
                  <span className="cell-label">RECEIVED FROM</span>
                  <span className="cell-value text-gray-800">{initialReceipt.from || 'Submitting Officer / Agency'}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">RECEIVING CUSTODIAN</span>
                  <span className="cell-value font-semibold text-gray-900">{data.custodian || 'Evidence Specialist'}</span>
                </div>
                <div className="meta-cell col-span-2">
                  <span className="cell-label">SECURE STORAGE VAULT / BAY</span>
                  <span className="cell-value font-mono font-semibold text-purple-950">{data.location || 'Secure Vault A · General Locker'}</span>
                </div>
              </div>

              {/* Seal Verification & Signature Strip */}
              <div className="evidence-seal-footer">
                <div className="seal-status-box">
                  <span className="cell-label">INTAKE SEAL CONDITION</span>
                  <div className={`seal-flag ${isIntact ? 'seal-intact' : 'seal-alert'}`}>
                    {isIntact ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    <span>{data.seal?.toUpperCase() || 'INTACT'}</span>
                  </div>
                </div>

                <div className="signature-line-box">
                  <div className="sig-line">
                    <span className="sig-label">EVIDENCE CUSTODIAN SIGNATURE</span>
                  </div>
                  <div className="date-line">
                    <span className="sig-label">DATE / TIME</span>
                  </div>
                </div>
              </div>

              {/* Tamper Warning Banner */}
              <div className="evidence-warning-strip">
                FORENSIC EVIDENCE · CHAIN OF CUSTODY INTEGRITY MANDATED · DO NOT ACCEPT IF SEAL IS BROKEN
              </div>
            </div>
          )}

          {/* FORMAT 2: Storage Vault Bin Card (3" x 2") */}
          {format === 'bin_card' && (
            <div className="evidence-label-card format-bin" id="printable-evidence-tag">
              <div className="bin-header">
                <div>
                  <span className="bin-tag-label">TRACE EVIDENCE VAULT · BIN CARD</span>
                  <h3 className="bin-item-id font-mono font-extrabold">{record.id}</h3>
                </div>
                <div className="matrix-wrapper">
                  <DataMatrixSvg value={`${record.caseId || 'CASE'}:${record.id}`} sizePx={30} />
                </div>
              </div>

              <div className="bin-barcode-wrap">
                <BarcodeSvg value={record.id} height={32} />
              </div>

              <div className="bin-meta-grid">
                <div>
                  <span className="cell-label">CASE</span>
                  <span className="cell-value font-mono font-bold text-gray-900">{record.caseId || 'UNASSIGNED'}</span>
                </div>
                <div>
                  <span className="cell-label">LOCATION</span>
                  <span className="cell-value font-mono font-semibold text-purple-900">{data.location || 'Vault Bay'}</span>
                </div>
                <div>
                  <span className="cell-label">MATERIAL</span>
                  <span className="cell-value truncate font-medium">{data.type || 'Physical'}</span>
                </div>
                <div>
                  <span className="cell-label">SEAL</span>
                  <span className={`bin-seal-text font-bold ${isIntact ? 'text-green-700' : 'text-amber-700'}`}>
                    {data.seal || 'Intact'}
                  </span>
                </div>
              </div>

              <div className="bin-title-strip truncate">
                <span className="truncate"><strong>{data.title}</strong></span>
                <span className="text-[9px] text-gray-500 font-mono flex-shrink-0">{data.custodian || 'Custodian'}</span>
              </div>

              <div className="bin-footer-tag">
                SECURE STORAGE VAULT · CUSTODY CONTINUITY CONTROL
              </div>
            </div>
          )}

          {/* FORMAT 3: Micro-Specimen Vial Strip (2" x 1") */}
          {format === 'vial_strip' && (
            <div className="evidence-label-card format-vial" id="printable-evidence-tag">
              <div className="vial-left">
                <DataMatrixSvg value={`${record.id}`} sizePx={30} />
              </div>
              <div className="vial-center">
                <div className="vial-top-line">
                  <strong className="vial-id font-mono font-black">{record.id}</strong>
                  <span className="vial-case font-mono font-bold">{record.caseId || 'CASE'}</span>
                </div>
                <div className="vial-barcode">
                  <BarcodeSvg value={record.id} height={18} showText={false} />
                </div>
                <div className="vial-subtext">
                  <span className="truncate">{data.type || 'Aliquot'} · {data.seal || 'Intact'}</span>
                  <span className="font-mono text-[7.5px] uppercase">TRACE LAB</span>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 4: Full Custody Intake Docket Sheet (8.5" x 11") */}
          {format === 'full_sheet' && (
            <div className="evidence-label-card format-sheet" id="printable-evidence-tag">
              {/* Official Letterhead */}
              <div className="sheet-letterhead">
                <div className="sheet-brand-row">
                  <div className="agency-badge">
                    <Shield size={24} className="text-purple-700" />
                  </div>
                  <div className="sheet-brand-text">
                    <h2>TRACE FORENSIC SCIENCE LABORATORY</h2>
                    <p>DIVISION OF FORENSIC SERVICES · EVIDENCE CONTROL &amp; REPOSITORY</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold block text-purple-900">FORM EC-101</span>
                  <span className="text-[9px] text-gray-500">ISO/IEC 17025 § 7.4</span>
                </div>
              </div>

              {/* Document Banner */}
              <div className="bg-purple-950 text-white p-2.5 rounded text-center">
                <span className="text-xs font-bold tracking-wider uppercase block">
                  OFFICIAL EVIDENCE INTAKE DOCKET &amp; CHAIN OF CUSTODY CONTINUITY RECORD
                </span>
              </div>

              {/* Barcode Header Strip */}
              <div className="sheet-barcode-strip">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 block uppercase">EVIDENCE ITEM IDENTIFIER</span>
                  <h3 className="text-[13.5px] font-mono font-black text-purple-950 m-0">{record.id}</h3>
                  <span className="text-[11px] text-gray-700 mt-1 block">Case Reference: <strong className="font-mono">{record.caseId || 'UNASSIGNED'}</strong></span>
                </div>
                <div className="flex items-center gap-4">
                  <BarcodeSvg value={record.id} height={38} />
                  <DataMatrixSvg value={`${record.caseId}:${record.id}`} sizePx={44} />
                </div>
              </div>

              {/* Specimen Profile Grid */}
              <div>
                <div className="sheet-section-title">1. EVIDENCE SPECIMEN CLASSIFICATION &amp; RECEIPT PROFILE</div>
                <div className="evidence-meta-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div className="meta-cell">
                    <span className="cell-label">ITEM TITLE</span>
                    <span className="cell-value font-semibold">{data.title}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="cell-label">MATERIAL TYPE</span>
                    <span className="cell-value font-semibold">{data.type || 'Physical Evidence'}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="cell-label">DATE &amp; TIME INTAKE</span>
                    <span className="cell-value">{formattedDate}</span>
                  </div>
                  <div className="meta-cell col-span-2">
                    <span className="cell-label">PACKAGING DESCRIPTION &amp; CONDITION</span>
                    <span className="cell-value">{data.description || 'Standard evidence packaging, intact upon intake.'}</span>
                  </div>
                  <div className="meta-cell">
                    <span className="cell-label">INTAKE SEAL STATUS</span>
                    <span className={`cell-value font-bold ${isIntact ? 'text-green-700' : 'text-amber-700'}`}>
                      {data.seal || 'Intact'}
                    </span>
                  </div>
                  <div className="meta-cell">
                    <span className="cell-label">CURRENT CUSTODIAN</span>
                    <span className="cell-value font-semibold text-gray-900">{data.custodian || 'Evidence Specialist'}</span>
                  </div>
                  <div className="meta-cell col-span-2">
                    <span className="cell-label">PRIMARY STORAGE VAULT / BAY</span>
                    <span className="cell-value font-mono font-semibold text-purple-950">{data.location || 'Secure Vault Bay'}</span>
                  </div>
                </div>
              </div>

              {/* Chain of Custody History Ledger */}
              <div>
                <div className="sheet-section-title">2. CONTEMPORANEOUS CHAIN OF CUSTODY TRANSFER LEDGER</div>
                {custodyHistory.length > 0 ? (
                  <table className="sheet-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th style={{ width: '130px' }}>TIMESTAMP</th>
                        <th>RELINQUISHED BY (FROM)</th>
                        <th>RECEIVED BY (TO)</th>
                        <th>REASON / PURPOSE</th>
                        <th style={{ width: '80px' }}>SEAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {custodyHistory.map((c: CustodyLogEntry, i: number) => (
                        <tr key={i}>
                          <td className="font-mono text-center">{i + 1}</td>
                          <td className="font-mono text-[9px]">{c.at ? new Date(c.at).toLocaleString() : 'N/A'}</td>
                          <td><strong>{c.from}</strong></td>
                          <td><strong>{c.to}</strong></td>
                          <td>{c.reason} <span className="text-gray-500">({c.location})</span></td>
                          <td>
                            <span className={`px-1 rounded text-[8.5px] font-semibold ${c.seal === 'Intact' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                              {c.seal}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs text-gray-500 italic p-3 border border-dashed text-center">
                    Initial intake receipt on file. No inter-departmental transfers recorded.
                  </p>
                )}
              </div>

              {/* Custodian Verification & Sign-off Block */}
              <div className="sheet-signatures-grid">
                <div className="sheet-sig-box">
                  <span className="text-[8.5px] font-bold text-gray-500 uppercase">EVIDENCE CUSTODIAN ATTESTATION</span>
                  <p className="text-[9px] text-gray-600 m-0">
                    I hereby certify that the physical evidence described above was received, cataloged, and secured in compliance with ISO/IEC 17025 custody protocols.
                  </p>
                  <div className="sig-line flex items-end">
                    <span className="text-[8px] font-mono text-gray-500">Sign: ___________________________ Date: {formattedDate}</span>
                  </div>
                </div>

                <div className="sheet-sig-box">
                  <span className="text-[8.5px] font-bold text-gray-500 uppercase">SUPERVISORY QA REVIEW</span>
                  <p className="text-[9px] text-gray-600 m-0">
                    Chain of custody verified. Storage location verified in laboratory information system.
                  </p>
                  <div className="sig-line flex items-end">
                    <span className="text-[8px] font-mono text-gray-500">QA Stamp / Sign: ___________________________</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal footer hints */}
        <div className="p-3 bg-gray-50 border-t flex flex-wrap justify-between items-center text-xs text-gray-500 no-print gap-2">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-purple-600" />
            <span>
              Format: {format === 'bag_tag' ? '4" × 3" Standard Property Tag' : format === 'bin_card' ? '3" × 2" Storage Vault Bin Card' : format === 'vial_strip' ? '2" × 1" Specimen Vial Strip' : '8.5" × 11" Full Custody Intake Docket'}
              {format !== 'full_sheet' && ` · Mode: ${paperMode === 'thermal' ? '1:1 Thermal Stock' : 'Letter Paper w/ Cut Guides'}`}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">Ctrl+P to Print directly</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-gray-600 hover:text-gray-900 border border-gray-300 rounded bg-white text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
