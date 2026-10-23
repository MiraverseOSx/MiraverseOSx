import React, { useEffect, useRef, useState } from 'react';
import { Activity, ShieldCheck, ScanSearch, Scale, Files, LayoutGrid, Search, Plus, ArrowUpRight, Upload, Pencil, Trash2, Laptop, Globe } from 'lucide-react';
import ExternalLink from './ExternalLink';
import { DEFAULT_SERVICES, ExternalService, SERVICE_STORAGE_KEY, externalWebUrl, serviceLaunchUrl, restoreServices, localHtmlWrapper } from './externalWeb';

const SERVICES_UPDATED = 'miraverse:services-updated';
function loadServices() {
  try {
    const saved = localStorage.getItem(SERVICE_STORAGE_KEY);
    if (saved) return restoreServices(JSON.parse(saved));
    return DEFAULT_SERVICES.map(service => ({ ...service, url: serviceLaunchUrl(localStorage.getItem(`sd_link_${service.name}`) || '') || service.url }));
  } catch { return DEFAULT_SERVICES.map(service => ({ ...service })); }
}
const emptyForm = { name: '', category: 'General', description: '', url: '' };
const categoryIcons = { 'Medical & Clinical': Activity, 'Police & Law Enforcement': ShieldCheck, 'Investigation & Forensics': ScanSearch, 'Legal & Courtroom': Scale, 'Fictional Documents & Data': Files };
const categoryTones: Record<string, string> = { 'Medical & Clinical': 'pine', 'Police & Law Enforcement': 'heather', 'Investigation & Forensics': 'mist', 'Legal & Courtroom': 'sienna', 'Fictional Documents & Data': 'autumn' };

