import React, { useEffect, useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { WORK_DEFINITIONS } from '../gameplay/ActivityEngine';
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
  const [entryRevision, setEntryRevision] = useState(0);
  const [missionId, setMissionId] = useState<string>('ms-spec-01');

  const workspaceRequest = useOSStore(s => s.workspaceRequests.jobs);
  const selectedOpportunity = useOSStore(state => state.gameplay.player.assignmentJournal?.selectedId);

  // Handle explicit section requests from OS or other apps
  useEffect(() => {
    if (!workspaceRequest) return;
    if (workspaceRequest.section === 'assignment' && selectedOpportunity) {
      const def = WORK_DEFINITIONS[selectedOpportunity];
      if (def) setStation((( { medical: 'faithmed', archivist: 'archives' } as Record<string, string>)[def.track] || def.track) as WorkplaceStationId);
      setMissionId(selectedOpportunity);
      setTab('opportunities');
    } else if (workspaceRequest.section === 'notices') {
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
    setEntryRevision(value => value + 1);
    useOSStore.getState().consumeWorkspaceRequest('jobs', workspaceRequest.revision);
  }, [workspaceRequest]);

  // A saved journal selection is history; explicit assignment requests open its reader.

  return (
    <WorknetApp
      initialRevision={entryRevision}
      initialStation={station}
      initialTab={tab}
      initialMissionId={missionId}
    />
  );
}
