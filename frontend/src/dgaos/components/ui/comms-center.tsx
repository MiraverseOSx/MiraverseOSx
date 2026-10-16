'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Phone,
  Mail,
  Volume2,
  VolumeX,
  Send,
  PhoneCall,
  PhoneOff,
  Mic,
  Clock,
  Download,
  Sparkles,
  Inbox,
  Paperclip,
  Activity,
  Lock,
} from 'lucide-react';
import type { LabRecord } from '@/lib/records';

let transmissionSeq = 100;
function getTransmissionId() {
  transmissionSeq += 1;
  return `rad-tx-${transmissionSeq}`;
}

type CommsTab = 'radio' | 'phone' | 'email';

interface RadioChannel {
  id: string;
  channelNumber: number;
  freq: string;
  name: string;
  callsign: string;
  badgeColor: string;
  status: 'ACTIVE' | 'STANDBY' | 'ENCRYPTED';
  activeCallersCount: number;
}

interface RadioTransmission {
  id: string;
  channelId: string;
  callsign: string;
  unit: string;
  timestamp: string;
  message: string;
  type: 'incoming' | 'outgoing' | 'alert';
}

interface PhoneContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: 'Available' | 'On Scene' | 'Suspect / Monitored' | 'Roaming';
  avatarInitials: string;
  avatarBg: string;
}

interface DialogueNode {
  id: string;
  question: string;
  response: string;
  stressLevel: 'Low' | 'Medium' | 'High';
}

interface EmailMessage {
  id: string;
  from: string;
  senderName: string;
  subject: string;
  timestamp: string;
  category: 'inbox' | 'subpoena' | 'sent' | 'archive';
  unread: boolean;
  classification: 'UNCLASSIFIED' | 'LAW ENFORCEMENT SENSITIVE' | 'CLASSIFIED // NOFORN' | 'INTERNAL';
  body: string;
  attachment?: {
    filename: string;
    size: string;
    type: string;
  };
}

const CHANNELS: RadioChannel[] = [
  {
    id: 'ch-1',
    channelNumber: 1,
    freq: '460.125 MHz',
    name: 'MPD 2nd Precinct Dispatch',
    callsign: 'METRO-DISPATCH',
    badgeColor: 'bg-blue-100 border-blue-400 text-blue-800',
    status: 'ACTIVE',
    activeCallersCount: 4,
  },
  {
    id: 'ch-2',
    channelNumber: 2,
    freq: '465.375 MHz',
    name: 'Tactical Search & Warrant Unit',
    callsign: 'ECHO-LEADER',
    badgeColor: 'bg-amber-100 border-amber-400 text-amber-800',
    status: 'STANDBY',
    activeCallersCount: 6,
  },
  {
    id: 'ch-3',
    channelNumber: 3,
    freq: '453.800 MHz',
    name: 'TRACE Mobile Forensic Van 1',
    callsign: 'TRACE-MOBILE-1',
    badgeColor: 'bg-emerald-100 border-emerald-400 text-emerald-800',
    status: 'ACTIVE',
    activeCallersCount: 2,
  },
  {
    id: 'ch-4',
    channelNumber: 4,
    freq: 'FREQ-HOP SECURE',
    name: 'SIGINT Tower Wiretap Relay',
    callsign: 'SIGINT-GATEWAY',
    badgeColor: 'bg-[#cfc8eb] border-[#7c3aed] text-[#5b2bb8]',
    status: 'ENCRYPTED',
    activeCallersCount: 1,
  },
];

const SEEDED_RADIO_LOGS: RadioTransmission[] = [
  {
    id: 'rad-1',
    channelId: 'ch-1',
    callsign: 'UNIT-14',
    unit: 'Officer Dave Miller',
    timestamp: '02:52 UTC',
    message: '10-23 at 4410 Willow Creek. Perimeter barrier tape secured along the East boundary. No active movement detected.',
    type: 'incoming',
  },
  {
    id: 'rad-2',
    channelId: 'ch-1',
    callsign: 'METRO-DISPATCH',
    unit: 'Central Dispatch',
    timestamp: '02:54 UTC',
    message: 'Copy Unit 14. TRACE Forensic Unit is en route ETA 15 minutes. Preserve all glass fracture patterns at point of entry.',
    type: 'incoming',
  },
  {
    id: 'rad-3',
    channelId: 'ch-3',
    callsign: 'TRACE-MOBILE-1',
    unit: 'Forensic Tech Alvarez',
    timestamp: '03:15 UTC',
    message: 'Mobile Van 1 on scene. ALS UV 365nm screening initiated on exterior sill. Detected trilobal synthetic fiber transfer. Packaging into evidence envelope EV-0001.',
    type: 'incoming',
  },
  {
    id: 'rad-4',
    channelId: 'ch-2',
    callsign: 'ECHO-LEADER',
    unit: 'Tactical Team Lead',
    timestamp: '03:40 UTC',
    message: 'Echo unit staged 2 blocks south of subject Vance residence. Awaiting judicial signature on 4th Amendment Search Warrant WAR-2026-0881 before breach.',
    type: 'incoming',
  },
  {
    id: 'rad-5',
    channelId: 'ch-4',
    callsign: 'SIGINT-GATEWAY',
    unit: 'Automated Tower Monitor',
    timestamp: '04:02 UTC',
    message: 'BEACON ALERT: Burner IMSI #310410192847192 performed azimuth sector switch from Sector 2 to Sector 4. High probability target in transit.',
    type: 'alert',
  },
];

