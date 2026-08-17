import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Activity, ShieldAlert, Cpu, Sparkles, MessageSquare, Terminal, RefreshCw } from 'lucide-react';

export default function HUD() {
  const {
    worldState,
    tickCount,
    player,
    missions,
    dialogueHistory,
    requestTick,
    requestMission,
    requestNPCDialogue,
    requestSpellResolution,
    initializeStore
  } = useGameStore();

  useEffect(() => {
    initializeStore();
    // Auto tick pulse every 10 seconds if idle
    const interval = setInterval(() => {
      requestTick();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#090e1a] text-slate-100 p-3.5 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
        
        {/* World Telemetry Panel */}
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold uppercase text-sky-400 flex items-center gap-1.5 font-mono">
              <Activity className="w-4 h-4" /> Telemetry (Tick #{tickCount})
            </span>
            <button
              onClick={requestTick}
              className="p-1 text-slate-400 hover:text-sky-300 transition-colors"
              title="Manual Python Tick"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Corruption:</span>
              <span className={worldState.corruption_level > 20 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {worldState.corruption_level}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Prism Harmonic:</span>
              <span className="text-sky-300 font-bold">{worldState.prism_harmonic}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Weather:</span>
              <span className="text-indigo-300">{worldState.weather_condition}</span>
            </div>
          </div>
        </div>

        {/* Player Profile & Biometrics */}
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2 font-semibold uppercase text-sky-400 font-mono">
            <Cpu className="w-4 h-4" /> Identity: {player.handle}
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Class:</span>
              <span className="text-slate-200">{player.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Level / XP:</span>
              <span className="text-amber-300 font-mono font-bold">Lvl {player.level} ({player.xp} XP)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dermal Nodes:</span>
              <span className="text-emerald-400 font-mono">{player.biometrics?.dermalNodes || 'Calibrated'}</span>
            </div>
          </div>
        </div>

        {/* Mission Director Stream */}
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold uppercase text-sky-400 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-4 h-4" /> Mission Director
            </span>
            <button
              onClick={requestMission}
              className="px-2 py-0.5 bg-sky-600 text-white rounded text-[10px] font-bold hover:bg-sky-500"
            >
              Generate
            </button>
          </div>
          {missions.length > 0 ? (
            <div className="space-y-1">
              <div className="font-semibold text-slate-200 truncate">{missions[0].title}</div>
              <div className="text-slate-400 text-[11px] truncate">{missions[0].description}</div>
              <div className="text-amber-300 text-[10px] font-mono">Reward: +{missions[0].rewards?.xp} XP, {missions[0].rewards?.credits} Cred</div>
            </div>
          ) : (
            <div className="text-slate-500 italic">No active field missions</div>
          )}
        </div>

        {/* Quick Actions / SpellForge & Ollama */}
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 shadow-sm space-y-2">
          <span className="font-semibold uppercase text-sky-400 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-4 h-4" /> Python Actions
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => requestSpellResolution('Fire', 45, 2)}
              className="px-2 py-1 bg-amber-900/60 border border-amber-600 text-amber-300 rounded font-semibold hover:bg-amber-800 text-[11px] text-center"
            >
              Cast Fire Rune
            </button>
            <button
              onClick={() => requestNPCDialogue('Mai', 'Provide status update on PRISM harmonic')}
              className="px-2 py-1 bg-indigo-900/60 border border-indigo-600 text-indigo-300 rounded font-semibold hover:bg-indigo-800 text-[11px] text-center"
            >
              Ping AI (Mai)
            </button>
          </div>
          {dialogueHistory.length > 0 && (
            <div className="text-[10px] text-slate-400 truncate italic">
              Latest: "{dialogueHistory[0].text}"
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
