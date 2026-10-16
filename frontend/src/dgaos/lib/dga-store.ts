'use client';

import {
  DGAState,
  DGACase,
  DGAStorageAdapter,
  DgaAlert,
  Task,
  ForensicRequest,
  AgentNote,
  DGASystem,
  CaseDecision,
  AgencyActivityItem,
  CaseBlueprint,
  CustomFieldDefinition,
  SavedFilter,
  CaseTemplate,
  DashboardWidgetConfig,
  TaskComment,
  DocumentReference,
  SharedCasePatch,
  SystemActor,
  SystemCaseLink,
  SystemFinding,
  SystemRequest,
  SystemRequestStatus,
  SystemBusPayload,
  EvidenceItem,
  PersonReference,
  TimelineEvent,
  CaseCauseHypothesis,
  SuspectInvestigationProfile,
  CustodyEvent,
  FindingKind,
  MedicalRecordsRequest,
  MedicalRequestStatus,
  SuggestionDisposition,
  InvestigativeFinding,
  MailAttachment,
  RichMailAttachment
} from './dga-types';

import {
  primarySeedAgent,
  seedCases,
  seedPeople,
  seedOrganizations,
  seedLocations,
  seedRelationships,
  seedCommunications,
  seedNPCs,
  seedCaseBlueprints,
  seedCaseRelationships
} from '../data/seed';
import { DGA_26_194_STARTING_PAYLOAD, INV_26_402_STARTING_PAYLOAD } from '../data/seed/cases';
import { DGA_26_194_INTRO_CABLE } from '../data/seed/communications';

import {
  seedCustomFields,
  seedSavedFilters,
  seedCaseTemplates,
  seedAutomationRules,
  seedDashboardWidgets
} from '../data/seed/work-management';

export { emitDgaEvent } from './dga-events';
import { emitDgaEvent } from './dga-events';
import type { DGAEventInput } from './dga-events';
import type { VoicemailRecord } from './phone-data';
import {
  createEmptySystemExchange,
  linkCaseToSystem,
  openSystemRequest,
  updateSystemRequestStatus,
  acceptSystemRequest,
  attachSystemDocument,
  recordSystemFinding,
  applySharedCasePatch,
  recordSystemSignal,
  findSystemRequestByLegacyId,
  isTerminalRequestStatus
} from './systems/system-state';
import type {
  ExchangeResult,
  LinkCaseInput,
  OpenRequestInput,
  RequestStatusOptions,
  AttachDocumentInput,
  ReturnFindingInput,
  SystemSignalInput
} from './systems/system-state';
import {
  processSimulationTick,
  processOfflineProgression
} from './simulation/simulation-engine';
import { evaluateTaskCompletionReaction } from './simulation/reaction-engine';
import { evaluateDecisionConsequences } from './simulation/consequence-engine';
import { processAutomations } from './work-management/automation-engine';
import { eventCommsEngine } from './engine/event-comms-engine';
export { eventCommsEngine } from './engine/event-comms-engine';
import { allocateIncidentCaseId, buildManualIncidentCase, type ManualIncidentInput } from './dga-incident';
import { findReusableForensicRequest } from './dga-trace-match';

const STORAGE_KEY = 'DGAOS_WORKSTATION_STATE_V3';

/**
 * Default Initial State: True Day-One Empty State
 * No active cases, no active evidence, no preloaded tasks, no fake activity.
 * Workstation is locked initially requiring operator smart-card login.
 */
export function createDefaultDGAState(): DGAState {
  const now = new Date().toISOString();

  return {
    profile: { ...primarySeedAgent },
    cases: JSON.parse(JSON.stringify(seedCases)),
    people: JSON.parse(JSON.stringify(seedPeople)),
    organizations: JSON.parse(JSON.stringify(seedOrganizations)),
    locations: JSON.parse(JSON.stringify(seedLocations)),
    relationships: JSON.parse(JSON.stringify(seedRelationships)),
    communications: JSON.parse(JSON.stringify(seedCommunications)),
    alerts: [],
    activeCaseId: null,
    isLocked: true,
    activeSystem: 'DGA_CORE',

    // Operational simulation state
    simulation: {
      status: 'live',
      activityLevel: 'normal',
      focusMode: false,
      currentTime: now,
      lastProcessedAt: now,
      offlineEventsSummary: null
    },
    session: {
      sessionId: `SESS-${Date.now()}`,
      startTime: now,
      lastActiveTime: now,
      casesWorked: 0,
      actionsTaken: 0,
      evidenceSubmitted: 0,
      messagesSent: 0,
      decisionsMade: 0
    },
    scheduledEvents: [],
    npcs: JSON.parse(JSON.stringify(seedNPCs)),
    decisions: [],
    caseRelationships: JSON.parse(JSON.stringify(seedCaseRelationships)),
    caseBlueprints: JSON.parse(JSON.stringify(seedCaseBlueprints)),
    agencyActivityFeed: [],
    activityFeed: [],

    // Work Management additions
    customFieldDefinitions: JSON.parse(JSON.stringify(seedCustomFields)),
    savedFilters: JSON.parse(JSON.stringify(seedSavedFilters)),
    caseTemplates: JSON.parse(JSON.stringify(seedCaseTemplates)),
    automationRules: JSON.parse(JSON.stringify(seedAutomationRules)),
    dashboardWidgets: JSON.parse(JSON.stringify(seedDashboardWidgets)),
    favoriteCaseIds: [],
    favoriteTaskIds: [],

    systemExchange: createEmptySystemExchange(),
    unacknowledgedSimulationEventCount: 0
  };
}

/**
 * LocalStorage Storage Adapter (Phase 1 & 2 Implementation)
 */
export class LocalStorageDGAAdapter implements DGAStorageAdapter {
  async loadState(): Promise<DGAState> {
    if (typeof window === 'undefined') {
      return createDefaultDGAState();
    }

    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        const defaultState = createDefaultDGAState();
        await this.saveState(defaultState);
        return defaultState;
      }
      const parsed = JSON.parse(serialized);

      // Merge defaults if migrating from Phase 1 or 2 state
      const defaultState = createDefaultDGAState();
      const activity = parsed.agencyActivityFeed || parsed.activityFeed || defaultState.agencyActivityFeed;

      // Ensure all seed cases exist in the user's docket directory
      const existingCaseIds = new Set((parsed.cases || []).map((c: any) => c.id));
      const mergedCases = [...(parsed.cases || [])];
      for (const sc of defaultState.cases) {
        if (!existingCaseIds.has(sc.id)) {
          mergedCases.push(sc);
        }
      }

      return {
        ...defaultState,
        ...parsed,
        cases: mergedCases,
        unacknowledgedSimulationEventCount: parsed.unacknowledgedSimulationEventCount ?? 0,
        simulation: { ...defaultState.simulation, ...parsed.simulation },
        session: { ...defaultState.session, ...parsed.session },
        caseBlueprints: { ...defaultState.caseBlueprints, ...parsed.caseBlueprints },
        npcs: parsed.npcs && parsed.npcs.length > 0 ? parsed.npcs : defaultState.npcs,
        decisions: parsed.decisions || defaultState.decisions,
        caseRelationships: parsed.caseRelationships || defaultState.caseRelationships,
        agencyActivityFeed: activity,
        activityFeed: activity,

        // Work Management
        customFieldDefinitions: parsed.customFieldDefinitions || defaultState.customFieldDefinitions,
        savedFilters: parsed.savedFilters || defaultState.savedFilters,
        caseTemplates: parsed.caseTemplates || defaultState.caseTemplates,
        automationRules: parsed.automationRules || defaultState.automationRules,
        dashboardWidgets: parsed.dashboardWidgets || defaultState.dashboardWidgets,
        favoriteCaseIds: parsed.favoriteCaseIds || defaultState.favoriteCaseIds,
        favoriteTaskIds: parsed.favoriteTaskIds || defaultState.favoriteTaskIds,

        systemExchange: { ...defaultState.systemExchange, ...parsed.systemExchange }
      };
    } catch (err) {
      console.error('[DGA-STORE] Failed to load state from localStorage:', err);
      return createDefaultDGAState();
    }
  }

  async saveState(state: DGAState): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('[DGA-STORE] Failed to save state to localStorage:', err);
    }
  }

  async resetState(): Promise<DGAState> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    const freshState = createDefaultDGAState();
    await this.saveState(freshState);
    return freshState;
  }
}

// Global store instance
const currentAdapter: DGAStorageAdapter = new LocalStorageDGAAdapter();
let cachedState: DGAState = createDefaultDGAState();
let isInitialized = false;

const stateListeners = new Set<(state: DGAState) => void>();

function notifyListeners() {
  // Mutations edit cachedState in place; hand out a fresh top-level object so React state setters re-render.
  const snapshot: DGAState = { ...cachedState };
  stateListeners.forEach((l) => {
    try {
      l(snapshot);
    } catch (err) {
      console.error('[DGA-STORE] Error in state listener:', err);
    }
  });
}

/**
 * Initialize Store
 */
export async function initDGAStore(): Promise<DGAState> {
  if (isInitialized && typeof window !== 'undefined') {
    return cachedState;
  }
  cachedState = await currentAdapter.loadState();

  // Process offline progression upon startup
  const { updatedState, events } = processOfflineProgression(cachedState);
  cachedState = updatedState;
  await currentAdapter.saveState(cachedState);

  isInitialized = true;
  notifyListeners();
  events.forEach((evt) => emitDgaEvent(evt));
  return cachedState;
}

export function getDGAState(): DGAState {
  return cachedState;
}

export function subscribeDGAState(listener: (state: DGAState) => void): () => void {
  stateListeners.add(listener);
  listener(cachedState);
  return () => {
    stateListeners.delete(listener);
  };
}

