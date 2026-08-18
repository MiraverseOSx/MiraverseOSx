import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useOSStore } from '../../store/useOSStore';
import Window from '../ui/Window';
import PhoneWidget from '../widgets/PhoneWidget';
import DocumentModal from '../widgets/DocumentModal';
import SignalPlayerModal from '../widgets/SignalPlayerModal';
import SparklesCanvas from '../widgets/SparklesCanvas';
import MeridionLandingPage from '../ui/MeridionLandingPage';
import LoginScreen from '../ui/LoginScreen';

import IdentityVitals from '../widgets/IdentityVitals';
import ProgressionPanel from '../widgets/ProgressionPanel';
import DesktopTaskbar from './DesktopTaskbar';
import AppLauncherModal from './AppLauncherModal';
import SanctuaryOverlay from './SanctuaryOverlay';
import ToastViewport from '../widgets/ToastViewport';
import logoIcon from '../../assets/images/logo_icon.png';
import { ChevronLeft, ChevronRight, User, Globe, Sparkles } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';

export default function Desktop() {
  const { isLoggedIn, windows, isSanctuary, toggleApp } = useOSStore();
  const { soundEnabled } = useSystemStore();

  const workspaceRef = useRef(null);
  const appWorkspaceRef = useRef(null);

  const [authMode, setAuthMode] = useState(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isSignalPlayerOpen, setIsSignalPlayerOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [areSidebarsVisible, setAreSidebarsVisible] = useState(false);

  const openAppById = (id) => {
    const app = useOSStore.getState().windows.find((w) => w.id === id) || { id };
    toggleApp(app);
  };

  const handleToggleSidebars = () => {
    if (soundEnabled) SoundFX.playSnap();
    setAreSidebarsVisible((prev) => !prev);
  };

  // Keyboard shortcut: Ctrl+Space / Cmd+Space to open App Launcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsLauncherOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        onDirectLaunch={() => {
          useOSStore.getState().loginUser({
            name: 'Netrunner One',
            clearance: 1,
            credits: 1500,
            level: 1,
          });
        }}
      />
    );
  }

  return (
    <main
      ref={workspaceRef}
      className="os-desktop relative flex h-screen w-screen flex-col overflow-hidden select-none font-sans text-white bg-[#0a0817]"
    >
      {/* 1. PRISTINE BACKGROUND WITH PROMINENT LAVENDER & GOLD GLOWING EMBLEM */}
      <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
        {/* Soft Lavender & Gold Radial Ambient Aura */}
        <div className="absolute h-[520px] w-[520px] rounded-full bg-[#7c3aed]/15 blur-[140px]" />
        <div className="absolute h-[320px] w-[320px] rounded-full bg-[#f59e0b]/10 blur-[100px]" />
        
        {/* Prominent Logo & Typographic Brand */}
        <div className="relative flex flex-col items-center text-center opacity-85 select-none">
          <img
            src={logoIcon}
            alt="MIRAVERSE OS Emblem"
            className="h-44 w-44 md:h-56 md:w-56 object-contain drop-shadow-[0_0_45px_rgba(196,181,253,0.35)] filter brightness-110"
          />
          <h1 className="mt-4 font-serif font-bold text-lg md:text-2xl tracking-[0.28em] text-[#fef9c3] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            MIRAVERSE OS x
          </h1>
          <p className="mt-1 text-[10px] md:text-xs font-mono tracking-[0.35em] text-[#c4b5fd] uppercase">
            Celestial Operating System // Aureline
          </p>
        </div>
      </div>

      {/* Ambient Celestial Particle Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25">
        <SparklesCanvas />
      </div>

      {/* 2. MAIN DESKTOP WORKSPACE (BLANK & SPACIOUS CANVAS FOR WINDOWS) */}
      <div ref={appWorkspaceRef} className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        {/* Subtle Edge Handle - Left (Vitals) */}
        {!areSidebarsVisible && (
          <button
            onClick={handleToggleSidebars}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 h-16 w-3.5 rounded-r-lg bg-[#1f1740]/70 hover:bg-[#7c3aed] border-r border-y border-[#c4b5fd]/30 text-[#c4b5fd] hover:text-white transition flex items-center justify-center shadow-lg group"
            title="Reveal Identity Vitals (Click or Toggle)"
          >
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Subtle Edge Handle - Right (Progression) */}
        {!areSidebarsVisible && (
          <button
            onClick={handleToggleSidebars}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 h-16 w-3.5 rounded-l-lg bg-[#1f1740]/70 hover:bg-[#7c3aed] border-l border-y border-[#c4b5fd]/30 text-[#c4b5fd] hover:text-white transition flex items-center justify-center shadow-lg group"
            title="Reveal Progression Panel (Click or Toggle)"
          >
            <ChevronLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Left Side Panel Column (Identity Vitals) */}
        <AnimatePresence>
          {areSidebarsVisible && !isSanctuary && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="absolute left-0 top-0 bottom-16 z-30 w-72 shadow-2xl border-r border-[#3e2c6e] bg-[#100c22] overflow-y-auto"
            >
              <IdentityVitals
                onOpenCitizenRecord={() => openAppById('passport')}
                onTogglePhone={() => setIsPhoneOpen((prev) => !prev)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side Panel Column (Progression Panel) */}
        <AnimatePresence>
          {areSidebarsVisible && !isSanctuary && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="absolute right-0 top-0 bottom-16 z-30 w-72 shadow-2xl border-l border-[#3e2c6e] bg-[#100c22] overflow-y-auto"
            >
              <ProgressionPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {isSanctuary && <SanctuaryOverlay />}
      </div>

      {/* 3. FLOATING APPLICATION WINDOWS */}
      <AnimatePresence>
        {windows.filter((win) => !win.isMinimized).map((win) => (
          <Window
            key={win.id}
            win={win}
            windowIndex={windows.findIndex((candidate) => candidate.id === win.id)}
            isFocusMode={!areSidebarsVisible}
            workspaceRef={appWorkspaceRef}
          />
        ))}
      </AnimatePresence>

      {/* Modals & Overlays */}
      {isPhoneOpen && (
        <div className="fixed bottom-20 right-6 z-50 shadow-2xl">
          <PhoneWidget />
        </div>
      )}

      {isDocumentModalOpen && (
        <DocumentModal onClose={() => setIsDocumentModalOpen(false)} />
      )}

      {isSignalPlayerOpen && (
        <SignalPlayerModal onClose={() => setIsSignalPlayerOpen(false)} />
      )}

      {/* Refined Lavender & Gold App Launcher Modal */}
      <AppLauncherModal
        isOpen={isLauncherOpen}
        onClose={() => setIsLauncherOpen(false)}
      />

      {/* Minimalist Floating Island Dock */}
      <DesktopTaskbar
        areSidebarsVisible={areSidebarsVisible}
        onToggleSidebars={handleToggleSidebars}
        onTogglePhone={() => setIsPhoneOpen((open) => !open)}
        onOpenLauncher={() => setIsLauncherOpen(true)}
      />

      <ToastViewport />
    </main>
  );
}
