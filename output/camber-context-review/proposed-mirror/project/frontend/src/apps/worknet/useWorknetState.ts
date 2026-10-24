import { useState, useEffect, useMemo } from 'react';
import type { WorkplaceStationId } from '../JobWorkstationApp';
import { useOSStore } from '../../store/useOSStore';
import { restoreWorkplace, workTick } from './workplaceModel';
export type WorknetTabId = 'overview' | 'opportunities' | 'my-work' | 'workplace' | 'career-record' | 'schedule' | 'civic-notices' | 'departments';
export interface CoworkerStats { trust: number; competence: number; familiarity: number; cooperation: number; conflictHistory: number; lastInteraction?: string; status: 'Desk' | 'In Field' | 'In Meeting' | 'On Break'; }
export interface LeaveRequest { id: string; shiftId: string; stationId: WorkplaceStationId; reason: string; status: 'Approved' | 'Pending' | 'Rejected'; requestedAt: string; responseNote?: string; }
export interface DivisionBudget { total: number; equipment: number; training: number; surge: number; merit?: number; }
const STORAGE_KEY = 'miraverse_worknet_state_v2';
function legacyWorkplace() {
  const fields = { coworkers: 'coworkerStats', schedule: 'scheduleItems', leaves: 'leaveRequests', resolved_events: 'resolvedEventIds', delegated: 'delegatedTasks', sub_leaves: 'subordinateLeaves', budgets: 'divisionBudgets' };
  const result: any = {};
  for (const [suffix, key] of Object.entries(fields)) { try { const raw = localStorage.getItem(`${STORAGE_KEY}_${suffix}`); if (raw) result[key] = JSON.parse(raw); } catch {} }
  return result;
}
export function useWorknetState() {
  const [activeStation, setActiveStation] = useState<WorkplaceStationId>('dga');
  const [activeTab, setActiveTab] = useState<WorknetTabId>('overview');
  const [selectedMissionId, setSelectedMissionId] = useState('ms-spec-01');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const raw = useOSStore(s => s.gameplay.player.worknetWorkplace);
  const cycle = useOSStore(s => s.gameplay.timeCycleCount), segment = useOSStore(s => s.gameplay.timeSegmentIndex);
  const workplaceAction = useOSStore(s => s.worknetWorkplaceAction);
  const tick = workTick({ timeCycleCount: cycle, timeSegmentIndex: segment });
  const workplace = useMemo(() => restoreWorkplace(raw, tick), [raw, tick]);
  useEffect(() => { workplaceAction(raw ? { type: 'tick' } : { type: 'initialize', legacy: legacyWorkplace() }); }, [tick, workplaceAction, !!raw]);
  const showFeedback = (message: string) => setActionFeedback(message);
  const act = (action: any) => { const result = workplaceAction(action); if (result.message) showFeedback(result.message); return result; };
  return { activeStation, setActiveStation, activeTab, setActiveTab, selectedMissionId, setSelectedMissionId, actionFeedback, setActionFeedback, showFeedback, ...workplace,
    interactWithCoworker: (person: string, kind: string) => act({ type: 'interact', person, kind }),
    cycleCoworkerStatus: () => showFeedback('Availability follows game time. Advance time to refresh the work segment.'),
    delegateTaskToCoworker: (taskId: string, person: string) => act({ type: 'delegate', taskId, person }),
    openDelegatedDocket: (id: string) => act({ type: 'open-docket', id }),
    reviewDelegatedDocket: (id: string, approved: boolean) => act({ type: 'review-docket', id, approved }),
    reviewSubordinateLeave: (id: string, approved: boolean) => act({ type: 'review-leave', id, approved }),
    updateDivisionBudget: (station: WorkplaceStationId, equipment: number, training: number, surge: number) => act({ type: 'budget', station, equipment, training, surge }),
    claimBaseStipends: () => showFeedback(useOSStore.getState().claimCycleStipends().message),
    selectPathway: (track: string, pathway: 'specialist' | 'supervisor') => showFeedback(useOSStore.getState().setCareerPathwayChoice(track, pathway).message),
    resolveDynamicWorkplaceEvent: (id: string) => act({ type: 'event', id }),
    requestLeave: (id: string, reason: string) => act({ type: 'request-leave', id, reason }),
    visitBreakRoom: () => act({ type: 'break' }) };
}
