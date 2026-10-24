import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ServiceDirectory from './ServiceDirectory';
import ExternalWebPage from './ExternalWebPage';
import { externalWebUrl } from './externalWeb';

const SESSION_KEY = 'miraverse-service-workspace-tabs-v1';
function restoreTabs(): string[] {
  try { return [...new Set<string>((JSON.parse(localStorage.getItem(SESSION_KEY) || '[]') as unknown[]).filter((url): url is string => typeof url === 'string' && Boolean(externalWebUrl(url))))].slice(0, 8); }
  catch { return []; }
}
function Workspace() {
  const [tabs, setTabs] = useState(restoreTabs);
  const [active, setActive] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { try { localStorage.setItem(SESSION_KEY, JSON.stringify(tabs)); } catch { setError('Session could not be saved. Check browser storage.'); } }, [tabs]);
  const open = (input: string) => {
    const url = externalWebUrl(/^https?:\/\//i.test(input.trim()) ? input : `https://${input.trim()}`);
    if (!url) { setError('Enter a real HTTP(S) web address. Open fictional sites from Miraverse.'); return; }
    if (!tabs.includes(url) && tabs.length >= 8) { setError('Close a tab before opening another.'); return; }
    setTabs(current => current.includes(url) ? current : [...current, url]); setActive(url); setAddress(url); setError('');
  };
  return <div className="versenet-browser vn-standalone">
    <nav className="vn-workspace-tabs" aria-label="Workspace tabs"><button aria-pressed={!active} onClick={() => { setActive(''); setAddress(''); }}>Service Directory</button>{tabs.map(url => <span key={url}><button aria-pressed={active === url} onClick={() => { setActive(url); setAddress(url); }}>{new URL(url).hostname}</button><button aria-label={`Close ${new URL(url).hostname}`} onClick={() => { setTabs(current => current.filter(item => item !== url)); if (active === url) setActive(''); }}>×</button></span>)}</nav>
    <form className="vn-workspace-address" onSubmit={event => { event.preventDefault(); open(address); }}><label htmlFor="external-address">External Internet</label><input id="external-address" placeholder="Enter a website address" value={address} onChange={event => setAddress(event.target.value)}/><button>Open website</button></form>
    {error && <p role="alert" className="vn-workspace-error">{error}</p>}
    <main className="vn-page">{active ? <ExternalWebPage key={active} url={active}/> : <ServiceDirectory navigateTab={open}/>}</main>
    <footer className="vn-status"><span>MIRAVERSE SERVICE WORKSPACE</span><span>Local directory · {tabs.length}/8 external tabs</span></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<Workspace/>);
