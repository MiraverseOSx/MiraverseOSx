// Investigation Branch: Evidence Locker, Chain of Custody, CCTV Video Feeds,
// Fingerprint AFIS, DNA Serology, Warrants, and Case Reconstruction

export interface EvidenceVaultItem {
  id: string;
  barcode: string;
  title: string;
  category: 'Biological / Toxin' | 'Digital Media' | 'Physical Item' | 'Forensic Swab' | 'Ballistics';
  dateSecured: string;
  securedBy: string;
  storageLocation: string;
  sealStatus: 'Seals Intact' | 'Opened for Bench Examination' | 'Transferred';
  custodyHistory: Array<{
    timestamp: string;
    action: string;
    handledBy: string;
    verifiedSignature: string;
  }>;
  analysisResults?: string;
  caseId: string;
}

export interface CctvCameraFeed {
  id: string;
  cameraName: string;
  location: string;
  status: 'ONLINE RECORDING' | 'MOTION DETECTED' | 'ARCHIVED REVIEW';
  resolution: string;
  currentTimestamp: string;
  videoDuration: string;
  anomalyDetected: boolean;
  anomalyDescription?: string;
  anomalyTimeMarker?: string;
  enhancedPlate?: string;
}

export interface FingerprintAfisRecord {
  id: string;
  specimenLabel: string;
  sourceItem: string;
  patternType: 'Whorl' | 'Right Loop' | 'Left Loop' | 'Arch';
  minutiaeCount: number;
  candidateMatches: Array<{
    candidateName: string;
    ncicId: string;
    score: number; // 0-100
    conclusion: 'MATCH CONFIRMED' | 'EXCLUDED' | 'INCONCLUSIVE';
  }>;
}

export interface DnaCodisProfile {
  id: string;
  specimenLabel: string;
  loci: Array<{
    locusName: string;
    allele1: number;
    allele2: number;
    matchWithSuspect: boolean;
  }>;
  randomMatchProbability: string; // e.g. "1 in 4.2 Quadrillion"
  suspectMatchName: string;
}

export interface SearchWarrantAffidavit {
  id: string;
  targetLocation: string;
  targetPerson: string;
  probableCauseSummary: string;
  supportingEvidenceIds: string[];
  magistrateJudge: string;
  judicialReviewStatus: 'DRAFT AFFIDAVIT' | 'SUBMITTED' | 'WARRANT ISSUED' | 'REJECTED';
  issuedAt?: string;
  expirationHours: number;
}

export const INITIAL_EVIDENCE_VAULT: EvidenceVaultItem[] = [];

export const INITIAL_CCTV_CAMERAS: CctvCameraFeed[] = [
  {
    id: 'CAM-01',
    cameraName: 'CAM-01: Embassy Row Front Boulevard Gate',
    location: 'Exterior Perimeter Gate South',
    status: 'ONLINE RECORDING',
    resolution: '4K 60FPS (HDR)',
    currentTimestamp: '01:40:00 - 02:00:00 UTC',
    videoDuration: '20:00',
    anomalyDetected: false,
    anomalyDescription: 'Normal diplomatic motorcade ingress; no unauthorized vehicles recorded.',
  },
  {
    id: 'CAM-02',
    cameraName: 'CAM-02: Suite 400 Service Corridor & Pantry',
    location: '4th Floor Executive Wing',
    status: 'ARCHIVED REVIEW',
    resolution: '1080p 30FPS Low-Light IR',
    currentTimestamp: '01:41:22 UTC',
    videoDuration: '15:30',
    anomalyDetected: true,
    anomalyDescription: 'Individual in catering uniform placed personalized crystal carafe on podium.',
    anomalyTimeMarker: '01:41:22 UTC',
  },
  {
    id: 'CAM-03',
    cameraName: 'CAM-03: North Service Gate & Delivery Dock',
    location: 'Perimeter Service Ingress',
    status: 'MOTION DETECTED',
    resolution: '4K 60FPS High-Gain Night Vision',
    currentTimestamp: '01:42:09 UTC',
    videoDuration: '12:45',
    anomalyDetected: true,
    anomalyDescription: 'Dark Mercedes Sprinter van cut headlights. Canister handoff to catering courier.',
    anomalyTimeMarker: '01:42:09 UTC',
    enhancedPlate: '7XYZ89',
  },
  {
    id: 'CAM-04',
    cameraName: 'CAM-04: Pier 42 Marine Terminal Berth 3',
    location: 'Harbor Commercial Loading Dock',
    status: 'ONLINE RECORDING',
    resolution: '4K 30FPS Telephoto Optical Zoom',
    currentTimestamp: '02:45:30 UTC',
    videoDuration: '30:00',
    anomalyDetected: true,
    anomalyDescription: 'Van 7XYZ89 parked next to gangway of M/V Phoenix Dawn. Hazmat container staged.',
    anomalyTimeMarker: '02:45:30 UTC',
  },
];

