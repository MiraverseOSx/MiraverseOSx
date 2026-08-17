export type ModuleType = 'medical' | 'investigation' | 'dispatch';

export type EventType = 'incoming_call' | 'text_message' | 'system_report' | 'chart_update';

export type UrgencyLevel = 'routine' | 'elevated' | 'critical';

export interface EventPayload {
  // Medical
  patient_name?: string;
  age?: number;
  vitals?: string;
  symptoms?: string;
  history?: string;
  triage_category?: 'Immediate / Red' | 'Urgent / Orange' | 'Delayed / Yellow' | 'Minimal / Green' | string;

  // Investigation
  case_file_id?: string;
  suspect_name?: string;
  evidence_summary?: string;
  clue_type?: string;
  confidence_level?: string;

  // Dispatch
  system_alert?: string;
  required_action?: string;
  location?: string;
  units_recommended?: string[];

  // Shared
  actions_available?: string[];
  [key: string]: any;
}

export interface OrchestratorEvent {
  id: string;
  module: ModuleType;
  event_type: EventType;
  urgency: UrgencyLevel;
  sender: string;
  payload: EventPayload;
  timestamp?: string;
  read?: boolean;
}

export interface ActionResolutionResult {
  score: number;
  outcome_title: string;
  outcome_details: string;
  department_rep_gain: string;
  status: 'optimal' | 'acceptable' | 'suboptimal' | 'critical_failure' | string;
  follow_up_narrative?: string;
}

export interface ResolutionHistoryItem {
  id: string;
  eventId: string;
  module: ModuleType;
  actionTaken: string;
  playerNotes?: string;
  timestamp: string;
  result: ActionResolutionResult;
  eventSummary: string;
}

export interface DepartmentStats {
  medicalScore: number;
  patientsTreated: number;
  investigationScore: number;
  casesResolved: number;
  dispatchScore: number;
  unitsDispatched: number;
  overallRating: number; // 0-100
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  module: ModuleType | 'system';
  urgency: UrgencyLevel;
  timestamp: string;
  eventId?: string;
}

export interface WindowState {
  id: string;
  title: string;
  module?: ModuleType | 'orchestrator' | 'stats' | 'notepad';
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}
