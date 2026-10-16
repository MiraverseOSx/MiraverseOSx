'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Star,
  Plus,
  ChevronDown,
  ChevronRight,
  AlertOctagon,
  Tag,
  Link as LinkIcon,
  Layers,
  CornerDownRight
} from 'lucide-react';
import { Task, DGACase, TaskStatus, Priority } from '@/lib/dga-types';
import {
  toggleDGATask,
  createDGATask,
  toggleTaskFavorite,
  updateDGATask
} from '@/lib/dga-store';
import { evaluateTaskDependencies } from '@/lib/work-management/dependency-engine';

interface DgaWorkListViewProps {
  tasks: Task[];
  cases: DGACase[];
  favoriteTaskIds: string[];
  groupBy: 'status' | 'phase' | 'priority' | 'case';
  onOpenTaskDetail: (task: Task) => void;
  onSelectCase?: (caseId: string) => void;
}

export function DgaWorkListView({
  tasks,
  cases,
  favoriteTaskIds,
  groupBy,
  onOpenTaskDetail,
  onSelectCase
}: DgaWorkListViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});
  const [inlineTaskTitles, setInlineTaskTitles] = useState<Record<string, string>>({});
  const [isAddingInGroup, setIsAddingInGroup] = useState<Record<string, boolean>>({});

  const evaluatedTasks = evaluateTaskDependencies(tasks);

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const toggleSubtasksExpand = (taskId: string) => {
    setExpandedSubtasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Group tasks
  const groups: Record<string, typeof evaluatedTasks> = {};

  if (groupBy === 'status') {
    groups['pending'] = [];
    groups['in_progress'] = [];
    groups['under_review'] = [];
    groups['blocked'] = [];
    groups['completed'] = [];

    for (const t of evaluatedTasks) {
      const statusKey = t.status || (t.completed ? 'completed' : 'pending');
      if (!groups[statusKey]) groups[statusKey] = [];
      groups[statusKey].push(t);
    }
  } else if (groupBy === 'priority') {
    groups['Critical'] = [];
    groups['High'] = [];
    groups['Priority'] = [];
    groups['Routine'] = [];

    for (const t of evaluatedTasks) {
      const pKey = t.priority || 'Routine';
      if (!groups[pKey]) groups[pKey] = [];
      groups[pKey].push(t);
    }
  } else if (groupBy === 'phase') {
    groups['Preliminary'] = [];
    groups['Active Investigation'] = [];
    groups['Forensic Analysis'] = [];
    groups['Intervention'] = [];
    groups['Prosecution'] = [];

    for (const t of evaluatedTasks) {
      const phaseKey = t.phase || 'Active Investigation';
      if (!groups[phaseKey]) groups[phaseKey] = [];
      groups[phaseKey].push(t);
    }
  } else if (groupBy === 'case') {
    for (const c of cases) {
      groups[c.id] = [];
    }
    for (const t of evaluatedTasks) {
      const cId = t.caseId || 'DGA-26-194';
      if (!groups[cId]) groups[cId] = [];
      groups[cId].push(t);
    }
  }

  const handleCreateInlineTask = async (groupKey: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = inlineTaskTitles[groupKey];
    if (!title || !title.trim()) return;

    let targetCaseId = cases[0]?.id || 'DGA-26-194';
    if (groupBy === 'case' && cases.some((c) => c.id === groupKey)) {
      targetCaseId = groupKey;
    }

    const newTaskData: any = {
      title: title.trim(),
      description: 'Operational task created from List View.',
      phase: groupBy === 'phase' ? groupKey : 'Active Investigation',
      priority: groupBy === 'priority' ? (groupKey as Priority) : 'Routine',
      status: groupBy === 'status' ? (groupKey as TaskStatus) : 'pending',
      assignedTo: 'Special Agent Miracle Jerome'
    };

    await createDGATask(targetCaseId, newTaskData);
    setInlineTaskTitles((prev) => ({ ...prev, [groupKey]: '' }));
    setIsAddingInGroup((prev) => ({ ...prev, [groupKey]: false }));
  };

  const handleSubtaskToggle = async (parentCaseId: string, parentTaskId: string, subtaskId: string, currentCompleted: boolean) => {
    const parentTask = tasks.find((t) => t.id === parentTaskId);
    if (!parentTask || !parentTask.subtasks) return;
    const updatedSubtasks = parentTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !currentCompleted } : st
    );
    await updateDGATask(parentCaseId, parentTaskId, { subtasks: updatedSubtasks });
  };

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([groupKey, groupTasks]) => {
        const isCollapsed = collapsedGroups[groupKey];
        const isAdding = isAddingInGroup[groupKey];

        return (
          <div
            key={groupKey}
            className="border border-[#dcdbe6] rounded-lg bg-white overflow-hidden shadow-2xs"
          >
            {/* Group Header */}
            <div
              onClick={() => toggleGroupCollapse(groupKey)}
              className="bg-[#f5f4f9] px-4 py-2.5 border-b border-[#e2e0ed] flex items-center justify-between cursor-pointer select-none hover:bg-[#ecebf3] transition-colors"
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-[#737190]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#737190]" />
                )}
                <span className="font-bold text-xs uppercase tracking-wider text-[#2d2b42] font-mono">
                  {groupKey.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#dedce8] text-[#4d4b68] px-1.5 py-0.2 rounded">
                  {groupTasks.length}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingInGroup((prev) => ({ ...prev, [groupKey]: !isAdding }));
                }}
                className="text-[11px] font-semibold text-[#5d5a86] hover:text-[#3d3a66] flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#dedce8]"
              >
                <Plus className="w-3 h-3" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Group Content */}
            {!isCollapsed && (
              <div className="divide-y divide-[#ecebf2] text-xs">
                {/* Inline Task Form */}
                {isAdding && (
                  <form
                    onSubmit={(e) => handleCreateInlineTask(groupKey, e)}
                    className="p-3 bg-[#faf9fd] flex items-center gap-2 border-b border-[#e4e2ee]"
                  >
                    <input
                      type="text"
                      placeholder="Enter directive title and press Enter..."
                      value={inlineTaskTitles[groupKey] || ''}
                      onChange={(e) =>
                        setInlineTaskTitles((prev) => ({ ...prev, [groupKey]: e.target.value }))
                      }
                      className="flex-1 bg-white border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#201f30] focus:outline-none focus:border-[#5d5a86]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Save Directive
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingInGroup((prev) => ({ ...prev, [groupKey]: false }))}
                      className="px-2 py-1.5 text-[#6c6a88] hover:text-[#201f30] text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {groupTasks.length > 0 ? (
                  groupTasks.map((task) => {
                    const parentCase = cases.find((c) => c.tasks.some((t) => t.id === task.id)) || cases[0];
                    const isFav = favoriteTaskIds.includes(task.id);
                    const subtasks = task.subtasks || [];
                    const isSubtasksExpanded = expandedSubtasks[task.id];

                    return (
                      <div key={task.id} className="group hover:bg-[#fcfbfe] transition-colors">
                        <div className="p-3 flex items-center gap-3">
                          {/* Complete Checkbox */}
                          <button
                            onClick={() => toggleDGATask(parentCase.id, task.id)}
                            className="text-[#7d7a9c] hover:text-[#5d5a86] cursor-pointer shrink-0"
                            title={task.completed ? 'Reopen directive' : 'Mark directive completed'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#8a88a4]" />
                            )}
                          </button>

                          {/* Favorite Star */}
                          <button
                            onClick={() => toggleTaskFavorite(task.id)}
                            className={`shrink-0 cursor-pointer ${
                              isFav ? 'text-amber-500' : 'text-[#cfcddb] hover:text-amber-400'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Task ID */}
                          <span className="font-mono text-[11px] font-bold text-[#626082] shrink-0">
                            {task.id}
                          </span>

                          {/* Task Title */}
                          <div
                            onClick={() => onOpenTaskDetail(task)}
                            className={`flex-1 font-semibold cursor-pointer hover:text-[#5d5a86] transition-colors ${
                              task.completed ? 'text-[#87859c] line-through' : 'text-[#201f30]'
                            }`}
                          >
                            {task.title}
                          </div>

                          {/* Blocked Badge */}
                          {task.isBlocked && (
                            <span
                              className="px-1.5 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-800 font-mono text-[10px] font-bold flex items-center gap-1 shrink-0 animate-pulse"
                              title={
                                task.blockers.length > 0
                                  ? `Blocked by: ${task.blockers.map((b) => b.taskId).join(', ')}`
                                  : 'Explicitly marked Blocked'
                              }
                            >
                              <AlertOctagon className="w-3 h-3 text-rose-600" />
                              <span>BLOCKED</span>
                            </span>
                          )}

                          {/* Subtasks Count Button */}
                          {subtasks.length > 0 && (
                            <button
                              onClick={() => toggleSubtasksExpand(task.id)}
                              className="px-1.5 py-0.5 rounded bg-[#ecebf3] hover:bg-[#dedce8] text-[#555370] text-[10px] font-mono font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Layers className="w-3 h-3 text-[#797799]" />
                              <span>
                                {subtasks.filter((st) => st.completed).length}/{subtasks.length}
                              </span>
                            </button>
                          )}

                          {/* Case Badge */}
                          {parentCase && (
                            <span
                              onClick={() => onSelectCase && onSelectCase(parentCase.id)}
                              className="px-1.5 py-0.5 rounded bg-[#f0eff6] border border-[#dcdbe6] text-[#4d4b68] font-mono text-[10px] font-bold shrink-0 cursor-pointer hover:border-[#5d5a86]"
                            >
                              {parentCase.id}
                            </span>
                          )}

                          {/* Phase Badge */}
                          <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-[#ecebf3] text-[#53516f] text-[10px] font-medium shrink-0">
                            {task.phase}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              task.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : task.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#e7e6ee] text-[#504e6c]'
                            }`}
                          >
                            {task.priority || 'Routine'}
                          </span>

                          {/* Assignee */}
                          <span className="hidden lg:inline-block text-[11px] text-[#696784] font-medium shrink-0 w-32 truncate">
                            {task.assignedTo}
                          </span>

                          {/* Due Date */}
                          {task.dueDate && (
                            <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#777595] shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{task.dueDate.split('T')[0]}</span>
                            </span>
                          )}
                        </div>

                        {/* Expandable Subtasks Shelf */}
                        {isSubtasksExpanded && subtasks.length > 0 && (
                          <div className="bg-[#f9f8fd] px-10 py-2 border-t border-[#ecebf2] space-y-1.5">
                            {subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={() => handleSubtaskToggle(parentCase.id, task.id, st.id, st.completed)}
                                className="flex items-center gap-2 text-xs py-0.5 cursor-pointer group/st"
                              >
                                <CornerDownRight className="w-3 h-3 text-[#9593ab]" />
                                {st.completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-[#9593ab] group-hover/st:text-[#5d5a86] shrink-0" />
                                )}
                                <span
                                  className={`text-xs ${
                                    st.completed ? 'text-[#8c8a9e] line-through' : 'text-[#35334c]'
                                  }`}
                                >
                                  {st.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-[#87859e]">
                    No operational directives in this group.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
