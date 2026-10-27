import {
  DGAState,
  ScheduledEvent,
  AgencyActivityItem,
  DgaAlert,
  DGACommunication
} from '@/lib/dga-types';
import { getCurrentTimeState, calculateOfflineGap } from './time-engine';
import { filterDueEvents } from './scheduler';
import { evaluateScheduledEventExecution } from './reaction-engine';
import { generateContextualMessage } from './message-generator';
import type { DGAEventInput } from '@/lib/dga-events';
import { completeDueSystemRequest, completeLegacyForensicMirror } from '@/lib/systems/system-state';
import { canRunScheduledEvent, hasEmbassyScenario } from './scenario-scope';

export interface SimulationTickResult {
  updatedState: DGAState;
  hasChanges: boolean;
  /** Bus events to emit after the caller has committed updatedState. */
  events: DGAEventInput[];
}

function resolveSystemRequests(state: DGAState, dueEvents: ScheduledEvent[]): DGAEventInput[] {
  const events: DGAEventInput[] = [];
  for (const evt of dueEvents) {
    if (evt.type === 'SYSTEM_REQUEST_DUE') events.push(...completeDueSystemRequest(state, evt).events);
  }
  return events;
}

export function processSimulationTick(state: DGAState): SimulationTickResult {
  const now = new Date();
  const timeState = getCurrentTimeState(state.session.startTime);

  // If paused, only update current clock
  if (state.simulation.status === 'paused') {
    return {
      updatedState: {
        ...state,
        simulation: {
          ...state.simulation,
          currentTime: timeState.realTime,
          lastProcessedAt: now.toISOString()
        }
      },
      hasChanges: false,
      events: []
    };
  }

  const events: DGAEventInput[] = [];

  let hasChanges = false;
  let updatedAlerts = [...state.alerts];
  let updatedComms = [...state.communications];
  let updatedActivity = [...state.agencyActivityFeed];
  const updatedCases = [...state.cases];

  // 1. Process Due Scheduled Events
  const { due, remaining } = filterDueEvents(state.scheduledEvents, now.getTime());

  if (due.length > 0) {
    hasChanges = true;
    for (const dueEvt of due) {
      const targetCase = updatedCases.find((c) => c.id === dueEvt.caseId);
      if (!canRunScheduledEvent(dueEvt, targetCase)) continue;
      const execution = evaluateScheduledEventExecution(dueEvt, targetCase);

      if (execution.alerts.length > 0) updatedAlerts = [...execution.alerts, ...updatedAlerts];
      if (execution.communications.length > 0) updatedComms = [...execution.communications, ...updatedComms];
      if (execution.activityItems.length > 0) updatedActivity = [...execution.activityItems, ...updatedActivity];

      // If lab result, update case forensic request and timeline
      if (dueEvt.type === 'LAB_RESULT_READY' && targetCase) {
        const payload = dueEvt.payload as any;
        targetCase.linkedTraceCaseId = payload.traceCaseId || 'FS-2026-04422';
        targetCase.timeline.unshift({
          id: `TL-LAB-${Date.now()}`,
          timestamp: now.toISOString(),
          type: 'FORENSIC_RESULT',
          actor: 'TRACE Forensic Laboratory',
          description: payload.resultSummary || 'Laboratory finding confirmed.'
        });

        // Complete any pending forensic requests on case
        if (targetCase.forensicRequests.length > 0) {
          targetCase.forensicRequests[0].status = 'Completed';
          targetCase.forensicRequests[0].resultSummary = payload.resultSummary;
          targetCase.forensicRequests[0].completedAt = now.toISOString();
          events.push(
            ...completeLegacyForensicMirror(state, targetCase.forensicRequests[0].id, payload.resultSummary || '').events
          );
        }
      }
    }
  }

  // 2. Ambient Agency Activity Generator (Rate controlled by activityLevel)
  const activityIntervals = {
    low: 180, // ~every 3 min
    normal: 60, // ~every 1 min
    high: 25 // ~every 25 sec
  };

  const intervalSec = activityIntervals[state.simulation.activityLevel] || 60;
  const lastProc = new Date(state.simulation.lastProcessedAt || now).getTime();
  const timeSinceLastSec = (now.getTime() - lastProc) / 1000;

  if (timeSinceLastSec >= intervalSec) {
    hasChanges = true;
    const ambientActivities: AgencyActivityItem[] = [
      {
        id: `ACT-AMB-${Date.now()}-1`,
        timestamp: now.toISOString(),
        system: 'SHIELD',
        headline: 'Homeland Border Patrol Shift Handover Complete',
        details: 'Sector 4 checkpoints report normal operational volume.'
      },
      {
        id: `ACT-AMB-${Date.now()}-2`,
        timestamp: now.toISOString(),
        system: 'EYES',
        headline: 'Satellite Alpha-9 Orbital Sweep Completed',
        details: 'No anomalous maritime vessel movements recorded in sector.'
      },
      {
        id: `ACT-AMB-${Date.now()}-3`,
        timestamp: now.toISOString(),
        system: 'MEDSTAT',
        headline: 'Regional Hospital Surveillance Update',
        details: 'Emergency department triage trends remain within baseline limits.'
      },
      {
        id: `ACT-AMB-${Date.now()}-4`,
        timestamp: now.toISOString(),
        system: 'CIPHER',
        headline: 'Automated Cryptanalysis Routine Completed',
        details: 'Boundary firewall telemetry synchronized with national threat feed.'
      }
    ];

    const chosen = ambientActivities[Math.floor(Math.random() * ambientActivities.length)];
    updatedActivity.unshift(chosen);

    // Keep activity feed to max 40 items
    if (updatedActivity.length > 40) {
      updatedActivity = updatedActivity.slice(0, 40);
    }
  }

  // 3. Dynamic Case State Progression (Living World Simulation for Active Cases)
  let newUnacknowledgedEvents = 0;
  const activeCase = updatedCases.find((c) => hasEmbassyScenario(c) && (c.status === 'Active' || c.status === 'ACTIVE'));

  if (activeCase) {
    activeCase.customFields = activeCase.customFields || {};
    const ticks = ((activeCase.customFields._simTickCount as number) || 0) + 1;
    activeCase.customFields._simTickCount = ticks;
    const triggered = typeof activeCase.customFields._simEventsTriggered === 'string'
      ? activeCase.customFields._simEventsTriggered.split(',').filter(Boolean)
      : [];

    // 1. Witness becomes unavailable (tick >= 3, ~12s)
    if (ticks >= 3 && !triggered.includes('WITNESS_UNAVAILABLE')) {
      triggered.push('WITNESS_UNAVAILABLE');
      hasChanges = true;
      newUnacknowledgedEvents += 1;

      const thorne = activeCase.people?.find((p) => p.name.includes('Thorne'));
      if (thorne) thorne.status = 'UNAVAILABLE';

      updatedAlerts.unshift({
        id: `ALT-SIM-${Date.now()}-WITNESS`,
        level: 'ROUTINE',
        title: 'WITNESS STATUS: Dr. Gregory Thorne Unavailable',
        message: 'Attending toxicologist paged to emergency trauma resuscitation at St. Jude Metro. Interrogation suspended.',
        source: 'ST. JUDE METRO ICU',
        timestamp: now.toISOString(),
        actionRequired: false,
        caseId: activeCase.id
      });

      updatedActivity.unshift({
        id: `ACT-SIM-${Date.now()}-WITNESS`,
        timestamp: now.toISOString(),
        system: 'MEDSTAT',
        headline: 'Witness Unavailable: Dr. Thorne Paged to Emergency ICU',
        details: 'Dr. Gregory Thorne unavailable for direct interview due to critical resuscitation.',
        caseId: activeCase.id
      });
    }

    // 2. CCTV retention deadline approaches (tick >= 6, ~24s)
    if (ticks >= 6 && !triggered.includes('CCTV_RETENTION_DEADLINE')) {
      triggered.push('CCTV_RETENTION_DEADLINE');
      hasChanges = true;
      newUnacknowledgedEvents += 1;

      updatedAlerts.unshift({
        id: `ALT-SIM-${Date.now()}-CCTV`,
        level: 'FLASH',
        title: 'EVIDENCE WARNING: CCTV Buffer Retention Deadline Approaching',
        message: 'Embassy Row 48-hour cyclical overwrite cycle initiating. Formal evidentiary preservation warrant must be verified within 45 game minutes.',
        source: 'CIVITAS SURVEILLANCE NODE',
        timestamp: now.toISOString(),
        actionRequired: true,
        caseId: activeCase.id
      });

      updatedActivity.unshift({
        id: `ACT-SIM-${Date.now()}-CCTV`,
        timestamp: now.toISOString(),
        system: 'TRACE',
        headline: 'CCTV Retention Deadline Approaching // Embassy Row Buffer',
        details: 'Surveillance preservation window expires in 45m unless judicial warrant lock is logged.',
        caseId: activeCase.id
      });
    }

    // 3. Field team reports something (tick >= 9, ~36s)
    if (ticks >= 9 && !triggered.includes('FIELD_TEAM_REPORT')) {
      triggered.push('FIELD_TEAM_REPORT');
      hasChanges = true;
      newUnacknowledgedEvents += 1;

      const fieldMsg: DGACommunication = {
        id: `COMM-SIM-${Date.now()}-FIELD`,
        sender: 'Field Agent Callum Brody [Tactical Detail]',
        recipient: 'Special Agent Miracle Jerome [HQ-04]',
        subject: 'FIELD REPORT: Secondary Search - Embassy Service Alley',
        body: 'Agent Jerome,\n\nOur sweeps team recovered a shattered amber reagent vial near the service freight elevator. Traces of solvent odor detected. Evidence bagged and en route to TRACE depository.\n\n-- Brody',
        timestamp: now.toISOString(),
        read: false,
        status: 'UNREAD',
        priority: 'Priority',
        classification: 'SECRET // NOFORN',
        threadId: 'TH-FIELD-01',
        caseId: activeCase.id
      };
      updatedComms.unshift(fieldMsg);

      updatedActivity.unshift({
        id: `ACT-SIM-${Date.now()}-FIELD`,
        timestamp: now.toISOString(),
        system: 'CIVITAS',
        headline: 'Field Team Report: Chemical Residue Located',
        details: 'Agent Brody secured shattered reagent vial from Embassy freight alley.',
        caseId: activeCase.id
      });
    }

    // 4. Agency sends a reminder (tick >= 12, ~48s)
    if (ticks >= 12 && !triggered.includes('AGENCY_REMINDER')) {
      triggered.push('AGENCY_REMINDER');
      hasChanges = true;
      newUnacknowledgedEvents += 1;

      const reminderMsg: DGACommunication = {
        id: `COMM-SIM-${Date.now()}-REMINDER`,
        sender: 'Office of Deputy Director - E. Cross',
        recipient: 'Special Agent Miracle Jerome [HQ-04]',
        subject: 'DIRECTIVE: Inter-Agency Briefing & Preliminary Findings Requisition',
        body: 'Special Agent Jerome,\n\nState Department and National Security Council have scheduled an inter-agency briefing. Ensure TRACE mass spectrometry preliminary findings are compiled on Docket DGA-26-194 immediately.\n\n-- Evelyn Cross',
        timestamp: now.toISOString(),
        read: false,
        status: 'ACTION REQUIRED',
        priority: 'Flash / Immediate',
        classification: 'TOP SECRET // NOFORN',
        threadId: 'TH-REMIND-01',
        caseId: activeCase.id
      };
      updatedComms.unshift(reminderMsg);

      updatedAlerts.unshift({
        id: `ALT-SIM-${Date.now()}-REMINDER`,
        level: 'FLASH',
        title: 'AGENCY DIRECTIVE: Preliminary Case Briefing Scheduled',
        message: 'Deputy Director Cross requires preliminary spectroscopy findings for Cabinet briefing.',
        source: 'EXECUTIVE COMMAND',
        timestamp: now.toISOString(),
        actionRequired: true,
        caseId: activeCase.id
      });

      updatedActivity.unshift({
        id: `ACT-SIM-${Date.now()}-REMINDER`,
        timestamp: now.toISOString(),
        system: 'COMMS',
        headline: 'Compliance Notice: Executive Briefing Requisition',
        details: 'Deputy Director Cross issued directive for preliminary findings report on Case DGA-26-194.',
        caseId: activeCase.id
      });
    }

    // 5. Forensic request advances to IN PROGRESS (tick >= 15, ~60s)
    if (ticks >= 15 && !triggered.includes('LAB_IN_PROGRESS')) {
      triggered.push('LAB_IN_PROGRESS');
      hasChanges = true;
      newUnacknowledgedEvents += 1;

      if (activeCase.forensicRequests && activeCase.forensicRequests.length > 0) {
        const req = activeCase.forensicRequests[0];
        if (req.status === 'QUEUED' || req.status === 'Pending' || req.status === 'SUBMITTED') {
          req.status = 'IN PROGRESS';
        }
      }

      activeCase.timeline.unshift({
        id: `TL-SIM-${Date.now()}-REQ`,
        timestamp: now.toISOString(),
        type: 'SYSTEM_UPDATE',
        actor: 'TRACE Forensic Laboratory',
        description: 'Spectrometry instrument batch loaded: High-Resolution LC-MS in progress.'
      });

      updatedActivity.unshift({
        id: `ACT-SIM-${Date.now()}-LAB-PROG`,
        timestamp: now.toISOString(),
        system: 'TRACE',
        headline: 'TRACE Bench: Mass Spectrometry In Progress',
        details: 'High-Resolution LC-MS run started for specimen EV-194-A.',
        caseId: activeCase.id
      });
    }

    // 6. Suspect crosses a border (tick >= 18, ~72s)
    if (ticks >= 18 && !triggered.includes('SUSPECT_BORDER')) {
      triggered.push('SUSPECT_BORDER');
      hasChanges = true;
      newUnacknowledgedEvents += 1;

      updatedAlerts.unshift({
        id: `ALT-SIM-${Date.now()}-BORDER`,
        level: 'CRITICAL',
        title: 'BORDER TELEMETRY: High-Value Target Vector Detected',
        message: 'Border telemetry alert: Target Viktor Krell manifested on private aviation flight departing Sector 7 toward international maritime jurisdiction.',
        source: 'SHIELD BORDER TELEMETRY',
        timestamp: now.toISOString(),
        actionRequired: true,
        caseId: activeCase.id
      });

      updatedActivity.unshift({
        id: `ACT-SIM-${Date.now()}-BORDER`,
        timestamp: now.toISOString(),
        system: 'SHIELD',
        headline: 'Border Interdiction: Viktor Krell Departure Flagged',
        details: 'Subject Krell detected via automated biometric e-gate. Interpol red notice queued.',
        caseId: activeCase.id
      });
    }

    // 7. Lab finishes analysis (tick >= 22, ~88s)
    if (ticks >= 22 && !triggered.includes('LAB_COMPLETE')) {
      triggered.push('LAB_COMPLETE');
      hasChanges = true;
      newUnacknowledgedEvents += 1;

      if (activeCase.forensicRequests && activeCase.forensicRequests.length > 0) {
        const req = activeCase.forensicRequests[0];
        req.status = 'COMPLETE';
        req.completedAt = now.toISOString();
        req.resultSummary = 'Confirmed: Novel synthetic organophosphate cholinesterase inhibitor (designated VX-94-Derivative). Molecular weight 267.3 g/mol. Synthesis pathway matches Phoenix Biotech restricted precursors.';
      }

      activeCase.linkedTraceCaseId = 'FS-2026-00421';

      activeCase.timeline.unshift({
        id: `TL-SIM-${Date.now()}-DONE`,
        timestamp: now.toISOString(),
        type: 'FORENSIC_RESULT',
        actor: 'TRACE Forensic Laboratory',
        description: 'Confirmed: Novel synthetic organophosphate cholinesterase inhibitor (designated VX-94-Derivative). Synthesis pathway matches Phoenix Biotech restricted precursors.'
      });

      const labMsg: DGACommunication = {
        id: `COMM-SIM-${Date.now()}-LAB`,
        sender: 'TRACE Forensic Laboratory - Mass Spectrometry Bench',
        recipient: 'Special Agent Miracle Jerome [HQ-04]',
        subject: 'BENCH FINDINGS: Chemical Spectroscopy Analysis - Docket DGA-26-194',
        body: 'Special Agent Jerome,\n\nSpectroscopy results for Specimen EV-194-A are complete.\n\nFINDINGS: High-affinity organophosphate cholinesterase inhibitor confirmed. Structure matches specialized nerve agent derivative. Full report and mass spectra profile attached to case dossier.\n\n-- Dr. Helen Vance, Lead Spectroscopist',
        timestamp: now.toISOString(),
        read: false,
        status: 'UNREAD',
        priority: 'Flash / Immediate',
        classification: 'TOP SECRET // NOFORN',
        threadId: 'TH-LAB-01',
        caseId: activeCase.id
      };
      updatedComms.unshift(labMsg);

      updatedAlerts.unshift({
        id: `ALT-SIM-${Date.now()}-LAB`,
        level: 'CRITICAL',
        title: 'LAB RESULT READY: Vance Biological Specimen Screening Complete',
        message: 'TRACE Mass Spectrometry completed. Identified novel organophosphate isomer matching Phoenix Biotech catalog.',
        source: 'TRACE FORENSIC SUITE',
        timestamp: now.toISOString(),
        actionRequired: true,
        caseId: activeCase.id
      });

      updatedActivity.unshift({
        id: `ACT-SIM-${Date.now()}-LAB-FINISH`,
        timestamp: now.toISOString(),
        system: 'TRACE',
        headline: 'Lab Complete: Chemical Structure Confirmed',
        details: 'High-affinity organophosphate cholinesterase inhibitor verified. Origin link established.',
        caseId: activeCase.id
      });

      // Step 4: Timer/event completes -> incoming phone call triggered from Chief Toxicologist
      events.push({
        type: 'INCOMING_CALL_TRIGGERED',
        caseId: activeCase.id,
        actor: 'Dr. Emily Mercer, MD',
        payload: {
          callerName: 'Dr. Emily Mercer, MD',
          callerTitle: 'Attending Trauma ICU & Forensic Pathologist',
          callerDepartment: 'Medical',
          callerAvatar: 'EM',
          headlineMessage: 'Urgent: Toxicological Mass Spec Findings Ready for Review',
          contactId: 'CONT-MERCER',
          caseId: activeCase.id
        }
      });
    }

    activeCase.customFields._simEventsTriggered = triggered.join(',');
  }

  // Keep activity feed to max 40 items
  if (updatedActivity.length > 40) {
    updatedActivity = updatedActivity.slice(0, 40);
  }

  const updatedState: DGAState = {
    ...state,
    cases: updatedCases,
    alerts: updatedAlerts,
    communications: updatedComms,
    scheduledEvents: remaining,
    agencyActivityFeed: updatedActivity,
    unacknowledgedSimulationEventCount: (state.unacknowledgedSimulationEventCount || 0) + newUnacknowledgedEvents,
    simulation: {
      ...state.simulation,
      currentTime: timeState.realTime,
      lastProcessedAt: now.toISOString()
    },
    session: {
      ...state.session,
      lastActiveTime: now.toISOString()
    }
  };

  events.push(...resolveSystemRequests(updatedState, due));

  return { updatedState, hasChanges, events };
}

