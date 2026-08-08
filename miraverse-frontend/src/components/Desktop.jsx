// src/components/Desktop.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/contents';
import Window from './Window';
import PhoneWidget from './widgets/PhoneWidget';
import DocumentModal from './DocumentModal';
import SignalPlayerModal from './widgets/SignalPlayerModal';
import Button from './ui/button';
import SparklesCanvas from './SparklesCanvas';
import MeridionLandingPage from './MeridionLandingPage';
import LoginScreen from './LoginScreen';
import MAIDock from './MAIDock';
import CommandCenter from './CommandCenter';
import IdentityVitals from './IdentityVitals';
import ProgressionPanel from './ProgressionPanel';
import PublicIcon from './ui/PublicIcon';
import logoIcon from '../assets/images/logo_icon.png';
// Browser is loaded via lazy in contents.jsx; no direct import needed here

export default function Desktop() {
  const {
    isLoggedIn,
    windows,
    toggleApp,
    isSanctuary,
    toggleSanctuary,
    logoutUser,
  } = useOSStore();

  const workspaceRef = React.useRef(null);

  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isSignalPlayerOpen, setIsSignalPlayerOpen] = useState(false);
  const getApp = (id) => APPS.find((app) => app.id === id);
  const openApp = (id) => {
    const app = getApp(id);
    if (app) toggleApp(app);
  };
  const utilityItems = [
    { id: 'terminal', label: 'Terminal', icon: '/images/command line.png', action: () => openApp('terminal') },
    { id: 'sanctuary', label: 'Sanctuary Mode', icon: '/icons/Icon set 1/0.5x/Lock 256 px.png', action: toggleSanctuary },
    { id: 'phone', label: 'Phone Line', icon: '/icons/Icon set 1/0.5x/Rotate phone 1 256 px.png', action: () => setIsPhoneOpen((open) => !open) },
    { id: 'docs', label: 'Documents', icon: '/icons/Icons8/icons8-opened-folder-16.svg', action: () => setIsDocumentModalOpen(true) },
    { id: 'signal', label: 'Signal Player', icon: '/icons/Icons8/icons8-audio-wave-50.gif', action: () => setIsSignalPlayerOpen(true) },
  ];

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
      className="os-desktop relative flex h-screen w-screen flex-col overflow-hidden select-none font-ui text-[#1b254f]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setIsLauncherOpen(false);
        }
      }}
    >
      {/* Background Branding — subtle, bottom-right watermark */}
      <div className="pointer-events-none absolute bottom-6 right-6 z-0 opacity-[0.06]">
        <img
          src={logoIcon}
          alt="MIRAVERSE OS"
          className="h-64 w-64 md:h-80 md:w-80 object-contain blur-[0.5px]"
        />
      </div>
      {/* Ambient sparkles with reduced intensity */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
        <SparklesCanvas />
      </div>

      {/* ── UNIFIED CONTINUOUS WORKSPACE PAGE (SOLID SIDE PANELS TOP TO BOTTOM) ── */}
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden pb-12">
        <AnimatePresence>
          {!isSanctuary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="unified-workspace-container grid h-full w-full grid-cols-12 gap-0 overflow-hidden"
            >
              <IdentityVitals onOpenCitizenRecord={() => openApp('passport')} />

              {/* ------------------------------------------------------------ */}
              {/* CENTER COLUMN: Primary Citizen Feed (GRADIENT)               */}
              {/* ------------------------------------------------------------ */}
              <main className="navy-cosmic-shell col-span-6 space-y-5 overflow-y-auto border-0 p-6 backdrop-blur-[12px]">
                <CommandCenter
                  onOpenDocument={() => setIsDocumentModalOpen(true)}
                  onOpenSignal={() => setIsSignalPlayerOpen(true)}
                />
              </main>

              {/* ------------------------------------------------------------ */}
              {/* RIGHT SIDEBAR: City Telemetry & Ledger (SOLID)               */}
              {/* ------------------------------------------------------------ */}
              <ProgressionPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sanctuary Mode Clear View */}
        {isSanctuary && (
          <div className="flex flex-1 items-center justify-center">
            <div className="border border-[#1b254f]/30 bg-white/58 px-8 py-5 text-center backdrop-blur-[18px] shadow-none">
              <PublicIcon src="/icons/Icon set 1/0.5x/Star 256 px.png" size={22} className="mx-auto" />
              <p className="mt-2 font-display text-xl text-[#1b254f]">Sanctuary Active</p>
              <p className="mt-1 text-[10px] tracking-wider text-[#303b67] uppercase font-ui">THE DESKTOP HAS BEEN CLEARED</p>
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
        <div className="fixed bottom-16 right-6 z-50 shadow-none">
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
      <footer className="fixed bottom-0 left-0 right-0 z-20 flex h-12 items-center justify-between border-t border-[#1b254f]/35 bg-white/58 px-4 select-none font-ui text-xs shadow-none backdrop-blur-[18px]">
        {/* Left Side Controls: Archive, Open Windows, Search */}
        <div className="relative flex items-center gap-3">
          {/* FLOATING APP LAUNCHER POPUP (📦 ARCHIVE) */}
          <AnimatePresence>
            {isLauncherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                className="absolute bottom-14 left-0 z-50 w-[280px] space-y-3 border border-[#1b254f]/30 bg-white/80 p-4 text-[#1b254f] shadow-none backdrop-blur-[18px] font-ui"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-1 px-1">
                  <div className="flex items-center gap-1.5 font-display text-sm text-[#1b254f]">
                    <PublicIcon src="/icons/Icon set 1/0.5x/Star 256 px.png" size={14} /> System utilities
                  </div>
                </div>

                {utilityItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { item.action(); setIsLauncherOpen(false); }}
                    className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-semibold hover:border-[#1b254f]/25 hover:bg-white/60 transition"
                  >
                    <PublicIcon src={item.icon} size={16} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsLauncherOpen((open) => !open)}
            className="flex items-center gap-2 border-r border-[#1b254f]/25 pr-3 text-[10px] font-semibold tracking-[.14em] text-[#1b254f] hover:text-[#7657a6] transition"
          >
            <PublicIcon src="/icons/Icon set 1/0.5x/Menu 256 px.png" size={16} /> Utilities
          </button>

          {/* Open Apps / Window Taskbar Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs sm:max-w-md">
            {windows.map((win) => (
              <button
                key={win.id}
                onClick={() => toggleApp(win)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-semibold border shadow-none transition ${!win.isMinimized
                  ? 'bg-[#7657a6] text-white border-[#7657a6]'
                  : 'bg-white/40 text-[#1b254f] border-[#1b254f]/25 hover:bg-white/60'
                  }`}
              >
                <span>{win.title}</span>
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-300/50 mx-1" />

          {/* Search Bar */}
          <div className="relative flex items-center">
            <PublicIcon src="/icons/Icons8/icons8-home-16.svg" size={13} className="absolute left-2.5 opacity-60" />
            <input
              type="text"
              placeholder="Search city records..."
              className="h-8 w-36 sm:w-44 rounded-none border border-[#1b254f]/25 bg-white/40 backdrop-blur-sm pl-8 pr-3 text-[11px] text-[#1b254f] placeholder:text-[#8b92a7] focus:border-[#7657a6] focus:outline-none"
            />
          </div>
        </div>

        {/* Right Side Controls: Settings, Sanctuary, Logout, MAI */}
        <div className="relative flex items-center gap-2.5">
          {/* Single Settings launcher */}
          <button
            onClick={() => openApp('settings')}
            className="grid h-9 w-9 place-items-center border border-[#1b254f]/30 bg-white/40 transition hover:bg-white/70"
            title="System Settings"
            aria-label="Open system settings"
          >
            <img
              src="/icons/Icons8/icons8-settings-50.gif"
              alt=""
              className="h-5 w-5 object-contain"
              aria-hidden="true"
            />
          </button>

          {/* Sanctuary */}
          <Button
            onClick={() => toggleSanctuary()}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 border-[#1b254f]/25 bg-white/40 text-[#1b254f] hover:bg-white/60 text-[11px] font-ui rounded-none shadow-none backdrop-blur-sm"
            title="Clear Desktop Canvas"
          >
            <PublicIcon src="/icons/Icon set 1/0.5x/Lock 256 px.png" size={13} />
            <span className="hidden sm:inline">Sanctuary</span>
          </Button>

          {/* Log Out */}
          <Button
            onClick={() => logoutUser()}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 border-[#1b254f]/25 bg-white/40 text-[#1b254f] hover:bg-white/60 text-[11px] font-ui rounded-none shadow-none backdrop-blur-sm"
            title="Log Out of Municipal OS"
          >
            <PublicIcon src="/icons/Icon set 1/0.5x/Power sign 256 px.png" size={13} />
            <span className="hidden sm:inline">Log Out</span>
          </Button>

          {/* MAI Agent Popup Assistant */}
          <MAIDock />
        </div>
      </footer>
    </main>
  );
}
