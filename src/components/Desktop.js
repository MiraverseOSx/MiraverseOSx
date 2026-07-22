import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';
import MenuBar from './MenuBar';
import Dock from './Dock';
import DesktopIcon from './DesktopIcon';
import Window from './Window';

export default function Desktop() {
  const wallpaper = useOSStore((s) => s.wallpaper);
  const windows = useOSStore((s) => s.windows);
  const clearActive = useOSStore((s) => s.clearActive);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-os-primary bg-cover bg-center"
      style={{ backgroundImage: `url("${wallpaper}")` }}
      onMouseDown={(e) => {
        // Only deselect when the click lands on the bare desktop, not a window/icon.
        if (e.target === e.currentTarget) clearActive();
      }}
    >
      <MenuBar />

      {/* Desktop icons — top-left column */}
      <div className="absolute left-3 top-11 flex flex-col gap-2">
        {APPS.map((app) => (
          <DesktopIcon key={app.id} app={app} />
        ))}
      </div>

      {/* Windows */}
      <AnimatePresence>
        {windows
          .filter((w) => !w.isMinimized)
          .map((win) => (
            <Window key={win.id} win={win} />
          ))}
      </AnimatePresence>

      <Dock />
    </div>
  );
}
