import React, { useState } from 'react';
import {
  Users, UserCheck, Shield, Stethoscope, Coffee, MessageSquare, CheckCircle2,
  AlertCircle, ChevronRight, Zap, Award, BookOpen, Clock, Activity, CornerDownRight
} from 'lucide-react';
import { useOSStore } from '../../../store/useOSStore';
import { INSTITUTIONAL_REGISTRY } from '../worknetData';
import type { WorkplaceStationId } from '../../JobWorkstationApp';

interface WorknetWorkplaceProps {
  activeStation: WorkplaceStationId;
  coworkerStats: Record<string, {
    trust: number;
    competence: number;
    familiarity: number;
    cooperation: number;
    conflictHistory: number;
    lastInteraction?: string;
  }>;
  onInteractCoworker: (
    coworkerId: string,
    actionType: 'consult' | 'assist' | 'collaborate' | 'break',
    coworkerName: string
  ) => void;
  onVisitBreakRoom: () => void;
  breakRoomVisitCount: number;
  onFeedback: (msg: string) => void;
}

export default function WorknetWorkplace({
  activeStation,
  coworkerStats,
  onInteractCoworker,
  onVisitBreakRoom,
  breakRoomVisitCount,
  onFeedback
}: WorknetWorkplaceProps) {
  const player = useOSStore(s => s.gameplay.player);
  const theme = INSTITUTIONAL_REGISTRY[activeStation] || INSTITUTIONAL_REGISTRY.dga;
  const supervisor = theme.supervisor;

  const [activeTab, setActiveTab] = useState<'coworkers' | 'supervisor' | 'lounge' | 'duties'>('coworkers');
  const [selectedCoworkerId, setSelectedCoworkerId] = useState<string>(theme.coworkers[0]?.id || '');

  const handleSupervisorCheckin = (topic: string) => {
    onFeedback(`📋 Checked in with ${supervisor.name} regarding ${topic}. Evaluation score affirmed; supervisor expectation noted.`);
  };

  return (
    <div className="worknet-view-scroll">
      {/* Workplace Header */}
      <div
        className="worknet-card"
        style={{
          borderLeft: `4px solid ${theme.accentColor}`,
          background: `linear-gradient(to right, #ffffff, ${theme.badgeBg})`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="worknet-kicker" style={{ color: theme.accentColor }}>
              {theme.fullName} · Live Workplace Life
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {theme.name} Operations Floor
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Option C Workplace Simulation: interact with departmental colleagues, align with your supervisor, coordinate routine duties, and maintain professional relationships.
            </p>
          </div>
          <span className="worknet-badge">
            <Users size={12} /> {theme.coworkers.length} Active Staff Present
          </span>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('coworkers')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'coworkers' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            NPC Colleagues & Desks ({theme.coworkers.length})
          </button>
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'supervisor' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Supervisor Authority & Reviews
          </button>
          <button
            onClick={() => setActiveTab('duties')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'duties' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Routine Department Duties ({theme.routineDuties.length})
          </button>
          <button
            onClick={() => setActiveTab('lounge')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'lounge' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Break Room & Lounge (☕)
          </button>
        </div>
      </div>

      {/* Tab 1: NPC Colleagues */}
      {activeTab === 'coworkers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theme.coworkers.map(cw => {
              const stats = coworkerStats[cw.id] || {
                trust: cw.trust,
                competence: cw.competence,
                familiarity: cw.familiarity,
                cooperation: cw.cooperation,
                conflictHistory: cw.conflictHistory
              };

              return (
                <div key={cw.id} className="worknet-coworker-card">
                  <div className="flex items-start justify-between">
                    <div className="worknet-cw-header">
                      <div className="worknet-cw-avatar" style={{ borderColor: theme.accentColor, color: theme.accentColor }}>
                        {cw.avatar}
                      </div>
                      <div className="worknet-cw-details">
                        <h4>{cw.name}</h4>
                        <p>{cw.title} · {cw.division}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      cw.status === 'Desk' ? 'bg-emerald-100 text-emerald-800' :
                      cw.status === 'In Field' ? 'bg-blue-100 text-blue-800' :
                      cw.status === 'In Meeting' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {cw.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{cw.quote}"
                  </p>

                  {/* 5 Dimensions of Professional Relationships */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="worknet-dim-bar">
                      <span className="w-24">Trust ({stats.trust}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.trust}%`, background: '#059669' }} />
                      </div>
                    </div>
                    <div className="worknet-dim-bar">
                      <span className="w-24">Competence ({stats.competence}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.competence}%`, background: '#2563eb' }} />
                      </div>
                    </div>
                    <div className="worknet-dim-bar">
                      <span className="w-24">Familiarity ({stats.familiarity}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.familiarity}%`, background: '#7c3aed' }} />
                      </div>
                    </div>
                    <div className="worknet-dim-bar">
                      <span className="w-24">Cooperation ({stats.cooperation}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.cooperation}%`, background: '#0d9488' }} />
                      </div>
                    </div>
                    <div className="worknet-dim-bar">
                      <span className="w-24 text-rose-700">Conflict ({stats.conflictHistory}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.conflictHistory}%`, background: '#e11d48' }} />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onInteractCoworker(cw.id, 'consult', cw.name)}
                      className="worknet-btn-secondary text-[11px] justify-center py-1.5"
                    >
                      Consult Notes
                    </button>
                    <button
                      onClick={() => onInteractCoworker(cw.id, 'assist', cw.name)}
                      className="worknet-btn-secondary text-[11px] justify-center py-1.5"
                    >
                      Offer Help
                    </button>
                    <button
                      onClick={() => onInteractCoworker(cw.id, 'collaborate', cw.name)}
                      className="worknet-btn-primary text-[11px] justify-center py-1.5"
                    >
                      Co-sign Duty
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Supervisor Authority */}
      {activeTab === 'supervisor' && (
        <div className="worknet-card space-y-4">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white"
              style={{ background: theme.accentColor }}
            >
              {supervisor.avatar}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Organizational Authority
              </span>
              <h3 className="text-base font-bold text-slate-900">{supervisor.name}</h3>
              <p className="text-xs text-slate-600">{supervisor.title} · {supervisor.department}</p>
              <p className="text-xs text-slate-700 mt-2">
                <strong>Supervisory Expectations:</strong> {supervisor.expectations}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Historical Approval & Trust Rating</span>
              <span className="font-bold text-emerald-700">{supervisor.approvalRate}% Satisfactory</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Supervisors evaluate procedure rigor, incident remediation notes, and punctuality. Unsafe procedures directly lower your department standing until verified remediation is submitted.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => handleSupervisorCheckin('Shift Priorities & Current Telemetry')}
              className="worknet-btn-secondary justify-center text-xs py-2"
            >
              Request Priority Sync
            </button>
            <button
              onClick={() => handleSupervisorCheckin('Remediation Protocol Review')}
              className="worknet-btn-secondary justify-center text-xs py-2"
            >
              Review Protocol Standards
            </button>
            <button
              onClick={() => handleSupervisorCheckin('Career Pathway Recommendation')}
              className="worknet-btn-primary justify-center text-xs py-2"
            >
              Seek Promotion Recommendation
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Routine Duties */}
      {activeTab === 'duties' && (
        <div className="space-y-3">
          {theme.routineDuties.map(duty => (
            <div key={duty.id} className="worknet-card flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {duty.frequency}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{duty.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{duty.description}</p>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Expected Compensation: {duty.rewardDesc}
                </span>
              </div>
              <button
                onClick={() => onFeedback(`⚡ Began routine duty: "${duty.title}". Telemetry checks calibrated.`)}
                className="worknet-btn-primary text-xs"
              >
                Perform Duty <ChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Break Room */}
      {activeTab === 'lounge' && (
        <div className="worknet-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Coffee size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {theme.shortOrg} Staff Lounge & Watercooler
                </h3>
                <p className="text-xs text-slate-500">
                  A quiet sanctuary to decompress, discuss city news, and restore focus.
                </p>
              </div>
            </div>
            <button
              onClick={onVisitBreakRoom}
              className="worknet-btn-primary text-xs"
            >
              <Coffee size={13} /> Enjoy Restorative Coffee / Tea
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-bold text-slate-800">Watercooler Chatter & Rumors</span>
              <ul className="space-y-1.5 text-slate-600 text-[11px]">
                <li>• "Council is deliberating the next Glassline transit budget allocation."</li>
                <li>• "Faith Medical's Veil research ward just received an updated shipment of BioCompress units."</li>
                <li>• "The Treasury audit team found another variance in regional scholarship outlays."</li>
              </ul>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-bold text-slate-800">Staff Notice Board</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Remember to log out of shared terminals when departing for shift lunch. Please label all personal items in the refrigeration unit.
              </p>
              <p className="text-[10px] text-slate-400">Total break visits recorded: {breakRoomVisitCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
