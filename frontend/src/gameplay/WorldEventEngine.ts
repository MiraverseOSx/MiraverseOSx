/**
 * MIRAVERSE OS x — Shared World-Event & Narrative Memory Engine
 * Coordinates the Three Gameplay Pillars across all OS applications:
 *  - Pillar I: Living-World Simulation (HOMECRAFT, WORKNET, Faith Medical, VITALS, Finance)
 *  - Pillar II: Story-Driven RPG (Mai.space, COMMS, Factions, NPC Narrative Memory)
 *  - Pillar III: Medical & Forensic Investigations (DGAOS, TRACE, Faith Medical, Citizen Bridge)
 */

export type WorldEventCategory =
  | 'medical'
  | 'forensic'
  | 'worknet'
  | 'social'
  | 'housing'
  | 'veil'
  | 'archive'
  | 'civic';

export interface WorldNarrativeEvent {
  id: string;
  category: WorldEventCategory;
  title: string;
  summary: string;
  institution: string;
  citizenMaid?: string;
  cycle: number;
  timestamp: string;
  tags: string[];
  impact?: {
    corruptionDelta?: number;
    reputationTrack?: string;
    reputationDelta?: number;
    npcId?: string;
    npcTrustDelta?: number;
  };
}

export interface CaseEvidenceItem {
  id: string;
  label: string;
  sourceApp: string;
  detail: string;
}

export interface CaseHypothesisOption {
  id: string;
  title: string;
  explanation: string;
  isValidated: boolean;
}

export interface InvestigationCaseDefinition {
  id: string;
  title: string;
  subjectMaid: string;
  subjectName: string;
  institution: 'Faith Medical & TRACE' | 'DGAOS & WorkNet' | 'Cyacademy & Archive';
  symptomOrAnomaly: string;
  availableEvidence: CaseEvidenceItem[];
  requiredEvidenceIds: string[];
  hypotheses: CaseHypothesisOption[];
  rewardCredits: number;
  rewardBits: number;
  rewardXP: number;
  reputationTrack: string;
}

export const FORMAL_INVESTIGATION_CASES: InvestigationCaseDefinition[] = [
  {
    id: 'CASE-FM-401',
    title: 'Sub-Conduit Veilwilt Cluster & Bio-Aura Desync',
    subjectMaid: 'MAID-OR-00481926',
    subjectName: 'Elara Vale',
    institution: 'Faith Medical & TRACE',
    symptomOrAnomaly: 'Patient exhibits acute Veilwilt resonance drop (62% Harmonic) following Old Factory Ward transit.',
    availableEvidence: [
      { id: 'ev-aura-scan', label: 'Faith Medical Bio-Aura Scan (#FM-88392)', sourceApp: 'Faith Medical / VITALS', detail: 'Confirms 88.2 MHz harmonic phase inversion in dermal nodes.' },
      { id: 'ev-prism-pid512', label: 'Process Monitor PID 512 Telemetry', sourceApp: 'Process Monitor', detail: 'Shows unregistered PRISM memory bleed leaking into Sub-Conduit relay.' },
      { id: 'ev-cafeteria-log', label: 'Cafeteria Synth-Juice Supply Manifest', sourceApp: 'Mai.space Bulletin', detail: 'Benign coolant swap prank; unrelated to neural aura phase inversion.' },
    ],
    requiredEvidenceIds: ['ev-aura-scan', 'ev-prism-pid512'],
    hypotheses: [
      {
        id: 'hyp-coolant',
        title: 'Dietary Cryo-Coolant Contamination',
        explanation: 'Symptoms caused by contaminated cafeteria beverages in Cyacademy.',
        isValidated: false,
      },
      {
        id: 'hyp-prism-bleed',
        title: 'Sub-Conduit PRISM Frequency Bleed (PID 512)',
        explanation: 'Unshielded 88.2 MHz PRISM sub-conduit memory hook is inducing Veilwilt phase inversion in nearby citizens.',
        isValidated: true,
      },
      {
        id: 'hyp-dorm-fatigue',
        title: 'Standard Academic Sleep Deprivation',
        explanation: 'Routine exhaustion from Syntax coursework with no external vector.',
        isValidated: false,
      },
    ],
    rewardCredits: 350,
    rewardBits: 5,
    rewardXP: 200,
    reputationTrack: 'faith',
  },
  {
    id: 'CASE-DGA-402',
    title: 'AETHERCORE Pre-Collapse Registry Tampering',
    subjectMaid: 'MAID-KA-00194022',
    subjectName: 'Kaelen Voss',
    institution: 'DGAOS & WorkNet',
    symptomOrAnomaly: 'Anomalous Year-0 kernel thread (PID 660) attempting to rewrite sealed Orynvell lineage records.',
    availableEvidence: [
      { id: 'ev-aethercore-sys', label: 'AETHERCORE.sys Kernel Driver', sourceApp: 'File Explorer (/system)', detail: 'Contains pre-code reality translation hooks dating prior to municipal founding.' },
      { id: 'ev-purge-arch', label: 'Purge_Record_01.arch Manuscript', sourceApp: 'File Explorer (/documents)', detail: 'Documents Lightborn genealogy erasure under Directive 14-B.' },
      { id: 'ev-shipping-manifest', label: 'CargoTrack Manifest #CG-8821', sourceApp: 'Shipping Portal', detail: 'Routine unrefined mana crystal shipment to Sector 3 Warehouse.' },
    ],
    requiredEvidenceIds: ['ev-aethercore-sys', 'ev-purge-arch'],
    hypotheses: [
      {
        id: 'hyp-smuggling',
        title: 'Commercial Mana Crystal Tariff Evasion',
        explanation: 'Routine logistics discrepancy in Sector 3 warehouse.',
        isValidated: false,
      },
      {
        id: 'hyp-aethercore-echo',
        title: 'Autonomous AETHERCORE Lineage Restoration Protocol',
        explanation: 'Erased pre-Collapse AETHERCORE kernel is cross-referencing Purge archives to restore suppressed Lightborn citizen records.',
        isValidated: true,
      },
      {
        id: 'hyp-hardware-fault',
        title: 'Random CMOS Clock Drift',
        explanation: 'Benign hardware battery degradation in municipal servers.',
        isValidated: false,
      },
    ],
    rewardCredits: 450,
    rewardBits: 8,
    rewardXP: 250,
    reputationTrack: 'dga',
  },
];

