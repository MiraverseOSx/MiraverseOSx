import {
  DGASystem,
  Classification,
  CaseStatus,
  Priority,
  Objective,
  Task,
  EvidenceItem,
  PersonReference,
  OrganizationReference,
  LocationReference,
  CommunicationReference,
  DocumentReference,
  ForensicRequest,
  TimelineEvent,
  AgentNote,
  SeedCase,
  TaskStatus,
  TaskComment,
  TaskActivityItem,
  CaseDepartment,
  CaseCrossLink,
  CanonicalCaseStatus,
  RequestStatus,
  ForensicRequestStatus,
  normalizeCaseStatus,
  normalizeRequestStatus,
  CaseCauseHypothesis,
  SuspectInvestigationProfile,
  CaseCreationSource,
  MedicalRequestStatus,
  FindingKind,
  IncidentRevision,
  MedicalRecordsRequest,
  CustodyEvent,
  InvestigativeFinding,
  SuggestionDisposition
} from '../data/seed/cases';

import { SeedAgentProfile } from '../data/seed/agent';
import { SeedPerson } from '../data/seed/people';
import { SeedOrganization } from '../data/seed/organizations';
import { SeedLocation } from '../data/seed/locations';
import { SeedRelationship, RelationshipType } from '../data/seed/relationships';
import {
  SeedCommunication,
  RichMailAttachment,
  MailAttachment,
  CommunicationStatus,
  normalizeCommunicationStatus
} from '../data/seed/communications';
import { ContactStatus, normalizeContactStatus } from './phone-data';
import type { DGAEventType } from './dga-events';

// Re-export seed types for convenience
export type {
  DGASystem,
  Classification,
  CaseStatus,
  CanonicalCaseStatus,
  RequestStatus,
  ForensicRequestStatus,
  Priority,
  Objective,
  Task,
  TaskStatus,
  TaskComment,
  TaskActivityItem,
  EvidenceItem,
  PersonReference,
  OrganizationReference,
  LocationReference,
  CommunicationReference,
  DocumentReference,
  ForensicRequest,
  TimelineEvent,
  AgentNote,
  CaseDepartment,
  CaseCrossLink,
  CaseCauseHypothesis,
  SuspectInvestigationProfile,
  CaseCreationSource,
  MedicalRequestStatus,
  FindingKind,
  IncidentRevision,
  MedicalRecordsRequest,
  CustodyEvent,
  InvestigativeFinding,
  SuggestionDisposition,
  SeedCase as DGACase,
  SeedAgentProfile as DGAAgentProfile,
  SeedPerson as DGAEntityPerson,
  SeedOrganization as DGAEntityOrganization,
  SeedLocation as DGAEntityLocation,
  SeedRelationship as DGARelationship,
  RelationshipType,
  SeedCommunication as DGACommunication,
  CommunicationStatus,
  ContactStatus,
  RichMailAttachment,
  MailAttachment
};

export {
  normalizeCaseStatus,
  normalizeRequestStatus,
  normalizeCommunicationStatus,
  normalizeContactStatus
};

export interface NpcCoworker {
  id: string;
  name: string;
  role: string;
  department: CaseDepartment;
  status: 'On Duty' | 'In Field' | 'In Lab' | 'In Surgery' | 'Unavailable' | 'Undercover';
  currentLocation?: string;
  currentTaskTitle?: string;
  phoneExtension: string;
  trustScore: number;
  stressLevel: 'Nominal' | 'Elevated' | 'Critical';
  avatarInitials: string;
}

/* =========================================================================
   PHASE 2: DYNAMIC SIMULATION, INTERACTIVITY & LIVING WORLD TYPES
   ========================================================================= */

