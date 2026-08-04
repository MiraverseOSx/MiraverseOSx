// src/components/Desktop.jsx
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays, FileSearch, Gem, LayoutGrid, Mail, Moon, Power,
  Search, Settings, ShieldCheck, Sparkles, Wifi, LogOut, Volume2, VolumeX
} from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { useWorldStore } from '../store/useWorldStore';
import { APPS } from '../apps/registry';
import Window from './Window';
import SparklesCanvas from './SparklesCanvas';
import MAIDock from './MAIDock';
import soundEngine from '../utils/soundEngine';
import ClockDisplay from '../components/ClockDisplay';
import LoginScreen from '../components/LoginScreen';
import MeridionLandingPage from '../components/MeridionLandingPage';
import { useTimeStore } from '../utils/timeEngine';

import { Card } from './ui/card';
import Button from './ui/button';

const Panel = ({ children, className = '' }) => (
  <Card className={'bg-white/72 backdrop-blur-xl ' + className}>{children}</Card>
);

const WHEEL_OF_THE_YEAR = [
  { month: 'January', phase: 'Mid-Winter', icon: '❄️' },
  { month: 'February', phase: 'Late Winter', icon: '🌨️' },
  { month: 'March', phase: 'Early Spring', icon: '🌸' },
  { month: 'April', phase: 'Mid-Spring', icon: '🌧️' },
  { month: 'May', phase: 'Late Spring', icon: '🌿' },
  { month: 'June', phase: 'Early Summer', icon: '☀️' },
  { month: 'July', phase: 'Mid-Summer', icon: '🔥' },
  { month: 'August', phase: 'Late Summer', icon: '🌋' },
  { month: 'September', phase: 'Early Autumn', icon: '🍂' },
  { month: 'October', phase: 'Mid-Autumn', icon: '🌕' },
  { month: 'November', phase: 'Late Autumn', icon: '🌫️' },
  { month: 'December', phase: 'Early Winter', icon: '❄️' },
];

