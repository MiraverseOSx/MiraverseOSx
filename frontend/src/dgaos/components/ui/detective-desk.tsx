'use client';
import { useState } from 'react';
import {
  FolderKanban,
  Clock,
  Users,
  Zap,
  MapPin,
  Scale,
  Plus,
  CheckCircle2,
  UserCheck,
  HeartPulse,
} from 'lucide-react';
import type { LabRecord } from '@/lib/records';
import InvestigationBreadcrumbs from '@/components/ui/investigation-breadcrumbs';

interface DetectiveDeskProps {
  cases?: LabRecord[];
  evidence?: LabRecord[];
  exams?: LabRecord[];
  onOpenRecord?: (record: LabRecord) => void;
  navigate: (view: string) => void;
}

type DetectiveSubTab = 'corkboard' | 'deduction' | 'suspects' | 'timeline';

interface ClueNode {
  id: string;
  type: 'suspect' | 'evidence' | 'cctv' | 'document' | 'cyber' | 'morgue';
  title: string;
  subtitle: string;
  tags: string[];
  x: number;
  y: number;
  isPinned: boolean;
  highlight?: boolean;
}

interface ClueConnection {
  from: string;
  to: string;
  relation: string;
  type: 'motive' | 'alibi_conflict' | 'physical_match' | 'cyber_link' | 'toxicology';
}

const INITIAL_CLUES: ClueNode[] = [
  {
    id: 'CLUE-SUSPECT-1',
    type: 'suspect',
    title: 'Julian Vance ("Ghost_404")',
    subtitle: 'Former Conservatory Botanist · Terminated Aug 2026',
    tags: ['Prime Suspect', 'Knows Keycodes', 'Black Audi A4'],
    x: 30,
    y: 40,
    isPinned: true,
    highlight: true,
  },
  {
    id: 'CLUE-EV-GLASS',
    type: 'evidence',
    title: 'Item EV-0001: Window Glass Shards',
    subtitle: 'Impact fracture origin · Recovered from broken east wing',
    tags: ['Physical Trace', 'Becke Line n=1.517'],
    x: 310,
    y: 35,
    isPinned: true,
  },
  {
    id: 'CLUE-EV-FIBER',
    type: 'evidence',
    title: 'Item EV-0002: Blue Acrylic Fiber',
    subtitle: 'Snagged on broken window frame · High birefringence',
    tags: ['Physical Trace', 'Matches Navy Fleece'],
    x: 310,
    y: 210,
    isPinned: true,
  },
  {
    id: 'CLUE-CYBER-SIM',
    type: 'cyber',
    title: 'Digital Artifact ART-001: Burner SMS',
    subtitle: '"Perimeter breach ready on east wing. Ingress now."',
    tags: ['Digital Forensics', '01:45 UTC Timestamp'],
    x: 30,
    y: 220,
    isPinned: true,
  },
  {
    id: 'CLUE-CCTV',
    type: 'cctv',
    title: 'Perimeter CCTV Camera #03',
    subtitle: '01:40 UTC Ingress & 02:14 UTC Egress: Navy sedan sightings',
    tags: ['Surveillance', 'Vehicle Sighting', 'Alibi Refuted'],
    x: 590,
    y: 45,
    isPinned: true,
  },
  {
    id: 'CLUE-MORGUE',
    type: 'morgue',
    title: 'Autopsy ME-2026-0104: Dr. Aris Thorne',
    subtitle: 'Cause: Acute Coniine Neurotoxicity · Subungual fiber scrapings',
    tags: ['Homicide', 'Fatal Alkaloid', 'Defensive Scrapings'],
    x: 590,
    y: 220,
    isPinned: true,
  },
];

const INITIAL_CONNECTIONS: ClueConnection[] = [
  {
    from: 'CLUE-SUSPECT-1',
    to: 'CLUE-CYBER-SIM',
    relation: 'Phone number +1 (555) 019-2831 resolved to suspect burner',
    type: 'cyber_link',
  },
  {
    from: 'CLUE-SUSPECT-1',
    to: 'CLUE-EV-FIBER',
    relation: 'Suspect admitted owning navy fleece pullover matching snagged fiber',
    type: 'physical_match',
  },
  {
    from: 'CLUE-SUSPECT-1',
    to: 'CLUE-CCTV',
    relation: 'Alibi claimed being asleep; vehicle captured on CCTV arriving at 01:40 UTC and fleeing at 02:14 UTC',
    type: 'alibi_conflict',
  },
  {
    from: 'CLUE-EV-GLASS',
    to: 'CLUE-EV-FIBER',
    relation: 'Both recovered directly at the east wing forced entry point',
    type: 'physical_match',
  },
  {
    from: 'CLUE-SUSPECT-1',
    to: 'CLUE-MORGUE',
    relation: 'Victim subungual fingernail scrapings match Vance navy fiber pullover',
    type: 'physical_match',
  },
];

