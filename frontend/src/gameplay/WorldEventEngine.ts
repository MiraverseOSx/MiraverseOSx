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

export interface PatientCareAssignment {
  id: string;
  patientName: string;
  patientMaid: string;
  ward: string;
  presentingVitals: string;
  diagnoses: { id: string; label: string; isCorrect: boolean }[];
  treatments: { id: string; label: string; isCorrect: boolean }[];
  rewardCredits: number;
  rewardCareerXP: number;
  rewardXP: number;
  linkedWorknetMissionId?: string;
}

export const PATIENT_CARE_ASSIGNMENTS: PatientCareAssignment[] = [
  {
    id: 'pc-mercer',
    patientName: 'Student S. Mercer (Vertex House)',
    patientMaid: 'MAID-OR-00481926',
    ward: 'Faith Medical Campus - Ward 04',
    presentingVitals: 'Aura Greying, 39.1°C Thermal Flux, Memory Fragmentation following high-load spell matrix synthesis.',
    diagnoses: [
      { id: 'diag-veilwilt-desync', label: 'Acute Veilwilt & Thermal Aura Desync', isCorrect: true },
      { id: 'diag-frostlung', label: 'Frostlung Cryo-Bronchial Crystallization', isCorrect: false },
      { id: 'diag-benign-fatigue', label: 'Uncomplicated Muscular Fatigue', isCorrect: false },
    ],
    treatments: [
      { id: 'tx-warm-compress-vitals', label: 'Apply BioCompress-04 Warm-Essence & Calibrate VITALS-Sync', isCorrect: true },
      { id: 'tx-cryo-immersion', label: 'Sub-Zero Cryo-Tank Immersion', isCorrect: false },
      { id: 'tx-no-intervention', label: 'Discharge Without Telemetry Calibration', isCorrect: false },
    ],
    rewardCredits: 220,
    rewardCareerXP: 140,
    rewardXP: 140,
    linkedWorknetMissionId: 'ms-shift-01',
  },
  {
    id: 'pc-vale',
    patientName: 'Elara Vale (Sub-Conduit Transit)',
    patientMaid: 'MAID-OR-00481926',
    ward: 'Faith Medical - Cryo-Recovery Unit',
    presentingVitals: 'Core Temp 34.8°C, Crystalline Bronchial Rales, 88.2 MHz Sub-Conduit Exposure.',
    diagnoses: [
      { id: 'diag-frostlung-exposure', label: 'Frostlung Syndrome & Sub-Conduit Harmonic Exposure', isCorrect: true },
      { id: 'diag-sunspire-burn', label: 'Sunspire Solar Flare Hyperthermia', isCorrect: false },
      { id: 'diag-cafeteria-coolant', label: 'Dietary Synth-Juice Indigestion', isCorrect: false },
    ],
    treatments: [
      { id: 'tx-thermal-thaw-seal', label: 'Administer Warm-Essence Thermal Thaw & Dermal Frequency Seal', isCorrect: true },
      { id: 'tx-sedative-only', label: 'Mild Analgesic Without Thermal Thaw', isCorrect: false },
      { id: 'tx-cooling-pack', label: 'Apply Endothermic Cooling Pack', isCorrect: false },
    ],
    rewardCredits: 180,
    rewardCareerXP: 120,
    rewardXP: 120,
  },
];

export interface WorknetDomainTask {
  missionId: string;
  track: string;
  taskTitle: string;
  prompt: string;
  crossAppHint: string;
  options: { id: string; label: string; isCorrect: boolean }[];
  successSummary: string;
}

