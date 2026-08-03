import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, CheckCircle2, Shield, UserCheck, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import soundEngine from '../utils/soundEngine';

const STARTER_PHASES = [
  { phase: 0, title: 'Phase 0 — Provisional Citizen Boot', desc: 'Boot MIRAVERSE OSX as a Fresh Provisional Citizen. Confirm citizen ID & claim emergency stipend.' },
  { phase: 1, title: 'Phase 1 — Life Path Selection', desc: 'Open Civic Profile to choose Path A (Cycademy Student Track) or Path B (Independent Freelancer).' },
  { phase: 2, title: 'Phase 2 — Quarters / Suite Setup', desc: 'Confirm housing assignment (Citizen Quarters or Cycademy Student Suite) & review rules.' },
  { phase: 3, title: 'Phase 3 — Faith Medical Clearance', desc: 'Visit Faith Medical portal to complete baseline aura diagnostics.' },
  { phase: 4, title: 'Phase 4 — Social Orientation', desc: 'Join Day One Orientation call or Netrunner briefing in ChatMeet.' },
  { phase: 5, title: 'Phase 5 — Full Citizen Clearance', desc: 'Full OS clearance unlocked! Engage in daily quest loops, freelance gigs, and spellcrafting.' },
];

export default function StarterQuestHub() {
  const [isExpanded, setIsExpanded] = useState(true);
  const player = useOSStore((s) => s.gameplay.player);
  const toggleApp = useOSStore((s) => s.toggleApp);
  const advanceStarterPhase = useOSStore((s) => s.advanceStarterPhase);

  const currentPhase = player.starterPhase || 0;
  const activePhase = STARTER_PHASES.find((p) => p.phase === currentPhase) || STARTER_PHASES[0];

  const handleActionClick = () => {
    soundEngine.playClick();
    if (currentPhase === 0) {
      const profileApp = APPS.find((a) => a.id === 'passport');
      if (profileApp) toggleApp(profileApp);
      advanceStarterPhase(1);
    } else if (currentPhase === 1) {
      const profileApp = APPS.find((a) => a.id === 'passport');
      if (profileApp) toggleApp(profileApp);
    } else if (currentPhase === 3) {
      const medApp = APPS.find((a) => a.id === 'browser');
      if (medApp) toggleApp(medApp);
    } else if (currentPhase === 4) {
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
            <div className="font-bold text-[#1d2650]">{activePhase.title}</div>
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
