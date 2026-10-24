/**
 * MIRAVERSE OS x — Core TypeScript Definitions & Models
 * Contract for React/TSX frontend components and system models.
 */

// --- App & Navigation Models ---
export interface AppIconProps {
  id: string;
  title: string;
  icon: string; // Asset path or icon identifier
  category?: 'system' | 'communication' | 'magic' | 'network' | 'utility';
  defaultWidth?: number;
  defaultHeight?: number;
  isShortcut?: boolean;
}

export interface AppDefinition extends AppIconProps {
  componentName: string;
  isSingleton?: boolean;
}

// --- Window & Layout Telemetry Models ---
export interface Vector2D {
  x: number;
  y: number;
}

export interface WindowDimensions {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon?: string;
  position: Vector2D;
  size: WindowDimensions;
  minSize?: WindowDimensions;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
}

// --- Taskbar Telemetry ---
export interface TaskbarItem {
  id: string; // Maps to WindowState id
  appId: string;
  title: string;
  icon?: string;
  isMinimized: boolean;
  isFocused: boolean;
}

// --- Domain Models ---

/** Civic Identity Record */
export interface CivicProfileData {
  citizenId: string;
  fullName: string;
  designation: string;
  dermalNodesStatus: 'calibrated' | 'syncing' | 'uncalibrated';
  opticalGeometry: string;
  auraTelemetry: number; // Harmonic frequency score
  clearanceLevel: 'Alpha' | 'Beta' | 'Gamma' | 'Omni';
}

/** Email Dispatch & Comms */
export interface MailMessage {
  id: string;
  sender: string;
  senderAddress: string;
  recipient: string;
  subject: string;
  timestamp: string;
  body: string;
  isRead: boolean;
  category: 'Official' | 'Personal' | 'Encrypted' | 'System';
}

/** SpellForge Synthesis */
export interface SpellForgeProtocol {
  id: string;
  name: string;
  element: 'Ignis' | 'Aqua' | 'Terra' | 'Aer' | 'Lux' | 'Umbra';
  utilityProtocol: string;
  runeModifier: string;
  powerLevel: number;
  corruptionRisk: number;
}

/** NoticeBoard Missions & Quests */
export interface NoticeBoardQuest {
  id: string;
  title: string;
  type: 'Journey' | 'Adventure' | 'Quest' | 'Task' | 'Mission';
  region: string;
  faction: string;
  difficulty: 'Novice' | 'Adept' | 'Master' | 'Celestial';
  description: string;
  rewards: {
    xp: number;
    credits: number;
    bits?: number;
    item?: string;
  };
  status: 'Available' | 'In Progress' | 'Completed' | 'Failed';
}

/** WORKNET & Career Systems (§10) */
export type CareerId = 
  | 'archivist' 
  | 'engineer' 
  | 'diplomat' 
  | 'enforcer' 
  | 'artist' 
  | 'medical' 
  | 'warden' 
  | 'finance' 
  | 'questnotice';

export type MissionType = 
  | 'Work Shifts' 
  | 'Special Assignments' 
  | 'Career Development' 
  | 'Field Operations' 
  | 'QUESTNOTICE';

export interface CareerTrackInfo {
  id: CareerId;
  name: string;
  category: string;
  primaryWorkplaces: string[];
  duties: string[];
  requirements: string;
  primaryAttribute: string;
  gameplayConnections: string;
  baseSalaryCredits: number;
  tierTitles: string[];
}

export interface WorknetMission {
  id: string;
  type: MissionType;
  track: string;
  department: string;
  title: string;
  location: string;
  workplace: string;
  severity: 'Routine' | 'Elevated' | 'Critical';
  description: string;
  targetSubject?: string;
  threatOrSymptom?: string;
  requiredAction: string;
  rewardCredits: number;
  rewardBits: number;
  rewardXP: number;
  primaryAttribute: string;
  permittedTools: string[];
  completed?: boolean;
}

/** MAI Agent Orchestrator Payloads */
export interface AgentQueryRequest {
  prompt: string;
  context?: string;
}

export interface AgentQueryResponse {
  response: string;
  thought?: string;
  source: string;
  toolResult?: Record<string, unknown> | null;
}

