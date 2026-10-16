import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronRight, Grid2X2, Search, X, Shield, UserRound, Globe, Wrench, LayoutGrid, Sparkles } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';
import { APPS_DIRECTORY, launchDesktopApp } from './appDirectory';

export { APPS_DIRECTORY, PROTOCOLS } from './appDirectory';
export type { ProtocolItem } from './appDirectory';

export interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

<<<<<<< Updated upstream
export interface ProtocolItem {
  id: string;
  code: string;
  name: string;
  label?: string;
  sector: string;
  icon: any;
  clearance: string;
  aetherTrace: string;
  flux: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

export const PROTOCOLS: ProtocolItem[] = [
  {
    id: 'dgaos',
    code: 'DGAOS',
    name: 'DGAOS // Agency Command Center',
    label: 'DGAOS // Agency Command Center',
    sector: 'Department of Global Affairs',
    icon: Shield,
    clearance: 'DGA Senior Officer Clearance',
    aetherTrace: 'AT-0x0901',
    flux: '35.4 MHz',
    desc: 'Agency headquarters: strategic operations, divisions (SHIELD/EYES), investigations, forensic dispatches, and comms.',
    color: 'text-purple-950',
    bg: 'bg-purple-100/80',
    border: 'border-purple-400'
  },
  {
    id: 'traceForensics',
    code: 'TRACE',
    name: 'TRACE // Forensic Workstation',
    label: 'TRACE // Forensic Workstation',
    sector: 'DGAOS Investigations (EYES/SHIELD)',
    icon: Fingerprint,
    clearance: 'DGA Special Clearance',
    aetherTrace: 'AT-0x0990',
    flux: '33.8 MHz',
    desc: 'Tactical forensic workstation: registry-linked subject analysis, evidence custody, case staging, and criminalistics.',
    color: 'text-slate-900',
    bg: 'bg-slate-100',
    border: 'border-slate-400'
  },
  {
    id: 'meridionRegistry',
    code: 'AURA',
    name: 'AURA // Citizen Registry',
    label: 'AURA // Citizen Registry',
    sector: 'Meridion Civic Identity',
    icon: ContactRound,
    clearance: 'Civic Authority Standard',
    aetherTrace: 'AT-0x0118',
    flux: '19.2 MHz',
    desc: 'Official citizen identity archive: ancestry, affinities, ten-print biometrics, Aura ID, and document studio issuance.',
    color: 'text-indigo-900',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300'
  },
  {
    id: 'documentStudio',
    code: 'STUDIO',
    name: 'STUDIO // Nine-Document Packet',
    label: 'STUDIO // Nine-Document Packet',
    sector: 'Aureline Civic & Crown Archives',
    icon: FileText,
    clearance: 'Civic Records Authority',
    aetherTrace: 'AT-0x0119',
    flux: '24.1 MHz',
    desc: 'Formal nine-document civic and forensic packet generator: passport booklet, birth certificate, biometrics, and local portrait synthesis.',
    color: 'text-purple-900',
    bg: 'bg-purple-50',
    border: 'border-purple-300'
  },
  {
    id: 'passport',
    code: 'MIRROR',
    name: 'MIRROR // Citizen Matrix',
    label: 'MIRROR // Citizen Matrix',
    sector: 'Aureline Civic Registry',
    icon: UserCheck,
    clearance: 'Level 1 Citizen',
    aetherTrace: 'AT-0x0114',
    flux: '18.4 MHz',
    desc: 'Identity initialization, citizen record, bio-aura calibration, pronouns, wardrobe, and passport credentials.',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300'
  },
  {
    id: 'housing',
    code: 'HOMECRAFT',
    name: 'HOMECRAFT // Housing',
    label: 'HOMECRAFT // Housing',
    sector: 'Orynvell & Cyacademy Housing',
    icon: Home,
    clearance: 'Resident Clearance',
    aetherTrace: 'AT-0x0289',
    flux: '32.1 MHz',
    desc: 'Residential housing grid editor, quarters customization, furniture layout, room expansion, and restorative rest hub.',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300'
  },
  {
    id: 'jobs',
    code: 'WORKNET',
    name: 'WORKNET // Federal Access',
    sector: 'Federal Career Network',
    icon: Briefcase,
    clearance: 'Contractor Level 1',
    aetherTrace: 'AT-0x0340',
    flux: '24.6 MHz',
    desc: 'Centralized federal work access across DGA, Faith Medical Clinic, Sovereign Treasury & Historic Archives.',
    color: 'text-amber-900',
    bg: 'bg-amber-100/60',
    border: 'border-amber-400'
  },
  {
    id: 'comms',
    code: 'COMMS',
    name: 'COMMS // Institutional Network',
    sector: 'Institutional Comms Grid',
    icon: MessageSquare,
    clearance: 'Encrypted Netmesh',
    aetherTrace: 'AT-0x0412',
    flux: '28.0 MHz',
    desc: 'Dual-pane instant messaging mesh, encrypted Cycademy student channels, and priority career dispatches.',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300'
  },
  {
    id: 'finance',
    code: 'ORYN Vault',
    name: 'ORYN // Treasury & Crypto Ledger',
    sector: 'First Orynvell Bank',
    clearance: 'High Council Audited',
    aetherTrace: 'AT-0x0508',
    flux: '21.5 MHz',
    desc: 'Sovereign Treasury vault, dual currency stipend audit, and live Blockchair PoW crypto telemetry feed.',
    color: 'text-amber-950',
    bg: 'bg-amber-200/60',
    border: 'border-amber-400'
  },
  {
    id: 'board',
    code: 'CHRONICLE',
    name: 'CHRONICLE // Notice Board',
    sector: 'Meridion Notice Stream',
    clearance: 'Civic Standard',
    aetherTrace: 'AT-0x0619',
    flux: '19.8 MHz',
    desc: 'Public municipal bulletin board, active quests, community errands, adventure dossiers & lore codices.',
    color: 'text-teal-800',
    bg: 'bg-teal-50',
    border: 'border-teal-300'
  },
  {
    id: 'browser',
    code: 'VERSENET',
    name: 'VERSENET // Web Terminal',
    sector: 'Versenet Quantum Web',
    clearance: 'Unrestricted Gateway',
    aetherTrace: 'AT-0x0899',
    flux: '48.2 MHz',
    desc: 'Public quantum web gateway: CIVINET, QUESTNOTICE, Faith Medical Intranet, DGA & Royal Archives.',
    color: 'text-sky-800',
    bg: 'bg-sky-50',
    border: 'border-sky-300'
  },
  {
    id: 'process',
    code: 'SYSTEM',
    name: 'SYSTEM // Kernel & PRISM Monitor',
    sector: 'PRISM Core Kernel',
    clearance: 'Root Shell Privilege',
    aetherTrace: 'AT-0x0001',
    flux: '14.2 MHz',
    desc: 'Deep kernel thread inspector, origin trace diagnostics, resource telemetry, and PRISM corruption isolation.',
    color: 'text-slate-800',
    bg: 'bg-slate-100',
    border: 'border-slate-300'
  },
  {
    id: 'pulse',
    code: 'PULSE',
    name: 'PULSE // Faction Telemetry',
    sector: 'Aureline Broadcast Array',
    clearance: 'Observer Clearance',
    aetherTrace: 'AT-0x0732',
    flux: '22.0 MHz',
    desc: 'Faction matrix tracker, regional announcements, influence vectors, and public broadcast stream.',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-300'
  },
  {
    id: 'vitals',
    code: 'VITALS',
    name: 'VITALS // Bio-Aura Matrix',
    sector: 'Faith Medical Telemetry',
    clearance: 'Patient Baseline',
    aetherTrace: 'AT-0x0910',
    flux: '37.2 MHz',
    desc: 'Real-time bio-aura integrity diagnostics, condition tracking, Veil exposure analysis, and recovery status.',
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-300'
  },
  {
    id: 'lore',
    code: 'ATLAS',
    name: 'ATLAS // Royal Historic Archive',
    sector: 'Royal Historic Society',
    clearance: 'Public Encyclopedia',
    aetherTrace: 'AT-0x1120',
    flux: '16.5 MHz',
    desc: 'Local encyclopedic lore repository: faction histories, world regions, NPC vectors, and historical treaties.',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300'
  },
  {
    id: 'files',
    code: 'VAULT',
    name: 'VAULT // Encrypted Storage',
    sector: 'Local Storage Controller',
    clearance: 'File System Standard',
    aetherTrace: 'AT-0x1044',
    flux: '20.1 MHz',
    desc: 'Local file system, confidential Purge documents, canonical file types, audio logs, and map rasters.',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300'
  },
  {
    id: 'spellforge',
    code: 'NEXLINK',
    name: 'NEXLINK // SpellForge Matrix',
    sector: 'Cycademy Arcane Lab',
    clearance: 'Arcane Weaver',
    aetherTrace: 'AT-0x0921',
    flux: '36.4 MHz',
    desc: 'Elemental protocol synthesis workbench, reality stabilization algorithms, and firewall rune weaving.',
    color: 'text-purple-900',
    bg: 'bg-purple-100/70',
    border: 'border-purple-300'
  },
  {
    id: 'campus',
    code: 'CAMPUS',
    name: 'CAMPUS // Cycademy Network',
    sector: 'Cycademy of Sciences',
    clearance: 'Student Enrollment',
    aetherTrace: 'AT-0x0218',
    flux: '19.4 MHz',
    desc: 'Student registry, academic faculty roster, course syllabus archives, and institutional portals.',
    color: 'text-blue-900',
    bg: 'bg-blue-50',
    border: 'border-blue-300'
  },
=======
const categories = [
  { name: 'All apps', icon: Grid2X2 },
  { name: 'Personal', icon: UserRound },
  { name: 'Connect', icon: Globe },
  { name: 'Civic', icon: LayoutGrid },
  { name: 'Agency', icon: Shield },
  { name: 'Tools', icon: Wrench },
>>>>>>> Stashed changes
];

export default function AppLauncherModal({ isOpen, onClose }: AppLauncherModalProps) {
  const [selectedId, setSelectedId] = useState('browser');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All apps');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const windows = useOSStore((state) => state.windows);
  const player = useOSStore((state) => state.gameplay?.player);
  const soundEnabled = useSystemStore((state) => state.soundEnabled);

  const query = searchQuery.trim().toLowerCase();
  const filtered = APPS_DIRECTORY.filter((app) =>
    (category === 'All apps' || app.category === category) &&
    (!query || `${app.code} ${app.name} ${app.sector} ${app.desc}`.toLowerCase().includes(query))
  );
  const selected = filtered.find((app) => app.id === selectedId) || filtered[0];
  const running = selected && windows.some((window) => window.id === selected.id);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    searchRef.current?.focus();
    return () => {
      dialog?.close();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen]);

  function handleLaunch(id: string) {
    if (soundEnabled) SoundFX.playSnap();
    launchDesktopApp(id);
    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.nativeEvent.isComposing) return;
    const inSearch = event.target === searchRef.current;
    const inGrid = gridRef.current?.contains(event.target as Node);
    if (!inSearch && !inGrid) return;
    if (event.key === 'Enter' && selected) {
      event.preventDefault();
      handleLaunch(selected.id);
      return;
    }
    if (!event.key.startsWith('Arrow') || !filtered.length) return;
    if (inSearch && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const columns = getComputedStyle(gridRef.current!).gridTemplateColumns.split(' ').length;
    const current = filtered.findIndex((app) => app.id === selected?.id);
    const step = event.key === 'ArrowDown' ? columns : event.key === 'ArrowUp' ? -columns : event.key === 'ArrowRight' ? 1 : -1;
    const index = inSearch ? 0 : (current + step + filtered.length) % filtered.length;
    setSelectedId(filtered[index].id);
    gridRef.current?.querySelectorAll<HTMLButtonElement>('.drawer-app')[index]?.focus();
  }

  if (!isOpen) return null;
  const SelectedIcon = selected?.icon || Grid2X2;

  return (
    <dialog ref={dialogRef} className="app-drawer" aria-labelledby="app-drawer-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={handleKeyDown}>
      <div className="drawer-shell">
        <header className="drawer-header">
          <div className="drawer-heading">
            <span className="drawer-brand-icon"><Sparkles size={20} /></span>
            <div><span className="shell-eyebrow">YOUR MIRAVERSE</span><h1 id="app-drawer-title">App library<span>.</span></h1></div>
          </div>
          <button className="shell-icon-button drawer-close" aria-label="Close app library" onClick={onClose}><X size={19} /></button>
        </header>
        <div className="drawer-body">
          <aside className="drawer-sidebar">
            <span className="shell-eyebrow drawer-section-label">EXPLORE</span>
            <nav aria-label="App categories" className="drawer-categories">
              {categories.map(({ name, icon: Icon }) => (
                <button key={name} aria-pressed={category === name} className={`drawer-category ${category === name ? 'is-active' : ''}`} onClick={() => setCategory(name)}>
                  <Icon size={17} /><span>{name}</span><span className="drawer-category-count">{APPS_DIRECTORY.filter((app) => name === 'All apps' || app.category === name).length}</span>
                </button>
              ))}
            </nav>
            <div className="drawer-citizen">
              <span className="drawer-avatar">{(player?.name || 'Citizen').slice(0, 1).toUpperCase()}</span>
              <div><strong>{player?.name || 'Citizen'}</strong><span>Aureline workspace</span></div>
            </div>
          </aside>
          <section className="drawer-directory" aria-label="Applications">
            <div className="drawer-search">
              <Search size={19} />
              <input ref={searchRef} type="search" aria-label="Search apps" placeholder="Search apps, tools, and worlds…" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} autoComplete="off" />
              {searchQuery ? <button aria-label="Clear search" onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}><X size={15} /></button> : <kbd>↵</kbd>}
            </div>
            <div className="drawer-section-heading"><h2>{query ? 'Search results' : category}</h2><span role="status">{filtered.length} {filtered.length === 1 ? 'app' : 'apps'}</span></div>
            <div className="drawer-grid-scroll">
              <div ref={gridRef} className="drawer-grid">
                {filtered.map((app) => {
                  const Icon = app.icon;
                  const isRunning = windows.some((window) => window.id === app.id);
                  return (
                    <button key={app.id} className={`drawer-app ${selected?.id === app.id ? 'is-selected' : ''}`} aria-label={`Select ${app.code}`} aria-pressed={selected?.id === app.id} onFocus={() => setSelectedId(app.id)} onClick={() => setSelectedId(app.id)} onDoubleClick={() => handleLaunch(app.id)}>
                      <span className={`app-tile-icon ${app.bg} ${app.color}`}><Icon size={25} strokeWidth={1.6} /></span>
                      {isRunning && <span className="app-running-dot" title="Running" aria-label="Running" />}
                      <strong>{app.code}</strong><span className="drawer-app-label">{app.label}</span>
                    </button>
                  );
                })}
              </div>
              {!filtered.length && <div className="drawer-empty"><Search size={30} strokeWidth={1.4} /><h3>No apps found</h3><p>Try another search or explore a different category.</p><button onClick={() => { setSearchQuery(''); setCategory('All apps'); }}>Show all apps <ArrowRight size={15} /></button></div>}
            </div>
          </section>
          <aside className="drawer-inspector" aria-label="App details">
            {selected ? <>
              <div className="drawer-inspector-top"><span className="shell-eyebrow">APP SPOTLIGHT</span><span className={`drawer-state ${running ? 'is-running' : ''}`}><i />{running ? 'Running' : 'Ready to open'}</span></div>
              <div className={`drawer-feature-icon ${selected.bg} ${selected.color}`}><SelectedIcon size={36} strokeWidth={1.4} /></div>
              <span className="drawer-feature-category">{selected.category} <ChevronRight size={12} /> {selected.code}</span>
              <h2>{selected.label}</h2>
              <p className="drawer-description">{selected.desc}</p>
              <dl className="drawer-app-meta"><div><dt>Network</dt><dd>{selected.sector}</dd></div><div><dt>Access</dt><dd>{selected.clearance}</dd></div></dl>
              <button className="drawer-launch" onClick={() => handleLaunch(selected.id)}>{running ? 'Go to app' : 'Open app'}<ArrowRight size={18} /></button>
              <span className="drawer-launch-hint">Double-click an app to open directly</span>
            </> : <div className="drawer-inspector-placeholder"><Grid2X2 size={32} /><p>Your next destination is a search away.</p></div>}
          </aside>
        </div>
        <footer className="drawer-footer"><span><i className="shell-status-dot" /> AURELINE · PERSONAL WORKSPACE</span><span><kbd>↑</kbd><kbd>↓</kbd> Navigate <kbd>↵</kbd> Open <kbd>esc</kbd> Close</span></footer>
      </div>
    </dialog>
  );
}
