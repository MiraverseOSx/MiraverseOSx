'use client';

import React, { useState, useEffect } from 'react';
import { isLocalWorld } from '../../../gameplay/localCredentials';
import {
  Shield,
  LayoutDashboard,
  Grid2X2,
  FolderLock,
  Radio,
  Globe,
  Beaker,
  Lock,
  RotateCcw,
  Bell,
  ArrowLeft,
  Send,
  CheckCircle2,
  Cpu,
  Layers,
  Terminal,
  ExternalLink,
  ChevronRight,
  Activity,
  Phone,
  PhoneCall,
  Zap
} from 'lucide-react';
import {
  DGAState,
  DGACase,
  DGASystem
} from '@/lib/dga-types';
import {
  getDGAState,
  subscribeDGAState,
  initDGAStore,
  setWorkstationLocked,
  dismissDGAAlert,
  resetDGAWorld,
  setActiveDGACase,
  runSimulationTick,
  acknowledgeSimulationEvents,
  recordMissedCall
} from '@/lib/dga-store';
import { subscribeDgaEvent } from '@/lib/dga-events';
import { returnTraceResultToDga } from '@/lib/dga-trace-bridge';
import { startSystemExchange } from '@/lib/systems/system-exchange';
import { DgaBootScreen } from './dga-boot-screen';
import { DgaDashboard } from './dga-dashboard';
import { DgaCaseRegistry } from './dga-case-registry';
import { DgaCommsInbox } from './dga-comms-inbox';
import { DgaCommsHub } from './comms/dga-comms-hub';
import { DgaMedicalChart } from './medstat/dga-medical-chart';
import { DgaInvestigationHub } from './investigation/dga-investigation-hub';
import { DgaIntelligenceHub } from './intelligence/dga-intelligence-hub';
import { DgaGovernmentHub } from './government/dga-government-hub';
import { DgaExtranetBrowser } from './research/dga-extranet-browser';
import { DgaPhoneConsole } from './phone/dga-phone-console';
import { DgaIncomingCallModal } from './phone/dga-incoming-call-modal';
import { DgaWorldViewer } from './dga-world-viewer';
import { DgaAppRail } from './dga-app-rail';
import { DgaAgentProfileModal } from './dga-agent-profile-modal';
import { DgaSimulationControls } from './dga-simulation-controls';
import { DgaShiftSummaryModal } from './dga-shift-summary-modal';
import { DgaOfflineModal } from './dga-offline-modal';
import { DgaAgencyFeedDrawer } from './dga-agency-feed-drawer';
import { DgaWorkWorkspace } from './work-management/dga-work-workspace';
import DgaServiceWorkspace from './DgaServiceWorkspace';
import { useOSStore } from '../../../store/useOSStore';
import {
  canAccessDgaWorkspace,
  canAccessTraceLab,
  filterAuthorizedDgaCases,
  resolveDGAAuthority,
  type DGARole,
  type DgaWorkspaceId,
} from '@/lib/dga-permissions';

import { DgaOperationsWorkspace } from './dga-operations-workspace';

export type DgaTab =
  | 'operations'
  | 'dashboard'
  | 'cases'
  | 'assignments'
  | 'comms'
  | 'phone'
  | 'medstat'
  | 'investigation'
  | 'intelligence'
  | 'government'
  | 'extranet'
  | 'services'
  | 'world';

interface DgaShellProps {
  traceWorkbenchNode: React.ReactNode;
  onOpenCaseNotebook?: () => void;
}

