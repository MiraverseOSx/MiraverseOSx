import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { getContent } from '../apps/contents';

const MENU_BAR_HEIGHT = 70;

export default function Window({ win }) {
  const focusWindow = useOSStore((s) => s.focusWindow);
  const closeWindow = useOSStore((s) => s.closeWindow);
  const toggleMinimize = useOSStore((s) => s.toggleMinimize);
  const toggleMaximize = useOSStore((s) => s.toggleMaximize);
  const activeWindowId = useOSStore((s) => s.activeWindowId);

  const dragControls = useDragControls();
  const Body = getContent(win.contentKey);
  const isActive = activeWindowId === win.id;

  const startDrag = (e) => {
    if (win.isMaximized) return;
    if (e.target.closest('button')) return;
    focusWindow(win.id);
    dragControls.start(e);
  };

  const maximizedStyle = {
    top: MENU_BAR_HEIGHT,
    left: 0,
    width: '100vw',
    height: `calc(100vh - ${MENU_BAR_HEIGHT}px - 70px)`,
  };
  const normalStyle = {
    top: win.position.y,
    left: win.position.x,
    width: win.size.width,
    height: win.size.height,
  };

  return (
    <motion.div
      drag={!win.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.08 }}
      className="absolute flex flex-col overflow-hidden rounded-xl border border-white/40 bg-[#F4F2F9] y2k-window-shadow select-none"
      style={{ ...(win.isMaximized ? maximizedStyle : normalStyle), zIndex: win.zIndex }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar — Y2K Pastel Slate Header matching mockup */}
      <div
        className={`flex h-8 shrink-0 items-center justify-between px-3 font-sans text-xs transition ${
          isActive ? 'bg-[#9DA9CB] text-white' : 'bg-[#B4BDD6] text-white/80'
        }`}
        style={{ cursor: win.isMaximized ? 'default' : 'grab' }}
        onPointerDown={startDrag}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <span className="font-semibold text-xs tracking-wide">{win.title}</span>
        
        {/* Right Window Buttons matching mockup: _  □  ✕ */}
        <div className="flex items-center gap-3 text-xs font-bold text-white/90">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize(win.id);
            }}
            className="hover:text-white"
            title="Minimize"
          >
            _
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximize(win.id);
            }}
            className="hover:text-white"
            title="Maximize"
          >
            □
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="hover:text-red-200"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="min-h-0 flex-1 overflow-hidden select-text bg-[#FAFAFC] text-slate-800">
        <Body />
      </div>
    </motion.div>
  );
}

