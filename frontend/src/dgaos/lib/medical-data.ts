import { getProfile as INITIAL_MEDICAL_CHARTProfile } from '../../game-content/characters/collections/INITIAL_MEDICAL_CHART';
import { getProfile as MOTORCYCLE_CRASH_MEDICAL_CHARTProfile } from '../../game-content/characters/collections/MOTORCYCLE_CRASH_MEDICAL_CHART';
import { getProfile as OVERDOSE_TOXICOLOGY_MEDICAL_CHARTProfile } from '../../game-content/characters/collections/OVERDOSE_TOXICOLOGY_MEDICAL_CHART';
// Comprehensive clinical medical chart, vitals telemetry, labs, imaging, and differential diagnosis
// Implements full hospital & trauma ICU patient workflow with death/homicide escalation

export interface PatientVitals {
  heartRate: number; // BPM
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  oxygenSaturation: number; // SpO2 %
  respiratoryRate: number; // breaths/min
  temperatureCelsius: number; // °C
  glasgowComaScale: number; // 3-15
  pupils: string;
  cardiacRhythm: string;
  timestamp: string;
}

export interface LabResultItem {
  id: string;
  name: string;
  value: string;
  referenceRange: string;
  unit: string;
  status: 'normal' | 'abnormal' | 'critical';
  notes?: string;
}

export interface LabPanel {
  id: string;
  category: 'Complete Blood Count (CBC)' | 'Comprehensive Metabolic Panel (CMP)' | 'Arterial Blood Gas (ABG)' | 'Cardiac & Coagulation' | 'Toxicology & Enzyme Kinetics';
  orderTime: string;
  resultTime: string;
  specimenType: string;
  technician: string;
  items: LabResultItem[];
}

export interface DiagnosticImage {
  id: string;
  modality: 'CT Trauma Pan-Scan' | 'MRI Brain (Diffusion Weighted)' | 'Chest X-Ray (AP Portable)' | 'FAST Trauma Ultrasound';
  bodyRegion: string;
  timestamp: string;
  radiologist: string;
  impression: string;
  findings: string[];
  keyMarkers: Array<{ label: string; x: number; y: number; description: string }>;
  status: 'Critical Alert' | 'Preliminary' | 'Final Signed';
}

export interface MedicationOrder {
  id: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string;
  startedAt: string;
  status: 'Active Infusion' | 'Completed Bolus' | 'Discontinued';
}

export interface ClinicalNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  title: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export interface EmsRunReport {
  medicUnit: string;
  dispatchTime: string;
  onSceneTime: string;
  hospitalArrivalTime: string;
  initialGcs: number;
  initialVitals: {
    hr: number;
    bp: string;
    spo2: number;
  };
  fieldNarrative: string;
  fieldInterventions: string[];
  transportDestination: string;
}

export interface DifferentialDiagnosisItem {
  id: string;
  condition: string;
  probability: number; // 0 - 100
  supportingFindings: string[];
  refutingFindings: string[];
  status: 'Leading Suspect' | 'Under Consideration' | 'Ruled Out';
}

export interface TreatmentLogEntry {
  id: string;
  time: string;
  action: string;
  operator: string;
  response: string;
}

export interface MedicalCaseChart {
  caseId: string;
  patientId: string;
  mrn: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  roomBay: string;
  attendingPhysician: string;
  admitTime: string;
  codeStatus: 'Full Code' | 'DNR / DNI' | 'Modified';
  clinicalStatus: 'Critical ICU' | 'Decompensating' | 'Arrest / CPR' | 'Pronounced Deceased' | 'Stabilized';
  allergies: string[];
  symptoms: string[];
  historyOfPresentIllness: string;
  vitalsHistory: PatientVitals[];
  labPanels: LabPanel[];
  imaging: DiagnosticImage[];
  medications: MedicationOrder[];
  progressNotes: ClinicalNote[];
  emsReport: EmsRunReport;
  differentialDiagnosis: DifferentialDiagnosisItem[];
  treatmentLog: TreatmentLogEntry[];
  isEscalatedToInvestigation: boolean;
  linkedInvestigationCaseId?: string;
}

export const INITIAL_MEDICAL_CHART: MedicalCaseChart = INITIAL_MEDICAL_CHARTProfile("PAT-88194");

export const MOTORCYCLE_CRASH_MEDICAL_CHART: MedicalCaseChart = MOTORCYCLE_CRASH_MEDICAL_CHARTProfile("PAT-94102");

export const OVERDOSE_TOXICOLOGY_MEDICAL_CHART: MedicalCaseChart = OVERDOSE_TOXICOLOGY_MEDICAL_CHARTProfile("PAT-95881");

export const ALL_PRESET_CHARTS: MedicalCaseChart[] = [
  INITIAL_MEDICAL_CHART,
  MOTORCYCLE_CRASH_MEDICAL_CHART,
  OVERDOSE_TOXICOLOGY_MEDICAL_CHART,
];
