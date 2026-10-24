import React, { useState, useMemo } from 'react';
import {
  Briefcase, Search, MapPin, Key, Zap, CheckCircle2, Lock, Play, FileText, ArrowRight, Compass
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
import { INSTITUTIONAL_REGISTRY } from '../worknetData';

interface WorknetOpportunitiesProps {
  activeStation: WorkplaceStationId;
  selectedMissionId: string;
  onSelectMission: (id: string) => void;
  onFeedback: (msg: string) => void;
}

export default function WorknetOpportunities({
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
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  return (
    <div className="worknet-two-panel">
      {/* Left Panel: Search & Opportunities List */}
      <aside className="worknet-panel-left" aria-label="Opportunity directory">
        <div className="worknet-search-box">
          <input
            type="search"
            placeholder="Search opportunities, titles, keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              aria-label="Filter by Institution"
              value={stationFilter}
              onChange={e => setStationFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded bg-white text-slate-800 text-[11px]"
            >
              <option value="all">All Institutions</option>
              {Object.values(INSTITUTIONAL_REGISTRY).map(inst => (
                <option key={inst.id} value={inst.id}>{inst.shortOrg}</option>
              ))}
            </select>
            <select
              aria-label="Filter by Category"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded bg-white text-slate-800 text-[11px]"
            >
              <option value="All">All Categories</option>
              <option value="Work Shifts">Work Shifts</option>
              <option value="Special Assignments">Special Assignments</option>
              <option value="Career Development">Career Development</option>
              <option value="Field Operations">Field Operations</option>
              <option value="QUESTNOTICE">QUESTNOTICE</option>
            </select>
          </div>
        </div>

        <div className="worknet-opp-list">
          {filteredMissions.map((mission, idx) => {
            const isSelected = selectedMission?.id === mission.id;
            const isCompleted = mission.completed;
            const orderStatus = player.worknetOrders?.[mission.id]?.status;

            return (
              <button
                key={mission.id}
                data-selected={isSelected}
                className="worknet-opp-item"
                onClick={() => {
                  onSelectMission(mission.id);
                  if (soundEnabled) SoundFX.playButtonTap();
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {mission.type} · {mission.department}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : orderStatus === 'active'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isCompleted ? 'Cleared' : orderStatus === 'active' ? 'In Progress' : mission.severity}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{mission.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{mission.location}</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <span>+{mission.rewardCredits} ₢</span>
                    <span>+{mission.rewardXP} XP</span>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredMissions.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              <Briefcase size={28} className="mx-auto mb-2 opacity-40" />
              <p>No matching opportunities found.</p>
              <p className="text-[11px] mt-1">Try resetting the search or selecting another institution.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel: Selected Opportunity & Playable Work Order */}
      <main className="worknet-panel-right" aria-label="Selected opportunity detail">
        {selectedMission ? (
          <div className="space-y-4 max-w-3xl">
            {/* Header Block */}
            <div className="border-b border-slate-200 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  {selectedMission.department}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <MapPin size={13} className="text-amber-600" /> {selectedMission.location}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {selectedMission.title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedMission.description}
              </p>
            </div>

            {/* Target Subject & Technical Specifications */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Target / Subject</span>
                <p className="font-semibold text-slate-900">{selectedMission.targetSubject || 'Institutional Asset'}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Threat / Anomaly Matrix</span>
                <p className="font-semibold text-rose-900">{selectedMission.threatOrSymptom || 'Standard Workplace Procedure'}</p>
              </div>
            </div>

            {/* Authorized Tools Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-700 flex items-center gap-1.5">
                  <Key size={12} className="text-amber-600" /> Authorized Station Tools ({selectedMission.track.toUpperCase()})
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isObjectiveVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isObjectiveVerified ? `✓ Verified (${objectiveEval.source || 'Completed'})` : 'Objective Pending'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedMission.permittedTools.map(tool => (
                  <span
                    key={tool}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-800 flex items-center gap-1"
                  >
                    <Zap size={11} className="text-amber-600" /> {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* The Full Interactive Work Order Panel */}
            <div className="border border-slate-200 rounded-xl p-4 bg-[#fafcfa]">
              <WorknetOrderPanel
                key={selectedMission.id}
                missionId={selectedMission.id}
                onFeedback={onFeedback}
              />
            </div>

            {/* Compensation & Final Submit Footer */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500">Requires 10 stamina on finalization</span>
                <div className="flex items-center gap-3 font-bold">
                  <span className="text-amber-900">+{clinicalPayIssued ? 0 : selectedMission.rewardCredits} ₢ CREDITS</span>
                  {!clinicalPayIssued && selectedMission.rewardBits > 0 && (
                    <span className="text-emerald-700">+{selectedMission.rewardBits} ◈ BITS</span>
                  )}
                  <span className="text-slate-600">+{clinicalPayIssued ? 0 : selectedMission.rewardXP} Career XP ({selectedMission.track})</span>
                </div>
              </div>

              <button
                onClick={() => handleExecuteMission(selectedMission)}
                disabled={!canFinalize}
                className={`w-full py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 ${
                  selectedMission.completed
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : !canFinalize
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs active:scale-[0.99]'
                }`}
              >
                {selectedMission.completed ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Work Order Finalized & Cleared</span>
                  </>
                ) : !canFinalize ? (
                  <>
                    <Lock size={14} />
                    <span>Complete required work stages above before final submission</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>Submit Work Order & Issue Compensation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            <FileText size={32} className="mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-sm text-slate-800">No Opportunity Selected</h3>
            <p className="mt-1">Select an opportunity from the list on the left to review terms and perform work.</p>
          </div>
        )}
      </main>
    </div>
  );
}