export function DgaShell({ traceWorkbenchNode, onOpenCaseNotebook }: DgaShellProps) {
  const workspaceRequest = useOSStore(s => s.workspaceRequests.dgaos);
  const osPlayer = useOSStore(s => s.gameplay.player);
  const isLoggedIn = useOSStore(s => s.isLoggedIn);
  const [roleOverride, setRoleOverride] = useState<DGARole | null>(null);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [dgaState, setDgaState] = useState<DGAState | null>(null);
  const [activeTab, setActiveTab] = useState<DgaTab>('dashboard');
  const [activeMode, setActiveMode] = useState<'DGA_CORE' | 'TRACE'>('DGA_CORE');
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isFeedDrawerOpen, setIsFeedDrawerOpen] = useState(false);
  const [isOfflineModalDismissed, setIsOfflineModalDismissed] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [bridgeResultModalOpen, setBridgeResultModalOpen] = useState(false);
  const [phoneActiveContactOverride, setPhoneActiveContactOverride] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callerName: string;
    callerTitle: string;
    callerDepartment: string;
    callerAvatar: string;
    headlineMessage: string;
    contactId: string;
  } | null>(null);
  const [demoResultSummary, setDemoResultSummary] = useState('');

  useEffect(() => {
    initDGAStore().then((st) => setDgaState(st));
    const unsubscribe = subscribeDGAState((st) => setDgaState(st));
    const stopExchange = startSystemExchange();

    // Listen for incoming call triggers from Event & Comms Engine
    const unsubCall = subscribeDgaEvent('INCOMING_CALL_TRIGGERED', (evt) => {
      if (evt.payload) {
        setIncomingCall({
          callerName: evt.payload.callerName,
          callerTitle: evt.payload.callerTitle,
          callerDepartment: evt.payload.callerDepartment,
          callerAvatar: evt.payload.callerAvatar,
          headlineMessage: evt.payload.headlineMessage,
          contactId: evt.payload.contactId
        });
      }
    });

    // Real-time operational simulation tick (runs every 4 seconds)
    const simInterval = setInterval(() => {
      void runSimulationTick().catch(() => setAccessNotice("Agency updates could not be saved. Check available storage and retry."));
    }, 4000);

    return () => {
      unsubscribe();
      unsubCall();
      stopExchange();
      clearInterval(simInterval);
    };
  }, []);

  useEffect(() => {
    if (!workspaceRequest || !dgaState || dgaState.isLocked) return;
    if (workspaceRequest.section.startsWith('broadstreet:')) return;
    if (workspaceRequest.section === 'trace') setActiveMode('TRACE');
    else if (workspaceRequest.section === 'services') { setActiveMode('DGA_CORE'); setActiveTab('services'); }
    useOSStore.getState().consumeWorkspaceRequest('dgaos', workspaceRequest.revision);
  }, [workspaceRequest, dgaState?.isLocked]);

  if (!dgaState) {
    return (
      <div className="h-full w-full min-h-[300px] bg-[#181722] flex items-center justify-center text-white font-mono text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 animate-spin text-[#9598c4]" />
          <span>INITIALIZING DGAOS CORE ENCLAVE (NODE HQ-04)...</span>
        </div>
      </div>
    );
  }

  // If locked, render boot / authentication screen
  if (dgaState.isLocked) {
    return (
      <DgaBootScreen
        profile={dgaState.profile}
        onAuthenticated={() => setWorkstationLocked(false)}
      />
    );
  }

  const dgaAuthority = resolveDGAAuthority({
    profile: dgaState.profile,
    player: osPlayer,
    isLoggedIn,
    roleOverride,
  });
  const authorizedCases = filterAuthorizedDgaCases(dgaState.cases, dgaAuthority);
  const effectiveTab: DgaTab = canAccessDgaWorkspace(activeTab as DgaWorkspaceId, dgaAuthority).allowed
    ? activeTab
    : dgaAuthority.defaultWorkspace;

  const handleNavigateTab = (tab: string) => {
    const check = canAccessDgaWorkspace(tab as DgaWorkspaceId, dgaAuthority);
    if (!check.allowed) {
      setAccessNotice(check.reason || 'Unauthorized workspace');
      return;
    }
    setAccessNotice(null);
    setActiveTab(tab as DgaTab);
    setActiveMode('DGA_CORE');
  };

  const handleLaunchTrace = () => {
    const traceAuth = canAccessTraceLab(dgaAuthority);
    if (!traceAuth.allowed) {
      setAccessNotice(traceAuth.reason || 'TRACE Forensic Laboratory access requires verified DGA/TRACE credentials.');
      return;
    }
    setAccessNotice(null);
    setActiveMode('TRACE');
  };

  const handleSelectCase = (caseId: string) => {
    setActiveDGACase(caseId);
    setActiveTab('cases');
  };

  const handleOpenTraceWithCase = (traceCaseId: string) => {
    const traceAuth = canAccessTraceLab(dgaAuthority);
    if (!traceAuth.allowed) {
      setAccessNotice(traceAuth.reason || 'TRACE Forensic Laboratory access requires verified DGA/TRACE credentials.');
      return;
    }
    setActiveMode('TRACE');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trace:open-case', { detail: { caseId: traceCaseId } }));
    }
  };

  const handleTransmitTraceResult = async () => {
    if (!dgaAuthority.canTransmitTraceFindings) {
      setAccessNotice('Transmitting certified TRACE forensic findings requires Forensic Criminalist, Medical Liaison, or Command Director authorization.');
      setBridgeResultModalOpen(false);
      return;
    }
    const activeCase = dgaState.cases.find((c) => c.id === dgaState.activeCaseId) || dgaState.cases[0];
    const request = activeCase?.forensicRequests.find(item => item.linkedTraceCaseId || activeCase.linkedTraceCaseId);
    const traceCaseId = request?.linkedTraceCaseId || activeCase?.linkedTraceCaseId;
    if (!activeCase || !request || !traceCaseId || !demoResultSummary.trim()) {
      setAccessNotice('Select a case with a linked TRACE request and enter its report summary before transmitting.');
      return;
    }

    const received = await returnTraceResultToDga(
      activeCase.id,
      request.id,
      demoResultSummary,
      traceCaseId
    );
    if (!received) { setAccessNotice('The result does not match the originating case request. Nothing was attached.'); return; }

    setBridgeResultModalOpen(false);
    alert(`Laboratory result transmitted to DGA Case ${activeCase.id}. Case timeline and flash alerts updated.`);
  };

  const handleResetWorld = async () => {
    await resetDGAWorld();
    setIsResetConfirmOpen(false);
  };

  return (
    <div data-phone-active={activeMode === 'DGA_CORE' && activeTab === 'phone'} className="dga-shell h-full w-full flex flex-col bg-[#e8e7f0] text-[#1e1d2c] font-sans antialiased overflow-hidden select-none">
      {/* 1. COMPACT GLOBAL STATUS BAR */}
      <header className="h-[36px] min-h-[36px] max-h-[36px] bg-[#1d1b28] text-[#d4d2e5] border-b border-[#353249] px-2.5 flex items-center justify-between gap-2 text-[11px] shrink-0 select-none z-30 whitespace-nowrap overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <div className="flex items-center gap-1.5 font-bold font-mono tracking-tight text-white shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] tracking-wide">DGAOS v4.2</span>
            <span className="hidden xl:inline text-[10px] text-[#6e6b8a] font-normal">|</span>
            <span className="hidden xl:inline text-[#9491b4] text-[10.5px]">HQ-04</span>
          </div>

          {/* SIMULATION CONTROLS */}
          <div className="pl-2 border-l border-[#353249] min-w-0 shrink-0">
            <DgaSimulationControls
              simulation={dgaState.simulation}
              session={dgaState.session}
              onOpenShiftSummary={() => setIsShiftModalOpen(true)}
              onCaseCreated={handleSelectCase}
            />
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <div className="flex items-center bg-[#141320] p-0.5 rounded-[4px] border border-[#34314c] shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode('DGA_CORE')}
            aria-pressed={activeMode === 'DGA_CORE'}
            className={`h-[24px] px-2.5 rounded-[3px] text-[10.5px] font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'DGA_CORE'
                ? 'bg-[#524f77] text-white shadow-xs'
                : 'text-[#8785a8] hover:text-white hover:bg-[#201e2e]'
            }`}
          >
            <Shield className="w-3 h-3 shrink-0" />
            <span>DGA COMMAND CORE</span>
          </button>

          <button
            type="button"
            onClick={() => handleLaunchTrace()}
            aria-pressed={activeMode === 'TRACE'}
            className={`h-[24px] px-2.5 rounded-[3px] text-[10.5px] font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'TRACE'
                ? 'bg-[#524f77] text-white shadow-xs'
                : 'text-[#8785a8] hover:text-white hover:bg-[#201e2e]'
            }`}
          >
            <Beaker className="w-3 h-3 shrink-0" />
            <span>TRACE FORENSIC LAB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 shrink-0" />
          </button>
        </div>

        {/* TRACE Mode Context Badge & Fast Bridge Action in Top Bar */}
        {activeMode === 'TRACE' && (
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[10.5px] shrink-0">
            <span className="hidden 2xl:inline text-[#a4a2c2]">
              LINKED: <strong className="text-white">{dgaState.activeCaseId || 'DGA-26-194'}</strong>
            </span>
            <button
              type="button"
              onClick={() => setBridgeResultModalOpen(true)}
              className="h-[24px] px-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-[4px] border border-emerald-600 text-[10px] font-bold font-mono flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
              title="Transmit laboratory examination result directly to the originating DGA Case file"
              aria-label="Transmit result"
            >
              <Send className="w-3 h-3 shrink-0" />
              <span className="hidden xl:inline">TRANSMIT RESULT</span>
            </button>
          </div>
        )}

        {/* Right Operator Clearance & Lock Tools */}
        <div className="dga-operator-tools flex items-center gap-1.5 shrink-0">
          {isLocalWorld(location.hostname) && !osPlayer.isAdmin && (
            <button
              type="button"
              className="dga-notebook-launch"
              onClick={() => setAccessNotice(useOSStore.getState().grantLocalFullAccess().message)}
            >
              Enable full access
            </button>
          )}
          {onOpenCaseNotebook && (
            <button
              type="button"
              className="dga-notebook-launch"
              onClick={onOpenCaseNotebook}
              title="Open Broad Street evidence notebook"
            >
              <FolderLock size={13} className="shrink-0" />
              <span>Case notebook</span>
            </button>
          )}
          {/* Quick Telephone Console & Incoming Call Simulation */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('phone');
              setActiveMode('DGA_CORE');
            }}
            className={`h-[24px] px-2 rounded-[4px] flex items-center gap-1 text-[10px] font-mono border transition-colors cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-emerald-700 text-white border-emerald-500 font-bold'
                : 'bg-[#272538] hover:bg-[#36334e] text-emerald-400 hover:text-white border-[#3d3a54]'
            }`}
            title="Open Agency Phone & Voicemail Console"
          >
            <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="uppercase font-bold tracking-wider">PHONE</span>
          </button>

          <button
            type="button"
            className="dga-directory-launch"
            title="Open Service Directory"
            aria-pressed={activeMode === 'DGA_CORE' && effectiveTab === 'services'}
            onClick={() => handleNavigateTab('services')}
          >
            <Grid2X2 size={13} aria-hidden="true" className="shrink-0" />
            <span>Directory</span>
          </button>

          {/* Test Incoming Call from Agent Yumi (Shown on wide displays) */}
          <button
            type="button"
            onClick={() => {
              setIncomingCall({
                callerName: 'Special Agent Yumi Tanaka',
                callerTitle: 'Senior Digital Forensics & Video Analyst',
                callerDepartment: 'Homicide / CCTV Analysis',
                callerAvatar: 'YT',
                headlineMessage: 'I found something in the CCTV review. Check your evidence vault.',
                contactId: 'CONT-YUMI'
              });
            }}
            className="hidden 2xl:flex h-[24px] px-2 rounded-[4px] bg-[#332448] hover:bg-[#443060] text-purple-200 hover:text-white items-center gap-1 text-[10px] font-mono border border-purple-500/40 transition-colors cursor-pointer"
            title="Simulate priority incoming phone call from Agent Yumi"
          >
            <PhoneCall className="w-3 h-3 text-purple-300 shrink-0" />
            <span className="font-bold">CALL (YUMI)</span>
          </button>

          {(dgaState.unacknowledgedSimulationEventCount ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => setIsFeedDrawerOpen(true)}
              className="h-[24px] px-1.5 rounded-[4px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center gap-1 text-[9.5px] font-mono font-bold transition-all shadow-xs animate-pulse cursor-pointer"
              title={`${dgaState.unacknowledgedSimulationEventCount} new simulation events occurred in background`}
            >
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{dgaState.unacknowledgedSimulationEventCount} EVENTS</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFeedDrawerOpen(true)}
            className="h-[24px] px-2 rounded-[4px] bg-[#272538] hover:bg-[#36334e] text-[#c7c5de] hover:text-white flex items-center gap-1 text-[10px] font-mono border border-[#3d3a54] transition-colors cursor-pointer"
            title="Open Global Agency Activity Feed"
          >
            <Activity className="w-3 h-3 text-[#b2b5df] shrink-0" />
            <span className="uppercase font-bold tracking-wider">FEED</span>
            <span className="bg-[#524d77] text-white text-[8.5px] px-1 py-0.2 rounded font-bold">
              {dgaState.activityFeed.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="h-[24px] px-1.5 rounded-[4px] bg-[#1a1926] border border-[#35334a] text-[10.5px] text-[#a5a3c6] flex items-center gap-1.5 hover:text-white hover:border-[#4d4a6a] transition-colors cursor-pointer"
            title="View Agent Profile & Credentials"
          >
            <span className="hidden xl:inline text-white font-medium truncate max-w-[110px]">
              {dgaState.profile.name}
            </span>
            <span className="text-[9px] bg-amber-950/70 text-amber-300 border border-amber-800/80 px-1 rounded font-mono font-bold shrink-0">
              {dgaAuthority.roleLabel} · LVL {dgaAuthority.clearanceLevel}
            </span>
          </button>

          <div className="flex items-center gap-1 border-l border-[#37354c] pl-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setWorkstationLocked(true)}
              className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] bg-[#242335] hover:bg-[#35334a] border border-[#39374e] text-[#a8a5c6] hover:text-white transition-colors cursor-pointer"
              title="Lock Workstation Enclave"
            >
              <Lock className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] bg-[#242335] hover:bg-rose-950/70 border border-[#39374e] text-[#a8a5c6] hover:text-rose-300 hover:border-rose-800/60 transition-colors cursor-pointer"
              title="Reset Universe to Seed"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSTATION SHELL: APP RAIL + OPERATIONAL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* PERSISTENT APPLICATION NAVIGATION RAIL (Visible throughout DGA CORE & systems unless collapsed) */}
        <DgaAppRail
          currentTab={effectiveTab}
          currentMode={activeMode}
          onNavigateTab={(tab) => {
            handleNavigateTab(tab);
            setActiveMode('DGA_CORE');
          }}
          onLaunchTrace={handleLaunchTrace}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          cases={authorizedCases}
          communications={dgaState.communications}
          alerts={dgaState.alerts}
          profile={{ ...dgaState.profile, title: dgaAuthority.roleLabel, department: dgaAuthority.department, clearanceLevel: dgaAuthority.clearanceLevel }}
          isCollapsed={isRailCollapsed}
          onToggleCollapse={() => setIsRailCollapsed(!isRailCollapsed)}
        />

        {/* WORKSPACE CONTENT AREA */}
        {activeMode === 'DGA_CORE' ? (
          <main className="min-w-0 flex-1 flex flex-col overflow-hidden bg-[#e9e8f1]">
            {accessNotice && (
              <div role="status" className="bg-amber-950 text-amber-200 border-b border-amber-700 px-3 py-1.5 text-xs flex items-center justify-between shrink-0">
                <span>{accessNotice}</span>
                <button onClick={() => setAccessNotice(null)} className="text-amber-300 hover:text-white font-bold px-1">✕</button>
              </div>
            )}
            {effectiveTab === 'dashboard' && (
              <DgaDashboard
                cases={authorizedCases}
                alerts={dgaState.alerts}
                profile={dgaState.profile}
                activityFeed={dgaState.activityFeed}
                scheduledEvents={dgaState.scheduledEvents}
                communications={dgaState.communications}
                onNavigateTab={(tab: string) => {
                  handleNavigateTab(tab);
                  setActiveMode('DGA_CORE');
                }}
                onSelectCase={handleSelectCase}
                onLaunchTrace={handleLaunchTrace}
                onDismissAlert={(id: string) => dismissDGAAlert(id)}
              />
            )}

            {effectiveTab === 'cases' && (
              <DgaCaseRegistry
                cases={authorizedCases}
                selectedCaseId={dgaState.activeCaseId}
                onSelectCase={handleSelectCase}
                onOpenTraceWithCase={handleOpenTraceWithCase}
                onNavigateTab={(tab: string) => {
                  handleNavigateTab(tab);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {effectiveTab === 'operations' && <DgaOperationsWorkspace state={{ ...dgaState, cases: authorizedCases }} authority={dgaAuthority} onOpenCase={handleSelectCase} onOpenTrace={handleOpenTraceWithCase} />}

            {effectiveTab === 'assignments' && (
              <DgaWorkWorkspace
                cases={authorizedCases}
                favoriteTaskIds={dgaState.favoriteTaskIds}
                savedFilters={dgaState.savedFilters}
                automationRules={dgaState.automationRules}
                caseTemplates={dgaState.caseTemplates}
                onSelectCase={(caseId) => {
                  handleSelectCase(caseId);
                  setActiveTab('cases');
                }}
              />
            )}

            {effectiveTab === 'comms' && (
              <DgaCommsHub
                messages={dgaState.communications}
                cases={authorizedCases}
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  handleNavigateTab(tab);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {effectiveTab === 'phone' && (
              <DgaPhoneConsole
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  handleNavigateTab(tab);
                  setActiveMode('DGA_CORE');
                }}
                activeContactIdOverride={phoneActiveContactOverride}
              />
            )}

            {effectiveTab === 'medstat' && (
              <DgaMedicalChart
                cases={authorizedCases}
                activeCaseId={dgaState.activeCaseId}
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  handleNavigateTab(tab);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {effectiveTab === 'investigation' && (
              <DgaInvestigationHub
                onOpenCase={handleSelectCase}
                onLaunchTrace={handleLaunchTrace}
              />
            )}

            {effectiveTab === 'intelligence' && (
              <DgaIntelligenceHub
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  handleNavigateTab(tab);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {effectiveTab === 'government' && (
              <DgaGovernmentHub
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  handleNavigateTab(tab);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {effectiveTab === 'services' && <DgaServiceWorkspace/>}
            {effectiveTab === 'extranet' && (
              <DgaExtranetBrowser
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  handleNavigateTab(tab);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {effectiveTab === 'world' && (
              <DgaWorldViewer
                people={dgaState.people}
                organizations={dgaState.organizations}
                locations={dgaState.locations}
                relationships={dgaState.relationships}
              />
            )}
          </main>
        ) : (
          /* TRACE FORENSIC LABORATORY SUITE - MOUNTED DIRECTLY & FULLSCREEN */
          <div className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
            <div className="flex-1 overflow-auto w-full h-full">
              {traceWorkbenchNode}
            </div>
          </div>
        )}
      </div>

      {/* AGENT PROFILE MODAL */}
      <DgaAgentProfileModal
        profile={dgaState.profile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* TRANSMIT RESULT MODAL */}
      {bridgeResultModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#cfcddb] rounded-lg max-w-md w-full p-5 shadow-2xl space-y-3 text-xs">
            <div className="font-bold text-sm text-[#1f1e30] flex items-center gap-2 border-b border-[#cfcddb] pb-2">
              <Beaker className="w-4 h-4 text-[#5d5a86]" />
              Transmit TRACE Forensic Findings to DGA Case
            </div>

            <div>
              <label className="block font-semibold text-[#3a3854] mb-1">
                TARGET DGA CASE
              </label>
              <input
                type="text"
                disabled
                value={dgaState.activeCaseId || 'No case selected'}
                className="w-full bg-[#f4f3f8] border border-[#cfcddb] rounded px-3 py-1.5 text-xs font-mono text-[#252438]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3a3854] mb-1">
                LAB EXAMINATION RESULT SUMMARY
              </label>
              <textarea
                rows={4}
                value={demoResultSummary}
                onChange={(e) => setDemoResultSummary(e.target.value)}
                className="w-full bg-white border border-[#cfcddb] rounded p-2 text-xs text-[#201f30] focus:outline-none focus:border-[#7c79a8]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0eff5]">
              <button
                onClick={() => setBridgeResultModalOpen(false)}
                className="px-3 py-1 border border-[#cfcddb] rounded text-[#555370] hover:bg-[#f4f3f8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleTransmitTraceResult}
                className="px-3.5 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRM & TRANSMIT TO DGA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET WORLD STATE MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#cfcddb] rounded-lg max-w-sm w-full p-4 shadow-2xl space-y-3 text-xs">
            <div className="font-bold text-sm text-rose-700 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset DGAOS World Universe?
            </div>
            <p className="text-[#555370] leading-relaxed text-[11px]">
              This will restore all cases, evidence, dispatches, and world state entities back to the canonical starting seed universe.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0eff5]">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1 border border-[#cfcddb] rounded text-[#555370] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetWorld}
                className="px-3.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded cursor-pointer"
              >
                Reset Universe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIFT SUMMARY MODAL */}
      <DgaShiftSummaryModal
        session={dgaState.session}
        profile={dgaState.profile}
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />

      {/* OFFLINE PROGRESSION MODAL */}
      {dgaState.simulation.offlineEventsSummary && !isOfflineModalDismissed && (
        <DgaOfflineModal
          offlineSummary={dgaState.simulation.offlineEventsSummary}
          onClose={() => setIsOfflineModalDismissed(true)}
        />
      )}

      {/* AGENCY ACTIVITY FEED DRAWER */}
      <DgaAgencyFeedDrawer
        activityFeed={dgaState.activityFeed}
        isOpen={isFeedDrawerOpen}
        onClose={() => setIsFeedDrawerOpen(false)}
        onSelectCase={handleSelectCase}
        unacknowledgedCount={dgaState.unacknowledgedSimulationEventCount ?? 0}
        onAcknowledgeAll={async () => {
          await acknowledgeSimulationEvents();
        }}
      />

      {/* INCOMING PRIORITY TELEPHONY CALL MODAL */}
      {incomingCall && (
        <DgaIncomingCallModal
          callerName={incomingCall.callerName}
          callerTitle={incomingCall.callerTitle}
          callerDepartment={incomingCall.callerDepartment}
          callerAvatar={incomingCall.callerAvatar}
          headlineMessage={incomingCall.headlineMessage}
          onAccept={() => {
            const contactId = incomingCall.contactId;
            setIncomingCall(null);
            setPhoneActiveContactOverride(contactId);
            setActiveTab('phone');
            setActiveMode('DGA_CORE');
          }}
          onDecline={() => {
            const callData = incomingCall;
            setIncomingCall(null);
            if (callData) {
              void recordMissedCall({
                ...callData,
                caseId: dgaState?.activeCaseId || 'DGA-26-194'
              });
            }
          }}
        />
      )}
    </div>
  );
}
