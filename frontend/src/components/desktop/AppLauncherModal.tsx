import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Bookmark, Cpu, Home, Sparkles, Globe, Mail, 
  MessageSquare, UserCheck, Radio, Folder, BookOpen, Terminal, 
  Settings, Search, X, Star, Landmark, Play, Shield, Activity,
  ArrowRight, Check, Zap, Layers
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { APPS } from '../../apps/contents';
import { SoundFX } from '../../utils/audio';
import { useSystemStore } from '../../store/useSystemStore';

export interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ProtocolItem {
  id: string;
  code: string;
  name: string;
  label?: string;
  sector: string;
  icon: any;
  clearance: string;
  aetherTrace: string;
  flux: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

export const PROTOCOLS: ProtocolItem[] = [
  {
    id: 'passport',
    code: 'MIRROR',
    name: 'MIRROR // Citizen Matrix',
    label: 'MIRROR // Citizen Matrix',
    sector: 'Aureline Civic Registry',
    icon: UserCheck,
    clearance: 'Level 1 Citizen',
    aetherTrace: 'AT-0x0114',
    flux: '18.4 MHz',
    desc: 'Identity initialization, citizen record, bio-aura calibration, pronouns, wardrobe, and passport credentials.',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300'
  },
  {
    id: 'housing',
    code: 'HOMECRAFT',
    name: 'HOMECRAFT // Residential',
    sector: 'Cycademy Student Quarters',
    icon: Home,
    clearance: 'Resident Clearance',
    aetherTrace: 'AT-0x0289',
    flux: '32.1 MHz',
    desc: 'Residential grid editor, dorm customization, furniture layout, room expansion, and restorative rest hub.',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300'
  },
  {
    id: 'jobs',
    code: 'WORKNET',
    name: 'WORKNET // Federal Access',
    sector: 'Federal Career Network',
    icon: Briefcase,
    clearance: 'Contractor Level 1',
    aetherTrace: 'AT-0x0340',
    flux: '24.6 MHz',
    desc: 'Centralized federal work access across DGA, Faith Medical Clinic, Sovereign Treasury & Historic Archives.',
    color: 'text-amber-900',
    bg: 'bg-amber-100/60',
    border: 'border-amber-400'
  },
  {
    id: 'comms',
    code: 'COMMS',
    name: 'COMMS // Institutional Network',
    sector: 'Institutional Comms Grid',
    icon: MessageSquare,
    clearance: 'Encrypted Netmesh',
    aetherTrace: 'AT-0x0412',
    flux: '28.0 MHz',
    desc: 'Dual-pane instant messaging mesh, encrypted Cycademy student channels, and priority career dispatches.',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300'
  },
  {
    id: 'finance',
    code: 'ORYN Vault',
    name: 'ORYN // Treasury & Crypto Ledger',
    sector: 'First Orynvell Bank',
    clearance: 'High Council Audited',
    aetherTrace: 'AT-0x0508',
    flux: '21.5 MHz',
    desc: 'Sovereign Treasury vault, dual currency stipend audit, and live Blockchair PoW crypto telemetry feed.',
    color: 'text-amber-950',
    bg: 'bg-amber-200/60',
    border: 'border-amber-400'
  },
  {
    id: 'board',
    code: 'CHRONICLE',
    name: 'CHRONICLE // Notice Board',
    sector: 'Meridion Notice Stream',
    clearance: 'Civic Standard',
    aetherTrace: 'AT-0x0619',
    flux: '19.8 MHz',
    desc: 'Public municipal bulletin board, active quests, community errands, adventure dossiers & lore codices.',
    color: 'text-teal-800',
    bg: 'bg-teal-50',
    border: 'border-teal-300'
  },
  {
    id: 'browser',
    code: 'VERSENET',
    name: 'VERSENET // Web Terminal',
    sector: 'Versenet Quantum Web',
    clearance: 'Unrestricted Gateway',
    aetherTrace: 'AT-0x0899',
    flux: '48.2 MHz',
    desc: 'Public quantum web gateway: CIVINET, QUESTNOTICE, Faith Medical Intranet, DGA & Royal Archives.',
    color: 'text-sky-800',
    bg: 'bg-sky-50',
    border: 'border-sky-300'
  },
  {
    id: 'process',
    code: 'SYSTEM',
    name: 'SYSTEM // Kernel & PRISM Monitor',
    sector: 'PRISM Core Kernel',
    clearance: 'Root Shell Privilege',
    aetherTrace: 'AT-0x0001',
    flux: '14.2 MHz',
    desc: 'Deep kernel thread inspector, origin trace diagnostics, resource telemetry, and PRISM corruption isolation.',
    color: 'text-slate-800',
    bg: 'bg-slate-100',
    border: 'border-slate-300'
  },
  {
    id: 'pulse',
    code: 'PULSE',
    name: 'PULSE // Faction Telemetry',
    sector: 'Aureline Broadcast Array',
    clearance: 'Observer Clearance',
    aetherTrace: 'AT-0x0732',
    flux: '22.0 MHz',
    desc: 'Faction matrix tracker, regional announcements, influence vectors, and public broadcast stream.',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-300'
  },
  {
    id: 'vitals',
    code: 'VITALS',
    name: 'VITALS // Bio-Aura Matrix',
    sector: 'Faith Medical Telemetry',
    clearance: 'Patient Baseline',
    aetherTrace: 'AT-0x0910',
    flux: '37.2 MHz',
    desc: 'Real-time bio-aura integrity diagnostics, condition tracking, Veil exposure analysis, and recovery status.',
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-300'
  },
  {
    id: 'lore',
    code: 'ATLAS',
    name: 'ATLAS // Royal Historic Archive',
    sector: 'Royal Historic Society',
    clearance: 'Public Encyclopedia',
    aetherTrace: 'AT-0x1120',
    flux: '16.5 MHz',
    desc: 'Local encyclopedic lore repository: faction histories, world regions, NPC vectors, and historical treaties.',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300'
  },
  {
    id: 'files',
    code: 'VAULT',
    name: 'VAULT // Encrypted Storage',
    sector: 'Local Storage Controller',
    clearance: 'File System Standard',
    aetherTrace: 'AT-0x1044',
    flux: '20.1 MHz',
    desc: 'Local file system, confidential Purge documents, canonical file types, audio logs, and map rasters.',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300'
  },
  {
    id: 'spellforge',
    code: 'NEXLINK',
    name: 'NEXLINK // SpellForge Matrix',
    sector: 'Cycademy Arcane Lab',
    clearance: 'Arcane Weaver',
    aetherTrace: 'AT-0x0921',
    flux: '36.4 MHz',
    desc: 'Elemental protocol synthesis workbench, reality stabilization algorithms, and firewall rune weaving.',
    color: 'text-purple-900',
    bg: 'bg-purple-100/70',
    border: 'border-purple-300'
  },
  {
    id: 'campus',
    code: 'CAMPUS',
    name: 'CAMPUS // Cycademy Network',
    sector: 'Cycademy of Sciences',
    clearance: 'Student Enrollment',
    aetherTrace: 'AT-0x0218',
    flux: '19.4 MHz',
    desc: 'Student registry, academic faculty roster, course syllabus archives, and institutional portals.',
    color: 'text-blue-900',
    bg: 'bg-blue-50',
    border: 'border-blue-300'
  },
];

export const APPS_DIRECTORY = PROTOCOLS;

export default function AppLauncherModal({ isOpen, onClose }: AppLauncherModalProps) {
  const [selectedId, setSelectedId] = useState<string>('jobs');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleApp = useOSStore((s) => s.toggleApp);
  const windows = useOSStore((s) => s.windows || []);
  const player = useOSStore((s) => s.gameplay?.player);
  const { soundEnabled } = useSystemStore();

  const filtered = PROTOCOLS.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.sector.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  });

  const selectedProtocol = PROTOCOLS.find((p) => p.id === selectedId) || filtered[0] || PROTOCOLS[2];

  const handleLaunch = (id: string) => {
    if (soundEnabled) SoundFX.playSnap();
    const app = APPS.find((a) => a.id === id) || { id };
    toggleApp(app);
    onClose();
  };

  // Keyboard navigation: Escape to close, Enter to launch, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && selectedProtocol) {
        e.preventDefault();
        handleLaunch(selectedProtocol.id);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = filtered.findIndex((p) => p.id === selectedId);
        const nextIndex = (currentIndex + 1) % Math.max(1, filtered.length);
        setSelectedId(filtered[nextIndex]?.id || selectedId);
        if (soundEnabled) SoundFX.playSnap();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = filtered.findIndex((p) => p.id === selectedId);
        const prevIndex = (currentIndex - 1 + filtered.length) % Math.max(1, filtered.length);
        setSelectedId(filtered[prevIndex]?.id || selectedId);
        if (soundEnabled) SoundFX.playSnap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedId, selectedProtocol, soundEnabled, onClose]);

  if (!isOpen) return null;

  const validSelected = selectedProtocol || PROTOCOLS[0];
  const SelectedIcon = validSelected?.icon || Briefcase;
  const isRunning = windows.some((w: any) => w.id === validSelected?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      
      {/* ── SOLID OPAQUE DIMMED BACKDROP ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#050A18]/75 transition-opacity"
      />

      {/* ── SOLID MASTER PROTOCOL MATRIX DECK ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        transition={{ type: 'spring', damping: 26, stiffness: 350 }}
        className="relative z-10 w-full max-w-4xl bg-white border-2 border-amber-300/90 shadow-[0_25px_80px_rgba(5,15,35,0.50)] rounded-3xl overflow-hidden font-ui text-slate-800 flex flex-col max-h-[620px]"
      >
        
        {/* ── 1. TOP BAR WITH LIVE CURRENCY & EXIT ── */}
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-display font-bold tracking-[0.22em] text-slate-800 uppercase">
              MIRAVERSEOSX // PROTOCOL MATRIX
            </span>
          </div>

          <div className="flex items-center gap-2.5 font-ui text-xs">
            <span className="text-amber-950 font-bold px-3 py-1 rounded-xl bg-amber-100/90 border border-amber-300 shadow-2xs font-mono">
              [ {player?.credits?.toLocaleString() ?? '1,500'} ₢ CREDITS ]
            </span>
            <span className="text-emerald-950 font-bold px-3 py-1 rounded-xl bg-emerald-100/90 border border-emerald-300 shadow-2xs font-mono">
              [ {player?.bits?.toLocaleString() ?? '25'} ◈ BITS ]
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 transition p-1 rounded-xl hover:bg-slate-200 font-bold px-2.5"
              title="Close Matrix [Esc]"
            >
              [ ✕ ]
            </button>
          </div>
        </div>

        {/* ── 2. TWO-COLUMN MAIN DECK ── */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden bg-[#FAFBFD]">
          
          {/* ════════ LEFT COLUMN: ACTIVE DIRECTORY (7 Cols) ════════ */}
          <div className="col-span-12 md:col-span-7 border-r border-slate-200 p-5 flex flex-col overflow-hidden space-y-3">
            
            {/* Header & Quick Filter */}
            <div className="flex items-center justify-between shrink-0">
              <div className="font-display font-bold text-xs tracking-wider text-slate-800 uppercase flex items-center gap-2">
                <span>ACTIVE DIRECTORY</span>
                <span className="text-[10px] font-mono font-normal text-slate-400">({filtered.length} Protocols)</span>
              </div>
              
              <div className="relative w-44">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-7 pl-7 pr-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition font-mono"
                />
              </div>
            </div>

            {/* 3-Column Protocol Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2.5">
                {filtered.map((item) => {
                  const isSelected = item.id === selectedProtocol.id;
                  const itemRunning = windows.some((w: any) => w.id === item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        if (soundEnabled) SoundFX.playSnap();
                      }}
                      onDoubleClick={() => handleLaunch(item.id)}
                      className={`h-11 px-2.5 rounded-xl border text-left font-mono text-xs font-bold transition-all flex items-center justify-between gap-1 cursor-pointer select-none group relative ${
                        isSelected
                          ? 'bg-amber-100 text-amber-950 border-2 border-amber-500 shadow-xs ring-2 ring-amber-200'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-[10px] ${isSelected ? 'text-amber-700' : 'text-slate-400 group-hover:text-amber-600'}`}>
                          {isSelected ? '[*]' : '[✦]'}
                        </span>
                        <span className="truncate tracking-tight">{item.code}</span>
                      </div>

                      {/* Active / Running or Selected Indicator */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {itemRunning && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Running" />
                        )}
                        {isSelected && (
                          <span className="text-amber-700 text-xs font-bold">◄</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-xs font-mono text-slate-400">
                  No protocols match "{searchQuery}".
                </div>
              )}
            </div>
          </div>

          {/* ════════ RIGHT COLUMN: DOSSIER & PROTOCOL INSPECTOR (5 Cols) ════════ */}
          <div className="col-span-12 md:col-span-5 p-5 bg-white flex flex-col justify-between overflow-y-auto space-y-4">
            
            <div className="space-y-4">
              {/* Header Title */}
              <div className="font-display font-bold text-xs tracking-wider text-slate-800 uppercase flex items-center justify-between border-b border-slate-100 pb-2">
                <span>DOSSIER & PROTOCOL INSPECTOR</span>
                <span className="text-[10px] font-mono text-slate-400">{validSelected.aetherTrace}</span>
              </div>

              {/* Icon & Protocol Title Header */}
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-2xl ${validSelected.bg} ${validSelected.color} border-2 ${validSelected.border} flex items-center justify-center font-bold shadow-xs shrink-0`}>
                  {SelectedIcon && <SelectedIcon size={24} />}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-sm text-slate-900 truncate">
                    {validSelected.name}
                  </h2>
                  <p className="text-[11px] font-mono text-slate-500 truncate">
                    Sector: {validSelected.sector}
                  </p>
                </div>
              </div>

              {/* SPECIFICATIONS Box */}
              <div className="p-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl space-y-2 font-mono text-xs shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1">
                  SPECIFICATIONS
                </div>
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clearance:</span>
                    <span className="font-bold text-slate-800">{validSelected.clearance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aether-Trace:</span>
                    <span className="font-bold text-amber-700">{validSelected.aetherTrace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resonance Flux:</span>
                    <span className="font-bold text-indigo-700">{validSelected.flux}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">State:</span>
                    <span className={`font-bold ${isRunning ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {isRunning ? 'Active / In Execution' : 'Ready'}
                    </span>
                  </div>
                </div>
              </div>

              {/* FUNCTIONAL OVERVIEW */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                  FUNCTIONAL OVERVIEW
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-[#FAFBFD] p-3 rounded-xl border border-slate-200">
                  {validSelected.desc}
                </p>
              </div>
            </div>

            {/* INITIALIZE PROTOCOL ACTION BUTTON */}
            <div className="pt-2">
              <button
                onClick={() => handleLaunch(validSelected.id)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 hover:from-amber-400 hover:to-amber-500 border border-amber-400/90 text-amber-950 font-display font-bold text-xs uppercase tracking-widest shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>✦  INITIALIZE PROTOCOL  ✦</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. BOTTOM FOOTER BAR ── */}
        <div className="px-5 py-2.5 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
          <span className="text-slate-500 truncate">
            * Layout dynamically flows and scales to fit newly acquired protocols
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-700">AETHERCORE LINK: STABLE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