export type CaseLifecycleState =
  | 'RECEIVED'
  | 'INITIAL_REVIEW'
  | 'ACTIVE_INVESTIGATION'
  | 'DEVELOPING'
  | 'ACTION_REQUIRED'
  | 'RESOLUTION_PENDING'
  | 'RESOLVED'
  | 'CLOSED'
  | 'STALLED'
  | 'ESCALATED'
  | 'TRANSFERRED'
  | 'SUSPENDED'
  | 'REOPENED'
  | 'COMPROMISED';

export type EvidenceDiscoveryState =
  | 'UNKNOWN'
  | 'KNOWN'
  | 'LOCATED'
  | 'COLLECTED'
  | 'SUBMITTED'
  | 'UNDER_EXAMINATION'
  | 'RESULT_AVAILABLE'
  | 'INTERPRETED';

export type ScheduledEventType =
  | 'LAB_RESULT_READY'
  | 'NPC_EMAIL'
  | 'CASE_DEADLINE'
  | 'INTELLIGENCE_UPDATE'
  | 'PATIENT_STATUS_CHANGE'
  | 'FIELD_TEAM_REPORT'
  | 'CYBER_ALERT'
  | 'HEARING_START'
  | 'FOLLOW_UP_REQUEST'
  | 'NEW_EVIDENCE'
  | 'CASE_ESCALATION'
  | 'CASE_DEESCALATION'
  | 'ASSIGNMENT_RECEIVED'
  | 'SYSTEM_REQUEST_DUE';

export interface ScheduledEvent {
  id: string;
  type: ScheduledEventType;
  caseId?: string;
  actorId?: string;
  scheduledAt: string;
  createdAt: string;
  status: 'scheduled' | 'triggered' | 'cancelled' | 'superseded';
  payload: Record<string, unknown>;
}

export interface NPCProfile {
  id: string;
  name: string;
  occupation: string;
  organization?: string;
  relationship: {
    trust: number; // 0 - 100
    familiarity: number; // 0 - 100
    respect: number; // 0 - 100
    tension: number; // 0 - 100
  };
  knowledge: string[];
  secrets: string[];
  currentConcerns: string[];
  communicationStyle: 'formal_diplomatic' | 'clinical_scientific' | 'blunt_tactical' | 'bureaucratic' | 'covert_guarded';
  lastInteraction?: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  consequences: string[];
}

export interface CaseDecision {
  id: string;
  caseId: string;
  title: string;
  description: string;
  choice?: string;
  rationale?: string;
  timestamp: string;
  status: 'pending' | 'resolved';
  immediateEffects: string[];
  futureFlags: string[];
  options: DecisionOption[];
}

export interface CaseRelationship {
  id: string;
  sourceCaseId: string;
  targetCaseId: string;
  type:
    | 'related'
    | 'suspected_related'
    | 'derived_from'
    | 'caused_by'
    | 'shares_person'
    | 'shares_evidence'
    | 'shares_organization'
    | 'classified_connection';
  notes?: string;
  discovered: boolean;
}

export interface CaseBlueprint {
  caseId: string;
  seed?: number;
  incident: string;
  initiatingEvent: string;
  hiddenTruth: {
    culprit?: string;
    cause?: string;
    secretConnection?: string;
    hiddenEvidence?: string[];
    futureTwist?: string;
    correctDiagnosis?: string;
    intelligenceSource?: string;
    finalLocation?: string;
  };
  knownFacts: string[];
  unknownFacts: string[];
  falseLeads: string[];
  systemConnections: DGASystem[];
  escalationRules: string[];
  resolutionConditions: string[];
}

export interface AgencyActivityItem {
  id: string;
  timestamp: string;
  system: DGASystem;
  headline: string;
  details: string;
  caseId?: string;
  priority?: Priority;
}

export interface DgaSession {
  sessionId: string;
  startTime: string;
  lastActiveTime: string;
  casesWorked: number;
  actionsTaken: number;
  evidenceSubmitted: number;
  messagesSent: number;
  decisionsMade: number;
  shiftNotes?: string;
}

