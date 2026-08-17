import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Bookmark, Cpu, Home, Sparkles, Globe, Mail, 
  MessageSquare, UserCheck, Radio, Folder, BookOpen, Terminal, 
  Settings, Search, X, ChevronRight, CornerDownLeft
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { APPS } from '../../apps/contents';
import { SoundFX } from '../../utils/audio';
import { useSystemStore } from '../../store/useSystemStore';

export interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APPS_DIRECTORY = [
  // Careers & Governance
  { id: 'jobs', label: 'Career Workstation', category: 'Careers', icon: Briefcase, color: 'text-amber-400', desc: 'Faith Medical triage, DGA emergency dispatch & civic investigation' },
  { id: 'board', label: 'Master Notice Board', category: 'Governance', icon: Bookmark, color: 'text-emerald-400', desc: 'Active tasks, quests, adventures, and city missions' },
  { id: 'passport', label: 'Citizen Record', category: 'Governance', icon: UserCheck, color: 'text-rose-400', desc: 'Vitals, skill tree, clearance level & House verification' },
  
  // Security & Reality Weaving
  { id: 'process', label: 'Process Monitor', category: 'Security', icon: Cpu, color: 'text-sky-400', desc: 'Inspect kernel threads, trace origins & quarantine PRISM' },
  { id: 'spellforge', label: 'SpellForge Matrix', category: 'Security', icon: Sparkles, color: 'text-purple-400', desc: 'Protocol synthesis, regional elemental modules & Veil stability' },
  { id: 'terminal', label: 'System Terminal', category: 'Security', icon: Terminal, color: 'text-emerald-400', desc: 'Command-line execution & direct SQL query shell' },
  
  // Lifestyle & Healthcare
  { id: 'housing', label: 'Residential Dorm 4B', category: 'Lifestyle', icon: Home, color: 'text-indigo-400', desc: 'Bed rest, stamina recovery, study desk & DreamLog archives' },
  { id: 'browser', label: 'Net Browser', category: 'Lifestyle', icon: Globe, color: 'text-blue-400', desc: 'Faith Medical portal, cyacademy.aure & district directories' },
  
  // Communication & Mesh
  { id: 'mail', label: 'AureMail Mailbox', category: 'Network', icon: Mail, color: 'text-cyan-400', desc: 'Citizen welcome packet, municipal dispatches & intake forms' },
  { id: 'comms', label: 'Comms Portal', category: 'Network', icon: MessageSquare, color: 'text-teal-400', desc: 'NPC direct transmissions & encrypted mesh chat' },
  { id: 'pulse', label: 'Mai.space Network', category: 'Network', icon: Radio, color: 'text-pink-400', desc: 'Public social signal broadcasts & 7 reputation tracks' },
  
  // Storage & Cloud Registry
  { id: 'files', label: 'File Explorer', category: 'Storage', icon: Folder, color: 'text-yellow-400', desc: '17 canonical file extensions, maps & encrypted Purge records' },
  { id: 'lore', label: 'Lore Explorer (Cloud)', category: 'Storage', icon: BookOpen, color: 'text-violet-400', desc: 'Live Appwrite Cloud factions, locations & characters sync' },
  { id: 'settings', label: 'System Settings', category: 'System', icon: Settings, color: 'text-slate-400', desc: 'Theme personalization, sound synthesizer & OS preferences' },
];

export default function AppLauncherModal({ isOpen, onClose }: AppLauncherModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const toggleApp = useOSStore((s) => s.toggleApp);
  const { soundEnabled } = useSystemStore();

  const handleLaunch = (id: string) => {
    if (soundEnabled) SoundFX.playSnap();
    const app = APPS.find((a) => a.id === id) || { id };
    toggleApp(app);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const categories = ['All', 'Careers', 'Governance', 'Security', 'Lifestyle', 'Network', 'Storage'];

  const filtered = APPS_DIRECTORY.filter((app) => {
    const matchesCat = activeCategory === 'All' || app.category === activeCategory;
    const matchesQuery =
      !query.trim() ||
      app.label.toLowerCase().includes(query.toLowerCase()) ||
      app.category.toLowerCase().includes(query.toLowerCase()) ||
      app.desc.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Soft Ambient Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#040714]/75 backdrop-blur-md transition-opacity"
      />

      {/* Elegant Launcher Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="relative z-10 w-full max-w-2xl bg-[#0c1222]/95 backdrop-blur-2xl border border-[#202e52] shadow-[0_24px_80px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden font-sans text-slate-100 flex flex-col max-h-[580px]"
      >
        {/* Subtle Search Header */}
        <div className="p-4 border-b border-[#1b2644] bg-[#080d1a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#93a7dc] uppercase">
              Aureline OS // Applications
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Minimalist Search Bar */}
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search applications, protocols, and services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#12192e] border border-[#223158] text-xs text-slate-100 placeholder-slate-500 font-sans focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition"
              autoFocus
            />
          </div>

          {/* Clean Understated Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none pt-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (soundEnabled) SoundFX.playSnap();
                  setActiveCategory(cat);
                }}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-sky-600/90 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151e36]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Crisp App List Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => handleLaunch(app.id)}
                className="p-3 rounded-xl bg-[#0f162a]/60 hover:bg-[#16203c] border border-[#1a2542] hover:border-sky-500/40 text-left transition flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#141d36] border border-[#24335c] text-slate-200 group-hover:text-sky-300 transition shrink-0">
                    <Icon size={18} className={app.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-200 group-hover:text-white truncate">
                        {app.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-normal">
                      {app.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-sky-400 shrink-0 ml-1.5" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#080d1a] border-t border-[#1a2542] flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span>{filtered.length} Applications</span>
          <span className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">Esc</kbd>
            <span>to dismiss</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
