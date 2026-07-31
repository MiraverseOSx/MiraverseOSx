import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';

export default function FaithMedicalApp() {
  const player = useOSStore((s) => s.gameplay.player);
  const addCondition = useOSStore((s) => s.addCondition);
  const removeCondition = useOSStore((s) => s.removeCondition);
  const healAura = useOSStore((s) => s.healAura);
  const addCareerXP = useOSStore((s) => s.addCareerXP);

  const [scheduled, setScheduled] = useState(false);

  const scheduleScan = () => {
    setScheduled(true);
  };

  const completeIntake = () => {
    healAura(20);
    addCareerXP('medical', 60);
    removeCondition('Veilwilt');
  };

  return (
    <div className="flex h-full w-full bg-gradient-to-b from-white to-[#f7f8fc] text-[#162241]">
      <aside className="w-56 border-r border-slate-200 bg-white/70 p-3">
        <div className="text-[10px] font-bold tracking-[.2em] text-slate-600 mb-2">FAITH MEDICAL</div>
        <div className="rounded border border-slate-200 bg-white px-3 py-2 text-[12px]">
          <div className="text-slate-500">Aura Health</div>
          <div className="mt-1 font-mono text-sm font-bold text-[#1c2550]">{player.auraHealth}%</div>
        </div>
      </aside>

      <section className="flex-1 p-5 space-y-5">
        <header>
          <h2 className="text-base font-semibold">Patient Intake & Aura Diagnostics</h2>
          <p className="text-[11px] text-slate-600">Register baseline, schedule intake, and review diagnostics.</p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-bold tracking-widest text-slate-600 mb-2">INTAKE</div>
            <div className="text-[12px] text-slate-700">Status: {scheduled ? 'Scheduled' : 'Not scheduled'}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={scheduleScan} className="rounded bg-[#1e2a55] px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-95">Schedule Scan</button>
              <button onClick={completeIntake} disabled={!scheduled} className={`rounded px-3 py-1.5 text-[12px] font-semibold ${scheduled ? 'bg-emerald-600 text-white hover:opacity-95' : 'bg-slate-200 text-slate-500'}`}>Complete Intake</button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-bold tracking-widest text-slate-600 mb-2">CONDITIONS</div>
            {player.conditions.length === 0 ? (
              <div className="text-[12px] text-slate-500">No active conditions.</div>
            ) : (
              <ul className="space-y-1 text-[12px] text-slate-700">
                {player.conditions.map((c) => (
                  <li key={c} className="flex items-center justify-between">
                    <span>{c}</span>
                    <button onClick={() => removeCondition(c)} className="text-[11px] text-[#1e2a55] hover:underline">Resolve</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
