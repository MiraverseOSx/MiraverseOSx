import React, { lazy, Suspense, useEffect, useState } from 'react';
import { CyacademyPortal } from './Browser/Portals';
import { useOSStore } from '../store/useOSStore';
const MagicPractice = lazy(() => import('./SpellForgeApp'));

export default function CampusApp() {
  const [section, setSection] = useState('overview');
  const request = useOSStore(s => s.workspaceRequests.campus);
  useEffect(() => {
    if (!request) return;
    setSection(request.section === 'magic' ? 'magic' : 'overview');
    useOSStore.getState().consumeWorkspaceRequest('campus', request.revision);
  }, [request]);
  return <section className="consolidated-workspace" aria-label="Cyacademy workspace">
    <nav className="consolidated-tabs" aria-label="Cyacademy sections"><strong>Cyacademy</strong><button aria-pressed={section === 'overview'} onClick={() => setSection('overview')}>Academic portal</button><button aria-pressed={section === 'magic'} onClick={() => setSection('magic')}>Magic practice</button></nav>
    <div className="consolidated-body">{section === 'magic' ? <Suspense fallback={<p role="status">Opening magic practice…</p>}><MagicPractice/></Suspense> : <CyacademyPortal/>}</div>
  </section>;
}
