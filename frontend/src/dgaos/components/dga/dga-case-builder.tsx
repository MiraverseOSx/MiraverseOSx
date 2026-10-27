'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Target,
  Users,
  Beaker,
  History,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Lock,
  ChevronRight,
  Clock,
  MapPin,
  Fingerprint,
  FileCheck2,
  Crosshair,
  BadgeAlert,
  Send,
  Save,
  Check,
  Sliders,
  Layers,
  ArrowRight,
  PenTool,
  BookOpen,
  Gauge,
  Activity,
  Car,
  Wrench
} from 'lucide-react';
import {
  DGACase,
  CaseCauseHypothesis,
  SuspectInvestigationProfile,
  EvidenceItem,
  TimelineEvent
} from '@/lib/dga-types';
import {
  updateDGACaseCauseHypothesis,
  addOrUpdateDGASuspectProfile,
  addDGACaseEvidence,
  updateDGACaseEvidenceItem,
  deleteDGACaseEvidenceItem,
  deleteDGACaseSuspectProfile,
  addDGACaseTimelineEvent,
  deleteDGACaseTimelineEvent,
  submitDGACaseIndictment
} from '@/lib/dga-store';

interface DgaCaseBuilderProps {
  caseData: DGACase;
  onSelectCase?: (caseId: string) => void;
  onOpenTraceWithCase?: (traceCaseId: string) => void;
}

