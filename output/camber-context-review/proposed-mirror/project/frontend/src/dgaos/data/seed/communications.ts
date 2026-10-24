export interface RichMailAttachment {
  id?: string;
  name: string;
  type?: 'evidence' | 'document' | 'telemetry' | 'audio' | 'image' | 'lab_result' | 'file';
  size?: string;
  classification?: string;
  content?: string;
  sourceCaseId?: string;
  evidenceId?: string;
  previewUrl?: string;
}

export type MailAttachment = string | RichMailAttachment;

export type CommunicationStatus = 'UNREAD' | 'ACTION REQUIRED' | 'RESPONDED' | 'ARCHIVED';

export function normalizeCommunicationStatus(comm: { read?: boolean; status?: string; priority?: string }): CommunicationStatus {
  if (comm.status) {
    const s = comm.status.toUpperCase();
    if (s === 'ACTION REQUIRED' || s === 'ACTION_REQUIRED') return 'ACTION REQUIRED';
    if (s === 'RESPONDED') return 'RESPONDED';
    if (s === 'ARCHIVED') return 'ARCHIVED';
    if (s === 'UNREAD') return 'UNREAD';
  }
  if (!comm.read) {
    if (comm.priority === 'Flash / Immediate' || comm.priority === 'Critical') {
      return 'ACTION REQUIRED';
    }
    return 'UNREAD';
  }
  return 'RESPONDED';
}

export interface SeedCommunication {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  status?: CommunicationStatus;
  priority: 'Routine' | 'Priority' | 'Flash / Immediate';
  classification: string;
  threadId: string;
  attachments?: MailAttachment[];
  caseId?: string;
}

export const seedCommunications: SeedCommunication[] = [
  {
    id: 'COMM-ONBOARD-01',
    sender: 'DGA Enclave Security & Identity Operations',
    recipient: 'Special Agent Miracle Jerome [HQ-04]',
    subject: 'CREDENTIALS: Enclave Terminal Activation & Clearance Level 5',
    body: `Special Agent Jerome,

Your biometric credentials and Level 5 security token have been provisioned for Terminal Node HQ-04. Your clearance covers TRACE Laboratory forensics, wiretap monitoring, and major incident command.

All operational terminal activity is logged in accordance with Federal Directive 44. Review incoming assignments on your command deck to begin active casework.

-- Identity Assurance Operations`,
    timestamp: '2026-09-29T05:00:00Z',
    read: false,
    status: 'UNREAD',
    priority: 'Routine',
    classification: 'SECRET // NOFORN',
    threadId: 'TH-ONBOARD-01'
  },
  {
    id: 'COMM-ONBOARD-02',
    sender: 'Office of the Deputy Director - E. Cross',
    recipient: 'Special Agent Miracle Jerome [HQ-04]',
    subject: 'DIRECTIVE: Operational Protocol DGA-01 & Major Case Command Rules',
    body: `Agent Jerome,

Welcome to Major Case Squad. Remember our operational rules:

1. No case is active until formally accepted and cryptographically signed by the Primary Investigator.
2. Maintain strict chain-of-custody protocols for all physical evidence submitted to TRACE Central Forensic Facility.
3. Keep your directives up to date and coordinate across divisions before taking tactical action.

Good luck on your first rotation.

Evelyn Cross
Deputy Director, Major Case Squad`,
    timestamp: '2026-09-29T05:15:00Z',
    read: false,
    status: 'ACTION REQUIRED',
    priority: 'Routine',
    classification: 'SECRET // NOFORN',
    threadId: 'TH-ONBOARD-02'
  },
  {
    id: 'COMM-ONBOARD-03',
    sender: 'TRACE Central Forensic Laboratory',
    recipient: 'Special Agent Miracle Jerome [HQ-04]',
    subject: 'NOTICE: Laboratory Requisition & Spectroscopy Pipeline Online',
    body: `To: Special Agent Miracle Jerome
From: TRACE Central Forensic Facility

The TRACE laboratory pipeline is currently calibrated and standing by for analytical requisitions. When evidence is logged on an active docket, submit electronic forensic requests through your workstation to schedule mass spectrometry (LC-MS), comparative stereomicroscopy, or digital extraction.

All instruments are ISO/IEC 17025 accredited.

-- Lab Administrative Desk`,
    timestamp: '2026-09-29T05:30:00Z',
    read: false,
    status: 'UNREAD',
    priority: 'Routine',
    classification: 'UNCLASSIFIED // FOUO',
    threadId: 'TH-ONBOARD-03'
  },
  {
    id: 'COMM-ONBOARD-04',
    sender: 'Office of Quality Assurance & Legal Compliance',
    recipient: 'Special Agent Miracle Jerome [HQ-04]',
    subject: 'POLICY REMINDER: Chain of Custody & Evidence Tamper-Seal Verification',
    body: `Mandatory standard for all investigative personnel:

Prior to opening or transferring any physical or biological exhibit, verify the tamper-evident seal integrity and log the exact UTC timestamp. Unverified exhibits will be excluded from grand jury proceedings by the U.S. Attorney Liaison.

-- QMS Compliance Officer Vance`,
    timestamp: '2026-09-29T05:45:00Z',
    read: true,
    status: 'RESPONDED',
    priority: 'Routine',
    classification: 'CONFIDENTIAL',
    threadId: 'TH-ONBOARD-04'
  }
];

