import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, HardDrive, MessageSquare, MapPin, ShieldCheck, 
    Search, FileText, Download, Lock, CheckCircle2, AlertTriangle, Play, RefreshCw, Key,
    Sparkles, Radio, Send, Eye, Shield, Check, Info, ArrowUpRight, Cpu
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { SoundFX } from '../../utils/audio';

export interface EmailItem {
    id: number;
    sender: string;
    role: string;
    title: string;
    time: string;
    body: string;
    priority: 'high' | 'normal' | 'classified';
    claimed?: boolean;
    rewardXP: number;
    rewardCredits: number;
}

export interface DriveItem {
    id: number;
    title: string;
    size: string;
    type: string;
    category: string;
    checksum: string;
    origin: string;
}

export interface WaypointPin {
    id: string;
    name: string;
    sector: string;
    x: number; // percentage
    y: number; // percentage
    threat: 'Low' | 'Moderate' | 'Critical';
    desc: string;
}

export default function AureSuiteApp() {
    const [activeTool, setActiveTool] = useState<'mail' | 'drive' | 'chat' | 'maps' | 'scanner'>('mail');
    
    // Store
    const player = useOSStore((s) => s.gameplay?.player);
    const addCredits = useOSStore((s) => s.addCredits);
    const addXP = useOSStore((s) => s.addXP);

    // ── 1. AureMail State ──
    const [emails, setEmails] = useState<EmailItem[]>([
        { 
            id: 1, 
            sender: 'Director Vane (DGA)', 
            role: 'Government Bureau', 
            title: 'Leaked DGA Credentials & Key #0x8891', 
            time: '10:14 AM', 
            body: 'Confidential clearance alert: Access Cipher Key 0x8891 has been confirmed for Subterranean Conduit Sector 7. Use the AureScanner Decryptor tool to unlock classified deeds.', 
            priority: 'classified',
            claimed: false,
            rewardXP: 60,
            rewardCredits: 150
        },
        { 
            id: 2, 
            sender: 'Aureline Cargo Dispatch', 
            role: 'Logistics Operations', 
            title: 'Manifest Alert: CG-8821 Unregistered Crystal Crate', 
            time: '09:30 AM', 
            body: 'Unregistered shipment of unrefined Mana Crystals logged at Sector 3 Warehouse. Suspect timeline alignment discrepancy detected in courier route.', 
            priority: 'high',
            claimed: false,
            rewardXP: 45,
            rewardCredits: 100
        },
        { 
            id: 3, 
            sender: 'Faith Medical Records', 
            role: 'Chief Medical Registry', 
            title: 'Patient Telemetry Baseline Verified #FM-88392', 
            time: '08:00 AM', 
            body: 'Aura Heat stabilized at 37.2°C. Veilwilt antibodies have been synthesized. Remember to check Faith Medical intranet for weekly wellness stipend.', 
            priority: 'normal',
            claimed: false,
            rewardXP: 30,
            rewardCredits: 75
        },
    ]);
    const [selectedEmailId, setSelectedEmailId] = useState<number>(1);
    const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

    const handleClaimEmailIntel = (id: number) => {
        const target = emails.find((e) => e.id === id);
        if (!target || target.claimed) return;

        if (addCredits) addCredits(target.rewardCredits);
        if (addXP) addXP(target.rewardXP);
        SoundFX.playCoin();

        setEmails((prev) =>
            prev.map((e) => (e.id === id ? { ...e, claimed: true } : e))
        );
    };

    // ── 2. AureDrive State ──
    const [driveFiles] = useState<DriveItem[]>([
        { id: 1, title: 'Aethercore_Conduit_7.pdf', size: '4.2 MB', type: 'PDF Document', category: 'Civil Architecture', checksum: 'SHA-88219-OK', origin: 'Sector 7 Grid' },
        { id: 2, title: 'PRISM_Frequency_Audio.wav', size: '12.8 MB', type: 'Audio Wave', category: 'Signal Intercept', checksum: 'SHA-19022-WARN', origin: 'Sector 4 Node' },
        { id: 3, title: 'DGA_Directives_2026.docx', size: '1.1 MB', type: 'Word Protocol', category: 'Civic Governance', checksum: 'SHA-99401-OK', origin: 'Capital Ward' },
        { id: 4, title: 'FaithMed_Veilwilt_Study.pdf', size: '3.6 MB', type: 'Medical Report', category: 'Clinical Bio-Aura', checksum: 'SHA-33821-OK', origin: 'Clinic Ward 2' },
        { id: 5, title: 'Bank_Wire_Audit_0994.csv', size: '840 KB', type: 'Financial Ledger', category: 'Treasury Audit', checksum: 'SHA-77210-CRIT', origin: 'Oryn Bank' },
    ]);
    const [selectedDriveFile, setSelectedDriveFile] = useState<DriveItem | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    const handleDownloadFile = (file: DriveItem) => {
        setDownloadingId(file.id);
        SoundFX.playSnap();
        setTimeout(() => {
            setDownloadingId(null);
            if (addXP) addXP(20);
        }, 1200);
    };

    // ── 3. AureChat State ──
    const [chatMessages, setChatMessages] = useState([
        { id: 1, sender: 'Zero Cool', time: '10:02 AM', text: 'Did you verify the wire transfer at First Orynvell Bank?', tag: 'SECURE_CHANNEL' },
        { id: 2, sender: 'Jeremie Belpois', time: '10:04 AM', text: 'Yes, 50,000 ₡ routed through vector account #0994-AURA.', tag: 'INTERCEPT' },
        { id: 3, sender: 'Mara Thorne (DGA)', time: '10:12 AM', text: 'Signal anomaly detected near Sector 3. Keep firewall up.', tag: 'BROADCAST' },
        { id: 4, sender: 'Aelita Schaeffer', time: '10:18 AM', text: 'The energy resonance in Conduit 7 is aligning with the AETHERCORE.', tag: 'NODE_RELAY' },
    ]);
    const [chatInput, setChatInput] = useState('');

    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = chatInput.trim();
        if (!trimmed) return;

        SoundFX.playSnap();
        const newMsg = {
            id: Date.now(),
            sender: player?.name || 'Provisional Citizen',
            time: 'Just now',
            text: trimmed,
            tag: 'TRANSMISSION'
        };
        setChatMessages((prev) => [...prev, newMsg]);
        setChatInput('');

        // Automatic simulated response
        setTimeout(() => {
            setChatMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'Aureline Relay Daemon',
                    time: 'Just now',
                    text: `Echo packet received: "${trimmed}". Node gateway harmonic status: 99.4% OPTIMAL.`,
                    tag: 'SYSTEM'
                }
            ]);
            if (addXP) addXP(10);
        }, 1000);
    };

    // ── 4. AureMaps State ──
    const waypoints: WaypointPin[] = [
        { id: 'wp-1', name: 'Sector 1 Capital Citadel', sector: 'Capital Administrative', x: 28, y: 32, threat: 'Low', desc: 'Central civic governance, DGA headquarters, and high-clearance council archives.' },
        { id: 'wp-2', name: 'Sector 3 Cargo Warehouse', sector: 'Industrial District', x: 72, y: 44, threat: 'Moderate', desc: 'Logistics cargo hub where Mana Crystal manifest CG-8821 was intercepted.' },
        { id: 'wp-3', name: 'Faith Medical Clinic', sector: 'Sanctuary District', x: 42, y: 68, threat: 'Low', desc: 'Primary bio-aura clinic for Veilwilt diagnostics and citizen health stipends.' },
        { id: 'wp-4', name: 'Cycademy Laboratory', sector: 'Academic Quad', x: 80, y: 78, threat: 'Low', desc: 'Signal engineering node, cybernetics facility, and spell algorithm synthesis.' },
        { id: 'wp-5', name: 'Subterranean Conduit 7', sector: 'Deep Aether Underground', x: 55, y: 22, threat: 'Critical', desc: 'Pre-Collapse energy conduit alignment line beneath the Old Factory Ward.' },
    ];
    const [selectedWaypoint, setSelectedWaypoint] = useState<WaypointPin>(waypoints[1]);
    const [radarPings, setRadarPings] = useState<number[]>([]);

    const handleTriggerPing = () => {
        SoundFX.playSnap();
        const pingId = Date.now();
        setRadarPings((prev) => [...prev, pingId]);
        setTimeout(() => {
            setRadarPings((prev) => prev.filter((id) => id !== pingId));
        }, 2000);
        if (addXP) addXP(15);
    };

    // ── 5. AureScanner State ──
    const [scannedFiles, setScannedFiles] = useState([
        { id: 1, name: 'CONFIDENTIAL_LEAK_09.pdf', size: '2.4 MB', status: 'CLEAN', threatLevel: 'Low', progress: 100 },
        { id: 2, name: 'SUSPECT_MANIFEST_CG8821.exe', size: '14.1 MB', status: 'INFECTED', threatLevel: 'High', progress: 100 },
        { id: 3, name: 'AETHERCORE_CONDUIT_KEY.enc', size: '512 KB', status: 'ENCRYPTED', threatLevel: 'Classified', progress: 100 },
    ]);
    const [scanningId, setScanningId] = useState<number | null>(null);
    const [decryptInput, setDecryptInput] = useState('');
    const [decryptedFile, setDecryptedFile] = useState<string | null>(null);
    const [decryptError, setDecryptError] = useState<string | null>(null);

    const handleRunScan = (fileId: number) => {
        setScanningId(fileId);
        SoundFX.playSnap();
        setTimeout(() => {
            setScannedFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, status: 'SCANNED & VERIFIED', threatLevel: 'Secured' } : f))
            );
            setScanningId(null);
            SoundFX.playCoin();
            if (addXP) addXP(35);
            if (addCredits) addCredits(50);
        }, 1600);
    };

    const handleDecrypt = (e: React.FormEvent) => {
        e.preventDefault();
        const normalized = decryptInput.trim().toLowerCase();
        if (normalized === 'lightborn' || normalized === '0x8891' || normalized === '0994' || normalized === 'aether') {
            SoundFX.playCoin();
            setDecryptedFile('DECRYPTED INTEL: AETHERCORE Subterranean Conduit Frequency Code [#AETH-9021-X] Verified. Unlocks Sector 7 Alignment.');
            setDecryptError(null);
            if (addCredits) addCredits(200);
            if (addXP) addXP(100);
        } else {
            SoundFX.playSnap();
            setDecryptError('Decryption Cipher Rejected. Try cipher key from AureMail: "0x8891" or "lightborn".');
        }
    };

    return (
        <div className="flex h-full w-full bg-[#FAFBFD] text-slate-800 font-sans select-none overflow-hidden text-xs">
            
            {/* ── 1. SOLID LIGHT SIDEBAR (NO GLASSMORPHISM) ── */}
            <aside className="w-64 bg-[#F1F5F9] border-r border-slate-200 flex flex-col justify-between p-3.5 shrink-0 select-none">
                <div className="space-y-5">
                    
                    {/* Header Branding */}
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center font-bold text-white shadow-xs">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <div className="font-display font-bold text-sm text-slate-900 leading-none">AureSuite</div>
                            <div className="text-[10px] text-rose-600 font-mono font-bold tracking-wider mt-1">CLOUD PRODUCTIVITY v4.1</div>
                        </div>
                    </div>

                    {/* Sub-App Navigation List with Framer Motion Pill */}
                    <nav className="space-y-1">
                        {[
                            { id: 'mail', label: 'AureMail', icon: Mail, desc: 'Dispatches & Wire Intercepts', badge: emails.filter(e => !e.claimed).length },
                            { id: 'drive', label: 'AureDrive', icon: HardDrive, desc: 'Cloud Vault & Documents' },
                            { id: 'chat', label: 'AureChat', icon: MessageSquare, desc: 'Encrypted Node Wiretap', pulse: true },
                            { id: 'maps', label: 'AureMaps', icon: MapPin, desc: 'Tactical Radar & Waypoints' },
                            { id: 'scanner', label: 'AureScanner', icon: ShieldCheck, desc: 'Diagnostics & Cipher Decryptor' },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTool === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        SoundFX.playSnap();
                                        setActiveTool(item.id as any);
                                    }}
                                    className={`relative flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                            : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-transparent'
                                    }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-rose-600' : 'text-slate-400'} />
                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="truncate">{item.label}</div>
                                        <div className="text-[9px] text-slate-400 font-normal truncate">{item.desc}</div>
                                    </div>
                                    {item.badge ? (
                                        <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                            {item.badge}
                                        </span>
                                    ) : item.pulse ? (
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                    ) : null}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* User Status Card */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[10px] text-slate-500 space-y-1 font-mono shadow-xs">
                    <div className="flex items-center justify-between text-slate-700 font-bold">
                        <span className="truncate">{player?.name || 'Provisional Citizen'}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">ONLINE</span>
                    </div>
                    <div className="text-slate-400">Clearance: Level 2 Verified</div>
                </div>
            </aside>

            {/* ── 2. MAIN TOOL CANVAS (ANIMATION SYSTEM) ── */}
            <main className="flex-1 bg-[#FAFBFD] flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    
                    {/* ── A. AUREMAIL SUB-APP ── */}
                    {activeTool === 'mail' && (
                        <motion.div
                            key="mail"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="flex h-full w-full overflow-hidden"
                        >
                            {/* Email List Column */}
                            <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
                                <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                    <div className="font-bold text-slate-800 flex items-center gap-2">
                                        <Mail size={15} className="text-rose-600" />
                                        <span>Inbox Feed</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                        {emails.length} Dispatches
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                                    {emails.map((email) => {
                                        const isSelected = email.id === selectedEmailId;
                                        return (
                                            <div
                                                key={email.id}
                                                onClick={() => setSelectedEmailId(email.id)}
                                                className={`p-3.5 transition cursor-pointer text-left ${
                                                    isSelected ? 'bg-rose-50/70 border-l-4 border-rose-500' : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                                                    <span className="font-bold text-slate-800 truncate max-w-[130px]">{email.sender}</span>
                                                    <span>{email.time}</span>
                                                </div>
                                                <div className="font-semibold text-slate-900 text-xs truncate mb-1">{email.title}</div>
                                                <div className="text-[11px] text-slate-500 line-clamp-1">{email.body}</div>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                                        email.priority === 'classified' ? 'bg-purple-100 text-purple-800' :
                                                        email.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {email.priority}
                                                    </span>
                                                    {email.claimed && (
                                                        <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                                                            <Check size={12} /> Claimed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Email Details View */}
                            <div className="flex-1 bg-[#FAFBFD] p-6 flex flex-col justify-between overflow-y-auto">
                                <div className="space-y-5 max-w-2xl">
                                    <div className="border-b border-slate-200 pb-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-mono text-slate-500">{selectedEmail.role} • {selectedEmail.time}</span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                                                {selectedEmail.priority} Priority
                                            </span>
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900 font-display">{selectedEmail.title}</h2>
                                        <div className="text-xs text-slate-600 font-medium">From: <strong className="text-slate-800">{selectedEmail.sender}</strong></div>
                                    </div>

                                    {/* Email Body Card */}
                                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 leading-relaxed text-slate-700 text-xs">
                                        <p>{selectedEmail.body}</p>
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-mono text-[11px] space-y-1">
                                            <div className="font-bold flex items-center gap-1.5"><Key size={13} /> Extracted Intelligence Payload:</div>
                                            <div>Access Code: #0x8891 • Conduit Line: Sector 7 • Trust Index: 100%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Reward Bar */}
                                <div className="pt-4 border-t border-slate-200 flex items-center justify-between max-w-2xl">
                                    <div className="text-xs text-slate-500 font-mono">
                                        Intel Bounty: <strong className="text-amber-700">+{selectedEmail.rewardCredits} ₢</strong> • <strong className="text-indigo-700">+{selectedEmail.rewardXP} XP</strong>
                                    </div>
                                    <button
                                        onClick={() => handleClaimEmailIntel(selectedEmail.id)}
                                        disabled={selectedEmail.claimed}
                                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                                    >
                                        {selectedEmail.claimed ? <CheckCircle2 size={16} /> : <ArrowUpRight size={16} />}
                                        <span>{selectedEmail.claimed ? 'Intelligence Stored' : 'Extract Intelligence & Claim Bounty'}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── B. AUREDRIVE SUB-APP ── */}
                    {activeTool === 'drive' && (
                        <motion.div
                            key="drive"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="p-6 space-y-5 h-full overflow-y-auto"
                        >
                            {/* Storage Status Banner */}
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <HardDrive size={18} className="text-blue-600" />
                                        <span>AureDrive Cloud Storage Quota</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Encrypted institutional file storage connected to Aureline grid.</p>
                                </div>
                                <div className="w-56 space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-mono text-slate-600">
                                        <span>2.8 GB Used</span>
                                        <span>5.0 GB Max</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full w-[56%]" />
                                    </div>
                                </div>
                            </div>

                            {/* Files Grid with Animated Hover Physics */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                {driveFiles.map((file) => {
                                    return (
                                        <motion.div
                                            key={file.id}
                                            whileHover={{ y: -3, scale: 1.01 }}
                                            onClick={() => setSelectedDriveFile(file)}
                                            className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                    <FileText size={20} />
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                    {file.size}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs text-slate-900 truncate">{file.title}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{file.category} • {file.origin}</div>
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                    {file.checksum}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownloadFile(file);
                                                    }}
                                                    disabled={downloadingId === file.id}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                    title="Download Evidence"
                                                >
                                                    {downloadingId === file.id ? <RefreshCw size={14} className="animate-spin text-blue-600" /> : <Download size={14} />}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Inspection Drawer if selected */}
                            {selectedDriveFile && (
                                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="font-bold text-blue-950 text-xs">Inspecting: {selectedDriveFile.title}</div>
                                        <div className="text-[11px] text-blue-800 font-mono">Format: {selectedDriveFile.type} • Origin: {selectedDriveFile.origin} • Verified via AureVault</div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDriveFile(null)}
                                        className="px-3 py-1 bg-white border border-blue-200 text-blue-900 rounded-lg text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                                    >
                                        Close Details
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── C. AURECHAT SUB-APP ── */}
                    {activeTool === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="flex flex-col h-full overflow-hidden p-6 space-y-4"
                        >
                            {/* Live Signal Equalizer Banner */}
                            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                                        <Radio size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-xs">Encrypted Intercept Stream #88.4 MHz</div>
                                        <div className="text-[10px] text-slate-500 font-mono">Quantum channel wiretap active across Aureline nodes</div>
                                    </div>
                                </div>
                                {/* Animated Audio Spectrum Bars */}
                                <div className="flex items-end gap-1 h-5 px-3">
                                    {[12, 18, 8, 20, 14, 16, 10, 22, 12, 15].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [6, h, 8, h + 2, 6] }}
                                            transition={{ repeat: Infinity, duration: 1.2 + (i * 0.1), ease: "easeInOut" }}
                                            className="w-1 bg-purple-500 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Message Feed Canvas */}
                            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-3 shadow-xs">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                            <span className="font-bold text-purple-900">{msg.sender}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-bold">{msg.tag}</span>
                                                <span>{msg.time}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-800 font-medium leading-relaxed">{msg.text}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Chat Injection Form */}
                            <form onSubmit={handleSendChat} className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Inject command or message into wiretap stream (e.g. /trace_0994)..."
                                    className="flex-1 h-10 px-4 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition font-mono"
                                />
                                <button
                                    type="submit"
                                    className="h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Send size={14} />
                                    <span>Transmit</span>
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── D. AUREMAPS SUB-APP (TACTICAL RADAR ANIMATION) ── */}
                    {activeTool === 'maps' && (
                        <motion.div
                            key="maps"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="p-6 space-y-4 h-full flex flex-col overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
                                        <MapPin size={18} className="text-emerald-600" /> Tactical Geospatial Radar Matrix
                                    </h2>
                                    <p className="text-[11px] text-slate-500 font-mono">Live telemetry grid mapping critical infrastructure & suspicious activity.</p>
                                </div>
                                <button
                                    onClick={handleTriggerPing}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Radio size={14} />
                                    <span>Scan Sector Ping</span>
                                </button>
                            </div>

                            {/* Light Technical Radar Canvas with Rotating Radar Sweep */}
                            <div className="flex-1 bg-white border-2 border-emerald-200/90 rounded-2xl relative overflow-hidden shadow-xs flex items-center justify-center">
                                
                                {/* Blueprint Background Grid */}
                                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
                                
                                {/* Concentric Radar Rings */}
                                <div className="absolute h-80 w-80 rounded-full border border-emerald-300/40" />
                                <div className="absolute h-52 w-52 rounded-full border border-emerald-300/60" />
                                <div className="absolute h-24 w-24 rounded-full border border-emerald-400/80" />
                                <div className="absolute h-full w-[1px] bg-emerald-200/60" />
                                <div className="absolute w-full h-[1px] bg-emerald-200/60" />

                                {/* 360° Rotating Radar Sweep Beam */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
                                    className="absolute h-80 w-80 rounded-full origin-center pointer-events-none"
                                    style={{
                                        background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(16, 185, 129, 0.25) 360deg)'
                                    }}
                                />

                                {/* Concentric Ripple Pings when clicked */}
                                {radarPings.map((pid) => (
                                    <motion.div
                                        key={pid}
                                        initial={{ scale: 0.1, opacity: 0.9 }}
                                        animate={{ scale: 2.2, opacity: 0 }}
                                        transition={{ duration: 1.8, ease: "easeOut" }}
                                        className="absolute h-48 w-48 rounded-full border-2 border-emerald-500 pointer-events-none"
                                    />
                                ))}

                                {/* Interactive Waypoint Pins */}
                                {waypoints.map((wp) => {
                                    const isSelected = wp.id === selectedWaypoint.id;
                                    return (
                                        <button
                                            key={wp.id}
                                            onClick={() => {
                                                SoundFX.playSnap();
                                                setSelectedWaypoint(wp);
                                            }}
                                            style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
                                            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 p-1.5 rounded-full transition-all group z-10 cursor-pointer ${
                                                isSelected ? 'scale-125 ring-4 ring-emerald-300 bg-emerald-600 text-white shadow-md' : 'bg-white border border-emerald-400 text-emerald-800 hover:scale-110 shadow-xs'
                                            }`}
                                        >
                                            <MapPin size={14} className={isSelected ? 'text-white' : 'text-emerald-700'} />
                                            <span className="text-[10px] font-bold font-mono px-1 truncate max-w-[90px]">{wp.name.split(' ')[0]}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Waypoint Intelligence Card */}
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                        <span>Target: {selectedWaypoint.name}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                            selectedWaypoint.threat === 'Critical' ? 'bg-rose-100 text-rose-800' :
                                            selectedWaypoint.threat === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            Threat: {selectedWaypoint.threat}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600">{selectedWaypoint.desc}</p>
                                </div>
                                <div className="text-right font-mono text-[10px] text-slate-400">
                                    <div>Sector: {selectedWaypoint.sector}</div>
                                    <div>Coordinates: {selectedWaypoint.x}.09°N, {selectedWaypoint.y}.32°W</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── E. AURESCANNER & CIPHER DECRYPTOR SUB-APP ── */}
                    {activeTool === 'scanner' && (
                        <motion.div
                            key="scanner"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="p-6 space-y-5 h-full overflow-y-auto"
                        >
                            <div className="border-b border-slate-200 pb-3">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                                    <ShieldCheck size={20} className="text-rose-600" /> AureScanner File Diagnostics & Cipher Matrix
                                </h2>
                                <p className="text-xs text-slate-500 font-mono">Scan suspected corrupt binary runes and decrypt locked evidence payloads.</p>
                            </div>

                            {/* Diagnostic Scan Table */}
                            <div className="space-y-2.5">
                                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Downloaded File Threat Diagnostics</div>
                                <div className="space-y-2">
                                    {scannedFiles.map((file) => (
                                        <div key={file.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-xs text-slate-900">{file.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    Size: {file.size} • Threat Rating: <strong className={file.threatLevel === 'High' ? 'text-rose-600' : 'text-slate-600'}>{file.threatLevel}</strong>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRunScan(file.id)}
                                                disabled={scanningId === file.id}
                                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
                                            >
                                                {scanningId === file.id ? <RefreshCw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                                                <span>{scanningId === file.id ? 'Running Deep Scan...' : file.status}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cipher Decryption Workbench */}
                            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                        <Key size={16} className="text-amber-600" /> Decrypt Corrupted Evidence Payload
                                    </h3>
                                    <span className="text-[10px] font-mono text-slate-400">Target: #AETHERCORE_CONDUIT_KEY.enc</span>
                                </div>

                                <form onSubmit={handleDecrypt} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={decryptInput}
                                        onChange={(e) => setDecryptInput(e.target.value)}
                                        placeholder="Enter cipher key discovered in dispatches (e.g. 0x8891 or lightborn)..."
                                        className="flex-1 h-10 px-4 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition"
                                    />
                                    <button
                                        type="submit"
                                        className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                                    >
                                        Decrypt Payload
                                    </button>
                                </form>

                                {decryptError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono">
                                        {decryptError}
                                    </div>
                                )}

                                {decryptedFile && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-mono font-bold space-y-1"
                                    >
                                        <div className="flex items-center gap-1.5 text-emerald-800">
                                            <CheckCircle2 size={16} /> Decryption Succeeded (+200 ₢, +100 XP)
                                        </div>
                                        <div className="text-emerald-950 font-normal">{decryptedFile}</div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
