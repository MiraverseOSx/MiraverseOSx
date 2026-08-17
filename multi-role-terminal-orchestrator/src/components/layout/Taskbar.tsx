import React from 'react';
import {
  Stethoscope,
  Search,
  Radio,
  Cpu,
  BarChart2,
  FileText,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';

export const Taskbar: React.FC = () => {
  const { windows, openModule, bringToFront, activeEvents, soundEnabled } = useSystemStore();

  const dockApps = [
    {
      id: 'medical',
      label: 'Medical Triage',
      icon: <Stethoscope className="w-4 h-4 text-emerald-400" />,
      color: 'hover:bg-emerald-950/80',
      activeColor: 'bg-emerald-900/60 border-emerald-500 text-emerald-300',
      badge: activeEvents.filter((e) => e.module === 'medical').length,
      badgeColor: 'bg-emerald-500 text-slate-950',
    },
    {
      id: 'investigation',
      label: 'Investigation Bureau',
      icon: <Search className="w-4 h-4 text-blue-400" />,
      color: 'hover:bg-blue-950/80',
      activeColor: 'bg-blue-900/60 border-blue-500 text-blue-300',
      badge: activeEvents.filter((e) => e.module === 'investigation').length,
      badgeColor: 'bg-blue-500 text-slate-950',
    },
    {
      id: 'dispatch',
      label: '911 Dispatch',
      icon: <Radio className="w-4 h-4 text-purple-400" />,
      color: 'hover:bg-purple-950/80',
      activeColor: 'bg-purple-900/60 border-purple-500 text-purple-300',
      badge: activeEvents.filter((e) => e.module === 'dispatch').length,
      badgeColor: 'bg-purple-500 text-slate-950',
    },
    {
      id: 'orchestrator',
      label: 'Supervisor Inspector',
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
      color: 'hover:bg-amber-950/80',
      activeColor: 'bg-amber-900/60 border-amber-500 text-amber-300',
      badge: 0,
      badgeColor: '',
    },
    {
      id: 'stats',
      label: 'Shift Telemetry',
      icon: <BarChart2 className="w-4 h-4 text-sky-400" />,
      color: 'hover:bg-sky-950/80',
      activeColor: 'bg-sky-900/60 border-sky-500 text-sky-300',
      badge: 0,
      badgeColor: '',
    },
    {
      id: 'notepad',
      label: 'Operator Scratchpad',
      icon: <FileText className="w-4 h-4 text-slate-300" />,
      color: 'hover:bg-slate-800',
      activeColor: 'bg-slate-800 border-slate-400 text-slate-200',
      badge: 0,
      badgeColor: '',
    },
  ];

  return (
    <nav className="h-12 bg-slate-950/90 backdrop-blur-md text-white border-t border-slate-800 px-3 flex items-center justify-between select-none z-40">
      {/* Dock Application Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
        {dockApps.map((app) => {
          const win = windows.find((w) => w.id === app.id);
          const isOpen = win?.isOpen;
          const isMinimized = win?.isMinimized;

          return (
            <button
              key={app.id}
              id={`dock-btn-${app.id}`}
              onClick={() => {
                if (soundEnabled) SoundFX.playSnap();
                if (!isOpen) {
                  openModule(app.id as any);
                } else if (isMinimized) {
                  bringToFront(app.id);
                } else {
                  bringToFront(app.id);
                }
              }}
              className={`px-2.5 py-1.5 rounded-md text-xs font-commissioner font-medium flex items-center gap-2 transition-all relative border ${
                isOpen && !isMinimized
                  ? app.activeColor + ' shadow-xs'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 ' + app.color
              }`}
            >
              <div className="shrink-0">{app.icon}</div>
              <span className="hidden md:inline text-xs">{app.label}</span>

              {/* Notification badge */}
              {app.badge > 0 && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${app.badgeColor}`}
                >
                  {app.badge}
                </span>
              )}

              {/* Running indicator pill below */}
              {isOpen && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-white/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right side quick launcher status */}
      <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-semibold">ALL WORKSTATIONS ONLINE</span>
        </div>
      </div>
    </nav>
  );
};
