import React, { useState } from 'react';
import { 
    Activity, Shield, Building, FileText, Landmark, Truck, Eye, 
    Lock, CheckCircle2, AlertTriangle, Key, Search, ArrowRight, UserCheck, RefreshCw, User, BookOpen,
    Coins, ArrowUpRight, Download, Send, Terminal, Radio, Sparkles, Compass
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { FORMAL_INVESTIGATION_CASES, PATIENT_CARE_ASSIGNMENTS } from '../../gameplay/WorldEventEngine';
import Button from '../../components/ui/button';
import FinanceTerminal from '../FinanceTerminal';
import { syncFaithMedicalUpdate, syncDgaInvestigativeUpdate } from '../../integration/citizenBridge';
import { SoundFX } from '../../utils/audio';

// ==========================================
// Shared Universal AureID / Citizen MAID Bar
// ==========================================
export function CitizenAureIdBar({ portalName }: { portalName: string }) {
    const player = useOSStore((s) => s.gameplay?.player);
    const clearance = player?.clearanceLevel ?? 1;

    return (
        <div className="mb-4 p-2.5 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-2xs">
            <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <UserCheck size={16} />
                </div>
                <div>
                    <span className="font-bold text-slate-800">{player?.name || 'Citizen'}</span>
                    <span className="text-slate-400 ml-2">[{player?.identity?.citizenId || 'MAID-9041-AURE'}]</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[10px]">
                    CLEARANCE TIER {clearance} ({clearance >= 2 ? 'AUTHORIZED' : 'PROVISIONAL'})
                </span>
                <span className="text-amber-700 font-bold">{player?.credits ?? 0} ₡</span>
                <span className="text-emerald-700 font-bold">{player?.bits ?? 0} ◈</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-bold border border-emerald-200">
                    SSO LINKED // {portalName}
                </span>
            </div>
        </div>
    );
}

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
            SoundFX.playCoin();
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
                                {isSolved ? '✓ VERIFIED DETERMINATION' : `REWARD: +${c.rewardCredits} ₡ / +${c.rewardXP} XP / +${c.rewardBits} ◈`}
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
                                                className="mt-0.5 rounded"
                                            />
                                            <div>
                                                <div className="font-bold">{ev.label}</div>
                                                <div className="text-[10px] text-slate-500">{ev.detail}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Select Formal Hypothesis */}
                        <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-700 uppercase">
                                2. Formulate Probative Hypothesis:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
    const addXP = useOSStore((s) => s.addXP);

    const [clinicalMessage, setClinicalMessage] = useState<string | null>(null);
    const [selectedDiagByCase, setSelectedDiagByCase] = useState<Record<string, string>>({});
    const [selectedTxByCase, setSelectedTxByCase] = useState<Record<string, string>>({});
    const [patientFeedbackByCase, setPatientFeedbackByCase] = useState<Record<string, { ok: boolean; message: string }>>({});
    const [downloadedChart, setDownloadedChart] = useState(false);

    const isDiagnosed = Boolean(player?.faithDiagnosed);
    const scannedThisCycle = player?.lastFaithDiagnosticCycle === timeCycleCount;
    const activeConditions = player?.conditions || [];

    const handleIntakeScan = () => {
        if (!runFaithDiagnosticScan) return;
        const res = runFaithDiagnosticScan();
        setClinicalMessage(res.message);
        SoundFX.playCoin();
    };

    const handleTreatCondition = (conditionName: string) => {
        if (!treatFaithCondition) return;
        const res = treatFaithCondition(conditionName);
        setClinicalMessage(res.message);
        SoundFX.playCoin();
    };

    const handleDownloadChart = () => {
        setDownloadedChart(true);
        SoundFX.playCoin();
        if (addXP) addXP(20);
        setTimeout(() => setDownloadedChart(false), 3000);
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
            SoundFX.playCoin();
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
        { id: 'Frostlung', title: 'Frostlung Syndrome', desc: 'Warm-essence thermal thaw', btnLabel: 'Apply Thaw' },
        { id: 'Sunspire Burn Fever', title: 'Sunspire Burn Fever', desc: 'Thermal cooling mapping', btnLabel: 'Cool Aura' },
        { id: 'Veilwilt', title: 'Veilwilt Disorder', desc: 'Aura rest & memory seal', btnLabel: 'Seal Veil' },
        { id: 'Riftspine Fracture', title: 'Riftspine Fracture', desc: 'Timeline drift stabilization', btnLabel: 'Re-align Spine' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-sans select-none">
            <CitizenAureIdBar portalName="Faith Medical Intranet" />

            <header className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
                        <Activity size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-display text-slate-900">Faith Medical Group</h1>
                        <p className="text-xs text-emerald-700 font-mono">Civic Health & Telemetry Intranet // faithmed.aure</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadChart}
                        className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                        <Download size={13} /> {downloadedChart ? 'Chart Downloaded (+20 XP)' : 'Download Clinical Chart'}
                    </button>
                    <div className="text-right text-xs">
                        <div className="text-slate-500">Patient Baseline ({isDiagnosed ? 'Calibrated' : 'Uncalibrated'})</div>
                        <div className="text-emerald-700 font-bold">Aura Integrity: {player?.auraHealth || 100}%</div>
                    </div>
                </div>
            </header>

            {/* Baseline Aura Diagnostic Banner */}
            <div className="p-5 border border-emerald-200 bg-emerald-50/70 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                    <h2 className="text-sm font-bold text-emerald-950 flex items-center gap-2 font-display">
                        <Activity size={18} className="text-emerald-700" /> Personal Baseline Aura Telemetry Scan
                    </h2>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                        Routine personal diagnostic scans restore Aura Integrity (+20%) and Stamina (+10). Clinical Inpatient care below awards formal medical career advancement.
                    </p>
                </div>
                <button
                    onClick={handleIntakeScan}
                    disabled={scannedThisCycle}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                >
                    {scannedThisCycle ? '✓ Baseline Scanned' : 'Run Aura Baseline Scan (+Stipend)'}
                </button>
            </div>

            {clinicalMessage && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-mono">
                    {clinicalMessage}
                </div>
            )}

            {/* Treatment Protocols */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Treatment Protocols</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {treatmentProtocols.map(proto => (
                        <div key={proto.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                            <div className="font-bold text-xs text-slate-900">{proto.title}</div>
                            <div className="text-[11px] text-slate-500">{proto.desc}</div>
                            <button
                                onClick={() => handleTreatCondition(proto.id)}
                                className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                                {proto.btnLabel}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Formal Case Reasoning Board */}
            <FormalCaseReasoningBoard filterInstitution="Faith Medical" />
        </div>
    );
}

// ==========================================
// 2. DGA Government Portal (dga.gov.aure)
// ==========================================
export function DGAPortal() {
    const player = useOSStore((s) => s.gameplay?.player);
    const addXP = useOSStore((s) => s.addXP);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<any | null>(null);
    const [bypassCipher, setBypassCipher] = useState('');
    const [bypassFeedback, setBypassFeedback] = useState<string | null>(null);

    // Canonical Citizen Clearance Directory
    const citizenRegistry = [
        { name: 'Director Vane', maid: 'MAID-0010-DIR', dept: 'Executive Council & Municipal Intelligence', clearance: 'Tier 3 (Master)', status: 'ACTIVE DIRECTIVES LEAD' },
        { name: 'Agent Mara Thorne', maid: 'MAID-0492-OPS', dept: 'DGA Tactical & TRACE Forensic Bureau', clearance: 'Tier 2 (High Clearance)', status: 'BROAD STREET LEAD AGENT' },
        { name: 'Jeremie Belpois', maid: 'MAID-7721-CYC', dept: 'Cyacademy Compiler Lab 4', clearance: 'Tier 2 (Academic Auth)', status: 'DIAGNOSTIC ADVISOR' },
        { name: 'Aelita Schaeffer', maid: 'MAID-7722-CYC', dept: 'Cyacademy Research / Node Liaison', clearance: 'Tier 2 (Academic Auth)', status: 'SUBTERRANEAN CONTACT' },
        { name: 'Dr. Sharon Voss', maid: 'MAID-3391-MED', dept: 'Faith Medical & Deep Telemetry', clearance: 'Tier 2 (Clinical Auth)', status: 'PRISM CHIEF RESEARCHER' },
        { name: 'Dr. Franz Hopper', maid: 'MAID-0001-ARCH', dept: 'Pre-Collapse Network Architect', clearance: 'Tier 3 (Classified)', status: 'HISTORICAL ARCHIVE SEAL' },
    ];

    const handleSearchCitizen = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim().toLowerCase();
        if (!q) return;

        const found = citizenRegistry.find(c => 
            c.name.toLowerCase().includes(q) || c.maid.toLowerCase().includes(q)
        );

        if (found) {
            setSearchResult(found);
            SoundFX.playSnap();
        } else if (player?.name && (player.name.toLowerCase().includes(q) || (player.identity?.citizenId || '').toLowerCase().includes(q))) {
            setSearchResult({
                name: player.name,
                maid: player.identity?.citizenId || 'MAID-9041-AURE',
                dept: 'Provisional Citizenry & Field Investigations',
                clearance: `Tier ${player.clearanceLevel ?? 1} (${(player.clearanceLevel ?? 1) >= 2 ? 'AUTHORIZED' : 'PROVISIONAL'})`,
                status: 'ONLINE · CITIZEN SSO ACTIVE'
            });
            SoundFX.playSnap();
        } else {
            setSearchResult({ notFound: true, query: searchQuery });
        }
    };

    const handleCipherBypass = (e: React.FormEvent) => {
        e.preventDefault();
        const cipher = bypassCipher.trim().toLowerCase();
        if (cipher === '0x8891' || cipher === 'dga-alpha-9' || cipher === 'trace-clear') {
            SoundFX.playCoin();
            setBypassFeedback('AUTHORIZATION VERIFIED: Clearance elevated to Tier 2 Authorized. Subterranean Conduit Sector 7 research privileges granted (+150 XP).');
            if (addXP) addXP(150);
        } else {
            SoundFX.playSnap();
            setBypassFeedback('SECURITY CIPHER REJECTED: Invalid municipal bypass token. Check AureMail dispatches.');
        }
    };

    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-sans select-none">
            <CitizenAureIdBar portalName="DGA Central Gateway" />

            <header className="flex items-center justify-between border-b border-blue-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Shield size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Directorate of Global Affairs</h1>
                        <p className="text-xs text-blue-600 font-mono">DGA Public Security & Clearance Registry • dga.gov.aure</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs rounded-full">
                    Official Government Network
                </span>
            </header>

            {/* Directive Notice */}
            <div className="p-5 border border-blue-200 bg-blue-50/60 rounded-2xl space-y-2 shadow-xs">
                <h2 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <Shield size={18} className="text-blue-600" /> Executive Directive 14-B: Curfew & Verification
                </h2>
                <p className="text-xs text-blue-800 leading-relaxed font-mono">
                    Provisional citizens must maintain synchronized MAID biometrics. Sector 3 (Warehouse District) remains under active curfew following the unauthorized diversion of Manifest CG-8821.
                </p>
            </div>

            {/* Citizen Clearance Registry Search */}
            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-3 shadow-xs">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Search size={14} className="text-blue-600" /> Search Citizen Clearance Registry
                </h3>
                <form onSubmit={handleSearchCitizen} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search citizen by name or MAID (e.g. Vane, Thorne, Belpois, Aelita)..."
                        className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                        Lookup MAID
                    </button>
                </form>

                {searchResult && (
                    <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs space-y-1">
                        {searchResult.notFound ? (
                            <div className="text-rose-700 font-bold">No registered citizen found matching "{searchResult.query}".</div>
                        ) : (
                            <>
                                <div className="font-bold text-blue-950 flex items-center justify-between">
                                    <span>{searchResult.name} ({searchResult.maid})</span>
                                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{searchResult.clearance}</span>
                                </div>
                                <div className="text-slate-600">Department: {searchResult.dept}</div>
                                <div className="text-[11px] text-slate-500">Status: {searchResult.status}</div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Security Cipher Bypass Terminal */}
            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-3 shadow-xs font-mono">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Key size={14} className="text-amber-600" /> Security Clearance Elevation Terminal
                    </h3>
                    <span className="text-[10px] text-slate-400">Supported: #0x8891, #DGA-ALPHA-9</span>
                </div>
                <form onSubmit={handleCipherBypass} className="flex gap-2">
                    <input
                        type="text"
                        value={bypassCipher}
                        onChange={(e) => setBypassCipher(e.target.value)}
                        placeholder="Enter clearance authorization cipher..."
                        className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                        Verify Token
                    </button>
                </form>
                {bypassFeedback && (
                    <div className="p-2.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">
                        {bypassFeedback}
                    </div>
                )}
            </div>

            {/* Formal Case Reasoning Board */}
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
            <CitizenAureIdBar portalName="Cycademy Academic Portal" />

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
                        <div>• Dean Cassian Rook (Cybernetics & Orientation)</div>
                        <div>• Prof. Archmage Hex (Algorithmic Spellcraft)</div>
                        <div>• Dr. Franz Hopper (Pre-Collapse Virtual Dimensions)</div>
                    </div>
                </div>
                <div className="p-4 border border-slate-200 bg-white rounded-xl space-y-2 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase">Compiler Lab 4 Directory</h3>
                    <div className="text-xs font-mono text-slate-700 space-y-1">
                        <div>• Jeremie Belpois (Signal Engineering & Decryption)</div>
                        <div>• Aelita Schaeffer (Code Weaver & Node Custodian)</div>
                        <div>• Ulrich Stern & Odd Della Robbia (Field Testing)</div>
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
            <CitizenAureIdBar portalName="Orynvell Deeds Bureau" />

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
                <div className="text-slate-700">Access Key: Cipher #0x8891 Verified</div>
                <div className="text-slate-700">Status: Classified Energy Grid Alignment</div>
            </div>
        </div>
    );
}

// ==========================================
// 5. First Federal Bank of Aureline (bank.aure)
// ==========================================
export function BankPortal() {
    const player = useOSStore((s) => s.gameplay?.player);
    const addCredits = useOSStore((s) => s.addCredits);
    const claimPortalAction = useOSStore((s) => s.claimPortalAction);

    const [authenticated, setAuthenticated] = useState(true); // Auto-SSO with MAID
    const [activeTab, setActiveTab] = useState<'vault' | 'transfer' | 'crypto'>('vault');
    
    // Wire Transfer Form
    const [recipientMaid, setRecipientMaid] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferMemo, setTransferMemo] = useState('');
    const [transferReceipt, setTransferReceipt] = useState<any | null>(null);
    const [transferError, setTransferError] = useState<string | null>(null);

    // Live Ledger State
    const [ledger, setLedger] = useState([
        { id: 'TX-0994', time: '10:14 AM', type: 'INTERCEPT', account: '#0994-AURA', amount: -50000, memo: 'Offshore Conduit Liquidation (Broad Street)', status: 'FLAGGED' },
        { id: 'TX-1042', time: '09:00 AM', type: 'DIRECT DEPOSIT', account: 'MUNICIPAL PAYROLL', amount: 350, memo: 'Citizen Bi-Weekly Telemetry Stipend', status: 'CLEARED' },
        { id: 'TX-1041', time: '08:30 AM', type: 'SERVICE FEE', account: 'AURELINE TRANSIT', amount: -15, memo: 'Sector 3 Express Platform Fare', status: 'CLEARED' },
    ]);

    const auditSuccess = (player?.claimedPortalActionIds || []).includes('bank-wire-0994');

    const handleExecuteWire = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseInt(transferAmount, 10);
        if (isNaN(amt) || amt <= 0) {
            setTransferError('Enter a valid credit amount to wire.');
            return;
        }

        const currentCredits = player?.credits ?? 0;
        if (amt > currentCredits) {
            setTransferError(`Insufficient credit balance. You have ${currentCredits} ₡.`);
            return;
        }

        const recipient = recipientMaid.trim() || 'MAID-4402-CIV';
        const memo = transferMemo.trim() || 'Civic Settlement';
        const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;

        // Deduct credits via store
        if (addCredits) addCredits(-amt);

        const newEntry = {
            id: txId,
            time: 'JUST NOW',
            type: 'OUTGOING WIRE',
            account: recipient,
            amount: -amt,
            memo: memo,
            status: 'SETTLED'
        };

        setLedger(prev => [newEntry, ...prev]);
        setTransferReceipt({
            txId,
            recipient,
            amount: amt,
            memo,
            hash: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`
        });
        setTransferError(null);
        setRecipientMaid('');
        setTransferAmount('');
        setTransferMemo('');
        SoundFX.playCoin();
    };

    const handleHackAudit = () => {
        if (claimPortalAction) {
            claimPortalAction('bank-wire-0994', 300, 2, 50, 'Traced Suspect Wire Transfer #0994 in Oryn Treasury');
            SoundFX.playCoin();
        }
    };

    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-sans select-none">
            <CitizenAureIdBar portalName="First Federal Bank of Aureline" />

            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
                        <Landmark size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-display text-slate-900">First Federal Bank of Aureline</h1>
                        <p className="text-xs text-amber-700 font-mono">Civic Accounts, Staking & Wire Settlements • bank.aure</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('vault')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'vault' ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >
                        Account Vault
                    </button>
                    <button
                        onClick={() => setActiveTab('transfer')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'transfer' ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >
                        Wire Transfer
                    </button>
                    <button
                        onClick={() => setActiveTab('crypto')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'crypto' ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >
                        Crypto Ledger
                    </button>
                </div>
            </header>

            {/* Broad Street Investigation Banner */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between shadow-2xs font-mono text-xs">
                <div className="space-y-0.5">
                    <div className="font-bold text-amber-950 flex items-center gap-2">
                        <AlertTriangle size={15} className="text-amber-700" />
                        <span>Broad Street Branch Maintenance Alert</span>
                    </div>
                    <div className="text-amber-800 text-[11px]">
                        Seismic inspection underway beneath Vault 4. Trace suspects wire #0994 routed into subterranean conduit 7.
                    </div>
                </div>
                <button
                    onClick={handleHackAudit}
                    disabled={auditSuccess}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                >
                    {auditSuccess ? '✓ Audit Traced (+300 ₡)' : 'Trace Wire #0994'}
                </button>
            </div>

            {activeTab === 'crypto' ? (
                <FinanceTerminal />
            ) : activeTab === 'transfer' ? (
                /* Interactive Wire Transfer Terminal */
                <div className="max-w-xl mx-auto p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Send size={16} className="text-amber-600" /> Transmit Municipal Wire Transfer
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                        Available Balance: <strong className="text-amber-700">{player?.credits ?? 0} ₡</strong>
                    </p>

                    <form onSubmit={handleExecuteWire} className="space-y-3 font-mono text-xs">
                        <div>
                            <label className="block text-slate-600 font-bold mb-1">Destination Citizen MAID / Account:</label>
                            <input
                                type="text"
                                value={recipientMaid}
                                onChange={(e) => setRecipientMaid(e.target.value)}
                                placeholder="e.g. MAID-7721-CYC or #0994-AURA"
                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-bold mb-1">Transfer Amount (₡ Credits):</label>
                            <input
                                type="number"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                placeholder="Enter amount..."
                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-600 font-bold mb-1">Reference Memo:</label>
                            <input
                                type="text"
                                value={transferMemo}
                                onChange={(e) => setTransferMemo(e.target.value)}
                                placeholder="e.g. Lab 4 Spell Module Bounty"
                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                            />
                        </div>

                        {transferError && (
                            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
                                {transferError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                        >
                            Confirm Wire Transfer
                        </button>
                    </form>

                    {transferReceipt && (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl space-y-1 font-mono text-xs">
                            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                                <CheckCircle2 size={15} /> Wire Settled [{transferReceipt.txId}]
                            </div>
                            <div>Recipient: {transferReceipt.recipient} · Amount: -{transferReceipt.amount} ₡</div>
                            <div className="text-[10px] text-emerald-700">Audit Hash: {transferReceipt.hash}</div>
                        </div>
                    )}
                </div>
            ) : (
                /* Account Vault & Transaction Ledger */
                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 border border-amber-200 bg-amber-50/70 rounded-2xl shadow-xs">
                            <div className="text-xs text-amber-900 font-bold uppercase tracking-wider">Primary Currency Balance</div>
                            <div className="text-2xl font-bold text-amber-950 font-mono mt-1">{player?.credits || 0} ₡ CREDITS</div>
                            <div className="text-[11px] text-amber-800/80 mt-1">Sourced from career work shifts, trade & civic service</div>
                        </div>
                        <div className="p-5 border border-emerald-200 bg-emerald-50/70 rounded-2xl shadow-xs">
                            <div className="text-xs text-emerald-900 font-bold uppercase tracking-wider">Secondary Rare Currency</div>
                            <div className="text-2xl font-bold text-emerald-950 font-mono mt-1">{player?.bits || 0} ◈ BITS</div>
                            <div className="text-[11px] text-emerald-800/80 mt-1">Rare crystalline micro-currency for encrypted terminal trade</div>
                        </div>
                    </div>

                    {/* Transaction Ledger */}
                    <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-3 shadow-xs font-mono text-xs">
                        <h3 className="font-bold text-slate-800 uppercase tracking-wider">Live Transaction Ledger</h3>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                            {ledger.map((item) => (
                                <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                                    <div className="space-y-0.5">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            <span>{item.memo}</span>
                                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${item.status === 'FLAGGED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">{item.time} · Account: {item.account} · [{item.id}]</div>
                                    </div>
                                    <div className={`font-bold font-mono text-sm ${item.amount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                        {item.amount > 0 ? `+${item.amount}` : item.amount} ₡
                                    </div>
                                </div>
                            ))}
                        </div>
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
    return (
        <section className="workspace-transition">
            <Landmark size={30}/>
            <span className="workspace-kicker">Citizen Hub / formerly CIVINET</span>
            <h1>Your civic services have a new home.</h1>
            <p>Open Citizen Hub for personal services, civic support, residence, and your document history. Your existing support claim and saved progress are retained.</p>
            <button onClick={() => useOSStore.getState().openAppWorkspace('passport', 'services')}>
                Open Citizen Hub <ArrowRight size={15}/>
            </button>
        </section>
    );
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
                {listings.map(item => (
                    <article key={item.id} style={{ marginTop: 20 }}>
                        <h2 style={{ fontSize: 15 }}>{item.title}</h2>
                        <p>{item.desc}</p>
                        <small>{claimedTasks.includes(item.id) ? 'Previously completed' : 'Archived listing'}</small>
                    </article>
                ))}
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
            <CitizenAureIdBar portalName="Royal Historic Society" />

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
    const addXP = useOSStore((s) => s.addXP);
    const addCredits = useOSStore((s) => s.addCredits);
    const [trackingCode, setTrackingCode] = useState('CG-8821');
    const [auditRevealed, setAuditRevealed] = useState(false);

    const manifests: Record<string, any> = {
        'CG-8821': {
            id: 'CG-8821',
            cargo: 'Unrefined Mana Crystals (120 Units)',
            origin: 'Kaelis Spire Foundries',
            scheduledDest: 'Sector 3 Central Warehouse',
            divertedDest: 'Subterranean Conduit Sector 7',
            status: 'FLAGGED / ROUTE DISCREPANCY',
            courier: 'Courier #C-42 (Status: Disappeared)',
            notes: 'Seals compromised. Radiation signature matches subterranean harmonic bleed.'
        },
        'MED-4402': {
            id: 'MED-4402',
            cargo: 'Bio-Aura Stabilizer Ampoules',
            origin: 'Lyria Spring Refineries',
            scheduledDest: 'Faith Medical Central Hospital',
            status: 'IN TRANSIT // ON SCHEDULE',
            courier: 'Aureline Medical Transit',
            notes: 'Temperature regulation steady at 37.2°C.'
        },
        'AURA-109': {
            id: 'AURA-109',
            cargo: 'Reinforced Conduit Couplers',
            origin: 'Valen Territorial Bastion',
            scheduledDest: 'Sector 1 Capital Citadel',
            status: 'DELIVERED & VERIFIED',
            courier: 'Valen Logistics Escort',
            notes: 'Civic clearance Tier 2 signed by Agent Thorne.'
        }
    };

    const currentManifest = manifests[trackingCode.toUpperCase()] || null;

    const handleAuditDiscrepancy = () => {
        setAuditRevealed(true);
        SoundFX.playCoin();
        if (addXP) addXP(30);
        if (addCredits) addCredits(75);
    };

    return (
        <div className="p-6 space-y-6 bg-[#FAFBFD] min-h-full text-slate-800 font-sans select-none">
            <CitizenAureIdBar portalName="Aureline CargoTrack Logistics" />

            <header className="flex items-center justify-between border-b border-orange-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
                        <Truck size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">CargoTrack Logistics</h1>
                        <p className="text-xs text-orange-600 font-mono">Consignment Manifests & Route Audits • shipping.aure</p>
                    </div>
                </div>
            </header>

            {/* Tracking Search Input */}
            <div className="p-5 border border-slate-200 bg-white rounded-2xl space-y-3 shadow-xs">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Search size={14} className="text-orange-600" /> Consignment Tracking Lookup
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                        placeholder="Enter tracking code (e.g. CG-8821, MED-4402, AURA-109)..."
                        className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-orange-500"
                    />
                    <div className="flex gap-1.5">
                        {['CG-8821', 'MED-4402', 'AURA-109'].map(code => (
                            <button
                                key={code}
                                onClick={() => setTrackingCode(code)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                            >
                                {code}
                            </button>
                        ))}
                    </div>
                </div>

                {currentManifest ? (
                    <div className="mt-4 p-4 border border-orange-200 bg-orange-50/60 rounded-xl space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                            <span className="font-bold text-orange-950 text-sm">Manifest #{currentManifest.id}</span>
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${currentManifest.status.includes('FLAGGED') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {currentManifest.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 pt-1">
                            <div><strong>Cargo:</strong> {currentManifest.cargo}</div>
                            <div><strong>Origin:</strong> {currentManifest.origin}</div>
                            <div><strong>Scheduled:</strong> {currentManifest.scheduledDest}</div>
                            {currentManifest.divertedDest && (
                                <div className="text-rose-700 font-bold"><strong>Diverted Destination:</strong> {currentManifest.divertedDest}</div>
                            )}
                            {currentManifest.courier && <div><strong>Courier:</strong> {currentManifest.courier}</div>}
                        </div>
                        <div className="text-slate-600 italic pt-1">{currentManifest.notes}</div>

                        {currentManifest.id === 'CG-8821' && (
                            <div className="pt-3 border-t border-orange-200 flex items-center justify-between">
                                <span className="text-[11px] text-orange-900 font-bold">Investigative Evidence Available</span>
                                <button
                                    onClick={handleAuditDiscrepancy}
                                    disabled={auditRevealed}
                                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                    {auditRevealed ? '✓ Route Discrepancy Filed (+75 ₡, +30 XP)' : 'Audit Route Discrepancy'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-500 font-mono text-xs">
                        No consignment found matching tracking code.
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// 10. VectorNet / Dark Web Onion Portal (.onion / vectornet.aure)
// ==========================================
export function DarkWebOnionPortal() {
    const player = useOSStore((s) => s.gameplay?.player);
    const addCredits = useOSStore((s) => s.addCredits);
    const addXP = useOSStore((s) => s.addXP);

    const [purchasedIntel, setPurchasedIntel] = useState<string[]>([]);
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalOutput, setTerminalOutput] = useState<string[]>([
        'VECTORNET ANONYMOUS ONION ROUTER v2.4',
        'Connected through encrypted relay #88.4 MHz · Identity masked.',
        'Type "/help" for available underground commands.'
    ]);

    const intelItems = [
        { id: 'intel-conduit', title: 'Conduit 7 Blueprint Bypass', cost: 15, desc: 'Airlock circuit schematics for Subterranean Conduit 7.', secret: 'Airlock pneumatic override cipher: 0x8891. Frequency alignment: 88.2 MHz.' },
        { id: 'intel-vault', title: 'First Federal Vault Drill Logs', cost: 25, desc: 'Sonic tunneling data beneath Broad Street Vault 4.', secret: 'Seismic acoustic frequency 88.4 MHz recorded during vault floor breach.' },
        { id: 'intel-prism', title: 'PRISM Anomaly Audio Intercept', cost: 10, desc: 'Raw carrier audio frequency intercept from Sector 4.', secret: 'Carrier repeating pulse indicates Lyoko-pattern virtual telemetry.' },
    ];

    const handlePurchaseIntel = (item: typeof intelItems[0]) => {
        if (purchasedIntel.includes(item.id)) return;
        const currentBits = player?.bits ?? 0;
        if (currentBits < item.cost) {
            setTerminalOutput(prev => [...prev, `[ERROR]: Insufficient Bits. Required: ${item.cost} ◈, You have: ${currentBits} ◈.`]);
            return;
        }

        // Deduct bits via store logic
        useOSStore.setState((state) => ({
            gameplay: {
                ...state.gameplay,
                player: {
                    ...state.gameplay.player,
                    bits: Math.max(0, (state.gameplay.player.bits || 0) - item.cost)
                }
            }
        }));

        setPurchasedIntel(prev => [...prev, item.id]);
        setTerminalOutput(prev => [
            ...prev,
            `[PURCHASE VERIFIED]: -${item.cost} ◈ Bits. Unlocked: "${item.title}".`,
            `[DECRYPTED DOSSIER]: ${item.secret}`
        ]);
        SoundFX.playCoin();
        if (addXP) addXP(40);
    };

    const handleTerminalCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = terminalInput.trim().toLowerCase();
        if (!cmd) return;

        setTerminalOutput(prev => [...prev, `> ${terminalInput}`]);
        setTerminalInput('');

        if (cmd === '/help') {
            setTerminalOutput(prev => [
                ...prev,
                'Available commands:',
                '  /status     - Display connection & anonymity status',
                '  /clearance  - View active citizen clearance & MAID',
                '  /trace      - Ping active underground node relays',
                '  /decrypt [key] - Test cryptographic cipher keys',
                '  /clear      - Reset terminal log'
            ]);
        } else if (cmd === '/status') {
            setTerminalOutput(prev => [
                ...prev,
                `Onion Proxy: ONLINE (Node #88.4 MHz) · Encryption: 4096-bit AES`,
                `Player Bits: ${player?.bits ?? 0} ◈ · Credits: ${player?.credits ?? 0} ₡`
            ]);
        } else if (cmd === '/clearance') {
            setTerminalOutput(prev => [
                ...prev,
                `Citizen Identity: ${player?.name || 'Citizen'} (${player?.identity?.citizenId || 'MAID-9041-AURE'})`,
                `Clearance Rating: Tier ${player?.clearanceLevel ?? 1}`
            ]);
        } else if (cmd === '/trace') {
            setTerminalOutput(prev => [
                ...prev,
                'Pinging node relays...',
                '  Node 1: Sector 3 Warehouse [ACTIVE]',
                '  Node 2: Subterranean Conduit 7 [88.2 MHz CARRIER]',
                '  Node 3: First Federal Broad Street [FAULT DETECTED]'
            ]);
        } else if (cmd.startsWith('/decrypt')) {
            const key = cmd.replace('/decrypt', '').trim();
            if (key === '0x8891' || key === '8891') {
                setTerminalOutput(prev => [...prev, '[CIPHER ACCEPTED]: Unlocks Subterranean Conduit Sector 7 Airlock Deed.']);
            } else if (key === 'cg-8821') {
                setTerminalOutput(prev => [...prev, '[CIPHER ACCEPTED]: Unlocks Mana Crystal Contraband Manifest.']);
            } else {
                setTerminalOutput(prev => [...prev, `[CIPHER REJECTED]: Key "${key}" failed decryption matrix.`]);
            }
        } else if (cmd === '/clear') {
            setTerminalOutput(['VECTORNET TERMINAL CLEARED']);
        } else {
            setTerminalOutput(prev => [...prev, `Unknown command: "${cmd}". Type /help for options.`]);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-full font-mono select-none">
            <header className="flex items-center justify-between border-b border-purple-900 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-xs">
                        <Terminal size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-purple-300">VectorNet Underground (.onion)</h1>
                        <p className="text-xs text-purple-400">Anonymized Encrypted Onion Network // vectornet.aure</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-purple-950 border border-purple-700 text-purple-300 rounded-lg text-xs font-bold">
                        Bits: <strong className="text-emerald-400">{player?.bits ?? 0} ◈</strong>
                    </span>
                    <span className="px-3 py-1 bg-purple-900 border border-purple-600 text-purple-200 text-xs rounded-full font-bold">
                        Onion Proxy Active
                    </span>
                </div>
            </header>

            {/* Underground Intel Market */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Classified Intel Broker Market</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {intelItems.map((item) => {
                        const isBought = purchasedIntel.includes(item.id);
                        return (
                            <div key={item.id} className="p-4 bg-slate-900 border border-purple-900/60 rounded-xl space-y-2.5 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <div className="font-bold text-xs text-purple-200 flex items-center justify-between">
                                        <span>{item.title}</span>
                                        <span className="text-emerald-400 font-bold">{item.cost} ◈</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                                    {isBought && (
                                        <div className="p-2 bg-purple-950/80 border border-purple-700/60 rounded-lg text-[10px] text-purple-200">
                                            {item.secret}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handlePurchaseIntel(item)}
                                    disabled={isBought}
                                    className="w-full py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                                >
                                    {isBought ? '✓ Decrypted' : `Purchase for ${item.cost} ◈`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Interactive Terminal Prompt */}
            <div className="p-4 bg-black border border-purple-900 rounded-2xl space-y-3 shadow-inner">
                <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal size={13} /> Interactive Hacker Console
                </div>
                <div className="h-44 overflow-y-auto space-y-1 text-xs text-emerald-400 p-2 bg-slate-950 rounded-lg border border-purple-950">
                    {terminalOutput.map((line, i) => (
                        <div key={i} className="leading-relaxed">{line}</div>
                    ))}
                </div>
                <form onSubmit={handleTerminalCommand} className="flex gap-2">
                    <span className="text-purple-400 font-bold self-center">&gt;</span>
                    <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder="Type /help, /status, /trace, or /decrypt 0x8891..."
                        className="flex-1 h-9 px-3 bg-slate-900 border border-purple-900 rounded-xl text-xs text-slate-100 outline-none focus:border-purple-500 font-mono"
                    />
                    <button
                        type="submit"
                        className="px-4 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                        Execute
                    </button>
                </form>
            </div>
        </div>
    );
}

export { MaiSpacePortal } from './MaiSpacePortal';
