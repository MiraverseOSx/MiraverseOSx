import { CaseDecision, TimelineEvent, DgaAlert } from '@/lib/dga-types';
import { createScheduledEvent } from './scheduler';

export interface ConsequenceResult {
  timelineEvents: TimelineEvent[];
  alerts: DgaAlert[];
  scheduledEvents: ReturnType<typeof createScheduledEvent>[];
}

export function evaluateDecisionConsequences(
  decision: CaseDecision,
  chosenOptionId: string,
  actorName: string
): ConsequenceResult {
  const option = decision.options.find((o) => o.id === chosenOptionId) || decision.options[0];
  const now = new Date().toISOString();

  const timelineEvents: TimelineEvent[] = [
    {
      id: `TL-DEC-${Date.now()}`,
      timestamp: now,
      type: 'NOTE_ADDED',
      actor: actorName,
      description: `EXECUTIVE DECISION: [${option.label}] — ${option.description}`
    }
  ];

  const alerts: DgaAlert[] = [];
  const scheduledEvents: ReturnType<typeof createScheduledEvent>[] = [];

  // Generate immediate timeline effects
  option.consequences.forEach((cText, i) => {
    timelineEvents.push({
      id: `TL-EFF-${Date.now()}-${i}`,
      timestamp: now,
      type: 'STATUS_CHANGED',
      actor: 'DGA Consequence Engine',
      description: `Operational Effect: ${cText}`
    });
  });

  // If critical option, generate alert and schedule downstream reaction
  if (chosenOptionId.toLowerCase().includes('evacuate') || chosenOptionId.toLowerCase().includes('intervene')) {
    alerts.push({
      id: `ALT-DEC-${Date.now()}`,
      level: 'FLASH',
      title: `DIRECTORATE ACTION: ${option.label.toUpperCase()}`,
      message: `Downstream directives initiated for Case ${decision.caseId}. ${option.description}`,
      source: 'EXECUTIVE DISPATCH',
      timestamp: now,
      actionRequired: false,
      caseId: decision.caseId
    });

    // Schedule delayed diplomatic follow-up in 90 seconds
    scheduledEvents.push(
      createScheduledEvent(
        'NPC_EMAIL',
        90,
        {
          sender: 'Director Evelyn Cross',
          subject: `ACTION REVIEW: Decision regarding Case ${decision.caseId}`,
          body: `Agent Jerome,\n\nThe executive committee has acknowledged your decision: "${option.label}".\n\nEnsure all field telemetry is preserved for congressional liaison.`,
          priority: 'Priority',
          classification: 'SECRET // NOFORN'
        },
        decision.caseId,
        'NPC-CROSS'
      )
    );
  }

  return { timelineEvents, alerts, scheduledEvents };
}
