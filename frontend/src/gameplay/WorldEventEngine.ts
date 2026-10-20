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

// ============================================================================
// GAMEPLAY-012: Time, Sleep, Recovery & Special Lore Dreams (Option C)
// ============================================================================

export type SleepDuration = 'short' | 'standard' | 'full';

export interface SpecialLoreDream {
  id: string;
  title: string;
  dreamEntry: string;
  loreSummary: string;
  conditionCheck: (player: any, gameplay: any) => boolean;
}

export const SPECIAL_LORE_DREAMS: SpecialLoreDream[] = [
  {
    id: 'dream-cathedral-calibration',
    title: 'Echoes of the Mirrored Cathedral',
    dreamEntry:
      'DREAM_ENTRY #05 [SPECIAL LORE]: Beneath the Glassline rain, a mirrored cathedral hums at 88.2 MHz. Seraphima’s reflection points toward Sub-Conduit Node 04: "The city was compiled over a living memory."',
    loreSummary: 'Unlocked Special Dream Insight: 88.2 MHz Sub-Conduit resonance links the Mirrored Cathedral to Node 04.',
    conditionCheck: (player) => !Boolean(player?.housingCalibrated),
  },
  {
    id: 'dream-lightborn-lineage',
    title: 'The Year-0 Lineage Ledger',
    dreamEntry:
      'DREAM_ENTRY #06 [SPECIAL LORE]: Pages of Purge_Record_01 burn in reverse, revealing Maeryn’s Lightborn sigil etched into the AETHERCORE kernel before Directive 14-B sealed the royal archives.',
    loreSummary: 'Unlocked Special Dream Insight: Pre-Collapse Lightborn genealogy confirmed in AETHERCORE Year-0 memory.',
    conditionCheck: (player) =>
      Boolean(player?.lineageDecrypted) ||
      (Array.isArray(player?.inspectedFiles) &&
        (player.inspectedFiles.includes('purge-archive') || player.inspectedFiles.includes('aethercore-sys'))),
  },
  {
    id: 'dream-veil-shrine-harmonic',
    title: 'Convergence of the Eight Shrines',
    dreamEntry:
      'DREAM_ENTRY #07 [SPECIAL LORE]: Eight crystalline monoliths across Orynvell, Fross, and Lumia align in harmonic counter-phase, pushing back the violet PRISM tide.',
    loreSummary: 'Unlocked Special Dream Insight: Regional shrine attunement dampens city-wide PRISM corruption.',
    conditionCheck: (player) => Array.isArray(player?.discoveredShrines) && player.discoveredShrines.length > 0,
  },
  {
    id: 'dream-spellforge-weaver',
    title: 'The Weaver’s Compiler Loom',
    dreamEntry:
      'DREAM_ENTRY #08 [SPECIAL LORE]: Threads of silver syntax weave Firewall.mod and SealLockCrypt into a living lattice around Vector Suite 4B.',
    loreSummary: 'Unlocked Special Dream Insight: Mastered SpellForge protocols resonate with citizen aura pathways.',
    conditionCheck: (player) => Array.isArray(player?.forgedSpells) && player.forgedSpells.length >= 2,
  },
];

