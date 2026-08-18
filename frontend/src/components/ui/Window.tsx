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

// Sector Chrome Determination (§3.2 & §4) - Luminous & High Contrast
function getSectorChrome(appId: string) {
  const id = appId?.toLowerCase() || '';
  if (id.includes('faith') || id.includes('vital') || id.includes('warden')) {
    return {
      sector: 'faith',
      activeBorder: 'border-[#4CD6C4]/60 shadow-[0_16px_44px_rgba(12,25,54,0.60),0_0_24px_rgba(76,214,196,0.30)]',
      inactiveBorder: 'border-[#2A8B7D]/40 shadow-[0_10px_30px_rgba(12,25,54,0.45)]',
      activeHeader: 'bg-gradient-to-r from-[#245448]/95 via-[#2A8B7D]/90 to-[#245448]/95 border-b border-[#4CD6C4]/50 text-[#FFFFFF]',
      inactiveHeader: 'bg-[#245448]/85 border-b border-[#2A8B7D]/35 text-[#D5E2F5]/80',
      iconColor: 'text-[#4CD6C4]',
      accentBg: 'bg-[#1E3D75]/80',
    };
  }
  if (id.includes('comms') || id.includes('spellforge') || id.includes('nephele') || id.includes('pulse')) {
    return {
      sector: 'nephele',
      activeBorder: 'border-[#EDE7FF]/60 shadow-[0_16px_44px_rgba(12,25,54,0.60),0_0_24px_rgba(143,162,230,0.30)]',
      inactiveBorder: 'border-[#624BC7]/45 shadow-[0_10px_30px_rgba(12,25,54,0.45)]',
      activeHeader: 'bg-gradient-to-r from-[#581D5E]/95 via-[#624BC7]/90 to-[#581D5E]/95 border-b border-[#EDE7FF]/40 text-[#FFFFFF]',
      inactiveHeader: 'bg-[#581D5E]/85 border-b border-[#624BC7]/35 text-[#D5E2F5]/80',
      iconColor: 'text-[#EDE7FF]',
      accentBg: 'bg-[#1E3D75]/80',
    };
  }
  if (id.includes('jobs') || id.includes('passport') || id.includes('gov') || id.includes('board') || id.includes('lore')) {
    return {
      sector: 'orynvell',
      activeBorder: 'border-[#F5D378]/60 shadow-[0_16px_44px_rgba(12,25,54,0.60),0_0_24px_rgba(245,211,120,0.30)]',
      inactiveBorder: 'border-[#F5D378]/35 shadow-[0_10px_30px_rgba(12,25,54,0.45)]',
      activeHeader: 'bg-gradient-to-r from-[#24467D]/95 via-[#315D9E]/90 to-[#24467D]/95 border-b border-[#F5D378]/50 text-[#FFFDF7]',
      inactiveHeader: 'bg-[#24467D]/85 border-b border-[#F5D378]/25 text-[#D5E2F5]/80',
      iconColor: 'text-[#F5D378]',
      accentBg: 'bg-[#1E3D75]/80',
    };
  }
  // Default: Luminous Celestial Night (§3.1)
  return {
    sector: 'celestial',
    activeBorder: 'border-[#E5C370]/60 shadow-[0_16px_44px_rgba(12,25,54,0.65),0_0_24px_rgba(229,195,112,0.30)]',
    inactiveBorder: 'border-white/20 shadow-[0_10px_30px_rgba(12,25,54,0.45)]',
    activeHeader: 'bg-gradient-to-r from-[#1E3D75]/95 via-[#315D9E]/90 to-[#1E3D75]/95 border-b border-[#E5C370]/45 text-[#FFFFFF]',
    inactiveHeader: 'bg-[#1E3D75]/85 border-b border-white/15 text-[#D5E2F5]/80',
    iconColor: 'text-[#E5C370]',
    accentBg: 'bg-[#1E3D75]/80',
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
      className={`fixed flex flex-col overflow-hidden select-none rounded-2xl border backdrop-blur-2xl bg-[#1E3D75]/85 transition-all duration-300 ${
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
      {/* ─── 4.1 "NOVA GLASS" TITLE BAR WITH LUMINOUS CHROMING ─── */}
      <div
        className={`flex h-10 shrink-0 items-center justify-between px-4 transition-colors ${
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
          <Sparkles size={14} className={`${chrome.iconColor} ${isActive ? 'animate-pulse' : 'opacity-80'}`} />
          <span className="font-display font-bold text-xs tracking-wider uppercase text-[#FFFFFF] drop-shadow-sm">
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
            className="p-1 rounded-md text-[#D5E2F5] hover:text-[#FFFFFF] hover:bg-white/20 transition-all hover:-translate-y-0.5"
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
            className="p-1 rounded-md text-[#D5E2F5] hover:text-[#FBE6AB] hover:bg-white/20 transition-all hover:-translate-y-0.5"
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
            className="p-1 rounded-md text-[#D5E2F5] hover:text-rose-200 hover:bg-rose-500/35 transition-all hover:-translate-y-0.5"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ─── 4.1 CONTENT SURFACE AREA WITH FROSTED BACKDROP ─── */}
      <div className="flex-1 overflow-hidden relative min-h-0 bg-[#142850]/65 backdrop-blur-md text-[#FFFFFF]">
        <Body />
      </div>
    </motion.div>
  );
}