const CONTACTS: PhoneContact[] = [
  {
    id: 'con-1',
    name: 'Dr. Julian Vance',
    role: 'Suspect / Person of Interest',
    phone: '+1 (202) 555-0184',
    status: 'Suspect / Monitored',
    avatarInitials: 'JV',
    avatarBg: 'from-amber-600 to-rose-700',
  },
  {
    id: 'con-2',
    name: 'Elena Rostova',
    role: 'Suspect / Specimen Broker',
    phone: '+41 79 555 3821',
    status: 'Roaming',
    avatarInitials: 'ER',
    avatarBg: 'from-purple-600 to-indigo-800',
  },
  {
    id: 'con-3',
    name: 'Sarah Jenkins',
    role: 'Witness / Security Supervisor',
    phone: '+1 (202) 555-0199',
    status: 'Available',
    avatarInitials: 'SJ',
    avatarBg: 'from-emerald-600 to-green-800',
  },
  {
    id: 'con-4',
    name: 'Officer Dave Miller',
    role: 'First Responding Patrol Officer',
    phone: '+1 (202) 555-0100',
    status: 'On Scene',
    avatarInitials: 'DM',
    avatarBg: 'from-slate-700 to-indigo-900',
  },
  {
    id: 'con-5',
    name: 'Dr. Evelyn Ward',
    role: 'County Medical Examiner',
    phone: '+1 (202) 555-0112',
    status: 'Available',
    avatarInitials: 'EW',
    avatarBg: 'from-blue-600 to-cyan-800',
  },
  {
    id: 'con-6',
    name: 'ADA Katherine Blake',
    role: 'District Attorney Special Prosecutions',
    phone: '+1 (202) 555-0177',
    status: 'Available',
    avatarInitials: 'KB',
    avatarBg: 'from-indigo-600 to-violet-800',
  },
];

const VANCE_QUESTIONS: DialogueNode[] = [
  {
    id: 'q1',
    question: 'Dr. Vance, where were you between 01:00 and 03:00 AM last night?',
    response:
      '"I already explained this to the responding patrol officer. I was at home asleep in my apartment. I take 10mg Ambien nightly; I didn\'t wake up until 7:00 AM."',
    stressLevel: 'Medium',
  },
  {
    id: 'q2',
    question: 'Laboratory microscopy matched trilobal blue synthetic fibers from the broken sill to your cardigan.',
    response:
      '"[Noticeable hesitation] ...Trilobal polyester is mass-manufactured by thousands of retail brands! That doesn\'t prove anything. You have no legal basis to harass me."',
    stressLevel: 'High',
  },
  {
    id: 'q3',
    question: 'Carrier tower azimuth logs show your burner phone transmitting 200 meters from the conservatory gate at 02:18.',
    response:
      '"[Agitated breathing] I... I am not answering any further questions without my defense counsel present. Don\'t call this line again."',
    stressLevel: 'High',
  },
];

const JENKINS_QUESTIONS: DialogueNode[] = [
  {
    id: 'jq1',
    question: 'Ms. Jenkins, what was your exact location when the perimeter alarm triggered?',
    response:
      '"I was inside Gatehouse 1 reviewing the climate control telemetry. At 02:45, the low-pressure acoustic sensor on Sector B shattered glass tripped. I ran out with my flashlight and saw the breached panel."',
    stressLevel: 'Low',
  },
  {
    id: 'jq2',
    question: 'Did you witness any vehicles departing down Conservatory Way?',
    response:
      '"I caught taillights of a dark sedan turning northbound toward the highway without its headlights fully engaged. It looked like a 5-series BMW."',
    stressLevel: 'Low',
  },
];

