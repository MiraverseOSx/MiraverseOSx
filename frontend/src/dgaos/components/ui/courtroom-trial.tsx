'use client';
import { useState } from 'react';
import {
  Gavel,
  Scale,
  ShieldAlert,
  AlertTriangle,
  FileText,
  User,
  Zap,
  Activity,
  XCircle,
  FolderKanban,
  Microscope,
  Volume2
} from 'lucide-react';
import InvestigationBreadcrumbs from '@/components/ui/investigation-breadcrumbs';

interface CourtroomTrialProps {
  navigate: (view: string) => void;
}

export interface Statement {
  id: string;
  speaker: string;
  text: string;
  pressedText?: string;
  isPressed: boolean;
  foundationScore: number; // 0 to 100
  stressLevel: number; // 0 to 100
  contradictionExhibitId: string;
  isContradicted: boolean;
  isFoundationAttacked: boolean;
  hesitationMarker: string;
}

interface EvidenceExhibit {
  id: string;
  label: string;
  category: 'physical' | 'cyber' | 'pathology' | 'surveillance' | 'qa';
  title: string;
  description: string;
  admissibility: number;
  chainStatus: 'Verified' | 'Challenged';
  impactVector: string;
  targetStatementId: string;
  contradictionExplanation: string;
}

const WITNESSES = [
  {
    id: 'julian_vance',
    name: 'Dr. Julian Paul Vance',
    role: 'Defendant / Former Conservatory Botanist',
    archetype: 'Hostile / Prime Suspect',
    baseHeartRate: 98,
    perjuryRisk: 'Critical',
    demeanor: 'Defiant, Clenched Jaw, Rapid Blinking',
    initialStatements: [
      {
        id: 'STMT-001',
        speaker: 'Dr. Julian Vance',
        text: 'I spent the entire night of September 8th alone in my apartment on Elmwood Ave. I never left until the detectives arrived.',
        pressedText:
          'PRESS OUTCOME: Vance nervously shifts: "Well, I might have walked out to check my mailbox around midnight, but my vehicle never left the driveway."',
        isPressed: false,
        foundationScore: 60,
        stressLevel: 45,
        contradictionExhibitId: 'EXHIBIT-P-02',
        isContradicted: false,
        isFoundationAttacked: false,
        hesitationMarker: 'Micro-pause: 1.4s · Glancing toward defense counsel',
      },
      {
        id: 'STMT-002',
        speaker: 'Dr. Julian Vance',
        text: 'I never set foot inside the Conservatory East Wing after my termination in August. Any claim that I broke that window is an absurd lie.',
        pressedText:
          'PRESS OUTCOME: Vance voice pitches up: "I had no reason to go near the east wing. I don\'t even own clothing suitable for climbing through broken glass."',
        isPressed: false,
        foundationScore: 75,
        stressLevel: 68,
        contradictionExhibitId: 'EXHIBIT-P-01',
        isContradicted: false,
        isFoundationAttacked: false,
        hesitationMarker: 'Vocal pitch spike: +38 Hz · Pulse elevation to 112 BPM',
      },
      {
        id: 'STMT-003',
        speaker: 'Dr. Julian Vance',
        text: 'I have never distilled or possessed Coniine alkaloid extract. My botanical research was strictly confined to benign tropical flora.',
        pressedText:
          'PRESS OUTCOME: Vance swallows hard: "Dr. Thorne ran the neurotoxin research, not me. I wouldn\'t even know how to stabilize coniine in liquid solvent."',
        isPressed: false,
        foundationScore: 70,
        stressLevel: 75,
        contradictionExhibitId: 'EXHIBIT-P-03',
        isContradicted: false,
        isFoundationAttacked: false,
        hesitationMarker: 'Respiratory suppression detected · High deception index',
      },
      {
        id: 'STMT-004',
        speaker: 'Dr. Julian Vance',
        text: 'That burner phone and SIM chip recovered near the service gate are not mine. Thousands of people use prepaid phones in this county.',
        pressedText:
          'PRESS OUTCOME: Vance taps desk: "Anyone could have texted about a broken latch. You cannot prove those SMS pings originated from my hands."',
        isPressed: false,
        foundationScore: 55,
        stressLevel: 82,
        contradictionExhibitId: 'EXHIBIT-P-04',
        isContradicted: false,
        isFoundationAttacked: false,
        hesitationMarker: 'Perspiration anomaly on brow · Rapid finger tapping',
      },
    ],
  },
  {
    id: 'elena_rostova',
    name: 'Elena Rostova',
    role: 'Co-Conspirator / Black-Market Specimen Broker',
    archetype: 'Defensive Broker',
    baseHeartRate: 88,
    perjuryRisk: 'High',
    demeanor: 'Measured, Guarded, Calculating',
    initialStatements: [
      {
        id: 'STMT-ROST-01',
        speaker: 'Elena Rostova',
        text: 'I am a legitimate rare plant antiquities dealer. I had zero contact with Julian Vance on September 8th.',
        pressedText:
          'PRESS OUTCOME: Rostova pauses: "We had occasional professional inquiries, but no transactions occurred in September."',
        isPressed: false,
        foundationScore: 65,
        stressLevel: 50,
        contradictionExhibitId: 'EXHIBIT-P-04',
        isContradicted: false,
        isFoundationAttacked: false,
        hesitationMarker: 'Prolonged pause: 2.1s before responding',
      },
    ],
  },
  {
    id: 'expert_alvarez',
    name: 'Dr. Neil Alvarez',
    role: 'Defense Forensic Toxicologist Expert',
    archetype: 'Technical Expert Witness',
    baseHeartRate: 74,
    perjuryRisk: 'Low',
    demeanor: 'Academic, Formal, Clinical',
    initialStatements: [
      {
        id: 'STMT-EXPERT-01',
        speaker: 'Dr. Neil Alvarez',
        text: 'The prosecution\'s post-mortem Coniine detection could be an artifact of post-mortem redistribution or instrumental background noise.',
        pressedText:
          'PRESS OUTCOME: Dr. Alvarez concedes: "If the prosecution utilized certified reagent blanks and tandem mass spec calibration, background noise is negligible."',
        isPressed: false,
        foundationScore: 85,
        stressLevel: 30,
        contradictionExhibitId: 'EXHIBIT-P-05',
        isContradicted: false,
        isFoundationAttacked: false,
        hesitationMarker: 'Shifting through academic binder notes',
      },
    ],
  },
];

