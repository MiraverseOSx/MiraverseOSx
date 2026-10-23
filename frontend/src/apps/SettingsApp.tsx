import React, { useState } from 'react';
import LocalCredentials from './LocalCredentials';
import { Check, ChevronRight, HardDrive, Info, Palette, Settings2, Volume2 } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { useSystemStore } from '../store/useSystemStore';
import { SoundFX } from '../utils/audio';
import PurpleWallpaper from '../components/desktop/PurpleWallpaper';
import WorldSaveSettings from './WorldSaveSettings';
import '../styles/apps/Settings.css';
import { DESKTOP_THEMES, desktopThemeStyle } from '../store/desktopThemes';

const sections = [
  { id: 'appearance', title: 'Appearance', detail: 'Make it your space', icon: Palette },
  { id: 'sound', title: 'Sound', detail: 'System audio', icon: Volume2 },
  { id: 'save', title: 'Save & sync', detail: 'Progress & recovery', icon: HardDrive },
  { id: 'credentials', title: 'Credentials', detail: 'Player access & institutions', icon: Settings2 },
  { id: 'about', title: 'About', detail: 'Your Miraverse system', icon: Info },
] as const;
const wallpapers = [
  { name: 'Aureline Orbit', detail: 'Your palette, ribbons & starlight', url: '' },
  { name: 'Blue horizon', detail: 'Earth from above', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' },
  { name: 'Machine study', detail: 'A quiet technical study', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Night district', detail: 'City lights after dark', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop' },
];

export default function SettingsApp() {
  const [selected, setSelected] = useState<typeof sections[number]['id']>('appearance');
  const wallpaper = useOSStore(state => state.wallpaper);
  const setWallpaper = useOSStore(state => state.setWallpaper);
  const themeId = useOSStore(state => state.desktopPreferences.themeId);
  const setDesktopTheme = useOSStore(state => state.setDesktopTheme);
  const soundEnabled = useSystemStore(state => state.soundEnabled);
  const setSoundEnabled = useSystemStore(state => state.setSoundEnabled);
  const section = sections.find(item => item.id === selected)!;
  const selectedWallpaper = wallpapers.find(item => item.url === wallpaper);
  return <div className="settings-app">
    <div className="settings-layout">
      <aside className="settings-sidebar">
        <header className="settings-brand"><span><Settings2 size={21} aria-hidden="true" /></span><div><h1>Settings</h1><p>A little more you.</p></div></header>
        <nav aria-label="Settings sections">{sections.map(({ id, title, detail, icon: Icon }) => <button key={id} data-section={id} aria-current={selected === id ? 'page' : undefined} onClick={() => setSelected(id)} aria-controls="settings-content"><Icon size={18} aria-hidden="true" /><span><strong>{title}</strong><small>{detail}</small></span><ChevronRight size={14} aria-hidden="true" /></button>)}</nav>
        <footer><span className="settings-orbit-dot" />MIRAVERSE OS x<span>Personal system preferences</span></footer>
      </aside>
      <main key={selected} className="settings-content" id="settings-content" aria-labelledby="settings-section-title">
        <header className="settings-page-heading"><p>SYSTEM / {section.title.toUpperCase()}</p><h2 id="settings-section-title">{section.title}</h2><span>{selected === 'appearance' ? 'A familiar space, with your own point of view.' : selected === 'sound' ? 'Choose how your desktop sounds.' : selected === 'save' ? 'Keep your world ready for the next visit.' : 'One desktop. A connected world.'}</span></header>
        {selected === 'appearance' && <>
          <div className="settings-section-heading"><div><h3>Color collection</h3><p>A palette for your desktop, windows, and workspace.</p></div></div>
          <div className="settings-theme-collection" role="group" aria-label="Desktop color theme">{DESKTOP_THEMES.map(theme => <button key={theme.id} className="settings-theme-option" style={desktopThemeStyle(theme.id) as React.CSSProperties} aria-pressed={themeId === theme.id} onClick={() => setDesktopTheme(theme.id)}>
            <span className="settings-theme-art"><span/>{themeId === theme.id && <Check size={16} aria-hidden="true"/>}</span>
            <span className="settings-theme-palette">{theme.colors.map(color => <i key={color} style={{ background: color }}/>)}</span>
            <strong>{theme.name}</strong><small>{theme.detail}</small>
          </button>)}</div>
          <div className="settings-desktop-preview" aria-label={`Current wallpaper: ${selectedWallpaper?.name || 'Custom wallpaper'}`}>
            {wallpaper ? <div className="settings-wallpaper-image" style={{ backgroundImage: `url(${JSON.stringify(wallpaper)})` }} /> : <PurpleWallpaper animated={false} />}
            <div className="settings-preview-bar"><span>MIRAVERSE OS x</span><span>Aureline</span></div><div className="settings-preview-dock"><span /><span /><span /><span /></div>
          </div>
          <div className="settings-section-heading"><div><h3>Desktop wallpaper</h3><p>{selectedWallpaper?.name || 'Your custom wallpaper'} · Changes apply automatically</p></div>{wallpaper && <button className="settings-text-button" onClick={() => setWallpaper('')}>Reset to default</button>}</div>
          <div className="settings-wallpapers" role="group" aria-label="Desktop wallpaper">{wallpapers.map(item => <button key={item.name} className="settings-wallpaper-option" aria-pressed={wallpaper === item.url} onClick={() => setWallpaper(item.url)}>
            <span className="settings-wallpaper-swatch">{item.url ? <span className="settings-wallpaper-image" style={{ backgroundImage: `url(${JSON.stringify(item.url)})` }} /> : <PurpleWallpaper animated={false} />}{wallpaper === item.url && <span className="settings-wallpaper-check"><Check size={14} aria-hidden="true" /></span>}</span>
            <strong>{item.name}</strong><small>{item.detail}</small>
          </button>)}</div>
          <p className="settings-footnote">The default wallpaper is available offline. Photo wallpapers need an internet connection. Desktop animation follows your device’s reduced-motion preference.</p>
        </>}
        {selected === 'sound' && <section className="settings-group" aria-labelledby="settings-audio-heading"><h3 id="settings-audio-heading">Desktop audio</h3><div className="settings-preference-row"><div><strong id="settings-sound-label">System sounds</strong><p id="settings-sound-help">Interface sounds and desktop audio. This is the same control as the taskbar speaker.</p></div><button className="settings-switch" role="switch" aria-labelledby="settings-sound-label" aria-describedby="settings-sound-help" aria-checked={soundEnabled} onClick={() => setSoundEnabled(!soundEnabled)}><span /></button></div><div className="settings-preference-row"><div><strong>Listen to a preview</strong><p>Play a short interface sound.</p></div><button className="settings-secondary-button" disabled={!soundEnabled} onClick={() => SoundFX.playSnap()}><Volume2 size={16} aria-hidden="true" />Play sound</button></div></section>}
        {selected === 'save' && <WorldSaveSettings />}
        {selected === 'credentials' && <LocalCredentials />}
        {selected === 'about' && <><div className="settings-about-mark"><Settings2 size={28} aria-hidden="true" /><div><h3>MiraverseOSx</h3><p>Your desktop in Aureline</p></div></div><section className="settings-group" aria-label="System information"><dl className="settings-details"><div><dt>World</dt><dd>Aureline</dd></div><div><dt>Experience</dt><dd>Local single-player</dd></div><div><dt>Storage</dt><dd>Local database with device fallback</dd></div><div><dt>Appearance</dt><dd>Neutral surfaces with purposeful accents</dd></div></dl></section><p className="settings-footnote">Your apps share one world. Manage database saves and recovery in <button className="settings-inline-link" onClick={() => setSelected('save')}>Save & sync</button>.</p></>}
      </main>
    </div>
  </div>;
}
