'use client';

import React, { useState, useMemo } from 'react';
import {
  List,
  LayoutGrid,
  Calendar,
  Layers,
  Table as TableIcon,
  Activity,
  Plus,
  Filter,
  Search,
  Bot,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Star,
  CheckSquare,
  Zap,
  X
} from 'lucide-react';
import {
  DGACase,
  Task,
  WorkViewMode,
  SavedFilter,
  AutomationRule,
  CaseTemplate,
  Priority
} from '@/lib/dga-types';
import {
  createDGATask,
  applyCaseTemplate,
  toggleAutomationRule
} from '@/lib/dga-store';
import { DgaWorkListView } from './dga-work-list-view';
import { DgaWorkBoardView } from './dga-work-board-view';
import { DgaWorkCalendarView } from './dga-work-calendar-view';
import { DgaWorkTimelineView } from './dga-work-timeline-view';
import { DgaWorkTableView } from './dga-work-table-view';
import { DgaWorkActivityView } from './dga-work-activity-view';
import { DgaTaskDetailModal } from './dga-task-detail-modal';
import { evaluateTaskDependencies } from '@/lib/work-management/dependency-engine';

interface DgaWorkWorkspaceProps {
  cases: DGACase[];
  favoriteTaskIds?: string[];
  savedFilters?: SavedFilter[];
  automationRules?: AutomationRule[];
  caseTemplates?: CaseTemplate[];
  onSelectCase?: (caseId: string) => void;
}

