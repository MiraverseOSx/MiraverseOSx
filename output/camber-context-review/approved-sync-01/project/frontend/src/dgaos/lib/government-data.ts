// Government, Executive Briefings, National Security Directives, and Cabinet Crisis Decisions

export interface BriefingBookItem {
  id: string;
  title: string;
  classification: 'TOP SECRET // SPECIAL ACCESS REQUIRED' | 'SECRET // NOFORN' | 'CONFIDENTIAL';
  preparedBy: string;
  targetAudience: string; // e.g. "President of the United States & National Security Council"
  date: string;
  executiveSummary: string;
  keyThreats: string[];
  strategicOptions: string[];
  caseId: string;
}

export interface DiplomaticCable {
  id: string;
  station: string; // e.g. "EMBASSY GENEVA"
  precedence: 'FLASH / IMMEDIATE' | 'PRIORITY' | 'ROUTINE';
  subject: string;
  classification: string;
  timestamp: string;
  body: string;
  sourceOfficial: string;
  actionRequired: boolean;
  caseId: string;
}

export interface RiskAssessmentItem {
  domain: 'Geopolitical Fallout' | 'Public Health & Bio-Panic' | 'Evidentiary Chain & Prosecution' | 'Maritime Trade Disruption';
  currentRiskLevel: 'Low' | 'Moderate' | 'High' | 'Catastrophic';
  score: number; // 0 - 100
  mitigationStrategy: string;
  vulnerabilityFactor: string;
}

export interface ExecutivePolicyDecision {
  id: string;
  title: string;
  crisisContext: string;
  options: Array<{
    id: string;
    label: string;
    doctrine: string;
    immediateConsequences: string[];
    downstreamEffects: string[];
    riskShifts: {
      geopolitical: number; // delta
      publicPanic: number;
      evidenceIntegrity: number;
    };
  }>;
  selectedOptionId?: string;
  enactedAt?: string;
  enactedBy?: string;
  caseId: string;
}

export interface CabinetTranscriptEntry {
  speaker: string;
  role: string;
  timestamp: string;
  dialogue: string;
}

export const INITIAL_BRIEFING_BOOK: BriefingBookItem = {
  id: 'PDB-2026-104',
  title: 'Presidential Daily Brief (PDB): Clandestine Neurotoxin Vector at Embassy Row',
  classification: 'TOP SECRET // SPECIAL ACCESS REQUIRED',
  preparedBy: 'Directorate of Global Affairs & Federal Intelligence Council',
  targetAudience: 'President, National Security Advisor, Attorney General',
  date: '2026-09-29 07:00 UTC',
  executiveSummary:
    'Forensic and chemical attribution confirms that the collapse of Ambassador Christian Vance in Embassy Suite 400 was induced by an uncatalogued methylphosphonofluoridate synthetic neurotoxin. The chemical signature directly matches precursors brokered through Phoenix Biotech and fugitive broker Viktor Krell. Intelligence indicates the perpetrators intend to exfiltrate secondary canisters via the freighter M/V Phoenix Dawn from Pier 42 at 22:00 UTC.',
  keyThreats: [
    'Potential second-strike dispersion if secondary chemical canisters escape harbor maritime cordon.',
    'Diplomatic crisis: Foreign host nation asserting sovereign immunity over Embassy Suite 400 crime scene.',
    'Severe bio-panic if media discovers nerve agent synthesis inside municipal harbor facility.',
  ],
  strategicOptions: [
    'Option A: Authorize federal tactical boarding of M/V Phoenix Dawn in international waters under Maritime Security Act.',
    'Option B: Seal Pier 42 with local SWAT under Covert Quarantine Protocol to prevent public leak.',
    'Option C: Demand immediate diplomatic waiver from host nation to seize all embassy CCTV servers and catering staff.',
  ],
  caseId: 'GOV-2026-0052',
};

export const INITIAL_DIPLOMATIC_CABLES: DiplomaticCable[] = [
  {
    id: 'CABLE-GNV-881',
    station: 'STATION GENEVA',
    precedence: 'FLASH / IMMEDIATE',
    subject: 'DEMARCHE WARNING: EURASIAN MISSION PROTESTS SUITE 400 SEIZURE',
    classification: 'SECRET // NOFORN',
    timestamp: '2026-09-29 06:45 UTC',
    body:
      'Consular staff at Geneva have lodged an urgent diplomatic protest regarding DGA investigators cordoning Embassy Suite 400. They assert that the suite remains sovereign territory under the Vienna Convention on Diplomatic Relations. They threaten expulsion of commercial agricultural attachés if criminal forensics continue without bilateral observer presence.',
    sourceOfficial: 'Deputy Chief Miller, Geneva Enclave',
    actionRequired: true,
    caseId: 'GOV-2026-0052',
  },
  {
    id: 'CABLE-LON-412',
    station: 'STATION LONDON (FCDO LIAISON)',
    precedence: 'PRIORITY',
    subject: 'FINANCIAL INTELLIGENCE: PHOENIX BIOTECH SHELL SUBSIDIARY ASSETS FROZEN',
    classification: 'CONFIDENTIAL',
    timestamp: '2026-09-29 05:20 UTC',
    body:
      'His Majesty’s Treasury has enacted emergency asset freeze order #UK-8820 on London-registered broker accounts associated with Viktor Krell. Over 4.2 million GBP in liquid escrow accounts blocked pending formal extradition request.',
    sourceOfficial: 'Senior Liaison Officer Thorne, London',
    actionRequired: false,
    caseId: 'GOV-2026-0052',
  },
];

