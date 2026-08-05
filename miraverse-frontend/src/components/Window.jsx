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

  // Preset themes based on app id/contentKey to ensure every app does not look the same Y2K clone
  const themePresets = {
    browser: {
      frameClass: 'rounded-2xl border border-white/30 bg-[#fafbfc]/35 backdrop-blur-xl shadow-2xl flex flex-col',
      headerActiveClass: 'bg-[#0d0724] text-purple-200 border-b border-purple-500/20 font-sans font-bold',
      headerInactiveClass: 'bg-[#0d0724]/90 text-purple-400/80 border-b border-purple-500/20 font-sans',
      bodyClass: 'bg-white/60 text-slate-800'
    },
    spellforge: {
      frameClass: 'border border-purple-500/30 bg-[#160a2b]/85 backdrop-blur-md rounded-lg shadow-[0_0_25px_rgba(168,85,247,0.3)]',
      headerActiveClass: 'bg-[#240e42] text-purple-200 border-b border-purple-500/30 font-mono tracking-wider font-semibold',
      headerInactiveClass: 'bg-[#1b0b32] text-purple-400 border-b border-purple-500/15 font-mono tracking-wider',
      bodyClass: 'bg-[#0c051a]/95 text-purple-100'
    },
    files: {
      frameClass: 'border-2 border-[#8ba39a] bg-[#dbe6e1] rounded-none shadow-[4px_4px_0px_rgba(95,114,106,0.8)] p-1',
      headerActiveClass: 'bg-[#5f726a] text-white font-mono uppercase font-bold text-[11px]',
      headerInactiveClass: 'bg-[#7a8e85] text-white/80 font-mono uppercase text-[11px]',
      bodyClass: 'border border-[#8ba39a] bg-[#f2f7f5] text-slate-800'
    },
    comms: {
      frameClass: 'border border-cyan-500/30 bg-[#06121a]/95 backdrop-blur-sm rounded-md shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      headerActiveClass: 'bg-[#0a1f2d] text-cyan-300 border-b border-cyan-500/20 font-mono uppercase tracking-widest text-[11px] font-bold',
      headerInactiveClass: 'bg-[#06141e] text-cyan-500/70 border-b border-cyan-500/10 font-mono tracking-widest text-[11px]',
      bodyClass: 'bg-[#030a0f] text-cyan-100'
    },
    mail: {
      frameClass: 'border border-indigo-500/30 bg-[#0e1124]/95 backdrop-blur-sm rounded-md shadow-[0_0_15px_rgba(99,102,241,0.25)]',
      headerActiveClass: 'bg-[#141833] text-indigo-300 border-b border-indigo-500/20 font-mono uppercase tracking-widest text-[11px] font-bold',
      headerInactiveClass: 'bg-[#0c0e21] text-indigo-500/70 border-b border-indigo-500/10 font-mono tracking-widest text-[11px]',
      bodyClass: 'bg-[#050611] text-indigo-100'
    },
    passport: {
      frameClass: 'border-2 border-amber-600/50 bg-[#faf6eb] rounded-lg shadow-xl',
      headerActiveClass: 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 border-b border-amber-800/40 font-serif italic font-bold',
      headerInactiveClass: 'bg-gradient-to-r from-amber-800/80 to-amber-950/80 text-amber-200/85 border-b border-amber-900/20 font-serif italic',
      bodyClass: 'bg-amber-50/20 text-[#292318]'
    },
    board: {
      frameClass: 'border border-amber-500/20 bg-[#fdfaf2] rounded-xl shadow-lg',
      headerActiveClass: 'bg-[#ca8a04] text-white border-b border-amber-600/30 font-sans font-bold',
      headerInactiveClass: 'bg-[#eab308]/80 text-white/80 border-b border-amber-500/10 font-sans',
      bodyClass: 'bg-white text-slate-800'
    },
    settings: {
      frameClass: 'rounded-xl border border-white/40 bg-[#ececf2] y2k-window-shadow',
      headerActiveClass: 'bg-[#8a99c2] text-slate-900 border-b border-slate-400/20 font-sans font-bold',
      headerInactiveClass: 'bg-[#a3b1d6] text-slate-900/80 border-b border-slate-400/10 font-sans',
      bodyClass: 'bg-[#f4f4f9] text-slate-800'
    }
  };

  const activePreset = themePresets[win.id] || {};
  const frameClass = win?.theme?.frameClass || activePreset.frameClass || 'rounded-xl border border-white/40 bg-[#F4F2F9] y2k-window-shadow';
  const headerActiveClass = win?.theme?.headerActiveClass || activePreset.headerActiveClass || 'bg-[#9DA9CB] text-white';
  const headerInactiveClass = win?.theme?.headerInactiveClass || activePreset.headerInactiveClass || 'bg-[#B4BDD6] text-white/80';
  const bodyClass = win?.theme?.bodyClass || activePreset.bodyClass || 'bg-[#FAFAFC] text-slate-800';

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
