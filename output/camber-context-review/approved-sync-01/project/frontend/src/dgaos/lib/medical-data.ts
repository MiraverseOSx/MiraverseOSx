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

export const INITIAL_MEDICAL_CHART: MedicalCaseChart = {
  caseId: 'MED-2026-0188',
  patientId: 'PAT-88194',
  mrn: 'MRN-90214-SJM',
  patientName: 'Ambassador Christian Vance',
  age: 58,
  gender: 'Male',
  bloodType: 'A Positive',
  roomBay: 'Trauma ICU - Isolation Bay 3',
  attendingPhysician: 'Dr. Emily Mercer, MD, FACEP (Critical Care / Pathology)',
  admitTime: '2026-09-29T05:12:00Z',
  codeStatus: 'Full Code',
  clinicalStatus: 'Critical ICU',
  allergies: ['Penicillin (Severe Anaphylaxis)', 'Sulfa Drugs (Rash)'],
  symptoms: [
    'Acute sudden diaphoresis and profuse salivation',
    'Severe bilateral miosis (pinpoint pupils, 1mm fixed)',
    'Refractory bronchoconstriction with copious frothy pulmonary secretions',
    'Fasciculations in facial and intercostal musculature',
    'Profound bradycardia alternating with ventricular ectopy',
    'Coma / Unresponsive (GCS 4: E1 V1 M2)',
  ],
  historyOfPresentIllness:
    'Patient is a 58-year-old male ambassador who collapsed without warning at approximately 04:35 UTC during closed-door trade discussions at Embassy Row Suite 400. Fellow delegates reported acute nausea, sudden speech slurring, and rapid progression to respiratory arrest within 8 minutes of drinking from a personalized carafe. EMS arrived on scene at 04:47 UTC finding profound miosis, cyanosis, and severe bradycardia (HR 32). Field intubation was performed with difficult bag-mask compliance due to bronchorrhea. Transferred emergently to St. Jude Metro Hospital Trauma ICU.',
  vitalsHistory: [
    {
      heartRate: 52,
      bloodPressureSystolic: 84,
      bloodPressureDiastolic: 48,
      oxygenSaturation: 89,
      respiratoryRate: 14,
      temperatureCelsius: 35.8,
      glasgowComaScale: 4,
      pupils: '1mm bilateral non-reactive (Pinpoint)',
      cardiacRhythm: 'Sinus Bradycardia with frequent PVCs',
      timestamp: '05:15 UTC',
    },
    {
      heartRate: 46,
      bloodPressureSystolic: 78,
      bloodPressureDiastolic: 42,
      oxygenSaturation: 86,
      respiratoryRate: 16,
      temperatureCelsius: 35.6,
      glasgowComaScale: 3,
      pupils: '1mm fixed',
      cardiacRhythm: 'Severe Bradycardia / J-point elevation',
      timestamp: '05:45 UTC',
    },
    {
      heartRate: 40,
      bloodPressureSystolic: 72,
      bloodPressureDiastolic: 38,
      oxygenSaturation: 82,
      respiratoryRate: 18,
      temperatureCelsius: 35.4,
      glasgowComaScale: 3,
      pupils: '1mm fixed',
      cardiacRhythm: 'Idioventricular Rhythm',
      timestamp: '06:10 UTC',
    },
  ],
  labPanels: [
    {
      id: 'LAB-TOX-01',
      category: 'Toxicology & Enzyme Kinetics',
      orderTime: '05:20 UTC',
      resultTime: '05:58 UTC',
      specimenType: 'Whole Blood / Heparinized Plasma',
      technician: 'K. Kowalski, MT(ASCP)',
      items: [
        {
          id: 'ITEM-ACHE',
          name: 'RBC Acetylcholinesterase',
          value: '420',
          referenceRange: '5,900 - 12,200',
          unit: 'U/L',
          status: 'critical',
          notes: '93% depression from normal baseline. Extreme organophosphate or carbamate toxicity.',
        },
        {
          id: 'ITEM-BCHE',
          name: 'Plasma Butyrylcholinesterase (Pseudocholinesterase)',
          value: '310',
          referenceRange: '4,000 - 11,000',
          unit: 'U/L',
          status: 'critical',
          notes: 'Near total inhibition of plasma cholinesterase reserve.',
        },
        {
          id: 'ITEM-G-SERIES',
          name: 'Commercial G-Series Screen (GB/GD/GA)',
          value: 'NEGATIVE',
          referenceRange: 'Negative',
          unit: 'qualitative',
          status: 'normal',
          notes: 'Standard military G-agents absent. Indicates custom synthetic isomer.',
        },
        {
          id: 'ITEM-ORGANOPHOSPHATE',
          name: 'Methylphosphonofluoridate Synthetic Derivative',
          value: 'DETECTED (High Peak)',
          referenceRange: 'Not Detected',
          unit: 'ng/mL',
          status: 'critical',
          notes: 'Structural match to classified fluorophosphate precursor synthesized at industrial harbor lab.',
        },
      ],
    },
    {
      id: 'LAB-ABG-01',
      category: 'Arterial Blood Gas (ABG)',
      orderTime: '05:25 UTC',
      resultTime: '05:35 UTC',
      specimenType: 'Radial Arterial Blood',
      technician: 'Respiratory Care Unit',
      items: [
        { id: 'ABG-PH', name: 'Arterial pH', value: '7.12', referenceRange: '7.35 - 7.45', unit: '', status: 'critical' },
        { id: 'ABG-PCO2', name: 'pCO2', value: '64.8', referenceRange: '35 - 45', unit: 'mmHg', status: 'critical' },
        { id: 'ABG-PO2', name: 'pO2', value: '54.0', referenceRange: '80 - 100', unit: 'mmHg', status: 'critical' },
        { id: 'ABG-HCO3', name: 'Bicarbonate (HCO3-)', value: '18.2', referenceRange: '22 - 26', unit: 'mEq/L', status: 'abnormal' },
        { id: 'ABG-LACTATE', name: 'Serum L-Lactate', value: '5.8', referenceRange: '0.5 - 2.0', unit: 'mmol/L', status: 'critical' },
      ],
    },
    {
      id: 'LAB-CBC-01',
      category: 'Complete Blood Count (CBC)',
      orderTime: '05:15 UTC',
      resultTime: '05:32 UTC',
      specimenType: 'Whole Blood EDTA',
      technician: 'Central Hematology',
      items: [
        { id: 'CBC-WBC', name: 'White Blood Cell Count', value: '14.8', referenceRange: '4.5 - 11.0', unit: '10^3/uL', status: 'abnormal' },
        { id: 'CBC-HGB', name: 'Hemoglobin', value: '13.9', referenceRange: '13.5 - 17.5', unit: 'g/dL', status: 'normal' },
        { id: 'CBC-PLT', name: 'Platelet Count', value: '242', referenceRange: '150 - 450', unit: '10^3/uL', status: 'normal' },
      ],
    },
  ],
  imaging: [
    {
      id: 'IMG-CT-01',
      modality: 'CT Trauma Pan-Scan',
      bodyRegion: 'Head, Neck, Chest, Abdomen, Pelvis',
      timestamp: '05:38 UTC',
      radiologist: 'Dr. Harold Sterling, MD (Neuroradiology)',
      impression:
        '1. Bilateral diffuse pulmonary alveolar infiltrates consistent with severe neurogenic / cardiogenic pulmonary edema and massive bronchorrhea. 2. No acute intracranial hemorrhage or territorial cerebral infarction. 3. Hypoperfusion complex with flattened inferior vena cava consistent with distributive / cardiogenic shock.',
      findings: [
        'Chest: Ground-glass opacities throughout bilateral lung parenchyma, bronchial wall thickening, and dense bronchial secretions.',
        'Abdomen: Intestinal hyperperistalsis patterns and prominent fluid accumulation in small bowel loops.',
        'Brain: Gray-white matter differentiation preserved, ventricles symmetrical, no midline shift.',
      ],
      keyMarkers: [
        { label: 'Pulmonary Edema', x: 48, y: 38, description: 'Dense bilateral alveolar infiltrates secondary to hypersecretion.' },
        { label: 'Secretions', x: 52, y: 44, description: 'Copious mucous plug in right mainstem bronchus.' },
      ],
      status: 'Final Signed',
    },
    {
      id: 'IMG-FAST-01',
      modality: 'FAST Trauma Ultrasound',
      bodyRegion: 'Subxiphoid, RUQ, LUQ, Suprapubic',
      timestamp: '05:18 UTC',
      radiologist: 'Dr. Emily Mercer, MD',
      impression: 'Negative for hemoperitoneum or pericardial tamponade. Severely depressed left ventricular ejection fraction estimated at <20%.',
      findings: [
        'Pericardium: Trace pericardial fluid without diastolic collapse.',
        'Morison Pouch: No free fluid visualized in hepatorenal space.',
      ],
      keyMarkers: [
        { label: 'Depressed LVEF', x: 50, y: 50, description: 'Marked global ventricular hypokinesis.' },
      ],
      status: 'Final Signed',
    },
  ],
  medications: [
    {
      id: 'MED-01',
      drug: 'Atropine Sulfate',
      dose: '4 mg IV push every 5 minutes',
      route: 'Intravenous',
      frequency: 'STAT Continuous Titration',
      indication: 'Severe cholinergic crisis / Bronchorrhea & Bradycardia',
      startedAt: '05:15 UTC',
      status: 'Active Infusion',
    },
    {
      id: 'MED-02',
      drug: 'Pralidoxime Chloride (2-PAM)',
      dose: '2 g IV loading dose over 30 mins',
      route: 'Intravenous Infusion',
      frequency: 'Continuous 500mg/hr',
      indication: 'Cholinesterase reactivation (Ineffective due to rapid aging)',
      startedAt: '05:22 UTC',
      status: 'Active Infusion',
    },
    {
      id: 'MED-03',
      drug: 'Norepinephrine (Levophed)',
      dose: '16 mcg/min',
      route: 'Central Venous Catheter',
      frequency: 'Titrated to MAP > 65',
      indication: 'Distributive & cardiogenic shock',
      startedAt: '05:30 UTC',
      status: 'Active Infusion',
    },
  ],
  progressNotes: [
    {
      id: 'NOTE-01',
      author: 'Dr. Emily Mercer, MD, FACEP',
      role: 'Attending Physician - Trauma ICU',
      timestamp: '06:05 UTC',
      title: 'Attending ICU Critical Care Evaluation',
      soap: {
        subjective: 'Emergency medical consultation requested for sudden diplomatic collapse at Embassy Row.',
        objective: 'Intubated, mechanically ventilated. FiO2 100%, PEEP 12 cmH2O. Suctioning copious watery secretions continuously. HR 44 bpm despite 12mg total Atropine. BP 80/42 mmHg on Levophed. Acetylcholinesterase 420 U/L.',
        assessment: 'Lethal organophosphorus nerve agent poisoning with rapid covalent catalytic aging. Minimal response to 2-PAM. Multiorgan failure imminent.',
        plan: '1. Continue aggressive atropinization to clear pulmonary secretions. 2. Preserve whole blood, serum, and gastric aspirate for legal chain of custody. 3. Notify Department of Global Affairs (DGA) and Federal Medical Examiner.',
      },
    },
  ],
  emsReport: {
    medicUnit: 'Metro Medic-14 (Advanced Life Support)',
    dispatchTime: '04:38 UTC',
    onSceneTime: '04:47 UTC',
    hospitalArrivalTime: '05:12 UTC',
    initialGcs: 4,
    initialVitals: {
      hr: 32,
      bp: '70/40',
      spo2: 74,
    },
    fieldNarrative:
      'Dispatched to Embassy Row Suite 400 for unresponsive male with seizure-like activity. On arrival found Ambassador Christian Vance supine on floor, in severe respiratory distress, cyanotic, covered in profuse perspiration and foam around lips. Pupils 1mm pinpoints. Rapid sequence intubation performed with 7.5 ETT. Atropine 2mg IV administered in transit with minor pulse rise to 48. Transferred directly to Trauma Bay 3.',
    fieldInterventions: [
      'Endotracheal Intubation (Grade 1 view)',
      'Bag-Valve-Mask Ventilation with PEEP valve',
      'Intravenous 18G Cannulation (Right Antecubital)',
      'Atropine Sulfate 2mg IV push',
    ],
    transportDestination: 'St. Jude Metropolitan Hospital Trauma Center',
  },
  differentialDiagnosis: [
    {
      id: 'DIFF-01',
      condition: 'Synthetic Organophosphorus / Fluorophosphate Poisoning',
      probability: 92,
      supportingFindings: [
        'Severe pinpoint miosis (1mm fixed)',
        'RBC Acetylcholinesterase depressed by 93% (420 U/L)',
        'Extreme bronchorrhea and bradycardia refractory to standard atropine',
        'Sudden onset within minutes of ingesting embassy carafe liquid',
      ],
      refutingFindings: ['Standard military G-agent screen negative (indicates novel clandestine variant)'],
      status: 'Leading Suspect',
    },
    {
      id: 'DIFF-02',
      condition: 'Synthetic Carbamate Neurotoxin',
      probability: 34,
      supportingFindings: ['Cholinergic crisis symptom complex', 'Rapid neuromuscular collapse'],
      refutingFindings: ['Carbamate inhibition typically self-reverses spontaneously; Vance shows severe irreversible aging'],
      status: 'Under Consideration',
    },
    {
      id: 'DIFF-03',
      condition: 'Massive Pontine Hemorrhage (Brainstem Stroke)',
      probability: 4,
      supportingFindings: ['Pinpoint pupils', 'Coma with decerebrate posturing'],
      refutingFindings: ['CT Brain scan completely negative for hemorrhage or ischemia', 'Enzymatic cholinesterase collapse cannot be explained by stroke'],
      status: 'Ruled Out',
    },
  ],
  treatmentLog: [
    {
      id: 'TR-01',
      time: '04:52 UTC',
      action: 'Field Endotracheal Intubation',
      operator: 'Paramedic Vance (Medic-14)',
      response: 'Successful placement confirmed with colorimetric CO2.',
    },
    {
      id: 'TR-02',
      time: '05:15 UTC',
      action: 'Initial Atropine Bolus 4mg IV',
      operator: 'Dr. Mercer, MD',
      response: 'Minimal heart rate improvement (38 -> 52 bpm), secretions continue.',
    },
    {
      id: 'TR-03',
      time: '05:22 UTC',
      action: 'Pralidoxime (2-PAM) 2g IV Infusion Initiated',
      operator: 'Trauma Team Nurse',
      response: 'No significant reversal of neuromuscular blockade noted.',
    },
    {
      id: 'TR-04',
      time: '05:40 UTC',
      action: 'Central Venous Catheter Placement (Right Internal Jugular)',
      operator: 'Dr. Mercer, MD',
      response: 'Levophed infusion titrated for hypotension.',
    },
  ],
  isEscalatedToInvestigation: false,
  linkedInvestigationCaseId: undefined,
};

