import React from 'react';
import {
  Briefcase, Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight,
  Shield, UserCheck, Coffee, FileText, ArrowRight, Activity, Zap
} from 'lucide-react';
import { useOSStore } from '../../../store/useOSStore';
import { INSTITUTIONAL_REGISTRY, CANONICAL_DYNAMIC_EVENTS } from '../worknetData';
import type { WorkplaceStationId } from '../../JobWorkstationApp';
import type { WorknetTabId } from '../useWorknetState';

interface WorknetOverviewProps {
  activeStation: WorkplaceStationId;
  onNavigate: (tab: WorknetTabId) => void;
  onResolveDynamicEvent: (id: string) => void;
  onVisitBreakRoom: () => void;
  resolvedEventIds: string[];
}

export default function WorknetOverview({
  activeStation,
  onNavigate,
  onResolveDynamicEvent,
  onVisitBreakRoom,
  resolvedEventIds
}: WorknetOverviewProps) {
  const player = useOSStore(s => s.gameplay.player);
  const timeCycle = useOSStore(s => s.gameplay.timeCycleCount);
  const theme = INSTITUTIONAL_REGISTRY[activeStation] || INSTITUTIONAL_REGISTRY.dga;

  // Active contracts across all employers
  const contracts = player.employmentContracts || {};
  const activeContractsList = Object.values(contracts);

  // Active dynamic events for this station
  const stationEvents = CANONICAL_DYNAMIC_EVENTS.filter(e => e.stationId === activeStation);

  // Active work orders count
  const activeOrders = Object.values(player.worknetOrders || {}).filter(o => o.status === 'active');
  const completedCount = player.completedWorknetMissionIds?.length || 0;

  return (
    <div className="worknet-view-scroll">
      {/* Top Welcome Banner */}
      <div
        className="worknet-card"
        style={{
          borderLeft: `4px solid ${theme.accentColor}`,
          background: `linear-gradient(to right, #ffffff, ${theme.badgeBg})`
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="worknet-kicker" style={{ color: theme.accentColor }}>
              {theme.shortOrg} Operations Desk · Cycle {timeCycle}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Welcome back to {theme.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-width-xl">
              {theme.tagline}. Your verified personnel standing and departmental duties are synchronized across the federal network.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="worknet-badge">
              <Shield size={12} /> Clearance Level {player.clearanceLevel ?? 2}
            </span>
            <span className="worknet-badge" style={{ background: theme.badgeBg, color: theme.badgeText, borderColor: theme.badgeBorder }}>
              {theme.shortOrg} Active
            </span>
          </div>
        </div>

        {/* Quick Duty Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Assignments</span>
            <p className="font-bold text-slate-800 text-sm">{activeOrders.length} in progress</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Accepted Work Orders</span>
            <p className="font-bold text-slate-800 text-sm">{completedCount} cleared</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Affiliated Employers</span>
            <p className="font-bold text-slate-800 text-sm">{activeContractsList.length || 1} position(s)</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Stamina Reserves</span>
            <p className="font-bold text-emerald-700 text-sm">{player.stamina} / 100</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Multi-Employer Careers & Today's Shift */}
      <div className="worknet-grid-2">
        {/* Multi-Employer Career Card */}
        <div className="worknet-card">
          <div className="worknet-card-header">
            <h3 className="worknet-card-title">
              <Briefcase size={16} className="text-slate-600" />
              Multi-Employer Positions & Affiliations
            </h3>
            <button className="text-xs text-slate-500 hover:text-slate-800 font-medium" onClick={() => onNavigate('career-record')}>
              View Records →
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Meridion citizens may maintain separate employment records, authorizations, and supervisor reviews across certified institutions.
          </p>

          <div className="space-y-2">
            {activeContractsList.length > 0 ? (
              activeContractsList.map(contract => (
                <div key={contract.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{contract.position}</span>
                    <p className="text-[11px] text-slate-500">{contract.track.toUpperCase()} Division · {contract.schedule}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-amber-900">No formally accepted shift contract yet.</span>
                <p className="text-[11px] text-amber-800">
                  You are eligible for open assignments and specialist missions. To accept permanent shifts, open Opportunities.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('opportunities')}
            className="worknet-btn-secondary w-full mt-3 justify-center text-xs"
          >
            Browse New Positions & Opportunities <ArrowRight size={13} />
          </button>
        </div>

        {/* Dynamic Workplace Conditions & Alerts */}
        <div className="worknet-card">
          <div className="worknet-card-header">
            <h3 className="worknet-card-title">
              <Zap size={16} className="text-amber-600" />
              Live Department Conditions & Surge Work
            </h3>
            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Option C Simulation
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Real-time departmental responsibilities arising from staffing shortages, equipment telemetry anomalies, and service requests.
          </p>

          <div className="space-y-2">
            {stationEvents.map(event => {
              const isResolved = resolvedEventIds.includes(event.id);
              return (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border text-xs transition ${
                    isResolved
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-amber-200 shadow-2xs hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{event.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {isResolved ? '✓ Resolved' : event.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    {event.description}
                  </p>
                  {!isResolved ? (
                    <button
                      onClick={() => onResolveDynamicEvent(event.id)}
                      className="worknet-btn-primary text-[11px] py-1.5 px-3"
                    >
                      <Activity size={12} /> {event.actionLabel}
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-medium">
                      ✓ Completed this cycle: {event.rewardCredits} ₢ and {event.rewardXP} XP credited.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Launch & Lounge Bar */}
      <div className="worknet-card bg-slate-50 border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
              <Coffee size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Department Break Room & Watercooler
              </h4>
              <p className="text-[11px] text-slate-500">
                Take a moment to converse with colleagues, review the daily roster, and restore focus.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onVisitBreakRoom}
              className="worknet-btn-secondary text-xs"
            >
              <Coffee size={13} /> Rest & Chamomile Break
            </button>
            <button
              onClick={() => onNavigate('workplace')}
              className="worknet-btn-primary text-xs"
            >
              Enter Workplace Simulation <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