export default function ServiceDirectory({ navigateTab, showSidebar = true }: { navigateTab: (url: string, title?: string) => void; showSidebar?: boolean }) {
  const [services, setServices] = useState(loadServices);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [local, setLocal] = useState<{ name: string; html: string } | null>(null);
  const [localUrl, setLocalUrl] = useState('');
  const selection = useRef(0);
  const localTools = useRef<HTMLElement>(null);
  useEffect(() => {
    // VerseNet and DGAOS can be open together; keep their shared collection current.
    const refresh = () => setServices(loadServices());
    const onStorage = (event: StorageEvent) => {
      if (event.key === SERVICE_STORAGE_KEY || event.key === null) refresh();
    };
    window.addEventListener(SERVICES_UPDATED, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SERVICES_UPDATED, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  useEffect(() => {
    if (!local) return;
    const url = URL.createObjectURL(new Blob([localHtmlWrapper(local.html)], { type: 'text/html' }));
    setLocalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [local]);
  useEffect(() => () => { selection.current++; }, []);
  const save = (next: ExternalService[]) => {
    try {
      localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(next));
      setServices(next);
      setError('');
      window.dispatchEvent(new Event(SERVICES_UPDATED));
      return true;
    }
    catch { setError('Your browser could not save these links. Check available storage and try again.'); return false; }
  };
  const categories = [...new Set(services.map(service => service.category))];
  const matches = services.filter(service => (category === 'All' || service.category === category) && `${service.name} ${service.category} ${service.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="vn-directory vn-directory-shell" data-sidebar={showSidebar}>
    {showSidebar && <aside className="vn-service-sidebar"><div className="vn-service-brand"><span><LayoutGrid size={22}/></span><div><strong>Service hub</strong><small>MIRAVERSE / VERSENET</small></div></div>
      <span className="vn-sidebar-label">YOUR COLLECTION</span>
      <nav aria-label="Service categories"><button aria-pressed={category === 'All'} onClick={() => setCategory('All')}><LayoutGrid size={16}/><span>All services</span><small>{services.length}</small></button>{categories.map(name => { const Icon = categoryIcons[name] || Files; return <button key={name} aria-pressed={category === name} onClick={() => setCategory(name)}><Icon size={16}/><span>{name}</span><small>{services.filter(service => service.category === name).length}</small></button>; })}</nav>
      <button className="vn-sidebar-local" onClick={() => localTools.current?.scrollIntoView({ behavior: 'auto', block: 'start' })}><Upload size={16}/>Open a local HTML tool</button>
      <footer><Laptop size={17}/><div><strong>Your personal workspace</strong><small>Links saved on this device</small></div></footer>
    </aside>}
    <div className="vn-directory-content">
    <header className="vn-directory-header"><div><span className="vn-eyebrow">CONNECTED TO YOUR CRAFT</span><h1>Service Directory</h1><p>A little space for your most useful tools.</p></div><button className="vn-add-service" onClick={() => { setEditing('new'); setForm(emptyForm); }}><Plus size={15}/> Add service</button></header>
    <div className="vn-collection-banner"><div><span className="vn-banner-orbit"><GlobeIcon/></span><div><strong>Your world. A wider workspace.</strong><p>Independent services, together on your Miraverse desktop.</p></div></div><span>EXTERNAL INTERNET <ArrowUpRight size={13}/></span></div>
    <div className="vn-directory-filters"><label className="vn-service-search"><Search size={17}/><input type="search" aria-label="Search services" placeholder="Find a service, category, or purpose…" value={query} onChange={event => setQuery(event.target.value)}/></label><select aria-label="Filter service category" value={category} onChange={event => setCategory(event.target.value)}><option>All</option>{categories.map(name => <option key={name}>{name}</option>)}</select></div>
    <p className="vn-service-count" role="status">{matches.length} of {services.length} services<span>Web apps · Repositories · Local tools</span></p>
    {error && <p role="alert">{error}</p>}
    {editing && <form className="vn-service-form" aria-label="Edit service" onSubmit={event => {
      event.preventDefault();
      const url = form.url.trim() ? serviceLaunchUrl(form.url) : '';
      if (url === null) { setError('Enter a full HTTP(S) address or a file:/// address ending in .html or .htm. Fictional VerseNet addresses belong in the in-world browser.'); return; }
      const item = { ...form, id: editing === 'new' ? crypto.randomUUID() : editing, name: form.name.trim(), category: form.category.trim() || 'General', url };
      if (!item.name) return;
      if (editing === 'new' && services.length >= 100) { setError('The directory supports up to 100 services.'); return; }
      const next = editing === 'new' ? [...services, item] : services.map(service => service.id === editing ? item : service);
      if (save(next)) { setEditing(null); setCategory('All'); }
    }}>
      <h2>{editing === 'new' ? 'Add a service' : 'Edit service'}</h2>
      <label>Name<input required maxLength={100} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })}/></label>
      <label>Category<input required maxLength={60} value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}/></label>
      <label>Purpose<input maxLength={500} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })}/></label>
      <label>Destination<input maxLength={4096} placeholder="https://… or file:///C:/…/tool.html" value={form.url} onChange={event => setForm({ ...form, url: event.target.value })}/></label>
      <div className="vn-gateway-actions"><button type="submit">Save service</button><button type="button" onClick={() => setEditing(null)}>Cancel</button></div>
    </form>}
    {categories.map(name => {
      const items = matches.filter(service => service.category === name);
      const Icon = categoryIcons[name] || Files;
      return items.length ? <section className="vn-service-section" key={name}><div className="vn-service-section-heading"><h2>{name}</h2><span>{items.length} tools</span></div><div className="vn-service-grid">{items.map(service => <article data-service-tone={categoryTones[name] || 'heather'} key={service.id}>
        <div className="vn-service-card-top"><span className="vn-service-icon"><Icon size={23} strokeWidth={1.5}/></span><span className="vn-service-kind">{!service.url ? 'ADD A LINK' : service.url.startsWith('file:') ? 'LOCAL HTML' : new URL(service.url).hostname === 'github.com' ? 'REPOSITORY' : 'WEB APP'}</span></div>
        <h3>{service.name}</h3><p>{service.description}</p><small className="vn-destination">{service.url ? service.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Add your link or select a local file'}</small>
        <div className="vn-gateway-actions">
          {externalWebUrl(service.url) && <button onClick={() => navigateTab(service.url, service.name)}>Open in workspace</button>}
          {service.url && <ExternalLink url={service.url}>Open separately <ArrowUpRight size={12}/></ExternalLink>}
        </div>
        <div className="vn-service-card-manage"><button onClick={() => { setEditing(service.id); setForm(service); }}><Pencil size={12}/>Edit link</button><button aria-label={`Remove ${service.name}`} title={`Remove ${service.name}`} onClick={() => save(services.filter(item => item.id !== service.id))}><Trash2 size={13}/></button></div>
      </article>)}</div></section> : null;
    })}
    {!matches.length && <p>No matching services.</p>}
    <section ref={localTools} className="vn-local-tools"><span className="vn-local-tool-mark"><Upload size={23}/></span><h2>Bring your own tools.</h2><p>Select a downloaded HTML app to try it here or open it separately. File contents stay on your device; the app itself may request internet resources.</p>
      <input aria-label="Select local HTML application" type="file" accept=".html,.htm,text/html" onChange={async event => {
        const file = event.target.files?.[0]; const request = ++selection.current;
        if (!file) return;
        if (!/\.html?$/i.test(file.name) || file.size > 20 * 1024 * 1024) { setError('Select an .html or .htm file smaller than 20 MB.'); return; }
        try { const html = await file.text(); if (request === selection.current) { setLocal({ name: file.name, html }); setError(''); } }
        catch { setError('This HTML file could not be read. Please select it again.'); }
      }}/>
      <p className="vn-fine-print">Select the file again after restarting. For apps with supporting files, use a local server URL or save the full file:/// HTML address and open it through the desktop launcher. Browser versions may block file links.</p>
      {local && <div className="vn-local-preview"><header><strong>{local.name}</strong><div className="vn-gateway-actions">{localUrl && <a href={localUrl} target="_blank" rel="noopener noreferrer">Open selected HTML separately</a>}<button onClick={() => setLocal(null)}>Close preview</button></div></header><iframe title={`Local HTML: ${local.name}`} srcDoc={local.html} sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer"/></div>}
    </section>
    </div>
  </section>;
}

function GlobeIcon() { return <Globe size={27} strokeWidth={1.3}/>; }
