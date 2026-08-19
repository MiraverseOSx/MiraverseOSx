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

  // Initial Aureline Systems Notice Data
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
      title: 'Discover All 8 Regional Shrines',
      description: 'Visit Fross, Lumia, Marlowe, Brisland, Kaji, Nephele, Orynvell and Core to calibrate full environmental harmony.',
      priority: 'Archival',
      isPinned: false,
      completed: false,
      tag: 'AURA-ALL',
      rewardXP: 800,
      rewardCredits: 1000,
      rewardBits: 10,
    },
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
            if (soundEnabled) SoundFX.playSuccess();
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
    <div className="flex h-full bg-[#FAFBFD] text-slate-800 font-ui select-none overflow-hidden">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`bg-slate-50 text-slate-800 transition-all duration-300 flex flex-col justify-between border-r border-slate-200 z-10 ${
          sidebarOpen ? 'w-56 p-3' : 'w-14 p-2 items-center'
        }`}
      >
        <div className="flex flex-col gap-3 w-full">
          {/* Sidebar Header / Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            {sidebarOpen && (
              <span className="text-[10px] font-display font-bold tracking-widest text-slate-700 uppercase">
                Aureline Directories
              </span>
            )}
            <button
              onClick={() => {
                if (soundEnabled) SoundFX.playSnap();
                setSidebarOpen(!sidebarOpen);
              }}
              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
              title="Toggle Sidebar"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Category Buttons */}
          <nav className="flex flex-col gap-1">
            {[
              { id: 'all', label: 'All Protocols', icon: <Layers className="w-3.5 h-3.5 text-amber-700" /> },
              { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-3.5 h-3.5 text-emerald-700" /> },
              { id: 'quests', label: 'Quests', icon: <Compass className="w-3.5 h-3.5 text-sky-700" /> },
              { id: 'missions', label: 'Missions', icon: <Terminal className="w-3.5 h-3.5 text-indigo-700" /> },
              { id: 'adventures', label: 'Adventures', icon: <Sparkles className="w-3.5 h-3.5 text-amber-700" /> },
              { id: 'journey', label: 'The Journey', icon: <FolderGit2 className="w-3.5 h-3.5 text-rose-700" /> },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (soundEnabled) SoundFX.playSnap();
                  setActiveCategory(cat.id as any);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 text-xs transition-all rounded-lg border ${
                  activeCategory === cat.id
                    ? 'bg-white text-slate-900 border-slate-300 shadow-xs font-bold'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200/60 hover:text-slate-900'
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
          <div className="p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-ui text-slate-500 shadow-xs">
            SYS_STATUS: <span className="text-emerald-700 font-bold">ONLINE</span>
          </div>
        )}
      </aside>

      {/* 2. MAIN NOTICE BOARD CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto p-4 bg-[#FAFBFD]">
        
        {/* Header Banner */}
        <div className="mb-4 bg-white p-4 border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-ui uppercase bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-bold">
                CHRONICLE (§5.3) // CIVIC NOTICE BOARD & QUEST ENGINE
              </span>
              <span className="text-[10px] font-ui text-slate-500">// Aureline Civic Grid</span>
            </div>
            <h1 className="text-base font-display font-bold text-slate-900">
              Synchronized Life, Missions & Quests Directory
            </h1>
          </div>
          <div className="flex items-center gap-4 text-right font-ui text-xs text-slate-600">
            <div>
              <div className="text-[10px] text-slate-400">CREDITS</div>
              <div className="font-bold text-amber-800">{player?.credits ?? 500} ₢</div>
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-400">BITS</div>
              <div className="font-bold text-emerald-700">{player?.bits ?? 25} ◈</div>
            </div>
          </div>
        </div>

        {/* ASYMMETRIC TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          
          {/* LEFT DIVERSIFIED COLUMN (Main Feed) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-700" />
              Primary Protocol Stream ({activeCategory.toUpperCase()})
            </h3>
            {filteredNotices.length === 0 ? (
              <div className="p-8 text-center bg-white border border-dashed border-slate-300 text-xs text-slate-400 rounded-xl font-ui">
                No active directives found under this protocol category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredNotices.map((notice, index) => {
                  const isWideCard = index % 3 === 0;
                  return (
                    <div 
                      key={notice.id}
                      className={`p-4 border transition-all flex flex-col justify-between rounded-xl shadow-xs hover:shadow-sm ${
                        notice.completed ? 'opacity-60 border-slate-200 bg-slate-100/60' : 'border-slate-200 bg-white hover:border-slate-300'
                      } ${isWideCard ? 'sm:col-span-2 bg-gradient-to-r from-white via-slate-50 to-white' : 'col-span-1'}`}
                    >
                      <div>
                        {/* Card Top Meta */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-ui uppercase px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-bold">
                            {notice.tag}
                          </span>
                          <span className={`text-[10px] font-ui font-bold px-2 py-0.5 rounded border ${
                            notice.priority === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            notice.priority === 'Elevated' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            notice.priority === 'Archival' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {notice.priority}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className={`text-sm font-bold font-display text-slate-900 mb-1 ${notice.completed ? 'line-through text-slate-400' : ''}`}>
                          {notice.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4 font-ui">
                          {notice.description}
                        </p>
                      </div>

                      {/* Card Footer with Status Toggle */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => toggleNoticeCompletion(notice.id)}
                          className="flex items-center gap-1.5 text-xs font-ui font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          {notice.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                          )}
                          <span className={notice.completed ? 'line-through text-slate-400 font-bold' : 'font-bold'}>
                            {notice.completed ? 'Protocol Fulfilled' : 'Mark Complete'}
                          </span>
                        </button>
                        <span className="text-[10px] font-ui uppercase text-amber-800 font-semibold">
                          +{notice.rewardCredits} ₢ {notice.rewardBits ? `+ ${notice.rewardBits} ◈` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="space-y-4">
            
            {/* Pinned Priority Section */}
            <div className="bg-amber-50/70 border-2 border-amber-300 p-4 rounded-xl shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-300 text-amber-950 font-ui text-[9px] font-bold px-2 py-0.5 flex items-center gap-1 rounded-bl-lg shadow-xs">
                <Pin className="w-3 h-3 fill-amber-950" /> PINNED PRIORITY
              </div>
              
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                Critical Aureline Directives
              </h3>

              <div className="space-y-2.5">
                {pinnedNotices.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No urgent directives pinned at this cycle.</p>
                ) : (
                  pinnedNotices.map((pn) => (
                    <div 
                      key={pn.id} 
                      onClick={() => toggleNoticeCompletion(pn.id)}
                      className="p-2.5 bg-white hover:bg-amber-100/50 border border-amber-200 rounded-lg cursor-pointer transition flex items-center justify-between group shadow-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[9px] font-ui uppercase px-1.5 py-0.2 bg-amber-200 text-amber-950 font-bold rounded">
                          {pn.priority}
                        </span>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate mt-1 font-display">
                          {pn.title}
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-ui font-bold shrink-0">
                        +{pn.rewardXP} XP
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Lore & Protocol Dispatch Widget */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-xs">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-700" />
                Aureline Dispatch Advisory
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-ui">
                Civic tasks refresh at every Morning and Evening time segment shift. Ensure Biometric Clearance verification via MIRROR is active for classified assignments.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
