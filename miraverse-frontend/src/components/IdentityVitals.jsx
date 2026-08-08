import React from 'react';
import { useOSStore } from '../store/useOSStore';
import logoIcon from '../assets/images/logo_icon.png';
import PublicIcon from './ui/PublicIcon';

const ICONS = {
    vitals: '/icons/Icons8/icons8-audio-wave-50.gif',
    identity: '/icons/Icons8/icons8-address-50.gif',
    stats: '/icons/Icon set 1/0.5x/Star 256 px.png',
    energy: '/icons/Icon set 1/0.5x/Battery - full 256 px.png',
};

function Meter({ label, value, color }) {
    return (
        <div>
            <div className="mb-1 flex justify-between font-ui text-[9px] uppercase tracking-wider text-[#c3ccdf]">
                <span>{label}</span><strong>{Math.round(value)}%</strong>
            </div>
            <div className="h-1.5 border border-[#cbd3e3]/20 bg-white/10">
                <div className="h-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
            </div>
        </div>
    );
}

export default function IdentityVitals({ onOpenCitizenRecord }) {
    const player = useOSStore((state) => state.gameplay.player);
    const corruption = useOSStore((state) => state.gameplay.prismCorruptionLevel) || 0;
    const segment = useOSStore((state) => state.gameplay.timeSegmentIndex) || 0;
    const identity = useOSStore((state) => state.gameplay.identity);
    const energy = Math.max(18, 100 - segment * 18 - corruption * 0.35);
    const focus = Math.min(100, ((player?.skills?.Research?.level || 1) + (player?.skills?.Cryptography?.level || 1)) * 16);

    return (
        <aside className="misty-navy-panel col-span-3 flex h-full flex-col overflow-y-auto border-0 p-5 backdrop-blur-[12px]">
            <section className="border-b border-[#cbd3e3]/20 pb-5 text-center">
                <div className="mx-auto grid h-24 w-24 place-items-center border border-[#cbd3e3]/28 bg-white/10">
                    <img src={logoIcon} alt="Citizen portrait placeholder" className="h-16 w-16 object-contain opacity-65" />
                </div>
                <h1 className="mt-3 font-display text-lg text-[#f3f5fb]">{player?.name || 'Provisional Citizen'}</h1>
                <p className="mt-1 font-ui text-[9px] uppercase tracking-[0.18em] text-[#c3ccdf]">Aureline provisional record</p>
                <button onClick={onOpenCitizenRecord} className="mt-3 border border-[#cbd3e3]/28 bg-white/10 px-3 py-1.5 font-ui text-[9px] font-semibold uppercase tracking-wider text-[#f3f5fb] hover:bg-white/18">Open identity file</button>
            </section>

            <section className="space-y-4 border-b border-[#cbd3e3]/20 py-5">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-sm text-[#f3f5fb]">Vitals</h2>
                    <PublicIcon src={ICONS.vitals} size={15} />
                </div>
                <Meter label="Aura health" value={player?.auraHealth || 0} color="#488270" />
                <Meter label="Focus" value={focus} color="#454e93" />
                <Meter label="Daily energy" value={energy} color="#2f3d7a" />
            </section>

            <section className="space-y-3 border-b border-[#cbd3e3]/20 py-5">
                <div className="flex items-center gap-2 font-ui text-[9px] font-semibold uppercase tracking-wider text-[#c3ccdf]"><PublicIcon src={ICONS.identity} size={14} /> Identity state</div>
                {[
                    ['Fingerprint', identity?.fingerprint],
                    ['Facial record', identity?.facial],
                    ['Aura baseline', identity?.auraBaseline],
                ].map(([label, complete]) => (
                    <div key={label} className="flex items-center justify-between font-ui text-[10px] text-[#eef2fa]">
                        <span>{label}</span><span className={complete ? 'text-[#488270]' : 'text-[#8b6a34]'}>{complete ? 'Verified' : 'Pending'}</span>
                    </div>
                ))}
            </section>

            <section className="space-y-3 py-5">
                <div className="flex items-center gap-2 font-ui text-[9px] font-semibold uppercase tracking-wider text-[#c3ccdf]"><PublicIcon src={ICONS.stats} size={14} /> Core stats</div>
                <div className="grid grid-cols-2 border border-[#cbd3e3]/22 bg-white/8">
                    <div className="border-r border-[#cbd3e3]/18 p-3"><div className="font-ui text-[8px] uppercase text-[#c3ccdf]">Level</div><div className="mt-1 font-display text-lg text-[#f3f5fb]">{player?.level || 1}</div></div>
                    <div className="p-3"><div className="font-ui text-[8px] uppercase text-[#c3ccdf]">Credits</div><div className="mt-1 font-display text-lg text-[#c7d0ff]">{player?.credits || 0}</div></div>
                </div>
                <div className="flex items-center justify-between border border-[#cbd3e3]/22 bg-white/8 p-3 font-ui text-[9px] text-[#eef2fa]"><span className="flex items-center gap-2"><PublicIcon src={ICONS.energy} size={14} /> Dorm comfort</span><strong>{player?.dormComfort || 0}%</strong></div>
            </section>
        </aside>
    );
}
