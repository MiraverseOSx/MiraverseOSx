'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Beaker,
  Users,
  HeartPulse,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Plus,
  Send,
  Edit3,
  ExternalLink,
  Target,
  FileCheck2,
  Compass,
  X
} from 'lucide-react';
import { DGACase } from '@/lib/dga-types';
import {
  evaluateCaseSuggestions,
  InvestigativeSuggestion,
  dismissSuggestion,
  deferSuggestion,
  acceptSuggestion
} from '@/lib/dga-suggestion-engine';

interface DgaInvestigatorDeskProps {
  caseData: DGACase;
  onNavigateToFileSection: (
    section:
      | 'overview'
      | 'people'
      | 'medical'
      | 'evidence'
      | 'forensics'
      | 'requests'
      | 'findings'
      | 'documents'
      | 'tasks'
      | 'timeline'
      | 'disposition'
  ) => void;
  onOpenModal: (
    modalName:
      | 'log_evidence'
      | 'add_person'
      | 'request_medstat'
      | 'requisition_trace'
      | 'add_task'
      | 'edit_narrative'
      | 'add_note'
      | 'record_finding'
  ) => void;
  onOpenTraceWithCase?: (traceCaseId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export function DgaInvestigatorDesk({
  caseData,
  onNavigateToFileSection,
  onOpenModal,
  onOpenTraceWithCase,
  onNavigateTab
}: DgaInvestigatorDeskProps) {
  const [suggestions, setSuggestions] = useState<InvestigativeSuggestion[]>([]);
  const [isNarrativeExpanded, setIsNarrativeExpanded] = useState(false);

  useEffect(() => {
    setSuggestions(evaluateCaseSuggestions(caseData));
  }, [caseData]);

  const handleDismiss = (suggestionId: string) => {
    dismissSuggestion(caseData.id, suggestionId);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  };

  const handleDefer = (suggestionId: string) => {
    deferSuggestion(caseData.id, suggestionId);
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, deferred: true } : s))
    );
  };

  const handleAccept = (suggestionId: string) => {
    acceptSuggestion(caseData.id, suggestionId);
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, accepted: true } : s))
    );
  };

  const handleActOnSuggestion = (s: InvestigativeSuggestion) => {
    if (s.modalName) {
      onOpenModal(s.modalName);
    } else {
      onNavigateToFileSection(s.targetTab);
    }
  };

  // Needs Attention items
  const needsAttentionItems: Array<{ label: string; color: string; onClick: () => void }> = [];

  const unanalyzedEvidenceCount = caseData.evidence.filter(
    (e) => (e.custodyStatus === 'In DGA Custody' || e.custodyStatus === 'Secured in Vault' || e.custodyStatus === 'Collected') && !e.linkedTraceEvidenceId
  ).length;

  if (caseData.people.length === 0) {
    needsAttentionItems.push({
      label: 'Zero subjects or witnesses identified',
      color: 'bg-red-50 text-red-900 border-red-300',
      onClick: () => onOpenModal('add_person')
    });
  }

  if (unanalyzedEvidenceCount > 0) {
    needsAttentionItems.push({
      label: `${unanalyzedEvidenceCount} exhibit(s) unsubmitted for lab analysis`,
      color: 'bg-amber-50 text-amber-950 border-amber-300',
      onClick: () => onOpenModal('requisition_trace')
    });
  }

  const pendingFreqCount = caseData.forensicRequests.filter(
    (r) => r.status === 'Pending' || r.status === 'Under Analysis'
  ).length;
  if (pendingFreqCount > 0) {
    needsAttentionItems.push({
      label: `${pendingFreqCount} TRACE forensic requisition(s) in progress`,
      color: 'bg-blue-50 text-blue-900 border-blue-300',
      onClick: () => onNavigateToFileSection('forensics')
    });
  }

  const openMedical = (caseData.medicalRequests || []).filter(
    (request) => !['Completed', 'Rejected', 'Cancelled', 'Partially Fulfilled'].includes(request.status)
  );
  if (openMedical.length > 0) {
    needsAttentionItems.push({
      label: `${openMedical.length} medical records request(s) awaiting response`,
      color: 'bg-red-50 text-red-900 border-red-300',
      onClick: () => onNavigateToFileSection('medical')
    });
  }

  if (caseData.tasks.length === 0) {
    needsAttentionItems.push({
      label: 'Zero operational directives assigned',
      color: 'bg-slate-100 text-slate-900 border-slate-300',
      onClick: () => onOpenModal('add_task')
    });
  }

  const unverifiedSuspectsCount = (caseData.suspectProfiles || []).filter(
    (s) => s.alibiStatus === 'Unverified' || !s.alibiStatus
  ).length;
  if (unverifiedSuspectsCount > 0) {
    needsAttentionItems.push({
      label: `${unverifiedSuspectsCount} subject alibi(s) unverified in case matrix`,
      color: 'bg-amber-50 text-amber-950 border-amber-300',
      onClick: () => onNavigateToFileSection('findings')
    });
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-8">
      {/* 1. DOCKET SUMMARY & INCIDENT NARRATIVE CARD */}
      <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
              {caseData.id}
            </span>
            <span className="text-[10px] font-bold text-red-900 bg-red-50 border border-red-300 px-2 py-0.5 rounded">
              {caseData.classification}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                caseData.priority === 'Critical'
                  ? 'bg-red-100 text-red-900 border border-red-300'
                  : caseData.priority === 'High'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'bg-slate-100 text-slate-900 border border-slate-300'
              }`}
            >
              PRIORITY: {caseData.priority}
            </span>
            <span className="text-[10px] font-bold text-slate-700 uppercase">
              LEAD: {caseData.leadSystem} ({caseData.department || 'Investigation'})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">
              Primary: <strong className="text-slate-900">{caseData.primaryInvestigator || caseData.assignedAgents[0] || 'Unassigned'}</strong>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              Opened: <strong className="text-slate-900">{new Date(caseData.createdAt).toLocaleDateString()}</strong>
            </span>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-700" />
              INITIAL INCIDENT REPORT NARRATIVE
            </span>
            <button
              onClick={() => onOpenModal('edit_narrative')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Narrative</span>
            </button>
          </div>

          <p
            className={`text-xs text-slate-900 leading-relaxed whitespace-pre-line ${
              !isNarrativeExpanded ? 'line-clamp-4' : ''
            }`}
          >
            {caseData.summary || 'No incident narrative recorded.'}
          </p>

          {caseData.summary && caseData.summary.length > 280 && (
            <button
              onClick={() => setIsNarrativeExpanded(!isNarrativeExpanded)}
              className="text-[11px] font-bold text-slate-700 hover:text-slate-900 pt-0.5 cursor-pointer underline"
            >
              {isNarrativeExpanded ? 'Show Less' : 'Read Full Report...'}
            </button>
          )}
        </div>
      </div>

      {/* 2. NEEDS ATTENTION / CASE ALERTS BAR */}
      {needsAttentionItems.length > 0 && (
        <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              NEEDS ATTENTION ({needsAttentionItems.length})
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              Items requiring immediate investigative action
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {needsAttentionItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                className={`text-xs font-semibold px-2.5 py-1 rounded border flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-90 ${item.color}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                <span>{item.label}</span>
                <ChevronRight className="w-3 h-3 ml-0.5 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. QUICK ACTIONS TOOLBAR */}
      <div className="bg-white border border-slate-300 rounded-lg p-3.5 shadow-xs space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
          INVESTIGATIVE QUICK ACTIONS
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <button
            onClick={() => onOpenModal('log_evidence')}
            className="p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-900 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
          >
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-800 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Log Evidence</span>
          </button>

          <button
            onClick={() => onOpenModal('add_person')}
            className="p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-900 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
          >
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Add Person</span>
          </button>

          <button
            onClick={() => onOpenModal('request_medstat')}
            className="p-2.5 rounded border border-slate-200 bg-white hover:bg-red-50 hover:border-red-300 text-slate-900 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
          >
            <div className="w-8 h-8 rounded bg-red-50 text-red-800 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Order Medical</span>
          </button>

          <button
            onClick={() => onOpenModal('requisition_trace')}
            className="p-2.5 rounded border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-900 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
          >
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-900 flex items-center justify-center">
              <Beaker className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">TRACE Requisition</span>
          </button>

          <button
            onClick={() => onOpenModal('add_task')}
            className="p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-900 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
          >
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Add Directive</span>
          </button>

          <button
            onClick={() => onOpenModal('add_note')}
            className="p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-900 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
          >
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-800 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Field Note</span>
          </button>

          <button
            onClick={() => onNavigateToFileSection('findings')}
            className="p-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-900 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
          >
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-800 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Case Matrix</span>
          </button>

          <button
            onClick={() => onNavigateToFileSection('disposition')}
            className="p-2.5 rounded border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-slate-900 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
          >
            <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Indictment</span>
          </button>
        </div>
      </div>

      {/* 4. RECOMMENDED ACTIONS PANEL (CLEAN, HIGH-CONTRAST PROFESSIONAL PRESENTATION) */}
      <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-slate-800" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              RECOMMENDED ACTIONS ({suggestions.length})
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Deterministic rule engine based on authoritative case state
          </span>
        </div>

        {suggestions.length === 0 && (
          <p className="text-xs text-slate-600 py-2">
            No recommended actions. Suggestions appear from the current case record and never submit a request on their own.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className={`bg-slate-50 border rounded-lg p-3.5 flex flex-col justify-between space-y-2.5 transition-all ${
                s.priority === 'important' || s.priority === 'urgent'
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-slate-300'
              } ${s.accepted ? 'opacity-60 bg-slate-100' : ''}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      s.priority === 'important' || s.priority === 'urgent'
                        ? 'bg-red-100 text-red-900 border border-red-300'
                        : 'bg-slate-200 text-slate-900 border border-slate-300'
                    }`}
                  >
                    {s.category} • {s.priority.toUpperCase()}
                  </span>

                  {s.accepted && (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                    </span>
                  )}
                  {s.deferred && (
                    <span className="text-xs text-amber-800 font-semibold">Deferred</span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{s.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{s.rationale}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDismiss(s.id)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                    title="Dismiss this recommendation"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleDefer(s.id)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                    title="Defer for later"
                  >
                    Defer
                  </button>
                  {!s.accepted && (
                    <button
                      onClick={() => handleAccept(s.id)}
                      className="text-xs text-slate-700 hover:text-emerald-800 font-semibold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      title="Accept recommendation"
                    >
                      Accept
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleActOnSuggestion(s)}
                  className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>{s.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. TWO-COLUMN OPERATIONAL STREAM: RECENT ACTIVITY & PENDING REQUESTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Recent Activity Stream */}
        <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-700" />
              RECENT CASE ACTIVITY ({caseData.timeline.length})
            </span>
            <button
              onClick={() => onNavigateToFileSection('timeline')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Timeline</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {caseData.timeline.slice(0, 6).map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 rounded border border-slate-200 bg-slate-50 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-mono font-bold text-slate-900">{evt.type}</span>
                  <span>{new Date(evt.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <div className="font-medium text-slate-900 leading-snug">{evt.description}</div>
                <div className="text-[11px] text-slate-600">Actor: {evt.actor}</div>
              </div>
            ))}

            {caseData.timeline.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500">No timeline events logged yet.</div>
            )}
          </div>
        </div>

        {/* Right: Pending Requests & Dispatches */}
        <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-slate-700" />
              PENDING AGENCY REQUESTS & DISPATCHES
            </span>
            <button
              onClick={() => onNavigateToFileSection('requests')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {/* TRACE Lab Requests */}
            {caseData.forensicRequests.map((req) => (
              <div
                key={req.id}
                className="p-2.5 rounded border border-slate-200 bg-slate-50 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Beaker className="w-3.5 h-3.5 text-slate-800" />
                    <span className="font-mono font-bold text-slate-900">TRACE: {req.id}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      req.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : req.status === 'Under Analysis'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-amber-100 text-amber-950 border border-amber-300'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <div className="text-xs text-slate-800 leading-snug">{req.notes}</div>
                {req.resultSummary && (
                  <div className="p-2 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-950 font-medium">
                    Result: {req.resultSummary}
                  </div>
                )}
                {onOpenTraceWithCase && req.linkedTraceCaseId && (
                  <div className="pt-0.5 flex justify-end">
                    <button
                      onClick={() => onOpenTraceWithCase(req.linkedTraceCaseId!)}
                      className="text-xs font-bold text-slate-900 underline hover:text-black flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open in TRACE Lab</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Medical Records Link */}
            {caseData.medicalRecordId && (
              <div className="p-2.5 rounded border border-red-200 bg-red-50/50 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-red-700" />
                    <span className="font-mono font-bold text-red-950">
                      MEDSTAT: {caseData.medicalRecordId}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-red-100 text-red-900 border border-red-300">
                    Active Chart
                  </span>
                </div>
                <div className="text-xs text-red-950 leading-snug">
                  Hospital ICU telemetry & toxicology screening record linked to case docket.
                </div>
                {onNavigateTab && (
                  <div className="pt-0.5 flex justify-end">
                    <button
                      onClick={() => onNavigateTab('medstat')}
                      className="text-xs font-bold text-red-900 underline hover:text-black flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Patient Chart</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {caseData.forensicRequests.length === 0 && !caseData.medicalRecordId && (
              <div className="text-center py-6 text-xs text-slate-500">
                No pending lab or clinical dispatches.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
