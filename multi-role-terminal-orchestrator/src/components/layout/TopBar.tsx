import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Cpu,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  Radio,
  Stethoscope,
  Search,
  Sparkles,
  Zap,
  Server,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';

interface TopBarProps {
  onToggleNotifications: () => void;
  notificationsCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleNotifications, notificationsCount }) => {
  const {
    stats,
    soundEnabled,
    toggleSound,
    isLiveSimulation,
    activeEvents,
    activeScenario,
    openModule,
    isGeneratingEvent,
    fetchProactiveEvents,
  } = useSystemStore();

  const [currentTime, setCurrentTime] = useState<string>('08:56:06 AM');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const medicalCount = activeEvents.filter((e) => e.module === 'medical').length;
  const invCount = activeEvents.filter((e) => e.module === 'investigation').length;
  const dispCount = activeEvents.filter((e) => e.module === 'dispatch').length;

  return (
    <header className="h-11 bg-slate-900 text-white px-3 sm:px-4 flex items-center justify-between border-b border-slate-800 select-none shadow-md z-40">
      {/* Left: OS Brand & Active Scenario */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-xs">
            <Cpu className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-heading font-bold text-xs tracking-wider text-slate-100 uppercase hidden sm:inline">
            OmniDesk OS
          </span>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 hidden md:inline">
            v4.2-MultiAgent
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

        <div className="hidden lg:flex items-center gap-2 text-xs truncate">
          <span className="text-slate-400 font-mono text-[11px]">SCENARIO:</span>
          <span className="font-medium text-slate-200 truncate">{activeScenario}</span>
        </div>
      </div>

      {/* Middle: Department Quick Status Badges */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Medical Badge */}
        <button
          id="topbar-med-btn"
          onClick={() => openModule('medical')}
          className="px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/60 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors"
        >
          <Stethoscope className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">MED</span>
          {medicalCount > 0 && (
            <span className="bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              {medicalCount}
            </span>
          )}
        </button>

        {/* Investigation Badge */}
        <button
          id="topbar-inv-btn"
          onClick={() => openModule('investigation')}
          className="px-2 py-1 bg-blue-950/70 hover:bg-blue-900/90 text-blue-300 border border-blue-700/60 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors"
        >
          <Search className="w-3 h-3 text-blue-400" />
          <span className="hidden sm:inline">INV</span>
          {invCount > 0 && (
            <span className="bg-blue-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              {invCount}
            </span>
          )}
        </button>

        {/* Dispatch Badge */}
        <button
          id="topbar-disp-btn"
          onClick={() => openModule('dispatch')}
          className="px-2 py-1 bg-purple-950/70 hover:bg-purple-900/90 text-purple-300 border border-purple-700/60 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors"
        >
          <Radio className="w-3 h-3 text-purple-400" />
          <span className="hidden sm:inline">DISP</span>
          {dispCount > 0 && (
            <span className="bg-purple-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              {dispCount}
            </span>
          )}
        </button>

        {/* Proactive Trigger Quick Pulse */}
        <button
          id="topbar-pulse-btn"
          onClick={() => {
            if (soundEnabled) SoundFX.playPulse();
            fetchProactiveEvents(1);
          }}
          disabled={isGeneratingEvent}
          title="Trigger proactive supervisor pulse"
          className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/60 rounded text-[11px] font-mono flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <Zap className={`w-3 h-3 text-amber-400 ${isGeneratingEvent ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">PULSE</span>
        </button>
      </div>

      {/* Right: Sound, Notifications, Time & Telemetry */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Sound Toggle */}
        <button
          id="topbar-sound-toggle"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Terminal Audio' : 'Unmute Terminal Audio'}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-slate-200" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Notifications Drawer Toggle */}
        <button
          id="topbar-notif-btn"
          onClick={onToggleNotifications}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 relative transition-colors"
        >
          <Bell className="w-4 h-4 text-slate-200" />
          {notificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full font-mono text-[9px] font-bold flex items-center justify-center">
              {notificationsCount}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

        {/* Live Clock */}
        <div className="flex items-center gap-1.5 font-mono text-slate-300 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime}</span>
        </div>
      </div>
    </header>
  );
};
