'use client';
import { useState } from 'react';
import { Printer, Download, FileText, Check, Copy, Shield, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { modules } from '@/lib/modules';
import type { LabRecord } from '@/lib/records';
import { printElement } from '@/lib/print';

interface ReviewHistoryEntry {
  status: string;
  reviewer: string;
  at: string;
  note?: string;
}

interface ReportDocumentProps {
  report: LabRecord | null;
  records: LabRecord[];
  onClose: () => void;
}

const moduleName = (id: string) => modules.find((m) => m.id === id)?.name || id;
const moduleInstrument = (id: string) => modules.find((m) => m.id === id)?.instrument || 'Analytical Instrument';

export function ReportDocument({ report, records, onClose }: ReportDocumentProps) {
  const [copied, setCopied] = useState(false);

  if (!report || report.kind !== 'report') return null;

  const linkedCase = records.find((r) => r.id === report.caseId && r.kind === 'case');
  const linkedExam = records.find((r) => r.id === report.data.examinationId && r.kind === 'examination');
  const linkedEvidence = linkedExam ? records.find((r) => r.id === linkedExam.data.evidenceId && r.kind === 'evidence') : null;

  const status = report.data.status || 'Draft';
  const isIssued = status === 'Issued';
  const isApproved = status === 'Approved';

  const reportDate = new Date(report.created).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const generateMarkdown = () => {
    return `# TRACE FORENSIC SCIENCE LABORATORY
## CERTIFICATE OF ANALYSIS & FORENSIC EXAMINATION REPORT
**Report Reference:** ${report.id}  
**Status:** ${status.toUpperCase()}  
**Date:** ${reportDate}  
**Case Number:** ${report.caseId || 'N/A'} — ${linkedCase?.data.title || ''}  
**Submitting Agency / Party:** ${linkedCase?.data.submitter || 'General Submission'}  
**Primary Discipline:** ${moduleName(linkedCase?.data.module || linkedExam?.data.module || '')}  
**Authoring Analyst:** ${report.data.author || 'Forensic Analyst'}  

---

### 1. ITEM(S) SUBMITTED FOR EXAMINATION
- **Item ID:** ${linkedEvidence?.id || linkedExam?.data.evidenceId || 'N/A'}
- **Description:** ${linkedEvidence?.data.title || 'Submitted material'} (${linkedEvidence?.data.description || 'N/A'})
- **Packaging & Condition:** ${linkedEvidence?.data.type || 'Standard packaging'} · Seal: ${linkedEvidence?.data.seal || 'Intact'}

---

### 2. ANALYTICAL METHODS & INSTRUMENTATION
- **Method:** ${linkedExam?.data.method || 'Standard Laboratory Examination'}
- **Discipline Instrument:** ${moduleInstrument(linkedExam?.data.module || '')}

---

### 3. OBSERVATIONS & FINDINGS
${linkedExam?.data.observations || 'Detailed examination observations logged in primary worksheet.'}

**Summary of Findings:**
${report.data.summary || 'No findings recorded.'}

---

### 4. SCIENTIFIC LIMITATIONS
${report.data.limitations || 'Standard laboratory analytical limitations apply.'}

---

### 5. TECHNICAL REVIEW & SIGN-OFF
${report.data.history?.map((h: ReviewHistoryEntry) => `- **${h.status}** by ${h.reviewer} on ${new Date(h.at).toLocaleString()}: "${h.note || ''}"`).join('\n') || 'Draft pending review.'}

*This simulation report is generated for educational purposes within the TRACE forensic framework.*
`;
  };

  const handlePrint = () => {
    printElement('printable-report-sheet', {
      title: `${report.id}-Official-Examination-Report`,
      format: 'report',
      paperMode: 'sheet',
      orientation: 'portrait',
    });
  };

  const handleCopyMarkdown = () => {
    void navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = generateMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id}-official-report.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="report-document-dialog sm:max-w-5xl w-[1000px] max-w-[95vw] p-0 overflow-hidden" showCloseButton={false}>
        {/* Top Control Bar (Hidden when printed) */}
        <DialogHeader className="p-4 border-b bg-gray-50 flex flex-row items-center justify-between no-print gap-4">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <FileText size={18} className="text-purple-600 flex-shrink-0" />
              <span className="truncate">Official Examination Report &amp; Certificate</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 truncate">
              Formatted according to ISO/IEC 17025 laboratory documentation standards.
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1.5 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100 flex items-center gap-1.5 text-gray-700 whitespace-nowrap"
              title="Copy Report in Markdown format"
            >
              {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-2.5 py-1.5 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100 flex items-center gap-1.5 text-gray-700 whitespace-nowrap"
              title="Download Report Markdown file"
            >
              <Download size={13} />
              <span>Export .md</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="primary-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 shadow-sm whitespace-nowrap"
              title="Print Certificate of Analysis or Save as PDF"
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded ml-1"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
        </DialogHeader>

        {/* Printable Document Sheet */}
        <div className="report-sheet-scroll-container">
          <article className="report-document-sheet" id="printable-report-sheet">
            {/* Watermark for non-issued reports */}
            {!isIssued && (
              <div className="report-watermark" aria-hidden="true">
                {status.toUpperCase()}
              </div>
            )}

            {/* Official Letterhead */}
            <header className="report-letterhead">
              <div className="letterhead-crest">
                <div className="crest-emblem">
                  <Shield size={28} className="crest-icon" />
                </div>
              </div>
              <div className="letterhead-titles">
                <div className="lab-institution">TRACE FORENSIC SCIENCE SYSTEM</div>
                <div className="lab-division">DIVISION OF FORENSIC SERVICES · QUALITY MANAGEMENT</div>
                <h1 className="report-main-title">
                  CERTIFICATE OF ANALYSIS &amp; OFFICIAL EXAMINATION REPORT
                </h1>
                <div className="lab-standards">
                  ACCREDITED SIMULATION FRAMEWORK · ISO/IEC 17025 OPERATIONAL GUIDELINES
                </div>
              </div>
              <div className="letterhead-status-box">
                <div className={`status-stamp ${isIssued ? 'stamp-issued' : isApproved ? 'stamp-approved' : 'stamp-draft'}`}>
                  {isIssued ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                  <span>{status.toUpperCase()}</span>
                </div>
                <div className="report-barcode font-mono text-[10px] mt-1 text-gray-400">
                  *{report.id}*
                </div>
              </div>
            </header>

            {/* Case & Submission Details Grid */}
            <section className="report-meta-table">
              <div className="meta-row">
                <div className="meta-item">
                  <span className="meta-title">REPORT IDENTIFIER:</span>
                  <span className="meta-data font-mono font-bold">{report.id}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-title">CASE REFERENCE:</span>
                  <span className="meta-data font-mono font-bold">{report.caseId || 'UNLINKED'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-title">DATE ISSUED:</span>
                  <span className="meta-data">{reportDate}</span>
                </div>
              </div>

              <div className="meta-row">
                <div className="meta-item">
                  <span className="meta-title">CASE TITLE:</span>
                  <span className="meta-data font-semibold">{linkedCase?.data.title || 'General Case Investigation'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-title">SUBMITTING AGENCY / PARTY:</span>
                  <span className="meta-data">{linkedCase?.data.submitter || 'TRACE Laboratory Intake'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-title">LABORATORY DISCIPLINE:</span>
                  <span className="meta-data">{moduleName(linkedCase?.data.module || linkedExam?.data.module || 'trace')}</span>
                </div>
              </div>
            </section>

            {/* Section 1: Item(s) Submitted */}
            <section className="report-section">
              <h2 className="report-section-title">
                <span className="section-num">1.</span> ITEM(S) SUBMITTED FOR EXAMINATION
              </h2>
              <table className="report-items-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Description &amp; Packaging</th>
                    <th>Material Type</th>
                    <th>Condition &amp; Seal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono font-bold text-xs">{linkedEvidence?.id || linkedExam?.data.evidenceId || 'EV-ITEM'}</td>
                    <td>{linkedEvidence?.data.title || 'Evidence item'} — {linkedEvidence?.data.description || 'Standard evidence envelope'}</td>
                    <td>{linkedEvidence?.data.type || 'Physical Evidence'}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 font-semibold text-xs">
                        {linkedEvidence?.data.seal || 'Intact'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Section 2: Methods & Instruments */}
            <section className="report-section">
              <h2 className="report-section-title">
                <span className="section-num">2.</span> ANALYTICAL METHODS &amp; INSTRUMENTATION
              </h2>
              <div className="report-method-box">
                <p>
                  <strong>Primary Analytical Method:</strong> {linkedExam?.data.method || 'Comparative Microscopy & Material Analysis'}
                </p>
                <p>
                  <strong>Instrumentation / Standard Workstation:</strong> {moduleInstrument(linkedExam?.data.module || '')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Examinations conducted according to TRACE Standard Operating Procedures. All reference materials, reagents, and calibration standards verified prior to testing.
                </p>
              </div>
            </section>

            {/* Section 3: Detailed Observations */}
            {linkedExam?.data.observations && (
              <section className="report-section">
                <h2 className="report-section-title">
                  <span className="section-num">3.</span> LABORATORY OBSERVATIONS &amp; EXAM NOTES
                </h2>
                <div className="report-observations-content">
                  {linkedExam.data.observations}
                </div>
              </section>
            )}

            {/* Section 4: Interpretation & Conclusions */}
            <section className="report-section">
              <h2 className="report-section-title">
                <span className="section-num">{linkedExam?.data.observations ? '4.' : '3.'}</span> INTERPRETATION &amp; CONCLUSION OF FINDINGS
              </h2>
              <div className="report-conclusion-box">
                <div className="conclusion-badge">SCIENTIFIC OPINION &amp; CONCLUSION</div>
                <p className="conclusion-text">{report.data.summary || 'Findings summary pending.'}</p>
              </div>
            </section>

            {/* Section 5: Scientific Limitations */}
            <section className="report-section page-break-inside-avoid">
              <h2 className="report-section-title">
                <span className="section-num">{linkedExam?.data.observations ? '5.' : '4.'}</span> SCIENTIFIC LIMITATIONS &amp; SCOPE OF ANALYSIS
              </h2>
              <div className="report-limitations-box">
                <div className="limitations-header">
                  <AlertCircle size={15} className="text-amber-700" />
                  <strong>MANDATORY SCIENTIFIC DISCLOSURE:</strong>
                </div>
                <p>{report.data.limitations || 'Analysis is bounded by the quality and quantity of the submitted sample. No individualizing source attribution is implied unless specifically validated by standard comparative methods.'}</p>
                <p className="mt-2 text-xs text-gray-600">
                  Trace evidence similarities reflect shared physical or chemical properties and do not exclude the possibility of other sources with identical characteristics.
                </p>
              </div>
            </section>

            {/* Section 6: Review History & Multi-Party Sign-Off */}
            <section className="report-section page-break-inside-avoid">
              <h2 className="report-section-title">
                <span className="section-num">{linkedExam?.data.observations ? '6.' : '5.'}</span> TECHNICAL &amp; ADMINISTRATIVE REVIEW RECORD
              </h2>
              {report.data.history && report.data.history.length > 0 ? (
                <table className="report-review-table">
                  <thead>
                    <tr>
                      <th>Status Stage</th>
                      <th>Acting Reviewer</th>
                      <th>Timestamp (UTC)</th>
                      <th>Verification Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.history.map((h: ReviewHistoryEntry, i: number) => (
                      <tr key={i}>
                        <td className="font-semibold text-xs">{h.status}</td>
                        <td className="font-medium text-xs">{h.reviewer}</td>
                        <td className="text-xs text-gray-500">{new Date(h.at).toLocaleString()}</td>
                        <td className="text-xs">{h.note || 'Review verification completed.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs italic text-gray-500">
                  Initial report draft. Formal peer review will be appended upon submission.
                </p>
              )}
            </section>

            {/* Attestation & Signature Block */}
            <footer className="report-attestation-block page-break-inside-avoid">
              <div className="attestation-statement">
                <strong>ATTESTATION:</strong> I hereby certify that the examination(s) and analysis described herein were performed in accordance with accepted scientific principles and laboratory standard operating procedures. The conclusions stated reflect an objective scientific evaluation of the items submitted.
              </div>

              <div className="signature-grid">
                <div className="sig-column">
                  <div className="sig-handwriting font-serif italic text-[15px] text-purple-900">
                    {report.data.author || 'Authoring Analyst'}
                  </div>
                  <div className="sig-border-line" />
                  <div className="sig-name">{report.data.author || 'Forensic Analyst'}</div>
                  <div className="sig-title">Authoring Forensic Scientist · {moduleName(linkedCase?.data.module || 'trace')}</div>
                  <div className="sig-date text-[11px] text-gray-500">Date: {reportDate}</div>
                </div>

                <div className="sig-column">
                  <div className="sig-handwriting font-serif italic text-[15px] text-purple-900">
                    {report.data.history?.find((h: ReviewHistoryEntry) => h.status === 'Approved')?.reviewer || (isIssued ? 'Technical Lead' : '')}
                  </div>
                  <div className="sig-border-line" />
                  <div className="sig-name">
                    {report.data.history?.find((h: ReviewHistoryEntry) => h.status === 'Approved')?.reviewer || 'Technical Reviewer'}
                  </div>
                  <div className="sig-title">Quality Assurance &amp; Technical Reviewer</div>
                  <div className="sig-date text-[11px] text-gray-500">
                    Date: {report.data.history?.find((h: ReviewHistoryEntry) => h.status === 'Approved')?.at ? new Date(report.data.history.find((h: ReviewHistoryEntry) => h.status === 'Approved').at).toLocaleDateString() : 'Pending Approval'}
                  </div>
                </div>
              </div>

              <div className="report-footer-disclaimer">
                TRACE FORENSIC LABORATORY SYSTEM · SIMULATION DOCUMENT · FOR EDUCATIONAL TRAINING PURPOSES
              </div>
            </footer>
          </article>
        </div>

        {/* Modal Footer (No print) */}
        <div className="p-3 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500 no-print">
          <span>Click &quot;Print / Save as PDF&quot; to generate an official printout or digital PDF file.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-gray-600 hover:text-gray-900 border border-gray-300 rounded bg-white"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
