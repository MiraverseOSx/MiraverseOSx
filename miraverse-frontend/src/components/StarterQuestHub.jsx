import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, CheckCircle2, Shield, UserCheck, Zap, ChevronDown, ChevronUp, Lock, Mail } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import soundEngine from '../utils/soundEngine';

const STARTER_PHASES = [
  { phase: 0, title: 'Phase 0 — DGA Identity Registration', desc: 'Open Mail app and verify your identity biometrics via the official DGA email link.' },
  { phase: 1, title: 'Phase 1 — Mandatory Faith Medical Intake', desc: 'Visit Faith Medical portal to complete baseline aura diagnostic scan.' },
  { phase: 2, title: 'Phase 2 — Quarters / Suite Setup', desc: 'Confirm housing assignment (Provisional Quarters or Cycademy Student Suite).' },
  { phase: 3, title: 'Phase 3 — Social Orientation', desc: 'Join Day One Orientation call or Netrunner briefing in ChatMeet.' },
  { phase: 4, title: 'Phase 4 — Freedom & Career Choices', desc: 'Take freelance contracts, work medical/DGA shifts, or apply for Cycademy clearance.' },
  { phase: 5, title: 'Phase 5 — Full Citizen Clearance', desc: 'Full OS clearance unlocked! Engage in daily quest loops, freelance gigs, and spellcrafting.' },
];

export default function StarterQuestHub() {
  const [isExpanded, setIsExpanded] = useState(true);
  const player = useOSStore((s) => s.gameplay.player);
  const toggleApp = useOSStore((s) => s.toggleApp);

  const currentPhase = player.starterPhase || 0;
  const activePhase = STARTER_PHASES.find((p) => p.phase === currentPhase) || STARTER_PHASES[0];

  const handleActionClick = () => {
    soundEngine.playClick();
    if (currentPhase === 0) {
      const commsApp = APPS.find((a) => a.id === 'comms');
      if (commsApp) toggleApp(commsApp);
    } else if (currentPhase === 1) {
      const browserApp = APPS.find((a) => a.id === 'browser');
      if (browserApp) toggleApp(browserApp);
    } else if (currentPhase === 2) {
      const profileApp = APPS.find((a) => a.id === 'passport');
      if (profileApp) toggleApp(profileApp);
    } else if (currentPhase === 3) {
      const meetApp = APPS.find((a) => a.id === 'chatmeet');
      if (meetApp) toggleApp(meetApp);
    } else {
      const boardApp = APPS.find((a) => a.id === 'board');
      if (boardApp) toggleApp(boardApp);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/90 bg-white/85 backdrop-blur-xl p-4 shadow-md select-none text-[#162241]">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e9ebf6] text-[#5f6ab0]">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="font-serif-y2k text-xs font-bold text-[#1d2650]">STARTER ORIENTATION HUB</div>
            <div className="text-[9px] font-mono text-slate-400">PHASE {currentPhase} OF 5</div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-slate-400 hover:text-[#1d2650] transition"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1">
          <div className="rounded-xl border border-indigo-200 bg-[#FAFAFC] p-3 text-xs space-y-1 shadow-sm">
            <div className="font-bold text-[#1d2650] flex items-center justify-between">
              <span>{activePhase.title}</span>
              {!player.dgaVerified && currentPhase === 0 && (
                <span className="text-[9px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 font-mono font-bold">DGA LOCK</span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{activePhase.desc}</p>
          </div>

          <button
            onClick={handleActionClick}
            className="flex w-full items-center justify-between rounded-xl bg-[#17213f] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#28325f] transition shadow-sm"
          >
            <span>Execute Phase Action</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
