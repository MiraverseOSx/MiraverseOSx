/**
 * TRACE Forensic OS — Case Specification & Schema
 * Fully planned case data model across Medical, Crime Scene, Evidence,
 * Interrogation, Cyber Intelligence, Deductions, and Courtroom Trial modules.
 */

export interface CaseMetadata {
  id: string;
  caseNumber: string;
  title: string;
  incidentDate: string;
  incidentLocation: string;
  category: string;
  discipline: string;
  priority: 'Routine' | 'Priority' | 'Critical';
  status: 'Awaiting Acceptance' | 'Active' | 'Closed' | 'Cold Case';
  leadInvestigator: string;
  primaryInvestigatorSignature?: string;
  acceptedAt?: string;
  prosecutor: string;
  medicalExaminer: string;
  summary: string;
  tags: string[];
}

export interface IncidentTimelineEvent {
  time: string;
  title: string;
  source: string;
  description: string;
  type: 'dispatch' | 'witness' | 'surveillance' | 'forensic' | 'telecom';
  verified: boolean;
}

export interface MedicalIntakeRecord {
  intakeId: string;
  subjectType: 'Decedent' | 'Living Suspect' | 'Living Victim' | 'Witness';
  name: string;
  age: number;
  dob: string;
  gender: string;
  bloodType: string;
  heightCm: number;
  weightKg: number;
  intakeTimestamp: string;
  transportAgency: string;
  transportUnit: string;
  receivingTechnician: string;
  bodyBagSealNumber?: string;
  bodyBagSealCondition?: 'Intact' | 'Compromised' | 'Not Applicable';
  wristbandBarcode: string;
  belongingsInventory: Array<{
    item: string;
    description: string;
    custodyLocker: string;
    evidentiaryValue: boolean;
  }>;
  initialTriageVitals: {
    vitalStatus: 'Deceased' | 'Stable' | 'Critical' | 'Distressed';
    bodyTempC: number;
    heartRateBpm?: number;
    bloodPressure?: string;
    pupils: string;
    lividity: string;
    rigor: string;
    pronouncementTime?: string;
    pronouncingPhysician?: string;
  };
  clinicalNotes: string;
}

export interface VaccineRecord {
  id: string;
  vaccineName: string;
  targetPathogen: string;
  dateAdministered: string;
  facility: string;
  administrator: string;
  manufacturer: string;
  lotNumber: string;
  doseNumber: number;
  route: string;
  status: 'Complete' | 'Booster Due' | 'Exempt' | 'Verified';
  titerResult?: string;
  evidentiaryRelevance: string;
}

export interface DiagnosticTestRecord {
  id: string;
  category:
    | 'Toxicology'
    | 'Hematology'
    | 'Chemistry & Metabolic'
    | 'Vitreous Humor'
    | 'Microbiology & PCR'
    | 'Forensic Serology & DNA'
    | 'Questioned Documents'
    | 'Materials & Trace Metallurgy';
  testName: string;
  specimen:
    | 'Peripheral Blood'
    | 'Cardiac Blood'
    | 'Vitreous Humor'
    | 'Gastric Contents'
    | 'Subungual Swabs'
    | 'Urine'
    | 'Bile'
    | 'Liver Tissue'
    | 'Physical Trace / Swab'
    | 'Questioned Document / Material';
  quantitativeResult: string;
  referenceRange: string;
  methodology: string;
  flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_LETHAL' | 'POSITIVE' | 'NEGATIVE';
  clinicalInterpretation: string;
  instrumentId: string;
  verifiedBy: string;
}

export interface TraumaPoint {
  id: string;
  region: 'Cranial' | 'Ocular' | 'Cervical' | 'Thoracic' | 'Abdominal' | 'Subungual' | 'Visceral' | 'Extremities';
  label: string;
  finding: string;
  evidentiaryValue: string;
  status: 'Examined' | 'Pending Lab' | 'Histology In Progress';
}

export interface PostMortemIntervalModel {
  bodyCoreTempC: number;
  ambientTempC: number;
  bodyWeightKg: number;
  clothingFactor: number;
  measuredAt: string;
  vitreousPotassiumMeqL: number;
  estimatedPmiMinHours: number;
  estimatedPmiMaxHours: number;
  calculatedDeathWindow: string;
  corroboratingSource: string;
  rigorStage: string;
  livorStage: string;
}

