// Cross-Case Linking Engine for TRACE & DGAOS
// Powers the crossover between Medical, Investigation, Intelligence, and Government branches

import { DGACase } from './dga-types';
import { getDGAState } from './dga-store';
import { emitDgaEvent } from './dga-events';

export interface CrossLinkResult {
  success: boolean;
  message: string;
  sourceCaseId: string;
  targetCaseId: string;
  newCaseCreated?: boolean;
}

/**
 * Escalate a medical case (e.g. MED-2026-0188) to a criminal homicide investigation (INV-2026-0417)
 */
export async function escalateMedicalCaseToInvestigation(
  medicalCaseId: string,
  reason: string = 'Suspicious death following acute organophosphate poisoning'
): Promise<CrossLinkResult> {
  const state = getDGAState();
  const medicalCase = state.cases.find((c) => c.id === medicalCaseId);

  if (!medicalCase) {
    return {
      success: false,
      message: `Medical case ${medicalCaseId} not found in agency docket.`,
      sourceCaseId: medicalCaseId,
      targetCaseId: '',
    };
  }

  const targetCaseId = 'INV-2026-0417';
  let targetCase = state.cases.find((c) => c.id === targetCaseId);

  // Link both cases in memory and emit event
  const now = new Date().toISOString();

  // Add timeline event to medical case
  medicalCase.timeline.unshift({
    id: `TL-MED-ESC-${Date.now()}`,
    timestamp: now,
    type: 'STATUS_CHANGED',
    actor: 'Dr. Emily Mercer, MD [Attending ICU / Medical Examiner]',
    description: `CASE ESCALATION: Patient declared deceased / lethal neurotoxin confirmed. Criminal homicide investigation docket ${targetCaseId} officially spawned.`,
  });

  // Ensure targetCase exists
  if (targetCase) {
    targetCase.timeline.unshift({
      id: `TL-INV-LINK-${Date.now()}`,
      timestamp: now,
      type: 'CASE_OPENED',
      actor: 'Special Agent Miracle Jerome [HQ-04]',
      description: `Homicide investigation activated from medical chart ${medicalCaseId}. Forensic specimens EV-417-A through EV-417-D transferred to Evidence Vault under chain of custody.`,
    });

    targetCase.status = 'Active';
  }

  emitDgaEvent({
    type: 'SYSTEM_CASE_UPDATED',
    actor: 'MEDSTAT',
    caseId: medicalCaseId,
    payload: {
      source: 'MEDSTAT',
      target: 'TRACE',
      refId: targetCaseId,
      summary: `Cross-Department Escalation: Medical Case ${medicalCaseId} -> Criminal Investigation ${targetCaseId}`,
    },
  });

  // Also emit agency alert
  state.alerts.unshift({
    id: `ALT-ESC-${Date.now()}`,
    level: 'CRITICAL',
    title: 'HOMICIDE ESCALATION // DOCKET CROSSOVER ACTIVATED',
    message: `${medicalCase.title} escalated to Criminal Investigation ${targetCaseId}. Medical records, tox specimens, and CCTV footage linked.`,
    source: 'ST. JUDE METRO ICU / TRACE MORGUE',
    timestamp: now,
    actionRequired: true,
    caseId: targetCaseId,
  });

  return {
    success: true,
    message: `Medical Case ${medicalCaseId} successfully escalated! Criminal Homicide Docket ${targetCaseId} is now active and cross-linked.`,
    sourceCaseId: medicalCaseId,
    targetCaseId: targetCaseId,
    newCaseCreated: !targetCase,
  };
}

/**
 * Generate an intelligence operation lead (INT-2026-0941) from a criminal investigation (INV-2026-0417)
 */
