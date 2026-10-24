'use client';

import React, { useEffect, useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import BroadStreetCasePanel, { CaseSourceView } from '../../apps/investigation/BroadStreetCasePanel';
import { DgaShell } from '../components/dga/dga-shell';
import TraceApp from './TraceApp';
import { installDgaosApiInterceptor } from '../services/traceApiInterceptor';
import { initDGAStore } from '../lib/dga-store';
import '../styles/dgaos-integrated.css';
import '../styles/agency-shell.css';

// Ensure in-browser API interceptor is active for DGAOS and TRACE
installDgaosApiInterceptor();

export default function DgaosApp() {
  const request = useOSStore(s => s.workspaceRequests.dgaos);
  const [caseView, setCaseView] = useState<string | null>(null);
  useEffect(() => {
    if (!request) return;
    if (!request.section.startsWith('broadstreet:')) { setCaseView(null); return; }
    setCaseView(request.section.split(':')[1]);
    useOSStore.getState().consumeWorkspaceRequest('dgaos', request.revision);
  }, [request]);
  useEffect(() => {
    initDGAStore();
  }, []);

  if (caseView) return <div className="h-full flex flex-col"><nav className="dga-case-navigation" aria-label="Case workspace"><button onClick={() => setCaseView('notebook')}>Broad Street notebook</button><button onClick={() => setCaseView(null)}>Return to agency workspace</button></nav><div className="flex-1 min-h-0">{caseView === 'notebook' ? <BroadStreetCasePanel notebook /> : <CaseSourceView id={caseView} app="dgaos" />}</div></div>;
  return (
    <div className="dga-workstation-root flex-1 h-full w-full overflow-hidden bg-[#ebe9f3] text-[#0f0d1a] relative">
      <DgaShell traceWorkbenchNode={<TraceApp />} onOpenCaseNotebook={() => setCaseView('notebook')} />
    </div>
  );
}
