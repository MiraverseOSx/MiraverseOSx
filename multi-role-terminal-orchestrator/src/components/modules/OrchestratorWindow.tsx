import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Play,
  Pause,
  Sliders,
  Copy,
  Check,
  Code,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

export const OrchestratorWindow: React.FC = () => {
  const {
    isLiveSimulation,
    toggleLiveSimulation,
    simulationInterval,
    setSimulationInterval,
    fetchProactiveEvents,
    isGeneratingEvent,
    lastOrchestratorPayload,
    rawJsonLogs,
    activeScenario,
    scenarioBriefing,
    loadScenario,
  } = useSystemStore();

  const [copied, setCopied] = useState(false);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('midnight_surge');
  const [customThemeInput, setCustomThemeInput] = useState('');

  const handleCopyJson = () => {
    const text = JSON.stringify(lastOrchestratorPayload, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerCustomTheme = () => {
    if (!customThemeInput.trim()) return;
    fetchProactiveEvents(2, customThemeInput.trim());
    setCustomThemeInput('');
  };

  return (
    <div className="flex flex-col gap-4 font-commissioner text-slate-800">
      {/* Architecture Concept Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-lg border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
              ORCHESTRATOR PATTERN
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Model: Gemini 3.7 Flash Supervisor
            </span>
          </div>
          <h2 className="text-base font-bold text-white">
            Multi-Agent Supervisor & Autonomous Event Engine
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            The Orchestrator proactively generates structured <code className="font-mono text-amber-300">event_queue</code> payloads. It routes clinical emergencies to Medical (jade green), evidence to Investigation (navy blue), and citywide alerts to Dispatch (purple).
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 shrink-0">
          <button
            id="btn-toggle-simulation-feed"
            onClick={toggleLiveSimulation}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
              isLiveSimulation
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {isLiveSimulation ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isLiveSimulation ? 'SIMULATION ACTIVE' : 'PAUSED'}
          </button>

          <button
            id="btn-trigger-instant-event"
            onClick={() => fetchProactiveEvents(1)}
            disabled={isGeneratingEvent}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            {isGeneratingEvent ? 'Synthesizing...' : 'GENERATE EVENT'}
          </button>
        </div>
      </div>

      {/* Visual Multi-Agent Routing Graph */}
      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          Autonomous Multi-Role Payload Routing
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-900 text-white rounded border border-slate-800 flex flex-col items-center justify-center">
            <Cpu className="w-5 h-5 text-amber-400 mb-1 animate-pulse" />
            <strong className="font-mono text-amber-300">Central Supervisor</strong>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">Gemini 3.7 Orchestrator</span>
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 flex flex-col justify-center">
            <strong className="font-mono text-emerald-800 text-[11px]">module: "medical"</strong>
            <span className="text-[10px] text-emerald-700 mt-0.5">Patient Charting, Vitals, Triage (Jade)</span>
          </div>

          <div className="p-2.5 bg-slate-100 border border-slate-400 rounded text-slate-900 flex flex-col justify-center">
            <strong className="font-mono text-slate-800 text-[11px]">module: "investigation"</strong>
            <span className="text-[10px] text-slate-700 mt-0.5">Case Files, Audio Spectrogram (Navy)</span>
          </div>

          <div className="p-2.5 bg-purple-50 border border-purple-300 rounded text-purple-900 flex flex-col justify-center">
            <strong className="font-mono text-purple-800 text-[11px]">module: "dispatch"</strong>
            <span className="text-[10px] text-purple-700 mt-0.5">City 911 Grid, Tactical Units (Purple)</span>
          </div>
        </div>
      </div>

      {/* Scenario Presets & Injection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario Selector */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Multi-Department Scenario Presets
            </h4>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {[
                { id: 'midnight_surge', label: 'Mass Casualty Surge' },
                { id: 'cyber_sabotage', label: 'Metropolitan Cyber Sabotage' },
                { id: 'biotoxin_outbreak', label: 'Chemical Water Contamination' },
                { id: 'harbor_storm', label: 'Harbor Conflagration' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedScenarioKey(s.id);
                    loadScenario(s.id);
                  }}
                  className={`p-2 text-xs rounded border text-left font-medium transition-all ${
                    selectedScenarioKey === s.id
                      ? 'bg-slate-900 text-white border-slate-950 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
              "{scenarioBriefing}"
            </p>
          </div>

          {/* Pulse Interval Slider */}
          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-600">Proactive Pulse Interval:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={simulationInterval}
                onChange={(e) => setSimulationInterval(Number(e.target.value))}
                className="w-24 accent-amber-600"
              />
              <span className="font-mono font-bold text-amber-700 text-xs w-8 text-right">
                {simulationInterval}s
              </span>
            </div>
          </div>
        </div>

        {/* Custom Scenario Injection */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-700" />
              Inject Custom Storyline or Crisis
            </h4>
            <p className="text-[11px] text-slate-500 mb-2">
              Type any narrative seed. Gemini will orchestrate interlocking events across all 3 departments.
            </p>
            <textarea
              id="input-custom-scenario-prompt"
              rows={3}
              placeholder="e.g. 'Sudden blackout at St. Jude Hospital while hostage negotiations occur on 4th Street'..."
              value={customThemeInput}
              onChange={(e) => setCustomThemeInput(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded font-commissioner focus:outline-hidden focus:border-amber-600 resize-none"
            />
          </div>

          <button
            id="btn-inject-scenario"
            disabled={!customThemeInput.trim() || isGeneratingEvent}
            onClick={handleTriggerCustomTheme}
            className="mt-2 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {isGeneratingEvent ? 'Generating Crisis Events...' : 'Inject into Active Simulation'}
          </button>
        </div>
      </div>

      {/* Raw JSON Schema & Payload Feed Viewer */}
      <div className="bg-slate-950 text-slate-200 rounded-lg p-3 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-400">
            <Code className="w-4 h-4" />
            <span>LIVE ORCHESTRATOR JSON PAYLOAD STREAM</span>
          </div>
          <button
            onClick={handleCopyJson}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
        </div>

        <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto max-h-56 p-2 bg-slate-900/90 rounded border border-slate-800/80 text-emerald-400 select-text">
          {JSON.stringify(lastOrchestratorPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
};
