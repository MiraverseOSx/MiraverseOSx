'use client';

import React, { useState } from 'react';
import {
  Shield,
  FileText,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Clock,
  Vote,
  Gavel,
  Landmark,
  Building,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  INITIAL_BRIEFING_BOOK,
  INITIAL_DIPLOMATIC_CABLES,
  INITIAL_RISK_ASSESSMENT,
  INITIAL_EXECUTIVE_DECISIONS,
  CABINET_TRANSCRIPT,
  ExecutivePolicyDecision
} from '@/lib/government-data';
import { getDGAState, emitDgaEvent } from '@/lib/dga-store';

interface DgaGovernmentHubProps {
  onOpenCase?: (caseId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export function DgaGovernmentHub({ onOpenCase, onNavigateTab }: DgaGovernmentHubProps) {
  const [section, setSection] = useState<'briefing' | 'decisions' | 'cables' | 'risk' | 'transcript'>('briefing');
  const [decisions, setDecisions] = useState<ExecutivePolicyDecision[]>(INITIAL_EXECUTIVE_DECISIONS);
  const [enactFeedback, setEnactFeedback] = useState<string | null>(null);

  const activeDecision = decisions[0];

  const handleEnactPolicy = (decisionId: string, optionId: string) => {
    const dec = decisions.find((d) => d.id === decisionId);
    if (!dec) return;
    const opt = dec.options.find((o) => o.id === optionId);
    if (!opt) return;

    setDecisions((prev) =>
      prev.map((d) =>
        d.id === decisionId
          ? {
              ...d,
              selectedOptionId: optionId,
              enactedAt: new Date().toISOString(),
              enactedBy: 'Special Agent Miracle Jerome [Authorizing Officer]',
            }
          : d
      )
    );

    const state = getDGAState();
    state.alerts.unshift({
      id: `ALT-POL-${Date.now()}`,
      level: 'CRITICAL',
      title: `EXECUTIVE DIRECTIVE ENACTED: ${opt.label}`,
      message: `National Security Council policy implemented. ${opt.immediateConsequences[0]}`,
      source: 'EXECUTIVE OFFICE / NSC',
      timestamp: new Date().toISOString(),
      actionRequired: false,
    });

    setEnactFeedback(`Directive successfully ratified! World State shift: ${opt.immediateConsequences.join(' ')}`);
    setTimeout(() => setEnactFeedback(null), 8000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0eff5] text-[#1f1e30] overflow-hidden select-none font-sans">
      {/* 1. TOP EXECUTIVE HEADER */}
      <div className="h-12 bg-white border-b border-[#cfcddb] px-4 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
            <Landmark className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#1f1e30] tracking-wide">
                GOVERNMENT & EXECUTIVE POLICY DIVISION // SITUATION ROOM BRIEFING
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#edeaf6] text-[#4b4372] border border-[#cfcddb] font-semibold">
                DOCKET GOV-2026-0052
              </span>
            </div>
            <div className="text-[11px] text-[#5e5c7a]">
              Presidential Daily Brief (PDB) • Diplomatic Telegrams • Crisis Consequence Matrix
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-1 bg-[#eae8f2] p-1 rounded border border-[#cfcddb]">
          {[
            { id: 'briefing', label: 'Briefing Book (PDB)', icon: FileText },
            { id: 'decisions', label: 'Policy Directives', icon: Vote },
            { id: 'cables', label: 'Diplomatic Cables', icon: Radio },
            { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
            { id: 'transcript', label: 'Cabinet Transcripts', icon: Clock },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id as any)}
                className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1f1e30] shadow-2xs font-bold border border-[#cfcddb]'
                    : 'text-[#5e5c7a] hover:text-[#1f1e30] hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {enactFeedback && (
        <div className="bg-[#edeaf6] border-b border-[#cfcddb] px-4 py-2 text-xs flex items-center justify-between text-[#362f59]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{enactFeedback}</span>
          </div>
        </div>
      )}

      {/* 2. MAIN SECTION CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full">
        {/* SUBSECTION: BRIEFING BOOK (PDB) */}
        {section === 'briefing' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#cfcddb] rounded p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#cfcddb]">
                <div>
                  <h3 className="text-base font-bold text-[#1f1e30] tracking-wide">
                    {INITIAL_BRIEFING_BOOK.title}
                  </h3>
                  <div className="text-xs text-[#4b4372] font-mono mt-0.5">
                    RECIPIENT: {INITIAL_BRIEFING_BOOK.targetAudience} • {INITIAL_BRIEFING_BOOK.date}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-300">
                  {INITIAL_BRIEFING_BOOK.classification}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4b4372]">
                  EXECUTIVE SUMMARY & SITUATION APPRAISAL
                </span>
                <p className="text-xs text-[#2c2a3e] leading-relaxed bg-[#f8f7fc] p-3 rounded border border-[#cfcddb]">
                  {INITIAL_BRIEFING_BOOK.executiveSummary}
                </p>
              </div>

              {/* Strategic Options */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e5c7a]">
                  ACTION RECOMMENDATIONS BEFORE 22:00 UTC CAST-OFF
                </span>
                <div className="space-y-1.5">
                  {INITIAL_BRIEFING_BOOK.strategicOptions.map((opt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#2c2a3e] bg-[#f8f7fc] p-2 rounded border border-[#cfcddb]">
                      <ArrowRight className="w-3.5 h-3.5 text-[#4b4372] mt-0.5 shrink-0" />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBSECTION: EXECUTIVE POLICY DECISIONS */}
        {section === 'decisions' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#cfcddb] rounded p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#cfcddb]">
                <div>
                  <h3 className="text-base font-bold text-[#1f1e30]">{activeDecision.title}</h3>
                  <div className="text-xs text-[#5e5c7a] mt-0.5">{activeDecision.crisisContext}</div>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  activeDecision.selectedOptionId
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border border-amber-300'
                }`}>
                  {activeDecision.selectedOptionId ? 'RATIFIED BY AGENT' : 'DECISION PENDING'}
                </span>
              </div>

              {/* Choice Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDecision.options.map((opt) => {
                  const isSelected = activeDecision.selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`p-4 rounded border flex flex-col justify-between space-y-3 transition-colors ${
                        isSelected
                          ? 'bg-amber-50/60 border-2 border-amber-500 text-[#1f1e30] shadow-xs'
                          : 'bg-[#f8f7fc] border border-[#cfcddb] text-[#2c2a3e]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#1f1e30]">{opt.label}</span>
                          <span className="text-[10px] font-mono text-amber-800 font-bold uppercase">{opt.doctrine}</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                            IMMEDIATE OPERATIONAL DIRECTIVES:
                          </span>
                          <ul className="list-disc list-inside text-xs space-y-0.5 text-[#2c2a3e]">
                            {opt.immediateConsequences.map((c, idx) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                            DOWNSTREAM NARRATIVE IMPACT:
                          </span>
                          <ul className="list-disc list-inside text-xs space-y-0.5 text-[#5e5c7a]">
                            {opt.downstreamEffects.map((e, idx) => (
                              <li key={idx}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEnactPolicy(activeDecision.id, opt.id)}
                        disabled={isSelected}
                        className={`w-full py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#4b4372] hover:bg-[#3d365d] text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? 'CURRENT RATIFIED POLICY' : 'AUTHORIZE THIS DIRECTIVE'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBSECTION: DIPLOMATIC CABLES */}
        {section === 'cables' && (
          <div className="space-y-3">
            {INITIAL_DIPLOMATIC_CABLES.map((cable) => (
              <div key={cable.id} className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
                  <div>
                    <span className="text-xs font-bold text-[#4b4372] font-mono">{cable.station}</span>
                    <span className="text-xs text-[#1f1e30] ml-2 font-semibold">[{cable.subject}]</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#5e5c7a]">{cable.timestamp}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 border border-rose-300">
                      {cable.precedence}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#2c2a3e] leading-relaxed bg-[#f8f7fc] p-3 rounded border border-[#cfcddb]">
                  {cable.body}
                </p>

                <div className="text-[11px] text-[#5e5c7a]">
                  Signed: <span className="text-[#1f1e30] font-semibold">{cable.sourceOfficial}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBSECTION: RISK ASSESSMENT */}
        {section === 'risk' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_RISK_ASSESSMENT.map((risk, i) => (
              <div key={i} className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#cfcddb]">
                  <h4 className="text-sm font-bold text-[#1f1e30]">{risk.domain}</h4>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    risk.currentRiskLevel === 'High' ? 'bg-rose-50 text-rose-800 border border-rose-300' : 'bg-amber-50 text-amber-900 border border-amber-300'
                  }`}>
                    {risk.currentRiskLevel} ({risk.score}/100)
                  </span>
                </div>

                {/* Risk Bar */}
                <div className="w-full h-1.5 bg-[#e4e2ee] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${risk.score > 70 ? 'bg-rose-600' : 'bg-amber-600'}`}
                    style={{ width: `${risk.score}%` }}
                  />
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-[#5e5c7a] uppercase block">Primary Vulnerability:</span>
                    <span className="text-[#2c2a3e]">{risk.vulnerabilityFactor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Mitigation Measure:</span>
                    <span className="text-[#1f1e30] font-semibold">{risk.mitigationStrategy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBSECTION: CABINET TRANSCRIPT */}
        {section === 'transcript' && (
          <div className="bg-white border border-[#cfcddb] rounded p-4 space-y-3 shadow-2xs">
            <div className="text-xs text-[#5e5c7a] pb-2 border-b border-[#cfcddb]">
              Official contemporaneous transcript of National Security Council emergency session.
            </div>

            <div className="space-y-3">
              {CABINET_TRANSCRIPT.map((entry, idx) => (
                <div key={idx} className="bg-[#f8f7fc] p-3 rounded border border-[#cfcddb] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#4b4372]">{entry.speaker}</span>
                      <span className="text-[10px] text-[#5e5c7a]">({entry.role})</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#5e5c7a]">{entry.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#2c2a3e] leading-relaxed italic">{entry.dialogue}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
