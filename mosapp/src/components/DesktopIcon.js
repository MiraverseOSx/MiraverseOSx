import React from 'react';
import { useOSStore } from '../store/useOSStore';

export default function DesktopIcon({ app }) {
  const addWindow = useOSStore((s) => s.addWindow);
  const Icon = app.icon;

  return (
    <button
      onDoubleClick={() => addWindow(app)}
      className="flex w-20 flex-col items-center gap-1 rounded-lg p-2 text-white/90 hover:bg-white/10 focus:bg-white/15 focus:outline-none"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
        <Icon size={26} />
      </span>
      <span className="text-center text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {app.title}
      </span>
    </button>
  );
}
