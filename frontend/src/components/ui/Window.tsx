import React, { useState, useEffect } from 'react';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import { useOSStore } from '../../store/useOSStore';
import { getContent } from '../../apps/contents';
import { Minus, Square, X, Grid2X2, Copy } from 'lucide-react';
import { SoundFX } from '../../utils/audio';
import { useSystemStore } from '../../store/useSystemStore';
import { APPS_DIRECTORY } from '../desktop/appDirectory';
import AppGlyph, { appTone } from './AppGlyph';
import { fitWindow, boundWindowOffset } from './windowGeometry';
import AppErrorBoundary from './AppErrorBoundary';

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
  const reducedMotion = useReducedMotion();
  const Body = getContent(win.contentKey || win.id);
  const isActive = activeWindowId === win.id;
  const windowOffset = win.windowOffset || { x: 0, y: 0 };
  const app = APPS_DIRECTORY.find((candidate) => candidate.id === win.id);

  const [windowGeometry, setWindowGeometry] = useState({
    width: 1120,
    height: 700,
    left: 140,
    top: 40,
    screenW: 1920,
    screenH: 1080,
  });

  useEffect(() => {
    const calculateGeometry = () => {
      const frameEl = document.getElementById('mira-screen-frame');
      const screenW = frameEl?.clientWidth || window.innerWidth || 1920;
      const screenH = frameEl?.clientHeight || window.innerHeight || 1080;

      const { width, height, left, top } = fitWindow(screenW, screenH, windowIndex);

      setWindowGeometry({ width, height, left, top, screenW, screenH });
    };

    calculateGeometry();
    const observer = new ResizeObserver(calculateGeometry);
    const frame = document.getElementById('mira-screen-frame');
    if (frame) observer.observe(frame);
    window.addEventListener('resize', calculateGeometry);
    return () => { observer.disconnect(); window.removeEventListener('resize', calculateGeometry); };
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
    moveWindow(win.id, boundWindowOffset({ x: safeOffset.x + info.offset.x, y: safeOffset.y + info.offset.y }, normalFrame, windowGeometry.screenW, windowGeometry.screenH));
  };

  const normalFrame = fitWindow(windowGeometry.screenW, windowGeometry.screenH, windowIndex);
  const safeOffset = boundWindowOffset(windowOffset, normalFrame, windowGeometry.screenW, windowGeometry.screenH);
  const maximizedFrame = fitWindow(windowGeometry.screenW, windowGeometry.screenH, windowIndex, true);
  const maximizedStyle = { top: maximizedFrame.top, left: maximizedFrame.left, width: maximizedFrame.width, height: maximizedFrame.height };

  const normalStyle = {
    top: normalFrame.top,
    left: normalFrame.left,
    width: normalFrame.width,
    height: normalFrame.height,
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
      initial={reducedMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.98 }}
      transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="os-window"
      data-active={isActive}
      data-maximized={!!win.isMaximized}
      data-tone={appTone(win.id)}
      data-app={win.contentKey || win.id}
      role="region"
      aria-label={app?.label || win.title || win.id}
      style={{
        ...(win.isMaximized ? maximizedStyle : normalStyle),
        x: win.isMaximized ? 0 : safeOffset.x,
        y: win.isMaximized ? 0 : safeOffset.y,
        zIndex: (win.zIndex || 100) + (win.isMaximized && isActive ? 10000 : 0),
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      <div
        className="os-window__titlebar"
        style={{ cursor: win.isMaximized ? 'default' : 'grab' }}
        onPointerDown={startDrag}
        onDoubleClick={(event) => {
          if ((event.target as HTMLElement).closest('button')) return;
          if (soundEnabled) SoundFX.playSnap();
          toggleMaximize(win.id);
        }}
      >
        <div className="os-window__identity">
          <AppGlyph icon={app?.icon || Grid2X2} appId={win.id} size="small" />
          <div className="os-window__name"><strong>{app?.label || win.title || win.id}</strong><small>{app?.code || 'MIRAVERSE'} / {app?.category || 'Workspace'}</small></div>
        </div>

        {/* Window Controls: Minimize, Maximize, Close */}
        <div className="os-window__controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (soundEnabled) SoundFX.playSnap();
              toggleMinimize(win.id);
            }}
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
            title={win.isMaximized ? 'Restore window' : 'Maximize'}
            aria-pressed={!!win.isMaximized}
          >
            {win.isMaximized ? <Copy size={12} /> : <Square size={12} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (soundEnabled) SoundFX.playSnap();
              closeWindow(win.id);
            }}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Shared application frame; each app owns its navigation and workspace. */}
      <div className="os-window__body">
        <AppErrorBoundary onClose={() => closeWindow(win.id)}><Body /></AppErrorBoundary>
      </div>
    </motion.div>
  );
}