const EVIDENCE_EXHIBITS: EvidenceExhibit[] = [
  {
    id: 'EXHIBIT-P-01',
    label: 'EXHIBIT P-01 (EV-0002)',
    category: 'physical',
    title: 'Navy Acrylic Fiber Snag & Subungual Match',
    description:
      'Trilobal synthetic fiber recovered from broken conservatory window frame. FTIR absorption and birefringence match victim\'s fingernail scrapings and Vance\'s pullover.',
    admissibility: 100,
    chainStatus: 'Verified',
    impactVector: 'Alibi Obliteration',
    targetStatementId: 'STMT-002',
    contradictionExplanation:
      'Direct physical evidence proves Vance was physically present at the east wing window and engaged in a struggle with the victim.',
  },
  {
    id: 'EXHIBIT-P-02',
    label: 'EXHIBIT P-02 (CCTV-03)',
    category: 'surveillance',
    title: 'Perimeter CCTV Frame: 01:40 Ingress & 02:14 Egress',
    description:
      'Calibrated surveillance camera documenting Vance\'s black Audi A4 (Lic #7XYZ99) entering the east service road at 01:40 UTC and fleeing at 02:14 UTC with headlights extinguished.',
    admissibility: 100,
    chainStatus: 'Verified',
    impactVector: 'Timeline Invalidation',
    targetStatementId: 'STMT-001',
    contradictionExplanation:
      'Refutes Vance\'s sworn claim that he was asleep in his apartment; places his vehicle at the crime scene spanning the entire duration of the break-in and homicide.',
  },
  {
    id: 'EXHIBIT-P-03',
    label: 'EXHIBIT P-03 (ME-2026-0104)',
    category: 'pathology',
    title: 'Toxicology GC-MS Coniine Neurotoxin Panel',
    description:
      'Autopsy confirmation of lethal Coniine level (3.2 µg/mL) with subungual scraping DNA matching Vance and physical trauma establishing Homicide.',
    admissibility: 100,
    chainStatus: 'Verified',
    impactVector: 'Fatal Direct Nexus',
    targetStatementId: 'STMT-003',
    contradictionExplanation:
      'Shatters the claim of only researching benign flora by matching the precise botanical alkaloid extracted from the conservatory vault.',
  },
  {
    id: 'EXHIBIT-P-04',
    label: 'EXHIBIT P-04 (ART-001)',
    category: 'cyber',
    title: 'Burner SIM Chip Hex Extraction & Sector Ping',
    description:
      'Cellular tower Sector 2 telemetry correlating burner SIM #310410192847192 with Vance\'s device and the 01:45 UTC message: "Perimeter breach point ready at east wing. Ingress to vault corridor now."',
    admissibility: 98,
    chainStatus: 'Verified',
    impactVector: 'Conspiracy & Ingress Link',
    targetStatementId: 'STMT-004',
    contradictionExplanation:
      'Proves the burner SIM was co-located with Vance\'s vehicle and explicitly directed the timing of the east wing infiltration.',
  },
  {
    id: 'EXHIBIT-P-05',
    label: 'EXHIBIT P-05 (LAB-QC-01)',
    category: 'qa',
    title: 'ISO/IEC 17025 Method Validation & Blank Runs',
    description:
      'Contemporaneous bench notes documenting negative solvent blanks, instrument tuning, and dual-analyst attestation on Agilent GC-MS.',
    admissibility: 100,
    chainStatus: 'Verified',
    impactVector: 'Scientific Irreproachability',
    targetStatementId: 'STMT-EXPERT-01',
    contradictionExplanation:
      'Rebuts defense expert claims of instrumental contamination by demonstrating negative control blanks run immediately prior to specimen analysis.',
  },
];