interface SuspectProfile {
  id: string;
  name: string;
  alias: string;
  status: 'Person of Interest' | 'Prime Suspect' | 'Cleared Witness';
  motive: string;
  opportunity: string;
  means: string;
  alibi: string;
  alibiVerification: 'Contradicted by Evidence' | 'Unverified' | 'Corroborated';
  interrogationNotes: string;
}

const SUSPECT_PROFILES: SuspectProfile[] = [
  {
    id: 'SUS-01',
    name: 'Julian Vance',
    alias: '"Ghost_404" / "Julian K."',
    status: 'Prime Suspect',
    motive: 'Severe financial distress following termination from conservatory.',
    opportunity: 'Knew perimeter patrol blindspots and broken secondary window latch.',
    means: 'Glass cutter, high-birefringence fleece jacket, and encrypted drive.',
    alibi: 'Claims he was asleep at home from 23:00 to 07:00 with his phone on charge.',
    alibiVerification: 'Contradicted by Evidence',
    interrogationNotes:
      'Subject broke down when presented with recovered 01:45 UTC SMS and matching sweater fiber. Confessed to entering perimeter under coercion to extract cultivar.',
  },
  {
    id: 'SUS-02',
    name: 'Elena Rostova',
    alias: '"Botanist_E"',
    status: 'Person of Interest',
    motive: 'Head curator with rare orchid collection insurance policy.',
    opportunity: 'Held primary master keycard for interior vaults.',
    means: 'Authorized access to internal doors, but lacks physical climbing ability.',
    alibi: 'At the airport boarding flight to Zurich at 03:20 UTC.',
    alibiVerification: 'Corroborated',
    interrogationNotes:
      'TSA checkpoint logs and passport scan confirm departure from Dulles International at 01:15 UTC. Physical presence at scene excluded.',
  },
];

interface TimelineEvent {
  time: string;
  category: 'cyber' | 'physical' | 'dispatch' | 'surveillance' | 'morgue';
  title: string;
  detail: string;
  source: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    time: '2026-09-08 01:40 UTC',
    category: 'surveillance',
    title: 'CCTV Camera #03 Ingress: Black Audi A4',
    detail: 'Black Audi A4 (Lic #7XYZ99) enters the east service road with headlights extinguished.',
    source: 'Perimeter CCTV Camera #03 Security Footage',
  },
  {
    time: '2026-09-08 01:45 UTC',
    category: 'cyber',
    title: 'Burner SMS Sent via Carrier Node',
    detail: '"Perimeter breach point ready at east wing. Ingress to vault corridor now."',
    source: 'Recovered from Burner SIM Extraction (ART-001)',
  },
  {
    time: '2026-09-08 01:48 UTC',
    category: 'physical',
    title: 'East Wing Window Forced Breach',
    detail: 'Tempered glass fractured from exterior; navy acrylic pullover fibers snagged on jagged upper glass frame.',
    source: 'Scene Physical Trace Items EV-0001 & EV-0002',
  },
  {
    time: '2026-09-08 01:52 UTC',
    category: 'morgue',
    title: 'Victim Confrontation & Watch Stoppage (Time of Death)',
    detail: 'Physical altercation in conservatory; Patek Philippe balance wheel seized at 01:52 UTC. Dr. Thorne sustains fatal Coniine exposure.',
    source: 'Wristwatch EV-0005 & Autopsy ME-2026-0104',
  },
  {
    time: '2026-09-08 02:14 UTC',
    category: 'surveillance',
    title: 'Egress: East Fence Motion & Vehicle Departure',
    detail: 'PIR motion and Camera #03 record the black Audi A4 (Lic #7XYZ99) leaving the east service road.',
    source: 'Facility Security System & East Gate CCTV Log',
  },
  {
    time: '2026-09-08 02:18 UTC',
    category: 'cyber',
    title: 'Cellular Tower Sector 4B Getaway Ping',
    detail: 'Suspect mobile device registered handoff at tower 4B (350m from conservatory) during transit away from arboretum.',
    source: 'Carrier 18 U.S.C. § 2703(d) Subpoena Returns',
  },
  {
    time: '2026-09-08 02:46 UTC',
    category: 'dispatch',
    title: '911 Emergency Dispatch: Body Discovered',
    detail: 'Night security guard reports finding lead researcher unresponsive on conservatory floor.',
    source: 'Emergency Dispatch CAD Call #99104',
  },
  {
    time: '2026-09-08 03:15 UTC',
    category: 'physical',
    title: 'Physical Evidence Intake & Seal',
    detail: 'EV-0001 (Glass), EV-0002 (Fiber), and EV-0005 (Watch) sealed in evidence lockers with intact tamper tape.',
    source: 'TRACE Evidence Custody Log',
  },
];

