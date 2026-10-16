'use client';

import React, { useState } from 'react';
import {
  FolderLock,
  Video,
  Fingerprint,
  Dna,
  Scale,
  Shield,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  FileCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useMemo } from 'react';
import {
  INITIAL_EVIDENCE_VAULT,
  INITIAL_CCTV_CAMERAS,
  INITIAL_AFIS_RECORD,
  INITIAL_CODIS_PROFILE,
  INITIAL_SEARCH_WARRANT,
  EvidenceVaultItem,
  CctvCameraFeed
} from '@/lib/investigation-data';
import { getDGAState, inspectEvidence } from '@/lib/dga-store';

interface DgaInvestigationHubProps {
  onOpenCase?: (caseId: string) => void;
  onLaunchTrace?: () => void;
}

export function DgaInvestigationHub({ onOpenCase, onLaunchTrace }: DgaInvestigationHubProps) {
  const [activeSection, setActiveSection] = useState<'evidence' | 'cctv' | 'afis' | 'dna' | 'warrants'>('evidence');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-03');
  const [cctvScrubTime, setCctvScrubTime] = useState<number>(45); // percent
  const [plateEnhanced, setPlateEnhanced] = useState(false);

  const dgaState = getDGAState();
  const activeCase = dgaState.cases.find((c) => c.status === 'Active' || (c.status as string) === 'ACTIVE');

  const evidenceList: EvidenceVaultItem[] = useMemo(() => {
    if (!activeCase || !activeCase.evidence || activeCase.evidence.length === 0) {
      return [];
    }
    return activeCase.evidence.map((ev, idx) => ({
      id: ev.id,
      barcode: `DGA-BAR-${ev.id}`,
      title: ev.title,
      category: (ev.category === 'Toxicological Specimen' ? 'Biological / Toxin' :
                 ev.category === 'Digital Media' ? 'Digital Media' :
                 ev.category === 'Ballistics' ? 'Ballistics' : 'Physical Item') as any,
      dateSecured: ev.dateRecovered || '2026-10-06',
      securedBy: activeCase.primaryInvestigator || 'Lead Investigator',
      storageLocation: `Vault B - Locker 0${idx + 1}`,
      sealStatus: 'Seals Intact' as const,
      custodyHistory: [
        {
          timestamp: ev.dateRecovered || '2026-10-06 09:30',
          action: 'Initial Intake & Custody Logging',
          handledBy: activeCase.primaryInvestigator || 'Evidence Custodian',
          verifiedSignature: '/s/ Custody Intake Verified'
        }
      ],
      analysisResults: ev.description,
      caseId: activeCase.id
    }));
  }, [activeCase]);

  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  const selectedEvidence = evidenceList.find((e) => e.id === selectedEvidenceId) || evidenceList[0] || null;
  const activeCamera = INITIAL_CCTV_CAMERAS.find((c) => c.id === selectedCameraId) || INITIAL_CCTV_CAMERAS[2];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0eff5] text-[#1f1e30] overflow-hidden select-none font-sans">
      {/* 1. TOP INVESTIGATION HEADER */}
      <div className="h-12 bg-white border-b border-[#cfcddb] px-4 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-[#edeaf6] border border-[#cfcddb] flex items-center justify-center text-[#4b4372]">
            <FolderLock className="w-4 h-4 text-[#4b4372]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#1f1e30] tracking-wide">
                MAJOR INVESTIGATIONS BRANCH // EVIDENCE VAULT & FORENSIC SUITE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#edeaf6] text-[#4b4372] border border-[#cfcddb] font-semibold">
                {activeCase ? `DOCKET ${activeCase.id}` : 'STANDBY // NO ACTIVE CASE'}
              </span>
            </div>
            <div className="text-[11px] text-[#5e5c7a]">
              Physical Chain of Custody • CCTV Surveillance Video Review • AFIS & CODIS Serology
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-[#eae8f2] p-1 rounded border border-[#cfcddb]">
          {[
            { id: 'evidence', label: 'Evidence Locker', icon: FolderLock },
            { id: 'cctv', label: 'CCTV Video Feeds', icon: Video },
            { id: 'afis', label: 'AFIS Fingerprints', icon: Fingerprint },
            { id: 'dna', label: 'DNA / Serology', icon: Dna },
            { id: 'warrants', label: 'Search Warrants', icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1f1e30] shadow-2xs font-bold border border-[#cfcddb]'
                    : 'text-[#5e5c7a] hover:text-[#1f1e30] hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN SECTION CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 max-w-6xl mx-auto w-full">
        {/* SECTION: EVIDENCE LOCKER & CHAIN OF CUSTODY */}
        {activeSection === 'evidence' && (
          evidenceList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#cfcddb] rounded text-center text-[#7e7c99]">
              <FolderLock className="w-10 h-10 text-[#b3b0cb] mb-3 opacity-60" />
              <span className="text-sm font-bold text-[#35334e]">Evidence Vault</span>
              <span className="text-xs text-[#787693] mt-1">No evidence has been logged.</span>
            </div>
          ) : selectedEvidence ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* List of Evidence */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#5e5c7a] mb-1">
                  SECURED PHYSICAL & DIGITAL ITEMS
                </div>
                {evidenceList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedEvidenceId(item.id);
                      if (activeCase) {
                        void inspectEvidence(activeCase.id, item.id);
                      }
                    }}
                    className={`w-full text-left p-3 rounded border transition-all cursor-pointer ${
                      selectedEvidence.id === item.id
                        ? 'bg-[#edeaf6] border-[#4b4372] text-[#1f1e30] shadow-2xs font-semibold'
                        : 'bg-white border-[#cfcddb] text-[#3d3b54] hover:bg-[#f8f7fc]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1f1e30]">{item.id}</span>
                      <span className="text-[10px] font-mono text-[#4b4372]">{item.barcode}</span>
                    </div>
                    <div className="text-xs font-medium text-[#2c2a3e] mt-1">{item.title}</div>
                    <div className="text-[10px] text-[#5e5c7a] mt-1">{item.category}</div>
                    <div className="text-[9.5px] font-semibold text-emerald-700 mt-1">
                      Seal: {item.sealStatus}
                    </div>
                  </button>
                ))}
              </div>

              {/* Detailed Custody Dossier */}
              <div className="md:col-span-2 bg-white border border-[#cfcddb] rounded p-4 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#cfcddb]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1f1e30]">{selectedEvidence.title}</h3>
                    <div className="text-xs text-[#4b4372] font-mono mt-0.5">
                      BARCODE: {selectedEvidence.barcode} • {selectedEvidence.category}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                    {selectedEvidence.sealStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-[#f8f7fc] p-3 rounded border border-[#cfcddb]">
                  <div>
                    <span className="text-[#5e5c7a] block text-[10px] uppercase font-bold">Secured Date</span>
                    <span className="font-mono text-[#1f1e30] font-semibold">{selectedEvidence.dateSecured}</span>
                  </div>
                  <div>
                    <span className="text-[#5e5c7a] block text-[10px] uppercase font-bold">Securing Examiner</span>
                    <span className="text-[#1f1e30] font-semibold">{selectedEvidence.securedBy}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#5e5c7a] block text-[10px] uppercase font-bold">Storage Vault Locker</span>
                    <span className="text-[#4b4372] font-semibold">{selectedEvidence.storageLocation}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#4b4372]">
                    FORENSIC BENCH ANALYSIS SUMMARY
                  </div>
                  <div className="text-xs text-[#2c2a3e] bg-[#f8f7fc] p-2.5 rounded border border-[#cfcddb] leading-relaxed">
                    {selectedEvidence.analysisResults || 'Analysis pending formal laboratory bench intake.'}
                  </div>
                </div>

                {/* Chain of Custody Audit Log */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#5e5c7a]">
                    FORMAL CHAIN OF CUSTODY SIGN-OFF
                  </div>
                  <div className="space-y-1.5">
                    {selectedEvidence.custodyHistory.map((hist, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#f8f7fc] p-2 rounded border border-[#cfcddb] text-xs">
                        <div>
                          <span className="font-bold text-[#1f1e30] block">{hist.action}</span>
                          <span className="text-[11px] text-[#5e5c7a]">{hist.handledBy}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-[#4b4372] block">{hist.timestamp}</span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">{hist.verifiedSignature}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null
        )}

        {/* SECTION: CCTV VIDEO FEEDS */}
        {activeSection === 'cctv' && (
          !activeCase ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#cfcddb] rounded text-center text-[#7e7c99]">
              <Video className="w-10 h-10 text-[#b3b0cb] mb-3 opacity-60" />
              <span className="text-sm font-bold text-[#35334e]">CCTV Video Feeds</span>
              <span className="text-xs text-[#787693] mt-1">No active feeds. Surveillance buffers will link when a case is accepted.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera Selectors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {INITIAL_CCTV_CAMERAS.map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setSelectedCameraId(cam.id);
                      setPlateEnhanced(false);
                    }}
                    className={`p-2.5 rounded text-left border transition-all cursor-pointer ${
                      activeCamera.id === cam.id
                        ? 'bg-[#edeaf6] border-[#4b4372] text-[#1f1e30] shadow-2xs font-semibold'
                        : 'bg-white border-[#cfcddb] text-[#3d3b54] hover:bg-[#f8f7fc]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{cam.cameraName.split(':')[0]}</span>
                      {cam.anomalyDetected && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>
                    <div className="text-[10px] text-[#5e5c7a] truncate mt-1">{cam.location}</div>
                    <div className="text-[9.5px] font-mono text-[#4b4372] mt-1 font-semibold">{cam.status}</div>
                  </button>
                ))}
              </div>

              {/* Simulated Tactical Video Monitor */}
              <div className="bg-[#0a0a10] border border-[#3e3c54] rounded-lg overflow-hidden shadow-2xs">
                <div className="h-72 bg-[#06050b] relative flex items-center justify-center overflow-hidden">
                  {/* Visual frame background */}
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full border border-dashed border-[#4b4372]/60 flex items-center justify-center text-purple-300">
                      <Video className="w-8 h-8" />
                    </div>
                    <div className="text-xs font-mono font-bold text-white">
                      {activeCamera.cameraName} • REC: {activeCamera.currentTimestamp}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      STREAM CODEC: H.265 / {activeCamera.resolution} • MOTION WATCHDOG ACTIVE
                    </div>
                  </div>

                  {/* Tactical HUD Overlay Elements */}
                  <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE SURVEILLANCE BUFFER</span>
                  </div>

                  {/* License plate enhancement box if anomaly present */}
                  {activeCamera.enhancedPlate && (
                    <div className="absolute bottom-6 right-6 bg-slate-900/95 border-2 border-purple-400 p-3 rounded shadow-2xl text-center space-y-1">
                      <div className="text-[9px] font-mono font-bold uppercase text-purple-300">
                        ALPR OCR LICENSE PLATE EXTRACTION
                      </div>
                      <div className="text-xl font-mono font-bold text-white tracking-widest bg-black px-3 py-1 rounded border border-purple-500">
                        {plateEnhanced ? '7XYZ89 [CONFIRMED]' : '7XYZ8? [BUFFERING]'}
                      </div>
                      <div className="text-[9px] text-emerald-400 font-bold">
                        Match: Apex Marine Freight / Phoenix Biotech
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Timeline Scrubber */}
                <div className="p-3 bg-white border-t border-[#cfcddb] flex items-center gap-4">
                  <span className="text-xs font-mono text-[#5e5c7a]">00:00</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cctvScrubTime}
                    onChange={(e) => setCctvScrubTime(Number(e.target.value))}
                    className="flex-1 accent-[#4b4372] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[#4b4372] font-semibold">{activeCamera.videoDuration}</span>

                  {activeCamera.enhancedPlate && (
                    <button
                      onClick={() => setPlateEnhanced(true)}
                      className="px-3 py-1 bg-[#4b4372] hover:bg-[#3d365d] text-white rounded text-xs font-bold transition-colors cursor-pointer"
                    >
                      ENHANCE PLATE
                    </button>
                  )}
                </div>
              </div>

              {/* Anomaly Brief */}
              <div className="bg-white border border-[#cfcddb] rounded p-3 text-xs leading-relaxed shadow-2xs">
                <span className="font-bold text-[#4b4372] block mb-1">
                  EXAMINER SURVEILLANCE FINDINGS:
                </span>
                <p className="text-[#2c2a3e]">{activeCamera.anomalyDescription}</p>
              </div>
            </div>
          )
        )}

        {/* SECTION: AFIS FINGERPRINTS */}
        {activeSection === 'afis' && (
          !activeCase ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#cfcddb] rounded text-center text-[#7e7c99]">
              <Fingerprint className="w-10 h-10 text-[#b3b0cb] mb-3 opacity-60" />
              <span className="text-sm font-bold text-[#35334e]">AFIS Fingerprint Registry</span>
              <span className="text-xs text-[#787693] mt-1">No active specimens submitted for biometric comparison.</span>
            </div>
          ) : (
            <div className="bg-white border border-[#cfcddb] rounded p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#cfcddb]">
                <div>
                  <h3 className="text-sm font-bold text-[#1f1e30]">{INITIAL_AFIS_RECORD.specimenLabel}</h3>
                  <div className="text-xs text-[#4b4372] font-mono">
                    LIFTED FROM: {INITIAL_AFIS_RECORD.sourceItem} • PATTERN: {INITIAL_AFIS_RECORD.patternType}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  18 MINUTIAE IDENTIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Split-pane fingerprint visualizer */}
                <div className="h-64 bg-[#0a0a10] border border-[#3e3c54] rounded flex items-center justify-center text-center p-4 shadow-inner">
                  <div className="space-y-2">
                    <Fingerprint className="w-20 h-20 mx-auto text-purple-400 animate-pulse" />
                    <div className="text-xs font-mono text-purple-200 font-bold">
                      LATENT LIFT #LP-04 vs NCIC REFERENCE KRELL
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ridge Bifurcations: 11 • Ridge Endings: 7 • Core Deltas: 2
                    </div>
                  </div>
                </div>

                {/* Match Candidates Table */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#5e5c7a]">
                    NCIC AFIS CANDIDATE MATCH SCORING
                  </div>
                  {INITIAL_AFIS_RECORD.candidateMatches.map((cand, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded border text-xs flex items-center justify-between transition-colors ${
                        cand.conclusion === 'MATCH CONFIRMED'
                          ? 'bg-emerald-50/70 border-emerald-300 text-[#1f1e30]'
                          : 'bg-[#f8f7fc] border-[#cfcddb] text-[#5e5c7a]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-[#1f1e30] block">{cand.candidateName}</span>
                        <span className="text-[10px] font-mono text-[#5e5c7a]">{cand.ncicId}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-[#4b4372] block">{cand.score}%</span>
                        <span className={`text-[10px] font-bold uppercase ${
                          cand.conclusion === 'MATCH CONFIRMED' ? 'text-emerald-700 font-bold' : 'text-slate-500'
                        }`}>
                          {cand.conclusion}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {/* SECTION: DNA / SEROLOGY */}
        {activeSection === 'dna' && (
          !activeCase ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#cfcddb] rounded text-center text-[#7e7c99]">
              <Dna className="w-10 h-10 text-[#b3b0cb] mb-3 opacity-60" />
              <span className="text-sm font-bold text-[#35334e]">CODIS Serology Database</span>
              <span className="text-xs text-[#787693] mt-1">No genetic profiles awaiting analysis.</span>
            </div>
          ) : (
            <div className="bg-white border border-[#cfcddb] rounded p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#cfcddb]">
                <div>
                  <h3 className="text-sm font-bold text-[#1f1e30]">{INITIAL_CODIS_PROFILE.specimenLabel}</h3>
                  <div className="text-xs text-[#4b4372] font-mono">
                    MATCH: {INITIAL_CODIS_PROFILE.suspectMatchName} • RANDOM MATCH PROBABILITY: {INITIAL_CODIS_PROFILE.randomMatchProbability}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  13-LOCUS CODIS PROFILE VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {INITIAL_CODIS_PROFILE.loci.map((locus, i) => (
                  <div key={i} className="bg-[#f8f7fc] border border-[#cfcddb] p-2.5 rounded text-center space-y-1">
                    <span className="text-[10px] font-mono text-[#4b4372] font-bold block">{locus.locusName}</span>
                    <span className="text-sm font-mono font-bold text-[#1f1e30]">
                      {locus.allele1} / {locus.allele2}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 block">MATCH 100%</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* SECTION: SEARCH WARRANTS */}
        {activeSection === 'warrants' && (
          !activeCase ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#cfcddb] rounded text-center text-[#7e7c99]">
              <Scale className="w-10 h-10 text-[#b3b0cb] mb-3 opacity-60" />
              <span className="text-sm font-bold text-[#35334e]">Search Warrants</span>
              <span className="text-xs text-[#787693] mt-1">No judicial warrants drafted or pending review.</span>
            </div>
          ) : (
            <div className="bg-white border border-[#cfcddb] rounded p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#cfcddb]">
                <div>
                  <h3 className="text-sm font-bold text-[#1f1e30]">FOURTH AMENDMENT SEARCH WARRANT APPLICATION</h3>
                  <div className="text-xs text-[#4b4372] font-mono">
                    WARRANT ID: {INITIAL_SEARCH_WARRANT.id} • JUDGE: {INITIAL_SEARCH_WARRANT.magistrateJudge}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  {INITIAL_SEARCH_WARRANT.judicialReviewStatus}
                </span>
              </div>

              <div className="bg-[#f8f7fc] p-3 rounded border border-[#cfcddb] space-y-2 text-xs">
                <div>
                  <span className="text-[#5e5c7a] text-[10px] uppercase font-bold block">TARGET LOCATION</span>
                  <span className="font-bold text-[#1f1e30]">{INITIAL_SEARCH_WARRANT.targetLocation}</span>
                </div>
                <div>
                  <span className="text-[#5e5c7a] text-[10px] uppercase font-bold block">TARGETED SUBJECT</span>
                  <span className="font-bold text-[#4b4372]">{INITIAL_SEARCH_WARRANT.targetPerson}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#4b4372]">
                  SWORN PROBABLE CAUSE AFFIDAVIT
                </div>
                <p className="text-xs text-[#2c2a3e] leading-relaxed bg-[#f8f7fc] p-3 rounded border border-[#cfcddb]">
                  {INITIAL_SEARCH_WARRANT.probableCauseSummary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