function mirrorActivityFeeds() {
  if (!cachedState) return;
  if (cachedState.agencyActivityFeed && !cachedState.activityFeed) {
    cachedState.activityFeed = cachedState.agencyActivityFeed;
  } else if (cachedState.activityFeed && !cachedState.agencyActivityFeed) {
    cachedState.agencyActivityFeed = cachedState.activityFeed;
  } else if (cachedState.agencyActivityFeed) {
    cachedState.activityFeed = cachedState.agencyActivityFeed;
  }
}

async function persistAndNotify() {
  mirrorActivityFeeds();
  await currentAdapter.saveState(cachedState);
  notifyListeners();
}

async function persistVerified(caseId: string) {
  mirrorActivityFeeds();
  if (typeof window === 'undefined') {
    notifyListeners();
    return;
  }
  const serialized = JSON.stringify(cachedState);
  localStorage.setItem(STORAGE_KEY, serialized);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    throw new Error('The case could not be written to workstation storage. Your narrative is still in the form.');
  }
  const parsed = JSON.parse(raw) as { cases?: Array<{ id: string }> };
  if (!parsed.cases?.some((item) => item.id === caseId)) {
    throw new Error('The case file was not found after saving. Your narrative is still in the form.');
  }
  notifyListeners();
}

/* =========================================================================
   PHASE 2: SIMULATION CONTROLS & TICK
   ========================================================================= */

/**
 * Runs a periodic simulation cycle (typically every 3-5 seconds)
 */
export async function runSimulationTick(): Promise<void> {
  const { updatedState, hasChanges, events } = processSimulationTick(cachedState);
  cachedState = updatedState;
  if (hasChanges) {
    await persistAndNotify();
  } else {
    notifyListeners();
  }
  events.forEach((evt) => emitDgaEvent(evt));
}

/* =========================================================================
   PHASE 3: INTER-SYSTEM EXCHANGE
   Generic mutations used by every DgaSystemAdapter. Systems never call each
   other; they write here and the resulting events fan out on the bus.
   ========================================================================= */

async function commitExchange<T>(outcome: ExchangeResult<T>): Promise<T> {
  if (outcome.events.length > 0) {
    cachedState.session.actionsTaken += 1;
    await persistAndNotify();
    outcome.events.forEach((evt: DGAEventInput<SystemBusPayload>) => emitDgaEvent(evt));
  }
  return outcome.result;
}

export async function linkDGACaseToSystem(input: LinkCaseInput): Promise<SystemCaseLink | null> {
  return commitExchange(linkCaseToSystem(cachedState, input));
}

export async function createDGASystemRequest(input: OpenRequestInput): Promise<SystemRequest | null> {
  return commitExchange(openSystemRequest(cachedState, input));
}

export async function updateDGASystemRequest(
  requestId: string,
  status: SystemRequestStatus,
  options: RequestStatusOptions
): Promise<SystemRequest | null> {
  return commitExchange(updateSystemRequestStatus(cachedState, requestId, status, options));
}

export async function acceptDGASystemRequest(
  requestId: string,
  system: DGASystem,
  processingSeconds: number
): Promise<SystemRequest | null> {
  return commitExchange(acceptSystemRequest(cachedState, requestId, system, processingSeconds));
}

export async function returnDGASystemFinding(input: ReturnFindingInput): Promise<SystemFinding | null> {
  return commitExchange(recordSystemFinding(cachedState, input));
}

export async function attachDGASystemDocument(input: AttachDocumentInput): Promise<DocumentReference | null> {
  return commitExchange(attachSystemDocument(cachedState, input));
}

export async function updateDGACaseFromSystem(
  system: SystemActor,
  caseId: string,
  patch: SharedCasePatch,
  reason?: string
): Promise<DGACase | null> {
  return commitExchange(applySharedCasePatch(cachedState, system, caseId, patch, reason));
}

export async function emitDGASystemSignal(input: SystemSignalInput): Promise<void> {
  await commitExchange(recordSystemSignal(cachedState, input));
}

export async function toggleSimulationPause(): Promise<boolean> {
  const newStatus = cachedState.simulation.status === 'live' ? 'paused' : 'live';
  cachedState.simulation.status = newStatus;

  emitDgaEvent({
    type: 'STATUS_CHANGED',
    actor: cachedState.profile.name,
    payload: { simulationStatus: newStatus }
  });

  await persistAndNotify();
  return newStatus === 'live';
}

export async function setSimulationActivityLevel(level: 'low' | 'normal' | 'high'): Promise<void> {
  cachedState.simulation.activityLevel = level;
  await persistAndNotify();
}

export async function toggleFocusMode(): Promise<boolean> {
  cachedState.simulation.focusMode = !cachedState.simulation.focusMode;
  await persistAndNotify();
  return cachedState.simulation.focusMode;
}

export async function clearOfflineSummary(): Promise<void> {
  cachedState.simulation.offlineEventsSummary = null;
  await persistAndNotify();
}

export async function endCurrentShift(notes?: string): Promise<DGAState['session']> {
  const completedSession = {
    ...cachedState.session,
    shiftNotes: notes,
    lastActiveTime: new Date().toISOString()
  };

  // Start fresh session
  cachedState.session = {
    sessionId: `SESS-${Date.now()}`,
    startTime: new Date().toISOString(),
    lastActiveTime: new Date().toISOString(),
    casesWorked: 0,
    actionsTaken: 0,
    evidenceSubmitted: 0,
    messagesSent: 0,
    decisionsMade: 0
  };

  await persistAndNotify();
  return completedSession;
}

/* =========================================================================
   CASE & TASK ACTIONS (WITH REACTION ENGINE INTEGRATION)
   ========================================================================= */

export async function toggleDGATask(caseId: string, taskId: string): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;

  const task = c.tasks.find((t) => t.id === taskId);
  if (!task) return false;

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : undefined;
  c.updatedAt = new Date().toISOString();
  cachedState.session.actionsTaken += 1;

  // Timeline
  c.timeline.unshift({
    id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'TASK_COMPLETED',
    actor: cachedState.profile.name,
    description: task.completed
      ? `Completed directive: "${task.title}"`
      : `Reopened directive: "${task.title}"`
  });

  // Check objective completion
  if (task.objectiveId) {
    const obj = c.objectives.find((o) => o.id === task.objectiveId);
    if (obj) {
      const objTasks = c.tasks.filter((t) => t.objectiveId === task.objectiveId);
      const allDone = objTasks.length > 0 && objTasks.every((t) => t.completed);
      if (allDone && !obj.completed) {
        obj.completed = true;
        emitDgaEvent({
          type: 'OBJECTIVE_COMPLETED',
          caseId: c.id,
          actor: cachedState.profile.name,
          payload: { objectiveId: obj.id, title: obj.title }
        });
      } else if (!allDone && obj.completed) {
        obj.completed = false;
      }
    }
  }

  // Trigger Reaction Engine if task completed
  if (task.completed) {
    const reactions = evaluateTaskCompletionReaction(c, task, cachedState.cases);
    if (reactions.newScheduledEvents.length > 0) {
      cachedState.scheduledEvents.push(...reactions.newScheduledEvents);
    }
    if (reactions.newAlerts.length > 0) {
      cachedState.alerts.unshift(...reactions.newAlerts);
    }
    if (reactions.newActivityItems.length > 0) {
      cachedState.agencyActivityFeed.unshift(...reactions.newActivityItems);
    }

    // Step 7: Complete task -> new report document created
    eventCommsEngine.handleTaskCompleted(cachedState, c.id, task.id);
  }

  emitDgaEvent({
    type: 'TASK_COMPLETED',
    caseId: c.id,
    actor: cachedState.profile.name,
    payload: { taskId: task.id, completed: task.completed, title: task.title }
  });

  await persistAndNotify();
  return true;
}

export async function createDGATask(
  caseId: string,
  taskInput: Omit<Task, 'id' | 'completed' | 'completedAt'>
): Promise<Task | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;

  const newTask: Task = {
    id: `TSK-${Date.now().toString().slice(-4)}`,
    completed: false,
    ...taskInput
  };

  c.tasks.push(newTask);
  c.updatedAt = new Date().toISOString();
  cachedState.session.actionsTaken += 1;

  c.timeline.unshift({
    id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'TASK_COMPLETED',
    actor: cachedState.profile.name,
    description: `Added directive: "${newTask.title}"`
  });

  emitDgaEvent({
    type: 'TASK_CREATED',
    caseId: c.id,
    actor: cachedState.profile.name,
    payload: newTask
  });

  await persistAndNotify();
  return newTask;
}

