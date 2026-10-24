import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronRight, Grid2X2, Search, X, Shield, UserRound, Globe, Wrench, LayoutGrid, Sparkles } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';
import { APPS_DIRECTORY, launchDesktopApp } from './appDirectory';
import AppGlyph from '../ui/AppGlyph';

export { APPS_DIRECTORY, PROTOCOLS } from './appDirectory';
export type { ProtocolItem } from './appDirectory';

export interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { name: 'All apps', icon: Grid2X2 },
  { name: 'Personal', icon: UserRound },
  { name: 'Connect', icon: Globe },
  { name: 'Civic', icon: LayoutGrid },
  { name: 'Agency', icon: Shield },
  { name: 'Tools', icon: Wrench },
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
            <div><span className="shell-eyebrow">YOUR TOOLS, IN REACH</span><h1 id="app-drawer-title">Orbit</h1></div>
          </div>
          <button className="shell-icon-button drawer-close" aria-label="Close Orbit" onClick={onClose}><X size={19} /></button>
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
                      <AppGlyph className="app-tile-icon" icon={Icon} appId={app.id} />
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
              <AppGlyph className="drawer-feature-icon" icon={SelectedIcon} appId={selected.id} size="large" />
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
