import React, { useEffect } from 'react';
import {
  Shield, Building, Briefcase, FileText, Calendar, Users, Award, ChevronDown, CheckCircle2,
  FolderOpen, Layers, Activity, BookOpen, Cpu, Landmark, Stethoscope, Compass, Sparkles
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { INSTITUTIONAL_REGISTRY } from './worknetData';
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
  initialStation?: WorkplaceStationId;
  initialTab?: WorknetTabId;
  initialMissionId?: string;
  onOpenMission?: (id: string) => void;
}

export default function WorknetApp({
  initialStation,
  initialTab,
  initialMissionId,
  onOpenMission
}: WorknetAppProps) {
  const player = useOSStore(s => s.gameplay.player);
  const workspaceRequest = useOSStore(s => s.workspaceRequests.jobs);

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
    interactWithCoworker,
    resolveDynamicWorkplaceEvent,
    requestLeave,
    visitBreakRoom
  } = useWorknetState();

  // Initialize from props if provided
  useEffect(() => {
    if (initialStation) setActiveStation(initialStation);
    if (initialTab) setActiveTab(initialTab);
    if (initialMissionId) setSelectedMissionId(initialMissionId);
  }, [initialStation, initialTab, initialMissionId]);

  // Handle workspaceRequests from desktop or external apps
  useEffect(() => {
    if (!workspaceRequest) return;
    if (workspaceRequest.section === 'notices') {
      setActiveTab('civic-notices');
    } else if (workspaceRequest.section === 'civic-jobs') {
      setActiveStation('questnotice');
      setActiveTab('opportunities');
    } else if (workspaceRequest.section === 'workplace') {
      setActiveTab('workplace');
    } else if (workspaceRequest.section === 'overview') {
      setActiveTab('overview');
    } else if (workspaceRequest.section === 'schedule') {
      setActiveTab('schedule');
    } else if (workspaceRequest.section === 'career') {
      setActiveTab('career-record');
    }
    useOSStore.getState().consumeWorkspaceRequest('jobs', workspaceRequest.revision);
  }, [workspaceRequest]);

  const currentTheme = INSTITUTIONAL_REGISTRY[activeStation] || INSTITUTIONAL_REGISTRY.dga;
  const InstIcon = currentTheme.icon;

  const handleOpenMission = (id: string) => {
    setSelectedMissionId(id);
    setActiveTab('opportunities');
    if (onOpenMission) onOpenMission(id);
  };

  return (
    <div
      className="worknet-enterprise-shell"
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
              <span>WORKNET</span>
              <span className="worknet-network-pill">Federal Employment Network</span>
            </h1>
            <p>{currentTheme.fullName}</p>
          </div>
        </div>

        {/* Workplace Switcher (Option A - Confirmed) */}
        <div className="worknet-switcher-container">
          <span className="worknet-switcher-label">Active Workplace:</span>
          <select
            aria-label="Workplace Switcher"
            value={activeStation}
            onChange={e => {
              const nextStation = e.target.value as WorkplaceStationId;
              setActiveStation(nextStation);
              showFeedback(`Switched active workplace to ${INSTITUTIONAL_REGISTRY[nextStation]?.name || nextStation}. Environment updated.`);
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
      </header>

      {/* Permanent Navigation Bar (8 Permanent Sections) */}
      <nav className="worknet-nav-bar" aria-label="WORKNET Sections">
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={14} /> Overview
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'opportunities'}
          onClick={() => setActiveTab('opportunities')}
        >
          <Briefcase size={14} /> Opportunities
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'my-work'}
          onClick={() => setActiveTab('my-work')}
        >
          <FileText size={14} /> My Work
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'workplace'}
          onClick={() => setActiveTab('workplace')}
        >
          <Building size={14} /> Workplace (Life)
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'career-record'}
          onClick={() => setActiveTab('career-record')}
        >
          <Award size={14} /> Career Record
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'schedule'}
          onClick={() => setActiveTab('schedule')}
        >
          <Calendar size={14} /> Schedule
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'civic-notices'}
          onClick={() => setActiveTab('civic-notices')}
        >
          <CheckCircle2 size={14} /> Civic Notices
        </button>
        <button
          className="worknet-nav-btn"
          data-active={activeTab === 'departments'}
          onClick={() => setActiveTab('departments')}
        >
          <Layers size={14} /> Departments
        </button>
      </nav>

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
            activeStation={activeStation}
            onNavigate={setActiveTab}
            onResolveDynamicEvent={resolveDynamicWorkplaceEvent}
            onVisitBreakRoom={visitBreakRoom}
            resolvedEventIds={resolvedEventIds}
          />
        )}

        {activeTab === 'opportunities' && (
          <WorknetOpportunities
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
            onInteractCoworker={interactWithCoworker}
            onVisitBreakRoom={visitBreakRoom}
            breakRoomVisitCount={breakRoomVisitCount}
            onFeedback={showFeedback}
          />
        )}

        {activeTab === 'career-record' && (
          <WorknetCareerRecord
            activeStation={activeStation}
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