export class WorldEventEngine {
  /**
   * Creates a normalized WorldNarrativeEvent object.
   */
  public createEvent(params: {
    category: WorldEventCategory;
    title: string;
    summary: string;
    institution: string;
    citizenMaid?: string;
    cycle?: number;
    tags?: string[];
    impact?: WorldNarrativeEvent['impact'];
  }): WorldNarrativeEvent {
    return {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      category: params.category,
      title: params.title,
      summary: params.summary,
      institution: params.institution,
      citizenMaid: params.citizenMaid,
      cycle: params.cycle ?? 28,
      timestamp: new Date().toISOString(),
      tags: params.tags || [params.category, params.institution.toLowerCase()],
      impact: params.impact,
    };
  }

  /**
   * Evaluates a formal Pillar III medical/forensic case hypothesis submission.
   * Requires both the correct corroborating evidence items and the validated hypothesis.
   */
  public evaluateCaseSubmission(
    caseId: string,
    selectedEvidenceIds: string[],
    hypothesisId: string
  ): { ok: boolean; verified: boolean; message: string; caseDef?: InvestigationCaseDefinition } {
    const caseDef = FORMAL_INVESTIGATION_CASES.find((c) => c.id === caseId);
    if (!caseDef) {
      return { ok: false, verified: false, message: `Case "${caseId}" not found in institutional docket.` };
    }

    const hasAllRequiredEvidence = caseDef.requiredEvidenceIds.every((reqId) =>
      selectedEvidenceIds.includes(reqId)
    );
    const hasIrrelevantEvidence = selectedEvidenceIds.some(
      (id) => !caseDef.requiredEvidenceIds.includes(id)
    );

    if (!hasAllRequiredEvidence || hasIrrelevantEvidence) {
      return {
        ok: false,
        verified: false,
        caseDef,
        message: `Insufficient or uncorroborated evidence chain. Select the ${caseDef.requiredEvidenceIds.length} directly corroborating forensic/clinical exhibits without unrelated noise.`,
      };
    }

    const chosenHypothesis = caseDef.hypotheses.find((h) => h.id === hypothesisId);
    if (!chosenHypothesis || !chosenHypothesis.isValidated) {
      return {
        ok: false,
        verified: false,
        caseDef,
        message: `Hypothesis "${chosenHypothesis?.title || hypothesisId}" contradicts the clinical and kernel telemetry. Re-examine the evidence exhibits.`,
      };
    }

    return {
      ok: true,
      verified: true,
      caseDef,
      message: `Case ${caseDef.id} Validated: "${chosenHypothesis.title}". Findings logged to ${caseDef.institution} and citizen ${caseDef.subjectMaid}.`,
    };
  }