export async function updateDGATask(
  caseId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;

  const task = c.tasks.find((t) => t.id === taskId);
  if (!task) return false;

  const now = new Date().toISOString();
  const prevStatus = task.status;
  const prevCompleted = task.completed;

  Object.assign(task, updates);

  // Sync completed and status
  if (updates.status !== undefined) {
    task.completed = updates.status === 'completed';
    if (task.completed && !task.completedAt) {
      task.completedAt = now;
    } else if (!task.completed) {
      task.completedAt = undefined;
    }
  } else if (updates.completed !== undefined) {
    task.status = updates.completed ? 'completed' : 'in_progress';
    task.completedAt = updates.completed ? now : undefined;
  }

  // Audit history
  task.activityHistory = task.activityHistory || [];
  task.activityHistory.unshift({
    id: `ACT-${Date.now()}`,
    timestamp: now,
    actor: cachedState.profile.name,
    action: 'TASK_UPDATED',
    detail: `Updated directive parameters: ${Object.keys(updates).join(', ')}`
  });

  c.updatedAt = now;

  // If transitioned to blocked
  if (task.status === 'blocked' && prevStatus !== 'blocked') {
    const autoRes = processAutomations(cachedState, 'ON_TASK_BLOCKED', {
      caseId: c.id,
      taskId: task.id,
      task
    });
    cachedState = autoRes.mutatedState;
  }

  // If transitioned to completed
  if (task.completed && !prevCompleted) {
    const reactions = evaluateTaskCompletionReaction(c, task, cachedState.cases);
    if (reactions.newScheduledEvents.length > 0) {
      cachedState.scheduledEvents.push(...reactions.newScheduledEvents);
    }
    if (reactions.newAlerts.length > 0) {
      cachedState.alerts.unshift(...reactions.newAlerts);
    }
    if (reactions.newActivityItems.length > 0) {
      cachedState.agencyActivityFeed.unshift(...reactions.newActivityItems);
    }

    const autoRes = processAutomations(cachedState, 'ON_TASK_COMPLETED', {
      caseId: c.id,
      taskId: task.id,
      task
    });
    cachedState = autoRes.mutatedState;

    // Step 7: Complete task -> new report document created
    eventCommsEngine.handleTaskCompleted(cachedState, c.id, task.id);
  }

  await persistAndNotify();
  return true;
}

export async function createDGASubtask(
  caseId: string,
  parentTaskId: string,
  subtaskInput: Partial<Task>
): Promise<Task | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;

  const parent = c.tasks.find((t) => t.id === parentTaskId);
  if (!parent) return null;

  const newSubtask: Task = {
    id: `SUB-${Date.now().toString().slice(-4)}`,
    caseId,
    parentTaskId,
    title: subtaskInput.title || 'Operational Sub-Objective',
    description: subtaskInput.description || '',
    phase: parent.phase,
    assignedTo: subtaskInput.assignedTo || parent.assignedTo,
    completed: false,
    status: 'pending',
    priority: subtaskInput.priority || parent.priority || 'Routine'
  };

  parent.subtasks = parent.subtasks || [];
  parent.subtasks.push(newSubtask);

  parent.activityHistory = parent.activityHistory || [];
  parent.activityHistory.unshift({
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: cachedState.profile.name,
    action: 'SUBTASK_CREATED',
    detail: `Added subtask: "${newSubtask.title}"`
  });

  c.updatedAt = new Date().toISOString();
  await persistAndNotify();
  return newSubtask;
}

export async function addTaskComment(
  caseId: string,
  taskId: string,
  content: string
): Promise<TaskComment | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;

  const task = c.tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const newComment: TaskComment = {
    id: `CMT-${Date.now()}`,
    author: cachedState.profile.name,
    authorRole: cachedState.profile.title,
    timestamp: new Date().toISOString(),
    content: content.trim()
  };

  task.comments = task.comments || [];
  task.comments.push(newComment);

  task.activityHistory = task.activityHistory || [];
  task.activityHistory.unshift({
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: cachedState.profile.name,
    action: 'COMMENT_ADDED',
    detail: `Committed operative observation on directive.`
  });

  await persistAndNotify();
  return newComment;
}

export async function toggleTaskFavorite(taskId: string): Promise<boolean> {
  const idx = cachedState.favoriteTaskIds.indexOf(taskId);
  let isFav = false;
  if (idx >= 0) {
    cachedState.favoriteTaskIds.splice(idx, 1);
  } else {
    cachedState.favoriteTaskIds.push(taskId);
    isFav = true;
  }
  await persistAndNotify();
  return isFav;
}

export async function toggleCaseFavorite(caseId: string): Promise<boolean> {
  const idx = cachedState.favoriteCaseIds.indexOf(caseId);
  let isFav = false;
  if (idx >= 0) {
    cachedState.favoriteCaseIds.splice(idx, 1);
  } else {
    cachedState.favoriteCaseIds.push(caseId);
    isFav = true;
  }
  await persistAndNotify();
  return isFav;
}

export async function saveCustomFilter(filter: SavedFilter): Promise<void> {
  const existingIdx = cachedState.savedFilters.findIndex((f) => f.id === filter.id);
  if (existingIdx >= 0) {
    cachedState.savedFilters[existingIdx] = filter;
  } else {
    cachedState.savedFilters.push(filter);
  }
  await persistAndNotify();
}

export async function deleteCustomFilter(filterId: string): Promise<void> {
  cachedState.savedFilters = cachedState.savedFilters.filter((f) => f.id !== filterId);
  await persistAndNotify();
}

export async function addCustomFieldDefinition(def: CustomFieldDefinition): Promise<void> {
  cachedState.customFieldDefinitions.push(def);
  await persistAndNotify();
}

export async function toggleAutomationRule(ruleId: string, enabled?: boolean): Promise<void> {
  const rule = cachedState.automationRules.find((r) => r.id === ruleId);
  if (rule) {
    rule.enabled = enabled !== undefined ? enabled : !rule.enabled;
    await persistAndNotify();
  }
}

export async function updateDashboardWidgets(widgets: DashboardWidgetConfig[]): Promise<void> {
  cachedState.dashboardWidgets = widgets;
  await persistAndNotify();
}

export async function snoozeAlert(alertId: string, minutes: number): Promise<void> {
  const alert = cachedState.alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await persistAndNotify();
  }
}

export async function convertCommunicationToTask(
  commId: string,
  caseId: string,
  taskTitle?: string
): Promise<Task | null> {
  const comm = cachedState.communications.find((m) => m.id === commId);
  const targetCase = cachedState.cases.find((c) => c.id === caseId);
  if (!comm || !targetCase) return null;

  const title = taskTitle || `Investigate Cable ${comm.id}: ${comm.subject}`;
  const newTask: Task = {
    id: `TSK-${Date.now().toString().slice(-4)}`,
    caseId,
    title,
    description: `Originated from intelligence cable by ${comm.sender} at ${comm.timestamp}.\n\nContent:\n${comm.body}`,
    phase: 'Active Investigation',
    priority: comm.priority === 'Flash / Immediate' ? 'Critical' : 'Routine',
    completed: false,
    status: 'pending',
    assignedTo: targetCase.assignedAgents[0] || cachedState.profile.name,
    tags: ['#CABLE_CONVERTED', `#${comm.id}`]
  };

  targetCase.tasks.unshift(newTask);
  comm.caseId = caseId;

  await persistAndNotify();
  return newTask;
}

export async function convertCommunicationToCase(
  commId: string,
  templateId?: string
): Promise<DGACase | null> {
  const comm = cachedState.communications.find((m) => m.id === commId);
  if (!comm) return null;

  const now = new Date().toISOString();
  const caseId = `DGA-26-${Math.floor(100 + Math.random() * 900)}`;

  let template: CaseTemplate | undefined;
  if (templateId) {
    template = cachedState.caseTemplates.find((t) => t.id === templateId);
  }

  const newCase: DGACase = {
    id: caseId,
    title: comm.subject.toUpperCase().replace('RE: ', ''),
    classification: template?.classification || 'SECRET // NOFORN',
    status: 'Awaiting Acceptance',
    priority: comm.priority === 'Flash / Immediate' ? 'Critical' : 'High',
    leadSystem: template?.leadSystem || 'CIVITAS',
    supportingSystems: ['COMMS', 'ARCHIVE'],
    assignedAgents: [cachedState.profile.name],
    summary: `Case initiated from incoming signal dispatch ${comm.id}.\n\nDispatcher: ${comm.sender}\nSummary: ${comm.body.slice(0, 300)}...`,
    objectives: template?.defaultObjectives.map((o, i) => ({
      id: `OBJ-${caseId}-${i + 1}`,
      title: o.title,
      description: o.description,
      completed: false
    })) || [
      {
        id: `OBJ-${caseId}-1`,
        title: 'Corroborate incoming cable intelligence',
        description: 'Verify veracity with external listening posts.',
        completed: false
      }
    ],
    tasks: template?.defaultTasks.map((t, i) => ({
      id: `TSK-${caseId}-${i + 1}`,
      caseId,
      title: t.title,
      description: t.description,
      phase: t.phase,
      priority: t.priority || 'Routine',
      assignedTo: t.assignedTo || cachedState.profile.name,
      completed: false,
      status: 'pending',
      tags: t.tags || ['#INITIATED_FROM_CABLE']
    })) || [
      {
        id: `TSK-${caseId}-1`,
        caseId,
        title: `Validate intelligence leads from ${comm.sender}`,
        description: comm.body,
        phase: 'Preliminary',
        priority: 'High',
        assignedTo: cachedState.profile.name,
        completed: false,
        status: 'pending',
        tags: ['#CABLE_CONVERTED']
      }
    ],
    evidence: [],
    people: [],
    organizations: [],
    locations: [],
    communications: [
      {
        communicationId: comm.id,
        subject: comm.subject,
        sender: comm.sender,
        timestamp: comm.timestamp
      }
    ],
    documents: [],
    forensicRequests: [],
    timeline: [
      {
        id: `TL-${Date.now()}`,
        timestamp: now,
        type: 'CASE_OPENED',
        actor: cachedState.profile.name,
        description: `Case established from intelligence cable ${comm.id}.`
      }
    ],
    notes: [],
    createdAt: now,
    updatedAt: now
  };

  cachedState.cases.unshift(newCase);
  comm.caseId = caseId;
  cachedState.session.casesWorked += 1;

  await persistAndNotify();
  return newCase;
}

