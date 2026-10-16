import { NPCProfile } from '@/lib/dga-types';

export const seedNPCs: NPCProfile[] = [
  {
    id: 'NPC-THORNE',
    name: 'Dr. Gregory Thorne',
    occupation: 'Chief of Critical Toxicology & Emergency Medicine',
    organization: 'St. Jude Metropolitan Hospital',
    relationship: {
      trust: 78,
      familiarity: 65,
      respect: 85,
      tension: 20
    },
    knowledge: [
      'Ambassador Vance exhibits non-standard cholinesterase depression (<28%).',
      'Standard pralidoxime failed to reverse neuromuscular block.',
      'Suspects synthetic fluorophosphate analog with lipophilic carrier solvent.'
    ],
    secrets: [
      'St. Jude board was pressured by private donor to suppress public pathogen reports.'
    ],
    currentConcerns: [
      'Cellular degradation of Vance blood samples without high-res mass spec.',
      'Potential contamination of ICU staff if compound is vapor-active.'
    ],
    communicationStyle: 'clinical_scientific',
    lastInteraction: '2026-09-29T06:14:00Z'
  },
  {
    id: 'NPC-CROSS',
    name: 'Director Evelyn Cross',
    occupation: 'Executive Director',
    organization: 'Department of Global Affairs',
    relationship: {
      trust: 90,
      familiarity: 70,
      respect: 92,
      tension: 15
    },
    knowledge: [
      'Cabinet briefed on potential foreign covert action.',
      'Authorized multi-system taskforce mobilization under Directive 44.'
    ],
    secrets: [
      'State Department attempted back-channel negotiations with Eurasia before the summit.'
    ],
    currentConcerns: [
      'Diplomatic summit collapse causing international treaty breach.',
      'Congressional oversight leakage.'
    ],
    communicationStyle: 'bureaucratic',
    lastInteraction: '2026-09-28T22:00:00Z'
  },
  {
    id: 'NPC-MILLER',
    name: 'Deputy Chief Miller',
    occupation: 'Station Chief / Liaison Lead',
    organization: 'Station Geneva',
    relationship: {
      trust: 70,
      familiarity: 60,
      respect: 75,
      tension: 30
    },
    knowledge: [
      'Zurich wire transfers match Viktor Krell biometric indicators.',
      'Phoenix Biotech dual-use shipments transited via maritime cargo.'
    ],
    secrets: [
      'Swiss Federal Police running parallel surveillance without DGA disclosure.'
    ],
    currentConcerns: [
      'Krell escaping into non-extradition jurisdiction within 72 hours.'
    ],
    communicationStyle: 'formal_diplomatic',
    lastInteraction: '2026-09-29T05:40:00Z'
  },
  {
    id: 'NPC-CHEN',
    name: 'Specialist Marcus Chen',
    occupation: 'Senior Cyber Defense Analyst',
    organization: 'Cygnus Defense / DGA Cyber Cell',
    relationship: {
      trust: 82,
      familiarity: 80,
      respect: 80,
      tension: 10
    },
    knowledge: [
      'Siemens S7 PLC controllers targeted with custom zero-day payload.',
      'C2 telemetry beacon routed through overseas compromised relay.'
    ],
    secrets: [
      'Found credential re-use originating from an internal contractor workstation.'
    ],
    currentConcerns: [
      'Secondary payload trigger scheduled for grid evening peak hours.'
    ],
    communicationStyle: 'blunt_tactical',
    lastInteraction: '2026-09-29T04:45:00Z'
  },
  {
    id: 'NPC-KRELL',
    name: 'Viktor Krell ("The Glassmaker")',
    occupation: 'Illicit Chemical Synthesis Broker',
    organization: 'Red Dawn Syndicate / Phoenix Bio Shadow Contact',
    relationship: {
      trust: 10,
      familiarity: 25,
      respect: 40,
      tension: 95
    },
    knowledge: [
      'Exact synthesis batch recipe and courier handoff rendezvous.',
      'Identity of the foreign embassy inside source.'
    ],
    secrets: [
      'Possesses secondary precursor canister stored at Harbor Warehouse 18.'
    ],
    currentConcerns: [
      'DGA border net closing before freighter departure.'
    ],
    communicationStyle: 'covert_guarded'
  }
];
