import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { getContent } from '../apps/contents';

const MENU_BAR_HEIGHT = 70;

export default function Window({ win, workspaceRef }) {
  const focusWindow = useOSStore((s) => s.focusWindow);
  const closeWindow = useOSStore((s) => s.closeWindow);
  const toggleMinimize = useOSStore((s) => s.toggleMinimize);
  const toggleMaximize = useOSStore((s) => s.toggleMaximize);
  const activeWindowId = useOSStore((s) => s.activeWindowId);

  const dragControls = useDragControls();
  const Body = getContent(win.contentKey || win.id);
  const isActive = activeWindowId === win.id;

  const [constraints, setConstraints] = React.useState({ left: -800, right: 1200, top: 0, bottom: 600 });

  React.useEffect(() => {
    const updateConstraints = () => {
      if (workspaceRef?.current) {
        const rect = workspaceRef.current.getBoundingClientRect();
        const winWidth = typeof win.size.width === 'number' ? win.size.width : 920;
        setConstraints({
          left: -winWidth + 150,
          right: rect.width - 150,
          top: 0,
          bottom: rect.height - 40,
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [workspaceRef, win.size]);

  const startDrag = (e) => {
    if (win.isMaximized) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;
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

  const baseFrame = 'rounded-none border border-[#1b254f]/35 bg-white/60 backdrop-blur-[18px] shadow-none';
  const baseBody = 'bg-white/45 text-[#1b254f] font-ui';
  const themePresets = {
    browser: { frameClass: baseFrame, headerActiveClass: 'bg-[#d8ccec]/75 text-[#1b254f] border-b border-[#1b254f]/35 font-ui font-semibold', headerInactiveClass: 'bg-white/45 text-[#303b67] border-b border-[#1b254f]/25 font-ui', bodyClass: baseBody },
    spellforge: { frameClass: baseFrame, headerActiveClass: 'bg-[#7657a6]/18 text-[#1b254f] border-b border-[#7657a6]/50 font-lore font-semibold', headerInactiveClass: 'bg-[#d8ccec]/35 text-[#303b67] border-b border-[#7657a6]/30 font-lore', bodyClass: `${baseBody} font-lore` },
    files: { frameClass: baseFrame, headerActiveClass: 'bg-[#8b92a7]/22 text-[#1b254f] border-b border-[#1b254f]/35 font-ui uppercase font-semibold text-[11px]', headerInactiveClass: 'bg-white/45 text-[#303b67] border-b border-[#1b254f]/25 font-ui uppercase text-[11px]', bodyClass: baseBody },
    comms: { frameClass: baseFrame, headerActiveClass: 'bg-[#279d8f]/16 text-[#1b254f] border-b border-[#279d8f]/55 font-ui uppercase tracking-wider text-[11px] font-semibold', headerInactiveClass: 'bg-white/45 text-[#303b67] border-b border-[#279d8f]/30 font-ui tracking-wider text-[11px]', bodyClass: baseBody },
    mail: { frameClass: baseFrame, headerActiveClass: 'bg-[#303b67]/14 text-[#1b254f] border-b border-[#303b67]/45 font-ui uppercase tracking-wider text-[11px] font-semibold', headerInactiveClass: 'bg-white/45 text-[#303b67] border-b border-[#303b67]/25 font-ui tracking-wider text-[11px]', bodyClass: baseBody },
    passport: { frameClass: baseFrame, headerActiveClass: 'bg-[#b38a36]/16 text-[#1b254f] border-b border-[#b38a36]/55 font-display', headerInactiveClass: 'bg-white/45 text-[#303b67] border-b border-[#b38a36]/30 font-display', bodyClass: `${baseBody} font-body` },
    board: { frameClass: baseFrame, headerActiveClass: 'bg-[#d591ad]/18 text-[#1b254f] border-b border-[#d591ad]/55 font-display', headerInactiveClass: 'bg-white/45 text-[#303b67] border-b border-[#d591ad]/30 font-display', bodyClass: baseBody },
    settings: { frameClass: baseFrame, headerActiveClass: 'bg-[#8b92a7]/18 text-[#1b254f] border-b border-[#1b254f]/35 font-ui font-semibold', headerInactiveClass: 'bg-white/45 text-[#303b67] border-b border-[#1b254f]/25 font-ui', bodyClass: baseBody }
  };

  const activePreset = themePresets[win.id] || {};
  const frameClass = activePreset.frameClass || baseFrame;
  const headerActiveClass = activePreset.headerActiveClass || 'bg-[#d8ccec]/65 text-[#1b254f] border-b border-[#1b254f]/35 font-ui font-semibold';
  const headerInactiveClass = activePreset.headerInactiveClass || 'bg-white/45 text-[#303b67] border-b border-[#1b254f]/25 font-ui';
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.08 }}
      className={`absolute flex flex-col overflow-hidden select-none ${frameClass}`}
      style={{ ...(win.isMaximized ? maximizedStyle : normalStyle), zIndex: win.zIndex }}
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
      <div className={`min-h-0 flex-1 overflow-hidden select-text ${bodyClass}`}>
        <Body onTabBarPointerDown={startDrag} />
      </div>
    </motion.div>
  );
}
