import { Folder, Mail, MessageSquare, Terminal, Globe, Settings, Sparkles, UserCheck, Radio, Award, BookOpen, Cpu, Home, Briefcase, LucideIcon } from 'lucide-react';
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
  process: Cpu,
  housing: Home,
  jobs: Briefcase,
  lore: BookOpen,
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
    frameClass: 'rounded-none border border-slate-700 bg-slate-900 shadow-2xl',
    headerActiveClass: 'bg-slate-800 text-slate-100 border-b border-slate-700',
    headerInactiveClass: 'bg-slate-900 text-slate-400 border-b border-slate-800',
    bodyClass: 'bg-slate-900 text-slate-100'
  } : undefined,
}));

export const getApp = (id: string): RegisteredApp | undefined => APPS.find((a) => a.id === id);
