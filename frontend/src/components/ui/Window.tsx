import React, { useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useOSStore } from '../../store/useOSStore';
import { getContent } from '../../apps/contents';
import { Minus, Square, X, Sparkles } from 'lucide-react';
import { SoundFX } from '../../utils/audio';
import { useSystemStore } from '../../store/useSystemStore';

export interface WindowProps {
  win: any;
  workspaceRef?: any;
  isFocusMode?: boolean;
  windowIndex?: number;
}

// Sector Chrome Determination (§3.2 & §4) - Light Pastel Realistic OS
function getSectorChrome(appId: string) {
  const id = appId?.toLowerCase() || '';
  if (id.includes('faith') || id.includes('vital') || id.includes('warden')) {
    return {
      sector: 'faith',
      activeBorder: 'border-emerald-300/80 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_0_20px_rgba(220,252,231,0.50)]',
      inactiveBorder: 'border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]',
      activeHeader: 'bg-gradient-to-r from-[#F0FDF4] via-[#DCFCE7] to-[#F0FDF4] border-b border-emerald-200 text-emerald-950',
      inactiveHeader: 'bg-[#F8FAFC] border-b border-slate-200 text-slate-500',
      iconColor: 'text-emerald-600',
      accentBg: 'bg-emerald-50',
    };
  }
  if (id.includes('comms') || id.includes('spellforge') || id.includes('nephele') || id.includes('pulse')) {
    return {
      sector: 'nephele',
      activeBorder: 'border-purple-300/80 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_0_20px_rgba(237,233,254,0.50)]',
      inactiveBorder: 'border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]',
      activeHeader: 'bg-gradient-to-r from-[#FAF5FF] via-[#F3E8FF] to-[#FAF5FF] border-b border-purple-200 text-purple-950',
      inactiveHeader: 'bg-[#F8FAFC] border-b border-slate-200 text-slate-500',
      iconColor: 'text-purple-600',
      accentBg: 'bg-purple-50',
    };
  }
  if (id.includes('jobs') || id.includes('passport') || id.includes('gov') || id.includes('board') || id.includes('lore') || id.includes('finance')) {
    return {
      sector: 'orynvell',
      activeBorder: 'border-amber-300/80 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_0_20px_rgba(254,243,199,0.50)]',
      inactiveBorder: 'border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]',
      activeHeader: 'bg-gradient-to-r from-[#FFFDF5] via-[#FEF3C7] to-[#FFFDF5] border-b border-amber-200 text-amber-950',
      inactiveHeader: 'bg-[#F8FAFC] border-b border-slate-200 text-slate-500',
      iconColor: 'text-amber-600',
      accentBg: 'bg-amber-50',
    };
  }
  // Default: Luminous Light Pastel Celestial
  return {
    sector: 'celestial',
    activeBorder: 'border-sky-300/80 shadow-[0_20px_50px_rgba(15,23,42,0.12),0_0_20px_rgba(224,242,254,0.50)]',
    inactiveBorder: 'border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]',
    activeHeader: 'bg-gradient-to-r from-[#F0F4FF] via-[#E8EDFB] to-[#F0F4FF] border-b border-indigo-100 text-slate-900',
    inactiveHeader: 'bg-[#F8FAFC] border-b border-slate-200 text-slate-500',
    iconColor: 'text-sky-600',
    accentBg: 'bg-sky-50',
  };
}

