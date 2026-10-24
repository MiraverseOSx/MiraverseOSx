export type DGASystem =
  | 'TRACE'
  | 'AEGIS'
  | 'ORACLE'
  | 'MEDSTAT'
  | 'CIPHER'
  | 'CIVITAS'
  | 'COMMS'
  | 'ARCHIVE'
  | 'BLACKOUT'
  | 'SHIELD'
  | 'EYES';

export type Classification =
  | 'UNCLASSIFIED // FOUO'
  | 'CONFIDENTIAL'
  | 'SECRET // NOFORN'
  | 'TOP SECRET // NOFORN'
  | 'TOP SECRET // SPECIAL ACCESS REQUIRED';

export type CanonicalCaseStatus = 'AVAILABLE' | 'ACTIVE' | 'ON HOLD' | 'REFERRED' | 'CLOSED';
export type CaseStatus = CanonicalCaseStatus | 'Awaiting Acceptance' | 'Active' | 'Under Review' | 'Suspended' | 'Closed';

export function normalizeCaseStatus(status?: string): CanonicalCaseStatus {
  if (!status) return 'AVAILABLE';
  const upper = status.toUpperCase();
  if (upper === 'ACTIVE') return 'ACTIVE';
  if (upper === 'AVAILABLE' || upper === 'AWAITING ACCEPTANCE' || upper === 'AWAITING_ACCEPTANCE') return 'AVAILABLE';
  if (upper === 'ON HOLD' || upper === 'ON_HOLD' || upper === 'SUSPENDED') return 'ON HOLD';
  if (upper === 'REFERRED' || upper === 'UNDER REVIEW' || upper === 'UNDER_REVIEW') return 'REFERRED';
  if (upper === 'CLOSED') return 'CLOSED';
  return 'AVAILABLE';
}

export type RequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'QUEUED'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'AWAITING RESPONSE'
  | 'COMPLETE'
  | 'CANCELLED';

export type ForensicRequestStatus = RequestStatus | 'Pending' | 'Transferred' | 'Under Analysis' | 'Completed';

export function normalizeRequestStatus(status?: string): RequestStatus {
  if (!status) return 'DRAFT';
  const upper = status.toUpperCase();
  if (upper === 'DRAFT') return 'DRAFT';
  if (upper === 'SUBMITTED') return 'SUBMITTED';
  if (upper === 'QUEUED' || upper === 'PENDING') return 'QUEUED';
  if (upper === 'ASSIGNED') return 'ASSIGNED';
  if (upper === 'IN PROGRESS' || upper === 'UNDER ANALYSIS' || upper === 'IN_PROGRESS') return 'IN PROGRESS';
  if (upper === 'AWAITING RESPONSE' || upper === 'AWAITING_RESPONSE' || upper === 'TRANSFERRED') return 'AWAITING RESPONSE';
  if (upper === 'COMPLETE' || upper === 'COMPLETED') return 'COMPLETE';
  if (upper === 'CANCELLED' || upper === 'CANCELED') return 'CANCELLED';
  return 'QUEUED';
}

export type Priority = 'Routine' | 'Priority' | 'High' | 'Critical';

export type CaseCreationSource = 'manual' | 'assignment' | 'simulation' | 'external' | 'training';

export type MedicalRequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Acknowledged'
  | 'In Progress'
  | 'Awaiting Information'
  | 'Completed'
  | 'Partially Fulfilled'
  | 'Rejected'
  | 'Cancelled';

export type FindingKind =
  | 'Reported Information'
  | 'Investigator Observation'
  | 'Documentary Information'
  | 'Laboratory Finding'
  | 'Medical Finding'
  | 'Inference or Hypothesis'
  | 'Verified Fact'
  | 'Disputed Information';

export interface IncidentRevision {
  id: string;
  timestamp: string;
  actor: string;
  previousValue: string;
  newValue: string;
  reason?: string;
}

export interface MedicalRecordsRequest {
  id: string;
  caseId: string;
  subjectPersonId?: string;
  subjectName: string;
  requestingInvestigator: string;
  facility?: string;
  recordsRequested: string;
  dateRange?: string;
  purpose?: string;
  legalBasis?: string;
  priority: Priority;
  status: MedicalRequestStatus;
  submittedAt: string;
  updatedAt: string;
  systemRequestId?: string;
  releasedDocumentId?: string;
  statusNote?: string;
}