/**
 * Evaluates offline gap and simulates what occurred while workstation was closed
 */
export function processOfflineProgression(state: DGAState): {
  updatedState: DGAState;
  offlineSummary: DGAState['simulation']['offlineEventsSummary'];
  events: DGAEventInput[];
} {
  const now = new Date();
  const gap = calculateOfflineGap(state.session.lastActiveTime || state.simulation.lastProcessedAt);

  if (!gap.isOfflineGap || state.simulation.status === 'paused') {
    return { updatedState: state, offlineSummary: null, events: [] };
  }

  const highlights: string[] = [];
  let updatedAlerts = [...state.alerts];
  let updatedComms = [...state.communications];
  let updatedActivity = [...state.agencyActivityFeed];
  let updatedEvents = [...state.scheduledEvents];

  // 1. Trigger any scheduled events that expired while offline
  const { due, remaining } = filterDueEvents(updatedEvents, now.getTime());
  updatedEvents = remaining;

  for (const dueEvt of due) {
    const targetCase = state.cases.find(c => c.id === dueEvt.caseId);
    if (!canRunScheduledEvent(dueEvt, targetCase)) continue;
    highlights.push(`Scheduled event executed: ${dueEvt.type.replace('_', ' ')}`);
    const execution = evaluateScheduledEventExecution(dueEvt, targetCase);
    updatedAlerts = [...execution.alerts, ...updatedAlerts];
    updatedComms = [...execution.communications, ...updatedComms];
    updatedActivity = [...execution.activityItems, ...updatedActivity];
  }

  // 2. Generate plausible offline agency dispatches
  highlights.push('TRACE Forensic Laboratory routine batch verification completed.');
  highlights.push('ORACLE satellite orbital pass cataloged 2 new maritime telemetry logs.');

  const offlineSummary = {
    elapsedMs: gap.elapsedMs,
    elapsedFormatted: gap.elapsedFormatted,
    eventsCount: highlights.length,
    highlights
  };

  const updatedState: DGAState = {
    ...state,
    alerts: updatedAlerts,
    communications: updatedComms,
    scheduledEvents: updatedEvents,
    agencyActivityFeed: updatedActivity,
    simulation: {
      ...state.simulation,
      lastProcessedAt: now.toISOString(),
      offlineEventsSummary: offlineSummary
    },
    session: {
      ...state.session,
      lastActiveTime: now.toISOString()
    }
  };

  const events = resolveSystemRequests(updatedState, due);

  return { updatedState, offlineSummary, events };
}
