import React from 'react';
import { useOSStore } from '../store/useOSStore';
import { getCelestialState, HISTORICAL_CHRONOLOGY } from '../data/meridionWorld';
import { Moon, Sun, Sparkles, Calendar, Clock, Crown, Compass, ShieldAlert, Award, Milestone } from 'lucide-react';

export default function CelestialChronologyPanel() {
  const timeCycleCount = useOSStore((s) => s.gameplay?.timeCycleCount ?? 28);
  const celestial = getCelestialState(timeCycleCount);

  return (
    <div className="space-y-6">
      {/* ── TOP SECTION: CELESTIAL ASTRONOMY & THE TWO MOONS ── */}
      <div className="bg-gradient-to-br from-[#120f26] via-[#1a1738] to-[#251f47] text-white p-6 rounded-2xl shadow-md border border-purple-900/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/40 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-400" />
              <span>Celestial Mechanics · The Twin Moons of Meridion</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-purple-100 mt-1">
              One Sun · Two Moons: Radiance & Echo
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-700/50 text-xs font-mono">
            <span className="text-purple-300">Alignment:</span>
            <span className="font-bold text-amber-300">{celestial.alignment}</span>
          </div>
        </div>

        {/* The Two Moons Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Moon 1: Radiance (Outer Moon) */}
          <div className="bg-white/5 border border-purple-400/20 rounded-xl p-5 backdrop-blur-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" role="img" aria-label="Moon phase icon">
                  {celestial.radiance.phaseIcon}
                </span>
                <div>
                  <h3 className="font-bold text-base text-purple-100">{celestial.radiance.name}</h3>
                  <span className="text-[11px] font-mono text-purple-300">Outer Moon · Larger & Distant</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-200">
                {celestial.radiance.illuminationPercent}% Illum.
              </span>
            </div>

            <p className="text-xs text-purple-200/80 leading-relaxed">
              {celestial.radiance.description}
            </p>

            <div className="pt-2 border-t border-purple-800/30 flex items-center justify-between text-xs font-mono">
              <span className="text-purple-300/70">Current Aspect:</span>
              <span className="font-semibold text-purple-100">{celestial.radiance.phaseName}</span>
            </div>
            <div className="text-[11px] text-amber-200/70 font-mono italic">
              Aspect: {celestial.radiance.visualAspect}
            </div>
          </div>

          {/* Moon 2: Echo (Inner Moon) */}
          <div className="bg-white/5 border border-purple-400/20 rounded-xl p-5 backdrop-blur-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" role="img" aria-label="Moon phase icon">
                  {celestial.echo.phaseIcon}
                </span>
                <div>
                  <h3 className="font-bold text-base text-purple-100">{celestial.echo.name}</h3>
                  <span className="text-[11px] font-mono text-purple-300">Inner Moon · Nearer & Dark Slate</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-400/15 border border-purple-400/30 text-purple-200">
                {celestial.echo.illuminationPercent}% Illum.
              </span>
            </div>

            <p className="text-xs text-purple-200/80 leading-relaxed">
              {celestial.echo.description}
            </p>

            <div className="pt-2 border-t border-purple-800/30 flex items-center justify-between text-xs font-mono">
              <span className="text-purple-300/70">Current Aspect:</span>
              <span className="font-semibold text-purple-100">{celestial.echo.phaseName}</span>
            </div>
            <div className="text-[11px] text-purple-300/70 font-mono italic">
              Aspect: {celestial.echo.visualAspect}
            </div>
          </div>
        </div>

        {/* Civil Calendar Bar */}
        <div className="bg-purple-950/60 p-4 rounded-xl border border-purple-800/40 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <Calendar size={15} className="text-purple-400" />
            <span>
              Civil Date: <strong className="text-purple-100">{celestial.weekday}, {celestial.monthName} {celestial.dayOfMonth}</strong>
            </span>
            <span className="text-purple-400">·</span>
            <span>Game Cycle: <strong className="text-amber-300">Cycle {celestial.cycle}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Crown size={14} className="text-amber-400" />
            <span>Founding Day: <strong className="text-amber-300">March 6</strong></span>
            {celestial.isFoundingDay && (
              <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold uppercase text-[10px]">
                Active Commemoration
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── HISTORICAL CHRONOLOGY TIMELINE ── */}
      <div className="bg-white p-6 rounded-2xl border border-[#d8dce8] shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider">
            <Milestone size={14} />
            <span>Chronology of Sovereign Meridion</span>
          </div>
          <h3 className="text-lg font-bold text-[#1e2640] mt-1">Historical Eras & Founding Record</h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            BM signifies <em>Before Maeryn</em>. The entire calendar year of the March 6 coronation is codified as <strong>Year 0</strong>.
          </p>
        </div>

        {/* Timeline Stack */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
          {HISTORICAL_CHRONOLOGY.map((era) => {
            const isMilestone = era.isMilestone;
            return (
              <div key={era.id} className="relative group">
                {/* Node dot */}
                <div
                  className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isMilestone
                      ? 'bg-amber-500 border-amber-300 ring-4 ring-amber-100 text-white'
                      : 'bg-white border-indigo-400 text-indigo-600'
                  }`}
                >
                  {isMilestone ? <Crown size={11} /> : <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isMilestone
                      ? 'bg-amber-50/50 border-amber-300/80 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-mono font-bold text-indigo-600 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 inline-block w-fit">
                      {era.period}
                    </span>
                    {isMilestone && (
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded uppercase">
                        Sovereign Foundation Event
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-[#1e2640]">{era.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {era.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep History Note */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <ShieldAlert size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-800 font-mono">Deep History Codification Notice:</span>
            <p>
              Royal Archives preserve historical fragments dating as far back as year <strong>−939,393</strong>.
              In accordance with royal archival decrees, ancient negative years are classified under deep pre-Purge records and remain distinct from the civil BM calendar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
