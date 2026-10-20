import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';
import DailyLifePanel from './DailyLifePanel';
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
    const [activeTab, setActiveTab] = useState<'room' | 'life' | 'board' | 'upgrades' | 'dreams'>('room');
    const [sleepDuration, setSleepDuration] = useState<'short' | 'standard' | 'full'>('full');
    const [restMessage, setRestMessage] = useState<string | null>(null);

    const player = useOSStore((s) => s.gameplay.player);
    const credits = player?.credits || 0;
    const bits = player?.bits || 0;
    const stamina = player?.stamina ?? 85;
    const auraHealth = player?.auraHealth ?? 100;
    const activeConditions: string[] = Array.isArray(player?.conditions) ? player.conditions : [];
    const unlockedIds = player?.unlockedHousingUpgrades || ['banner'];
    const dreamLogs = player?.dreamLogs || [
        'DREAM_ENTRY #04: A mirrored cathedral under coastal rain. A woman with silver hair whispers: "The code was never code, it was memory."',
        'DREAM_ENTRY #03: Falling through the Supercomputer factory floor. Glowing blue lines trace my pulse.',
    ];

    const upgrades: RoomUpgrade[] = INITIAL_UPGRADES.map((u) => ({
        ...u,
        unlocked: unlockedIds.includes(u.id),
    }));

    const restInDorm = useOSStore((s) => s.restInDorm);
    const studyInHousing = useOSStore((s) => s.studyInHousing);
    const purchaseHousingUpgrade = useOSStore((s) => s.purchaseHousingUpgrade);

    const handleRest = () => {
        const res = restInDorm(sleepDuration);
        setRestMessage(`${res?.message || 'Rest complete. Stamina & Aura recovered based on duration, upgrades, and conditions.'}`);
        setTimeout(() => setRestMessage(null), 5000);
    };

    const handleStudy = () => {
        const res = studyInHousing();
        setRestMessage(res.ok ? `${res.message}` : `${res.message}`);
        setTimeout(() => setRestMessage(null), 3500);
    };

    const handleBuyUpgrade = (upgradeId: string, cost: number, bitCost: number = 0) => {
        const res = purchaseHousingUpgrade(upgradeId, cost, bitCost);
        setRestMessage(res.ok ? `${res.message}` : `${res.message}`);
        setTimeout(() => setRestMessage(null), 3500);
    };

    const sections = [
        { id: 'life', label: 'Everyday life', icon: Coffee, title: 'Time that is yours.', description: 'Simple routines, familiar places, and a home to live in.' },
        { id: 'room', label: 'Living space', icon: Home, title: 'A place to return to.', description: 'Rest, study, and keep the things that matter close.' },
        { id: 'board', label: 'House notices', icon: Pin, title: 'Around the residence.', description: 'Notes and news from your corner of Aureline.' },
        { id: 'upgrades', label: 'Furnishings', icon: Box, title: 'Make it your own.', description: 'Thoughtful additions for a more comfortable home.' },
        { id: 'dreams', label: 'Dream journal', icon: Moon, title: 'What the night leaves behind.', description: 'Fragments, discoveries, and the occasional familiar voice.' },
    ];
    const section = sections.find(item => item.id === activeTab)!;
    return (
        <div className="homecraft-workspace">
            <aside className="homecraft-index" aria-label="Residence navigation">
                <span className="workspace-kicker">Aureline residences</span>
                <div className="homecraft-address"><span>VECTOR HOUSE</span><strong>4B<span> / your suite</span></strong></div>
                <svg className="homecraft-plan" viewBox="0 0 160 126" fill="none" aria-label="Suite 4B floor plan" role="img"><path d="M12 12h136v102H90m-25 0H12V12m86 0v46h50M12 78h50v36" /><path d="M65 114a25 25 0 0 1 25-25v25M98 58a21 21 0 0 1-21-21h21" /><rect x="23" y="24" width="38" height="43" /><path d="M23 36h38m50-12h24v22h-24zM24 88h24v14H24z" /><path d="M62 12h20m66 59v23" strokeWidth="4" /></svg>
                <nav>{sections.map(item => { const Icon = item.icon; return <button key={item.id} aria-pressed={activeTab === item.id} onClick={() => setActiveTab(item.id as typeof activeTab)}><Icon size={16} /><span>{item.label}</span>{item.id === 'dreams' && <small>{dreamLogs.length}</small>}</button>; })}</nav>
                <dl className="homecraft-stats"><div><dt>Room comfort</dt><dd>{player?.roomComfort ?? player?.dormComfort ?? 50}<small>/100</small></dd></div><div><dt>Stamina</dt><dd>{stamina}<small>/100</small></dd></div><div><dt>Available credits</dt><dd>{credits.toLocaleString()} ₢</dd></div></dl>
            </aside>
            <div className="homecraft-body">
                <header className="homecraft-heading"><span className="workspace-kicker">Homecraft / {section.label}</span><h1>{section.title}</h1><p>{section.description}</p></header>
            {/* Notification alert */}
            {restMessage && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs font-ui text-amber-900 font-semibold flex items-center justify-between">
                    <span>{restMessage}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="homecraft-content">
                {activeTab === 'life' && <DailyLifePanel onShop={() => setActiveTab('upgrades')} />}
                {/* ROOM HUB TAB */}
                {activeTab === 'room' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Bed Station */}
                        <div className="homecraft-station flex flex-col justify-between space-y-4">
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-indigo-700 font-bold font-mono">
                                        <Bed size={16} />
                                        <span>Rest & recovery</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        AURA {auraHealth}%
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Choose how long to rest. Your room and current conditions shape your recovery.
                                </p>
                                <div className="grid grid-cols-3 gap-1.5 pt-1">
                                    {[
                                        { id: 'short', label: 'Short Nap', sub: '+1 Seg' },
                                        { id: 'standard', label: 'Standard', sub: '+2 Segs' },
                                        { id: 'full', label: 'Overnight', sub: 'Next Day' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setSleepDuration(opt.id as any)}
                                            className={`rounded-lg border px-2 py-1.5 text-center font-mono text-[10px] transition ${
                                                sleepDuration === opt.id
                                                    ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-900'
                                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div>{opt.label}</div>
                                            <div className="text-[9px] text-slate-400">{opt.sub}</div>
                                        </button>
                                    ))}
                                </div>
                                {activeConditions.length > 0 && !unlockedIds.includes('aura_lamp') && (
                                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[10px] text-amber-900 font-mono">
                                        Active Condition ({activeConditions.join(', ')}) reduces peak recovery until treated at Faith Medical or stabilized with an Aura Lamp.
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleRest}
                                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold transition shadow-xs active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Moon size={14} />
                                <span>Rest in Housing ({sleepDuration.toUpperCase()})</span>
                            </button>
                        </div>

                        {/* Study Station */}
                        <div className="homecraft-station flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sky-700 font-bold font-mono">
                                        <BookOpen size={16} />
                                        <span>At your desk</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                        -20 STAMINA
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Study class notes, review library files, complete homework assignments, and advance your Core Skills.
                                </p>
                            </div>
                            <button
                                onClick={handleStudy}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold transition shadow-xs active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Coffee size={14} />
                                <span>Study Coursework (+120 XP)</span>
                            </button>
                        </div>

                        {/* Housing Storage & Safe */}
                        <div className="homecraft-station flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-amber-800 font-bold font-mono">
                                        <Box size={16} />
                                        <span>In safekeeping</span>
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
                                    <span className="text-purple-700">ARCH</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ROOM BOARD TAB */}
                {activeTab === 'board' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-sm text-slate-900 font-mono uppercase">Pinned Memos & Housing Reminders</h3>
                            <span className="text-xs text-slate-500 font-mono">2 Active Notices</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200 shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-amber-950 font-bold text-xs font-mono">
                                    <span>📍 DEAN CASSIAN ROOK ORIENTATION</span>
                                    <span className="text-[10px] bg-amber-200/80 text-amber-950 font-bold px-2 py-0.5 rounded">DAY 1</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    All newly arrived citizens must complete the CITIZEN_REGISTRATION_FORM.osform and confirm their housing assignment before attending morning Syntax classes.
                                </p>
                            </div>

                            <div className="bg-sky-50/70 p-5 rounded-xl border border-sky-200 shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-sky-950 font-bold text-xs font-mono">
                                    <span>🏥 FAITH MEDICAL DIRECTIVE</span>
                                    <span className="text-[10px] bg-sky-200/80 text-sky-950 font-bold px-2 py-0.5 rounded">MANDATORY</span>
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
                            <h3 className="font-bold text-sm text-slate-900 font-mono uppercase">HOMECRAFT Upgrades & Expansions</h3>
                            <div className="flex items-center gap-3 text-xs font-mono">
                                <span>Balance: <strong className="text-amber-800 font-bold">{credits} ₢</strong></span>
                                <span>•</span>
                                <span><strong className="text-emerald-700 font-bold">{bits} ◈ BITS</strong></span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {upgrades.map((u) => (
                                <div
                                    key={u.id}
                                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm text-slate-900">{u.name}</h4>
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                {u.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{u.effect}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <span className="text-xs font-mono font-bold text-amber-800">{u.cost} ₢</span>
                                        {u.unlocked ? (
                                             <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                                                <CheckCircle2 size={13} /> INSTALLED
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleBuyUpgrade(u.id, u.cost)}
                                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold transition shadow-xs"
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
                            <h3 className="font-bold text-sm text-slate-900 font-mono uppercase">Veil DreamLogs // Subconscious Telemetry</h3>
                            <span className="text-xs text-purple-700 font-mono font-bold">Lightborn Signal Active</span>
                        </div>
                        <div className="space-y-3">
                            {dreamLogs.map((log, index) => (
                                <div
                                    key={index}
                                    className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 font-mono text-xs text-purple-950 leading-relaxed shadow-xs"
                                >
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
