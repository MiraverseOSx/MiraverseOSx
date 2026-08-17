import React, { useState, useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';
import { Activity, ShieldAlert, Cpu, Search, AlertTriangle, CheckCircle, Terminal, Play, Pause, RefreshCw, Lock, Zap, FileText } from 'lucide-react';
import Button from '../components/ui/button';

export interface SystemProcess {
    id: string;
    pid: number;
    name: string;
    description: string;
    origin: string; // 'System' | 'Cyacademy' | 'DGA' | 'Transit' | 'PRISM' | 'AETHERCORE'
    cpuUsage: number;
    memoryMb: number;
    isCorrupted: boolean;
    isQuarantined: boolean;
    threatLevel: 'Safe' | 'Low' | 'Medium' | 'Critical';
    impossibleOrigin?: boolean;
}

const INITIAL_PROCESSES: SystemProcess[] = [
    { id: 'p1', pid: 104, name: 'net_relay.sys', description: 'Municipal Mesh Network Link Driver', origin: 'System', cpuUsage: 1.2, memoryMb: 34.5, isCorrupted: false, isQuarantined: false, threatLevel: 'Safe' },
    { id: 'p2', pid: 218, name: 'cyacademy_sync.daemon', description: 'Student Telemetry & Syllabus Router', origin: 'Cyacademy', cpuUsage: 0.8, memoryMb: 48.2, isCorrupted: false, isQuarantined: false, threatLevel: 'Safe' },
    { id: 'p3', pid: 342, name: 'faith_telemetry.service', description: 'Patient Bio-Aura Vital Monitor Hook', origin: 'System', cpuUsage: 2.1, memoryMb: 62.0, isCorrupted: false, isQuarantined: false, threatLevel: 'Safe' },
    { id: 'p4', pid: 409, name: 'dga_warden_scan.node', description: 'Directive 14-B Civic Compliance Sentinel', origin: 'DGA', cpuUsage: 4.5, memoryMb: 112.4, isCorrupted: false, isQuarantined: false, threatLevel: 'Safe' },
    { id: 'p5', pid: 512, name: 'prism_subconduit_bleed.hex', description: 'Unregistered Supercomputer Memory Hook', origin: 'PRISM', cpuUsage: 18.4, memoryMb: 340.1, isCorrupted: true, isQuarantined: false, threatLevel: 'Critical' },
    { id: 'p6', pid: 660, name: 'AETHERCORE.sys', description: 'Reality Protocol Translation Driver [ERASED RECORD]', origin: 'AETHERCORE', cpuUsage: 9.8, memoryMb: 512.0, isCorrupted: true, isQuarantined: false, threatLevel: 'Critical', impossibleOrigin: true },
    { id: 'p7', pid: 780, name: 'lumen_market_ticker.app', description: 'District Merchant Price & Rare Relic Index', origin: 'Transit', cpuUsage: 0.5, memoryMb: 24.1, isCorrupted: false, isQuarantined: false, threatLevel: 'Safe' },
    { id: 'p8', pid: 899, name: 'FAITH_WARD_07.log.daemon', description: 'Sealed Purge-Era Patient Archive Reader', origin: 'AETHERCORE', cpuUsage: 3.4, memoryMb: 88.0, isCorrupted: true, isQuarantined: false, threatLevel: 'Medium', impossibleOrigin: true },
    { id: 'p9', pid: 914, name: 'sub_aureline_node.relay', description: 'Underground Tunnel Mesh Proxy', origin: 'Transit', cpuUsage: 1.1, memoryMb: 42.0, isCorrupted: false, isQuarantined: false, threatLevel: 'Safe' },
];

export default function ProcessMonitorApp() {
    const [processes, setProcesses] = useState<SystemProcess[]>(INITIAL_PROCESSES);
    const [selectedPid, setSelectedPid] = useState<number | null>(512);
    const [filterQuery, setFilterQuery] = useState('');
    const [actionLog, setActionLog] = useState<string[]>([
        'SYS_INIT: Process Monitor v2.1.0 initialized.',
        'SCAN: Detecting background threads and memory allocations...',
    ]);
    const [isScanning, setIsScanning] = useState(false);

    const prismCorruption = useOSStore((s) => s.gameplay.prismCorruptionLevel || 0);
    const addCredits = useOSStore((s) => s.addCredits);
    const addXP = useOSStore((s) => s.addXP);

    const selectedProcess = processes.find((p) => p.pid === selectedPid);

    const handleQuarantine = (pid: number) => {
        setProcesses((prev) =>
            prev.map((p) => {
                if (p.pid === pid) {
                    return { ...p, isQuarantined: true, cpuUsage: 0, threatLevel: 'Safe' };
                }
                return p;
            })
        );
        setActionLog((prev) => [
            `QUARANTINE_SUCCESS: Process PID ${pid} locked in secure sandbox container.`,
            `THREAT_NEUTRALIZED: PRISM leak stopped. +150 XP, +250 Credits awarded.`,
            ...prev,
        ]);
        addCredits(250);
        addXP(150);
    };

    const handleTrace = (p: SystemProcess) => {
        setActionLog((prev) => [
            `TRACE_ROUTE [PID ${p.pid}]: Origin -> ${p.origin} (Supercomputer Sub-Level 4)`,
            `PACKET_HEADERS: Protocol signature matches ${p.impossibleOrigin ? 'AETHERCORE Year 0 Matrix' : 'PRISM Neural Mesh'}.`,
            ...prev,
        ]);
    };

    const handleDeepScan = () => {
        setIsScanning(true);
        setActionLog((prev) => ['SCANNING: Deep kernel memory inspection in progress...', ...prev]);
        setTimeout(() => {
            setIsScanning(false);
            setActionLog((prev) => [
                'SCAN_COMPLETE: 9 active threads inspected. 2 anomalous signatures detected.',
                'WARNING: AETHERCORE.sys demonstrates impossible pre-code reality alteration.',
                ...prev,
            ]);
        }, 1500);
    };

    const filtered = processes.filter(
        (p) =>
            p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
            p.origin.toLowerCase().includes(filterQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#0d1322] text-[#d4daf0] font-sans select-none overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-[#090e1a] border-b border-[#1f2b48]">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                        <Cpu size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-wider text-sky-300 font-mono uppercase">
                            PROCESS MONITOR // DIGITAL DEFENSE CORE
                        </h2>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                            <span>OS Threat Level: <strong className="text-amber-400">{prismCorruption.toFixed(1)}% CORRUPTION</strong></span>
                            <span>•</span>
                            <span>Active Threads: <strong className="text-slate-200">{processes.length}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter processes..."
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            className="h-8 w-48 rounded-lg bg-[#131b2e] border border-[#233254] pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                        />
                    </div>
                    <button
                        onClick={handleDeepScan}
                        disabled={isScanning}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-semibold transition shadow-xs active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
                        <span>{isScanning ? 'Scanning...' : 'Deep Scan'}</span>
                    </button>
                </div>
            </div>

            {/* Split View Workspace */}
            <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
                {/* Process List Table */}
                <div className="col-span-8 border-r border-[#1f2b48] overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="sticky top-0 bg-[#0c1220] border-b border-[#1f2b48] text-slate-400 text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="py-2.5 px-4">PID</th>
                                <th className="py-2.5 px-4">Process Name</th>
                                <th className="py-2.5 px-4">Origin</th>
                                <th className="py-2.5 px-4">CPU</th>
                                <th className="py-2.5 px-4">Memory</th>
                                <th className="py-2.5 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#162138]">
                            {filtered.map((p) => {
                                const isSelected = p.pid === selectedPid;
                                return (
                                    <tr
                                        key={p.pid}
                                        onClick={() => setSelectedPid(p.pid)}
                                        className={`cursor-pointer transition ${
                                            isSelected
                                                ? 'bg-[#182440] text-sky-200'
                                                : 'hover:bg-[#121a2e] text-slate-300'
                                        }`}
                                    >
                                        <td className="py-3 px-4 text-slate-500">{p.pid}</td>
                                        <td className="py-3 px-4 font-bold flex items-center gap-2">
                                            {p.isCorrupted && !p.isQuarantined && (
                                                <AlertTriangle size={13} className="text-rose-400 animate-pulse" />
                                            )}
                                            {p.isQuarantined && <Lock size={13} className="text-emerald-400" />}
                                            {!p.isCorrupted && !p.isQuarantined && <CheckCircle size={13} className="text-sky-400" />}
                                            <span className={p.impossibleOrigin ? 'text-purple-300 underline' : ''}>{p.name}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded border ${
                                                    p.origin === 'PRISM'
                                                        ? 'bg-rose-950/60 text-rose-300 border-rose-700'
                                                        : p.origin === 'AETHERCORE'
                                                        ? 'bg-purple-950/60 text-purple-300 border-purple-700'
                                                        : 'bg-slate-800 text-slate-300 border-slate-700'
                                                }`}
                                            >
                                                {p.origin}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{p.cpuUsage}%</td>
                                        <td className="py-3 px-4">{p.memoryMb} MB</td>
                                        <td className="py-3 px-4">
                                            {p.isQuarantined ? (
                                                <span className="text-emerald-400 font-bold">QUARANTINED</span>
                                            ) : p.isCorrupted ? (
                                                <span className="text-rose-400 font-bold animate-pulse">MALWARE</span>
                                            ) : (
                                                <span className="text-slate-400">ACTIVE</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Process Details & Diagnostic Actions */}
                <div className="col-span-4 flex flex-col justify-between p-5 bg-[#0a0f1d] overflow-y-auto">
                    {selectedProcess ? (
                        <div className="space-y-4">
                            <div>
                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">THREAD INSPECTION</div>
                                <h3 className="text-lg font-bold text-sky-200 font-mono mt-0.5">{selectedProcess.name}</h3>
                                <p className="text-xs text-slate-400 mt-1">{selectedProcess.description}</p>
                            </div>

                            {selectedProcess.impossibleOrigin && (
                                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs font-mono">
                                    <strong className="text-purple-300">⚡ AETHERCORE ARTIFACT:</strong> This process points to the erased pre-code operating system that altered physical reality.
                                </div>
                            )}

                            {selectedProcess.isCorrupted && !selectedProcess.isQuarantined && (
                                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono">
                                    <strong className="text-rose-400">⚠️ ACTIVE DATA BLEED:</strong> Consuming system credits and attempting memory hijacking.
                                </div>
                            )}

                            <div className="space-y-2 text-xs font-mono pt-2 border-t border-[#1f2b48]">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Process ID:</span>
                                    <span className="text-slate-200">{selectedProcess.pid}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Origin Domain:</span>
                                    <span className="text-slate-200">{selectedProcess.origin}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Memory Allocation:</span>
                                    <span className="text-slate-200">{selectedProcess.memoryMb} MB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Threat Rating:</span>
                                    <span className={selectedProcess.threatLevel === 'Critical' ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                                        {selectedProcess.threatLevel}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 pt-4">
                                {selectedProcess.isCorrupted && !selectedProcess.isQuarantined && (
                                    <button
                                        onClick={() => handleQuarantine(selectedProcess.pid)}
                                        className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Lock size={14} />
                                        <span>Quarantine Malicious Thread</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleTrace(selectedProcess)}
                                    className="w-full py-2 rounded-lg bg-[#182440] hover:bg-[#203054] text-sky-200 font-mono text-xs font-semibold border border-[#2c3d66] transition flex items-center justify-center gap-2"
                                >
                                    <Terminal size={14} />
                                    <span>Trace Sub-Level Route</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-xs font-mono text-center py-12">
                            Select a process to inspect telemetry.
                        </div>
                    )}

                    {/* Console Activity Log */}
                    <div className="mt-6 pt-4 border-t border-[#1f2b48]">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Live Kernel Telemetry</div>
                        <div className="bg-[#050811] p-3 rounded-lg border border-[#162138] h-36 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1">
                            {actionLog.map((log, idx) => (
                                <div key={idx} className="leading-tight">
                                    <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