const SEEDED_EMAILS: EmailMessage[] = [
  {
    id: 'em-desk-1',
    from: 'ops.admin@trace-labs.org',
    senderName: 'Operations Administration',
    subject: 'Your incident report is missing the disposition field',
    timestamp: '07:48',
    category: 'inbox',
    unread: true,
    classification: 'INTERNAL',
    body: `Analyst,

Report RP draft for FS-2026-00421 was returned this morning. The disposition field is blank. Please mark it Released, Retained, or Consumed in analysis and send it back before the 15:00 records sweep.

This is not a priority case notice. It is a form field.

Operations Administration
TRACE Records Unit`,
  },
  {
    id: 'em-desk-2',
    from: 'scheduler@trace-labs.org',
    senderName: 'Laboratory Scheduling',
    subject: 'Scheduling change: LC–MS/MS moved to Thursday 09:30',
    timestamp: '07:41',
    category: 'inbox',
    unread: true,
    classification: 'INTERNAL',
    body: `The Wednesday afternoon LC–MS/MS block is cancelled. Maintenance is replacing the nitrogen generator.

Your reserved window is now Thursday 09:30–11:00 on instrument TOX-2. If that time does not work, reply with one alternate. Do not book both.

Laboratory Scheduling`,
  },
  {
    id: 'em-desk-3',
    from: 'qa.clerk@trace-labs.org',
    senderName: 'Quality Clerk',
    subject: 'Returned paperwork: chain-of-custody form EV-0002',
    timestamp: '07:33',
    category: 'inbox',
    unread: true,
    classification: 'INTERNAL',
    body: `The transfer line for EV-0002 is missing the receiving signature. I sent the paper copy back to your bench tray.

Please initial the returned form and drop it in the records box. The item can stay in storage. This is only the form.`,
  },
  {
    id: 'em-desk-4',
    from: 'section.supervisor@trace-labs.org',
    senderName: 'Section Supervisor',
    subject: 'Comment on your fiber worksheet',
    timestamp: '07:22',
    category: 'inbox',
    unread: false,
    classification: 'INTERNAL',
    body: `The observations are clear. Two corrections before this goes to review:

1. Write the magnification next to the fiber count.
2. The weight is listed as mg in one sentence and g in the next. Pick one.

Nothing else. Good notes.

— Supervisor`,
  },
  {
    id: 'em-desk-5',
    from: 'records@trace-labs.org',
    senderName: 'Records Unit',
    subject: 'Clarification needed: which seal number is on the vial',
    timestamp: '07:15',
    category: 'inbox',
    unread: false,
    classification: 'INTERNAL',
    body: `Your note says seal 4412. The evidence label photo shows 4418. Which one is on the vial now?

Reply with the number you can see. Do not open the seal to check.`,
  },
  {
    id: 'em-desk-6',
    from: 'section.supervisor@trace-labs.org',
    senderName: 'Section Supervisor',
    subject: 'Meeting: Thursday section check-in, 08:15, room B-2',
    timestamp: '07:05',
    category: 'inbox',
    unread: false,
    classification: 'INTERNAL',
    body: `Short meeting. Agenda:

• Instrument time changes
• Two returned forms
• Who is covering the Friday receiving desk

Twenty minutes. Bring the draft you still owe, if you have it. Coffee is in the usual place.`,
  },
  {
    id: 'em-desk-7',
    from: 'training@trace-labs.org',
    senderName: 'Training Office',
    subject: 'Reminder: annual pipette check is due Friday',
    timestamp: '06:58',
    category: 'inbox',
    unread: false,
    classification: 'INTERNAL',
    body: `This is the ordinary reminder. Your pipette check sheet is due Friday at 16:00. The form is on the shelf by the balance, not in the case file.

If you already turned it in, ignore this.`,
  },
  {
    id: 'em-desk-8',
    from: 'ops.admin@trace-labs.org',
    senderName: 'Operations Administration',
    subject: 'Administrative request: confirm your bench assignment',
    timestamp: '06:50',
    category: 'inbox',
    unread: false,
    classification: 'INTERNAL',
    body: `Please reply with the bench number you are actually using this week. The roster still lists you on Bench 4. Receiving thinks you moved to Bench 6.

We need this for the chemical inventory, not for a case.`,
  },
  {
    id: 'em-desk-9',
    from: 'facilities@trace-labs.org',
    senderName: 'Facilities',
    subject: 'Department notice: hoods in Bay C offline until 11:00',
    timestamp: '06:40',
    category: 'inbox',
    unread: false,
    classification: 'INTERNAL',
    body: `Bay C fume hoods are offline for filter replacement until 11:00. Use Bay A if you need a hood this morning. The instruments in Bay C are fine. Only the hoods are down.`,
  },
  {
    id: 'em-desk-10',
    from: 'supply@trace-labs.org',
    senderName: 'Laboratory Supply',
    subject: 'Routine: glove order arrived, size M is short again',
    timestamp: '06:31',
    category: 'inbox',
    unread: false,
    classification: 'INTERNAL',
    body: `The weekly order is in the supply cage. Nitrile gloves, size M, were short by two boxes. Size L and S are complete.

If you need M before Thursday, tell supply before noon. Otherwise it waits for the next order.`,
  },
  {
    id: 'em-1',
    from: 'subpoena.compliance@verizon-legal.com',
    senderName: 'Verizon Telecommunication Compliance',
    subject: '[CONFIDENTIAL] § 2703(d) Subpoena Return - IMSI #310410192847192',
    timestamp: '04:12 UTC',
    category: 'subpoena',
    unread: true,
    classification: 'LAW ENFORCEMENT SENSITIVE',
    body: `To: Forensic Technical Investigations Division <m.analyst@trace-forensics.gov>
Subject: 18 U.S.C. § 2703(d) Telecommunication Return (Warrant #WAR-2026-0882)

Attached please find the certified Call Detail Records (CDR) and Sector Azimuth Antenna logs for Target Device IMSI #310410192847192 for the 6-hour window spanning 00:00 UTC to 06:00 UTC.

KEY FINDINGS:
1. Target registered 4 distinct SMS packet transfers between 01:45 UTC and 02:18 UTC.
2. At 02:18:04 UTC, the device established connection with Cell Tower #2409 (Azimuth 45°), placing physical proximity within a 350-meter radius of the Conservatory East Perimeter Gate.

Certified by:
Janice Vance-Krug, Senior Custodian of Records, Verizon Legal Services`,
    attachment: {
      filename: 'CDR_Tower_Azimuth_Logs_CASE-2026-0042.csv',
      size: '1.4 MB',
      type: 'CSV Spreadsheet',
    },
  },
  {
    id: 'em-2',
    from: 'cbp.alerts@dhs.gov',
    senderName: 'DHS / Customs & Border Protection',
    subject: '[URGENT] Passenger Manifest Match: Elena Rostova (CIT-88192)',
    timestamp: '03:45 UTC',
    category: 'inbox',
    unread: true,
    classification: 'CLASSIFIED // NOFORN',
    body: `PRIORITY 1 IMMIGRATION & BORDER LOOKOUT

Subject: ROSTOVA, Elena (DOB: 1987-11-03)
Interpol Blue Notice Ref: B-491-2025

Notification: Subject has checked in for Swiss Air Flight LX-041 departing Metro International Airport (IAD) to Zurich (ZRH) scheduled for 08:30 AM local time.

Checked Luggage: 2 hard-shell temperature-regulated transport cases flagged under airway bill #992-0194. Port Authority Police and DHS Special Agents are holding boarding passes pending judicial warrant or detainer request from TRACE investigators.`,
    attachment: {
      filename: 'SwissAir_Manifest_LX041_Rostova.pdf',
      size: '420 KB',
      type: 'Adobe PDF Document',
    },
  },
  {
    id: 'em-3',
    from: 'k.blake@prosecution.metro.gov',
    senderName: 'ADA Katherine Blake (Trial Division)',
    subject: 'Re: Grand Jury Indictment Package Sufficiency Review',
    timestamp: '03:10 UTC',
    category: 'inbox',
    unread: false,
    classification: 'LAW ENFORCEMENT SENSITIVE',
    body: `Lead Analyst,

I have reviewed the preliminary chain of custody and forensic worksheets filed under CASE-2026-0042. The Legal Sufficiency score is tracking at 100% with the incorporation of the Verizon tower pings and the trilobal fiber microscopy.

Please ensure the final Certificate of Analysis has formal Technical Peer Review sign-off so we can immediately present the True Bill to the Grand Jury this morning.

Regards,
Katherine Blake, Assistant District Attorney`,
  },
  {
    id: 'em-4',
    from: 'qa.director@trace-labs.org',
    senderName: 'ISO/IEC 17025 Quality Assurance Director',
    subject: 'Equipment Calibration Sign-Off: Leica FS CB Comparison Microscope',
    timestamp: '01:30 UTC',
    category: 'archive',
    unread: false,
    classification: 'UNCLASSIFIED',
    body: `Forensic Laboratory Staff,

The annual optical alignment and stage micrometer NIST calibration for the Leica FS CB Comparison Microscope (Serial #LCA-9921) has been verified. The calibration certificate is filed in the Quality Assurance registry. All forensic fiber and striation examinations are approved for court admissibility.`,
  },
];