export async function applyCaseTemplate(templateId: string, customTitle?: string): Promise<DGACase> {
  const template = cachedState.caseTemplates.find((t) => t.id === templateId) || cachedState.caseTemplates[0];
  const now = new Date().toISOString();
  const caseId = `DGA-26-${Math.floor(100 + Math.random() * 900)}`;

  const createdTasks: Task[] = template.defaultTasks.map((t, idx) => ({
    id: `TSK-${caseId}-${idx + 1}`,
    caseId,
    title: t.title,
    description: t.description,
    phase: t.phase,
    priority: t.priority || template.priority,
    assignedTo: t.assignedTo || cachedState.profile.name,
    completed: false,
    status: 'pending',
    tags: t.tags || [],
    subtasks: t.subtasks?.map((st, sidx) => ({
      id: `SUB-${caseId}-${idx + 1}-${sidx + 1}`,
      caseId,
      parentTaskId: `TSK-${caseId}-${idx + 1}`,
      title: st.title,
      description: st.description || '',
      phase: t.phase,
      assignedTo: t.assignedTo || cachedState.profile.name,
      completed: false,
      status: 'pending'
    }))
  }));

  // Resolve dependsOn based on dependsOnOffset
  template.defaultTasks.forEach((t, idx) => {
    if (t.dependsOnOffset && t.dependsOnOffset.length > 0) {
      createdTasks[idx].dependsOn = t.dependsOnOffset
        .filter((offset) => offset < createdTasks.length)
        .map((offset) => createdTasks[offset].id);
    }
  });

  const newCase: DGACase = {
    id: caseId,
    title: customTitle || template.title,
    classification: template.classification,
    status: 'Active',
    priority: template.priority,
    leadSystem: template.leadSystem,
    supportingSystems: ['TRACE', 'COMMS', 'ARCHIVE'],
    assignedAgents: [cachedState.profile.name],
    summary: template.description,
    objectives: template.defaultObjectives.map((o, idx) => ({
      id: `OBJ-${caseId}-${idx + 1}`,
      title: o.title,
      description: o.description,
      completed: false
    })),
    tasks: createdTasks,
    evidence: [],
    people: [],
    organizations: [],
    locations: [],
    communications: [],
    documents: [],
    forensicRequests: [],
    timeline: [
      {
        id: `TL-${Date.now()}`,
        timestamp: now,
        type: 'CASE_OPENED',
        actor: cachedState.profile.name,
        description: `Operational case initiated from template: ${template.title}`
      }
    ],
    notes: [],
    tags: [`#${template.category.replace(/\s+/g, '_')}`],
    createdAt: now,
    updatedAt: now
  };

  cachedState.cases.unshift(newCase);
  cachedState.session.casesWorked += 1;
  await persistAndNotify();
  return newCase;
}

export async function executeCaseDecision(
  decisionId: string,
  chosenOptionId: string
): Promise<boolean> {
  const decision = cachedState.decisions.find((d) => d.id === decisionId);
  if (!decision || decision.status === 'resolved') return false;

  const c = cachedState.cases.find((item) => item.id === decision.caseId);
  const consequence = evaluateDecisionConsequences(decision, chosenOptionId, cachedState.profile.name);

  decision.status = 'resolved';
  decision.choice = chosenOptionId;
  cachedState.session.decisionsMade += 1;

  if (c) {
    c.timeline.unshift(...consequence.timelineEvents);
    c.updatedAt = new Date().toISOString();
  }

  if (consequence.alerts.length > 0) {
    cachedState.alerts.unshift(...consequence.alerts);
  }

  if (consequence.scheduledEvents.length > 0) {
    cachedState.scheduledEvents.push(...consequence.scheduledEvents);
  }

  await persistAndNotify();
  return true;
}

export async function addDGACaseNote(caseId: string, content: string): Promise<AgentNote | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c || !content.trim()) return null;

  const newNote: AgentNote = {
    id: `NOTE-${Date.now()}`,
    agentId: cachedState.profile.id,
    agentName: cachedState.profile.name,
    timestamp: new Date().toISOString(),
    content: content.trim()
  };

  c.notes.unshift(newNote);
  c.updatedAt = new Date().toISOString();
  cachedState.session.actionsTaken += 1;

  c.timeline.unshift({
    id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'NOTE_ADDED',
    actor: cachedState.profile.name,
    description: `Recorded agent field note (${newNote.content.slice(0, 45)}...)`
  });

  emitDgaEvent({
    type: 'NOTE_ADDED',
    caseId: c.id,
    actor: cachedState.profile.name,
    payload: newNote
  });

  await persistAndNotify();
  return newNote;
}

export async function updateDGACaseStatus(
  caseId: string,
  status: DGACase['status']
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;

  const prevStatus = c.status;
  c.status = status;
  c.updatedAt = new Date().toISOString();

  c.timeline.unshift({
    id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'STATUS_CHANGED',
    actor: cachedState.profile.name,
    description: `Case status changed from ${prevStatus} to ${status}`
  });

  emitDgaEvent({
    type: 'CASE_STATUS_CHANGED',
    caseId: c.id,
    actor: cachedState.profile.name,
    payload: { previous: prevStatus, current: status }
  });

  await persistAndNotify();
  return true;
}

export async function acceptAndSignDGACase(
  caseId: string,
  investigatorName: string,
  signature: string
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;

  const now = new Date().toISOString();
  const prevStatus = c.status;
  c.status = 'ACTIVE';
  c.primaryInvestigator = investigatorName;
  c.investigatorSignature = signature;
  c.signedAt = now;
  c.acceptedAt = now;
  c.updatedAt = now;
  cachedState.activeCaseId = c.id;

  if (!c.assignedAgents.includes(investigatorName)) {
    c.assignedAgents.unshift(investigatorName);
  }

  // Unlock initial exhibits, documents, directives, and entities upon formal acceptance
  if (caseId === 'DGA-26-194' && c.evidence.length === 0) {
    c.objectives = JSON.parse(JSON.stringify(DGA_26_194_STARTING_PAYLOAD.objectives));
    c.tasks = JSON.parse(JSON.stringify(DGA_26_194_STARTING_PAYLOAD.tasks));
    c.evidence = JSON.parse(JSON.stringify(DGA_26_194_STARTING_PAYLOAD.evidence));
    c.documents = JSON.parse(JSON.stringify(DGA_26_194_STARTING_PAYLOAD.documents));
    c.people = JSON.parse(JSON.stringify(DGA_26_194_STARTING_PAYLOAD.people));
    c.organizations = JSON.parse(JSON.stringify(DGA_26_194_STARTING_PAYLOAD.organizations));
    c.locations = JSON.parse(JSON.stringify(DGA_26_194_STARTING_PAYLOAD.locations));
    c.forensicRequests = [
      {
        id: 'REQ-194-01',
        caseId: 'DGA-26-194',
        dateRequested: now,
        requestedBy: investigatorName,
        status: 'QUEUED',
        targetModules: ['TRACE Spectrometry', 'High-Res Mass Spec'],
        evidenceIds: ['EV-194-A'],
        notes: 'Urgent whole blood tox screening for foreign cholinesterase inhibitor.'
      }
    ];

    // Deliver introductory clinical cable from Dr. Thorne
    if (!cachedState.communications.some((m) => m.id === DGA_26_194_INTRO_CABLE.id)) {
      cachedState.communications.unshift(JSON.parse(JSON.stringify(DGA_26_194_INTRO_CABLE)));
    }

    // High-priority case alert
    cachedState.alerts.unshift({
      id: `ALT-DISPATCH-${Date.now()}`,
      level: 'CRITICAL',
      title: 'DISPATCH: Biological Specimens Awaiting Forensic Intake',
      message: 'Dr. Gregory Thorne at St. Jude Metro transmitted Ambassador Vance toxicology panel. Requisition LC-MS in TRACE.',
      source: 'ST. JUDE METRO ICU',
      timestamp: now,
      actionRequired: true,
      caseId: c.id
    });
  }

  // Unlock initial exhibits, documents, directives, and entities for Motorcycle Fatal Crash (INV-26-402)
  if (caseId === 'INV-26-402' && c.evidence.length === 0) {
    c.objectives = JSON.parse(JSON.stringify(INV_26_402_STARTING_PAYLOAD.objectives));
    c.tasks = JSON.parse(JSON.stringify(INV_26_402_STARTING_PAYLOAD.tasks));
    c.evidence = JSON.parse(JSON.stringify(INV_26_402_STARTING_PAYLOAD.evidence));
    c.documents = JSON.parse(JSON.stringify(INV_26_402_STARTING_PAYLOAD.documents));
    c.people = JSON.parse(JSON.stringify(INV_26_402_STARTING_PAYLOAD.people));
    c.organizations = JSON.parse(JSON.stringify(INV_26_402_STARTING_PAYLOAD.organizations));
    c.locations = JSON.parse(JSON.stringify(INV_26_402_STARTING_PAYLOAD.locations));
    c.forensicRequests = [
      {
        id: 'REQ-402-01',
        caseId: 'INV-26-402',
        dateRequested: now,
        requestedBy: investigatorName,
        status: 'QUEUED',
        targetModules: ['TRACE Metallurgical Shear Analysis', 'ECU CAN-Bus Diagnostic Extraction'],
        evidenceIds: ['EV-402-A', 'EV-402-B'],
        notes: 'Priority metallurgical inspection on severed brake hose ferrule and digital CAN-bus telemetry dump.'
      }
    ];

    cachedState.alerts.unshift({
      id: `ALT-CRASH-${Date.now()}`,
      level: 'CRITICAL',
      title: 'DISPATCH: Motorcycle Fatal Crash Telemetry & Debris Impounded',
      message: 'State Highway Patrol impounded Vortex R-1000 motorcycle ECU, severed brake lines, and roadway chemical slick swabs for Docket INV-26-402.',
      source: 'STATE HIGHWAY PATROL // TROOP B',
      timestamp: now,
      actionRequired: true,
      caseId: c.id
    });
  }

  // Initial timeline entry
  c.timeline.unshift({
    id: `TL-SIGN-${Date.now()}`,
    timestamp: now,
    type: 'CASE_OPENED',
    actor: investigatorName,
    description: `Case officially accepted and activated by Primary Investigator: ${investigatorName} (Signature: ${signature})`
  });

  // Initial case activity entry
  const acceptActivity: AgencyActivityItem = {
    id: `ACT-ACCEPT-${Date.now()}`,
    timestamp: now,
    system: c.leadSystem,
    headline: `Jurisdiction Accepted: ${c.id}`,
    details: `${c.title} activated by Primary Investigator ${investigatorName}`,
    caseId: c.id,
    priority: c.priority
  };
  cachedState.agencyActivityFeed.unshift(acceptActivity);
  cachedState.activityFeed.unshift(acceptActivity);

  cachedState.session.casesWorked += 1;
  cachedState.session.actionsTaken += 1;

  // Step 1: Accept case -> introductory email / cable dispatched
  eventCommsEngine.handleCaseAccepted(cachedState, c.id, investigatorName);

  emitDgaEvent({
    type: 'CASE_STATUS_CHANGED',
    caseId: c.id,
    actor: investigatorName,
    payload: { previous: prevStatus, current: 'ACTIVE', investigator: investigatorName, signature }
  });

  await persistAndNotify();
  return true;
}