export interface CustodyEvent {
  id: string;
  timestamp: string;
  releasingCustodian: string;
  receivingCustodian: string;
  reason: string;
  location?: string;
  sealStatus?: string;
  notes?: string;
}

export interface InvestigativeFinding {
  id: string;
  kind: FindingKind;
  statement: string;
  supportingRecordIds: string[];
  recordedBy: string;
  recordedAt: string;
}

export interface SuggestionDisposition {
  suggestionId: string;
  status: 'suggested' | 'accepted' | 'dismissed' | 'deferred';
  updatedAt: string;
  updatedBy: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'under_review' | 'completed';

export interface TaskComment {
  id: string;
  author: string;
  authorRole?: string;
  timestamp: string;
  content: string;
}

export interface TaskActivityItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface Task {
  id: string;
  caseId?: string;
  objectiveId?: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  assignedTo: string;
  phase: 'Preliminary' | 'Active Investigation' | 'Forensic Analysis' | 'Intervention' | 'Prosecution';
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  startDate?: string;
  parentTaskId?: string;
  subtasks?: Task[];
  dependsOn?: string[];
  blockedBy?: string[];
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
  comments?: TaskComment[];
  activityHistory?: TaskActivityItem[];
  isFavorite?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: 'daily' | 'weekly' | 'shift_start';
  linkedDocumentIds?: string[];
  linkedEvidenceIds?: string[];
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'Toxicological Specimen' | 'Digital Media' | 'Physical Item' | 'Document' | 'Ballistics' | 'Chemical Residue';
  description: string;
  locationFound: string;
  dateRecovered: string;
  custodyStatus: 'In DGA Custody' | 'Transferred to TRACE' | 'Awaiting Courier' | 'Under Analysis' | 'Secured in Vault' | 'Compromised' | 'Collected';
  secureHash?: string;
  linkedTraceEvidenceId?: string;
  linkedSuspectName?: string;
  investigatorNotes?: string;
  collector?: string;
  custodian?: string;
  storageLocation?: string;
  seal?: string;
  custodyLog?: CustodyEvent[];
}

export interface PersonReference {
  personId: string;
  name: string;
  role: string;
  affiliation: string;
  threatLevel: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe';
  status: string;
  notes?: string;
}

export interface OrganizationReference {
  organizationId: string;
  name: string;
  type: string;
  roleInCase: string;
}

export interface LocationReference {
  locationId: string;
  name: string;
  significance: string;
}

export interface CommunicationReference {
  communicationId: string;
  subject: string;
  sender: string;
  timestamp: string;
}

export interface DocumentReference {
  id: string;
  title: string;
  classification: Classification;
  date: string;
  author: string;
  content: string;
  sourceSystem?: DGASystem;
  requestId?: string;
  findingId?: string;
}

export interface ForensicRequest {
  id: string;
  caseId: string;
  dateRequested: string;
  requestedBy: string;
  status: ForensicRequestStatus;
  targetModules: string[];
  evidenceIds: string[];
  notes: string;
  linkedTraceCaseId?: string;
  resultSummary?: string;
  completedAt?: string;
  traceExamIds?: string[];
  investigativeQuestion?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type:
    | 'CASE_OPENED'
    | 'TASK_COMPLETED'
    | 'FORENSIC_REQUESTED'
    | 'FORENSIC_RESULT'
    | 'CABLE_RECEIVED'
    | 'EVIDENCE_LOGGED'
    | 'NOTE_ADDED'
    | 'STATUS_CHANGED'
    | 'SYSTEM_LINKED'
    | 'SYSTEM_REQUEST'
    | 'SYSTEM_FINDING'
    | 'SYSTEM_UPDATE'
    | 'DOCUMENT_ATTACHED'
    | 'INCIDENT_AMENDED'
    | 'PERSON_LINKED'
    | 'MEDICAL_REQUESTED'
    | 'CUSTODY_TRANSFERRED'
    | 'FINDING_RECORDED';
  actor: string;
  description: string;
  recordId?: string;
}

export interface AgentNote {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  content: string;
}

export type CaseDepartment = 'Investigation' | 'Medical' | 'Intelligence' | 'Government';

export interface CaseCrossLink {
  id: string;
  caseId: string;
  title: string;
  department: CaseDepartment;
  relationship:
    | 'escalated_from'
    | 'lead_generated'
    | 'policy_fallout'
    | 'medical_record_linked'
    | 'shares_suspect'
    | 'shares_evidence'
    | 'judicial_warrant';
  summary: string;
  createdAt: string;
}

export interface CaseCauseHypothesis {
  primaryCause?: string;
  causeConfidence?: number;
  causeFindings?: string;
  weaponOrVector?: string;
  motive?: string;
  primeSuspectId?: string;
  primeSuspectName?: string;
  incidentLocation?: string;
  incidentTimeWindow?: string;
  modusOperandi?: string;
  formalCharge?: string;
  supportingEvidenceIds?: string[];
  investigatorNotes?: string;
  indictmentStatus?: 'Drafting' | 'Submitted' | 'Verified' | 'Indicted';
  indictmentResult?: string;
  submittedAt?: string;
}

export interface SuspectInvestigationProfile {
  id: string;
  name: string;
  alias?: string;
  role?: string;
  affiliation?: string;
  meansNotes?: string;
  motiveNotes?: string;
  opportunityNotes?: string;
  alibiStatus?: 'Unverified' | 'Corroborated' | 'Contradicted / False Alibi' | 'No Alibi' | 'Suspicious';
  redFlags?: string;
  verdict?: 'Person of Interest' | 'Prime Suspect' | 'Cleared' | 'Detained' | 'Hostile' | 'Accomplice' | 'Material Witness';
  linkedEvidenceIds?: string[];
}

export interface SeedCase {
  id: string;
  title: string;
  classification: Classification;
  status: CaseStatus;
  priority: Priority;
  department?: CaseDepartment;
  leadSystem: DGASystem;
  supportingSystems: DGASystem[];
  assignedAgents: string[];
  primaryInvestigator?: string;
  investigatorSignature?: string;
  signedAt?: string;
  acceptedAt?: string;
  summary: string;
  objectives: Objective[];
  tasks: Task[];
  evidence: EvidenceItem[];
  people: PersonReference[];
  organizations: OrganizationReference[];
  locations: LocationReference[];
  communications: CommunicationReference[];
  documents: DocumentReference[];
  forensicRequests: ForensicRequest[];
  timeline: TimelineEvent[];
  notes: AgentNote[];
  causeHypothesis?: CaseCauseHypothesis;
  suspectProfiles?: SuspectInvestigationProfile[];
  linkedTraceCaseId?: string;
  medicalRecordId?: string;
  creationSource?: CaseCreationSource;
  incidentOccurredAt?: string;
  incidentLocationText?: string;
  reportingParty?: string;
  incidentRevisions?: IncidentRevision[];
  medicalRequests?: MedicalRecordsRequest[];
  findings?: InvestigativeFinding[];
  suggestionState?: SuggestionDisposition[];
  workflowStage?: string;
  crossLinks?: CaseCrossLink[];
  tags?: string[];
  isFavorite?: boolean;
  customFields?: Record<string, string | number | boolean>;
  comments?: TaskComment[];
  requestingUnit?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Starting payload unlocked ONLY when Special Agent formally accepts Docket DGA-26-194.
 * Keeps initial evidence count small (3 exhibits) and focused on a single case.
 */
export const DGA_26_194_STARTING_PAYLOAD = {
  objectives: [
    {
      id: 'OBJ-194-1',
      title: 'Determine Chemical Signature and Origin',
      description: 'Perform mass spectrometry and chemical screening on Vance biological specimens in TRACE laboratory.',
      completed: false
    },
    {
      id: 'OBJ-194-2',
      title: 'Secure Summit Enclave and Preserve Chain of Custody',
      description: 'Quarantine Suite 400 at Embassy Row and inventory all glassware and air handling filters.',
      completed: false
    },
    {
      id: 'OBJ-194-3',
      title: 'Neutralize Delivery Network and Interdict Broker',
      description: 'Trace procurement of synthetic precursors to chemical broker Viktor Krell before transit.',
      completed: false
    }
  ],
  tasks: [
    {
      id: 'TSK-194-01',
      objectiveId: 'OBJ-194-1',
      title: 'Extract and Package Vance Blood & Gastric Samples',
      description: 'Coordinate with Dr. Gregory Thorne at St. Jude Metro Hospital to secure three 5mL vials with biohazard seals.',
      completed: false,
      assignedTo: 'Special Agent Miracle Jerome',
      phase: 'Preliminary' as const,
      linkedEvidenceIds: ['EV-194-A']
    },
    {
      id: 'TSK-194-02',
      objectiveId: 'OBJ-194-1',
      title: 'Issue Forensic Request to TRACE Forensic Laboratory',
      description: 'Transmit Case DGA-26-194 and specimens EV-194-A through EV-194-C to TRACE Laboratory for spectroscopy run.',
      completed: false,
      assignedTo: 'Special Agent Miracle Jerome',
      phase: 'Forensic Analysis' as const,
      linkedEvidenceIds: ['EV-194-A', 'EV-194-B', 'EV-194-C']
    },
    {
      id: 'TSK-194-03',
      objectiveId: 'OBJ-194-2',
      title: 'Impound Crystal Water Carafe & Residue Swabs',
      description: 'Execute DGA extraterritorial warrant in Embassy Suite 400. Recover glassware handled by the Ambassador.',
      completed: false,
      assignedTo: 'Field Agent K. Lawson',
      phase: 'Active Investigation' as const,
      linkedEvidenceIds: ['EV-194-B']
    }
  ],
  evidence: [
    {
      id: 'EV-194-A',
      title: 'Whole Blood Specimen 412-A (Ambassador Vance)',
      category: 'Toxicological Specimen' as const,
      description: '5mL whole blood extracted under nitrogen atmosphere. Refrigerated at 4°C in bio-transport container.',
      locationFound: 'St. Jude Isolation Ward 4-B',
      dateRecovered: '2026-09-29 06:15 UTC',
      custodyStatus: 'In DGA Custody' as const,
      secureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 'EV-194-B',
      title: 'Crystal Water Tumbler Rim Swab',
      category: 'Chemical Residue' as const,
      description: 'Sterile cotton swab of glassware edge handled by envoy prior to sudden loss of consciousness.',
      locationFound: 'Metropolitan Embassy Row - Suite 400',
      dateRecovered: '2026-09-29 07:10 UTC',
      custodyStatus: 'In DGA Custody' as const,
      secureHash: 'f4ca44b20755f9a657e2a472c918ef0ef4608c70425c2707297e682d33454b51'
    },
    {
      id: 'EV-194-C',
      title: 'Audio Recording Summit Table Lapel Mic',
      category: 'Digital Media' as const,
      description: 'Encrypted WAV file capturing the 14 minutes preceding the collapse. Labored breathing detected at minute 11.',
      locationFound: 'Embassy Row Audio Feed Splitter',
      dateRecovered: '2026-09-29 05:00 UTC',
      custodyStatus: 'In DGA Custody' as const,
      secureHash: '8a99a35408e2f132e0bc2a85e8d641fc02187f5d6f30e702c2e39e090f77bf4f'
    }
  ],
  documents: [
    {
      id: 'DOC-194-01',
      title: 'Initial Clinical Emergency Summary (Dr. Thorne)',
      classification: 'SECRET // NOFORN' as const,
      date: '2026-09-29',
      author: 'Dr. G. Thorne, MD',
      content:
        'SUBJECT: Vance, Christian. Presentation: Profuse diaphoresis, miosis, fasciculations, acute respiratory arrest. Cholinesterase activity at 28%. Unresponsive to standard atropine dosing alone. Presumptive diagnosis: synthetic high-potency nerve agent.'
    },
    {
      id: 'DOC-194-02',
      title: 'Embassy Security Camera Audit Log #4',
      classification: 'CONFIDENTIAL' as const,
      date: '2026-09-29',
      author: 'Diplomatic Security Officer Ruiz',
      content:
        'Access badge 8891 (Catering subcontractor) opened the pantry doors at 09:14 AM. Facial biometric mismatch flagged at 09:16 AM. Subject exited through subterranean freight dock 2 minutes before summit convened.'
    }
  ],
  people: [
    {
      personId: 'P-101',
      name: 'Ambassador Christian Vance',
      role: 'Victim / Diplomatic Envoy',
      affiliation: 'State Department',
      threatLevel: 'None' as const,
      status: 'Hospitalized (Comatose)'
    },
    {
      personId: 'P-102',
      name: 'Dr. Gregory Thorne',
      role: 'Attending Toxicologist',
      affiliation: 'St. Jude Metropolitan Hospital',
      threatLevel: 'Low' as const,
      status: 'Cooperating Medical Staff'
    },
    {
      personId: 'P-103',
      name: 'Viktor Krell',
      role: 'Primary Suspect / Synthesis Broker',
      affiliation: 'Red Dawn Syndicate / Phoenix Bio Shadow Contact',
      threatLevel: 'Severe' as const,
      status: 'Under Active Surveillance'
    }
  ],
  organizations: [
    {
      organizationId: 'ORG-02',
      name: 'St. Jude Metropolitan Hospital',
      type: 'Hospital',
      roleInCase: 'Emergency clinical stabilization and biohazard custody'
    },
    {
      organizationId: 'ORG-04',
      name: 'Phoenix Biotech Ltd.',
      type: 'Suspect Entity',
      roleInCase: 'Suspected origin point of synthesis glassware and precursor reagents'
    },
    {
      organizationId: 'ORG-05',
      name: 'TRACE Central Forensic Facility',
      type: 'Forensic Lab',
      roleInCase: 'Authorized chemical spectroscopy and molecular mass verification'
    }
  ],
  locations: [
    {
      locationId: 'LOC-02',
      name: 'Metropolitan Embassy Row - Suite 400',
      significance: 'Scene of the incident'
    },
    {
      locationId: 'LOC-03',
      name: 'St. Jude Isolation Ward 4-B',
      significance: 'Location of hospitalized victim'
    }
  ]
};

/**
 * Starting payload unlocked when Special Agent formally accepts Docket INV-26-402 (Motorcycle Fatal Crash).
 */
export const INV_26_402_STARTING_PAYLOAD = {
  objectives: [
    {
      id: 'OBJ-402-1',
      title: 'Analyze Motorcycle Telematics & Crash Black Box (ECU)',
      description: 'Decode throttle position sensor, wheel speed delta, and ABS pressure at point of impact.',
      completed: false
    },
    {
      id: 'OBJ-402-2',
      title: 'Forensically Inspect Severed Front Brake Line',
      description: 'Determine if hydraulic failure was traumatic collision rupture or deliberate mechanical shear.',
      completed: false
    },
    {
      id: 'OBJ-402-3',
      title: 'Chemical Screening of Roadway Apex Fluid Swab',
      description: 'Screen roadbed liquid slick sample from Mile Marker 42 for synthetic oils or fluorocarbon lubricants.',
      completed: false
    },
    {
      id: 'OBJ-402-4',
      title: 'Trace Secondary Vehicle Navy Clearcoat Transfer',
      description: 'Analyze paint transfer on rear swingarm and match against toll plaza ANPR camera feeds.',
      completed: false
    }
  ],
  tasks: [
    {
      id: 'TSK-402-1',
      title: 'Extract CAN-Bus crash logs from Vortex R-1000 motorcycle ECU',
      description: 'Verify if throttle opened 100% via remote command or electronic throttle actuator glitch.',
      phase: 'Preliminary' as const,
      assignedTo: 'Lead Investigator',
      completed: false,
      status: 'pending' as const
    },
    {
      id: 'TSK-402-2',
      title: 'Requisition TRACE metallurgical inspection on severed brake hose',
      description: 'Examine steel braided hose ferrule for microscopic tool shear striations.',
      phase: 'Forensic Analysis' as const,
      assignedTo: 'Lead Investigator',
      completed: false,
      status: 'pending' as const
    },
    {
      id: 'TSK-402-3',
      title: 'Interrogate race shop mechanic Marcus Vance',
      description: 'Inquire into pre-ride brake bleed service completed 6 hours prior to the fatal ride.',
      phase: 'Active Investigation' as const,
      assignedTo: 'Lead Investigator',
      completed: false,
      status: 'pending' as const
    },
    {
      id: 'TSK-402-4',
      title: 'Query Highway Patrol ANPR database for navy fleet SUV',
      description: 'Scan tollway cameras 4 miles south of Mile Marker 42 between 01:30 and 02:00 UTC.',
      phase: 'Active Investigation' as const,
      assignedTo: 'Lead Investigator',
      completed: false,
      status: 'pending' as const
    }
  ],
  evidence: [
    {
      id: 'EV-402-A',
      title: 'Motorcycle Onboard ECU & Telematics Flight Recorder (Black Box)',
      category: 'Digital Media' as const,
      description: 'Electronic control unit recovered from crushed under-seat tray. Records CAN-bus engine RPM, throttle opening, and wheel velocity.',
      locationFound: 'Mountain Highway 17 - Mile Marker 42 (Crash Debris Field)',
      dateRecovered: '2026-10-08 02:40 UTC',
      custodyStatus: 'In DGA Custody' as const,
      secureHash: 'ec402a991823fbc0182746ad98124ef1928374a56b4c3d2e1f0a9b8c7d6e5f4a',
      investigatorNotes: 'Throttle position spikes to 100% wide open 1.2s before impact with 0 PSI front brake pressure recorded.'
    },
    {
      id: 'EV-402-B',
      title: 'Severed Front Hydraulic Brake Hose & Banjo Bolt',
      category: 'Physical Item' as const,
      description: 'Stainless braided hydraulic line severed 2 inches above lower caliper mount. Edges appear uniform under 10x magnification.',
      locationFound: 'Vortex R-1000 Front Fork Assembly',
      dateRecovered: '2026-10-08 03:15 UTC',
      custodyStatus: 'In DGA Custody' as const,
      secureHash: 'bf402b112233445566778899aabbccddeeff00112233445566778899aabbccdd',
      investigatorNotes: 'Clean shear striations indicate mechanical wire cutter tool, not jagged tension rupture from crash impact.'
    },
    {
      id: 'EV-402-C',
      title: 'Roadway Apex Pavement Fluid Swab (Mile Marker 42)',
      category: 'Chemical Residue' as const,
      description: 'Cotton swab of viscous non-drying oily sheen collected across the racing line at the entrance of the decreasing-radius turn.',
      locationFound: 'Highway 17 Mile Marker 42 Apex Asphalt',
      dateRecovered: '2026-10-08 03:45 UTC',
      custodyStatus: 'In DGA Custody' as const,
      secureHash: 'cf402c33445566778899aabbccddeeff00112233445566778899aabbccddeeff',
      investigatorNotes: 'Hydrocarbon signature does not match standard motor oil or coolant; contains industrial fluoropolymer friction reducer.'
    },
    {
      id: 'EV-402-D',
      title: 'Cracked Carbon-Kevlar Helmet with MicroSD Optical Storage',
      category: 'Digital Media' as const,
      description: 'Aerodynamic full-face helmet with integrated chin-mount optical camera. Memory card eject slot was locked.',
      locationFound: 'Shoulder Grass 12 Meters from Guardrail Post 14',
      dateRecovered: '2026-10-08 02:50 UTC',
      custodyStatus: 'In DGA Custody' as const,
      secureHash: 'df402d5566778899aabbccddeeff00112233445566778899aabbccddeeff0011',
      investigatorNotes: 'Video records high-beam headlights suddenly appearing in rearview mirror followed by electronic throttle surge.'
    },
    {
      id: 'EV-402-E',
      title: 'Rear Swingarm Metallic Navy Paint Transfer Sample',
      category: 'Physical Item' as const,
      description: 'Microscopic paint chip scrapings embedded in the aluminum swingarm and rear exhaust hanger.',
      locationFound: 'Rear Left Swingarm Impact Zone',
      dateRecovered: '2026-10-08 04:10 UTC',
      custodyStatus: 'In DGA Custody' as const,
      secureHash: 'ef402e778899aabbccddeeff00112233445566778899aabbccddeeff00112233',
      investigatorNotes: 'Matches commercial fleet polyurethane clearcoat from a heavy full-size SUV bumper.'
    }
  ],
  documents: [
    {
      id: 'DOC-402-01',
      title: 'State Highway Patrol Fatal Crash Investigation Report #402',
      classification: 'CONFIDENTIAL' as const,
      date: '2026-10-08',
      author: 'Trooper Travis Miller (Reconstruction Unit)',
      content:
        'COLLISION SUMMARY: At 01:42 hours, a 2025 Vortex R-1000 sport motorcycle operated by Elena Rostova left the roadway on Highway 17 at Mile Marker 42, colliding with steel guardrail post 14 at an estimated speed of 88-95 MPH. Skid mark analysis shows zero initial front deceleration. Post-impact inspection revealed severed hydraulic brake lines and anomalous paint transfer on rear swingarm.'
    },
    {
      id: 'DOC-402-02',
      title: 'ECU Telematics Diagnostic Extraction (Frame 0x4F Audit)',
      classification: 'SECRET // NOFORN' as const,
      date: '2026-10-08',
      author: 'DGA Cyber-Physical Forensics Division',
      content:
        'DIAGNOSTIC AUDIT: At T-minus 1.4 seconds before impact, CAN-Bus frame 0x4F (Electronic Throttle Actuator) received an unauthenticated remote injection command overriding the manual twist-grip sensor and locking butterflies at 100% open. Front master cylinder pressure registered 0.0 PSI due to total hydraulic fluid loss.'
    },
    {
      id: 'DOC-402-03',
      title: 'Apex Dynamics HR & Corporate Whistleblower Memorandum',
      classification: 'CONFIDENTIAL' as const,
      date: '2026-10-07',
      author: 'Internal Corporate Compliance Office',
      content:
        'MEMORANDUM: Deceased Elena Rostova filed a formal whistleblower notification alleging that Apex Dynamics autonomous drive units were vulnerable to remote CAN-bus hijack via cellular telematics dongles. A Congressional deposition was scheduled for Oct 12.'
    }
  ],
  people: [
    {
      personId: 'P-401',
      name: 'Elena Rostova',
      role: 'Victim / Lead Propulsion Software Architect',
      affiliation: 'Apex Dynamics Autonomous Mobility',
      threatLevel: 'None' as const,
      status: 'Deceased (Crash Victim)'
    },
    {
      personId: 'P-402',
      name: 'Marcus Vance',
      role: 'Race Tuner & Motorcycle Master Technician',
      affiliation: 'Vance Precision Performance',
      threatLevel: 'Moderate' as const,
      status: 'Person of Interest / Last Serviced Vehicle'
    },
    {
      personId: 'P-403',
      name: 'Dominic Sterling',
      role: 'VP of Proprietary Drive Architecture',
      affiliation: 'Apex Dynamics',
      threatLevel: 'High' as const,
      status: 'Person of Interest / Whistleblower Target'
    },
    {
      personId: 'P-404',
      name: 'Driver of Navy Fleet SUV (Unidentified)',
      role: 'Suspected Pursuit Vehicle Operator',
      affiliation: 'Private Security Contractor',
      threatLevel: 'Severe' as const,
      status: 'Fugitive / Active Search'
    },
    {
      personId: 'P-405',
      name: 'Trooper Travis Miller',
      role: 'First Responding Crash Reconstructionist',
      affiliation: 'State Highway Patrol (Troop B)',
      threatLevel: 'Low' as const,
      status: 'Cooperating Law Enforcement'
    }
  ],
  organizations: [
    {
      organizationId: 'ORG-402-1',
      name: 'Apex Dynamics Autonomous Mobility',
      type: 'Corporation',
      roleInCase: 'Employer of victim and source of whistleblower dispute'
    },
    {
      organizationId: 'ORG-402-2',
      name: 'State Highway Patrol Collision Reconstruction Division',
      type: 'Law Enforcement',
      roleInCase: 'Initial roadway response and vehicle impound'
    },
    {
      organizationId: 'ORG-402-3',
      name: 'Vance Precision Performance',
      type: 'Race Shop / Garage',
      roleInCase: 'Facility where motorcycle underwent pre-ride brake service'
    }
  ],
  locations: [
    {
      locationId: 'LOC-402-1',
      name: 'Mountain Highway 17 - Mile Marker 42',
      significance: 'Fatal crash scene / Decreasing radius apex turn'
    },
    {
      locationId: 'LOC-402-2',
      name: 'Vance Precision Performance - Bay 3',
      significance: 'Pre-ride maintenance garage'
    },
    {
      locationId: 'LOC-402-3',
      name: 'Apex Dynamics Proving Grounds',
      significance: 'Autonomous vehicle test track'
    }
  ]
};

/**
 * Clean Initial Seed Cases:
 * Starts in Available Assignments (Awaiting Acceptance).
 * No active evidence, tasks, or timeline until the player explicitly clicks ACCEPT CASE.
 */
export const seedCases: SeedCase[] = [
  {
    id: 'DGA-26-194',
    title: 'Operation Velvet Cord: Diplomatic Toxin Exposure',
    classification: 'TOP SECRET // NOFORN',
    status: 'AVAILABLE',
    priority: 'Critical',
    department: 'Investigation',
    leadSystem: 'TRACE',
    supportingSystems: ['ORACLE', 'MEDSTAT', 'COMMS'],
    assignedAgents: [],
    primaryInvestigator: '',
    investigatorSignature: '',
    requestingUnit: 'Diplomatic Security Service / State Department Liaison',
    deadline: 'Immediate Response / 72h Sovereign Enclave Window',
    summary:
      'Ambassador Christian Vance collapsed during closed-door bilateral trade discussions at Embassy Row. Initial toxicology indicates cholinesterase inhibition with an uncatalogued organophosphate analog. Immediate TRACE mass spectrometry and chemical profiling required to determine sovereign state origin.',
    objectives: [],
    tasks: [],
    evidence: [],
    people: [],
    organizations: [],
    locations: [],
    communications: [],
    documents: [],
    forensicRequests: [],
    timeline: [],
    notes: [],
    linkedTraceCaseId: 'FS-2026-00421',
    tags: ['diplomatic-security', 'organophosphate', 'toxicology', 'embassy-row'],
    createdAt: '2026-09-29T05:30:00Z',
    updatedAt: '2026-09-29T05:30:00Z'
  },
  {
    id: 'INV-26-402',
    title: 'Operation Apex Drift: Mile Marker 42 Motorcycle Fatal Crash',
    classification: 'TOP SECRET // NOFORN',
    status: 'AVAILABLE',
    priority: 'Critical',
    department: 'Investigation',
    leadSystem: 'TRACE',
    supportingSystems: ['AEGIS', 'ORACLE', 'COMMS'],
    assignedAgents: [],
    primaryInvestigator: '',
    investigatorSignature: '',
    requestingUnit: 'State Highway Patrol / Special Crimes Collision Unit',
    deadline: 'Immediate Forensic Reconstruction / 48h Evidentiary Window',
    summary:
      'Autonomous mobility whistleblower Elena Rostova suffered a fatal high-speed motorcycle crash on Mountain Highway 17 at Mile Marker 42. Initial highway patrol review suspected operator speed error, but onboard ECU telematics indicate wide-open throttle lock and zero front hydraulic brake pressure. Microscopic shear on the front brake line and navy paint transfer on the swingarm indicate premeditated vehicular sabotage.',
    objectives: [],
    tasks: [],
    evidence: [],
    people: [],
    organizations: [],
    locations: [],
    communications: [],
    documents: [],
    forensicRequests: [],
    timeline: [],
    notes: [],
    linkedTraceCaseId: 'FS-2026-00488',
    tags: ['vehicular-crash', 'motorcycle-crash', 'telematics', 'brake-sabotage', 'highway-reconstruction'],
    createdAt: '2026-10-08T03:00:00Z',
    updatedAt: '2026-10-08T03:00:00Z'
  }
];
