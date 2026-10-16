export type ContactStatus = 'AVAILABLE' | 'BUSY' | 'IN FIELD' | 'OFF DUTY' | 'UNAVAILABLE';

export function normalizeContactStatus(status?: string): ContactStatus {
  if (!status) return 'AVAILABLE';
  const upper = status.toUpperCase();
  if (upper === 'AVAILABLE') return 'AVAILABLE';
  if (upper === 'BUSY' || upper === 'ON CALL' || upper === 'IN SURGERY') return 'BUSY';
  if (upper === 'IN FIELD' || upper === 'IN_FIELD') return 'IN FIELD';
  if (upper === 'OFF DUTY' || upper === 'OFF_DUTY') return 'OFF DUTY';
  if (upper === 'UNAVAILABLE' || upper === 'RESTRICTED') return 'UNAVAILABLE';
  return 'AVAILABLE';
}

export interface PhoneContact {
  id: string;
  name: string;
  title: string;
  department: 'Investigation' | 'Medical' | 'Intelligence' | 'Government' | 'Operations';
  phoneExtension: string;
  status: ContactStatus | 'Available' | 'On Call' | 'In Field' | 'In Surgery' | 'Restricted';
  avatarInitials: string;
  directDialable: boolean;
  priorityLine?: boolean;
}

export interface VoicemailRecord {
  id: string;
  contactId: string;
  callerName: string;
  callerTitle: string;
  timestamp: string;
  duration: string;
  durationSeconds: number;
  isNew: boolean;
  subject: string;
  transcript: string;
  caseId?: string;
  callbackAction?: string;
}

export interface CallLogEntry {
  id: string;
  contactId: string;
  callerName: string;
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration: string;
  caseId?: string;
  summary: string;
}

export interface DialogueNode {
  id: string;
  speakerText: string;
  audioCue?: string;
  options: Array<{
    text: string;
    nextNodeId?: string;
    action?: 'add_evidence' | 'assign_task' | 'escalate_case' | 'hang_up';
    actionPayload?: {
      caseId?: string;
      evidenceTitle?: string;
      evidenceCategory?: string;
      evidenceDesc?: string;
      taskTitle?: string;
      message?: string;
    };
  }>;
}

export const PHONE_CONTACTS: PhoneContact[] = [
  {
    id: 'CONT-YUMI',
    name: 'Agent Yumi Tanaka',
    title: 'Senior Detective / CCTV Video Forensics',
    department: 'Investigation',
    phoneExtension: 'x4412',
    status: 'IN FIELD',
    avatarInitials: 'YT',
    directDialable: true,
    priorityLine: true,
  },
  {
    id: 'CONT-MERCER',
    name: 'Dr. Emily Mercer, MD',
    title: 'Attending Trauma ICU & Forensic Pathologist',
    department: 'Medical',
    phoneExtension: 'x8819',
    status: 'BUSY',
    avatarInitials: 'EM',
    directDialable: true,
    priorityLine: true,
  },
  {
    id: 'CONT-CHEN',
    name: 'Analyst Marcus Chen',
    title: 'SIGINT & Cryptanalysis Team Lead',
    department: 'Intelligence',
    phoneExtension: 'x3309',
    status: 'AVAILABLE',
    avatarInitials: 'MC',
    directDialable: true,
  },
  {
    id: 'CONT-STERLING',
    name: 'Director Donald Sterling',
    title: 'Executive Director of Agency Operations',
    department: 'Government',
    phoneExtension: 'x1000',
    status: 'AVAILABLE',
    avatarInitials: 'DS',
    directDialable: true,
    priorityLine: true,
  },
  {
    id: 'CONT-JENKINS',
    name: 'Special Agent Sarah Jenkins',
    title: 'Forensic Vault Custodian & AFIS Specialist',
    department: 'Investigation',
    phoneExtension: 'x4408',
    status: 'OFF DUTY',
    avatarInitials: 'SJ',
    directDialable: true,
  },
  {
    id: 'CONT-DISPATCH',
    name: 'Federal CAD Dispatch 911',
    title: 'Regional Operations Switchboard',
    department: 'Operations',
    phoneExtension: 'x9110',
    status: 'AVAILABLE',
    avatarInitials: 'CAD',
    directDialable: true,
  },
];

export const INITIAL_VOICEMAILS: VoicemailRecord[] = [];

export const INITIAL_CALL_LOGS: CallLogEntry[] = [];

/**
 * Pre-configured interactive dialogue trees for phone calls
 */
