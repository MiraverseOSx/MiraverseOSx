import { Folder, Mail, MessageSquare, Terminal, Globe, Settings, Sparkles, UserCheck, Radio, Award, LucideIcon } from 'lucide-react';
import { miraverseDb, AppMetadata } from '../db/miraverseDb';

export interface RegisteredApp extends AppMetadata {
  icon: LucideIcon;
  contentKey: string;
  size: { width: number; height: number };
  theme?: {
    frameClass: string;
    headerActiveClass: string;
    headerInactiveClass: string;
    bodyClass: string;
  };
}

// Icon mapping per app ID
const ICON_MAP: Record<string, LucideIcon> = {
  files: Folder,
  mail: Mail,
  comms: MessageSquare,
  spellforge: Sparkles,
  passport: UserCheck,
  pulse: Radio,
  terminal: Terminal,
  browser: Globe,
  board: Award,
  settings: Settings,
};

// Keep app windows on one visual grid. The window shell clamps this footprint
// when the available Electron viewport is smaller.
const DEFAULT_APP_SIZE = { width: 960, height: 640 };

// Populate launchable APPS list dynamically from miraverseDb
export const APPS: RegisteredApp[] = miraverseDb.getApps().map((app) => ({
  ...app,
  icon: ICON_MAP[app.id] || Folder,
  contentKey: app.id,
  size: DEFAULT_APP_SIZE,
  theme: app.id === 'browser' ? {
    frameClass: 'rounded-xl border border-[#e9d5ff] bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(147,51,234,0.15)]',
    headerActiveClass: 'bg-[#E7D7FF] text-[#1f2a44]',
    headerInactiveClass: 'bg-[#F7C9E8] text-[#334155]',
    bodyClass: 'bg-white/60 text-slate-800'
  } : undefined,
}));

export const getApp = (id: string): RegisteredApp | undefined => APPS.find((a) => a.id === id);
