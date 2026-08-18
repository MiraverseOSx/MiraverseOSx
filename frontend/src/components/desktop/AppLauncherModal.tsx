import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Bookmark, Cpu, Home, Sparkles, Globe, Mail, 
  MessageSquare, UserCheck, Radio, Folder, BookOpen, Terminal, 
  Settings, Search, X, ChevronRight, CornerDownLeft, Star
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
  // 5.3 Personal Apps & Tools
  { id: 'passport', label: 'MIRROR // Citizen Matrix', category: 'Personal Apps', icon: UserCheck, color: 'text-[#fbcfe8]', border: 'border-[#fbcfe8]/30', desc: 'Identity initialization, appearance, pronouns, wardrobe & telemetry calibration' },
  { id: 'housing', label: 'HOMECRAFT // Residential', category: 'Personal Apps', icon: Home, color: 'text-[#c4b5fd]', border: 'border-[#c4b5fd]/30', desc: 'Residential grid editor, furniture layout, room expansion & rest' },
  
  // 5.3 Workplace & Career Portals
  { id: 'jobs', label: 'WORKNET // Federal Access', category: 'Workplace Portals', icon: Briefcase, color: 'text-[#fef08a]', border: 'border-[#fef08a]/30', desc: 'Centralized federal work access across DGA, Faith Medical, Finance & Archives' },
  { id: 'comms', label: 'COMMS // Institutional Network', category: 'Workplace Portals', icon: MessageSquare, color: 'text-[#99f6e4]', border: 'border-[#99f6e4]/30', desc: 'Dual-pane instant messaging mesh & encrypted Cyacademy/Career inbox' },
  
  // 5.3 Civic Subsystems & Notice Boards
  { id: 'board', label: 'CHRONICLE // Notice Board', category: 'Civic Subsystems', icon: Bookmark, color: 'text-[#a7f3d0]', border: 'border-[#a7f3d0]/30', desc: 'Central notice board, active quests, missions, adventures & lore codices' },
  { id: 'pulse', label: 'PULSE // Faction Telemetry', category: 'Civic Subsystems', icon: Radio, color: 'text-[#f472b6]', border: 'border-[#f472b6]/30', desc: 'Faction matrix tracker, regional announcements & social broadcast feed' },
  
  // 5.3 Public Versenet Websites & Navigation
  { id: 'browser', label: 'VERSENET // Browser Terminal', category: 'Versenet Web', icon: Globe, color: 'text-[#93c5fd]', border: 'border-[#93c5fd]/30', desc: 'Public website network: CIVINET, QUESTNOTICE, Faith Med, DGA & Archives' },
  
  // Storage, Security & Utility
  { id: 'spellforge', label: 'SpellForge Protocol Matrix', category: 'Security & Tools', icon: Sparkles, color: 'text-[#e9d5ff]', border: 'border-[#e9d5ff]/30', desc: 'Elemental protocol synthesis, reality stabilization & firewall weaving' },
  { id: 'process', label: 'Process Monitor (PRISM)', category: 'Security & Tools', icon: Cpu, color: 'text-[#bae6fd]', border: 'border-[#bae6fd]/30', desc: 'Kernel thread inspector, origin tracer & PRISM corruption isolation' },
  { id: 'terminal', label: 'System Terminal', category: 'Security & Tools', icon: Terminal, color: 'text-[#6ee7b7]', border: 'border-[#6ee7b7]/30', desc: 'Command line execution shell & direct live SQL query engine' },
  { id: 'files', label: 'File Explorer', category: 'Storage & Registry', icon: Folder, color: 'text-[#fde047]', border: 'border-[#fde047]/30', desc: 'Local documents, Purge archives, canonical file types & map rasters' },
  { id: 'lore', label: 'Lore Explorer (Cloud)', category: 'Storage & Registry', icon: BookOpen, color: 'text-[#ddd6fe]', border: 'border-[#ddd6fe]/30', desc: 'Live synchronized Appwrite Cloud lore database & character registries' },
  { id: 'settings', label: 'System Settings', category: 'Storage & Registry', icon: Settings, color: 'text-[#cbd5e1]', border: 'border-[#cbd5e1]/30', desc: 'Theme personalization, sound synthesizer & OS preferences' },
];

export default function AppLauncherModal({ isOpen, onClose }: AppLauncherModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const toggleApp = useOSStore((s) => s.toggleApp);
  const player = useOSStore((s) => s.gameplay.player);
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

  const categories = ['All', 'Personal Apps', 'Workplace Portals', 'Civic Subsystems', 'Versenet Web', 'Security & Tools', 'Storage & Registry'];

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
        className="absolute inset-0 bg-[#070512]/80 backdrop-blur-lg transition-opacity"
      />

      {/* Elegant Lavender & Gold Obsidian Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="relative z-10 w-full max-w-2xl bg-[#120e24]/95 backdrop-blur-2xl border border-[#c4b5fd]/35 shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_35px_rgba(196,181,253,0.15)] rounded-2xl overflow-hidden font-sans text-white flex flex-col max-h-[580px]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#352758] bg-[#0b0818] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={13} className="text-[#fde047]" />
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#e9d5ff] uppercase">
                MIRAVERSEOSX // 5.3 LAYERED INTERFACE GRID
              </span>
            </div>
            
            {/* Dual Currency Badge in Launcher */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-amber-400 font-bold">{player?.credits ?? 500} ₢ CREDITS</span>
              <span className="text-cyan-400 font-bold">{player?.bits ?? 25} ◈ BITS</span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 ml-2"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Search Bar with Gold/Lavender Focus Ring */}
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3.5 text-[#a78bfa]" />
            <input
              type="text"
              placeholder="Search applications, protocols, and services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#1a1435] border border-[#3f2e6b] text-xs text-white placeholder-[#a78bfa]/60 font-sans focus:outline-none focus:border-[#fde047] focus:ring-1 focus:ring-[#fde047]/60 transition"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none pt-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (soundEnabled) SoundFX.playSnap();
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#7c3aed] to-[#d97706] text-[#fef9c3] font-bold shadow-xs border border-[#fde047]/40'
                    : 'text-[#c4b5fd] hover:text-white hover:bg-[#231a44]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => handleLaunch(app.id)}
                className="p-3 rounded-xl bg-[#181232]/60 hover:bg-[#241a4a] border border-[#36275c] hover:border-[#c4b5fd]/60 text-left transition flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f1740] border ${app.border} text-white group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon size={18} className={app.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white group-hover:text-[#fef08a] truncate">
                        {app.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#c4b5fd]/80 truncate mt-0.5 leading-normal">
                      {app.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight size={13} className="text-[#a78bfa] group-hover:text-[#fde047] shrink-0 ml-1.5" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#0b0818] border-t border-[#352758] flex justify-between items-center text-[10px] font-mono text-[#a78bfa]">
          <span>{filtered.length} Applications</span>
          <span className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.2 rounded bg-[#221940] border border-[#4c387c] text-[#fef9c3] font-mono">Esc</kbd>
            <span>to dismiss</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
