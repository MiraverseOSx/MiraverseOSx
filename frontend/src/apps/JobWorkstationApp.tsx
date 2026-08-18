import React, { useState, useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useSystemStore } from '../store/useSystemStore';
import { SoundFX } from '../utils/audio';
import { miraverseDb, DGA_DIVISIONS, ORGANIZATIONS } from '../db/miraverseDb';
import { WorknetMission, MissionType } from '../types';
import {
  Briefcase, Activity, ShieldAlert, Search, Radio, CheckCircle2, Clock, 
  Send, Users, MapPin, Truck, AlertTriangle, Play, Pause, RefreshCw, 
  Award, FileText, ChevronRight, DollarSign, Zap, Stethoscope, Compass, Lock,
  Building, BookOpen, Cpu, Sparkles, Key, Landmark, Shield, Terminal, ArrowRight,
  Fingerprint, Layers, Database
} from 'lucide-react';

export type WorkplaceStationId = 
  | 'dga'
  | 'faithmed'
  | 'finance'
  | 'archives'
  | 'diplomat'
  | 'engineer'
  | 'warden'
  | 'artist'
  | 'questnotice';

const STATIONS: { id: WorkplaceStationId; name: string; org: string; icon: any; color: string; bg: string; border: string; desc: string }[] = [
  { id: 'dga', name: 'DGA Tactical Console', org: 'Dept. of Global Affairs', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-950/60', border: 'border-purple-600/40', desc: 'Shield defense, Eyes intelligence & Blackout glitch containment' },
  { id: 'faithmed', name: 'Faith Medical Triage Desk', org: 'Faith Medical Group', icon: Stethoscope, color: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-600/40', desc: 'Clinical intake, Veil exposure stabilization & VITALS diagnostics' },
  { id: 'finance', name: 'Oryn Treasury Terminal', org: 'Oryn Dept. of Finance', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-600/40', desc: 'Ledger audits, salary disbursements, tax records & scholarships' },
  { id: 'archives', name: 'Archival Research Node', org: 'City Library & Royal Society', icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-950/60', border: 'border-cyan-600/40', desc: 'Purge manuscripts, sealed Council files & AETHERCORE codices' },
  { id: 'engineer', name: 'Systems Engineering Deck', org: 'Tech Labs & Infrastructure', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-950/60', border: 'border-blue-600/40', desc: 'Terminal repairs, circuit soldering, PRISM isolation & tool design' },
  { id: 'diplomat', name: 'Council Chambers Desk', org: 'Civic Administration & Council', icon: Building, color: 'text-indigo-400', bg: 'bg-indigo-950/60', border: 'border-indigo-600/40', desc: 'Citizen mediation, regional treaties, dispatches & public hearings' },
  { id: 'warden', name: 'Arcadia Biosphere Post', org: 'Ecological Reserve', icon: Compass, color: 'text-teal-400', bg: 'bg-teal-950/60', border: 'border-teal-600/40', desc: 'Botanical dome assays, flora sampling & environmental health' },
  { id: 'artist', name: 'The Velvet Cultural Studio', org: 'Media & Performance Guild', icon: Sparkles, color: 'text-rose-400', bg: 'bg-rose-950/60', border: 'border-rose-600/40', desc: 'Music performances, visual holographic exhibits & media broadcasts' },
  { id: 'questnotice', name: 'QUESTNOTICE Civic Dispatch', org: 'Aureline Public Notice Board', icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-950/60', border: 'border-yellow-600/40', desc: 'Neighborhood odd jobs, deliveries, errands & rapid civic help' },
];

export default function JobWorkstationApp() {
  const { soundEnabled } = useSystemStore();
  const [activeStation, setActiveStation] = useState<WorkplaceStationId>('dga');
  const [activeMissionType, setActiveMissionType] = useState<string>('All');
  const [missions, setMissions] = useState<WorknetMission[]>(() => miraverseDb.getMissions());
  const [selectedMissionId, setSelectedMissionId] = useState<string>('ms-spec-01');
  const [dgaBranchFilter, setDgaBranchFilter] = useState<'All' | 'Shield' | 'Eyes' | 'Blackout Team'>('All');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const player = useOSStore((s) => s.gameplay.player);
  const addCredits = useOSStore((s) => s.addCredits);
  const addBits = useOSStore((s) => s.addBits);
  const addXP = useOSStore((s) => s.addXP);
  const addCareerXP = useOSStore((s) => s.addCareerXP);

  const clearanceTier = player?.clearanceLevel || (player?.isAdmin ? 5 : 2);
  const currentStationInfo = STATIONS.find((s) => s.id === activeStation) || STATIONS[0];

  const handleAdminResetMissions = () => {
    setMissions(miraverseDb.getMissions().map((m) => ({ ...m, completed: false })));
    setActionFeedback('⚡ [ADMIN] All missions reset to uncompleted state for testing.');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleAdminCompleteAll = () => {
    missions.forEach((m) => {
      if (!m.completed) {
        addCredits(m.rewardCredits);
        if (m.rewardBits) addBits(m.rewardBits);
        addXP(m.rewardXP);
        addCareerXP(m.track, m.rewardXP);
      }
    });
    setMissions((prev) => prev.map((m) => ({ ...m, completed: true })));
    setActionFeedback('⚡ [ADMIN] Executed and resolved all institutional directives.');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleAdminAddFunds = () => {
    addCredits(10000);
    addBits(1000);
    setActionFeedback('⚡ [ADMIN] Granted +10,000 ₢ CREDITS and +1,000 ◈ BITS.');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Filter missions by active workstation & mission type
  const filteredMissions = missions.filter((m) => {
    // Station track matching
    let stationMatch = false;
    if (activeStation === 'dga') stationMatch = m.track === 'dga' || m.department.includes('DGA');
    else if (activeStation === 'faithmed') stationMatch = m.track === 'medical';
    else if (activeStation === 'finance') stationMatch = m.track === 'finance';
    else if (activeStation === 'archives') stationMatch = m.track === 'archivist';
    else if (activeStation === 'engineer') stationMatch = m.track === 'engineer';
    else if (activeStation === 'diplomat') stationMatch = m.track === 'diplomat';
    else if (activeStation === 'warden') stationMatch = m.track === 'warden';
    else if (activeStation === 'artist') stationMatch = m.track === 'artist';
    else if (activeStation === 'questnotice') stationMatch = m.track === 'questnotice' || m.type === 'QUESTNOTICE';
    else stationMatch = true;

    // Mission type matching
    const typeMatch = activeMissionType === 'All' || m.type === activeMissionType;

    // DGA Sub-branch filter
    let branchMatch = true;
    if (activeStation === 'dga' && dgaBranchFilter !== 'All') {
      branchMatch = m.department.includes(dgaBranchFilter);
    }

    return stationMatch && typeMatch && branchMatch;
  });

  const selectedMission = missions.find((m) => m.id === selectedMissionId) || filteredMissions[0] || missions[0];

  const completedCount = missions.filter((m) => m.completed).length;
  const totalCreditsEarned = missions.filter((m) => m.completed).reduce((acc, curr) => acc + curr.rewardCredits, 0);
  const totalBitsEarned = missions.filter((m) => m.completed).reduce((acc, curr) => acc + (curr.rewardBits || 0), 0);

  const handleExecuteMission = (missionId: string) => {
    if (soundEnabled) SoundFX.playButtonTap();
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && !m.completed) {
          addCredits(m.rewardCredits);
          if (m.rewardBits) addBits(m.rewardBits);
          addXP(m.rewardXP);
          addCareerXP(m.track, m.rewardXP);

          if (soundEnabled) SoundFX.playSuccess();
          const bitMsg = m.rewardBits ? ` + ${m.rewardBits} ◈ BITS` : '';
          setActionFeedback(`✅ Assignment Completed: "${m.title}"! Received +${m.rewardCredits} ₢ CREDITS${bitMsg}, and +${m.rewardXP} Career XP.`);
          setTimeout(() => setActionFeedback(null), 5000);
          return { ...m, completed: true };
        }
        return m;
      })
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0A1026]/90 backdrop-blur-xl text-[#F8F6EE] font-ui select-none overflow-hidden border border-white/10 shadow-2xl">
      
      {/* ─── 10.1A UNIFIED FEDERAL WORKNET AUTHENTICATION HEADER ─── */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#142B52]/80 border-b border-white/10 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#254A7A]/40 border border-[#D4B06A]/40 text-[#D4B06A] shadow-[0_0_15px_rgba(212,176,106,0.2)]">
            <Fingerprint size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-ui uppercase bg-[#254A7A] text-[#F0D79A] border border-[#D4B06A]/30 px-2 py-0.5 font-bold rounded tracking-wider shadow-xs">
                WORKNET §10.1A // FEDERAL ACCESS LAYER
              </span>
              <span className="text-[11px] text-[#3EB9A8] font-ui flex items-center gap-1 font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#3EB9A8] animate-ping inline-block" /> AUTHENTICATED
              </span>
              <span className="text-[11px] text-[#C7D2E0] font-ui">
                BCL-{clearanceTier} (Level {player?.level || 1})
              </span>
            </div>
            <h1 className="text-sm font-display font-bold text-[#F8F6EE] mt-0.5 tracking-tight flex items-center gap-2">
              <span>{currentStationInfo.org}</span>
              <ChevronRight size={14} className="text-[#D4B06A]" />
              <span className="text-[#F0D79A] font-semibold">{currentStationInfo.name}</span>
            </h1>
          </div>
        </div>

        {/* Dual Currency & Federal Telemetry */}
        <div className="flex items-center gap-5 text-xs font-ui">
          <div className="text-right">
            <div className="text-[#C7D2E0] text-[10px] uppercase tracking-wider">Primary Currency</div>
            <div className="text-[#D4B06A] font-bold font-ui text-sm flex items-center justify-end gap-1">
              <span>{player?.credits ?? 500}</span>
              <span className="text-[#F0D79A] text-[11px]">₢ CREDITS</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-right">
            <div className="text-[#C7D2E0] text-[10px] uppercase tracking-wider">Secondary Rare Currency</div>
            <div className="text-[#3EB9A8] font-bold font-ui text-sm flex items-center justify-end gap-1">
              <span>{player?.bits ?? 25}</span>
              <span className="text-[#5AA371] text-[11px]">◈ BITS</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-right">
            <div className="text-[#C7D2E0] text-[10px] uppercase tracking-wider">Shift Resolved</div>
            <div className="text-[#3EB9A8] font-bold">{completedCount} / {missions.length}</div>
          </div>
        </div>
      </header>

      {/* ─── ⚡ ROOT ADMIN TESTING & DEBUG TOOLBAR (ADMINS ONLY) ─── */}
      {player?.isAdmin && (
        <div className="flex items-center justify-between px-6 py-2 bg-gradient-to-r from-amber-950/80 via-indigo-950/80 to-purple-950/80 border-b border-amber-500/40 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1">
              <Zap size={11} /> ROOT ADMIN DEBUG PANEL
            </span>
            <span className="text-amber-200 text-[11px]">Unrestricted Access Across All 9 Institutions</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdminResetMissions}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold transition flex items-center gap-1"
              title="Reset all assignments to uncompleted for re-testing"
            >
              <RefreshCw size={12} /> Reset Missions
            </button>
            <button
              onClick={handleAdminCompleteAll}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
              title="Instantly execute all directives and credit rewards"
            >
              <CheckCircle2 size={12} /> Resolve All
            </button>
            <button
              onClick={handleAdminAddFunds}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
              title="Grant +10,000 Credits and +1,000 Bits"
            >
              <DollarSign size={12} /> +10k ₢ / +1k ◈
            </button>
          </div>
        </div>
      )}

      {/* ─── WORKPLACE TERMINAL SELECTOR STRIP ─── */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[#090d1c] border-b border-slate-800 overflow-x-auto scrollbar-none">
        {STATIONS.map((station) => {
          const Icon = station.icon;
          const isActive = activeStation === station.id;
          return (
            <button
              key={station.id}
              onClick={() => {
                if (soundEnabled) SoundFX.playButtonTap();
                setActiveStation(station.id);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                isActive
                  ? `${station.bg} ${station.color} ${station.border} shadow-md font-bold scale-[1.02]`
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={14} className={isActive ? station.color : 'text-slate-500'} />
              <span>{station.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* ─── DGA SUB-BRANCH CONTROLS (IF DGA CONSOLE ACTIVE) ─── */}
      {activeStation === 'dga' && (
        <div className="flex items-center justify-between px-6 py-2 bg-purple-950/30 border-b border-purple-900/40 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-purple-300 font-bold text-[11px]">§10.1B DGA DIVISIONS:</span>
            {(['All', 'Shield', 'Eyes', 'Blackout Team'] as const).map((branch) => (
              <button
                key={branch}
                onClick={() => setDgaBranchFilter(branch)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  dgaBranchFilter === branch
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/40'
                }`}
              >
                {branch}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-purple-300/80">
            Active Nodes: SOC, RRB, PSD, ETG | SIGINT, HUMINT, RGA, CIIS | Blackout
          </div>
        </div>
      )}

      {/* ─── ACTION FEEDBACK TOAST ─── */}
      {actionFeedback && (
        <div className="mx-6 mt-3 px-4 py-2.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs font-mono shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 uppercase">Telemetry Synchronized</span>
        </div>
      )}

      {/* ─── MAIN WORKNET SPLIT INTERFACE ─── */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* LEFT PANE: 10.2 MISSION TAXONOMY & DISPATCH LIST */}
        <div className="w-1/2 flex flex-col bg-[#0f1426] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          
          {/* Mission Type Tab Filters */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900/80 border-b border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {(['All', 'Work Shifts', 'Special Assignments', 'Career Development', 'Field Operations', 'QUESTNOTICE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveMissionType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition ${
                    activeMissionType === type
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-mono ml-2">
              {filteredMissions.length} Available
            </span>
          </div>

          {/* Missions Scroll List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredMissions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No active assignments for this workstation filter. Switch station or mission category.
              </div>
            ) : (
              filteredMissions.map((m) => {
                const isSelected = selectedMission?.id === m.id;
                const isCritical = m.severity === 'Critical';
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (soundEnabled) SoundFX.playButtonTap();
                      setSelectedMissionId(m.id);
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/70 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                            isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {m.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.department}</span>
                        </div>
                        <h4 className={`text-xs font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                          {m.title}
                        </h4>
                      </div>

                      {/* Status / Check */}
                      <div>
                        {m.completed ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/40 text-[10px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> CLEARED
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isCritical ? 'bg-rose-950 text-rose-400 border border-rose-700/40' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {m.severity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reward chips */}
                    <div className="mt-2.5 flex items-center gap-3 text-[11px] font-mono">
                      <span className="text-amber-400 font-bold">+{m.rewardCredits} ₢</span>
                      {m.rewardBits > 0 && (
                        <span className="text-cyan-400 font-bold">+{m.rewardBits} ◈ BITS</span>
                      )}
                      <span className="text-indigo-300">+{m.rewardXP} XP</span>
                      <span className="text-slate-500 text-[10px] ml-auto">{m.location.split('-')[0]}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE MISSION TELEMETRY & ACTION EXECUTION */}
        <div className="w-1/2 flex flex-col bg-[#0f1426] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          {selectedMission ? (
            <div className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4">
              
              {/* Mission Header */}
              <div className="border-b border-slate-800 pb-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded font-bold border border-indigo-700/50">
                    {selectedMission.department}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <MapPin size={13} className="text-indigo-400" /> {selectedMission.location}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-100">
                  {selectedMission.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedMission.description}
                </p>
              </div>

              {/* Subject & Threat Matrix */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Target / Subject</div>
                  <div className="font-semibold text-slate-200">{selectedMission.targetSubject || 'General Institutional Asset'}</div>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Anomaly / Threat Vector</div>
                  <div className="font-semibold text-rose-300">{selectedMission.threatOrSymptom || 'Standard Workplace Procedure'}</div>
                </div>
              </div>

              {/* Permitted Institutional Tools */}
              <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                <div className="text-[10px] text-indigo-300 font-mono uppercase font-bold flex items-center gap-1.5">
                  <Key size={13} /> Permitted Institutional Clearance Tools (§10.1A)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMission.permittedTools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 rounded-lg text-[11px] font-mono flex items-center gap-1"
                    >
                      <Zap size={11} className="text-amber-400" /> {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Execution Protocol Box */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/50 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-indigo-200 font-mono flex items-center gap-1.5">
                  <Terminal size={14} className="text-indigo-400" /> Authorized Execution Directive
                </div>
                <p className="text-xs text-indigo-200/90 leading-relaxed font-mono">
                  {selectedMission.requiredAction}
                </p>
              </div>

              {/* Compensation Summary & Action Button */}
              <div className="mt-auto pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono px-1">
                  <div className="text-slate-400">Total Compensation:</div>
                  <div className="flex items-center gap-3 font-bold">
                    <span className="text-amber-400">+{selectedMission.rewardCredits} ₢ CREDITS</span>
                    {selectedMission.rewardBits > 0 && (
                      <span className="text-cyan-400">+{selectedMission.rewardBits} ◈ BITS</span>
                    )}
                    <span className="text-indigo-300">+{selectedMission.rewardXP} XP ({selectedMission.primaryAttribute})</span>
                  </div>
                </div>

                <button
                  onClick={() => handleExecuteMission(selectedMission.id)}
                  disabled={selectedMission.completed}
                  className={`w-full py-3 rounded-xl font-bold font-mono text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                    selectedMission.completed
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-500/20 active:scale-[0.99]'
                  }`}
                >
                  {selectedMission.completed ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Directive Finalized & Cleared</span>
                    </>
                  ) : (
                    <>
                      <Play size={15} />
                      <span>Execute Work Directive & Claim Payout</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 font-mono text-xs">
              Select an assignment on the left to review operational telemetry and clearance requirements.
            </div>
          )}
        </div>

      </div>

      {/* ─── FOOTER BAR: MERIDION WORKNET PROTOCOL LOG ─── */}
      <footer className="flex items-center justify-between px-6 py-2 bg-[#090d1a] border-t border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span>STATION ID: <strong>WK-M4-{activeStation.toUpperCase()}-09</strong></span>
          <span>•</span>
          <span>LATENCY: <strong>1.4ms (Meridion Mesh)</strong></span>
          <span>•</span>
          <span>GOV DIRECTIVE: <strong>14-B COMPLIANT</strong></span>
        </div>
        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
          <span>FEDERAL EMPLOYMENT ACCESS LAYER</span>
        </div>
      </footer>

    </div>
  );
}
