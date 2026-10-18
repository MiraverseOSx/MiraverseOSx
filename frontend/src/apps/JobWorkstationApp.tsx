import React, { useState, useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useSystemStore } from '../store/useSystemStore';
import { SoundFX } from '../utils/audio';
import { miraverseDb, DGA_DIVISIONS, ORGANIZATIONS } from '../db/miraverseDb';
import { WorknetMission, MissionType } from '../types';
import { WORKNET_DOMAIN_TASKS, evaluateWorknetObjective } from '../gameplay/WorldEventEngine';
import { MaidIdentityService, CanonicalCitizenRecord } from '../services/maidIdentityService';
import {
  getCanonicalCitizens,
  getActiveCitizenContext,
  openCitizenInApp,
  syncFaithMedicalUpdate,
  syncDgaInvestigativeUpdate,
  syncCyacademyOrCivicUpdate,
} from '../integration/citizenBridge';
import {
  Briefcase, Activity, ShieldAlert, Search, Radio, CheckCircle2, Clock, 
  Send, Users, MapPin, Truck, AlertTriangle, Play, Pause, RefreshCw, 
  Award, FileText, ChevronRight, DollarSign, Zap, Stethoscope, Compass, Lock,
  Building, BookOpen, Cpu, Sparkles, Key, Landmark, Shield, Terminal, ArrowRight,
  Fingerprint, Layers, Database, ExternalLink
} from 'lucide-react';

export type WorkplaceStationId = 
  | 'dga'
  | 'faithmed'
  | 'finance'
  | 'archives'
  | 'engineer'
  | 'diplomat'
  | 'warden'
  | 'artist'
  | 'questnotice';

