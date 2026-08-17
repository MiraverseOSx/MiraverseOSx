import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Lock, Smartphone, Mail, Home, CheckCircle2, AlertCircle, Cpu, Radio, Shield, User } from 'lucide-react';

export default function IdentityVitals({ onOpenCitizenRecord, onTogglePhone }) {
    const player = useOSStore((state) => state.gameplay.player);
    const identity = useOSStore((state) => state.gameplay.identity);
    const toggleApp = useOSStore((state) => state.toggleApp);
    const toggleSanctuary = useOSStore((state) => state.toggleSanctuary);

    const openAppById = (id) => {
        const windows = useOSStore.getState().windows;
        const app = windows.find((w) => w.id === id) || { id };
        toggleApp(app);
    };

    return (
        <aside className="col-span-2 flex h-full flex-col justify-between p-4 bg-[#d4d8e4] text-[#1e293b] font-sans border-r border-[#2b3a67]/20 select-none overflow-y-auto">
            <div className="space-y-4">
                
                {/* Frame 2: Top Circular Avatar */}
                <div className="pt-2 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-[#b5c7e8] border-2 border-[#2b3a67]/30 flex items-center justify-center shadow-xs mx-auto text-[#2b3a67]">
                        <User size={48} />
                    </div>
                </div>

                {/* Frame 2: Divider Line & Centered Header Info */}
                <div className="border-t border-[#2b3a67]/30 pt-3 text-center space-y-0.5">
                    <h1 className="font-serif font-bold text-base text-[#1e2b4f] leading-tight">
                        {player?.name || 'Provisional Citizen'}
                    </h1>
                    <div className="text-xs font-medium text-slate-700">
                        {identity?.profileTags?.[0] || '#Scholar'} • Level {player?.level || 1}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                        {identity?.declaredRegion || 'Aureline Central'}
                    </div>
                </div>

                {/* Frame 2: Navy Blue Action Box */}
                <div className="bg-[#2b3a67] text-white rounded-xl p-3.5 flex items-center justify-around shadow-md">
                    <button
                        onClick={onOpenCitizenRecord}
                        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
                        title="Open Citizen Record (Passport)"
                    >
                        <Lock size={22} />
                    </button>
                    <button
                        onClick={() => openAppById('mail')}
                        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
                        title="Open Mailbox"
                    >
                        <Mail size={22} />
                    </button>
                    <button
                        onClick={onTogglePhone || (() => openAppById('comms'))}
                        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
                        title="Open Phone Component"
                    >
                        <Smartphone size={22} />
                    </button>
                </div>

                {/* Frame 2: IDENTITY STATE Section */}
                <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                        IDENTITY STATE
                    </div>
                    <div className="flex items-center justify-between bg-white/40 border border-[#2b3a67]/20 p-3 rounded-xl">
                        <div className="space-y-1.5 text-xs font-mono">
                            {[
                                ['Fingerprint', identity?.fingerprint],
                                ['Facial Record', identity?.facial],
                                ['Aura Baseline', identity?.auraBaseline],
                            ].map(([label, complete]) => (
                                <div key={label} className="flex items-center gap-2">
                                    <span className={complete ? 'text-emerald-700 font-bold' : 'text-amber-800'}>
                                        {complete ? '✓' : '•'} {label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* White Square Home Button */}
                        <button
                            onClick={toggleSanctuary}
                            className="w-14 h-14 bg-white rounded-xl border border-slate-300 shadow-xs flex items-center justify-center hover:bg-slate-50 transition cursor-pointer text-slate-900 shrink-0"
                            title="Home / Sanctuary Mode"
                        >
                            <Home size={26} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Frame 2: Bottom 2-Column Split Box */}
            <div className="mt-4 border border-[#2b3a67]/30 rounded-xl overflow-hidden grid grid-cols-2 bg-white/50 font-mono text-center text-xs divide-x divide-[#2b3a67]/30">
                <div className="p-3 space-y-0.5">
                    <div className="text-[9px] uppercase text-slate-500 font-bold">CPU Load</div>
                    <div className="font-bold text-sm text-[#1e2b4f]">42%</div>
                </div>
                <div className="p-3 space-y-0.5">
                    <div className="text-[9px] uppercase text-slate-500 font-bold">Network</div>
                    <div className="font-bold text-sm text-indigo-700">98%</div>
                </div>
            </div>
        </aside>
    );
}
