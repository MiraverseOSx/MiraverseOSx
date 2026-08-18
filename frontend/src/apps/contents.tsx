import React, { useState, lazy, Suspense } from 'react';
import { miraverseDb } from '../db/miraverseDb';
import { useOSStore } from '../store/useOSStore';
import { 
  Folder, FileText, Search, Shield, Globe, Users, Briefcase, BookOpen, 
  Copy, Check, Mail, MessageSquare, UserCheck, Sparkles, Settings, 
  Bookmark, Radio, Terminal, Cpu, Home, Activity
} from 'lucide-react';

export const APPS = [
  { id: 'jobs', title: 'WORKNET (§10.1A)', icon: Briefcase, category: 'Workplace Portals' },
  { id: 'board', title: 'CHRONICLE Notice Board (§5.3)', icon: Bookmark, category: 'Civic Subsystems' },
  { id: 'process', title: 'Process Monitor (PRISM/Sys)', icon: Cpu, category: 'Security' },
  { id: 'housing', title: 'HOMECRAFT Dorm 4B (§5.3)', icon: Home, category: 'Personal Apps' },
  { id: 'spellforge', title: 'SpellForge Matrix', icon: Sparkles, category: 'Security' },
  { id: 'browser', title: 'VERSENET Browser (§5.3)', icon: Globe, category: 'Versenet Web' },
  { id: 'mail', title: 'AureMail Mailbox', icon: Mail, category: 'Communication' },
  { id: 'comms', title: 'COMMS Routing (§5.3)', icon: MessageSquare, category: 'Workplace Portals' },
  { id: 'passport', title: 'MIRROR // Citizen Record (§5.3)', icon: UserCheck, category: 'Personal Apps' },
  { id: 'pulse', title: 'PULSE Telemetry (§5.3)', icon: Radio, category: 'Civic Subsystems' },
  { id: 'files', title: 'File Explorer (Virtual Drive)', icon: Folder, category: 'Storage' },
  { id: 'lore', title: 'Lore Explorer', icon: BookOpen, category: 'Database' },
  { id: 'terminal', title: 'System Terminal (SQL & Shell)', icon: Terminal, category: 'Intelligence' },
  { id: 'settings', title: 'System Settings', icon: Settings, category: 'Utility' },
];

// Lazy load app modules for code splitting and fast initial bundle loading
const CommsApp = lazy(() => import('./Comms/CommsApp'));
const SpellForgeApp = lazy(() => import('./SpellForgeApp'));
const CivicProfileApp = lazy(() => import('./CivicProfileApp'));
const PulseApp = lazy(() => import('./Pulse/PulseApp'));
const NoticeBoardApp = lazy(() => import('./NoticeBoardApp'));
const BrowserApp = lazy(() => import('./Browser/BrowserApp'));
const MailApp = lazy(() => import('./MailApp'));
const FileExplorerApp = lazy(() => import('./FileExplorerApp'));
const LoreExplorerApp = lazy(() => import('./LoreExplorer'));
const ProcessMonitorApp = lazy(() => import('./ProcessMonitorApp'));
const HousingApp = lazy(() => import('./HousingApp'));
const JobWorkstationApp = lazy(() => import('./JobWorkstationApp'));

// Sleek loading fallback for lazy-loaded apps
const AppLoadingFallback = ({ name = 'App' }) => (
  <div className="flex h-full w-full flex-col items-center justify-center bg-white/80 p-6 text-center text-slate-800">
    <div className="relative mb-3 flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
      <span className="absolute text-xs font-mono text-indigo-600">OS</span>
    </div>
    <div className="text-xs font-medium tracking-wider text-[#1d2650] uppercase">Loading {name}...</div>
    <div className="mt-1 text-[11px] text-slate-500 font-mono">Initializing module memory space</div>
  </div>
);

const Panel = ({ children }) => (
  <div className="h-full w-full overflow-auto p-6 text-sm leading-relaxed text-slate-800">
    {children}
  </div>
);

