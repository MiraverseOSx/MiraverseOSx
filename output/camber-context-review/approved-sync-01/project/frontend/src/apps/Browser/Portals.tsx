import React, { useState } from 'react';
import { 
    Activity, Shield, Building, FileText, Landmark, Truck, Eye, 
    Lock, CheckCircle2, AlertTriangle, Key, Search, ArrowRight, UserCheck, RefreshCw, User, BookOpen
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { FORMAL_INVESTIGATION_CASES, PATIENT_CARE_ASSIGNMENTS } from '../../gameplay/WorldEventEngine';
import Button from '../../components/ui/button';
import FinanceTerminal from '../FinanceTerminal';
import { syncFaithMedicalUpdate, syncDgaInvestigativeUpdate } from '../../integration/citizenBridge';

// ==========================================
// Shared Pillar III: Formal Case Reasoning Panel
// ==========================================
function FormalCaseReasoningBoard({ filterInstitution }: { filterInstitution?: string }) {
    const player = useOSStore((s) => s.gameplay?.player);
    const submitInvestigationCase = useOSStore((s) => s.submitInvestigationCase);
    const solvedIds = player?.solvedInvestigationCaseIds || [];

    const cases = filterInstitution
        ? FORMAL_INVESTIGATION_CASES.filter((c) => c.institution.includes(filterInstitution))
        : FORMAL_INVESTIGATION_CASES;

    const [selectedEvidenceByCase, setSelectedEvidenceByCase] = useState<Record<string, string[]>>({});
    const [selectedHypothesisByCase, setSelectedHypothesisByCase] = useState<Record<string, string>>({});
    const [feedbackByCase, setFeedbackByCase] = useState<Record<string, { ok: boolean; message: string }>>({});

    const toggleEvidence = (caseId: string, evId: string) => {
        const current = selectedEvidenceByCase[caseId] || [];
        const next = current.includes(evId)
            ? current.filter((x) => x !== evId)
            : [...current, evId];
        setSelectedEvidenceByCase({ ...selectedEvidenceByCase, [caseId]: next });
    };

    const handleSubmitCase = async (caseId: string) => {
        if (!submitInvestigationCase) return;
        const ev = selectedEvidenceByCase[caseId] || [];
        const hyp = selectedHypothesisByCase[caseId] || '';
        const res = submitInvestigationCase(caseId, ev, hyp);
        setFeedbackByCase({
            ...feedbackByCase,
            [caseId]: { ok: res.ok, message: res.message }
        });
        if (res.ok && res.verified) {
            const caseDef = FORMAL_INVESTIGATION_CASES.find(c => c.id === caseId);
            if (caseDef?.subjectMaid) {
                if (caseDef.institution.toLowerCase().includes('faith medical')) {
                    await syncFaithMedicalUpdate(caseDef.subjectMaid, {
                        medicalSummary: `Forensic case ${caseDef.id} resolved: ${res.message}`,
                        auraStatus: 'Stabilized Tier II · Investigation Closed',
                        attendingClinician: 'Faith Medical & TRACE Forensics'
                    });
                } else {
                    await syncDgaInvestigativeUpdate(caseDef.subjectMaid, {
                        investigativeNote: `Case ${caseDef.id} resolved: ${res.message}`,
                        caseId: caseDef.id,
                        status: 'VERIFIED / CLEARED'
                    });
                }
            }
        }
    };

    return (
        <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Search size={14} className="text-indigo-600" /> Formal Case Reasoning & Evidence Verification
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                    Solved: {solvedIds.length}/{FORMAL_INVESTIGATION_CASES.length}
                </span>
            </div>

            {cases.map((c) => {
                const isSolved = solvedIds.includes(c.id);
                const selectedEv = selectedEvidenceByCase[c.id] || [];
                const selectedHyp = selectedHypothesisByCase[c.id] || '';
                const feedback = feedbackByCase[c.id];

                return (
                    <div key={c.id} className="p-4 border border-slate-200 rounded-2xl bg-white space-y-3 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div>
                                <div className="text-xs font-bold text-slate-900">
                                    [{c.id}] {c.title}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">
                                    Subject: {c.subjectName} ({c.subjectMaid}) • Institution: {c.institution}
                                </div>
                            </div>
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    isSolved
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                            >
                                {isSolved ? '✓ VERIFIED DETERMINATION' : `REWARD: +${c.rewardCredits} ₢ / +${c.rewardXP} XP / +${c.rewardBits} ◈`}
                            </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{c.symptomOrAnomaly}</p>

                        {/* Step 1: Select Corroborating Evidence */}
                        <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-700 uppercase">
                                1. Select Corroborating Exhibits (Exclude Unverified Rumors):
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {c.availableEvidence.map((ev) => {
                                    const checked = selectedEv.includes(ev.id);
                                    return (
                                        <label
                                            key={ev.id}
                                            className={`p-2.5 rounded-xl border text-left text-[11px] cursor-pointer transition flex items-start gap-2 ${
                                                checked
                                                    ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950'
                                                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100/70'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                disabled={isSolved}
                                                checked={checked}
                                                onChange={() => toggleEvidence(c.id, ev.id)}
                                                className="mt-0.5"
                                            />
                                            <div>
                                                <div className="font-bold">{ev.label}</div>
                                                <div className="text-[10px] text-slate-500 font-mono">Source: {ev.sourceApp}</div>
                                                <div className="text-[10px] text-slate-600 mt-0.5">{ev.detail}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Select Formal Hypothesis */}
                        <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-700 uppercase">
                                2. Select Formal Determination Hypothesis:
                            </div>
                            <div className="space-y-1.5">
                                {c.hypotheses.map((h) => {
                                    const chosen = selectedHyp === h.id;
                                    return (
                                        <label
                                            key={h.id}
                                            className={`p-2.5 rounded-xl border text-left text-[11px] cursor-pointer transition flex items-start gap-2 ${
                                                chosen
                                                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`hyp-${c.id}`}
                                                disabled={isSolved}
                                                checked={chosen}
                                                onChange={() =>
                                                    setSelectedHypothesisByCase({ ...selectedHypothesisByCase, [c.id]: h.id })
                                                }
                                                className="mt-0.5"
                                            />
                                            <div>
                                                <div className="font-bold">{h.title}</div>
                                                <div className="text-[10px] text-slate-600">{h.explanation}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {feedback && (
                            <div
                                className={`p-2.5 rounded-xl text-xs font-mono border ${
                                    feedback.ok
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                        : 'bg-rose-50 border-rose-200 text-rose-900'
                                }`}
                            >
                                {feedback.message}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSubmitCase(c.id)}
                                disabled={isSolved}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                {isSolved ? '✓ Case Filed in Canonical Registry' : 'Submit Formal Determination'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ==========================================
// 1. Faith Medical Intranet (faithmed.aure)
// ==========================================
export function FaithMedPortal() {
    const player = useOSStore((s) => s.gameplay?.player);
    const timeCycleCount = useOSStore((s) => s.gameplay?.timeCycleCount ?? 0);
    const runFaithDiagnosticScan = useOSStore((s) => s.runFaithDiagnosticScan);
    const treatFaithCondition = useOSStore((s) => s.treatFaithCondition);
    const completePatientCareAssignment = useOSStore((s) => s.completePatientCareAssignment);
    const [clinicalMessage, setClinicalMessage] = useState<string | null>(null);
    const [selectedDiagByCase, setSelectedDiagByCase] = useState<Record<string, string>>({});
    const [selectedTxByCase, setSelectedTxByCase] = useState<Record<string, string>>({});
    const [patientFeedbackByCase, setPatientFeedbackByCase] = useState<Record<string, { ok: boolean; message: string }>>({});

    const isDiagnosed = Boolean(player?.faithDiagnosed);
    const scannedThisCycle = player?.lastFaithDiagnosticCycle === timeCycleCount;
    const activeConditions = player?.conditions || [];
    const completedPatientIds = player?.completedPatientCareIds || [];

    const handleIntakeScan = () => {
        if (!runFaithDiagnosticScan) return;
        const res = runFaithDiagnosticScan();
        setClinicalMessage(res.message);
    };

    const handleTreatCondition = (conditionName: string) => {
        if (!treatFaithCondition) return;
        const res = treatFaithCondition(conditionName);
        setClinicalMessage(res.message);
    };

    const handleCompletePatientCare = async (caseId: string) => {
        if (!completePatientCareAssignment) return;
        const diagId = selectedDiagByCase[caseId] || '';
        const txId = selectedTxByCase[caseId] || '';
        const res = completePatientCareAssignment(caseId, diagId, txId);
        setPatientFeedbackByCase({
            ...patientFeedbackByCase,
            [caseId]: res
        });
        if (res.ok) {
            const caseDef = PATIENT_CARE_ASSIGNMENTS.find(p => p.id === caseId);
            if (caseDef?.patientMaid) {
                const diagLabel = caseDef.diagnoses.find(d => d.id === diagId)?.label || diagId;
                const txLabel = caseDef.treatments.find(t => t.id === txId)?.label || txId;
                await syncFaithMedicalUpdate(caseDef.patientMaid, {
                    medicalSummary: `Inpatient discharge sign-off: Diagnosed ${diagLabel}, administered ${txLabel}`,
                    auraStatus: 'Stabilized Tier II',
                    attendingClinician: player?.name || 'Staff Clinician'
                });
            }
        }
    };

    const treatmentProtocols = [
        { id: 'Frostlung', title: 'Frostlung Syndrome', desc: 'Warm-essence thermal thaw', btnLabel: 'Apply Thaw', color: 'cyan' },
        { id: 'Sunspire Burn Fever', title: 'Sunspire Burn Fever', desc: 'Thermal cooling mapping', btnLabel: 'Cool Aura', color: 'amber' },
        { id: 'Veilwilt', title: 'Veilwilt Disorder', desc: 'Aura rest & memory seal', btnLabel: 'Seal Veil', color: 'purple' },
        { id: 'Riftspine Fracture', title: 'Riftspine Fracture', desc: 'Timeline drift stabilization', btnLabel: 'Re-align Spine', color: 'rose' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-ui select-none">
            <header className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
                        <Activity size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-display text-slate-900">Faith Medical Group</h1>
                        <p className="text-xs text-emerald-700 font-ui">Civic Health & Telemetry Intranet // faithmed.aure</p>
                    </div>
                </div>
                <div className="text-right text-xs font-ui">
                    <div className="text-slate-500">Patient Baseline ({isDiagnosed ? 'Calibrated' : 'Uncalibrated'})</div>
                    <div className="text-emerald-700 font-bold">Aura Integrity: {player?.auraHealth || 100}%</div>
                </div>
            </header>

            {/* Section A: Personal Healthcare — Aura Telemetry Scanner Banner */}
            <div className="p-5 border border-emerald-200 bg-emerald-50/70 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                    <h2 className="text-sm font-bold text-emerald-950 flex items-center gap-2 font-display">
                        <Activity size={18} className="text-emerald-700" /> Personal Healthcare: Baseline Aura Diagnostic
                    </h2>
                    <p className="text-xs text-emerald-800">
                        Routine personal scans and self-care restore Aura Integrity (+20%) and Stamina (+10) and unlock personal condition treatments. Professional Medical Career XP is earned by treating inpatients below.
                    </p>
                </div>
                <button
                    onClick={handleIntakeScan}
                    disabled={scannedThisCycle}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 font-ui cursor-pointer"
                >
                    {scannedThisCycle
                        ? '✓ Telemetry Calibrated (This Cycle)'
                        : isDiagnosed
                        ? 'Re-Calibrate Cycle Scan (+20% Aura)'
                        : 'Run Baseline Scan (+20% Aura, +10 Stamina)'}
                </button>
            </div>

            {clinicalMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-900">
                    [MEDSTAT TELEMETRY]: {clinicalMessage}
                </div>
            )}

            {/* Staff & Patient Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attending Physicians</h3>
                    <div className="text-xs space-y-1 font-mono text-slate-600">
                        <div>• Dr. Ilyra Saint (Chief Bio-Aura Diagnostics)</div>
                        <div>• Maris Neryn (Spring Essence Specialist)</div>
                        <div>• Kael Frostbourne (Cryo-Recovery Unit)</div>
                    </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Personal Telemetry #FM-88392</h3>
                    <div className="text-xs space-y-1 font-mono text-slate-600">
                        <div>Diagnostic Status: <strong className={isDiagnosed ? 'text-emerald-700' : 'text-amber-700'}>{isDiagnosed ? 'Verified Baseline' : 'Scan Required Prior to Treatment'}</strong></div>
                        <div>Active Conditions: <span className="font-bold text-rose-600">{activeConditions.length > 0 ? activeConditions.join(', ') : 'None (Stable Resonance)'}</span></div>
                        <div>Treated History: <span className="text-indigo-600 font-bold">{(player?.treatedConditionsHistory || []).join(', ') || 'No prior interventions'}</span></div>
                    </div>
                </div>
            </div>

            {/* Personal Condition Treatment Matrix */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Personal Veil Exposure Treatment Protocols</h3>
                    <span className="text-[11px] font-mono text-slate-500">
                        Requires Baseline Scan + Active Condition Diagnosis (+25% Aura & +10 Stamina on verified cure)
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                    {treatmentProtocols.map((proto) => {
                        const hasCondition = activeConditions.includes(proto.id);
                        const canTreat = isDiagnosed && hasCondition;
                        return (
                            <div key={proto.id} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="font-bold text-slate-900">{proto.title}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${hasCondition ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'}`}>
                                            {hasCondition ? 'ACTIVE' : 'CLEAR'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 mt-1">{proto.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleTreatCondition(proto.id)}
                                    disabled={!canTreat}
                                    className="mt-2 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-[10px] transition cursor-pointer"
                                >
                                    {!isDiagnosed
                                        ? 'Scan Required'
                                        : hasCondition
                                        ? `${proto.btnLabel} (+25% Aura)`
                                        : 'No Active Exposure'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section B: Professional Medical Work — Inpatient Clinical Care Queue (FAITH-003) */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck size={14} className="text-emerald-700" /> Inpatient Clinical Care Queue (Professional Medical Practice)
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">
                        Treated Inpatients: {completedPatientIds.length}/{PATIENT_CARE_ASSIGNMENTS.length} • Medical Career Rank {player?.careers?.medical?.rankIndex || 0} ({player?.careers?.medical?.xp || 0} XP)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PATIENT_CARE_ASSIGNMENTS.map((pt) => {
                        const isCompleted = completedPatientIds.includes(pt.id);
                        const chosenDiag = selectedDiagByCase[pt.id] || '';
                        const chosenTx = selectedTxByCase[pt.id] || '';
                        const fb = patientFeedbackByCase[pt.id];

                        return (
                            <div key={pt.id} className="p-4 border border-emerald-200 rounded-2xl bg-white space-y-3 shadow-xs">
                                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                                    <div>
                                        <div className="text-xs font-bold text-slate-900">
                                            {pt.patientName} <span className="font-mono text-[10px] text-slate-500">({pt.patientMaid})</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-emerald-700">{pt.ward}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                        isCompleted
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            : 'bg-teal-50 text-teal-800 border border-teal-200'
                                    }`}>
                                        {isCompleted ? '✓ CHART SIGNED' : `+${pt.rewardCareerXP} Med Career XP / +${pt.rewardCredits} ₢`}
                                    </span>
                                </div>

                                <p className="text-[11px] text-slate-700 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                    <strong>Presenting Vitals:</strong> {pt.presentingVitals}
                                </p>

                                {/* Step 1: Clinical Diagnosis */}
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-700 uppercase">1. Select Clinical Diagnosis:</div>
                                    {pt.diagnoses.map((d) => (
                                        <label
                                            key={d.id}
                                            className={`p-2 rounded-xl border text-[11px] flex items-center gap-2 cursor-pointer transition ${
                                                chosenDiag === d.id
                                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`diag-${pt.id}`}
                                                disabled={isCompleted}
                                                checked={chosenDiag === d.id}
                                                onChange={() => setSelectedDiagByCase({ ...selectedDiagByCase, [pt.id]: d.id })}
                                            />
                                            <span>{d.label}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Step 2: Treatment Protocol */}
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-700 uppercase">2. Select Treatment Protocol:</div>
                                    {pt.treatments.map((t) => (
                                        <label
                                            key={t.id}
                                            className={`p-2 rounded-xl border text-[11px] flex items-center gap-2 cursor-pointer transition ${
                                                chosenTx === t.id
                                                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-semibold'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`tx-${pt.id}`}
                                                disabled={isCompleted}
                                                checked={chosenTx === t.id}
                                                onChange={() => setSelectedTxByCase({ ...selectedTxByCase, [pt.id]: t.id })}
                                            />
                                            <span>{t.label}</span>
                                        </label>
                                    ))}
                                </div>

                                {fb && (
                                    <div className={`p-2 rounded-xl text-[11px] font-mono border ${
                                        fb.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                                    }`}>
                                        {fb.message}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleCompletePatientCare(pt.id)}
                                    disabled={isCompleted}
                                    className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition cursor-pointer"
                                >
                                    {isCompleted ? '✓ Inpatient Care Completed' : 'Administer Clinical Care & Sign Chart'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pillar III Clinical Forensic Triage Cases */}
            <FormalCaseReasoningBoard filterInstitution="Faith Medical" />
        </div>
    );
}

// ==========================================
// 2. DGA Government Portal (dga.gov)
// ==========================================
export function DGAPortal() {
    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-blue-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Shield size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Department of Global Affairs</h1>
                        <p className="text-xs text-blue-600 font-mono">DGA • Department of Global Affairs • dga.gov</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs rounded-full">Official Government Network</span>
            </header>

            <div className="p-5 border border-blue-200 bg-blue-50/60 rounded-2xl space-y-3 shadow-xs">
                <h2 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <Shield size={18} className="text-blue-600" /> Executive Directive 14-B Notice
                </h2>
                <p className="text-xs text-blue-800 leading-relaxed font-mono">
                    All provisional citizens must complete biometrics verification at the Citizen Record bureau (`passport`). Failure to maintain clearance level 1 results in access restrictions across city gateways.
                </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2 font-mono text-xs shadow-xs">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider">Public Advisories</h3>
                <div className="text-slate-600">• PRISM Signal Anomaly detected in Sector 4. Citizens advised to report corrupted binary runes.</div>
            </div>

            {/* Pillar III DGA / TRACE Forensic Investigation Board */}
            <FormalCaseReasoningBoard filterInstitution="DGAOS" />
        </div>
    );
}

// ==========================================
// 3. Cycademy Academic Portal (cyacademy.edu)
// ==========================================
export function CyacademyPortal() {
    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-purple-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Building size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Cycademy of Sciences</h1>
                        <p className="text-xs text-purple-600 font-mono">Academic Portal & Student Registry • cyacademy.edu</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-purple-200 bg-white rounded-xl space-y-2 shadow-xs">
                    <h3 className="text-xs font-bold text-purple-900 uppercase">Faculty Roster</h3>
                    <div className="text-xs font-mono text-slate-700 space-y-1">
                        <div>• Dean Cassian Rook (Cybernetics)</div>
                        <div>• Prof. Archmage Hex (Spell Algorithms)</div>
                    </div>
                </div>
                <div className="p-4 border border-slate-200 bg-white rounded-xl space-y-2 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase">Student Directory</h3>
                    <div className="text-xs font-mono text-slate-700 space-y-1">
                        <div>• Jeremie (Signal Engineering)</div>
                        <div>• Aelita (Code Weaver)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 4. Orynvell Public Records (records.orynvell.gov)
// ==========================================
export function OrynvellRecordsPortal() {
    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-amber-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                        <FileText size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Orynvell Public Records</h1>
                        <p className="text-xs text-amber-700 font-mono">Property Deeds & Background Filings • records.orynvell.gov</p>
                    </div>
                </div>
            </header>

            <div className="p-4 border border-amber-200 bg-white rounded-xl space-y-2 font-mono text-xs shadow-xs">
                <h3 className="font-bold text-amber-900">Deed Record #DEED-99401</h3>
                <div className="text-slate-700">Property: Subterranean Conduit Sector 7</div>
                <div className="text-slate-700">Owner: Aethercore Energy Trust (Pre-Collapse)</div>
                <div className="text-slate-700">Status: Classified Energy Grid Alignment</div>
            </div>
        </div>
    );
}

// ==========================================
// 5. First Orynvell Bank & Treasury (bank.aure / finance.oryn.gov)
// ==========================================
export function BankPortal() {
    const player = useOSStore((s) => s.gameplay?.player);
    const claimPortalAction = useOSStore((s) => s.claimPortalAction);
    const [authenticated, setAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [activeTab, setActiveTab] = useState<'vault' | 'ledger'>('vault');

    const auditSuccess = (player?.claimedPortalActionIds || []).includes('bank-wire-0994');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput.trim() === '0994' || pinInput.trim() === '8891' || pinInput.trim() === '1234' || pinInput.trim() === '') {
            setAuthenticated(true);
        } else {
            alert('Invalid PIN or Security Token! Try 0994, 8891, or 1234.');
        }
    };

    const handleHackAudit = () => {
        if (claimPortalAction) {
            claimPortalAction('bank-wire-0994', 300, 2, 50, 'Traced Suspect Wire Transfer #0994 in Oryn Treasury');
        }
    };

    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-ui select-none">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
                        <Landmark size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-display text-slate-900">Oryn Department of Finance</h1>
                        <p className="text-xs text-amber-700 font-mono">Banking, Treasury & Dual-Currency Accounts • bank.aure / finance.oryn.gov</p>
                    </div>
                </div>
                {authenticated && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('vault')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'vault' ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            Treasury Vault
                        </button>
                        <button
                            onClick={() => setActiveTab('ledger')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'ledger' ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            Live Crypto Ledger
                        </button>
                    </div>
                )}
            </header>

            {!authenticated ? (
                <div className="max-w-md mx-auto p-6 border border-slate-200 bg-white rounded-2xl space-y-4 text-center shadow-xs">
                    <Lock className="text-amber-600 mx-auto" size={32} />
                    <h2 className="text-base font-bold text-slate-900">Authenticated Banking & Treasury Portal</h2>
                    <p className="text-xs text-slate-500">Enter Security PIN (e.g. 0994, 8891, or 1234)</p>
                    <form onSubmit={handleLogin} className="space-y-3">
                        <input
                            type="password"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            placeholder="Enter PIN (e.g. 1234)..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-sm outline-none font-mono text-slate-800 focus:border-amber-400 focus:bg-white"
                        />
                        <button type="submit" className="w-full py-2.5 bg-amber-300 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-xl transition shadow-xs cursor-pointer">
                            Unlock Financial Vault
                        </button>
                    </form>
                </div>
            ) : activeTab === 'ledger' ? (
                <FinanceTerminal />
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 border border-amber-200 bg-amber-50/70 rounded-2xl shadow-xs">
                            <div className="text-xs text-amber-900 font-bold uppercase tracking-wider">Primary Currency Balance</div>
                            <div className="text-2xl font-bold text-amber-950 font-mono mt-1">{player?.credits || 0} ₢ CREDITS</div>
                            <div className="text-[11px] text-amber-800/80 mt-1">Sourced from career work shifts, trade & civic service</div>
                        </div>
                        <div className="p-5 border border-emerald-200 bg-emerald-50/70 rounded-2xl shadow-xs">
                            <div className="text-xs text-emerald-900 font-bold uppercase tracking-wider">Secondary Rare Currency</div>
                            <div className="text-2xl font-bold text-emerald-950 font-mono mt-1">{player?.bits || 0} ◈ BITS</div>
                            <div className="text-[11px] text-emerald-800/80 mt-1">Rare crystalline micro-currency for luxury upgrades</div>
                        </div>
                    </div>

                    <div className="p-4 border border-slate-200 bg-white rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xs">
                        <div>
                            <div className="text-xs font-bold text-slate-900">Direct Deposit & Rent Audit Status</div>
                            <div className="text-[11px] text-slate-500 font-mono">Automatic monthly stipend and housing subsidies active</div>
                        </div>
                        <button
                            onClick={handleHackAudit}
                            disabled={auditSuccess}
                            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition disabled:opacity-50 cursor-pointer"
                        >
                            {auditSuccess ? 'Audit Wire Traced (+300 ₢, +2 ◈)' : 'Trace Suspect Wire Transfer (#0994)'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// 6. CIVINET Municipal Services Hub (civinet.mer)
// ==========================================
export function CivinetPortal() {
    return <section className="workspace-transition"><Landmark size={30}/><span className="workspace-kicker">Citizen Hub / formerly CIVINET</span><h1>Your civic services have a new home.</h1><p>Open Citizen Hub for personal services, civic support, residence, and your document history. Your existing support claim and saved progress are retained.</p><button onClick={() => useOSStore.getState().openAppWorkspace('passport', 'services')}>Open Citizen Hub <ArrowRight size={15}/></button></section>;
}

// ==========================================
// 7. QUESTNOTICE Public Errands (questnotice.mer)
// ==========================================
export function QuestNoticePortal() {
    const claimedTasks = useOSStore(s => s.gameplay.player.claimedPortalActionIds || []);
    const listings = [
        { id: 'qn-web-1', title: 'Library Return Cart Sorting', desc: 'Sort 20 returned volumes by catalog number in the East Reading Room.' },
        { id: 'qn-web-2', title: 'Lost Familiar Trace in Sector 4', desc: 'Search for a glowing cyan sprite near the central district water fountain.' },
        { id: 'qn-web-3', title: 'Apothecary Herb Delivery', desc: 'Deliver dried Sunspire blossom bundles to Faith Medical Clinic Ward 2.' },
    ];
    return (
        <section className="workspace-transition">
            <FileText size={30}/>
            <span className="workspace-kicker">QUESTNOTICE / WORKNET</span>
            <h1>Civic work, together.</h1>
            <p>Neighborhood jobs and playable assignments are managed in WORKNET. Review the work, complete its objectives, and submit it there.</p>
            <button onClick={() => useOSStore.getState().openAppWorkspace('jobs', 'civic-jobs')}>
                Open civic jobs in WORKNET <ArrowRight size={15}/>
            </button>
            <details style={{ marginTop: 28 }}>
                <summary>Earlier public listings</summary>
                <p>Earlier completion records are retained. These archived listings do not issue additional rewards.</p>
                {listings.map(item => <article key={item.id} style={{ marginTop: 20 }}>
                    <h2 style={{ fontSize: 15 }}>{item.title}</h2>
                    <p>{item.desc}</p>
                    <small>{claimedTasks.includes(item.id) ? 'Previously completed' : 'Archived listing'}</small>
                </article>)}
            </details>
        </section>
    );
}

// ==========================================
// 8. Royal Historic Society (royalhistory.mer)
// ==========================================
export function RoyalHistoryPortal() {
    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] text-slate-800 min-h-full font-serif select-none">
            <header className="flex items-center justify-between border-b border-cyan-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <BookOpen size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Royal Historic Society</h1>
                        <p className="text-xs text-cyan-700 font-mono">Restricted Dynastic & Succession Archive • royalhistory.mer</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-mono rounded-full font-bold">
                    Classified Council Access
                </span>
            </header>

            <div className="p-5 border border-cyan-200 bg-white rounded-2xl space-y-3 font-sans shadow-xs">
                <h3 className="text-sm font-bold text-cyan-950 font-serif">Sealed Council Charter of Succession (Pre-Collapse)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Treaty archives confirm the sovereign authority of the Seraphima lineage across upper Orynvell. High-clearance Archivist research unlocks restricted genealogical codices and early AETHERCORE energy grid blueprints.
                </p>
            </div>
        </div>
    );
}

// ==========================================
// 9. CargoTrack Logistics (shipping.aure)
// ==========================================
export function ShippingPortal() {
    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-orange-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
                        <Truck size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">CargoTrack Logistics</h1>
                        <p className="text-xs text-orange-600 font-mono">Package Manifests & Shipment Tracking • shipping.aure</p>
                    </div>
                </div>
            </header>

            <div className="p-4 border border-orange-200 bg-white rounded-xl space-y-2 font-mono text-xs shadow-xs">
                <h3 className="font-bold text-orange-900">Package Manifest #CG-8821</h3>
                <div className="text-slate-700">Cargo: Unrefined Mana Crystals</div>
                <div className="text-slate-700">Destination: Sector 3 Warehouse</div>
                <div className="text-slate-700">Status: In Transit (Arriving 05:00 PM)</div>
            </div>
        </div>
    );
}

// ==========================================
// 10. Vector DarkNet (.onion)
// ==========================================
export function DarkWebOnionPortal() {
    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] text-slate-800 min-h-full font-mono select-none">
            <header className="flex items-center justify-between border-b border-purple-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Eye size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-purple-950">Vector DarkNet (.onion)</h1>
                        <p className="text-xs text-purple-700">Anonymized Encrypted Onion Relay</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs rounded-full">Encrypted Onion Route</span>
            </header>

            <div className="p-4 border border-purple-200 bg-white rounded-xl space-y-2 text-xs shadow-xs">
                <div className="text-purple-900 font-bold">[DARKNET LEAK #0x49] PRISM Frequency Intercept</div>
                <p className="text-slate-600 leading-relaxed">
                    Underground signal relay established. Binary runes propagating through Sector 3 node gateways. Key cipher: lightborn.
                </p>
            </div>
        </div>
    );
}

export { MaiSpacePortal } from './MaiSpacePortal';
