import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import { Home, Moon, BookOpen, Terminal, Sparkles, Box, Shield, Users, Pin, CheckCircle2, ChevronRight, ArrowUpRight, Bed, Coffee, Lock } from 'lucide-react';

export interface RoomUpgrade {
    id: string;
    name: string;
    effect: string;
    cost: number;
    unlocked: boolean;
    category: 'Rest' | 'Academic' | 'Security' | 'Social';
}

const INITIAL_UPGRADES: RoomUpgrade[] = [
    { id: 'mattress', name: 'Better Mattress', effect: 'Improves stamina recovery and lowers next-day fatigue', cost: 350, unlocked: false, category: 'Rest' },
    { id: 'storage', name: 'Expanded Storage', effect: 'Increases module, relic, and evidence capacity', cost: 450, unlocked: false, category: 'Rest' },
    { id: 'desk', name: 'Study Desk Upgrade', effect: 'Improves homework speed, research XP, and exam preparation', cost: 500, unlocked: false, category: 'Academic' },
    { id: 'dock', name: 'Secure Terminal Dock', effect: 'Adds safer access to hidden files and Process Monitor tools', cost: 800, unlocked: false, category: 'Security' },
    { id: 'aura_lamp', name: 'Aura Lamp', effect: 'Minor aura stabilization boost and reduces Veilwilt stress', cost: 600, unlocked: false, category: 'Rest' },
    { id: 'banner', name: 'House Pride Banner', effect: 'Boosts House identity and House-specific social reactions', cost: 250, unlocked: true, category: 'Social' },
    { id: 'seating', name: 'Guest Seating', effect: 'Allows hangouts, study sessions, and NPC confession scenes', cost: 400, unlocked: false, category: 'Social' },
    { id: 'compartment', name: 'Hidden Compartment', effect: 'Stores restricted files, lineage clues, and contraband modules safely', cost: 1200, unlocked: false, category: 'Security' },
];

