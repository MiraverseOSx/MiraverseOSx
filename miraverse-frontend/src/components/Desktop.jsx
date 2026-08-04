// src/components/Desktop.jsx
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays, FileSearch, Gem, LayoutGrid, Mail, Moon, Power,
  Search, Settings, ShieldCheck, Sparkles, Wifi, LogOut, Volume2, VolumeX,
  UserCheck, Shield, ChevronRight, Bell, HeartPulse, CheckCircle2, User, Globe,
  Smartphone, Folder, Cpu, Activity, Radio, FileText, Bot, HelpCircle, X
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
import DocumentModal from '../components/DocumentModal';
import SignalPlayerModal from '../components/SignalPlayerModal';
import PhoneWidget from '../components/PhoneWidget';
import { useTimeStore } from '../utils/timeEngine';

import { Card } from './ui/card';
import Button from './ui/button';

const Panel = ({ children, className = '' }) => (
  <Card className={'meridion-card p-5 transition-all duration-300 text-purple-100 ' + className}>{children}</Card>
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

  // Modals & Overlay state
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isSignalPlayerOpen, setIsSignalPlayerOpen] = useState(false);

  // Authentication store
  const isLoggedIn = useOSStore((s) => s.isLoggedIn);
  const loginUser = useOSStore((s) => s.loginUser);
  const logoutUser = useOSStore((s) => s.logoutUser);

  const windows = useOSStore((s) => s.windows);
  const toggleApp = useOSStore((s) => s.toggleApp);
  const clearActive = useOSStore((s) => s.clearActive);
  const player = useOSStore((s) => s.gameplay.player);

  const currentMonthIndex = useOSStore((s) => s.gameplay.player.currentMonthIndex || 0);
  const advanceMonth = useOSStore((s) => s.advanceMonth);

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
      className={`relative flex h-screen w-screen flex-col overflow-hidden bg-meridion-desktop text-purple-100 season-transition ${season}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          clearActive();
          setIsLauncherOpen(false);
        }
      }}
    >
      {/* Deep Purple Ambient Radial Lighting */}
      <div className="absolute top-0 left-1/3 h-[600px] w-[700px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Central Logo Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[.09]">
        <img src="/logo_icon.png" alt="MIRAVERSE OS" className="h-[520px] w-[520px] object-contain mix-blend-screen" />
      </div>
      <SparklesCanvas />

      {/* ── TOP HEADER BAR: 0 ◈ CREDIT COUNTER & SEASONAL WHEEL ── */}
      <header className="relative z-30 mx-6 mt-4 flex h-14 items-center justify-between border border-purple-500/30 bg-[#0d0724]/85 px-5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl select-none">
        <div className="flex items-center gap-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-serif-y2k text-2xl font-bold leading-none tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                ⚡ MIRAVERSEOSX
              </p>
            </div>
            <p className="mt-1 text-[9px] font-semibold tracking-[.2em] text-purple-300/70">
              CIVIC OPERATING SYSTEM • AURELINE MUNICIPAL NETWORK
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          {/* Seasonal Wheel Badge */}
          <Button
            onClick={() => advanceMonth()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 border-purple-500/30 bg-purple-950/60 text-purple-200 hover:text-white hover:bg-purple-900/60 transition rounded-xl text-[11px]"
            title="Wheel of the Year — Seasonal Phase"
          >
            {WHEEL_OF_THE_YEAR[currentMonthIndex % 12].icon} {WHEEL_OF_THE_YEAR[currentMonthIndex % 12].month} ({WHEEL_OF_THE_YEAR[currentMonthIndex % 12].phase})
          </Button>

          {/* Streamlined Credit Counter: 0 ◈ */}
          <motion.div
            key={player?.credits}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 font-mono text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
            title="Citizen Credit Ledger"
          >
            <span>{player?.credits || 0}</span>
            <span className="text-amber-400 font-extrabold">◈</span>
          </motion.div>

          <ClockDisplay />
          <Wifi size={15} className="text-purple-400" />
        </div>
      </header>

      {/* ── 3-COLUMN DESKTOP GRID (grid-cols-12) ── */}
      <div className="relative z-20 flex min-h-0 flex-1 gap-5 p-6 overflow-hidden">
        <AnimatePresence>
          {!isSanctuary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid h-full w-full grid-cols-1 md:grid-cols-12 gap-5 overflow-auto"
            >
              {/* ------------------------------------------------------------ */}
              {/* LEFT COLUMN (col-span-3): Civic Workspace Nav & Diagnostics  */}
              {/* ------------------------------------------------------------ */}
              <aside className="md:col-span-3 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* CIVIC WORKSPACE DOCK */}
                  <Panel>
                    <p className="mb-3 text-[9px] font-mono font-bold tracking-[.2em] text-purple-400 uppercase">
                      CIVIC WORKSPACE
                    </p>
                    <nav className="space-y-1.5 font-mono text-xs">
                      {/* Phone Simulator Nav */}
                      <button
                        onClick={() => setIsPhoneOpen(!isPhoneOpen)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 transition border ${
                          isPhoneOpen
                            ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                            : 'bg-purple-950/30 text-purple-200 border-purple-500/20 hover:bg-purple-900/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Smartphone size={15} className="text-pink-400" />
                          <span>📱 Phone (Personal Line)</span>
                        </div>
                      </button>

                      {/* Comms */}
                      <button
                        onClick={() => launch(APPS.find((a) => a.id === 'comms'))}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 transition border border-purple-500/20 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40 hover:text-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <Mail size={15} className="text-purple-400" />
                          <span>💬 Comms (OS Network)</span>
                        </div>
                      </button>

                      {/* Mail */}
                      <button
                        onClick={() => launch(APPS.find((a) => a.id === 'mail') || APPS.find((a) => a.id === 'comms'))}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 transition border border-purple-500/20 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40 hover:text-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText size={15} className="text-indigo-400" />
                          <span>✉️ Mail (Official Papers)</span>
                        </div>
                        {!player?.dgaVerified && (
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </button>

                      {/* Net Browser */}
                      <button
                        onClick={() => launch(APPS.find((a) => a.id === 'browser'))}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 transition border border-purple-500/20 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40 hover:text-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe size={15} className="text-cyan-400" />
                          <span>🌐 Net Browser (Web/Faith)</span>
                        </div>
                      </button>

                      {/* Citizen Record */}
                      <button
                        onClick={() => launch(APPS.find((a) => a.id === 'passport'))}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 transition border border-purple-500/20 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40 hover:text-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck size={15} className="text-emerald-400" />
                          <span>🪪 Citizen Record</span>
                        </div>
                      </button>

                      {/* File Explorer (files) */}
                      <button
                        onClick={() => launch(APPS.find((a) => a.id === 'files'))}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 transition border border-purple-500/20 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40 hover:text-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <Folder size={15} className="text-amber-400" />
                          <span>📁 File Explorer (files)</span>
                        </div>
                      </button>
                    </nav>
                  </Panel>

                  {/* SYSTEM DIAGNOSTICS */}
                  <Panel>
                    <p className="mb-3 text-[9px] font-mono font-bold tracking-[.2em] text-purple-400 uppercase flex items-center justify-between">
                      <span>SYSTEM DIAGNOSTICS</span>
                      <Cpu size={14} className="text-purple-400" />
                    </p>
                    <div className="space-y-3 font-mono text-[10px]">
                      <div>
                        <div className="flex justify-between text-purple-300 mb-1">
                          <span>CPU Load</span>
                          <span className="text-purple-100 font-bold">42%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-purple-950 overflow-hidden border border-purple-500/20">
                          <div className="h-full bg-purple-500 w-[42%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-purple-300 mb-1">
                          <span>Network</span>
                          <span className="text-cyan-300 font-bold">98%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-purple-950 overflow-hidden border border-purple-500/20">
                          <div className="h-full bg-cyan-400 w-[98%]" />
                        </div>
                      </div>
                    </div>
                  </Panel>
                </div>

                {/* CITY SERVICES */}
                <Panel className="mt-auto">
                  <p className="mb-2 text-[9px] font-mono font-bold tracking-[.2em] text-purple-400 uppercase">
                    CITY SERVICES
                  </p>
                  <button
                    onClick={() => launch(APPS.find((a) => a.id === 'settings'))}
                    className="flex w-full items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-950/30 px-3 py-2 text-xs font-mono text-purple-200 hover:text-white transition"
                  >
                    <Settings size={14} className="text-purple-400" />
                    <span>[⚙️ System Settings]</span>
                  </button>
                </Panel>
              </aside>

              {/* ------------------------------------------------------------ */}
              {/* CENTER COLUMN (col-span-6): Main Citizen Feed & Focus       */}
              {/* ------------------------------------------------------------ */}
              <main className="md:col-span-6 space-y-4">
                {/* 🔔 UNREAD DGA REGISTRATION DISPATCH CARD */}
                <Panel className="relative overflow-hidden border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-purple-900/30 to-indigo-950/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                        <Bell size={20} className="animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wide">
                          🔔 Unread DGA Registration Dispatch
                        </div>
                        <p className="text-xs text-purple-200/90 leading-relaxed">
                          Welcome to Aureline. Complete your civic dossier to unlock full OS Clearance Level 1 and citizen services.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-500/20">
                    <Button
                      onClick={() => setIsDocumentModalOpen(true)}
                      size="sm"
                      variant="solid"
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 font-bold text-xs text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 rounded-xl"
                    >
                      <FileText size={15} /> [ ✉️ Open DGA Registration Form (.osform) &gt; ]
                    </Button>
                  </div>
                </Panel>

                {/* ENCRYPTED COMMS RELAY CARD */}
                <Panel className="space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <p className="text-[9px] font-mono font-bold tracking-[.2em] text-purple-400 uppercase">
                      ENCRYPTED COMMS RELAY
                    </p>
                    <Radio size={14} className="text-purple-400 animate-pulse" />
                  </div>

                  <div className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-white">Voss / secure line</span>
                      <span className="text-[10px] text-purple-400">142.85 MHz</span>
                    </div>
                    <p className="text-xs text-purple-200/80 italic font-mono">
                      "Do not broadcast this. PRISM activity detected near Sector 4."
                    </p>
                    <Button
                      onClick={() => setIsSignalPlayerOpen(true)}
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs font-mono border-purple-400/40 text-purple-200 hover:text-white hover:bg-purple-900/60 rounded-xl"
                    >
                      [ OPEN TRANSMISSION (.sig) ]
                    </Button>
                  </div>
                </Panel>
              </main>

              {/* ------------------------------------------------------------ */}
              {/* RIGHT COLUMN (col-span-3): City Widgets & Lore              */}
              {/* ------------------------------------------------------------ */}
              <aside className="md:col-span-3 space-y-4">
                {/* AURELINE NETWORK BROADCAST */}
                <Panel>
                  <p className="mb-2 text-[9px] font-mono font-bold tracking-[.2em] text-purple-400 uppercase">
                    AURELINE NETWORK BROADCAST
                  </p>
                  <div className="rounded-xl border border-purple-500/20 bg-purple-950/30 p-3 space-y-1 font-mono text-[11px]">
                    <div className="text-purple-200 font-bold">Sub-Aureline Sector 7</div>
                    <p className="text-purple-300/70 text-[10px] leading-relaxed">
                      Signals detected across Sub-Aureline districts. Network telemetry operating within nominal threshold.
                    </p>
                  </div>
                </Panel>

                {/* DAILY ROUTINES & SHIFTS */}
                <Panel>
                  <p className="mb-3 text-[9px] font-mono font-bold tracking-[.2em] text-purple-400 uppercase">
                    DAILY ROUTINES & SHIFTS
                  </p>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                      <span className="text-purple-200">Civic Intake Scan</span>
                      <span className="text-purple-400 font-bold">20:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Veil Observance</span>
                      <span className="text-purple-400 font-bold">22:30</span>
                    </div>
                  </div>
                </Panel>

                {/* CITIZEN LEDGER & STIPEND */}
                <Panel>
                  <p className="mb-3 text-[9px] font-mono font-bold tracking-[.2em] text-purple-400 uppercase">
                    CITIZEN LEDGER & STIPEND
                  </p>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300">Current Balance:</span>
                      <span className="font-bold text-amber-300 text-sm">{player?.credits || 0} ◈</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-purple-400/80 border-t border-purple-500/20 pt-2">
                      <span>Next Shift Window:</span>
                      <span className="font-bold text-purple-200">12:00:00</span>
                    </div>
                  </div>
                </Panel>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sanctuary Mode Clear View */}
        {isSanctuary && (
          <div className="flex flex-1 items-center justify-center">
            <div className="border border-purple-500/30 bg-[#0c0824]/80 px-8 py-5 text-center backdrop-blur-2xl rounded-2xl shadow-2xl">
              <Moon className="mx-auto text-purple-300" size={22} />
              <p className="mt-2 font-serif-y2k text-xl font-bold text-white">Sanctuary Active</p>
              <p className="mt-1 text-[10px] tracking-wider text-purple-400/80 uppercase font-mono">THE DESKTOP HAS BEEN CLEARED</p>
            </div>
          </div>
        )}

        {/* Floating App Windows */}
        <AnimatePresence>
          {windows.filter((win) => !win.isMinimized).map((win) => (
            <Window key={win.id} win={win} />
          ))}
        </AnimatePresence>
      </div>

      {/* ── OVERLAY MODALS ── */}
      {/* 1. Phone Simulator Overlay */}
      {isPhoneOpen && (
        <div className="fixed bottom-16 right-6 z-50 shadow-2xl">
          <PhoneWidget />
        </div>
      )}

      {/* 2. In-OS Document Modal (.osform) */}
      {isDocumentModalOpen && (
        <DocumentModal onClose={() => setIsDocumentModalOpen(false)} />
      )}

      {/* 3. Signal Audio Player Modal (.sig) */}
      {isSignalPlayerOpen && (
        <SignalPlayerModal onClose={() => setIsSignalPlayerOpen(false)} />
      )}

      {/* ── FOOTER BAR: ARCHIVE, SEARCH, MAI, SANCTUARY ── */}
      <footer className="relative z-30 mx-6 mb-4 flex h-12 items-center justify-between border border-purple-500/30 bg-[#0d0724]/85 px-4 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl select-none font-mono text-xs">
        <div className="relative flex items-center gap-3">
          {/* FLOATING SOFT CELESTIAL Y2K APP LAUNCHER POPUP */}
          <AnimatePresence>
            {isLauncherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                className="absolute bottom-14 left-0 grid w-[400px] grid-cols-4 gap-2.5 rounded-2xl bg-[#0d0724]/95 backdrop-blur-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 border border-purple-500/40 select-none text-white"
              >
                <div className="col-span-4 flex items-center justify-between border-b border-purple-500/20 pb-2.5 mb-1 px-1">
                  <div className="flex items-center gap-1.5 font-serif-y2k text-xs font-bold text-purple-200">
                    <Sparkles size={14} className="text-purple-400" /> APPLICATION ARCHIVE
                  </div>
                  <span className="text-[9px] font-mono text-purple-400/70 font-semibold uppercase">CELESTIAL OS</span>
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
                      className="group flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-950/40 p-2.5 text-center transition hover:scale-[1.03] hover:border-purple-400/50 hover:bg-purple-900/50 shadow-sm"
                    >
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition">
                        <Icon size={18} />
                      </div>
                      <span className="text-[11px] font-semibold text-purple-200 group-hover:text-white">{app.title}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsLauncherOpen((open) => !open)}
            className="flex items-center gap-2 border-r border-purple-500/30 pr-4 text-[10px] font-bold tracking-[.14em] text-purple-200 hover:text-white transition"
          >
            <LayoutGrid size={16} /> [📦 ARCHIVE]
          </button>

          {/* Open Apps / Window Taskbar Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md">
            {windows.map((win) => (
              <button
                key={win.id}
                onClick={() => toggleApp(win)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                  !win.isMinimized
                    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'bg-purple-950/40 text-purple-300 border-purple-500/20 hover:bg-purple-900/50 hover:text-white'
                }`}
              >
                <span className="truncate max-w-[100px]">{win.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search city records */}
          <div className="hidden w-64 items-center border border-purple-500/30 bg-purple-950/40 px-3 py-1.5 sm:flex rounded-xl">
            <Search size={13} className="mr-2 text-purple-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="🔍 Search city records..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-purple-400/50 text-purple-200"
            />
          </div>

          <MAIDock />

          <button
            onClick={toggleSound}
            className="p-2 text-purple-300 hover:text-white transition"
            title={isMuted ? "Unmute Audio Engine" : "Mute Audio Engine"}
          >
            {isMuted ? <VolumeX size={16} className="text-rose-500" /> : <Volume2 size={16} className="text-purple-400" />}
          </button>

          <button
            onClick={() => setIsSanctuary((active) => !active)}
            className={'flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-[.12em] transition rounded-xl ' + (isSanctuary ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]' : 'text-purple-300 hover:bg-purple-900/50 hover:text-white')}
          >
            <Moon size={14} /> [🛡️ SANCTUARY]
          </button>
          <button onClick={() => launch(APPS.find((a) => a.id === 'settings'))} className="p-2 text-purple-300 hover:text-white transition" title="Settings">
            <Settings size={16} />
          </button>
          <button onClick={() => logoutUser()} className="p-2 text-purple-300 hover:text-red-400 transition" title="Log Out / Lock Screen">
            <LogOut size={16} />
          </button>
        </div>
      </footer>
    </main>
  );
}
