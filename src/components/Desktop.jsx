// src/components/Desktop.jsx
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays, FileSearch, Gem, LayoutGrid, Mail, Moon, Power,
  Search, Settings, ShieldCheck, Sparkles, Wifi
} from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import Window from './Window';
import SparklesCanvas from './SparklesCanvas';
import ClockDisplay from '../components/ClockDisplay';
import { useTimeStore } from '../utils/timeEngine';

const formatClock = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
const formatDate = (date) => date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

const Panel = ({ children, className = '' }) => (
  <section className={'border border-slate-300/80 bg-white/72 shadow-[0_18px_45px_rgba(43,55,98,0.12)] backdrop-blur-xl ' + className}>
    {children}
  </section>
);

const WHEEL_OF_THE_YEAR = [
  { month: 'January', phase: 'Mid-Winter', icon: '❄️' },
  { month: 'February', phase: 'Late Winter', icon: '🌨️' },
  { month: 'March', phase: 'Early Spring', icon: '🌸' },
  { month: 'April', phase: 'Mid-Spring', icon: '🌧️' },
  { month: 'May', phase: 'Late Spring', icon: '🌿' },
  { month: 'June', phase: 'Early Summer', icon: '☀️' },
  { month: 'July', phase: 'Mid-Summer', icon: '🔥' },
  { month: 'August', phase: 'Late Summer', icon: '🌋' },
  { month: 'September', phase: 'Early Autumn', icon: '🍂' },
  { month: 'October', phase: 'Mid-Autumn', icon: '🌕' },
  { month: 'November', phase: 'Late Autumn', icon: '🌫️' },
  { month: 'December', phase: 'Early Winter', icon: '❄️' },
];

export default function Desktop() {
  const [now, setNow] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isSanctuary, setIsSanctuary] = useState(false);

  const windows = useOSStore((s) => s.windows);
  const toggleApp = useOSStore((s) => s.toggleApp);
  const clearActive = useOSStore((s) => s.clearActive);
  const player = useOSStore((s) => s.gameplay.player);
  const corruption = useOSStore((s) => s.gameplay.prismCorruptionLevel);
  const advanceTime = useOSStore((s) => s.advanceTime);
  const restInDorm = useOSStore((s) => s.restInDorm);

  const currentMonthIndex = useOSStore((s) => s.gameplay.player.currentMonthIndex || 0);
  const advanceMonth = useOSStore((s) => s.advanceMonth);
  const claimDailyReward = useOSStore((s) => s.claimDailyReward);

  // Time engine integration
  const { season, tick } = useTimeStore(state => ({ season: state.season, tick: state.tick }));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Tick every real second
  useEffect(() => {
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [tick]);

  const launch = (app) => toggleApp(app);

  const timeSegments = ['Morning 🌅', 'Afternoon ☀️', 'Evening 🌆', 'Night 🌙'];
  const timeSegmentIndex = useOSStore((s) => s.gameplay.timeSegmentIndex);
  const timeCycleCount = useOSStore((s) => s.gameplay.timeCycleCount);

  return (
    <main
      className={`relative flex h-screen w-screen flex-col overflow-hidden bg-[#eef0f7] text-[#17213f] ${season}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          clearActive();
          setIsLauncherOpen(false);
        }
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.98),transparent_32%),radial-gradient(circle_at_90%_8%,rgba(211,205,255,.55),transparent_30%),linear-gradient(145deg,#e9ecf5_0%,#fafbff_48%,#e4e6f2_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[.10] [background-image:linear-gradient(rgba(24,34,69,.17)_1px,transparent_1px),linear-gradient(90deg,rgba(24,34,69,.17)_1px,transparent_1px)] [background-size:46px_46px]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[.12]">
        <img src="/logo_icon.png" alt="" className="h-[520px] w-[520px] object-contain mix-blend-multiply" />
      </div>
      <SparklesCanvas />

      <header
        className="relative z-30 mx-6 mt-5 flex h-14 items-center justify-between border-y border-white/80 bg-white/55 px-5 shadow-[0_10px_35px_rgba(43,55,98,.09)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <div className="grid h-8 w-8 place-items-center border border-[#bcc6ea] bg-[#17213f] text-[#e5e2ff]"><Sparkles size={14} /></div>
          <div>
            <p className="font-serif-y2k text-lg font-bold leading-none tracking-wide text-[#202851]">MIRAVERSE</p>
            <p className="mt-1 text-[8px] font-semibold tracking-[.22em] text-slate-500">CELESTIAL OPERATING SYSTEM</p>
          </div>

        </div>

        <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[.12em] text-slate-600">
          <button
            onClick={() => advanceTime()}
            className="rounded-lg border border-purple-300 bg-purple-100 px-2.5 py-1 text-purple-950 font-bold hover:bg-purple-200 transition"
            title="Advance Time Segment"
          >
            ⏳ {timeSegments[timeSegmentIndex]}
          </button>

          <button
            onClick={() => advanceMonth()}
            className="rounded-lg border border-cyan-400 bg-cyan-950 px-2.5 py-1 text-cyan-200 font-bold hover:bg-cyan-900 transition flex items-center gap-1 shadow-sm"
            title="Wheel of the Year — Advance Month / Season"
          >
            {WHEEL_OF_THE_YEAR[currentMonthIndex % 12].icon} {WHEEL_OF_THE_YEAR[currentMonthIndex % 12].month} ({WHEEL_OF_THE_YEAR[currentMonthIndex % 12].phase})
          </button>

          <button
            onClick={() => claimDailyReward()}
            className="rounded-lg border border-amber-400 bg-amber-400 text-black font-bold px-2.5 py-1 hover:bg-amber-300 transition flex items-center gap-1 shadow-sm"
            title="Claim 24‑Hour Daily Stipend (+200 Credits, +100 XP)"
          >
            🎁 Daily Stipend
          </button>

          <button
            onClick={() => restInDorm()}
            className="rounded-lg border border-indigo-400 bg-indigo-950 px-2.5 py-1 text-white font-bold hover:bg-indigo-900 transition flex items-center gap-1 shadow-sm"
            title="Rest in Dorm to restore Aura Health & start new Morning"
          >
            <Moon size={12} className="text-cyan-300" /> Rest in Dorm
          </button>

          <ClockDisplay />
          <Wifi size={15} className="text-[#4a5591]" />
        </div>
      </header>

      {/* The remainder of the original Desktop component (sidebars, windows, launcher, etc.) remains unchanged. */}
    </main>
  );
}
