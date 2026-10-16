'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  User,
  Tag,
  Star,
  Plus,
  Send,
  Link as LinkIcon,
  Shield,
  Layers,
  History,
  MessageSquare,
  Lock,
  ChevronRight,
  Calendar,
  AlertOctagon,
  FileText,
  Beaker,
  Radio,
  Check
} from 'lucide-react';
import {
  Task,
  DGACase,
  TaskStatus,
  Priority,
  CustomFieldDefinition
} from '@/lib/dga-types';
import {
  updateDGATask,
  createDGASubtask,
  addTaskComment,
  toggleTaskFavorite,
  createDGAForensicRequest,
  sendDGACommunication
} from '@/lib/dga-store';
import { evaluateTaskDependencies } from '@/lib/work-management/dependency-engine';

interface DgaTaskDetailModalProps {
  task: Task | null;
  cases: DGACase[];
  customFieldDefs?: CustomFieldDefinition[];
  isFavorite?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
  onNavigateToComms?: () => void;
}

export function DgaTaskDetailModal({
  task,
  cases,
  customFieldDefs = [],
  isFavorite = false,
  isOpen,
  onClose,
  onSelectCase,
  onNavigateToComms
}: DgaTaskDetailModalProps) {
  const [commentInput, setCommentInput] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'history'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isActionBusy, setIsActionBusy] = useState(false);

  if (!isOpen || !task) return null;

  const parentCase = cases.find((c) => c.tasks.some((t) => t.id === task.id)) || cases[0];
  const caseTasks = parentCase ? parentCase.tasks : [];

  // Evaluate blockers
  const evaluatedList = evaluateTaskDependencies(caseTasks);
  const evaluatedCurrentTask = evaluatedList.find((t) => t.id === task.id) || task;
  const isBlocked = 'isBlocked' in evaluatedCurrentTask ? (evaluatedCurrentTask as any).isBlocked : task.status === 'blocked';
  const blockers = 'blockers' in evaluatedCurrentTask ? (evaluatedCurrentTask as any).blockers : [];

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateDGATask(parentCase.id, task.id, { status: newStatus });
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    await updateDGATask(parentCase.id, task.id, { priority: newPriority });
  };

  const handlePhaseChange = async (newPhase: any) => {
    await updateDGATask(parentCase.id, task.id, { phase: newPhase });
  };

  const handleAssigneeChange = async (newAssignee: string) => {
    if (!parentCase) return;
    await updateDGATask(parentCase.id, task.id, { assignedTo: newAssignee });
  };

  const handleLinkEvidence = async (evidenceId: string) => {
    if (!parentCase || !evidenceId) return;
    const current = task.linkedEvidenceIds || [];
    if (!current.includes(evidenceId)) {
      await updateDGATask(parentCase.id, task.id, { linkedEvidenceIds: [...current, evidenceId] });
      setToastMessage(`Linked evidence item ${evidenceId} to directive.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleUnlinkEvidence = async (evidenceId: string) => {
    if (!parentCase || !evidenceId) return;
    const current = (task.linkedEvidenceIds || []).filter((id) => id !== evidenceId);
    await updateDGATask(parentCase.id, task.id, { linkedEvidenceIds: current });
  };

  const handleRequisitionLab = async (evidenceId: string) => {
    if (!parentCase) return;
    setIsActionBusy(true);
    try {
      const ev = (parentCase.evidence || []).find((e) => e.id === evidenceId);
      const req = await createDGAForensicRequest(parentCase.id, {
        caseId: parentCase.id,
        requestedBy: task.assignedTo || 'Special Agent Miracle Jerome',
        targetModules: ['toxicology', 'spectroscopy', 'microscopy', 'digital'],
        evidenceIds: [evidenceId],
        notes: `Forensic examination requisitioned directly from Directive ${task.id} (${task.title}). Item: ${ev?.title || evidenceId}.`
      });
      if (req) {
        setToastMessage(`Forensic Requisition ${req.id} transmitted to TRACE Laboratory.`);
      }
    } catch {
      setToastMessage('Error dispatching laboratory requisition.');
    } finally {
      setIsActionBusy(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDispatchDirectiveCable = async () => {
    if (!parentCase) return;
    setIsActionBusy(true);
    try {
      const cable = await sendDGACommunication({
        sender: task.assignedTo || 'Special Agent Miracle Jerome',
        recipient: 'Directorate Operations & TRACE Forensic Liaison',
        subject: `DIRECTIVE CABLE // ${task.id}: ${task.title}`,
        body: `OPERATIONAL DIRECTIVE STATUS DISPATCH\n\nDirective Reference: ${task.id}\nParent Case: ${parentCase.id} - ${parentCase.title}\nClassification: TOP SECRET // NOFORN\nPriority: ${task.priority || 'Routine'}\nPhase: ${task.phase}\nCurrent Status: ${task.status || (task.completed ? 'completed' : 'pending')}\nAssigned Investigator: ${task.assignedTo}\nLinked Evidence: ${(task.linkedEvidenceIds || []).join(', ') || 'None'}\n\nOPERATIONAL PARAMETERS & DIRECTIVE DETAILS:\n${task.description || 'No detailed instructions provided.'}`,
        classification: 'TOP SECRET // NOFORN',
        priority: task.priority === 'Critical' ? 'Flash / Immediate' : task.priority === 'High' ? 'Priority' : 'Routine',
        caseId: parentCase.id
      });
      setToastMessage(`Encrypted dispatch ${cable.id} transmitted across agency wire.`);
    } catch {
      setToastMessage('Failed to transmit operational cable.');
    } finally {
      setIsActionBusy(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDueDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateDGATask(parentCase.id, task.id, { dueDate: e.target.value });
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    const updatedSubtasks = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !currentCompleted } : st
    );
    await updateDGATask(parentCase.id, task.id, { subtasks: updatedSubtasks });
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    await createDGASubtask(parentCase.id, task.id, { title: newSubtaskTitle.trim() });
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    await addTaskComment(parentCase.id, task.id, commentInput.trim());
    setCommentInput('');
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const formatted = newTagInput.startsWith('#') ? newTagInput.toUpperCase() : `#${newTagInput.toUpperCase()}`;
    const tags = Array.from(new Set([...(task.tags || []), formatted]));
    await updateDGATask(parentCase.id, task.id, { tags });
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const tags = (task.tags || []).filter((t) => t !== tagToRemove);
    await updateDGATask(parentCase.id, task.id, { tags });
  };

  const handleAddDependency = async (depTaskId: string) => {
    if (!depTaskId || depTaskId === task.id) return;
    const dependsOn = Array.from(new Set([...(task.dependsOn || []), depTaskId]));
    await updateDGATask(parentCase.id, task.id, { dependsOn });
  };

  const handleRemoveDependency = async (depTaskId: string) => {
    const dependsOn = (task.dependsOn || []).filter((id) => id !== depTaskId);
    await updateDGATask(parentCase.id, task.id, { dependsOn });
  };

  const handleCustomFieldChange = async (fieldId: string, value: string) => {
    const customFields = { ...(task.customFields || {}), [fieldId]: value };
    await updateDGATask(parentCase.id, task.id, { customFields });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
      <div className="w-full max-w-2xl bg-[#1b1a26] border-l border-[#2e2d40] text-[#e2e0ed] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-xs font-sans">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#2e2d40] flex items-center justify-between bg-[#151420] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#9598c4]" />
              {task.id}
            </span>

            {/* Case Badge */}
            {parentCase && (
              <button
                onClick={() => onSelectCase && onSelectCase(parentCase.id)}
                className="px-2 py-0.5 rounded bg-[#282638] hover:bg-[#34324a] text-[#b3b0d1] border border-[#3c3a54] font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title={`Linked to Case ${parentCase.id}`}
              >
                <span>{parentCase.id}</span>
                <ChevronRight className="w-3 h-3 text-[#7b789e]" />
              </button>
            )}

            {/* Favorite Star */}
            <button
              onClick={() => toggleTaskFavorite(task.id)}
              className={`p-1 rounded hover:bg-[#2b2a3d] transition-colors cursor-pointer ${
                isFavorite ? 'text-amber-400' : 'text-[#696788] hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Mark as favorite directive'}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded text-[#8482a4] hover:text-white hover:bg-[#2b2a3d] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-[#212032] border-b border-[#444164] px-5 py-2 flex items-center justify-between text-emerald-300 shrink-0 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#8885a8] hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Blocker Alert Banner */}
        {isBlocked && (
          <div className="bg-rose-950/40 border-b border-rose-800/60 px-5 py-2.5 flex items-center justify-between text-rose-200 shrink-0 animate-pulse">
            <div className="flex items-center gap-2 font-bold text-[11px]">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>DIRECTIVE BLOCKED: Prerequisite operational dependencies incomplete.</span>
            </div>
            {blockers.length > 0 && (
              <span className="text-[10px] font-mono text-rose-300">
                Blocked by: {blockers.map((b: any) => b.taskId).join(', ')}
              </span>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2e2d40] bg-[#161522] px-5 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#9598c4] text-white'
                : 'border-transparent text-[#7e7c9f] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>DIRECTIVE OVERVIEW</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'comments'
                ? 'border-[#9598c4] text-white'
                : 'border-transparent text-[#7e7c9f] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>OBSERVATIONS ({task.comments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#9598c4] text-white'
                : 'border-transparent text-[#7e7c9f] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>AUDIT HISTORY ({task.activityHistory?.length || 0})</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'overview' && (
            <>
              {/* Directive Title & Description */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => updateDGATask(parentCase.id, task.id, { title: e.target.value })}
                  className="w-full bg-transparent text-base font-bold text-white border-b border-transparent hover:border-[#38364e] focus:border-[#9598c4] focus:outline-none pb-1 transition-colors"
                  placeholder="Directive title..."
                />
                <textarea
                  rows={3}
                  value={task.description}
                  onChange={(e) => updateDGATask(parentCase.id, task.id, { description: e.target.value })}
                  placeholder="Operational instructions and parameters..."
                  className="w-full bg-[#151420] border border-[#2d2c3f] rounded-lg p-2.5 text-xs text-[#d1cee0] leading-relaxed focus:outline-none focus:border-[#9598c4]"
                />
              </div>

              {/* Status, Priority, Phase, Due Date, Assigned Agent Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-[#161521] border border-[#2a293c] p-3 rounded-lg text-xs">
                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#797799] mb-1">
                    STATUS
                  </label>
                  <select
                    value={task.status || (task.completed ? 'completed' : 'pending')}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    className="w-full bg-[#201f2e] border border-[#353449] rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value="pending">Pending / Triage</option>
                    <option value="in_progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#797799] mb-1">
                    PRIORITY
                  </label>
                  <select
                    value={task.priority || 'Routine'}
                    onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                    className="w-full bg-[#201f2e] border border-[#353449] rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Priority">Priority</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Phase */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#797799] mb-1">
                    PHASE
                  </label>
                  <select
                    value={task.phase}
                    onChange={(e) => handlePhaseChange(e.target.value)}
                    className="w-full bg-[#201f2e] border border-[#353449] rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value="Preliminary">Preliminary</option>
                    <option value="Active Investigation">Active Investigation</option>
                    <option value="Forensic Analysis">Forensic Analysis</option>
                    <option value="Intervention">Intervention</option>
                    <option value="Prosecution">Prosecution</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#797799] mb-1">
                    DUE DATE
                  </label>
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                    onChange={handleDueDateChange}
                    className="w-full bg-[#201f2e] border border-[#353449] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                {/* Assigned Agent */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#797799] mb-1">
                    ASSIGNED AGENT
                  </label>
                  <select
                    value={task.assignedTo || 'Special Agent Miracle Jerome'}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full bg-[#201f2e] border border-[#353449] rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none truncate"
                  >
                    <option value="Special Agent Miracle Jerome">SA Miracle Jerome (Lead)</option>
                    <option value="Special Agent Callum Brody">SA Callum Brody (Forensics)</option>
                    <option value="Dr. Gregory Thorne">Dr. Gregory Thorne (Chief Tox)</option>
                    <option value="Special Agent T. Chen">SA T. Chen (Cyber & SCADA)</option>
                    <option value="Agent Sarah Lin">Agent Sarah Lin (Diplomatic)</option>
                    <option value="Forensic Unit Delta">Forensic Unit Delta</option>
                    <option value="Technical Operations Group 4">Tech Ops Group 4 (Signals)</option>
                    <option value="Field Agent K. Lawson">Agent K. Lawson (Scene)</option>
                    <option value="Unassigned">Unassigned Pool</option>
                  </select>
                </div>
              </div>

              {/* Subtasks Checklist */}
              <div className="space-y-2 border border-[#2b2a3c] rounded-lg p-3 bg-[#171622]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-[#9598c4] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SUBTASKS ({task.subtasks?.filter((st) => st.completed).length || 0}/
                    {task.subtasks?.length || 0})
                  </span>
                  <button
                    onClick={() => setIsAddingSubtask(!isAddingSubtask)}
                    className="text-[11px] text-[#a9a7c6] hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAddingSubtask ? 'CANCEL' : 'ADD SUBTASK'}</span>
                  </button>
                </div>

                {/* Subtask Form */}
                {isAddingSubtask && (
                  <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Subtask title..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 bg-[#100f18] border border-[#35334a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#9598c4]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </form>
                )}

                {/* Subtasks List */}
                <div className="space-y-1.5 pt-1">
                  {task.subtasks && task.subtasks.length > 0 ? (
                    task.subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleToggleSubtask(st.id, st.completed)}
                        className={`p-2 rounded border flex items-center gap-2 cursor-pointer transition-colors text-xs ${
                          st.completed
                            ? 'bg-[#14131d] border-[#252436] text-[#696784] line-through'
                            : 'bg-[#201f2e] border-[#312f45] text-[#d6d4e8] hover:border-[#5d5a86]'
                        }`}
                      >
                        {st.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-[#6c6a8c] shrink-0" />
                        )}
                        <span className="flex-1">{st.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-[#6b6989] py-1">No subtasks defined for this directive.</div>
                  )}
                </div>
              </div>

              {/* Dependencies Section */}
              <div className="space-y-2 border border-[#2b2a3c] rounded-lg p-3 bg-[#171622]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-[#9598c4] uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" />
                    PREREQUISITE DEPENDENCIES ({task.dependsOn?.length || 0})
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleAddDependency(e.target.value);
                        e.target.value = '';
                      }}
                      className="bg-[#201f2e] border border-[#353449] rounded px-2 py-0.5 text-[11px] text-[#b3b0d0] focus:outline-none"
                    >
                      <option value="">+ Add Prerequisite...</option>
                      {caseTasks
                        .filter((t) => t.id !== task.id && !task.dependsOn?.includes(t.id))
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.id}: {t.title.slice(0, 35)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {task.dependsOn && task.dependsOn.length > 0 ? (
                    task.dependsOn.map((depId) => {
                      const depTask = caseTasks.find((t) => t.id === depId);
                      const isDepDone = depTask?.completed;
                      return (
                        <div
                          key={depId}
                          className="flex items-center justify-between p-2 rounded bg-[#201f2e] border border-[#333148] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {isDepDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            )}
                            <span className="font-mono text-[11px] text-[#9598c4] font-bold">{depId}</span>
                            <span className="text-[#c7c5dc]">{depTask?.title || 'Unknown Task'}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveDependency(depId)}
                            className="text-[#7c7a9c] hover:text-rose-400 text-xs px-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-[11px] text-[#6b6989] py-1">
                      No dependencies. This directive can be executed immediately.
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Case Evidence & TRACE Laboratory Requisitions */}
              <div className="space-y-2.5 border border-[#2b2a3c] rounded-lg p-3 bg-[#171622]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-[#9598c4] uppercase tracking-wider flex items-center gap-1.5">
                    <Beaker className="w-3.5 h-3.5 text-emerald-400" />
                    LINKED CASE EVIDENCE ({task.linkedEvidenceIds?.length || 0})
                  </span>
                  {parentCase?.evidence && parentCase.evidence.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleLinkEvidence(e.target.value);
                        e.target.value = '';
                      }}
                      className="bg-[#201f2e] border border-[#353449] rounded px-2 py-0.5 text-[11px] text-[#b3b0d0] focus:outline-none cursor-pointer"
                    >
                      <option value="">+ Link Case Evidence...</option>
                      {parentCase.evidence
                        .filter((ev) => !task.linkedEvidenceIds?.includes(ev.id))
                        .map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.id}: {ev.title.slice(0, 32)}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  {task.linkedEvidenceIds && task.linkedEvidenceIds.length > 0 ? (
                    task.linkedEvidenceIds.map((evId) => {
                      const ev = parentCase?.evidence?.find((e) => e.id === evId);
                      return (
                        <div
                          key={evId}
                          className="p-2.5 rounded bg-[#1f1e2c] border border-[#323046] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-[10.5px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/60 px-1.5 py-0.2 rounded">
                                {evId}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-[#8885a8]">
                                {ev?.category || 'Evidence Item'}
                              </span>
                              <span className="text-[9.5px] text-slate-400 font-mono">
                                [{ev?.custodyStatus || 'In Custody'}]
                              </span>
                            </div>
                            <div className="font-semibold text-white truncate">
                              {ev?.title || 'Indexed Evidence Item'}
                            </div>
                            {ev?.description && (
                              <div className="text-[10.5px] text-[#9a97b8] line-clamp-1 mt-0.5">
                                {ev.description}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              disabled={isActionBusy}
                              onClick={() => handleRequisitionLab(evId)}
                              className="h-6 px-2 bg-emerald-700/80 hover:bg-emerald-600 disabled:opacity-50 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Requisition forensic testing in TRACE laboratory"
                            >
                              <Beaker className="w-3 h-3 text-emerald-200" />
                              <span>REQUISITION LAB</span>
                            </button>
                            <button
                              onClick={() => handleUnlinkEvidence(evId)}
                              className="p-1 text-[#7c7a9c] hover:text-rose-400 cursor-pointer"
                              title="Unlink evidence from directive"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-[11px] text-[#6b6989] py-1">
                      No evidence items currently linked to this directive. Link an item above to file laboratory testing requisitions.
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Comms Cable Dispatch Station */}
              <div className="p-3 bg-[#171622] border border-[#2b2a3c] rounded-lg flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded bg-[#2b2940] border border-[#3e3b5a] flex items-center justify-center shrink-0">
                    <Radio className="w-3.5 h-3.5 text-[#9598c4]" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px] uppercase tracking-wider">
                      DIRECTIVE COMMS DISPATCH
                    </div>
                    <div className="text-[10px] text-[#8683a4]">
                      Transmit encrypted directive findings and task parameters across agency network
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={isActionBusy}
                    onClick={handleDispatchDirectiveCable}
                    className="h-6 px-2.5 bg-[#4b4372] hover:bg-[#3c355e] disabled:opacity-50 text-white rounded text-[10.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>DISPATCH CABLE</span>
                  </button>
                </div>
              </div>

              {/* Custom Fields Section */}
              <div className="space-y-2 border border-[#2b2a3c] rounded-lg p-3 bg-[#171622]">
                <span className="font-bold text-[11px] text-[#9598c4] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  AGENCY CUSTOM FIELDS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {customFieldDefs
                    .filter((f) => f.applicableTo === 'tasks' || f.applicableTo === 'both')
                    .map((field) => (
                      <div key={field.id} className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#797799]">
                          {field.name}
                        </label>
                        {field.type === 'select' || field.type === 'badge' ? (
                          <select
                            value={(task.customFields?.[field.id] as string) || (field.defaultValue as string) || ''}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                            className="w-full bg-[#201f2e] border border-[#353449] rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={(task.customFields?.[field.id] as string) || ''}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                            placeholder={String(field.defaultValue || 'Enter value...')}
                            className="w-full bg-[#201f2e] border border-[#353449] rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#797799] flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    OPERATIONAL TAGS
                  </span>
                  <button
                    onClick={() => setIsAddingTag(!isAddingTag)}
                    className="text-[10px] font-semibold text-[#a9a7c6] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>ADD TAG</span>
                  </button>
                </div>

                {isAddingTag && (
                  <form onSubmit={handleAddTag} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. #CYBER or BIOHAZARD"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="bg-[#12111a] border border-[#37354c] rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {task.tags && task.tags.length > 0 ? (
                    task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-[#232133] border border-[#3b3952] px-2 py-0.5 rounded font-mono text-[10px] font-bold text-[#b5b2d4]"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-[#6d6b8b] hover:text-rose-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-[#6b6989]">No tags assigned.</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Record an operational finding, laboratory lead, or directive note..."
                  className="w-full bg-[#151420] border border-[#2d2c3f] rounded-lg p-2.5 text-xs text-white leading-relaxed focus:outline-none focus:border-[#9598c4]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#5d5a86] hover:bg-[#4d4a72] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>COMMIT OBSERVATION</span>
                  </button>
                </div>
              </form>

              {/* Comments Thread */}
              <div className="space-y-2 pt-2 border-t border-[#29283a]">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-3 rounded-lg border border-[#2d2c40] bg-[#161521] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#7d7a9e]">
                        <span className="font-bold text-white font-mono">{cmt.author}</span>
                        <span>{new Date(cmt.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[#cfcde0] leading-relaxed whitespace-pre-wrap">{cmt.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-[#716f8e]">
                    No observations committed yet on this directive.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {task.activityHistory && task.activityHistory.length > 0 ? (
                task.activityHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded border border-[#29283a] bg-[#14131e] flex items-start gap-2.5 text-xs"
                  >
                    <History className="w-3.5 h-3.5 text-[#9598c4] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] text-[#716f8f]">
                        <span className="font-bold text-white font-mono">{item.actor}</span>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="font-semibold text-[#b5b2d1] mt-0.5">{item.action}</div>
                      <div className="text-[11px] text-[#8683a3] mt-0.5">{item.detail}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#716f8e]">
                  No audit trail events recorded yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
