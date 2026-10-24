import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, Folder, ArrowUpRight } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { findWebRecord } from './searchCatalog';
import { CityMap, WebImage } from './SearchVisuals';
import { TOPIC_PACKS } from './searchTopics';
import { INTERACTIVE_SITES } from './interactiveSites';

export default function WebContentPage({ url, navigateTab }: { url: string; navigateTab: (url: string, title?: string) => void }) {
  const content = useOSStore(s => s.versenetContent);
  const save = useOSStore(s => s.saveVersenetRecord);
  const [notice, setNotice] = useState('');
  const record = findWebRecord(content, url);
  const bundle = Object.values(content.catalog).find(bundle => bundle.records.some(item => item.url === url));
  if (!record || !bundle) return <div className="vs-content"><h1>Page not in this collection</h1><p>This saved address has no local content. Search again to open a reading collection.</p><button className="vs-primary" onClick={() => navigateTab('https://versenet.aure')}>Return to Versenet</button></div>;
  const children = bundle.records.filter(item => record.children?.includes(item.id));
  const related = bundle.records.filter(item => item.id !== record.id && ['folder','map','site'].includes(item.type)).sort((a, b) => ['folder','map','site'].indexOf(a.type) - ['folder','map','site'].indexOf(b.type)).slice(0, 5);
  const topic = TOPIC_PACKS.find(pack => pack.id === bundle.topic);
  const publisherSite = INTERACTIVE_SITES.find(site => site.publisher === record.publisher);
  return <article className="vs-content">
    <header className="vs-publication">{publisherSite ? <button className="vs-publisher-link" onClick={() => navigateTab(`https://${publisherSite.domain}`,publisherSite.name)}>{record.publisher}<ArrowUpRight size={13}/></button> : <strong>{record.publisher}</strong>}<span>FIELDNOTES / AURELINE</span></header>
    <button className="vs-back-link" onClick={() => navigateTab(`https://versenet.aure/find?q=${encodeURIComponent(bundle.query)}`)}><ArrowLeft size={13}/> Search collection</button>
    <div className="vs-content-heading"><span className="vs-eyebrow">{record.type === 'site' ? 'PUBLIC READING' : record.type.toUpperCase()}</span><h1>{record.title}</h1><p>{record.summary}</p></div>
    {['folder','document'].includes(record.type) && <div className="vs-save-row"><button className="vs-primary" onClick={() => setNotice(save(record.id).message)}><Download size={14}/> Save to File Explorer</button><p role="status">{notice}</p></div>}
    <div className="vs-reading-body">{record.paragraphs.map((text, index) => <p key={index}>{text}</p>)}</div>
    {record.type === 'image' && <figure className="vs-image-detail"><WebImage record={record}/><figcaption>{record.credit}{record.source && <a href={record.source} target="_blank" rel="noopener noreferrer">Source & rights <ArrowUpRight size={12}/></a>}</figcaption></figure>}
    {record.type === 'map' && <CityMap record={record} navigateTab={navigateTab}/>}
    {record.type === 'folder' && <div className="vs-folder-list">{children.map(child => <button key={child.id} onClick={() => navigateTab(child.url, child.title)}><FileText size={21}/><span><strong>{child.title}</strong><small>{child.summary}</small></span><ArrowUpRight size={15}/></button>)}</div>}
    <nav className="vs-related" aria-label="Related reading"><h2>In this collection</h2>{related.map(item => <button key={item.id} onClick={() => navigateTab(item.url, item.title)}>{item.type === 'folder' && <Folder size={14}/>} {item.title}<ArrowUpRight size={13}/></button>)}<button onClick={() => navigateTab(`https://versenet.aure/find?q=${encodeURIComponent(topic?.related || 'education')}`)}>Explore {topic?.related || 'research methods'}<ArrowUpRight size={13}/></button></nav>
  </article>;
}
