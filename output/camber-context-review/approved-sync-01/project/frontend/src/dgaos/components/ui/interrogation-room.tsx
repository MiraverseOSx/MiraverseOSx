'use client';
import { useState } from 'react';
import {
  UserCheck,
  Activity,
  FileCheck2,
  FolderKanban,
  Scale,
  ShieldAlert,
  Users,
} from 'lucide-react';
import InvestigationBreadcrumbs from '@/components/ui/investigation-breadcrumbs';

interface InterrogationRoomProps {
  navigate: (view: string) => void;
}

interface SuspectProfile {
  id: string;
  name: string;
  alias: string;
  role: string;
  initialHeartRate: number;
  initialStress: number;
  demeanor: 'Calm / Guarded' | 'Aggitated' | 'Cornered' | 'Confessing';
  alibiClaim: string;
  criticalContradiction: {
    clueId: string;
    clueName: string;
    breakthroughStatement: string;
    confessionSummary: string;
  };
}

const SUSPECTS: SuspectProfile[] = [
  {
    id: 'SUS-01',
    name: 'Dr. Julian Paul Vance',
    alias: '"Ghost_404" / "Julian K."',
    role: 'Former Conservatory Lead Botanist · Terminated Aug 2026',
    initialHeartRate: 78,
    initialStress: 22,
    demeanor: 'Calm / Guarded',
    alibiClaim:
      'I was in bed asleep at my Dupont Circle apartment from 11 PM to 7 AM. My personal phone was charging on my nightstand. You detectives are wasting your time holding me here.',
    criticalContradiction: {
      clueId: 'EV-0002',
      clueName: 'EV-0002 (Navy Fleece Fiber) + ART-001 (Burner SMS)',
      breakthroughStatement:
        'Wait... how did you get that SMS? I threw the burner phone into the storm drain... And that fleece... Dammit. Okay, look! I was there! Thorne caught me by specimen shelf B-12 at 01:50. We fought, he scratched me, and the vial shattered. I panicked and ran for my car at 02:14!',
      confessionSummary:
        'Subject admitted forcing perimeter window entry at 01:48 UTC. Confirmed physical altercation with Dr. Thorne at 01:52 UTC causing watch impact stoppage, lethal Coniine contamination, and vehicle getaway past perimeter at 02:14 UTC.',
    },
  },
  {
    id: 'SUS-02',
    name: 'Elena Rostova',
    alias: '"Botanist_E"',
    role: 'High-Risk Antiquities & Rare Specimen Broker · Interpol Blue Notice',
    initialHeartRate: 72,
    initialStress: 15,
    demeanor: 'Calm / Guarded',
    alibiClaim:
      'I was checking in at Dulles International Airport for Swiss Air flight LX-041 at 01:15 UTC. My passport and boarding pass are completely verified by Customs and Border Protection.',
    criticalContradiction: {
      clueId: 'WAR-2026-0882',
      clueName: 'WAR-2026-0882 (§ 2703(d) Wire Transfer Return)',
      breakthroughStatement:
        'Fine, I arranged the buyer in Zurich. But check the timestamps! I was at the departure gate when the physical break-in happened. I never set foot on that gravel road!',
      confessionSummary:
        'Subject confirmed brokering the black-market acquisition of the patented genetic cultivar, but physical presence at the scene was excluded by Dulles airport biometric records.',
    },
  },
  {
    id: 'SUS-03',
    name: 'Marcus "Glitch" Chen',
    alias: '"GHOST-404"',
    role: 'Firmware Security Researcher · Cloned AP Operator',
    initialHeartRate: 85,
    initialStress: 35,
    demeanor: 'Calm / Guarded',
    alibiClaim:
      'I run ethical security audits on public Wi-Fi. If my cloned rogue access point captured intranet traffic, that was strictly incidental automated packet scraping!',
    criticalContradiction: {
      clueId: 'ART-004',
      clueName: 'ART-004 (PCAP Rogue AP Credential Dump)',
      breakthroughStatement:
        'Whoa, you found the harvested LDAP credentials? Look, I sold the access token for 0.4 BTC on Telegram to an anonymous buyer. I didn\'t know they were going to physical break glass!',
      confessionSummary:
        'Subject confirmed deploying a malicious rogue AP to harvest conservatory security guard network credentials, subsequently selling the bypass token to Julian Vance.',
    },
  },
];

