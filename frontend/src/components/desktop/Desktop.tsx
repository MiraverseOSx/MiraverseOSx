import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Search, Sparkles } from 'lucide-react';
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
import CelestialScene from './CelestialScene';
import DesktopWidgetRail from './DesktopWidgetRail';
import logoIcon from '../../assets/images/logo_icon.png';
import '../../styles/apps/Desktop.css';

export default function Desktop() {
  const { isLoggedIn, windows, isSanctuary, gameplay, wallpaper } = useOSStore();
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

  const firstName = gameplay?.player?.name?.split(' ')[0] || 'Citizen';

  return (
    <main className="mira-desktop">
      <div className="desktop-wallpaper" aria-hidden="true" style={wallpaper ? { backgroundImage: `linear-gradient(#15213c99, #15213cbb), url(${JSON.stringify(wallpaper)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}><div className="desktop-orbit orbit-one" /><div className="desktop-orbit orbit-two" /><div className="desktop-orbit orbit-three" /></div>
      {!reducedMotion && <div className="desktop-particles" aria-hidden="true"><SparklesCanvas /></div>}
      <header className="desktop-menubar">
        <div className="desktop-wordmark"><img src={logoIcon} alt="" /><strong>MIRAVERSE<span>OS x</span></strong><span className="desktop-menu-divider" /><span className="desktop-location">Aureline</span></div>
        <div className="desktop-menubar-right"><span className="desktop-connection"><i className="shell-status-dot" />Personal workspace</span><time dateTime={now.toISOString()}>{now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}<span>{now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></time></div>
      </header>
      <div ref={appWorkspaceRef} className="desktop-workspace">
        <div className="desktop-celestial-art" aria-hidden="true"><CelestialScene /><div className="desktop-world-caption"><span>01 / THE AURELINE CHAPTER</span><span>A world waiting to unfold.</span></div></div>
        <section className="desktop-welcome" aria-label="Your workspace">
          <span className="desktop-welcome-label"><Sparkles size={13} /> A LITTLE SPACE. ENDLESS POSSIBILITY.</span>
          <div className="desktop-emblem"><img src={logoIcon} alt="Miraverse emblem" /></div>
          <p className="desktop-greeting">Welcome to your universe, {firstName}.</p>
          <h1>Make space for<br /><em>something extraordinary.</em></h1>
          <p className="desktop-welcome-description">Your world, your tools, your next discovery.<br />Everything begins here.</p>
        </section>
        <DesktopWidgetRail now={now} />
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
