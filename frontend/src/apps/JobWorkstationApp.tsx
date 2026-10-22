import React, { useState, useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useSystemStore } from '../store/useSystemStore';
import { SoundFX } from '../utils/audio';
import { miraverseDb } from '../db/miraverseDb';
import type { WorknetMission } from '../types';
import { evaluateWorknetObjective, evaluateCareerPromotion } from '../gameplay/WorldEventEngine';
import { WORK_DEFINITIONS } from '../gameplay/ActivityEngine';
import WorknetOrderPanel from './WorknetOrderPanel';
import AssignmentBoard from './AssignmentBoard';
import NoticeBoardApp from './NoticeBoardApp';
import { getOpportunity } from '../gameplay/AssignmentFlow';
import type { CanonicalPerson } from '../services/maidIdentityService';
import {
  getCanonicalCitizens,
  getActiveCitizenContext,
  openCitizenInApp,
  syncFaithMedicalUpdate,
  syncDgaInvestigativeUpdate,
  syncCyacademyOrCivicUpdate,
} from '../integration/citizenBridge';
import {
  Briefcase, CheckCircle2, MapPin, Play, FileText, Zap, Stethoscope, Compass, Lock,
  Building, BookOpen, Cpu, Sparkles, Key, Landmark, Shield, ArrowRight, ExternalLink,
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
  const [toolsOpen, setToolsOpen] = useState(false);
  const [discovering, setDiscovering] = useState(true);
  const [showNotices, setShowNotices] = useState(false);
  const workspaceRequest = useOSStore(s => s.workspaceRequests.jobs);
  useEffect(() => {
    if (!workspaceRequest) return;
    setShowNotices(workspaceRequest.section === 'notices');
    if (workspaceRequest.section === 'civic-jobs') { setActiveStation('questnotice'); setDiscovering(false); setToolsOpen(false); }
    useOSStore.getState().consumeWorkspaceRequest('jobs', workspaceRequest.revision);
  }, [workspaceRequest]);
  const selectedOpportunity = useOSStore(state => state.gameplay.player.assignmentJournal?.selectedId);
  const selectionVersion = useOSStore(state => state.gameplay.player.assignmentJournal?.selectionVersion);
  function openMission(id: string) {
    const definition = WORK_DEFINITIONS[id];
    if (!definition) return;
    const station = ({ medical: 'faithmed', archivist: 'archives' } as Record<string, string>)[definition.track] || definition.track;
    setActiveStation(station as WorkplaceStationId);
    setActiveMissionType('All');
    setDgaBranchFilter('All');
    setSelectedMissionId(id);
    setDiscovering(false);
    setShowNotices(false);
    setToolsOpen(false);
  }
  useEffect(() => {
    // An explicit section request takes precedence over the saved assignment selection.
    if (!selectedOpportunity || workspaceRequest) return;
    if (getOpportunity(selectedOpportunity)?.unlock) setDiscovering(true);
    else openMission(selectedOpportunity);
  }, [selectedOpportunity, selectionVersion]);
  const [canonicalCitizens, setCanonicalCitizens] = useState<CanonicalPerson[]>([]);
  const [activeCitizenMaid, setActiveCitizenMaid] = useState<string>(() => getActiveCitizenContext()?.citizenId || 'MAID-OR-00481926');

  useEffect(() => {
    let mounted = true;
    const syncPopulation = async () => {
      try {
        const list = await getCanonicalCitizens();
        if (!mounted) return;
        setCanonicalCitizens(list);
        const context = getActiveCitizenContext();
        if (context?.citizenId) setActiveCitizenMaid(context.citizenId);
      } catch {
        if (mounted) setActionFeedback('Citizen registry unavailable. Assignment work remains available.');
      }
    };
    void syncPopulation();
    window.addEventListener('maid-registry-updated', syncPopulation);
    window.addEventListener('miraverse-citizen-context', syncPopulation);
    return () => {
      mounted = false;
      window.removeEventListener('maid-registry-updated', syncPopulation);
      window.removeEventListener('miraverse-citizen-context', syncPopulation);
    };
  }, []);

  const activeCitizen = canonicalCitizens.find(
    citizen => citizen.maid === activeCitizenMaid || citizen.id === activeCitizenMaid || citizen.legacyRecord === activeCitizenMaid
  ) || canonicalCitizens[0];
  const activeCitizenId = activeCitizen?.maid || activeCitizen?.id || '';

  const player = useOSStore((s) => s.gameplay.player);
  const addCredits = useOSStore((s) => s.addCredits);
  const addBits = useOSStore((s) => s.addBits);
  const cycle = useOSStore((s) => s.gameplay.timeCycleCount);
  const completeWorknetMission = useOSStore((s) => s.completeWorknetMission);
  const requestCareerPromotion = useOSStore((s) => s.requestCareerPromotion);
  const resetWorknetMissionsAdmin = useOSStore((s) => s.resetWorknetMissionsAdmin);

  const stationCareerTrackMap: Record<WorkplaceStationId, string> = {
    dga: 'dga',
    faithmed: 'medical',
    finance: 'finance',
    archives: 'archivist',
    engineer: 'engineer',
    diplomat: 'diplomat',
    warden: 'warden',
    artist: 'artist',
    questnotice: 'questnotice',
  };
  const activeCareerTrack = stationCareerTrackMap[activeStation] || 'dga';
  const careerEval = evaluateCareerPromotion(activeCareerTrack, player);

  const handleRequestPromotion = () => {
    if (soundEnabled) SoundFX.playButtonTap();
    const res = requestCareerPromotion(activeCareerTrack);
    if (res.ok && soundEnabled) SoundFX.playSuccess();
    setActionFeedback(res.ok ? `🎖️ ${res.message}` : `⚠️ ${res.message}`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const completedMissionIds = player?.completedWorknetMissionIds || [];

  const missions: WorknetMission[] = baseMissions.map((m) => ({
    ...m,
    completed: player.worknetOrders?.[m.id]
      ? player.worknetOrders[m.id].status === 'accepted' && (WORK_DEFINITIONS[m.id]?.kind !== 'shift' || m.track === 'medical' || player.worknetOrders[m.id].cycle === cycle)
      : completedMissionIds.includes(m.id) && (WORK_DEFINITIONS[m.id]?.kind !== 'shift' || m.track === 'medical'),
  }));

  const clearanceTier = player?.clearanceLevel ?? (player?.isAdmin ? 5 : 2);
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

  const selectedMission = filteredMissions.find((m) => m.id === selectedMissionId) || filteredMissions[0];
  const objectiveEval = selectedMission
    ? evaluateWorknetObjective(selectedMission.id, selectedMission.track, player)
    : { verified: false, source: '', requirementText: '' };
  const clinicalPayIssued = selectedMission?.id === 'ms-shift-01' && Boolean(player.completedPatientCareIds?.includes('pc-mercer'));
  const canFinalize = Boolean(selectedMission && !selectedMission.completed && player.worknetOrders?.[selectedMission.id]?.status === 'active' && objectiveEval.verified);
  const isObjectiveVerified = Boolean(selectedMission?.completed || objectiveEval.verified);

  const handleSyncStationToCitizen = async () => {
    if (!activeCitizen) return;
    try {
      const note = `${currentStationInfo.name}: workstation record reviewed. Assignment procedures require separate verified work orders.`;
      const result = activeStation === 'faithmed'
        ? await syncFaithMedicalUpdate(activeCitizenId, { medicalSummary: `${activeCitizen.medical} | ${note}` })
        : activeStation === 'dga'
          ? await syncDgaInvestigativeUpdate(activeCitizenId, { investigativeNote: note })
          : await syncCyacademyOrCivicUpdate(activeCitizenId, { academicNote: note });
      setActionFeedback(result.success ? `Workstation note saved for ${activeCitizen.name}.` : result.error || 'Unable to save the workstation note.');
      if (result.success) setCanonicalCitizens(await getCanonicalCitizens());
    } catch {
      setActionFeedback('Unable to synchronize the citizen record. Assignment work is saved separately.');
    }
  };

  const handleAdminResetMissions = () => {
    resetWorknetMissionsAdmin();
    setActionFeedback('⚡ [ADMIN] Procedure plans cleared. Saved work and payout receipts retained.');
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
    const bitMsg = !clinicalPayIssued && mission.rewardBits ? ` + ${mission.rewardBits} ◈ BITS` : '';
    setActionFeedback(`✅ Assignment Verified & Completed: "${mission.title}"! ${clinicalPayIssued ? 'Clinical compensation already issued; chart acceptance recorded.' : `Received +${mission.rewardCredits} ₢ CREDITS${bitMsg}, and +${mission.rewardXP} Career XP.`}`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="worknet-workspace" data-tools-open={toolsOpen} onKeyDown={event => { if (event.key === 'Escape') setToolsOpen(false); }}>
      <header className="worknet-heading">
        <div><span className="workspace-kicker">Federal career network</span><h1>WorkNet<span>/ {showNotices ? 'Civic notices' : discovering ? 'Opportunities & stories' : currentStationInfo.org}</span></h1></div>
        <button className="worknet-discover-toggle" onClick={() => { setShowNotices(false); setDiscovering(showNotices ? true : !discovering); setToolsOpen(false); }}>{showNotices || !discovering ? 'Discover opportunities' : 'Workplace desks'}</button>
        <button className="worknet-discover-toggle" aria-pressed={showNotices} onClick={() => { setShowNotices(true); setToolsOpen(false); }}>Civic notices</button>
        {!discovering && !showNotices && <button className="worknet-tools-toggle" aria-expanded={toolsOpen} aria-controls="worknet-record-tools" onClick={() => setToolsOpen(open => !open)}>{toolsOpen ? 'Close tools' : 'Career & records'}</button>}
        <div className="worknet-balances"><span><small>Credits</small>{(player?.credits ?? 500).toLocaleString()} <i>₢</i></span><span><small>Bits</small>{(player?.bits ?? 25).toLocaleString()} <i>◈</i></span></div>
      </header>
      {showNotices ? <div className="consolidated-body"><NoticeBoardApp/></div> : discovering ? <AssignmentBoard onOpenMission={openMission} /> : <div className="worknet-layout">
        <aside className="worknet-institutions" aria-label="Workplace institutions">
          <div className="workspace-kicker">Your workplaces</div>
          <nav className="worknet-station-list" aria-label="Choose an institution">
            {STATIONS.map(station => {
              const Icon = station.icon;
              const labels = { dga: 'Global Affairs', faithmed: 'Faith Medical', finance: 'Oryn Treasury', archives: 'Royal Archives', engineer: 'Engineering', diplomat: 'Civic Council', warden: 'Arcadia Reserve', artist: 'Cultural Studio', questnotice: 'Civic jobs' };
              return <button key={station.id} aria-label={labels[station.id]} aria-pressed={activeStation === station.id} onClick={() => { setActiveStation(station.id); setActiveMissionType('All'); if (soundEnabled) SoundFX.playButtonTap(); }}><Icon size={16} /><span>{labels[station.id]}</span>{activeStation === station.id && <span className="worknet-current-mark" />}</button>;
            })}
          </nav>
          <div id="worknet-record-tools" className="worknet-record-tools">
          <div className="worknet-career-summary">
            <span className="workspace-kicker">Career standing</span>
            <strong>{careerEval.currentTitle}</strong>
            <p>Rank {careerEval.currentRankIndex} · {careerEval.currentXP} career XP</p>
            <details><summary>Qualifications</summary><div className="worknet-qualifications">{careerEval.pathwayStatuses.map(pathway => <p key={pathway.id}><strong>{pathway.met ? '✓ ' : ''}{pathway.label}</strong><span>{pathway.summary}</span></p>)}</div></details>
            {careerEval.nextTitle && <button className="workspace-text-action" onClick={handleRequestPromotion}>{careerEval.canPromote ? 'Request promotion' : 'Review advancement'} <ArrowRight size={13} /></button>}
          </div>
          {activeCitizen && <details className="worknet-citizen-tools"><summary>Citizen record</summary><label>Active citizen<select aria-label="Select canonical MAID citizen for institutional triage" value={activeCitizenId} onChange={event => setActiveCitizenMaid(event.target.value)}>{canonicalCitizens.map(citizen => <option key={citizen.id} value={citizen.maid || citizen.id}>{citizen.name}</option>)}</select></label><button onClick={handleSyncStationToCitizen}>Save workstation note</button><button onClick={() => openCitizenInApp(activeCitizenId, 'meridionRegistry', { targetTab: 'lookup' })}>Open citizen dossier <ExternalLink size={12} /></button><button onClick={() => openCitizenInApp(activeCitizenId, 'documentStudio', { targetDocId: activeStation === 'faithmed' ? 8 : activeStation === 'dga' ? 5 : 1 })}>Open documents <ExternalLink size={12} /></button></details>}
          {player?.isAdmin && <details className="worknet-admin-tools"><summary>Developer tools</summary><button onClick={handleAdminResetMissions}>Clear procedure plans</button><button onClick={handleAdminAddFunds}>Grant test funds</button></details>}
          <div className="worknet-clearance"><span className="workspace-status-dot" /> Institutional clearance {clearanceTier}</div>
          </div>
        </aside>
        <section className="worknet-queue" aria-label="Assignment queue">
          <header><span className="workspace-kicker">Dispatch queue</span><h2>Assignments <span>{filteredMissions.length.toString().padStart(2, '0')}</span></h2><label className="worknet-filter-label">Show<select aria-label="Assignment category" value={activeMissionType} onChange={event => setActiveMissionType(event.target.value)}>{['All', 'Work Shifts', 'Special Assignments', 'Career Development', 'Field Operations', 'QUESTNOTICE'].map(type => <option key={type}>{type}</option>)}</select></label>{activeStation === 'dga' && <label className="worknet-filter-label">Division<select aria-label="DGA division" value={dgaBranchFilter} onChange={event => setDgaBranchFilter(event.target.value as typeof dgaBranchFilter)}>{['All', 'Shield', 'Eyes', 'Blackout Team'].map(branch => <option key={branch}>{branch}</option>)}</select></label>}</header>
          <div className="worknet-queue-scroll">
            {filteredMissions.length ? filteredMissions.map((mission, index) => <button key={mission.id} className="worknet-queue-row" aria-pressed={selectedMission?.id === mission.id} onClick={() => { setSelectedMissionId(mission.id); if (soundEnabled) SoundFX.playButtonTap(); }}><span className="worknet-row-meta"><span>{mission.type === 'QUESTNOTICE' ? 'Civic quest' : mission.type}</span><span>{mission.completed ? 'Cleared' : mission.severity}</span></span><h3>{mission.title}</h3><p>{mission.location}</p><span className="worknet-row-pay"><strong>{mission.rewardCredits} ₢</strong><span>{mission.rewardXP} XP</span><span className="worknet-row-number">{(index + 1).toString().padStart(2, '0')}</span></span></button>) : <div className="workspace-empty"><Briefcase size={24} /><h3>No assignments here yet.</h3><p>Choose another institution or adjust the queue filter.</p></div>}
          </div>
        </section>
        <main className="worknet-detail" aria-label="Selected assignment">
          {actionFeedback && <div className="worknet-feedback" role="status"><span>{actionFeedback}</span><button aria-label="Dismiss update" onClick={() => setActionFeedback(null)}>×</button></div>}
          {selectedMission ? <div className="worknet-detail-scroll" key={selectedMission.id}>
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

              <details className="text-xs font-ui text-slate-700">
                <summary className="cursor-pointer font-semibold">Subject and authorized equipment</summary>
                <div className="space-y-3 pt-3">
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

                </div>
              </details>

              <WorknetOrderPanel key={selectedMission.id} missionId={selectedMission.id} onFeedback={setActionFeedback} />

              {/* Compensation Summary & Action Button */}
              <div className="mt-auto pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-ui px-1">
                  <div className="text-slate-500">On acceptance · 10 stamina</div>
                  <div className="flex items-center gap-3 font-bold">
                    <span className="text-amber-800">+{clinicalPayIssued ? 0 : selectedMission.rewardCredits} ₢ CREDITS</span>
                    {!clinicalPayIssued && selectedMission.rewardBits > 0 && (
                      <span className="text-emerald-700">+{selectedMission.rewardBits} ◈ BITS</span>
                    )}
                    <span className="text-slate-600">+{clinicalPayIssued ? 0 : selectedMission.rewardXP} Career XP ({selectedMission.track})</span>
                  </div>
                </div>

                <button
                  onClick={() => handleExecuteMission(selectedMission)}
                  disabled={!canFinalize}
                  className={`w-full py-3 rounded-xl font-bold font-ui text-xs transition flex items-center justify-center gap-2 shadow-xs ${
                    selectedMission.completed
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : !canFinalize
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                      : 'bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-bold border border-amber-300/80 shadow-xs active:scale-[0.99] hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {selectedMission.completed ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Work order accepted</span>
                    </>
                  ) : !canFinalize ? (
                    <>
                      <Lock size={15} />
                      <span>Complete required work before submitting</span>
                    </>
                  ) : (
                    <>
                      <Play size={15} />
                      <span>Submit work order & receive pay</span>
                    </>
                  )}
                </button>
              </div>


          </div> : <div className="workspace-empty"><FileText size={26} /><h3>Your next assignment starts here.</h3><p>Select an assignment to review the work.</p></div>}
        </main>
      </div>}
    </div>
  );
}
