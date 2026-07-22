import { Folder, Terminal, Globe, Settings, Info } from 'lucide-react';

// Single source of truth for launchable apps. Used by both the Dock and the
// desktop icons. `contentKey` maps to a body component in ./contents.js.
export const APPS = [
  { id: 'files', title: 'Files', icon: Folder, contentKey: 'files' },
  { id: 'terminal', title: 'Terminal', icon: Terminal, contentKey: 'terminal' },
  { id: 'browser', title: 'Browser', icon: Globe, contentKey: 'browser' },
  { id: 'settings', title: 'Settings', icon: Settings, contentKey: 'settings' },
  { id: 'about', title: 'About', icon: Info, contentKey: 'about' },
];

export const getApp = (id) => APPS.find((a) => a.id === id);