export function calculateRestOutcome(
  gameplay: any,
  duration: SleepDuration = 'full'
): {
  nextTimeSegmentIndex: number;
  nextTimeCycleCount: number;
  staminaRecovered: number;
  auraRecovered: number;
  nextStamina: number;
  nextAuraHealth: number;
  nextCorruption: number;
  nextConditions: string[];
  dreamText: string;
  unlockedSpecialDream: SpecialLoreDream | null;
  nextUnlockedDreamIds: string[];
  summaryMessage: string;
} {
  const player = gameplay?.player || {};
  const currentStamina = typeof player.stamina === 'number' ? player.stamina : 85;
  const currentAura = typeof player.auraHealth === 'number' ? player.auraHealth : 100;
  const currentSegment = typeof gameplay?.timeSegmentIndex === 'number' ? gameplay.timeSegmentIndex : 2;
  const currentCycle = typeof gameplay?.timeCycleCount === 'number' ? gameplay.timeCycleCount : 28;
  const currentCorruption = typeof gameplay?.prismCorruptionLevel === 'number' ? gameplay.prismCorruptionLevel : 14.8;

  const unlockedUpgrades: string[] = Array.isArray(player.unlockedHousingUpgrades)
    ? player.unlockedHousingUpgrades
    : ['banner'];
  const hasMattress = unlockedUpgrades.includes('mattress');
  const hasAuraLamp = unlockedUpgrades.includes('aura_lamp');
  const roomComfort = typeof player.roomComfort === 'number' ? player.roomComfort : player.dormComfort || 50;
  const comfortBonus = Math.max(0, Math.floor((roomComfort - 50) / 5));

  const currentConditions: string[] = Array.isArray(player.conditions) ? [...player.conditions] : [];
  const hasUntreatedCondition = currentConditions.length > 0;

  // Time progression based on sleep duration
  let nextTimeSegmentIndex = 0;
  let nextTimeCycleCount = currentCycle;
  let baseStamina = 80;
  let baseAura = 45;

  if (duration === 'short') {
    const rawNext = currentSegment + 1;
    nextTimeSegmentIndex = rawNext % 4;
    nextTimeCycleCount = rawNext >= 4 ? currentCycle + 1 : currentCycle;
    baseStamina = 35;
    baseAura = 15;
  } else if (duration === 'standard') {
    const rawNext = currentSegment + 2;
    nextTimeSegmentIndex = rawNext % 4;
    nextTimeCycleCount = rawNext >= 4 ? currentCycle + 1 : currentCycle;
    baseStamina = 60;
    baseAura = 30;
  } else {
    // Full overnight rest advances to next cycle morning
    nextTimeSegmentIndex = 0;
    nextTimeCycleCount = currentCycle + 1;
    baseStamina = 80;
    baseAura = 45;
  }

  const upgradeStaminaBonus = (hasMattress ? 20 : 0) + comfortBonus;
  const upgradeAuraBonus = (hasAuraLamp ? 25 : 0) + comfortBonus;
  const conditionPenalty = hasUntreatedCondition && !hasAuraLamp ? 15 : 0;

  const rawStaminaGain = Math.max(10, baseStamina + upgradeStaminaBonus - conditionPenalty);
  const rawAuraGain = Math.max(5, baseAura + upgradeAuraBonus - conditionPenalty);

  const staminaCap = hasUntreatedCondition && !hasAuraLamp && !hasMattress ? 90 : 100;
  const auraCap = hasUntreatedCondition && !hasAuraLamp ? 85 : 100;

  const nextStamina = Math.min(100, Math.max(currentStamina, Math.min(staminaCap, currentStamina + rawStaminaGain)));
  const nextAuraHealth = Math.min(100, Math.max(currentAura, Math.min(auraCap, currentAura + rawAuraGain)));

  const staminaRecovered = nextStamina - currentStamina;
  const auraRecovered = nextAuraHealth - currentAura;

  const nextCorruption =
    hasAuraLamp && duration === 'full'
      ? Math.max(2.0, Number((currentCorruption - 1.5).toFixed(1)))
      : currentCorruption;

  // Aura Lamp during full rest helps soothe mild Veilwilt fatigue
  const nextConditions =
    hasAuraLamp && duration === 'full'
      ? currentConditions.filter((c) => c !== 'Veilwilt')
      : currentConditions;

  // Check for one-time Special Lore Dreams
  const unlockedDreamIds: string[] = Array.isArray(player.unlockedDreamIds) ? [...player.unlockedDreamIds] : [];
  let unlockedSpecialDream: SpecialLoreDream | null = null;
  for (const dream of SPECIAL_LORE_DREAMS) {
    if (!unlockedDreamIds.includes(dream.id) && dream.conditionCheck(player, gameplay)) {
      unlockedSpecialDream = dream;
      unlockedDreamIds.push(dream.id);
      break;
    }
  }

  const dreamText = unlockedSpecialDream
    ? unlockedSpecialDream.dreamEntry
    : `DREAM_ENTRY [Cycle ${nextTimeCycleCount}]: Quiet rest in Vector Suite 4B (${duration} rest). Rain patters against the Glassline transit glass.`;

  const conditionNote =
    hasUntreatedCondition && !hasAuraLamp
      ? ` Active condition (${currentConditions.join(', ')}) limited peak recovery; visit Faith Medical or install an Aura Lamp.`
      : '';
  const dreamNote = unlockedSpecialDream ? ` ✨ Special Dream Unlocked: "${unlockedSpecialDream.title}"!` : '';

  return {
    nextTimeSegmentIndex,
    nextTimeCycleCount,
    staminaRecovered,
    auraRecovered,
    nextStamina,
    nextAuraHealth,
    nextCorruption,
    nextConditions,
    dreamText,
    unlockedSpecialDream,
    nextUnlockedDreamIds: unlockedDreamIds,
    summaryMessage: `Rested (${duration}): Stamina ${nextStamina}/100 (+${staminaRecovered}), Aura ${nextAuraHealth}/100 (+${auraRecovered}). Cycle ${nextTimeCycleCount}.${conditionNote}${dreamNote}`,
  };
}

