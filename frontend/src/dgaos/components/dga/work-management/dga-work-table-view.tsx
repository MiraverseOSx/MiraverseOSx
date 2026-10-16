'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Star,
  ChevronDown,
  ArrowUpDown,
  Filter,
  Tag,
  Link2,
  User,
  ShieldAlert
} from 'lucide-react';
import { Task, DGACase, TaskStatus, Priority } from '@/lib/dga-types';
import {
  updateDGATask,
  toggleTaskFavorite
} from '@/lib/dga-store';
import { evaluateTaskDependencies } from '@/lib/work-management/dependency-engine';

interface DgaWorkTableViewProps {
  tasks: Task[];
  cases: DGACase[];
  favoriteTaskIds: string[];
  onOpenTaskDetail: (task: Task) => void;
  onSelectCase?: (caseId: string) => void;
}

type SortField = 'id' | 'title' | 'status' | 'priority' | 'phase' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export function DgaWorkTableView({
  tasks,
  cases,
  favoriteTaskIds,
  onOpenTaskDetail,
  onSelectCase
}: DgaWorkTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const evaluatedTasks = useMemo(() => evaluateTaskDependencies(tasks), [tasks]);

  const caseMap = useMemo(() => {
    const map = new Map<string, DGACase>();
    cases.forEach((c) => map.set(c.id, c));
    return map;
  }, [cases]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTasks = useMemo(() => {
    const copy = [...evaluatedTasks];
    copy.sort((a, b) => {
      let valA: string = '';
      let valB: string = '';

      switch (sortField) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
        case 'title':
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case 'status':
          valA = a.status || (a.completed ? 'completed' : 'pending');
          valB = b.status || (b.completed ? 'completed' : 'pending');
          break;
        case 'priority': {
          const priorityWeight: Record<Priority, number> = {
            Critical: 4,
            High: 3,
            Priority: 2,
            Routine: 1
          };
          const wA = priorityWeight[a.priority || 'Routine'] || 0;
          const wB = priorityWeight[b.priority || 'Routine'] || 0;
          return sortOrder === 'asc' ? wB - wA : wA - wB;
        }
        case 'phase':
          valA = a.phase || '';
          valB = b.phase || '';
          break;
        case 'dueDate':
          valA = a.dueDate || '9999-99-99';
          valB = b.dueDate || '9999-99-99';
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [evaluatedTasks, sortField, sortOrder]);

  const getParentCase = (task: Task) => {
    return cases.find((c) => c.tasks.some((t) => t.id === task.id)) || cases.find((c) => c.id === task.caseId) || cases[0];
  };

  const handleToggleTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const parentCase = getParentCase(task);
    if (!parentCase) return;
    updateDGATask(parentCase.id, task.id, {
      completed: !task.completed,
      status: !task.completed ? 'completed' : 'in_progress',
      completedAt: !task.completed ? new Date().toISOString() : undefined
    });
  };

  const handleToggleFavorite = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskFavorite(taskId);
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const parentCase = getParentCase(task);
    if (!parentCase) return;
    updateDGATask(parentCase.id, task.id, {
      status: newStatus,
      completed: newStatus === 'completed',
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
    });
  };

  const handlePriorityChange = (task: Task, newPriority: Priority, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const parentCase = getParentCase(task);
    if (!parentCase) return;
    updateDGATask(parentCase.id, task.id, { priority: newPriority });
  };

  return (
    <div className="bg-white border border-[#2b2640]/15 rounded-md shadow-sm overflow-hidden flex flex-col">
      {/* Table Container with dense scrollbar */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f7fc] border-b border-[#2b2640]/15 text-[10px] font-mono text-[#2b2640]/70 uppercase tracking-wider select-none">
              <th className="py-2.5 px-3 w-10 text-center">FAV</th>
              <th className="py-2.5 px-2 w-10 text-center">ST</th>
              <th
                onClick={() => handleSort('id')}
                className="py-2.5 px-3 w-28 cursor-pointer hover:bg-[#edeaf6] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>DIRECTIVE ID</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-[#2b2640]/40" />
                </div>
              </th>
              <th
                onClick={() => handleSort('title')}
                className="py-2.5 px-3 min-w-[240px] cursor-pointer hover:bg-[#edeaf6] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>INSTRUCTION / DIRECTIVE TITLE</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-[#2b2640]/40" />
                </div>
              </th>
              <th className="py-2.5 px-3 w-28">CASE</th>
              <th
                onClick={() => handleSort('status')}
                className="py-2.5 px-3 w-32 cursor-pointer hover:bg-[#edeaf6] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>STATUS</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-[#2b2640]/40" />
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                className="py-2.5 px-3 w-28 cursor-pointer hover:bg-[#edeaf6] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>PRIORITY</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-[#2b2640]/40" />
                </div>
              </th>
              <th
                onClick={() => handleSort('phase')}
                className="py-2.5 px-3 w-36 cursor-pointer hover:bg-[#edeaf6] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>OPERATIONAL PHASE</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-[#2b2640]/40" />
                </div>
              </th>
              <th className="py-2.5 px-3 w-28">PREREQS</th>
              <th className="py-2.5 px-3 w-32">ASSIGNEE</th>
              <th
                onClick={() => handleSort('dueDate')}
                className="py-2.5 px-3 w-28 cursor-pointer hover:bg-[#edeaf6] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>DUE DATE</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-[#2b2640]/40" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2640]/10 text-xs font-mono">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-[#2b2640]/50 text-xs font-mono">
                  NO DIRECTIVES FOUND MATCHING CURRENT CRITERIA
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const isFavorite = favoriteTaskIds.includes(task.id);
                const linkedCase = task.caseId ? caseMap.get(task.caseId) : null;
                const isBlocked = task.isBlocked;
                const status = task.status || (task.completed ? 'completed' : 'pending');

                return (
                  <tr
                    key={task.id}
                    onClick={() => onOpenTaskDetail(task)}
                    className={`hover:bg-[#f6f5fb] cursor-pointer transition-colors ${
                      task.completed ? 'bg-[#faf9fd]/70 opacity-70' : ''
                    }`}
                  >
                    {/* Favorite star */}
                    <td className="py-2 px-2 text-center" onClick={(e) => handleToggleFavorite(task.id, e)}>
                      <button type="button" className="text-[#2b2640]/30 hover:text-amber-500 transition-colors">
                        <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </td>

                    {/* Checkbox */}
                    <td className="py-2 px-2 text-center" onClick={(e) => handleToggleTask(task, e)}>
                      <button type="button" className="text-[#2b2640]/40 hover:text-[#544d7e] transition-colors">
                        {task.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isBlocked ? (
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {/* ID */}
                    <td className="py-2 px-3 text-[10px] font-bold text-[#544d7e] whitespace-nowrap">
                      {task.id}
                    </td>

                    {/* Title */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`font-sans text-xs truncate max-w-[320px] font-medium ${
                            task.completed ? 'line-through text-[#2b2640]/50' : 'text-[#2b2640]'
                          }`}
                        >
                          {task.title}
                        </span>
                        {isBlocked && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-100 text-rose-800 font-bold whitespace-nowrap">
                            BLOCKED
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Case Code */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      {linkedCase ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectCase) onSelectCase(linkedCase.id);
                          }}
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f0eef6] text-[#4b4372] border border-[#2b2640]/10 hover:bg-[#e4e0f0] transition-colors"
                        >
                          {linkedCase.id}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#2b2640]/30">—</span>
                      )}
                    </td>

                    {/* Status Select */}
                    <td className="py-2 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus, e)}
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-[#2b2640]/15 bg-white text-[#2b2640] focus:outline-none focus:border-[#544d7e]"
                      >
                        <option value="pending">PENDING</option>
                        <option value="in_progress">IN PROGRESS</option>
                        <option value="blocked">BLOCKED</option>
                        <option value="completed">COMPLETED</option>
                      </select>
                    </td>

                    {/* Priority Select */}
                    <td className="py-2 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.priority || 'Routine'}
                        onChange={(e) => handlePriorityChange(task, e.target.value as Priority, e)}
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase focus:outline-none ${
                          task.priority === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : task.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-white text-[#2b2640] border-[#2b2640]/15'
                        }`}
                      >
                        <option value="Critical">CRITICAL</option>
                        <option value="High">HIGH</option>
                        <option value="Priority">PRIORITY</option>
                        <option value="Routine">ROUTINE</option>
                      </select>
                    </td>

                    {/* Phase */}
                    <td className="py-2 px-3 text-[10px] text-[#2b2640]/70 truncate max-w-[140px]">
                      {task.phase?.replace('Phase ', 'P') || 'P1: Triage'}
                    </td>

                    {/* Prerequisites */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      {task.dependsOn && task.dependsOn.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Link2 className="w-2.5 h-2.5 text-[#544d7e]" />
                          <span className="text-[9px] font-mono text-[#2b2640]/70">
                            {task.dependsOn.length} dep{task.dependsOn.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#2b2640]/30">—</span>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="py-2 px-3 text-[10px] text-[#2b2640]/80 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <User className="w-2.5 h-2.5 text-[#2b2640]/40" />
                        <span>{task.assignedTo || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-2 px-3 text-[10px] text-[#2b2640]/70 whitespace-nowrap">
                      {task.dueDate ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-[#2b2640]/40" />
                          <span>{task.dueDate.split('T')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-[#2b2640]/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info bar */}
      <div className="py-2 px-4 bg-[#f8f7fc] border-t border-[#2b2640]/10 flex items-center justify-between text-[10px] font-mono text-[#2b2640]/60">
        <span>SHOWING {sortedTasks.length} RECORDS</span>
        <span className="text-[#544d7e] font-semibold">CLICK ROW FOR FULL INVESTIGATION DOSSIER & SUBTASKS</span>
      </div>
    </div>
  );
}
