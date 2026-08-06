// src/components/Desktop.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Sparkles,
  Search,
  LayoutGrid,
  FileText,
  Mail,
  Radio,
  Globe,
  UserCheck,
  Folder,
  Smartphone,
  Cpu,
  Wifi,
  Moon,
  Shield,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/contents';
import Window from './Window';
import PhoneWidget from './widgets/PhoneWidget';
import DocumentModal from './DocumentModal';
import SignalPlayerModal from './widgets/SignalPlayerModal';
import ClockDisplay from './widgets/ClockDisplay';
import Button from './ui/button';
import SparklesCanvas from './SparklesCanvas';
import MeridionLandingPage from './MeridionLandingPage';
import LoginScreen from './LoginScreen';
import MAIDock from './MAIDock';
import { Calendar, CheckSquare, Award, CheckCircle2 } from 'lucide-react';
import OSWindow from './OSWindow';
import logoIcon from '../assets/images/logo_icon.png';
import frontIdCard from '../assets/images/front_id_card.svg';
// Browser is loaded via lazy in contents.jsx; no direct import needed here

const WHEEL_OF_THE_YEAR = [
  { month: 'January', phase: 'Mid-Winter', icon: '❄️' },
  { month: 'February', phase: 'Late Winter', icon: '🌨️' },
  { month: 'March', phase: 'Early Spring', icon: '🌸' },
  { month: 'April', phase: 'Mid-Spring', icon: '🌱' },
  { month: 'May', phase: 'Late Spring', icon: '🌿' },
  { month: 'June', phase: 'Early Summer', icon: '☀️' },
  { month: 'July', phase: 'Mid-Summer', icon: '🔥' },
  { month: 'August', phase: 'Late Summer', icon: '🌾' },
  { month: 'September', phase: 'Early Autumn', icon: '🍂' },
  { month: 'October', phase: 'Mid-Autumn', icon: '🎃' },
  { month: 'November', phase: 'Late Autumn', icon: '🍁' },
  { month: 'December', phase: 'Early Winter', icon: '❄️' },
];