export interface SimulationSettings {
  status: 'live' | 'paused';
  activityLevel: 'low' | 'normal' | 'high';
  focusMode: boolean;
  focusCaseId?: string | null;
  currentTime: string;
  lastProcessedAt: string;
  offlineEventsSummary?: {
    elapsedMs: number;
    elapsedFormatted: string;
    eventsCount: number;
    highlights: string[];
  } | null;
}

export interface DgaAlert {
  id: string;
  level: 'INFO' | 'ROUTINE' | 'FLASH' | 'CRITICAL';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  actionRequired?: boolean;
  caseId?: string;
  snoozedUntil?: string;
}

export type DGAAlert = DgaAlert;

/* =========================================================================
   CLICKUP-INSPIRED WORK MANAGEMENT LAYER TYPES
   ========================================================================= */

export type WorkViewMode = 'list' | 'board' | 'calendar' | 'timeline' | 'table' | 'activity';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean' | 'badge';
  options?: string[];
  applicableTo: 'tasks' | 'cases' | 'both';
  defaultValue?: string | number | boolean;
}

export interface SavedFilter {
  id: string;
  name: string;
  icon?: string;
  view?: WorkViewMode;
  criteria: {
    status?: string[];
    priority?: Priority[];
    assignedTo?: string;
    search?: string;
    tags?: string[];
    isBlocked?: boolean;
    caseId?: string;
    phase?: string;
  };
}

export interface CaseTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  classification: Classification;
  priority: Priority;
  leadSystem: DGASystem;
  defaultObjectives: Array<{ title: string; description: string }>;
  defaultTasks: Array<{
    title: string;
    description: string;
    phase: 'Preliminary' | 'Active Investigation' | 'Forensic Analysis' | 'Intervention' | 'Prosecution';
    priority?: Priority;
    assignedTo?: string;
    tags?: string[];
    dependsOnOffset?: number[];
    subtasks?: Array<{ title: string; description?: string }>;
  }>;
}

export type AutomationTrigger =
  | 'ON_TASK_COMPLETED'
  | 'ON_ALL_PHASE_TASKS_COMPLETE'
  | 'ON_TASK_BLOCKED'
  | 'ON_CASE_STATUS_CHANGED'
  | 'ON_FORENSIC_RESULT_RECEIVED';

export type AutomationAction =
  | 'UPDATE_CASE_STATUS'
  | 'CREATE_ALERT'
  | 'DISPATCH_COMMUNICATION'
  | 'CREATE_FOLLOWUP_TASK'
  | 'SET_TASK_PRIORITY'
  | 'UNBLOCK_DEPENDENTS';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'is_empty' | 'is_not_empty';
    value?: any;
  };
  action: AutomationAction;
  actionPayload: any;
  executionCount?: number;
  lastExecutedAt?: string;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  type: 'work_overview' | 'board_snapshot' | 'impending_deadlines' | 'task_activity' | 'recent_alerts' | 'agent_profile';
  visible: boolean;
  order: number;
}

/* =========================================================================
   PHASE 3: INTER-SYSTEM EXCHANGE (SHARED ADAPTER CONTRACT STATE)
   ========================================================================= */

export type IntegratedSystemId = 'TRACE' | 'MEDSTAT' | 'ORACLE' | 'CIPHER' | 'AEGIS' | 'CIVITAS' | 'COMMS' | 'ARCHIVE';

/** Any party that can originate or receive exchange traffic: a system or the operator console. */
export type SystemActor = DGASystem | 'DGA_CORE';

export type SystemRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export type FindingConfidence = 'LOW' | 'MODERATE' | 'HIGH' | 'CONFIRMED';

export interface SystemCaseLink {
  id: string;
  caseId: string;
  system: DGASystem;
  role: 'lead' | 'supporting';
  receivedFrom: SystemActor;
  receivedAt: string;
  externalRef?: string;
  note?: string;
}