export const WORKNET_DOMAIN_TASKS: Record<string, WorknetDomainTask> = {
  'ms-shift-01': {
    missionId: 'ms-shift-01',
    track: 'medical',
    taskTitle: 'Clinical Patient-Care Triage: Student S. Mercer (Ward 04)',
    prompt: 'Examine Student S. Mercer (39.1°C Thermal Flux, Aura Greying, Memory Fragmentation) and administer the validated clinical intervention:',
    crossAppHint: 'Can also be completed via the Inpatient Clinical Care Queue in Faith Medical Intranet (faithmed.aure).',
    options: [
      { id: 'clinical-mercer-valid', label: 'Diagnose Acute Veilwilt Desync → Apply BioCompress-04 Warm-Essence & Calibrate VITALS-Sync', isCorrect: true },
      { id: 'clinical-mercer-cryo', label: 'Administer Sub-Zero Cryo-Immersion without VITALS telemetry', isCorrect: false },
      { id: 'clinical-mercer-discharge', label: 'Sign routine wellness waiver without treating 39.1°C thermal flux', isCorrect: false },
    ],
    successSummary: 'Completed clinical triage & BioCompress-04 treatment for Student S. Mercer.',
  },
  'ms-shift-02': {
    missionId: 'ms-shift-02',
    track: 'archivist',
    taskTitle: 'Archival Micro-Card Restoration: Batch #LN-892',
    prompt: 'Extract surviving metadata from degraded magnetic foil Batch #LN-892 and assign the canonical library catalog index:',
    crossAppHint: 'Automatically satisfied if you inspect archival files in File Explorer or Lore Explorer.',
    options: [
      { id: 'arch-ln892-valid', label: 'Run FoilRestorer → Index Pre-Collapse Cartographic Blueprints under [ARC-PRE-892 // Cartography]', isCorrect: true },
      { id: 'arch-ln892-discard', label: 'Incinerate degraded magnetic foil cards as unreadable', isCorrect: false },
      { id: 'arch-ln892-fiction', label: 'File Pre-Collapse blueprints under Modern Cafeteria Menus', isCorrect: false },
    ],
    successSummary: 'Restored magnetic foil metadata and cataloged Batch #LN-892 into Aureline Library stacks.',
  },
  'ms-shift-03': {
    missionId: 'ms-shift-03',
    track: 'finance',
    taskTitle: 'Treasury Ledger Reconciliation: Disbursement Roll #401',
    prompt: 'Audit Disbursement Roll Batch #401 (Municipal Debit: 14,820 ₢ vs Regional Credit Routing: 13,420 ₢) and resolve the discrepancy:',
    crossAppHint: 'Automatically satisfied if you trace Suspect Wire #0994 in Oryn Bank Portal (bank.aure).',
    options: [
      { id: 'fin-401-valid', label: 'Reconcile 1,400 ₢ regional scholarship routing variance & issue signed Disbursement Receipt Hash', isCorrect: true },
      { id: 'fin-401-ignore', label: 'Approve unbalanced 1,400 ₢ deficit without audit trail', isCorrect: false },
      { id: 'fin-401-freeze', label: 'Freeze all municipal citizen salaries indefinitely', isCorrect: false },
    ],
    successSummary: 'Balanced 1,400 ₢ credit routing variance and signed Disbursement Roll Batch #401.',
  },
  'ms-shift-04': {
    missionId: 'ms-shift-04',
    track: 'engineer',
    taskTitle: 'Circuit & Firmware Bench: Relay Box #GL-12A',
    prompt: 'Oscilloscope trace shows a 4.2V drop across blown Capacitor Node C4 on the Glassline transit bus. Select repair procedure:',
    crossAppHint: 'Automatically satisfied if you quarantine a rogue kernel thread in Process Monitor.',
    options: [
      { id: 'eng-gl12a-valid', label: 'Isolate blown Capacitor C4, solder replacement conduit, and reflash v2.4 Bus Telemetry Firmware', isCorrect: true },
      { id: 'eng-gl12a-bypass', label: 'Short-circuit high-voltage transit rail directly to passenger terminal', isCorrect: false },
      { id: 'eng-gl12a-reboot', label: 'Reboot display monitor without replacing blown Capacitor C4', isCorrect: false },
    ],
    successSummary: 'Replaced Capacitor C4 and reflashed Relay Box #GL-12A telemetry firmware.',
  },
  'ms-spec-01': {
    missionId: 'ms-spec-01',
    track: 'dga',
    taskTitle: 'Tactical Breach Containment: PRISM Vector #512',
    prompt: 'PRISM corruption thread PID 512 is leaking raw memory into Sub-Aureline Tunnel 09 transit signals. Execute containment:',
    crossAppHint: 'Automatically satisfied by quarantining PID 512 in Process Monitor, forging Seal Lock in SpellForge, or solving CASE-FM-401.',
    options: [
      { id: 'dga-512-valid', label: 'Deploy Hazmat-01 & Patrol-12 with SealLockCrypt to isolate PID 512 memory bleed', isCorrect: true },
      { id: 'dga-512-vent', label: 'Open Tunnel 09 blast doors to unshielded public transit platforms', isCorrect: false },
      { id: 'dga-512-ignore', label: 'Log PID 512 as benign background static', isCorrect: false },
    ],
    successSummary: 'Contained PRISM Vector PID 512 in Sub-Aureline Tunnel 09 using SealLockCrypt.',
  },
  'ms-spec-02': {
    missionId: 'ms-spec-02',
    track: 'dga',
    taskTitle: 'SIGINT Cryptanalysis: Encrypted Vector Stream #88A',
    prompt: 'Analyze intercepted 88.2 MHz darknet packet burst #88A and apply the verified decryption key to isolate the recipient node:',
    crossAppHint: 'Automatically satisfied by solving formal forensic investigation CASE-DGA-402.',
    options: [
      { id: 'dga-88a-valid', label: 'Apply SIGINT-Decoder with cipher key "lightborn" on 88.2 MHz carrier & isolate Sector 3 relay IP', isCorrect: true },
      { id: 'dga-88a-ddos', label: 'Flood municipal hospital network with random noise packets', isCorrect: false },
      { id: 'dga-88a-plaintext', label: 'Forward uncracked cipher stream to public bulletin board', isCorrect: false },
    ],
    successSummary: 'Decrypted Vector Stream #88A using cipher "lightborn" and isolated the Sector 3 darknet relay IP.',
  },
  'ms-spec-03': {
    missionId: 'ms-spec-03',
    track: 'archivist',
    taskTitle: 'Vault 0 Resonance Decryption: Sealed Council Dossier #RHS-001',
    prompt: 'Apply non-invasive resonance decryption to Sealed Council Dossier #RHS-001 to verify the pre-Collapse dynastic treaty:',
    crossAppHint: 'Automatically satisfied by inspecting Purge_Record_01.arch or AETHERCORE.sys in File Explorer.',
    options: [
      { id: 'arch-rhs001-valid', label: 'Calibrate ResonanceCipher to Seraphima Harmonic Key → Synthesize Pre-Collapse Succession Audit Trail', isCorrect: true },
      { id: 'arch-rhs001-acid', label: 'Apply corrosive solvent to parchment cipher seal', isCorrect: false },
      { id: 'arch-rhs001-redact', label: 'Delete archival lineage metadata without verification', isCorrect: false },
    ],
    successSummary: 'Decrypted Sealed Council Dossier #RHS-001 and verified Seraphima succession charter records.',
  },
  'ms-dev-01': {
    missionId: 'ms-dev-01',
    track: 'engineer',
    taskTitle: 'Accreditation Practical Exam #ENG-404',
    prompt: 'Configure the automated firewall modulation matrix to pass Federal Security Accreditation #ENG-404:',
    crossAppHint: 'Automatically satisfied by studying in HOMECRAFT // Housing or synthesizing a new spell in SpellForge.',
    options: [
      { id: 'eng-404-valid', label: 'Modulate Firewall to Adaptive Harmonic Quarantine & submit PRISM Thread Isolation Thesis', isCorrect: true },
      { id: 'eng-404-disable', label: 'Disable all kernel firewall ports to maximize raw packet speed', isCorrect: false },
      { id: 'eng-404-skip', label: 'Submit blank accreditation thesis form', isCorrect: false },
    ],
    successSummary: 'Passed Accreditation Exam #ENG-404 and filed PRISM Thread Isolation Thesis.',
  },
  'ms-dev-02': {
    missionId: 'ms-dev-02',
    track: 'diplomat',
    taskTitle: 'Bilateral Treaty Mediation #DIP-201 (Fross & Lumia)',
    prompt: 'Resolve the simulated trade embargo between the Fross Cryo-Syndicate and Lumia Solar Enclave:',
    crossAppHint: 'Select the balanced bilateral treaty framework below to secure delegation consensus.',
    options: [
      { id: 'dip-201-valid', label: 'Draft Reciprocal Cryo-Coolant & Solar Core Parity Clause with joint Council arbitration signatures', isCorrect: true },
      { id: 'dip-201-sanction', label: 'Impose unilateral punitive tariffs on both regional delegations', isCorrect: false },
      { id: 'dip-201-adjourn', label: 'Adjourn session without treaty framework', isCorrect: false },
    ],
    successSummary: 'Secured Fross–Lumia consensus signatures on the Reciprocal Cryo-Solar Parity Treaty.',
  },
  'ms-field-01': {
    missionId: 'ms-field-01',
    track: 'warden',
    taskTitle: 'Arcadia Spectral Bio-Assay: Perimeter Zone #C14',
    prompt: 'Analyze the 3 extracted soil, water, and crystalline flora samples from Arcadia Perimeter Zone C14:',
    crossAppHint: 'Automatically satisfied by attuning a regional shrine in Reality Registry / Lore Explorer.',
    options: [
      { id: 'war-c14-valid', label: 'Run SpectralAssay → Log 18.4% Veil Ionization Runoff & deploy Crystalline Flora Chelator', isCorrect: true },
      { id: 'war-c14-herbicide', label: 'Spray industrial defoliant across Arcadia botanical dome', isCorrect: false },
      { id: 'war-c14-falsify', label: 'Record zero ionization without running spectral assay', isCorrect: false },
    ],
    successSummary: 'Completed 3-sample Spectral Bio-Assay in Zone C14 and logged Veil ionization remediation.',
  },
  'ms-field-02': {
    missionId: 'ms-field-02',
    track: 'dga',
    taskTitle: 'Blackout Root-Layer Stabilization: Glitch Node #BLK-99',
    prompt: 'Synchronize the 5-point polarity anchors in Outer District Sub-Structure Level -4 to purge recursive Glitch Node #BLK-99:',
    crossAppHint: 'Automatically satisfied if you have both quarantined a rogue process AND forged a stabilization spell.',
    options: [
      { id: 'dga-blk99-valid', label: 'Lock 5-Point Polarity Anchors in counter-phase & execute RootPurgeKey on #BLK-99 memory blocks', isCorrect: true },
      { id: 'dga-blk99-overload', label: 'Overload Level -4 structural support pylons without polarity anchors', isCorrect: false },
      { id: 'dga-blk99-retreat', label: 'Leave recursive gravity tear unanchored', isCorrect: false },
    ],
    successSummary: 'Synchronized 5-point polarity anchors and purged Glitch Node #BLK-99 root memory blocks.',
  },
  'qn-01': {
    missionId: 'qn-01',
    track: 'questnotice',
    taskTitle: 'Express Cryo-Courier Dispatch: Apothecary → Faith Clinic 2',
    prompt: 'Select the temperature-stabilized transit route to deliver the chilled essence flasks before noon thermal threshold:',
    crossAppHint: 'Complete the courier chain-of-custody verification below.',
    options: [
      { id: 'qn01-valid', label: 'Seal flasks in Insulated CourierBag, route via shaded Sub-Plaza Conduit, and scan Clinic 2 recipient receipt', isCorrect: true },
      { id: 'qn01-sun', label: 'Leave uninsulated flasks on open Sunspire Plaza bench', isCorrect: false },
      { id: 'qn01-wrong', label: 'Deliver medical flasks to CargoTrack Warehouse 3', isCorrect: false },
    ],
    successSummary: 'Delivered chilled stabilizing essence flasks to Faith Clinic 2 with signed receipt.',
  },
  'qn-02': {
    missionId: 'qn-02',
    track: 'questnotice',
    taskTitle: 'Botanical Perimeter Search: Engraved Silver Chronometer',
    prompt: 'Use AreaScanner to sweep the cherry-blossom-covered benches around the Glassline Botanical Garden fountain:',
    crossAppHint: 'Complete the metallic resonance sweep below.',
    options: [
      { id: 'qn02-valid', label: 'Pinpoint silver gear resonance under East Fountain Bench foliage & return chronometer to elder resident', isCorrect: true },
      { id: 'qn02-pond', label: 'Drain the central botanical koi reservoir', isCorrect: false },
      { id: 'qn02-pawn', label: 'List unrecovered watch on underground auction grid', isCorrect: false },
    ],
    successSummary: 'Recovered the Engraved Silver Chronometer at the East Fountain Bench and returned it to its owner.',
  },
  'qn-03': {
    missionId: 'qn-03',
    track: 'questnotice',
    taskTitle: 'East Wing Stacks Cataloging & Vitrine Maintenance',
    prompt: 'Sort the 40 returned volumes by Aureline Decimal Call Number and clean the manuscript glass vitrines:',
    crossAppHint: 'Complete the library shelving & preservation protocol below.',
    options: [
      { id: 'qn03-valid', label: 'Order volumes [100-Philosophy → 900-Orynvell History], shelve in East Wing, and polish manuscript vitrines', isCorrect: true },
      { id: 'qn03-random', label: 'Stack volumes by cover color without checking call numbers', isCorrect: false },
      { id: 'qn03-water', label: 'Wash unsealed parchment vitrines with pressurized water hose', isCorrect: false },
    ],
    successSummary: 'Cataloged and shelved all 40 volumes in the East Wing Reading Room and polished display vitrines.',
  },
};

