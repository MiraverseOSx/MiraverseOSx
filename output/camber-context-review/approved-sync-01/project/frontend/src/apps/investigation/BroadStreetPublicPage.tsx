import React from 'react';
import publication from '../../data/broad-street-public.json';
import { useOSStore } from '../../store/useOSStore';
import './case-workspace.css';
export default function BroadStreetPublicPage() {
  const order = useOSStore(s => s.gameplay.player.worknetOrders?.['ms-case-002']);
  const [notice, setNotice] = React.useState('');
  return <section className="case-workspace" aria-label="First Federal public maintenance page"><header><span className="case-kicker">VERSENET / PUBLIC FACILITIES NOTICE</span><h1>{publication.title}</h1><p>{publication.publisher}</p><p>{publication.url}</p></header><article className="case-paper"><pre>{publication.body}</pre></article>{order?.status === 'active' && <button onClick={() => setNotice(useOSStore.getState().acquireCaseSource('maintenance', 'browser').message)}>Cite this public page in Broad Street case</button>}<p role="status">{notice}</p></section>;
}
