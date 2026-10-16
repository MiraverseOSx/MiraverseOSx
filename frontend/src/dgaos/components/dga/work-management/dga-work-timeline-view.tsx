'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  AlertOctagon,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  Link2
} from 'lucide-react';
import { Task, DGACase, Priority } from '@/lib/dga-types';
import { updateDGATask } from '@/lib/dga-store';
import { evaluateTaskDependencies, EvaluatedTask } from '@/lib/work-management/dependency-engine';

interface DgaWorkTimelineViewProps {
  tasks: Task[];
  cases: DGACase[];
  favoriteTaskIds: string[];
  onOpenTaskDetail: (task: Task) => void;
  onSelectCase?: (caseId: string) => void;
}

const PHASES = [
  { id: 'Preliminary', label: 'PRELIMINARY & INTAKE', desc: 'Case intake, initial forensic logging & classification', color: 'border-l-[#544d7e] bg-[#f8f7fc]' },
  { id: 'Active Investigation', label: 'ACTIVE INVESTIGATION', desc: 'Field investigations, intercept directives & surveillance', color: 'border-l-indigo-500 bg-[#f6f5fb]' },
  { id: 'Forensic Analysis', label: 'FORENSIC ANALYSIS', desc: 'Laboratory processing, spectroscopy, telemetry extraction', color: 'border-l-amber-500 bg-[#fdfbf6]' },
  { id: 'Intervention', label: 'FIELD INTERVENTION', desc: 'Tactical containment, interdiction & asset recovery', color: 'border-l-rose-500 bg-[#fdf8f8]' },
  { id: 'Prosecution', label: 'PROSECUTION & DEBRIEF', desc: 'Chain-of-custody transfer, dossier archival & diplomatic briefs', color: 'border-l-emerald-500 bg-[#f6fbf8]' }
];

