import {
  DGACase,
  Task,
  ScheduledEvent,
  DgaAlert,
  DGACommunication,
  CaseRelationship,
  AgencyActivityItem
} from '@/lib/dga-types';
import { createScheduledEvent } from './scheduler';
import { canRunScheduledEvent, hasEmbassyScenario } from './scenario-scope';

export interface ReactionOutput {
  newScheduledEvents: ScheduledEvent[];
  newAlerts: DgaAlert[];
  newCommunications: DGACommunication[];
  updatedRelationships: CaseRelationship[];
  newActivityItems: AgencyActivityItem[];
}

export function evaluateTaskCompletionReaction(
  dgaCase: DGACase,
  completedTask: Task,
  _allCases: DGACase[]
): ReactionOutput {
  const output: ReactionOutput = {
    newScheduledEvents: [],
    newAlerts: [],
    newCommunications: [],
    updatedRelationships: [],
    newActivityItems: []
  };

  const now = new Date().toISOString();

  // Activity feed entry
  output.newActivityItems.push({
    id: `ACT-${Date.now()}`,
    timestamp: now,
    system: dgaCase.leadSystem,
    headline: `Directive Completed on ${dgaCase.id}`,
    details: completedTask.title,
    caseId: dgaCase.id,
    priority: dgaCase.priority
  });

  // Reaction 1: If player submitted Vance blood or evidence to TRACE
  if (!hasEmbassyScenario(dgaCase)) return output;
  if (
    completedTask.id === 'TSK-194-02' ||
    completedTask.title.toLowerCase().includes('trace') ||
    completedTask.description.toLowerCase().includes('trace')
  ) {
    // Schedule TRACE laboratory result in 45 seconds
    output.newScheduledEvents.push(
      createScheduledEvent(
        'LAB_RESULT_READY',
        45,
        {
          caseId: dgaCase.id,
          specimenTitle: 'Vance Blood Specimen 412-A',
          resultSummary: 'Mass spectrometry confirms novel fluorophosphate ester. Synthetic batch markers match Phoenix Biotech diverted precursors.',
          traceCaseId: dgaCase.linkedTraceCaseId || 'FS-2026-04422'
        },
        dgaCase.id,
        'TRACE'
      )
    );

    output.newAlerts.push({
      id: `ALT-SCHED-${Date.now()}`,
      level: 'INFO',
      title: 'TRACE PROTOCOL QUEUED',
      message: `Specimens from Case ${dgaCase.id} queued for mass spectrometry. Results anticipated in ~45 seconds.`,
      source: 'TRACE FORENSIC SUITE',
      timestamp: now,
      caseId: dgaCase.id
    });
  }

  // Reaction 2: If Dr. Thorne interview completed
  if (
    completedTask.id === 'TSK-194-01' ||
    completedTask.title.toLowerCase().includes('extract') ||
    completedTask.title.toLowerCase().includes('interview')
  ) {
    // Schedule Dr. Thorne follow-up message in 30 seconds
    output.newScheduledEvents.push(
      createScheduledEvent(
        'NPC_EMAIL',
        30,
        {
          sender: 'Dr. Gregory Thorne (St. Jude Metro)',
          subject: 'FOLLOW-UP: Vance Pupillary Reaction Anomaly',
          body: `Agent Jerome,\n\nI re-examined Ambassador Vance five minutes ago. The pupillary response remains non-reactive to intense light. This confirms direct receptor alkylation.\n\nKeep me updated on the mass spectrometry results as soon as TRACE completes the run.\n\nDr. Thorne`,
          priority: 'Priority',
          classification: 'SECRET // NOFORN'
        },
        dgaCase.id,
        'NPC-THORNE'
      )
    );
  }

  return output;
}

export function evaluateScheduledEventExecution(
  event: ScheduledEvent,
  _dgaCase?: DGACase
): {
  alerts: DgaAlert[];
  communications: DGACommunication[];
  activityItems: AgencyActivityItem[];
} {
  const now = new Date().toISOString();
  const alerts: DgaAlert[] = [];
  const communications: DGACommunication[] = [];
  const activityItems: AgencyActivityItem[] = [];
  if (!canRunScheduledEvent(event, _dgaCase)) return { alerts, communications, activityItems };

  switch (event.type) {
    case 'LAB_RESULT_READY': {
      const payload = event.payload as any;
      alerts.push({
        id: `ALT-RES-${Date.now()}`,
        level: 'FLASH',
        title: `TRACE LAB RESULT AVAILABLE // ${payload.caseId || 'CASE'}`,
        message: payload.resultSummary || 'Laboratory examination complete.',
        source: 'TRACE FORENSICS',
        timestamp: now,
        actionRequired: true,
        caseId: payload.caseId
      });

      activityItems.push({
        id: `ACT-RES-${Date.now()}`,
        timestamp: now,
        system: 'TRACE',
        headline: `Forensic Findings Available (${payload.caseId})`,
        details: payload.resultSummary || 'Spectroscopy run complete.',
        caseId: payload.caseId,
        priority: 'Critical'
      });
      break;
    }

    case 'NPC_EMAIL': {
      const payload = event.payload as any;
      communications.push({
        id: `CABLE-NPC-${Date.now().toString().slice(-4)}`,
        sender: payload.sender || 'Directorate Desk',
        recipient: 'Special Agent Miracle Jerome [HQ-04]',
        subject: payload.subject || 'Follow-up regarding ongoing operations',
        body: payload.body || 'Dispatched report.',
        timestamp: now,
        read: false,
        priority: payload.priority || 'Priority',
        classification: payload.classification || 'SECRET // NOFORN',
        threadId: `TH-${Date.now().toString().slice(-4)}`,
        caseId: event.caseId
      });

      alerts.push({
        id: `ALT-COMM-${Date.now()}`,
        level: 'INFO',
        title: `NEW CABLE: ${payload.sender?.split(' ')[0] || 'INCOMING'}`,
        message: payload.subject || 'Incoming dispatch received.',
        source: 'SATELLITE COMMS',
        timestamp: now,
        caseId: event.caseId
      });

      activityItems.push({
        id: `ACT-COMM-${Date.now()}`,
        timestamp: now,
        system: 'COMMS',
        headline: `Encrypted Cable Received`,
        details: payload.subject,
        caseId: event.caseId
      });
      break;
    }

    case 'INTELLIGENCE_UPDATE': {
      const payload = event.payload as any;
      alerts.push({
        id: `ALT-INT-${Date.now()}`,
        level: 'FLASH',
        title: 'ORACLE INTELLIGENCE BULLETIN',
        message: payload.summary || 'Geopolitical surveillance update.',
        source: 'ORACLE INTEL',
        timestamp: now,
        caseId: event.caseId
      });

      activityItems.push({
        id: `ACT-INT-${Date.now()}`,
        timestamp: now,
        system: 'ORACLE',
        headline: 'Satellite Intercept Logged',
        details: payload.summary || 'Signals telemetry matched.',
        caseId: event.caseId
      });
      break;
    }

    default:
      break;
  }

  return { alerts, communications, activityItems };
}