export const MOTORCYCLE_CRASH_MEDICAL_CHART: MedicalCaseChart = {
  caseId: 'MED-2026-0204',
  patientId: 'PAT-94102',
  mrn: 'MRN-77312-TRAUMA',
  patientName: 'Officer Tyler Ross',
  age: 32,
  gender: 'Male',
  bloodType: 'O Negative',
  roomBay: 'Trauma Resuscitation Suite 1',
  attendingPhysician: 'Dr. Gregory Vance, MD, FACS (Trauma Surgery)',
  admitTime: '2026-10-04T02:15:00Z',
  codeStatus: 'Full Code',
  clinicalStatus: 'Critical ICU',
  allergies: ['Morphine (Hypotension)', 'Iodinated Contrast (Mild urticaria)'],
  symptoms: [
    'Blunt multisystem trauma secondary to high-speed motorcycle impact',
    'Open right mid-femur fracture with active hemorrhage',
    'Paradoxical chest wall movement / Flail chest left anterior ribs 4-7',
    'Massive hemopneumothorax with tracheal deviation',
    'Unresponsive, Glasgow Coma Scale 6 (E1 V2 M3)',
    'Ecchymosis over left flank (Grey Turner sign) indicating retroperitoneal bleed',
  ],
  historyOfPresentIllness:
    'Patient is a 32-year-old male motorcycle operator involved in a high-velocity T-bone collision with an SUV at intersection 4th & Harbor. Ejected approximately 35 feet onto asphalt. Helmet present on scene with significant structural fragmentation. EMS arrived within 6 minutes finding severe shock, cyanosis, and profound tachypnea. Immediate needle thoracostomy performed in left 2nd intercostal space with audible air rush and blood return. Patient packaged with pelvic binder, cervical collar, and right leg traction splint. Rushed code 3 to Level 1 Trauma Center.',
  vitalsHistory: [
    {
      heartRate: 142,
      bloodPressureSystolic: 78,
      bloodPressureDiastolic: 44,
      oxygenSaturation: 84,
      respiratoryRate: 36,
      temperatureCelsius: 34.9,
      glasgowComaScale: 6,
      pupils: '3mm right, 5mm sluggish left (Anisocoria)',
      cardiacRhythm: 'Sinus Tachycardia with ST depression',
      timestamp: '02:20 UTC',
    },
    {
      heartRate: 128,
      bloodPressureSystolic: 92,
      bloodPressureDiastolic: 56,
      oxygenSaturation: 94,
      respiratoryRate: 22,
      temperatureCelsius: 35.2,
      glasgowComaScale: 6,
      pupils: '3mm / 4mm sluggish',
      cardiacRhythm: 'Sinus Tachycardia post-intubation',
      timestamp: '02:45 UTC',
    },
    {
      heartRate: 110,
      bloodPressureSystolic: 104,
      bloodPressureDiastolic: 68,
      oxygenSaturation: 98,
      respiratoryRate: 18,
      temperatureCelsius: 35.8,
      glasgowComaScale: 7,
      pupils: '3mm bilateral reactive',
      cardiacRhythm: 'Normal Sinus Rhythm',
      timestamp: '03:30 UTC',
    },
  ],
  labPanels: [
    {
      id: 'LAB-TRAUMA-01',
      category: 'Cardiac & Coagulation',
      orderTime: '02:22 UTC',
      resultTime: '02:38 UTC',
      specimenType: 'Citrated Whole Blood (TEG)',
      technician: 'Trauma STAT Lab',
      items: [
        { id: 'TEG-R', name: 'TEG Reaction Time (R-Time)', value: '11.8', referenceRange: '4.0 - 8.0', unit: 'min', status: 'critical', notes: 'Severe coagulopathy of trauma. Delayed clot initiation.' },
        { id: 'TEG-MA', name: 'TEG Maximum Amplitude (MA)', value: '38', referenceRange: '52 - 70', unit: 'mm', status: 'critical', notes: 'Platelet functional deficiency and fibrinogen depletion.' },
        { id: 'TEG-LY30', name: 'TEG Clot Lysis at 30 min (LY30)', value: '18.4', referenceRange: '0.0 - 7.5', unit: '%', status: 'critical', notes: 'Hyperfibrinolysis. Immediate TXA indicated.' },
        { id: 'COAG-FIB', name: 'Fibrinogen Level', value: '110', referenceRange: '200 - 400', unit: 'mg/dL', status: 'critical', notes: 'Administer cryoprecipitate.' },
      ],
    },
    {
      id: 'LAB-ABG-02',
      category: 'Arterial Blood Gas (ABG)',
      orderTime: '02:25 UTC',
      resultTime: '02:32 UTC',
      specimenType: 'Left Femoral Arterial Blood',
      technician: 'Respiratory STAT',
      items: [
        { id: 'ABG-PH-2', name: 'Arterial pH', value: '7.18', referenceRange: '7.35 - 7.45', unit: '', status: 'critical', notes: 'Severe metabolic lactic acidosis.' },
        { id: 'ABG-LACTATE-2', name: 'Serum L-Lactate', value: '8.4', referenceRange: '0.5 - 2.0', unit: 'mmol/L', status: 'critical', notes: 'Profound hypoperfusion and anaerobic metabolism.' },
        { id: 'ABG-BE', name: 'Base Deficit', value: '-12.6', referenceRange: '-2.0 - +2.0', unit: 'mEq/L', status: 'critical', notes: 'Class IV hemorrhagic shock signature.' },
      ],
    },
    {
      id: 'LAB-CBC-02',
      category: 'Complete Blood Count (CBC)',
      orderTime: '02:20 UTC',
      resultTime: '02:30 UTC',
      specimenType: 'EDTA Whole Blood',
      technician: 'Central Hematology',
      items: [
        { id: 'CBC-HGB-2', name: 'Hemoglobin', value: '7.2', referenceRange: '13.5 - 17.5', unit: 'g/dL', status: 'critical', notes: 'Acute rapid blood loss.' },
        { id: 'CBC-HCT', name: 'Hematocrit', value: '22.1', referenceRange: '41 - 50', unit: '%', status: 'critical', notes: 'Massive transfusion protocol active.' },
        { id: 'CBC-PLT-2', name: 'Platelet Count', value: '84', referenceRange: '150 - 450', unit: '10^3/uL', status: 'critical', notes: 'Platelet consumption from traumatic coagulopathy.' },
      ],
    },
  ],
  imaging: [
    {
      id: 'IMG-FAST-02',
      modality: 'FAST Trauma Ultrasound',
      bodyRegion: 'Abdomen, Pelvis, Pleural Spaces',
      timestamp: '02:22 UTC',
      radiologist: 'Dr. Gregory Vance, MD (Bedside FAST)',
      impression: 'Positive FAST: Large free fluid stripe in splenorenal recess and pelvis. Left pneumothorax confirmed by absence of lung sliding.',
      findings: [
        'Splenorenal space: 3.5cm anechoic fluid stripe (Grade IV splenic laceration suspected).',
        'Left anterior pleura: Barcode sign on M-mode confirms pneumothorax.',
        'Pelvis: Free fluid pooling in rectovesical pouch.',
      ],
      keyMarkers: [
        { label: 'Splenic Bleed', x: 42, y: 35, description: 'Perisplenic hematoma and free intraperitoneal blood.' },
        { label: 'Left Hemothorax', x: 28, y: 50, description: 'Hemothorax with collapsed left lung base.' },
      ],
      status: 'Final Signed',
    },
    {
      id: 'IMG-CT-02',
      modality: 'CT Trauma Pan-Scan',
      bodyRegion: 'Head, Spine, Chest, Abdomen, Extremities',
      timestamp: '03:10 UTC',
      radiologist: 'Dr. Sarah Lin, MD (Trauma Radiology)',
      impression: '1. Left Grade 4 Splenic rupture with active arterial extravasation (blush). 2. Left rib fractures 3-8 with underlying pulmonary contusion. 3. Subdural hematoma 4mm left temporal convexity without midline shift. 4. Commuted right femur fracture.',
      findings: [
        'Spleen: Multiple parenchymal lacerations extending to splenic hilum with contrast blush.',
        'Thorax: 32 Fr chest tube in good position on left, hemothorax significantly evacuated.',
        'Brain: Small acute left temporal subdural hematoma, no herniation.',
      ],
      keyMarkers: [
        { label: 'Active Contrast Blush', x: 55, y: 48, description: 'Active splenic arterial pseudoaneurysm / extravasation.' },
        { label: 'Flail Segment', x: 32, y: 36, description: 'Displaced left rib fractures with flail segment.' },
      ],
      status: 'Critical Alert',
    },
  ],
  medications: [
    {
      id: 'MED-TRAUMA-01',
      drug: 'Tranexamic Acid (TXA)',
      dose: '1 g IV bolus over 10 mins',
      route: 'Intravenous',
      frequency: 'STAT follow with 1g over 8 hrs',
      indication: 'Trauma-induced hyperfibrinolysis and hemorrhage control',
      startedAt: '02:24 UTC',
      status: 'Completed Bolus',
    },
    {
      id: 'MED-TRAUMA-02',
      drug: 'Packed Red Blood Cells (O-Negative)',
      dose: '4 Units Rapid Infusion',
      route: 'Belmont Rapid Infuser 300mL/min',
      frequency: 'Massive Transfusion Protocol Ratio 1:1:1',
      indication: 'Hemorrhagic Shock Class IV',
      startedAt: '02:26 UTC',
      status: 'Active Infusion',
    },
    {
      id: 'MED-TRAUMA-03',
      drug: 'Fresh Frozen Plasma (FFP)',
      dose: '4 Units',
      route: 'Intravenous',
      frequency: 'With RBC infusion',
      indication: 'Correction of coagulopathy',
      startedAt: '02:35 UTC',
      status: 'Active Infusion',
    },
  ],
  progressNotes: [
    {
      id: 'NOTE-TRAUMA-01',
      author: 'Dr. Gregory Vance, MD, FACS',
      role: 'Trauma Medical Director',
      timestamp: '03:20 UTC',
      title: 'Emergency Trauma Operative Consultation',
      soap: {
        subjective: 'High-speed motorcycle collision victim transported code 3 in refractory hemorrhagic shock.',
        objective: 'Resuscitated with 4U PRBCs, 4U FFP, 1U Platelets, 1g TXA. Left 32Fr chest tube yielded 750mL dark blood. FAST positive in LUQ and pelvis. CT reveals Grade IV splenic rupture with active arterial contrast extravasation.',
        assessment: 'Unstable hemorrhagic shock secondary to splenic rupture and multiple blunt trauma. Responding favorably to MTP.',
        plan: '1. Transfer immediately to Operating Room 3 for exploratory laparotomy and splenectomy. 2. Post-op ICU admission for ICP intracranial monitoring. 3. Orthopedic external fixation of right femur fracture.',
      },
    },
  ],
  emsReport: {
    medicUnit: 'Metro Fire Rescue Medic-7',
    dispatchTime: '01:58 UTC',
    onSceneTime: '02:04 UTC',
    hospitalArrivalTime: '02:15 UTC',
    initialGcs: 6,
    initialVitals: {
      hr: 148,
      bp: '74/40',
      spo2: 82,
    },
    fieldNarrative:
      'Dispatched to high-speed motorcycle crash. Patient found prone 35 feet from collision site. Airway compromised by vomitus and facial trauma. Suctioned and intubated with video laryngoscopy 8.0 ETT. Left chest decompression performed with ARS needle. Pelvic binder placed.',
    fieldInterventions: [
      'Rapid Sequence Intubation (RSI) with Etomidate/Rocuronium',
      'Left Needle Chest Decompression (2nd ICS MCL)',
      'Pelvic Circumferential Compression Device',
      'Hare Traction Splint (Right Femur)',
    ],
    transportDestination: 'St. Jude Level 1 Trauma Center',
  },
  differentialDiagnosis: [
    {
      id: 'DIFF-TR-01',
      condition: 'Splenic Rupture with Hemoperitoneum',
      probability: 98,
      supportingFindings: ['Positive FAST in splenorenal recess', 'CT contrast blush', 'Class IV hemorrhagic shock'],
      refutingFindings: [],
      status: 'Leading Suspect',
    },
    {
      id: 'DIFF-TR-02',
      condition: 'Tension Hemopneumothorax',
      probability: 95,
      supportingFindings: ['Flail chest', 'Tracheal deviation on arrival', '750mL blood evacuated via chest tube'],
      refutingFindings: ['Tension relieved by tube thoracostomy'],
      status: 'Leading Suspect',
    },
    {
      id: 'DIFF-TR-03',
      condition: 'Acute Traumatic Brain Injury (Epidural / Subdural)',
      probability: 70,
      supportingFindings: ['GCS 6 on scene', 'Anisocoria on presentation', '4mm subdural on CT'],
      refutingFindings: ['No midline shift or uncal herniation present on initial scan'],
      status: 'Under Consideration',
    },
  ],
  treatmentLog: [
    {
      id: 'TR-M-01',
      time: '02:18 UTC',
      action: 'Primary ATLS Trauma Survey Initiated',
      operator: 'Dr. Vance, MD',
      response: 'Airway secure via field ETT. Breathing compromised, left chest tube indicated.',
    },
    {
      id: 'TR-M-02',
      time: '02:21 UTC',
      action: 'Tube Thoracostomy 32Fr Left 5th Intercostal Space',
      operator: 'Trauma Resident Dr. Lin',
      response: 'Immediate evacuation of 750mL dark non-clotted blood, chest wall compliance improved.',
    },
    {
      id: 'TR-M-03',
      time: '02:26 UTC',
      action: 'Massive Transfusion Protocol (MTP) Cooler 1 Initiated',
      operator: 'Blood Bank / Trauma Nurse',
      response: 'MAP rose from 55 to 70 mmHg after 2nd unit PRBC.',
    },
  ],
  isEscalatedToInvestigation: false,
  linkedInvestigationCaseId: undefined,
};

