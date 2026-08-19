import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { APPS_DIRECTORY } from './AppLauncherModal';
import MAIDock from '../widgets/MAIDock';
import { 
  Smartphone, Power, 
  Volume2, VolumeX, Clock, Sparkles, Grid
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';

export interface DesktopTaskbarProps {
  onTogglePhone: () => void;
  onOpenLauncher: () => void;
}

export default function DesktopTaskbar({
  onTogglePhone,
  onOpenLauncher,
}: DesktopTaskbarProps) {
  const { windows, toggleApp, logoutUser } = useOSStore();
  const { soundEnabled, toggleSound } = useSystemStore();

  const cycle = useOSStore((s) => s.gameplay?.timeCycleCount) || 1;
  const timeSegmentIndex = useOSStore((s) => s.gameplay?.timeSegmentIndex) || 0;
  const timeSegments = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const getAppMeta = (id: string) => {
    return APPS_DIRECTORY.find((a) => a.id === id) || { label: id, icon: Grid, color: 'text-amber-600' };
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) SoundFX.playSnap();
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 h-12 px-3.5 bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.12)] select-none font-ui text-xs text-slate-800 max-w-[96vw]">
      
      {/* 1. LEFT: PASTEL GOLD APP LAUNCHER BUTTON (ICON-ONLY) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onOpenLauncher();
          }}
          className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 hover:from-amber-200 hover:to-amber-400 border border-amber-300/80 text-amber-950 transition-all shadow-xs active:scale-95 group hover:-translate-y-0.5"
          title="Open Application Directory (Ctrl+Space)"
        >
          <Sparkles size={16} className="text-amber-800 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* 2. CENTER: RUNNING WINDOW ICONS */}
      <div className="flex items-center gap-1.5 px-2.5 border-l border-r border-slate-200 min-h-[30px]">
        {windows.length === 0 ? (
          <span className="text-[11px] font-ui text-slate-400 px-2 italic">Aureline Space Idle</span>
        ) : (
          windows.map((win) => {
            const meta = getAppMeta(win.id);
            const Icon = meta?.icon || Grid;
            const isFocused = !win.isMinimized;

            return (
              <button
                key={win.id}
                onClick={() => {
                  if (soundEnabled) SoundFX.playSnap();
                  toggleApp(win);
                }}
                className={`relative flex flex-col items-center justify-center h-8 w-9 rounded-xl transition-all group ${
                  isFocused
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs -translate-y-0.5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={`${meta?.label || win.id} (${isFocused ? 'Active' : 'Minimized'})`}
              >
                {Icon && <Icon size={16} className={isFocused ? 'text-indigo-600' : 'text-slate-500'} />}
                {/* Luminous Status Underline */}
                <span
                  className={`absolute bottom-0.5 h-1 w-3 rounded-full transition-all ${
                    isFocused ? 'bg-amber-400 shadow-xs' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })
        )}
      </div>

      {/* 3. RIGHT: LIGHT TRAY CONTROLS */}
      <div className="flex items-center gap-1.5">
        {/* Smartphone Toggle */}
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onTogglePhone();
          }}
          className="p-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all hover:-translate-y-0.5"
          title="Toggle Smartphone Simulator"
        >
          <Smartphone size={14} />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="p-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all hover:-translate-y-0.5"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? <Volume2 size={14} className="text-emerald-600" /> : <VolumeX size={14} className="text-rose-500" />}
        </button>

        {/* MAI Voice Assistant Dock */}
        <MAIDock />

        {/* Live Sys-Cycle Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/90 border border-slate-200 text-[11px] font-ui text-slate-700">
          <Clock size={11} className="text-amber-600" />
          <span>C{cycle} • <strong className="text-slate-900">{timeSegments[timeSegmentIndex]}</strong></span>
        </div>

        {/* Power / Logout */}
        <button
          onClick={logoutUser}
          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 transition-all hover:-translate-y-0.5"
          title="Logout"
        >
          <Power size={13} />
        </button>
      </div>

    </nav>
  );
}