export async function acknowledgeSimulationEvents(): Promise<void> {
  cachedState.unacknowledgedSimulationEventCount = 0;
  await persistAndNotify();
}

export async function createDGACase(newCase: DGACase, blueprint?: CaseBlueprint): Promise<DGACase> {
  if (!newCase?.id) {
    throw new Error('A case identifier is required.');
  }
  if (cachedState.cases.some((item) => item.id === newCase.id)) {
    throw new Error(`Case number ${newCase.id} already exists. The report was not saved.`);
  }

  const caseToSave: DGACase = {
    ...newCase,
    status: newCase.status || 'Awaiting Acceptance',
    creationSource: blueprint ? newCase.creationSource || 'simulation' : newCase.creationSource
  };

  const previousActive = cachedState.activeCaseId;
  const activityId = `ACT-NEW-${caseToSave.id}-${Date.now()}`;
  cachedState.cases.unshift(caseToSave);
  cachedState.activeCaseId = caseToSave.id;
  cachedState.session.casesWorked += 1;

  if (blueprint) {
    cachedState.caseBlueprints[caseToSave.id] = blueprint;
  }

  cachedState.agencyActivityFeed.unshift({
    id: activityId,
    timestamp: new Date().toISOString(),
    system: caseToSave.leadSystem,
    headline: `New Investigation Opened: ${caseToSave.id} [${caseToSave.status}]`,
    details: caseToSave.title,
    caseId: caseToSave.id,
    priority: caseToSave.priority
  });

  try {
    await persistVerified(caseToSave.id);
  } catch (err) {
    cachedState.cases = cachedState.cases.filter((item) => item.id !== caseToSave.id);
    cachedState.activeCaseId = previousActive;
    cachedState.session.casesWorked = Math.max(0, cachedState.session.casesWorked - 1);
    cachedState.agencyActivityFeed = cachedState.agencyActivityFeed.filter((item) => item.id !== activityId);
    if (blueprint) delete cachedState.caseBlueprints[caseToSave.id];
    notifyListeners();
    throw err instanceof Error ? err : new Error('The case could not be saved.');
  }

  emitDgaEvent({
    type: 'CASE_CREATED',
    caseId: caseToSave.id,
    actor: cachedState.profile.name,
    payload: caseToSave
  });

  return caseToSave;
}

export async function createManualIncidentCase(input: ManualIncidentInput): Promise<DGACase> {
  const narrative = input.narrative?.trim() || '';
  if (!narrative) {
    throw new Error('Describe what happened before creating a case.');
  }
  const investigator = cachedState.profile?.name || 'Unassigned investigator';
  const caseId = allocateIncidentCaseId(cachedState.cases.map((item) => item.id));
  const built = buildManualIncidentCase({ ...input, narrative }, caseId, investigator);
  return createDGACase(built);
}

export async function addEvidenceFromAttachment(
  caseId: string,
  attachment: MailAttachment
): Promise<EvidenceItem | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;

  const attObj: RichMailAttachment = typeof attachment === 'string' ? { name: attachment } : attachment;
  const evidenceId = `EV-${caseId.replace(/[^a-zA-Z0-9]/g, '').slice(-3)}-ATT-${Date.now().toString().slice(-4)}`;
  const category = attObj.type === 'lab_result'
    ? 'Toxicological Specimen'
    : attObj.type === 'telemetry'
    ? 'Digital Media'
    : 'Document';

  const newEvidence: EvidenceItem = {
    id: evidenceId,
    title: `Extracted Dispatch Item: ${attObj.name}`,
    category,
    description: attObj.content?.slice(0, 300) || `Transferred communication attachment: ${attObj.name}`,
    locationFound: 'Encrypted Diplomatic Cable Attachment',
    dateRecovered: new Date().toISOString(),
    custodyStatus: 'In DGA Custody',
    secureHash: `SHA256-${Date.now().toString(16)}`
  };

  c.evidence.unshift(newEvidence);
  c.updatedAt = new Date().toISOString();
  c.timeline.unshift({
    id: `TL-EV-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'EVIDENCE_LOGGED',
    actor: cachedState.profile.name,
    description: `Logged evidence item ${newEvidence.id} (${attObj.name}) extracted from communications dispatch`
  });

  emitDgaEvent({
    type: 'EVIDENCE_LOGGED',
    caseId: c.id,
    actor: cachedState.profile.name,
    payload: newEvidence
  });

  await persistAndNotify();
  return newEvidence;
}

export async function createForensicRequestFromAttachment(
  caseId: string,
  attachment: MailAttachment,
  targetModule: string = 'toxicology'
): Promise<ForensicRequest | null> {
  const ev = await addEvidenceFromAttachment(caseId, attachment);
  if (!ev) return null;

  const attObj = typeof attachment === 'string' ? { name: attachment } : attachment;
  return createDGAForensicRequest(caseId, {
    caseId,
    requestedBy: cachedState.profile.name,
    targetModules: [targetModule],
    evidenceIds: [ev.id],
    notes: `Automated laboratory requisition filed directly from dispatch attachment: ${attObj.name}. Rapid chemical screening and spectrometry requested.`
  });
}

export async function createDGAForensicRequest(
  caseId: string,
  request: Omit<ForensicRequest, 'id' | 'dateRequested' | 'status'>
): Promise<ForensicRequest | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;

  const freq: ForensicRequest = {
    id: `FREQ-${Date.now().toString().slice(-4)}`,
    dateRequested: new Date().toISOString(),
    status: 'Pending',
    ...request
  };

  c.forensicRequests.unshift(freq);
  c.updatedAt = new Date().toISOString();
  cachedState.session.evidenceSubmitted += request.evidenceIds.length;

  // Step 3: Submit request -> pending / queued status
  eventCommsEngine.handleRequestSubmitted(cachedState, c.id, freq.id);

  c.timeline.unshift({
    id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'FORENSIC_REQUESTED',
    actor: cachedState.profile.name,
    description: `Submitted Forensic Request ${freq.id} to TRACE (${freq.targetModules.join(', ')})`
  });

  emitDgaEvent({
    type: 'FORENSIC_REQUEST_CREATED',
    caseId: c.id,
    actor: cachedState.profile.name,
    payload: freq
  });

  await persistAndNotify();
  return freq;
}

export async function attachTraceResultToDgaCase(
  caseId: string,
  forensicRequestId: string,
  resultSummary: string,
  traceCaseId: string
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;

  c.linkedTraceCaseId = traceCaseId;
  const freq = c.forensicRequests.find((r) => r.id === forensicRequestId);
  if (freq && freq.status === 'Completed' && freq.resultSummary === resultSummary && freq.linkedTraceCaseId === traceCaseId) {
    return true;
  }
  if (freq) {
    freq.status = 'Completed';
    freq.resultSummary = resultSummary;
    freq.completedAt = new Date().toISOString();
    freq.linkedTraceCaseId = traceCaseId;
  }

  c.evidence.forEach((ev) => {
    if (freq?.evidenceIds.includes(ev.id)) {
      ev.custodyStatus = 'Transferred to TRACE';
      ev.linkedTraceEvidenceId = `${traceCaseId}-EV`;
    }
  });

  const linked = linkCaseToSystem(cachedState, { caseId, system: 'TRACE', from: 'DGA_CORE', externalRef: traceCaseId });
  const mirror = findSystemRequestByLegacyId(cachedState, forensicRequestId);
  const finding = recordSystemFinding(cachedState, {
    system: 'TRACE',
    requestId: mirror && !isTerminalRequestStatus(mirror.status) ? mirror.id : undefined,
    caseId,
    summary: resultSummary,
    confidence: 'CONFIRMED',
    priority: 'Critical',
    documents: [
      {
        title: `TRACE Laboratory Report ${traceCaseId} (${forensicRequestId})`,
        content: `TRACE CASE: ${traceCaseId}\nFORENSIC REQUEST: ${forensicRequestId}\n\nRESULT: ${resultSummary}`
      }
    ]
  });

  await persistAndNotify();

  emitDgaEvent({
    type: 'TRACE_EXAM_COMPLETE',
    caseId: c.id,
    actor: 'TRACE Central Forensic Facility',
    payload: { forensicRequestId, resultSummary, traceCaseId }
  });
  [...linked.events, ...finding.events].forEach((evt) => emitDgaEvent(evt));
  return true;
}

export async function sendDGACommunication(
  commInput: Omit<typeof seedCommunications[0], 'id' | 'timestamp' | 'read' | 'threadId'>
): Promise<typeof seedCommunications[0]> {
  const newComm = {
    id: `CABLE-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    read: true,
    threadId: `TH-${Date.now().toString().slice(-4)}`,
    ...commInput
  };

  cachedState.communications.unshift(newComm);
  cachedState.session.messagesSent += 1;

  emitDgaEvent({
    type: 'COMMUNICATION_RECEIVED',
    actor: cachedState.profile.name,
    payload: newComm
  });

  await persistAndNotify();
  return newComm;
}

