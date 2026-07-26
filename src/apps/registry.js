import { Folder, Mail, Gamepad2, Terminal, Globe, Settings, Info } from 'lucide-react';
import { miraverseDb } from '../db/miraverseDb';

// Icon mapping per app ID
const ICON_MAP = {
  files: Folder,
  comms: Mail,
  gamehub: Gamepad2,
  terminal: Terminal,
  browser: Globe,
  settings: Settings,
  about: Info,
};

// Populate launchable APPS list dynamically from miraverseDb
export const APPS = miraverseDb.getApps().map((app) => ({
  ...app,
  icon: ICON_MAP[app.id] || Folder,
  contentKey: app.id,
}));

export const getApp = (id) => APPS.find((a) => a.id === id);
