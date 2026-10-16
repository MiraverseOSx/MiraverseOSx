'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  Microscope,
  FlaskConical,
  FileText,
  ShieldCheck,
  GraduationCap,
  Layers,
  BookOpen,
  Settings,
  UserRound,
  Terminal,
  FolderKanban,
  Scale,
  Users,
  Clock,
  Radio,
  MapPin,
  UserCheck,
  HeartPulse,
  Gavel,
  ChevronDown,
  Sparkles,
  Search,
  X,
  Send,
  Home,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import Workbench from '../components/workbench';
import { installDgaosApiInterceptor } from '../services/traceApiInterceptor';
import { traceDurableStore, SaveState } from '../services/traceDurableStore';
import TraceClosingSummaryModal from '../components/TraceClosingSummaryModal';
import { useOSStore } from '@/store/useOSStore';
import '../styles/dgaos-integrated.css';

// Ensure in-browser API interception is active
installDgaosApiInterceptor();

const PINNED_CORE_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Cases', icon: FolderOpen },
  { name: 'Evidence', icon: Package },
  { name: 'Examinations', icon: FlaskConical },
  { name: 'Reports', icon: FileText },
];

const COLLAPSIBLE_SUITES = [
  {
    title: 'Field & Scene Operations',
    items: [
      { name: 'Detective Desk', icon: FolderKanban },
      { name: 'Crime Scene (CSI)', icon: MapPin },
      { name: 'Interrogation Room', icon: UserCheck },
    ],
  },
  {
    title: 'Specialized Forensic Labs',
    items: [
      { name: 'Forensic Morgue', icon: HeartPulse },
      { name: 'Cyber Lab', icon: Terminal },
      { name: 'Laboratory', icon: Microscope },
    ],
  },
  {
    title: 'Legal, Quality & Admin',
    items: [
      { name: 'Legal & Warrants', icon: Scale },
      { name: 'Courtroom Trial', icon: Gavel },
      { name: 'Citizen Registry', icon: Users },
      { name: 'Communications', icon: Radio },
      { name: 'Quality', icon: ShieldCheck },
      { name: 'Training', icon: GraduationCap },
      { name: 'Case Builder', icon: Layers },
      { name: 'Library', icon: BookOpen },
      { name: 'Administration', icon: Settings },
      { name: 'Profile', icon: UserRound },
    ],
  },
];

const allNavItems = [...PINNED_CORE_ITEMS, ...COLLAPSIBLE_SUITES.flatMap((s) => s.items)];

interface WorkstationTab {
  id: string;
  title: string;
  view: string;
  recordId?: string | null;
  isClosable: boolean;
}

