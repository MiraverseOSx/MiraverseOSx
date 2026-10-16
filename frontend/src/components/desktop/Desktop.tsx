import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Command, Grid2X2, Search, Sparkles } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import Window from '../ui/Window';
import PhoneWidget from '../widgets/PhoneWidget';
import SparklesCanvas from '../widgets/SparklesCanvas';
import MeridionLandingPage from '../ui/MeridionLandingPage';
import LoginScreen from '../ui/LoginScreen';
import DesktopTaskbar from './DesktopTaskbar';
import AppLauncherModal from './AppLauncherModal';
import SanctuaryOverlay from './SanctuaryOverlay';
import ToastViewport from '../widgets/ToastViewport';
import { APPS_DIRECTORY, launchDesktopApp } from './appDirectory';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';
import logoIcon from '../../assets/images/logo_icon.png';
import '../../styles/apps/Desktop.css';

const shortcuts = ['browser', 'files', 'mail', 'passport', 'board', 'spellforge'];

export default function Desktop() {
  const { isLoggedIn, windows, isSanctuary, gameplay } = useOSStore();
  const soundEnabled = useSystemStore((state) => state.soundEnabled);
  const appWorkspaceRef = useRef(null);
  const [authMode, setAuthMode] = useState(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReducedMotion(media.matches);
    media.addEventListener('change', onMotionChange);
    return () => { window.clearInterval(timer); media.removeEventListener('change', onMotionChange); };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLoggedIn && (event.ctrlKey || event.metaKey) && event.code === 'Space') {
        event.preventDefault();
        setIsLauncherOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    if (authMode) return <LoginScreen initialMode={authMode} onLoginSuccess={(userData) => { useOSStore.getState().loginUser(userData); setAuthMode(null); }} onBackToLanding={() => setAuthMode(null)} />;
    return <MeridionLandingPage onSignIn={() => setAuthMode('login')} onEnroll={() => setAuthMode('register')} onDirectLaunch={() => useOSStore.getState().loginUser({ name: 'Netrunner One', clearance: 1, credits: 1500, level: 1 })} />;
  }

  const openShortcut = (id: string) => {
    if (soundEnabled) SoundFX.playSnap();
    launchDesktopApp(id);
  };
  const firstName = gameplay?.player?.name?.split(' ')[0] || 'Citizen';
  const cycle = gameplay?.timeCycleCount || 1;
  const segment = ['Morning', 'Afternoon', 'Evening', 'Night'][gameplay?.timeSegmentIndex || 0];

  return (
    <main className="mira-desktop">
      <div className="desktop-wallpaper" aria-hidden="true"><div className="desktop-orbit orbit-one" /><div className="desktop-orbit orbit-two" /><div className="desktop-orbit orbit-three" /></div>
      {!reducedMotion && <div className="desktop-particles" aria-hidden="true"><SparklesCanvas /></div>}
      <header className="desktop-menubar">
        <div className="desktop-wordmark"><img src={logoIcon} alt="" /><strong>MIRAVERSE<span>OS x</span></strong><span className="desktop-menu-divider" /><span className="desktop-location">Aureline</span></div>
        <div className="desktop-menubar-right"><span className="desktop-connection"><i className="shell-status-dot" />Personal workspace</span><time dateTime={now.toISOString()}>{now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}<span>{now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></time></div>
      </header>
      <div ref={appWorkspaceRef} className="desktop-workspace">
        <section className="desktop-shortcuts" aria-label="Desktop shortcuts">
          <span className="shell-eyebrow">QUICK ACCESS</span>
          <div className="desktop-shortcut-grid">
            {shortcuts.map((id) => {
              const app = APPS_DIRECTORY.find((candidate) => candidate.id === id)!;
              const Icon = app.icon;
              return <button key={id} className="desktop-shortcut" onClick={() => openShortcut(id)} aria-label={`Open ${app.label}`}><span className={`desktop-shortcut-icon ${app.bg} ${app.color}`}><Icon size={26} strokeWidth={1.5} /></span><span>{app.code}</span></button>;
            })}
          </div>
        </section>
        <section className="desktop-welcome" aria-label="Your workspace">
          <span className="desktop-welcome-label"><Sparkles size={13} /> A LITTLE SPACE. ENDLESS POSSIBILITY.</span>
          <div className="desktop-emblem"><img src={logoIcon} alt="Miraverse emblem" /></div>
          <p className="desktop-greeting">Welcome to your universe, {firstName}.</p>
          <h1>Make space for<br /><em>something extraordinary.</em></h1>
          <p className="desktop-welcome-description">Your world, your tools, your next discovery.<br />Everything begins here.</p>
          <button className="desktop-library-button" onClick={() => setIsLauncherOpen(true)}><Grid2X2 size={17} />Enter Orbit<ArrowUpRight size={16} /></button>
          <span className="desktop-keyboard-hint"><Command size={11} /> Ctrl / ⌘ + Space to open Orbit</span>
        </section>
        <div className="desktop-workspace-note"><span className="desktop-note-star">✧</span><div><span className="shell-eyebrow">THE AURELINE CHAPTER</span><p>Cycle {cycle.toString().padStart(2, '0')} <span>/</span> {segment}</p></div></div>
        <button className="desktop-search-button" onClick={() => setIsLauncherOpen(true)} aria-label="Search your apps"><Search size={16} /><span>Find your next destination</span><ArrowUpRight size={14} /></button>
        {isSanctuary && <SanctuaryOverlay />}
      </div>
      <AnimatePresence>{windows.filter((win) => !win.isMinimized).map((win) => <Window key={win.id} win={win} windowIndex={windows.findIndex((candidate) => candidate.id === win.id)} isFocusMode={true} workspaceRef={appWorkspaceRef} />)}</AnimatePresence>
      {isPhoneOpen && <div className="desktop-phone"><PhoneWidget onClose={() => setIsPhoneOpen(false)} /></div>}
      <AppLauncherModal isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} />
      <DesktopTaskbar onTogglePhone={() => setIsPhoneOpen((open) => !open)} onOpenLauncher={() => setIsLauncherOpen(true)} isLauncherOpen={isLauncherOpen} />
      <ToastViewport />
    </main>
  );
}