export const OVERDOSE_TOXICOLOGY_MEDICAL_CHART: MedicalCaseChart = {
  caseId: 'MED-2026-0219',
  patientId: 'PAT-95881',
  mrn: 'MRN-88421-TOX',
  patientName: 'Jane Doe (Unidentified Subject)',
  age: 26,
  gender: 'Female',
  bloodType: 'B Positive',
  roomBay: 'Medical ICU - Bed 8',
  attendingPhysician: 'Dr. Marcus Vance, MD (Medical Toxicology / Critical Care)',
  admitTime: '2026-10-09T22:40:00Z',
  codeStatus: 'Full Code',
  clinicalStatus: 'Stabilized',
  allergies: ['No Known Drug Allergies (NKDA)'],
  symptoms: [
    'Profound obtundation / Coma (GCS 3 on field arrival)',
    'Severe respiratory depression (RR 4 breaths/min agonal)',
    'Hypothermia (Core temp 33.8°C)',
    'Pinpoint pupils (0.5mm fixed bilaterally)',
    'Track marks noted along bilateral antecubital fossae and dorsal hands',
    'Pulmonary edema with pink frothy sputum post-resuscitation',
  ],
  historyOfPresentIllness:
    'Patient is an unidentified female in her mid-20s discovered unresponsive in an abandoned storage facility on Wharf Street. Bystanders reported suspect left the scene in a dark sedan 15 minutes prior. EMS found patient cyanotic with agonal gasping, SpO2 62%, and profound pinpoint pupils. Immediate administration of Narcan (Naloxone) 2mg IN produced minimal response, requiring additional 4mg IV push with return of spontaneous respirations (RR 16) and acute opioid withdrawal precipitation (vomiting, agitation, diaphoresis). Transferred to MICU for continuous Naloxone infusion given suspected ultra-potent synthetic carfentanil contamination.',
  vitalsHistory: [
    {
      heartRate: 48,
      bloodPressureSystolic: 82,
      bloodPressureDiastolic: 46,
      oxygenSaturation: 68,
      respiratoryRate: 4,
      temperatureCelsius: 33.8,
      glasgowComaScale: 3,
      pupils: '0.5mm pinpoint non-reactive',
      cardiacRhythm: 'Sinus Bradycardia / Prolonged QTc (520ms)',
      timestamp: '22:45 UTC',
    },
    {
      heartRate: 118,
      bloodPressureSystolic: 138,
      bloodPressureDiastolic: 88,
      oxygenSaturation: 96,
      respiratoryRate: 24,
      temperatureCelsius: 35.1,
      glasgowComaScale: 11,
      pupils: '3.5mm reactive bilaterally',
      cardiacRhythm: 'Sinus Tachycardia post-Narcan',
      timestamp: '23:15 UTC',
    },
    {
      heartRate: 88,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 74,
      oxygenSaturation: 99,
      respiratoryRate: 16,
      temperatureCelsius: 36.4,
      glasgowComaScale: 14,
      pupils: '3mm reactive',
      cardiacRhythm: 'Normal Sinus Rhythm',
      timestamp: '01:00 UTC',
    },
  ],
  labPanels: [
    {
      id: 'LAB-TOX-02',
      category: 'Toxicology & Enzyme Kinetics',
      orderTime: '22:50 UTC',
      resultTime: '23:45 UTC',
      specimenType: 'Urine & Serum Liquid Chromatography-MS/MS',
      technician: 'Forensic Tox Specialist Dr. Chen',
      items: [
        { id: 'TOX-FENT', name: 'Fentanyl Quantitative', value: '48.2', referenceRange: '< 0.5', unit: 'ng/mL', status: 'critical', notes: 'Lethal concentration without prior tolerance.' },
        { id: 'TOX-CARF', name: 'Carfentanil Analog Screen', value: 'POSITIVE (High Peak)', referenceRange: 'Not Detected', unit: 'ng/mL', status: 'critical', notes: 'Synthetic analog 10,000x potency of morphine.' },
        { id: 'TOX-XYLAZINE', name: 'Xylazine (Tranq) Adulterant', value: '240', referenceRange: 'Not Detected', unit: 'ng/mL', status: 'critical', notes: 'Alpha-2 agonist veterinary sedative causing refractory hypotension & necrotic tissue ulcers.' },
        { id: 'TOX-NALOXONE', name: 'Serum Naloxone', value: '18.4', referenceRange: 'N/A', unit: 'ng/mL', status: 'normal', notes: 'Therapeutic antidote levels maintained on drip.' },
      ],
    },
  ],
  imaging: [
    {
      id: 'IMG-CXR-01',
      modality: 'Chest X-Ray (AP Portable)',
      bodyRegion: 'Chest AP Supine',
      timestamp: '23:20 UTC',
      radiologist: 'Dr. Sterling, MD',
      impression: 'Bilateral fluffy perihilar infiltrates typical of naloxone-induced or hypoxic non-cardiogenic pulmonary edema. Heart size normal.',
      findings: [
        'Lungs: Diffuse bat-wing alveolar opacities sparing the lung peripheries.',
        'Pleura: No pneumothorax or effusion.',
      ],
      keyMarkers: [
        { label: 'Non-Cardiogenic Edema', x: 50, y: 40, description: 'Opioid-induced pulmonary capillary leak edema.' },
      ],
      status: 'Final Signed',
    },
  ],
  medications: [
    {
      id: 'MED-TOX-01',
      drug: 'Naloxone Hydrochloride (Narcan)',
      dose: '0.4 mg/hr Continuous Infusion',
      route: 'Intravenous',
      frequency: 'Titrated to spontaneous RR > 12',
      indication: 'Synthetic opioid overdose with long-acting lipophilic analogs',
      startedAt: '23:05 UTC',
      status: 'Active Infusion',
    },
    {
      id: 'MED-TOX-02',
      drug: 'Albuterol Nebulizer',
      dose: '2.5 mg',
      route: 'Inhalation via Mask',
      frequency: 'Q4H PRN',
      indication: 'Pulmonary edema bronchospasm',
      startedAt: '23:30 UTC',
      status: 'Active Infusion',
    },
  ],
  progressNotes: [
    {
      id: 'NOTE-TOX-01',
      author: 'Dr. Marcus Vance, MD',
      role: 'Attending Medical Toxicologist',
      timestamp: '00:15 UTC',
      title: 'Toxicology Consult & Forensic Specimen Hold',
      soap: {
        subjective: 'Young unidentified female found near overdose cluster on Wharf Street. Rapid antidote reversal achieved.',
        objective: 'Tox panel confirms massive fentanyl + carfentanil + xylazine ("Tranq") cocktail. SpO2 99% on 2L nasal cannula. GCS improved from 3 to 14.',
        assessment: 'Severe polydrug synthetic opioid overdose successfully reversed. High re-sedation risk due to carfentanil depot storage in adipose tissue.',
        plan: '1. Maintain Naloxone infusion for minimum 18 hours. 2. Chain of custody on remaining field glassine baggies transferred to DGA Evidence Locker. 3. Fingerprints sent to CIVITAS registry for subject identification.',
      },
    },
  ],
  emsReport: {
    medicUnit: 'Downtown Medic-2',
    dispatchTime: '22:20 UTC',
    onSceneTime: '22:28 UTC',
    hospitalArrivalTime: '22:40 UTC',
    initialGcs: 3,
    initialVitals: {
      hr: 44,
      bp: '78/42',
      spo2: 62,
    },
    fieldNarrative:
      'Dispatched to Wharf Street for female down not breathing. Patient apneic, cyanotic, pinpoint pupils. Bagged with high-flow O2. 2mg Narcan IN followed by 4mg IV. Patient gasped, vomited, and regained consciousness.',
    fieldInterventions: [
      'Bag-Valve-Mask Resuscitation',
      'Naloxone 2mg IN + 4mg IV Push',
      'Airway Suctioning',
      'IV Access 20G Left Forearm',
    ],
    transportDestination: 'St. Jude Metropolitan Hospital',
  },
  differentialDiagnosis: [
    {
      id: 'DIFF-TX-01',
      condition: 'Fentanyl / Carfentanil / Xylazine Overdose',
      probability: 99,
      supportingFindings: ['Instant response to Naloxone', 'High-peak LC-MS tox results', 'Pinpoint pupils and apnea'],
      refutingFindings: [],
      status: 'Leading Suspect',
    },
    {
      id: 'DIFF-TX-02',
      condition: 'Hypoglycemic Coma',
      probability: 5,
      supportingFindings: ['Unresponsive presentation'],
      refutingFindings: ['Fingerstick blood glucose 108 mg/dL normal on arrival'],
      status: 'Ruled Out',
    },
  ],
  treatmentLog: [
    {
      id: 'TR-TX-01',
      time: '22:30 UTC',
      action: 'Field Naloxone 4mg IV Push',
      operator: 'Paramedic Hayes',
      response: 'Respirations resumed at 16 breaths/min. Patient aroused.',
    },
    {
      id: 'TR-TX-02',
      time: '23:05 UTC',
      action: 'Naloxone Continuous Drip Initiated (0.4 mg/hr)',
      operator: 'Dr. Marcus Vance, MD',
      response: 'Prevents re-narcotization from high-affinity lipophilic carfentanil.',
    },
  ],
  isEscalatedToInvestigation: false,
  linkedInvestigationCaseId: undefined,
};

export const ALL_PRESET_CHARTS: MedicalCaseChart[] = [
  INITIAL_MEDICAL_CHART,
  MOTORCYCLE_CRASH_MEDICAL_CHART,
  OVERDOSE_TOXICOLOGY_MEDICAL_CHART,
];
