'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Star,
  Plus,
  AlertOctagon,
  Layers,
  ChevronRight,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Task, DGACase, TaskStatus, Priority } from '@/lib/dga-types';
import {
  updateDGATask,
  createDGATask,
  toggleTaskFavorite
} from '@/lib/dga-store';
import { evaluateTaskDependencies } from '@/lib/work-management/dependency-engine';

interface DgaWorkBoardViewProps {
  tasks: Task[];
  cases: DGACase[];
  favoriteTaskIds: string[];
  onOpenTaskDetail: (task: Task) => void;
  onSelectCase?: (caseId: string) => void;
}

interface ColumnDef {
  id: TaskStatus;
  label: string;
  badgeColor: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'pending', label: 'TRIAGE / PENDING', badgeColor: 'bg-[#dedce8] text-[#3d3b55]' },
  { id: 'in_progress', label: 'ACTIVE INVESTIGATION', badgeColor: 'bg-[#d8d5eb] text-[#343058]' },
  { id: 'blocked', label: 'BLOCKED / UNDER REVIEW', badgeColor: 'bg-rose-100 text-rose-800' },
  { id: 'completed', label: 'RESOLVED / COMPLETED', badgeColor: 'bg-emerald-100 text-emerald-800' }
];

export function DgaWorkBoardView({
  tasks,
  cases,
  favoriteTaskIds,
  onOpenTaskDetail,
  onSelectCase
}: DgaWorkBoardViewProps) {
  const [inlineColumn, setInlineColumn] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const evaluatedTasks = evaluateTaskDependencies(tasks);

  const getColumnTasks = (statusId: TaskStatus) => {
    return evaluatedTasks.filter((t) => {
      if (statusId === 'completed') return t.completed || t.status === 'completed';
      if (statusId === 'blocked') return t.status === 'blocked' || t.status === 'under_review' || (t.isBlocked && !t.completed);
      if (statusId === 'in_progress') return t.status === 'in_progress' && !t.completed && !t.isBlocked;
      // pending
      return (t.status === 'pending' || !t.status) && !t.completed && !t.isBlocked;
    });
  };

  const handleCreateTask = async (status: TaskStatus, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetCaseId = cases[0]?.id || 'DGA-26-194';
    await createDGATask(targetCaseId, {
      title: newTitle.trim(),
      description: 'Directive created from Kanban Board.',
      phase: 'Active Investigation',
      priority: 'Routine',
      status,
      assignedTo: 'Special Agent Miracle Jerome'
    });

    setNewTitle('');
    setInlineColumn(null);
  };

  const handleMoveColumn = async (task: Task, targetStatus: TaskStatus) => {
    const parentCase = cases.find((c) => c.tasks.some((t) => t.id === task.id)) || cases[0];
    await updateDGATask(parentCase.id, task.id, { status: targetStatus });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colTasks = getColumnTasks(col.id);
        const isAdding = inlineColumn === col.id;

        return (
          <div
            key={col.id}
            className="bg-[#f4f3f8] border border-[#cfcddb] rounded-lg flex flex-col flex-1 max-h-full min-h-[250px] overflow-hidden shadow-2xs"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-[#dedce7] flex items-center justify-between shrink-0 bg-[#ebe9f3]">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${col.badgeColor}`}>
                  {colTasks.length}
                </span>
                <span className="font-bold text-xs text-[#28273a] tracking-tight font-mono">
                  {col.label}
                </span>
              </div>

              <button
                onClick={() => setInlineColumn(isAdding ? null : col.id)}
                className="p-1 rounded text-[#6b6988] hover:text-[#252438] hover:bg-[#dedce8] transition-colors cursor-pointer"
                title="Add directive to this column"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Tasks Container */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-[#cfcddb]">
              {/* Quick Add Form */}
              {isAdding && (
                <form
                  onSubmit={(e) => handleCreateTask(col.id, e)}
                  className="p-2.5 bg-white border border-[#5d5a86] rounded-lg shadow-sm space-y-2 text-xs"
                >
                  <input
                    type="text"
                    placeholder="Enter directive title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#f8f7fc] border border-[#d2d0e0] rounded px-2.5 py-1 text-xs text-[#201f30] focus:outline-none focus:border-[#5d5a86]"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInlineColumn(null)}
                      className="px-2 py-1 text-[#6e6c89] hover:text-[#201f30] text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded font-semibold text-xs cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}

              {colTasks.length > 0 ? (
                colTasks.map((task) => {
                  const parentCase = cases.find((c) => c.tasks.some((t) => t.id === task.id)) || cases[0];
                  const isFav = favoriteTaskIds.includes(task.id);
                  const subtasks = task.subtasks || [];

                  return (
                    <div
                      key={task.id}
                      className="bg-white border border-[#cfcddb] hover:border-[#5d5a86] rounded-lg p-3 shadow-2xs space-y-2.5 transition-all group"
                    >
                      {/* Top Card Meta */}
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#626082]">{task.id}</span>
                          {parentCase && (
                            <span
                              onClick={() => onSelectCase && onSelectCase(parentCase.id)}
                              className="font-mono bg-[#f0eff6] text-[#4d4b68] px-1 py-0.2 rounded border border-[#dedce7] cursor-pointer hover:border-[#5d5a86]"
                            >
                              {parentCase.id}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleTaskFavorite(task.id)}
                            className={`cursor-pointer ${
                              isFav ? 'text-amber-500' : 'text-[#d6d4e2] hover:text-amber-400'
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current" />
                          </button>
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold ${
                              task.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : task.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#ecebf3] text-[#555372]'
                            }`}
                          >
                            {task.priority || 'Routine'}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <div
                        onClick={() => onOpenTaskDetail(task)}
                        className={`text-xs font-semibold cursor-pointer hover:text-[#5d5a86] leading-snug ${
                          task.completed ? 'text-[#87859c] line-through' : 'text-[#201f30]'
                        }`}
                      >
                        {task.title}
                      </div>

                      {/* Blocked Alert */}
                      {task.isBlocked && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1.5">
                          <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>BLOCKED BY DEPENDENCY</span>
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="pt-2 border-t border-[#f0eff5] flex items-center justify-between text-[10px] text-[#716f8d]">
                        <div className="flex items-center gap-2">
                          {subtasks.length > 0 && (
                            <span className="flex items-center gap-1 font-mono">
                              <Layers className="w-3 h-3 text-[#8785a2]" />
                              <span>
                                {subtasks.filter((st) => st.completed).length}/{subtasks.length}
                              </span>
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-[#8785a2]" />
                              <span>{task.dueDate.split('T')[0].slice(5)}</span>
                            </span>
                          )}
                        </div>

                        {/* Column Transition Controls */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {col.id !== 'pending' && (
                            <button
                              onClick={() => {
                                const prevIdx = COLUMNS.findIndex((c) => c.id === col.id) - 1;
                                if (prevIdx >= 0) handleMoveColumn(task, COLUMNS[prevIdx].id);
                              }}
                              className="p-1 rounded hover:bg-[#ecebf3] text-[#72708f] hover:text-[#252438] cursor-pointer"
                              title="Move back"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col.id !== 'completed' && (
                            <button
                              onClick={() => {
                                const nextIdx = COLUMNS.findIndex((c) => c.id === col.id) + 1;
                                if (nextIdx < COLUMNS.length) handleMoveColumn(task, COLUMNS[nextIdx].id);
                              }}
                              className="p-1 rounded hover:bg-[#ecebf3] text-[#72708f] hover:text-[#252438] cursor-pointer"
                              title="Advance status"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-[11px] text-[#8e8ca5]">
                  No directives in this lane.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
