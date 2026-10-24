import React, { useState, useEffect } from 'react';
import {
  Award, Shield, FileCheck, CheckCircle2, AlertCircle, ArrowRight, User, Briefcase, Lock, FileText,
  DollarSign, Sliders, Check
} from 'lucide-react';
import { useOSStore } from '../../../store/useOSStore';
import { evaluateCareerPromotion } from '../../../gameplay/WorldEventEngine';
import { employed } from '../workplaceModel';
import { INSTITUTIONAL_REGISTRY } from '../worknetData';
import type { WorkplaceStationId } from '../../JobWorkstationApp';

interface WorknetCareerRecordProps {
  activeStation: WorkplaceStationId;
  onSwitchWorkplace?: (station: WorkplaceStationId) => void;
  onClaimBaseStipends?: () => void;
  onSelectPathway?: (track: string, pathway: 'specialist' | 'supervisor') => void;
  onFeedback: (msg: string) => void;
}

export default function WorknetCareerRecord({
  activeStation,
  onSwitchWorkplace,
  onClaimBaseStipends,
  onSelectPathway,
  onFeedback
}: WorknetCareerRecordProps) {
  const player = useOSStore(s => s.gameplay.player);
  const currentCycle = useOSStore(s => s.gameplay.timeCycleCount) ?? 0;
  const requestCareerPromotion = useOSStore(s => s.requestCareerPromotion);

  const [selectedTrack, setSelectedTrack] = useState<string>(activeStation === 'faithmed' ? 'medical' : activeStation === 'archives' ? 'archivist' : activeStation);

  useEffect(() => { setSelectedTrack(activeStation === 'faithmed' ? 'medical' : activeStation === 'archives' ? 'archivist' : activeStation); }, [activeStation]);

  const currentStation = selectedTrack === 'medical' ? 'faithmed' : selectedTrack === 'archivist' ? 'archives' : selectedTrack;
  const theme = INSTITUTIONAL_REGISTRY[currentStation] || INSTITUTIONAL_REGISTRY.dga;
  const careerEval = evaluateCareerPromotion(selectedTrack, player);

  const contracts = player.employmentContracts || {};
  const activeContract = contracts[selectedTrack];

  const contractEligible = employed(player, currentStation);
  const currentPathway = activeContract?.pathwayChoice || 'specialist';
  const hasStipendPending = contractEligible && activeContract && (activeContract.lastStipendClaimedCycle ?? currentCycle - 1) < currentCycle;

  const handlePromotion = () => {
    const res = requestCareerPromotion(selectedTrack);
    onFeedback(res.ok ? `🎖️ ${res.message}` : `⚠️ ${res.message}`);
  };

  const handlePathwayToggle = (pathway: 'specialist' | 'supervisor') => {
    if (onSelectPathway) {
      onSelectPathway(selectedTrack, pathway);
    } else {
      const res = useOSStore.getState().setCareerPathwayChoice(selectedTrack, pathway);
      onFeedback(res.ok ? `🎖️ ${res.message}` : `⚠️ ${res.message}`);
    }
  };

  return (
    <div className="worknet-view-scroll">
      {/* Header */}
      <div className="worknet-card">
        <div className="flex items-center justify-between">
          <div>
            <span className="worknet-kicker">Professional Portfolio & Personnel Dossier</span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Career Record & Institutional Personnel Files
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              WORKNET maintains a permanent central professional history and employer-specific personnel files with dual-track career progression.
            </p>
          </div>
          {onClaimBaseStipends && (
            <button
              onClick={onClaimBaseStipends}
              className="worknet-btn-primary text-xs"
            >
              <DollarSign size={13} /> Claim cycle salary
            </button>
          )}
        </div>

        {/* Track Selector Bar */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs overflow-x-auto">
          {['dga', 'medical', 'finance', 'archivist', 'engineer', 'diplomat', 'warden', 'artist', 'questnotice'].map(track => (
            <button
              key={track}
              onClick={() => { setSelectedTrack(track); onSwitchWorkplace?.((track === 'medical' ? 'faithmed' : track === 'archivist' ? 'archives' : track) as WorkplaceStationId); }}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition ${
                selectedTrack === track ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {track.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="worknet-grid-2">
        {/* Central Career Record (Permanent across institutions) */}
        <div className="worknet-card space-y-4">
          <div className="worknet-card-header">
            <h3 className="worknet-card-title">
              <User size={16} className="text-slate-700" />
              Central Career Record (Permanent)
            </h3>
            <span className="worknet-badge">Public Federal Profile</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Registered Citizen ID</span>
              <p className="font-mono font-bold text-slate-900">{player.name || 'Registered Citizen'} · MAID Verified</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Track Experience & Standing</span>
              <p className="font-bold text-slate-900 text-sm">
                {careerEval.currentTitle} (Rank {careerEval.currentRankIndex})
              </p>
              <p className="text-[11px] text-slate-500">
                Accumulated Career XP: <strong>{careerEval.currentXP} XP</strong> in {selectedTrack.toUpperCase()}
              </p>
            </div>

            {/* Dual-Track Advancement Pathway */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Career pathway
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {currentPathway === 'supervisor' ? 'Department Supervisor' : 'Elite Specialist'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Specialists advance through the existing technical assignments and verified qualifications. Supervisors additionally manage this division’s dockets, budgets, and leave. Both retain the same qualification requirements; choosing a pathway does not issue credentials.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!contractEligible}
                  onClick={() => handlePathwayToggle('specialist')}
                  className={`p-2 rounded border text-left transition text-xs ${
                    currentPathway === 'specialist'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-semibold">Elite Specialist</span>
                  <span className="text-[10px] font-normal text-slate-500">Technical practice & advisory work</span>
                </button>

                <button
                  type="button"
                  disabled={!contractEligible}
                  onClick={() => handlePathwayToggle('supervisor')}
                  className={`p-2 rounded border text-left transition text-xs ${
                    currentPathway === 'supervisor'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-semibold">Department Supervisor</span>
                  <span className="text-[10px] font-normal text-slate-500">Delegation, dockets & leave review</span>
                </button>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1.5">Verified Qualifications</span>
              <div className="space-y-2">
                {careerEval.pathwayStatuses.map(path => (
                  <div
                    key={path.id}
                    className={`p-2.5 rounded-lg border text-[11px] ${
                      path.met ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {path.met ? <CheckCircle2 size={13} className="text-emerald-700" /> : <Lock size={13} className="text-slate-400" />}
                      <span>{path.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">{path.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Employer-Specific Personnel File */}
        <div className="worknet-card space-y-4">
          <div className="worknet-card-header">
            <h3 className="worknet-card-title">
              <Briefcase size={16} className="text-slate-700" />
              Institutional Personnel File (Confidential)
            </h3>
            <span className="worknet-badge">Restricted Access</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Active Contract</span>
              {activeContract ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{activeContract.position}</p>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Contract Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">{activeContract.id}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{activeContract.payTerms}</p>
                </>
              ) : (
                <><p className="text-[11px] text-slate-500 italic">No employment contract accepted for this track yet.</p><button className="worknet-btn-primary" onClick={() => { const result = useOSStore.getState().acceptEmployment(selectedTrack); onFeedback(result.message); }}>Accept division employment</button><p>150 credits per cycle plus accepted work. Existing clearance requirements apply; this contract issues no institutional credentials.</p></>
              )}
            </div>

            {/* Cycle salary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Cycle salary
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  hasStipendPending ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {!activeContract ? 'Contract required' : !contractEligible ? 'Current clearance required' : hasStipendPending ? 'Cycle Stipend Claimable' : 'Disbursed for Cycle ' + currentCycle}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Baseline Cycle Salary: <strong>{activeContract?.baseSalaryCredits ?? 150} ₢ Credits</strong> / cycle.
              </p>
              {hasStipendPending && onClaimBaseStipends && (
                <button
                  type="button"
                  onClick={onClaimBaseStipends}
                  className="worknet-btn-secondary text-[11px] py-1 px-2.5 mt-1"
                >
                  <DollarSign size={11} /> Disburse all eligible cycle stipends
                </button>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Reporting Structure</span>
              <p className="font-semibold text-slate-800">
                Supervisor: <strong>{theme.supervisor.name}</strong> ({theme.supervisor.title})
              </p>
              <p className="text-[11px] text-slate-500">Department: {theme.fullName}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Role-Specific Access & Permissions</span>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li>• Institutional AureMail access follows existing verified onboarding</li>
                <li>• Comms channels follow existing organization membership</li>
                <li>• Authorized station terminal equipment clearance: Tier {player.clearanceLevel ?? 2}</li>
              </ul>
            </div>

            {/* Advancement & Promotion */}
            <div className="pt-2 border-t border-slate-200">
              {careerEval.nextTitle ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">Next Advancement:</span>
                    <strong className="text-slate-900">{careerEval.nextTitle}</strong>
                  </div>
                  <button
                    onClick={handlePromotion}
                    disabled={!careerEval.canPromote}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      careerEval.canPromote
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <Award size={14} />
                    {careerEval.canPromote ? 'Request Formal Promotion' : 'Requirements Not Yet Met'}
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-center text-xs font-bold text-emerald-900">
                  🎖️ Highest Institutional Rank Achieved
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
