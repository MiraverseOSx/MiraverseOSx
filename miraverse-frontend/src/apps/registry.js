import { Folder, Mail, Gamepad2, Terminal, Globe, Settings, Sparkles, UserCheck, BookOpen, Video, FileText } from 'lucide-react';
import { miraverseDb } from '../db/miraverseDb';

// Icon mapping per app ID
const ICON_MAP = {
  files: Folder,
  comms: Mail,
  mail: FileText,
  chatmeet: Video,
  spellforge: Sparkles,
  passport: UserCheck,
  terminal: Terminal,
  browser: Globe,
  settings: Settings,
};

// Optimal default window sizes per app
const SIZE_MAP = {
  files: { width: 920, height: 600 },
  comms: { width: 980, height: 640 },
  mail: { width: 960, height: 620 },
  chatmeet: { width: 920, height: 600 },
  spellforge: { width: 940, height: 620 },
  passport: { width: 880, height: 580 },
  terminal: { width: 800, height: 520 },
  browser: { width: 1040, height: 680 },
  settings: { width: 800, height: 540 },
};

// Populate launchable APPS list dynamically from miraverseDb
export const APPS = miraverseDb.getApps().map((app) => ({
  ...app,
  icon: ICON_MAP[app.id] || Folder,
  contentKey: app.id,
  size: SIZE_MAP[app.id] || { width: 880, height: 580 },
  // Optional per-app theme
  theme: app.id === 'browser' ? {
    frameClass: 'rounded-xl border border-[#e9d5ff] bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(147,51,234,0.15)]',
    headerActiveClass: 'bg-[#E7D7FF] text-[#1f2a44]',
    headerInactiveClass: 'bg-[#F7C9E8] text-[#334155]'
    ,
    bodyClass: 'bg-white/60 text-slate-800'
  } : undefined,
}));

export const getApp = (id) => APPS.find((a) => a.id === id);
