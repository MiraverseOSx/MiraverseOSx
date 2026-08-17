import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import PublicIcon from '../ui/PublicIcon';

const TIME_SEGMENTS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const ICONS = {
    core: '/icons/Icon set 1/0.5x/Star 256 px.png',
    aura: '/icons/Icons8/icons8-audio-wave-50.gif',
    prism: '/icons/Icon set 1/0.5x/Danger sign 1 256 px.png',
    time: '/icons/Icon set 1/0.5x/Next 256 px.png',
    signal: '/icons/Icon set 1/0.5x/Network 2 256 px.png',
};

function RadarChart({ values }) {
    const center = 110;
    const radius = 76;
    const point = (index, scale = 1) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
        return [center + Math.cos(angle) * radius * scale, center + Math.sin(angle) * radius * scale];
    };
    const polygon = values.map((entry, index) => point(index, entry.value / 100).join(',')).join(' ');
    const rings = [0.33, 0.66, 1].map((scale) => values.map((_, index) => point(index, scale).join(',')).join(' '));
    return (
        <svg viewBox="0 0 220 220" className="h-56 w-56" role="img" aria-label="Citizen capability radar">
            {rings.map((ring, index) => <polygon key={index} points={ring} fill="none" stroke="rgba(230,235,255,.22)" />)}
            {values.map((entry, index) => { const [x, y] = point(index); return <line key={entry.label} x1={center} y1={center} x2={x} y2={y} stroke="rgba(230,235,255,.16)" />; })}
            <polygon points={polygon} fill="rgba(128,144,226,.22)" stroke="#b9c5ff" strokeWidth="1.5" />
            <circle cx={center} cy={center} r="5" fill="#eef2ff" stroke="#172352" />
            {values.map((entry, index) => { const [x, y] = point(index, 1.18); return <text key={entry.label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#e8edff" fontFamily="Commissioner">{entry.label}</text>; })}
        </svg>
    );
}

export default function CommandCenter({ onOpenSignal }) {
    const player = useOSStore((state) => state.gameplay.player);
    const corruption = useOSStore((state) => state.gameplay.prismCorruptionLevel) || 0;
    const timeSegmentIndex = useOSStore((state) => state.gameplay.timeSegmentIndex) || 0;
    const cycle = useOSStore((state) => state.gameplay.timeCycleCount) || 1;
    const advanceTime = useOSStore((state) => state.advanceTime);
    const skills = player?.skills || {};
    const skillScore = (names) => Math.min(100, names.reduce((sum, name) => sum + ((skills[name]?.level || 1) * 11 + Math.min(20, (skills[name]?.xp || 0) / 8)), 0));
    const analytics = [
        { label: 'Physical', value: Math.round((player?.auraHealth || 0) * 0.85) },
        { label: 'Spiritual', value: skillScore(['Spellcasting', 'Creativity']) },
        { label: 'Psyche', value: skillScore(['Research', 'Communication']) },
        { label: 'Technical', value: skillScore(['Programming', 'Engineering', 'Networking']) },
        { label: 'Social', value: skillScore(['Communication', 'Creativity']) },
    ];
    const average = analytics.reduce((sum, item) => sum + item.value, 0) / analytics.length;
    const resonance = Math.max(0, Math.round(average * (1 - Math.min(0.45, corruption / 150))));

    return (
        <div className="space-y-4 text-[#edf1ff]">
            <section className="border border-[#9ca9df]/32 bg-[#0d1738] shadow-[0_8px_32px_rgba(5,10,31,0.4)]">
                <div className="flex items-center justify-between border-b border-[#9ca9df]/20 px-4 py-3">
                    <div><p className="font-ui text-[9px] uppercase tracking-[0.2em] text-[#aeb9e8]">Aethercore analytics</p><h2 className="mt-1 font-display text-lg text-white">Citizen Resonance Matrix</h2></div>
                    <div className="text-right font-ui text-[9px] uppercase tracking-wider text-[#aeb9e8]"><div>Cycle {cycle}</div><div className="mt-1 text-[#d2d9ff]">{TIME_SEGMENTS[timeSegmentIndex]}</div></div>
                </div>
                <div className="grid grid-cols-[1fr_220px] items-center gap-4 p-4">
                    <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden border border-[#9ca9df]/20 bg-[radial-gradient(circle_at_50%_45%,rgba(63,80,145,.42),rgba(8,16,48,.72)_64%,rgba(4,9,29,.92))]">
                        <div className="command-stars absolute inset-0 opacity-80" />
                        <div className="absolute h-52 w-52 rounded-full bg-[#536bb9]/24 blur-3xl" />
                        <div className="absolute h-40 w-40 rounded-full border border-[#9aabe8]/24 bg-[#223366]/54" />
                        <div className="absolute h-28 w-28 rounded-full border border-white/70 bg-[radial-gradient(circle_at_38%_30%,#ffffff_0%,#b8c5ff_28%,#5366b0_60%,#111c48_100%)] shadow-[0_0_55px_rgba(137,156,235,.48)]" />
                        <div className="relative z-10 text-center text-white"><PublicIcon src={ICONS.core} size={20} className="mx-auto brightness-0 invert" /><div className="mt-2 font-display text-3xl">{resonance}%</div><div className="font-ui text-[8px] uppercase tracking-[0.18em]">Core resonance</div></div>
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between font-ui text-[8px] uppercase tracking-wider text-[#c5cff5]"><span>Aura {player?.auraHealth || 0}%</span><span>PRISM {corruption.toFixed(1)}%</span></div>
                    </div>
                    <div className="flex justify-center"><RadarChart values={analytics} /></div>
                </div>
            </section>

            <section className="grid grid-cols-3 border border-[#9ca9df]/28 bg-[#111d43] shadow-[0_8px_32px_rgba(5,10,31,0.3)]">
                <div className="border-r border-[#9ca9df]/16 p-3"><div className="flex items-center gap-2 font-ui text-[9px] uppercase text-[#aeb9e8]"><PublicIcon src={ICONS.aura} size={13} /> Aura integrity</div><div className="mt-2 font-display text-lg text-[#8dd0bc]">{player?.auraHealth || 0}%</div></div>
                <div className="border-r border-[#9ca9df]/16 p-3"><div className="flex items-center gap-2 font-ui text-[9px] uppercase text-[#aeb9e8]"><PublicIcon src={ICONS.prism} size={13} /> PRISM exposure</div><div className="mt-2 font-display text-lg text-[#bbc5ff]">{corruption.toFixed(1)}%</div></div>
                <button onClick={advanceTime} className="p-3 text-left hover:bg-white/8"><div className="flex items-center gap-2 font-ui text-[9px] uppercase text-[#aeb9e8]"><PublicIcon src={ICONS.time} size={13} /> Cycle control</div><div className="mt-2 flex items-center justify-between font-ui text-[10px] font-semibold text-white">Advance time <span>›</span></div></button>
            </section>

            <section className="border border-[#9ca9df]/28 bg-[#101b3f] p-4 shadow-[0_8px_32px_rgba(5,10,31,0.3)]">
                <div className="flex items-center justify-between"><div><p className="font-ui text-[9px] uppercase tracking-[0.18em] text-[#aeb9e8]">Live signal analysis</p><h3 className="mt-1 font-display text-sm text-white">Sector 4 PRISM anomaly</h3></div><PublicIcon src={ICONS.signal} size={17} className="brightness-0 invert opacity-80" /></div>
                <p className="mt-3 font-body text-[11px] leading-relaxed text-[#c6ceec]">Encrypted spectral evidence remains attached to the current incident record. Review the transmission before advancing into the night segment.</p>
                <button onClick={onOpenSignal} className="mt-3 border border-[#aab7eb]/38 bg-white/6 px-3 py-2 font-ui text-[9px] font-semibold uppercase tracking-wider text-white hover:bg-white/12">Open signal evidence</button>
            </section>
        </div>
    );
}
