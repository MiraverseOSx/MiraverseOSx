import React, { useState } from 'react';
import { 
  Pin, 
  CheckSquare, 
  Square, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  ShieldAlert, 
  Terminal, 
  Sparkles, 
  Clock, 
  Layers,
  FolderGit2
} from 'lucide-react';
import { SoundFX } from '../utils/audio';
import { useSystemStore } from '../store/useSystemStore';
import { useOSStore } from '../store/useOSStore';

interface NoticeItem {
  id: string;
  category: 'tasks' | 'quests' | 'missions' | 'adventures' | 'journey';
  title: string;
  description: string;
  priority: 'Normal' | 'Elevated' | 'Critical' | 'Archival';
  isPinned?: boolean;
  completed: boolean;
  tag: string;
  rewardXP?: number;
  rewardCredits?: number;
  rewardBits?: number;
}

export default function NoticeBoardApp() {
  const { soundEnabled } = useSystemStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'tasks' | 'quests' | 'missions' | 'adventures' | 'journey'>('all');
  
  const addXP = useOSStore((s) => s.addXP);
  const addCredits = useOSStore((s) => s.addCredits);
  const addBits = useOSStore((s) => s.addBits);
  const player = useOSStore((s) => s.gameplay.player);

  // Initial Aureline Systems Notice Data based on your lore specification
  const [notices, setNotices] = useState<NoticeItem[]>([
    {
      id: 'n-01',
      category: 'missions',
      title: 'Aureline Civic Onboarding Registration',
      description: 'Complete provisional resident intake forms via .osform and confirm Faith Medical portal synchronization.',
      priority: 'Critical',
      isPinned: true,
      completed: true,
      tag: 'DGA-01',
      rewardXP: 100,
      rewardCredits: 150,
      rewardBits: 0,
    },
    {
      id: 'n-02',
      category: 'quests',
      title: 'Investigate Old Factory Ward Anomalies',
      description: 'Trace erratic background process signatures near the Supercomputer lower levels for AETHERCORE file remnants.',
      priority: 'Elevated',
      isPinned: true,
      completed: false,
      tag: 'PRISM-WARN',
      rewardXP: 250,
      rewardCredits: 300,
      rewardBits: 2,
    },
    {
      id: 'n-03',
      category: 'tasks',
      title: 'Starter House Room Calibration',
      description: 'Unpack starter assignment box, configure terminal dock, and inspect wall port integrity in residential sector.',
      priority: 'Normal',
      isPinned: false,
      completed: false,
      tag: 'RES-04',
      rewardXP: 50,
      rewardCredits: 75,
      rewardBits: 0,
    },
    {
      id: 'n-04',
      category: 'adventures',
      title: 'Founding Day Protocol: March 6 Archive Unlock',
      description: 'Prepare ceremonial decryption keys for Maeryn Seraphima historical records across district mainframes.',
      priority: 'Archival',
      isPinned: true,
      completed: false,
      tag: 'ORYNVELL',
      rewardXP: 500,
      rewardCredits: 600,
      rewardBits: 5,
    },
    {
      id: 'n-05',
      category: 'journey',
      title: 'Lightborn Lineage Discovery Path',
      description: 'Cross-reference diagnostic aura reports with restricted royal archives to uncover your true inheritance.',
      priority: 'Critical',
      isPinned: false,
      completed: false,
      tag: 'VEIL-CORE',
      rewardXP: 1000,
      rewardCredits: 1200,
      rewardBits: 10,
    },
    {
      id: 'n-06',
      category: 'tasks',
      title: 'Faith Medical Aura Thermal Scan',
      description: 'Schedule routine flux stability check at faithmed.aure to prevent Veilwilt symptom onset.',
      priority: 'Normal',
      isPinned: false,
      completed: true,
      tag: 'HEALTH',
      rewardXP: 75,
      rewardCredits: 100,
      rewardBits: 0,
    }
  ]);

  const toggleNoticeCompletion = (id: string) => {
    if (soundEnabled) SoundFX.playButtonTap();
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextState = !n.completed;
          if (nextState) {
            if (n.rewardXP) addXP(n.rewardXP);
            if (n.rewardCredits) addCredits(n.rewardCredits);
            if (n.rewardBits) addBits(n.rewardBits);
            SoundFX.playSuccess();
          }
          return { ...n, completed: nextState };
        }
        return n;
      })
    );
  };

  const filteredNotices = activeCategory === 'all' 
    ? notices 
    : notices.filter(n => n.category === activeCategory);

  const pinnedNotices = notices.filter(n => n.isPinned && !n.completed);

  return (
    <div className="flex h-full bg-[#0A1026]/90 backdrop-blur-xl text-[#F8F6EE] font-ui select-none overflow-hidden rounded-none border border-white/10 shadow-2xl">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`bg-[#142B52]/80 backdrop-blur-xl text-[#F8F6EE] transition-all duration-300 flex flex-col justify-between border-r border-white/10 z-10 ${
          sidebarOpen ? 'w-56 p-3' : 'w-14 p-2 items-center'
        }`}
      >
        <div className="flex flex-col gap-3 w-full">
          {/* Sidebar Header / Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            {sidebarOpen && (
              <span className="text-[10px] font-display font-bold tracking-widest text-[#D4B06A] uppercase">
                Aureline Directories
              </span>
            )}
            <button
              onClick={() => {
                if (soundEnabled) SoundFX.playSnap();
                setSidebarOpen(!sidebarOpen);
              }}
              className="p-1 hover:bg-white/10 text-[#C7D2E0] hover:text-white rounded-lg transition-colors"
              title="Toggle Sidebar"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Category Buttons */}
          <nav className="flex flex-col gap-1">
            {[
              { id: 'all', label: 'All Protocols', icon: <Layers className="w-3.5 h-3.5 text-[#D4B06A]" /> },
              { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-3.5 h-3.5 text-[#3EB9A8]" /> },
              { id: 'quests', label: 'Quests', icon: <Compass className="w-3.5 h-3.5 text-[#758AD1]" /> },
              { id: 'missions', label: 'Missions', icon: <Terminal className="w-3.5 h-3.5 text-[#E1DAFB]" /> },
              { id: 'adventures', label: 'Adventures', icon: <Sparkles className="w-3.5 h-3.5 text-[#ECC86C]" /> },
              { id: 'journey', label: 'The Journey', icon: <FolderGit2 className="w-3.5 h-3.5 text-[#FFD2F4]" /> },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (soundEnabled) SoundFX.playSnap();
                  setActiveCategory(cat.id as any);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 text-xs transition-all rounded-lg border ${
                  activeCategory === cat.id
                    ? 'bg-[#254A7A] text-[#F0D79A] border-[#D4B06A]/40 font-bold shadow-xs'
                    : 'bg-transparent text-[#C7D2E0] border-transparent hover:bg-[#254A7A]/30 hover:text-white'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
                title={cat.label}
              >
                <div className="shrink-0">{cat.icon}</div>
                {sidebarOpen && <span className="truncate">{cat.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {sidebarOpen && (
          <div className="p-2 bg-[#0A1026]/70 border border-white/10 rounded-lg text-[10px] font-ui text-[#C7D2E0]">
            SYS_STATUS: <span className="text-[#3EB9A8] font-bold">ONLINE</span>
          </div>
        )}
      </aside>

      {/* 2. MAIN NOTICE BOARD CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto p-4 bg-[#0A1026]/50">
        
        {/* Header Banner */}
        <div className="mb-4 bg-[#142B52]/80 backdrop-blur-xl p-4 border border-white/10 rounded-xl shadow-cosmic-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-ui uppercase bg-[#254A7A] text-[#F0D79A] border border-[#D4B06A]/30 px-2 py-0.5 rounded font-bold">
                CHRONICLE (§5.3) // CIVIC NOTICE BOARD & QUEST ENGINE
              </span>
              <span className="text-[10px] font-ui text-[#C7D2E0]">// Aureline Civic Grid</span>
            </div>
            <h1 className="text-base font-display font-bold text-[#F8F6EE]">
              Synchronized Life, Missions & Quests Directory
            </h1>
          </div>
          <div className="flex items-center gap-4 text-right font-ui text-xs text-[#C7D2E0]">
            <div>
              <div className="text-[10px] text-[#C7D2E0]/70">CREDITS</div>
              <div className="font-bold text-[#D4B06A]">{player?.credits ?? 500} ₢</div>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div>
              <div className="text-[10px] text-[#C7D2E0]/70">BITS</div>
              <div className="font-bold text-[#3EB9A8]">{player?.bits ?? 25} ◈</div>
            </div>
          </div>
        </div>

        {/* ASYMMETRIC TWO-COLUMN LAYOUT WITH DIVERSITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          
          {/* LEFT DIVERSIFIED COLUMN (Main Feed - 2 cols span on large screens) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-700" />
              Primary Protocol Stream ({activeCategory.toUpperCase()})
            </h3>

            {filteredNotices.length === 0 ? (
              <div className="p-8 text-center bg-white border border-dashed border-slate-300 text-xs text-slate-400">
                No active directives found under this protocol category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredNotices.map((notice, index) => {
                  // Create visual diversity by varying card heights and background borders based on index
                  const isWideCard = index % 3 === 0;
                  return (
                    <div 
                      key={notice.id}
                      className={`bg-white p-4 border transition-all flex flex-col justify-between rounded-none shadow-2xs hover:shadow-md ${
                        notice.completed ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-slate-500'
                      } ${isWideCard ? 'sm:col-span-2 bg-gradient-to-r from-white via-white to-slate-50/50' : 'col-span-1'}`}
                    >
                      <div>
                        {/* Card Top Meta */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                            {notice.tag}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                            notice.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                            notice.priority === 'Elevated' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            notice.priority === 'Archival' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {notice.priority}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className={`text-sm font-bold text-[#2C3E50] mb-1 ${notice.completed ? 'line-through text-slate-400' : ''}`}>
                          {notice.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                          {notice.description}
                        </p>
                      </div>

                      {/* Card Footer with Status Toggle */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => toggleNoticeCompletion(notice.id)}
                          className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                          {notice.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                          )}
                          <span className={notice.completed ? 'line-through text-slate-400' : ''}>
                            {notice.completed ? 'Protocol Fulfilled' : 'Mark Complete'}
                          </span>
                        </button>
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          {notice.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR COLUMN (Cute Pinned Sections & System Notices) */}
          <div className="space-y-4">
            
            {/* Pinned Priority Section */}
            <div className="bg-white border-2 border-amber-500/80 p-4 rounded-none shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-mono text-[9px] font-bold px-2 py-0.5 flex items-center gap-1">
                <Pin className="w-3 h-3 fill-slate-950" /> PINNED PRIORITY
              </div>
              
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Critical Aureline Directives
              </h3>

              <div className="space-y-2.5">
                {pinnedNotices.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No pinned notices currently requiring attention.</p>
                ) : (
                  pinnedNotices.map((pin) => (
                    <div key={pin.id} className="p-2.5 bg-amber-50/60 border border-amber-200 text-xs">
                      <div className="font-bold text-slate-900 mb-1">{pin.title}</div>
                      <p className="text-[11px] text-slate-600 leading-normal">{pin.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick System Telemetry Widget */}
            <div className="bg-slate-900 text-white p-4 rounded-none border border-slate-800 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                System Framework Status
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                  <span>Framework:</span>
                  <span className="text-emerald-400">AurelineOS v4.2</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                  <span>Veil Stability:</span>
                  <span className="text-amber-400">Nominal (94.2%)</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Tasks Completed:</span>
                  <span className="text-indigo-400">{notices.filter(n => n.completed).length} / {notices.length}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
