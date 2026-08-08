import React from 'react';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/contents';
import PublicIcon from './ui/PublicIcon';

const ICONS = {
    progression: '/icons/Icon set 1/0.5x/Ranking 256 px.png',
    tasks: '/icons/Icon set 1/0.5x/Map 256 px.png',
    next: '/icons/Icon set 1/0.5x/Next 256 px.png',
    done: '/icons/Icons8/icons8-done-16.svg',
};

const ROUTES = {
    Q_DAY1_2: 'mail', Q_DAY1_3: 'passport', Q_DAY1_4: 'pulse', Q_DAY1_5: 'comms',
    J01: 'files', A01: 'browser', T01: 'files', M01: 'browser',
};

export default function ProgressionPanel() {
    const player = useOSStore((state) => state.gameplay.player);
    const activities = player?.activities || [];
    const toggleApp = useOSStore((state) => state.toggleApp);
    const xpProgress = (player?.xp || 0) % 100;
    const active = activities.filter((item) => item.status === 'IN_PROGRESS' || item.status === 'AVAILABLE').slice(0, 5);
    const completed = activities.filter((item) => item.status === 'COMPLETED').length;

    const openRoute = (activity) => {
        const app = APPS.find((candidate) => candidate.id === (ROUTES[activity.id] || 'browser'));
        if (app) toggleApp(app);
    };

    return (
        <aside className="misty-navy-panel col-span-3 flex h-full flex-col overflow-y-auto border-0 p-5 backdrop-blur-[12px]">
            <section className="border-b border-[#cbd3e3]/20 pb-5">
                <div className="flex items-center justify-between"><h2 className="font-display text-base text-[#f3f5fb]">Progression</h2><PublicIcon src={ICONS.progression} size={16} /></div>
                <div className="mt-4 flex items-end justify-between"><div><div className="font-ui text-[8px] uppercase tracking-wider text-[#c3ccdf]">Citizen level</div><div className="mt-1 font-display text-3xl text-[#f3f5fb]">{player?.level || 1}</div></div><div className="pb-1 text-right font-ui text-[9px] text-[#c3ccdf]">{xpProgress}/100 XP</div></div>
                <div className="mt-2 h-1.5 border border-[#cbd3e3]/20 bg-white/10"><div className="h-full bg-[#aebcff]" style={{ width: `${xpProgress}%` }} /></div>
            </section>

            <section className="flex-1 py-5">
                <div className="mb-3 flex items-center justify-between"><h3 className="font-display text-sm text-[#f3f5fb]">Active tasks</h3><PublicIcon src={ICONS.tasks} size={15} /></div>
                <div className="divide-y divide-[#cbd3e3]/12 border-y border-[#cbd3e3]/18">
                    {active.map((activity) => (
                        <button key={activity.id} onClick={() => openRoute(activity)} className="flex w-full items-start gap-3 bg-white/6 px-2 py-3 text-left hover:bg-white/12">
                            <span className="mt-0.5 h-2 w-2 shrink-0 bg-[#aebcff]" />
                            <span className="min-w-0 flex-1"><span className="block font-ui text-[10px] font-semibold text-[#f1f4fb]">{activity.title}</span><span className="mt-1 block line-clamp-2 font-body text-[9px] leading-relaxed text-[#c3ccdf]">{activity.desc}</span><span className="mt-2 block font-ui text-[8px] text-[#d8bc80]">{activity.reward}</span></span>
                            <PublicIcon src={ICONS.next} size={11} className="mt-1 opacity-55" />
                        </button>
                    ))}
                </div>
            </section>

            <section className="border-t border-[#cbd3e3]/20 pt-5">
                <div className="flex items-center justify-between font-ui text-[9px] uppercase tracking-wider text-[#c3ccdf]"><span>Quest log</span><span className="flex items-center gap-1 text-[#8dd0bc]"><PublicIcon src={ICONS.done} size={12} /> {completed} complete</span></div>
                <div className="mt-3 grid grid-cols-2 border border-[#cbd3e3]/20 bg-white/8 text-center"><div className="border-r border-[#cbd3e3]/18 p-3"><div className="font-display text-lg text-[#c7d0ff]">{active.length}</div><div className="font-ui text-[8px] uppercase text-[#c3ccdf]">Open</div></div><div className="p-3"><div className="font-display text-lg text-[#8dd0bc]">{completed}</div><div className="font-ui text-[8px] uppercase text-[#c3ccdf]">Resolved</div></div></div>
            </section>
        </aside>
    );
}
