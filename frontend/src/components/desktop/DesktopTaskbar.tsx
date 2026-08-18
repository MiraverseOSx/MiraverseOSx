import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { APPS_DIRECTORY } from './AppLauncherModal';
import MAIDock from '../widgets/MAIDock';
import { 
  Smartphone, Power, Sidebar, 
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
    return APPS_DIRECTORY.find((a) => a.id === id) || { label: id, icon: Grid, color: 'text-amber-300' };
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) SoundFX.playSnap();
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-3 h-12 px-3.5 bg-[#142B52]/80 backdrop-blur-2xl border border-white/18 rounded-2xl shadow-[0_16px_50px_rgba(10,16,38,0.75),0_0_24px_rgba(212,176,106,0.15)] select-none font-ui text-xs text-[#F8F6EE] max-w-[96vw]">
      
      {/* 1. LEFT: STARLIGHT GOLD APP LAUNCHER BUTTON */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onOpenLauncher();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4B06A] via-[#ECC86C] to-[#254A7A] hover:from-[#F0D79A] hover:to-[#142B52] border border-[#F8F6EE]/40 text-[#0A1026] font-ui text-xs font-bold transition-all shadow-[0_2px_14px_rgba(212,176,106,0.4)] active:scale-95 group hover:-translate-y-0.5"
          title="Open Application Directory (Ctrl+Space)"
        >
          <Sparkles size={14} className="text-[#0A1026] group-hover:rotate-12 transition-transform" />
          <span className="font-display tracking-wider font-bold">Apps</span>
        </button>
      </div>

      {/* 2. CENTER: RUNNING WINDOW ICONS WITH STARLIGHT GOLD GLOW */}
      <div className="flex items-center gap-1.5 px-2.5 border-l border-r border-[#254A7A]/60 min-h-[30px]">
        {windows.length === 0 ? (
          <span className="text-[11px] font-ui text-[#C7D2E0]/60 px-2 italic">Aureline Space Idle</span>
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
                    ? 'bg-[#254A7A]/80 text-[#F0D79A] border border-[#D4B06A]/60 shadow-[0_0_14px_rgba(212,176,106,0.30)] -translate-y-0.5'
                    : 'text-[#C7D2E0]/75 hover:text-[#F8F6EE] hover:bg-[#254A7A]/40'
                }`}
                title={`${meta.label} (${isFocused ? 'Active' : 'Minimized'})`}
              >
                <Icon size={16} className={isFocused ? 'text-[#F0D79A]' : 'text-[#C7D2E0]'} />
                {/* Luminous Starlight Status Underline */}
                <span
                  className={`absolute bottom-0.5 h-1 w-2.5 rounded-full transition-all ${
                    isFocused ? 'bg-[#D4B06A] shadow-[0_0_8px_#D4B06A]' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })
        )}
      </div>

      {/* 3. RIGHT: STARLIGHT GOLD & CELESTIAL TRAY */}
      <div className="flex items-center gap-1.5">
        {/* Sidebar Toggle */}
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onToggleSidebars();
          }}
          className={`p-1.5 rounded-xl border transition-all ${
            areSidebarsVisible
              ? 'bg-[#254A7A] text-[#F0D79A] border-[#D4B06A]/50 shadow-xs'
              : 'bg-[#142B52]/60 hover:bg-[#254A7A]/60 text-[#C7D2E0] hover:text-[#F8F6EE] border-[#254A7A]/60'
          }`}
          title={areSidebarsVisible ? 'Hide Side Panels' : 'Show Side Panels (Vitals & Progression)'}
        >
          <Sidebar size={14} className={areSidebarsVisible ? 'text-[#F0D79A]' : 'text-[#C7D2E0]'} />
        </button>

        {/* Smartphone Toggle */}
        <button
          onClick={() => {
            if (soundEnabled) SoundFX.playSnap();
            onTogglePhone();
          }}
          className="p-1.5 rounded-xl bg-[#142B52]/60 hover:bg-[#254A7A]/60 text-[#C7D2E0] hover:text-[#F0D79A] border border-[#254A7A]/60 transition-all hover:-translate-y-0.5"
          title="Toggle Smartphone Simulator"
        >
          <Smartphone size={14} />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="p-1.5 rounded-xl bg-[#142B52]/60 hover:bg-[#254A7A]/60 text-[#C7D2E0] hover:text-white border border-[#254A7A]/60 transition-all hover:-translate-y-0.5"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? <Volume2 size={14} className="text-[#3EB9A8]" /> : <VolumeX size={14} className="text-[#E11D48]" />}
        </button>

        {/* MAI Voice Assistant Dock */}
        <MAIDock />

        {/* Live Sys-Cycle Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0A1026]/70 border border-[#254A7A]/60 text-[11px] font-ui text-[#F8F6EE]">
          <Clock size={11} className="text-[#D4B06A]" />
          <span>C{cycle} • <strong className="text-[#F0D79A]">{timeSegments[timeSegmentIndex]}</strong></span>
        </div>

        {/* Power / Logout */}
        <button
          onClick={logoutUser}
          className="p-1.5 rounded-xl bg-[#450C3F]/40 hover:bg-[#450C3F]/80 text-[#FFD2F4] hover:text-rose-200 border border-[#450C3F] transition-all hover:-translate-y-0.5"
          title="Logout"
        >
          <Power size={13} />
        </button>
      </div>

    </nav>
  );
}
