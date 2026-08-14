import React, { useState } from 'react';
import { 
    Mail, HardDrive, MessageSquare, MapPin, ShieldCheck, 
    Search, FileText, Download, Lock, CheckCircle2, AlertTriangle, Play, RefreshCw, Key
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

export default function AureSuiteApp() {
    const [activeTool, setActiveTool] = useState('mail');
    const [scannedFiles, setScannedFiles] = useState([
        { id: 1, name: 'CONFIDENTIAL_LEAK_09.pdf', size: '2.4 MB', status: 'CLEAN', threatLevel: 'Low' },
        { id: 2, name: 'SUSPECT_MANIFEST_CG8821.exe', size: '14.1 MB', status: 'INFECTED', threatLevel: 'High' },
        { id: 3, name: 'AETHERCORE_CONDUIT_KEY.enc', size: '512 KB', status: 'ENCRYPTED', threatLevel: 'None' },
    ]);
    const [scanProgress, setScanProgress] = useState(null);
    const [decryptedFile, setDecryptedFile] = useState(null);
    const [decryptInput, setDecryptInput] = useState('');

    const player = useOSStore((s) => s.gameplay.player);
    const addCredits = useOSStore((s) => s.addCredits);
    const addXP = useOSStore((s) => s.addXP);

    const handleRunScan = (fileId) => {
        setScanProgress(fileId);
        setTimeout(() => {
            setScannedFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, status: 'SCANNED & VERIFIED' } : f))
            );
            setScanProgress(null);
            addXP(25);
        }, 1500);
    };

    const handleDecrypt = (e) => {
        e.preventDefault();
        if (decryptInput.trim().toLowerCase() === 'lightborn' || decryptInput.trim() === '0x8891') {
            setDecryptedFile('DECRYPTED: AETHERCORE Subterranean Conduit Frequency Code: #AETH-9021-X');
            addCredits(150);
            addXP(50);
        } else {
            alert('Decryption Failed: Invalid Cipher Key!');
        }
    };

    return (
        <div className="flex h-full w-full bg-slate-100 text-slate-800 font-sans select-none overflow-hidden">
            {/* AureSuite Left Navigation Sidebar */}
            <aside className="w-56 bg-slate-900 text-white flex flex-col justify-between p-4 shrink-0">
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 px-2">
                        <div className="h-8 w-8 rounded-lg bg-rose-500 flex items-center justify-center font-bold text-white shadow-md">
                            A
                        </div>
                        <div>
                            <div className="font-bold text-sm text-white leading-none">AureSuite</div>
                            <div className="text-[9px] text-rose-400 font-mono tracking-wider mt-0.5">CLOUD WORKSPACE</div>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'mail', label: 'AureMail', icon: Mail, desc: 'Communications & Credentials' },
                            { id: 'drive', label: 'AureDrive', icon: HardDrive, desc: 'Evidence Storage' },
                            { id: 'chat', label: 'AureChat', icon: MessageSquare, desc: 'Suspect Dialogues' },
                            { id: 'maps', label: 'AureMaps', icon: MapPin, desc: 'Geospatial Tracking' },
                            { id: 'scanner', label: 'AureScanner', icon: ShieldCheck, desc: 'Asset Security' },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTool === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTool(item.id)}
                                    className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                                        isActive
                                            ? 'bg-rose-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl text-[10px] text-slate-400 space-y-1 font-mono">
                    <div>User: {player?.name || 'Provisional Citizen'}</div>
                    <div className="text-emerald-400 font-bold">Encrypted Workspace Online</div>
                </div>
            </aside>

            {/* Main Tool Content Area */}
            <main className="flex-1 bg-white flex flex-col overflow-hidden">
                {activeTool === 'mail' && (
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Mail className="text-rose-500" size={20} /> AureMail Inbox
                            </h2>
                            <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full font-bold">
                                3 Unread Dispatches
                            </span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { sender: 'Internal Leaks Relay', title: 'Leaked DGA Credentials (Director Vane)', time: '10:14 AM', body: 'Access Key: 0x8891. Use for DGA records decryption.' },
                                { sender: 'Aureline Cargo Dispatch', title: 'Manifest Alert: CG-8821', time: '09:30 AM', body: 'Unregistered shipment of Mana Crystals logged at Sector 3 Warehouse.' },
                                { sender: 'Faith Medical Records', title: 'Patient Audit Clearance', time: '08:00 AM', body: 'Patient Telemetry baseline verified. Patient ID: #FM-88392.' },
                            ].map((msg, i) => (
                                <div key={i} className="p-4 border border-slate-200 rounded-xl hover:border-rose-300 bg-slate-50/50 transition space-y-1.5">
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                        <span>{msg.sender}</span>
                                        <span className="text-slate-400 font-normal">{msg.time}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-900">{msg.title}</div>
                                    <p className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200">{msg.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTool === 'drive' && (
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <HardDrive className="text-blue-500" size={20} /> AureDrive Cloud Storage
                            </h2>
                            <span className="text-xs text-slate-500 font-mono">1.2 GB used of 5 GB</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { title: 'Aethercore_Conduit.pdf', size: '4.2 MB', icon: FileText, color: 'text-blue-500' },
                                { title: 'PRISM_Audio_Intercept.wav', size: '12.8 MB', icon: Play, color: 'text-purple-500' },
                                { title: 'DGA_Directives_2026.docx', size: '1.1 MB', icon: FileText, color: 'text-emerald-500' },
                            ].map((file, i) => {
                                const FIcon = file.icon;
                                return (
                                    <div key={i} className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:shadow-md transition space-y-2">
                                        <FIcon className={file.color} size={28} />
                                        <div className="text-xs font-bold truncate">{file.title}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{file.size}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTool === 'chat' && (
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="text-indigo-500" size={20} /> AureChat Intercept Logs
                            </h2>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-2">
                                <div className="text-emerald-400 font-bold">[INTERCEPT #0994] Zero Cool &rarr; Jeremie</div>
                                <div>Zero Cool: "Did you verify the wire transfer at First Orynvell Bank?"</div>
                                <div>Jeremie: "Yes, 50,000 ₡ routed through vector account #0994-AURA."</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTool === 'maps' && (
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MapPin className="text-emerald-500" size={20} /> AureMaps Geospatial Tracker
                            </h2>
                        </div>
                        <div className="h-64 border border-slate-300 rounded-xl bg-slate-900 relative flex items-center justify-center text-white overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                            <div className="relative z-10 text-center space-y-2">
                                <MapPin className="text-emerald-400 mx-auto animate-bounce" size={32} />
                                <div className="font-bold text-sm">Target Location: Sector 3 Warehouse</div>
                                <div className="text-xs text-slate-400 font-mono">GPS Coordinates: 34.0921° N, 118.3241° W</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTool === 'scanner' && (
                    <div className="p-6 space-y-5 overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShieldCheck className="text-rose-500" size={20} /> AureScanner File Diagnostics
                            </h2>
                        </div>

                        {/* File Scanner Table */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Downloaded Asset Diagnostics</h3>
                            {scannedFiles.map((file) => (
                                <div key={file.id} className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50">
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">{file.name}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{file.size} • Threat: {file.threatLevel}</div>
                                    </div>
                                    <button
                                        onClick={() => handleRunScan(file.id)}
                                        disabled={scanProgress === file.id}
                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                                    >
                                        {scanProgress === file.id ? <RefreshCw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                                        <span>{file.status}</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* File Decryption Panel */}
                        <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-3">
                            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Key className="text-amber-500" size={16} /> Decrypt Corrupted Evidence
                            </h3>
                            <form onSubmit={handleDecrypt} className="flex gap-2">
                                <input
                                    type="text"
                                    value={decryptInput}
                                    onChange={(e) => setDecryptInput(e.target.value)}
                                    placeholder="Enter cipher key (e.g. 0x8891 or lightborn)..."
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-rose-500"
                                />
                                <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800">
                                    Decrypt
                                </button>
                            </form>
                            {decryptedFile && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono font-bold">
                                    {decryptedFile}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