export async function generateIntelligenceLeadFromInvestigation(
  investigationCaseId: string,
  leadDetails: string = 'Suspect vehicle 7XYZ89 tied to Phoenix Biotech harbor logistics shell'
): Promise<CrossLinkResult> {
  const state = getDGAState();
  const invCase = state.cases.find((c) => c.id === investigationCaseId);

  if (!invCase) {
    return {
      success: false,
      message: `Investigation case ${investigationCaseId} not found.`,
      sourceCaseId: investigationCaseId,
      targetCaseId: '',
    };
  }

  const targetCaseId = 'INT-2026-0941';
  const targetCase = state.cases.find((c) => c.id === targetCaseId);
  const now = new Date().toISOString();

  invCase.timeline.unshift({
    id: `TL-INT-LEAD-${Date.now()}`,
    timestamp: now,
    type: 'SYSTEM_LINKED',
    actor: 'Agent Yumi Tanaka & Analyst Marcus Chen',
    description: `Intelligence Lead Generated: Vehicle license plate 7XYZ89 linked to clandestine organophosphate broker Viktor Krell. Operation ${targetCaseId} initialized.`,
  });

  if (targetCase) {
    targetCase.status = 'Active';
    targetCase.timeline.unshift({
      id: `TL-INT-INIT-${Date.now()}`,
      timestamp: now,
      type: 'CASE_OPENED',
      actor: 'Directorate Intelligence Watch',
      description: `Covert operations docket opened from criminal investigation ${investigationCaseId}. Priority maritime interdiction against M/V Phoenix Dawn at Pier 42.`,
    });
  }

  emitDgaEvent({
    type: 'SYSTEM_CASE_UPDATED',
    actor: 'TRACE',
    caseId: investigationCaseId,
    payload: {
      source: 'TRACE',
      target: 'CIPHER',
      refId: targetCaseId,
      summary: `Cross-Department Lead: Investigation ${investigationCaseId} -> Intelligence Operation ${targetCaseId}`,
    },
  });

  state.alerts.unshift({
    id: `ALT-INT-${Date.now()}`,
    level: 'FLASH',
    title: 'INTELLIGENCE OPERATION ACTIVATED // OPERATION BLACK SENTRY',
    message: `Intelligence Docket ${targetCaseId} initiated from CCTV & ALPR hits. Satellite surveillance tasked to Pier 42.`,
    source: 'ORACLE / SIGINT WATCH',
    timestamp: now,
    actionRequired: true,
    caseId: targetCaseId,
  });

  return {
    success: true,
    message: `Intelligence Lead generated! Operation Black Sentry (${targetCaseId}) is active and cross-linked.`,
    sourceCaseId: investigationCaseId,
    targetCaseId: targetCaseId,
  };
}

/**
 * Trigger an Executive Government Briefing (GOV-2026-0052) from an intelligence operation
 */
export async function triggerGovernmentBriefingFromIntel(
  intelCaseId: string
): Promise<CrossLinkResult> {
  const state = getDGAState();
  const intelCase = state.cases.find((c) => c.id === intelCaseId);

  if (!intelCase) {
    return {
      success: false,
      message: `Intelligence case ${intelCaseId} not found.`,
      sourceCaseId: intelCaseId,
      targetCaseId: '',
    };
  }

  const targetCaseId = 'GOV-2026-0052';
  const targetCase = state.cases.find((c) => c.id === targetCaseId);
  const now = new Date().toISOString();

  intelCase.timeline.unshift({
    id: `TL-GOV-BRIEF-${Date.now()}`,
    timestamp: now,
    type: 'SYSTEM_LINKED',
    actor: 'Director Donald Sterling',
    description: `Executive Briefing Triggered: Intercepted sat-com comms and hazardous materials loading escalated to National Security Council (Docket ${targetCaseId}).`,
  });

  if (targetCase) {
    targetCase.status = 'Active';
    targetCase.timeline.unshift({
      id: `TL-GOV-INIT-${Date.now()}`,
      timestamp: now,
      type: 'CASE_OPENED',
      actor: 'Executive Office of the President',
      description: `Presidential Directive & Emergency Cabinet Session convened. Legal warrant authorizations and biosecurity protocols awaiting operator decision.`,
    });
  }

  emitDgaEvent({
    type: 'SYSTEM_CASE_UPDATED',
    actor: 'CIPHER',
    caseId: intelCaseId,
    payload: {
      source: 'CIPHER',
      target: 'AEGIS',
      refId: targetCaseId,
      summary: `Cross-Department Escalation: Intelligence ${intelCaseId} -> Government Briefing ${targetCaseId}`,
    },
  });

  state.alerts.unshift({
    id: `ALT-GOV-${Date.now()}`,
    level: 'CRITICAL',
    title: 'NATIONAL SECURITY DIRECTIVE // CABINET DECISION REQUIRED',
    message: `Executive Docket ${targetCaseId} requires policy authorization on Pier 42 maritime interdiction and diplomatic quarantine.`,
    source: 'EXECUTIVE OFFICE / NSC',
    timestamp: now,
    actionRequired: true,
    caseId: targetCaseId,
  });

  return {
    success: true,
    message: `Government Briefing & Cabinet Directive ${targetCaseId} initialized and cross-linked.`,
    sourceCaseId: intelCaseId,
    targetCaseId: targetCaseId,
  };
}
