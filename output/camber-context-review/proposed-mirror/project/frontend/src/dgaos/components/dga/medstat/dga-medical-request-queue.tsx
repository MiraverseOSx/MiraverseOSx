'use client';

import React, { useState } from 'react';
import { DGACase, MedicalRecordsRequest } from '@/lib/dga-types';
import { releaseMedicalReportToCase, updateCaseMedicalRequest } from '@/lib/dga-store';

interface DgaMedicalRequestQueueProps {
  cases: DGACase[];
  activeCaseId?: string | null;
  onOpenCase?: (caseId: string) => void;
}

export function DgaMedicalRequestQueue({ cases, activeCaseId, onOpenCase }: DgaMedicalRequestQueueProps) {
  const [drafts, setDrafts] = useState<Record<string, { findings: string; author: string; reportType: string; limitations: string }>>({});
  const [message, setMessage] = useState<string | null>(null);

  const requests = cases.flatMap((item) =>
    (item.medicalRequests || []).map((request) => ({ ...request, caseTitle: item.title }))
  );

  const draftFor = (request: MedicalRecordsRequest) =>
    drafts[request.id] || { findings: '', author: '', reportType: 'Medical record', limitations: '' };

  const setDraft = (requestId: string, patch: Partial<{ findings: string; author: string; reportType: string; limitations: string }>) => {
    setDrafts((current) => ({ ...current, [requestId]: { ...draftFor({ id: requestId } as MedicalRecordsRequest), ...current[requestId], ...patch } }));
  };

  if (requests.length === 0) {
    return (
      <div className="border-b border-slate-300 bg-white px-4 py-2 text-xs text-slate-600 font-medium">
        No case-linked medical records requests are waiting in MEDSTAT.
        {activeCaseId ? ` Active case: ${activeCaseId}.` : ''}
      </div>
    );
  }

  return (
    <div className="border-b border-slate-300 bg-white px-4 py-3 space-y-2 max-h-64 overflow-y-auto">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Case-Linked Medical Requests Queue</div>
      {message && <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 p-2 rounded">{message}</div>}
      {requests.map((request) => {
        const draft = draftFor(request);
        const open = !['Completed', 'Rejected', 'Cancelled'].includes(request.status);
        return (
          <div key={request.id} className="border border-slate-300 rounded p-3 text-xs space-y-2 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-slate-900">{request.id}</span>
                <span className="ml-2 font-semibold text-slate-900">{request.subjectName}</span>
                <span className="ml-2 text-slate-500 font-mono">({request.caseId})</span>
              </div>
              <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                request.status === 'Completed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                request.status === 'Rejected' ? 'bg-red-100 text-red-900 border border-red-300' :
                'bg-blue-100 text-blue-900 border border-blue-300'
              }`}>{request.status}</span>
            </div>
            <div className="text-slate-700 font-medium">
              Requested: <strong className="text-slate-900">{request.recordsRequested}</strong> · Facility: <strong className="text-slate-900">{request.facility || 'Unknown'}</strong>
            </div>
            {request.releasedDocumentId && (
              <div className="text-emerald-900 bg-emerald-50 border border-emerald-200 p-1.5 rounded font-semibold text-[11px]">
                Official Released Report: <strong className="font-mono">{request.releasedDocumentId}</strong> is linked to originating case dossier.
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {onOpenCase && (
                <button type="button" onClick={() => onOpenCase(request.caseId)} className="px-2.5 py-1 bg-white border border-slate-300 hover:border-slate-800 text-slate-900 font-semibold rounded cursor-pointer text-xs shadow-2xs">
                  Return to Case Dossier
                </button>
              )}
              {open && (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await updateCaseMedicalRequest(request.caseId, request.id, 'Acknowledged', 'MEDSTAT clinical intake acknowledged the request.');
                      setMessage(result.message);
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-slate-800 text-slate-900 font-semibold rounded cursor-pointer text-xs shadow-2xs"
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await updateCaseMedicalRequest(request.caseId, request.id, 'Awaiting Information', 'MEDSTAT requires additional clinical authorization or patient identifiers.');
                      setMessage(result.message);
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-slate-800 text-slate-900 font-semibold rounded cursor-pointer text-xs shadow-2xs"
                  >
                    Need Clinical Info
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await updateCaseMedicalRequest(request.caseId, request.id, 'Rejected', 'Request rejected by the receiving medical facility.');
                      setMessage(result.message);
                    }}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-300 text-red-900 font-semibold rounded cursor-pointer text-xs shadow-2xs"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
            {open && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <input
                  value={draft.author}
                  onChange={(event) => setDraft(request.id, { author: event.target.value })}
                  placeholder="Attending Physician / Pathologist Name"
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 text-xs outline-none focus:border-slate-800"
                />
                <input
                  value={draft.reportType}
                  onChange={(event) => setDraft(request.id, { reportType: event.target.value })}
                  placeholder="Official Report Classification (e.g. Autopsy / Toxicology Report)"
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 text-xs outline-none focus:border-slate-800"
                />
                <textarea
                  value={draft.findings}
                  onChange={(event) => setDraft(request.id, { findings: event.target.value })}
                  placeholder="Detailed clinical findings, toxicology levels, or trauma autopsy determinations. These findings will be filed directly into the case file."
                  rows={3}
                  className="md:col-span-2 bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 text-xs outline-none focus:border-slate-800"
                />
                <input
                  value={draft.limitations}
                  onChange={(event) => setDraft(request.id, { limitations: event.target.value })}
                  placeholder="Analytical limitations or pending confirmatory tests (optional)"
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 text-xs outline-none focus:border-slate-800"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const result = await releaseMedicalReportToCase(request.caseId, request.id, {
                      author: draft.author,
                      reportType: draft.reportType,
                      findings: draft.findings,
                      limitations: draft.limitations
                    });
                    setMessage(result.message);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold cursor-pointer text-xs shadow-xs"
                >
                  Release Official Report to Case File
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
