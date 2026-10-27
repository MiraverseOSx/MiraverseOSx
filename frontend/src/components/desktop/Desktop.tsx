import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOSStore } from '../../store/useOSStore';
import Window from '../ui/Window';
import PhoneWidget from '../widgets/PhoneWidget';
import MeridionLandingPage from '../ui/MeridionLandingPage';
import LoginScreen from '../ui/LoginScreen';
import DesktopTaskbar from './DesktopTaskbar';
import AppLauncherModal from './AppLauncherModal';
import SanctuaryOverlay from './SanctuaryOverlay';
import ToastViewport from '../widgets/ToastViewport';
import PurpleWallpaper from './PurpleWallpaper';
import DesktopSurface from './DesktopSurface';
import { DesktopMusicProvider } from './DesktopMusic';
import MAIDock from '../widgets/MAIDock';
import { Smartphone, Volume2, VolumeX, Power, SlidersHorizontal, Check } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

import logoIcon from '../../assets/images/logo_icon.png';
import '../../styles/apps/Desktop.css';
import '../../styles/apps/PersonalDesktop.css';
import '../../styles/studio-design.css';
import '../../styles/apps/DesktopLayout.css';
import { desktopThemeStyle } from '../../store/desktopThemes';
import { useCommsStore } from '../../store/useCommsStore';
import { getCelestialState } from '../../data/meridionWorld';

export default function Desktop() {
  const { isLoggedIn, windows, isSanctuary, gameplay, wallpaper, desktopPreferences, desktopAction, logoutUser } = useOSStore();
  const [editing,setEditing]=useState(false);
  const {soundEnabled,toggleSound}=useSystemStore();
  const incomingCalls=useOSStore(state=>Object.values(state.gameplay.player.assignmentJournal?.dispatches||{}).filter((d:any)=>d.channel==='phone'&&!d.heardAt).length);
  const celestial = getCelestialState(gameplay?.timeCycleCount ?? 28);
  const themeId = useOSStore(state => state.desktopPreferences.themeId);
  const appWorkspaceRef = useRef(null);
  const [authMode, setAuthMode] = useState(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const phoneRequest = useCommsStore(s => s.phoneRequest);
  useEffect(() => { if (phoneRequest) setIsPhoneOpen(true); }, [phoneRequest]);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (isLoggedIn) useOSStore.getState().refreshAssignmentDispatches();
  }, [isLoggedIn, gameplay.player.clearanceLevel, gameplay.timeCycleCount]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReducedMotion(media.matches);
    const onVisibilityChange = () => setPageVisible(!document.hidden);
    media.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => { window.clearInterval(timer); media.removeEventListener('change', onMotionChange); document.removeEventListener('visibilitychange', onVisibilityChange); };
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

  return (
    <DesktopMusicProvider><main className="mira-desktop" data-theme={themeId} style={desktopThemeStyle(themeId) as React.CSSProperties}>
      {wallpaper ? <div className="personal-wallpaper-image" aria-hidden="true" style={{ backgroundImage: `linear-gradient(#20132d44, #20132d66), url(${JSON.stringify(wallpaper)})` }}/> : <PurpleWallpaper animated={!reducedMotion && pageVisible}/>}
      <header className="desktop-menubar">
        <div className="desktop-wordmark"><img src={logoIcon} alt="" /><strong>MIRAVERSE<span>OS x</span></strong><span className="desktop-menu-divider" /><span className="desktop-location">Aureline</span></div>
        <div className="desktop-layout-controls"><select aria-label="Desktop layout" value={desktopPreferences.activeLayout} onChange={e=>desktopAction({type:'layout',id:e.target.value as any})}><option value="everyday">Everyday</option><option value="personal">Personal</option><option value="work">Work</option></select><button aria-label={editing?'Finish customizing desktop':'Customize Desktop'} aria-pressed={editing} onClick={()=>setEditing(v=>!v)}>{editing?<Check size={15}/>:<SlidersHorizontal size={15}/>}<span>{editing?'Done':'Customize'}</span></button></div>
        <div className="desktop-menubar-right">
          <button
            type="button"
            className="desktop-celestial-badge"
            title={`Radiance (${celestial.radiance.phaseName}) · Echo (${celestial.echo.phaseName})\n${celestial.alignment}\nCycle ${celestial.cycle} • ${celestial.monthName} ${celestial.dayOfMonth}${celestial.isFoundingDay ? ' (Founding Day)' : ''}`}
            onClick={() => useOSStore.getState().openAppWorkspace('lore', 'chronology')}
            aria-label="Celestial Moons and Calendar"
          >
            <span className="moon-icon" title={`Radiance: ${celestial.radiance.phaseName}`}>{celestial.radiance.phaseIcon}</span>
            <span className="moon-icon opacity-80" title={`Echo: ${celestial.echo.phaseName}`}>{celestial.echo.phaseIcon}</span>
            <span className="celestial-cycle font-mono text-[11px] font-semibold opacity-90">C{celestial.cycle}</span>
          </button>
          <div className="desktop-system-controls" role="group" aria-label="System tray"><MAIDock/><button className="shell-icon-button" aria-label="Toggle phone" title={incomingCalls?`${incomingCalls} incoming work call`:'Phone'} onClick={()=>setIsPhoneOpen(v=>!v)}><Smartphone size={17}/>{incomingCalls>0&&<span className="desktop-call-count">{incomingCalls}</span>}</button><button className="shell-icon-button" aria-label={soundEnabled?'Mute audio':'Unmute audio'} aria-pressed={soundEnabled} onClick={toggleSound}>{soundEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><button className="shell-icon-button" aria-label="Log out" onClick={logoutUser}><Power size={17}/></button></div>
          <time dateTime={now.toISOString()}>{now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}<span>{now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></time>
        </div>
      </header>
      <div ref={appWorkspaceRef} className="desktop-workspace">
        <DesktopSurface editing={editing}/>
        {isSanctuary && <SanctuaryOverlay />}
      </div>
      <AnimatePresence>{windows.filter((win) => !win.isMinimized).map((win) => <Window key={win.id} win={win} windowIndex={windows.findIndex((candidate) => candidate.id === win.id)} isFocusMode={true} workspaceRef={appWorkspaceRef} />)}</AnimatePresence>
      {isPhoneOpen && <div className="desktop-phone"><PhoneWidget onClose={() => setIsPhoneOpen(false)} /></div>}
      <AppLauncherModal isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} />
      <DesktopTaskbar onTogglePhone={() => setIsPhoneOpen((open) => !open)} onOpenLauncher={() => setIsLauncherOpen(true)} isLauncherOpen={isLauncherOpen} />
      <ToastViewport />
    </main></DesktopMusicProvider>
  );
}
