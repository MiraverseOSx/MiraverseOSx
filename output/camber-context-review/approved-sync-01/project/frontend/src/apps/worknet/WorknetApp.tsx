import React, { useEffect } from 'react';
import {
  Shield, Building, Briefcase, FileText, Calendar, Users, Award, ChevronDown, CheckCircle2,
  FolderOpen, Layers, Activity, BookOpen, Cpu, Landmark, Stethoscope, Compass, Sparkles, Sliders, Bell
} from 'lucide-react';
import { useCommsStore } from '../../store/useCommsStore';
import { useOSStore } from '../../store/useOSStore';
import { INSTITUTIONAL_REGISTRY } from './worknetData';
import { useWorknetAppearance } from './useWorknetAppearance';
import { employed, stationTrack } from './workplaceModel';
import { useWorknetState, type WorknetTabId } from './useWorknetState';
import type { WorkplaceStationId } from '../JobWorkstationApp';

import WorknetOverview from './sections/WorknetOverview';
import WorknetOpportunities from './sections/WorknetOpportunities';
import WorknetMyWork from './sections/WorknetMyWork';
import WorknetWorkplace from './sections/WorknetWorkplace';
import WorknetCareerRecord from './sections/WorknetCareerRecord';
import WorknetSchedule from './sections/WorknetSchedule';
import WorknetCivicNotices from './sections/WorknetCivicNotices';
import WorknetDepartments from './sections/WorknetDepartments';

import '../../styles/worknet.css';

interface WorknetAppProps {
  initialRevision?: number;
  initialStation?: WorkplaceStationId;
  initialTab?: WorknetTabId;
  initialMissionId?: string;
  onOpenMission?: (id: string) => void;
}

