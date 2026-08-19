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

import DesktopTaskbar from './DesktopTaskbar';
import AppLauncherModal from './AppLauncherModal';
import SanctuaryOverlay from './SanctuaryOverlay';
import ToastViewport from '../widgets/ToastViewport';
import logoIcon from '../../assets/images/logo_icon.png';
import { useSystemStore } from '../../store/useSystemStore';

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
      className="celestial-nebula-bg constellation-sparkles relative flex h-screen w-screen flex-col overflow-hidden select-none font-ui text-[#FFFFFF]"
    >
      {/* 1. PRISTINE BACKGROUND WITH CELESTIAL EMBLEM & STARBURSTS */}
      <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
        {/* Soft Starlight Gold & Nebula Ambient Aura */}
        <div className="absolute h-[560px] w-[560px] rounded-full bg-[#E5C370]/15 blur-[150px]" />
        <div className="absolute h-[340px] w-[340px] rounded-full bg-[#315D9E]/35 blur-[120px]" />
        
        {/* Prominent Logo & Typographic Brand */}
        <div className="relative flex flex-col items-center text-center opacity-90 select-none">
          <img
            src={logoIcon}
            alt="MIRAVERSE OS Emblem"
            className="h-44 w-44 md:h-56 md:w-56 object-contain drop-shadow-[0_0_50px_rgba(229,195,112,0.40)] filter brightness-110"
          />
          <h1 className="mt-4 font-display font-bold text-lg md:text-2xl tracking-[0.28em] text-[#FFFFFF] uppercase drop-shadow-[0_2px_12px_rgba(12,25,54,0.7)]">
            MIRAVERSE OS x
          </h1>
          <p className="mt-1 text-[10px] md:text-xs font-ui tracking-[0.35em] text-[#D5E2F5] uppercase font-semibold">
            Celestial Operating System // Aureline
          </p>
        </div>
      </div>

      {/* Ambient Celestial Particle Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25">
        <SparklesCanvas />
      </div>

      {/* 2. MAIN DESKTOP WORKSPACE (FULL-WIDTH CLEAN CANVAS FOR WINDOWS) */}
      <div ref={appWorkspaceRef} className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        {isSanctuary && <SanctuaryOverlay />}
      </div>

      {/* 3. FLOATING APPLICATION WINDOWS */}
      <AnimatePresence>
        {windows.filter((win) => !win.isMinimized).map((win) => (
          <Window
            key={win.id}
            win={win}
            windowIndex={windows.findIndex((candidate) => candidate.id === win.id)}
            isFocusMode={true}
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
        onTogglePhone={() => setIsPhoneOpen((open) => !open)}
        onOpenLauncher={() => setIsLauncherOpen(true)}
      />

      <ToastViewport />
    </main>
  );
}