export default function HousingApp() {
    const [activeTab, setActiveTab] = useState<'room' | 'board' | 'upgrades' | 'dreams'>('room');
    const [upgrades, setUpgrades] = useState<RoomUpgrade[]>(INITIAL_UPGRADES);
    const [stamina, setStamina] = useState(85);
    const [restMessage, setRestMessage] = useState<string | null>(null);
    const [dreamLogs, setDreamLogs] = useState<string[]>([
        'DREAM_ENTRY #04: A mirrored cathedral under coastal rain. A woman with silver hair whispers: "The code was never code, it was memory."',
        'DREAM_ENTRY #03: Falling through the Supercomputer factory floor. Glowing blue lines trace my pulse.',
    ]);

    const player = useOSStore((s) => s.gameplay.player);
    const credits = player?.credits || 0;
    const addCredits = useOSStore((s) => s.addCredits);
    const addXP = useOSStore((s) => s.addXP);

    const handleRest = () => {
        setStamina(100);
        const newDream = `DREAM_ENTRY #${dreamLogs.length + 5}: AETHERCORE whispers: "Maeryn's Lightborn bloodline will awaken when the Veil tears."`;
        setDreamLogs((prev) => [newDream, ...prev]);
        setRestMessage('💤 Slept peacefully. Stamina restored to 100%. Dream log updated.');
        setTimeout(() => setRestMessage(null), 4000);
        addXP(50);
    };

    const handleStudy = () => {
        if (stamina < 20) {
            setRestMessage('⚠️ You are too exhausted to study! Rest in your bed first.');
            setTimeout(() => setRestMessage(null), 3000);
            return;
        }
        setStamina((s) => Math.max(0, s - 20));
        addXP(120);
        setRestMessage('📖 Completed 2 hours of Cyacademy Syntax coursework. +120 Academic XP gained!');
        setTimeout(() => setRestMessage(null), 3000);
    };

    const handleBuyUpgrade = (u: RoomUpgrade) => {
        if (credits < u.cost) {
            setRestMessage(`⚠️ Insufficient credits! You need ${u.cost} credits.`);
            setTimeout(() => setRestMessage(null), 3000);
            return;
        }
        addCredits(-u.cost);
        setUpgrades((prev) => prev.map((item) => (item.id === u.id ? { ...item, unlocked: true } : item)));
        setRestMessage(`✨ Installed upgrade: ${u.name}!`);
        setTimeout(() => setRestMessage(null), 3000);
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f6fa] text-[#1c2438] font-sans select-none overflow-hidden">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#ffffff] border-b border-[#d8dce8] shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                        <Home size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-wider text-[#1e2640] uppercase font-mono">
                            AURELINE RESIDENTIAL QUARTERS // DORM 4B
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                            <span>Assigned House: <strong className="text-indigo-600 font-bold">Vector House</strong></span>
                            <span>•</span>
                            <span>Stamina: <strong className="text-emerald-600">{stamina} / 100</strong></span>
                            <span>•</span>
                            <span>Credits: <strong className="text-amber-600">{credits} ₢</strong></span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center bg-[#e9ecf4] p-1 rounded-lg border border-[#d8dce8]">
                    <button
                        onClick={() => setActiveTab('room')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                            activeTab === 'room' ? 'bg-[#ffffff] text-[#1e2640] shadow-xs border border-[#d8dce8]' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Bed size={13} />
                        <span>Room Hub</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('board')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                            activeTab === 'board' ? 'bg-[#ffffff] text-[#1e2640] shadow-xs border border-[#d8dce8]' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Pin size={13} />
                        <span>Room Board</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('upgrades')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                            activeTab === 'upgrades' ? 'bg-[#ffffff] text-[#1e2640] shadow-xs border border-[#d8dce8]' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Sparkles size={13} />
                        <span>Upgrades</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('dreams')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                            activeTab === 'dreams' ? 'bg-[#ffffff] text-[#1e2640] shadow-xs border border-[#d8dce8]' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Moon size={13} />
                        <span>DreamLog ({dreamLogs.length})</span>
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {restMessage && (
                <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-2 text-xs font-mono text-indigo-900 font-semibold flex items-center justify-between">
                    <span>{restMessage}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
                {/* ROOM HUB TAB */}
                {activeTab === 'room' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Bed Station */}
                        <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#d8dce8] shadow-xs flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold font-mono">
                                        <Bed size={16} />
                                        <span>BED / REST STATION</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        READY
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Ends the Sys-Cycle, restores full stamina, and triggers subconscious DreamLog memories from the Veil.
                                </p>
                            </div>
                            <button
                                onClick={handleRest}
                                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition shadow-xs active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Moon size={14} />
                                <span>Rest / Sleep Sys-Cycle</span>
                            </button>
                        </div>

                        {/* Study Station */}
                        <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#d8dce8] shadow-xs flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sky-600 font-bold font-mono">
                                        <BookOpen size={16} />
                                        <span>STUDY DESK & TERMINAL</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                        -20 STAMINA
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Study class notes, review library files, complete homework assignments, and advance your 9 Core Skills.
                                </p>
                            </div>
                            <button
                                onClick={handleStudy}
                                className="w-full py-2.5 rounded-xl bg-[#1e2640] hover:bg-[#2b3658] text-white font-mono text-xs font-bold transition shadow-xs active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Coffee size={14} />
                                <span>Study Coursework (+120 XP)</span>
                            </button>
                        </div>

                        {/* Dorm Storage & Safe */}
                        <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#d8dce8] shadow-xs flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-amber-600 font-bold font-mono">
                                        <Box size={16} />
                                        <span>SECURE STORAGE VAULT</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                        4 / 20 SLOTS
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Safely holds collected SpellForge modules, patient records, Purge relics, and classified evidence.
                                </p>
                            </div>
                            <div className="space-y-1 text-xs font-mono">
                                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between text-slate-700">
                                    <span>• Firewall.mod</span>
                                    <span className="text-slate-400">MOD</span>
                                </div>
                                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between text-slate-700">
                                    <span>• Purge_Record_01.arch</span>
                                    <span className="text-purple-600">ARCH</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ROOM BOARD TAB */}
                {activeTab === 'board' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-sm text-[#1e2640] font-mono uppercase">Pinned Memos & Campus Reminders</h3>
                            <span className="text-xs text-slate-500 font-mono">2 Active Notices</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#fffdf2] p-5 rounded-xl border border-[#f0e6c0] shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-amber-900 font-bold text-xs font-mono">
                                    <span>📍 DEAN CASSIAN ROOK ORIENTATION</span>
                                    <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded">DAY 1</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    All newly arrived citizens must complete the CITIZEN_REGISTRATION_FORM.osform and confirm their temporary dormitory assignment before attending morning Syntax classes.
                                </p>
                            </div>

                            <div className="bg-[#f0f7ff] p-5 rounded-xl border border-[#cfe2ff] shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-sky-900 font-bold text-xs font-mono">
                                    <span>🏥 FAITH MEDICAL DIRECTIVE</span>
                                    <span className="text-[10px] bg-sky-100 px-2 py-0.5 rounded">MANDATORY</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Veilwilt symptoms have been reported across the Old Factory Ward. Complete the FAITH_PATIENT_INTAKE.osform to receive an aura baseline stabilizer.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* UPGRADES TAB */}
                {activeTab === 'upgrades' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-sm text-[#1e2640] font-mono uppercase">Dormitory Upgrades & Expansions</h3>
                            <span className="text-xs text-slate-500 font-mono">Available Balance: {credits} ₢</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {upgrades.map((u) => (
                                <div
                                    key={u.id}
                                    className="bg-[#ffffff] p-5 rounded-xl border border-[#d8dce8] shadow-xs flex flex-col justify-between space-y-3"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm text-[#1e2640]">{u.name}</h4>
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                {u.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{u.effect}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-[#f0f2f8]">
                                        <span className="text-xs font-mono font-bold text-amber-600">{u.cost} ₢</span>
                                        {u.unlocked ? (
                                            <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 size={13} /> INSTALLED
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleBuyUpgrade(u)}
                                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition shadow-xs"
                                            >
                                                Purchase Upgrade
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DREAMLOG TAB */}
                {activeTab === 'dreams' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-sm text-[#1e2640] font-mono uppercase">Veil DreamLogs // Subconscious Telemetry</h3>
                            <span className="text-xs text-purple-600 font-mono font-bold">Lightborn Signal Active</span>
                        </div>
                        <div className="space-y-3">
                            {dreamLogs.map((log, index) => (
                                <div
                                    key={index}
                                    className="bg-[#faf5ff] p-4 rounded-xl border border-[#e9d5ff] font-mono text-xs text-purple-950 leading-relaxed shadow-xs"
                                >
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