export default function DetectiveDesk({
  cases = [],
  evidence: _evidence,
  exams: _exams,
  onOpenRecord,
  navigate,
}: DetectiveDeskProps) {
  const [subTab, setSubTab] = useState<DetectiveSubTab>('corkboard');
  const [clues, setClues] = useState<ClueNode[]>(INITIAL_CLUES);
  const connections = INITIAL_CONNECTIONS;
  const [selectedClue, setSelectedClue] = useState<ClueNode | null>(INITIAL_CLUES[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Contradiction Deduction Engine State
  const [deductionPair, setDeductionPair] = useState<{ first: string; second: string }>({
    first: 'CLUE-SUSPECT-1',
    second: 'CLUE-CCTV',
  });
  const [unlockedContradictions, setUnlockedContradictions] = useState<string[]>([
    'VANCE_ALIBI_VS_CCTV',
  ]);
  const [deductionFeedback, setDeductionFeedback] = useState<string | null>(
    'CONTRADICTION VALIDATED: Julian Vance\'s asleep-at-home alibi fails. Camera #03 shows his Audi A4 arriving at 01:40 UTC and leaving at 02:14 UTC.'
  );

  // New Clue Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newClueTitle, setNewClueTitle] = useState<string>('');
  const [newClueType, setNewClueType] = useState<ClueNode['type']>('evidence');
  const [newClueSubtitle, setNewClueSubtitle] = useState<string>('');

  const solvabilityScore = Math.min(25 + unlockedContradictions.length * 25, 100);

  function handleAddClue() {
    if (!newClueTitle.trim()) return;
    const newId = `CLUE-USER-${Date.now()}`;
    const created: ClueNode = {
      id: newId,
      type: newClueType,
      title: newClueTitle,
      subtitle: newClueSubtitle || 'Investigative observation note',
      tags: ['Custom Note', newClueType],
      x: 320,
      y: 120,
      isPinned: true,
    };
    setClues([...clues, created]);
    setSelectedClue(created);
    setShowAddModal(false);
    setNewClueTitle('');
    setNewClueSubtitle('');
  }

  function handleTestContradiction() {
    const { first, second } = deductionPair;
    if (!first || !second || first === second) {
      setDeductionFeedback('Select two distinct pieces of evidence or alibi claims to test for a contradiction.');
      return;
    }

    const isAlibiConflict =
      (first === 'CLUE-SUSPECT-1' && second === 'CLUE-CCTV') ||
      (second === 'CLUE-SUSPECT-1' && first === 'CLUE-CCTV');

    const isSmsConflict =
      (first === 'CLUE-SUSPECT-1' && second === 'CLUE-CYBER-SIM') ||
      (second === 'CLUE-SUSPECT-1' && first === 'CLUE-CYBER-SIM');

    const isFiberMatch =
      (first === 'CLUE-SUSPECT-1' && second === 'CLUE-EV-FIBER') ||
      (second === 'CLUE-SUSPECT-1' && first === 'CLUE-EV-FIBER');

    const isMorgueScrapingMatch =
      (first === 'CLUE-MORGUE' && second === 'CLUE-EV-FIBER') ||
      (second === 'CLUE-MORGUE' && first === 'CLUE-EV-FIBER');

    if (isAlibiConflict) {
      if (!unlockedContradictions.includes('VANCE_ALIBI_VS_CCTV')) {
        setUnlockedContradictions([...unlockedContradictions, 'VANCE_ALIBI_VS_CCTV']);
      }
      setDeductionFeedback(
        'BREAKTHROUGH CONFIRMED: Camera #03 places Vance\'s Audi A4 (Lic #7XYZ99) on the east service road from 01:40 UTC through the 02:14 UTC departure.'
      );
    } else if (isSmsConflict) {
      if (!unlockedContradictions.includes('VANCE_ALIBI_VS_SMS')) {
        setUnlockedContradictions([...unlockedContradictions, 'VANCE_ALIBI_VS_SMS']);
      }
      setDeductionFeedback(
        'BREAKTHROUGH CONFIRMED: Intercepted Burner SMS at 01:45 UTC links Vance directly to the east wing point of entry prior to the break-in.'
      );
    } else if (isFiberMatch) {
      if (!unlockedContradictions.includes('VANCE_PULLOVER_VS_FIBER')) {
        setUnlockedContradictions([...unlockedContradictions, 'VANCE_PULLOVER_VS_FIBER']);
      }
      setDeductionFeedback(
        'BREAKTHROUGH CONFIRMED: Navy acrylic fiber snagged on glass frame has identical FTIR spectrum and morphology to Vance\'s personal jacket.'
      );
    } else if (isMorgueScrapingMatch) {
      if (!unlockedContradictions.includes('MORGUE_DNA_FIBER_MATCH')) {
        setUnlockedContradictions([...unlockedContradictions, 'MORGUE_DNA_FIBER_MATCH']);
      }
      setDeductionFeedback(
        'BREAKTHROUGH CONFIRMED: Defensive fingernail scrapings from Dr. Aris Thorne corroborate physical altercation with suspect wearing navy acrylic pullover.'
      );
    } else {
      setDeductionFeedback(
        'No direct contradiction detected between these two items. Try correlating suspect alibi claims against physical traces or surveillance timestamps.'
      );
    }
  }

  const filteredClues = clues.filter((c) => {
    if (filterCategory === 'all') return true;
    return c.type === filterCategory;
  });

  return (
    <div className="detective-desk-page space-y-6">
      <InvestigationBreadcrumbs currentView="Detective Desk" navigate={navigate} />

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#4338ca] mb-1 uppercase tracking-wider">
            <FolderKanban size={15} />
            <span>Case Dossier #2026-0042</span>
          </div>
          <h1 className="text-[18px] font-bold text-[#0f0d1a] tracking-tight flex items-center gap-3">
            Detective Desk &amp; Case Deduction Board
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#c1b4d9] border border-[#a89bc2] text-[#0f0d1a] font-bold">
              Deduction Active
            </span>
          </h1>
          <p className="text-[11px] text-[#2c273d] mt-1">
            Correlating Physical Evidence, Digital Forensics, Surveillance, Morgue Findings &amp; Suspect Alibis
          </p>
        </div>

        {/* Action Link Stack */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => navigate('Crime Scene (CSI)')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded-lg text-[#0f0d1a] transition-colors cursor-pointer"
          >
            <MapPin size={13} className="text-[#4338ca]" />
            <span>Crime Scene</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('Interrogation Room')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded-lg text-[#0f0d1a] transition-colors cursor-pointer"
          >
            <UserCheck size={13} className="text-[#4338ca]" />
            <span>Interrogation</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('Forensic Morgue')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded-lg text-[#0f0d1a] transition-colors cursor-pointer"
          >
            <HeartPulse size={13} className="text-[#4338ca]" />
            <span>Morgue</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('Legal & Warrants')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-white font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Scale size={13} />
            <span>Grand Jury</span>
          </button>
        </div>
      </div>

      {/* Waiting Case Alert Banner */}
      {cases?.some((c) => c.data.status === 'Awaiting Acceptance') && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-amber-950 uppercase tracking-wide">
                Case Docket Pending Primary Investigator Acceptance
              </span>
              <span className="text-amber-800 ml-2">
                {cases
                  .filter((c) => c.data.status === 'Awaiting Acceptance')
                  .map((c) => `${c.id}: ${c.data.title}`)
                  .join(' · ')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const waitingCase = cases.find((c) => c.data.status === 'Awaiting Acceptance');
              if (waitingCase && onOpenRecord) {
                onOpenRecord(waitingCase);
              } else {
                navigate('Cases');
              }
            }}
            className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold text-xs shrink-0 transition-colors cursor-pointer"
          >
            Open &amp; Sign Docket →
          </button>
        </div>
      )}

      {/* Solvability Metric Card */}
      <div className="p-4 bg-white border border-[#a89bc2] rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#c1b4d9] border border-[#a89bc2] flex items-center justify-center font-bold text-[#0f0d1a] text-sm">
            {solvabilityScore}%
          </div>
          <div>
            <div className="text-xs font-bold text-[#0f0d1a]">Case Solvability Index</div>
            <div className="text-xs text-[#2c273d]">
              {unlockedContradictions.length} Critical Contradictions Proven · Grand Jury Threshold Met
            </div>
          </div>
        </div>

        <div className="w-full sm:w-64 bg-[#e5e0f0] h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#047857] transition-all duration-500 rounded-full"
            style={{ width: `${solvabilityScore}%` }}
          />
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#a89bc2] pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('corkboard')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
              subTab === 'corkboard'
                ? 'bg-white border-t-2 border-[#4338ca] text-[#0f0d1a] shadow-sm'
                : 'text-[#4b465c] hover:text-[#0f0d1a]'
            }`}
          >
            <FolderKanban size={13} />
            <span>Case Clue Board</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('deduction')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
              subTab === 'deduction'
                ? 'bg-white border-t-2 border-[#4338ca] text-[#0f0d1a] shadow-sm'
                : 'text-[#4b465c] hover:text-[#0f0d1a]'
            }`}
          >
            <Zap size={13} />
            <span>Contradiction Deduction</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('suspects')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
              subTab === 'suspects'
                ? 'bg-white border-t-2 border-[#4338ca] text-[#0f0d1a] shadow-sm'
                : 'text-[#4b465c] hover:text-[#0f0d1a]'
            }`}
          >
            <Users size={13} />
            <span>Suspect Dossiers</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('timeline')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
              subTab === 'timeline'
                ? 'bg-white border-t-2 border-[#4338ca] text-[#0f0d1a] shadow-sm'
                : 'text-[#4b465c] hover:text-[#0f0d1a]'
            }`}
          >
            <Clock size={13} />
            <span>Incident Master Timeline</span>
          </button>
        </div>

        {subTab === 'corkboard' && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>Pin Clue Note</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: Interactive Corkboard */}
      {subTab === 'corkboard' && (
        <div className="space-y-6">
          {/* Corkboard Category Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#a89bc2] rounded-xl text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['all', 'suspect', 'evidence', 'cyber', 'cctv', 'morgue'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-md capitalize font-bold transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#c1b4d9] border border-[#a89bc2] text-[#0f0d1a]'
                      : 'bg-[#f8f6fc] text-[#4b465c] hover:text-[#0f0d1a] border border-[#e5e0f0]'
                  }`}
                >
                  {cat === 'all' ? 'All Leads' : cat}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-[#4338ca]">
              Showing {filteredClues.length} Pinned Leads
            </span>
          </div>

          {/* 2-Column Board Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Clue Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredClues.map((clue) => {
                const isSelected = selectedClue?.id === clue.id;
                return (
                  <div
                    key={clue.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-2 border-[#4338ca] shadow-md ring-1 ring-[#4338ca]/30'
                        : 'bg-white hover:bg-[#fbf9fe] border-[#d4ceeb] shadow-sm'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedClue(clue)}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        {clue.type === 'evidence' ? (
                          <span className="px-2 py-0.5 rounded bg-[#fef08a] text-[#713f12] font-black tracking-wide text-[10px]">
                            {clue.id}
                          </span>
                        ) : (
                          <span className="text-[#4338ca] font-bold uppercase tracking-wide">{clue.id}</span>
                        )}
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#f8f6fc] border border-[#e5e0f0] text-[#4b465c] font-semibold">
                          {clue.type}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#0f0d1a] mb-1 leading-snug">{clue.title}</h4>
                      <p className="text-xs text-[#2c273d] leading-relaxed mb-3">{clue.subtitle}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {clue.tags.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#f8f6fc] text-[#4b465c] rounded border border-[#e5e0f0]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </button>

                    <div className="pt-3 border-t border-[#e5e0f0] flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedClue(clue)}
                        className={`text-xs font-semibold cursor-pointer text-left ${isSelected ? 'text-[#4338ca]' : 'text-[#64748b] hover:text-[#0f0d1a]'}`}
                      >
                        {isSelected ? '● Dossier Active' : '○ Click to Inspect'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (clue.type === 'suspect') navigate('Interrogation Room');
                          else if (clue.type === 'morgue') navigate('Forensic Morgue');
                          else if (clue.type === 'cyber') navigate('Cyber Lab');
                          else navigate('Evidence');
                        }}
                        className="text-[#4338ca] hover:text-[#312e81] font-semibold transition-colors cursor-pointer underline text-xs"
                      >
                        Inspect ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 5 Columns: Sticky Clue Deep Dossier */}
            <div className="lg:col-span-5 sticky top-4 space-y-4">
              {selectedClue ? (
                <div className="p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-4">
                  {/* Clue Inspector Header */}
                  <div className="pb-3 border-b border-[#e5e0f0] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-[#4338ca] uppercase tracking-wider">Active Clue Inspection</div>
                      <h3 className="text-base font-bold text-[#0f0d1a] mt-0.5">{selectedClue.title}</h3>
                    </div>
                    <span className="text-xs uppercase px-2 py-0.5 rounded bg-[#c1b4d9] text-[#0f0d1a] font-bold">
                      {selectedClue.type}
                    </span>
                  </div>

                  {/* Clue Details */}
                  <div className="space-y-2 text-xs">
                    <div className="text-[#2c273d] leading-relaxed bg-[#f8f6fc] p-3 rounded-lg border border-[#e5e0f0]">
                      {selectedClue.subtitle}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedClue.tags.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 bg-[#f8f6fc] text-[#4b465c] rounded border border-[#e5e0f0]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Connected Threads */}
                  <div className="pt-3 border-t border-[#e5e0f0] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#0f0d1a] font-bold uppercase">Investigative Links</span>
                      <span className="text-xs text-[#64748b]">
                        {connections.filter((c) => c.from === selectedClue.id || c.to === selectedClue.id).length} Active Threads
                      </span>
                    </div>

                    <div className="space-y-2">
                      {connections
                        .filter((c) => c.from === selectedClue.id || c.to === selectedClue.id)
                        .map((c, i) => (
                          <div key={i} className="p-2.5 bg-[#f8f6fc] rounded-lg border border-[#e5e0f0] text-xs">
                            <div className="flex items-center justify-between text-[11px] text-[#4338ca] font-bold mb-1">
                              <span>{c.from} ➔ {c.to}</span>
                              <span className="uppercase text-[#b45309]">{c.type}</span>
                            </div>
                            <p className="text-[#2c273d] leading-normal">{c.relation}</p>
                          </div>
                        ))}
                      {connections.filter((c) => c.from === selectedClue.id || c.to === selectedClue.id).length === 0 && (
                        <div className="p-3 bg-[#f8f6fc] rounded-lg border border-[#e5e0f0] text-[#64748b] text-xs text-center">
                          No direct cross-links established yet. Correlate this lead in the Deduction Engine below.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cross-System Navigation Actions */}
                  <div className="pt-3 border-t border-[#e5e0f0] space-y-2">
                    <span className="text-xs text-[#0f0d1a] uppercase tracking-wider block font-bold">
                      Cross-System Actions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedClue.type === 'suspect' && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate('Interrogation Room')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Interrogate Suspect
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('Citizen Registry')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Citizen Dossier
                          </button>
                        </>
                      )}
                      {selectedClue.type === 'evidence' && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate('Evidence')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Physical Lab Analysis
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('Crime Scene (CSI)')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Inspect Crime Scene
                          </button>
                        </>
                      )}
                      {selectedClue.type === 'cyber' && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate('Cyber Lab')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Digital Forensics Lab
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('Communications')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Comms Center
                          </button>
                        </>
                      )}
                      {selectedClue.type === 'cctv' && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate('Evidence')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Surveillance Vault
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('Crime Scene (CSI)')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Perimeter Point of Entry
                          </button>
                        </>
                      )}
                      {selectedClue.type === 'morgue' && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate('Forensic Morgue')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Autopsy File
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('Forensic Morgue')}
                            className="p-2 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#e5e0f0] rounded text-left text-[#4338ca] font-semibold transition-colors cursor-pointer"
                          >
                            ➔ Toxicology Panel
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDeductionPair({ ...deductionPair, first: selectedClue.id });
                        setSubTab('deduction');
                      }}
                      className="w-full mt-2 py-2.5 bg-[#c1b4d9] hover:bg-[#b3a4ce] border border-[#a89bc2] rounded-lg text-xs font-bold text-[#0f0d1a] transition-colors cursor-pointer text-center"
                    >
                      Test &ldquo;{selectedClue.id}&rdquo; in Contradiction Engine ➔
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-white border border-[#a89bc2] rounded-xl text-center text-[#64748b] text-xs">
                  Select any lead on the board to inspect its evidence file and connection threads.
                </div>
              )}
            </div>
          </div>

          {/* Active Connections Feed */}
          <div className="p-4 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0]">
              <span className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider">
                Investigative Connections &amp; Case Theories
              </span>
              <span className="text-xs font-bold text-[#0f0d1a] bg-[#c1b4d9] px-2.5 py-0.5 rounded border border-[#a89bc2]">
                {connections.length} Verified Links
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connections.map((conn, idx) => (
                <div key={idx} className="p-3 bg-[#f8f6fc] rounded-lg border border-[#e5e0f0] text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#4338ca] font-bold mb-1">
                    <span>{conn.from} ➔ {conn.to}</span>
                    <span className="uppercase text-[#b45309]">{conn.type}</span>
                  </div>
                  <p className="text-[#2c273d] leading-relaxed">{conn.relation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Contradiction Deduction Engine */}
      {subTab === 'deduction' && (
        <div className="bg-white border border-[#a89bc2] rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e0f0]">
            <div>
              <h3 className="text-base font-bold text-[#0f0d1a]">Contradiction &amp; Theory Deduction Engine</h3>
              <p className="text-xs text-[#2c273d] mt-0.5">
                Select two connected pieces of evidence to test for irreconcilable contradictions and examine alibi defenses.
              </p>
            </div>
            <Zap size={18} className="text-[#b45309]" />
          </div>

          {/* Deduction Selection Pair */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="deduction-lead-a" className="text-xs text-[#0f0d1a] uppercase font-bold block">
                Primary Claim or Evidence Lead A:
              </label>
              <select
                id="deduction-lead-a"
                value={deductionPair.first}
                onChange={(e) => setDeductionPair({ ...deductionPair, first: e.target.value })}
                className="w-full bg-white border border-[#a89bc2] text-[#0f0d1a] text-xs rounded-lg p-3 outline-none focus:border-[#4338ca]"
              >
                {clues.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}: {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="deduction-lead-b" className="text-xs text-[#0f0d1a] uppercase font-bold block">
                Contradicting Trace or Surveillance Lead B:
              </label>
              <select
                id="deduction-lead-b"
                value={deductionPair.second}
                onChange={(e) => setDeductionPair({ ...deductionPair, second: e.target.value })}
                className="w-full bg-white border border-[#a89bc2] text-[#0f0d1a] text-xs rounded-lg p-3 outline-none focus:border-[#4338ca]"
              >
                {clues.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestContradiction}
            className="w-full py-3 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Validate Theory Contradiction
          </button>

          {deductionFeedback && (
            <div className="p-4 rounded-xl bg-[#fef3c7] border border-[#fde047] text-xs text-[#78350f] leading-relaxed">
              <strong className="block mb-1 font-bold">DEDUCTION ANALYSIS OUTCOME:</strong>
              <p>{deductionFeedback}</p>
            </div>
          )}

          {/* Unlocked Breakthroughs List */}
          <div className="pt-4 border-t border-[#e5e0f0] space-y-2">
            <span className="text-xs text-[#0f0d1a] font-bold uppercase tracking-wider block">
              Grand Jury Substantiated Breakthroughs ({unlockedContradictions.length}):
            </span>
            <div className="space-y-2">
              {unlockedContradictions.map((key) => (
                <div key={key} className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg flex items-center justify-between text-xs text-[#0f0d1a]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#047857]" />
                    <span className="font-semibold">{key}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('Legal & Warrants')}
                    className="text-[#4338ca] hover:underline text-xs font-semibold"
                  >
                    Refer to DA Indictment ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Suspect Dossiers */}
      {subTab === 'suspects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUSPECT_PROFILES.map((sus) => (
            <div key={sus.id} className="p-5 rounded-xl bg-white border border-[#a89bc2] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0]">
                <div>
                  <span className="text-sm font-bold text-[#0f0d1a]">{sus.name}</span>
                  <span className="text-xs text-[#64748b] block">{sus.alias}</span>
                </div>
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] font-bold">
                  {sus.status}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-[#2c273d]">
                <div><strong className="text-[#0f0d1a]">Motive:</strong> {sus.motive}</div>
                <div><strong className="text-[#0f0d1a]">Opportunity:</strong> {sus.opportunity}</div>
                <div><strong className="text-[#0f0d1a]">Means:</strong> {sus.means}</div>
                <div className="p-2.5 rounded bg-[#f8f6fc] border border-[#e5e0f0] mt-2">
                  <strong className="text-[#0f0d1a] block mb-0.5">Alibi Claim:</strong>
                  <span className="italic text-[#4b465c]">&ldquo;{sus.alibi}&rdquo;</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e5e0f0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('Interrogation Room')}
                  className="px-3 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Interrogate Suspect ➔
                </button>
                <button
                  type="button"
                  onClick={() => navigate('Citizen Registry')}
                  className="text-xs font-semibold text-[#4338ca] hover:underline"
                >
                  View Registry Record
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 4: Incident Timeline */}
      {subTab === 'timeline' && (
        <div className="bg-white border border-[#a89bc2] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e0f0]">
            <div>
              <h4 className="text-sm font-bold text-[#0f0d1a]">Chronological Incident Master Timeline</h4>
              <p className="text-xs text-[#64748b]">
                Correlating Emergency Dispatch, Cellular Pings, CCTV Cameras, Crime Lab Intake, and Morgue Post-Mortem
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded bg-[#c1b4d9] border border-[#a89bc2] text-[#0f0d1a]">
              Incident Window: 2026-09-08
            </span>
          </div>

          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#d4ceeb]">
            {TIMELINE_EVENTS.map((event, i) => (
              <div key={i} className="relative flex items-start gap-4">
                <div className="absolute -left-[21px] mt-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#4338ca]" />
                <div className="flex-1 bg-[#f8f6fc] p-3.5 rounded-lg border border-[#e5e0f0]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#4338ca]">{event.time}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-[#4b465c] border border-[#e5e0f0]">
                      {event.category}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-[#0f0d1a]">{event.title}</h5>
                  <p className="text-xs text-[#2c273d] mt-0.5 leading-relaxed">{event.detail}</p>
                  <span className="text-[10px] text-[#64748b] block mt-1.5">
                    Source: {event.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Clue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#a89bc2] rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4 text-[#0f0d1a]">
            <h3 className="text-base font-bold text-[#0f0d1a]">Pin Custom Clue Note to Board</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="new-clue-title" className="text-xs text-[#2c273d] block mb-1 font-semibold">Clue Headline / Title:</label>
                <input
                  id="new-clue-title"
                  type="text"
                  value={newClueTitle}
                  onChange={(e) => setNewClueTitle(e.target.value)}
                  placeholder="e.g. Broken Watch Stopped at 02:18 UTC"
                  className="w-full bg-white border border-[#a89bc2] rounded p-2 text-xs text-[#0f0d1a] outline-none focus:border-[#4338ca]"
                />
              </div>

              <div>
                <label htmlFor="new-clue-type" className="text-xs text-[#2c273d] block mb-1 font-semibold">Clue Category:</label>
                <select
                  id="new-clue-type"
                  value={newClueType}
                  onChange={(e) => setNewClueType(e.target.value as ClueNode['type'])}
                  className="w-full bg-white border border-[#a89bc2] rounded p-2 text-xs text-[#0f0d1a] outline-none focus:border-[#4338ca]"
                >
                  <option value="evidence">Physical Evidence</option>
                  <option value="cyber">Digital Forensics</option>
                  <option value="suspect">Suspect Note</option>
                  <option value="cctv">Surveillance / CCTV</option>
                  <option value="morgue">Morgue / Pathology</option>
                  <option value="document">Legal Document</option>
                </select>
              </div>

              <div>
                <label htmlFor="new-clue-subtitle" className="text-xs text-[#2c273d] block mb-1 font-semibold">Deduction Notes / Observation:</label>
                <textarea
                  id="new-clue-subtitle"
                  value={newClueSubtitle}
                  onChange={(e) => setNewClueSubtitle(e.target.value)}
                  placeholder="e.g. Crystal shattered from direct impact, aligns with forced entry struggle."
                  rows={3}
                  className="w-full bg-white border border-[#a89bc2] rounded p-2 text-xs text-[#0f0d1a] outline-none focus:border-[#4338ca]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] text-xs font-semibold text-[#4b465c] rounded border border-[#e5e0f0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddClue}
                className="px-4 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] text-xs font-bold text-white rounded cursor-pointer"
              >
                Pin Clue to Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
