import React, { useEffect, useState } from 'react';
import { Wifi, BatteryFull, Search } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import { getApp } from '../apps/registry';

const formatClock = (date) =>
  date.toLocaleString([], {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function MenuBar() {
  const [now, setNow] = useState(() => new Date());
  const activeWindowId = useOSStore((s) => s.activeWindowId);
  const windows = useOSStore((s) => s.windows);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeWindow = windows.find((w) => w.id === activeWindowId);
  const activeTitle = activeWindow?.title || getApp(activeWindowId)?.title || 'Finder';

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] flex h-8 items-center justify-between bg-black/30 px-4 text-xs font-medium text-white/90 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-white"> MiraverseOSx</span>
        <span className="text-white/80">{activeTitle}</span>
      </div>
      <div className="flex items-center gap-3">
        <Search size={14} className="text-white/70" />
        <Wifi size={14} className="text-white/70" />
        <BatteryFull size={16} className="text-white/70" />
        <span className="tabular-nums">{formatClock(now)}</span>
      </div>
    </div>
  );
}