const STATIONS: { id: WorkplaceStationId; name: string; org: string; icon: any; color: string; bg: string; border: string; desc: string }[] = [
  { id: 'dga', name: 'DGA Tactical Console', org: 'Dept. of Global Affairs', icon: Shield, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', desc: 'Shield defense, Eyes intelligence & Blackout glitch containment' },
  { id: 'faithmed', name: 'Faith Medical Triage Desk', org: 'Faith Medical Group', icon: Stethoscope, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Clinical intake, Veil exposure stabilization & VITALS diagnostics' },
  { id: 'finance', name: 'Oryn Treasury Terminal', org: 'Oryn Dept. of Finance', icon: Landmark, color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Ledger audits, salary disbursements, tax records & scholarships' },
  { id: 'archives', name: 'Archival Research Node', org: 'City Library & Royal Society', icon: BookOpen, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', desc: 'Purge manuscripts, sealed Council files & AETHERCORE codices' },
  { id: 'engineer', name: 'Systems Engineering Deck', org: 'Tech Labs & Infrastructure', icon: Cpu, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'Terminal repairs, circuit soldering, PRISM isolation & tool design' },
  { id: 'diplomat', name: 'Council Chambers Desk', org: 'Civic Administration & Council', icon: Building, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', desc: 'Citizen mediation, regional treaties, dispatches & public hearings' },
  { id: 'warden', name: 'Arcadia Biosphere Post', org: 'Ecological Reserve', icon: Compass, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200', desc: 'Botanical dome assays, flora sampling & environmental health' },
  { id: 'artist', name: 'The Velvet Cultural Studio', org: 'Media & Performance Guild', icon: Sparkles, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', desc: 'Music performances, visual holographic exhibits & media broadcasts' },
  { id: 'questnotice', name: 'QUESTNOTICE Civic Dispatch', org: 'Aureline Public Notice Board', icon: Briefcase, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Neighborhood odd jobs, deliveries, errands & rapid civic help' },
];

export default function JobWorkstationApp() {
  const { soundEnabled } = useSystemStore();
  const [activeStation, setActiveStation] = useState<WorkplaceStationId>('dga');
  const [activeMissionType, setActiveMissionType] = useState<string>('All');
  const [baseMissions] = useState<WorknetMission[]>(() => miraverseDb.getMissions());
  const [selectedMissionId, setSelectedMissionId] = useState<string>('ms-spec-01');
  const [dgaBranchFilter, setDgaBranchFilter] = useState<'All' | 'Shield' | 'Eyes' | 'Blackout Team'>('All');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [selectedDomainOptionByMission, setSelectedDomainOptionByMission] = useState<Record<string, string>>({});
  const [canonicalCitizens, setCanonicalCitizens] = useState<CanonicalCitizenRecord[]>(() => {
    MaidIdentityService.ensureDefaultPopulationSeeded();
    return getCanonicalCitizens();
  });
  const [activeCitizenMaid, setActiveCitizenMaid] = useState<string>(() => {
    const ctx = getActiveCitizenContext();
    return ctx?.maid || 'MAID-OR-00481926';
  });

  useEffect(() => {
    const syncPopulation = () => {
      const list = getCanonicalCitizens();
      setCanonicalCitizens(list);
      const ctx = getActiveCitizenContext();
      if (ctx?.maid) setActiveCitizenMaid(ctx.maid);
    };
    window.addEventListener('maid-registry-updated', syncPopulation);
    window.addEventListener('active-citizen-changed', syncPopulation);
    return () => {
      window.removeEventListener('maid-registry-updated', syncPopulation);
      window.removeEventListener('active-citizen-changed', syncPopulation);
    };
  }, []);

  const activeCitizen = canonicalCitizens.find(
    (c) => c.maid === activeCitizenMaid || c.record === activeCitizenMaid
  ) || canonicalCitizens[0];

  const player = useOSStore((s) => s.gameplay.player);
  const addCredits = useOSStore((s) => s.addCredits);
  const addBits = useOSStore((s) => s.addBits);
  const completeWorknetDomainTask = useOSStore((s) => s.completeWorknetDomainTask);
  const completeWorknetMission = useOSStore((s) => s.completeWorknetMission);
  const resetWorknetMissionsAdmin = useOSStore((s) => s.resetWorknetMissionsAdmin);

  const completedMissionIds = player?.completedWorknetMissionIds || [];

  const missions: WorknetMission[] = baseMissions.map((m) => ({
    ...m,
    completed: completedMissionIds.includes(m.id),
  }));

  const clearanceTier = player?.clearanceLevel || (player?.isAdmin ? 5 : 2);
  const currentStationInfo = STATIONS.find((s) => s.id === activeStation) || STATIONS[0];

  // Filter missions by active workstation & mission type
  const filteredMissions = missions.filter((m) => {
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

    const typeMatch = activeMissionType === 'All' || m.type === activeMissionType;

    let branchMatch = true;
    if (activeStation === 'dga' && dgaBranchFilter !== 'All') {
      branchMatch = m.department.includes(dgaBranchFilter);
    }

    return stationMatch && typeMatch && branchMatch;
  });

  const selectedMission = missions.find((m) => m.id === selectedMissionId) || filteredMissions[0] || missions[0];
  const objectiveEval = selectedMission
    ? evaluateWorknetObjective(selectedMission.id, selectedMission.track, player)
    : { verified: false, source: '', requirementText: '' };
  const domainTask = selectedMission ? WORKNET_DOMAIN_TASKS[selectedMission.id] : undefined;
  const isObjectiveVerified = Boolean(selectedMission?.completed || objectiveEval.verified);

  const handleSyncStationToCitizen = () => {
    if (!activeCitizen) return;
    if (activeStation === 'faithmed') {
      syncFaithMedicalUpdate(activeCitizen.maid, {
        medicalSummary: `Faith Medical Triage Desk clearance verified (${new Date().toLocaleDateString()}). Veil exposure baseline normal.`,
      });
      setActionFeedback(`🩺 Logged Faith Medical clinical triage update directly to ${activeCitizen.name} (${activeCitizen.maid}).`);
    } else if (activeStation === 'dga') {
      syncDgaInvestigativeUpdate(activeCitizen.maid, {
        investigativeNote: `DGA Tactical Console (${dgaBranchFilter}) security screening verified (${new Date().toLocaleDateString()}).`,
      });
      setActionFeedback(`🛡️ Logged DGA Tactical screening directly to ${activeCitizen.name} (${activeCitizen.maid}).`);
    } else {
      syncCyacademyOrCivicUpdate(activeCitizen.maid, {
        academicNote: `${currentStationInfo.name} institutional record verified (${new Date().toLocaleDateString()}).`,
      });
      setActionFeedback(`🏛️ Synced ${currentStationInfo.name} record to ${activeCitizen.name} (${activeCitizen.maid}).`);
    }
    setCanonicalCitizens(getCanonicalCitizens());
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const handleRunDomainTask = (missionId: string) => {
    const selectedOptionId = selectedDomainOptionByMission[missionId] || '';
    if (!selectedOptionId) {
      setActionFeedback('⚠️ Select a domain procedure option before executing the assignment task.');
      setTimeout(() => setActionFeedback(null), 3500);
      return;
    }
    if (soundEnabled) SoundFX.playButtonTap();
    const res = completeWorknetDomainTask(missionId, selectedOptionId);
    setActionFeedback(res.ok ? res.message : `⚠️ ${res.message}`);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const handleAdminResetMissions = () => {
    resetWorknetMissionsAdmin();
    setActionFeedback('⚡ [ADMIN] All persistent WorkNet missions & domain objectives reset.');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleAdminCompleteAll = () => {
    missions.forEach((m) => {
      if (!m.completed) {
        const tDef = WORKNET_DOMAIN_TASKS[m.id];
        const validOpt = tDef?.options.find((o) => o.isCorrect);
        if (validOpt) {
          completeWorknetDomainTask(m.id, validOpt.id);
        }
        completeWorknetMission({
          id: m.id,
          rewardCredits: m.rewardCredits,
          rewardBits: m.rewardBits,
          rewardXP: m.rewardXP,
          track: m.track,
          primaryAttribute: m.primaryAttribute,
        });
      }
    });
    setActionFeedback('⚡ [ADMIN] Verified and resolved all institutional directives.');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleAdminAddFunds = () => {
    addCredits(10000);
    addBits(1000);
    setActionFeedback('⚡ [ADMIN] Granted +10,000 ₢ CREDITS and +1,000 ◈ BITS.');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleExecuteMission = (mission: WorknetMission) => {
    if (soundEnabled) SoundFX.playButtonTap();
    const res = completeWorknetMission({
      id: mission.id,
      rewardCredits: mission.rewardCredits,
      rewardBits: mission.rewardBits,
      rewardXP: mission.rewardXP,
      track: mission.track,
      primaryAttribute: mission.primaryAttribute,
    });
    if (!res.ok) {
      setActionFeedback(`⚠️ ${res.reason}`);
      setTimeout(() => setActionFeedback(null), 4500);
      return;
    }
    if (soundEnabled) SoundFX.playSuccess();
    const bitMsg = mission.rewardBits ? ` + ${mission.rewardBits} ◈ BITS` : '';
    setActionFeedback(`✅ Assignment Verified & Completed: "${mission.title}"! Received +${mission.rewardCredits} ₢ CREDITS${bitMsg}, and +${mission.rewardXP} Career XP.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFBFD] text-slate-800 font-ui select-none overflow-hidden">
      
      {/* ─── UNIFIED WORKNET TOP METRICS & INSTITUTION BAR ─── */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shadow-xs">
            <Fingerprint size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-ui uppercase bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 font-bold rounded tracking-wider shadow-xs">
                WORKNET // FEDERAL ACCESS LAYER
              </span>
              <span className="text-[11px] text-emerald-700 font-ui flex items-center gap-1 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" /> AUTHENTICATED
              </span>
              <span className="text-[11px] text-slate-500 font-ui">
                BCL-{clearanceTier} (Level {player?.level || 1})
              </span>
            </div>
            <h1 className="text-sm font-display font-bold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
              <span>{currentStationInfo.org}</span>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-amber-800 font-semibold">{currentStationInfo.name}</span>
            </h1>
          </div>
        </div>

        {/* Dual Currency & Federal Telemetry */}
        <div className="flex items-center gap-5 text-xs font-ui">
          <div className="text-right">
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Primary Currency</div>
            <div className="text-amber-800 font-bold font-ui text-sm flex items-center justify-end gap-1">
              <span>{player?.credits ?? 500}</span>
              <span className="text-amber-600 text-[11px]">₢ CREDITS</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="text-right">
            <div className="text-slate-500 text-[10px] uppercase tracking-wider">Secondary Rare Currency</div>
            <div className="text-emerald-700 font-bold font-ui text-sm flex items-center justify-end gap-1">
              <span>{player?.bits ?? 25}</span>
              <span className="text-emerald-600 text-[11px]">◈ BITS</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── ⚡ ROOT ADMIN TESTING & DEBUG TOOLBAR (ADMINS ONLY) ─── */}
      {player?.isAdmin && (
        <div className="flex items-center justify-between px-6 py-2 bg-amber-50/80 border-b border-amber-200 text-xs font-ui">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-950 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-xs">
              <Zap size={11} /> ROOT ADMIN DEBUG PANEL
            </span>
            <span className="text-amber-900 text-[11px]">Unrestricted Access Across All 9 Institutions</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdminResetMissions}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-bold transition border border-slate-200 flex items-center gap-1 shadow-xs"
              title="Reset all assignments to uncompleted for re-testing"
            >
              <RefreshCw size={12} /> Reset Missions
            </button>
            <button
              onClick={handleAdminCompleteAll}
              className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold transition border border-emerald-200 flex items-center gap-1 shadow-xs"
              title="Instantly execute all directives and credit rewards"
            >
              <CheckCircle2 size={12} /> Resolve All
            </button>
            <button
              onClick={handleAdminAddFunds}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg text-[11px] font-bold transition border border-amber-300 flex items-center gap-1 shadow-xs"
              title="Grant +10,000 Credits and +1,000 Bits"
            >
              <DollarSign size={12} /> +10k ₢ / +1k ◈
            </button>
          </div>
        </div>
      )}

      {/* ─── WORKPLACE TERMINAL SELECTOR STRIP ─── */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-slate-200 overflow-x-auto scrollbar-none">
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-ui whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-amber-50 text-amber-950 border-amber-300 shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-amber-700' : 'text-slate-500'} />
              <span>{station.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* ─── CANONICAL MAID CITIZEN RECORD TRIAGE & INSTITUTIONAL SYNC BAR ─── */}
      {activeCitizen && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2 bg-slate-50 border-b border-slate-200 text-xs font-ui">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded">
              Canonical MAID Citizen Subject
            </span>
            <select
              aria-label="Select canonical MAID citizen for institutional triage"
              value={activeCitizen.maid}
              onChange={(e) => setActiveCitizenMaid(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-purple-600"
            >
              {canonicalCitizens.map((c) => (
                <option key={c.maid} value={c.maid}>
                  {c.name} ({c.maid}) · {c.affiliation}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-600 hidden lg:inline">
              Blood: <strong className="text-slate-800">{activeCitizen.blood}</strong> · Resonance: <strong className="text-slate-800">{activeCitizen.resonance}</strong> · Med: <strong className="text-slate-800">{activeCitizen.medical}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncStationToCitizen}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 size={12} /> Sync {currentStationInfo.name.split(' ')[0]} Log to MAID
            </button>
            <button
              type="button"
              onClick={() => openCitizenInApp(activeCitizen.maid, 'documentStudio', { targetDocId: activeStation === 'faithmed' ? 8 : activeStation === 'dga' ? 5 : 1 })}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
            >
              <FileText size={12} /> {activeStation === 'faithmed' ? 'Medical Record (Doc 8)' : activeStation === 'dga' ? 'DGA Report (Doc 5)' : 'Citizen ID (Doc 1)'}
            </button>
            <button
              type="button"
              onClick={() => openCitizenInApp(activeCitizen.maid, 'meridionRegistry', { targetTab: 'lookup' })}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink size={12} /> Open MAID Dossier
            </button>
          </div>
        </div>
      )}

      {/* ─── DGA SUB-BRANCH CONTROLS (IF DGA CONSOLE ACTIVE) ─── */}
      {activeStation === 'dga' && (
        <div className="flex items-center justify-between px-6 py-2 bg-purple-50/60 border-b border-purple-200 text-xs font-ui">
          <div className="flex items-center gap-2">
            <span className="text-purple-900 font-bold text-[11px]">DGA DIVISIONS:</span>
            {(['All', 'Shield', 'Eyes', 'Blackout Team'] as const).map((branch) => (
              <button
                key={branch}
                onClick={() => setDgaBranchFilter(branch)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  dgaBranchFilter === branch
                    ? 'bg-purple-200 text-purple-950 shadow-xs font-bold border border-purple-300'
                    : 'bg-white text-purple-700 hover:bg-purple-100/70 border border-purple-200/60'
                }`}
              >
                {branch}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-purple-800/80 font-ui">
            Active Nodes: SOC, RRB, PSD, ETG | SIGINT, HUMINT, RGA, CIIS | Blackout Team
          </div>
        </div>
      )}

      {/* ─── ACTION FEEDBACK TOAST ─── */}
      {actionFeedback && (
        <div className="mx-6 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-ui shadow-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionFeedback}</span>
          </div>
          <span className="text-[10px] text-emerald-700 uppercase font-bold">Telemetry Synchronized</span>
        </div>
      )}

      {/* ─── MAIN WORKNET SPLIT INTERFACE ─── */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* LEFT PANE: 10.2 MISSION TAXONOMY & DISPATCH LIST */}
        <div className="w-1/2 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          
          {/* Mission Type Tab Filters */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {(['All', 'Work Shifts', 'Special Assignments', 'Career Development', 'Field Operations', 'QUESTNOTICE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveMissionType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-ui whitespace-nowrap transition ${
                    activeMissionType === type
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-ui ml-2">
              {filteredMissions.length} Available
            </span>
          </div>

          {/* Missions Scroll List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredMissions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-ui text-xs">
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
                        ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-1 ring-amber-300/60 text-slate-900'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-ui uppercase px-1.5 py-0.5 rounded font-bold ${
                            isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-200/70 text-slate-700'
                          }`}>
                            {m.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-ui">{m.department}</span>
                        </div>
                        <h4 className={`text-xs font-bold ${isSelected ? 'text-amber-950 font-bold' : 'text-slate-900'}`}>
                          {m.title}
                        </h4>
                      </div>

                      {/* Status / Check */}
                      <div>
                        {m.completed ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-ui font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> CLEARED
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-ui font-bold ${
                            isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {m.severity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reward chips */}
                    <div className="mt-2.5 flex items-center gap-3 text-[11px] font-ui">
                      <span className="text-amber-800 font-bold">+{m.rewardCredits} ₢</span>
                      {m.rewardBits > 0 && (
                        <span className="text-emerald-700 font-bold">+{m.rewardBits} ◈ BITS</span>
                      )}
                      <span className="text-slate-500">+{m.rewardXP} Career XP</span>
                      <span className="text-slate-400 text-[10px] ml-auto">{m.location.split('-')[0]}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE MISSION TELEMETRY & DOMAIN WORK EXECUTION */}
        <div className="w-1/2 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {selectedMission ? (
            <div className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4">
              
              {/* Mission Header */}
              <div className="border-b border-slate-200 pb-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-ui uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-200">
                    {selectedMission.department}
                  </span>
                  <span className="text-xs text-slate-500 font-ui flex items-center gap-1">
                    <MapPin size={13} className="text-amber-600" /> {selectedMission.location}
                  </span>
                </div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  {selectedMission.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed font-ui">
                  {selectedMission.description}
                </p>
              </div>

              {/* Subject & Threat Matrix */}
              <div className="grid grid-cols-2 gap-3 font-ui text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Target / Subject</div>
                  <div className="font-semibold text-slate-900">{selectedMission.targetSubject || 'General Institutional Asset'}</div>
                </div>
                <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
                  <div className="text-[10px] text-rose-700 uppercase font-semibold">Anomaly / Clinical Presentation</div>
                  <div className="font-semibold text-rose-900">{selectedMission.threatOrSymptom || 'Standard Workplace Procedure'}</div>
                </div>
              </div>

              {/* Permitted Institutional Tools */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-slate-700 font-ui uppercase font-bold flex items-center gap-1.5">
                    <Key size={13} className="text-amber-600" /> Authorized Station Equipment ({selectedMission.track.toUpperCase()})
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isObjectiveVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isObjectiveVerified ? `✓ Verified (${objectiveEval.source || 'Completed'})` : 'Objective Pending'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMission.permittedTools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 border bg-white border-slate-200 rounded-lg text-[11px] font-ui flex items-center gap-1 text-slate-800 shadow-2xs"
                    >
                      <Zap size={11} className="text-amber-600" /> {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Profession-Specific Domain Task & Cross-App Verification Panel */}
              {domainTask && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-amber-950 font-ui flex items-center gap-1.5">
                      <Terminal size={14} className="text-amber-700" /> {domainTask.taskTitle}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isObjectiveVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-amber-900 border border-amber-200'}`}>
                      {isObjectiveVerified ? '✓ Objective Accomplished' : 'Required Domain Task'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-ui">
                    {domainTask.prompt}
                  </p>
                  <div className="text-[11px] text-indigo-800 bg-indigo-50/80 border border-indigo-200/80 rounded-lg px-2.5 py-1.5 font-ui">
                    <strong>Cross-App Integration:</strong> {domainTask.crossAppHint}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {domainTask.options.map((opt) => {
                      const chosen = selectedDomainOptionByMission[selectedMission.id] === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`p-2.5 rounded-xl border text-left text-xs cursor-pointer transition flex items-start gap-2 ${
                            chosen
                              ? 'border-amber-500 bg-amber-100/70 text-amber-950 font-semibold'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`domain-task-${selectedMission.id}`}
                            disabled={isObjectiveVerified}
                            checked={chosen}
                            onChange={() =>
                              setSelectedDomainOptionByMission({
                                ...selectedDomainOptionByMission,
                                [selectedMission.id]: opt.id,
                              })
                            }
                            className="mt-0.5"
                          />
                          <span>{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>

                  {!isObjectiveVerified && (
                    <button
                      type="button"
                      onClick={() => handleRunDomainTask(selectedMission.id)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Perform Domain Procedure & Verify Objective
                    </button>
                  )}
                </div>
              )}

              {/* Compensation Summary & Action Button */}
              <div className="mt-auto pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-ui px-1">
                  <div className="text-slate-500">Total Compensation (-10 Stamina):</div>
                  <div className="flex items-center gap-3 font-bold">
                    <span className="text-amber-800">+{selectedMission.rewardCredits} ₢ CREDITS</span>
                    {selectedMission.rewardBits > 0 && (
                      <span className="text-emerald-700">+{selectedMission.rewardBits} ◈ BITS</span>
                    )}
                    <span className="text-slate-600">+{selectedMission.rewardXP} Career XP ({selectedMission.track})</span>
                  </div>
                </div>

                <button
                  onClick={() => handleExecuteMission(selectedMission)}
                  disabled={selectedMission.completed || !isObjectiveVerified}
                  className={`w-full py-3 rounded-xl font-bold font-ui text-xs transition flex items-center justify-center gap-2 shadow-xs ${
                    selectedMission.completed
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : !isObjectiveVerified
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                      : 'bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-bold border border-amber-300/80 shadow-xs active:scale-[0.99] hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {selectedMission.completed ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Directive Finalized & Cleared (Persisted)</span>
                    </>
                  ) : !isObjectiveVerified ? (
                    <>
                      <Lock size={15} />
                      <span>Complete the Profession Objective Above to Claim Payout</span>
                    </>
                  ) : (
                    <>
                      <Play size={15} />
                      <span>Finalize Verified Directive & Claim Payout</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 font-ui text-xs">
              Select an assignment on the left to review operational telemetry and clearance requirements.
            </div>
          )}
        </div>

      </div>

      {/* ─── FOOTER BAR: MERIDION WORKNET PROTOCOL LOG ─── */}
      <footer className="flex items-center justify-between px-6 py-2 bg-slate-50 border-t border-slate-200 text-[11px] font-ui text-slate-500">
        <div className="flex items-center gap-4">
          <span>STATION ID: <strong>WK-M4-{activeStation.toUpperCase()}-09</strong></span>
          <span>•</span>
          <span>LATENCY: <strong>1.4ms (Meridion Mesh)</strong></span>
          <span>•</span>
          <span>GOV DIRECTIVE: <strong>14-B COMPLIANT</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <span>FEDERAL EMPLOYMENT ACCESS LAYER</span>
        </div>
      </footer>

    </div>
  );
}