export const INITIAL_RISK_ASSESSMENT: RiskAssessmentItem[] = [
  {
    domain: 'Geopolitical Fallout',
    currentRiskLevel: 'High',
    score: 78,
    mitigationStrategy: 'Offer joint bilateral forensic observation of LC-MS/MS spectral verification.',
    vulnerabilityFactor: 'Host nation may expel Western trade attachés and terminate energy treaty talks.',
  },
  {
    domain: 'Public Health & Bio-Panic',
    currentRiskLevel: 'Moderate',
    score: 55,
    mitigationStrategy: 'Maintain biological containment at Metro Hospital ICU and suppress public press statements until harbor depot is neutralized.',
    vulnerabilityFactor: 'Vance death leak to The Daily Chronicle could spark mass civilian hospital rush.',
  },
  {
    domain: 'Evidentiary Chain & Prosecution',
    currentRiskLevel: 'High',
    score: 82,
    mitigationStrategy: 'Execute formal 4th Amendment emergency affidavit before midnight ship departure.',
    vulnerabilityFactor: 'Defense counsel will challenge extraterritorial jurisdiction if warrant lacks presidential warrant seal.',
  },
  {
    domain: 'Maritime Trade Disruption',
    currentRiskLevel: 'Moderate',
    score: 48,
    mitigationStrategy: 'Targeted tactical boarding of Berth 3 only, leaving container shipping channels open.',
    vulnerabilityFactor: 'Full port shutdown costs regional economy $14M per hour in delayed container freight.',
  },
];

export const INITIAL_EXECUTIVE_DECISIONS: ExecutivePolicyDecision[] = [
  {
    id: 'DEC-GOV-01',
    title: 'Executive Order on Pier 42 Maritime Interdiction & Biosecurity Cordon',
    crisisContext:
      'Freighter M/V Phoenix Dawn is scheduled to cast off at 22:00 UTC carrying fugitive Viktor Krell and clandestine neurotoxin stockpiles. Choose the executive posture for federal interdiction.',
    options: [
      {
        id: 'OPT-TACTICAL-RAID',
        label: 'Authorize Immediate Hostage Rescue & Tactical SWAT Boarding',
        doctrine: 'Aggressive Intervention Doctrine',
        immediateConsequences: [
          'Coast Guard and DGA Tactical Unit Alpha deployed to Pier 42 Berth 3.',
          'Arrest warrants unsealed for Viktor Krell and crew.',
          'Harbor District placed under Level 3 HazMat lockdown.',
        ],
        downstreamEffects: [
          'High probability of recovering intact cryogenic neurotoxin cylinders.',
          'Risk of armed confrontation at dockside.',
          'Generates breaking news story in The Daily Chronicle.',
        ],
        riskShifts: {
          geopolitical: -15,
          publicPanic: +25,
          evidenceIntegrity: +30,
        },
      },
      {
        id: 'OPT-COVERT-TAG',
        label: 'Plant Satellite Transponder and Interdict in International Waters',
        doctrine: 'Covert Maritime Containment Doctrine',
        immediateConsequences: [
          'Specialist Marcus Chen activates stealth GPS beacon on ship hull.',
          'Freighter allowed to leave harbor under naval surveillance.',
          'Zero civilian disruption or immediate press leak.',
        ],
        downstreamEffects: [
          'Keeps public panic at zero.',
          'Risk that Krell jettisons neurotoxin into deep ocean if alerted.',
          'Delays immediate suspect interrogation by 48 hours.',
        ],
        riskShifts: {
          geopolitical: +10,
          publicPanic: -30,
          evidenceIntegrity: -10,
        },
      },
    ],
    caseId: 'GOV-2026-0052',
  },
];

export const CABINET_TRANSCRIPT: CabinetTranscriptEntry[] = [
  {
    speaker: 'Director Donald Sterling',
    role: 'Executive Director of Agency Operations',
    timestamp: '06:30 UTC',
    dialogue:
      '“Mr. President, our TRACE toxicology bench confirms this was an orchestrated chemical assassination using a synthetic organophosphate analog. Ambassador Vance is on life support at Metro Hospital. The broker is holed up at Pier 42.”',
  },
  {
    speaker: 'National Security Advisor',
    role: 'Executive Office of the President',
    timestamp: '06:32 UTC',
    dialogue:
      '“If we board that Panamanian-flagged ship at dockside, Eurasia will claim we manufactured the incident to derail the trade agreement. We need ironclad spectral proof before the cameras roll.”',
  },
  {
    speaker: 'Special Agent Miracle Jerome',
    role: 'Lead Case Investigator [HQ-04]',
    timestamp: '06:35 UTC',
    dialogue:
      '“The evidence is airtight, sir. We have the CCTV showing midnight canister delivery, the ALPR license plate matching Phoenix Biotech, and the exact mass spec molecular weight matching Krell’s Zurich synthesis notes. We cannot let that ship reach open water.”',
  },
  {
    speaker: 'Attorney General',
    role: 'Department of Justice',
    timestamp: '06:38 UTC',
    dialogue:
      '“I have already prepared the Title III national security wiretap and emergency search warrant affidavits. If the President signs the directive, we can execute before 18:00.”',
  },
];