export function evaluateWorknetObjective(
  missionId: string,
  track: string,
  player: any
): { verified: boolean; source: string; requirementText: string } {
  const progressMap: Record<string, string[]> = player?.worknetMissionProgress || {};
  const steps = Array.isArray(progressMap[missionId]) ? progressMap[missionId] : [];

  if (steps.includes('domain_objective_verified')) {
    return {
      verified: true,
      source: 'Domain Workstation Task',
      requirementText: WORKNET_DOMAIN_TASKS[missionId]?.successSummary || 'Completed profession-specific assignment task.',
    };
  }

  const completedPatientCare: string[] = Array.isArray(player?.completedPatientCareIds) ? player.completedPatientCareIds : [];
  const quarantinedPids: number[] = Array.isArray(player?.quarantinedProcessPids) ? player.quarantinedProcessPids : [];
  const forgedSpells: string[] = Array.isArray(player?.forgedSpells) ? player.forgedSpells : [];
  const inspectedFiles: string[] = Array.isArray(player?.inspectedFiles) ? player.inspectedFiles : [];
  const solvedCases: string[] = Array.isArray(player?.solvedInvestigationCaseIds) ? player.solvedInvestigationCaseIds : [];
  const claimedPortals: string[] = Array.isArray(player?.claimedPortalActionIds) ? player.claimedPortalActionIds : [];
  const shrines: string[] = Array.isArray(player?.discoveredShrines) ? player.discoveredShrines : [];

  if (missionId === 'ms-shift-01' || track === 'medical') {
    if (completedPatientCare.length > 0) {
      return {
        verified: true,
        source: 'Faith Medical Clinical Patient Care',
        requirementText: `Completed inpatient clinical triage & treatment (${completedPatientCare.join(', ')}).`,
      };
    }
    return {
      verified: false,
      source: 'Pending Clinical Activity',
      requirementText: 'Medical assignments require actual clinical patient-care activity (complete S. Mercer clinical triage below or in Faith Medical Intranet).',
    };
  }

  if (missionId === 'ms-spec-01') {
    if (quarantinedPids.includes(512) || forgedSpells.includes('Seal Lock') || solvedCases.includes('CASE-FM-401')) {
      return {
        verified: true,
        source: 'Cross-App Containment / Forensics',
        requirementText: 'Verified PID 512 quarantine, Seal Lock synthesis, or CASE-FM-401 determination.',
      };
    }
  }

  if (missionId === 'ms-spec-02') {
    if (solvedCases.includes('CASE-DGA-402')) {
      return {
        verified: true,
        source: 'DGA Forensic Case Resolution',
        requirementText: 'Verified formal forensic determination for CASE-DGA-402.',
      };
    }
  }

  if (missionId === 'ms-field-02') {
    if (quarantinedPids.length > 0 && forgedSpells.length > 1) {
      return {
        verified: true,
        source: 'Process Monitor + SpellForge',
        requirementText: 'Verified rogue kernel thread quarantine and spell protocol synthesis.',
      };
    }
  }

  if (missionId === 'ms-shift-02') {
    if (inspectedFiles.length > 0) {
      return {
        verified: true,
        source: 'File Explorer / Archives',
        requirementText: `Inspected archival record (${inspectedFiles[0]}).`,
      };
    }
  }

  if (missionId === 'ms-spec-03') {
    if (inspectedFiles.includes('purge-archive') || inspectedFiles.includes('aethercore-sys') || Boolean(player?.lineageDecrypted)) {
      return {
        verified: true,
        source: 'Restricted Archive Decryption',
        requirementText: 'Decrypted restricted Purge/AETHERCORE lineage archive.',
      };
    }
  }

  if (missionId === 'ms-shift-03') {
    if (claimedPortals.includes('bank-wire-0994')) {
      return {
        verified: true,
        source: 'Oryn Treasury Wire Audit',
        requirementText: 'Verified Suspect Wire Transfer #0994 audit in Oryn Bank Portal.',
      };
    }
  }

  if (missionId === 'ms-shift-04') {
    if (quarantinedPids.length > 0) {
      return {
        verified: true,
        source: 'Process Monitor Diagnostic',
        requirementText: `Isolated anomalous system thread PID ${quarantinedPids[0]}.`,
      };
    }
  }

  if (missionId === 'ms-dev-01') {
    if (Boolean(player?.housingCalibrated) || forgedSpells.length > 1) {
      return {
        verified: true,
        source: 'Cyacademy Coursework / SpellForge',
        requirementText: 'Completed academic coursework or advanced protocol synthesis.',
      };
    }
  }

  if (missionId === 'ms-field-01') {
    if (shrines.length > 0) {
      return {
        verified: true,
        source: 'Ecological Shrine Telemetry',
        requirementText: `Attuned regional resonance telemetry (${shrines[0]}).`,
      };
    }
  }

  const taskDef = WORKNET_DOMAIN_TASKS[missionId];
  return {
    verified: false,
    source: 'Pending Profession Objective',
    requirementText: taskDef
      ? `Requires completed ${taskDef.track.toUpperCase()} activity: "${taskDef.taskTitle}". Complete the domain task below or in the linked OS app.`
      : 'Requires completing the assignment objective before claiming compensation.',
  };
}

export const worldEventEngine = new WorldEventEngine();

