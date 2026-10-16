'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Radio,
  FileText,
  Lock,
  Beaker,
  Globe,
  Database,
  Terminal,
  ExternalLink,
  ChevronRight,
  Cpu,
  Clock,
  CheckCircle2,
  Filter,
  Plus,
  ArrowUpRight,
  Check,
  Send,
  FolderLock,
  CheckSquare,
  Calendar,
  Phone,
  Landmark,
  Fingerprint
} from 'lucide-react';
import {
  DGACase,
  DgaAlert,
  DGAAgentProfile,
  AgencyActivityItem,
  ScheduledEvent,
  DGACommunication,
  Task
} from '@/lib/dga-types';
import { calculateCaseProgress } from '@/lib/dga-case-engine';
import { updateDGATask } from '@/lib/dga-store';
import { DgaTaskDetailModal } from './work-management/dga-task-detail-modal';

interface DgaDashboardProps {
  cases: DGACase[];
  alerts: DgaAlert[];
  profile: DGAAgentProfile;
  activityFeed?: AgencyActivityItem[];
  scheduledEvents?: ScheduledEvent[];
  communications?: DGACommunication[];
  onNavigateTab: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
  onLaunchTrace: () => void;
  onOpenBlackout?: () => void;
  onDismissAlert: (alertId: string) => void;
}

