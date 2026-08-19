import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Bookmark, Cpu, Home, Sparkles, Globe, Mail, 
  MessageSquare, UserCheck, Radio, Folder, BookOpen, Terminal, 
  Settings, Search, X, Star
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
  { id: 'passport', label: 'MIRROR // Citizen Matrix', category: 'Personal Apps', icon: UserCheck, color: 'text-[#FBE6AB]', border: 'border-[#E5C370]/50', desc: 'Identity initialization, appearance, pronouns, wardrobe & telemetry calibration' },
  { id: 'housing', label: 'HOMECRAFT // Residential', category: 'Personal Apps', icon: Home, color: 'text-[#EDE7FF]', border: 'border-[#8FA2E6]/50', desc: 'Residential grid editor, furniture layout, room expansion & rest' },
  
  // 5.3 Workplace & Career Portals
  { id: 'jobs', label: 'WORKNET // Federal Access', category: 'Workplace Portals', icon: Briefcase, color: 'text-[#E5C370]', border: 'border-[#E5C370]/50', desc: 'Centralized federal work access across DGA, Faith Medical, Finance & Archives' },
  { id: 'comms', label: 'COMMS // Institutional Network', category: 'Workplace Portals', icon: MessageSquare, color: 'text-[#4CD6C4]', border: 'border-[#4CD6C4]/50', desc: 'Dual-pane instant messaging mesh & encrypted Cyacademy/Career inbox' },
  { id: 'finance', label: 'ORYN // Treasury & Crypto Ledger', category: 'Workplace Portals', icon: Landmark, color: 'text-[#E5C370]', border: 'border-[#E5C370]/50', desc: 'Sovereign Treasury vault, dual currency audit & live Blockchair PoW crypto telemetry' },
  
  // 5.3 Civic Subsystems & Notice Boards
  { id: 'board', label: 'CHRONICLE // Notice Board', category: 'Civic Subsystems', icon: Bookmark, color: 'text-[#6EC087]', border: 'border-[#6EC087]/50', desc: 'Central notice board, active quests, missions, adventures & lore codices' },
  { id: 'pulse', label: 'PULSE // Faction Telemetry', category: 'Civic Subsystems', icon: Radio, color: 'text-[#FFE2F9]', border: 'border-[#FFE2F9]/50', desc: 'Faction matrix tracker, regional announcements & social broadcast feed' },
  
  // 5.3 Public Versenet Websites & Navigation
  { id: 'browser', label: 'VERSENET // Browser Terminal', category: 'Versenet Web', icon: Globe, color: 'text-[#8FA2E6]', border: 'border-[#8FA2E6]/50', desc: 'Public website network: CIVINET, QUESTNOTICE, Faith Med, DGA & Archives' },
  
  // Storage, Security & Utility
  { id: 'spellforge', label: 'SpellForge Protocol Matrix', category: 'Security & Tools', icon: Sparkles, color: 'text-[#EDE7FF]', border: 'border-[#EDE7FF]/50', desc: 'Elemental protocol synthesis, reality stabilization & firewall weaving' },
  { id: 'process', label: 'Process Monitor (PRISM)', category: 'Security & Tools', icon: Cpu, color: 'text-[#D5E2F5]', border: 'border-[#7B9CC4]/50', desc: 'Kernel thread inspector, origin tracer & PRISM corruption isolation' },
  { id: 'terminal', label: 'System Terminal', category: 'Security & Tools', icon: Terminal, color: 'text-[#4CD6C4]', border: 'border-[#4CD6C4]/50', desc: 'Command line execution shell & direct live SQL query engine' },
  { id: 'files', label: 'File Explorer', category: 'Storage & Registry', icon: Folder, color: 'text-[#FBE6AB]', border: 'border-[#E5C370]/50', desc: 'Local documents, Purge archives, canonical file types & map rasters' },
  { id: 'lore', label: 'Lore Explorer', category: 'Storage & Registry', icon: BookOpen, color: 'text-[#EDE7FF]', border: 'border-[#8FA2E6]/50', desc: 'Local lore database — factions, regions, and character registries' },
  { id: 'settings', label: 'System Settings', category: 'Storage & Registry', icon: Settings, color: 'text-[#D5E2F5]', border: 'border-[#7B9CC4]/50', desc: 'Theme personalization, sound synthesizer & OS preferences' },
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
      {/* Luminous Ambient Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#142850]/75 backdrop-blur-xl transition-opacity"
      />

      {/* ─── 4.1 NOVA GLASS LAUNCHER CONTAINER ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="relative z-10 w-full max-w-2xl bg-[#1E3D75]/92 backdrop-blur-2xl border border-white/30 shadow-[0_24px_80px_rgba(12,25,54,0.75),0_0_35px_rgba(229,195,112,0.25)] rounded-2xl overflow-hidden font-ui text-[#FFFFFF] flex flex-col max-h-[580px]"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/15 bg-[#142850]/85 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-[#E5C370]" />
              <span className="text-[11px] font-display font-bold tracking-[0.18em] text-[#FBE6AB] uppercase">
                MIRAVERSEOSX // 5.3 LAYERED INTERFACE GRID
              </span>
            </div>
            
            {/* Dual Currency Badge in Launcher */}
            <div className="flex items-center gap-3 font-ui text-xs">
              <span className="text-[#E5C370] font-bold">{player?.credits ?? 500} ₢ CREDITS</span>
              <span className="text-[#4CD6C4] font-bold">{player?.bits ?? 25} ◈ BITS</span>
              <button
                onClick={onClose}
                className="text-[#D5E2F5] hover:text-white transition p-1 rounded-lg hover:bg-white/20 ml-2"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Search Bar with Starlight Gold Focus Ring */}
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3.5 text-[#D5E2F5]" />
            <input
              type="text"
              placeholder="Search applications, protocols, and services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#142850]/80 border border-[#315D9E] text-xs text-[#FFFFFF] placeholder-[#D5E2F5]/70 font-ui focus:outline-none focus:border-[#E5C370] focus:ring-1 focus:ring-[#E5C370]/60 transition"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-ui scrollbar-none pt-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (soundEnabled) SoundFX.playSnap();
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#E5C370] via-[#F5D378] to-[#315D9E] text-[#0E1A33] font-bold shadow-xs border border-white/40'
                    : 'text-[#D5E2F5] hover:text-white hover:bg-[#315D9E]/50'
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
                className="p-3 rounded-xl bg-[#24467D]/40 hover:bg-[#315D9E]/70 border border-white/20 hover:border-[#E5C370]/60 text-left transition-all flex items-center justify-between group active:scale-[0.98] hover:-translate-y-0.5 shadow-cosmic-low"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[#142850]/85 border ${app.border} text-white group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon size={18} className={app.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#FFFFFF] group-hover:text-[#FBE6AB] truncate">
                        {app.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#D5E2F5]/90 truncate mt-0.5 leading-normal">
                      {app.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