export function DgaWorkWorkspace({
  cases,
  favoriteTaskIds = [],
  savedFilters = [],
  automationRules = [],
  caseTemplates = [],
  onSelectCase
}: DgaWorkWorkspaceProps) {
  const [viewMode, setViewMode] = useState<WorkViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterId, setActiveFilterId] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'status' | 'phase' | 'priority' | 'case'>('status');

  // Modal / Drawer states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isAutomationsModalOpen, setIsAutomationsModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [templateAppliedToast, setTemplateAppliedToast] = useState<string | null>(null);

  // Quick Task Creation form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCaseId, setNewTaskCaseId] = useState<string>(cases[0]?.id || '');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Priority');
  const [newTaskPhase, setNewTaskPhase] = useState<Task['phase']>('Active Investigation');

  // Aggregate all tasks across cases
  const allTasks = useMemo(() => {
    const list: Task[] = [];
    cases.forEach((c) => {
      c.tasks.forEach((t) => {
        list.push({
          ...t,
          caseId: t.caseId || c.id
        });
      });
    });
    return list;
  }, [cases]);

  // Evaluate dependencies
  const evaluatedTasks = useMemo(() => evaluateTaskDependencies(allTasks), [allTasks]);

  // Apply Search & Filters
  const filteredTasks = useMemo(() => {
    return evaluatedTasks.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesId = t.id.toLowerCase().includes(q);
        const matchesAgent = t.assignedTo?.toLowerCase().includes(q);
        const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesId && !matchesAgent && !matchesTags) {
          return false;
        }
      }

      // 2. Active Filter Preset
      if (activeFilterId === 'all') return true;
      if (activeFilterId === 'my') {
        return t.assignedTo?.includes('M. Reynolds') || t.assignedTo?.includes('Investigator');
      }
      if (activeFilterId === 'critical_blocked') {
        return t.priority === 'Critical' || t.isBlocked || t.status === 'blocked';
      }
      if (activeFilterId === 'forensics') {
        return (
          t.phase?.toLowerCase().includes('forensic') ||
          t.tags?.some((tg) => tg.toLowerCase().includes('forensic') || tg.toLowerCase().includes('trace'))
        );
      }
      if (activeFilterId === 'triage') {
        return t.phase?.toLowerCase().includes('triage') || t.phase?.toLowerCase().includes('preliminary') || t.status === 'pending';
      }
      if (activeFilterId === 'favorites') {
        return favoriteTaskIds.includes(t.id);
      }

      // Custom saved filter lookup
      const customFilter = savedFilters.find((f) => f.id === activeFilterId);
      if (customFilter) {
        if (customFilter.criteria?.status && !customFilter.criteria.status.includes(t.status || 'pending')) {
          return false;
        }
        if (customFilter.criteria?.priority && !customFilter.criteria.priority.includes(t.priority || 'Routine')) {
          return false;
        }
        if (customFilter.criteria?.isBlocked && !t.isBlocked) {
          return false;
        }
      }

      return true;
    });
  }, [evaluatedTasks, searchQuery, activeFilterId, favoriteTaskIds, savedFilters]);

  // Keep selectedTask updated if it gets mutated
  const liveSelectedTask = useMemo(() => {
    if (!selectedTask) return null;
    return allTasks.find((t) => t.id === selectedTask.id) || selectedTask;
  }, [selectedTask, allTasks]);

  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskCaseId) return;

    await createDGATask(newTaskCaseId, {
      title: newTaskTitle.trim(),
      description: 'Directive registered via Workforce Management Suite.',
      priority: newTaskPriority,
      phase: newTaskPhase,
      status: 'pending',
      assignedTo: 'Special Agent M. Reynolds'
    });

    setNewTaskTitle('');
    setIsCreateTaskModalOpen(false);
  };

  const handleApplyTemplate = async (templateId: string) => {
    const res = await applyCaseTemplate(templateId);
    if (res) {
      setTemplateAppliedToast(`Operational Case Template applied: ${res.id} deployed to active registry.`);
      setIsTemplatesModalOpen(false);
      setTimeout(() => setTemplateAppliedToast(null), 5000);
      if (onSelectCase) {
        onSelectCase(res.id);
      }
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = evaluatedTasks.length;
    const completed = evaluatedTasks.filter((t) => t.completed || t.status === 'completed').length;
    const blocked = evaluatedTasks.filter((t) => t.isBlocked || t.status === 'blocked').length;
    const critical = evaluatedTasks.filter((t) => t.priority === 'Critical' && !t.completed).length;
    return { total, completed, blocked, critical };
  }, [evaluatedTasks]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f3f2f8] overflow-hidden">
      {/* Toast Notification */}
      {templateAppliedToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#2b2640] text-white text-xs font-mono py-2.5 px-4 rounded shadow-lg border border-[#544d7e] flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{templateAppliedToast}</span>
        </div>
      )}

      {/* Top Application Header */}
      <div className="bg-white border-b border-[#2b2640]/15 px-4 py-3 shrink-0 space-y-3">
        {/* Row 1: Title, Metrics, and Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#4b4372] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
              <CheckSquare className="w-4 h-4 text-[#dedce8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-mono font-bold tracking-tight text-[#2b2640] uppercase">
                  DIRECTIVE & WORKFORCE MANAGEMENT
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f0eef6] text-[#4b4372] font-semibold border border-[#2b2640]/10">
                  DGA CORE
                </span>
              </div>
              <p className="text-[11px] font-sans text-[#2b2640]/60">
                Unified multi-view operational task coordination, dependency chains & automation rules
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <div className="px-2.5 py-1 rounded bg-[#f8f7fc] border border-[#2b2640]/10 flex items-center gap-1.5">
              <span className="text-[#2b2640]/60">TOTAL:</span>
              <span className="font-bold text-[#2b2640]">{metrics.total}</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>DONE:</span>
              <span className="font-bold">{metrics.completed}</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>BLOCKED:</span>
              <span className="font-bold">{metrics.blocked}</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5">
              <span>CRITICAL:</span>
              <span className="font-bold">{metrics.critical}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutomationsModalOpen(true)}
              className="text-[11px] font-mono font-semibold px-2.5 py-1.5 rounded bg-[#f4f2f8] text-[#4b4372] border border-[#2b2640]/15 hover:bg-[#eae6f4] transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#544d7e]" />
              <span>AUTOMATIONS ({automationRules.filter((r) => r.enabled).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTemplatesModalOpen(true)}
              className="text-[11px] font-mono font-semibold px-2.5 py-1.5 rounded bg-[#f4f2f8] text-[#4b4372] border border-[#2b2640]/15 hover:bg-[#eae6f4] transition-colors flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#544d7e]" />
              <span>TEMPLATES ({caseTemplates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="text-[11px] font-mono font-bold px-3 py-1.5 rounded bg-[#4b4372] text-white hover:bg-[#3d365d] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW DIRECTIVE</span>
            </button>
          </div>
        </div>

        {/* Row 2: View Switcher Tabs & Quick Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#2b2640]/10">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-[#edeaf5] p-1 rounded-md border border-[#2b2640]/10">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#2b2640] shadow-xs'
                  : 'text-[#2b2640]/60 hover:text-[#2b2640]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>LIST</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'board'
                  ? 'bg-white text-[#2b2640] shadow-xs'
                  : 'text-[#2b2640]/60 hover:text-[#2b2640]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>BOARD</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#2b2640] shadow-xs'
                  : 'text-[#2b2640]/60 hover:text-[#2b2640]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>CALENDAR</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#2b2640] shadow-xs'
                  : 'text-[#2b2640]/60 hover:text-[#2b2640]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>TIMELINE</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-[#2b2640] shadow-xs'
                  : 'text-[#2b2640]/60 hover:text-[#2b2640]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>TABLE</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('activity')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'activity'
                  ? 'bg-white text-[#2b2640] shadow-xs'
                  : 'text-[#2b2640]/60 hover:text-[#2b2640]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>ACTIVITY</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#2b2640]/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search directives, IDs, agents..."
                className="w-full text-xs font-mono pl-8 pr-3 py-1 bg-[#f8f7fc] border border-[#2b2640]/15 rounded text-[#2b2640] placeholder-[#2b2640]/40 focus:outline-none focus:border-[#4b4372]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#2b2640]/40 hover:text-[#2b2640]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Filter Presets */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-[10px] font-mono font-medium">
              <button
                type="button"
                onClick={() => setActiveFilterId('all')}
                className={`px-2 py-1 rounded whitespace-nowrap border transition-colors ${
                  activeFilterId === 'all'
                    ? 'bg-[#4b4372] text-white border-[#4b4372]'
                    : 'bg-white text-[#2b2640]/70 border-[#2b2640]/15 hover:border-[#2b2640]/30'
                }`}
              >
                ALL
              </button>

              <button
                type="button"
                onClick={() => setActiveFilterId('my')}
                className={`px-2 py-1 rounded whitespace-nowrap border transition-colors ${
                  activeFilterId === 'my'
                    ? 'bg-[#4b4372] text-white border-[#4b4372]'
                    : 'bg-white text-[#2b2640]/70 border-[#2b2640]/15 hover:border-[#2b2640]/30'
                }`}
              >
                MY DIRECTIVES
              </button>

              <button
                type="button"
                onClick={() => setActiveFilterId('critical_blocked')}
                className={`px-2 py-1 rounded whitespace-nowrap border transition-colors ${
                  activeFilterId === 'critical_blocked'
                    ? 'bg-rose-700 text-white border-rose-700'
                    : 'bg-white text-rose-700 border-rose-200 hover:border-rose-300'
                }`}
              >
                CRITICAL / BLOCKED
              </button>

              <button
                type="button"
                onClick={() => setActiveFilterId('forensics')}
                className={`px-2 py-1 rounded whitespace-nowrap border transition-colors ${
                  activeFilterId === 'forensics'
                    ? 'bg-[#4b4372] text-white border-[#4b4372]'
                    : 'bg-white text-[#2b2640]/70 border-[#2b2640]/15 hover:border-[#2b2640]/30'
                }`}
              >
                FORENSICS QUEUE
              </button>

              <button
                type="button"
                onClick={() => setActiveFilterId('favorites')}
                className={`px-2 py-1 rounded whitespace-nowrap border transition-colors flex items-center gap-1 ${
                  activeFilterId === 'favorites'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-amber-700 border-amber-200 hover:border-amber-300'
                }`}
              >
                <Star className="w-2.5 h-2.5 fill-current" />
                <span>FAVORITES</span>
              </button>
            </div>

            {/* List Group-By Selector (Visible only in List Mode) */}
            {viewMode === 'list' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#2b2640]/10">
                <span className="text-[10px] font-mono text-[#2b2640]/50 uppercase">Group:</span>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'status' | 'phase' | 'priority' | 'case')}
                  className="text-[10px] font-mono font-semibold px-2 py-1 bg-white border border-[#2b2640]/15 rounded text-[#2b2640] focus:outline-none"
                >
                  <option value="status">BY STATUS</option>
                  <option value="phase">BY PHASE</option>
                  <option value="priority">BY PRIORITY</option>
                  <option value="case">BY CASE</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Work Surface */}
      <div className="flex-1 overflow-y-auto p-4 w-full">
        {viewMode === 'list' && (
          <DgaWorkListView
            tasks={filteredTasks}
            cases={cases}
            favoriteTaskIds={favoriteTaskIds}
            groupBy={groupBy}
            onOpenTaskDetail={handleOpenTaskDetail}
            onSelectCase={onSelectCase}
          />
        )}

        {viewMode === 'board' && (
          <DgaWorkBoardView
            tasks={filteredTasks}
            cases={cases}
            favoriteTaskIds={favoriteTaskIds}
            onOpenTaskDetail={handleOpenTaskDetail}
            onSelectCase={onSelectCase}
          />
        )}

        {viewMode === 'calendar' && (
          <DgaWorkCalendarView
            tasks={filteredTasks}
            cases={cases}
            onOpenTaskDetail={handleOpenTaskDetail}
          />
        )}

        {viewMode === 'timeline' && (
          <DgaWorkTimelineView
            tasks={filteredTasks}
            cases={cases}
            favoriteTaskIds={favoriteTaskIds}
            onOpenTaskDetail={handleOpenTaskDetail}
            onSelectCase={onSelectCase}
          />
        )}

        {viewMode === 'table' && (
          <DgaWorkTableView
            tasks={filteredTasks}
            cases={cases}
            favoriteTaskIds={favoriteTaskIds}
            onOpenTaskDetail={handleOpenTaskDetail}
            onSelectCase={onSelectCase}
          />
        )}

        {viewMode === 'activity' && (
          <DgaWorkActivityView
            tasks={allTasks}
            cases={cases}
            onOpenTaskDetail={handleOpenTaskDetail}
            onSelectCase={onSelectCase}
          />
        )}
      </div>

      {/* Task Detail Modal */}
      {liveSelectedTask && (
        <DgaTaskDetailModal
          task={liveSelectedTask}
          cases={cases}
          customFieldDefs={[]}
          isFavorite={favoriteTaskIds.includes(liveSelectedTask.id)}
          isOpen={!!liveSelectedTask}
          onClose={() => setSelectedTask(null)}
          onSelectCase={onSelectCase}
        />
      )}

      {/* Case Templates Modal */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#2b2640]/20 rounded-lg shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#f8f7fc] border-b border-[#2b2640]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#544d7e]" />
                <h3 className="text-xs font-mono font-bold text-[#2b2640] uppercase">
                  OPERATIONAL MISSION TEMPLATES
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(false)}
                className="text-[#2b2640]/50 hover:text-[#2b2640]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs font-sans text-[#2b2640]/70">
                Deploy standardized DGA investigative frameworks. Instantiating a mission template initializes a
                dossier, pre-configures phased directives, establishes dependency chains, and maps forensic requests.
              </p>

              <div className="space-y-3">
                {caseTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-[#2b2640]/15 rounded-md hover:border-[#544d7e] transition-colors bg-[#faf9fe] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#2b2640]">
                            {template.title}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase font-bold">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-xs font-sans text-[#2b2640]/70 mt-1">
                          {template.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(template.id)}
                        className="flex-shrink-0 text-xs font-mono font-bold px-3 py-1.5 rounded bg-[#4b4372] text-white hover:bg-[#3a3459] transition-colors shadow-xs"
                      >
                        INSTANTIATE
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#2b2640]/60 pt-1 border-t border-[#2b2640]/10">
                      <span>{template.defaultTasks.length} PRE-CONFIGURED DIRECTIVES</span>
                      <span>•</span>
                      <span>LEAD: {template.leadSystem}</span>
                      <span>•</span>
                      <span>DEFAULT PRIORITY: {template.priority.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 bg-[#f8f7fc] border-t border-[#2b2640]/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(false)}
                className="text-xs font-mono font-medium px-4 py-1.5 rounded border border-[#2b2640]/15 bg-white text-[#2b2640] hover:bg-gray-50"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automation Rules Modal */}
      {isAutomationsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#2b2640]/20 rounded-lg shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#f8f7fc] border-b border-[#2b2640]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#544d7e]" />
                <h3 className="text-xs font-mono font-bold text-[#2b2640] uppercase">
                  DGA ACTIVE AUTOMATION RULES
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAutomationsModalOpen(false)}
                className="text-[#2b2640]/50 hover:text-[#2b2640]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs font-sans text-[#2b2640]/70">
                Automations execute deterministically in reaction to operational state transitions, dependency
                resolutions, and laboratory forensic arrivals.
              </p>

              <div className="space-y-3">
                {automationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 border border-[#2b2640]/15 rounded-md bg-[#faf9fe] flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#2b2640]">
                          {rule.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                            rule.enabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {rule.enabled ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-[#2b2640]/70">{rule.description}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#2b2640]/50">
                        <span className="font-semibold text-[#544d7e]">TRIGGER: {rule.trigger}</span>
                        <span>➔</span>
                        <span>ACTION: {rule.action}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleAutomationRule(rule.id)}
                      className={`text-xs font-mono font-bold px-3 py-1.5 rounded transition-colors ${
                        rule.enabled
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {rule.enabled ? 'DISABLE' : 'ENABLE'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 bg-[#f8f7fc] border-t border-[#2b2640]/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAutomationsModalOpen(false)}
                className="text-xs font-mono font-medium px-4 py-1.5 rounded border border-[#2b2640]/15 bg-white text-[#2b2640] hover:bg-gray-50"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Task Modal */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTaskSubmit}
            className="bg-white border border-[#2b2640]/20 rounded-lg shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95"
          >
            <div className="px-5 py-4 bg-[#f8f7fc] border-b border-[#2b2640]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#544d7e]" />
                <h3 className="text-xs font-mono font-bold text-[#2b2640] uppercase">
                  REGISTER OPERATIONAL DIRECTIVE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="text-[#2b2640]/50 hover:text-[#2b2640]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-[#2b2640]/70 uppercase font-bold mb-1">
                  Directive Instruction / Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Intercept telemetry logs from SCADA repeater..."
                  className="w-full text-xs font-mono px-3 py-2 bg-[#f8f7fc] border border-[#2b2640]/15 rounded text-[#2b2640] focus:outline-none focus:border-[#4b4372]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#2b2640]/70 uppercase font-bold mb-1">
                  Target Case Dossier
                </label>
                <select
                  value={newTaskCaseId}
                  onChange={(e) => setNewTaskCaseId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#f8f7fc] border border-[#2b2640]/15 rounded text-[#2b2640] focus:outline-none focus:border-[#4b4372]"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.id}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#2b2640]/70 uppercase font-bold mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#f8f7fc] border border-[#2b2640]/15 rounded text-[#2b2640] focus:outline-none focus:border-[#4b4372]"
                  >
                    <option value="Routine">ROUTINE</option>
                    <option value="Priority">PRIORITY</option>
                    <option value="High">HIGH</option>
                    <option value="Critical">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#2b2640]/70 uppercase font-bold mb-1">
                    Operational Phase
                  </label>
                  <select
                    value={newTaskPhase}
                    onChange={(e) => setNewTaskPhase(e.target.value as Task['phase'])}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#f8f7fc] border border-[#2b2640]/15 rounded text-[#2b2640] focus:outline-none focus:border-[#4b4372]"
                  >
                    <option value="Preliminary">Preliminary</option>
                    <option value="Active Investigation">Active Investigation</option>
                    <option value="Forensic Analysis">Forensic Analysis</option>
                    <option value="Intervention">Intervention</option>
                    <option value="Prosecution">Prosecution</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#f8f7fc] border-t border-[#2b2640]/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="text-xs font-mono font-medium px-4 py-1.5 rounded border border-[#2b2640]/15 bg-white text-[#2b2640] hover:bg-gray-50"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="text-xs font-mono font-bold px-4 py-1.5 rounded bg-[#4b4372] text-white hover:bg-[#3c355c] transition-colors shadow-xs"
              >
                CREATE DIRECTIVE
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
