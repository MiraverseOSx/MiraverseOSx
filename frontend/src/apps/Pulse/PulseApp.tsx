import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Radio, ArrowUpRight } from 'lucide-react';

export default function PulseApp() {
  return <section className="workspace-transition" aria-label="Pulse workspace"><Radio size={30}/><span className="workspace-kicker">Pulse</span><h1>Workspace under review.</h1><p>Pulse is retained while its purpose is defined. Your social profile, posts, and friends are available in mai.space.</p><button onClick={() => useOSStore.getState().openAppWorkspace('maispace')}>Open mai.space <ArrowUpRight size={15}/></button></section>;
}