export default function CourtroomTrial({ navigate }: CourtroomTrialProps) {
  const [selectedWitnessId, setSelectedWitnessId] = useState<string>('julian_vance');
  const [witnessData, setWitnessData] = useState(WITNESSES);
  const [selectedStatementId, setSelectedStatementId] = useState<string>('STMT-001');
  const [selectedExhibitId, setSelectedExhibitId] = useState<string>('EXHIBIT-P-01');
  const [exhibitFilter, setExhibitFilter] = useState<string>('all');

  // Dynamic Trial Meters
  const [juryPersuasion, setJuryPersuasion] = useState<number>(35);
  const [judgeTemperament, setJudgeTemperament] = useState<'Patient' | 'Neutral' | 'Stern' | 'Sanction Warning'>('Neutral');
  const [trialLog, setTrialLog] = useState<Array<{ time: string; type: 'info' | 'success' | 'alert' | 'objection'; message: string }>>([
    {
      time: '09:00:00',
      type: 'info',
      message: 'Court is in session. Hon. Eleanor Vance-Holt presiding. Prosecution cross-examination commenced.',
    },
  ]);

  // Defense Counterattack Modal
  const [activeDefenseObjection, setActiveDefenseObjection] = useState<{
    type: string;
    objectionText: string;
    grounds: string;
  } | null>(null);

  // Verdict Modal State
  const [verdictAchieved, setVerdictAchieved] = useState<boolean>(false);

  const currentWitness = witnessData.find((w) => w.id === selectedWitnessId) || witnessData[0];
  const currentStatement = currentWitness.initialStatements.find((s) => s.id === selectedStatementId);
  const currentExhibit = EVIDENCE_EXHIBITS.find((e) => e.id === selectedExhibitId);

  const totalContradictionsProven = witnessData
    .flatMap((w) => w.initialStatements)
    .filter((s) => s.isContradicted).length;

  // Append entry to court log
  function logCourtEvent(type: 'info' | 'success' | 'alert' | 'objection', message: string) {
    const time = new Date().toISOString().substring(11, 19);
    setTrialLog((prev) => [{ time, type, message }, ...prev.slice(0, 19)]);
  }

  // Handle Pressing a Statement
  function handlePressStatement(statementId: string) {
    setWitnessData((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWitnessId) return w;
        return {
          ...w,
          initialStatements: w.initialStatements.map((stmt) => {
            if (stmt.id !== statementId) return stmt;
            return {
              ...stmt,
              isPressed: true,
              stressLevel: Math.min(stmt.stressLevel + 18, 100),
            };
          }),
        };
      })
    );

    setJuryPersuasion((prev) => Math.min(prev + 4, 100));
    logCourtEvent(
      'info',
      `PROSECUTION PRESSES ${statementId}: Witness forced to elaborate. Micro-hesitation and pulse spike logged.`
    );
  }

  // Handle Challenging Foundation
  function handleChallengeFoundation(statementId: string) {
    setWitnessData((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWitnessId) return w;
        return {
          ...w,
          initialStatements: w.initialStatements.map((stmt) => {
            if (stmt.id !== statementId) return stmt;
            const newScore = Math.max(stmt.foundationScore - 25, 10);
            return {
              ...stmt,
              isFoundationAttacked: true,
              foundationScore: newScore,
              stressLevel: Math.min(stmt.stressLevel + 12, 100),
            };
          }),
        };
      })
    );

    setJuryPersuasion((prev) => Math.min(prev + 6, 100));
    logCourtEvent(
      'alert',
      `FOUNDATION ATTACKED ON ${statementId}: Legal stability degraded. Witness credibility compromised before jury.`
    );
  }

  // Handle Contradiction Injection
  function handleInjectContradiction() {
    if (!currentStatement || !currentExhibit) return;

    if (currentStatement.contradictionExhibitId === currentExhibit.id) {
      // SUCCESSFUL CONTRADICTION
      setWitnessData((prev) =>
        prev.map((w) => {
          if (w.id !== selectedWitnessId) return w;
          return {
            ...w,
            initialStatements: w.initialStatements.map((stmt) => {
              if (stmt.id !== currentStatement.id) return stmt;
              return {
                ...stmt,
                isContradicted: true,
                foundationScore: 0,
                stressLevel: 100,
              };
            }),
          };
        })
      );

      const newPersuasion = Math.min(juryPersuasion + 22, 100);
      setJuryPersuasion(newPersuasion);

      logCourtEvent(
        'success',
        `💥 CONTRADICTION SUBSTANTIATED! ${currentExhibit.label} refutes ${currentStatement.id}. ${currentExhibit.contradictionExplanation}`
      );

      // Trigger Defense Counterattack Objection
      setTimeout(() => {
        setActiveDefenseObjection({
          type: 'Speculation & Contamination',
          objectionText:
            '"Objection, Your Honor! The prosecution is drawing speculative inferences from trace evidence without proving unbroken chain of custody!"',
          grounds: '4th Amendment / Federal Rules of Evidence Rule 403',
        });
      }, 700);

      // Check for Narrative Collapse / Verdict
      if (totalContradictionsProven + 1 >= 3 || newPersuasion >= 90) {
        setTimeout(() => {
          setVerdictAchieved(true);
          logCourtEvent(
            'success',
            '⚖️ NARRATIVE COLLAPSE EVENT: Defense theory completely shattered. Jury deliberation concludes in unanimous conviction.'
          );
        }, 3200);
      }
    } else {
      // MISMATCHED CONTRADICTION
      setJuryPersuasion((prev) => Math.max(prev - 8, 10));
      setJudgeTemperament((prev) =>
        prev === 'Patient' ? 'Neutral' : prev === 'Neutral' ? 'Stern' : 'Sanction Warning'
      );
      logCourtEvent(
        'alert',
        `FAILED CONTRADICTION: ${currentExhibit.label} does not directly contradict claim in ${currentStatement.id}. Judge warns prosecution against speculative leaps.`
      );
    }
  }

  // Handle Player Tactical Objections
  function handlePlayerObjection(type: 'relevance' | 'hearsay' | 'improper-foundation' | 'argumentative' | 'speculation') {
    const success = ['relevance', 'improper-foundation', 'hearsay'].includes(type);
    if (success) {
      setJuryPersuasion((prev) => Math.min(prev + 5, 100));
      setJudgeTemperament('Patient');
      logCourtEvent(
        'success',
        `OBJECTION SUSTAINED: "Sustained on grounds of ${type.toUpperCase()}. The jury will disregard the witness's preceding commentary."`
      );
    } else {
      setJuryPersuasion((prev) => Math.max(prev - 4, 10));
      setJudgeTemperament('Stern');
      logCourtEvent(
        'alert',
        `OBJECTION OVERRULED: "Overruled. Counsel, maintain appropriate decorum and proceed with cross-examination."`
      );
    }
  }

  // Resolve Defense Objection
  function handleDefendObjection(method: 'bench_sheet' | 'custody_log' | 'rephrase') {
    setActiveDefenseObjection(null);
    if (method === 'bench_sheet' || method === 'custody_log') {
      setJuryPersuasion((prev) => Math.min(prev + 8, 100));
      logCourtEvent(
        'success',
        `DEFENSE OBJECTION OVERRULED: Prosecution produced verified ISO/IEC 17025 Bench Sheet and sealed custody continuity. Evidence deemed 100% admissible.`
      );
    } else {
      logCourtEvent(
        'info',
        'PROSECUTION REPHRASES: Question reframed to satisfy judicial inquiry without loss of evidence integrity.'
      );
    }
  }

  const filteredExhibits = EVIDENCE_EXHIBITS.filter((ex) => {
    if (exhibitFilter === 'all') return true;
    return ex.category === exhibitFilter;
  });

  return (
    <div className="courtroom-trial-page space-y-6">
      <InvestigationBreadcrumbs currentView="Courtroom Trial" navigate={navigate} />

      {/* Top Courtroom Master Header */}
      <div className="p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#4338ca] uppercase tracking-wider">
            <Gavel size={15} className="text-[#4338ca]" />
            <span>UNITED STATES DISTRICT COURT · SPECIAL TRIAL TERM</span>
          </div>
          <h1 className="text-[18px] font-bold text-[#0f0d1a] tracking-tight flex items-center gap-3">
            Adversarial Courtroom Cross-Examination
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#c1b4d9] border border-[#a89bc2] text-[#0f0d1a]">
              ACTIVE TRIAL PROCEEDINGS
            </span>
          </h1>
          <p className="text-[11px] text-[#2c273d]">
            Case No. CR-2026-0042 · United States v. Julian Paul Vance · 18 U.S.C. § 1111 &amp; § 1831
          </p>
        </div>

        {/* Action Link Stack */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => navigate('Legal & Warrants')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] font-semibold transition-colors cursor-pointer"
          >
            <Scale size={13} className="text-[#4338ca]" />
            <span>Grand Jury</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('Detective Desk')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] font-semibold transition-colors cursor-pointer"
          >
            <FolderKanban size={13} className="text-[#4338ca]" />
            <span>Detective Desk</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('Laboratory')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-white font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Microscope size={13} />
            <span>Lab Bench</span>
          </button>
        </div>
      </div>

      {/* Dynamic Trial Metrics & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Metric 1: Jury Persuasion Meter */}
        <div className="p-4 bg-white border border-[#a89bc2] rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0f0d1a] mb-2">
            <span className="font-bold uppercase tracking-wider text-[#4338ca] flex items-center gap-1.5">
              <Scale size={14} className="text-[#4338ca]" />
              Jury Persuasion Index
            </span>
            <span className="text-[#0f0d1a] font-bold text-sm">{juryPersuasion}%</span>
          </div>
          <div className="w-full bg-[#f1edf7] h-2.5 rounded-full overflow-hidden border border-[#d4ceeb]">
            <div
              className={`h-full transition-all duration-500 ${
                juryPersuasion >= 75 ? 'bg-emerald-600' : 'bg-[#4338ca]'
              }`}
              style={{ width: `${juryPersuasion}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-[#4b465c]">
            <span>Reasonable Doubt Standard</span>
            <span className={juryPersuasion >= 75 ? 'text-emerald-700 font-bold' : 'text-[#4338ca] font-semibold'}>
              {juryPersuasion >= 75 ? 'GUILTY BEYOND REASONABLE DOUBT' : 'DELIBERATING'}
            </span>
          </div>
        </div>

        {/* Metric 2: Judicial Temperament */}
        <div className="p-4 bg-white border border-[#a89bc2] rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0f0d1a] mb-2">
            <span className="font-bold uppercase tracking-wider text-[#4338ca] flex items-center gap-1.5">
              <Gavel size={14} className="text-[#4338ca]" />
              Judicial Temperament
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                judgeTemperament === 'Patient'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : judgeTemperament === 'Neutral'
                  ? 'bg-[#f1edf7] text-[#0f0d1a] border border-[#d4ceeb]'
                  : judgeTemperament === 'Stern'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {judgeTemperament}
            </span>
          </div>
          <div className="text-xs text-[#0f0d1a] leading-snug">
            Presiding: <strong className="font-bold">Hon. Eleanor Vance-Holt</strong>
          </div>
          <div className="text-[11px] text-[#4b465c] mt-1">
            Reactions to improper objections: Sustained foundation attacks maintain judicial favor.
          </div>
        </div>

        {/* Metric 3: Witness Telemetry */}
        <div className="p-4 bg-white border border-[#a89bc2] rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0f0d1a] mb-2">
            <span className="font-bold uppercase tracking-wider text-[#4338ca] flex items-center gap-1.5">
              <Activity size={14} className="text-[#4338ca]" />
              Witness Demeanor
            </span>
            <span className="text-rose-700 font-bold flex items-center gap-1">
              <Zap size={12} className="text-rose-600" />
              {currentWitness.baseHeartRate + (currentStatement?.isPressed ? 18 : 0) + (currentStatement?.isContradicted ? 35 : 0)} BPM
            </span>
          </div>
          <div className="text-xs text-[#0f0d1a] flex items-center justify-between">
            <span className="text-[#4b465c]">Perjury Risk Indicator:</span>
            <span className="text-rose-700 font-bold">{currentWitness.perjuryRisk}</span>
          </div>
          <div className="text-[11px] text-[#4b465c] mt-1 truncate">
            Observed Demeanor: {currentWitness.demeanor}
          </div>
        </div>
      </div>

      {/* Witness Selection Toolbar */}
      <div className="p-3.5 bg-white border border-[#a89bc2] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[#4338ca] font-bold uppercase tracking-wider flex items-center gap-1">
            <User size={14} className="text-[#4338ca]" />
            Witness on Stand:
          </span>
          <div className="flex items-center gap-1.5">
            {witnessData.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setSelectedWitnessId(w.id);
                  setSelectedStatementId(w.initialStatements[0]?.id || '');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedWitnessId === w.id
                    ? 'bg-[#4338ca] text-white shadow-sm'
                    : 'bg-[#f8f6fc] text-[#0f0d1a] hover:bg-[#ece7f4] border border-[#d4ceeb]'
                }`}
              >
                {w.name} ({w.archetype.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-[#4b465c]">
          Proven Inconsistencies: <strong className="text-[#0f0d1a]">{totalContradictionsProven} / 3 Threshold</strong>
        </div>
      </div>

      {/* Main 2-Column Courtroom Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 Cols) — Sworn Witness Testimony Stream */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} className="text-[#4338ca]" />
              Sworn Deposition &amp; Direct Testimony Stream
            </h3>
            <span className="text-xs text-[#4b465c]">
              {currentWitness.initialStatements.length} Active Sworn Claims
            </span>
          </div>

          <div className="space-y-3">
            {currentWitness.initialStatements.map((stmt) => {
              const isSelected = selectedStatementId === stmt.id;
              return (
                <div
                  key={stmt.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 shadow-xs ${
                    stmt.isContradicted
                      ? 'bg-rose-50 border-2 border-rose-400'
                      : isSelected
                      ? 'bg-[#fcfaff] border-2 border-[#4338ca] shadow-sm ring-1 ring-[#4338ca]/20'
                      : 'bg-white hover:bg-[#fbf9fe] border-[#d4ceeb]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#4338ca] font-mono font-bold uppercase">{stmt.id}</span>
                      <span className="text-[#4b465c] font-medium">· {stmt.speaker}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {stmt.isContradicted ? (
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <XCircle size={11} />
                          IMPEACHED / PERJURY
                        </span>
                      ) : stmt.isPressed ? (
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          PRESSED DETAIL REVEALED
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-[#f1edf7] border border-[#d4ceeb] text-[#2c273d]">
                          SWORN CLAIM
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Testimony Content */}
                  <div className="text-xs text-[#0f0d1a] leading-relaxed font-sans">
                    &ldquo;{stmt.text}&rdquo;
                  </div>

                  {/* Revealed Sub-statement if pressed */}
                  {stmt.isPressed && stmt.pressedText && (
                    <div className="p-3 bg-[#f8f6fc] rounded-lg border border-[#e5e0f0] text-xs text-[#2c273d] leading-relaxed italic">
                      {stmt.pressedText}
                    </div>
                  )}

                  {/* Telemetry Footer */}
                  <div className="pt-2 border-t border-[#e5e0f0] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[#4b465c]">
                      <span>Foundation Stability: {stmt.foundationScore}%</span>
                      <span className="text-amber-800 font-semibold">{stmt.hesitationMarker}</span>
                    </div>

                    <div className="w-full bg-[#f1edf7] h-1.5 rounded-full overflow-hidden border border-[#d4ceeb]">
                      <div
                        className={`h-full ${
                          stmt.foundationScore < 40
                            ? 'bg-rose-600'
                            : stmt.foundationScore < 70
                            ? 'bg-amber-500'
                            : 'bg-[#4338ca]'
                        }`}
                        style={{ width: `${stmt.foundationScore}%` }}
                      />
                    </div>

                    {/* Interactive Press / Challenge / Select Buttons */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePressStatement(stmt.id)}
                          disabled={stmt.isPressed || stmt.isContradicted}
                          className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                            stmt.isPressed
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'
                              : 'bg-[#f8f6fc] hover:bg-[#ece7f4] text-[#0f0d1a] border border-[#d4ceeb]'
                          }`}
                        >
                          ⚡ Press Statement
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChallengeFoundation(stmt.id)}
                          disabled={stmt.isFoundationAttacked || stmt.isContradicted}
                          className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                            stmt.isFoundationAttacked
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent'
                              : 'bg-[#f8f6fc] hover:bg-[#ece7f4] text-[#0f0d1a] border border-[#d4ceeb]'
                          }`}
                        >
                          ⚔️ Attack Foundation
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedStatementId(stmt.id)}
                        className={`px-3 py-1 text-xs rounded-md font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#4338ca] text-white shadow-xs'
                            : 'bg-[#f8f6fc] text-[#0f0d1a] hover:bg-[#ece7f4] border border-[#d4ceeb]'
                        }`}
                      >
                        {isSelected ? '● Targeted for Exhibit' : 'Target Statement ➔'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (6 Cols) — Evidence Arsenal & Contradiction Launcher */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <h3 className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-2">
              <Scale size={14} className="text-[#4338ca]" />
              Prosecution Evidence Arsenal
            </h3>
            {/* Exhibit Filter Tabs */}
            <div className="flex items-center gap-1 text-xs">
              {['all', 'physical', 'cyber', 'pathology', 'surveillance'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setExhibitFilter(cat)}
                  className={`px-2.5 py-0.5 rounded capitalize font-semibold transition-colors cursor-pointer ${
                    exhibitFilter === cat
                      ? 'bg-[#4338ca] text-white'
                      : 'bg-[#f8f6fc] text-[#4b465c] hover:text-[#0f0d1a] border border-[#d4ceeb]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredExhibits.map((ex) => {
              const isSelected = selectedExhibitId === ex.id;
              return (
                <button
                  type="button"
                  key={ex.id}
                  onClick={() => setSelectedExhibitId(ex.id)}
                  className={`w-full text-left cursor-pointer p-4 rounded-xl border transition-all space-y-2.5 block shadow-xs ${
                    isSelected
                      ? 'bg-amber-50/70 border-2 border-amber-500 shadow-sm ring-1 ring-amber-400/40'
                      : 'bg-white hover:bg-[#fbf9fe] border-[#d4ceeb]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-amber-300 text-[#0f0d1a] font-bold text-xs border border-amber-400">
                      {ex.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#f1edf7] border border-[#d4ceeb] text-[#2c273d] font-bold">
                        {ex.category}
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold">
                        {ex.admissibility}% ADMISSIBLE
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#0f0d1a]">{ex.title}</h4>
                  <p className="text-xs text-[#2c273d] leading-relaxed font-sans">{ex.description}</p>

                  <div className="pt-2 border-t border-[#e5e0f0] flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="text-[11px] text-[#4b465c]">
                      Impact Vector: <strong className="text-[#4338ca]">{ex.impactVector}</strong>
                    </div>

                    <span className="text-[11px] text-emerald-700 font-bold">
                      Chain of Custody: {ex.chainStatus}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Inject Contradiction Launcher Card */}
          <div className="p-4 bg-white border-2 border-amber-400 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#0f0d1a] font-bold uppercase tracking-wider">
                Evidentiary Confrontation Interface
              </span>
              <span className="text-amber-800 text-xs font-mono font-bold">
                Target: {selectedStatementId} ➔ Exhibit: {selectedExhibitId}
              </span>
            </div>

            <p className="text-xs text-[#2c273d] leading-relaxed">
              Injecting the selected exhibit directly confronts the target statement before the jury, challenging veracity and initiating immediate impeachment.
            </p>

            <button
              type="button"
              onClick={handleInjectContradiction}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 rounded-lg text-xs font-bold text-[#0f0d1a] border border-amber-500 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap size={14} className="text-[#0f0d1a]" />
              <span>Confront Statement &ldquo;{selectedStatementId}&rdquo; with Exhibit &ldquo;{selectedExhibitId}&rdquo; ➔</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Panel — Tactical Objection Console & Courtroom Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
        {/* Objection Console (5 Cols) */}
        <div className="lg:col-span-5 p-4 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0]">
            <span className="font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-[#4338ca]" />
              Procedural Objection Console
            </span>
            <span className="text-[11px] text-[#4b465c]">RULES OF EVIDENCE</span>
          </div>

          <p className="text-[#2c273d] text-xs leading-relaxed">
            Use procedural objections to prevent witness narrative manipulation and preserve evidentiary purity:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handlePlayerObjection('relevance')}
              className="p-2.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-left text-[#0f0d1a] font-semibold transition-colors cursor-pointer"
            >
              <code>OBJECTION: Relevance</code>
            </button>
            <button
              type="button"
              onClick={() => handlePlayerObjection('hearsay')}
              className="p-2.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-left text-[#0f0d1a] font-semibold transition-colors cursor-pointer"
            >
              <code>OBJECTION: Hearsay</code>
            </button>
            <button
              type="button"
              onClick={() => handlePlayerObjection('improper-foundation')}
              className="p-2.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-left text-[#0f0d1a] font-semibold transition-colors cursor-pointer"
            >
              <code>OBJECTION: Foundation</code>
            </button>
            <button
              type="button"
              onClick={() => handlePlayerObjection('speculation')}
              className="p-2.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-left text-[#0f0d1a] font-semibold transition-colors cursor-pointer"
            >
              <code>OBJECTION: Speculation</code>
            </button>
          </div>
        </div>

        {/* Real-time Court Reporter Transcript Stream (7 Cols) */}
        <div className="lg:col-span-7 p-4 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0]">
            <span className="font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 size={14} className="text-[#4338ca]" />
              Court Reporter Stenographic Record
            </span>
            <span className="text-[11px] text-[#4b465c]">OFFICIAL TRANSCRIPT · REAL-TIME</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {trialLog.map((log, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${
                  log.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-medium'
                    : log.type === 'alert'
                    ? 'bg-amber-50 border border-amber-300 text-amber-950 font-medium'
                    : 'bg-[#f8f6fc] border border-[#e5e0f0] text-[#0f0d1a]'
                }`}
              >
                <span className="text-xs text-[#4338ca] font-mono font-bold shrink-0">{log.time}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Defense Counterattack Objection Modal */}
      {activeDefenseObjection && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-400 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs text-[#0f0d1a]">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle size={18} />
              <h3 className="text-base font-bold text-[#0f0d1a]">DEFENSE OBJECTION LODGED</h3>
            </div>

            <div className="p-3 bg-[#f8f6fc] rounded-lg border border-[#e5e0f0] text-[#2c273d] text-xs leading-relaxed italic">
              {activeDefenseObjection.objectionText}
            </div>

            <div className="text-[#2c273d]">
              Legal Grounds: <strong className="text-amber-800">{activeDefenseObjection.grounds}</strong>
            </div>

            <p className="text-[#2c273d]">
              The defense is attempting to exclude prosecution evidence. Select your evidentiary counter-argument:
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleDefendObjection('bench_sheet')}
                className="w-full p-2.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-left text-[#0f0d1a] transition-colors cursor-pointer"
              >
                <strong className="text-[#4338ca] block">1. Present ISO/IEC 17025 Bench Sheet &amp; QC Blanks</strong>
                <span className="block text-[11px] text-[#4b465c] mt-0.5">
                  Proves laboratory contamination exclusion and simultaneous reagent blanks.
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDefendObjection('custody_log')}
                className="w-full p-2.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-left text-[#0f0d1a] transition-colors cursor-pointer"
              >
                <strong className="text-[#4338ca] block">2. Tender Unbroken Chain of Custody Document (EV-0002)</strong>
                <span className="block text-[11px] text-[#4b465c] mt-0.5">
                  Demonstrates verified tamper-evident tape seals from recovery to court entry.
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDefendObjection('rephrase')}
                className="w-full p-2.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-left text-[#0f0d1a] transition-colors cursor-pointer"
              >
                <strong className="text-[#0f0d1a] block">3. Rephrase Foundation &amp; Establish Direct Spatial Nexus</strong>
                <span className="block text-[11px] text-[#4b465c] mt-0.5">
                  Anchor question to physical recovery coordinates rather than inference.
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Narrative Collapse & Final Verdict Modal */}
      {verdictAchieved && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-500 rounded-xl p-8 max-w-xl w-full shadow-2xl space-y-6 text-center text-[#0f0d1a]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-800">
              <Gavel size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold">
                UNITED STATES DISTRICT COURT VERDICT REACHED
              </span>
              <h2 className="text-[15px] font-bold text-[#0f0d1a]">GUILTY ON ALL COUNTS</h2>
              <p className="text-xs text-[#2c273d] max-w-md mx-auto leading-relaxed">
                The defense narrative has completely collapsed. Through irreconcilable contradictions and forensic rigor, Julian Paul Vance has been convicted of First Degree Murder and Economic Espionage.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f6fc] border border-[#e5e0f0] text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-[#4338ca] pb-1 border-b border-[#e5e0f0] font-bold">
                <span>JUDICIAL CONVICTION RECORD:</span>
                <span className="text-emerald-800">FORM CR-101</span>
              </div>
              <div className="text-[#0f0d1a]">
                • Count 1: 18 U.S.C. § 1111 (First Degree Murder) — <strong className="text-emerald-800">GUILTY</strong>
              </div>
              <div className="text-[#0f0d1a]">
                • Count 2: 18 U.S.C. § 1831 (Economic Espionage) — <strong className="text-emerald-800">GUILTY</strong>
              </div>
              <div className="text-[#0f0d1a]">
                • Count 3: 18 U.S.C. § 1621 (Perjury in Federal Court) — <strong className="text-emerald-800">SUBSTANTIATED</strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setVerdictAchieved(false)}
                className="px-4 py-2 bg-[#f8f6fc] hover:bg-[#ece7f4] text-[#0f0d1a] border border-[#d4ceeb] rounded-lg font-semibold cursor-pointer"
              >
                Review Court Record
              </button>
              <button
                type="button"
                onClick={() => navigate('Detective Desk')}
                className="px-5 py-2 bg-[#4338ca] hover:bg-[#3730a3] font-bold text-white rounded-lg shadow-sm cursor-pointer"
              >
                Return to Detective Desk ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
