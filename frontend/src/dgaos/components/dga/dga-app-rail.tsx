'use client';

import React from 'react';
import {
  Shield,
  LayoutDashboard,
  FolderLock,
  CheckSquare,
  Radio,
  FileText,
  Eye,
  Beaker,
  Globe,
  Activity,
  Terminal,
  Lock,
  ChevronLeft,
  ChevronRight,
  Database,
  UserRound,
  Sparkles,
  Phone,
  Landmark,
  Fingerprint
} from 'lucide-react';
import { DGAAgentProfile, DGACase, DgaAlert, DGACommunication } from '@/lib/dga-types';

interface DgaAppRailProps {
  currentTab: string;
  currentMode: 'DGA_CORE' | 'TRACE';
  onNavigateTab: (tab: string) => void;
  onLaunchTrace: () => void;
  onOpenBlackout?: () => void;
  onOpenProfile: () => void;
  cases: DGACase[];
  communications: DGACommunication[];
  alerts: DgaAlert[];
  profile: DGAAgentProfile;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DgaAppRail({
  currentTab,
  currentMode,
  onNavigateTab,
  onLaunchTrace,
  onOpenBlackout,
  onOpenProfile,
  cases,
  communications,
  alerts,
  profile,
  isCollapsed,
  onToggleCollapse
}: DgaAppRailProps) {
  const activeCasesCount = cases.filter((c) => c.status === 'Active').length;
  const pendingTasksCount = cases.reduce(
    (acc, c) => acc + c.tasks.filter((t) => !t.completed).length,
    0
  );
  const unreadCommsCount = communications.filter((c) => !c.read).length;

  return (
    <aside
      className={`dga-app-rail bg-[#f0eff5] text-[#2c2a3e] border-r border-[#cfcddb] flex flex-col justify-between shrink-0 select-none transition-all duration-200 h-full overflow-hidden ${
        isCollapsed ? 'w-[62px] min-w-[62px]' : 'w-[var(--dga-sidebar-w,244px)] min-w-[var(--dga-sidebar-w,244px)] max-w-[var(--dga-sidebar-w,244px)]'
      }`}
    >
      {/* 1. TOP HEADER & COLLAPSE CONTROL */}
      <div className="h-10 border-b border-[#cfcddb] px-2.5 flex items-center justify-between shrink-0 bg-[#e7e5f0]">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-[4px] bg-[#4f4d6d] border border-[#6f6c96] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-[#e5e0f0]" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-[#1f1e30] tracking-tight flex items-center gap-1 font-mono">
                <span>DGAOS</span>
                <span className="text-[9px] px-1 py-0.2 rounded-[3px] bg-[#dfdceb] text-[#423f5c] border border-[#cfcddb]">
                  HQ-04
                </span>
              </div>
              <div className="text-[10px] text-[#676582] truncate">Dept. of Global Affairs</div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-6 h-6 rounded-[4px] bg-[#4f4d6d] border border-[#6f6c96] flex items-center justify-center text-white shadow-xs">
              <Shield className="w-3.5 h-3.5 text-[#e5e0f0]" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1 rounded-[4px] hover:bg-[#dfdceb] text-[#555370] hover:text-[#1f1e30] transition-colors cursor-pointer ${
            isCollapsed ? 'mx-auto mt-1' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar (228px)' : 'Collapse sidebar (62px)'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. SCROLLABLE MIDDLE NAVIGATION SURFACE */}
      <div className="flex-1 overflow-y-auto px-[6px] pt-[8px] pb-[10px] space-y-[14px] text-xs scrollbar-thin scrollbar-thumb-[#cfcddb] scrollbar-track-transparent">
        {/* ========================================================
            SECTION 1: CORE APPLICATIONS
            ======================================================== */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#5e5c7a]">
              COMMAND
            </div>
          )}

          {/* Command Center */}
          <button
            onClick={() => onNavigateTab('dashboard')}
            title="Command Center"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'dashboard'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-[#5d5a86]'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <LayoutDashboard className="w-4 h-4 text-[#5d5a86] shrink-0" />
              {!isCollapsed && <span className="text-[13px] truncate">Command Center</span>}
            </div>
          </button>

          {/* Cases */}
          <button
            onClick={() => onNavigateTab('cases')}
            title={`Cases (${activeCasesCount})`}
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'cases'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-[#5d5a86]'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FolderLock className="w-4 h-4 text-[#5d5a86] shrink-0" />
              {!isCollapsed && <span className="text-[13px] truncate">Cases</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono font-bold bg-[#dfdceb] text-[#34314c] px-1.5 py-0.2 rounded border border-[#cfcddb]">
                {activeCasesCount}
              </span>
            )}
          </button>

          {/* Assignments / Work Management */}
          <button
            onClick={() => onNavigateTab('assignments')}
            title={`Assignments (${pendingTasksCount} directives)`}
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'assignments'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-[#5d5a86]'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckSquare className="w-4 h-4 text-[#5d5a86] shrink-0" />
              {!isCollapsed && <span className="text-[13px] truncate">Work Management</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono font-bold bg-[#dfdceb] text-[#34314c] px-1.5 py-0.2 rounded border border-[#cfcddb]">
                {pendingTasksCount}
              </span>
            )}
          </button>

          {/* Communications */}
          <button
            onClick={() => onNavigateTab('comms')}
            title={`Communications (${unreadCommsCount} unread)`}
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'comms'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-[#5d5a86]'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Radio className="w-4 h-4 text-[#5d5a86] shrink-0" />
              {!isCollapsed && <span className="text-[12px] font-semibold text-[#1f1e30] truncate">Communications</span>}
            </div>
            {unreadCommsCount > 0 && !isCollapsed && (
              <span className="text-[9.5px] font-mono font-bold bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded border border-blue-300 shrink-0">
                {unreadCommsCount}
              </span>
            )}
          </button>

          {/* Phone Console */}
          <button
            onClick={() => onNavigateTab('phone')}
            title="Agency Telephone & Voicemail Console"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'phone'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-[#5d5a86]'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              {!isCollapsed && <span className="text-[12px] font-semibold text-[#1f1e30] truncate">Agency Phone</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded border border-emerald-300 shrink-0">
                TYPE-1
              </span>
            )}
          </button>

          {/* Outside Research / Extranet */}
          <button
            onClick={() => onNavigateTab('extranet')}
            title="Extranet Browser & Public OSINT Research"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'extranet'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-[#5d5a86]'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-4 h-4 text-cyan-600 shrink-0" />
              {!isCollapsed && <span className="text-[12px] font-semibold text-[#1f1e30] truncate">Extranet OSINT</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[8.5px] font-mono font-bold px-1 py-0.2 rounded shrink-0 bg-[#dfdceb] text-[#34314c] border border-[#cfcddb]">
                WWW
              </span>
            )}
          </button>

          {/* Records */}
          <button
            onClick={() => onNavigateTab('world')}
            title="Records"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'world'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-[#5d5a86]'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-4 h-4 text-[#5d5a86] shrink-0" />
              {!isCollapsed && <span className="text-[12px] font-semibold text-[#1f1e30] truncate">CIVITAS Records</span>}
            </div>
          </button>
        </div>

        {/* ========================================================
            SECTION 2: DIVISIONS
            ======================================================== */}
        <div className="space-y-1 pt-1 border-t border-[#cfcddb]">
          {!isCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#5e5c7a]">
              OPERATIONS
            </div>
          )}

          {/* INVESTIGATION */}
          <button
            onClick={() => onNavigateTab('investigation')}
            title="Major Investigations & Evidence Vault"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'investigation'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-indigo-600'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Fingerprint className="w-4 h-4 text-indigo-600 shrink-0" />
              {!isCollapsed && (
                <span className="text-[12px] font-semibold text-[#1f1e30] truncate">Investigation</span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[8.5px] font-mono font-bold px-1 py-0.2 rounded shrink-0 whitespace-nowrap bg-indigo-50 text-indigo-800 border border-indigo-200">
                AFIS/CCTV
              </span>
            )}
          </button>

          {/* INTELLIGENCE */}
          <button
            onClick={() => onNavigateTab('intelligence')}
            title="Intelligence, SIGINT & Cryptanalysis"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'intelligence'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-cyan-600'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="w-4 h-4 text-cyan-600 shrink-0" />
              {!isCollapsed && (
                <span className="text-[12px] font-semibold text-[#1f1e30] truncate">ORACLE Intelligence</span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[8.5px] font-mono font-bold px-1 py-0.2 rounded shrink-0 whitespace-nowrap bg-cyan-50 text-cyan-800 border border-cyan-200">
                SIGINT
              </span>
            )}
          </button>

          {/* CLINICAL / MEDSTAT */}
          <button
            onClick={() => onNavigateTab('medstat')}
            title="MEDSTAT Clinical Bio-Surveillance & Patient Chart"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'medstat'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-emerald-600'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
              {!isCollapsed && (
                <span className="text-[12px] font-semibold text-[#1f1e30] truncate">MedStat Clinical</span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[8.5px] font-mono font-bold px-1 py-0.2 rounded shrink-0 whitespace-nowrap bg-emerald-50 text-emerald-800 border border-emerald-200">
                ICU LIVE
              </span>
            )}
          </button>

          {/* GOVERNMENT */}
          <button
            onClick={() => onNavigateTab('government')}
            title="Cabinet Briefing Books, PDB & Executive Directives"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'government'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-amber-600'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Landmark className="w-4 h-4 text-amber-600 shrink-0" />
              {!isCollapsed && (
                <span className="text-[12px] font-semibold text-[#1f1e30] truncate">Government</span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[8.5px] font-mono font-bold px-1 py-0.2 rounded shrink-0 whitespace-nowrap bg-amber-50 text-amber-800 border border-amber-200">
                CABINET
              </span>
            )}
          </button>
        </div>

        {/* ========================================================
            SECTION 3: AGENCY SYSTEMS
            ======================================================== */}
        <div className="space-y-1 pt-1 border-t border-[#cfcddb]">
          {!isCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#5e5c7a]">
              AGENCY SYSTEMS
            </div>
          )}

          {/* TRACE */}
          <button
            onClick={onLaunchTrace}
            title="TRACE - Central Forensic Laboratory Suite"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'TRACE'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-emerald-600'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Beaker className="w-4 h-4 text-emerald-600 shrink-0" />
              {!isCollapsed && (
                <div className="min-w-0">
                  <span className="text-[13px] font-medium block truncate text-[#1f1e30]">TRACE</span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 whitespace-nowrap bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                LIVE
              </span>
            )}
          </button>

          {/* AEGIS */}
          <button
            onClick={() => onNavigateTab('world')}
            title="AEGIS - Border & Threat Monitoring"
            className="w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
              {!isCollapsed && <span className="text-[13px] truncate text-[#1f1e30]">AEGIS</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 whitespace-nowrap bg-[#dfdceb] text-[#34314c] border border-[#cfcddb]">
                ACTIVE
              </span>
            )}
          </button>

          {/* CIPHER */}
          <button
            onClick={() => onNavigateTab('intelligence')}
            title="CIPHER - Cryptanalysis & Cyber Defense"
            className={`w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer ${
              currentMode === 'DGA_CORE' && currentTab === 'intelligence'
                ? 'bg-white text-[#181628] font-bold shadow-xs border-l-2 border-purple-600'
                : 'hover:bg-[#e4e2ee] text-[#4b4866] hover:text-[#181628] border-l-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Terminal className="w-4 h-4 text-purple-600 shrink-0" />
              {!isCollapsed && <span className="text-[12px] font-semibold text-[#1f1e30] truncate">CIPHER</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 whitespace-nowrap bg-[#dfdceb] text-[#34314c] border border-[#cfcddb]">
                STANDBY
              </span>
            )}
          </button>

        </div>

        {/* ========================================================
            SECTION 4: RESTRICTED
            ======================================================== */}
        <div className="space-y-1 pt-1 border-t border-[#cfcddb]">
          {!isCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#5e5c7a]">
              RESTRICTED
            </div>
          )}

          {/* BLACKOUT */}
          <button
            onClick={onOpenBlackout || (() => onNavigateTab('cases'))}
            title="PROJECT BLACKOUT - Compartmented Nightfall Operations"
            className="w-full h-[38px] px-[10px] rounded-[4px] flex items-center justify-between gap-2 transition-all text-left group cursor-pointer hover:bg-rose-100 text-rose-900 border-l-2 border-transparent"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              {!isCollapsed && <span className="text-[13px] truncate font-medium">BLACKOUT</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 whitespace-nowrap bg-rose-100 text-rose-800 border border-rose-300">
                LOCKED
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. PINNED BOTTOM AGENT IDENTITY PANEL */}
      <div className="h-[64px] min-h-[64px] max-h-[64px] border-t border-[#cfcddb] px-2.5 flex items-center bg-[#e7e5f0] shrink-0">
        <button
          onClick={onOpenProfile}
          title="Click to view Agent Miracle Jerome Credential & Dossier"
          className="w-full flex items-center gap-2 p-1 rounded-[4px] hover:bg-[#dedceb] transition-colors text-left group cursor-pointer"
        >
          {/* Avatar Initials Badge */}
          <div className="w-7 h-7 rounded-[4px] bg-[#4f4d6d] border border-[#646187] flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-xs">
            MJ
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[13px] font-bold text-[#1f1e30] truncate transition-colors">
                {profile.name}
              </div>
              <div className="text-[10px] text-[#5e5c7a] truncate">
                {profile.title}
              </div>
              <div className="text-[10px] font-mono text-amber-800 font-bold mt-0.5">
                Clearance Level {profile.clearanceLevel}
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