export async function markCommunicationRead(id: string): Promise<void> {
  const comm = cachedState.communications.find((m) => m.id === id);
  if (comm && !comm.read) {
    comm.read = true;
    await persistAndNotify();
  }
}

export async function attachCommunicationToCase(messageId: string, caseId: string): Promise<void> {
  const targetCase = cachedState.cases.find((c) => c.id === caseId);
  const msg = cachedState.communications.find((m) => m.id === messageId);
  if (!targetCase || !msg) return;

  msg.caseId = caseId;
  const exists = targetCase.communications.some((c) => c.communicationId === messageId);
  if (!exists) {
    targetCase.communications.push({
      communicationId: msg.id,
      subject: msg.subject,
      sender: msg.sender,
      timestamp: msg.timestamp
    });
  }

  emitDgaEvent({
    type: 'COMMUNICATION_ATTACHED_TO_CASE',
    actor: cachedState.profile.name,
    payload: { messageId, caseId }
  });

  await persistAndNotify();
}

export async function dismissDGAAlert(id: string): Promise<void> {
  cachedState.alerts = cachedState.alerts.filter((a) => a.id !== id);
  emitDgaEvent({
    type: 'ALERT_DISMISSED',
    actor: cachedState.profile.name,
    payload: { alertId: id }
  });
  await persistAndNotify();
}

export async function setWorkstationLocked(isLocked: boolean): Promise<void> {
  cachedState.isLocked = isLocked;
  emitDgaEvent({
    type: 'WORKSTATION_LOCK_TOGGLED',
    actor: cachedState.profile.name,
    payload: { isLocked }
  });
  await persistAndNotify();
}

export async function setActiveDGACase(caseId: string | null): Promise<void> {
  cachedState.activeCaseId = caseId;
  if (caseId) cachedState.session.casesWorked += 1;
  await persistAndNotify();
}

export async function resetDGAWorld(): Promise<DGAState> {
  cachedState = await currentAdapter.resetState();
  emitDgaEvent({
    type: 'WORLD_RESET',
    actor: cachedState.profile.name,
    payload: {}
  });
  notifyListeners();
  return cachedState;
}

export async function inspectEvidence(caseId: string, evidenceId: string): Promise<boolean> {
  const result = eventCommsEngine.handleEvidenceOpened(cachedState, caseId, evidenceId);
  if (result) {
    await persistAndNotify();
  }
  return result;
}

export async function analyzeDocument(caseId: string, docId: string): Promise<EvidenceItem | null> {
  const result = eventCommsEngine.handleDocumentAnalyzed(cachedState, caseId, docId);
  if (result) {
    await persistAndNotify();
  }
  return result;
}

export async function submitCaseFinalReport(
  caseId: string,
  summary: string,
  determination: 'REFERRED' | 'CLOSED' = 'CLOSED'
): Promise<boolean> {
  const result = eventCommsEngine.handleFinalReportSubmitted(cachedState, caseId, summary, determination);
  if (result) {
    await persistAndNotify();
  }
  return result;
}

export async function recordMissedCall(call: Parameters<typeof eventCommsEngine.handleCallMissed>[1]): Promise<VoicemailRecord> {
  const vm = eventCommsEngine.handleCallMissed(cachedState, call);
  await persistAndNotify();
  return vm;
}

export async function recordVoicemailListened(vm: VoicemailRecord): Promise<Task | null> {
  const task = eventCommsEngine.handleVoicemailListened(cachedState, vm);
  if (task) {
    await persistAndNotify();
  }
  return task;
}

/* =========================================================================
   HUNT A KILLER STYLE CASE BUILDER & EVIDENCE BOARD LOGGING FUNCTIONS
   ========================================================================= */

export async function updateDGACaseCauseHypothesis(
  caseId: string,
  hypothesis: Partial<CaseCauseHypothesis>
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;

  c.causeHypothesis = {
    ...(c.causeHypothesis || {}),
    ...hypothesis
  };
  c.updatedAt = new Date().toISOString();
  cachedState.session.actionsTaken += 1;

  await persistAndNotify();
  return true;
}

export async function addOrUpdateDGASuspectProfile(
  caseId: string,
  profile: SuspectInvestigationProfile
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;

  if (!c.suspectProfiles) c.suspectProfiles = [];
  const idx = c.suspectProfiles.findIndex((s) => s.id === profile.id);
  if (idx >= 0) {
    c.suspectProfiles[idx] = { ...c.suspectProfiles[idx], ...profile };
  } else {
    c.suspectProfiles.push(profile);
  }

  // Also ensure person reference exists in c.people
  const existingPerson = c.people.find((p) => p.personId === profile.id || p.name.toLowerCase() === profile.name.toLowerCase());
  if (!existingPerson) {
    c.people.push({
      personId: profile.id,
      name: profile.name,
      role: profile.role || 'Person of Interest',
      affiliation: profile.affiliation || 'Unknown',
      threatLevel: profile.verdict === 'Prime Suspect' ? 'High' : 'Moderate',
      status: profile.verdict || 'Person of Interest',
      notes: profile.redFlags || profile.motiveNotes
    });
  }

  c.updatedAt = new Date().toISOString();
  cachedState.session.actionsTaken += 1;

  c.timeline.unshift({
    id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'NOTE_ADDED',
    actor: cachedState.profile.name,
    description: `Updated investigative suspect dossier: ${profile.name} [Verdict: ${profile.verdict || 'Person of Interest'}]`
  });

  await persistAndNotify();
  return true;
}

export async function addDGACaseEvidence(
  caseId: string,
  item: Omit<EvidenceItem, 'id'> & { id?: string }
): Promise<EvidenceItem | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;

  let evidenceId = item.id || `EV-${c.id}-${Date.now().toString().slice(-4)}`;
  while (c.evidence.some((existing) => existing.id === evidenceId)) {
    evidenceId = `EV-${c.id}-${Date.now().toString().slice(-4)}-${c.evidence.length + 1}`;
  }
  const collectedAt = item.dateRecovered?.trim() || 'Unknown';
  const now = new Date().toISOString();
  const newEvidence: EvidenceItem = {
    id: evidenceId,
    title: item.title.trim(),
    category: item.category,
    description: item.description?.trim() || 'Unknown',
    locationFound: item.locationFound?.trim() || 'Unknown',
    dateRecovered: collectedAt,
    custodyStatus: item.custodyStatus || 'In DGA Custody',
    secureHash: item.secureHash,
    collector: item.collector?.trim() || undefined,
    custodian: item.custodian?.trim() || cachedState.profile.name,
    storageLocation: item.storageLocation?.trim() || undefined,
    seal: item.seal?.trim() || undefined,
    investigatorNotes: item.investigatorNotes,
    custodyLog: [
      {
        id: `COC-${evidenceId}`,
        timestamp: now,
        releasingCustodian: 'Not recorded',
        receivingCustodian: item.custodian?.trim() || cachedState.profile.name,
        reason: 'Initial evidence registration',
        location: item.locationFound?.trim() || 'Unknown',
        sealStatus: item.seal?.trim() || 'Not recorded'
      }
    ]
  };

  c.evidence.unshift(newEvidence);
  c.updatedAt = new Date().toISOString();
  cachedState.session.evidenceSubmitted += 1;
  cachedState.session.actionsTaken += 1;

  c.timeline.unshift({
    id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'EVIDENCE_LOGGED',
    actor: cachedState.profile.name,
    description: `Logged physical/digital exhibit: ${newEvidence.title} (${newEvidence.category})`
  });

  await persistAndNotify();
  return newEvidence;
}

export async function addDGACasePerson(
  caseId: string,
  person: Omit<PersonReference, 'personId'> & { personId?: string },
  options?: { allowDuplicateName?: boolean }
): Promise<PersonReference | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;

  const name = person.name.trim();
  if (!name) return null;
  const existing = c.people.find(
    (item) => item.personId === person.personId || item.name.toLowerCase() === name.toLowerCase()
  );
  if (existing && !options?.allowDuplicateName) {
    const previousRole = existing.role;
    existing.role = person.role?.trim() || existing.role;
    if (person.notes?.trim()) existing.notes = person.notes.trim();
    if (person.affiliation?.trim()) existing.affiliation = person.affiliation.trim();
    if (person.threatLevel) existing.threatLevel = person.threatLevel;
    if (person.status?.trim()) existing.status = person.status.trim();
    c.updatedAt = new Date().toISOString();
    c.timeline.unshift({
      id: `TL-PERSON-${Date.now()}`,
      timestamp: c.updatedAt,
      type: 'PERSON_LINKED',
      actor: cachedState.profile.name,
      recordId: existing.personId,
      description: `Case role for ${existing.name} updated from "${previousRole}" to "${existing.role}".`
    });
    await persistAndNotify();
    return existing;
  }

  let personId = person.personId || `PERS-${Date.now().toString().slice(-4)}`;
  const taken = new Set(cachedState.cases.flatMap((item) => item.people.map((entry) => entry.personId)));
  while (taken.has(personId)) {
    personId = `PERS-${Date.now().toString().slice(-4)}-${taken.size}`;
  }

  const newPerson: PersonReference = {
    personId,
    name,
    role: person.role?.trim() || 'Other Relevant Person',
    affiliation: person.affiliation?.trim() || 'Unknown',
    threatLevel: person.threatLevel || 'None',
    status: person.status?.trim() || 'Unknown',
    notes: person.notes?.trim()
  };

  c.people.unshift(newPerson);
  c.updatedAt = new Date().toISOString();
  cachedState.session.actionsTaken += 1;

  c.timeline.unshift({
    id: `TL-PERSON-${Date.now()}`,
    timestamp: c.updatedAt,
    type: 'PERSON_LINKED',
    actor: cachedState.profile.name,
    recordId: newPerson.personId,
    description: `Linked ${newPerson.name} to the case as ${newPerson.role}. Role is not a finding of guilt.`
  });

  await persistAndNotify();
  return newPerson;
}

