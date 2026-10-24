import React, { useEffect, useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { WORK_DEFINITIONS } from '../gameplay/ActivityEngine';
import { getOpportunity } from '../gameplay/AssignmentFlow';
import WorknetApp from './worknet/WorknetApp';
import type { WorknetTabId } from './worknet/useWorknetState';

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

export default function JobWorkstationApp() {
  const [station, setStation] = useState<WorkplaceStationId>('dga');
  const [tab, setTab] = useState<WorknetTabId>('overview');
  const [missionId, setMissionId] = useState<string>('ms-spec-01');

  const workspaceRequest = useOSStore(s => s.workspaceRequests.jobs);
  const selectedOpportunity = useOSStore(state => state.gameplay.player.assignmentJournal?.selectedId);
  const selectionVersion = useOSStore(state => state.gameplay.player.assignmentJournal?.selectionVersion);

  // Handle explicit section requests from OS or other apps
  useEffect(() => {
    if (!workspaceRequest) return;
    if (workspaceRequest.section === 'notices') {
      setTab('civic-notices');
    } else if (workspaceRequest.section === 'civic-jobs') {
      setStation('questnotice');
      setTab('opportunities');
    } else if (workspaceRequest.section === 'workplace') {
      setTab('workplace');
    } else if (workspaceRequest.section === 'overview') {
      setTab('overview');
    } else if (workspaceRequest.section === 'schedule') {
      setTab('schedule');
    } else if (workspaceRequest.section === 'career') {
      setTab('career-record');
    }
    useOSStore.getState().consumeWorkspaceRequest('jobs', workspaceRequest.revision);
  }, [workspaceRequest]);

  // Handle assignment journal selection
  useEffect(() => {
    if (!selectedOpportunity || workspaceRequest) return;
    const def = WORK_DEFINITIONS[selectedOpportunity];
    if (def) {
      const stationMatch = ({ medical: 'faithmed', archivist: 'archives' } as Record<string, string>)[def.track] || def.track;
      setStation((stationMatch as WorkplaceStationId) || 'dga');
      setMissionId(selectedOpportunity);
      setTab('opportunities');
    } else if (getOpportunity(selectedOpportunity)?.unlock) {
      setTab('opportunities');
    }
  }, [selectedOpportunity, selectionVersion]);

  return (
    <WorknetApp
      initialStation={station}
      initialTab={tab}
      initialMissionId={missionId}
    />
  );
}