interface CommsCenterProps {
  cases: LabRecord[];
  evidence: LabRecord[];
  navigate: (view: string) => void;
  onOpenRecord: (record: LabRecord) => void;
  onLogFindingToBench?: (note: string) => void;
}

export function CommsCenter({
  cases,
  evidence,
  navigate: _navigate,
  onOpenRecord: _onOpenRecord,
  onLogFindingToBench,
}: CommsCenterProps) {
  const [activeTab, setActiveTab] = useState<CommsTab>('radio');

  // Radio state
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ch-1');
  const [radioLogs, setRadioLogs] = useState<RadioTransmission[]>(SEEDED_RADIO_LOGS);
  const [radioInput, setRadioInput] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [waveformHeight, setWaveformHeight] = useState<number[]>([40, 60, 25, 80, 50, 90, 30, 70]);

  // Phone state
  const [dialInput, setDialInput] = useState('');
  const [activeContact, setActiveContact] = useState<PhoneContact>(CONTACTS[0]);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [callTranscripts, setCallTranscripts] = useState<string[]>([]);

  // Email state
  const [emails, setEmails] = useState<EmailMessage[]>(SEEDED_EMAILS);
  const [selectedEmailId, setSelectedEmailId] = useState<string>('em-desk-1');
  const [emailCategory, setEmailCategory] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const radioEndRef = useRef<HTMLDivElement | null>(null);

  // Animate audio waveform
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformHeight([
        Math.floor(Math.random() * 70) + 20,
        Math.floor(Math.random() * 80) + 15,
        Math.floor(Math.random() * 90) + 20,
        Math.floor(Math.random() * 75) + 25,
        Math.floor(Math.random() * 85) + 15,
        Math.floor(Math.random() * 95) + 10,
        Math.floor(Math.random() * 60) + 30,
        Math.floor(Math.random() * 70) + 20,
      ]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Call timer
  useEffect(() => {
    if (callState !== 'connected') return;
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [callState]);

  const activeChannel = CHANNELS.find((c) => c.id === selectedChannelId) || CHANNELS[0];
  const activeEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  const handleBroadcastRadio = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!radioInput.trim()) return;

    const userMsg: RadioTransmission = {
      id: getTransmissionId(),
      channelId: selectedChannelId,
      callsign: 'TRACE-ANALYST',
      unit: 'Forensic Operations Lab',
      timestamp: new Date().toISOString().substring(11, 16) + ' UTC',
      message: radioInput.trim(),
      type: 'outgoing',
    };

    setRadioLogs((prev) => [...prev, userMsg]);
    const inputSnapshot = radioInput.trim();
    setRadioInput('');
    setIsTransmitting(true);

    setTimeout(() => {
      setIsTransmitting(false);
      // Simulate authentic field response
      let responseText = `Received command from TRACE operations: "${inputSnapshot}". Acknowledged and executing.`;
      if (selectedChannelId === 'ch-1') {
        responseText = `Unit 14 copies TRACE Lab: "${inputSnapshot}". Maintaining perimeter security.`;
      } else if (selectedChannelId === 'ch-2') {
        responseText = `Echo Leader copies: "${inputSnapshot}". Team staged and ready on tactical channel.`;
      } else if (selectedChannelId === 'ch-3') {
        responseText = `Mobile Van 1 copies: "${inputSnapshot}". Documentation and chain of custody log updated.`;
      }

      const replyMsg: RadioTransmission = {
        id: getTransmissionId(),
        channelId: selectedChannelId,
        callsign: activeChannel.callsign,
        unit: activeChannel.name,
        timestamp: new Date().toISOString().substring(11, 16) + ' UTC',
        message: responseText,
        type: 'incoming',
      };
      setRadioLogs((prev) => [...prev, replyMsg]);
      radioEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
  };

  const handleStartCall = (contact: PhoneContact) => {
    setActiveContact(contact);
    setDialInput(contact.phone);
    setCallState('ringing');
    setCallTranscripts([`Initiating encrypted cellular call to ${contact.name} (${contact.phone})…`]);

    setTimeout(() => {
      setCallState('connected');
      setCallTranscripts((prev) => [
        ...prev,
        `Line connected. Audio channel encrypted via NIST AES-GCM protocol.`,
        `${contact.name}: "Hello? Who is this?"`,
      ]);
    }, 1500);
  };

  const handleSelectDialogue = (node: DialogueNode) => {
    setCallTranscripts((prev) => [
      ...prev,
      `Analyst: "${node.question}"`,
      `${activeContact.name}: ${node.response}`,
    ]);
  };

  const handleEndCall = () => {
    setCallState('ended');
    setCallTranscripts((prev) => [...prev, `Call terminated by user.`]);
    setTimeout(() => {
      setCallState('idle');
    }, 1800);
  };

  const handleLogTranscriptToBench = () => {
    if (callTranscripts.length === 0) return;
    const notes = callTranscripts.join('\n');
    if (onLogFindingToBench) {
      onLogFindingToBench(`[Phone Call Record - ${activeContact.name}]\n${notes}`);
      setActionNotice(`Call transcript with ${activeContact.name} logged directly to active bench sheet!`);
    } else {
      setActionNotice(`Transcript saved for ${activeContact.name}.`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredEmails = emails.filter((e) => {
    if (emailCategory === 'all') return true;
    return e.category === emailCategory;
  });

  return (
    <div className="comms-center-root flex flex-col gap-4">
      {/* Top Comms Command Header */}
      <div className="p-4 bg-white border border-[#a89bc2] rounded-xl text-[#0f0d1a] shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#f8f6fc] border border-[#d4ceeb] text-[#4338ca]">
            <Radio size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wider uppercase text-[#0f0d1a]">
                COMMUNICATIONS &amp; DISPATCH
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                COMMS ONLINE
              </span>
            </div>
            <p className="text-xs text-[#4b465c] font-normal mt-0.5">
              Two-way radio tactical frequencies, encrypted suspect wiretaps, and classified agency correspondence.
            </p>
          </div>
        </div>

        {/* 3 Modality Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#f8f6fc] p-1.5 rounded-lg border border-[#d4ceeb]">
          <button
            type="button"
            onClick={() => setActiveTab('radio')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'radio'
                ? 'bg-[#c1b4d9] text-[#0f0d1a] border-[#a89bc2] shadow-xs'
                : 'text-[#4b465c] border-transparent hover:bg-white hover:text-[#0f0d1a]'
            }`}
          >
            <Radio size={14} />
            <span>Field Radio Comms</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'phone'
                ? 'bg-[#c1b4d9] text-[#0f0d1a] border-[#a89bc2] shadow-xs'
                : 'text-[#4b465c] border-transparent hover:bg-white hover:text-[#0f0d1a]'
            }`}
          >
            <Phone size={14} />
            <span>Secure Phone</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'email'
                ? 'bg-[#c1b4d9] text-[#0f0d1a] border-[#a89bc2] shadow-xs'
                : 'text-[#4b465c] border-transparent hover:bg-white hover:text-[#0f0d1a]'
            }`}
          >
            <Mail size={14} />
            <span>Agency Email</span>
            {emails.filter((e) => e.unread).length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                {emails.filter((e) => e.unread).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-white border border-[#4338ca] rounded-xl text-xs text-[#0f0d1a] font-semibold flex items-center gap-2 shadow-sm">
          <Sparkles size={16} className="text-[#4338ca] flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: Tactical Field Radio Comms Dispatch
         ========================================================================= */}
      {activeTab === 'radio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Radio Channels & Audio HUD */}
          <div className="col-span-1 flex flex-col gap-4">
            {/* Audio Waveform & Transmitter Card */}
            <div className="bg-white border border-[#a89bc2] rounded-xl p-4 shadow-sm flex flex-col gap-3 text-[#0f0d1a]">
              <div className="flex items-center justify-between border-b border-[#e5e0f0] pb-2">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-[#4338ca]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0f0d1a]">
                    Radio Audio Telemetry
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="p-1 rounded-lg hover:bg-[#f8f6fc] text-[#4b465c] hover:text-[#0f0d1a] cursor-pointer"
                  title={isAudioMuted ? 'Unmute Radio Squelch' : 'Mute Radio Squelch'}
                >
                  {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-end justify-center gap-1.5 h-16 bg-[#f8f6fc] rounded-lg p-2 border border-[#d4ceeb]">
                {waveformHeight.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${isAudioMuted ? 8 : h}%` }}
                    className={`w-2.5 rounded-t transition-all duration-300 ${
                      isTransmitting
                        ? 'bg-rose-600'
                        : activeChannel.status === 'ENCRYPTED'
                        ? 'bg-[#4338ca]'
                        : 'bg-emerald-600'
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                <div className="p-2 bg-[#f8f6fc] rounded-lg border border-[#d4ceeb]">
                  <span className="text-[#4b465c] font-bold block text-[10.5px]">FREQUENCY</span>
                  <strong className="text-[#4338ca] font-mono">{activeChannel.freq}</strong>
                </div>
                <div className="p-2 bg-[#f8f6fc] rounded-lg border border-[#d4ceeb]">
                  <span className="text-[#4b465c] font-bold block text-[10.5px]">TRANSMISSION</span>
                  <strong className={isTransmitting ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                    {isTransmitting ? 'TX BROADCAST' : 'RX RECEIVING'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Radio Frequency Channels */}
            <div className="bg-white border border-[#a89bc2] rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <h4 className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e0f0] pb-2">
                <Radio size={15} className="text-[#4338ca]" />
                <span>Tactical Channels ({CHANNELS.length})</span>
              </h4>

              <div className="flex flex-col gap-2">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannelId(ch.id)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      selectedChannelId === ch.id
                        ? 'border-2 border-[#4338ca] bg-white shadow-xs'
                        : 'border border-[#d4ceeb] bg-[#f8f6fc] hover:bg-white hover:border-[#a89bc2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#4338ca]">
                        CH {ch.channelNumber} · {ch.freq}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-300"
                      >
                        {ch.status}
                      </span>
                    </div>
                    <strong className="text-xs font-bold text-[#0f0d1a]">{ch.name}</strong>
                    <div className="flex items-center justify-between text-[11px] text-[#4b465c]">
                      <span>Callsign: {ch.callsign}</span>
                      <span>{ch.activeCallersCount} Units Active</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Radio Chatter Stream & Push-to-Talk Broadcast */}
          <div className="col-span-1 lg:col-span-2 bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[560px]">
            {/* Radio Titlebar */}
            <div className="flex items-center justify-between border-b border-[#e5e0f0] pb-3 text-xs text-[#0f0d1a]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[#0f0d1a] font-bold text-sm">
                  {activeChannel.name.toUpperCase()}
                </span>
                <span className="text-[#4338ca] font-bold font-mono">[{activeChannel.freq}]</span>
              </div>
              <div className="text-xs font-semibold text-[#4338ca] bg-[#f8f6fc] px-2.5 py-0.5 rounded-lg border border-[#d4ceeb]">
                P25 DIGITAL REPEATER ACTIVE
              </div>
            </div>

            {/* Radio Transmission Chatter Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-2 max-h-[400px]">
              {radioLogs
                .filter((r) => r.channelId === selectedChannelId || r.type === 'alert')
                .map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg text-xs border leading-relaxed ${
                      log.type === 'outgoing'
                        ? 'bg-[#c1b4d9]/30 border-[#a89bc2] text-[#0f0d1a] ml-8 shadow-xs'
                        : log.type === 'alert'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                        : 'bg-[#f8f6fc] border-[#d4ceeb] text-[#0f0d1a] mr-8 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#4b465c] mb-1.5 border-b border-[#e5e0f0] pb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#4338ca]">{log.callsign}</span>
                        <span>·</span>
                        <span className="font-semibold text-[#0f0d1a]">{log.unit}</span>
                      </div>
                      <span className="font-mono">{log.timestamp}</span>
                    </div>
                    <div className="text-[13px] font-medium">{log.message}</div>
                  </div>
                ))}
              <div ref={radioEndRef} />
            </div>

            {/* Quick Tactical Radio Dispatch Presets */}
            <div className="border-t border-[#e5e0f0] pt-3 flex flex-col gap-2">
              <div className="flex items-center gap-1 text-xs text-[#4b465c] font-semibold">
                <span>Quick Dispatches:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Unit 14: Secure all glass shards at point of entry.',
                  'Mobile Van 1: Confirm fiber swab logged into Locker A-04.',
                  'Echo Leader: Stand by for Grand Jury warrant transmission.',
                  'All Units: Flag suspect vehicle 7XYZ99, black Audi A4.',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRadioInput(preset)}
                    className="px-3 py-1.5 text-xs font-medium bg-[#f8f6fc] hover:bg-white text-[#4b465c] hover:text-[#0f0d1a] rounded-lg border border-[#d4ceeb] hover:border-[#a89bc2] transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Radio Transmission Input Form */}
              <form onSubmit={handleBroadcastRadio} className="flex items-center gap-2 pt-2">
                <span className="text-[#4338ca] text-xs font-bold flex items-center gap-1">
                  <Mic size={15} />
                  TX:
                </span>
                <input
                  type="text"
                  value={radioInput}
                  onChange={(e) => setRadioInput(e.target.value)}
                  placeholder={`Broadcast to ${activeChannel.callsign} over radio frequency…`}
                  className="flex-1 bg-[#f8f6fc] border border-[#d4ceeb] focus:border-[#4338ca] focus:bg-white rounded-lg px-3 py-2 text-xs text-[#0f0d1a] placeholder-[#6b6680] outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!radioInput.trim() || isTransmitting}
                  className="px-4 py-2 bg-[#4338ca] hover:bg-[#3730a3] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>Transmit</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: Secure Phone & Wiretap Console
         ========================================================================= */}
      {activeTab === 'phone' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Phonebook Contacts & Dialpad */}
          <div className="col-span-1 flex flex-col gap-4">
            {/* Contacts Directory */}
            <div className="bg-white border border-[#a89bc2] rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <h4 className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e5e0f0] pb-2">
                <Phone size={15} className="text-[#4338ca]" />
                <span>Encrypted Directory ({CONTACTS.length})</span>
              </h4>

              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                {CONTACTS.map((con) => (
                  <button
                    key={con.id}
                    type="button"
                    onClick={() => handleStartCall(con)}
                    className="p-2.5 rounded-lg border border-[#d4ceeb] hover:border-[#4338ca] bg-[#f8f6fc] hover:bg-white text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${con.avatarBg} text-white font-mono text-xs font-bold flex items-center justify-center`}
                      >
                        {con.avatarInitials}
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-[#0f0d1a] block line-clamp-1">
                          {con.name}
                        </strong>
                        <span className="text-[11px] text-[#4338ca] font-mono font-medium">{con.phone}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 block mb-1">
                        {con.status}
                      </span>
                      <PhoneCall size={13} className="text-emerald-700 ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Dialpad */}
            <div className="bg-white border border-[#a89bc2] rounded-xl p-4 shadow-sm flex flex-col gap-3 text-[#0f0d1a]">
              <div className="text-xs text-[#0f0d1a] font-bold border-b border-[#e5e0f0] pb-2 flex items-center justify-between">
                <span>SECURE DTMF DIALER</span>
                <Lock size={13} className="text-emerald-600" />
              </div>

              {/* Number Screen */}
              <div className="bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg p-2.5 text-center text-sm font-mono font-bold text-[#0f0d1a] min-h-[38px] flex items-center justify-center">
                {dialInput || 'ENTER NUMBER…'}
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDialInput((prev) => prev + key)}
                    className="p-2 rounded-lg bg-[#f8f6fc] hover:bg-[#e5e0f0] border border-[#d4ceeb] text-[#0f0d1a] font-bold text-sm cursor-pointer transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDialInput('')}
                  className="flex-1 py-1.5 rounded-lg bg-white hover:bg-[#f8f6fc] border border-[#a89bc2] text-[#4b465c] hover:text-[#0f0d1a] font-semibold text-xs cursor-pointer transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const match = CONTACTS.find((c) => c.phone.includes(dialInput));
                    handleStartCall(match || {
                      id: 'custom',
                      name: 'Unknown Number',
                      role: 'Incoming / Direct Call',
                      phone: dialInput || '+1 (202) 555-0199',
                      status: 'Available',
                      avatarInitials: 'UN',
                      avatarBg: 'from-slate-600 to-slate-800',
                    });
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-[#4338ca] hover:bg-[#3730a3] text-white font-semibold text-xs cursor-pointer flex items-center justify-center gap-1 shadow-sm transition-colors"
                >
                  <PhoneCall size={13} />
                  <span>Call</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Active Call Simulation & Branching Interrogation */}
          <div className="col-span-1 lg:col-span-2 bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[560px] text-[#0f0d1a]">
            <div>
              {/* Call Header */}
              <div className="flex items-center justify-between border-b border-[#e5e0f0] pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeContact.avatarBg} text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs border border-[#a89bc2]`}
                  >
                    {activeContact.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0f0d1a] flex items-center gap-2">
                      {activeContact.name}
                      <span className="text-[10px] text-[#4338ca] bg-[#f8f6fc] border border-[#d4ceeb] px-1.5 py-0.5 rounded font-bold">
                        {activeContact.role}
                      </span>
                    </h3>
                    <span className="text-xs font-mono font-medium text-[#4b465c]">{activeContact.phone}</span>
                  </div>
                </div>

                {/* Call Status Pill */}
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                      callState === 'connected'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : callState === 'ringing'
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-[#f8f6fc] text-[#4b465c] border-[#d4ceeb]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        callState === 'connected'
                          ? 'bg-emerald-600'
                          : callState === 'ringing'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="uppercase">{callState}</span>
                    {callState === 'connected' && (
                      <span className="text-emerald-800">({formatSeconds(callSeconds)})</span>
                    )}
                  </div>

                  {callState === 'connected' && (
                    <button
                      type="button"
                      onClick={handleEndCall}
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                      title="End Call"
                    >
                      <PhoneOff size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Call Transcript Screen */}
              <div className="my-4 p-4 bg-[#f8f6fc] rounded-lg text-xs text-[#0f0d1a] border border-[#d4ceeb] space-y-2.5 max-h-[300px] overflow-y-auto">
                {callTranscripts.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg leading-relaxed text-[13px] ${
                      t.startsWith('Analyst:')
                        ? 'bg-[#c1b4d9]/40 text-[#0f0d1a] border-l-4 border-[#4338ca] font-medium'
                        : t.includes('Dr. Julian Vance:') || t.includes('Elena Rostova:')
                        ? 'bg-rose-50 text-rose-900 border-l-4 border-rose-500 font-medium'
                        : 'text-amber-800 font-bold italic'
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>

              {/* Branching Dialogue & Interrogation Questions */}
              {callState === 'connected' && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#e5e0f0]">
                  <span className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider">
                    Select Interrogation Question:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {(activeContact.name.includes('Vance') ? VANCE_QUESTIONS : JENKINS_QUESTIONS).map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => handleSelectDialogue(node)}
                        className="p-2.5 rounded-lg border border-[#d4ceeb] hover:border-[#4338ca] bg-white hover:bg-[#f8f6fc] text-left transition-all text-xs text-[#0f0d1a] font-medium flex items-center justify-between cursor-pointer"
                      >
                        <span className="line-clamp-1">{node.question}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            node.stressLevel === 'High'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : node.stressLevel === 'Medium'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          Stress: {node.stressLevel}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e5e0f0]">
              <span className="text-xs text-[#4b465c] font-medium">
                {cases[0]?.id || 'CASE-2026-0042'} Evidence Wiretap System
              </span>

              <button
                type="button"
                onClick={handleLogTranscriptToBench}
                disabled={callTranscripts.length === 0}
                className="px-3.5 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Clock size={14} />
                <span>Log Transcript to Bench Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: Agency Email Terminal
         ========================================================================= */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Email Folders & Message List */}
          <div className="col-span-1 bg-white border border-[#a89bc2] rounded-xl p-4 shadow-sm flex flex-col gap-3 text-[#0f0d1a]">
            {/* Folder Filters */}
            <div className="flex items-center justify-between border-b border-[#e5e0f0] pb-2">
              <span className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-1.5">
                <Inbox size={15} className="text-[#4338ca]" />
                <span>Laboratory mail</span>
              </span>
              <span className="text-[11px] font-medium text-[#4338ca]">
                analyst@trace-forensics.gov
              </span>
            </div>

            <div className="flex gap-1.5 border-b border-[#e5e0f0] pb-2">
              {[
                { id: 'all', label: 'All Mail' },
                { id: 'inbox', label: 'Inbox' },
                { id: 'subpoena', label: 'Subpoenas' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setEmailCategory(f.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer border ${
                    emailCategory === f.id
                      ? 'bg-[#c1b4d9] text-[#0f0d1a] border-[#a89bc2] shadow-xs'
                      : 'bg-[#f8f6fc] text-[#4b465c] border-[#d4ceeb] hover:bg-white hover:text-[#0f0d1a]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Email Message List */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] pr-1">
              {filteredEmails.map((em) => {
                const isSelected = selectedEmailId === em.id;

                return (
                  <button
                    key={em.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmailId(em.id);
                      setEmails((prev) =>
                        prev.map((e) => (e.id === em.id ? { ...e, unread: false } : e))
                      );
                    }}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#4338ca] bg-white shadow-xs'
                        : 'border border-[#d4ceeb] bg-[#f8f6fc] hover:bg-white hover:border-[#a89bc2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0f0d1a] line-clamp-1">
                        {em.senderName}
                      </span>
                      <span className="text-[11px] text-[#6b6680]">{em.timestamp}</span>
                    </div>

                    <strong className="text-xs font-semibold text-[#2c273d] line-clamp-1">{em.subject}</strong>

                    <div className="flex items-center justify-between text-[11px] text-[#4b465c] pt-1 border-t border-[#e5e0f0]">
                      <span className="font-mono text-[#4338ca] font-semibold">{em.classification}</span>
                      {em.attachment && (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Paperclip size={11} />
                          File
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Email Reader & Attachment Viewer */}
          <div className="col-span-1 lg:col-span-2 bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[560px] text-[#0f0d1a]">
            <div className="flex flex-col gap-4">
              {/* Email Title Header */}
              <div className="border-b border-[#e5e0f0] pb-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f8f6fc] text-[#4338ca] border border-[#d4ceeb] text-xs font-semibold">
                    {activeEmail.classification}
                  </span>
                  <span className="text-xs font-mono text-[#6b6680]">{activeEmail.timestamp}</span>
                </div>
                <h2 className="text-base font-bold text-[#0f0d1a]">{activeEmail.subject}</h2>
                <div className="text-xs text-[#4b465c] flex items-center gap-1">
                  <span>From:</span>
                  <strong className="text-[#0f0d1a] font-bold">{activeEmail.senderName}</strong>
                  <span>&lt;{activeEmail.from}&gt;</span>
                </div>
              </div>

              {/* Email Body */}
              <div className="bg-[#f8f6fc] p-5 rounded-lg border border-[#d4ceeb] text-[13.5px] text-[#0f0d1a] whitespace-pre-wrap leading-relaxed max-h-[340px] overflow-y-auto">
                {activeEmail.body}
              </div>

              {/* Attachment Pill (If present) */}
              {activeEmail.attachment && (
                <div className="p-3 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white text-[#4338ca] border border-[#d4ceeb]">
                      <Paperclip size={16} />
                    </div>
                    <div>
                      <strong className="text-[#0f0d1a] font-bold block">
                        {activeEmail.attachment.filename}
                      </strong>
                      <span className="text-[#4b465c] text-xs font-normal">
                        {activeEmail.attachment.type} · {activeEmail.attachment.size}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActionNotice(`File ${activeEmail.attachment?.filename} downloaded and linked to evidence dossier.`);
                      setTimeout(() => setActionNotice(null), 3500);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#4338ca] hover:bg-[#3730a3] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e5e0f0] text-xs">
              <span className="text-[#4b465c] font-medium">
                {evidence.length} Associated Physical Exhibits in Locker
              </span>

              <button
                type="button"
                onClick={() => {
                  setActionNotice(`Reply drafted to ${activeEmail.senderName}.`);
                  setTimeout(() => setActionNotice(null), 3500);
                }}
                className="px-3.5 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Send size={13} />
                <span>Compose Agency Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
