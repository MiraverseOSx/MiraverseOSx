import {
  DGACase,
  CaseBlueprint,
  DGASystem,
  Classification,
  Priority,
  Objective,
  Task,
  EvidenceItem,
  PersonReference,
  OrganizationReference,
  LocationReference
} from '@/lib/dga-types';

export type CaseComplexity = 'QUICK_INCIDENT' | 'STANDARD_CASE' | 'MAJOR_OPERATION';
export type CaseDomain =
  | 'MEDICAL'
  | 'CYBER'
  | 'INVESTIGATIVE'
  | 'INTELLIGENCE'
  | 'DIPLOMATIC'
  | 'PUBLIC_HEALTH'
  | 'PROTECTIVE'
  | 'INTERNAL_AFFAIRS'
  | 'VEHICULAR'
  | 'HYBRID';

export interface GenerateCaseOptions {
  complexity?: CaseComplexity;
  domain?: CaseDomain;
  seed?: number;
  enableCrossSystem?: boolean;
}

export function generateProceduralCaseWithBlueprint(
  options: GenerateCaseOptions = {}
): { dgaCase: DGACase; blueprint: CaseBlueprint } {
  const seed = options.seed || Math.floor(10000000 + Math.random() * 89999999);
  const complexity = options.complexity || 'STANDARD_CASE';
  const domain = options.domain || 'HYBRID';
  const now = new Date().toISOString();

  // Pseudo-random helper from seed
  let currentSeed = seed;
  const nextRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  const caseNumber = Math.floor(100 + nextRandom() * 899);
  const prefix = domain === 'CYBER' ? 'CYB' : domain === 'MEDICAL' ? 'MED' : 'DGA';
  const caseId = `${prefix}-26-${caseNumber}`;

  // Domain configurations
  const leadSystemMap: Record<CaseDomain, DGASystem> = {
    MEDICAL: 'MEDSTAT',
    CYBER: 'CIPHER',
    INVESTIGATIVE: 'TRACE',
    INTELLIGENCE: 'ORACLE',
    DIPLOMATIC: 'CIVITAS',
    PUBLIC_HEALTH: 'MEDSTAT',
    PROTECTIVE: 'AEGIS',
    INTERNAL_AFFAIRS: 'CIVITAS',
    VEHICULAR: 'TRACE',
    HYBRID: 'TRACE'
  };

  const leadSystem = leadSystemMap[domain] || 'TRACE';
  const supportingSystems: DGASystem[] = options.enableCrossSystem !== false
    ? [leadSystem === 'TRACE' ? 'ORACLE' : 'TRACE', 'COMMS', 'AEGIS']
    : ['COMMS'];

  const titles: Record<CaseDomain, string[]> = {
    MEDICAL: [
      'Operation White Toxin: Acute Organophosphate Outbreak',
      'Operation Pulse Check: Unclassified Pathogen Ingress',
      'Operation St. Jude: Critical Bio-Sample Diversion'
    ],
    CYBER: [
      'Operation Cold Firewall: ICS Gateway Zero-Day Breach',
      'Operation Black Lattice: Naval Telemetry Infiltration',
      'Operation Zero Carrier: Critical SCADA Logic Override'
    ],
    INVESTIGATIVE: [
      'Operation Broken Seal: Tampered Consular Evidence Pouch',
      'Operation Glass Shard: Dual-Use Chemical Contraband Intercept',
      'Operation Silent Ledger: Illicit Synthesis Funding Flow'
    ],
    INTELLIGENCE: [
      'Operation Nightfall Echo: Foreign Attache Clandestine Contact',
      'Operation Iron Falcon: Satellite Telemetry Incursion',
      'Operation Deep Horizon: Eurasian Syndicate Intercept'
    ],
    DIPLOMATIC: [
      'Operation Sovereign Wire: Consular Immunity Abuse Inquiry',
      'Operation Velvet Pouch: Missing Extraterritorial Treaty Archive',
      'Operation Diplomatic Shield: Embassy Row Security Compromise'
    ],
    PUBLIC_HEALTH: [
      'Operation Bio-Watch: Regional Municipal Water Supply Alarm',
      'Operation Clean Air: Metro Subterranean HEPA Breach'
    ],
    PROTECTIVE: [
      'Operation Safe Haven: Ambassadorial Protective Perimeter Breach',
      'Operation Border Gate: Hazardous Cargo Interdiction'
    ],
    INTERNAL_AFFAIRS: [
      'Operation Grey Ledger: Unauthorized Wiretap Telemetry Leak',
      'Operation Clean Badge: Counter-Intelligence Audit'
    ],
    VEHICULAR: [
      'Operation Apex Drift: High-Speed Motorcycle Guardrail Fatal Collision',
      'Operation Asphalt Black: Highway 17 Telematics Sabotage & Crash',
      'Operation Redline: Autonomous Vehicle CAN-Bus Collision Override'
    ],
    HYBRID: [
      'Operation Obsidian Veil: Multi-System Diplomatic & Cyber Intrusion',
      'Operation Crossfire: Coordinated Biometric & SCADA Sabotage'
    ]
  };

  const domainTitles = titles[domain] || titles.HYBRID;
  const title = domainTitles[Math.floor(nextRandom() * domainTitles.length)];

  // Objectives
  const objectives: Objective[] = [
    {
      id: `OBJ-${caseNumber}-1`,
      title: 'Establish Incident Perimeter and Quarantine Physical Evidence',
      description: 'Deploy investigative protocols and secure all primary scene materials under chain of custody.',
      completed: false
    },
    {
      id: `OBJ-${caseNumber}-2`,
      title: 'Conduct Multi-System Forensic Characterization',
      description: 'Transfer digital, biological, or chemical specimens to TRACE and partner agencies.',
      completed: false
    }
  ];

  if (complexity !== 'QUICK_INCIDENT') {
    objectives.push({
      id: `OBJ-${caseNumber}-3`,
      title: 'Neutralize Threat Network and Execute Interdiction',
      description: 'Identify source broker and coordinate federal warrant with AEGIS field units.',
      completed: false
    });
  }

  // Tasks
  const tasks: Task[] = [
    {
      id: `TSK-${caseNumber}-01`,
      objectiveId: `OBJ-${caseNumber}-1`,
      title: 'Secure Primary Incident Scene and Review Access Logs',
      description: 'Verify all electronic badge readers and security logs within the past 4 hours.',
      completed: false,
      assignedTo: 'Special Agent Miracle Jerome',
      phase: 'Preliminary'
    },
    {
      id: `TSK-${caseNumber}-02`,
      objectiveId: `OBJ-${caseNumber}-2`,
      title: 'Package Recovered Artifacts and Submit to TRACE',
      description: 'Transfer physical specimens to TRACE Forensic Laboratory under chain of custody.',
      completed: false,
      assignedTo: 'Special Agent Miracle Jerome',
      phase: 'Forensic Analysis'
    }
  ];

  if (complexity !== 'QUICK_INCIDENT') {
    tasks.push(
      {
        id: `TSK-${caseNumber}-03`,
        objectiveId: `OBJ-${caseNumber}-2`,
        title: 'Review Attending Physician / Site Supervisor Report',
        description: 'Interview lead on-scene personnel regarding anomalous symptoms or system behavior.',
        completed: false,
        assignedTo: 'Special Agent Miracle Jerome',
        phase: 'Active Investigation'
      },
      {
        id: `TSK-${caseNumber}-04`,
        objectiveId: `OBJ-${caseNumber}-3`,
        title: 'Cross-reference Intelligence Intercepts in ORACLE',
        description: 'Verify if telemetry signatures match known entities on federal watchlists.',
        completed: false,
        assignedTo: 'ORACLE Liaison Desk',
        phase: 'Active Investigation'
      }
    );
  }

  // Evidence
  const evidence: EvidenceItem[] = [
    {
      id: `EV-${caseNumber}-A`,
      title: `Recovered Physical Specimen ${caseNumber}-1`,
      category: domain === 'CYBER' ? 'Digital Media' : 'Toxicological Specimen',
      description: 'Primary physical evidence item collected directly from the active incident scene.',
      locationFound: 'Scene of Occurrence',
      dateRecovered: now,
      custodyStatus: 'In DGA Custody',
      secureHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'
    }
  ];

  // People & Orgs
  const people: PersonReference[] = [
    {
      personId: 'P-103',
      name: 'Viktor Krell ("The Glassmaker")',
      role: 'Suspected Chemical / Supply Broker',
      affiliation: 'Red Dawn Syndicate',
      threatLevel: 'Severe',
      status: 'Under Active Surveillance'
    },
    {
      personId: 'P-102',
      name: 'Dr. Gregory Thorne',
      role: 'Consulting Toxicologist',
      affiliation: 'St. Jude Metropolitan Hospital',
      threatLevel: 'Low',
      status: 'Cooperating Medical Staff'
    }
  ];

  const organizations: OrganizationReference[] = [
    {
      organizationId: 'ORG-04',
      name: 'Phoenix Biotech Ltd.',
      type: 'Target Entity',
      roleInCase: 'Suspected origin point of diverted reagents'
    },
    {
      organizationId: 'ORG-05',
      name: 'TRACE Central Forensic Facility',
      type: 'Forensic Lab',
      roleInCase: 'Authorized laboratory testing facility'
    }
  ];

  const locations: LocationReference[] = [
    {
      locationId: 'LOC-04',
      name: 'Harbor Free-Trade Zone Warehouse 18',
      significance: 'Suspected dead-drop and storage point'
    }
  ];

  // Blueprint (Hidden Truth)
  const blueprint: CaseBlueprint = {
    caseId,
    seed,
    incident: title,
    initiatingEvent: `Operational alarm triggered under ${domain} domain protocol.`,
    hiddenTruth: {
      culprit: 'Viktor Krell and foreign consular conduit',
      cause: 'Deliberate tactical sabotage using diverted dual-use precursors',
      secretConnection: 'Tied to ongoing Eurasian financial laundering network',
      hiddenEvidence: [
        'Hidden encrypted USB drive disguised as a key fob in suspect vehicle',
        'Chemical synthesis log with batch matching Phoenix Biotech order 8812'
      ],
      futureTwist: 'The primary target was a diversion to enable high-value defection',
      correctDiagnosis: 'Complex state-sponsored multi-domain operation',
      intelligenceSource: 'Station Geneva SAT-Link Intercept',
      finalLocation: 'Harbor Free-Trade Zone Warehouse 18'
    },
    knownFacts: [
      'Incident occurred under federal jurisdiction.',
      'Primary physical evidence in DGA custody.'
    ],
    unknownFacts: [
      'Direct link to Phoenix Biotech harbor warehouse.',
      'Offshore funding shell company in Zurich.'
    ],
    falseLeads: [
      'Initial witness reported seeing an unmarked black van (later identified as routine delivery).'
    ],
    systemConnections: [leadSystem, ...supportingSystems],
    escalationRules: [
      'If tasks not completed within 2 hours, suspect attempts flight via maritime container.',
      'If TRACE analysis confirms synthetic agent, elevate priority to Critical.'
    ],
    resolutionConditions: [
      'Submit evidence to TRACE and receive confirmed laboratory finding.',
      'Execute tactical warrant at Harbor Warehouse 18.'
    ]
  };

  const dgaCase: DGACase = {
    id: caseId,
    title,
    classification: domain === 'INTERNAL_AFFAIRS' ? 'TOP SECRET // SPECIAL ACCESS REQUIRED' : 'TOP SECRET // NOFORN',
    status: 'Active',
    priority: complexity === 'MAJOR_OPERATION' ? 'Critical' : 'High',
    leadSystem,
    supportingSystems,
    assignedAgents: ['Special Agent Miracle Jerome'],
    summary: `Active ${domain.toLowerCase()} investigation initiated following alarming telemetry. Multi-system DGA coordination required. Evidence recovered and staged for laboratory processing.`,
    objectives,
    tasks,
    evidence,
    people,
    organizations,
    locations,
    communications: [],
    documents: [],
    forensicRequests: [],
    timeline: [
      {
        id: `TL-${Date.now()}`,
        timestamp: now,
        type: 'CASE_OPENED',
        actor: 'DGA Procedural Assignment Engine',
        description: `Case ${caseId} generated from blueprint (Seed: ${seed}, Complexity: ${complexity}).`
      }
    ],
    notes: [],
    createdAt: now,
    updatedAt: now
  };

  return { dgaCase, blueprint };
}
