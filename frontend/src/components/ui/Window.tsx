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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      className={`fixed flex flex-col overflow-hidden select-none rounded-2xl border transition-shadow ${
        isActive
          ? 'border-[#c4b5fd]/50 bg-[#0f0b1f] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(196,181,253,0.18)]'
          : 'border-[#2c204d]/70 bg-[#0c081a] shadow-[0_12px_40px_rgba(0,0,0,0.6)] opacity-95'
      }`}
      style={{
        ...(win.isMaximized ? maximizedStyle : normalStyle),
        x: win.isMaximized ? 0 : windowOffset.x,
        y: win.isMaximized ? 0 : windowOffset.y,
        zIndex: win.zIndex || 100,
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        className={`flex h-9 shrink-0 items-center justify-between px-3.5 border-b font-sans transition ${
          isActive
            ? 'bg-[#181132] border-[#392666] text-[#fef9c3]'
            : 'bg-[#100b22] border-[#22173f] text-[#c4b5fd]/70'
        }`}
        style={{ cursor: win.isMaximized ? 'default' : 'grab' }}
        onPointerDown={startDrag}
        onDoubleClick={() => {
          if (soundEnabled) SoundFX.playSnap();
          toggleMaximize(win.id);
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={13} className={isActive ? 'text-[#fde047]' : 'text-[#a78bfa]'} />
          <span className="font-bold text-xs tracking-wider uppercase font-mono">
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
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
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
            className="p-1 rounded-md text-slate-400 hover:text-[#fef08a] hover:bg-white/10 transition"
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
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition"
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Window Body Container */}
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden select-text bg-[#0b0818] text-white">
        <Body onTabBarPointerDown={startDrag} />
      </div>
    </motion.div>
  );
}