export default function Window({ win, isFocusMode = false, windowIndex = 0 }: WindowProps) {
  const focusWindow = useOSStore((s) => s.focusWindow);
  const closeWindow = useOSStore((s) => s.closeWindow);
  const toggleMinimize = useOSStore((s) => s.toggleMinimize);
  const toggleMaximize = useOSStore((s) => s.toggleMaximize);
  const moveWindow = useOSStore((s) => s.moveWindow);
  const activeWindowId = useOSStore((s) => s.activeWindowId);
  const { soundEnabled } = useSystemStore();

  const dragControls = useDragControls();
  const Body = getContent(win.contentKey || win.id);
  const isActive = activeWindowId === win.id;
  const windowOffset = win.windowOffset || { x: 0, y: 0 };
  const chrome = getSectorChrome(win.id);

  const [windowGeometry, setWindowGeometry] = useState({
    width: 1040,
    height: 680,
    left: 100,
    top: 40,
  });

  useEffect(() => {
    const calculateGeometry = () => {
      const screenW = window.innerWidth || 1440;
      const screenH = window.innerHeight || 900;
      
      const width = Math.min(1080, Math.max(760, screenW - 80));
      const height = Math.min(720, Math.max(520, screenH - 120));
      const cascade = (windowIndex % 5) * 22;
      const left = Math.max(16, Math.round((screenW - width) / 2) + cascade);
      const top = Math.max(16, Math.round((screenH - height - 70) / 2) + cascade);

      setWindowGeometry({ width, height, left, top });
    };

    calculateGeometry();
    window.addEventListener('resize', calculateGeometry);
    return () => window.removeEventListener('resize', calculateGeometry);
  }, [windowIndex]);

  const startDrag = (e: React.PointerEvent) => {
    if (win.isMaximized) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) return;
    focusWindow(win.id);
    dragControls.start(e);
  };

  const handleDragEnd = (_event: any, info: any) => {
    if (win.isMaximized) return;
    moveWindow(win.id, {
      x: windowOffset.x + info.offset.x,
      y: windowOffset.y + info.offset.y,
    });
  };

  const maximizedStyle = {
    top: 10,
    left: 10,
    width: (window.innerWidth || 1440) - 20,
    height: (window.innerHeight || 900) - 78,
  };

  const normalStyle = {
    top: windowGeometry.top,
    left: windowGeometry.left,
    width: windowGeometry.width,
    height: windowGeometry.height,
  };

  return (
    <motion.div
      drag={!win.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      className={`fixed flex flex-col overflow-hidden select-none rounded-2xl border backdrop-blur-2xl bg-white/95 transition-all duration-200 ${
        isActive ? chrome.activeBorder : chrome.inactiveBorder
      }`}
      style={{
        ...(win.isMaximized ? maximizedStyle : normalStyle),
        x: win.isMaximized ? 0 : windowOffset.x,
        y: win.isMaximized ? 0 : windowOffset.y,
        zIndex: win.zIndex || 100,
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* ─── 4.1 LIGHT PASTEL TITLE BAR WITH SMOOTH REALISTIC CHROMING ─── */}
      <div
        className={`flex h-11 shrink-0 items-center justify-between px-4 transition-colors ${
          isActive ? chrome.activeHeader : chrome.inactiveHeader
        }`}
        style={{ cursor: win.isMaximized ? 'default' : 'grab' }}
        onPointerDown={startDrag}
        onDoubleClick={() => {
          if (soundEnabled) SoundFX.playSnap();
          toggleMaximize(win.id);
        }}
      >
        <div className="flex items-center gap-2.5">
          <Sparkles size={14} className={`${chrome.iconColor} ${isActive ? 'animate-pulse' : 'opacity-70'}`} />
          <span className="font-display font-bold text-xs tracking-wider uppercase text-slate-800">
            {win.title || win.id}
          </span>
        </div>

        {/* Window Controls: Minimize, Maximize, Close */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (soundEnabled) SoundFX.playSnap();
              toggleMinimize(win.id);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (soundEnabled) SoundFX.playSnap();
              toggleMaximize(win.id);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-100/70 transition-all"
            title="Maximize"
          >
            <Square size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (soundEnabled) SoundFX.playSnap();
              closeWindow(win.id);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-100/80 transition-all"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ─── 4.1 LIGHT PASTEL CONTENT SURFACE ─── */}
      <div className="flex-1 overflow-hidden relative min-h-0 bg-[#FAFBFD] text-slate-800">
        <Body />
      </div>
    </motion.div>
  );
}
