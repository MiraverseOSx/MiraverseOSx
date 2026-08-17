import React, { ReactNode } from 'react';
import { Minus, Square, X, RefreshCw, Shield, Stethoscope, Search, Radio, Cpu, BarChart2, FileText } from 'lucide-react';
import { ModuleType } from '../../types/orchestrator';
import { useSystemStore } from '../../store/useSystemStore';

interface WindowFrameProps {
  id: string;
  title: string;
  module?: ModuleType | 'orchestrator' | 'stats' | 'notepad';
  children: ReactNode;
  badge?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  id,
  title,
  module,
  children,
  badge,
  onRefresh,
  isRefreshing,
}) => {
  const { windows, closeModule, minimizeModule, maximizeModule, bringToFront } = useSystemStore();
  const windowState = windows.find((w) => w.id === id);

  if (!windowState || !windowState.isOpen) return null;

  const isMinimized = windowState.isMinimized;
  const isMaximized = windowState.isMaximized;

  // Module specific colors & icons
  const getModuleStyles = () => {
    switch (module) {
      case 'medical':
        return {
          border: 'border-emerald-600/70',
          topAccent: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
          headerBg: 'bg-white',
          icon: <Stethoscope className="w-4 h-4 text-emerald-400" />,
          tag: 'MED-TRIAGE',
          tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'investigation':
        return {
          border: 'border-slate-800',
          topAccent: 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white',
          headerBg: 'bg-white',
          icon: <Search className="w-4 h-4 text-blue-300" />,
          tag: 'FORENSICS-BUREAU',
          tagBg: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'dispatch':
        return {
          border: 'border-purple-600/70',
          topAccent: 'bg-gradient-to-r from-purple-800 to-indigo-900 text-white',
          headerBg: 'bg-white',
          icon: <Radio className="w-4 h-4 text-purple-300" />,
          tag: '911-DISPATCH',
          tagBg: 'bg-purple-100 text-purple-900 border-purple-300',
        };
      case 'orchestrator':
        return {
          border: 'border-amber-600/70',
          topAccent: 'bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white',
          headerBg: 'bg-white',
          icon: <Cpu className="w-4 h-4 text-amber-400" />,
          tag: 'AI-SUPERVISOR',
          tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'stats':
        return {
          border: 'border-sky-600/70',
          topAccent: 'bg-gradient-to-r from-sky-800 to-slate-800 text-white',
          headerBg: 'bg-white',
          icon: <BarChart2 className="w-4 h-4 text-sky-300" />,
          tag: 'TELEMETRY',
          tagBg: 'bg-sky-100 text-sky-900 border-sky-300',
        };
      case 'notepad':
      default:
        return {
          border: 'border-slate-400',
          topAccent: 'bg-slate-800 text-white',
          headerBg: 'bg-white',
          icon: <FileText className="w-4 h-4 text-slate-300" />,
          tag: 'OPERATOR-LOG',
          tagBg: 'bg-slate-100 text-slate-800 border-slate-300',
        };
    }
  };

  const styles = getModuleStyles();

  return (
    <div
      id={`window-${id}`}
      onClick={() => bringToFront(id)}
      style={{ zIndex: windowState.zIndex }}
      className={`transition-all duration-200 flex flex-col bg-white shadow-xl rounded-lg border ${
        styles.border
      } overflow-hidden ${
        isMaximized
          ? 'fixed inset-3 z-50'
          : 'relative w-full h-full min-h-[520px] max-h-[780px]'
      } ${isMinimized ? 'hidden' : 'flex'}`}
    >
      {/* Window Chrome Header */}
      <div
        className={`px-3 py-2 flex items-center justify-between select-none ${styles.topAccent} shadow-sm`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-black/20 backdrop-blur-xs flex items-center justify-center">
            {styles.icon}
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-heading font-semibold text-xs tracking-wide truncate">
              {title}
            </span>
            <span
              className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border ${styles.tagBg}`}
            >
              {styles.tag}
            </span>
            {badge && (
              <span className="text-[10px] font-mono bg-red-500 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              id={`btn-refresh-${id}`}
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              title="Poll latest updates from Orchestrator"
              className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            id={`btn-minimize-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              minimizeModule(id);
            }}
            title="Minimize"
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            id={`btn-maximize-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              maximizeModule(id);
            }}
            title={isMaximized ? 'Restore' : 'Maximize'}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>

          <button
            id={`btn-close-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              closeModule(id);
            }}
            title="Close Window"
            className="p-1 text-slate-300 hover:text-white hover:bg-red-600/80 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Window Body Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/70 p-3 sm:p-4 text-slate-800">
        {children}
      </div>
    </div>
  );
};
