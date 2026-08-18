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
    return APPS_DIRECTORY.find((a) => a.id === id) || { label: id, icon: Grid, color: 'text-[#FBE6AB]' };
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) SoundFX.playSnap();
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 h-12 px-3.5 bg-[#1E3D75]/85 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-[0_16px_50px_rgba(12,25,54,0.65),0_0_24px_rgba(229,195,112,0.20)] select-none font-ui text-xs text-[#FFFFFF] max-w-[96vw]">
      
      {/* 1. LEFT: STARLIGHT GOLD APP LAUNCHER BUTTON */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onOpenLauncher();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E5C370] via-[#F5D378] to-[#315D9E] hover:from-[#FBE6AB] hover:to-[#24467D] border border-white/40 text-[#0E1A33] font-ui text-xs font-bold transition-all shadow-[0_2px_14px_rgba(229,195,112,0.45)] active:scale-95 group hover:-translate-y-0.5"
          title="Open Application Directory (Ctrl+Space)"
        >
          <Sparkles size={14} className="text-[#0E1A33] group-hover:rotate-12 transition-transform" />
          <span className="font-display tracking-wider font-bold">Apps</span>
        </button>
      </div>

      {/* 2. CENTER: RUNNING WINDOW ICONS WITH STARLIGHT GOLD GLOW */}
      <div className="flex items-center gap-1.5 px-2.5 border-l border-r border-[#315D9E]/60 min-h-[30px]">
        {windows.length === 0 ? (
          <span className="text-[11px] font-ui text-[#D5E2F5]/70 px-2 italic">Aureline Space Idle</span>
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
                className={`relative flex flex-col items-center justify-center h-8 w-9 rounded-xl transition-all group ${
                  isFocused
                    ? 'bg-[#315D9E]/90 text-[#FBE6AB] border border-[#E5C370]/70 shadow-[0_0_14px_rgba(229,195,112,0.35)] -translate-y-0.5'
                    : 'text-[#D5E2F5]/80 hover:text-[#FFFFFF] hover:bg-[#315D9E]/50'
                }`}
                title={`${meta.label} (${isFocused ? 'Active' : 'Minimized'})`}
              >
                <Icon size={16} className={isFocused ? 'text-[#FBE6AB]' : 'text-[#D5E2F5]'} />
                {/* Luminous Starlight Status Underline */}
                <span
                  className={`absolute bottom-0.5 h-1 w-3 rounded-full transition-all ${
                    isFocused ? 'bg-[#E5C370] shadow-[0_0_8px_#E5C370]' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })
        )}
      </div>

      {/* 3. RIGHT: STARLIGHT GOLD & CELESTIAL TRAY */}
      <div className="flex items-center gap-1.5">
        {/* Smartphone Toggle */}
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onTogglePhone();
          }}
          className="p-1.5 rounded-xl bg-[#1E3D75]/70 hover:bg-[#315D9E]/70 text-[#D5E2F5] hover:text-[#FBE6AB] border border-white/15 transition-all hover:-translate-y-0.5"
          title="Toggle Smartphone Simulator"
        >
          <Smartphone size={14} />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="p-1.5 rounded-xl bg-[#1E3D75]/70 hover:bg-[#315D9E]/70 text-[#D5E2F5] hover:text-white border border-white/15 transition-all hover:-translate-y-0.5"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? <Volume2 size={14} className="text-[#4CD6C4]" /> : <VolumeX size={14} className="text-[#F43F5E]" />}
        </button>

        {/* MAI Voice Assistant Dock */}
        <MAIDock />

        {/* Live Sys-Cycle Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#142850]/80 border border-[#315D9E]/60 text-[11px] font-ui text-[#FFFFFF]">
          <Clock size={11} className="text-[#E5C370]" />
          <span>C{cycle} • <strong className="text-[#FBE6AB]">{timeSegments[timeSegmentIndex]}</strong></span>
        </div>

        {/* Power / Logout */}
        <button
          onClick={logoutUser}
          className="p-1.5 rounded-xl bg-[#581D5E]/50 hover:bg-[#581D5E]/90 text-[#FFE2F9] hover:text-white border border-[#581D5E] transition-all hover:-translate-y-0.5"
          title="Logout"
        >
          <Power size={13} />
        </button>
      </div>

    </nav>
  );
}
