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
    return APPS_DIRECTORY.find((a) => a.id === id) || { label: id, icon: Grid, color: 'text-purple-300' };
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) SoundFX.playSnap();
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 h-12 px-3.5 bg-[#120f24f0] backdrop-blur-2xl border border-[#c4b5fd]/25 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.7),0_0_20px_rgba(196,181,253,0.12)] select-none font-sans text-xs text-white max-w-[96vw]">
      
      {/* 1. LEFT: GILDED LAVENDER APP LAUNCHER BUTTON */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onOpenLauncher();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] via-[#9333ea] to-[#d97706] hover:from-[#6d28d9] hover:to-[#b45309] border border-[#fef08a]/40 text-[#fef9c3] font-mono text-xs font-bold transition shadow-[0_2px_12px_rgba(217,119,6,0.3)] active:scale-95 group"
          title="Open Application Directory (Ctrl+Space)"
        >
          <Sparkles size={14} className="text-[#fde047] group-hover:rotate-12 transition-transform" />
          <span className="tracking-wider">Apps</span>
        </button>
      </div>

      {/* 2. CENTER: RUNNING WINDOW ICONS WITH PASTEL GLOW DOTS */}
      <div className="flex items-center gap-1.5 px-2.5 border-l border-r border-[#3b2d64]/60 min-h-[30px]">
        {windows.length === 0 ? (
          <span className="text-[11px] font-mono text-[#a78bfa]/60 px-2 italic">Aureline Space Idle</span>
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
                className={`relative flex flex-col items-center justify-center h-8 w-9 rounded-xl transition group ${
                  isFocused
                    ? 'bg-[#261e47] text-[#fef08a] border border-[#c4b5fd]/50 shadow-[0_0_12px_rgba(196,181,253,0.25)]'
                    : 'text-[#c4b5fd]/70 hover:text-white hover:bg-[#1e1738]'
                }`}
                title={`${meta.label} (${isFocused ? 'Active' : 'Minimized'})`}
              >
                <Icon size={16} className={isFocused ? 'text-[#fef08a]' : 'text-[#c4b5fd]'} />
                {/* Glowing Lavender/Gold Status Dot */}
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                    isFocused ? 'bg-[#fde047] shadow-[0_0_8px_#fde047]' : 'bg-[#7c3aed]'
                  }`}
                />
              </button>
            );
          })
        )}
      </div>

      {/* 3. RIGHT: PASTEL GOLD & LAVENDER SYSTEM TRAY */}
      <div className="flex items-center gap-1.5">
        {/* Subtle Sidebar Toggle */}
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onToggleSidebars();
          }}
          className={`p-1.5 rounded-xl border transition ${
            areSidebarsVisible
              ? 'bg-[#2c2254] text-[#fef08a] border-[#fde047]/50 shadow-xs'
              : 'bg-[#181330] hover:bg-[#251d45] text-[#c4b5fd] hover:text-white border-[#382b60]'
          }`}
          title={areSidebarsVisible ? 'Hide Side Panels' : 'Show Side Panels (Vitals & Progression)'}
        >
          <Sidebar size={14} className={areSidebarsVisible ? 'text-[#fde047]' : 'text-[#c4b5fd]'} />
        </button>

        {/* Smartphone Toggle */}
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onTogglePhone();
          }}
          className="p-1.5 rounded-xl bg-[#181330] hover:bg-[#251d45] text-[#c4b5fd] hover:text-[#fde047] border border-[#382b60] transition"
          title="Toggle Smartphone Simulator"
        >
          <Smartphone size={14} />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="p-1.5 rounded-xl bg-[#181330] hover:bg-[#251d45] text-[#c4b5fd] hover:text-white border border-[#382b60] transition"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? <Volume2 size={14} className="text-[#a7f3d0]" /> : <VolumeX size={14} className="text-[#fda4af]" />}
        </button>

        {/* MAI Voice Assistant Dock */}
        <MAIDock />

        {/* Live Sys-Cycle Clock with Gold Accents */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0d0a1c] border border-[#382b60] text-[11px] font-mono text-[#f3e8ff]">
          <Clock size={11} className="text-[#fde047]" />
          <span>C{cycle} • <strong className="text-[#fef08a]">{timeSegments[timeSegmentIndex]}</strong></span>
        </div>

        {/* Power / Logout */}
        <button
          onClick={logoutUser}
          className="p-1.5 rounded-xl bg-[#351229]/40 hover:bg-[#4c1638]/70 text-[#f472b6] hover:text-[#fb7185] border border-[#831843]/50 transition"
          title="Logout"
        >
          <Power size={13} />
        </button>
      </div>

    </nav>
  );
}