export const DIALOGUE_TREES: Record<string, Record<string, DialogueNode>> = {
  'CONT-YUMI': {
    root: {
      id: 'root',
      speakerText:
        '“Jerome! Good timing. I found something critical in the CCTV review. Check your evidence vault.”',
      options: [
        {
          text: '“What exactly did you spot on the camera tapes, Yumi?”',
          nextNodeId: 'explain_cctv',
        },
        {
          text: '“Did you extract the timestamp and vehicle license plate?”',
          nextNodeId: 'plate_extract',
        },
        {
          text: '“Was the security guard at the gate involved or compromised?”',
          nextNodeId: 'guard_question',
        },
      ],
    },
    explain_cctv: {
      id: 'explain_cctv',
      speakerText:
        '“At 01:42:09 UTC, right before Vance collapsed inside Suite 400, a dark Mercedes Sprinter van cut its headlights at the North Gate. A figure in a navy acrylic windbreaker stepped out and handed a sealed cryogenic canister to the catering entrance.”',
      options: [
        {
          text: '“Push the footage into the Evidence Vault as Item EV-417-D right now.”',
          nextNodeId: 'push_evidence',
          action: 'add_evidence',
          actionPayload: {
            caseId: 'INV-2026-0417',
            evidenceTitle: 'CCTV Video Clip: North Gate Midnight Delivery (CAM-03)',
            evidenceCategory: 'Digital Media',
            evidenceDesc: 'High-definition timestamped MP4 recording showing midnight cryogenic canister exchange at Embassy North Gate.',
            message: 'EV-417-D deposited into Evidence Vault!',
          },
        },
        {
          text: '“Have you cross-checked the vehicle against the municipal DMV registry?”',
          nextNodeId: 'dmv_crosscheck',
        },
      ],
    },
    plate_extract: {
      id: 'plate_extract',
      speakerText:
        '“The rear plate is 7XYZ89, registered to a shell fleet in the harbor district. It traces back to Phoenix Biotech Industrial Pier 42.”',
      options: [
        {
          text: '“Assign surveillance team to Pier 42 warehouse immediately.”',
          nextNodeId: 'assign_pier',
          action: 'assign_task',
          actionPayload: {
            caseId: 'INT-2026-0941',
            taskTitle: 'Conduct Covert Surveillance on Pier 42 Warehouse 18',
            message: 'Surveillance task assigned to Agent Yumi!',
          },
        },
        {
          text: '“Deposit the ALPR plate capture into our investigation records.”',
          nextNodeId: 'push_evidence',
          action: 'add_evidence',
          actionPayload: {
            caseId: 'INV-2026-0417',
            evidenceTitle: 'ALPR Automated Plate Recognition Record #7XYZ89',
            evidenceCategory: 'Digital Media',
            evidenceDesc: 'Plate hit matching Phoenix Biotech freight logistics van at Embassy Row perimeter.',
          },
        },
      ],
    },
    guard_question: {
      id: 'guard_question',
      speakerText:
        '“The gate guard was distracted by a deliberate power surge on the perimeter fence. It smells like an orchestrated intrusion. I’m heading to the security office now.”',
      options: [
        {
          text: '“Stay sharp, Yumi. Keep me posted and stay on encrypted radio.”',
          nextNodeId: 'end_call',
          action: 'hang_up',
        },
      ],
    },
    push_evidence: {
      id: 'push_evidence',
      speakerText:
        '“Done! File transferred. Check your Evidence Vault tab and the CCTV viewer. The video markers are pinned to the timeline. I\'m on my way to re-interview the catering manager.”',
      options: [
        {
          text: '“Thanks, Yumi. Great work. Talk soon.”',
          nextNodeId: 'end_call',
          action: 'hang_up',
        },
      ],
    },
    dmv_crosscheck: {
      id: 'dmv_crosscheck',
      speakerText:
        '“Yes, it’s leased to a shell company called Apex Marine Freight—a known subsidiary of Phoenix Biotech. I’m tagging Marcus Chen in Intelligence to intercept their maritime shipping manifests.”',
      options: [
        {
          text: '“Understood. Coordinate with Chen and update our case timeline.”',
          nextNodeId: 'end_call',
          action: 'hang_up',
        },
      ],
    },
    assign_pier: {
      id: 'assign_pier',
      speakerText:
        '“Copy that! Mobile surveillance unit en route to Pier 42. We’ll maintain 200-meter standoff distance until the search warrant is signed.”',
      options: [
        {
          text: '“Good. Don’t compromise the perimeter. Out.”',
          nextNodeId: 'end_call',
          action: 'hang_up',
        },
      ],
    },
    end_call: {
      id: 'end_call',
      speakerText: '“Understood, Special Agent.田中 out.” [CALL TERMINATED]',
      options: [],
    },
  },
  'CONT-MERCER': {
    root: {
      id: 'root',
      speakerText:
        '“Special Agent Jerome, Dr. Mercer from Trauma ICU. We have a severe escalation with Ambassador Vance.”',
      options: [
        {
          text: '“Doctor, what is the latest blood gas and cholinesterase status?”',
          nextNodeId: 'vance_labs',
        },
        {
          text: '“Has the patient suffered cardiac arrest?”',
          nextNodeId: 'vance_arrest',
        },
      ],
    },
    vance_labs: {
      id: 'vance_labs',
      speakerText:
        '“Severe metabolic acidosis with refractory bronchospasm. Acetylcholinesterase is down to 420 U/L. The organophosphate is forming irreversible covalent aging bonds faster than pralidoxime can reactivate it.”',
      options: [
        {
          text: '“If the patient expires, we must immediately open a criminal homicide investigation.”',
          nextNodeId: 'escalate_discuss',
        },
        {
          text: '“Have you secured whole blood and gastric washings for forensic custody?”',
          nextNodeId: 'secure_samples',
        },
      ],
    },
    vance_arrest: {
      id: 'vance_arrest',
      speakerText:
        '“He went into ventricular fibrillation ten minutes ago. We achieved return of spontaneous circulation after two rounds of epinephrine, but his neurological exam shows no brainstem reflexes. Prognosis is grave.”',
      options: [
        {
          text: '“Prepare for medical examiner intake and autopsy protocol.”',
          nextNodeId: 'escalate_discuss',
        },
      ],
    },
    escalate_discuss: {
      id: 'escalate_discuss',
      speakerText:
        '“Understood. If you trigger the Homicide Escalation protocol in MEDSTAT, I will officially certify the death certificate Form ME-99 and transfer the chain of custody to TRACE.”',
      options: [
        {
          text: '“Thank you, Dr. Mercer. I will initiate the docket crossover now.”',
          nextNodeId: 'end_call',
          action: 'hang_up',
        },
      ],
    },
    secure_samples: {
      id: 'secure_samples',
      speakerText:
        '“Yes, two 10mL purple-top EDTA tubes and 50mL gastric aspirate are sealed in biohazard lockbox #7 at the nursing station ready for TRACE courier.”',
      options: [
        {
          text: '“Excellent. Keep me apprised of any cardiac telemetry shifts.”',
          nextNodeId: 'end_call',
          action: 'hang_up',
        },
      ],
    },
    end_call: {
      id: 'end_call',
      speakerText: '“Understood, Agent Jerome. Standing by.” [CALL TERMINATED]',
      options: [],
    },
  },
  'CONT-STERLING': {
    root: {
      id: 'root',
      speakerText:
        '“Jerome. I’m in the elevator heading to the Cabinet room. Give me thirty seconds: what is our evidence posture on Embassy Row?”',
      options: [
        {
          text: '“We confirmed a synthetic neurotoxin delivery via catering service.”',
          nextNodeId: 'director_brief',
        },
        {
          text: '“We are preparing a federal search warrant for Pier 42 warehouse.”',
          nextNodeId: 'director_warrant',
        },
      ],
    },
    director_brief: {
      id: 'director_brief',
      speakerText:
        '“Good. The President needs attribution before we issue a diplomatic demarche to Eurasia. Make sure your LC-MS/MS spectra are signed off by both lead examiners.”',
      options: [
        {
          text: '“Understood, Director. The dossier will be ready on your briefing book.”',
          nextNodeId: 'end_call',
          action: 'hang_up',
        },
      ],
    },
    director_warrant: {
      id: 'director_warrant',
      speakerText:
        '“I will brief the Chief Judge in chambers. When you file the probable cause affidavit in the Legal Desk, I’ll personally expedite the federal seal.”',
      options: [
        {
          text: '“Thank you, Director Sterling. Filing now.”',
          nextNodeId: 'end_call',
          action: 'hang_up',
        },
      ],
    },
    end_call: {
      id: 'end_call',
      speakerText: '“Stay sharp, Agent. Don’t let Krell slip out of the harbor.” [CALL TERMINATED]',
      options: [],
    },
  },
};
