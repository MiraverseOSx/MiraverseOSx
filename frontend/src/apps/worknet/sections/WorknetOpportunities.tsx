import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Briefcase, Search, MapPin, Key, Zap, CheckCircle2, Lock, Play, FileText, ArrowRight, Compass, Clock, Coins, Shield, Building2, FolderOpen, ChevronRight, CircleHelp
} from 'lucide-react';
import { useOSStore } from '../../../store/useOSStore';
import { useSystemStore } from '../../../store/useSystemStore';
import { SoundFX } from '../../../utils/audio';
import { miraverseDb } from '../../../db/miraverseDb';
import type { WorknetMission } from '../../../types';
import { WORK_DEFINITIONS } from '../../../gameplay/ActivityEngine';
import { evaluateWorknetObjective } from '../../../gameplay/WorldEventEngine';
import WorknetOrderPanel from '../../WorknetOrderPanel';
import type { WorkplaceStationId } from '../../JobWorkstationApp';
import type { WorknetTabId } from '../useWorknetState';
import { stationTrack } from '../workplaceModel';
import { INSTITUTIONAL_REGISTRY } from '../worknetData';

interface WorknetOpportunitiesProps {
  onNavigate?: (section: WorknetTabId) => void;
  onOpenDepartment?: (station: WorkplaceStationId) => void;
  activeStation: WorkplaceStationId;
  selectedMissionId: string;
  onSelectMission: (id: string) => void;
  onFeedback: (msg: string) => void;
}

