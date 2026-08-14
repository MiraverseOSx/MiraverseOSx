import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { getContent } from '../apps/contents';

const WINDOW_MARGIN = 12;
const CASCADE_OFFSET = 24;
const HORIZONTAL_DRAG_OVERFLOW = 96;
const VERTICAL_DRAG_OVERFLOW = 40;

export default function Window({ win, workspaceRef, isFocusMode = false, windowIndex = 0 }) {
  const focusWindow = useOSStore((s) => s.focusWindow);
  const closeWindow = useOSStore((s) => s.closeWindow);
  const toggleMinimize = useOSStore((s) => s.toggleMinimize);
  const toggleMaximize = useOSStore((s) => s.toggleMaximize);
  const moveWindow = useOSStore((s) => s.moveWindow);
  const activeWindowId = useOSStore((s) => s.activeWindowId);

  const dragControls = useDragControls();
  const Body = getContent(win.contentKey || win.id);
  const isActive = activeWindowId === win.id;
  const windowOffset = win.windowOffset || { x: 0, y: 0 };
  const [windowRect, setWindowRect] = React.useState({
    width: 960,
    height: 640,
    left: WINDOW_MARGIN,
    top: WINDOW_MARGIN,
  });
  const [constraints, setConstraints] = React.useState({ left: 0, right: 0, top: 0, bottom: 0 });

  React.useEffect(() => {
    const updateGeometry = () => {
      if (workspaceRef?.current) {
        const rect = workspaceRef.current.getBoundingClientRect();
        const fullWidth = Math.max(320, Math.round(rect.width - (WINDOW_MARGIN * 2)));
        const fullHeight = Math.max(240, Math.round(rect.height - (WINDOW_MARGIN * 2)));
        const width = fullWidth;
        const height = fullHeight;
        const cascade = isFocusMode ? windowIndex % 4 : 0;
        const left = Math.round(rect.left + WINDOW_MARGIN + (cascade * CASCADE_OFFSET));
        const top = Math.round(rect.top + WINDOW_MARGIN + (cascade * CASCADE_OFFSET));
        const horizontalOverflow = isFocusMode ? HORIZONTAL_DRAG_OVERFLOW : 0;
        const verticalOverflow = isFocusMode ? VERTICAL_DRAG_OVERFLOW : 0;

        setWindowRect({ width, height, left, top });
        setConstraints({
          left: rect.left + WINDOW_MARGIN - left - horizontalOverflow,
          right: rect.right - WINDOW_MARGIN - left - width + horizontalOverflow,
          top: rect.top + WINDOW_MARGIN - top - verticalOverflow,
          bottom: rect.bottom - WINDOW_MARGIN - top - height + verticalOverflow,
        });
      }
    };

    updateGeometry();
    const resizeObserver = new ResizeObserver(updateGeometry);
    if (workspaceRef?.current) resizeObserver.observe(workspaceRef.current);
    window.addEventListener('resize', updateGeometry);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateGeometry);
    };
  }, [isFocusMode, windowIndex, workspaceRef]);

  const startDrag = (e) => {
    if (win.isMaximized) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;
    focusWindow(win.id);
    dragControls.start(e);
  };

  const handleDragEnd = (_event, info) => {
    if (win.isMaximized) return;
    moveWindow(win.id, {
      x: windowOffset.x + info.offset.x,
      y: windowOffset.y + info.offset.y,
    });
  };

  const workspaceBounds = workspaceRef?.current?.getBoundingClientRect();
  const maximizedStyle = workspaceBounds ? {
    top: workspaceBounds.top + WINDOW_MARGIN,
    left: workspaceBounds.left + WINDOW_MARGIN,
    width: Math.max(320, workspaceBounds.width - (WINDOW_MARGIN * 2)),
    height: Math.max(240, workspaceBounds.height - (WINDOW_MARGIN * 2)),
  } : windowRect;
  const normalStyle = {
    top: windowRect.top,
    left: windowRect.left,
    width: windowRect.width,
    height: windowRect.height,
  };

  const baseFrame = 'rounded-none border border-slate-700 bg-slate-900 shadow-2xl';
  const baseBody = 'bg-slate-900 text-slate-100 font-ui';
  const themePresets = {
    browser: { frameClass: baseFrame, headerActiveClass: 'bg-slate-800 text-slate-100 border-b border-slate-700 font-ui font-semibold', headerInactiveClass: 'bg-slate-900 text-slate-400 border-b border-slate-800 font-ui', bodyClass: baseBody },
    spellforge: { frameClass: baseFrame, headerActiveClass: 'bg-purple-950 text-purple-200 border-b border-purple-800 font-lore font-semibold', headerInactiveClass: 'bg-slate-900 text-slate-400 border-b border-slate-800 font-lore', bodyClass: `${baseBody} font-lore` },
    files: { frameClass: baseFrame, headerActiveClass: 'bg-slate-800 text-slate-100 border-b border-slate-700 font-ui uppercase font-semibold text-[11px]', headerInactiveClass: 'bg-slate-900 text-slate-400 border-b border-slate-800 font-ui uppercase text-[11px]', bodyClass: baseBody },
    comms: { frameClass: baseFrame, headerActiveClass: 'bg-teal-950 text-teal-200 border-b border-teal-800 font-ui uppercase tracking-wider text-[11px] font-semibold', headerInactiveClass: 'bg-slate-900 text-slate-400 border-b border-slate-800 font-ui tracking-wider text-[11px]', bodyClass: baseBody },
    mail: { frameClass: baseFrame, headerActiveClass: 'bg-indigo-950 text-indigo-200 border-b border-indigo-800 font-ui uppercase tracking-wider text-[11px] font-semibold', headerInactiveClass: 'bg-slate-900 text-slate-400 border-b border-slate-800 font-ui tracking-wider text-[11px]', bodyClass: baseBody },
    passport: { frameClass: baseFrame, headerActiveClass: 'bg-amber-950 text-amber-200 border-b border-amber-800 font-display', headerInactiveClass: 'bg-slate-900 text-slate-400 border-b border-slate-800 font-display', bodyClass: `${baseBody} font-body` },
    board: { frameClass: baseFrame, headerActiveClass: 'bg-pink-950 text-pink-200 border-b border-pink-800 font-display', headerInactiveClass: 'bg-slate-900 text-slate-400 border-b border-slate-800 font-display', bodyClass: baseBody },
    settings: { frameClass: baseFrame, headerActiveClass: 'bg-slate-800 text-slate-100 border-b border-slate-700 font-ui font-semibold', headerInactiveClass: 'bg-slate-900 text-slate-400 border-b border-slate-800 font-ui', bodyClass: baseBody }
  };

  const activePreset = themePresets[win.id] || {};
  const frameClass = activePreset.frameClass || baseFrame;
  const headerActiveClass = activePreset.headerActiveClass || 'bg-slate-800 text-slate-100 border-b border-slate-700 font-ui font-semibold';
  const headerInactiveClass = activePreset.headerInactiveClass || 'bg-slate-900 text-slate-400 border-b border-slate-800 font-ui';
  const bodyClass = activePreset.bodyClass || baseBody;

  const isBrowser = win.id === 'browser';

  return (
    <motion.div
      drag={!win.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={constraints}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.08 }}
      className={`absolute flex flex-col overflow-hidden select-none transition-shadow ${frameClass} ${isActive ? 'ring-1 ring-[#8d79c5]/50 shadow-[0_22px_55px_rgba(13,21,51,.28)]' : 'shadow-[0_8px_24px_rgba(13,21,51,.14)]'}`}
      style={{
        ...(win.isMaximized ? maximizedStyle : normalStyle),
        x: win.isMaximized ? 0 : windowOffset.x,
        y: win.isMaximized ? 0 : windowOffset.y,
        zIndex: win.zIndex,
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      {!isBrowser && (
        <div
          className={`flex h-8 shrink-0 items-center justify-between px-3 font-sans text-xs transition ${isActive ? headerActiveClass : headerInactiveClass}`}
          style={{ cursor: win.isMaximized ? 'default' : 'grab' }}
          onPointerDown={startDrag}
          onDoubleClick={() => toggleMaximize(win.id)}
        >
          <span className="font-semibold text-xs tracking-wide">{win.title}</span>

          {/* Right Window Buttons: _  □  ✕ */}
          <div className="flex items-center gap-3 text-xs font-bold text-inherit opacity-90">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMinimize(win.id);
              }}
              className="hover:opacity-100 transition px-1"
              title="Minimize"
            >
              _
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMaximize(win.id);
              }}
              className="hover:opacity-100 transition px-1"
              title="Maximize"
            >
              □
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(win.id);
              }}
              className="hover:text-red-400 transition px-1"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className={`min-h-0 min-w-0 flex-1 overflow-hidden select-text ${bodyClass}`}>
        <Body onTabBarPointerDown={startDrag} />
      </div>
    </motion.div>
  );
}