export function DgaCaseBuilder({ caseData, onOpenTraceWithCase }: DgaCaseBuilderProps) {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'binder' | 'tabs'>('binder');
  const [activeTab, setActiveTab] = useState<'cause' | 'suspects' | 'evidence' | 'timeline' | 'indictment'>('cause');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Section Refs for Binder Smooth Scroll
  const causeRef = useRef<HTMLDivElement>(null);
  const suspectsRef = useRef<HTMLDivElement>(null);
  const evidenceRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const indictmentRef = useRef<HTMLDivElement>(null);

  // 1. CAUSE & HYPOTHESIS STATE
  const initialHypothesis: CaseCauseHypothesis = caseData.causeHypothesis || {
    primaryCause: '',
    causeConfidence: 25,
    causeFindings: '',
    weaponOrVector: '',
    motive: '',
    primeSuspectName: '',
    incidentLocation: '',
    incidentTimeWindow: '',
    modusOperandi: '',
    formalCharge: '',
    investigatorNotes: '',
    indictmentStatus: 'Drafting'
  };

  const [primaryCause, setPrimaryCause] = useState(initialHypothesis.primaryCause || '');
  const [confidence, setConfidence] = useState(initialHypothesis.causeConfidence ?? 25);
  const [causeFindings, setCauseFindings] = useState(initialHypothesis.causeFindings || '');
  const [weaponOrVector, setWeaponOrVector] = useState(initialHypothesis.weaponOrVector || '');
  const [motive, setMotive] = useState(initialHypothesis.motive || '');
  const [primeSuspectName, setPrimeSuspectName] = useState(initialHypothesis.primeSuspectName || '');
  const [incidentLocation, setIncidentLocation] = useState(initialHypothesis.incidentLocation || '');
  const [incidentTimeWindow, setIncidentTimeWindow] = useState(initialHypothesis.incidentTimeWindow || '');
  const [modusOperandi, setModusOperandi] = useState(initialHypothesis.modusOperandi || '');
  const [formalCharge, setFormalCharge] = useState(initialHypothesis.formalCharge || '');
  const [investigatorNotes, setInvestigatorNotes] = useState(initialHypothesis.investigatorNotes || '');

  // 2. SUSPECTS STATE
  const initialSuspects: SuspectInvestigationProfile[] =
    caseData.suspectProfiles && caseData.suspectProfiles.length > 0
      ? caseData.suspectProfiles
      : caseData.people.map((p) => ({
          id: p.personId,
          name: p.name,
          role: p.role,
          affiliation: p.affiliation,
          meansNotes: '',
          motiveNotes: p.notes || '',
          opportunityNotes: '',
          alibiStatus: 'Unverified',
          redFlags: '',
          verdict: p.threatLevel === 'High' ? 'Prime Suspect' : 'Person of Interest',
          linkedEvidenceIds: []
        }));

  const [suspectsList, setSuspectsList] = useState<SuspectInvestigationProfile[]>(initialSuspects);

  // 3. EVIDENCE STATE
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(caseData.evidence || []);

  // 4. TIMELINE STATE
  const [timelineList, setTimelineList] = useState<TimelineEvent[]>(caseData.timeline || []);

  // 5. INDICTMENT SIGNATURE
  const [agentSignature, setAgentSignature] = useState('Special Agent Miracle Jerome [HQ-04]');

  // 6. VEHICULAR & MOTORCYCLE CRASH RECONSTRUCTION STATE
  const [vehicleType, setVehicleType] = useState('Sport Motorcycle (Superbike)');
  const [vehicleModel, setVehicleModel] = useState(caseData.id === 'INV-26-402' ? '2025 Vortex R-1000 Superbike' : '');
  const [preImpactSpeed, setPreImpactSpeed] = useState(caseData.id === 'INV-26-402' ? '94 MPH (55 MPH Zone)' : '');
  const [throttlePos, setThrottlePos] = useState(caseData.id === 'INV-26-402' ? '100% Wide-Open Throttle' : '');
  const [brakePressure, setBrakePressure] = useState(caseData.id === 'INV-26-402' ? '0.0 PSI Front Caliper / 14.2 PSI Rear' : '');
  const [roadFriction, setRoadFriction] = useState(caseData.id === 'INV-26-402' ? 'μ = 0.22 (Anomalous Slick Detected)' : '');
  const [leanAngle, setLeanAngle] = useState(caseData.id === 'INV-26-402' ? '48° Left Bank' : '');
  const [impactObject, setImpactObject] = useState(caseData.id === 'INV-26-402' ? 'Steel W-Beam Guardrail Post #14' : '');
  const [secondaryVehicleTrace, setSecondaryVehicleTrace] = useState(caseData.id === 'INV-26-402' ? 'Metallic Navy Clearcoat Transfer on Left Swingarm' : '');
  const [canBusDiagnostic, setCanBusDiagnostic] = useState(caseData.id === 'INV-26-402' ? 'CAN_FRAME_0x4F: REMOTE_THROTTLE_INJECT_DETECTED' : '');
  const [calculatedKineticImpact, setCalculatedKineticImpact] = useState<string | null>(null);
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(caseData.id === 'INV-26-402' || !!caseData.tags?.includes('vehicular-crash'));

  const handleCalculateKineticImpact = () => {
    setCalculatedKineticImpact(
      'ESTIMATED KINETIC IMPACT: ~184.6 kJ energy dissipated. Telemetry corroborates sudden electronic throttle surge with 0.0 PSI front hydraulic brake line pressure. Trajectory vector shows forced tangential guardrail strike at 48° lean angle.'
    );
    showToast('Kinetic Impact & Trajectory Calculated');
  };

  // Sync state if caseData changes
  useEffect(() => {
    if (caseData.causeHypothesis) {
      setPrimaryCause(caseData.causeHypothesis.primaryCause || '');
      setConfidence(caseData.causeHypothesis.causeConfidence ?? 25);
      setCauseFindings(caseData.causeHypothesis.causeFindings || '');
      setWeaponOrVector(caseData.causeHypothesis.weaponOrVector || '');
      setMotive(caseData.causeHypothesis.motive || '');
      setPrimeSuspectName(caseData.causeHypothesis.primeSuspectName || '');
      setIncidentLocation(caseData.causeHypothesis.incidentLocation || '');
      setIncidentTimeWindow(caseData.causeHypothesis.incidentTimeWindow || '');
      setModusOperandi(caseData.causeHypothesis.modusOperandi || '');
      setFormalCharge(caseData.causeHypothesis.formalCharge || '');
      setInvestigatorNotes(caseData.causeHypothesis.investigatorNotes || '');
    }
    if (caseData.suspectProfiles && caseData.suspectProfiles.length > 0) {
      setSuspectsList(caseData.suspectProfiles);
    }
    setEvidenceList(caseData.evidence || []);
    setTimelineList(caseData.timeline || []);

    if (caseData.id === 'INV-26-402' || caseData.tags?.includes('vehicular-crash')) {
      setIsTelemetryExpanded(true);
      setVehicleModel('2025 Vortex R-1000 Superbike');
      setPreImpactSpeed('94 MPH (55 MPH Zone)');
      setThrottlePos('100% Wide-Open Throttle');
      setBrakePressure('0.0 PSI Front Caliper / 14.2 PSI Rear');
      setRoadFriction('μ = 0.22 (Anomalous Slick Detected)');
      setLeanAngle('48° Left Bank');
      setImpactObject('Steel W-Beam Guardrail Post #14');
      setSecondaryVehicleTrace('Metallic Navy Clearcoat Transfer on Left Swingarm');
      setCanBusDiagnostic('CAN_FRAME_0x4F: REMOTE_THROTTLE_INJECT_DETECTED');
    }
  }, [caseData.id]);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Persist Cause & Hypothesis
  const handleSaveHypothesis = async () => {
    setAutoSaveStatus('saving');
    await updateDGACaseCauseHypothesis(caseData.id, {
      primaryCause,
      causeConfidence: confidence,
      causeFindings,
      weaponOrVector,
      motive,
      primeSuspectName,
      incidentLocation,
      incidentTimeWindow,
      modusOperandi,
      formalCharge,
      investigatorNotes
    });
    setAutoSaveStatus('saved');
    showToast('Investigation Deductions Saved to Dossier.');
  };

  // Suspect Handlers
  const handleUpdateSuspect = async (id: string, patch: Partial<SuspectInvestigationProfile>) => {
    const updated = suspectsList.map((s) => (s.id === id ? { ...s, ...patch } : s));
    setSuspectsList(updated);
    const target = updated.find((s) => s.id === id);
    if (target) {
      await addOrUpdateDGASuspectProfile(caseData.id, target);
      setAutoSaveStatus('saved');
    }
  };

  const handleAddNewSuspect = async () => {
    const newId = `SUSP-${Date.now().toString().slice(-4)}`;
    const newProfile: SuspectInvestigationProfile = {
      id: newId,
      name: `Person of Interest #${suspectsList.length + 1}`,
      role: 'Subject of Inquiry',
      affiliation: 'Under Investigation',
      meansNotes: '',
      motiveNotes: '',
      opportunityNotes: '',
      alibiStatus: 'Unverified',
      verdict: 'Person of Interest',
      redFlags: '',
      linkedEvidenceIds: []
    };
    const updated = [newProfile, ...suspectsList];
    setSuspectsList(updated);
    await addOrUpdateDGASuspectProfile(caseData.id, newProfile);
    showToast('New Fillable Suspect Card Added to Board');
  };

  const handleDeleteSuspect = async (id: string) => {
    const updated = suspectsList.filter((s) => s.id !== id);
    setSuspectsList(updated);
    await deleteDGACaseSuspectProfile(caseData.id, id);
    showToast('Suspect Profile Removed from Matrix');
  };

  // Evidence Handlers
  const handleUpdateEvidence = async (id: string, patch: Partial<EvidenceItem>) => {
    const updated = evidenceList.map((e) => (e.id === id ? { ...e, ...patch } : e));
    setEvidenceList(updated);
    await updateDGACaseEvidenceItem(caseData.id, id, patch);
    setAutoSaveStatus('saved');
  };

  const handleAddNewEvidence = async () => {
    const newId = `EV-${caseData.id}-${Date.now().toString().slice(-4)}`;
    const newEv: EvidenceItem = {
      id: newId,
      title: `Recovered Exhibit #${evidenceList.length + 1}`,
      category: 'Physical Item',
      description: '',
      locationFound: incidentLocation || 'Primary Scene',
      dateRecovered: new Date().toISOString(),
      custodyStatus: 'Collected',
      investigatorNotes: '',
      linkedSuspectName: primeSuspectName || ''
    };
    const res = await addDGACaseEvidence(caseData.id, newEv);
    if (res) {
      setEvidenceList([res, ...evidenceList]);
      showToast('New Fillable Exhibit Logged in Vault');
    }
  };

  const handleDeleteEvidence = async (id: string) => {
    const updated = evidenceList.filter((e) => e.id !== id);
    setEvidenceList(updated);
    await deleteDGACaseEvidenceItem(caseData.id, id);
    showToast('Exhibit Removed from Vault');
  };

  // Timeline Handlers
  const handleAddNewTimeline = async () => {
    const newEvent = await addDGACaseTimelineEvent(caseData.id, {
      timestamp: new Date().toISOString(),
      description: 'Logged investigative event / sequence step',
      type: 'NOTE_ADDED',
      actor: agentSignature.split('[')[0].trim() || 'Lead Investigator'
    });
    if (newEvent) {
      setTimelineList([newEvent, ...timelineList]);
      showToast('New Timeline Sequence Row Added');
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    const updated = timelineList.filter((t) => t.id !== id);
    setTimelineList(updated);
    await deleteDGACaseTimelineEvent(caseData.id, id);
    showToast('Timeline Event Removed');
  };

  // Indictment Submission
  const handleSubmitIndictment = async () => {
    if (!primaryCause.trim() || !primeSuspectName.trim()) {
      alert('INCOMPLETE INDICTMENT: Please fill in at least the Primary Cause and Prime Accused Suspect before submitting formal indictment.');
      return;
    }

    const confirmed = confirm(
      `CONFIRM FORMAL INDICTMENT SUBMISSION:\n\nDocket: ${caseData.id}\nPrime Suspect: ${primeSuspectName}\nPrimary Cause: ${primaryCause}\nWeapon / Vector: ${weaponOrVector || 'N/A'}\nCharge: ${formalCharge || 'Not specified'}\n\nSubmit package for review? Record court decisions separately in Operations.`
    );

    if (confirmed) {
      const res = await submitDGACaseIndictment(caseData.id, {
        primaryCause,
        causeConfidence: confidence,
        causeFindings,
        weaponOrVector,
        motive,
        primeSuspectName,
        incidentLocation,
        incidentTimeWindow,
        modusOperandi,
        formalCharge: formalCharge || undefined,
        investigatorNotes
      });
      showToast(res.message);
      alert(res.message);
    }
  };

  // Calculate Case Deduction Completion
  const calcCompletion = () => {
    let score = 0;
    if (primaryCause) score += 15;
    if (weaponOrVector) score += 15;
    if (motive) score += 15;
    if (primeSuspectName) score += 15;
    if (incidentLocation) score += 10;
    if (incidentTimeWindow) score += 10;
    if (modusOperandi) score += 10;
    if (causeFindings) score += 10;
    return Math.min(100, score);
  };

  const deductionProgress = calcCompletion();

  // Scroll to section helper
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8f7fb] text-[#222033] overflow-y-auto">
      {/* 1. Header Banner & Case Builder Control Station */}
      <div className="bg-[#1e1c2b] text-white px-4 py-3 border-b border-[#36344d] shrink-0 sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#484271] border border-[#6b649e] flex items-center justify-center text-white shadow-xs">
              <Crosshair className="w-4 h-4 text-[#d1cee8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#b9b7da]">
                  DOCKET {caseData.id} // HUNT A KILLER CASE BINDER
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/70 text-purple-200 border border-purple-700 font-mono font-bold uppercase">
                  INTERACTIVE DETECTIVE WORKBOOK
                </span>
                {initialHypothesis.indictmentStatus === 'Indicted' && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-600 font-mono font-bold">
                    INDICTED & CLOSED
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>{caseData.title}</span>
                <span className="text-xs font-normal text-[#9b99be]">
                  • Operative Worksheet (Fill Every Section Below)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Autosave Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-[#9d9bc2] font-mono pr-2 border-r border-[#38364e]">
              <span className={`w-2 h-2 rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>{autoSaveStatus === 'saving' ? 'Saving...' : 'Auto-Saved'}</span>
            </div>

            {saveToast && (
              <span className="text-xs bg-emerald-900/80 text-emerald-200 border border-emerald-700 px-2.5 py-1 rounded font-bold animate-fadeIn">
                {saveToast}
              </span>
            )}

            {/* View Mode Toggle: All-in-One Binder vs Section Tabs */}
            <div className="flex items-center bg-[#29273c] border border-[#3e3b5a] rounded p-0.5 text-xs">
              <button
                onClick={() => setViewMode('binder')}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'binder' ? 'bg-[#5b568b] text-white' : 'text-[#9c9abf] hover:text-white'
                }`}
                title="Continuous scrollable workbook with all sections fillable in one place"
              >
                <BookOpen className="w-3 h-3" />
                <span>ALL-IN-ONE BINDER</span>
              </button>
              <button
                onClick={() => setViewMode('tabs')}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'tabs' ? 'bg-[#5b568b] text-white' : 'text-[#9c9abf] hover:text-white'
                }`}
                title="Single section tab focus"
              >
                <Layers className="w-3 h-3" />
                <span>SECTION TABS</span>
              </button>
            </div>

            <button
              onClick={handleSaveHypothesis}
              className="px-3 py-1 bg-[#534e7e] hover:bg-[#433f67] text-white rounded text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE DOSSIER</span>
            </button>

            <button
              onClick={handleSubmitIndictment}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>FILE INDICTMENT</span>
            </button>
          </div>
        </div>

        {/* Progress & Quick Jump Strip */}
        <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-[#312f45] flex-wrap text-xs">
          {/* Deduction Progress Bar */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <span className="text-[10px] font-bold text-[#a6a4c9] uppercase tracking-wider">
              Deduction Completion:
            </span>
            <div className="flex-1 bg-[#2e2c41] h-2 rounded-full overflow-hidden border border-[#3e3c59] w-28">
              <div
                className={`h-full transition-all duration-300 ${
                  deductionProgress >= 80 ? 'bg-emerald-500' : deductionProgress >= 50 ? 'bg-purple-500' : 'bg-amber-500'
                }`}
                style={{ width: `${deductionProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-white">{deductionProgress}%</span>
          </div>

          {/* Quick-Jump Section Navigator */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none font-semibold text-[11px]">
            <button
              onClick={() => {
                setActiveTab('cause');
                if (viewMode === 'binder') scrollTo(causeRef);
              }}
              className={`px-2.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
                activeTab === 'cause' ? 'bg-[#5b568b] text-white' : 'text-[#a2a0c4] hover:bg-[#2b2a3f] hover:text-white'
              }`}
            >
              <Target className="w-3 h-3" />
              <span>1. Cause & MO</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('suspects');
                if (viewMode === 'binder') scrollTo(suspectsRef);
              }}
              className={`px-2.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
                activeTab === 'suspects' ? 'bg-[#5b568b] text-white' : 'text-[#a2a0c4] hover:bg-[#2b2a3f] hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>2. Suspect Elimination ({suspectsList.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('evidence');
                if (viewMode === 'binder') scrollTo(evidenceRef);
              }}
              className={`px-2.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
                activeTab === 'evidence' ? 'bg-[#5b568b] text-white' : 'text-[#a2a0c4] hover:bg-[#2b2a3f] hover:text-white'
              }`}
            >
              <Beaker className="w-3 h-3" />
              <span>3. Evidence Vault ({evidenceList.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('timeline');
                if (viewMode === 'binder') scrollTo(timelineRef);
              }}
              className={`px-2.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
                activeTab === 'timeline' ? 'bg-[#5b568b] text-white' : 'text-[#a2a0c4] hover:bg-[#2b2a3f] hover:text-white'
              }`}
            >
              <History className="w-3 h-3" />
              <span>4. Timeline ({timelineList.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('indictment');
                if (viewMode === 'binder') scrollTo(indictmentRef);
              }}
              className={`px-2.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
                activeTab === 'indictment' ? 'bg-emerald-800 text-white' : 'text-emerald-300 hover:bg-[#2b2a3f] hover:text-white'
              }`}
            >
              <BadgeAlert className="w-3 h-3 text-emerald-400" />
              <span>5. Indictment Filing</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Interactive Case Builder Body */}
      <div className="p-4 sm:p-5 max-w-6xl w-full mx-auto space-y-7">

        {/* ============================================================== */}
        {/* SECTION 1: CAUSE & MODUS OPERANDI WORKSHEET */}
        {/* ============================================================== */}
        {(viewMode === 'binder' || activeTab === 'cause') && (
          <div ref={causeRef} className="space-y-3 bg-white border border-[#cfcddb] rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#ecebf3] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#ece9f7] text-[#4f4a7c] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1e1d32] flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#5d5a86]" />
                    <span>INCIDENT CAUSE & MODUS OPERANDI (MO) WORKSHEET</span>
                  </h2>
                  <p className="text-[11px] text-[#63617e]">
                    Fill in your investigative conclusions regarding the exact cause, weapon/vector, motive, and scene.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#74728f] bg-[#f0eff5] px-2 py-0.5 rounded border border-[#cfcddb]">
                DEDUCTIVE DETERMINATION
              </span>
            </div>

            {/* Responsive Fillable Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {/* Primary Cause Field */}
              <div className="space-y-1 lg:col-span-2">
                <label className="text-[11px] font-bold text-[#35334e] flex items-center justify-between">
                  <span>Primary Cause of Incident / Mechanism of Death *</span>
                  <span className="text-[10px] text-[#757390] font-normal">Fill in or select preset</span>
                </label>
                <input
                  type="text"
                  value={primaryCause}
                  onChange={(e) => setPrimaryCause(e.target.value)}
                  placeholder="e.g. Synthetic Neurotoxin (Organophosphate), SCADA Surge, Physical Strangulation..."
                  className="w-full bg-[#fbfafc] border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1e1d30] font-semibold focus:outline-none focus:border-[#5d5a86] focus:bg-white"
                />
                {/* Quick Fill Suggestion Pills */}
                <div className="flex flex-wrap gap-1 pt-0.5 text-[9.5px]">
                  <span className="text-[#7d7b97] font-medium">Quick suggestions:</span>
                  {[
                    'Motorcycle High-Speed Guardrail Impact',
                    'Brake Fluid Line Hydraulic Bleed / Sabotage',
                    'CAN-Bus Electronic Throttle Hijack',
                    'Roadway Surface Chemical Slick Drift',
                    'Secondary Vehicle PIT / Forced Off-Road',
                    'Synthetic Neurotoxin Poisoning',
                    'SCADA Substation Power Surge',
                    'Biometric Access Spoofing',
                    'Kinetic Ballistic Trauma',
                    'Staged Single-Vehicle Collision'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPrimaryCause(preset)}
                      className="px-1.5 py-0.2 rounded bg-[#f0eff6] hover:bg-[#dedbe9] text-[#3e3c56] font-mono transition-colors cursor-pointer border border-[#dedbe7]"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Rating Slider */}
              <div className="space-y-1.5 bg-[#fbfafc] p-3 rounded-lg border border-[#e4e2ee]">
                <div className="flex items-center justify-between text-xs font-bold text-[#373551]">
                  <span>Confidence Level:</span>
                  <span className={`font-mono px-2 py-0.5 rounded text-[10.5px] ${
                    confidence >= 80 ? 'bg-emerald-100 text-emerald-900 font-bold' : confidence >= 50 ? 'bg-purple-100 text-purple-900 font-bold' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {confidence}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#5d5a86]"
                />
                <div className="text-[10px] text-[#6d6b88] text-right font-medium">
                  {confidence >= 80 ? 'Beyond Reasonable Doubt' : confidence >= 50 ? 'Substantiated Lead' : 'Working Theory'}
                </div>
              </div>

              {/* Weapon / Delivery Vector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#35334e]">Weapon / Execution Vector *</label>
                <input
                  type="text"
                  value={weaponOrVector}
                  onChange={(e) => setWeaponOrVector(e.target.value)}
                  placeholder="e.g. Cut hydraulic line, CAN-Bus injection, secondary vehicle PIT, toxic inhaler..."
                  className="w-full bg-[#fbfafc] border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1e1d30] font-medium focus:outline-none focus:border-[#5d5a86]"
                />
                <div className="flex flex-wrap gap-1 pt-0.5 text-[9.5px]">
                  <span className="text-[#7d7b97] font-medium">Presets:</span>
                  {[
                    'Cut Hydraulic Brake Line (Tool Shear)',
                    'CAN-Bus OBD-II Remote Inject',
                    'Fluoropolymer Roadbed Slick (MM 42)',
                    'Secondary Fleet Vehicle Sideswipe',
                    'Tampered ABS Modulator Valve'
                  ].map((wPreset) => (
                    <button
                      key={wPreset}
                      type="button"
                      onClick={() => setWeaponOrVector(wPreset)}
                      className="px-1.5 py-0.2 rounded bg-[#f0eff6] hover:bg-[#dedbe9] text-[#3e3c56] font-mono transition-colors cursor-pointer border border-[#dedbe7]"
                    >
                      + {wPreset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prime Motive */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#35334e]">Deduced Motive / Core Intent *</label>
                <input
                  type="text"
                  value={motive}
                  onChange={(e) => setMotive(e.target.value)}
                  placeholder="e.g. Autonomous drive whistleblower silencing, industrial IP dispute, staged fatality..."
                  className="w-full bg-[#fbfafc] border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1e1d30] font-medium focus:outline-none focus:border-[#5d5a86]"
                />
                <div className="flex flex-wrap gap-1 pt-0.5 text-[9.5px]">
                  <span className="text-[#7d7b97] font-medium">Presets:</span>
                  {[
                    'Whistleblower Deposition Suppression',
                    'Proprietary Drive Patent Dispute',
                    'Staged Fatal Collision Concealment',
                    'Rival Race Team Sabotage'
                  ].map((mPreset) => (
                    <button
                      key={mPreset}
                      type="button"
                      onClick={() => setMotive(mPreset)}
                      className="px-1.5 py-0.2 rounded bg-[#f0eff6] hover:bg-[#dedbe9] text-[#3e3c56] font-mono transition-colors cursor-pointer border border-[#dedbe7]"
                    >
                      + {mPreset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prime Accused Suspect Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#35334e]">Prime Accused Subject / Entity *</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={primeSuspectName}
                    onChange={(e) => setPrimeSuspectName(e.target.value)}
                    placeholder="Enter or pick prime suspect..."
                    className="flex-1 bg-[#fbfafc] border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1e1d30] font-bold focus:outline-none focus:border-[#5d5a86]"
                  />
                  {suspectsList.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) setPrimeSuspectName(e.target.value);
                      }}
                      className="bg-[#f0eff6] border border-[#cfcddb] rounded px-2 text-xs font-bold text-[#35334e] cursor-pointer"
                    >
                      <option value="">Pick Logged...</option>
                      {suspectsList.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.verdict || 'Suspect'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Primary Scene & Execution Window */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#35334e]">Primary Scene / Locus</label>
                <input
                  type="text"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  placeholder="e.g. Pier 9 Warehouses, Sub-Level 4 Cleanroom..."
                  className="w-full bg-[#fbfafc] border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1e1d30]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#35334e]">Execution Time Window</label>
                <input
                  type="text"
                  value={incidentTimeWindow}
                  onChange={(e) => setIncidentTimeWindow(e.target.value)}
                  placeholder="e.g. Oct 9, 01:15 - 02:30 UTC"
                  className="w-full bg-[#fbfafc] border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1e1d30]"
                />
              </div>

              {/* Formal Judicial Charge */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#35334e]">Target Judicial Charge</label>
                <input
                  type="text"
                  value={formalCharge}
                  onChange={(e) => setFormalCharge(e.target.value)}
                  placeholder="e.g. 18 U.S.C. § 1111 - Premeditated Synthetic Homicide"
                  className="w-full bg-[#fbfafc] border border-[#cfcddb] rounded px-3 py-1.5 text-xs text-[#1e1d30]"
                />
              </div>
            </div>

            {/* Modus Operandi & Scientific Findings (Full Width Textareas) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-2 border-t border-[#ecebf3]">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#35334e] flex items-center justify-between">
                  <span>Modus Operandi (Execution Sequence Reconstruction)</span>
                  <span className="text-[10px] text-[#787693] font-normal">How the perpetrator operated</span>
                </label>
                <textarea
                  rows={3}
                  value={modusOperandi}
                  onChange={(e) => setModusOperandi(e.target.value)}
                  placeholder="Detail step-by-step how the perpetrator bypassed security, deployed the vector, manipulated logs, and escaped..."
                  className="w-full bg-[#fbfafc] border border-[#cfcddb] rounded p-2.5 text-xs text-[#1e1d30] leading-relaxed focus:outline-none focus:border-[#5d5a86]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#35334e] flex items-center justify-between">
                  <span>Scientific & Forensic Findings Summary</span>
                  <span className="text-[10px] text-[#787693] font-normal">Toxicology, digital forensics, ballistic proof</span>
                </label>
                <textarea
                  rows={3}
                  value={causeFindings}
                  onChange={(e) => setCauseFindings(e.target.value)}
                  placeholder="Summarize physical, toxicological, or spectral evidence corroborating this cause..."
                  className="w-full bg-[#fbfafc] border border-[#cfcddb] rounded p-2.5 text-xs text-[#1e1d30] leading-relaxed focus:outline-none focus:border-[#5d5a86]"
                />
              </div>
            </div>

            {/* Field Deductive Notes */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-[#35334e]">Operative Deductive Notes & Open Questions</label>
              <textarea
                rows={2}
                value={investigatorNotes}
                onChange={(e) => setInvestigatorNotes(e.target.value)}
                placeholder="Log pending leads, contradictory witness statements, or questions to resolve prior to indictment..."
                className="w-full bg-[#fbfafc] border border-[#cfcddb] rounded p-2 text-xs text-[#1e1d30]"
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VEHICULAR & MOTORCYCLE COLLISION TELEMETRY & DYNAMICS LAB */}
        {/* ============================================================== */}
        <div className="bg-[#1b1a26] text-white border border-[#3b3852] rounded-xl p-4 sm:p-5 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#2d2a40] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#3c365b] border border-[#5a5286] flex items-center justify-center text-white">
                <Gauge className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>VEHICULAR & MOTORCYCLE COLLISION TELEMETRY ANALYZER</span>
                  </h3>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    EDR & CRASH DYNAMICS
                  </span>
                </div>
                <p className="text-[11px] text-[#9a98bc]">
                  Reconstruct vehicle/motorcycle black box flight data, hydraulic line PSI, throttle spikes, and road friction.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
                className="px-2.5 py-1 rounded bg-[#2b293d] hover:bg-[#393652] text-xs font-semibold text-[#c8c5e6] cursor-pointer transition-colors"
              >
                {isTelemetryExpanded ? 'Minimize Telemetry' : 'Expand Telemetry Board'}
              </button>
            </div>
          </div>

          {isTelemetryExpanded && (
            <div className="space-y-4 pt-1 animate-fadeIn">
              {/* Telemetry Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">Vehicle Platform / Class</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-cyan-200 font-semibold cursor-pointer"
                  >
                    <option value="Sport Motorcycle (Superbike)">Sport Motorcycle (Superbike)</option>
                    <option value="Touring / Cruiser Motorcycle">Touring / Cruiser Motorcycle</option>
                    <option value="Electric Autonomous Prototype">Electric Autonomous Prototype</option>
                    <option value="Passenger Sedan / Coupe">Passenger Sedan / Coupe</option>
                    <option value="Commercial Fleet Heavy SUV">Commercial Fleet Heavy SUV</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">Make, Model & Plate / VIN</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. 2025 Vortex R-1000 Superbike"
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">Pre-Impact Speed (ECU Logged)</label>
                  <input
                    type="text"
                    value={preImpactSpeed}
                    onChange={(e) => setPreImpactSpeed(e.target.value)}
                    placeholder="e.g. 94 MPH (55 MPH Limit)"
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">Electronic Throttle (TPS)</label>
                  <input
                    type="text"
                    value={throttlePos}
                    onChange={(e) => setThrottlePos(e.target.value)}
                    placeholder="e.g. 100% Wide-Open Throttle"
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-rose-300 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">Brake Hydraulic Pressure</label>
                  <input
                    type="text"
                    value={brakePressure}
                    onChange={(e) => setBrakePressure(e.target.value)}
                    placeholder="e.g. 0.0 PSI Front / 14 PSI Rear"
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-rose-300 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">Road Friction Coeff (μ)</label>
                  <input
                    type="text"
                    value={roadFriction}
                    onChange={(e) => setRoadFriction(e.target.value)}
                    placeholder="e.g. μ = 0.22 (Anomalous Chemical Slick)"
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">Lean Angle at Apex</label>
                  <input
                    type="text"
                    value={leanAngle}
                    onChange={(e) => setLeanAngle(e.target.value)}
                    placeholder="e.g. 48° Left Bank"
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">Impact Object / Terminal Zone</label>
                  <input
                    type="text"
                    value={impactObject}
                    onChange={(e) => setImpactObject(e.target.value)}
                    placeholder="e.g. W-Beam Guardrail Post #14"
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1 lg:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">Secondary Vehicle Collision Clues / Paint Transfer</label>
                  <input
                    type="text"
                    value={secondaryVehicleTrace}
                    onChange={(e) => setSecondaryVehicleTrace(e.target.value)}
                    placeholder="e.g. Navy Metallic Clearcoat Transfer on Left Swingarm / Bumper Scrape"
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-amber-200 font-medium"
                  />
                </div>

                <div className="space-y-1 lg:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-[#9e9cb8] block">CAN-Bus Diagnostic Fault Code</label>
                  <input
                    type="text"
                    value={canBusDiagnostic}
                    onChange={(e) => setCanBusDiagnostic(e.target.value)}
                    placeholder="e.g. CAN_FRAME_0x4F: OVERRIDE_INJECT_DETECTED"
                    className="w-full bg-[#12111d] border border-[#37344f] rounded px-2.5 py-1.5 text-xs text-cyan-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Calculator Action Bar */}
              <div className="bg-[#141320] border border-[#2b293d] rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-[#a2a0c2]">
                  {calculatedKineticImpact ? (
                    <div className="text-emerald-300 font-medium leading-relaxed font-sans flex items-start gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{calculatedKineticImpact}</span>
                    </div>
                  ) : (
                    <span>Click calculation button to compute collision kinetic delta, trajectory deviation, and sabotage markers.</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCalculateKineticImpact}
                  className="px-4 py-1.5 bg-[#4c4475] hover:bg-[#3d3660] text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-300" />
                  <span>CALCULATE IMPACT KINETICS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: SUSPECTS & ALIBIS ELIMINATION MATRIX */}
        {/* ============================================================== */}
        {(viewMode === 'binder' || activeTab === 'suspects') && (
          <div ref={suspectsRef} className="space-y-3 bg-white border border-[#cfcddb] rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#ecebf3] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#ece9f7] text-[#4f4a7c] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1e1d32] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#5d5a86]" />
                    <span>SUSPECT ELIMINATION MATRIX (MEANS, MOTIVE, OPPORTUNITY)</span>
                  </h2>
                  <p className="text-[11px] text-[#63617e]">
                    Every person of interest is directly fillable. Test their alibis, flag contradictions, and assign verdicts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddNewSuspect}
                  className="px-3 py-1.5 bg-[#4c4874] hover:bg-[#3d3a60] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ADD FILLABLE SUSPECT CARD</span>
                </button>
              </div>
            </div>

            {/* Suspect Fillable Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
              {suspectsList.map((s, index) => (
                <div
                  key={s.id}
                  className={`bg-[#fdfdfe] border rounded-lg p-3.5 space-y-3 transition-all shadow-2xs ${
                    s.verdict === 'Prime Suspect'
                      ? 'border-rose-400 ring-2 ring-rose-200/80 bg-rose-50/20'
                      : s.verdict === 'Cleared'
                      ? 'border-emerald-300 opacity-80'
                      : 'border-[#cfcddb]'
                  }`}
                >
                  {/* Suspect Header & Verdict Controls */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#ecebf3] pb-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#686684] bg-[#edeaf7] px-1.5 py-0.2 rounded">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => handleUpdateSuspect(s.id, { name: e.target.value })}
                          placeholder="Suspect Name..."
                          className="font-bold text-sm text-[#1e1d31] bg-transparent border-b border-transparent hover:border-[#cfcddb] focus:border-[#5d5a86] focus:outline-none w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <input
                          type="text"
                          value={s.role || ''}
                          onChange={(e) => handleUpdateSuspect(s.id, { role: e.target.value })}
                          placeholder="Role / Title..."
                          className="text-[11px] text-[#555370] bg-[#f8f7fb] border border-[#e4e2ed] rounded px-1.5 py-0.5 focus:outline-none focus:border-[#5d5a86]"
                        />
                        <input
                          type="text"
                          value={s.affiliation || ''}
                          onChange={(e) => handleUpdateSuspect(s.id, { affiliation: e.target.value })}
                          placeholder="Affiliation / Organization..."
                          className="text-[11px] text-[#555370] bg-[#f8f7fb] border border-[#e4e2ed] rounded px-1.5 py-0.5 focus:outline-none focus:border-[#5d5a86]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {/* Verdict Selector Dropdown */}
                      <select
                        value={s.verdict || 'Person of Interest'}
                        onChange={(e) => handleUpdateSuspect(s.id, { verdict: e.target.value as any })}
                        className={`text-[10px] font-bold font-mono px-2 py-1 rounded uppercase border cursor-pointer ${
                          s.verdict === 'Prime Suspect'
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : s.verdict === 'Cleared'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-purple-100 text-purple-900 border-purple-300'
                        }`}
                      >
                        <option value="Person of Interest">Person of Interest</option>
                        <option value="Prime Suspect">★ Prime Suspect</option>
                        <option value="Cleared">Cleared / Exonerated</option>
                        <option value="Accomplice">Accomplice / Inside Asset</option>
                        <option value="Material Witness">Material Witness</option>
                        <option value="Hostile">Hostile / Non-Cooperative</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteSuspect(s.id)}
                        className="text-[10px] text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer pt-0.5"
                        title="Remove suspect from board"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Means & Motive Inputs */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#454360] flex items-center justify-between">
                        <span>Means (Capability)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={s.meansNotes || ''}
                        onChange={(e) => handleUpdateSuspect(s.id, { meansNotes: e.target.value })}
                        placeholder="Security access, toxic chemicals clearance, skills..."
                        className="w-full bg-[#fbfafc] border border-[#dfdde9] rounded p-1.5 text-[11px] text-[#2c2a40] focus:outline-none focus:border-[#5d5a86]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#454360] flex items-center justify-between">
                        <span>Motive (Grievance)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={s.motiveNotes || ''}
                        onChange={(e) => handleUpdateSuspect(s.id, { motiveNotes: e.target.value })}
                        placeholder="Financial gain, blackmail, retaliation, revenge..."
                        className="w-full bg-[#fbfafc] border border-[#dfdde9] rounded p-1.5 text-[11px] text-[#2c2a40] focus:outline-none focus:border-[#5d5a86]"
                      />
                    </div>
                  </div>

                  {/* Opportunity & Alibi Verification Box */}
                  <div className="bg-[#f8f7fb] p-2.5 rounded border border-[#dedce8] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#32304d] text-[10px] uppercase tracking-wider">
                        Opportunity & Stated Alibi:
                      </span>
                      {/* Alibi Status Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateSuspect(s.id, { alibiStatus: 'Corroborated', verdict: 'Cleared' })}
                          className={`px-1.5 py-0.2 rounded font-mono text-[9.5px] font-bold border transition-colors cursor-pointer ${
                            s.alibiStatus === 'Corroborated'
                              ? 'bg-emerald-700 text-white border-emerald-800'
                              : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          Corroborated
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSuspect(s.id, { alibiStatus: 'Contradicted / False Alibi', verdict: 'Prime Suspect' })}
                          className={`px-1.5 py-0.2 rounded font-mono text-[9.5px] font-bold border transition-colors cursor-pointer ${
                            s.alibiStatus === 'Contradicted / False Alibi'
                              ? 'bg-rose-700 text-white border-rose-800'
                              : 'bg-white text-rose-800 border-rose-300 hover:bg-rose-50'
                          }`}
                        >
                          Broken Alibi
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSuspect(s.id, { alibiStatus: 'Unverified' })}
                          className={`px-1.5 py-0.2 rounded font-mono text-[9.5px] font-bold border transition-colors cursor-pointer ${
                            s.alibiStatus === 'Unverified'
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                          }`}
                        >
                          Unverified
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={s.opportunityNotes || ''}
                      onChange={(e) => handleUpdateSuspect(s.id, { opportunityNotes: e.target.value })}
                      placeholder="Where did they claim to be? Cross-check electronic badge swipes, CCTV, witness deposits..."
                      className="w-full bg-white border border-[#dfdde9] rounded p-1.5 text-[11px] text-[#2c2a40] focus:outline-none focus:border-[#5d5a86]"
                    />

                    {/* Red Flags & Discrepancies Input */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <input
                        type="text"
                        value={s.redFlags || ''}
                        onChange={(e) => handleUpdateSuspect(s.id, { redFlags: e.target.value })}
                        placeholder="Log statement discrepancy, card reader anomaly, or suspicious wire..."
                        className="flex-1 bg-white border border-rose-200 rounded px-2 py-0.5 text-[10.5px] text-rose-900 placeholder-rose-300 focus:outline-none focus:border-rose-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Make Prime Suspect Quick Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#f0eff5] text-[10.5px]">
                    <span className="text-[#686684]">Designate Prime Accused:</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateSuspect(s.id, { verdict: 'Prime Suspect' });
                        setPrimeSuspectName(s.name);
                        showToast(`Set ${s.name} as Prime Suspect in Hypothesis.`);
                      }}
                      className="px-2 py-0.5 bg-[#4c4874] hover:bg-[#3d3a60] text-white rounded font-bold cursor-pointer transition-colors"
                    >
                      Target as Prime Accused
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 3: EVIDENCE VAULT & PHYSICAL/DIGITAL EXHIBITS */}
        {/* ============================================================== */}
        {(viewMode === 'binder' || activeTab === 'evidence') && (
          <div ref={evidenceRef} className="space-y-3 bg-white border border-[#cfcddb] rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#ecebf3] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#ece9f7] text-[#4f4a7c] flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1e1d32] flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-[#5d5a86]" />
                    <span>EVIDENCE VAULT & CRIME SCENE EXHIBIT LOG</span>
                  </h2>
                  <p className="text-[11px] text-[#63617e]">
                    Catalog every piece of physical, digital, or toxicological proof. Edit details and deduce significance directly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenTraceWithCase && caseData.linkedTraceCaseId && (
                  <button
                    onClick={() => onOpenTraceWithCase(caseData.linkedTraceCaseId!)}
                    className="px-3 py-1.5 bg-[#2c2944] hover:bg-[#1f1d33] text-purple-200 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>OPEN TRACE FORENSIC LAB</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddNewEvidence}
                  className="px-3 py-1.5 bg-[#4c4874] hover:bg-[#3d3a60] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ LOG FILLABLE EXHIBIT</span>
                </button>
              </div>
            </div>

            {/* Evidence Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {evidenceList.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-[#fdfdfe] border border-[#cfcddb] rounded-lg p-3.5 space-y-2.5 shadow-2xs hover:border-[#5d5a86] transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* ID & Category */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#4e4a74] bg-[#edeaf6] px-1.5 py-0.2 rounded border border-[#cfcddb]">
                        {ev.id}
                      </span>

                      <select
                        value={ev.category}
                        onChange={(e) => handleUpdateEvidence(ev.id, { category: e.target.value as any })}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 cursor-pointer"
                      >
                        <option value="Digital Media">Digital Media / Telematics EDR</option>
                        <option value="Physical Item">Physical Item / Mechanical Part</option>
                        <option value="Chemical Residue">Chemical Residue / Fluid Slick</option>
                        <option value="Toxicological Specimen">Toxicology Specimen</option>
                        <option value="Document">Document / Collision Report</option>
                        <option value="Ballistics">Ballistics / Impact Deformation</option>
                      </select>
                    </div>

                    {/* Exhibit Title */}
                    <input
                      type="text"
                      value={ev.title}
                      onChange={(e) => handleUpdateEvidence(ev.id, { title: e.target.value })}
                      placeholder="Exhibit Title..."
                      className="w-full font-bold text-xs text-[#1e1d30] bg-[#f8f7fb] border border-[#dfdde9] rounded px-2 py-1 focus:outline-none focus:border-[#5d5a86]"
                    />

                    {/* Description */}
                    <textarea
                      rows={2}
                      value={ev.description}
                      onChange={(e) => handleUpdateEvidence(ev.id, { description: e.target.value })}
                      placeholder="Physical description, recovery condition..."
                      className="w-full text-[11px] text-[#34324d] bg-[#fbfafc] border border-[#dfdde9] rounded p-1.5 focus:outline-none focus:border-[#5d5a86]"
                    />

                    {/* Investigator Deductive Significance */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-[#4c4874] uppercase tracking-wider">
                        Investigator Clue Deductions:
                      </label>
                      <textarea
                        rows={2}
                        value={ev.investigatorNotes || ''}
                        onChange={(e) => handleUpdateEvidence(ev.id, { investigatorNotes: e.target.value })}
                        placeholder="What does this exhibit prove? Ties to suspect, fingerprints, timestamp contradictions..."
                        className="w-full text-[11px] text-[#201e33] bg-[#f3f1fa] border border-[#d2cee2] rounded p-1.5 focus:outline-none focus:border-[#5d5a86]"
                      />
                    </div>
                  </div>

                  {/* Metadata & Custody Row */}
                  <div className="pt-2 border-t border-[#f0eff5] space-y-1.5 text-[10.5px]">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-[#6f6d89] block text-[9.5px]">Location Found:</span>
                        <input
                          type="text"
                          value={ev.locationFound}
                          onChange={(e) => handleUpdateEvidence(ev.id, { locationFound: e.target.value })}
                          className="w-full bg-[#f8f7fb] border border-[#e4e2ed] rounded px-1.5 py-0.5 text-[10px] text-[#2c2a42]"
                        />
                      </div>

                      <div>
                        <span className="text-[#6f6d89] block text-[9.5px]">Chain of Custody:</span>
                        <select
                          value={ev.custodyStatus}
                          onChange={(e) => handleUpdateEvidence(ev.id, { custodyStatus: e.target.value as any })}
                          className="w-full bg-[#f8f7fb] border border-[#e4e2ed] rounded px-1 py-0.5 text-[10px] text-[#2c2a42] font-semibold cursor-pointer"
                        >
                          <option value="Collected">Collected</option>
                          <option value="In DGA Custody">In DGA Custody</option>
                          <option value="Transferred to TRACE">Transferred to TRACE</option>
                          <option value="Under Analysis">Under Analysis</option>
                          <option value="Secured in Vault">Secured in Vault</option>
                          <option value="Compromised">Compromised / Tampered</option>
                        </select>
                      </div>
                    </div>

                    {/* Suspect Link & Delete Action */}
                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={ev.linkedSuspectName || ''}
                        onChange={(e) => handleUpdateEvidence(ev.id, { linkedSuspectName: e.target.value })}
                        className="bg-[#f0eff6] border border-[#dedbe7] rounded px-1.5 py-0.5 text-[10px] font-bold text-[#3d3b58] cursor-pointer"
                      >
                        <option value="">Link to Suspect...</option>
                        {suspectsList.map((s) => (
                          <option key={s.id} value={s.name}>
                            Link: {s.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvidence(ev.id)}
                        className="text-rose-600 hover:text-rose-800 text-[10px] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 4: RECONSTRUCTION TIMELINE */}
        {/* ============================================================== */}
        {(viewMode === 'binder' || activeTab === 'timeline') && (
          <div ref={timelineRef} className="space-y-3 bg-white border border-[#cfcddb] rounded-xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#ecebf3] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#ece9f7] text-[#4f4a7c] flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1e1d32] flex items-center gap-2">
                    <History className="w-4 h-4 text-[#5d5a86]" />
                    <span>CHRONOLOGICAL INCIDENT RECONSTRUCTION TIMELINE</span>
                  </h2>
                  <p className="text-[11px] text-[#63617e]">
                    Order events chronologically to establish alibi windows, access swipes, and critical moments.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddNewTimeline}
                className="px-3 py-1.5 bg-[#4c4874] hover:bg-[#3d3a60] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD TIMELINE ENTRY</span>
              </button>
            </div>

            {/* Interactive Timeline Entries List */}
            <div className="space-y-2.5 pt-1">
              {timelineList.map((tl, index) => (
                <div
                  key={tl.id}
                  className="bg-[#fbfafc] border border-[#dedce8] rounded-lg p-3 flex items-start gap-3 shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#5b568b] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tl.timestamp}
                          onChange={(e) => {
                            const updated = timelineList.map((item) =>
                              item.id === tl.id ? { ...item, timestamp: e.target.value } : item
                            );
                            setTimelineList(updated);
                          }}
                          className="font-mono text-xs font-bold text-[#353350] bg-white border border-[#cfcddb] rounded px-2 py-0.5"
                        />
                        <input
                          type="text"
                          value={tl.actor || ''}
                          onChange={(e) => {
                            const updated = timelineList.map((item) =>
                              item.id === tl.id ? { ...item, actor: e.target.value } : item
                            );
                            setTimelineList(updated);
                          }}
                          placeholder="Actor / Operative..."
                          className="text-[11px] font-bold text-[#5c5a77] bg-white border border-[#cfcddb] rounded px-2 py-0.5 uppercase"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTimeline(tl.id)}
                        className="text-rose-600 hover:text-rose-800 text-[10px] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={tl.description}
                      onChange={(e) => {
                        const updated = timelineList.map((item) =>
                          item.id === tl.id ? { ...item, description: e.target.value } : item
                        );
                        setTimelineList(updated);
                      }}
                      className="w-full text-xs text-[#201f31] bg-white border border-[#dfdde9] rounded p-2 leading-relaxed focus:outline-none focus:border-[#5d5a86]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 5: FORMAL INDICTMENT & CLOSURE DOSSIER */}
        {/* ============================================================== */}
        {(viewMode === 'binder' || activeTab === 'indictment') && (
          <div ref={indictmentRef} className="space-y-4 bg-[#1f1e2f] text-white rounded-xl p-5 border border-[#3e3b5a] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#363450] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-emerald-800 border border-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Shield className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    JUDICIAL INDICTMENT PACKAGE & FORMAL CLOSURE REFERRAL
                  </h3>
                  <div className="text-xs text-[#a5a3c6]">
                    United States Department of Global Affairs // Office of Special Prosecutions
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-600">
                FINAL DETERMINATION
              </span>
            </div>

            {/* Grand Summary Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-[#141320] p-3.5 rounded-lg border border-[#2d2c40] space-y-2">
                <div className="text-[10px] uppercase font-bold text-[#8c89b0]">1. Established Primary Cause:</div>
                <div className="text-sm font-bold text-emerald-400 font-sans">
                  {primaryCause || '[PENDING INVESTIGATOR DETERMINATION]'}
                </div>
                <div className="text-[11px] text-[#b9b7d8] font-sans">
                  Mechanism Findings: {causeFindings || 'Scientific findings not yet logged.'}
                </div>
              </div>

              <div className="bg-[#141320] p-3.5 rounded-lg border border-[#2d2c40] space-y-2">
                <div className="text-[10px] uppercase font-bold text-[#8c89b0]">2. Prime Accused Perpetrator:</div>
                <div className="text-sm font-bold text-amber-300 font-sans">
                  {primeSuspectName || '[PENDING PRIME SUSPECT SELECTION]'}
                </div>
                <div className="text-[11px] text-[#b9b7d8] font-sans">
                  Vector Used: {weaponOrVector || 'Delivery vector unrecorded.'}
                </div>
              </div>

              <div className="bg-[#141320] p-3.5 rounded-lg border border-[#2d2c40] space-y-2">
                <div className="text-[10px] uppercase font-bold text-[#8c89b0]">3. Established Core Motive:</div>
                <div className="text-xs text-white font-sans">
                  {motive || 'Motive deduction not yet finalized.'}
                </div>
                <div className="text-[11px] text-[#9b99be] font-sans">
                  Scene: {incidentLocation || 'Scene unrecorded'} | Time Window: {incidentTimeWindow || 'Unrecorded'}
                </div>
              </div>

              <div className="bg-[#141320] p-3.5 rounded-lg border border-[#2d2c40] space-y-2">
                <div className="text-[10px] uppercase font-bold text-[#8c89b0]">4. Corroborating Vault Exhibits:</div>
                <div className="text-xs text-cyan-300 font-sans">
                  {evidenceList.length} Exhibits Secured | {suspectsList.length} Suspect Profiles Cataloged
                </div>
                <div className="text-[11px] text-[#9b99be] font-sans">
                  Broken Alibis: {suspectsList.filter((s) => s.alibiStatus === 'Contradicted / False Alibi').length}
                </div>
              </div>
            </div>

            {/* Signature & Formal Submission Bar */}
            <div className="pt-2 border-t border-[#34324d] flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-[#a5a3c6]">Primary Lead Signature:</span>
                <input
                  type="text"
                  value={agentSignature}
                  onChange={(e) => setAgentSignature(e.target.value)}
                  className="bg-[#141320] border border-[#3b3a52] rounded px-2.5 py-1 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitIndictment}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-emerald-200" />
                <span>TRANSMIT INDICTMENT PACKAGE & SEAL CASE</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
