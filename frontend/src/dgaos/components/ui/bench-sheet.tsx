'use client';
import { useState } from 'react';
import { Printer, Download, FileText, Check, Copy, Shield, ShieldCheck, Microscope, FlaskConical, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { modules } from '@/lib/modules';
import type { LabRecord } from '@/lib/records';
import { printElement } from '@/lib/print';

interface BenchSheetProps {
  examination: LabRecord | null;
  records: LabRecord[];
  onClose: () => void;
  onLaunchWizard?: () => void;
}

const moduleName = (id: string) => modules.find((m) => m.id === id)?.name || id;

export function BenchSheet({ examination, records, onClose, onLaunchWizard }: BenchSheetProps) {
  const [copied, setCopied] = useState(false);

  if (!examination || examination.kind !== 'examination') return null;

  const linkedCase = records.find((r) => r.id === examination.caseId && r.kind === 'case');
  const linkedEvidence = records.find((r) => r.id === examination.data.evidenceId && r.kind === 'evidence');
  const linkedReports = records.filter((r) => r.kind === 'report' && r.data.examinationId === examination.id);

  const status = examination.data.status || 'Planned';
  const isCompleted = status === 'Completed';

  const examDate = new Date(examination.created).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const generateMarkdown = () => {
    return `# TRACE FORENSIC SCIENCE LABORATORY
## OFFICIAL FORENSIC EXAMINATION BENCH SHEET
**Examination Reference:** ${examination.id}
**Discipline:** ${moduleName(examination.data.module || '')} | **Method:** ${examination.data.method || 'Standard Protocol'}
**Status:** ${status.toUpperCase()}
**Date Initiated:** ${examDate}
**Primary Analyst:** ${examination.data.analyst || 'Lab Analyst'}

---

### CASE & EVIDENCE CONTEXT
- **Case Reference:** ${examination.caseId} — ${linkedCase?.data.title || 'Forensic Case'}
- **Submitting Party:** ${linkedCase?.data.submitter || 'Investigating Authority'}
- **Evidence Item:** ${examination.data.evidenceId} — ${linkedEvidence?.data.title || 'Questioned Specimen'}
- **Material Class:** ${linkedEvidence?.data.type || 'Trace Evidence'}
- **Packaging & Seal:** ${linkedEvidence?.data.seal || 'Intact'} (Location: ${linkedEvidence?.data.location || 'Secure Storage'})
- **Assigned Protocol Template:** ${examination.data.templateId || 'Standard Bench Protocol'}

---

### 1. RAW EXAMINATION OBSERVATIONS & INSTRUMENT LOGS
${examination.data.observations || 'No examination observations documented yet.'}

---

### 2. ANALYTICAL INTERPRETATION / CONCLUSION
${examination.data.conclusion || 'Pending analytical interpretation.'}

---

### 3. METHOD LIMITATIONS & BOUNDARY CONDITIONS
${examination.data.limitations || 'Standard protocol limitations apply.'}

---

### ATTESTATION & CONTEMPORANEOUS NOTES
I hereby certify that the notes, measurements, and observations recorded above are contemporaneous scientific entries conducted in accordance with laboratory protocols.

Analyst: ${examination.data.analyst || 'Lab Analyst'}
Attestation Date: ${new Date().toLocaleDateString('en-US')}
`;
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const text = generateMarkdown();
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examination.id}-bench-sheet.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    printElement('printable-bench-sheet', {
      title: `${examination.id}-Bench-Sheet`,
      format: 'bench_sheet',
      paperMode: 'sheet',
      orientation: 'portrait',
    });
  };

  return (
    <Dialog open={!!examination} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="trace-dialog bench-sheet-dialog sm:max-w-5xl w-[980px] max-w-[95vw]" showCloseButton={false}>
        <DialogHeader className="no-print">
          <div className="report-header-controls">
            <div>
              <DialogTitle className="report-dialog-title">
                <FileText size={18} className="purple" />
                <span>Forensic Examination Bench Sheet · {examination.id}</span>
              </DialogTitle>
              <DialogDescription className="report-dialog-subtitle">
                Official contemporaneous laboratory bench notes, instrument parameters, and morphology log.
              </DialogDescription>
            </div>
            <div className="report-action-buttons">
              {onLaunchWizard && !isCompleted && (
                <button
                  type="button"
                  className="secondary small-btn"
                  onClick={() => {
                    onClose();
                    onLaunchWizard();
                  }}
                  title="Open interactive Protocol Wizard"
                >
                  <Microscope size={14} /> Resume Wizard
                </button>
              )}
              <button
                type="button"
                className="secondary small-btn"
                onClick={handleCopyMarkdown}
                title="Copy markdown to clipboard"
              >
                {copied ? <Check size={14} className="green" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy MD'}
              </button>
              <button
                type="button"
                className="secondary small-btn"
                onClick={handleDownload}
                title="Download markdown file"
              >
                <Download size={14} /> Download
              </button>
              <button
                type="button"
                className="primary small-btn"
                onClick={handlePrint}
                title="Print Bench Sheet or Save as PDF"
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Printable Document Container */}
        <div className="report-sheet-scroll-container">
          <div id="printable-bench-sheet" className="bench-sheet-paper">
            {/* Header / Letterhead */}
            <div className="bench-sheet-letterhead">
              <div className="bench-letterhead-brand">
                <div className="bench-emblem">
                  {examination.data.module === 'toxicology' ? <FlaskConical size={24} /> : <Microscope size={24} />}
                </div>
                <div>
                  <h1 className="bench-org-title">TRACE FORENSIC SCIENCE LABORATORY</h1>
                  <p className="bench-division-title">
                    DIVISION OF FORENSIC PHYSICAL EVIDENCE & ANALYSIS
                  </p>
                  <span className="bench-accreditation">
                    ISO/IEC 17025 CONTEMPORANEOUS BENCH EXAMINATION RECORD
                  </span>
                </div>
              </div>
              <div className="bench-sheet-meta-box">
                <div className="bench-sheet-ref">
                  <span className="meta-label">BENCH SHEET REF</span>
                  <span className="meta-val">{examination.id}</span>
                </div>
                <div className="bench-sheet-status-pill">
                  <span className={`status-badge-chip ${isCompleted ? 'completed' : 'in-progress'}`}>
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bench-header-divider" />

            {/* Examination & Context Metadata Grid */}
            <div className="bench-meta-grid">
              <div className="bench-meta-item">
                <span className="bench-label">CASE REFERENCE</span>
                <span className="bench-value">
                  <strong>{examination.caseId}</strong>
                  {linkedCase?.data.title && <span className="sub-case-title"> · {linkedCase.data.title}</span>}
                </span>
              </div>
              <div className="bench-meta-item">
                <span className="bench-label">PRIMARY DISCIPLINE</span>
                <span className="bench-value">{moduleName(examination.data.module || '')}</span>
              </div>
              <div className="bench-meta-item">
                <span className="bench-label">ANALYTICAL METHOD</span>
                <span className="bench-value">{examination.data.method || 'Standard Examination Protocol'}</span>
              </div>
              <div className="bench-meta-item">
                <span className="bench-label">DATE INITIATED</span>
                <span className="bench-value">{examDate}</span>
              </div>
              <div className="bench-meta-item">
                <span className="bench-label">REPORTING ANALYST</span>
                <span className="bench-value">{examination.data.analyst || 'Lab Analyst'}</span>
              </div>
              <div className="bench-meta-item">
                <span className="bench-label">PROTOCOL TEMPLATE</span>
                <span className="bench-value font-mono">{examination.data.templateId || 'tpl-standard'}</span>
              </div>
            </div>

            {/* Evidence Chain Context Callout */}
            <div className="bench-evidence-banner">
              <div className="bench-evidence-left">
                <div className="evidence-badge-tag">
                  <Tag size={13} />
                  <span>ITEM {examination.data.evidenceId}</span>
                </div>
                <div>
                  <strong className="evidence-banner-title">
                    {linkedEvidence?.data.title || 'Questioned Evidence Specimen'}
                  </strong>
                  <p className="evidence-banner-desc">
                    {linkedEvidence?.data.description || 'Submitted physical evidence specimen.'}
                  </p>
                </div>
              </div>
              <div className="bench-evidence-right">
                <div className="evidence-pill">
                  <span>Material:</span> <strong>{linkedEvidence?.data.type || 'Physical Trace'}</strong>
                </div>
                <div className="evidence-pill">
                  <span>Intake Seal:</span> <strong className={linkedEvidence?.data.seal === 'Intact' ? 'green-text' : 'amber-text'}>{linkedEvidence?.data.seal || 'Intact'}</strong>
                </div>
                <div className="evidence-pill">
                  <span>Location:</span> <strong>{linkedEvidence?.data.location || 'Secure Storage'}</strong>
                </div>
              </div>
            </div>

            {/* Section 1: Observations Narrative & Instrument Logs */}
            <div className="bench-section">
              <div className="bench-section-header">
                <h2>1. CONTEMPORANEOUS OBSERVATIONS & INSTRUMENT LOGS</h2>
                <span className="bench-section-tag">OBJECTIVE FINDINGS</span>
              </div>
              <div className="bench-observations-content">
                {examination.data.observations ? (
                  <pre className="bench-pre-observations">{examination.data.observations}</pre>
                ) : (
                  <p className="bench-empty-note">No examination observations have been documented yet.</p>
                )}
              </div>
            </div>

            {/* Section 2: Conclusions */}
            <div className="bench-section">
              <div className="bench-section-header">
                <h2>2. ANALYTICAL INTERPRETATION / EVALUATIVE CONCLUSION</h2>
                <span className="bench-section-tag">INTERPRETATION</span>
              </div>
              <div className="bench-content-box">
                {examination.data.conclusion ? (
                  <p className="bench-text-content">{examination.data.conclusion}</p>
                ) : (
                  <p className="bench-empty-note">Examination in progress. Analytical conclusion not yet formulated.</p>
                )}
              </div>
            </div>

            {/* Section 3: Limitations */}
            <div className="bench-section">
              <div className="bench-section-header">
                <h2>3. ANALYTICAL LIMITATIONS & METHOD CONSTRAINTS</h2>
                <span className="bench-section-tag">SCIENTIFIC DISCLAIMER</span>
              </div>
              <div className="bench-content-box limitation-box">
                {examination.data.limitations ? (
                  <p className="bench-text-content">{examination.data.limitations}</p>
                ) : (
                  <p className="bench-empty-note">Standard forensic screening limitations apply.</p>
                )}
              </div>
            </div>

            {/* Linked Reports Banner if any */}
            {linkedReports.length > 0 && (
              <div className="bench-linked-reports-box">
                <div className="linked-reports-title">
                  <ShieldCheck size={15} className="purple" />
                  <strong>Linked Certificate(s) of Analysis:</strong>
                </div>
                <div className="linked-reports-list">
                  {linkedReports.map((rep) => (
                    <span key={rep.id} className="linked-report-tag">
                      {rep.id} · {rep.data.status} (Author: {rep.data.author})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attestation Block */}
            <div className="bench-attestation-block page-break-inside-avoid">
              <div className="attestation-statement">
                <Shield size={16} className="purple" />
                <p>
                  I hereby attest that the above instrumental parameters, contemporaneous scientific observations,
                  and interpretations were executed in accordance with documented standard operating procedures (SOP).
                  Any deviations or unexpected instrument responses have been noted.
                </p>
              </div>
              <div className="bench-signatures-grid">
                <div className="bench-sign-col">
                  <span className="sign-label">EXAMINING ANALYST SIGN-OFF</span>
                  <div className="sign-line-box">
                    <span className="sign-signature">{examination.data.analyst || 'Lab Analyst'}</span>
                    <span className="sign-date">{new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <small className="sign-hint">Forensic Examiner Attestation</small>
                </div>
                <div className="bench-sign-col">
                  <span className="sign-label">VERIFICATION / QA REVIEW STAMP</span>
                  <div className="qa-stamp-box">
                    <ShieldCheck size={18} className="green" />
                    <span>ISO/IEC 17025 PRACTICE COMPLIANT</span>
                  </div>
                  <small className="sign-hint">Contemporaneous Lab Benchmark</small>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="bench-doc-footer">
              <span>TRACE FORENSIC OPERATING SYSTEM · BENCH NOTE REF: {examination.id}</span>
              <span>CASE: {examination.caseId}</span>
              <span>PAGE 1 OF 1</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
