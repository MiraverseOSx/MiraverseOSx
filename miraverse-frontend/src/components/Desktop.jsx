// src/components/Desktop.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import PhoneWidget from './PhoneWidget';
import DocumentModal from './DocumentModal';
import SignalPlayerModal from './SignalPlayerModal';
import ClockDisplay from './ClockDisplay';
import Button from './ui/button';
import SparklesCanvas from './SparklesCanvas';
import MeridionLandingPage from './MeridionLandingPage';

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
  } = useOSStore();

  const player = useOSStore((s) => s.gameplay.player);

  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isSignalPlayerOpen, setIsSignalPlayerOpen] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2); // March (Early Spring)

  const advanceMonth = () => {
    setCurrentMonthIndex((prev) => (prev + 1) % 12);
  };

  if (!isLoggedIn) {
    return (
      <MeridionLandingPage
        onSignIn={() => useOSStore.getState().loginUser({ name: 'CY-9021-CITIZEN', clearance: 1 })}
        onEnroll={() => useOSStore.getState().loginUser({ name: 'CY-9021-CITIZEN', clearance: 1 })}
      />
    );
  }

  return (
    <main
      className="relative flex h-screen w-screen flex-col overflow-hidden bg-meridion-desktop text-purple-100 select-none font-serif"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setIsLauncherOpen(false);
        }
      }}
    >
      {/* Central Ambient Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]">
        <img src="/logo_icon.png" alt="MIRAVERSE OS" className="h-[520px] w-[520px] object-contain mix-blend-screen" />
      </div>
      <SparklesCanvas />

      {/* ── TOP HEADER BAR: BRANDING, WHEEL & CREDIT LEDGER ── */}
      <header className="os-header-bar relative z-30 mx-6 mt-4 flex h-14 items-center justify-between px-5 select-none font-serif">
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

          <ClockDisplay />
          <Wifi size={15} className="text-purple-400" />
        </div>
      </header>

      {/* ── UNIFIED CONTINUOUS WORKSPACE PAGE (NO FLOATING CARDS / GAPS) ── */}
      <div className="relative z-20 flex min-h-0 flex-1 p-6 overflow-hidden">
        <AnimatePresence>
          {!isSanctuary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="unified-workspace-container flex h-full w-full overflow-hidden"
            >
              {/* ------------------------------------------------------------ */}
              {/* LEFT SIDEBAR: Integrated Workspace Dock & Diagnostics        */}
              {/* ------------------------------------------------------------ */}
              <aside className="w-64 shrink-0 hairline-divider-r flex flex-col justify-between p-5 space-y-4">
                <div className="space-y-5">
                  <div>
                    <p className="mb-3 text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                      CIVIC WORKSPACE
                    </p>
                    <nav className="space-y-1 font-serif text-xs">
                      {[
                        { id: 'phone', label: '📱 Phone (Personal Line)', icon: Smartphone, color: 'text-pink-400', action: () => setIsPhoneOpen(!isPhoneOpen) },
                        { id: 'comms', label: '💬 Comms (OS Network)', icon: Mail, color: 'text-purple-400', action: () => launch(APPS.find((a) => a.id === 'comms')) },
                        { id: 'mail', label: '✉️ Mail (Official Papers)', icon: FileText, color: 'text-indigo-400', badge: !player?.dgaVerified, action: () => launch(APPS.find((a) => a.id === 'mail') || APPS.find((a) => a.id === 'comms')) },
                        { id: 'browser', label: '🌐 Net Browser (Web/Faith)', icon: Globe, color: 'text-cyan-400', action: () => launch(APPS.find((a) => a.id === 'browser')) },
                        { id: 'passport', label: '🪪 Citizen Record', icon: UserCheck, color: 'text-emerald-400', action: () => launch(APPS.find((a) => a.id === 'passport')) },
                        { id: 'files', label: '📁 File Explorer (files)', icon: Folder, color: 'text-amber-400', action: () => launch(APPS.find((a) => a.id === 'files')) },
                        { id: 'spellforge', label: '🔥 SpellForge Matrix', icon: Sparkles, color: 'text-purple-400', action: () => launch(APPS.find((a) => a.id === 'spellforge')) },
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
                    onClick={() => launch(APPS.find((a) => a.id === 'settings'))}
                    className="flex w-full items-center gap-2 rounded-sm border border-purple-500/20 bg-purple-950/30 px-3 py-2 text-xs font-serif text-purple-200 hover:text-white transition"
                  >
                    <Settings size={14} className="text-purple-400" />
                    <span>[⚙️ System Settings]</span>
                  </button>
                </div>
              </aside>

              {/* ------------------------------------------------------------ */}
              {/* CENTER COLUMN: Primary Citizen Feed & Active Focus           */}
              {/* ------------------------------------------------------------ */}
              <main className="flex-1 hairline-divider-r p-6 space-y-6 overflow-y-auto">
                {/* 🔔 UNREAD DGA REGISTRATION DISPATCH SECTION */}
                <div className="hairline-divider-b pb-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-sm bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                        <Bell size={20} className="animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-serif text-sm font-bold text-amber-300 uppercase tracking-wide">
                          🔔 Unread DGA Registration Dispatch
                        </div>
                        <p className="text-xs text-purple-200/90 leading-relaxed font-serif">
                          Welcome to Aureline. Complete your civic dossier to unlock full OS Clearance Level 1 and citizen services.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsDocumentModalOpen(true)}
                    size="sm"
                    variant="solid"
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 font-bold text-xs text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 rounded-sm font-serif"
                  >
                    <FileText size={15} /> [ ✉️ Open DGA Registration Form (.osform) &gt; ]
                  </Button>
                </div>

                {/* ENCRYPTED COMMS RELAY SECTION */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <p className="text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                      ENCRYPTED COMMS RELAY
                    </p>
                    <Radio size={14} className="text-purple-400 animate-pulse" />
                  </div>

                  <div className="rounded-sm border border-purple-500/20 bg-purple-950/40 p-4 space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-white font-serif">Voss / secure line</span>
                      <span className="text-[10px] text-purple-400">142.85 MHz</span>
                    </div>
                    <p className="text-xs text-purple-200/80 italic font-serif">
                      "Do not broadcast this. PRISM activity detected near Sector 4."
                    </p>
                    <Button
                      onClick={() => setIsSignalPlayerOpen(true)}
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs font-serif border-purple-400/40 text-purple-200 hover:text-white hover:bg-purple-900/60 rounded-sm w-full flex items-center justify-center gap-2"
                    >
                      <Radio size={14} /> [ 📻 Play Decoded Transmission (.sig) &gt; ]
                    </Button>
                  </div>
                </div>
              </main>

              {/* ------------------------------------------------------------ */}
              {/* RIGHT SIDEBAR: City Telemetry & Ledger                       */}
              {/* ------------------------------------------------------------ */}
              <aside className="w-72 shrink-0 p-5 space-y-6 overflow-y-auto">
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

        {/* Floating App Windows */}
        <AnimatePresence>
          {windows.filter((win) => !win.isMinimized).map((win) => (
            <Window key={win.id} win={win} />
          ))}
        </AnimatePresence>
      </div>

      {/* ── OVERLAY MODALS ── */}
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

      {/* ── FOOTER TASKBAR: ARCHIVE, SEARCH, MAI, SANCTUARY ── */}
      <footer className="os-footer-bar relative z-30 mx-6 mb-4 flex h-12 items-center justify-between px-4 select-none font-serif text-xs">
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
                        launch(app);
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
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold border transition ${
                  !win.isMinimized
                    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'bg-purple-950/40 text-purple-200 border-purple-500/20 hover:bg-purple-900/50'
                }`}
              >
                <span>{win.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Footer Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 text-purple-400" size={13} />
            <input
              type="text"
              placeholder="Search city records..."
              className="h-8 w-44 rounded-sm border border-purple-500/20 bg-purple-950/40 pl-8 pr-3 text-[11px] text-purple-200 placeholder:text-purple-400/60 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <Button
            onClick={() => toggleSanctuary()}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 border-purple-500/30 bg-purple-950/60 text-purple-200 hover:bg-purple-900/60 text-[11px] font-serif rounded-sm"
            title="Clear Desktop Canvas"
          >
            <Shield size={13} /> Sanctuary
          </Button>

          <Button
            onClick={() => logoutUser()}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 border-purple-500/30 bg-purple-950/60 text-purple-200 hover:bg-purple-900/60 text-[11px] font-serif rounded-sm"
            title="Log Out of Municipal OS"
          >
            <LogOut size={13} /> Log Out
          </Button>
        </div>
      </footer>
    </main>
  );
}
