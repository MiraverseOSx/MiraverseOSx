import React from 'react';
import type { LucideIcon } from 'lucide-react';

const TONES: Record<string, string> = {
  browser: 'sky', files: 'gold', mail: 'sky', comms: 'lilac',
  passport: 'gold', board: 'sage', housing: 'lilac', finance: 'gold',
  spellforge: 'lilac', pulse: 'rose', vitals: 'sage', campus: 'sky',
  lore: 'lilac', jobs: 'gold', meridionRegistry: 'lilac', documentStudio: 'rose',
  dgaos: 'ink', traceForensics: 'ink', process: 'ink', terminal: 'ink', settings: 'lilac',
};

export function appTone(id: string) { return TONES[id] || 'lilac'; }

export default function AppGlyph({ icon: Icon, appId, size = 'medium', className = '' }: {
  icon: LucideIcon;
  appId: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  return <span className={`app-glyph ${className}`} data-tone={appTone(appId)} data-size={size} aria-hidden="true"><Icon strokeWidth={1.55} /></span>;
}
