import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import MenuBar from './MenuBar';
import Dock from './Dock';
import DesktopIcon from './DesktopIcon';
import Window from './Window';

export default function Desktop() {
  const wallpaper = useOSStore((s) => s.wallpaper);
  const windows = useOSStore((s) => s.windows);
  const clearActive = useOSStore((s) => s.clearActive);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-os-primary bg-cover bg-center"
      style={{ backgroundImage: `url("${wallpaper}")` }}
      onMouseDown={(e) => {
        // Only deselect when the click lands on the bare desktop, not a window/icon.
        if (e.target === e.currentTarget) clearActive();
      }}
    >
      <MenuBar />

      {/* Desktop icons — top-left column */}
      <div className="absolute left-3 top-11 flex flex-col gap-2">
        {APPS.map((app) => (
          <DesktopIcon key={app.id} app={app} />
        ))}
      </div>

      {/* Onboarding Starter Progression Guide Widget */}
      <OnboardingWidget />

      {/* Windows */}
      <AnimatePresence>
        {windows
          .filter((w) => !w.isMinimized)
          .map((win) => (
            <Window key={win.id} win={win} />
          ))}
      </AnimatePresence>

      <Dock />
    </div>
  );
}

const PHASES = [
  { phase: 0, title: 'Phase 0: First Boot', task: 'Read registration packet in Comms' },
  { phase: 1, title: 'Phase 1: Identity Setup', task: 'Activate Aura Passport & confirm House' },
  { phase: 2, title: 'Phase 2: Life Setup', task: 'Confirm Dorm Assignment & check initial ledger' },
  { phase: 3, title: 'Phase 3: Health & Systems', task: 'Review Faith Medical portal diagnostics' },
  { phase: 4, title: 'Phase 4: Social Activation', task: 'Join ChatMeet orientation session' },
  { phase: 5, title: 'Phase 5: First Free Day', task: 'Free Exploration — Onboarding Complete!' },
];

function OnboardingWidget() {
  const starterPhase = useOSStore((s) => s.gameplay?.player?.starterPhase || 0);
  const current = PHASES.find((p) => p.phase === starterPhase) || PHASES[5];

  return (
    <div className="absolute right-4 top-11 w-72 rounded-2xl border border-white/15 bg-black/40 p-3.5 backdrop-blur-md text-white shadow-2xl select-none z-0">
      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-cyan-400 border-b border-white/10 pb-2">
        <span>⚡ Starter Guide</span>
        <span>Phase {starterPhase} / 5</span>
      </div>
      <div className="mt-2.5">
        <div className="font-bold text-xs text-white">{current.title}</div>
        <div className="mt-1 text-[11px] text-white/70 leading-relaxed">{current.task}</div>
      </div>
      <div className="mt-3 h-1.5 w-full rounded bg-white/10 overflow-hidden">
        <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${((starterPhase + 1) / 6) * 100}%` }} />
      </div>
    </div>
  );
}