export default function WorknetOpportunities({
  onNavigate,
  onOpenDepartment,
  activeStation,
  selectedMissionId,
  onSelectMission,
  onFeedback
}: WorknetOpportunitiesProps) {
  const { soundEnabled } = useSystemStore();
  const player = useOSStore(s => s.gameplay.player);
  const cycle = useOSStore(s => s.gameplay.timeCycleCount);
  const completeWorknetMission = useOSStore(s => s.completeWorknetMission);

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stationFilter, setStationFilter] = useState<string>(activeStation);
  const detailScroll = useRef<HTMLElement | null>(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  useEffect(() => { setStationFilter(activeStation); }, [activeStation]);

  const baseMissions = useMemo(() => miraverseDb.getMissions(), []);
  const completedIds = player?.completedWorknetMissionIds || [];

  const missions: WorknetMission[] = useMemo(() => {
    return baseMissions.map(m => ({
      ...m,
      completed: player.worknetOrders?.[m.id]
        ? player.worknetOrders[m.id].status === 'accepted' && (WORK_DEFINITIONS[m.id]?.kind !== 'shift' || m.track === 'medical' || player.worknetOrders[m.id].cycle === cycle)
        : completedIds.includes(m.id) && (WORK_DEFINITIONS[m.id]?.kind !== 'shift' || m.track === 'medical')
    }));
  }, [baseMissions, player.worknetOrders, completedIds, cycle]);

  const filteredMissions = useMemo(() => {
    return missions.filter(m => {
      // Station / track filter
      let stationMatch = true;
      if (stationFilter !== 'all') {
        if (stationFilter === 'dga') stationMatch = m.track === 'dga' || m.department.includes('DGA');
        else if (stationFilter === 'faithmed') stationMatch = m.track === 'medical';
        else if (stationFilter === 'finance') stationMatch = m.track === 'finance';
        else if (stationFilter === 'archives') stationMatch = m.track === 'archivist';
        else if (stationFilter === 'engineer') stationMatch = m.track === 'engineer';
        else if (stationFilter === 'diplomat') stationMatch = m.track === 'diplomat';
        else if (stationFilter === 'warden') stationMatch = m.track === 'warden';
        else if (stationFilter === 'artist') stationMatch = m.track === 'artist';
        else if (stationFilter === 'questnotice') stationMatch = m.track === 'questnotice' || m.type === 'QUESTNOTICE';
      }

      // Category filter
      const categoryMatch = categoryFilter === 'All' || m.type === categoryFilter;

      // Search query
      const queryMatch = searchQuery.trim() === '' ||
        `${m.title} ${m.department} ${m.description} ${m.location} ${m.track}`.toLowerCase().includes(searchQuery.toLowerCase());

      return stationMatch && categoryMatch && queryMatch;
    });
  }, [missions, stationFilter, categoryFilter, searchQuery]);

  const selectedMission = useMemo(() => {
    return filteredMissions.find(m => m.id === selectedMissionId) || filteredMissions[0];
  }, [filteredMissions, selectedMissionId]);

  const objectiveEval = selectedMission
    ? evaluateWorknetObjective(selectedMission.id, selectedMission.track, player)
    : { verified: false, source: '', requirementText: '' };

  const clinicalPayIssued = selectedMission?.id === 'ms-shift-01' && Boolean(player.completedPatientCareIds?.includes('pc-mercer'));
  const canFinalize = Boolean(
    selectedMission &&
    !selectedMission.completed &&
    player.worknetOrders?.[selectedMission.id]?.status === 'active' &&
    objectiveEval.verified
  );
  const isObjectiveVerified = Boolean(selectedMission?.completed || objectiveEval.verified);

  const handleExecuteMission = (mission: WorknetMission) => {
    if (soundEnabled) SoundFX.playButtonTap();
    const res = completeWorknetMission({
      id: mission.id,
      rewardCredits: mission.rewardCredits,
      rewardBits: mission.rewardBits,
      rewardXP: mission.rewardXP,
      track: mission.track,
      primaryAttribute: mission.primaryAttribute
    });

    if (!res.ok) {
      onFeedback(`⚠️ ${res.reason}`);
      return;
    }

    if (soundEnabled) SoundFX.playSuccess();
    const bitMsg = !clinicalPayIssued && mission.rewardBits ? ` + ${mission.rewardBits} ◈ BITS` : '';
    onFeedback(
      `✅ Assignment Verified & Finalized: "${mission.title}"! ${
        clinicalPayIssued
          ? 'Clinical compensation already issued; chart acceptance recorded.'
          : `Received +${mission.rewardCredits} ₢ CREDITS${bitMsg}, and +${mission.rewardXP} Career XP.`
      }`
    );
  };

  const definition = selectedMission ? WORK_DEFINITIONS[selectedMission.id] : undefined;
  const organization = Object.values(INSTITUTIONAL_REGISTRY).find(o => stationTrack(o.id) === selectedMission?.track) || INSTITUTIONAL_REGISTRY[activeStation];
  const art = (mission: WorknetMission) => mission.id === 'ms-case-002' ? '/images/worknet/depository.png' : /subway|junction|relay|tunnel/i.test(`${mission.title} ${mission.location}`) ? '/images/worknet/transit-junction.png' : '';
  const selectedOrder = selectedMission ? player.worknetOrders?.[selectedMission.id] : undefined;
  const status = selectedMission?.completed ? 'Completed' : selectedOrder?.status === 'active' ? 'In progress' : 'Available';
  useEffect(() => { setDetailTab('overview'); detailScroll.current?.scrollTo({ top: 0 }); }, [selectedMission?.id]);
  const showWork = () => setDetailTab('deliverables');
  return <div className="worknet-two-panel wn-editorial-browser">
    <aside className="worknet-panel-left" aria-label="Opportunity directory">
      <div className="worknet-search-box"><span className="worknet-kicker">WORKNET / VERSENET</span><h2>Find your next <br/>chapter.</h2><p>A shift, a small favor, or a story worth following.</p><label className="wn-search-field"><Search size={17}/><input aria-label="Search opportunities" type="search" placeholder="Search opportunities, workplaces, or skills…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></label>
      <div className="wn-browser-filters"><select aria-label="Filter by Institution" value={stationFilter} onChange={e=>setStationFilter(e.target.value)}><option value="all">All institutions</option>{Object.values(INSTITUTIONAL_REGISTRY).map(o=><option value={o.id} key={o.id}>{o.shortOrg}</option>)}</select><select aria-label="Filter by Category" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value="All">All opportunities</option>{['Work Shifts','Special Assignments','Career Development','Field Operations','QUESTNOTICE'].map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="wn-category-pills" aria-label="Opportunity types">{[['All','All'],['Missions','Special Assignments'],['Quests','QUESTNOTICE'],['Jobs','Work Shifts'],['Fieldwork','Field Operations']].map(([label,value])=><button aria-pressed={categoryFilter===value} key={value} onClick={()=>setCategoryFilter(value)}>{label}</button>)}</div></div>
      <div className="wn-list-count"><strong>Opportunities ({filteredMissions.length})</strong><span>By institution</span></div>
      <div className="worknet-opp-list">{filteredMissions.map(m=>{const order=player.worknetOrders?.[m.id];const image=art(m);return <button key={m.id} aria-pressed={selectedMission?.id===m.id} data-selected={selectedMission?.id===m.id} className="worknet-opp-item" onClick={()=>{onSelectMission(m.id);if(soundEnabled)SoundFX.playButtonTap();}}>
        {image ? <img className="wn-list-art" src={image} alt="" loading="lazy"/> : <span className="wn-list-art wn-art-placeholder"><Briefcase size={25}/></span>}<span className="wn-list-copy"><span className="wn-list-eyebrow">{m.type} · {m.track}</span><strong>{m.title}</strong><span className="wn-list-location"><MapPin size={12}/>{m.location}</span><span className="wn-list-pay"><Coins size={13}/>{m.rewardCredits} credits <span>◇ {m.rewardXP} career XP</span></span><span className={`wn-list-status ${m.completed ? 'is-complete' : order?.status==='active' ? 'is-progress' : m.severity==='Critical' ? 'is-urgent' : ''}`}>{m.completed?'✓ Completed':order?.status==='active'?'● In progress':m.severity==='Critical'?'● Critical':'Available'}</span></span><ChevronRight className="wn-list-chevron" size={16}/>
      </button>})}{!filteredMissions.length&&<div className="wn-empty"><Briefcase/><div><strong>No matching opportunities</strong><p>Try another institution or reset the search.</p><button className="wn-text-link" onClick={()=>{setSearchQuery('');setCategoryFilter('All');setStationFilter('all');}}>Reset filters</button></div></div>}</div>
    </aside>
    <main ref={detailScroll} className="worknet-panel-right" aria-label="Selected opportunity detail">{selectedMission ? <div className="wn-assignment-detail">
      <div className="wn-scope-trail"><div><span>Journey <ChevronRight/> Adventure <ChevronRight/> Mission <ChevronRight/> Quest <ChevronRight/> Task</span><p>Layers of scope. Activities can connect without requiring every layer.</p></div><button title="Open briefing in VAULT" aria-label="Open briefing in VAULT" onClick={()=>{useOSStore.getState().saveAssignmentBriefing(selectedMission.id);useOSStore.getState().openAssignmentFiles(selectedMission.id);}}><FolderOpen size={18}/></button></div>
      <section className="wn-assignment-hero"><div><div className="wn-hero-label"><span>{selectedMission.type} / {organization.name}</span><span className={`wn-status ${selectedMission.completed?'is-positive':''}`}>{status}</span></div><h2>{selectedMission.title}</h2><p>{selectedMission.description}</p></div>{art(selectedMission)&&<figure><img src={art(selectedMission)} alt={`Illustrative location artwork for ${selectedMission.title}`}/><figcaption>Illustrative location artwork</figcaption></figure>}</section>
      <div className="wn-assignment-meta"><div><MapPin/><span><small>Location</small><strong>{selectedMission.location}</strong></span></div><div><Coins/><span><small>Compensation</small><strong>{selectedMission.rewardCredits} credits</strong><span>{selectedMission.rewardXP} career XP{selectedMission.rewardBits ? ` · ${selectedMission.rewardBits} bits` : ''}</span></span></div><div><Clock/><span><small>Work structure</small><strong>{selectedMission.id === 'ms-case-002' ? 'Six evidence sources' : definition?.stages.length ? `${definition.stages.length} stages` : 'Assignment briefing'}</strong><span>Flexible schedule</span></span></div><div><Shield/><span><small>Access</small><strong>Clearance {definition?.clearance ?? organization.clearanceRequired}+</strong><span>Existing permissions apply</span></span></div></div>
      <nav className="wn-detail-tabs" aria-label="Assignment sections">{[['overview','Overview'],['objectives','Objectives'],['requirements','Requirements'],['deliverables','Saved work'],['rewards','Rewards'],['related','Related opportunities']].map(([value,label])=><button key={value} aria-current={detailTab===value?'page':undefined} onClick={()=>setDetailTab(value)}>{label}</button>)}</nav>
      <div className="wn-detail-layout"><div className="wn-detail-body">
        {(detailTab==='overview'||detailTab==='objectives')&&<><section><h3>{detailTab==='overview'?'About this assignment':'Assignment objectives'}</h3><p>{selectedMission.description}</p>{selectedMission.requiredAction&&<p>{selectedMission.requiredAction}</p>}</section><section><h3>Key objectives</h3>{definition?.stages.length ? <ol className="wn-objective-list">{definition.stages.map(stage=><li key={stage.id}><strong>{stage.title}</strong>{detailTab==='objectives'&&<p>{stage.brief}</p>}</li>)}</ol> : <p>{selectedMission.id === 'ms-case-002' ? 'Follow the case briefing, acquire the six sources, request witness clarification, and submit supported findings. Your evidence notebook tracks the remaining objectives.' : 'Review the assignment briefing and complete its published deliverables. Your work-order reader tracks accepted stages and remaining requirements.'}</p>}</section></>}
        {detailTab==='requirements'&&<><section><h3>Responsibilities & access</h3><p>Clearance {definition?.clearance ?? organization.clearanceRequired} or above is required. Accepting work does not issue credentials or bypass source access checks.</p><p>{definition?.kind==='shift'?'A division employment contract is required for this shift. Review and accept terms in Career Record.':'Review the assignment briefing and any institutional access requirements before starting.'}</p><p>{selectedMission.targetSubject && `Subject: ${selectedMission.targetSubject}`}</p></section><section><h3>Authorized tools</h3><div className="wn-tool-tags">{selectedMission.permittedTools.map(t=><span key={t}><Key size={13}/>{t}</span>)}</div><p>{selectedMission.threatOrSymptom}</p></section></>}
        <section hidden={detailTab!=='deliverables'} className="wn-saved-work"><h3>Assignment briefing & saved work</h3><WorknetOrderPanel key={selectedMission.id} missionId={selectedMission.id} onFeedback={onFeedback}/><div className="wn-finalize"><p>Finalization costs 10 stamina. Reading, downloading, and reviewing documents do not pay additional rewards.</p><button disabled={!canFinalize} onClick={()=>handleExecuteMission(selectedMission)} className="worknet-btn-primary">{selectedMission.completed?'Work already finalized':canFinalize?'Submit work & issue compensation':'Complete required work before final submission'}<ArrowRight size={15}/></button></div></section>
        {detailTab==='rewards'&&<section><h3>Compensation & completion</h3><p>{clinicalPayIssued?'Clinical compensation has already been issued. Chart acceptance creates no second payment.':`${selectedMission.rewardCredits} credits, ${selectedMission.rewardXP} career XP${selectedMission.rewardBits?`, and ${selectedMission.rewardBits} bits`:''} are issued after verified completion.`}</p><p>Payment is tied to the existing work receipt. Returning to this reader, switching themes, or revisiting the briefing does not issue another reward.</p><button className="worknet-btn-secondary" onClick={showWork}>Review saved work <ArrowRight size={14}/></button></section>}
        {detailTab==='related'&&<section><h3>More from {organization.shortOrg}</h3>{missions.filter(m=>m.id!==selectedMission.id&&m.track===selectedMission.track).map(m=><button className="wn-related-link" key={m.id} onClick={()=>{setCategoryFilter('All');setSearchQuery('');setStationFilter(organization.id);onSelectMission(m.id);}}><span>{m.title}<small>{m.location}</small></span><ArrowRight size={15}/></button>)}{!missions.some(m=>m.id!==selectedMission.id&&m.track===selectedMission.track)&&<p>No other published opportunities for this division.</p>}</section>}
      </div><aside className="wn-detail-actions"><button className="worknet-btn-primary" onClick={showWork}>{selectedOrder?.status==='active'?'Continue saved work':'Review assignment & employment terms'}<ArrowRight size={17}/></button><div className="wn-status-card"><span className="worknet-kicker">Assignment status</span><strong>{status}</strong><p>{selectedMission.completed?'Your completion receipt is retained.':selectedOrder?.status==='active'?'Your work is saved. Continue to complete the deliverables.':'Review responsibilities and requirements before accepting.'}</p></div><button className="wn-resource-card" onClick={()=>onOpenDepartment?.(organization.id)}><Building2/><span><small>Participating department</small><strong>{organization.name}</strong><span>{organization.shortOrg}</span></span><ChevronRight size={17}/></button><button className="wn-resource-card" onClick={()=>onNavigate?.('career-record')}><CircleHelp/><span><small>Need help getting started?</small><strong>Qualifications & employment</strong><span>Open your career record</span></span><ArrowRight size={16}/></button></aside></div>
    </div> : <div className="wn-empty"><FileText/><div><h3>No opportunity selected</h3><p>Choose a listing to review its responsibilities and saved work.</p></div></div>}</main>
  </div>;
}
