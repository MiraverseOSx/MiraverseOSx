import React, { useState, useEffect } from 'react';
import { traceDurableStore } from '../services/traceDurableStore';
import { LabRecord } from '../lib/records';
import { ShieldCheck, AlertCircle, Clock, FileText, CheckCircle2, X, ArrowRight } from 'lucide-react';

export interface TraceClosingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void; // Continue working
  onConfirmExit: () => void; // Close TRACE
  onViewPendingWork: (recordId: string, view: string) => void;
}

export default function TraceClosingSummaryModal({
  isOpen,
  onClose,
  onConfirmExit,
  onViewPendingWork,
}: TraceClosingSummaryModalProps) {
  const [unfinishedExams, setUnfinishedExams] = useState<LabRecord[]>([]);
  const [draftReports, setDraftReports] = useState<LabRecord[]>([]);
  const [awaitingTransmission, setAwaitingTransmission] = useState<any[]>([]);
  const [session, setSession] = useState(traceDurableStore.getSession());
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const records = traceDurableStore.getRecords();
      const currentSession = traceDurableStore.getSession();
      setSession(currentSession);

      const openExams = records.filter(
        (r) => r.kind === 'examination' && r.data.status !== 'Completed'
      );
      const openReports = records.filter(
        (r) => r.kind === 'report' && r.data.status !== 'Issued'
      );
      const txQueue = traceDurableStore
        .getAllTransmissions()
        .filter((t) => t.status === 'Awaiting Transmission' || t.status === 'Finalized');

      setUnfinishedExams(openExams);
      setDraftReports(openReports);
      setAwaitingTransmission(txQueue);
      setNeverShowAgain(!currentSession.closingSummaryEnabled);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPending = unfinishedExams.length + draftReports.length + awaitingTransmission.length;

  const handleConfirmExit = () => {
    if (neverShowAgain !== !session.closingSummaryEnabled) {
      traceDurableStore.updateSession({ closingSummaryEnabled: !neverShowAgain });
    }
    onConfirmExit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D1A]/80 backdrop-blur-sm select-none font-sans">
      <div className="relative w-full max-w-xl rounded-xl border border-[#3E4259] bg-[#1E2030] text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2F3349] bg-[#181928] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-[#A78BFA]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              TRACE // Operational Exit Summary
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50"
            title="Continue Working"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Active Case & Station context */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-[#32364F] bg-[#141624]">
              <span className="block text-slate-400 font-mono uppercase text-[10px]">Active Investigation</span>
              <strong className="text-sm text-purple-200">{session.activeCaseId || 'FS-2026-00422'}</strong>
            </div>
            <div className="p-3 rounded-lg border border-[#32364F] bg-[#141624]">
              <span className="block text-slate-400 font-mono uppercase text-[10px]">Active Forensic Station</span>
              <strong className="text-sm text-purple-200">{session.activeStation}</strong>
            </div>
          </div>

          {/* Pending work warning or clean state */}
          {totalPending > 0 ? (
            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-950/20 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>You have unfinished forensic work preserved in autosave:</strong>
                <p className="mt-1 text-slate-300">
                  All notes, worksheets, and drafts are durably persisted in local storage. You can exit safely without loss of data, or return to complete your analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>All forensic dockets, examinations, and reports are up to date and clean.</span>
            </div>
          )}

          {/* Pending items lists */}
          {unfinishedExams.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock size={13} className="text-amber-400" />
                Unfinished Examinations ({unfinishedExams.length})
              </span>
              <div className="space-y-1">
                {unfinishedExams.slice(0, 3).map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-2.5 rounded border border-[#2F3349] bg-[#161826] text-xs hover:border-purple-400 cursor-pointer"
                    onClick={() => {
                      onViewPendingWork(ex.id, 'Examinations');
                      onClose();
                    }}
                  >
                    <div>
                      <span className="font-mono text-purple-300 font-semibold">{ex.id}</span>
                      <div className="text-slate-200">{ex.data.title}</div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/50">
                      {ex.data.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {awaitingTransmission.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText size={13} className="text-purple-400" />
                Finalized Findings Awaiting Transmission ({awaitingTransmission.length})
              </span>
              <div className="space-y-1">
                {awaitingTransmission.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded border border-[#2F3349] bg-[#161826] text-xs"
                  >
                    <div>
                      <span className="font-mono text-purple-300 font-semibold">{tx.reportId}</span>
                      <div className="text-slate-200">{tx.summary}</div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50">
                      Ready to Transmit
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="pt-2 border-t border-[#2F3349]">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={neverShowAgain}
                onChange={(e) => setNeverShowAgain(e.target.checked)}
                className="rounded border-[#3E4259] bg-[#141624] text-purple-600 focus:ring-0"
              />
              <span>Do not display this exit summary dialog again automatically</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#2F3349] bg-[#181928] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#3E4259] hover:bg-slate-700/50 text-slate-200 text-xs font-semibold"
          >
            Continue Working
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirmExit}
              className="px-4 py-2 rounded-lg bg-rose-900/80 hover:bg-rose-800 border border-rose-700 text-white text-xs font-bold shadow-sm"
            >
              Close TRACE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
