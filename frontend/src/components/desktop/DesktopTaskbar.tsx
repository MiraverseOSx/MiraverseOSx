import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { APPS_DIRECTORY } from './AppLauncherModal';
import MAIDock from '../widgets/MAIDock';
import { 
  LayoutGrid, Smartphone, Power, Sidebar, 
  Volume2, VolumeX, Clock, Sparkles, Grid
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';

export interface DesktopTaskbarProps {
  areSidebarsVisible: boolean;
  onToggleSidebars: () => void;
  onTogglePhone: () => void;
  onOpenLauncher: () => void;
}

export default function DesktopTaskbar({
  areSidebarsVisible,
  onToggleSidebars,
  onTogglePhone,
  onOpenLauncher,
}: DesktopTaskbarProps) {
  const { windows, toggleApp, logoutUser } = useOSStore();
  const { soundEnabled, toggleSound } = useSystemStore();

  const cycle = useOSStore((s) => s.gameplay?.timeCycleCount) || 1;
  const timeSegmentIndex = useOSStore((s) => s.gameplay?.timeSegmentIndex) || 0;
  const timeSegments = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const getAppMeta = (id: string) => {
    return APPS_DIRECTORY.find((a) => a.id === id) || { label: id, icon: Grid, color: 'text-slate-300' };
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) SoundFX.playSnap();
  };

  return (
    <nav className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 h-11 px-3 bg-[#0a0f1df0] backdrop-blur-2xl border border-[#1e2a4a] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] select-none font-sans text-xs text-slate-100 max-w-[96vw]">
      
      {/* 1. LEFT: SLENDER APP LAUNCHER BUTTON */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onOpenLauncher();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141d36] hover:bg-[#1c294c] border border-[#24335c] text-sky-300 font-mono text-xs font-semibold transition active:scale-95 group"
          title="App Directory (Ctrl+Space)"
        >
          <LayoutGrid size={14} className="text-sky-400 group-hover:rotate-45 transition-transform" />
          <span className="tracking-wide">Apps</span>
        </button>
      </div>

      {/* 2. CENTER: RUNNING WINDOW ICONS WITH ACTIVE GLOW DOTS */}
      <div className="flex items-center gap-1 px-2 border-l border-r border-[#16213a] min-h-[28px]">
        {windows.length === 0 ? (
          <span className="text-[10px] font-mono text-slate-500 px-2 italic">Workspace Idle</span>
        ) : (
          windows.map((win) => {
            const meta = getAppMeta(win.id);
            const Icon = meta.icon;
            const isFocused = !win.isMinimized;

            return (
              <button
                key={win.id}
                onClick={() => {
                  if (soundEnabled) SoundFX.playSnap();
                  toggleApp(win);
                }}
                className={`relative flex flex-col items-center justify-center h-7 w-8 rounded-lg transition group ${
                  isFocused
                    ? 'bg-[#16213e] text-sky-300 border border-[#2b3a67] shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#12192e]'
                }`}
                title={`${meta.label} (${isFocused ? 'Active' : 'Minimized'})`}
              >
                <Icon size={15} className={isFocused ? meta.color : 'text-slate-400'} />
                {/* Active Indicator Dot */}
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                    isFocused ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' : 'bg-slate-500'
                  }`}
                />
              </button>
            );
          })
        )}
      </div>

      {/* 3. RIGHT: REFINED SYSTEM TRAY */}
      <div className="flex items-center gap-1.5">
        {/* Subtle Sidebar Toggle */}
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onToggleSidebars();
          }}
          className={`p-1.5 rounded-lg border transition ${
            areSidebarsVisible
              ? 'bg-[#182342] text-amber-300 border-amber-500/40 shadow-xs'
              : 'bg-[#10172c] hover:bg-[#16213e] text-slate-400 hover:text-slate-200 border-[#1c2744]'
          }`}
          title={areSidebarsVisible ? 'Hide Side Panels' : 'Show Side Panels (Vitals & Progression)'}
        >
          <Sidebar size={14} className={areSidebarsVisible ? 'text-amber-400' : 'text-slate-400'} />
        </button>

        {/* Smartphone Toggle */}
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onTogglePhone();
          }}
          className="p-1.5 rounded-lg bg-[#10172c] hover:bg-[#16213e] text-slate-400 hover:text-amber-400 border border-[#1c2744] transition"
          title="Toggle Smartphone"
        >
          <Smartphone size={14} />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="p-1.5 rounded-lg bg-[#10172c] hover:bg-[#16213e] text-slate-400 hover:text-sky-400 border border-[#1c2744] transition"
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-rose-400" />}
        </button>

        {/* MAI Voice Assistant Dock */}
        <MAIDock />

        {/* Live Sys-Cycle Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#070b16] border border-[#16213a] text-[10px] font-mono text-slate-400">
          <Clock size={11} className="text-sky-400" />
          <span>C{cycle} • {timeSegments[timeSegmentIndex]}</span>
        </div>

        {/* Power / Logout */}
        <button
          onClick={logoutUser}
          className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 transition"
          title="Logout"
        >
          <Power size={13} />
        </button>
      </div>

    </nav>
  );
}
