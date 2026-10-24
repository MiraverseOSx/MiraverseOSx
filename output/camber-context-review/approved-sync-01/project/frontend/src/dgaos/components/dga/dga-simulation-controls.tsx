'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Clock,
  Activity,
  Target,
  LogOut,
  Sparkles,
  Zap
} from 'lucide-react';
import { SimulationSettings, DgaSession } from '@/lib/dga-types';
import {
  toggleSimulationPause,
  setSimulationActivityLevel,
  toggleFocusMode
} from '@/lib/dga-store';
import { DgaSimulationCaseDialog } from './dga-simulation-case-dialog';

interface DgaSimulationControlsProps {
  simulation: SimulationSettings;
  session: DgaSession;
  onOpenShiftSummary: () => void;
  onCaseCreated?: (caseId: string) => void;
}

export function DgaSimulationControls({
  simulation,
  session,
  onOpenShiftSummary,
  onCaseCreated
}: DgaSimulationControlsProps) {
  const isLive = simulation.status === 'live';
  const [scenarioOpen, setScenarioOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 text-xs font-mono select-none whitespace-nowrap">
      {/* 1. Live / Paused Status Button */}
      <button
        onClick={() => toggleSimulationPause()}
        className={`px-2 py-0.5 rounded flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
          isLive
            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900'
            : 'bg-amber-950/80 text-amber-300 border border-amber-800/80 hover:bg-amber-900'
        }`}
        title={isLive ? 'Simulation running in real-time. Click to pause world.' : 'Simulation paused. Click to resume real-time agency events.'}
      >
        {isLive ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] tracking-wider">LIVE</span>
          </>
        ) : (
          <>
            <Pause className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] tracking-wider">PAUSED</span>
          </>
        )}
      </button>

      {/* 2. Simulation Intensity Selector */}
      <div className="hidden md:flex items-center bg-[#171622] rounded border border-[#353349] p-0.5 text-[10px]">
        {(['low', 'normal', 'high'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSimulationActivityLevel(lvl)}
            className={`px-1.5 py-0.2 rounded uppercase transition-colors cursor-pointer ${
              simulation.activityLevel === lvl
                ? 'bg-[#524f77] text-white font-bold'
                : 'text-[#8583a4] hover:text-white'
            }`}
            title={`Set simulation event frequency to ${lvl}`}
          >
            {lvl[0].toUpperCase()}
          </button>
        ))}
      </div>

      {/* 3. Focus Mode Toggle */}
      <button
        onClick={() => toggleFocusMode()}
        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
          simulation.focusMode
            ? 'bg-purple-950/80 text-purple-300 border border-purple-800/80'
            : 'bg-[#1e1d2c] text-[#8684a4] border border-[#37354c] hover:text-white'
        }`}
        title="Focus Mode: Delays low-priority notices and low-level ambient chatter to focus on active case."
      >
        <Target className="w-3 h-3" />
        <span className="hidden sm:inline">FOCUS</span>
      </button>

      {/* 4. End Shift Button */}
      <button
        onClick={onOpenShiftSummary}
        className="px-2 py-0.5 rounded bg-[#2b2a3d] hover:bg-[#3d3b55] text-[#b3b1cf] hover:text-white border border-[#43415e] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
        title="Conclude current operational work shift and view session report"
      >
        <LogOut className="w-3 h-3 text-[#9598c4]" />
        <span className="hidden xl:inline">END SHIFT</span>
      </button>

      <button
        type="button"
        onClick={() => setScenarioOpen(true)}
        className="px-2 py-0.5 rounded bg-[#2b2a3d] hover:bg-[#3d3b55] text-[#b3b1cf] hover:text-white border border-[#43415e] text-[10px] font-bold cursor-pointer"
        title="Generate a simulated training assignment. This is separate from New Case."
      >
        SCENARIO
      </button>
      <DgaSimulationCaseDialog
        isOpen={scenarioOpen}
        onClose={() => setScenarioOpen(false)}
        onCaseCreated={onCaseCreated}
      />
    </div>
  );
}
