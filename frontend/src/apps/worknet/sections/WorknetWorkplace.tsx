import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, Shield, Stethoscope, Coffee, MessageSquare, CheckCircle2,
  AlertCircle, ChevronRight, Zap, Award, BookOpen, Clock, Activity, CornerDownRight,
  Briefcase, Send, DollarSign, Sliders, Check, X, RefreshCw
} from 'lucide-react';
import { canSupervise } from '../workplaceModel';
import { useOSStore } from '../../../store/useOSStore';
import {
  INSTITUTIONAL_REGISTRY,
  INITIAL_DELEGATION_TASKS,
  type DelegationTask,
  type SubordinateLeaveRequest
} from '../worknetData';
import type { WorkplaceStationId } from '../../JobWorkstationApp';
import type { DivisionBudget } from '../useWorknetState';

interface WorknetWorkplaceProps {
  activeStation: WorkplaceStationId;
  coworkerStats: Record<string, {
    trust: number;
    competence: number;
    familiarity: number;
    cooperation: number;
    conflictHistory: number;
    lastInteraction?: string;
    status: 'Desk' | 'In Field' | 'In Meeting' | 'On Break';
  }>;
  delegatedTasks: {
    id: string;
    taskId: string; cycle?: number;
    stationId: WorkplaceStationId;
    title: string;
    assigneeId: string;
    assigneeName: string;
    status: 'In Progress' | 'Review Ready' | 'Approved';
    assignedAt: string; opened?: boolean; output?: string; issues?: string[]; dueTick?: number; revisions?: number;
  }[];
  subordinateLeaves: (SubordinateLeaveRequest & { coverage?: string; untilTick?: number })[];
  divisionBudgets: Record<WorkplaceStationId, DivisionBudget>;
  onInteractCoworker: (
    coworkerId: string,
    actionType: 'consult' | 'assist' | 'collaborate' | 'break',
    coworkerName: string
  ) => void;
  onCycleCoworkerStatus: (coworkerId: string) => void;
  onDelegateTask: (taskId: string, coworkerId: string, coworkerName: string) => void;
  onReviewDelegatedDocket: (delegationId: string, approved: boolean) => void;
  onReviewSubordinateLeave: (requestId: string, approved: boolean) => void;
  onUpdateDivisionBudget: (stationId: WorkplaceStationId, eq: number, tr: number, su: number) => void;
  onVisitBreakRoom: () => void;
  breakRoomVisitCount: number;
  onFeedback: (msg: string) => void;
}