const AVAILABLE_EVIDENCE = [
  {
    id: 'EV-0002',
    name: 'Item EV-0002: Navy Fleece Acrylic Fiber',
    detail: 'Physical trace fiber recovered from broken glass. Identical to Vance\'s navy pullover.',
  },
  {
    id: 'ART-001',
    name: 'Digital Artifact ART-001: Intercepted Burner SMS',
    detail: '"Perimeter breach point ready at east wing. Ingress to vault corridor now." Sent at 01:45 UTC from the Sector 2 tower.',
  },
  {
    id: 'CCTV-03',
    name: 'Perimeter CCTV Camera #03 Footage',
    detail: 'Black Audi A4 (Lic #7XYZ99) enters at 01:40 UTC and leaves at 02:14 UTC with headlights extinguished.',
  },
  {
    id: 'WAR-2026-0882',
    name: 'Warrant 2703(d) Banking Return',
    detail: 'Wire transfer authorization connecting offshore escrow to rare cultivar buyer.',
  },
];

export default function InterrogationRoom({ navigate }: InterrogationRoomProps) {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('SUS-01');
  const [presentedClue, setPresentedClue] = useState<string>('');
  const [isBroken, setIsBroken] = useState<boolean>(false);
  const [confessionSigned, setConfessionSigned] = useState<boolean>(false);
  const [interrogationTranscript, setInterrogationTranscript] = useState<Array<{ speaker: string; text: string }>>([
    {
      speaker: 'Lead Examiner',
      text: 'You\'re currently being questioned in connection with the burglary and homicide at the Conservatory on the night of September 8th.',
    },
  ]);

  const activeSuspect = SUSPECTS.find((s) => s.id === selectedSuspectId) || SUSPECTS[0];

  const currentHeartRate = isBroken ? 134 : activeSuspect.initialHeartRate;
  const currentStress = isBroken ? 96 : activeSuspect.initialStress;
  const currentDemeanor = isBroken ? 'Cornered & Confessing' : activeSuspect.demeanor;

  function handleSelectSuspect(id: string) {
    setSelectedSuspectId(id);
    setIsBroken(false);
    setConfessionSigned(false);
    setPresentedClue('');
    setInterrogationTranscript([
      {
        speaker: 'Lead Examiner',
        text: 'State your name and address for the record.',
      },
      {
        speaker: SUSPECTS.find((s) => s.id === id)?.name || '',
        text: SUSPECTS.find((s) => s.id === id)?.alibiClaim || '',
      },
    ]);
  }

  function handlePresentEvidence() {
    if (!presentedClue) return;

    const matchedClue = AVAILABLE_EVIDENCE.find((e) => e.id === presentedClue);
    if (!matchedClue) return;

    // Check if this evidence triggers the breakthrough
    const isContradiction =
      (activeSuspect.id === 'SUS-01' && (presentedClue === 'EV-0002' || presentedClue === 'ART-001' || presentedClue === 'CCTV-03')) ||
      (activeSuspect.id === 'SUS-02' && presentedClue === 'WAR-2026-0882') ||
      (activeSuspect.id === 'SUS-03' && presentedClue === 'ART-001');

    const updated = [
      ...interrogationTranscript,
      {
        speaker: 'Lead Examiner',
        text: `You claim you were elsewhere. Then explain how ${matchedClue.name} exists: "${matchedClue.detail}"!`,
      },
    ];

    if (isContradiction) {
      setIsBroken(true);
      updated.push({
        speaker: activeSuspect.name,
        text: activeSuspect.criticalContradiction.breakthroughStatement,
      });
    } else {
      updated.push({
        speaker: activeSuspect.name,
        text: 'That proves nothing! Anyone could have been carrying that. You have no direct link to me.',
      });
    }

    setInterrogationTranscript(updated);
  }

  function handleSignConfession() {
    setConfessionSigned(true);
    setInterrogationTranscript((prev) => [
      ...prev,
      {
        speaker: 'Court Stenographer',
        text: 'Formal Interrogation Transcript Form INT-402 signed and notarized by suspect with legal counsel present.',
      },
    ]);
  }

  return (
    <div className="interrogation-room-page space-y-6">
      <InvestigationBreadcrumbs currentView="Interrogation Room" navigate={navigate} />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#4338ca] uppercase tracking-wider mb-1">
            <UserCheck size={14} className="text-[#4338ca]" />
            <span>SPECIAL INVESTIGATION UNIT · INTERVIEW CHAMBER 2B</span>
          </div>
          <h1 className="text-[18px] font-bold text-[#0f0d1a] tracking-tight flex items-center gap-3">
            Suspect Interrogation &amp; Alibi Verification
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-100 border border-rose-300 text-rose-800">
              FORMAL RECORDING ACTIVE
            </span>
          </h1>
          <p className="text-[11px] text-[#2c273d] mt-1">
            Custodial Examination under Legal Rights · Case Ref: <span className="font-mono font-semibold text-[#0f0d1a]">CASE-2026-0042</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('Citizen Registry')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-xs font-semibold text-[#0f0d1a] transition-colors cursor-pointer"
          >
            <Users size={13} className="text-[#4338ca]" />
            <span>Citizen Dossier</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('Legal & Warrants')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Scale size={13} />
            <span>Transmit to Grand Jury</span>
          </button>
        </div>
      </div>

      {/* Suspect Roster Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SUSPECTS.map((suspect) => {
          const isSelected = suspect.id === selectedSuspectId;
          return (
            <button
              key={suspect.id}
              type="button"
              onClick={() => handleSelectSuspect(suspect.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#fcfaff] border-2 border-[#4338ca] shadow-sm ring-1 ring-[#4338ca]/20'
                  : 'bg-white hover:bg-[#fbf9fe] border-[#d4ceeb]'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#4338ca] font-mono font-bold">{suspect.id}</span>
                <span className="text-xs text-[#4b465c] font-medium">{suspect.alias}</span>
              </div>
              <div className="text-sm font-bold text-[#0f0d1a] truncate mb-1">{suspect.name}</div>
              <div className="text-xs text-[#4b465c] line-clamp-2 leading-relaxed">{suspect.role}</div>
            </button>
          );
        })}
      </div>

      {/* Main Interrogation Station Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Suspect Biometrics & Confrontation Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Biometric Telemetry Box */}
          <div className="bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e0f0]">
              <span className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider">
                Physiological Stress Readings
              </span>
              <Activity size={14} className={isBroken ? 'text-rose-600' : 'text-[#4338ca]'} />
            </div>

            {/* Heart Rate Indicator */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#4b465c] font-semibold">PULSE RATE:</span>
                <span className={`font-bold ${isBroken ? 'text-rose-700 text-sm' : 'text-[#0f0d1a]'}`}>
                  {currentHeartRate} BPM
                </span>
              </div>
              <div className="w-full bg-[#f1edf7] h-2 rounded-full overflow-hidden border border-[#d4ceeb]">
                <div
                  className={`h-full transition-all duration-500 ${
                    isBroken ? 'bg-rose-600' : 'bg-[#4338ca]'
                  }`}
                  style={{ width: `${Math.min((currentHeartRate / 150) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Stress / Deception Meter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#4b465c] font-semibold">STRESS LEVEL:</span>
                <span className={`font-bold ${isBroken ? 'text-rose-700' : 'text-[#0f0d1a]'}`}>
                  {currentStress}% {isBroken ? '(CRITICAL SPIKE)' : '(STABLE)'}
                </span>
              </div>
              <div className="w-full bg-[#f1edf7] h-2 rounded-full overflow-hidden border border-[#d4ceeb]">
                <div
                  className={`h-full transition-all duration-500 ${
                    isBroken ? 'bg-rose-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${currentStress}%` }}
                />
              </div>
            </div>

            {/* Demeanor Pill */}
            <div className="p-3 rounded-lg bg-[#f8f6fc] border border-[#e5e0f0] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4b465c]">Demeanor:</span>
              <span className="text-xs font-bold text-[#0f0d1a]">{currentDemeanor}</span>
            </div>

            {/* Stated Alibi Summary */}
            <div className="p-3 rounded-lg bg-[#f8f6fc] border border-[#e5e0f0]">
              <div className="text-xs font-bold text-[#4338ca] uppercase mb-1">Stated Alibi:</div>
              <p className="text-xs text-[#2c273d] italic leading-relaxed">&ldquo;{activeSuspect.alibiClaim}&rdquo;</p>
            </div>
          </div>

          {/* Evidence Confrontation Tool */}
          <div className="bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e0f0]">
              <span className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider">
                Present Contradictory Evidence
              </span>
              <ShieldAlert size={14} className="text-amber-600" />
            </div>

            <p className="text-xs text-[#2c273d] leading-relaxed">
              Select an item recovered from the crime scene or laboratory examination to confront the suspect:
            </p>

            <select
              value={presentedClue}
              onChange={(e) => setPresentedClue(e.target.value)}
              className="w-full bg-[#f8f6fc] border border-[#d4ceeb] text-[#0f0d1a] text-xs font-medium rounded-lg p-2.5 outline-none focus:border-[#4338ca]"
            >
              <option value="">-- Choose Evidence Item --</option>
              {AVAILABLE_EVIDENCE.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!presentedClue}
              onClick={handlePresentEvidence}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-[#0f0d1a] shadow-xs transition-colors cursor-pointer border border-amber-500"
            >
              Confront Suspect with Evidence
            </button>
          </div>
        </div>

        {/* Right 8 Cols: Live Dialogue Transcript & Signed Confession Statement */}
        <div className="lg:col-span-8 bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e5e0f0]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span className="text-sm font-bold text-[#0f0d1a] uppercase tracking-wide">
                  Formal Interview Transcript · Room 2B
                </span>
              </div>
              <span className="text-xs font-semibold text-[#0f0d1a] bg-[#f8f6fc] px-2.5 py-1 rounded border border-[#d4ceeb]">
                SUBJECT: {activeSuspect.name}
              </span>
            </div>

            {/* Transcript Flow Box */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 scrollbar-none">
              {interrogationTranscript.map((entry, idx) => {
                const isExaminer = entry.speaker === 'Lead Examiner';
                const isSteno = entry.speaker === 'Court Stenographer';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                      isSteno
                        ? 'bg-[#f1edf7] border border-[#d4ceeb] text-[#2c273d] italic text-center'
                        : isExaminer
                        ? 'bg-[#f8f6fc] border border-[#e5e0f0] text-[#0f0d1a] ml-6'
                        : 'bg-amber-50 border border-amber-300 text-amber-950 mr-6 font-medium'
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wide mb-1 text-[#4338ca]">
                      {entry.speaker}:
                    </div>
                    <div>{entry.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Confession Unlock Panel */}
          <div className="mt-6 pt-4 border-t border-[#e5e0f0]">
            {isBroken ? (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl shadow-sm text-emerald-950">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <FileCheck2 size={16} className="text-emerald-700" />
                    <span>CONTRADICTION ESTABLISHED: ADMISSION OF PRESENCE</span>
                  </div>
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-400">
                    {confessionSigned ? 'AFFIDAVIT SIGNED' : 'AWAITING SIGNATURE'}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed mb-3">
                  {activeSuspect.criticalContradiction.confessionSummary}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {!confessionSigned ? (
                    <button
                      type="button"
                      onClick={handleSignConfession}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 rounded-lg text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
                    >
                      <FileCheck2 size={14} />
                      <span>Notarize &amp; Sign Formal Confession</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('Legal & Warrants')}
                      className="flex items-center gap-2 px-4 py-2 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
                    >
                      <Scale size={14} />
                      <span>Transmit Confession to District Attorney</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate('Detective Desk')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-xs font-semibold text-[#0f0d1a] transition-colors cursor-pointer"
                  >
                    <FolderKanban size={13} className="text-[#4338ca]" />
                    <span>Pin Admission to Corkboard</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-[#4b465c] px-2">
                <span>Suspect maintains alibi. Present contradictory physical or forensic evidence to establish timeline.</span>
                <span className="text-rose-700 font-bold">Room 2B: IN SESSION</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