export default function TraceApp() {
  const [view, setView] = useState('Dashboard');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ saveState: SaveState; lastSaved?: string }>({
    saveState: 'saved',
  });
  const [closingSummaryOpen, setClosingSummaryOpen] = useState(false);
  const [stationMenuOpen, setStationMenuOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeStr, setTimeStr] = useState({ utc: '', local: '' });

  // Dynamic Tabs with session recovery
  const [tabs, setTabs] = useState<WorkstationTab[]>([
    { id: 'view-Dashboard', title: 'Dashboard', view: 'Dashboard', recordId: null, isClosable: false },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('view-Dashboard');

  // Transmit Modal State
  const [transmitModalOpen, setTransmitModalOpen] = useState(false);
  const [reportToTransmit, setReportToTransmit] = useState<string | null>(null);
  const [transmitting, setTransmitting] = useState(false);
  const [transmitNotice, setTransmitNotice] = useState<string | null>(null);

  // 1. Session Restoration on Mount
  useEffect(() => {
    const saved = traceDurableStore.getSession();
    if (saved) {
      if (saved.activeStation) setView(saved.activeStation);
      if (saved.selectedRecordId) setSelectedRecordId(saved.selectedRecordId);
      if (saved.openTabs && saved.openTabs.length > 0) {
        setTabs(saved.openTabs);
        setActiveTabId(saved.activeTabId || saved.openTabs[0].id);
      }
    }

    const unsubSave = traceDurableStore.subscribeSaveState(setSaveStatus);

    return () => {
      unsubSave();
    };
  }, []);

  // 2. Listen to external cross-app events (e.g. from DGAOS case link)
  useEffect(() => {
    const handleOpenCase = (e: Event) => {
      const customEvent = e as CustomEvent<{ caseId: string; examId?: string }>;
      if (customEvent.detail?.caseId) {
        navigate('Cases', customEvent.detail.caseId);
      }
    };
    window.addEventListener('trace:open-case', handleOpenCase);
    return () => window.removeEventListener('trace:open-case', handleOpenCase);
  }, []);

  // 3. Time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr({
        utc: now.toISOString().substring(11, 19) + ' UTC',
        local: now.toLocaleTimeString('en-US', { hour12: false }),
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Save session context on changes
  useEffect(() => {
    traceDurableStore.updateSession({
      activeStation: view,
      selectedRecordId,
      openTabs: tabs,
      activeTabId,
    });
  }, [view, selectedRecordId, tabs, activeTabId]);

  function navigate(viewName: string, recordId?: string | null) {
    setView(viewName);
    setSelectedRecordId(recordId || null);

    const tabId = recordId ? `record-${recordId}` : `view-${viewName}`;
    const tabTitle = recordId ? `${recordId}` : viewName;

    setTabs((prev) => {
      const existing = prev.find((t) => t.id === tabId);
      if (existing) return prev;
      return [
        ...prev,
        {
          id: tabId,
          title: tabTitle,
          view: viewName,
          recordId: recordId || null,
          isClosable: tabId !== 'view-Dashboard',
        },
      ];
    });
    setActiveTabId(tabId);
    setQuickSearchOpen(false);
  }

  function selectTab(tab: WorkstationTab) {
    setActiveTabId(tab.id);
    setView(tab.view);
    setSelectedRecordId(tab.recordId || null);
  }

  function closeTab(e: React.MouseEvent, tabId: string) {
    e.stopPropagation();
    setTabs((prev) => {
      if (prev.length <= 1) return prev;
      const nextTabs = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        const fallback = nextTabs[nextTabs.length - 1];
        setActiveTabId(fallback.id);
        setView(fallback.view);
        setSelectedRecordId(fallback.recordId || null);
      }
      return nextTabs;
    });
  }

  function handleReturnHome() {
    setView('Dashboard');
    setSelectedRecordId(null);
    setActiveTabId('view-Dashboard');
  }

  async function handleTransmitFindings(reportId: string) {
    setTransmitting(true);
    try {
      const res = await traceDurableStore.transmitFindings(reportId, 'Lead Forensic Specialist');
      setTransmitNotice(res.message);
      setTimeout(() => setTransmitNotice(null), 6000);
      setTransmitModalOpen(false);
    } catch (err) {
      setTransmitNotice(err instanceof Error ? err.message : 'Transmission failed.');
    } finally {
      setTransmitting(false);
    }
  }

  const filteredQuickNav = allNavItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dga-workstation-root flex-1 flex flex-col h-full w-full overflow-hidden bg-[#ebe9f3] text-[#0f0d1a] font-sans select-none relative">
      {/* ─── 1. TOP COMMAND STRIP (Tactical Agency Toolbar) ─── */}
      <header className="h-[42px] min-h-[42px] max-h-[42px] bg-[#1e1f2b] border-b border-[#2e3042] px-3 flex items-center justify-between gap-3 sticky top-0 z-40 shadow-sm text-white select-none">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/50 to-transparent" />

        {/* Left: Station Dropdown + Home Action */}
        <div className="flex items-center gap-2">
          {/* Laboratory Home Action */}
          <button
            type="button"
            onClick={handleReturnHome}
            className="h-[28px] flex items-center gap-1.5 px-2.5 bg-[#2a2c3d] hover:bg-[#34374c] border border-[#383a50] rounded text-white transition cursor-pointer text-[11px] font-bold"
            title="Return to Laboratory Home"
          >
            <Home size={13} className="text-[#c1b4d9]" />
            <span className="hidden sm:inline">HOME</span>
          </button>

          {/* Station Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setStationMenuOpen(!stationMenuOpen)}
              className="h-[28px] flex items-center gap-1.5 px-2.5 bg-[#2a2c3d] hover:bg-[#34374c] border border-[#383a50] rounded text-white transition cursor-pointer text-[11px] font-bold"
              title="Select Forensic Station"
            >
              <FlaskConical size={13} className="text-[#c1b4d9]" />
              <span className="font-semibold tracking-wide uppercase">LAB STATIONS</span>
              <ChevronDown size={12} className="text-[#a4a2c4]" />
            </button>

            {stationMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStationMenuOpen(false)} />
                <div className="absolute left-0 mt-2 w-96 max-h-[80vh] overflow-y-auto bg-[#1e1f2b] border border-[#383a50] rounded shadow-2xl z-50 p-3 space-y-3 text-white">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2e3042]">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <FlaskConical size={14} className="text-[#c1b4d9]" />
                      <span>TRACE FORENSIC STATIONS (20+)</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#a4a2c4]">DGAOS EYES/SHIELD</span>
                  </div>

                  {COLLAPSIBLE_SUITES.map((suite) => (
                    <div key={suite.title} className="space-y-1">
                      <div className="text-[10px] font-mono text-[#a4a2c4] uppercase tracking-wider px-1">
                        {suite.title}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {suite.items.map((item) => {
                          const Icon = item.icon;
                          const active = view === item.name;
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => {
                                navigate(item.name);
                                setStationMenuOpen(false);
                              }}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition cursor-pointer ${
                                active
                                  ? 'bg-[#a855f7] text-white font-bold'
                                  : 'text-slate-300 hover:bg-[#2e3042] hover:text-white'
                              }`}
                            >
                              <Icon size={13} className={active ? 'text-white' : 'text-[#a78bfa]'} />
                              <span className="truncate">{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Active Station Label */}
          <span className="text-[11px] font-mono text-purple-300 hidden md:inline">
            // {view} {selectedRecordId ? `· ${selectedRecordId}` : ''}
          </span>
        </div>

        {/* Right: Autosave Indicator, Summary Button, Clock */}
        <div className="flex items-center gap-2 text-xs">
          {/* Honest Autosave Indicator (Directive §4) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2a2c3d] border border-[#383a50] text-[11px] font-mono">
            {saveStatus.saveState === 'saving' ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-300">Saving…</span>
              </>
            ) : saveStatus.saveState === 'saved' ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-300">All changes saved</span>
              </>
            ) : saveStatus.saveState === 'error' ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span className="text-rose-300">Save failed</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-300">Unsaved changes</span>
              </>
            )}
          </div>

          {/* Closing Summary Trigger */}
          <button
            type="button"
            onClick={() => setClosingSummaryOpen(true)}
            className="h-[28px] px-2 bg-[#2a2c3d] hover:bg-[#34374c] border border-[#383a50] rounded text-slate-300 hover:text-white text-[11px] font-mono transition"
            title="View Outstanding Forensic Work & Drafts"
          >
            SUMMARY
          </button>

          {/* Time Display */}
          <div className="font-mono text-[10px] text-slate-400 hidden lg:block">
            {timeStr.utc}
          </div>
        </div>
      </header>

      {/* ─── 2. DYNAMIC WORKSTATION TABS BAR ─── */}
      <div className="h-[34px] min-h-[34px] bg-[#181926] border-b border-[#2e3042] px-2 flex items-center gap-1 overflow-x-auto scrollbar-none select-none text-white">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => selectTab(tab)}
              className={`group flex items-center gap-2 px-3 py-1 text-xs rounded-t font-medium transition cursor-pointer border-t border-x ${
                isActive
                  ? 'bg-[#2a2c3d] border-[#383a50] text-purple-200'
                  : 'bg-[#141520] border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1f2030]'
              }`}
            >
              <span className="truncate max-w-[140px]">{tab.title}</span>
              {tab.isClosable && (
                <button
                  type="button"
                  onClick={(e) => closeTab(e, tab.id)}
                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
                  title="Close Tab"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── 3. NOTICES / TOASTS ─── */}
      {transmitNotice && (
        <div className="bg-purple-900 border-b border-purple-600 px-4 py-2 text-xs text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-300" />
            <span>{transmitNotice}</span>
          </div>
          <button onClick={() => setTransmitNotice(null)} className="text-purple-300 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ─── 4. MAIN FORENSIC WORKBENCH BODY ─── */}
      <div className="flex-1 overflow-auto w-full relative">
        <Workbench
          view={view}
          navigate={navigate}
          selectedId={selectedRecordId}
          onSelectRecord={setSelectedRecordId}
        />
      </div>

      {/* ─── 5. OPTIONAL CLOSING SUMMARY MODAL ─── */}
      <TraceClosingSummaryModal
        isOpen={closingSummaryOpen}
        onClose={() => setClosingSummaryOpen(false)}
        onConfirmExit={() => {
          setClosingSummaryOpen(false);
          useOSStore.getState().toggleApp('traceForensics');
        }}
        onViewPendingWork={(recordId, stationView) => {
          navigate(stationView, recordId);
        }}
      />
    </div>
  );
}
