import React from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { getContent } from '../apps/contents';

const MENU_BAR_HEIGHT = 32;

export default function Window({ win }) {
  const focusWindow = useOSStore((s) => s.focusWindow);
  const closeWindow = useOSStore((s) => s.closeWindow);
  const toggleMinimize = useOSStore((s) => s.toggleMinimize);
  const toggleMaximize = useOSStore((s) => s.toggleMaximize);
  const moveWindow = useOSStore((s) => s.moveWindow);
  const activeWindowId = useOSStore((s) => s.activeWindowId);

  const Body = getContent(win.contentKey);
  const isActive = activeWindowId === win.id;

  const handlePointerDown = (e) => {
    if (win.isMaximized) return;
    if (e.target.closest('button')) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = win.position.x;
    const initialY = win.position.y;

    const handlePointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newX = Math.max(0, Math.min(window.innerWidth - 100, initialX + deltaX));
      const newY = Math.max(MENU_BAR_HEIGHT, Math.min(window.innerHeight - 80, initialY + deltaY));

      moveWindow(win.id, { x: newX, y: newY });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const maximizedStyle = {
    top: MENU_BAR_HEIGHT,
    left: 0,
    width: '100vw',
    height: `calc(100vh - ${MENU_BAR_HEIGHT}px - 64px)`,
  };
  const normalStyle = {
    top: win.position.y,
    left: win.position.x,
    width: win.size.width,
    height: win.size.height,
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute flex flex-col overflow-hidden rounded-xl border border-white/15 bg-os-secondary/80 shadow-2xl backdrop-blur-xl select-none"
      style={{ ...(win.isMaximized ? maximizedStyle : normalStyle), zIndex: win.zIndex }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar — drag handle */}
      <div
        className={`flex h-9 shrink-0 items-center justify-between px-3 ${isActive ? 'bg-white/10' : 'bg-black/20'}`}
        style={{ cursor: win.isMaximized ? 'default' : 'grab' }}
        onPointerDown={handlePointerDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="group flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] text-[9px] font-bold text-black/70 transition hover:brightness-110"
            title="Close"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize(win.id);
            }}
            className="flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] text-[9px] font-bold text-black/70 transition hover:brightness-110"
            title="Minimize"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">−</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximize(win.id);
            }}
            className="flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] text-[8px] font-bold text-black/70 transition hover:brightness-110"
            title="Maximize"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">⤢</span>
          </button>
        </div>
        <span className="pointer-events-none flex-1 text-center text-xs font-medium text-white/80 select-none">
          {win.title}
        </span>
        <span className="w-14" />
      </div>
      <div className="min-h-0 flex-1 select-text">
        <Body />
      </div>
    </motion.div>
  );
}
