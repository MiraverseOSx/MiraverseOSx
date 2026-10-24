import { useState, useEffect } from 'react';
import type { WorkplaceStationId } from '../JobWorkstationApp';
import { INSTITUTIONAL_REGISTRY, CANONICAL_DYNAMIC_EVENTS, INITIAL_SCHEDULE_ITEMS, type ScheduledShiftItem } from './worknetData';

export type WorknetTabId = 
  | 'overview'
  | 'opportunities'
  | 'my-work'
  | 'workplace'
  | 'career-record'
  | 'schedule'
  | 'civic-notices'
  | 'departments';

interface CoworkerStats {
  trust: number;
  competence: number;
  familiarity: number;
  cooperation: number;
  conflictHistory: number;
  lastInteraction?: string;
}

interface LeaveRequest {
  id: string;
  shiftId: string;
  stationId: WorkplaceStationId;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  requestedAt: string;
  responseNote?: string;
}

const STORAGE_KEY = 'miraverse_worknet_state_v1';

export function useWorknetState() {
  const [activeStation, setActiveStationState] = useState<WorkplaceStationId>('dga');
  const [activeTab, setActiveTabState] = useState<WorknetTabId>('overview');
  const [selectedMissionId, setSelectedMissionId] = useState<string>('ms-spec-01');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Coworker relationships tracking
  const [coworkerStats, setCoworkerStats] = useState<Record<string, CoworkerStats>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_coworkers`);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initial: Record<string, CoworkerStats> = {};
    Object.values(INSTITUTIONAL_REGISTRY).forEach(inst => {
      inst.coworkers.forEach(cw => {
        initial[cw.id] = {
          trust: cw.trust,
          competence: cw.competence,
          familiarity: cw.familiarity,
          cooperation: cw.cooperation,
          conflictHistory: cw.conflictHistory
        };
      });
    });
    return initial;
  });

  // Schedule and leave
  const [scheduleItems, setScheduleItems] = useState<ScheduledShiftItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_schedule`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SCHEDULE_ITEMS;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_leaves`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'lr-init-1',
        shiftId: 'sch-03',
        stationId: 'finance',
        reason: 'Cyacademy archival research symposium attendance',
        status: 'Approved',
        requestedAt: 'Yesterday 14:00',
        responseNote: 'Approved by Chief Auditor Silas. Ensure Roll 401 reconciliation is filed in advance.'
      }
    ];
  });

  // Dynamic events completed
  const [resolvedEventIds, setResolvedEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_resolved_events`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Break room rest
  const [breakRoomVisitCount, setBreakRoomVisitCount] = useState<number>(0);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_coworkers`, JSON.stringify(coworkerStats));
    } catch {}
  }, [coworkerStats]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_schedule`, JSON.stringify(scheduleItems));
    } catch {}
  }, [scheduleItems]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_leaves`, JSON.stringify(leaveRequests));
    } catch {}
  }, [leaveRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_resolved_events`, JSON.stringify(resolvedEventIds));
    } catch {}
  }, [resolvedEventIds]);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const interactWithCoworker = (
    coworkerId: string,
    actionType: 'consult' | 'assist' | 'collaborate' | 'break',
    coworkerName: string
  ) => {
    setCoworkerStats(prev => {
      const current = prev[coworkerId] || {
        trust: 75,
        competence: 80,
        familiarity: 60,
        cooperation: 75,
        conflictHistory: 5
      };

      let trustDelta = 1;
      let coopDelta = 2;
      let famDelta = 3;
      let feedbackText = '';

      if (actionType === 'consult') {
        trustDelta = 2;
        famDelta = 2;
        feedbackText = `Consulted with ${coworkerName}. Their insights clarified procedural nuances (+2 Trust, +2 Familiarity).`;
      } else if (actionType === 'assist') {
        trustDelta = 3;
        coopDelta = 4;
        famDelta = 2;
        feedbackText = `Assisted ${coworkerName} with their urgent queue (+3 Trust, +4 Cooperation).`;
      } else if (actionType === 'collaborate') {
        trustDelta = 2;
        coopDelta = 5;
        famDelta = 3;
        feedbackText = `Co-signed operational dispatch with ${coworkerName} (+5 Cooperation, +2 Trust).`;
      } else {
        famDelta = 4;
        trustDelta = 1;
        feedbackText = `Shared coffee and break room conversation with ${coworkerName} (+4 Familiarity).`;
      }

      showFeedback(`💬 ${feedbackText}`);

      return {
        ...prev,
        [coworkerId]: {
          ...current,
          trust: Math.min(100, current.trust + trustDelta),
          cooperation: Math.min(100, current.cooperation + coopDelta),
          familiarity: Math.min(100, current.familiarity + famDelta),
          conflictHistory: Math.max(0, current.conflictHistory - 1),
          lastInteraction: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
    });
  };

  const resolveDynamicWorkplaceEvent = (eventId: string) => {
    const ev = CANONICAL_DYNAMIC_EVENTS.find(e => e.id === eventId);
    if (!ev) return;
    if (resolvedEventIds.includes(eventId)) {
      showFeedback(`⚠️ ${ev.title} has already been resolved for this cycle.`);
      return;
    }
    setResolvedEventIds(prev => [...prev, eventId]);
    showFeedback(`✅ Resolved: "${ev.title}". ${ev.impactSummary} (Earned +${ev.rewardCredits} ₢ Credits, +${ev.rewardXP} Career XP)`);
  };

  const requestLeave = (shiftId: string, reason: string) => {
    const shift = scheduleItems.find(s => s.id === shiftId);
    if (!shift) return;
    const newReq: LeaveRequest = {
      id: `lr-${Date.now()}`,
      shiftId,
      stationId: shift.institutionId,
      reason: reason || 'Personal professional development / authorized absence',
      status: 'Approved',
      requestedAt: 'Just now',
      responseNote: `Approved by Department Supervisor. Shift reassigned to reserve pool. Reason accepted: ${reason || 'Approved leave'}.`
    };
    setLeaveRequests(prev => [newReq, ...prev]);
    setScheduleItems(prev =>
      prev.map(s => (s.id === shiftId ? { ...s, status: 'Leave Approved' } : s))
    );
    showFeedback(`🏖️ Leave request approved for shift "${shift.dutyTitle}".`);
  };

  const visitBreakRoom = () => {
    setBreakRoomVisitCount(c => c + 1);
    showFeedback('☕ Took a restorative break in the department lounge. Enjoyed fresh chamomile roast; workplace calm restored.');
  };

  return {
    activeStation,
    setActiveStation: setActiveStationState,
    activeTab,
    setActiveTab: setActiveTabState,
    selectedMissionId,
    setSelectedMissionId,
    actionFeedback,
    setActionFeedback,
    showFeedback,
    coworkerStats,
    scheduleItems,
    leaveRequests,
    resolvedEventIds,
    breakRoomVisitCount,
    interactWithCoworker,
    resolveDynamicWorkplaceEvent,
    requestLeave,
    visitBreakRoom
  };
}
