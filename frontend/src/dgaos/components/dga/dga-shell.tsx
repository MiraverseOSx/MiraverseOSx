'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
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

export type DgaTab =
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
}

export function DgaShell({ traceWorkbenchNode }: DgaShellProps) {
  const workspaceRequest = useOSStore(s => s.workspaceRequests.dgaos);
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
  const [demoResultSummary, setDemoResultSummary] = useState(
    'Confirmation of synthetic fluorophosphate derivative. Structural profile indicates synthesis batch synthesized at Phoenix Biotech harbor facilities.'
  );

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
      runSimulationTick();
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

  const handleLaunchTrace = () => {
    setActiveMode('TRACE');
  };

  const handleSelectCase = (caseId: string) => {
    setActiveDGACase(caseId);
    setActiveTab('cases');
  };

  const handleOpenTraceWithCase = (traceCaseId: string) => {
    setActiveMode('TRACE');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trace:open-case', { detail: { caseId: traceCaseId } }));
    }
  };

  const handleTransmitTraceResult = async () => {
    const activeCase = dgaState.cases.find((c) => c.id === dgaState.activeCaseId) || dgaState.cases[0];
    const freqId = activeCase.forensicRequests[0]?.id || 'FREQ-194-01';

    await returnTraceResultToDga(
      activeCase.id,
      freqId,
      demoResultSummary,
      activeCase.linkedTraceCaseId || 'FS-2026-00422'
    );

    setBridgeResultModalOpen(false);
    alert(`Laboratory result transmitted to DGA Case ${activeCase.id}. Case timeline and flash alerts updated.`);
  };

  const handleResetWorld = async () => {
    await resetDGAWorld();
    setIsResetConfirmOpen(false);
  };

  return (
    <div data-phone-active={activeMode === 'DGA_CORE' && activeTab === 'phone'} className="dga-shell h-full w-full flex flex-col bg-[#e8e7f0] text-[#1e1d2c] font-sans antialiased overflow-hidden select-none">
      {/* 1. COMPACT GLOBAL STATUS BAR (Responsive, zero cutoff on laptop resolutions) */}
      <header className="h-[32px] min-h-[32px] max-h-[32px] bg-[#21202e] text-[#d4d2e5] border-b border-[#343247] px-2 flex items-center justify-between gap-1.5 text-[11px] shrink-0 select-none z-30 whitespace-nowrap overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-0 shrink">
          <div className="flex items-center gap-1 font-bold font-mono tracking-tight text-white shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px]">DGAOS v4.2</span>
            <span className="hidden xl:inline text-[10px] text-[#8e8cae] font-normal">|</span>
            <span className="hidden xl:inline text-[#a4a2c4] text-[10.5px]">HQ-04</span>
          </div>

          {/* SIMULATION CONTROLS */}
          <div className="pl-1.5 border-l border-[#37354c] min-w-0 shrink">
            <DgaSimulationControls
              simulation={dgaState.simulation}
              session={dgaState.session}
              onOpenShiftSummary={() => setIsShiftModalOpen(true)}
              onCaseCreated={handleSelectCase}
            />
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <div className="flex items-center bg-[#15141e] p-0.5 rounded-[3px] border border-[#353349] shrink-0">
          <button
            onClick={() => setActiveMode('DGA_CORE')}
            className={`h-[22px] px-[6px] rounded-[2px] text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeMode === 'DGA_CORE'
                ? 'bg-[#524f77] text-white shadow-xs'
                : 'text-[#8482a4] hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>DGA COMMAND CORE</span>
          </button>

          <button
            onClick={() => setActiveMode('TRACE')}
            className={`h-[22px] px-[6px] rounded-[2px] text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeMode === 'TRACE'
                ? 'bg-[#524f77] text-white shadow-xs'
                : 'text-[#8482a4] hover:text-white'
            }`}
          >
            <Beaker className="w-3 h-3" />
            <span>TRACE FORENSIC LAB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>
        </div>

        {/* TRACE Mode Context Badge & Fast Bridge Action in Top Bar */}
        {activeMode === 'TRACE' && (
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[10.5px] shrink-0">
            <span className="hidden 2xl:inline text-[#a4a2c2]">
              LINKED: <strong className="text-white">{dgaState.activeCaseId || 'DGA-26-194'}</strong>
            </span>
            <button
              onClick={() => setBridgeResultModalOpen(true)}
              className="h-[22px] px-[6px] bg-emerald-700 hover:bg-emerald-600 text-white rounded-[3px] text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
              title="Transmit laboratory examination result directly to the originating DGA Case file"
              aria-label="Transmit result"
            >
              <Send className="w-3 h-3" />
              <span className="hidden xl:inline">TRANSMIT RESULT</span>
            </button>
          </div>
        )}

        {/* Right Operator Clearance & Lock Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Telephone Console & Incoming Call Simulation */}
          <button
            onClick={() => {
              setActiveTab('phone');
              setActiveMode('DGA_CORE');
            }}
            className={`h-[22px] px-[6px] rounded-[3px] flex items-center gap-1 text-[10.5px] font-mono border transition-colors cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-emerald-700 text-white border-emerald-500 font-bold'
                : 'bg-[#2b2a3d] hover:bg-[#38374e] text-emerald-300 hover:text-white border-[#3d3b54]'
            }`}
            title="Open Agency Phone & Voicemail Console"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span className="hidden 2xl:inline text-[9.5px] uppercase font-bold tracking-wider">PHONE</span>
          </button>

          {/* Test Incoming Call from Agent Yumi (Shown on wide displays) */}
          <button
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
            className="hidden 2xl:flex h-[22px] px-[6px] rounded-[3px] bg-[#392e54] hover:bg-[#483a69] text-purple-200 hover:text-white items-center gap-1 text-[10px] font-mono border border-[#57467e] transition-colors cursor-pointer animate-pulse"
            title="Simulate priority incoming phone call from Agent Yumi"
          >
            <PhoneCall className="w-3 h-3 text-purple-300" />
            <span className="font-bold">CALL (YUMI)</span>
          </button>

          {(dgaState.unacknowledgedSimulationEventCount ?? 0) > 0 && (
            <button
              onClick={() => setIsFeedDrawerOpen(true)}
              className="h-[22px] px-1.5 rounded-[3px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center gap-1 text-[9.5px] font-mono font-bold transition-all shadow-xs animate-pulse cursor-pointer"
              title={`${dgaState.unacknowledgedSimulationEventCount} new simulation events occurred in background`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{dgaState.unacknowledgedSimulationEventCount} EVENTS</span>
            </button>
          )}

          <button
            onClick={() => setIsFeedDrawerOpen(true)}
            className="h-[22px] px-[6px] rounded-[3px] bg-[#2b2a3d] hover:bg-[#38374e] text-[#c7c5dd] hover:text-white flex items-center gap-1 text-[10px] font-mono border border-[#3d3b54] transition-colors cursor-pointer"
            title="Open Global Agency Activity Feed"
          >
            <Activity className="w-3 h-3 text-[#b2b5df]" />
            <span className="hidden xl:inline text-[9.5px] uppercase font-bold tracking-wider">FEED</span>
            <span className="bg-[#58537d] text-white text-[8.5px] px-1 py-0.2 rounded font-bold">
              {dgaState.activityFeed.length}
            </span>
          </button>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-[10.5px] text-[#9a98b9] flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            title="View Agent Profile & Credentials"
          >
            <span className="hidden xl:inline text-white font-medium truncate max-w-[110px]">
              {dgaState.profile.name}
            </span>
            <span className="text-[9.5px] bg-amber-950/60 text-amber-300 border border-amber-800/80 px-1 rounded font-mono font-bold shrink-0">
              LVL {dgaState.profile.clearanceLevel}
            </span>
          </button>

          <div className="flex items-center gap-1 border-l border-[#37354c] pl-1 shrink-0">
            <button
              onClick={() => setWorkstationLocked(true)}
              className="w-[22px] h-[22px] flex items-center justify-center rounded-[3px] hover:bg-[#323045] text-[#a9a7c6] hover:text-white transition-colors cursor-pointer"
              title="Lock Workstation Enclave"
            >
              <Lock className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-[22px] h-[22px] flex items-center justify-center rounded-[3px] hover:bg-rose-950/70 text-[#a9a7c6] hover:text-rose-300 transition-colors cursor-pointer"
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
          currentTab={activeTab}
          currentMode={activeMode}
          onNavigateTab={(tab) => {
            setActiveTab(tab as any);
            setActiveMode('DGA_CORE');
          }}
          onLaunchTrace={handleLaunchTrace}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          cases={dgaState.cases}
          communications={dgaState.communications}
          alerts={dgaState.alerts}
          profile={dgaState.profile}
          isCollapsed={isRailCollapsed}
          onToggleCollapse={() => setIsRailCollapsed(!isRailCollapsed)}
        />

        {/* WORKSPACE CONTENT AREA */}
        {activeMode === 'DGA_CORE' ? (
          <main className="min-w-0 flex-1 flex flex-col overflow-hidden bg-[#e9e8f1]">
            {activeTab === 'dashboard' && (
              <DgaDashboard
                cases={dgaState.cases}
                alerts={dgaState.alerts}
                profile={dgaState.profile}
                activityFeed={dgaState.activityFeed}
                scheduledEvents={dgaState.scheduledEvents}
                communications={dgaState.communications}
                onNavigateTab={(tab: string) => {
                  setActiveTab(tab as any);
                  setActiveMode('DGA_CORE');
                }}
                onSelectCase={handleSelectCase}
                onLaunchTrace={handleLaunchTrace}
                onDismissAlert={(id: string) => dismissDGAAlert(id)}
              />
            )}

            {activeTab === 'cases' && (
              <DgaCaseRegistry
                cases={dgaState.cases}
                selectedCaseId={dgaState.activeCaseId}
                onSelectCase={handleSelectCase}
                onOpenTraceWithCase={handleOpenTraceWithCase}
                onNavigateTab={(tab: string) => {
                  setActiveTab(tab as any);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {activeTab === 'assignments' && (
              <DgaWorkWorkspace
                cases={dgaState.cases}
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

            {activeTab === 'comms' && (
              <DgaCommsHub
                messages={dgaState.communications}
                cases={dgaState.cases}
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  setActiveTab(tab as any);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {activeTab === 'phone' && (
              <DgaPhoneConsole
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  setActiveTab(tab as any);
                  setActiveMode('DGA_CORE');
                }}
                activeContactIdOverride={phoneActiveContactOverride}
              />
            )}

            {activeTab === 'medstat' && (
              <DgaMedicalChart
                cases={dgaState.cases}
                activeCaseId={dgaState.activeCaseId}
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  setActiveTab(tab as any);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {activeTab === 'investigation' && (
              <DgaInvestigationHub
                onOpenCase={handleSelectCase}
                onLaunchTrace={handleLaunchTrace}
              />
            )}

            {activeTab === 'intelligence' && (
              <DgaIntelligenceHub
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  setActiveTab(tab as any);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {activeTab === 'government' && (
              <DgaGovernmentHub
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  setActiveTab(tab as any);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {activeTab === 'services' && <DgaServiceWorkspace/>}
            {activeTab === 'extranet' && (
              <DgaExtranetBrowser
                onOpenCase={handleSelectCase}
                onNavigateTab={(tab: string) => {
                  setActiveTab(tab as any);
                  setActiveMode('DGA_CORE');
                }}
              />
            )}

            {activeTab === 'world' && (
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
                value={dgaState.activeCaseId || 'DGA-26-194'}
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
