// Autonomous NPC Coworker Behavior Engine for TRACE & DGAOS
// Agents actively communicate, debate, make mistakes, request help, complete tasks, and escalate cases

import { NpcCoworker } from '@/lib/dga-types';
import { getDGAState } from '../dga-store';
import { emitDgaEvent } from '../dga-events';

export interface AutonomousNpcEvent {
  id: string;
  agentId: string;
  agentName: string;
  type:
    | 'PHONE_CALL'
    | 'CHANNEL_MESSAGE'
    | 'TASK_COMPLETED'
    | 'DISAGREEMENT'
    | 'MISTAKE_CORRECTED'
    | 'REQUEST_HELP'
    | 'CASE_HANDOFF'
    | 'STATUS_CHANGE';
  caseId?: string;
  title: string;
  detail: string;
  timestamp: string;
  requiresPlayerResponse?: boolean;
  callbackAction?: string;
}

export interface NpcAgentState {
  id: string;
  name: string;
  role: string;
  department: 'Investigation' | 'Medical' | 'Intelligence' | 'Government';
  status: 'On Duty' | 'In Field' | 'In Lab' | 'In Surgery' | 'Unavailable' | 'Undercover';
  currentTaskTitle: string;
  stressLevel: 'Nominal' | 'Elevated' | 'Critical';
  trustScore: number;
  phoneExtension: string;
  avatarInitials: string;
}

export const INITIAL_NPC_ROSTER: NpcAgentState[] = [
  {
    id: 'NPC-YUMI',
    name: 'Agent Yumi Tanaka',
    role: 'Senior Detective / CCTV Video Forensics',
    department: 'Investigation',
    status: 'In Field',
    currentTaskTitle: 'Reviewing North Gate CCTV Camera 3 Feeds',
    stressLevel: 'Elevated',
    trustScore: 88,
    phoneExtension: 'x4412',
    avatarInitials: 'YT',
  },
  {
    id: 'NPC-MERCER',
    name: 'Dr. Emily Mercer, MD',
    role: 'Attending Trauma ICU & Forensic Pathologist',
    department: 'Medical',
    status: 'In Surgery',
    currentTaskTitle: 'Managing Vance Refractory Cholinergic Arrest',
    stressLevel: 'Critical',
    trustScore: 92,
    phoneExtension: 'x8819',
    avatarInitials: 'EM',
  },
  {
    id: 'NPC-CHEN',
    name: 'Analyst Marcus Chen',
    role: 'SIGINT & Cryptanalysis Team Lead',
    department: 'Intelligence',
    status: 'In Lab',
    currentTaskTitle: 'Cracking Zurich SWIFT C2 Telemetry Packets',
    stressLevel: 'Nominal',
    trustScore: 84,
    phoneExtension: 'x3309',
    avatarInitials: 'MC',
  },
  {
    id: 'NPC-STERLING',
    name: 'Director Donald Sterling',
    role: 'Executive Director of Agency Operations',
    department: 'Government',
    status: 'On Duty',
    currentTaskTitle: 'Briefing National Security Council in Situation Room',
    stressLevel: 'Elevated',
    trustScore: 95,
    phoneExtension: 'x1000',
    avatarInitials: 'DS',
  },
  {
    id: 'NPC-JENKINS',
    name: 'Special Agent Sarah Jenkins',
    role: 'Forensic Vault Custodian & AFIS Specialist',
    department: 'Investigation',
    status: 'In Lab',
    currentTaskTitle: 'Running Latent Gate Print #LP-04 in NCIC Database',
    stressLevel: 'Nominal',
    trustScore: 90,
    phoneExtension: 'x4408',
    avatarInitials: 'SJ',
  },
];

/**
 * Autonomous agency event script library
 */
const EVENT_POOL: Omit<AutonomousNpcEvent, 'id' | 'timestamp'>[] = [
  {
    agentId: 'NPC-YUMI',
    agentName: 'Agent Yumi Tanaka',
    type: 'PHONE_CALL',
    caseId: 'INV-2026-0417',
    title: 'Incoming Phone Call from Agent Yumi',
    detail: '“I found something in the CCTV review. Check your evidence vault.”',
    requiresPlayerResponse: true,
    callbackAction: 'CONT-YUMI',
  },
  {
    agentId: 'NPC-YUMI',
    agentName: 'Agent Yumi Tanaka',
    type: 'MISTAKE_CORRECTED',
    caseId: 'INV-2026-0417',
    title: 'Correction: License Plate Digit Adjusted',
    detail: '“Initial OCR read the delivery van as 7XYZ88. Frame buffering through super-resolution confirms the last character is 7XYZ89 (Registered to Apex Marine Freight).”',
  },
  {
    agentId: 'NPC-CHEN',
    agentName: 'Analyst Marcus Chen',
    type: 'DISAGREEMENT',
    caseId: 'INT-2026-0941',
    title: 'Analyst Chen Disagrees with Initial Vector Theory',
    detail: '“Sir, the Embassy didn\'t suffer an HVAC airborne release. Look at the flow sensors—pressure in Suite 400 was positive. The toxin had to be delivered in person on food or glassware.”',
  },
  {
    agentId: 'NPC-MERCER',
    agentName: 'Dr. Emily Mercer, MD',
    type: 'REQUEST_HELP',
    caseId: 'MED-2026-0188',
    title: 'Dr. Mercer Requests Urgent Toxicology Escalation',
    detail: '“Ambassador Vance’s cholinesterase level dropped below 420 U/L. Need immediate legal approval to preserve whole blood vials for criminal autopsy.”',
    requiresPlayerResponse: true,
  },
  {
    agentId: 'NPC-JENKINS',
    agentName: 'Special Agent Sarah Jenkins',
    type: 'TASK_COMPLETED',
    caseId: 'INV-2026-0417',
    title: 'AFIS Fingerprint Run Completed: 98.4% Match to Viktor Krell',
    detail: '“Latent print #LP-04 lifted from the North Service Gate latch returned a definitive 18-minutiae match to Viktor Krell (NCIC-KRELL-4912).”',
  },
  {
    agentId: 'NPC-YUMI',
    agentName: 'Agent Yumi Tanaka',
    type: 'CASE_HANDOFF',
    caseId: 'INV-2026-0417',
    title: 'Temporary Case Handoff: Deploying Undercover to Pier 42',
    detail: '“I am deploying mobile surveillance to the Pier 42 harbor perimeter. Handoff active scene logging to SA Jenkins until my team is in position.”',
  },
];

let eventIndex = 0;

/**
 * Triggers the next autonomous event in the simulation cycle
 */
export function triggerNextNpcAutonomousAction(): AutonomousNpcEvent {
  const template = EVENT_POOL[eventIndex % EVENT_POOL.length];
  eventIndex++;

  const event: AutonomousNpcEvent = {
    ...template,
    id: `NPC-EVT-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };

  const state = getDGAState();

  // Log in agency feed
  state.agencyActivityFeed.unshift({
    id: `FEED-${Date.now()}`,
    timestamp: new Date().toISOString(),
    system: template.agentId === 'NPC-MERCER' ? 'MEDSTAT' : template.agentId === 'NPC-CHEN' ? 'CIPHER' : 'TRACE',
    headline: `${template.agentName}: ${template.title}`,
    details: template.detail,
    caseId: template.caseId,
  });

  emitDgaEvent({
    type: 'NOTE_ADDED',
    actor: template.agentName,
    caseId: template.caseId,
    payload: {
      summary: `${template.agentName}: ${template.detail}`,
      system: template.agentId === 'NPC-MERCER' ? 'MEDSTAT' : 'TRACE',
    },
  });

  return event;
}