export default function Desktop() {
  const [now, setNow] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSanctuary, setIsSanctuary] = useState(false);
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'register'

  // Authentication store
  const isLoggedIn = useOSStore((s) => s.isLoggedIn);
  const loginUser = useOSStore((s) => s.loginUser);
  const logoutUser = useOSStore((s) => s.logoutUser);

  const windows = useOSStore((s) => s.windows);
  const toggleApp = useOSStore((s) => s.toggleApp);
  const clearActive = useOSStore((s) => s.clearActive);
  const player = useOSStore((s) => s.gameplay.player);
  const corruption = useOSStore((s) => s.gameplay.prismCorruptionLevel);

  const currentMonthIndex = useOSStore((s) => s.gameplay.player.currentMonthIndex || 0);
  const advanceMonth = useOSStore((s) => s.advanceMonth);
  const claimDailyReward = useOSStore((s) => s.claimDailyReward);

  // Time engine integration
  const season = useTimeStore((s) => s.season);
  const tick = useTimeStore((s) => s.tick);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Sync with Express World API backend
  useEffect(() => {
    useWorldStore.getState().syncWorldData();
  }, []);

  // Tick every real second
  useEffect(() => {
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [tick]);

  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  if (!isLoggedIn) {
    if (authView === 'landing') {
      return (
        <MeridionLandingPage
          onSignIn={() => setAuthView('login')}
          onEnroll={() => setAuthView('register')}
        />
      );
    }
    return (
      <LoginScreen
        onLoginSuccess={loginUser}
        initialMode={authView}
        onBackToLanding={() => setAuthView('landing')}
      />
    );
  }

  const launch = (app) => {
    soundEngine.playWindowOpen();
    toggleApp(app);
  };

  return (
    <main
      className={`relative flex h-screen w-screen flex-col overflow-hidden bg-[#eef0f7] text-[#17213f] season-transition ${season}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          clearActive();
          setIsLauncherOpen(false);
        }
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.98),transparent_32%),radial-gradient(circle_at_90%_8%,rgba(211,205,255,.55),transparent_30%),linear-gradient(145deg,#e9ecf5_0%,#fafbff_48%,#e4e6f2_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[.10] [background-image:linear-gradient(rgba(24,34,69,.17)_1px,transparent_1px),linear-gradient(90deg,rgba(24,34,69,.17)_1px,transparent_1px)] [background-size:46px_46px]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[.12]">
        <img src="/logo_icon.png" alt="" className="h-[520px] w-[520px] object-contain mix-blend-multiply" />
      </div>
      <SparklesCanvas />

      {/* Top OS Header Bar */}
      <header
        className="relative z-30 mx-6 mt-5 flex h-14 items-center justify-between border-y border-white/80 bg-white/55 px-5 shadow-[0_10px_35px_rgba(43,55,98,.09)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <div className="grid h-9 w-9 place-items-center border border-[#bcc6ea] bg-[#17213f] text-[#e5e2ff]"><Sparkles size={16} /></div>
          <div>
            <p className="font-serif-y2k text-2xl font-bold leading-none tracking-wide text-[#202051]">MIRAVERSE</p>
            <p className="mt-1 text-[9px] font-semibold tracking-[.22em] text-slate-500">CELESTIAL OPERATING SYSTEM</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[.12em] text-slate-600">
          <Button
            onClick={() => advanceMonth()}
            variant="outline" size="sm" className="flex items-center gap-1 hover:-translate-y-0.5 transition"
            title="Wheel of the Year — Advance Month / Season"
          >
            {WHEEL_OF_THE_YEAR[currentMonthIndex % 12].icon} {WHEEL_OF_THE_YEAR[currentMonthIndex % 12].month} ({WHEEL_OF_THE_YEAR[currentMonthIndex % 12].phase})
          </Button>

          <Button
            onClick={() => claimDailyReward()}
            variant="solid" size="sm" className="flex items-center gap-1 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(251,191,36,0.5)] transition"
            title="Claim 24‑Hour Daily Stipend (+200 Credits, +100 XP)"
          >
            🎁 Daily Stipend
          </Button>

          <ClockDisplay />
          <Wifi size={15} className="text-[#4a5591]" />
        </div>
      </header>

      {/* Main Desktop Area */}
      <div className="relative z-20 flex min-h-0 flex-1 gap-6 p-6">
        <aside className="hidden w-44 shrink-0 border-r border-slate-300/75 pr-4 lg:block">
          <p className="mb-3 text-[9px] font-bold tracking-[.2em] text-slate-500">WORKSPACE</p>
          <nav className="space-y-1">
            <button onClick={() => launch({ id: 'board', title: 'Notice Board', contentKey: 'board' })} className="flex w-full items-center gap-3 border-l-2 border-[#5b63aa] bg-white/60 px-3 py-2.5 text-left text-xs font-semibold text-[#222d58] hover:bg-white/80 transition"><FileSearch size={15} /> Notice Board</button>
            <button onClick={() => launch(APPS.find((app) => app.id === 'comms'))} className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-xs text-slate-600 hover:bg-white/55 transition"><Mail size={15} /> Comms</button>
            <button className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-xs text-slate-600 hover:bg-white/55 transition"><CalendarDays size={15} /> Schedule</button>
            <button className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-xs text-slate-600 hover:bg-white/55 transition"><Gem size={15} /> Personal archive</button>
          </nav>
        </aside>

        <AnimatePresence>
          {!isSanctuary && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="flex min-w-0 flex-col gap-4 xl:col-span-2">
                <Panel className="relative overflow-hidden p-8">
                  <div className="absolute right-0 top-0 h-28 w-56 bg-[radial-gradient(ellipse_at_top_right,rgba(166,157,234,.34),transparent_68%)]" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-bold tracking-[.24em] text-[#6971a4]">ACTIVE INVESTIGATION</p>
                      <h1 className="mt-2 font-serif-y2k text-3xl font-bold text-[#202851]">The Factory Signal</h1>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">A dormant transmission has resurfaced under the old factory. Its source remains unverified.</p>
                    </div>
                    <div className="border border-[#c9c3ee] bg-[#f5f3ff] px-3 py-2 text-right">
                      <p className="text-[8px] font-bold tracking-[.16em] text-[#6b63a5]">CLEARANCE</p>
                      <p className="mt-1 font-mono text-xs font-bold text-[#29345f]">LEVEL 0{player?.clearanceLevel || 1}</p>
                    </div>
                  </div>
                  <div className="relative mt-6 grid grid-cols-3 border-t border-slate-200 pt-4 text-xs">
                    <div><p className="text-[9px] uppercase tracking-widest text-slate-500">Leads</p><p className="mt-1 font-serif-y2k text-xl font-bold">04</p></div>
                    <div className="border-x border-slate-200 px-4"><p className="text-[9px] uppercase tracking-widest text-slate-500">Evidence</p><p className="mt-1 font-serif-y2k text-xl font-bold">12</p></div>
                    <div className="pl-4"><p className="text-[9px] uppercase tracking-widest text-slate-500">Status</p><p className="mt-1 text-[11px] font-bold text-[#6460a8]">OBSERVING</p></div>
                  </div>
                </Panel>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Panel className="p-5">
                    <div className="flex items-center justify-between"><p className="text-[9px] font-bold tracking-[.19em] text-slate-500">ENCRYPTED COMMS</p><Mail size={15} className="text-[#626db3]" /></div>
                    <div className="mt-5 border-l-2 border-[#8b82d1] pl-3">
                      <p className="text-xs font-bold text-[#26305b]">Voss / secure line</p>
                      <p className="mt-1 text-xs text-slate-600"> Do not broadcast this. </p>
                      <button onClick={() => launch(APPS.find((a) => a.id === 'comms'))} className="mt-3 text-[10px] font-bold tracking-wider text-[#5952a1] hover:underline">
                        OPEN TRANSMISSION
                      </button>
                    </div>
                  </Panel>
                  <Panel className="p-5">
                    <div className="flex items-center justify-between"><p className="text-[9px] font-bold tracking-[.19em] text-slate-500">TODAY'S RITUALS</p><CalendarDays size={15} className="text-[#626db3]" /></div>
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="flex justify-between border-b border-slate-200 pb-2"><span>Orientation archive</span><span className="font-mono text-slate-500">20:00</span></div>
                      <div className="flex justify-between"><span>Veil observance</span><span className="font-mono text-slate-500">22:30</span></div>
                    </div>
                  </Panel>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <Panel className="p-5">
                  <div className="flex items-center justify-between"><p className="text-[9px] font-bold tracking-[.19em] text-slate-500">PLAYER RECORD</p><ShieldCheck size={16} className="text-[#606ab2]" /></div>
                  <p className="mt-5 font-serif-y2k text-2xl font-bold text-[#202851]">{player?.name || 'Player'}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="border-t border-slate-200 pt-2"><p className="text-[9px] uppercase tracking-wider text-slate-500">Level</p><p className="mt-1 font-mono font-bold">{player?.level || 1}</p></div>
                    <div className="border-t border-slate-200 pt-2"><p className="text-[9px] uppercase tracking-wider text-slate-500">Credits</p><p className="mt-1 font-mono font-bold">₡{player?.credits || 0}</p></div>
                  </div>
                </Panel>
                <Panel className="p-5">
                  <p className="text-[9px] font-bold tracking-[.19em] text-slate-500">VEIL CONDITION</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div><p className="font-serif-y2k text-2xl font-bold text-[#202851]">Flicker</p><p className="mt-1 text-[11px] text-slate-600">PRISM activity detected</p></div>
                    <p className="font-mono text-xl text-[#6a62ac]">{corruption}%</p>
                  </div>
                  <div className="mt-4 h-1 bg-[#e4e2f1]"><div className="h-full bg-[#7270bb]" style={{ width: corruption + '%' }} /></div>
                </Panel>
                <Panel className="p-5">
                  <p className="text-[9px] font-bold tracking-[.19em] text-slate-500">CASE NOTE</p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">The network has started using names that do not exist in the public archive.</p>
                </Panel>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {isSanctuary && (
          <div className="flex flex-1 items-center justify-center">
            <div className="border-y border-white/70 bg-white/35 px-8 py-5 text-center backdrop-blur-sm rounded-xl">
              <Moon className="mx-auto text-[#5e68ad]" size={18} />
              <p className="mt-2 font-serif-y2k text-xl font-bold text-[#28315f]">Sanctuary active</p>
              <p className="mt-1 text-[10px] tracking-wider text-slate-600">THE DESKTOP HAS BEEN CLEARED</p>
            </div>
          </div>
        )}

        {/* Windows Rendering */}
        <AnimatePresence>
          {windows.filter((win) => !win.isMinimized).map((win) => (
            <Window key={win.id} win={win} />
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Taskbar & Holographic App Launcher Dock */}
      <footer className="relative z-30 mx-6 mb-5 flex h-12 items-center justify-between border border-white/80 bg-white/65 px-3 shadow-[0_10px_35px_rgba(43,55,98,.1)] backdrop-blur-xl">
        <div className="relative flex items-center gap-3">
          {/* FLOATING SOFT CELESTIAL Y2K APP LAUNCHER POPUP */}
          <AnimatePresence>
            {isLauncherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                className="absolute bottom-14 left-0 grid w-[400px] grid-cols-4 gap-2.5 rounded-2xl bg-white/92 backdrop-blur-2xl p-4 shadow-[0_16px_40px_-8px_rgba(80,90,120,0.35)] z-50 border border-white/90 select-none"
              >
                <div className="col-span-4 flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-1 px-1">
                  <div className="flex items-center gap-1.5 font-serif-y2k text-xs font-bold text-[#1d2650]">
                    <Sparkles size={14} className="text-[#5f6ab0]" /> APPLICATION ARCHIVE
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase">CELESTIAL OS</span>
                </div>
                {APPS.map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        launch(app);
                        setIsLauncherOpen(false);
                      }}
                      className="group flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-[#FAFAFC] p-2.5 text-center transition hover:scale-[1.03] hover:border-[#8c97d6] hover:bg-[#eef0fb] shadow-sm"
                    >
                      <div className="p-2 rounded-xl bg-[#e9ebf6] text-[#5f6ab0] group-hover:bg-[#9DA9CB] group-hover:text-white transition">
                        <Icon size={18} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#1d2650] group-hover:text-[#162241]">{app.title}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsLauncherOpen((open) => !open)}
            className="flex items-center gap-2 border-r border-slate-300 pr-4 text-[10px] font-bold tracking-[.14em] text-[#26315c] hover:text-cyan-600 transition"
          >
            <LayoutGrid size={16} /> ARCHIVE
          </button>

          {/* Open Apps / Window Taskbar Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md">
            {windows.map((win) => (
              <button
                key={win.id}
                onClick={() => toggleApp(win)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition ${
                  !win.isMinimized
                    ? 'bg-[#17213f] text-white border-[#17213f] shadow-sm'
                    : 'bg-white/60 text-slate-700 border-slate-300 hover:bg-white'
                }`}
              >
                <span className="truncate max-w-[100px]">{win.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden w-64 items-center border border-slate-300 bg-white/65 px-3 py-1.5 sm:flex">
            <Search size={13} className="mr-2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search archive"
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
          </div>
          <MAIDock />

          <button
            onClick={toggleSound}
            className="p-2 text-slate-500 hover:text-[#293360] transition"
            title={isMuted ? "Unmute Audio Engine" : "Mute Audio Engine"}
          >
            {isMuted ? <VolumeX size={16} className="text-rose-500" /> : <Volume2 size={16} className="text-[#4e5792]" />}
          </button>

          <button
            onClick={() => setIsSanctuary((active) => !active)}
            className={'flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-[.12em] transition ' + (isSanctuary ? 'bg-[#28325f] text-white' : 'text-[#4e5792] hover:bg-[#ecebf7]')}
          >
            <Moon size={14} /> SANCTUARY
          </button>
          <button onClick={() => launch({ id: 'settings', title: 'Settings', contentKey: 'settings' })} className="p-2 text-slate-500 hover:text-[#293360]" title="Settings">
            <Settings size={16} />
          </button>
          <button onClick={() => logoutUser()} className="p-2 text-slate-500 hover:text-red-500 transition" title="Log Out / Lock Screen">
            <LogOut size={16} />
          </button>
        </div>
      </footer>
    </main>
  );
}
