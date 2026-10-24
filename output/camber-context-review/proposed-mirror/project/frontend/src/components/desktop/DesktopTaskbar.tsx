import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { createPortal } from 'react-dom';
import { APPS_DIRECTORY, launchDesktopApp } from './appDirectory';
import MAIDock from '../widgets/MAIDock';
import { Smartphone, Power, Volume2, VolumeX, Grid2X2, Globe, Folder, Mail } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';

export interface DesktopTaskbarProps {
  onTogglePhone: () => void;
  onOpenLauncher: () => void;
  isLauncherOpen: boolean;
}

const pinned = [{ id: 'browser', icon: Globe }, { id: 'files', icon: Folder }, { id: 'mail', icon: Mail }];

export default function DesktopTaskbar({ onTogglePhone, onOpenLauncher, isLauncherOpen }: DesktopTaskbarProps) {
  const [tooltip, setTooltip] = React.useState<{ text: string; x: number; y: number } | null>(null);
  const showTooltip = (event: React.SyntheticEvent<HTMLButtonElement>, text: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({ text, x: Math.max(90, Math.min(window.innerWidth - 90, rect.left + rect.width / 2)), y: rect.top - 12 });
  };
  const { windows, toggleApp, logoutUser, activeWindowId } = useOSStore();
  const workCalls = useOSStore(state => Object.values(state.gameplay.player.assignmentJournal?.dispatches || {}).filter((dispatch: any) => dispatch.channel === 'phone' && !dispatch.heardAt).length);
  const { soundEnabled, toggleSound } = useSystemStore();
  const playClick = () => { if (soundEnabled) SoundFX.playSnap(); };
  const apps = [...pinned, ...windows.filter((win) => !pinned.some((app) => app.id === win.id)).map((win) => ({ id: win.id, icon: Grid2X2 }))];

  return (
    <nav className="desktop-taskbar" aria-label="Desktop taskbar">
      <div className="desktop-dock">
      <button className="dock-library" aria-label="Open Orbit" aria-haspopup="dialog" aria-expanded={isLauncherOpen} title="Orbit (Ctrl+Space)" onClick={() => { playClick(); onOpenLauncher(); }}><Grid2X2 size={20} /><span>Orbit</span></button>
      <span className="dock-divider" />
      <div className="dock-apps" aria-label="Pinned and running apps" onScroll={() => setTooltip(null)}>
        {apps.map((app) => {
          const meta = APPS_DIRECTORY.find((candidate) => candidate.id === app.id);
          const Icon = meta?.icon || app.icon;
          const win = windows.find((candidate) => candidate.id === app.id);
          const active = win && activeWindowId === app.id && !win.isMinimized;
          const name = meta?.label || win?.title || app.id;
          return <button key={app.id} className={`dock-app ${active ? 'is-active' : ''}`} aria-label={`${win ? 'Toggle' : 'Open'} ${name}`} aria-pressed={!!active} onMouseEnter={event => showTooltip(event, name)} onMouseLeave={() => setTooltip(null)} onFocus={event => showTooltip(event, name)} onBlur={() => setTooltip(null)} onClick={() => { setTooltip(null); playClick(); win ? toggleApp(win) : launchDesktopApp(app.id); }}><Icon size={21} strokeWidth={1.6} aria-hidden="true"/>{win && <i aria-hidden="true" className={`dock-running-dot ${active ? 'is-active' : ''}`} />}</button>;
        })}
      </div>
      </div>
      <div className="dock-utilities" role="group" aria-label="System tray">
        <MAIDock />
        <button className="shell-icon-button dock-phone" aria-label="Toggle phone" title={workCalls ? `${workCalls} incoming work call` : 'Phone'} onClick={() => { playClick(); onTogglePhone(); }}><Smartphone size={18} />{workCalls > 0 && <span className="assignment-call-badge" aria-label={`${workCalls} incoming work call`}>{workCalls}</span>}</button>
        <button className="shell-icon-button" aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'} aria-pressed={soundEnabled} title={soundEnabled ? 'Mute audio' : 'Unmute audio'} onClick={() => { toggleSound(); if (!soundEnabled) SoundFX.playSnap(); }}>{soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <button className="shell-icon-button dock-power" aria-label="Log out" title="Log out" onClick={logoutUser}><Power size={17} /></button>
      </div>
      {tooltip && createPortal(<div className="taskbar-tooltip" role="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>{tooltip.text}</div>, document.body)}
    </nav>
  );
}