export async function linkExistingPersonToCase(
  caseId: string,
  registryPersonId: string,
  role: string
): Promise<PersonReference | null> {
  const registryPerson = cachedState.people.find((item) => item.id === registryPersonId);
  if (!registryPerson) return null;
  return addDGACasePerson(caseId, {
    personId: registryPerson.id,
    name: registryPerson.name,
    role: role.trim() || 'Other Relevant Person',
    affiliation: registryPerson.affiliation || 'Unknown',
    threatLevel: registryPerson.threatLevel || 'None',
    status: registryPerson.status || 'Unknown',
    notes: `Linked to existing CIVITAS record ${registryPerson.id}. Registry biography was not copied into investigative findings.`
  });
}

export async function addDGACaseTimelineEvent(
  caseId: string,
  event: Omit<TimelineEvent, 'id'> & { id?: string }
): Promise<TimelineEvent | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;

  const newEvent: TimelineEvent = {
    id: event.id || `TL-${Date.now()}`,
    timestamp: event.timestamp || new Date().toISOString(),
    type: event.type || 'NOTE_ADDED',
    actor: event.actor || cachedState.profile.name,
    description: event.description.trim()
  };

  c.timeline.unshift(newEvent);
  c.updatedAt = new Date().toISOString();
  cachedState.session.actionsTaken += 1;

  await persistAndNotify();
  return newEvent;
}

export async function submitDGACaseIndictment(
  caseId: string,
  hypothesis: CaseCauseHypothesis
): Promise<{ success: boolean; message: string }> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return { success: false, message: 'Case not found.' };

  const submitted: CaseCauseHypothesis = {
    ...(c.causeHypothesis || {}),
    ...hypothesis,
    indictmentStatus: 'Indicted',
    submittedAt: new Date().toISOString()
  };

  c.causeHypothesis = submitted;
  c.status = 'Closed';
  c.updatedAt = new Date().toISOString();
  cachedState.session.decisionsMade += 1;
  cachedState.session.actionsTaken += 1;

  const desc = `FORMAL INDICTMENT SUBMITTED: Cause established as "${submitted.primaryCause || 'Conclusive Execution'}" with Prime Suspect ${submitted.primeSuspectName || 'Subject Identified'}. Warrant served. Case closed.`;

  c.timeline.unshift({
    id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'STATUS_CHANGED',
    actor: cachedState.profile.name,
    description: desc
  });

  cachedState.activityFeed.unshift({
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    system: c.leadSystem || 'INVESTIGATION',
    headline: `DGA Docket ${c.id} Indicted and Closed`,
    details: desc,
    caseId: c.id,
    priority: 'Critical'
  });

  await persistAndNotify();
  return { success: true, message: `Indictment package submitted for Docket ${c.id}. Docket concluded and sealed.` };
}

export async function updateDGACaseEvidenceItem(
  caseId: string,
  evidenceId: string,
  patch: Partial<EvidenceItem>
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;
  const idx = c.evidence.findIndex((e) => e.id === evidenceId);
  if (idx === -1) return false;
  c.evidence[idx] = { ...c.evidence[idx], ...patch };
  c.updatedAt = new Date().toISOString();
  await persistAndNotify();
  return true;
}

export async function deleteDGACaseEvidenceItem(
  caseId: string,
  evidenceId: string
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;
  c.evidence = c.evidence.filter((e) => e.id !== evidenceId);
  c.updatedAt = new Date().toISOString();
  await persistAndNotify();
  return true;
}

export async function deleteDGACaseSuspectProfile(
  caseId: string,
  suspectId: string
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;
  if (c.suspectProfiles) {
    c.suspectProfiles = c.suspectProfiles.filter((s) => s.id !== suspectId);
  }
  c.people = c.people.filter((p) => p.personId !== suspectId);
  c.updatedAt = new Date().toISOString();
  await persistAndNotify();
  return true;
}

export async function deleteDGACaseTimelineEvent(
  caseId: string,
  eventId: string
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return false;
  c.timeline = c.timeline.filter((tl) => tl.id !== eventId);
  c.updatedAt = new Date().toISOString();
  await persistAndNotify();
  return true;
}

export async function updateDGACaseDetails(
  caseId: string,
  updates: Partial<DGACase>
): Promise<DGACase | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;
  Object.assign(c, updates);
  c.updatedAt = new Date().toISOString();
  await persistAndNotify();
  return c;
}

const OPEN_MEDICAL_STATUSES: MedicalRequestStatus[] = [
  'Draft',
  'Submitted',
  'Acknowledged',
  'In Progress',
  'Awaiting Information'
];

export async function requestCaseMedicalRecords(
  caseId: string,
  patientName: string,
  facility?: string,
  notes?: string,
  options?: {
    subjectPersonId?: string;
    recordsRequested?: string;
    dateRange?: string;
    purpose?: string;
    legalBasis?: string;
    priority?: DGACase['priority'];
  }
): Promise<{ success: boolean; medicalRecordId?: string; requestId: string; message: string; alreadyExists?: boolean }> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) {
    return { success: false, requestId: '', message: 'The originating case was not found. No medical request was created.' };
  }
  const subjectName = patientName.trim();
  if (!subjectName) {
    return { success: false, requestId: '', message: 'Name the person whose records you are requesting.' };
  }

  if (!c.medicalRequests) c.medicalRequests = [];
  const existing = c.medicalRequests.find((request) => {
    const samePerson =
      (options?.subjectPersonId && request.subjectPersonId === options.subjectPersonId) ||
      request.subjectName.toLowerCase() === subjectName.toLowerCase();
    return samePerson && OPEN_MEDICAL_STATUSES.includes(request.status);
  });
  if (existing) {
    return {
      success: true,
      alreadyExists: true,
      requestId: existing.id,
      message: `Open medical request ${existing.id} already covers ${subjectName}. A second request was not created.`
    };
  }

  const now = new Date().toISOString();
  const requestId = `REQ-MED-${Date.now().toString().slice(-6)}`;
  const facilityName = facility?.trim() || undefined;
  const recordsRequested = options?.recordsRequested?.trim() || notes?.trim() || 'Records described by the investigator';
  const medicalRequest: MedicalRecordsRequest = {
    id: requestId,
    caseId: c.id,
    subjectPersonId: options?.subjectPersonId,
    subjectName,
    requestingInvestigator: cachedState.profile.name,
    facility: facilityName,
    recordsRequested,
    dateRange: options?.dateRange?.trim() || undefined,
    purpose: options?.purpose?.trim() || undefined,
    legalBasis: options?.legalBasis?.trim() || undefined,
    priority: options?.priority || c.priority,
    status: 'Submitted',
    submittedAt: now,
    updatedAt: now
  };

  const sysReq = await createDGASystemRequest({
    caseId: c.id,
    requestedBy: 'DGA_CORE',
    targetSystem: 'MEDSTAT',
    requestType: 'MEDICAL_RECORDS',
    summary: `Medical records request ${requestId} for ${subjectName}${facilityName ? ` at ${facilityName}` : ''}. ${recordsRequested}`,
    priority: medicalRequest.priority,
    payload: {
      medicalRequestId: requestId,
      subjectPersonId: options?.subjectPersonId || null,
      subjectName,
      facility: facilityName || null,
      recordsRequested,
      purpose: medicalRequest.purpose || null,
      legalBasis: medicalRequest.legalBasis || null
    },
    logToTimeline: false
  });

  medicalRequest.systemRequestId = sysReq?.id;
  c.medicalRequests.unshift(medicalRequest);
  if (!c.supportingSystems.includes('MEDSTAT')) c.supportingSystems.push('MEDSTAT');
  c.updatedAt = now;
  c.timeline.unshift({
    id: `TL-MED-${requestId}`,
    timestamp: now,
    type: 'MEDICAL_REQUESTED',
    actor: cachedState.profile.name,
    recordId: requestId,
    description: `Medical records request ${requestId} submitted for ${subjectName}. No clinical report was generated.`
  });
  cachedState.alerts.unshift({
    id: `ALT-MED-${requestId}`,
    level: 'ROUTINE',
    title: `Medical request ${requestId} submitted`,
    message: `${subjectName} records were requested on case ${c.id}. MEDSTAT has not released a report.`,
    source: 'MEDSTAT',
    timestamp: now,
    actionRequired: false,
    caseId: c.id
  });

  await persistAndNotify();
  return {
    success: true,
    requestId,
    message: `Medical records request ${requestId} was submitted to MEDSTAT. A report will appear only after MEDSTAT releases one.`
  };
}