export interface SystemRequest {
  id: string;
  caseId: string;
  requestedBy: SystemActor;
  targetSystem: DGASystem;
  requestType: string;
  summary: string;
  priority: Priority;
  status: SystemRequestStatus;
  payload: Record<string, unknown>;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
  dueAt?: string;
  completedAt?: string;
  statusNote?: string;
  findingId?: string;
  externalRef?: string;
  /** Mirrors a legacy ForensicRequest so TRACE UI and exchange state stay in sync. */
  legacyForensicRequestId?: string;
}

export interface SystemFinding {
  id: string;
  caseId: string;
  requestId?: string;
  system: DGASystem;
  returnedTo: SystemActor;
  summary: string;
  details?: string;
  confidence: FindingConfidence;
  documentIds: string[];
  createdAt: string;
}

export interface SystemEventRecord {
  id: string;
  type: DGAEventType;
  timestamp: string;
  source: SystemActor;
  target?: SystemActor;
  caseId?: string;
  refId?: string;
  summary: string;
}

export interface SystemExchangeState {
  links: SystemCaseLink[];
  requests: SystemRequest[];
  findings: SystemFinding[];
  eventLog: SystemEventRecord[];
}

/** Envelope carried on the event bus for every SYSTEM_* event. */
export interface SystemBusPayload<T = unknown> {
  source: SystemActor;
  target?: SystemActor;
  refId?: string;
  summary: string;
  data?: T;
}

/** Fields any system may change on a shared case. */
export interface SharedCasePatch {
  status?: CaseStatus;
  priority?: Priority;
  addTags?: string[];
  addSupportingSystems?: DGASystem[];
  completeObjectiveIds?: string[];
  addEvidence?: EvidenceItem[];
  evidenceCustody?: Array<{ evidenceId: string; custodyStatus: EvidenceItem['custodyStatus'] }>;
  linkedTraceCaseId?: string;
  customFields?: Record<string, string | number | boolean>;
}

/* =========================================================================
   CANONICAL DGA MASTER STATE (EXPANDED FOR PHASE 2 + WORK MANAGEMENT)
   ========================================================================= */

export interface DGAState {
  profile: SeedAgentProfile;
  cases: SeedCase[];
  people: SeedPerson[];
  organizations: SeedOrganization[];
  locations: SeedLocation[];
  relationships: SeedRelationship[];
  communications: SeedCommunication[];
  alerts: DgaAlert[];
  activeCaseId: string | null;
  isLocked: boolean;
  activeSystem: DGASystem | 'DGA_CORE';

  // Phase 2 Additions
  simulation: SimulationSettings;
  session: DgaSession;
  scheduledEvents: ScheduledEvent[];
  npcs: NPCProfile[];
  decisions: CaseDecision[];
  caseRelationships: CaseRelationship[];
  caseBlueprints: Record<string, CaseBlueprint>;
  agencyActivityFeed: AgencyActivityItem[];
  activityFeed: AgencyActivityItem[];

  // Work Management Additions
  customFieldDefinitions: CustomFieldDefinition[];
  savedFilters: SavedFilter[];
  caseTemplates: CaseTemplate[];
  automationRules: AutomationRule[];
  dashboardWidgets: DashboardWidgetConfig[];
  favoriteCaseIds: string[];
  favoriteTaskIds: string[];

  // Phase 3 Inter-System Exchange
  systemExchange: SystemExchangeState;

  // Unacknowledged Background Simulation Events (displays '3 NEW EVENTS')
  unacknowledgedSimulationEventCount: number;
}

/**
 * Storage Abstraction Interface
 * Allows seamless switching between LocalStorage (Phase 1) and SQLite/IndexedDB later.
 */
export interface DGAStorageAdapter {
  loadState(): Promise<DGAState>;
  saveState(state: DGAState): Promise<void>;
  resetState(): Promise<DGAState>;
}
