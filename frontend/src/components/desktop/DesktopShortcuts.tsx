import React from 'react';
import { APPS_DIRECTORY, launchDesktopApp } from './appDirectory';
import { useOSStore } from '../../store/useOSStore';

export default function DesktopShortcuts() {
  const ids = useOSStore(s => s.desktopPreferences.shortcutIds);
  const shortcuts = ids.map(id => APPS_DIRECTORY.find(app => app.id === id)).filter(Boolean);
  return (
    <nav className="personal-shortcuts" aria-label="Desktop shortcuts">
      {shortcuts.map(app => { const Icon = app!.icon; return <button key={app!.id} className="personal-shortcut" onClick={() => launchDesktopApp(app!.id)} title={app!.name}>
        <span className="personal-shortcut-icon"><Icon size={27} strokeWidth={1.5}/></span><span>{app!.label}</span>
      </button>; })}
    </nav>
  );
}
