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
        <div className="p-6 space-y-6 bg-white min-h-full text-slate-800 font-sans select-none">
            <header className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                        <Activity size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Faith Medical Group</h1>
                        <p className="text-xs text-emerald-600 font-mono">Civic Health & Telemetry Intranet</p>
                    </div>
                </div>
                <div className="text-right text-xs font-mono">
                    <div className="text-slate-400">Patient Baseline</div>
                    <div className="text-emerald-600 font-bold">Aura Integrity: {player?.auraHealth || 100}%</div>
                </div>
            </header>

            {/* Aura Telemetry Scanner Banner */}
            <div className="p-5 border border-emerald-200 bg-emerald-50/60 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                        <Activity size={18} className="text-emerald-600" /> Mandatory Baseline Aura Diagnostic
                    </h2>
                    <p className="text-xs text-emerald-700">
                        Execute telemetry scan to restore Aura Integrity, purge Veilwilt exposure, and claim health stipend.
                    </p>
                </div>
                <button
                    onClick={handleIntakeScan}
                    disabled={scanned}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2"
                >
                    {scanned ? <CheckCircle2 size={16} /> : <RefreshCw size={16} />}
                    <span>{scanned ? 'Scan Completed (+150 ₡)' : 'Execute Telemetry Scan'}</span>
                </button>
            </div>

            {/* Staff & Patient Logs */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attending Physicians</h3>
                    <div className="text-xs space-y-1 font-mono text-slate-600">
                        <div>• Dr. Voss (Head of Bio-Telemetry)</div>
                        <div>• Dr. Marlowe (Aura Restoration)</div>
                    </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Log #FM-88392</h3>
                    <div className="text-xs space-y-1 font-mono text-slate-600">
                        <div>Condition: {player?.conditions?.join(', ') || 'Healthy'}</div>
                        <div>Clearance: Level 1 Patient Intranet</div>
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
// 5. First Orynvell Bank (bank.aure)
// ==========================================
export function BankPortal() {
    const player = useOSStore((s) => s.gameplay.player);
    const addCredits = useOSStore((s) => s.addCredits);
    const [authenticated, setAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [auditSuccess, setAuditSuccess] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (pinInput.trim() === '0994' || pinInput.trim() === '8891') {
            setAuthenticated(true);
        } else {
            alert('Invalid PIN or Security Token!');
        }
    };

    const handleHackAudit = () => {
        addCredits(300);
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
                        <h1 className="text-xl font-bold text-slate-900">First Orynvell Bank</h1>
                        <p className="text-xs text-indigo-600 font-mono">Personal Vault & Financial Wire Network • bank.aure</p>
                    </div>
                </div>
            </header>

            {!authenticated ? (
                <div className="max-w-md mx-auto p-6 border border-indigo-200 bg-indigo-50/50 rounded-2xl space-y-4 text-center">
                    <Lock className="text-indigo-600 mx-auto" size={32} />
                    <h2 className="text-base font-bold text-slate-900">Authenticated Banking Portal</h2>
                    <p className="text-xs text-slate-600">Enter Security PIN or Token discovered in AureMail / Leaks (e.g. 0994 or 8891)</p>
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
                    <div className="p-5 border border-indigo-200 bg-indigo-50/60 rounded-2xl flex justify-between items-center">
                        <div>
                            <div className="text-xs text-indigo-700 font-bold uppercase">Personal Account Balance</div>
                            <div className="text-2xl font-bold text-indigo-950 font-mono">{player?.credits || 0} ₡ Credits</div>
                        </div>
                        <button
                            onClick={handleHackAudit}
                            disabled={auditSuccess}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 transition"
                        >
                            {auditSuccess ? 'Audit Wire Traced (+300 ₡)' : 'Trace Suspect Wire Transfer (#0994)'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// 6. CargoTrack Logistics (shipping.aure)
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
// 7. Vector DarkNet (.onion)
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
