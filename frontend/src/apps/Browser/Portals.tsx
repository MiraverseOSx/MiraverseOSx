import React, { useState } from 'react';
import { 
    Activity, Shield, Building, FileText, Landmark, Truck, Eye, 
    Lock, CheckCircle2, AlertTriangle, Key, Search, ArrowRight, UserCheck, RefreshCw, User
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import Button from '../../components/ui/button';

// ==========================================
// 1. Faith Medical Intranet (faithmed.aure)
// ==========================================
export function FaithMedPortal() {
    const player = useOSStore((s) => s.gameplay.player);
    const healAura = useOSStore((s) => s.healAura);
    const removeCondition = useOSStore((s) => s.removeCondition);
    const addCredits = useOSStore((s) => s.addCredits);
    const addXP = useOSStore((s) => s.addXP);
    const [scanned, setScanned] = useState(false);

    const handleIntakeScan = () => {
        healAura(30);
        removeCondition('Veilwilt');
        removeCondition('Sunspire Burn Fever');
        addCredits(150);
        addXP(75);
        setScanned(true);
    };

    return (
        <div className="p-6 space-y-6 bg-[#0A1026]/90 backdrop-blur-xl min-h-full text-[#F8F6EE] font-ui select-none">
            <header className="flex items-center justify-between border-b border-[#3EB9A8]/30 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#1D6C61] text-[#F8F6EE] flex items-center justify-center font-bold shadow-glow-verdigris">
                        <Activity size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-display text-[#F8F6EE]">Faith Medical Group</h1>
                        <p className="text-xs text-[#3EB9A8] font-ui">Civic Health & Telemetry Intranet // faithmed.aure</p>
                    </div>
                </div>
                <div className="text-right text-xs font-ui">
                    <div className="text-[#C7D2E0]">Patient Baseline</div>
                    <div className="text-[#3EB9A8] font-bold">Aura Integrity: {player?.auraHealth || 100}%</div>
                </div>
            </header>

            {/* Aura Telemetry Scanner Banner */}
            <div className="p-5 border border-[#3EB9A8]/40 bg-[#193A31]/60 rounded-2xl flex items-center justify-between shadow-cosmic-low">
                <div className="space-y-1">
                    <h2 className="text-sm font-bold text-[#F8F6EE] flex items-center gap-2 font-display">
                        <Activity size={18} className="text-[#3EB9A8]" /> Mandatory Baseline Aura Diagnostic
                    </h2>
                    <p className="text-xs text-[#C7D2E0]">
                        Execute telemetry scan to restore Aura Integrity, purge Veilwilt exposure, and claim health stipend.
                    </p>
                </div>
                <button
                    onClick={handleIntakeScan}
                    disabled={scanned}
                    className="px-5 py-2.5 bg-[#1D6C61] hover:bg-[#3EB9A8] hover:text-[#0A1026] disabled:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 font-ui hover:-translate-y-0.5"
                >
                    {scanned ? '✓ Telemetry Calibrated' : 'Run Diagnostic Scan (+150 ₢)'}
                </button>
            </div>

            {/* Staff & Patient Logs */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attending Physicians</h3>
                    <div className="text-xs space-y-1 font-mono text-slate-600">
                        <div>• Dr. Ilyra Saint (Chief Bio-Aura Diagnostics)</div>
                        <div>• Maris Neryn (Spring Essence Specialist)</div>
                        <div>• Kael Frostbourne (Cryo-Recovery Unit)</div>
                    </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Telemetry #FM-88392</h3>
                    <div className="text-xs space-y-1 font-mono text-slate-600">
                        <div>Aura Heat: <strong className="text-emerald-700">37.2°C (Stable)</strong></div>
                        <div>Active Conditions: <span className="font-bold text-rose-600">{player?.conditions?.join(', ') || 'None (Stable Resonance)'}</span></div>
                        <div>Flux Index: <span className="text-indigo-600 font-bold">88.4% Harmonic</span></div>
                    </div>
                </div>
            </div>

            {/* Clinical Condition Treatment Matrix */}
            <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Veil Exposure Treatment Protocols (§13.5)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 space-y-1">
                        <div className="font-bold text-cyan-900">Frostlung Syndrome</div>
                        <p className="text-[11px] text-cyan-700">Warm-essence thermal thaw</p>
                        <button
                            onClick={() => { removeCondition('Frostlung'); addXP(60); }}
                            className="mt-1 w-full py-1 rounded bg-cyan-600 text-white font-bold text-[10px]"
                        >
                            Apply Thaw
                        </button>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                        <div className="font-bold text-amber-900">Sunspire Burn Fever</div>
                        <p className="text-[11px] text-amber-700">Thermal cooling mapping</p>
                        <button
                            onClick={() => { removeCondition('Sunspire Burn Fever'); addXP(60); }}
                            className="mt-1 w-full py-1 rounded bg-amber-600 text-white font-bold text-[10px]"
                        >
                            Cool Aura
                        </button>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                        <div className="font-bold text-purple-900">Veilwilt Disorder</div>
                        <p className="text-[11px] text-purple-700">Aura rest & memory seal</p>
                        <button
                            onClick={() => { removeCondition('Veilwilt'); addXP(60); }}
                            className="mt-1 w-full py-1 rounded bg-purple-600 text-white font-bold text-[10px]"
                        >
                            Seal Veil
                        </button>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                        <div className="font-bold text-rose-900">Riftspine Fracture</div>
                        <p className="text-[11px] text-rose-700">Timeline drift stabilization</p>
                        <button
                            onClick={() => { removeCondition('Riftspine Fracture'); addXP(60); }}
                            className="mt-1 w-full py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                        >
                            Re-align Spine
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 2. DGA Government Portal (dga.gov)
// ==========================================
export function DGAPortal() {
    return (
        <div className="p-6 space-y-6 bg-white min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-blue-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Shield size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Department of Global Affairs</h1>
                        <p className="text-xs text-blue-600 font-mono">DGA • Department of Global Affairs • dga.gov</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full">Official Government Network</span>
            </header>

            <div className="p-5 border border-blue-200 bg-blue-50/60 rounded-2xl space-y-3">
                <h2 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <Shield size={18} className="text-blue-600" /> Executive Directive 14-B Notice
                </h2>
                <p className="text-xs text-blue-800 leading-relaxed font-mono">
                    All provisional citizens must complete biometrics verification at the Citizen Record bureau (`passport`). Failure to maintain clearance level 1 results in access restrictions across city gateways.
                </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 font-mono text-xs">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider">Public Advisories</h3>
                <div>• PRISM Signal Anomaly detected in Sector 4. Citizens advised to report corrupted binary runes.</div>
            </div>
        </div>
    );
}

// ==========================================
// 3. Cycademy Academic Portal (cyacademy.edu)
// ==========================================
export function CyacademyPortal() {
    return (
        <div className="p-6 space-y-6 bg-white min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-purple-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                        <Building size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Cycademy of Sciences</h1>
                        <p className="text-xs text-purple-600 font-mono">Academic Portal & Student Registry • cyacademy.edu</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-purple-200 bg-purple-50/50 rounded-xl space-y-2">
                    <h3 className="text-xs font-bold text-purple-900 uppercase">Faculty Roster</h3>
                    <div className="text-xs font-mono text-purple-800 space-y-1">
                        <div>• Dean Cassian Rook (Cybernetics)</div>
                        <div>• Prof. Archmage Hex (Spell Algorithms)</div>
                    </div>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase">Student Directory</h3>
                    <div className="text-xs font-mono text-slate-600 space-y-1">
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
        <div className="p-6 space-y-6 bg-white min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-amber-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                        <FileText size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Orynvell Public Records</h1>
                        <p className="text-xs text-amber-600 font-mono">Property Deeds & Background Filings • records.orynvell.gov</p>
                    </div>
                </div>
            </header>

            <div className="p-4 border border-amber-200 bg-amber-50/60 rounded-xl space-y-2 font-mono text-xs">
                <h3 className="font-bold text-amber-900">Deed Record #DEED-99401</h3>
                <div>Property: Subterranean Conduit Sector 7</div>
                <div>Owner: Aethercore Energy Trust (Pre-Collapse)</div>
                <div>Status: Classified Energy Grid Alignment</div>
            </div>
        </div>
    );
}

// ==========================================
// 5. First Orynvell Bank & Treasury (bank.aure / finance.oryn.gov)
// ==========================================
export function BankPortal() {
    const player = useOSStore((s) => s.gameplay.player);
    const addCredits = useOSStore((s) => s.addCredits);
    const addBits = useOSStore((s) => s.addBits);
    const [authenticated, setAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [auditSuccess, setAuditSuccess] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput.trim() === '0994' || pinInput.trim() === '8891' || pinInput.trim() === '1234') {
            setAuthenticated(true);
        } else {
            alert('Invalid PIN or Security Token! Try 0994 or 8891.');
        }
    };

    const handleHackAudit = () => {
        addCredits(300);
        addBits(2);
        setAuditSuccess(true);
    };

    return (
        <div className="p-6 space-y-6 bg-white min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-indigo-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Landmark size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Oryn Department of Finance</h1>
                        <p className="text-xs text-indigo-600 font-mono">Banking, Treasury & Dual-Currency Accounts • bank.aure / finance.oryn.gov</p>
                    </div>
                </div>
            </header>

            {!authenticated ? (
                <div className="max-w-md mx-auto p-6 border border-indigo-200 bg-indigo-50/50 rounded-2xl space-y-4 text-center">
                    <Lock className="text-indigo-600 mx-auto" size={32} />
                    <h2 className="text-base font-bold text-slate-900">Authenticated Banking & Treasury Portal</h2>
                    <p className="text-xs text-slate-600">Enter Security PIN or Token discovered in AureMail / Dispatches (e.g. 0994 or 8891)</p>
                    <form onSubmit={handleLogin} className="space-y-3">
                        <input
                            type="password"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            placeholder="Enter 4-digit PIN..."
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-center text-sm outline-none font-mono focus:border-indigo-600"
                        />
                        <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition">
                            Unlock Financial Vault
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 border border-amber-200 bg-amber-50/60 rounded-2xl">
                            <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">Primary Currency Balance</div>
                            <div className="text-2xl font-bold text-amber-950 font-mono mt-1">{player?.credits || 0} ₢ CREDITS</div>
                            <div className="text-[11px] text-amber-700 mt-1">Sourced from career work shifts, trade & civic service</div>
                        </div>
                        <div className="p-5 border border-cyan-200 bg-cyan-50/60 rounded-2xl">
                            <div className="text-xs text-cyan-800 font-bold uppercase tracking-wider">Secondary Rare Currency</div>
                            <div className="text-2xl font-bold text-cyan-950 font-mono mt-1">{player?.bits || 0} ◈ BITS</div>
                            <div className="text-[11px] text-cyan-700 mt-1">Rare crystalline micro-currency for luxury upgrades</div>
                        </div>
                    </div>

                    <div className="p-4 border border-slate-200 bg-slate-50 rounded-2xl flex justify-between items-center">
                        <div>
                            <div className="text-xs font-bold text-slate-800">Direct Deposit & Rent Audit Status</div>
                            <div className="text-[11px] text-slate-600 font-mono">Automatic monthly stipend and dorm subsidies active</div>
                        </div>
                        <button
                            onClick={handleHackAudit}
                            disabled={auditSuccess}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 transition disabled:bg-slate-300"
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
    const player = useOSStore((s) => s.gameplay.player);
    const addCredits = useOSStore((s) => s.addCredits);
    const [stipendClaimed, setStipendClaimed] = useState(false);

    const handleClaimStipend = () => {
        addCredits(100);
        setStipendClaimed(true);
    };

    return (
        <div className="p-6 space-y-6 bg-white min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-indigo-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold shadow-sm">
                        <Landmark size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">CIVINET // Municipal Services Hub</h1>
                        <p className="text-xs text-indigo-600 font-mono">Official Meridion Institutional Portal • civinet.mer</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold rounded-lg">
                    Citizen Status: Registered
                </div>
            </header>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1.5">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText size={15} className="text-indigo-600" /> Public Archive Search
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                        Access non-classified municipal charters, historical treaties, and zoning records.
                    </p>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1.5">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Activity size={15} className="text-emerald-600" /> Health Appointments
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                        Schedule Faith Medical wellness checks, Veil exposure diagnostics, and baseline scans.
                    </p>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-1.5">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Shield size={15} className="text-blue-600" /> Citizen Service Notices
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                        Official declarations, transit schedules, and public infrastructure updates.
                    </p>
                </div>
            </div>

            {/* Citizen Municipal Welfare Section */}
            <div className="p-5 border border-indigo-200 bg-indigo-50/50 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-indigo-950">Provisional Citizen Monthly Welfare Stipend</h3>
                    <p className="text-xs text-indigo-700">Claim your government-authorized civic support funds (100 ₢ CREDITS).</p>
                </div>
                <button
                    onClick={handleClaimStipend}
                    disabled={stipendClaimed}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
                >
                    {stipendClaimed ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                    <span>{stipendClaimed ? 'Stipend Claimed (+100 ₢)' : 'Claim Civic Stipend'}</span>
                </button>
            </div>
        </div>
    );
}

// ==========================================
// 7. QUESTNOTICE Public Errands (questnotice.mer)
// ==========================================
export function QuestNoticePortal() {
    const player = useOSStore((s) => s.gameplay.player);
    const addCredits = useOSStore((s) => s.addCredits);
    const addXP = useOSStore((s) => s.addXP);
    const [claimedTasks, setClaimedTasks] = useState<string[]>([]);

    const tasks = [
        { id: 'qn-web-1', title: 'Library Return Cart Sorting', rewardCredits: 80, rewardXP: 40, desc: 'Sort 20 returned volumes by catalog number in the East Reading Room.' },
        { id: 'qn-web-2', title: 'Lost Familiar Trace in Sector 4', rewardCredits: 120, rewardXP: 60, desc: 'Search for a glowing cyan sprite near the central district water fountain.' },
        { id: 'qn-web-3', title: 'Apothecary Herb Delivery', rewardCredits: 150, rewardXP: 75, desc: 'Deliver dried Sunspire blossom bundles to Faith Medical Clinic Ward 2.' },
    ];

    const handleClaim = (taskId: string, credits: number, xp: number) => {
        addCredits(credits);
        addXP(xp);
        setClaimedTasks([...claimedTasks, taskId]);
    };

    return (
        <div className="p-6 space-y-6 bg-white min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-amber-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
                        <FileText size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">QUESTNOTICE // Public Errand Tracker</h1>
                        <p className="text-xs text-amber-600 font-mono">Neighborhood Postings & Local Errand Engine • questnotice.mer</p>
                    </div>
                </div>
                <div className="text-xs font-mono text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                    Active Board Feed
                </div>
            </header>

            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Community Postings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tasks.map((task) => {
                        const isClaimed = claimedTasks.includes(task.id);
                        return (
                            <div key={task.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                                    <p className="text-[11px] text-slate-600 leading-relaxed">{task.desc}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold text-amber-600">+{task.rewardCredits} ₢</span>
                                    <button
                                        onClick={() => handleClaim(task.id, task.rewardCredits, task.rewardXP)}
                                        disabled={isClaimed}
                                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white text-[11px] font-bold rounded-lg transition"
                                    >
                                        {isClaimed ? 'Done' : 'Accept'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 8. Royal Historic Society (royalhistory.mer)
// ==========================================
export function RoyalHistoryPortal() {
    return (
        <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-full font-serif select-none">
            <header className="flex items-center justify-between border-b border-cyan-800/40 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-700 text-white flex items-center justify-center font-bold">
                        <BookOpen size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-cyan-200">Royal Historic Society</h1>
                        <p className="text-xs text-cyan-400 font-mono">Restricted Dynastic & Succession Archive • royalhistory.mer</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-xs font-mono rounded-full font-bold">
                    Classified Council Access
                </span>
            </header>

            <div className="p-5 border border-cyan-900/60 bg-slate-900/80 rounded-2xl space-y-3 font-sans">
                <h3 className="text-sm font-bold text-cyan-300 font-serif">Sealed Council Charter of Succession (Pre-Collapse)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
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
        <div className="p-6 space-y-6 bg-white min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-orange-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                        <Truck size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">CargoTrack Logistics</h1>
                        <p className="text-xs text-orange-600 font-mono">Package Manifests & Shipment Tracking • shipping.aure</p>
                    </div>
                </div>
            </header>

            <div className="p-4 border border-orange-200 bg-orange-50/60 rounded-xl space-y-2 font-mono text-xs">
                <h3 className="font-bold text-orange-900">Package Manifest #CG-8821</h3>
                <div>Cargo: Unrefined Mana Crystals</div>
                <div>Destination: Sector 3 Warehouse</div>
                <div>Status: In Transit (Arriving 05:00 PM)</div>
            </div>
        </div>
    );
}

// ==========================================
// 10. Vector DarkNet (.onion)
// ==========================================
export function DarkWebOnionPortal() {
    return (
        <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-full font-mono select-none">
            <header className="flex items-center justify-between border-b border-cyan-800/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-600 text-black flex items-center justify-center font-bold">
                        <Eye size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-cyan-400">Vector DarkNet (.onion)</h1>
                        <p className="text-xs text-slate-400">Anonymized Encrypted Onion Relay</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold text-xs rounded-full">Encrypted Onion Route</span>
            </header>

            <div className="p-4 border border-cyan-900/60 bg-slate-900/80 rounded-xl space-y-2 text-xs">
                <div className="text-cyan-400 font-bold">[DARKNET LEAK #0x49] PRISM Frequency Intercept</div>
                <p className="text-slate-300 leading-relaxed">
                    Underground signal relay established. Binary runes propagating through Sector 3 node gateways. Key cipher: lightborn.
                </p>
            </div>
        </div>
    );
}

export { MaiSpacePortal } from './MaiSpacePortal';