export default function WorknetWorkplace({
  activeStation,
  coworkerStats,
  delegatedTasks,
  subordinateLeaves,
  divisionBudgets,
  onInteractCoworker,
  onCycleCoworkerStatus,
  onDelegateTask,
  onReviewDelegatedDocket,
  onReviewSubordinateLeave,
  onUpdateDivisionBudget,
  onVisitBreakRoom,
  breakRoomVisitCount,
  onFeedback
}: WorknetWorkplaceProps) {
  const player = useOSStore(s => s.gameplay.player);
  const theme = INSTITUTIONAL_REGISTRY[activeStation] || INSTITUTIONAL_REGISTRY.dga;
  const supervisor = theme.supervisor;
  const oversight = canSupervise(player, activeStation);
  const cycle = useOSStore(s => s.gameplay.timeCycleCount);
  const advanceTime = useOSStore(s => s.advanceTime);

  const [activeTab, setActiveTab] = useState<'coworkers' | 'supervisory-console' | 'supervisor' | 'lounge' | 'duties'>('coworkers');
  const [selectedTaskToDelegate, setSelectedTaskToDelegate] = useState<string>('');
  const [selectedCoworkerForDelegation, setSelectedCoworkerForDelegation] = useState<string>('');

  // Active division budget
  const budget = divisionBudgets[activeStation] || { total: 5000, equipment: 2000, training: 1500, surge: 1500 };
  const [budgetDraft, setBudgetDraft] = useState({ equipment: budget.equipment, training: budget.training, surge: budget.surge });

  useEffect(() => { setBudgetDraft({ equipment: budget.equipment, training: budget.training, surge: budget.surge }); setSelectedTaskToDelegate(''); setSelectedCoworkerForDelegation(''); }, [activeStation, budget.equipment, budget.training, budget.surge]);

  // Filter tasks and leaves for this station
  const stationDelegationTasks = INITIAL_DELEGATION_TASKS.filter(t => t.stationId === activeStation && !delegatedTasks.some(d => d.taskId === t.id && d.cycle === cycle));
  const stationDelegated = delegatedTasks.filter(t => t.stationId === activeStation);
  const stationSubLeaves = subordinateLeaves.filter(l => l.stationId === activeStation);

  const handleSupervisorCheckin = (topic: string) => {
    onFeedback(`📋 Checked in with ${supervisor.name} regarding ${topic}. Evaluation score affirmed; supervisor expectation noted.`);
  };

  const handleApplyBudget = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDivisionBudget(activeStation, budgetDraft.equipment, budgetDraft.training, budgetDraft.surge);
  };

  return (
    <div className="worknet-view-scroll">
      {/* Workplace Header */}
      <div
        className="worknet-card"
        style={{
          borderLeft: `4px solid ${theme.accentColor}`,
          background: `linear-gradient(to right, #ffffff, ${theme.badgeBg})`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="worknet-kicker" style={{ color: theme.accentColor }}>
                {theme.fullName} · Live Workplace Life
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {theme.proceduralTier}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {theme.name} Operations Floor
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Collaborate with colleagues, review returned dockets, and coordinate division readiness.
            </p>
          </div>
          <span className="worknet-badge">
            <Users size={12} /> {theme.coworkers.length} Active Staff Present
          </span>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('coworkers')}
            className={`px-3 py-1.5 rounded-md font-semibold transition whitespace-nowrap ${
              activeTab === 'coworkers' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            NPC Colleagues & Desks ({theme.coworkers.length})
          </button>
          <button
            onClick={() => setActiveTab('supervisory-console')}
            className={`px-3 py-1.5 rounded-md font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'supervisory-console' ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Sliders size={13} /> Supervisory Console
          </button>
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`px-3 py-1.5 rounded-md font-semibold transition whitespace-nowrap ${
              activeTab === 'supervisor' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Supervisor Authority & Head
          </button>
          <button
            onClick={() => setActiveTab('duties')}
            className={`px-3 py-1.5 rounded-md font-semibold transition whitespace-nowrap ${
              activeTab === 'duties' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Routine Duties ({theme.routineDuties.length})
          </button>
          <button
            onClick={() => setActiveTab('lounge')}
            className={`px-3 py-1.5 rounded-md font-semibold transition whitespace-nowrap ${
              activeTab === 'lounge' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Break Room & Lounge (☕)
          </button>
        </div>
      </div>

      {/* Tab: NPC Colleagues (WORKNET-011, WORKNET-014) */}
      {activeTab === 'coworkers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theme.coworkers.map(cw => {
              const stats = coworkerStats[cw.id] || {
                trust: cw.trust,
                competence: cw.competence,
                familiarity: cw.familiarity,
                cooperation: cw.cooperation,
                conflictHistory: cw.conflictHistory,
                status: cw.status
              };

              return (
                <div key={cw.id} className="worknet-coworker-card">
                  <div className="flex items-start justify-between">
                    <div className="worknet-cw-header">
                      <div className="worknet-cw-avatar" style={{ borderColor: theme.accentColor, color: theme.accentColor }}>
                        {cw.avatar}
                      </div>
                      <div className="worknet-cw-details">
                        <h4>{cw.name}</h4>
                        <p>{cw.title} · {cw.division}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        stats.status === 'Desk' ? 'bg-emerald-100 text-emerald-800' :
                        stats.status === 'In Field' ? 'bg-blue-100 text-blue-800' :
                        stats.status === 'In Meeting' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {stats.status}
                      </span>
                      <button
                        title="Availability updates when game time advances" aria-label={`Check availability for ${cw.name}`}
                        onClick={() => onCycleCoworkerStatus(cw.id)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                      >
                        <RefreshCw size={11} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{cw.quote}"
                  </p>

                  {/* 5 Dimensions of Professional Relationships */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="worknet-dim-bar">
                      <span className="w-24">Trust ({stats.trust}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.trust}%`, background: '#059669' }} />
                      </div>
                    </div>
                    <div className="worknet-dim-bar">
                      <span className="w-24">Competence ({stats.competence}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.competence}%`, background: '#2563eb' }} />
                      </div>
                    </div>
                    <div className="worknet-dim-bar">
                      <span className="w-24">Familiarity ({stats.familiarity}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.familiarity}%`, background: '#7c3aed' }} />
                      </div>
                    </div>
                    <div className="worknet-dim-bar">
                      <span className="w-24">Cooperation ({stats.cooperation}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.cooperation}%`, background: '#0d9488' }} />
                      </div>
                    </div>
                    <div className="worknet-dim-bar">
                      <span className="w-24 text-rose-700">Conflict ({stats.conflictHistory}%)</span>
                      <div className="worknet-dim-track">
                        <div className="worknet-dim-fill" style={{ width: `${stats.conflictHistory}%`, background: '#e11d48' }} />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onInteractCoworker(cw.id, 'consult', cw.name)}
                      className="worknet-btn-secondary text-[11px] justify-center py-1.5"
                    >
                      Consult Notes
                    </button>
                    <button
                      onClick={() => onInteractCoworker(cw.id, 'assist', cw.name)}
                      className="worknet-btn-secondary text-[11px] justify-center py-1.5"
                    >
                      Offer Help
                    </button>
                    <button
                      onClick={() => onInteractCoworker(cw.id, 'collaborate', cw.name)}
                      className="worknet-btn-primary text-[11px] justify-center py-1.5"
                    >
                      Co-sign Duty
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Supervisory Console (WORKNET-011, WORKNET-012) */}
      {activeTab === 'supervisory-console' && !oversight && <div className="worknet-card"><h3>Department oversight is unavailable</h3><p>Accept this division’s employment contract and choose Department Supervisor in Career Record. Current institutional clearance is required.</p><p>Specialists retain technical assignments, field work, and qualification-based advancement without managing personnel. Selecting either pathway grants no additional institutional credentials.</p></div>}
      {activeTab === 'supervisory-console' && oversight && (
        <div className="space-y-4">
          {/* Subordinate Duty Delegation */}
          <div className="worknet-card">
            <div className="worknet-card-header">
              <h3 className="worknet-card-title">
                <Sliders size={16} className="text-emerald-700" />
                Subordinate Task Delegation
              </h3>
              <span className="worknet-badge">Supervisory Oversight</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Delegate to qualified colleagues at their desks. Work and revisions advance with game time, including while WORKNET is closed. Read each returned docket before signing off.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Duty to Delegate</label>
                <select
                  value={selectedTaskToDelegate}
                  onChange={e => setSelectedTaskToDelegate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white text-slate-800"
                >
                  <option value="">Choose an open departmental task...</option>
                  {stationDelegationTasks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.requiredRole} · Min Comp {t.minCompetence}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Subordinate</label>
                <select
                  value={selectedCoworkerForDelegation}
                  onChange={e => setSelectedCoworkerForDelegation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white text-slate-800"
                >
                  <option value="">Select an available colleague...</option>
                  {theme.coworkers.map(cw => (
                    <option key={cw.id} value={cw.id} disabled={(coworkerStats[cw.id]?.status || cw.status) !== 'Desk' || delegatedTasks.some(d => d.assigneeId === cw.id && d.status !== 'Approved')}>
                      {cw.name} ({cw.title} · Status: {coworkerStats[cw.id]?.status || cw.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                if (!selectedTaskToDelegate || !selectedCoworkerForDelegation) {
                  onFeedback('⚠️ Please select both a task and a subordinate to delegate.');
                  return;
                }
                const cw = theme.coworkers.find(c => c.id === selectedCoworkerForDelegation);
                onDelegateTask(selectedTaskToDelegate, selectedCoworkerForDelegation, cw?.name || 'Subordinate');
                setSelectedTaskToDelegate('');
                setSelectedCoworkerForDelegation('');
              }}
              className="worknet-btn-primary text-xs py-2 px-4"
            >
              <Send size={12} /> Issue Delegation Order
            </button>

            <button className="worknet-btn-secondary ml-2" onClick={advanceTime}>Advance work segment</button>
            {/* Delegated Tasks Tracking */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block mb-2">Active Delegated Dockets</span>
              {stationDelegated.length > 0 ? (
                <div className="space-y-2">
                  {stationDelegated.map(d => (
                    <div key={d.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{d.title}</span>
                        {d.opened && <div className="p-2 border border-slate-200"><p>{d.output}</p>{d.issues?.map(issue => <p key={issue} role="alert">{issue}</p>)}</div>}
                        <p className="text-[11px] text-slate-500">
                          Assigned to: <strong>{d.assigneeName}</strong> · Status: <span className="font-semibold text-emerald-800">{d.status}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {d.status === 'Review Ready' ? (
                          <>
                            <button
                              onClick={() => { const result = useOSStore.getState().worknetWorkplaceAction({ type: 'open-docket', id: d.id }); onFeedback(result.ok ? 'Docket opened below its title.' : result.message); }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold border border-slate-300"
                            >
                              Read docket
                            </button>
                            <button
                              disabled={!d.opened || !!d.issues?.length}
                              onClick={() => onReviewDelegatedDocket(d.id, true)}
                              className="px-2 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                            >
                              <Check size={11} /> Approve Docket
                            </button>
                            <button
                              disabled={!d.opened}
                              onClick={() => onReviewDelegatedDocket(d.id, false)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                            >
                              Request Revision
                            </button>
                          </>
                        ) : d.status === 'Approved' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Docket Archived
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Work in progress · advance game time</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No tasks currently delegated in this division.</p>
              )}
            </div>
          </div>

          {/* Subordinate Leave Approvals & Division Budget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subordinate Leave Approvals */}
            <div className="worknet-card">
              <div className="worknet-card-header">
                <h3 className="worknet-card-title">
                  <Clock size={16} className="text-slate-700" />
                  Team Leave Approvals
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                {stationSubLeaves.map(leave => (
                  <div key={leave.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{leave.subordinateName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        leave.status === 'Denied' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{leave.shiftDuty} · Reason: {leave.reason}</p>
                    {leave.coverage && <p>Coverage: {leave.coverage} · one work segment</p>}
                    {leave.status === 'Pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onReviewSubordinateLeave(leave.id, true)}
                          className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[11px] font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReviewSubordinateLeave(leave.id, false)}
                          className="px-2 py-0.5 bg-rose-700 text-white rounded text-[11px] font-semibold"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Division Budget Reallocation */}
            <div className="worknet-card">
              <div className="worknet-card-header">
                <h3 className="worknet-card-title">
                  <DollarSign size={16} className="text-amber-700" />
                  Division Operational Budget
                </h3>
                <span className="text-xs font-bold text-slate-900">{budget.total} ₢ Department Pool · {budget.merit || 0} Merit</span>
              </div>
              <p className="text-xs">Unallocated: {budget.total - budgetDraft.equipment - budgetDraft.training - budgetDraft.surge} credits. Maintenance funds verification; training improves task eligibility; surge reserves provide leave coverage. Department funds are separate from your wallet.</p>
              <form onSubmit={handleApplyBudget} className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Equipment Maintenance:</span>
                    <strong>{budgetDraft.equipment} ₢</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={budget.total}
                    step="100"
                    value={budgetDraft.equipment}
                    onChange={e => setBudgetDraft({ ...budgetDraft, equipment: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Staff Training & Upskilling:</span>
                    <strong>{budgetDraft.training} ₢</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={budget.total}
                    step="100"
                    value={budgetDraft.training}
                    onChange={e => setBudgetDraft({ ...budgetDraft, training: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Surge Readiness Reserves:</span>
                    <strong>{budgetDraft.surge} ₢</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={budget.total}
                    step="100"
                    value={budgetDraft.surge}
                    onChange={e => setBudgetDraft({ ...budgetDraft, surge: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <button
                  type="submit"
                  disabled={budgetDraft.equipment + budgetDraft.training + budgetDraft.surge > budget.total}
                  className="worknet-btn-secondary text-xs w-full justify-center py-1.5"
                >
                  Save Division Allocations
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Supervisor Authority & Head */}
      {activeTab === 'supervisor' && (
        <div className="worknet-card space-y-4">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white"
              style={{ background: theme.accentColor }}
            >
              {supervisor.avatar}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Organizational Authority
              </span>
              <h3 className="text-base font-bold text-slate-900">{supervisor.name}</h3>
              <p className="text-xs text-slate-600">{supervisor.title} · {supervisor.department}</p>
              <p className="text-xs text-slate-700 mt-2">
                <strong>Supervisory Expectations:</strong> {supervisor.expectations}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Historical Approval & Trust Rating</span>
              <span className="font-bold text-emerald-700">{supervisor.approvalRate}% Satisfactory</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Supervisors evaluate procedure rigor, incident remediation notes, and punctuality. Unsafe procedures directly lower your department standing until verified remediation is submitted.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => handleSupervisorCheckin('Shift Priorities & Current Telemetry')}
              className="worknet-btn-secondary justify-center text-xs py-2"
            >
              Request Priority Sync
            </button>
            <button
              onClick={() => handleSupervisorCheckin('Remediation Protocol Review')}
              className="worknet-btn-secondary justify-center text-xs py-2"
            >
              Review Protocol Standards
            </button>
            <button
              onClick={() => handleSupervisorCheckin('Career Pathway Recommendation')}
              className="worknet-btn-primary justify-center text-xs py-2"
            >
              Seek Promotion Recommendation
            </button>
          </div>
        </div>
      )}

      {/* Tab: Routine Duties */}
      {activeTab === 'duties' && (
        <div className="space-y-3">
          {theme.routineDuties.map(duty => (
            <div key={duty.id} className="worknet-card flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {duty.frequency}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{duty.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{duty.description}</p>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Expected Compensation: {duty.rewardDesc}
                </span>
              </div>
              <button
                onClick={() => onFeedback(`⚡ Began routine duty: "${duty.title}". Telemetry checks calibrated.`)}
                className="worknet-btn-primary text-xs"
              >
                Perform Duty <ChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Break Room */}
      {activeTab === 'lounge' && (
        <div className="worknet-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Coffee size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {theme.shortOrg} Staff Lounge & Watercooler
                </h3>
                <p className="text-xs text-slate-500">
                  A quiet sanctuary to decompress, discuss city news, and restore focus.
                </p>
              </div>
            </div>
            <button
              onClick={onVisitBreakRoom}
              className="worknet-btn-primary text-xs"
            >
              <Coffee size={13} /> Enjoy Restorative Coffee / Tea
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-bold text-slate-800">Watercooler Chatter & Rumors</span>
              <ul className="space-y-1.5 text-slate-600 text-[11px]">
                <li>• "Council is deliberating the next Glassline transit budget allocation."</li>
                <li>• "Faith Medical's Veil research ward just received an updated shipment of BioCompress units."</li>
                <li>• "The Treasury audit team found another variance in regional scholarship outlays."</li>
              </ul>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-bold text-slate-800">Staff Notice Board</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Remember to log out of shared terminals when departing for shift lunch. Please label all personal items in the refrigeration unit.
              </p>
              <p className="text-[10px] text-slate-400">Total break visits recorded: {breakRoomVisitCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
