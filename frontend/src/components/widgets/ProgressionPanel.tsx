import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Scroll, Radio, Sparkles, ClipboardList, Globe } from 'lucide-react';

export default function ProgressionPanel() {
    const player = useOSStore((state) => state.gameplay.player);
    const corruption = useOSStore((state) => state.gameplay.prismCorruptionLevel) || 0;
    const activities = player?.activities || [];
    const toggleApp = useOSStore((state) => state.toggleApp);

    const openAppById = (id) => {
        const windows = useOSStore.getState().windows;
        const app = windows.find((w) => w.id === id) || { id };
        toggleApp(app);
    };

    const activeCount = activities.filter((a) => a.status === 'IN_PROGRESS' || a.status === 'AVAILABLE').length;
    const completedCount = activities.filter((a) => a.status === 'COMPLETED').length;

    return (
        <aside className="col-span-2 flex h-full flex-col justify-between p-4 bg-[#d4d8e4] text-[#1e293b] font-sans border-l border-[#2b3a67]/20 select-none overflow-y-auto">
            <div className="space-y-4">

                {/* Frame 2: Top Circular Faction Emblem Avatar */}
                <div className="pt-2 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-[#c3d1f0] border-2 border-[#2b3a67]/30 flex items-center justify-center shadow-xs mx-auto text-[#2b3a67]">
                        <Globe size={44} />
                    </div>
                </div>

                {/* Frame 2: Divider Line & Centered Header Info */}
                <div className="border-t border-[#2b3a67]/30 pt-3 text-center space-y-0.5">
                    <h1 className="font-serif font-bold text-base text-[#1e2b4f] leading-tight">
                        {player?.houseAffiliation || 'VectorNet Alliance'}
                    </h1>
                    <div className="text-xs font-medium text-slate-700">
                        Clearance Level {player?.clearanceLevel || 1} • Rank I
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                        Sector 3 Operations Hub
                    </div>
                </div>

                {/* Frame 2: Navy Blue Action Box */}
                <div className="bg-[#2b3a67] text-white rounded-xl p-3.5 flex items-center justify-around shadow-md">
                    <button
                        onClick={() => openAppById('board')}
                        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
                        title="Open Master Tracker"
                    >
                        <Scroll size={22} />
                    </button>
                    <button
                        onClick={() => openAppById('pulse')}
                        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
                        title="Open Pulse Network"
                    >
                        <Radio size={22} />
                    </button>
                    <button
                        onClick={() => openAppById('spellforge')}
                        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
                        title="Open SpellForge Matrix"
                    >
                        <Sparkles size={22} />
                    </button>
                </div>

                {/* Frame 2: PROGRESSION STATE Section */}
                <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                        PROGRESSION STATE
                    </div>
                    <div className="flex items-center justify-between bg-white/40 border border-[#2b3a67]/20 p-3 rounded-xl">
                        <div className="space-y-1.5 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <span className="text-indigo-700 font-bold">• Active Quests: {activeCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-purple-700 font-bold">• Journeys: Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-700 font-bold">• PRISM Corruption: {corruption}%</span>
                            </div>
                        </div>

                        {/* Mission Operations Button */}
                        <button
                            onClick={() => openAppById('board')}
                            className="relative w-14 h-14 bg-[#2b3a67] rounded-xl border border-[#2b3a67] shadow-xs flex flex-col items-center justify-center hover:bg-[#35477d] transition cursor-pointer text-white shrink-0"
                            title="Open Mission Operations"
                        >
                            <ClipboardList size={22} />
                            <span className="mt-0.5 text-[8px] font-mono uppercase tracking-wide">Ops</span>
                            {activeCount > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 min-w-5 h-5 px-1 rounded-full bg-amber-400 text-[#1e2b4f] border-2 border-[#d4d8e4] flex items-center justify-center text-[9px] font-bold">
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Frame 2: Bottom 2-Column Split Box */}
            <div className="mt-4 border border-[#2b3a67]/30 rounded-xl overflow-hidden grid grid-cols-2 bg-white/50 font-mono text-center text-xs divide-x divide-[#2b3a67]/30">
                <div className="p-3 space-y-0.5">
                    <div className="text-[9px] uppercase text-slate-500 font-bold">Open Tasks</div>
                    <div className="font-bold text-sm text-[#1e2b4f]">{activeCount}</div>
                </div>
                <div className="p-3 space-y-0.5">
                    <div className="text-[9px] uppercase text-slate-500 font-bold">Resolved</div>
                    <div className="font-bold text-sm text-emerald-700">{completedCount}</div>
                </div>
            </div>
        </aside>
    );
}