export const INITIAL_AFIS_RECORD: FingerprintAfisRecord = {
  id: 'AFIS-01',
  specimenLabel: 'Latent Print #LP-04 (North Service Gate Lock)',
  sourceItem: 'EV-417-C / Gate Latch Surface',
  patternType: 'Whorl',
  minutiaeCount: 18,
  candidateMatches: [
    {
      candidateName: 'Viktor Krell (DOB: 1974-03-12)',
      ncicId: 'NCIC-KRELL-4912',
      score: 98.4,
      conclusion: 'MATCH CONFIRMED',
    },
    {
      candidateName: 'Julian Paul Vance (DOB: 1971-11-04)',
      ncicId: 'NCIC-VANCE-8821',
      score: 41.2,
      conclusion: 'EXCLUDED',
    },
    {
      candidateName: 'Marcus Chen',
      ncicId: 'NCIC-CHEN-0192',
      score: 12.0,
      conclusion: 'EXCLUDED',
    },
  ],
};

export const INITIAL_CODIS_PROFILE: DnaCodisProfile = {
  id: 'DNA-01',
  specimenLabel: 'Epithelial DNA Swab from Carafe Handle',
  loci: [
    { locusName: 'D3S1358', allele1: 15, allele2: 17, matchWithSuspect: true },
    { locusName: 'vWA', allele1: 16, allele2: 18, matchWithSuspect: true },
    { locusName: 'FGA', allele1: 22, allele2: 24, matchWithSuspect: true },
    { locusName: 'D8S1179', allele1: 13, allele2: 15, matchWithSuspect: true },
    { locusName: 'D21S11', allele1: 28, allele2: 30, matchWithSuspect: true },
    { locusName: 'D18S51', allele1: 14, allele2: 16, matchWithSuspect: true },
    { locusName: 'D5S818', allele1: 11, allele2: 12, matchWithSuspect: true },
    { locusName: 'D13S317', allele1: 9, allele2: 11, matchWithSuspect: true },
  ],
  randomMatchProbability: '1 in 3.8 Quintillion',
  suspectMatchName: 'Viktor Krell',
};

export const INITIAL_SEARCH_WARRANT: SearchWarrantAffidavit = {
  id: 'WRT-2026-088',
  targetLocation: 'Pier 42 Marine Terminal, Warehouse 18, Harbor District',
  targetPerson: 'Viktor Krell & Apex Marine Freight Custodians',
  probableCauseSummary:
    'Forensic evidence from Embassy Suite 400 confirms intentional administration of a clandestine synthetic fluorophosphate neurotoxin to Ambassador Christian Vance. CCTV footage and ALPR hits positively identify delivery van 7XYZ89 registered to Apex Marine Freight at Pier 42. Latent fingerprints matching fugitive broker Viktor Krell were recovered from the crime scene ingress latch. Exigent circumstances exist due to the scheduled 22:00 UTC departure of the container ship M/V Phoenix Dawn.',
  supportingEvidenceIds: ['EV-417-A', 'EV-417-B', 'EV-417-C', 'EV-417-D'],
  magistrateJudge: 'Hon. Miriam Vance-Geller, U.S. District Court',
  judicialReviewStatus: 'WARRANT ISSUED',
  issuedAt: '2026-09-29 08:30 UTC',
  expirationHours: 24,
};
