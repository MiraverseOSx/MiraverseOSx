import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, CheckCircle2, Shield, UserCheck, Zap, ChevronDown, ChevronUp, Lock, Mail, Award, Compass, Map, CheckSquare } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import soundEngine from '../utils/soundEngine';

const CATEGORY_ICONS = {
  Quests: Sparkles,
  Journey: Compass,
  Adventures: Map,
  Tasks: CheckSquare,
  Missions: Award,
};

export default function StarterQuestHub() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Quests'); // 'Quests' | 'Journey' | 'Adventures' | 'Tasks' | 'Missions'

  const player = useOSStore((s) => s.gameplay.player);
  const onboardingPhase = useOSStore((s) => s.gameplay.onboardingPhase) || 1;
  const toggleApp = useOSStore((s) => s.toggleApp);

  const activities = player.activities || [];
  const filteredActivities = activities.filter((a) => a.category === activeCategory);

  const handleActionClick = (act) => {
    soundEngine.playClick();

    if (act.id === 'Q_DAY1_2') {
      const mailApp = APPS.find((a) => a.id === 'mail');
      if (mailApp) toggleApp(mailApp);
    } else if (act.id === 'Q_DAY1_3') {
      const passportApp = APPS.find((a) => a.id === 'passport');
      if (passportApp) toggleApp(passportApp);
    } else if (act.id === 'Q_DAY1_4') {
      const pulseApp = APPS.find((a) => a.id === 'pulse');
      if (pulseApp) toggleApp(pulseApp);
    } else if (act.id === 'Q_DAY1_5') {
      const commsApp = APPS.find((a) => a.id === 'comms');
      if (commsApp) toggleApp(commsApp);
    } else {
      const browserApp = APPS.find((a) => a.id === 'browser');
      if (browserApp) toggleApp(browserApp);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/90 bg-white/85 backdrop-blur-xl p-4 shadow-md select-none text-[#162241] font-sans">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e9ebf6] text-[#5f6ab0]">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="font-serif text-xs font-bold text-[#1d2650]">DAY 1 INITIALIZATION HUB</div>
            <div className="text-[9px] font-mono text-slate-400">PHASE {onboardingPhase} OF 5</div>
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
          {/* Category Tabs */}
          <div className="flex items-center justify-between bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-[10px]">
            {['Quests', 'Journey', 'Adventures', 'Tasks', 'Missions'].map((cat) => {
              const IconComp = CATEGORY_ICONS[cat] || Sparkles;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition ${
                    activeCategory === cat ? 'bg-[#17213f] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <IconComp size={11} />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Activity Cards Feed */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredActivities.map((act) => {
              const isDone = act.status === 'COMPLETED';
              const isLocked = act.status === 'LOCKED';

              return (
                <div
                  key={act.id}
                  className={`rounded-xl border p-3 text-xs space-y-1.5 transition ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : isLocked
                      ? 'border-slate-200 bg-slate-50 opacity-60'
                      : 'border-indigo-200 bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[#1d2650]">
                    <span className="flex items-center gap-1.5">
                      {isDone ? <CheckCircle2 size={13} className="text-emerald-600 shrink-0" /> : isLocked ? <Lock size={12} className="text-slate-400 shrink-0" /> : <Sparkles size={12} className="text-indigo-600 shrink-0" />}
                      <span>{act.title}</span>
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : isLocked ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {act.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">{act.desc}</p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px]">
                    <span className="font-semibold text-amber-700">{act.reward}</span>
                    {!isDone && !isLocked && (
                      <button
                        onClick={() => handleActionClick(act)}
                        className="flex items-center gap-1 font-bold text-[#17213f] hover:text-indigo-600 transition"
                      >
                        <span>Track</span>
                        <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {!filteredActivities.length && (
              <div className="p-4 text-center text-xs text-slate-400 italic">
                No active objectives in {activeCategory}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