// ============================================================================
// GAMEPLAY-013: Careers & Promotions (Options C + D | Flexible Pathways)
// ============================================================================

export interface CareerAdvancementPathway {
  id: string;
  label: string;
  pathwayType: 'institutional' | 'practical' | 'portfolio' | 'achievement';
  description: string;
  isMet: (player: any, targetRankIndex: number) => boolean;
  requirementSummary: (targetRankIndex: number) => string;
}

export interface CareerTrackSpec {
  track: string;
  department: string;
  rankTitles: string[]; // index 0..5
  xpThresholds: number[]; // index 0..5 (e.g. [0, 100, 220, 360, 520, 700])
  pathways: CareerAdvancementPathway[];
}

function getCompletedMissionsForTrack(player: any, track: string): number {
  const completed: string[] = Array.isArray(player?.completedWorknetMissionIds)
    ? player.completedWorknetMissionIds
    : [];
  return completed.filter((id) => WORKNET_DOMAIN_TASKS[id]?.track === track).length;
}

export const CAREER_TRACK_SPECS: Record<string, CareerTrackSpec> = {
  medical: {
    track: 'medical',
    department: 'Faith Medical Group',
    rankTitles: [
      'Clinical Intake Aide',
      'Junior Bio-Aura Clinician',
      'Attending Ward Physician',
      'Senior Resonance Diagnostician',
      'Chief of Clinical Telemetry',
      'Grand Sanctum Physician',
    ],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: 'med-clinical-credential',
        label: 'Clinical Credentials & Institutional Approval',
        pathwayType: 'institutional',
        description: 'Advance through verified clinical patient care, medical/research skills, and Faith Medical standing.',
        isMet: (player, targetRank) => {
          const careCount = Array.isArray(player?.completedPatientCareIds) ? player.completedPatientCareIds.length : 0;
          const faithRep = player?.reputation?.faith ?? 50;
          const commLvl = player?.skills?.Communication?.level ?? 1;
          const resLvl = player?.skills?.Research?.level ?? 1;
          return (
            careCount >= Math.min(2, targetRank) &&
            faithRep >= 45 + targetRank * 5 &&
            Math.max(commLvl, resLvl) >= Math.max(1, Math.ceil(targetRank / 2))
          );
        },
        requirementSummary: (targetRank) =>
          `Complete ${Math.min(2, targetRank)}+ Inpatient Care case(s), Faith Reputation ≥ ${45 + targetRank * 5}, and Research/Communication Skill Lv.${Math.max(1, Math.ceil(targetRank / 2))}+`,
      },
      {
        id: 'med-forensic-specialist',
        label: 'Forensic Medicine & Epidemiological Achievement',
        pathwayType: 'achievement',
        description: 'Advance by solving medical-forensic investigations (CASE-FM-401) alongside clinical triage.',
        isMet: (player, targetRank) => {
          const careCount = Array.isArray(player?.completedPatientCareIds) ? player.completedPatientCareIds.length : 0;
          const solvedCases: string[] = Array.isArray(player?.solvedInvestigationCaseIds)
            ? player.solvedInvestigationCaseIds
            : [];
          const hasMedicalCase = solvedCases.includes('CASE-FM-401');
          return careCount >= 1 && hasMedicalCase && (player?.reputation?.faith ?? 50) >= 40 + targetRank * 5;
        },
        requirementSummary: (targetRank) =>
          `Complete 1+ Inpatient Care case, validate forensic investigation CASE-FM-401, and Faith Reputation ≥ ${40 + targetRank * 5}`,
      },
    ],
  },
  artist: {
    track: 'artist',
    department: 'The Velvet Cultural Studio & Media Guild',
    rankTitles: [
      'Apprentice Performer',
      'Independent Commission Artist',
      'Resident Holo-Sculptor',
      'Featured Velvet Luminary',
      'Cultural Broadcast Director',
      'Paragon of the Arts',
    ],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: 'art-portfolio-reputation',
        label: 'Independent Commissions, Portfolio & Reputation',
        pathwayType: 'portfolio',
        description: 'Advance through creative commissions, SpellForge/media portfolio works, and public reputation without formal academic gatekeeping.',
        isMet: (player, targetRank) => {
          const campusRep = player?.reputation?.campus ?? 50;
          const vectorRep = player?.reputation?.vector ?? 35;
          const forgedCount = Array.isArray(player?.forgedSpells) ? player.forgedSpells.length : 1;
          const playerBulletins = Math.max(
            0,
            (Array.isArray(player?.maiSpaceProfile?.bulletinPosts) ? player.maiSpaceProfile.bulletinPosts.length : 4) - 4
          );
          const artMissions = getCompletedMissionsForTrack(player, 'artist');
          return (
            Math.max(campusRep, vectorRep) >= 45 + targetRank * 5 &&
            Math.max(0, forgedCount - 1) + playerBulletins + artMissions >= targetRank
          );
        },
        requirementSummary: (targetRank) =>
          `Portfolio of ${targetRank}+ newly created commissions/protocols/broadcasts and Campus/Vector Reputation ≥ ${45 + targetRank * 5}`,
      },
      {
        id: 'art-creative-mastery',
        label: 'Creative & Expressive Skill Mastery',
        pathwayType: 'practical',
        description: 'Advance through demonstrated Creativity and Communication skill levels and cultural engagement.',
        isMet: (player, targetRank) => {
          const creatLvl = player?.skills?.Creativity?.level ?? 1;
          const commLvl = player?.skills?.Communication?.level ?? 1;
          return creatLvl >= targetRank + 1 && creatLvl + commLvl >= targetRank + 2 && (player?.reputation?.campus ?? 50) >= 45 + targetRank * 4;
        },
        requirementSummary: (targetRank) =>
          `Creativity Skill Lv.${targetRank + 1}+ (Combined Creativity + Communication ≥ ${targetRank + 2}) and Campus Reputation ≥ ${45 + targetRank * 4}`,
      },
    ],
  },
  dga: {
    track: 'dga',
    department: 'Department of Global Affairs',
    rankTitles: [
      'Provisional Field Analyst',
      'Tactical Counter-Intrusion Agent',
      'Special Directive Operative',
      'Senior SIGINT & TRACE Inspector',
      'Division Deputy Commander',
      'DGA High Commander',
    ],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: 'dga-institutional-clearance',
        label: 'DGA Institutional Clearance & Cyber Certification',
        pathwayType: 'institutional',
        description: 'Advance through verified DGA identity clearance, CyberSecurity/Cryptography skills, and DGA standing.',
        isMet: (player, targetRank) => {
          const dgaRep = player?.reputation?.dga ?? 40;
          const cyberLvl = player?.skills?.CyberSecurity?.level ?? 1;
          const cryptoLvl = player?.skills?.Cryptography?.level ?? 1;
          const verified = Boolean(player?.dgaVerified) || (player?.clearanceLevel ?? 1) >= 2;
          return (
            verified &&
            dgaRep >= 40 + targetRank * 5 &&
            Math.max(cyberLvl, cryptoLvl) >= Math.max(1, Math.ceil(targetRank / 2))
          );
        },
        requirementSummary: (targetRank) =>
          `Verified DGA Identity/Clearance, DGA Reputation ≥ ${40 + targetRank * 5}, and CyberSecurity/Cryptography Lv.${Math.max(1, Math.ceil(targetRank / 2))}+`,
      },
      {
        id: 'dga-field-forensics',
        label: 'Forensic Case Resolution & Kernel Containment',
        pathwayType: 'achievement',
        description: 'Advance through solved DGA/TRACE forensic cases and quarantined rogue PRISM threads.',
        isMet: (player, targetRank) => {
          const solved = Array.isArray(player?.solvedInvestigationCaseIds) ? player.solvedInvestigationCaseIds.length : 0;
          const quarantined = Array.isArray(player?.quarantinedProcessPids) ? player.quarantinedProcessPids.length : 0;
          const dgaMissions = getCompletedMissionsForTrack(player, 'dga');
          return solved + quarantined + dgaMissions >= targetRank && (solved >= 1 || quarantined >= 1);
        },
        requirementSummary: (targetRank) =>
          `Complete ${targetRank}+ combined forensic cases, kernel quarantines, or DGA tactical directives (including ≥1 case or quarantine)`,
      },
    ],
  },
  archivist: {
    track: 'archivist',
    department: 'City Library & Royal Historical Society',
    rankTitles: [
      'Stacks Junior Clerk',
      'Manuscript Preservationist',
      'Curator of Restricted Folios',
      'Senior Resonance Archivist',
      'Keeper of the Purge Ledger',
      'Grand Master of Records',
    ],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: 'arch-scholarly-credential',
        label: 'Academic Scholarship & Library Certification',
        pathwayType: 'institutional',
        description: 'Advance through Cyacademy coursework, Research skill, and Royal Archive reputation.',
        isMet: (player, targetRank) => {
          const resLvl = player?.skills?.Research?.level ?? 1;
          const archRep = player?.reputation?.archive ?? 30;
          const studied = Boolean(player?.housingCalibrated);
          return studied && resLvl >= Math.max(1, Math.ceil(targetRank / 2)) && archRep >= 30 + targetRank * 5;
        },
        requirementSummary: (targetRank) =>
          `Completed Academic Study, Research Skill Lv.${Math.max(1, Math.ceil(targetRank / 2))}+, and Archive Reputation ≥ ${30 + targetRank * 5}`,
      },
      {
        id: 'arch-field-decryption',
        label: 'Independent Archive Decryption & Relic Discovery',
        pathwayType: 'achievement',
        description: 'Advance by inspecting restricted pre-Collapse files, decrypting lineage records, and attuning shrines.',
        isMet: (player, targetRank) => {
          const inspected = Array.isArray(player?.inspectedFiles) ? player.inspectedFiles.length : 0;
          const shrines = Array.isArray(player?.discoveredShrines) ? player.discoveredShrines.length : 0;
          const archMissions = getCompletedMissionsForTrack(player, 'archivist');
          return inspected + shrines + archMissions >= targetRank && (inspected >= 1 || archMissions >= 1);
        },
        requirementSummary: (targetRank) =>
          `Inspect ${targetRank}+ archival files, shrines, or restoration batches (including ≥1 archive inspection or restoration)`,
      },
    ],
  },
  engineer: {
    track: 'engineer',
    department: 'Tech Labs & Municipal Infrastructure',
    rankTitles: [
      'Bench Apprentice',
      'Junior Conduit Technician',
      'Systems Integration Engineer',
      'Senior Firmware Architect',
      'Principal Grid Synthesizer',
      'Chief Systems Synthesizer',
    ],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: 'eng-accredited-exam',
        label: 'Federal Engineering Accreditation & Coursework',
        pathwayType: 'institutional',
        description: 'Advance through Engineering/Programming skills and completed accreditation exams (#ENG-404).',
        isMet: (player, targetRank) => {
          const engLvl = player?.skills?.Engineering?.level ?? 1;
          const progLvl = player?.skills?.Programming?.level ?? 1;
          const completed: string[] = Array.isArray(player?.completedWorknetMissionIds)
            ? player.completedWorknetMissionIds
            : [];
          const hasExam = completed.includes('ms-dev-01') || Boolean(player?.housingCalibrated);
          return hasExam && Math.max(engLvl, progLvl) >= Math.max(1, Math.ceil(targetRank / 2));
        },
        requirementSummary: (targetRank) =>
          `Complete Accreditation Exam #ENG-404 (or Academic Study) and Engineering/Programming Lv.${Math.max(1, Math.ceil(targetRank / 2))}+`,
      },
      {
        id: 'eng-practical-bench',
        label: 'Practical Bench Repairs & Protocol Synthesis',
        pathwayType: 'practical',
        description: 'Advance through hands-on relay repairs, kernel thread isolation, and SpellForge compiler synthesis.',
        isMet: (player, targetRank) => {
          const engMissions = getCompletedMissionsForTrack(player, 'engineer');
          const quarantined = Array.isArray(player?.quarantinedProcessPids) ? player.quarantinedProcessPids.length : 0;
          const forged = Array.isArray(player?.forgedSpells) ? player.forgedSpells.length : 1;
          return engMissions + quarantined + Math.max(0, forged - 1) >= targetRank;
        },
        requirementSummary: (targetRank) =>
          `Complete ${targetRank}+ practical engineering repairs, process quarantines, or newly compiled SpellForge protocols`,
      },
    ],
  },
  finance: {
    track: 'finance',
    department: 'Oryn Department of Finance',
    rankTitles: [
      'Junior Ledger Clerk',
      'Disbursement Auditor',
      'Senior Treasury Examiner',
      'Municipal Comptroller',
      'Director of Fiscal Routing',
      'Master of the Treasury',
    ],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: 'fin-audit-credential',
        label: 'Treasury Audit Certification & Ledger Verification',
        pathwayType: 'institutional',
        description: 'Advance by completing verified ledger reconciliations and wire audits.',
        isMet: (player, targetRank) => {
          const finMissions = getCompletedMissionsForTrack(player, 'finance');
          const claimedPortals: string[] = Array.isArray(player?.claimedPortalActionIds)
            ? player.claimedPortalActionIds
            : [];
          const wireAudited = claimedPortals.includes('bank-wire-0994');
          return finMissions + (wireAudited ? 1 : 0) >= Math.min(2, targetRank);
        },
        requirementSummary: (targetRank) =>
          `Complete ${Math.min(2, targetRank)}+ Treasury ledger reconciliations or Oryn Bank wire audits`,
      },
    ],
  },
  diplomat: {
    track: 'diplomat',
    department: 'Civic Administration & Council Chambers',
    rankTitles: [
      'Council Aide',
      'Regional Liaison Attaché',
      'Bilateral Treaty Mediator',
      'Senior Envoy of Aureline',
      'High Council Chancellor',
      'Plenipotentiary Ambassador',
    ],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: 'dip-treaty-credential',
        label: 'Diplomatic Mediation & Delegation Standing',
        pathwayType: 'institutional',
        description: 'Advance through treaty mediation (#DIP-201), Communication skill, and Delegation reputation.',
        isMet: (player, targetRank) => {
          const dipMissions = getCompletedMissionsForTrack(player, 'diplomat');
          const delRep = player?.reputation?.delegation ?? 25;
          const commLvl = player?.skills?.Communication?.level ?? 1;
          return (dipMissions >= 1 || delRep >= 30 + targetRank * 5) && commLvl >= Math.max(1, Math.ceil(targetRank / 2));
        },
        requirementSummary: (targetRank) =>
          `Complete Treaty Mediation #DIP-201 (or Delegation Rep ≥ ${30 + targetRank * 5}) and Communication Lv.${Math.max(1, Math.ceil(targetRank / 2))}+`,
      },
    ],
  },
  warden: {
    track: 'warden',
    department: 'Arcadia Ecological Reserve',
    rankTitles: [
      'Botanical Trainee',
      'Perimeter Field Warden',
      'Bio-Assay Conservationist',
      'Senior Biosphere Keeper',
      'High Steward of the Domes',
      'Guardian of Arcadia',
    ],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: 'war-field-stewardship',
        label: 'Ecological Field Assays & Shrine Stewardship',
        pathwayType: 'practical',
        description: 'Advance through Arcadia spectral bio-assays and regional elemental shrine attunements.',
        isMet: (player, targetRank) => {
          const warMissions = getCompletedMissionsForTrack(player, 'warden');
          const shrines = Array.isArray(player?.discoveredShrines) ? player.discoveredShrines.length : 0;
          return warMissions + shrines >= targetRank;
        },
        requirementSummary: (targetRank) =>
          `Complete ${targetRank}+ Arcadia bio-assays or regional elemental shrine attunements`,
      },
    ],
  },
  questnotice: {
    track: 'questnotice',
    department: 'QUESTNOTICE Civic Dispatch',
    rankTitles: [
      'Errand Runner',
      'Reliable Courier',
      'District Troubleshooter',
      'Senior Civic Contractor',
      'Prime Field Coordinator',
      'Aureline Fixer',
    ],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: 'qn-practical-contracts',
        label: 'Practical Street Contracts & Independent Work',
        pathwayType: 'practical',
        description: 'Advance directly through completed QUESTNOTICE contracts and neighborhood reliability—no formal degree required.',
        isMet: (player, targetRank) => {
          const qnMissions = getCompletedMissionsForTrack(player, 'questnotice');
          const completedNotices = Array.isArray(player?.completedNoticeIds) ? player.completedNoticeIds.length : 0;
          return qnMissions + Math.max(0, completedNotices - 1) >= targetRank;
        },
        requirementSummary: (targetRank) =>
          `Complete ${targetRank}+ practical QUESTNOTICE odd jobs or verified Notice Board tasks`,
      },
    ],
  },
};