  /**
   * Builds a rich, deterministic narrative context for any NPC based on the player's
   * actual persistent world events, relationships, medical conditions, and achievements.
   */
  public buildNarrativeContextForNPC(npcName: string, gameplay: any): {
    summaryText: string;
    recentEvents: WorldNarrativeEvent[];
    relationshipSummary: string;
    contextualReply: string;
  } {
    const player = gameplay?.player || {};
    const corruption = gameplay?.prismCorruptionLevel ?? 14.8;
    const cycle = gameplay?.timeCycleCount ?? 28;
    const events: WorldNarrativeEvent[] = Array.isArray(gameplay?.worldEventLog)
      ? gameplay.worldEventLog.slice(0, 6)
      : [];

    const npcKey = npcName.toLowerCase().split(' ')[0];
    const vector = player?.npcVectors?.[npcKey] || { friendship: 50, trust: 50, rivalry: 10, sync: 50 };
    const relationshipSummary = `Trust ${vector.trust}/100, Friendship ${vector.friendship}/100, Sync ${vector.sync}/100`;

    const completedWorknetCount = Array.isArray(player?.completedWorknetMissionIds)
      ? player.completedWorknetMissionIds.length
      : 0;
    const quarantinedCount = Array.isArray(player?.quarantinedProcessPids)
      ? player.quarantinedProcessPids.length
      : 0;
    const masteredSpells: string[] = Array.isArray(player?.forgedSpells) ? player.forgedSpells : ['Reflect Shield'];
    const activeConditions: string[] = Array.isArray(player?.conditions) ? player.conditions : [];
    const solvedCases: string[] = Array.isArray(player?.solvedInvestigationCaseIds)
      ? player.solvedInvestigationCaseIds
      : [];

    const recentTitles = events.slice(0, 3).map((e) => `${e.title} (${e.institution})`);
    const eventsClause = recentTitles.length > 0
      ? `Recent world actions: ${recentTitles.join('; ')}.`
      : 'No major institutional dispatches logged yet this cycle.';

    const conditionClause = activeConditions.length > 0
      ? `Active player bio-aura conditions: ${activeConditions.join(', ')}.`
      : 'Player bio-aura is currently clear of Veilwilt/exposures.';

    const summaryText = [
      `Cycle ${cycle} | PRISM Corruption: ${corruption}% | Player Level ${player?.level || 1}.`,
      `Relationship with ${npcName}: ${relationshipSummary}.`,
      `Verified WorkNet Directives: ${completedWorknetCount} | Quarantined Rogue Threads: ${quarantinedCount} | Solved Cases: ${solvedCases.length} | Mastered Spells: ${masteredSpells.join(', ')}.`,
      conditionClause,
      eventsClause,
    ].join(' ');

    // Build a deterministic, character-authentic response that references the player's actual actions
    let actionReference = '';
    if (events.length > 0) {
      const latest = events[0];
      actionReference = `I saw the dispatch from ${latest.institution} regarding "${latest.title}"—`;
    } else if (quarantinedCount > 0) {
      actionReference = `Your quarantine of ${quarantinedCount} rogue PRISM thread(s) stabilized the local mesh—`;
    } else if (completedWorknetCount > 0) {
      actionReference = `Your ${completedWorknetCount} verified WorkNet directive(s) have been noticed across the bureau—`;
    } else if (activeConditions.includes('Veilwilt')) {
      actionReference = `Your bio-aura is still showing Veilwilt interference (Aura ${player?.auraHealth ?? 100}%)—visit Faith Medical for a diagnostic scan—`;
    } else {
      actionReference = `With PRISM corruption at ${corruption}% on Cycle ${cycle}, every verified directive counts—`;
    }

    const tonePrefix =
      vector.trust >= 75
        ? `[Trusted Ally · Trust ${vector.trust}%]`
        : vector.rivalry >= 60
        ? `[Rival Watch · Rivalry ${vector.rivalry}%]`
        : `[Sync ${vector.sync}% · Trust ${vector.trust}%]`;

    const contextualReply = `${tonePrefix} ${actionReference} keep your ${masteredSpells[masteredSpells.length - 1] || 'Reflect Shield'} protocol ready.`;

    return {
      summaryText,
      recentEvents: events,
      relationshipSummary,
      contextualReply,
    };
  }
}

export const worldEventEngine = new WorldEventEngine();
