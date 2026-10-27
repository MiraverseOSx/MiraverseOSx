import React, { useState, lazy, Suspense } from 'react';
import { miraverseDb } from '../db/miraverseDb';
import { useOSStore } from '../store/useOSStore';
import SettingsApp from './SettingsApp';
import { 
  Folder, FileText, Shield, Globe, Briefcase, BookOpen, 
  Mail, MessageSquare, UserCheck, Sparkles, Settings, 
  Bookmark, Radio, Terminal, Cpu, Home, Activity
} from 'lucide-react';

export const APPS = [
  { id: 'fieldOperations', title: 'Field Operations', icon: Shield, category: 'Agency Systems' },
  { id: 'dgaos', title: 'DGAOS Command Center', icon: Shield, category: 'Agency Systems' },
  { id: 'documentStudio', title: 'Document Studio', icon: FileText, category: 'Civic Records' },
  { id: 'meridionRegistry', title: 'AURA Citizen Registry', icon: UserCheck, category: 'Civic Records' },
  { id: 'jobs', title: 'WORKNET // Federal Access', icon: Briefcase, category: 'Workplace Portals' },
  { id: 'process', title: 'Process Monitor', icon: Cpu, category: 'Security' },
  { id: 'housing', title: 'HOMECRAFT // Housing', icon: Home, category: 'Personal Apps' },
  { id: 'finance', title: 'ORYN // Treasury & Crypto Ledger', icon: Shield, category: 'Personal Apps' },
  { id: 'vitals', title: 'VITALS // Bio-Aura Matrix', icon: Activity, category: 'Personal Apps' },
  { id: 'campus', title: 'CAMPUS // Cycademy Network', icon: BookOpen, category: 'Civic Subsystems' },
  { id: 'browser', title: 'VERSENET // Browser', icon: Globe, category: 'Versenet Web' },
  { id: 'mail', title: 'AureMail Mailbox', icon: Mail, category: 'Communication' },
  { id: 'comms', title: 'COMMS // Institutional Network', icon: MessageSquare, category: 'Workplace Portals' },
  { id: 'passport', title: 'Citizen Hub', icon: UserCheck, category: 'Personal Apps' },
  { id: 'pulse', title: 'PULSE // News Portal', icon: Radio, category: 'Communication' },
  { id: 'maispace', title: 'mai.space // Social Network', icon: MessageSquare, category: 'Communication' },
  { id: 'files', title: 'File Explorer', icon: Folder, category: 'Storage' },
  { id: 'lore', title: 'Lore Explorer', icon: BookOpen, category: 'Database' },
  { id: 'terminal', title: 'System Terminal', icon: Terminal, category: 'Intelligence' },
  { id: 'settings', title: 'System Settings', icon: Settings, category: 'Utility' },
];

// Lazy load app modules for code splitting and fast initial bundle loading
const DgaosApp = lazy(() => import('../dgaos/apps/DgaosApp'));
const CommsApp = lazy(() => import('./Comms/CommsApp'));
const DocumentStudioApp = lazy(() => import('./DocumentStudioApp'));
const RegistryWorkspaceApp = lazy(() => import('./RegistryWorkspaceApp'));
const CivicProfileApp = lazy(() => import('./CivicProfileApp'));
const PulseApp = lazy(() => import('./Pulse/PulseApp'));
const MaiSpaceApp = lazy(() => import('./MaiSpaceApp'));
const BrowserApp = lazy(() => import('./Browser/BrowserApp'));
const MailApp = lazy(() => import('./MailApp'));
const FileExplorerApp = lazy(() => import('./FileExplorerApp'));
const LoreExplorerApp = lazy(() => import('./LoreExplorer'));
const ProcessMonitorApp = lazy(() => import('./ProcessMonitorApp'));
const HousingApp = lazy(() => import('./HousingApp'));
const JobWorkstationApp = lazy(() => import('./JobWorkstationApp'));
const FinanceTerminal = lazy(() => import('./FinanceTerminal'));
const VitalsApp = lazy(() => import('./VitalsApp'));
const CampusApp = lazy(() => import('./CampusApp'));
const FieldOperationsApp = lazy(() => import('./FieldOperations/FieldOperationsApp'));

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

// Wrap lazy components in Suspense for dynamic import safety
const withSuspense = (Component, name) => (props) => (
  <Suspense fallback={<AppLoadingFallback name={name} />}>
    <Component {...props} />
  </Suspense>
);

export const CONTENTS = {
  fieldOperations: withSuspense(FieldOperationsApp, 'Field Operations'),
  dgaos: withSuspense(DgaosApp, 'DGAOS Command Center'),
  documentStudio: withSuspense(DocumentStudioApp, 'Document Studio'),
  meridionRegistry: withSuspense(RegistryWorkspaceApp, 'Citizen Registry'),
  files: withSuspense(FileExplorerApp, 'File Explorer'),
  comms: withSuspense(CommsApp, 'Comms'),
  mail: withSuspense(MailApp, 'Mailbox'),
  passport: withSuspense(CivicProfileApp, 'Citizen Hub'),
  vitals: withSuspense(VitalsApp, 'VITALS Monitor'),
  vault: withSuspense(CivicProfileApp, 'VAULT Storage'),
  campus: withSuspense(CampusApp, 'CAMPUS Registrar'),
  pulse: withSuspense(PulseApp, 'Pulse Network'),
  maispace: withSuspense(MaiSpaceApp, 'mai.space'),
  terminal: TerminalApp,
  browser: withSuspense(BrowserApp, 'Browser'),
  settings: SettingsApp,
  lore: withSuspense(LoreExplorerApp, 'Lore Explorer'),
  process: withSuspense(ProcessMonitorApp, 'Process Monitor'),
  housing: withSuspense(HousingApp, 'HOMECRAFT // Housing'),
  jobs: withSuspense(JobWorkstationApp, 'Career Workstation'),
  finance: withSuspense(FinanceTerminal, 'Oryn Finance Ledger'),
};

export const getContent = (key) => CONTENTS[key] || (() => <Panel>Nothing here yet.</Panel>);
