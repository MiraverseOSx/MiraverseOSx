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
}));

export const getApp = (id) => APPS.find((a) => a.id === id);
