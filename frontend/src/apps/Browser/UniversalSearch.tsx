import React, { useEffect, useMemo, useState } from 'react';
import { Search, ArrowUpRight, Folder, FileText, MapPin, Globe, User } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { PORTALS, SAMPLE_ARCHIVES } from './constants';
import { NPCS } from '../../db/miraverseDb';
import { SEARCH_FILTERS, normalizeSearch, getSearchBundle, matchingExternalLinks, canSearchArchive, type WebRecord, type SearchFilter } from './searchCatalog';
import { CityMap, WebImage } from './SearchVisuals';
import { publicCaseSearch } from '../investigation/publication';
import '../../styles/apps/versenet-search.css';

interface Hit { id: string; type: string; title: string; summary: string; url?: string; publisher: string; record?: WebRecord }
const categoryType: Partial<Record<SearchFilter, string | string[]>> = { Sites: 'site', Images: 'image', Files: ['folder','document'], Maps: 'map', People: 'person', Archives: 'archive' };
export default function UniversalSearch({ query, navigateTab, view = 'All' }: { query: string; navigateTab: (url: string, title?: string) => void; view?: string }) {
  const content = useOSStore(s => s.versenetContent);
  const remember = useOSStore(s => s.rememberVersenetSearch);
  const player = useOSStore(s => s.gameplay.player);
  const [input, setInput] = useState(query);
  const normalized = normalizeSearch(query);
  const bundle = useMemo(() => getSearchBundle(content, normalized), [content, normalized]);
  const filter = SEARCH_FILTERS.includes(view as SearchFilter) ? view as SearchFilter : 'All';
  useEffect(() => { if (normalized) remember(normalized); }, [normalized, remember]);
  const indexed: Hit[] = useMemo(() => {
    if (!normalized) return [];
    const casePublic: Hit[] = publicCaseSearch(normalized);
    const sites = Object.entries(PORTALS).filter(([url, portal]) => `${url} ${portal.title} ${portal.category}`.toLowerCase().includes(normalized)).map(([url, portal]) => ({ id: `site:${url}`, type: 'site', title: portal.title, summary: `Visit ${portal.title} · ${portal.category}.`, url: `https://${url}`, publisher: url }));
    const archives = SAMPLE_ARCHIVES.filter(arc => canSearchArchive(arc.id, player) && `${arc.title} ${arc.excerpt}`.toLowerCase().includes(normalized)).map(arc => ({ id: arc.id, type: 'archive', title: arc.title, summary: arc.excerpt, url: `https://fieldnotes.aure/archive/${arc.id}`, publisher: 'Public archive catalog' }));
    const people = NPCS.filter(npc => `${npc.name} ${npc.faction} ${npc.role}`.toLowerCase().includes(normalized)).map(npc => ({ id: `person:${npc.id || npc.name}`, type: 'person', title: npc.name, summary: `${npc.role} · ${npc.faction} · ${npc.region || 'Aureline'}`, publisher: 'Public people index' }));
    const worldEvents: Hit[] = (useOSStore.getState().gameplay?.worldEventLog || [])
      .filter((evt: any) => evt?.category !== 'forensic' && `${evt?.title} ${evt?.summary} ${evt?.institution}`.toLowerCase().includes(normalized))
      .map((evt: any) => ({
        id: `event:${evt.id}`,
        type: 'site',
        title: evt.title,
        summary: `${evt.institution} · ${evt.summary}`,
        publisher: evt.institution || 'Aureline Public Dispatches',
      }));
    return [...casePublic, ...sites, ...archives, ...people, ...worldEvents];
  }, [normalized, player]);
  const generated: Hit[] = (bundle?.records || []).map(record => ({ ...record, record }));
  // Keep public institutions ahead of generated pages. Location entries remain reachable through Maps.
  const ordered = [...indexed, ...generated.filter(hit => !hit.id.includes(':place-'))];
  const type = categoryType[filter];
  const hits = filter === 'All' ? ordered : ordered.filter(hit => Array.isArray(type) ? type.includes(hit.type) : hit.type === type);
  const images = hits.filter(hit => hit.type === 'image');
  const others = hits.filter(hit => hit.type !== 'image');
  const external = ['All','Sites'].includes(filter) ? matchingExternalLinks(normalized) : [];
  const open = (hit: Hit) => { if (hit.url) { remember(query); navigateTab(hit.url, hit.title); } };
  const changeFilter = (next: SearchFilter) => navigateTab(`https://versenet.aure/find?q=${encodeURIComponent(normalized)}&view=${next}`);
  const resultRow = (hit: Hit) => <article className="vs-result" key={hit.id}>
    <span className="vs-result-source">{hit.type === 'folder' ? <Folder size={13}/> : hit.type === 'map' ? <MapPin size={13}/> : hit.type === 'document' ? <FileText size={13}/> : hit.type === 'person' ? <User size={13}/> : <Globe size={13}/>} {hit.publisher} <span> / {hit.type}</span></span>
    {hit.url ? <button className="vs-result-title" onClick={() => open(hit)}>{hit.title}</button> : <h2 className="vs-result-title">{hit.title}</h2>}
    <p>{hit.summary}</p>
    {hit.type === 'map' && hit.record && <button className="vs-map-preview" aria-label={`Open map: ${hit.title}`} onClick={() => open(hit)}><CityMap record={hit.record} compact/></button>}
  </article>;
  const imageGrid = images.length > 0 && <section className="vs-image-section" aria-label="Image results">
    {filter === 'All' && <div className="vs-section-heading"><h2>Images</h2><button onClick={() => changeFilter('Images')}>View images <ArrowUpRight size={13}/></button></div>}
    <div className="vs-image-grid">{images.map(hit => <button className="vs-image-hit" key={hit.id} onClick={() => open(hit)}><WebImage record={hit.record!}/><strong>{hit.title}</strong><small>{hit.record?.photo ? 'Photo' : 'Illustration'} · {hit.publisher}</small></button>)}</div>
  </section>;
  return <div className="vs-search">
    <header className="vs-search-header"><div className="vs-search-top"><button className="vs-wordmark" onClick={() => navigateTab('https://versenet.aure')}>versenet</button><form onSubmit={event => { event.preventDefault(); if (input.trim()) navigateTab(`https://versenet.aure/find?q=${encodeURIComponent(normalizeSearch(input))}`); }}><input aria-label="Search Versenet" value={input} onChange={event => setInput(event.target.value)} maxLength={512}/><button aria-label="Submit search" type="submit"><Search size={18}/></button></form></div>
      <nav aria-label="Search result types">{SEARCH_FILTERS.map(tab => <button key={tab} aria-current={tab === filter ? 'page' : undefined} onClick={() => changeFilter(tab)}>{tab}</button>)}</nav>
    </header>
    <main className="vs-results"><p className="vs-result-count">{hits.length + external.length} results{bundle ? ` · ${bundle.topic === 'research' ? 'Research collection' : bundle.label}` : ''}</p>
      {filter === 'All' ? <>{others.slice(0, 1).map(resultRow)}{imageGrid}{others.slice(1).map(resultRow)}</> : <>{imageGrid}{others.map(resultRow)}</>}
      {external.map(link => <article key={link.id} className="vs-result"><span className="vs-result-source">External website</span><a className="vs-result-title" href={link.url} target="_blank" rel="noopener noreferrer">{link.title} <ArrowUpRight size={15}/></a><p>{link.description}</p></article>)}
      {!hits.length && !external.length && <div className="vs-no-matches"><h2>{normalized ? `No public ${filter.toLowerCase()} matches` : 'Enter a search to begin'}</h2><p>{normalized ? 'Try All, Sites, Images, Files, or Maps for this reading collection.' : 'Find pages, images, documents, and public places in Aureline.'}</p>{normalized && <button className="vs-primary" onClick={() => changeFilter('All')}>View all results</button>}</div>}
    </main>
  </div>;
}
export function IndexedArchivePage({ id, navigateTab }: { id: string; navigateTab: (url: string, title?: string) => void }) {
  const player = useOSStore(s => s.gameplay.player);
  const archive = SAMPLE_ARCHIVES.find(arc => arc.id === id && canSearchArchive(arc.id, player));
  return <article className="vs-content"><header className="vs-publication"><strong>Public archive catalog</strong><span>AURELINE / REFERENCE</span></header>{archive ? <><span className="vs-eyebrow">{archive.id} / {archive.type}</span><h1>{archive.title}</h1><p>{archive.excerpt}</p><p>This is the available public catalog abstract. The institution maintains its own access requirements for additional records.</p><button className="vs-primary" onClick={() => navigateTab(`https://${archive.address}`)}>Open institution portal</button></> : <><h1>No public catalog entry</h1><p>This record is not available in the public index.</p></>}<button className="vs-back-link" onClick={() => navigateTab('https://versenet.aure')}>Return to Versenet</button></article>;
}