export async function updateCaseMedicalRequest(
  caseId: string,
  requestId: string,
  status: MedicalRequestStatus,
  statusNote?: string
): Promise<{ success: boolean; message: string }> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  const request = c?.medicalRequests?.find((item) => item.id === requestId);
  if (!c || !request) return { success: false, message: 'Medical request was not found.' };
  const now = new Date().toISOString();
  request.status = status;
  request.updatedAt = now;
  if (statusNote?.trim()) request.statusNote = statusNote.trim();
  if (request.systemRequestId) {
    const mapped =
      status === 'Rejected'
        ? 'REJECTED'
        : status === 'Cancelled'
          ? 'CANCELLED'
          : status === 'Completed' || status === 'Partially Fulfilled'
            ? 'COMPLETED'
            : status === 'Submitted' || status === 'Draft'
              ? 'PENDING'
              : 'IN_PROGRESS';
    updateSystemRequestStatus(cachedState, request.systemRequestId, mapped, {
      by: 'MEDSTAT',
      note: statusNote
    });
  }
  c.updatedAt = now;
  c.timeline.unshift({
    id: `TL-MED-STATUS-${Date.now()}`,
    timestamp: now,
    type: 'SYSTEM_UPDATE',
    actor: cachedState.profile.name,
    recordId: request.id,
    description: `Medical request ${request.id} is now ${status}.${statusNote?.trim() ? ` ${statusNote.trim()}` : ''}`
  });
  await persistAndNotify();
  return { success: true, message: `Request ${request.id} marked ${status}.` };
}

export async function releaseMedicalReportToCase(
  caseId: string,
  requestId: string,
  report: {
    author: string;
    reportType: string;
    findings: string;
    limitations?: string;
    partial?: boolean;
  }
): Promise<{ success: boolean; documentId?: string; message: string }> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  const request = c?.medicalRequests?.find((item) => item.id === requestId);
  if (!c || !request) return { success: false, message: 'Medical request was not found.' };
  const findings = report.findings?.trim();
  if (!findings) return { success: false, message: 'Enter the released findings before completing the request.' };
  if (request.releasedDocumentId) {
    return {
      success: true,
      documentId: request.releasedDocumentId,
      message: `Report ${request.releasedDocumentId} was already released for ${request.id}.`
    };
  }

  const now = new Date().toISOString();
  const documentId = `MED-RPT-${request.id}`;
  const author = report.author?.trim() || cachedState.profile.name;
  const content = [
    `Source request: ${request.id}`,
    `Subject: ${request.subjectName}`,
    `Facility: ${request.facility || 'Unknown'}`,
    `Report type: ${report.reportType.trim() || 'Medical record'}`,
    `Author: ${author}`,
    '',
    findings,
    report.limitations?.trim() ? `\nLimitations: ${report.limitations.trim()}` : ''
  ].join('\n');

  c.documents.unshift({
    id: documentId,
    title: `${report.reportType.trim() || 'Medical report'} — ${request.subjectName}`,
    classification: c.classification,
    date: now,
    author,
    content,
    sourceSystem: 'MEDSTAT',
    requestId: request.systemRequestId
  });
  c.findings = c.findings || [];
  c.findings.unshift({
    id: `FND-${documentId}`,
    kind: 'Medical Finding',
    statement: findings,
    supportingRecordIds: [request.id, documentId],
    recordedBy: author,
    recordedAt: now
  });
  request.status = report.partial ? 'Partially Fulfilled' : 'Completed';
  request.updatedAt = now;
  request.releasedDocumentId = documentId;
  c.medicalRecordId = documentId;
  c.updatedAt = now;
  c.timeline.unshift({
    id: `TL-MED-REL-${documentId}`,
    timestamp: now,
    type: 'DOCUMENT_ATTACHED',
    actor: author,
    recordId: documentId,
    description: `MEDSTAT released ${documentId} for request ${request.id}. The report is a medical record, not an investigative conclusion.`
  });
  cachedState.alerts.unshift({
    id: `ALT-MED-REL-${documentId}`,
    level: 'ROUTINE',
    title: `Medical report released for ${c.id}`,
    message: `${documentId} was returned for ${request.subjectName}.`,
    source: 'MEDSTAT',
    timestamp: now,
    caseId: c.id
  });
  if (request.systemRequestId) {
    updateSystemRequestStatus(cachedState, request.systemRequestId, 'COMPLETED', {
      by: 'MEDSTAT',
      note: report.partial ? 'Partial medical report released.' : 'Medical report released.'
    });
  }
  await persistAndNotify();
  return { success: true, documentId, message: `Released ${documentId} to case ${c.id}.` };
}

export async function amendIncidentNarrative(
  caseId: string,
  nextNarrative: string,
  reason?: string
): Promise<DGACase | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;
  const updated = nextNarrative.trim();
  if (!updated) throw new Error('The incident narrative cannot be empty.');
  if (updated === c.summary) return c;
  const now = new Date().toISOString();
  c.incidentRevisions = [
    {
      id: `REV-${Date.now()}`,
      timestamp: now,
      actor: cachedState.profile.name,
      previousValue: c.summary,
      newValue: updated,
      reason: reason?.trim() || undefined
    },
    ...(c.incidentRevisions || [])
  ];
  c.summary = updated;
  c.updatedAt = now;
  c.timeline.unshift({
    id: `TL-AMEND-${Date.now()}`,
    timestamp: now,
    type: 'INCIDENT_AMENDED',
    actor: cachedState.profile.name,
    description: `Incident narrative amended.${reason?.trim() ? ` Reason: ${reason.trim()}` : ''}`
  });
  await persistAndNotify();
  return c;
}

export async function recordInvestigativeFinding(
  caseId: string,
  input: { kind: FindingKind; statement: string; supportingRecordIds?: string[] }
): Promise<InvestigativeFinding | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  const statement = input.statement?.trim();
  if (!c || !statement) return null;
  const now = new Date().toISOString();
  const finding: InvestigativeFinding = {
    id: `FND-${Date.now().toString().slice(-6)}`,
    kind: input.kind,
    statement,
    supportingRecordIds: input.supportingRecordIds || [],
    recordedBy: cachedState.profile.name,
    recordedAt: now
  };
  c.findings = [finding, ...(c.findings || [])];
  c.updatedAt = now;
  c.timeline.unshift({
    id: `TL-FND-${finding.id}`,
    timestamp: now,
    type: 'FINDING_RECORDED',
    actor: cachedState.profile.name,
    recordId: finding.id,
    description: `Recorded ${finding.kind}: ${statement.slice(0, 180)}`
  });
  await persistAndNotify();
  return finding;
}

export async function setCaseSuggestionDisposition(
  caseId: string,
  suggestionId: string,
  status: SuggestionDisposition['status']
): Promise<void> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return;
  const now = new Date().toISOString();
  const next: SuggestionDisposition = {
    suggestionId,
    status,
    updatedAt: now,
    updatedBy: cachedState.profile.name
  };
  c.suggestionState = [next, ...(c.suggestionState || []).filter((item) => item.suggestionId !== suggestionId)];
  c.updatedAt = now;
  await persistAndNotify();
}

export async function recordEvidenceCustodyTransfer(
  caseId: string,
  evidenceId: string,
  event: Omit<CustodyEvent, 'id' | 'timestamp'> & { timestamp?: string }
): Promise<boolean> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  const evidence = c?.evidence.find((item) => item.id === evidenceId);
  if (!c || !evidence) return false;
  const entry: CustodyEvent = {
    id: `COC-${evidenceId}-${Date.now()}`,
    timestamp: event.timestamp || new Date().toISOString(),
    releasingCustodian: event.releasingCustodian,
    receivingCustodian: event.receivingCustodian,
    reason: event.reason,
    location: event.location,
    sealStatus: event.sealStatus,
    notes: event.notes
  };
  evidence.custodyLog = [...(evidence.custodyLog || []), entry];
  evidence.custodian = event.receivingCustodian;
  c.updatedAt = entry.timestamp;
  c.timeline.unshift({
    id: `TL-${entry.id}`,
    timestamp: entry.timestamp,
    type: 'CUSTODY_TRANSFERRED',
    actor: cachedState.profile.name,
    recordId: evidenceId,
    description: `Custody of ${evidenceId} passed from ${entry.releasingCustodian} to ${entry.receivingCustodian}. ${entry.reason}`
  });
  await persistAndNotify();
  return true;
}

export async function ensureDGAForensicRequest(
  caseId: string,
  evidenceIds: string[],
  requestedModules: string[],
  patch: Partial<ForensicRequest> & { requestedBy: string; notes: string }
): Promise<ForensicRequest | null> {
  const c = cachedState.cases.find((item) => item.id === caseId);
  if (!c) return null;
  const existing = findReusableForensicRequest(c, evidenceIds, requestedModules);
  if (existing) {
    if (patch.linkedTraceCaseId) existing.linkedTraceCaseId = patch.linkedTraceCaseId;
    if (patch.traceExamIds) existing.traceExamIds = patch.traceExamIds;
    if (patch.investigativeQuestion) existing.investigativeQuestion = patch.investigativeQuestion;
    if (patch.resultSummary) existing.resultSummary = patch.resultSummary;
    c.updatedAt = new Date().toISOString();
    await persistAndNotify();
    return existing;
  }

  const created = await createDGAForensicRequest(caseId, {
    caseId,
    requestedBy: patch.requestedBy,
    targetModules: requestedModules,
    evidenceIds,
    notes: patch.notes
  });
  if (!created) return null;
  created.linkedTraceCaseId = patch.linkedTraceCaseId;
  created.traceExamIds = patch.traceExamIds;
  created.investigativeQuestion = patch.investigativeQuestion;
  if (!c.supportingSystems.includes('TRACE')) c.supportingSystems.push('TRACE');
  await persistAndNotify();
  return created;
}