export default function Desktop() {
  const {
    isLoggedIn,
    windows,
    launch,
    toggleApp,
    isSanctuary,
    toggleSanctuary,
    logoutUser,
    focusWindow,
  } = useOSStore();

  const player = useOSStore((s) => s.gameplay.player);
  const workspaceRef = React.useRef(null);

  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isSignalPlayerOpen, setIsSignalPlayerOpen] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2); // March (Early Spring)


  const advanceMonth = () => {
    setCurrentMonthIndex((prev) => (prev + 1) % 12);
  };

  if (!isLoggedIn) {
    if (authMode) {
      return (
        <LoginScreen
          initialMode={authMode}
          onLoginSuccess={(userData) => {
            useOSStore.getState().loginUser(userData);
            setAuthMode(null);
          }}
          onBackToLanding={() => setAuthMode(null)}
        />
      );
    }
    return (
      <MeridionLandingPage
        onSignIn={() => setAuthMode('login')}
        onEnroll={() => setAuthMode('register')}
      />
    );
  }

  return (
    <main
      ref={workspaceRef}
      className="relative flex h-screen w-screen flex-col overflow-hidden bg-meridion-desktop text-purple-100 select-none font-serif"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setIsLauncherOpen(false);
        }
      }}
    >
      {/* Background Branding — subtle, bottom-right watermark */}
      <div className="pointer-events-none absolute bottom-6 right-6 z-0 opacity-10">
        <img
          src={logoIcon}
          alt="MIRAVERSE OS"
          className="h-64 w-64 md:h-80 md:w-80 object-contain mix-blend-screen blur-[0.5px]"
        />
      </div>
      {/* Ambient sparkles with reduced intensity */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
        <SparklesCanvas />
      </div>

      {/* ── TOP HEADER BAR: BRANDING, WHEEL & CREDIT LEDGER ── */}
      <header className="os-header-bar relative z-20 mx-6 mt-4 flex h-14 items-center justify-between px-5 select-none font-serif">
        <div className="flex items-center gap-4">
          <div className="grid h-9 w-9 place-items-center rounded-sm bg-purple-500/20 border border-purple-400/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-serif text-2xl font-bold leading-none tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                ⚡ MIRAVERSEOSX
              </p>
            </div>
            <p className="mt-1 text-[9px] font-mono font-semibold tracking-[.2em] text-purple-300/70">
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
            className="flex items-center gap-1.5 border-purple-500/30 bg-purple-950/60 text-purple-200 hover:text-white hover:bg-purple-900/60 transition rounded-sm text-[11px] font-serif"
            title="Wheel of the Year — Seasonal Phase"
          >
            {WHEEL_OF_THE_YEAR[currentMonthIndex % 12].icon} {WHEEL_OF_THE_YEAR[currentMonthIndex % 12].month} ({WHEEL_OF_THE_YEAR[currentMonthIndex % 12].phase})
          </Button>

          {/* Streamlined Credit Counter: 0 ◈ */}
          <motion.div
            key={player?.credits}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="credit-counter-badge flex items-center gap-1.5 font-mono text-xs font-bold"
            title="Citizen Credit Ledger"
          >
            <span>{player?.credits || 0}</span>
            <span className="text-amber-400 font-extrabold">◈</span>
          </motion.div>

          <ClockDisplay monthIndex={currentMonthIndex} />
          <Wifi size={15} className="text-purple-400" />
        </div>
      </header>

      {/* ── UNIFIED CONTINUOUS WORKSPACE PAGE (SOLID SIDE PANELS TOP TO BOTTOM) ── */}
      <div className="relative z-10 flex min-h-0 flex-1 px-6 py-2.5 overflow-hidden">
        <AnimatePresence>
          {!isSanctuary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="unified-workspace-container flex h-full w-full overflow-hidden shadow-2xl"
            >
              {/* ------------------------------------------------------------ */}
              {/* LEFT SIDEBAR: Integrated Workspace Dock & Diagnostics (SOLID) */}
              {/* ------------------------------------------------------------ */}
              <aside className="w-64 shrink-0 hairline-divider-r flex flex-col justify-between p-5 space-y-4 bg-[#070514] h-full overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <p className="mb-3 text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                      CIVIC WORKSPACE
                    </p>
                    <nav className="space-y-1 font-serif text-xs">
                      {[
                        { id: 'phone', label: '📱 Phone', icon: Smartphone, color: 'text-pink-400', action: () => setIsPhoneOpen(!isPhoneOpen) },
                        { id: 'comms', label: '💬 Comms', icon: Mail, color: 'text-purple-400', action: () => toggleApp(APPS.find((a) => a.id === 'comms')) },
                        // Mail removed; keep Comms available
                        { id: 'browser', label: '🌐 Net Browser', icon: Globe, color: 'text-cyan-400', action: () => toggleApp(APPS.find((a) => a.id === 'browser')) },
                        { id: 'passport', label: '🪪 Citizen Record', icon: UserCheck, color: 'text-emerald-400', action: () => toggleApp(APPS.find((a) => a.id === 'passport')) },
                        { id: 'files', label: '📁 File Explorer', icon: Folder, color: 'text-amber-400', action: () => toggleApp(APPS.find((a) => a.id === 'files')) },
                        { id: 'spellforge', label: '🔥 SpellForge Matrix', icon: Sparkles, color: 'text-purple-400', action: () => toggleApp(APPS.find((a) => a.id === 'spellforge')) },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-purple-200 hover:bg-purple-900/40 hover:text-white transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <item.icon size={15} className={item.color} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="hairline-divider-b pb-4" />

                  {/* DIAGNOSTICS */}
                  <div className="space-y-3 font-mono text-[10px]">
                    <div className="flex justify-between items-center text-purple-400 font-bold">
                      <span>SYSTEM DIAGNOSTICS</span>
                      <Cpu size={14} />
                    </div>
                    <div>
                      <div className="flex justify-between text-purple-300 mb-1">
                        <span>CPU Load</span>
                        <span className="text-purple-100 font-bold">42%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-sm bg-purple-950 overflow-hidden border border-purple-500/20">
                        <div className="h-full bg-purple-500 w-[42%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-purple-300 mb-1">
                        <span>Network</span>
                        <span className="text-cyan-300 font-bold">98%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-sm bg-purple-950 overflow-hidden border border-purple-500/20">
                        <div className="h-full bg-cyan-400 w-[98%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CITY SERVICES */}
                <div className="pt-3 border-t border-purple-500/20">
                  <button
                    onClick={() => toggleApp(APPS.find((a) => a.id === 'settings'))}
                    className="flex w-full items-center gap-2 rounded-sm border border-purple-500/20 bg-purple-950/30 px-3 py-2 text-xs font-serif text-purple-200 hover:text-white transition"
                  >
                    <Settings size={14} className="text-purple-400" />
                    <span>[⚙️ System Settings]</span>
                  </button>
                </div>
              </aside>

              {/* ------------------------------------------------------------ */}
              {/* CENTER COLUMN: Primary Citizen Feed (GRADIENT)               */}
              {/* ------------------------------------------------------------ */}
              <main className="flex-1 hairline-divider-r p-6 space-y-5 overflow-y-auto bg-gradient-to-b from-[#180e3c]/50 via-[#070514]/20 to-[#120a2e]/50 backdrop-blur-[2px]">
                {/* 🔔 TOP UNREAD DGA REGISTRATION DISPATCH STRIP */}
                <div className="flex items-center justify-between gap-4 p-3 rounded-sm border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-purple-950/30 to-purple-950/20 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <Bell size={16} className="text-amber-300 animate-bounce shrink-0" />
                    <div className="min-w-0">
                      <div className="font-serif text-xs font-bold text-amber-300 truncate uppercase tracking-wider">
                        🔔 Unread DGA Registration Dispatch
                      </div>
                      <p className="text-[11px] text-purple-200/80 font-serif truncate">
                        Complete your civic dossier to unlock Level 1 clearance.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsDocumentModalOpen(true)}
                    size="sm"
                    variant="solid"
                    className="shrink-0 py-1.5 px-3 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 font-bold text-[11px] text-black shadow-[0_0_15px_rgba(251,191,36,0.25)] flex items-center gap-1.5 rounded-sm font-serif"
                  >
                    <FileText size={13} /> [ Open Form &gt; ]
                  </Button>
                </div>

                {/* ── 2-COLUMN GRID: COMMS RELAY & LIVE WORLD EVENTS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LEFT: ENCRYPTED COMMS RELAY */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                      <p className="text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                        ENCRYPTED COMMS RELAY
                      </p>
                      <Radio size={13} className="text-purple-400 animate-pulse" />
                    </div>

                    <div className="rounded-sm border border-purple-500/20 bg-purple-950/30 p-3 space-y-2">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-white font-serif">Voss / secure line</span>
                        <span className="text-[9px] text-purple-400">142.85 MHz</span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 italic font-serif leading-relaxed">
                        "Do not broadcast this. PRISM activity detected near Sector 4."
                      </p>
                      <Button
                        onClick={() => setIsSignalPlayerOpen(true)}
                        size="sm"
                        variant="outline"
                        className="text-[11px] font-serif border-purple-400/40 text-purple-200 hover:text-white hover:bg-purple-900/60 rounded-sm w-full flex items-center justify-center gap-1.5 py-1.5"
                      >
                        <Radio size={13} /> [ 📻 Play Decoded Transmission (.sig) &gt; ]
                      </Button>
                    </div>
                  </div>

                  {/* RIGHT: LIVE WORLD EVENTS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-indigo-400" />
                        <p className="text-[10px] font-mono font-bold tracking-wider text-indigo-300 uppercase">
                          LIVE WORLD EVENTS
                        </p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>

                    <div className="space-y-1.5">
                      {(player?.worldEvents || []).slice(0, 2).map((evt) => (
                        <div
                          key={evt.id}
                          className="rounded-sm border border-purple-500/15 bg-purple-950/20 p-2.5 space-y-1 hover:border-purple-400/30 transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-[11px] font-bold text-purple-100 flex items-center gap-1">
                              <Sparkles size={11} className="text-indigo-400" /> {evt.name}
                            </span>
                            <span className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/20">
                              {evt.monthReq}
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-mono text-[9px] pt-1 border-t border-purple-500/10">
                            <span className="text-amber-300 font-semibold">{evt.reward}</span>
                            <button
                              onClick={() => useOSStore.getState().joinWorldEvent(evt.id)}
                              className="text-purple-300 hover:text-white hover:underline font-serif text-[10px]"
                            >
                              [ Join &gt; ]
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center column tail space reserved for future widgets */}
              </main>

              {/* ------------------------------------------------------------ */}
              {/* RIGHT SIDEBAR: City Telemetry & Ledger (SOLID)               */}
              {/* ------------------------------------------------------------ */}
              <aside className="w-72 shrink-0 p-5 space-y-6 overflow-y-auto bg-[#070514] h-full">
                {/* AURELINE NETWORK BROADCAST */}
                <div className="hairline-divider-b pb-5 space-y-2">
                  <p className="text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                    AURELINE NETWORK BROADCAST
                  </p>
                  <div className="rounded-sm border border-purple-500/20 bg-purple-950/30 p-3 space-y-1 font-mono text-[11px]">
                    <div className="text-purple-200 font-bold font-serif">Sub-Aureline Sector 7</div>
                    <p className="text-purple-300/70 text-[10px] leading-relaxed font-serif">
                      Signals detected across Sub-Aureline districts. Network telemetry operating within nominal threshold.
                    </p>
                  </div>
                </div>

                {/* DAILY ROUTINES & SHIFTS */}
                <div className="hairline-divider-b pb-5 space-y-2">
                  <p className="text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                    DAILY ROUTINES & SHIFTS
                  </p>
                  <div className="space-y-2 font-serif text-xs">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                      <span className="text-purple-200">Civic Intake Scan</span>
                      <span className="text-purple-400 font-bold font-mono">20:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Veil Observance</span>
                      <span className="text-purple-400 font-bold font-mono">22:30</span>
                    </div>
                  </div>
                </div>

                {/* CITIZEN LEDGER & STIPEND */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                    CITIZEN LEDGER & STIPEND
                  </p>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 font-serif">Current Balance:</span>
                      <span className="font-bold text-amber-300 text-sm">{player?.credits || 0} ◈</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-purple-400/80 border-t border-purple-500/20 pt-2 font-serif">
                      <span>Next Shift Window:</span>
                      <span className="font-bold text-purple-200 font-mono">12:00:00</span>
                    </div>
                  </div>
                </div>

                {/* AURELINE CITIZEN ID BADGE PREVIEW */}
                <div className="border-t border-purple-500/20 pt-5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-purple-400 uppercase">
                    <span>CITIZEN DOSSIER BADGE</span>
                    <span className="text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                  <div
                    onClick={() => toggleApp(APPS.find((a) => a.id === 'passport'))}
                    className="relative cursor-pointer group overflow-hidden rounded-sm border border-purple-400/30 bg-purple-950/40 p-2 shadow-lg transition hover:border-purple-300"
                  >
                    <img
                      src={frontIdCard}
                      alt="Aureline Citizen ID Card"
                      className="w-full h-auto object-contain rounded-xs opacity-90 group-hover:opacity-100 transition transform group-hover:scale-[1.02]"
                    />
                    <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-purple-300">
                      <span>ID: CY-9021-CITIZEN</span>
                      <span className="text-amber-300 font-bold">Level 1</span>
                    </div>
                  </div>
                </div>

                {/* PERSONAL PHONE LINE WIDGET CARD */}
                <div className="border-t border-purple-500/20 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-purple-400 uppercase">
                    <span>MOBILE COMMS LINE</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPhoneOpen((prev) => !prev)}
                    className="w-full flex items-center gap-3 rounded-sm border border-pink-400/50 bg-[#1e1338]/90 p-2.5 shadow-[0_0_20px_rgba(244,114,182,0.25)] backdrop-blur-xl hover:border-pink-300 hover:scale-[1.02] transition text-left group"
                    title="Toggle Personal Phone Line"
                  >
                    <div className="relative h-9 w-5 rounded-md border-2 border-pink-300 bg-slate-950 flex flex-col justify-between p-0.5 shadow-inner shrink-0">
                      <div className="h-0.5 w-1.5 mx-auto bg-pink-300 rounded-full" />
                      <div className="h-1 w-1 mx-auto bg-pink-400 rounded-full animate-ping" />
                      <div className="h-0.5 w-2 mx-auto bg-pink-300/80 rounded-full" />
                    </div>
                    <div className="font-serif">
                      <div className="text-xs font-bold text-pink-200 group-hover:text-white flex items-center gap-1">
                        📱 Phone Line
                      </div>
                      <div className="text-[9px] font-mono text-pink-300/70">Aureline Mobile Comms</div>
                    </div>
                  </button>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sanctuary Mode Clear View */}
        {isSanctuary && (
          <div className="flex flex-1 items-center justify-center">
            <div className="border border-purple-500/30 bg-[#0c0824]/80 px-8 py-5 text-center backdrop-blur-2xl rounded-sm shadow-2xl">
              <Moon className="mx-auto text-purple-300" size={22} />
              <p className="mt-2 font-serif text-xl font-bold text-white">Sanctuary Active</p>
              <p className="mt-1 text-[10px] tracking-wider text-purple-400/80 uppercase font-mono">THE DESKTOP HAS BEEN CLEARED</p>
            </div>
          </div>
        )}

      </div>

      {/* Floating App Windows */}
      <AnimatePresence>
        {windows.filter((win) => !win.isMinimized).map((win) => (
          <Window key={win.id} win={win} workspaceRef={workspaceRef} />
        ))}
      </AnimatePresence>

      {isPhoneOpen && (
        <div className="fixed bottom-16 right-6 z-50 shadow-2xl">
          <PhoneWidget />
        </div>
      )}

      {isDocumentModalOpen && (
        <DocumentModal onClose={() => setIsDocumentModalOpen(false)} />
      )}

      {isSignalPlayerOpen && (
        <SignalPlayerModal onClose={() => setIsSignalPlayerOpen(false)} />
      )}

      {/* ── FOOTER TASKBAR: ARCHIVE & APPS (LEFT) | SETTINGS, SANCTUARY, LOGOUT, MAI (RIGHT) ── */}
      <footer className="os-footer-bar relative z-20 mx-6 mb-4 flex h-12 items-center justify-between px-4 select-none font-serif text-xs">
        {/* Left Side Controls: Archive, Open Windows, Search */}
        <div className="relative flex items-center gap-3">
          {/* FLOATING APP LAUNCHER POPUP (📦 ARCHIVE) */}
          <AnimatePresence>
            {isLauncherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                className="absolute bottom-14 left-0 grid w-[400px] grid-cols-4 gap-2.5 rounded-sm bg-[#0d0724]/95 backdrop-blur-2xl p-4 shadow-2xl z-50 border border-purple-500/40 text-white font-serif"
              >
                <div className="col-span-4 flex items-center justify-between border-b border-purple-500/20 pb-2.5 mb-1 px-1">
                  <div className="flex items-center gap-1.5 font-serif text-xs font-bold text-purple-200">
                    <Sparkles size={14} className="text-purple-400" /> APPLICATION ARCHIVE
                  </div>
                </div>

                {APPS.map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        toggleApp(app);
                        setIsLauncherOpen(false);
                      }}
                      className="group flex min-h-20 flex-col items-center justify-center gap-2 rounded-sm border border-purple-500/20 bg-purple-950/40 p-2.5 text-center transition hover:border-purple-400/50 hover:bg-purple-900/50 shadow-sm"
                    >
                      <div className="p-2 rounded-sm bg-purple-500/20 text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition">
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
            className="flex items-center gap-2 border-r border-purple-500/30 pr-3 text-[10px] font-bold tracking-[.14em] text-purple-200 hover:text-white transition"
          >
            <LayoutGrid size={16} /> [📦 ARCHIVE]
          </button>

          {/* Open Apps / Window Taskbar Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs sm:max-w-md">
            {windows.map((win) => (
              <button
                key={win.id}
                onClick={() => toggleApp(win)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold border transition ${!win.isMinimized
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-purple-950/40 text-purple-200 border-purple-500/20 hover:bg-purple-900/50'
                  }`}
              >
                <span>{win.title}</span>
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-purple-500/30 mx-1" />

          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 text-purple-400" size={13} />
            <input
              type="text"
              placeholder="Search city records..."
              className="h-8 w-36 sm:w-44 rounded-sm border border-purple-500/20 bg-purple-950/40 pl-8 pr-3 text-[11px] text-purple-200 placeholder:text-purple-400/60 focus:border-purple-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Side Controls: Settings, Sanctuary, Logout, MAI */}
        <div className="relative flex items-center gap-2.5">
          {/* Settings */}
          <Button
            onClick={() => toggleApp(APPS.find((a) => a.id === 'settings'))}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 border-purple-500/30 bg-purple-950/60 text-purple-200 hover:bg-purple-900/60 text-[11px] font-serif rounded-sm"
            title="System Settings"
          >
            <Settings size={13} className="text-purple-300" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          {/* Sanctuary */}
          <Button
            onClick={() => toggleSanctuary()}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 border-purple-500/30 bg-purple-950/60 text-purple-200 hover:bg-purple-900/60 text-[11px] font-serif rounded-sm"
            title="Clear Desktop Canvas"
          >
            <Shield size={13} className="text-purple-300" />
            <span className="hidden sm:inline">Sanctuary</span>
          </Button>

          {/* Log Out */}
          <Button
            onClick={() => logoutUser()}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 border-purple-500/30 bg-purple-950/60 text-purple-200 hover:bg-purple-900/60 text-[11px] font-serif rounded-sm"
            title="Log Out of Municipal OS"
          >
            <LogOut size={13} className="text-purple-300" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>

          {/* MAI Agent Popup Assistant */}
          <MAIDock />
        </div>
      </footer>
    </main>
  );
}
