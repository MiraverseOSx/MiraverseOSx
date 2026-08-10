import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../../store/useOSStore';
import { APPS } from '../../apps/contents';
import Button from '../ui/button';
import PublicIcon from '../ui/PublicIcon';
import MAIDock from '../MAIDock';

export default function DesktopTaskbar({
  areSidebarsVisible,
  onToggleSidebars,
  onTogglePhone,
  onOpenDocumentModal,
  onOpenSignalPlayer,
}) {
  const {
    windows,
    toggleApp,
    toggleSanctuary,
    logoutUser,
  } = useOSStore();

  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  const getApp = (id) => APPS.find((app) => app.id === id);
  const openApp = (id) => {
    const app = getApp(id);
    if (app) toggleApp(app);
  };

  const utilityItems = [
    {
      id: 'browser',
      label: '🌐 Net Browser',
      action: () => openApp('browser'),
    },
    {
      id: 'board',
      label: '📜 Master Quest Tracker',
      action: () => openApp('board'),
    },
    {
      id: 'mail',
      label: '✉️ Civic Mailbox',
      action: () => openApp('mail'),
    },
    {
      id: 'comms',
      label: '💬 Comms Portal',
      action: () => openApp('comms'),
    },
    {
      id: 'spellforge',
      label: '🔥 SpellForge Matrix',
      action: () => openApp('spellforge'),
    },
    {
      id: 'passport',
      label: '🪪 Citizen Record',
      action: () => openApp('passport'),
    },
    {
      id: 'pulse',
      label: '📡 Pulse Network',
      action: () => openApp('pulse'),
    },
    {
      id: 'files',
      label: '📁 File Explorer',
      action: () => openApp('files'),
    },
    {
      id: 'terminal',
      label: '💻 Terminal',
      action: () => openApp('terminal'),
    },
    {
      id: 'settings',
      label: '⚙️ System Settings',
      action: () => openApp('settings'),
    },
    {
      id: 'sanctuary',
      label: '🛡️ Sanctuary Mode',
      action: toggleSanctuary,
    },
    {
      id: 'phone',
      label: '📱 Phone Line',
      action: onTogglePhone,
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 flex h-12 items-center justify-between border-t border-[#1b254f]/35 bg-white/58 px-4 select-none font-ui text-xs shadow-none backdrop-blur-[18px]">
      {/* Left Controls: Utilities Launcher, Window Buttons, Search */}
      <div className="relative flex items-center gap-3">
        {/* Utilities Drawer Popup */}
        <AnimatePresence>
          {isLauncherOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className="absolute bottom-14 left-0 z-50 w-[280px] space-y-3 border border-[#1b254f]/30 bg-white/80 p-4 text-[#1b254f] shadow-none backdrop-blur-[18px] font-ui"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-1 px-1">
                <div className="flex items-center gap-1.5 font-display text-sm text-[#1b254f]">
                  <PublicIcon src="/icons/Icon set 1/0.5x/Star 256 px.png" size={14} /> System utilities
                </div>
              </div>

              {utilityItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsLauncherOpen(false);
                  }}
                  className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-xs font-semibold hover:border-[#1b254f]/25 hover:bg-white/60 transition"
                >
                  {item.icon && <PublicIcon src={item.icon} size={16} />}
                  <span>{item.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsLauncherOpen((open) => !open)}
          className="flex items-center gap-2 border-r border-[#1b254f]/25 pr-3 text-[10px] font-semibold tracking-[.14em] text-[#1b254f] hover:text-[#7657a6] transition"
        >
          <PublicIcon src="/icons/Icon set 1/0.5x/Menu 256 px.png" size={16} /> Utilities
        </button>

        <button
          onClick={onToggleSidebars}
          className={`flex h-8 items-center gap-2 border px-2.5 text-[10px] font-semibold tracking-wide transition ${areSidebarsVisible
              ? 'border-[#1b254f]/25 bg-white/40 text-[#1b254f] hover:bg-white/65'
              : 'border-[#7657a6] bg-[#7657a6] text-white'
            }`}
          title={areSidebarsVisible ? 'Hide sidebars and open workspace' : 'Restore desktop sidebars'}
          aria-pressed={!areSidebarsVisible}
        >
          <PublicIcon src="/icons/Icon set 1/0.5x/Menu 256 px.png" size={13} />
          <span>{areSidebarsVisible ? 'Focus' : 'Panels'}</span>
        </button>

        {/* Open Apps Taskbar Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs sm:max-w-md">
          {windows.map((win) => (
            <button
              key={win.id}
              onClick={() => toggleApp(win)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-semibold border shadow-none transition ${!win.isMinimized
                  ? 'bg-[#7657a6] text-white border-[#7657a6]'
                  : 'bg-white/40 text-[#1b254f] border-[#1b254f]/25 hover:bg-white/60'
                }`}
            >
              <span>{win.title}</span>
            </button>
          ))}
        </div>

        <div className="h-4 w-[1px] bg-slate-300/50 mx-1" />

        {/* Search Bar */}
        <div className="relative flex items-center">
          <PublicIcon src="/icons/Icons8/icons8-home-16.svg" size={13} className="absolute left-2.5 opacity-60" />
          <input
            type="text"
            placeholder="Search city records..."
            className="h-8 w-36 sm:w-44 rounded-none border border-[#1b254f]/25 bg-white/40 backdrop-blur-sm pl-8 pr-3 text-[11px] text-[#1b254f] placeholder:text-[#8b92a7] focus:border-[#7657a6] focus:outline-none"
          />
        </div>
      </div>

      {/* Right Controls: Settings, Sanctuary, Logout, MAI */}
      <div className="relative flex items-center gap-2.5">
        <button
          onClick={() => openApp('settings')}
          className="grid h-9 w-9 place-items-center border border-[#1b254f]/30 bg-white/40 transition hover:bg-white/70"
          title="System Settings"
          aria-label="Open system settings"
        >
          <img
            src="/icons/Icons8/icons8-settings-50.gif"
            alt=""
            className="h-5 w-5 object-contain"
            aria-hidden="true"
          />
        </button>

        <Button
          onClick={() => toggleSanctuary()}
          size="sm"
          variant="outline"
          className="flex items-center gap-1 border-[#1b254f]/25 bg-white/40 text-[#1b254f] hover:bg-white/60 text-[11px] font-ui rounded-none shadow-none backdrop-blur-sm"
          title="Clear Desktop Canvas"
        >
          <PublicIcon src="/icons/Icon set 1/0.5x/Lock 256 px.png" size={13} />
          <span className="hidden sm:inline">Sanctuary</span>
        </Button>

        <Button
          onClick={() => logoutUser()}
          size="sm"
          variant="outline"
          className="flex items-center gap-1 border-[#1b254f]/25 bg-white/40 text-[#1b254f] hover:bg-white/60 text-[11px] font-ui rounded-none shadow-none backdrop-blur-sm"
          title="Log Out of Municipal OS"
        >
          <PublicIcon src="/icons/Icon set 1/0.5x/Power sign 256 px.png" size={13} />
          <span className="hidden sm:inline">Log Out</span>
        </Button>

        <MAIDock />
      </div>
    </footer>
  );
}
