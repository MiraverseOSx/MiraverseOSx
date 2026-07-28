import React, { useState } from 'react';
import { miraverseDb } from '../db/miraverseDb';
import { useOSStore } from '../store/useOSStore';
import GameHubApp from '../games/GameHubApp';
import CommsApp from './CommsApp';
import SpellForgeApp from './SpellForgeApp';
import AuraPassportApp from './AuraPassportApp';

const Panel = ({ children }) => (
  <div className="h-full w-full overflow-auto p-6 text-sm leading-relaxed text-white/80">
    {children}
  </div>
);

// ----------------------------------------------------------------------
// Files App: Browses Live Database Records (Lore, Regions, Factions, NPCs, Houses)
// ----------------------------------------------------------------------
const Files = () => {
  const [activeFolder, setActiveFolder] = useState('lore');
  const [selectedItem, setSelectedItem] = useState(null);

  const folders = [
    { id: 'lore', label: 'Lore Archive', icon: '📜', data: miraverseDb.getLoreEntries() },
    { id: 'factions', label: 'Factions', icon: '🏛️', data: miraverseDb.getFactions() },
    { id: 'regions', label: 'Regions', icon: '🗺️', data: miraverseDb.getRegions() },
    { id: 'npcs', label: 'NPCs', icon: '👤', data: miraverseDb.getNPCs() },
    { id: 'houses', label: 'Houses', icon: '🏰', data: miraverseDb.getHouses() },
  ];

  const currentFolder = folders.find((f) => f.id === activeFolder);

  return (
    <div className="flex h-full w-full bg-black/40 text-white/90">
      {/* Sidebar Folders */}
      <div className="w-48 border-r border-white/10 bg-black/20 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          Database Directories
        </div>
        <div className="space-y-1">
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFolder(f.id);
                setSelectedItem(null);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${
                activeFolder === f.id ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/10 text-white/70'
              }`}
            >
              <span>{f.icon}</span>
              <span className="truncate">{f.label}</span>
              <span className="ml-auto text-[10px] text-white/40">{f.data.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main File Listing */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-white/60">
          <span>miraverse_azure.sql / {currentFolder.label}</span>
          <span>{currentFolder.data.length} records</span>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {currentFolder.data.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`cursor-pointer flex flex-col rounded-xl border p-3 transition ${
                  selectedItem?.id === item.id
                    ? 'border-cyan-400/50 bg-cyan-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-xs text-white">
                  <span>📄</span>
                  <span className="truncate">{item.title || item.name}</span>
                </div>
                <div className="mt-2 text-[11px] text-white/50 line-clamp-2">
                  {item.summary || item.lore || item.ideology || item.motto || item.type}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-cyan-300/70">
                  <span>{item.id}</span>
                  {item.era && <span>{item.era}</span>}
                  {item.danger && <span>Level {item.danger}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Selected File Details */}
          {selectedItem && (
            <div className="mt-4 rounded-xl border border-cyan-500/30 bg-black/70 p-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-semibold text-cyan-300 text-sm">{selectedItem.title || selectedItem.name}</span>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-200">{selectedItem.id}</span>
              </div>
              <p className="mt-2 text-white/80 leading-relaxed">{selectedItem.summary || selectedItem.lore}</p>
              {selectedItem.tags && (
                <div className="mt-3 text-[10px] text-white/40">Tags: {selectedItem.tags}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Terminal App: Interactive SQL & CLI Query Console
// ----------------------------------------------------------------------
const TerminalApp = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'sys', text: 'MiraverseOSx Terminal [Database Engine v0.1.0]' },
    { type: 'sys', text: 'Connected to miraverse_azure.sql (Local & Appwrite Bridge)' },
    { type: 'sys', text: 'Type "help" or "SELECT * FROM Factions" to query database.\n' },
  ]);

  const handleCommand = (e) => {
    if (e.key !== 'Enter' || !input.trim()) return;
    const cmd = input.trim();
    setInput('');

    const newHistory = [...history, { type: 'cmd', text: `guest@miraverse:~$ ${cmd}` }];

    if (cmd.toLowerCase() === 'clear') {
      setHistory([]);
      return;
    }

    if (cmd.toLowerCase() === 'help') {
      newHistory.push({
        type: 'res',
        text: `Available CLI Commands:
  • SELECT * FROM [Regions | Houses | Factions | NPCs | Apps | Lore | Events]
  • SHOW TABLES
  • LORE SEARCH <query>
  • CLEAR
  • HELP`,
      });
    } else if (cmd.toLowerCase().startsWith('lore search ')) {
      const q = cmd.substring(12);
      const results = miraverseDb.searchLore(q);
      useOSStore.getState().addSkillXP('Research', 15);
      useOSStore.getState().addSkillXP('Programming', 15);
      newHistory.push({
        type: 'res',
        text: `Found ${results.length} Lore Entries matching "${q}":\n` +
          results.map((r) => `[${r.id}] ${r.title} (${r.era}): ${r.summary}`).join('\n\n'),
      });
    } else {
      const res = miraverseDb.executeSQL(cmd);
      useOSStore.getState().addSkillXP('Programming', 15);
      useOSStore.getState().addSkillXP('Cryptography', 15);
      if (res.rows) {
        const formatted = res.rows
          .map((r) => ` • [${r.id}] ${r.title || r.name} | ${r.type || r.role || r.category || ''}`)
          .join('\n');
        newHistory.push({
          type: 'res',
          text: `Result set for table [${res.table}] (${res.count} records):\n${formatted}`,
        });
      } else {
        newHistory.push({
          type: 'res',
          text: JSON.stringify(res, null, 2),
        });
      }
    }

    setHistory(newHistory);
  };

  return (
    <div className="h-full w-full overflow-auto bg-black/85 p-4 font-mono text-xs text-green-400">
      {history.map((h, i) => (
        <pre key={i} className={`whitespace-pre-wrap leading-relaxed ${h.type === 'cmd' ? 'text-white' : 'text-green-400'}`}>
          {h.text}
        </pre>
      ))}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[#B47CD8] font-bold text-sm tracking-wide">miraverse@osx:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent text-[#C788F0] font-mono text-xs outline-none"
          autoFocus
          placeholder="Type SQL or CLI command..."
        />
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Browser App: Simulated In-Game Database Portals
// ----------------------------------------------------------------------
const Browser = () => {
  const [url] = useState('https://miraverse.os/factions');
  const factions = miraverseDb.getFactions();
  const lore = miraverseDb.getLoreEntries();

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-white">
      {/* Address bar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900 px-4 py-2">
        <div className="flex-1 rounded-full bg-black/40 px-4 py-1 text-xs text-cyan-300">
          🔒 {url}
        </div>
      </div>

      <Panel>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-cyan-400">Miraverse World Network</h2>
            <p className="text-xs text-white/60">Live database directory fed by miraverse_azure.sql</p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-sm text-white">Factions Directory</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {factions.map((f) => (
                <div key={f.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300">{f.name}</span>
                    <span className="text-[10px] text-white/50">{f.type}</span>
                  </div>
                  <p className="mt-2 text-xs text-white/70">{f.ideology}</p>
                  <div className="mt-3 text-[11px] text-white/40">Leader: {f.leader} | HQ: {f.hq}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-sm text-white">Latest World Lore</h3>
            <div className="space-y-2">
              {lore.slice(0, 4).map((l) => (
                <div key={l.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="font-medium text-xs text-cyan-200">{l.title}</div>
                  <div className="mt-1 text-xs text-white/70">{l.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};

// ----------------------------------------------------------------------
// Settings App: Database Metrics & Control
// ----------------------------------------------------------------------
const SettingsApp = () => {
  const setWallpaper = useOSStore((s) => s.setWallpaper);
  const currentWallpaper = useOSStore((s) => s.wallpaper);

  const wallpapers = [
    { name: 'Cosmic Nebula', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' },
    { name: 'Neon City', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Cyber Minimal', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop' },
  ];

  return (
    <Panel>
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white">Database Engine Status</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/50">Regions</div>
              <div className="text-lg font-bold text-cyan-400">{miraverseDb.getRegions().length}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/50">Factions</div>
              <div className="text-lg font-bold text-cyan-400">{miraverseDb.getFactions().length}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/50">NPCs</div>
              <div className="text-lg font-bold text-cyan-400">{miraverseDb.getNPCs().length}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/50">Lore Entries</div>
              <div className="text-lg font-bold text-cyan-400">{miraverseDb.getLoreEntries().length}</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-white">Wallpaper Select</h2>
          <div className="grid grid-cols-3 gap-3">
            {wallpapers.map((wp) => (
              <button
                key={wp.name}
                onClick={() => setWallpaper(wp.url)}
                className={`flex flex-col items-center overflow-hidden rounded-lg border p-2 transition ${
                  currentWallpaper === wp.url ? 'border-cyan-400 bg-cyan-500/20' : 'border-white/10 hover:bg-white/10'
                }`}
              >
                <div
                  className="h-16 w-full rounded bg-cover bg-center"
                  style={{ backgroundImage: `url("${wp.url}")` }}
                />
                <span className="mt-2 text-xs text-white/80">{wp.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export const CONTENTS = {
  files: Files,
  comms: CommsApp,
  gamehub: GameHubApp,
  spellforge: SpellForgeApp,
  passport: AuraPassportApp,
  terminal: TerminalApp,
  browser: Browser,
  settings: SettingsApp,
};

export const getContent = (key) => CONTENTS[key] || (() => <Panel>Nothing here yet.</Panel>);