export default function WorknetApp({
  initialRevision = 0,
  initialStation,
  initialTab,
  initialMissionId,
  onOpenMission
}: WorknetAppProps) {
  const { appearance, setAppearance, resolvedAppearance } = useWorknetAppearance();
  const dispatchCount = useCommsStore(s => s.emails.filter(mail => !mail.read && !['trash','spam','archive'].includes(mail.folder) && (mail.faction === 'WORKNET' || String(mail.id).startsWith('JOB-'))).length);
  const player = useOSStore(s => s.gameplay.player);

  const {
    activeStation,
    setActiveStation,
    activeTab,
    setActiveTab,
    selectedMissionId,
    setSelectedMissionId,
    actionFeedback,
    setActionFeedback,
    showFeedback,
    coworkerStats,
    scheduleItems,
    leaveRequests,
    resolvedEventIds,
    breakRoomVisitCount,
    delegatedTasks,
    subordinateLeaves,
    divisionBudgets,
    interactWithCoworker,
    cycleCoworkerStatus,
    delegateTaskToCoworker,
    reviewDelegatedDocket,
    reviewSubordinateLeave,
    updateDivisionBudget,
    claimBaseStipends,
    selectPathway,
    resolveDynamicWorkplaceEvent,
    requestLeave,
    visitBreakRoom
  } = useWorknetState();

  // Initialize from props if provided
  useEffect(() => {
    if (initialStation) setActiveStation(initialStation);
    if (initialTab) setActiveTab(initialTab);
    if (initialMissionId) setSelectedMissionId(initialMissionId);
  }, [initialStation, initialTab, initialMissionId, initialRevision]);

  const currentTheme = INSTITUTIONAL_REGISTRY[activeStation] || INSTITUTIONAL_REGISTRY.dga;
  const InstIcon = currentTheme.icon;
  const affiliated = employed(player, activeStation);
  const activeContract = player.employmentContracts?.[stationTrack(activeStation)];

  const handleOpenMission = (id: string) => {
    setSelectedMissionId(id);
    setActiveTab('opportunities');
    if (onOpenMission) onOpenMission(id);
  };

  return (
    <div
      className="worknet-enterprise-shell"
      data-appearance={resolvedAppearance}
      style={{
        '--wn-inst-accent': currentTheme.accentColor,
        '--wn-inst-header-bg': currentTheme.headerBg,
        '--wn-inst-badge-bg': currentTheme.badgeBg,
        '--wn-inst-badge-border': currentTheme.badgeBorder,
        '--wn-inst-badge-text': currentTheme.badgeText
      } as React.CSSProperties}
    >
      {/* Top Institutional Header */}
      <header className="worknet-top-header">
        <div className="worknet-brand-section">
          <div className="worknet-logo-badge">
            <InstIcon size={18} />
          </div>
          <div className="worknet-title-group">
            <h1>
              <span>WorkNet</span>
              <span className="worknet-network-pill">Federal career network</span>
            </h1>
            <p>{currentTheme.fullName}</p>
          </div>
        </div>

        {/* Workplace Switcher (Option A - Confirmed) */}
        <div className="worknet-switcher-container">
          <label htmlFor="worknet-workplace-switcher" className="worknet-switcher-label">Workplace</label>
          <select
            id="worknet-workplace-switcher" aria-label="Workplace Switcher"
            value={activeStation}
            onChange={e => {
              const nextStation = e.target.value as WorkplaceStationId;
              setActiveStation(nextStation);
              setActionFeedback(null);
            }}
            className="worknet-switcher-select"
          >
            {Object.values(INSTITUTIONAL_REGISTRY).map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.shortOrg} — {inst.name}
              </option>
            ))}
          </select>
        </div>

        <label className="wn-appearance-control">Appearance<select aria-label="WORKNET appearance" value={appearance} onChange={e => setAppearance(e.target.value as 'light' | 'dark' | 'system')}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label>
        {/* Metric Chips & Balances */}
        <div className="worknet-header-right">
          <div className="worknet-metric-chip">
            <small>Credits</small>
            <span>{(player?.credits ?? 500).toLocaleString()} <i>₢</i></span>
          </div>
          <div className="worknet-metric-chip">
            <small>Bits</small>
            <span>{(player?.bits ?? 25).toLocaleString()} <i>◈</i></span>
          </div>
          <div className="worknet-metric-chip">
            <small>Clearance</small>
            <span>Tier {player?.clearanceLevel ?? 2}</span>
          </div>
        </div>
        <button className="wn-dispatch-button" aria-label={`Employment dispatches in AureMail: ${dispatchCount} unread`} onClick={() => useOSStore.getState().openWindow('mail')}><Bell size={19}/>{dispatchCount > 0 && <span>{dispatchCount}</span>}</button>
      </header>

      {/* Permanent Navigation Bar (8 Permanent Sections) */}
      <nav className="worknet-nav-bar" aria-label="WORKNET Sections">
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'overview'}
          aria-current={activeTab === 'overview' ? 'page' : undefined}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={14} /> Overview
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'opportunities'}
          aria-current={activeTab === 'opportunities' ? 'page' : undefined}
          onClick={() => setActiveTab('opportunities')}
        >
          <Briefcase size={14} /> Opportunities
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'my-work'}
          aria-current={activeTab === 'my-work' ? 'page' : undefined}
          onClick={() => setActiveTab('my-work')}
        >
          <FileText size={14} /> My Work
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'workplace'}
          aria-current={activeTab === 'workplace' ? 'page' : undefined}
          onClick={() => setActiveTab('workplace')}
        >
          <Building size={14} /> Workplace
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'career-record'}
          aria-current={activeTab === 'career-record' ? 'page' : undefined}
          onClick={() => setActiveTab('career-record')}
        >
          <Award size={14} /> Career Record
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'schedule'}
          aria-current={activeTab === 'schedule' ? 'page' : undefined}
          onClick={() => setActiveTab('schedule')}
        >
          <Calendar size={14} /> Schedule
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'civic-notices'}
          aria-current={activeTab === 'civic-notices' ? 'page' : undefined}
          onClick={() => setActiveTab('civic-notices')}
        >
          <CheckCircle2 size={14} /> Civic Notices
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'departments'}
          aria-current={activeTab === 'departments' ? 'page' : undefined}
          onClick={() => setActiveTab('departments')}
        >
          <Layers size={14} /> Departments
        </button>
      </nav>

      <div className="wn-workspace-context"><span><span className="wn-context-dot"/>{currentTheme.fullName}</span><span>{affiliated ? activeContract?.pathwayChoice === 'supervisor' ? 'Supervisor workspace' : 'Specialist workspace' : activeContract ? 'Employment on record · access review required' : 'Visitor view · employment not yet accepted'}</span></div>
      {/* Global Alert Strip */}
      {actionFeedback && (
        <div className="worknet-alert-strip" role="status">
          <span>{actionFeedback}</span>
          <button aria-label="Dismiss message" onClick={() => setActionFeedback(null)}>
            ×
          </button>
        </div>
      )}

      {/* Body Viewport */}
      <div className="worknet-body-container">
        {activeTab === 'overview' && (
          <WorknetOverview
            onOpenMission={handleOpenMission}
            onSwitchWorkplace={setActiveStation}
            activeStation={activeStation}
            onNavigate={setActiveTab}
            onResolveDynamicEvent={resolveDynamicWorkplaceEvent}
            onVisitBreakRoom={visitBreakRoom}
            onClaimBaseStipends={claimBaseStipends}
            resolvedEventIds={resolvedEventIds}
          />
        )}

        {activeTab === 'opportunities' && (
          <WorknetOpportunities
            onNavigate={setActiveTab}
            onOpenDepartment={station => { setActiveStation(station); setActiveTab('departments'); }}
            activeStation={activeStation}
            selectedMissionId={selectedMissionId}
            onSelectMission={setSelectedMissionId}
            onFeedback={showFeedback}
          />
        )}

        {activeTab === 'my-work' && (
          <WorknetMyWork
            onOpenOpportunity={handleOpenMission}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'workplace' && (
          <WorknetWorkplace
            activeStation={activeStation}
            coworkerStats={coworkerStats}
            delegatedTasks={delegatedTasks}
            subordinateLeaves={subordinateLeaves}
            divisionBudgets={divisionBudgets}
            onInteractCoworker={interactWithCoworker}
            onCycleCoworkerStatus={cycleCoworkerStatus}
            onDelegateTask={delegateTaskToCoworker}
            onReviewDelegatedDocket={reviewDelegatedDocket}
            onReviewSubordinateLeave={reviewSubordinateLeave}
            onUpdateDivisionBudget={updateDivisionBudget}
            onVisitBreakRoom={visitBreakRoom}
            breakRoomVisitCount={breakRoomVisitCount}
            onFeedback={showFeedback}
          />
        )}

        {activeTab === 'career-record' && (
          <WorknetCareerRecord
            onSwitchWorkplace={setActiveStation}
            activeStation={activeStation}
            onClaimBaseStipends={claimBaseStipends}
            onSelectPathway={selectPathway}
            onFeedback={showFeedback}
          />
        )}

        {activeTab === 'schedule' && (
          <WorknetSchedule
            scheduleItems={scheduleItems}
            leaveRequests={leaveRequests}
            onRequestLeave={requestLeave}
            onFeedback={showFeedback}
          />
        )}

        {activeTab === 'civic-notices' && (
          <WorknetCivicNotices />
        )}

        {activeTab === 'departments' && (
          <WorknetDepartments
            activeStation={activeStation}
            onFeedback={showFeedback}
          />
        )}
      </div>
    </div>
  );
}