export interface DeathCertificateRecord {
  formNumber: string;
  decedentName: string;
  mannerOfDeath: 'HOMICIDE' | 'ACCIDENT' | 'SUICIDE' | 'NATURAL' | 'UNDETERMINED';
  immediateCausePart1: string;
  underlyingCausePart2: string;
  otherSignificantConditions: string;
  certifyingPathologist: string;
  licenseNumber: string;
  certifiedDate: string;
  signed: boolean;
  courtIndictmentReady: boolean;
}

export interface SubjectMedicalProfile {
  subjectId: string;
  intake: MedicalIntakeRecord;
  vaccines: VaccineRecord[];
  diagnosticTests: DiagnosticTestRecord[];
  traumaPoints?: TraumaPoint[];
  pmiModel?: PostMortemIntervalModel;
  deathCertificate?: DeathCertificateRecord;
}

export interface MedicalForensicDocket {
  subjects: SubjectMedicalProfile[];
}

export interface CrimeScenePlacard {
  markerNumber: number;
  label: string;
  category: 'physical_trace' | 'biological' | 'ballistic' | 'digital' | 'footwear' | 'toxicology';
  coordinates: { x: number; y: number; z?: number; zone: string };
  description: string;
  associatedEvidenceId: string;
  status: 'Logged' | 'Recovered' | 'Transferred to Lab';
}

export interface PhysicalEvidenceItem {
  id: string;
  markerNumber?: number;
  title: string;
  type: string;
  seal: 'Intact' | 'Opened for examination' | 'Compromised';
  location: string;
  custodian: string;
  description: string;
  tags: string[];
  chainOfCustody: Array<{
    timestamp: string;
    from: string;
    to: string;
    location: string;
    reason: string;
    seal: string;
  }>;
}

export interface CitizenRecord {
  id: string;
  fullName: string;
  aliases: string[];
  role: 'Victim' | 'Primary Suspect' | 'Person of Interest' | 'Key Witness' | 'Alibi Witness';
  dob: string;
  ssnMasked: string;
  residence: string;
  occupation: string;
  dmvDriverLicense: string;
  dmvVehicleRegistration: string;
  codisDnaProfileId: string;
  fingerprintClass: string;
  phoneNumbers: string[];
  warrantStatus: 'Active Felony Warrant' | 'Cleared' | 'None' | 'Subpoena Issued';
  alibiClaim: string;
  alibiVerificationStatus: 'Refuted' | 'Corroborated' | 'Pending Cell Data';
}

export interface InterrogationConfrontation {
  id: string;
  clueOrEvidenceId: string;
  title: string;
  contradictionQuote: string;
  confrontationScript: string;
  suspectReaction: string;
  stressSpikePercent: number;
  confessionYield: string;
}

export interface InterrogationProfile {
  suspectId: string;
  suspectName: string;
  baselineHeartRateBpm: number;
  currentStressLevel: number;
  confessionThreshold: number;
  dialogueExchanges: Array<{
    speaker: 'Detective' | 'Suspect';
    text: string;
    timestamp: string;
  }>;
  confrontationOptions: InterrogationConfrontation[];
  affidavitSigned: boolean;
  affidavitText?: string;
}

export interface CourtroomExhibition {
  exhibitNumber: string;
  title: string;
  type: 'Physical' | 'Forensic Report' | 'Digital Log' | 'Autopsy Finding';
  description: string;
  chainOfCustodyVerified: boolean;
  admitted: boolean;
}

export interface CourtroomWitness {
  id: string;
  name: string;
  role: string;
  directTestimony: string[];
  crossExaminationQuestions: Array<{
    question: string;
    contradictingEvidenceId: string;
    expectedAnswer: string;
    prosecutionImpactScore: number;
  }>;
}

export interface CourtroomTrialDocket {
  courtName: string;
  docketNumber: string;
  presidingJudge: string;
  prosecutor: string;
  defenseAttorney: string;
  defendant: string;
  charges: string[];
  exhibits: CourtroomExhibition[];
  witnesses: CourtroomWitness[];
  juryGuiltProbability: number;
  verdictReady: boolean;
}

export interface FullCaseData {
  meta: CaseMetadata;
  timeline: IncidentTimelineEvent[];
  medical: MedicalForensicDocket;
  crimeScene: {
    locationName: string;
    blueprintGrid: string;
    placards: CrimeScenePlacard[];
  };
  evidence: PhysicalEvidenceItem[];
  citizens: CitizenRecord[];
  interrogations: InterrogationProfile[];
  courtroom: CourtroomTrialDocket;
}