export const DGA_26_194_INTRO_CABLE: SeedCommunication = {
  id: 'CABLE-7701',
  sender: 'Dr. Gregory Thorne (St. Jude Metro)',
  recipient: 'Special Agent Miracle Jerome [HQ-04]',
  subject: 'URGENT: Blood Chemistry Anomalies - Ambassador Vance (Case DGA-26-194)',
  body: `Agent Jerome,

We completed our secondary enzyme panel on Ambassador Vance. This is not a natural cerebrovascular accident or cardiac event.

Serum cholinesterase is depressed below 28% of baseline. The presentation is consistent with a delayed-action fluorophosphate or novel carbamate delivered transdermally or via inhalation. Traditional pralidoxime therapy has produced only marginal recovery.

I have extracted three 5mL blood and gastric specimens under biohazard custody. I urge you to immediately transfer these specimens to your TRACE Forensic Laboratory for high-resolution spectroscopy and toxicological profile mapping before cellular degradation occurs.

Awaiting your chain-of-custody courier.

Dr. Gregory Thorne
Chief of Critical Toxicology, St. Jude Metropolitan`,
  timestamp: new Date().toISOString(),
  read: false,
  status: 'ACTION REQUIRED',
  priority: 'Flash / Immediate',
  classification: 'SECRET // NOFORN',
  threadId: 'TH-194-01',
  caseId: 'DGA-26-194',
  attachments: [
    {
      id: 'ATT-7701-1',
      name: 'blood_panel_thorne.pdf',
      type: 'lab_result',
      size: '184 KB',
      classification: 'SECRET // NOFORN',
      content: `CLINICAL PATHOLOGY REPORT - ST. JUDE METROPOLITAN HOSPITAL
PATIENT: Ambassador Christian Vance
INTAKE SPECIMEN: Whole Peripheral Blood (EDTA / Heparin)
RESULT:
- Acetylcholinesterase: 1,840 U/L [Ref: 5,900 - 12,200 U/L] (CRITICALLY DEPRESSED: -72%)
- Plasma Butyrylcholinesterase: 980 U/L [Ref: 4,000 - 11,000 U/L]
- Toxic Screen: Negative for organophosphates G-series (GB, GD, GA).
- POSITIVE for uncatalogued methylphosphonofluoridate synthetic isomer.
RECOMMENDATION: Immediate TRACE LC-MS/MS Tandem High-Resolution Spectrometry required.`,
      sourceCaseId: 'DGA-26-194',
      evidenceId: 'EV-194-A'
    }
  ]
};
