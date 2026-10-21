import React, { useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { resolveBrowserInput, STARTER_SITES } from './browserModel';

export interface SearchHomeProps { openTab?: (url: string, title?: string) => void; navigateTab: (url: string, title?: string) => void }
export default function SearchHome({ navigateTab, openTab }: SearchHomeProps) {
  const [query, setQuery] = useState('');
  return <div className="vn-homepage">
    <section className="vn-start" aria-label="Versenet search">
      <h1>versenet</h1>
      <form onSubmit={event => { event.preventDefault(); if (query.trim()) navigateTab(resolveBrowserInput(query)); }}>
        <Search size={18}/><input aria-label="Search the fictional network" placeholder="Search or enter an address" value={query} onChange={event => setQuery(event.target.value)} spellCheck={false}/><button type="submit">Search</button>
      </form>
      <nav className="vn-shortcuts" aria-label="Five starter websites">
        {STARTER_SITES.map(site => <div className="vn-shortcut" key={site.domain}>
          <button className="vn-shortcut-link" onClick={() => navigateTab(`https://${site.domain}`)} title={site.domain}>{site.name}</button>
          <button className="vn-icon" aria-label={`Open ${site.name} in new tab`} onClick={() => openTab?.(`https://${site.domain}`, site.name)}><ArrowUpRight size={12}/></button>
        </div>)}
      </nav>
    </section>
  </div>;
}
