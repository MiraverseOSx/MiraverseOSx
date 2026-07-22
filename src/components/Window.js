import React from 'react';
import { motion, useDragControls } from 'framer-motion';
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
  const dragControls = useDragControls();

  const Body = getContent(win.contentKey);
  const isActive = activeWindowId === win.id;

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
      className="absolute flex flex-col overflow-hidden rounded-xl border border-white/15 bg-os-secondary/80 shadow-2xl backdrop-blur-xl"
      style={{ ...(win.isMaximized ? maximizedStyle : normalStyle), zIndex: win.zIndex }}
      onMouseDown={() => focusWindow(win.id)}
      // Only the title bar starts a drag (dragControls + listener disabled).
      drag={!win.isMaximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      onDragEnd={(_, info) =>
        moveWindow(win.id, {
          x: win.position.x + info.offset.x,
          y: Math.max(MENU_BAR_HEIGHT, win.position.y + info.offset.y),
        })
      }
    >
      {/* Title bar — the drag handle */}
      <div
        className={`flex h-9 shrink-0 items-center gap-2 px-3 ${isActive ? 'bg-white/10' : 'bg-black/20'}`}
        style={{ cursor: win.isMaximized ? 'default' : 'grab' }}
        onPointerDown={(e) => {
          if (!win.isMaximized) dragControls.start(e);
        }}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => closeWindow(win.id)}
            className="h-3 w-3 rounded-full bg-[#ff5f57] transition hover:brightness-110"
            title="Close"
          />
          <button
            onClick={() => toggleMinimize(win.id)}
            className="h-3 w-3 rounded-full bg-[#febc2e] transition hover:brightness-110"
            title="Minimize"
          />
          <button
            onClick={() => toggleMaximize(win.id)}
            className="h-3 w-3 rounded-full bg-[#28c840] transition hover:brightness-110"
            title="Maximize"
          />
        </div>
        <span className="pointer-events-none flex-1 text-center text-xs font-medium text-white/80">
          {win.title}
        </span>
        <span className="w-14" />
      </div>
      <div className="min-h-0 flex-1">
        <Body />
      </div>
    </motion.div>
  );
}