// ----------------------------------------------------------------------
// Files App: Refined & Redesigned Celestial File Explorer
// ----------------------------------------------------------------------
const Files = () => {
  const [activeFolder, setActiveFolder] = useState('lore');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);

  const addSkillXP = useOSStore((s) => s.addSkillXP);
  const incrementAppRank = useOSStore((s) => s.incrementAppRank);

  const folders = [
    { id: 'lore', label: 'Lore Archive', icon: BookOpen, data: miraverseDb.getLoreEntries() },
    { id: 'regions', label: 'Regions', icon: Globe, data: miraverseDb.getRegions() },
    { id: 'factions', label: 'Factions', icon: Shield, data: miraverseDb.getFactions() },
    { id: 'npcs', label: 'NPC Registry', icon: Users, data: miraverseDb.getNPCs() },
    { id: 'careers', label: 'Careers', icon: Briefcase, data: miraverseDb.getCareers() },
  ];

  const currentFolder = folders.find((f) => f.id === activeFolder) || folders[0];

  const filteredData = currentFolder.data.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.role && item.role.toLowerCase().includes(q))
    );
  });

  const copySnippet = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#F6F7FB] to-[#EFF1F7] text-[#162241]">
      {/* Explorer Header & Navigation Bar */}
      <div className="flex h-11 items-center justify-between border-b border-slate-300 bg-white px-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#1d2650]">
          <Folder size={15} className="text-[#5f6ab0]" />
          <span className="font-semibold">miraverse_os</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-700">{currentFolder.label.toLowerCase().replace(/\s+/g, '_')}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-xs">
            <Search size={13} className="mr-2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${currentFolder.label.toLowerCase()}...`}
              className="w-52 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar Directories */}
        <div className="w-48 shrink-0 border-r border-slate-300/70 bg-white/60 p-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">
            System Directories
          </div>
          <div className="space-y-1">
            {folders.map((f) => {
              const IconComp = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveFolder(f.id);
                    setSelectedItem(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${activeFolder === f.id
                    ? 'bg-[#e9ebf6] font-semibold text-[#1d2650]'
                    : 'text-slate-600 hover:bg-[#f2f3fb]'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComp size={14} className={activeFolder === f.id ? 'text-[#5f6ab0]' : 'text-slate-400'} />
                    <span>{f.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {f.data.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Item Grid & Drawer */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FAFAFC]">
          <div className="flex items-center justify-between border-b border-slate-300/60 px-4 py-2 text-[11px] font-semibold text-slate-500">
            <span>{currentFolder.label.toUpperCase()}</span>
            <span>{filteredData.length} records</span>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    addSkillXP('Research', 10);
                    incrementAppRank('research');
                  }}
                  className={`group cursor-pointer flex flex-col rounded-lg border p-3 transition ${selectedItem?.id === item.id
                    ? 'border-[#8c97d6] bg-[#eef0fb] shadow-sm'
                    : 'border-slate-200/80 bg-white hover:bg-[#f7f7fd]'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-xs text-[#1f2954] truncate">
                      <FileText size={14} className="text-[#5f6ab0] shrink-0" />
                      <span className="truncate">{item.title || item.name}</span>
                    </div>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-500">
                      {item.id}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                    {item.content || item.description || item.role || item.lore_summary || 'Record file entry'}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
                    <span>{item.category || item.type || item.faction || 'System Entry'}</span>
                    {item.status && <span className="text-emerald-600 font-medium">{item.status}</span>}
                  </div>
                </div>
              ))}
            </div>

            {!filteredData.length && (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching records found in {currentFolder.label}.
              </div>
            )}

            {/* Selected File Detail Drawer */}
            {selectedItem && (
              <div className="mt-5 rounded-xl border border-slate-300/80 bg-white p-4 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#1c2650] flex items-center gap-2">
                      <FileText size={15} className="text-[#5f6ab0]" />
                      {selectedItem.title || selectedItem.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">ID: {selectedItem.id}</span>
                  </div>
                  <button
                    onClick={() => copySnippet(selectedItem.content || selectedItem.description || selectedItem.name)}
                    className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-[#f4f5fc] px-2.5 py-1 text-[11px] text-[#1d2650] hover:bg-[#eef0fb]"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="my-3 text-xs leading-relaxed text-[#243064] whitespace-pre-line">
                  {selectedItem.content || selectedItem.description || selectedItem.role || selectedItem.lore_summary}
                </div>

                {selectedItem.perks && (
                  <div className="mt-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-[#1c2650]">Perks:</span> {selectedItem.perks.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
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
    { type: 'sys', text: 'MiraverseOSx Terminal [Native Engine v2.0.0]' },
    { type: 'sys', text: 'Connected to Native World Authority & Express API (http://localhost:5000/api)' },
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
  • SELECT * FROM [Regions | Factions | NPCs | Careers | Apps | Lore]
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
          results.map((r) => `[${r.id}] ${r.title}: ${r.content}`).join('\n\n'),
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
          <h2 className="text-base font-semibold text-[#1c2650]">World Authority Engine Status</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 shadow-sm">
              <div className="text-xs text-slate-500">Regions</div>
              <div className="text-lg font-bold text-[#3b4785]">{miraverseDb.getRegions().length}</div>
            </div>
            <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 shadow-sm">
              <div className="text-xs text-slate-500">Factions</div>
              <div className="text-lg font-bold text-[#3b4785]">{miraverseDb.getFactions().length}</div>
            </div>
            <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 shadow-sm">
              <div className="text-xs text-slate-500">NPCs</div>
              <div className="text-lg font-bold text-[#3b4785]">{miraverseDb.getNPCs().length}</div>
            </div>
            <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 shadow-sm">
              <div className="text-xs text-slate-500">Lore Entries</div>
              <div className="text-lg font-bold text-[#3b4785]">{miraverseDb.getLoreEntries().length}</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[#1c2650]">Wallpaper Select</h2>
          <div className="grid grid-cols-3 gap-3">
            {wallpapers.map((wp) => (
              <button
                key={wp.name}
                onClick={() => setWallpaper(wp.url)}
                className={`flex flex-col items-center overflow-hidden rounded-lg border p-2 transition ${currentWallpaper === wp.url ? 'border-[#8c97d6] bg-[#eef0fb]' : 'border-slate-200 hover:bg-white'
                  }`}
              >
                <div
                  className="h-16 w-full rounded bg-cover bg-center"
                  style={{ backgroundImage: `url("${wp.url}")` }}
                />
                <span className="mt-2 text-xs text-slate-700 font-medium">{wp.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};

// Wrap lazy components in Suspense for dynamic import safety
const withSuspense = (Component, name) => (props) => (
  <Suspense fallback={<AppLoadingFallback name={name} />}>
    <Component {...props} />
  </Suspense>
);

export const CONTENTS = {
  files: withSuspense(FileExplorerApp, 'File Explorer'),
  comms: withSuspense(CommsApp, 'Comms'),
  mail: withSuspense(MailApp, 'Mailbox'),
  spellforge: withSuspense(SpellForgeApp, 'SpellForge'),
  passport: withSuspense(CivicProfileApp, 'Civic Profile'),
  vitals: withSuspense(CivicProfileApp, 'VITALS Monitor'),
  vault: withSuspense(CivicProfileApp, 'VAULT Storage'),
  campus: withSuspense(BrowserApp, 'CAMPUS Registrar'),
  pulse: withSuspense(PulseApp, 'Pulse Network'),
  terminal: TerminalApp,
  browser: withSuspense(BrowserApp, 'Browser'),
  settings: SettingsApp,
  board: withSuspense(NoticeBoardApp, 'Notice Board'),
  lore: withSuspense(LoreExplorerApp, 'Lore Explorer'),
  process: withSuspense(ProcessMonitorApp, 'Process Monitor'),
  housing: withSuspense(HousingApp, 'Residential Quarters'),
  jobs: withSuspense(JobWorkstationApp, 'Career Workstation'),
};

export const getContent = (key) => CONTENTS[key] || (() => <Panel>Nothing here yet.</Panel>);