export function evaluateCareerPromotion(
  track: string,
  player: any
): {
  currentRankIndex: number;
  currentTitle: string;
  nextRankIndex: number | null;
  nextTitle: string | null;
  currentXP: number;
  requiredXP: number;
  xpMet: boolean;
  qualifiedPathway: CareerAdvancementPathway | null;
  pathwayStatuses: { id: string; label: string; pathwayType: string; met: boolean; summary: string }[];
  canPromote: boolean;
  reason: string;
} {
  const careerObj = player?.careers?.[track] || { rankIndex: 0, xp: 0, title: track };
  const currentRankIndex = typeof careerObj.rankIndex === 'number' ? careerObj.rankIndex : 0;
  const currentXP = typeof careerObj.xp === 'number' ? careerObj.xp : 0;

  const spec = CAREER_TRACK_SPECS[track] || {
    track,
    department: track.toUpperCase(),
    rankTitles: ['Trainee', 'Junior', 'Practitioner', 'Senior', 'Lead', 'Master'],
    xpThresholds: [0, 100, 220, 360, 520, 700],
    pathways: [
      {
        id: `${track}-general`,
        label: 'Verified Professional Experience',
        pathwayType: 'practical' as const,
        description: 'Complete verified assignments and build skill proficiency.',
        isMet: (p: any, targetRank: number) =>
          (Array.isArray(p?.completedWorknetMissionIds) ? p.completedWorknetMissionIds.length : 0) >= targetRank,
        requirementSummary: (targetRank: number) => `Complete ${targetRank}+ verified WorkNet assignments`,
      },
    ],
  };

  const currentTitle = spec.rankTitles[currentRankIndex] || careerObj.title || spec.rankTitles[0];
  if (currentRankIndex >= 5) {
    return {
      currentRankIndex,
      currentTitle,
      nextRankIndex: null,
      nextTitle: null,
      currentXP,
      requiredXP: spec.xpThresholds[5],
      xpMet: true,
      qualifiedPathway: null,
      pathwayStatuses: [],
      canPromote: false,
      reason: 'Maximum career rank achieved.',
    };
  }

  const nextRankIndex = currentRankIndex + 1;
  const nextTitle = spec.rankTitles[nextRankIndex] || `Rank ${nextRankIndex}`;
  const requiredXP = spec.xpThresholds[nextRankIndex] ?? nextRankIndex * 120;
  const xpMet = currentXP >= requiredXP;

  const pathwayStatuses = spec.pathways.map((pw) => ({
    id: pw.id,
    label: pw.label,
    pathwayType: pw.pathwayType,
    met: pw.isMet(player, nextRankIndex),
    summary: pw.requirementSummary(nextRankIndex),
  }));

  const qualifiedPathway = spec.pathways.find((pw) => pw.isMet(player, nextRankIndex)) || null;
  const canPromote = xpMet && Boolean(qualifiedPathway);

  let reason = '';
  if (canPromote && qualifiedPathway) {
    reason = `Qualified for promotion to ${nextTitle} via ${qualifiedPathway.label}!`;
  } else if (!xpMet && !qualifiedPathway) {
    reason = `Requires ${requiredXP} Career XP (currently ${currentXP} XP) AND at least one ${spec.department} qualification pathway: ${pathwayStatuses.map((p) => p.summary).join(' OR ')}.`;
  } else if (!xpMet) {
    reason = `Qualification pathway met (${qualifiedPathway?.label}), but requires ${requiredXP} Career XP (currently ${currentXP} XP).`;
  } else {
    reason = `Career XP threshold met (${currentXP}/${requiredXP} XP), but promotion to ${nextTitle} requires a profession qualification: ${pathwayStatuses.map((p) => `[${p.label}: ${p.summary}]`).join(' OR ')}.`;
  }

  return {
    currentRankIndex,
    currentTitle,
    nextRankIndex,
    nextTitle,
    currentXP,
    requiredXP,
    xpMet,
    qualifiedPathway,
    pathwayStatuses,
    canPromote,
    reason,
  };
}

export const worldEventEngine = new WorldEventEngine();


