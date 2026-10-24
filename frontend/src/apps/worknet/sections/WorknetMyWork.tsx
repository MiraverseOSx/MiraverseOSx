import React, { useState } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, ArrowRight, Play, ExternalLink, Shield, Lock, RotateCcw
} from 'lucide-react';
import { useOSStore } from '../../../store/useOSStore';
import { WORK_DEFINITIONS, WORKNET_ASSIGNMENTS } from '../../../gameplay/ActivityEngine';
import type { WorknetTabId } from '../useWorknetState';

interface WorknetMyWorkProps {
  onOpenOpportunity: (missionId: string) => void;
  onNavigate: (tab: WorknetTabId) => void;
}

export default function WorknetMyWork({ onOpenOpportunity, onNavigate }: WorknetMyWorkProps) {
  const player = useOSStore(s => s.gameplay.player);
  const cycle = useOSStore(s => s.gameplay.timeCycleCount);
  const worknetOrders = player.worknetOrders || {};
  const ordersList = Object.values(worknetOrders);

  const [filter, setFilter] = useState<'all' | 'active' | 'remediation' | 'accepted'>('all');

  const filteredOrders = ordersList.filter(order => {
    if (filter === 'active') return order.status === 'active' && !order.remediationRequired;
    if (filter === 'remediation') return order.remediationRequired;
    if (filter === 'accepted') return order.status === 'accepted';
    return true;
  });

  return (
    <div className="worknet-view-scroll">
      {/* Header Summary */}
      <div className="worknet-card">
        <div className="flex items-center justify-between">
          <div>
            <span className="worknet-kicker">Operational Assignments</span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">My Work Orders & Duties</h2>
            <p className="text-xs text-slate-600 mt-1">
              Structured records of all open, in-progress, and finalized institutional work orders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('opportunities')}
              className="worknet-btn-primary text-xs"
            >
              Browse Open Opportunities <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders ({ordersList.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filter === 'active' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active In Progress ({ordersList.filter(o => o.status === 'active' && !o.remediationRequired).length})
          </button>
          <button
            onClick={() => setFilter('remediation')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filter === 'remediation' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Remediation Required ({ordersList.filter(o => o.remediationRequired).length})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filter === 'accepted' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Finalized ({ordersList.filter(o => o.status === 'accepted').length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const def = WORK_DEFINITIONS[order.definitionId];
            const assignment = WORKNET_ASSIGNMENTS[order.definitionId];
            const isAccepted = order.status === 'accepted';
            const stagesCount = def?.stages.length || 0;
            const completedStages = order.resultIds.length;

            return (
              <div
                key={order.id}
                className={`worknet-card transition ${
                  order.remediationRequired ? 'border-rose-300 bg-rose-50/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {def?.track.toUpperCase()} Division
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        order.remediationRequired
                          ? 'bg-rose-100 text-rose-800'
                          : isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {order.remediationRequired ? 'Remediation Required' : isAccepted ? 'Finalized' : 'Active Duty'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {order.id}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {assignment?.title || order.subject}
                    </h3>
                    <p className="text-xs text-slate-600">
                      Subject: <strong className="text-slate-800">{order.subject}</strong> · Evaluation Score: {order.evaluation}/100 · Units Remaining: {order.timeRemaining}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenOpportunity(order.definitionId)}
                      className="worknet-btn-primary text-xs"
                    >
                      {isAccepted ? 'Review Finalized Docket' : 'Resume Assignment'} <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar of stages */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>Outputs Accepted: <strong>{completedStages} / {stagesCount}</strong></span>
                    <span>Resources Used: <strong>{order.resourcesUsed}</strong></span>
                    {order.incidents.length > 0 && (
                      <span className="text-rose-700 font-medium">
                        Incidents Recorded: {order.incidents.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => useOSStore.getState().openAssignmentFiles(order.definitionId)}
                      className="text-[11px] text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
                    >
                      <FileText size={12} /> Briefing in VAULT
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
            <FileText size={32} className="mx-auto mb-2 opacity-40" />
            <h4 className="font-bold text-sm text-slate-800">No Orders in this View</h4>
            <p className="mt-1">
              {filter === 'remediation'
                ? 'No incidents requiring remediation. All equipment is functioning normally.'
                : 'You have no open work orders matching this filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