export function DgaDashboard({
  cases,
  alerts,
  profile,
  activityFeed = [],
  scheduledEvents = [],
  communications = [],
  onNavigateTab,
  onSelectCase,
  onLaunchTrace,
  onOpenBlackout,
  onDismissAlert
}: DgaDashboardProps) {
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'ROUTINE'>('ALL');
  const [workTab, setWorkTab] = useState<'TODAY' | 'TASKS' | 'DIRECTIVES' | 'WAITING' | 'DEADLINES'>('TODAY');
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);

  const activeCases = cases.filter((c) => c.status === 'Active');
  const waitingCases = cases.filter((c) => c.status === 'Awaiting Acceptance');
  const criticalCases = activeCases.filter((c) => c.priority === 'Critical');

  const filteredCases = activeCases.filter((c) => {
    if (priorityFilter === 'CRITICAL') return c.priority === 'Critical';
    if (priorityFilter === 'HIGH') return c.priority === 'High';
    if (priorityFilter === 'ROUTINE') return c.priority === 'Routine' || c.priority === 'Priority';
    return true;
  });

  // Toggle task completion interactively
  const handleToggleTask = (caseId: string, taskId: string, isCurrentlyCompleted: boolean) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyCompleted) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });

    if (caseId && caseId !== 'CORE') {
      void updateDGATask(caseId, taskId, {
        completed: !isCurrentlyCompleted,
        status: !isCurrentlyCompleted ? 'completed' : 'in_progress',
        completedAt: !isCurrentlyCompleted ? new Date().toISOString() : undefined
      });
    }
  };

  // Compile tasks for "My Work"
  const allTasks = useMemo(() => {
    const list: Array<{
      id: string;
      caseId: string;
      caseCode: string;
      title: string;
      timeStr: string;
      priority: 'Critical' | 'High' | 'Routine' | 'Priority';
      completed: boolean;
      phase?: string;
      isWaiting?: boolean;
      system: string;
    }> = [];

    // Map tasks only from active cases
    activeCases.forEach((c) => {
      (c.tasks || []).forEach((t, idx) => {
        const isCompleted = completedTaskIds.has(t.id) || t.completed;
        const timeOffset = idx * 45 + 15;
        const hour = Math.floor(9 + timeOffset / 60);
        const minute = (timeOffset % 60).toString().padStart(2, '0');
        const isWaiting = t.phase === 'Forensic Analysis' || t.title.toLowerCase().includes('trace') || t.title.toLowerCase().includes('cross-reference');

        list.push({
          id: t.id,
          caseId: c.id,
          caseCode: c.id,
          title: t.title,
          timeStr: `${hour.toString().padStart(2, '0')}:${minute}`,
          priority: t.priority || c.priority,
          completed: isCompleted,
          phase: t.phase,
          isWaiting,
          system: c.leadSystem
        });
      });
    });

    return list;
  }, [activeCases, completedTaskIds]);

  // Filter tasks based on current My Work sub-tab
  const displayedWorkTasks = useMemo(() => {
    switch (workTab) {
      case 'TODAY':
        return allTasks.slice(0, 6);
      case 'TASKS':
        return allTasks;
      case 'DIRECTIVES':
        return allTasks.filter((t) => t.priority === 'Critical' || t.priority === 'High');
      case 'WAITING':
        return allTasks.filter((t) => t.isWaiting || t.phase === 'Forensic Analysis');
      case 'DEADLINES':
        return allTasks.filter((t) => t.priority === 'Critical' || t.timeStr <= '11:00');
      default:
        return allTasks;
    }
  }, [allTasks, workTab]);

  // Real Agency Activity Events
  const activityEvents = useMemo(() => {
    return activityFeed;
  }, [activityFeed]);

  // Real Active Case Forensic Requests
  const allForensicRequests = useMemo(() => {
    return activeCases.flatMap((c) => c.forensicRequests || []);
  }, [activeCases]);

  // Day One Operations & Case Schedule
  const upcomingSchedule = useMemo(() => {
    const items = [
      { time: '09:00', title: 'Workstation Provisioning & SmartCard Credentials', loc: 'Terminal Hub' },
      { time: '11:30', title: 'Division Operations & Forensic Protocol Orientation', loc: 'Briefing Room 1' },
      { time: '14:30', title: 'Directorate Security Review & System Maintenance', loc: 'Secure Net' }
    ];
    if (activeCases.length > 0) {
      items.splice(1, 0, {
        time: '13:00',
        title: `Active Case Review & Triage · ${activeCases[0].id}`,
        loc: 'TRACE Enclave'
      });
    }
    return items;
  }, [activeCases]);

  // Compact 1-row Dock Platforms
  const dockPlatforms = [
    {
      id: 'TRACE',
      code: 'TRC',
      name: 'TRACE Lab',
      desc: 'Forensics & MS',
      icon: Beaker,
      action: onLaunchTrace,
      status: 'ONLINE',
      statusNote: 'Standby',
      statusColor: 'bg-emerald-400'
    },
    {
      id: 'AEGIS',
      code: 'AGS',
      name: 'AEGIS Defense',
      desc: 'Homeland Ops',
      icon: Shield,
      action: () => onNavigateTab('world'),
      status: 'ACTIVE',
      statusNote: 'Defcon 4',
      statusColor: 'bg-blue-400'
    },
    {
      id: 'ORACLE',
      code: 'ORC',
      name: 'ORACLE Intel',
      desc: 'Geopolitical Sat',
      icon: Globe,
      action: () => onNavigateTab('intelligence'),
      status: 'MONITOR',
      statusNote: 'Standby',
      statusColor: 'bg-cyan-400'
    },
    {
      id: 'MEDSTAT',
      code: 'MED',
      name: 'MEDSTAT',
      desc: 'Clinical Telemetry',
      icon: Activity,
      action: () => onNavigateTab('medstat'),
      status: 'ALERT 2',
      statusNote: 'ICU Live',
      statusColor: 'bg-emerald-400'
    },
    {
      id: 'INVESTIGATION',
      code: 'INV',
      name: 'Vault & AFIS',
      desc: 'Forensics & CCTV',
      icon: Fingerprint,
      action: () => onNavigateTab('investigation'),
      status: 'READY',
      statusNote: 'Vault Standby',
      statusColor: 'bg-indigo-400'
    },
    {
      id: 'CIPHER',
      code: 'CPH',
      name: 'CIPHER Grid',
      desc: 'SIGINT & Crypto',
      icon: Terminal,
      action: () => onNavigateTab('intelligence'),
      status: 'READY',
      statusNote: 'Grid Ready',
      statusColor: 'bg-purple-400'
    },
    {
      id: 'GOVERNMENT',
      code: 'GOV',
      name: 'Cabinet Briefing',
      desc: 'PDB & Directives',
      icon: Landmark,
      action: () => onNavigateTab('government'),
      status: 'STANDBY',
      statusNote: 'Federal Desk',
      statusColor: 'bg-amber-400'
    },
    {
      id: 'PHONE',
      code: 'TEL',
      name: 'Agency Phone',
      desc: 'Encrypted DTMF & VM',
      icon: Phone,
      action: () => onNavigateTab('phone'),
      status: 'READY',
      statusNote: 'Type-1 Line',
      statusColor: 'bg-emerald-400'
    },
    {
      id: 'CIVITAS',
      code: 'CIV',
      name: 'CIVITAS',
      desc: 'DOJ/FBI Liaison',
      icon: Database,
      action: () => onNavigateTab('world'),
      status: 'SYNCED',
      statusNote: 'Federal',
      statusColor: 'bg-indigo-400'
    },
    {
      id: 'COMMS',
      code: 'CMS',
      name: 'COMMS Dispatches',
      desc: 'Sat Pouches & Team',
      icon: Radio,
      action: () => onNavigateTab('comms'),
      status: 'ENCRYPTED',
      statusNote: '5 Channels',
      statusColor: 'bg-emerald-400'
    },
    {
      id: 'EXTRANET',
      code: 'WWW',
      name: 'Extranet Web',
      desc: 'OSINT & Registries',
      icon: Globe,
      action: () => onNavigateTab('extranet'),
      status: 'ONLINE',
      statusNote: 'Browser',
      statusColor: 'bg-cyan-400'
    },
    {
      id: 'BLACKOUT',
      code: 'BLK',
      name: 'PROJECT BLACKOUT',
      desc: 'Compartmented L5',
      icon: Lock,
      action: onOpenBlackout || (() => onNavigateTab('cases')),
      status: 'RESTRICTED',
      statusNote: 'Special Access',
      statusColor: 'bg-rose-500'
    }
  ];

  return (
    <div className="h-full flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden bg-[#ebe9f3] p-[10px] gap-[10px] text-xs select-none">
      {/* ========================================================
          LEFT & CENTER: FULL-HEIGHT COMMAND WORKSPACE
          ======================================================== */}
      <div className="flex-1 flex flex-col gap-[10px] min-w-0 min-h-[780px] xl:min-h-0 xl:h-full overflow-hidden">
        {/* ROW 1A: COMMAND POST / METRICS / PRIMARY ACTIONS (Height: 74 to 80px) */}
        <div className="bg-white border border-[#cfcddb] rounded-[5px] p-[10px] shadow-xs flex flex-wrap items-center justify-between gap-x-4 gap-y-2 shrink-0 min-h-[64px]">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <div>
              <div className="text-[10px] text-[#787693] uppercase font-bold tracking-wider">COMMAND POST</div>
              <div className="text-[15px] font-extrabold text-[#1f1e30] flex items-center gap-1.5 font-mono">
                <span>DGA-CENTRAL</span>
                <span className="text-[9.5px] font-sans font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-[3px]">
                  ENCLAVE SECURE
                </span>
              </div>
            </div>

            <div className="w-px h-6 bg-[#d8d6e3]" />

            <div className="flex items-center gap-3 font-mono">
              <div>
                <span className="text-[10px] text-[#787693] block uppercase">ACTIVE CASES</span>
                <span className="text-[13px] font-bold text-[#201f30]">{activeCases.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-800 block uppercase font-bold">CRITICAL INCIDENTS</span>
                <span className="text-[13px] font-bold text-rose-700">{criticalCases.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#787693] block uppercase">EVIDENCE ITEMS</span>
                <span className="text-[13px] font-bold text-[#201f30]">
                  {activeCases.reduce((acc, c) => acc + (c.evidence?.length || 0), 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#787693] block uppercase">DIRECTIVES OPEN</span>
                <span className="text-[13px] font-bold text-[#201f30]">
                  {activeCases.reduce((acc, c) => acc + (c.tasks?.filter((t) => !t.completed).length || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto whitespace-nowrap">
            <button
              onClick={() => onNavigateTab('assignments')}
              className="h-[28px] px-[10px] bg-[#4b4372] hover:bg-[#3d365d] text-white rounded-[3px] text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Open Workforce & Directive Management"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#dedce8]" />
              <span>
                DIRECTIVES<span className="hidden min-[1700px]:inline"> &amp; WORK</span>
              </span>
            </button>
            <button
              onClick={() => onNavigateTab('cases')}
              className="h-[28px] px-[10px] bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded-[3px] text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW MISSION</span>
            </button>
            <button
              onClick={onLaunchTrace}
              className="h-[28px] px-[10px] bg-[#37354c] hover:bg-[#474561] text-white rounded-[3px] text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Beaker className="w-3.5 h-3.5 text-emerald-400" />
              <span>TRACE WORKBENCH</span>
            </button>
          </div>
        </div>

        {/* ROW 1A-SUB: AWAITING ACCEPTANCE BANNER */}
        {waitingCases.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-[5px] p-2.5 flex items-center justify-between gap-3 text-xs shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-amber-950 text-[11.5px] uppercase tracking-wider flex items-center gap-2">
                  <span>{waitingCases.length} CASE{waitingCases.length > 1 ? 'S' : ''} AWAITING INVESTIGATOR ACCEPTANCE</span>
                  <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-mono text-[9.5px]">
                    SIGNATURE REQUIRED
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 truncate">
                  {waitingCases.map((wc) => `${wc.id}: ${wc.title}`).join(' · ')}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onSelectCase(waitingCases[0].id);
                onNavigateTab('cases');
              }}
              className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded text-[11px] font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              REVIEW &amp; SIGN DOCKET →
            </button>
          </div>
        )}

        {/* ROW 1B: ACTIVE ASSIGNMENTS MATRIX (Height: 180 to 220px, compact rows) */}
        <div className="bg-white border border-[#cfcddb] rounded-[5px] shadow-xs overflow-hidden shrink-0 flex flex-col max-h-[210px]">
          {/* Header & Priority Filter Tabs */}
          <div className="px-[10px] py-[4px] border-b border-[#cfcddb] bg-[#fdfdfd] flex items-center justify-between gap-2 shrink-0 h-[34px] whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#35334e] flex items-center gap-1.5">
                <FolderLock className="w-3.5 h-3.5 text-[#5d5a86]" />
                PRIORITY ACTIVE ASSIGNMENTS
              </span>
              <span className="text-[9.5px] bg-[#eeeef5] text-[#555370] px-1.5 py-0.2 rounded-[3px] font-mono font-bold">
                {filteredCases.length} OF {activeCases.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                {(['ALL', 'CRITICAL', 'HIGH', 'ROUTINE'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setPriorityFilter(filterKey)}
                    className={`h-[22px] px-[7px] rounded-[3px] text-[9.5px] font-bold transition-colors cursor-pointer ${
                      priorityFilter === filterKey
                        ? 'bg-[#5d5a86] text-white'
                        : 'bg-[#eeedf5] text-[#63617c] hover:bg-[#e1dfeb]'
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>

              <div className="w-px h-3.5 bg-[#dcdbe6]" />

              <button
                onClick={() => onNavigateTab('cases')}
                className="text-[10.5px] text-[#5d5a86] hover:text-[#322f53] font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <span>VIEW ALL</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Compact Case Rows (Height: 48px to 54px each) */}
          <div className="divide-y divide-[#ebe9f2] overflow-y-auto flex-1 flex flex-col">
            {filteredCases.map((c) => {
              const { taskPercent, completedTasks, totalTasks } = calculateCaseProgress(c);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectCase(c.id);
                    onNavigateTab('cases');
                  }}
                  className="h-[52px] min-h-[48px] px-[10px] py-[6px] hover:bg-[#f6f5fb] cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                >
                  {/* Left Column: ID, Priority, Lead System, Title */}
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="font-mono text-[10.5px] font-bold text-[#302e48] bg-[#ebe9f2] px-1.5 py-0.5 rounded-[3px] shrink-0">
                      {c.id}
                    </span>
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase shrink-0 ${
                        c.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : c.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c.priority}
                    </span>
                    <span className="text-[10px] text-[#716f8b] uppercase font-semibold shrink-0">
                      {c.leadSystem}
                    </span>
                    <div className="min-w-0 flex-1 truncate">
                      <span className="font-bold text-[12.5px] text-[#1e1d2d] group-hover:text-[#5d5a86] transition-colors">
                        {c.title}
                      </span>
                      <span className="text-[11px] text-[#787693] ml-2 hidden xl:inline">
                        — {c.summary}
                      </span>
                    </div>
                  </div>

                  {/* Middle Column: Objective / Directives Progress Bar */}
                  <div className="w-36 shrink-0 hidden md:block">
                    <div className="flex items-center justify-between text-[9.5px] text-[#696782] mb-0.5">
                      <span>{completedTasks}/{totalTasks} DIRECTIVES</span>
                      <span className="font-bold text-[#35334e] font-mono">{taskPercent}%</span>
                    </div>
                    <div className="w-full bg-[#e3e1ed] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          taskPercent === 100 ? 'bg-emerald-500' : 'bg-[#5d5a86]'
                        }`}
                        style={{ width: `${taskPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Right Column: Evidence & Lab Status & Jump Action */}
                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <div className="text-[10.5px] text-[#6a6885]">
                      <div>{c.evidence?.length || 0} Evid</div>
                    </div>
                    {c.linkedTraceCaseId ? (
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                        TRACE: {c.linkedTraceCaseId}
                      </span>
                    ) : (
                      <span className="text-[9.5px] text-[#9694ae] hidden sm:inline">No Lab</span>
                    )}

                    <ChevronRight className="w-3.5 h-3.5 text-[#9b98b8] group-hover:text-[#5d5a86] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
            {filteredCases.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#7e7c99]">
                <FolderLock className="w-8 h-8 text-[#b3b0cb] mb-2 opacity-60" />
                <span className="text-[12.5px] font-bold text-[#35334e]">Active Cases</span>
                <p className="text-[11.5px] text-[#787693] mt-1 max-w-md">
                  No active cases. Review incoming assignments to begin an investigation.
                </p>
                <button
                  onClick={() => onNavigateTab('cases')}
                  className="mt-3 px-3 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded-[3px] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>REVIEW INCOMING ASSIGNMENTS</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: MAIN WORKING AREA (Fills Remaining Screen Height: My Work 60% + Operational Activity 40%) */}
        <div className="grid grid-cols-12 gap-[10px] flex-1 min-h-0 overflow-hidden">
          {/* ========================================================
              LEFT COLUMN (60% / Col 7): MY WORK OPERATIONAL PANEL
              ======================================================== */}
          <div className="col-span-7 bg-white border border-[#cfcddb] rounded-[5px] shadow-xs flex flex-col h-full overflow-hidden">
            {/* My Work Header & ClickUp-style Tabs */}
            <div className="px-[10px] py-[6px] border-b border-[#cfcddb] bg-[#fdfdfd] flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 shrink-0 min-h-[36px] whitespace-nowrap">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#35334e] flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#4b4372]" />
                  MY WORK
                </span>
                <span className="text-[9.5px] bg-[#ede9f7] text-[#4b4372] px-1.5 py-0.2 rounded font-bold font-mono">
                  {displayedWorkTasks.filter((t) => !t.completed).length} ACTIVE
                </span>
              </div>

              {/* ClickUp-Style Sub-Tabs */}
              <div className="flex items-center gap-1">
                {(['TODAY', 'TASKS', 'DIRECTIVES', 'WAITING', 'DEADLINES'] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    onClick={() => setWorkTab(tabKey)}
                    className={`h-[22px] px-[7px] rounded-[3px] text-[9.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      workTab === tabKey
                        ? 'bg-[#4b4372] text-white shadow-xs'
                        : 'bg-[#eeedf5] text-[#63617c] hover:bg-[#e1dfeb]'
                    }`}
                  >
                    {tabKey}
                  </button>
                ))}
              </div>
            </div>

            {/* My Work Task Stream */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#ebe9f2] p-1">
              {displayedWorkTasks.map((t) => (
                <div
                  key={t.id}
                  className={`px-[8px] py-[7px] flex items-center justify-between gap-3 hover:bg-[#f8f7fc] transition-colors rounded-[3px] group ${
                    t.completed ? 'opacity-60 bg-[#faf9fc]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Interactive Completion Toggle */}
                    <button
                      onClick={() => handleToggleTask(t.caseId, t.id, t.completed)}
                      className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        t.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-[#a8a6bc] hover:border-[#4b4372] bg-white'
                      }`}
                      title={t.completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    {/* Time Badge */}
                    <span className="font-mono text-[10px] text-[#5d5a86] font-bold w-10 shrink-0">
                      {t.timeStr}
                    </span>

                    {/* Interactive Task Title */}
                    <button
                      type="button"
                      onClick={() => {
                        const originalTask = cases
                          .flatMap((c) => c.tasks || [])
                          .find((taskItem) => taskItem.id === t.id);
                        if (originalTask) {
                          setInspectingTask(originalTask);
                        } else {
                          setInspectingTask({
                            id: t.id,
                            title: t.title,
                            description: 'Operational directive dispatched from command enclave.',
                            completed: t.completed,
                            assignedTo: 'Special Agent Miracle Jerome',
                            phase: (t.phase as Task['phase']) || 'Active Investigation',
                            priority: t.priority
                          });
                        }
                      }}
                      className="text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <span
                        title={t.title}
                        className={`text-[12px] font-medium leading-snug block line-clamp-2 ${
                          t.completed ? 'line-through text-[#84829d]' : 'text-[#1e1d2d] group-hover:text-[#4b4372]'
                        }`}
                      >
                        {t.title}
                      </span>
                    </button>
                  </div>

                  {/* Metadata: Case Tag, Priority & Quick Inspect */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const originalTask = cases
                          .flatMap((c) => c.tasks || [])
                          .find((taskItem) => taskItem.id === t.id);
                        if (originalTask) {
                          setInspectingTask(originalTask);
                        } else {
                          setInspectingTask({
                            id: t.id,
                            title: t.title,
                            description: 'Operational directive dispatched from command enclave.',
                            completed: t.completed,
                            assignedTo: 'Special Agent Miracle Jerome',
                            phase: (t.phase as Task['phase']) || 'Active Investigation',
                            priority: t.priority
                          });
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-[#eeedf5] hover:bg-[#dedbe8] text-[9.5px] font-bold text-[#4b4372] transition-opacity cursor-pointer"
                    >
                      INSPECT
                    </button>
                    <span className="font-mono text-[9.5px] bg-[#f0eff5] text-[#555370] px-1.5 py-0.5 rounded font-bold">
                      {t.caseCode}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        t.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : t.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}

              {allTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#7e7c99]">
                  <CheckSquare className="w-7 h-7 text-[#b3b0cb] mb-1.5 opacity-60" />
                  <span className="text-[12px] font-bold text-[#35334e]">Tasks</span>
                  <span className="text-[11px] text-[#787693] mt-0.5">No assigned tasks.</span>
                </div>
              ) : displayedWorkTasks.length === 0 ? (
                <div className="p-8 text-center text-[#7e7c99] text-[11px] space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto opacity-70" />
                  <div className="font-bold text-[#35334e]">NO ACTIVE ITEMS IN THIS VIEW</div>
                  <div>All objectives under this category have been satisfied or cleared.</div>
                </div>
              ) : null}
            </div>

            {/* Bottom Quick-Add / Operational Status Strip */}
            <div className="px-3 py-1.5 border-t border-[#cfcddb] bg-[#faf9fd] flex items-center justify-between gap-3 text-[10.5px] text-[#696784] shrink-0 whitespace-nowrap">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Synchronized with Case Engine &amp; Directives</span>
              </span>
              <button
                onClick={() => onNavigateTab('assignments')}
                className="text-[#4b4372] hover:text-[#2d2847] font-bold flex items-center gap-1 hover:underline cursor-pointer shrink-0"
              >
                <span>Full Work Management Grid</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN (40% / Col 5): OPERATIONAL ACTIVITY STACK
              ======================================================== */}
          <div className="col-span-5 h-full flex flex-col gap-[10px] min-h-0 overflow-hidden">
            {/* 1. AGENCY ACTIVITY PANEL (Flex-1) */}
            <div className="flex-1 min-h-[140px] flex flex-col bg-white border border-[#cfcddb] rounded-[5px] shadow-xs overflow-hidden">
              <div className="px-[10px] py-[5px] border-b border-[#cfcddb] bg-[#fdfdfd] flex items-center justify-between gap-2 shrink-0 h-[32px] whitespace-nowrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#35334e] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#5d5a86]" />
                  AGENCY ACTIVITY
                </span>
                <span className="flex items-center gap-1 text-[9.5px] font-mono text-emerald-700 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#f2f1f7] p-1 flex flex-col">
                {activityEvents.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-[#7e7c99]">
                    <Activity className="w-6 h-6 text-[#b3b0cb] mb-1.5 opacity-60" />
                    <span className="text-[11px] font-semibold text-[#55536e]">Case Activity</span>
                    <span className="text-[10px] text-[#8e8ca8] mt-0.5">
                      Activity will appear after you accept an assignment.
                    </span>
                  </div>
                ) : (
                  activityEvents.map((evt) => (
                    <div key={evt.id} className="p-1.5 hover:bg-[#f9f8fc] transition-colors text-[11px]">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9.5px] font-bold text-[#5d5a86]">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span
                            className={`text-[8.5px] font-bold px-1 rounded font-mono ${
                              evt.system === 'TRACE'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : evt.system === 'ORACLE'
                                ? 'bg-cyan-100 text-cyan-900 border border-cyan-200'
                                : evt.system === 'MEDSTAT'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : evt.system === 'CIPHER'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {evt.system}
                          </span>
                        </div>
                        {evt.caseId && (
                          <span className="text-[9px] font-mono text-[#82809a]">{evt.caseId}</span>
                        )}
                      </div>
                      <div className="font-semibold text-[#1e1d2d] leading-snug">{evt.headline}</div>
                      <div className="text-[10px] text-[#6d6b86] truncate">{evt.details}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. WAITING ON PANEL (Height: 110px) */}
            <div className="h-[115px] shrink-0 flex flex-col bg-white border border-[#cfcddb] rounded-[5px] shadow-xs overflow-hidden">
              <div className="px-[10px] py-[4px] border-b border-[#cfcddb] bg-[#fdfdfd] flex items-center justify-between gap-2 shrink-0 h-[28px] whitespace-nowrap [&>span:last-child]:truncate">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#35334e] flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#d97706]" />
                  WAITING ON
                </span>
                <span className="text-[9px] text-[#787693] uppercase font-bold">EXTERNAL RETURNS</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#f2f1f7] p-1 text-[10.5px] flex flex-col">
                {allForensicRequests.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-3 text-center text-[#7e7c99]">
                    <Clock className="w-4 h-4 text-[#b3b0cb] mb-1 opacity-60" />
                    <span className="text-[10.5px] font-bold text-[#35334e]">Forensic Requests</span>
                    <span className="text-[9.5px] text-[#787693]">No requests submitted.</span>
                  </div>
                ) : (
                  allForensicRequests.map((req) => (
                    <div key={req.id} className="p-1.5 flex items-center justify-between gap-2 hover:bg-[#f9f8fc]">
                      <div className="min-w-0">
                        <div className="font-bold text-[#1f1e30] flex items-center gap-1.5 min-w-0 whitespace-nowrap [&>span:first-child]:shrink-0 [&>span:last-child]:truncate">
                          <span className="text-purple-700 font-mono text-[9px] font-bold bg-purple-50 px-1 rounded border border-purple-200">
                            {req.targetModules?.[0] || 'TRACE'}
                          </span>
                          <span>{req.notes || req.id}</span>
                        </div>
                        <div className="text-[9.5px] text-[#6d6b86] truncate">
                          {req.evidenceIds?.length ? `Exhibits: ${req.evidenceIds.join(', ')} · ` : ''}Case {req.caseId}
                        </div>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        {req.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. UPCOMING SCHEDULE (Height: 110px) */}
            <div className="h-[115px] shrink-0 flex flex-col bg-white border border-[#cfcddb] rounded-[5px] shadow-xs overflow-hidden">
              <div className="px-[10px] py-[4px] border-b border-[#cfcddb] bg-[#fdfdfd] flex items-center justify-between gap-2 shrink-0 h-[28px] whitespace-nowrap [&>span:last-child]:truncate">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#35334e] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#4b4372]" />
                  UPCOMING SCHEDULE
                </span>
                <span className="text-[9px] text-[#787693] uppercase font-bold">TODAY / SHIFT 1</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#f2f1f7] p-1 text-[10.5px]">
                {upcomingSchedule.map((item, i) => (
                  <div key={i} className="p-1.5 flex items-center justify-between gap-2 hover:bg-[#f9f8fc]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-[#4b4372] w-12 shrink-0 whitespace-nowrap">
                        {item.time}
                      </span>
                      <span className="font-semibold text-[#1e1d2d] truncate">{item.title}</span>
                    </div>
                    <span className="text-[9.5px] text-[#787693] font-mono shrink-0">{item.loc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: PLATFORM SUITE FOOTER DOCK (Height: 74 to 80px, single compact row, status directly inside) */}
        <div className="bg-white border border-[#cfcddb] rounded-[5px] p-[8px] shadow-xs flex flex-col justify-between shrink-0 min-h-[72px] xl:h-[76px] xl:max-h-[80px]">
          <div className="flex items-center justify-between gap-3 text-[9.5px] font-bold text-[#565474] uppercase tracking-wider mb-1 whitespace-nowrap">
            <span className="flex items-center gap-1.5 min-w-0">
              <Cpu className="w-3 h-3 text-[#5d5a86] shrink-0" />
              <span className="truncate">DGA INTEGRATED PLATFORM SUITE // 9 MISSION ENCLAVES</span>
            </span>
            <span className="text-[#8e8ca9] hidden 2xl:inline text-[9px]">CLICK PLATFORM TILE TO LAUNCH ENVIRONMENT</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-9 gap-[6px]">
            {dockPlatforms.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={p.action}
                  className="h-[46px] p-[5px] rounded-[3px] border border-[#cfcddb] hover:border-[#5d5a86] bg-[#fdfdfd] hover:bg-[#f4f2f9] text-left transition-all flex flex-col justify-between group shadow-xs cursor-pointer"
                  title={`${p.name}: ${p.desc}`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <div className="flex items-center gap-1 min-w-0">
                      <Icon className="w-3 h-3 text-[#5d5a86] group-hover:scale-110 transition-transform shrink-0" />
                      <span className="font-bold text-[10.5px] text-[#201f30] truncate">{p.name}</span>
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.statusColor} animate-pulse shrink-0`} />
                  </div>

                  <div className="flex items-center justify-between gap-1.5 w-full text-[9px] whitespace-nowrap">
                    <span className="font-mono text-[#5d5a86] font-bold shrink-0">{p.status}</span>
                    <span className="text-[#7e7c9b] truncate min-w-0">{p.statusNote}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT: COMPACT FULL-HEIGHT OPERATIONS RAIL (300px width, pinned quick commands)
          ======================================================== */}
      <div className="w-full grid grid-cols-2 gap-[8px] shrink-0 xl:w-[var(--dga-right-rail-w,300px)] xl:min-w-[var(--dga-right-rail-w,300px)] xl:max-w-[var(--dga-right-rail-w,300px)] xl:h-full xl:flex xl:flex-col xl:overflow-hidden">
        {/* 1. OPERATOR PROFILE & CREDENTIALS CAPSULE */}
        <div className="bg-white border border-[#cfcddb] rounded-[5px] p-[10px] shadow-xs space-y-[4px] shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#797796] font-bold">OPERATOR PROFILE</div>
              <div className="text-[13px] font-bold text-[#1f1e30]">{profile.name}</div>
              <div className="text-[10px] text-[#5e5c7a] font-mono mt-0.5">
                BADGE: <strong className="text-[#201f30]">{profile.badgeNumber}</strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9.5px] bg-amber-950/20 text-amber-900 border border-amber-800/40 px-1.5 py-0.5 rounded-[3px] font-bold font-mono">
                LVL {profile.clearanceLevel}
              </span>
              <div className="text-[9px] text-[#716f8b] mt-0.5">{profile.callsign}</div>
            </div>
          </div>

          <div className="pt-1 border-t border-[#f0eff5] text-[10px] text-[#696784] space-y-0.5">
            <div>Assignment: <strong className="text-[#323147]">{profile.division}</strong></div>
            <div>Station: <strong className="text-[#323147]">{profile.station}</strong></div>
          </div>
        </div>

        {/* 2. DIVISION TELEMETRY & READINESS (Shows only systems that matter now) */}
        <div className="bg-white border border-[#cfcddb] rounded-[5px] p-[10px] shadow-xs space-y-[4px] shrink-0">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#4f4d6d]">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#5d5a86]" />
              DIVISION READINESS
            </span>
            <span className="text-emerald-700 font-mono text-[9px] font-bold">4/4 ONLINE</span>
          </div>

          <div className="grid grid-cols-2 gap-[5px] text-[10px]">
            <div className="p-1.5 bg-[#f8f7fc] border border-[#e4e2ee] rounded-[3px]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-[#201f30]">SHIELD</span>
                <span className="text-[8px] font-bold px-1 py-0.2 rounded-[2px] bg-emerald-100 text-emerald-800">ACTIVE</span>
              </div>
              <span className="text-[9px] text-[#6e6c88] block truncate">3 Tactical Teams</span>
            </div>

            <div className="p-1.5 bg-[#f8f7fc] border border-[#e4e2ee] rounded-[3px]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-[#201f30]">EYES</span>
                <span className="text-[8px] font-bold px-1 py-0.2 rounded-[2px] bg-emerald-100 text-emerald-800">99.8%</span>
              </div>
              <span className="text-[9px] text-[#6e6c88] block truncate">Alpha-9 Locked</span>
            </div>

            <div className="p-1.5 bg-[#f8f7fc] border border-[#e4e2ee] rounded-[3px]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-[#201f30]">TRACE</span>
                <span className="text-[8px] font-bold px-1 py-0.2 rounded-[2px] bg-emerald-100 text-emerald-800">READY</span>
              </div>
              <span className="text-[9px] text-[#6e6c88] block truncate">Mass Spec / Tox</span>
            </div>

            <div className="p-1.5 bg-[#f8f7fc] border border-[#e4e2ee] rounded-[3px]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-[#201f30]">SCADA</span>
                <span className="text-[8px] font-bold px-1 py-0.2 rounded-[2px] bg-amber-100 text-amber-800">ELEVATED</span>
              </div>
              <span className="text-[9px] text-[#6e6c88] block truncate">Substation 14-B</span>
            </div>
          </div>
        </div>

        {/* 3. FLASH DIRECTIVES & FEEDS (Flex-1, auto-scrolling feed fills available space) */}
        <div className="bg-white border border-[#cfcddb] rounded-[5px] p-[10px] shadow-xs h-[280px] xl:h-auto flex-1 flex flex-col min-h-0 space-y-[6px] overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#4f4d6d] shrink-0">
            <span className="flex items-center gap-1 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              FLASH DIRECTIVES &amp; FEEDS
            </span>
            <span className="font-mono text-[#787693] text-[9.5px]">{alerts.length} ACTIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 min-h-0">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-[#8a88a4] text-[11px]">
                No active flash advisories.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 rounded-[4px] border text-[11px] space-y-1 ${
                    alert.level === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : alert.level === 'FLASH'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-[#f8f7fc] border-[#cfcddb] text-[#2c2b3e]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="uppercase">{alert.source}</span>
                    <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="font-bold text-[11px] leading-tight">{alert.title}</div>
                  <div className="text-[10px] opacity-90 leading-tight line-clamp-2">{alert.message}</div>

                  <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[9px]">
                    {alert.actionRequired && (
                      <span className="font-bold text-rose-700">ACTION REQUIRED</span>
                    )}
                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="hover:underline font-semibold ml-auto cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. QUICK COMMAND SHORTCUTS (Pinned directly to the bottom) */}
        <div className="bg-[#242332] text-white border border-[#38364e] rounded-[5px] p-[10px] shadow-xs space-y-[6px] shrink-0 self-start w-full xl:self-auto">
          <div className="text-[10px] uppercase font-bold text-[#b4b2cf] tracking-wider">
            QUICK COMMAND SHORTCUTS
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onLaunchTrace}
              className="h-[28px] px-2 rounded-[3px] bg-[#38364e] hover:bg-[#494765] text-left text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>TRACE Lab</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            </button>

            <button
              onClick={() => onNavigateTab('comms')}
              className="h-[28px] px-2 rounded-[3px] bg-[#38364e] hover:bg-[#494765] text-left text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Send Cable</span>
              <Send className="w-3 h-3 text-[#a8a6c8]" />
            </button>

            <button
              onClick={() => onNavigateTab('assignments')}
              className="h-[28px] px-2 rounded-[3px] bg-[#38364e] hover:bg-[#494765] text-left text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Directives</span>
              <CheckSquare className="w-3 h-3 text-[#a8a6c8]" />
            </button>

            <button
              onClick={() => onNavigateTab('cases')}
              className="h-[28px] px-2 rounded-[3px] bg-[#38364e] hover:bg-[#494765] text-left text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Case Files</span>
              <FolderLock className="w-3 h-3 text-[#a8a6c8]" />
            </button>

            <button
              onClick={onOpenBlackout || (() => onNavigateTab('cases'))}
              className="h-[28px] px-2 rounded-[3px] bg-[#38364e] hover:bg-rose-950/80 text-left text-[11px] font-bold flex items-center justify-between gap-2 transition-colors text-rose-300 cursor-pointer col-span-2"
            >
              <span className="truncate">PROJECT BLACKOUT // Compartmented (L5)</span>
              <Lock className="w-3 h-3 text-rose-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Directive Inspection Modal */}
      {inspectingTask && (
        <DgaTaskDetailModal
          task={inspectingTask}
          cases={cases}
          isOpen={!!inspectingTask}
          onClose={() => setInspectingTask(null)}
          onSelectCase={(caseId) => {
            setInspectingTask(null);
            onSelectCase(caseId);
            onNavigateTab('cases');
          }}
          onNavigateToComms={() => {
            setInspectingTask(null);
            onNavigateTab('comms');
          }}
        />
      )}
    </div>
  );
}
