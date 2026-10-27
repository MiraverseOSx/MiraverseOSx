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
    <div className="flex items-center gap-1.5 text-xs font-mono select-none whitespace-nowrap">
      {/* 1. Live / Paused Status Button */}
      <button
        type="button"
        onClick={() => toggleSimulationPause()}
        className={`h-[24px] px-2 rounded-[4px] flex items-center gap-1.5 transition-all cursor-pointer font-bold text-[10px] ${
          isLive
            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-900/80'
            : 'bg-amber-950/80 text-amber-300 border border-amber-700/80 hover:bg-amber-900/80'
        }`}
        title={isLive ? 'Simulation running in real-time. Click to pause world.' : 'Simulation paused. Click to resume real-time agency events.'}
      >
        {isLive ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="tracking-wider">LIVE</span>
          </>
        ) : (
          <>
            <Pause className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="tracking-wider">PAUSED</span>
          </>
        )}
      </button>

      {/* 2. Simulation Intensity Selector */}
      <div className="hidden md:flex items-center h-[24px] bg-[#161522] rounded-[4px] border border-[#343249] p-0.5 text-[9.5px]">
        {(['low', 'normal', 'high'] as const).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => setSimulationActivityLevel(lvl)}
            className={`h-[18px] px-1.5 rounded-[2px] uppercase transition-colors cursor-pointer font-bold ${
              simulation.activityLevel === lvl
                ? 'bg-[#524f77] text-white'
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
        type="button"
        onClick={() => toggleFocusMode()}
        className={`h-[24px] px-2 rounded-[4px] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
          simulation.focusMode
            ? 'bg-purple-950/80 text-purple-300 border border-purple-700/80'
            : 'bg-[#262438] text-[#8e8cae] border border-[#37354c] hover:text-white hover:bg-[#34324c]'
        }`}
        title="Focus Mode: Delays low-priority notices and low-level ambient chatter to focus on active case."
      >
        <Target className="w-3 h-3 shrink-0" />
        <span className="hidden sm:inline">FOCUS</span>
      </button>

      {/* 4. End Shift Button */}
      <button
        type="button"
        onClick={onOpenShiftSummary}
        className="h-[24px] px-2 rounded-[4px] bg-[#262438] hover:bg-[#34324c] text-[#b7b5d3] hover:text-white border border-[#3c3a53] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
        title="Conclude current operational work shift and view session report"
      >
        <LogOut className="w-3 h-3 text-[#9598c4] shrink-0" />
        <span className="hidden xl:inline">END SHIFT</span>
      </button>

      <button
        type="button"
        onClick={() => setScenarioOpen(true)}
        className="h-[24px] px-2 rounded-[4px] bg-[#262438] hover:bg-[#34324c] text-[#b7b5d3] hover:text-white border border-[#3c3a53] text-[10px] font-bold transition-colors cursor-pointer"
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