export function DgaWorkTimelineView({
  tasks,
  cases,
  onOpenTaskDetail,
  onSelectCase
}: DgaWorkTimelineViewProps) {
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const evaluatedTasks = useMemo(() => evaluateTaskDependencies(tasks), [tasks]);

  const caseMap = useMemo(() => {
    const map = new Map<string, DGACase>();
    cases.forEach((c) => map.set(c.id, c));
    return map;
  }, [cases]);

  // Group tasks by phase
  const tasksByPhase = useMemo(() => {
    const map: Record<string, EvaluatedTask[]> = {
      'Preliminary': [],
      'Active Investigation': [],
      'Forensic Analysis': [],
      'Intervention': [],
      'Prosecution': []
    };

    evaluatedTasks.forEach((t) => {
      const phase = t.phase || 'Active Investigation';
      if (!map[phase]) {
        map[phase] = [];
      }
      map[phase].push(t);
    });

    return map;
  }, [evaluatedTasks]);

  const filteredPhases = useMemo(() => {
    if (selectedPhaseFilter === 'all') return PHASES;
    return PHASES.filter((p) => p.id === selectedPhaseFilter);
  }, [selectedPhaseFilter]);

  const handleToggleTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const parentCase = cases.find((c) => c.tasks.some((t) => t.id === task.id)) || cases.find((c) => c.id === task.caseId) || cases[0];
    if (!parentCase) return;
    updateDGATask(parentCase.id, task.id, {
      completed: !task.completed,
      status: !task.completed ? 'completed' : 'in_progress',
      completedAt: !task.completed ? new Date().toISOString() : undefined
    });
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#2b2640]/10 rounded-md">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#544d7e]" />
          <span className="text-[11px] font-mono tracking-wider font-semibold text-[#2b2640] uppercase">
            OPERATIONAL PHASE TIMELINE & MILESTONES
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f3f2f8] text-[#544d7e] font-semibold border border-[#2b2640]/10">
            {evaluatedTasks.length} DIRECTIVES
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 text-[#2b2640]/40" />
          <span className="text-[10px] font-mono text-[#2b2640]/60 uppercase">Phase Filter:</span>
          <select
            value={selectedPhaseFilter}
            onChange={(e) => setSelectedPhaseFilter(e.target.value)}
            className="text-[10px] font-mono font-medium px-2 py-1 bg-[#f8f7fc] border border-[#2b2640]/15 rounded text-[#2b2640] focus:outline-none focus:border-[#544d7e]"
          >
            <option value="all">ALL OPERATIONAL PHASES</option>
            {PHASES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Phase Lanes Container */}
      <div className="space-y-6">
        {filteredPhases.map((phase, pIndex) => {
          const phaseTasks = tasksByPhase[phase.id] || [];
          const completedCount = phaseTasks.filter((t) => t.completed || t.status === 'completed').length;
          const progressPercent = phaseTasks.length > 0 ? Math.round((completedCount / phaseTasks.length) * 100) : 0;

          return (
            <div
              key={phase.id}
              className={`border border-[#2b2640]/15 rounded-md overflow-hidden bg-white shadow-sm border-l-4 ${phase.color}`}
            >
              {/* Phase Lane Header */}
              <div className="px-4 py-3 bg-[#f8f7fc] border-b border-[#2b2640]/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#544d7e] text-white flex items-center justify-center font-mono text-[10px] font-bold">
                    {pIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-[#2b2640] uppercase">
                      {phase.label}
                    </h3>
                    <p className="text-[10px] font-sans text-[#2b2640]/60">{phase.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress gauge */}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-[#2b2640]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#544d7e] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#544d7e]">
                      {completedCount}/{phaseTasks.length} ({progressPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Phase Tasks List */}
              <div className="p-3 divide-y divide-[#2b2640]/5">
                {phaseTasks.length === 0 ? (
                  <div className="py-6 text-center text-[11px] font-mono text-[#2b2640]/40">
                    NO DIRECTIVES REGISTERED IN THIS OPERATIONAL PHASE
                  </div>
                ) : (
                  phaseTasks.map((task) => {
                    const linkedCase = task.caseId ? caseMap.get(task.caseId) : null;
                    const isBlocked = task.isBlocked;
                    const hasSubtasks = (task.subtasks?.length || 0) > 0;
                    const subtaskCompleteCount = task.subtasks?.filter((s) => s.completed).length || 0;

                    return (
                      <div
                        key={task.id}
                        onClick={() => onOpenTaskDetail(task)}
                        className={`group py-2.5 px-3 rounded hover:bg-[#f8f7fc] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
                          task.completed ? 'opacity-65' : ''
                        }`}
                      >
                        {/* Left: Complete toggle + Title + ID */}
                        <div className="flex items-start md:items-center gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={(e) => handleToggleTask(task, e)}
                            className="mt-0.5 md:mt-0 flex-shrink-0 text-[#2b2640]/40 hover:text-[#544d7e] transition-colors"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isBlocked ? (
                              <AlertOctagon className="w-4 h-4 text-rose-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono text-[#2b2640]/50 font-bold">
                                {task.id}
                              </span>
                              <span
                                className={`text-xs font-mono font-medium truncate ${
                                  task.completed ? 'line-through text-[#2b2640]/50' : 'text-[#2b2640]'
                                }`}
                              >
                                {task.title}
                              </span>

                              {isBlocked && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  <AlertOctagon className="w-2.5 h-2.5" />
                                  BLOCKED ({task.blockers?.length || 1})
                                </span>
                              )}

                              {task.priority === 'Critical' && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                                  CRITICAL
                                </span>
                              )}
                            </div>

                            {/* Dependencies Strip */}
                            {task.dependsOn && task.dependsOn.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-[#2b2640]/60">
                                <Link2 className="w-2.5 h-2.5 text-[#544d7e]" />
                                <span className="text-[#2b2640]/40">Prerequisites:</span>
                                {task.dependsOn.map((depId) => {
                                  const dep = evaluatedTasks.find((t) => t.id === depId);
                                  const isDepDone = dep?.completed || dep?.status === 'completed';
                                  return (
                                    <span
                                      key={depId}
                                      className={`px-1 rounded text-[9px] font-mono font-bold ${
                                        isDepDone
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                                      }`}
                                    >
                                      {depId} {isDepDone ? '✓' : '⌛'}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Case Badge, Subtasks, Due Date, Chevron */}
                        <div className="flex items-center gap-3 self-end md:self-auto flex-shrink-0">
                          {linkedCase && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectCase) onSelectCase(linkedCase.id);
                              }}
                              className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#f0eef6] text-[#4b4372] border border-[#2b2640]/10 hover:bg-[#e6e2f0] transition-colors"
                            >
                              {linkedCase.id}
                            </button>
                          )}

                          {hasSubtasks && (
                            <span className="text-[10px] font-mono text-[#2b2640]/60 px-1.5 py-0.5 bg-gray-100 rounded">
                              {subtaskCompleteCount}/{task.subtasks?.length} subtasks
                            </span>
                          )}

                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-[#2b2640]/70">
                              <Clock className="w-3 h-3 text-[#2b2640]/40" />
                              <span>{task.dueDate.split('T')[0]}</span>
                            </div>
                          )}

                          <ChevronRight className="w-3.5 h-3.5 text-[#2b2640]/30 group-hover:text-[#544d7e] transition-colors" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
