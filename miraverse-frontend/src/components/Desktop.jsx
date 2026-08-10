import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useOSStore } from '../store/useOSStore';
import Window from './Window';
import PhoneWidget from './widgets/PhoneWidget';
import DocumentModal from './DocumentModal';
import SignalPlayerModal from './widgets/SignalPlayerModal';
import SparklesCanvas from './SparklesCanvas';
import MeridionLandingPage from './MeridionLandingPage';
import LoginScreen from './LoginScreen';

import IdentityVitals from './IdentityVitals';
import CommandCenter from './CommandCenter';
import ProgressionPanel from './ProgressionPanel';
import DesktopTaskbar from './desktop/DesktopTaskbar';
import SanctuaryOverlay from './desktop/SanctuaryOverlay';
import ToastViewport from './ToastViewport';
import logoIcon from '../assets/images/logo_icon.png';

export default function Desktop() {
  const { isLoggedIn, windows, isSanctuary, toggleApp } = useOSStore();

  const workspaceRef = useRef(null);
  const appWorkspaceRef = useRef(null);

  const [authMode, setAuthMode] = useState(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isSignalPlayerOpen, setIsSignalPlayerOpen] = useState(false);
  const [areSidebarsVisible, setAreSidebarsVisible] = useState(true);

  const openAppById = (id) => {
    const app = useOSStore.getState().windows.find((w) => w.id === id) || { id };
    toggleApp(app);
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
      className="os-desktop relative flex h-screen w-screen flex-col overflow-hidden select-none font-ui text-[#1b254f] bg-[#cfd4e2]"
    >
      {/* Background Branding & Ambient Canvas */}
      <div className="pointer-events-none absolute bottom-6 right-6 z-0 opacity-[0.06]">
        <img
          src={logoIcon}
          alt="MIRAVERSE OS"
          className="h-64 w-64 md:h-80 md:w-80 object-contain blur-[0.5px]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
        <SparklesCanvas />
      </div>

      {/* Main Workspace Layout (Grid: Identity Vitals | Command Center | Progression Panel) */}
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden pb-12">
        <AnimatePresence>
          {!isSanctuary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="unified-workspace-container grid h-full w-full grid-cols-12 gap-0 overflow-hidden"
            >
              {areSidebarsVisible && <IdentityVitals onOpenCitizenRecord={() => openAppById('passport')} />}

              <main
                ref={appWorkspaceRef}
                className={`navy-cosmic-shell min-h-0 overflow-hidden border-0 p-6 backdrop-blur-[12px] ${areSidebarsVisible ? 'col-span-8' : 'col-span-12'}`}
              >
                <CommandCenter
                  onOpenDocument={() => setIsDocumentModalOpen(true)}
                  onOpenSignal={() => setIsSignalPlayerOpen(true)}
                />
              </main>

              {areSidebarsVisible && <ProgressionPanel />}
            </motion.div>
          )}
        </AnimatePresence>

        {isSanctuary && <SanctuaryOverlay />}
      </div>

      {/* Floating Application Windows */}
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

      {/* OS Footer Taskbar */}
      <DesktopTaskbar
        areSidebarsVisible={areSidebarsVisible}
        onToggleSidebars={() => setAreSidebarsVisible((visible) => !visible)}
        onTogglePhone={() => setIsPhoneOpen((open) => !open)}
        onOpenDocumentModal={() => setIsDocumentModalOpen(true)}
        onOpenSignalPlayer={() => setIsSignalPlayerOpen(true)}
      />
      <ToastViewport />
    </main>
  );
}
