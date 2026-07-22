import React from 'react';

// Placeholder app bodies. Each is a plain component rendered inside a Window.
// Real functionality lands later — for now they establish the visual shell.

const Panel = ({ children }) => (
  <div className="h-full w-full overflow-auto p-6 text-sm leading-relaxed text-white/80">
    {children}
  </div>
);

const Files = () => (
  <Panel>
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
      {['Documents', 'Downloads', 'Pictures', 'Music', 'Projects', 'Trash'].map((name) => (
        <div key={name} className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-white/10">
          <div className="text-3xl">📁</div>
          <span className="text-xs text-white/70">{name}</span>
        </div>
      ))}
    </div>
  </Panel>
);

const TerminalApp = () => (
  <div className="h-full w-full overflow-auto bg-black/60 p-4 font-mono text-xs text-green-400">
    <p>MiraverseOSx [Version 0.1.0]</p>
    <p>(c) Miraverse. All rights reserved.</p>
    <p className="mt-2">guest@miraverse:~$ <span className="animate-pulse">▋</span></p>
  </div>
);

const Browser = () => (
  <Panel>
    <div className="mb-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-white/60">
      🔒 https://miraverse.os
    </div>
    <p className="text-white/70">A browser lives here. Point it at anything.</p>
  </Panel>
);

const SettingsApp = () => (
  <Panel>
    <h2 className="mb-3 text-base font-semibold text-white">Settings</h2>
    <ul className="space-y-2">
      {['Appearance', 'Wallpaper', 'Network', 'Sound', 'About'].map((s) => (
        <li key={s} className="rounded-md px-3 py-2 hover:bg-white/10">{s}</li>
      ))}
    </ul>
  </Panel>
);

const About = () => (
  <Panel>
    <h2 className="mb-2 text-lg font-semibold text-white">MiraverseOSx</h2>
    <p>A desktop OS environment in the browser.</p>
    <p className="mt-2 text-white/50">Version 0.1.0</p>
  </Panel>
);

export const CONTENTS = {
  files: Files,
  terminal: TerminalApp,
  browser: Browser,
  settings: SettingsApp,
  about: About,
};

export const getContent = (key) => CONTENTS[key] || (() => <Panel>Nothing here yet.</Panel>);
