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
              <div className="p-8 text-center bg-[#142850]/70 border border-dashed border-white/20 text-xs text-[#D5E2F5] rounded-xl font-ui">
                No active directives found under this protocol category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredNotices.map((notice, index) => {
                  const isWideCard = index % 3 === 0;
                  return (
                    <div 
                      key={notice.id}
                      className={`p-4 border transition-all flex flex-col justify-between rounded-xl shadow-cosmic-low hover:shadow-md ${
                        notice.completed ? 'opacity-65 border-white/10 bg-[#1E3D75]/40' : 'border-white/20 bg-[#24467D]/40 hover:bg-[#315D9E]/60 hover:border-[#E5C370]/60'
                      } ${isWideCard ? 'sm:col-span-2 bg-gradient-to-r from-[#24467D]/50 via-[#315D9E]/40 to-[#24467D]/50' : 'col-span-1'}`}
                    >
                      <div>
                        {/* Card Top Meta */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-ui uppercase px-2 py-0.5 bg-[#142850]/80 text-[#FBE6AB] border border-[#E5C370]/40 rounded font-bold">
                            {notice.tag}
                          </span>
                          <span className={`text-[10px] font-ui font-bold px-2 py-0.5 rounded border ${
                            notice.priority === 'Critical' ? 'bg-rose-900/60 text-rose-200 border-rose-400/50' :
                            notice.priority === 'Elevated' ? 'bg-amber-900/60 text-[#FBE6AB] border-amber-400/50' :
                            notice.priority === 'Archival' ? 'bg-purple-900/60 text-[#EDE7FF] border-purple-400/50' :
                            'bg-[#1E3D75] text-[#D5E2F5] border-white/15'
                          }`}>
                            {notice.priority}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className={`text-sm font-bold font-display text-[#FFFFFF] mb-1 ${notice.completed ? 'line-through text-[#D5E2F5]/60' : ''}`}>
                          {notice.title}
                        </h4>
                        <p className="text-xs text-[#D5E2F5] leading-relaxed mb-4 font-ui">
                          {notice.description}
                        </p>
                      </div>

                      {/* Card Footer with Status Toggle */}
                      <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                        <button
                          onClick={() => toggleNoticeCompletion(notice.id)}
                          className="flex items-center gap-1.5 text-xs font-ui font-medium text-[#D5E2F5] hover:text-[#FFFFFF] transition-colors"
                        >
                          {notice.completed ? (
                            <CheckSquare className="w-4 h-4 text-[#4CD6C4]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#D5E2F5]/60 hover:text-white" />
                          )}
                          <span className={notice.completed ? 'line-through text-[#D5E2F5]/60 font-bold' : 'font-bold'}>
                            {notice.completed ? 'Protocol Fulfilled' : 'Mark Complete'}
                          </span>
                        </button>
                        <span className="text-[10px] font-ui uppercase text-[#FBE6AB] font-semibold">
                          +{notice.rewardCredits} ₢ {notice.rewardBits ? `+ ${notice.rewardBits} ◈` : ''}
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
            <div className="bg-[#24467D]/50 border-2 border-[#E5C370]/80 p-4 rounded-xl shadow-cosmic-std relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 bg-[#E5C370] text-[#0E1A33] font-ui text-[9px] font-bold px-2 py-0.5 flex items-center gap-1 rounded-bl-lg shadow-xs">
                <Pin className="w-3 h-3 fill-[#0E1A33]" /> PINNED PRIORITY
              </div>
              
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF] font-display mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#E5C370]" />
                Critical Aureline Directives
              </h3>

              <div className="space-y-2.5">
                {pinnedNotices.length === 0 ? (
                  <p className="text-xs text-[#D5E2F5]/70 italic">No urgent directives pinned at this cycle.</p>
                ) : (
                  pinnedNotices.map((pn) => (
                    <div 
                      key={pn.id} 
                      onClick={() => toggleNoticeCompletion(pn.id)}
                      className="p-2.5 bg-[#1E3D75]/70 hover:bg-[#315D9E]/70 border border-white/20 rounded-lg cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[9px] font-ui uppercase px-1.5 py-0.2 bg-[#E5C370] text-[#0E1A33] font-bold rounded">
                          {pn.priority}
                        </span>
                        <div className="text-xs font-bold text-[#FFFFFF] group-hover:text-[#FBE6AB] truncate mt-1 font-display">
                          {pn.title}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#4CD6C4] font-ui font-bold shrink-0">
                        +{pn.rewardXP} XP
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Lore & Protocol Dispatch Widget */}
            <div className="bg-[#142850]/80 border border-white/20 p-4 rounded-xl space-y-2 backdrop-blur-xl">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-[#FBE6AB] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#4CD6C4]" />
                Aureline Dispatch Advisory
              </h4>
              <p className="text-xs text-[#D5E2F5] leading-relaxed font-ui">
                Civic tasks refresh at every Morning and Evening time segment shift. Ensure Biometric Clearance verification via MIRROR is active for classified assignments.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
