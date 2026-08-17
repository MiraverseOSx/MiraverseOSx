import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Search,
  Radio,
  Cpu,
  BarChart2,
  FileText,
  Grid,
  Columns,
  Sparkles,
  Zap,
  Layers,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { WindowFrame } from '../common/WindowFrame';
import { MedicalModule } from '../modules/MedicalModule';
import { InvestigationModule } from '../modules/InvestigationModule';
import { DispatchModule } from '../modules/DispatchModule';
import { OrchestratorWindow } from '../modules/OrchestratorWindow';
import { StatsWindow } from '../modules/StatsWindow';
import { NotepadWindow } from '../modules/NotepadWindow';
import { ActionFeedbackModal } from '../common/ActionFeedbackModal';
import { ActionResolutionResult } from '../../types/orchestrator';
import { SoundFX } from '../../utils/audio';

type LayoutMode = 'grid' | 'tabs' | 'events_stream';

export const Desktop: React.FC = () => {
  const {
    windows,
    isLiveSimulation,
    simulationInterval,
    fetchProactiveEvents,
    activeEvents,
    selectedEventId,
    setSelectedEvent,
    isGeneratingEvent,
    openModule,
    soundEnabled,
  } = useSystemStore();

  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [activeTab, setActiveTab] = useState<'medical' | 'investigation' | 'dispatch' | 'orchestrator' | 'stats' | 'notepad'>('medical');
  const [resolutionResult, setResolutionResult] = useState<ActionResolutionResult | null>(null);

  // Proactive Simulation Polling Loop
  useEffect(() => {
    let intervalId: any = null;
    if (isLiveSimulation) {
      intervalId = setInterval(() => {
        // Automatically request proactive event from the orchestrator
        fetchProactiveEvents(1);
      }, simulationInterval * 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLiveSimulation, simulationInterval, fetchProactiveEvents]);

  const medicalEvents = activeEvents.filter((e) => e.module === 'medical');
  const investigationEvents = activeEvents.filter((e) => e.module === 'investigation');
  const dispatchEvents = activeEvents.filter((e) => e.module === 'dispatch');

  const medicalCount = medicalEvents.length;
  const invCount = investigationEvents.length;
  const dispCount = dispatchEvents.length;

  return (
    <main className="flex-1 bg-[#eef2f6] p-2 sm:p-3 md:p-4 overflow-y-auto relative bg-dot-pattern flex flex-col font-commissioner">
      {/* Workspace Navigation & Active Events Ribbon */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-slate-300/80 shadow-2xs">
        {/* Layout Mode Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-500 mr-1.5 hidden sm:inline">
            Workspace:
          </span>

          <button
            id="btn-layout-grid"
            onClick={() => {
              if (soundEnabled) SoundFX.playSnap();
              setLayoutMode('grid');
            }}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              layoutMode === 'grid'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Tri-Role Grid</span>
          </button>

          <button
            id="btn-layout-tabs"
            onClick={() => {
              if (soundEnabled) SoundFX.playSnap();
              setLayoutMode('tabs');
            }}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              layoutMode === 'tabs'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Tabbed View</span>
          </button>
        </div>

        {/* Live Active Events Summary Pill Matrix */}
        <div className="flex items-center gap-1.5">
          {/* Medical Queue Status */}
          <button
            id="btn-focus-medical"
            onClick={() => {
              if (soundEnabled) SoundFX.playMedicalBeep(false);
              setLayoutMode('tabs');
              setActiveTab('medical');
              if (medicalEvents[0]) setSelectedEvent(medicalEvents[0].id);
            }}
            className={`px-2.5 py-1 rounded text-xs font-commissioner flex items-center gap-1.5 border transition-all ${
              layoutMode === 'tabs' && activeTab === 'medical'
                ? 'bg-emerald-700 text-white border-emerald-800 font-bold shadow-xs'
                : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            <span>Medical ICU</span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900">
              {medicalCount}
            </span>
          </button>

          {/* Investigation Queue Status */}
          <button
            id="btn-focus-investigation"
            onClick={() => {
              if (soundEnabled) SoundFX.playInvestigationClick();
              setLayoutMode('tabs');
              setActiveTab('investigation');
              if (investigationEvents[0]) setSelectedEvent(investigationEvents[0].id);
            }}
            className={`px-2.5 py-1 rounded text-xs font-commissioner flex items-center gap-1.5 border transition-all ${
              layoutMode === 'tabs' && activeTab === 'investigation'
                ? 'bg-slate-900 text-white border-slate-950 font-bold shadow-xs'
                : 'bg-blue-50 text-blue-950 border-blue-300 hover:bg-blue-100'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-blue-700" />
            <span className="font-alice">Forensics Bureau</span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-200 text-blue-950">
              {invCount}
            </span>
          </button>

          {/* Dispatch Queue Status */}
          <button
            id="btn-focus-dispatch"
            onClick={() => {
              if (soundEnabled) SoundFX.playDispatchChime();
              setLayoutMode('tabs');
              setActiveTab('dispatch');
              if (dispatchEvents[0]) setSelectedEvent(dispatchEvents[0].id);
            }}
            className={`px-2.5 py-1 rounded text-xs font-commissioner flex items-center gap-1.5 border transition-all ${
              layoutMode === 'tabs' && activeTab === 'dispatch'
                ? 'bg-purple-700 text-white border-purple-800 font-bold shadow-xs'
                : 'bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-purple-700" />
            <span>911 Dispatch</span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-950">
              {dispCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Workspace Display */}
      {layoutMode === 'grid' ? (
        /* Tri-Role Multi-Window Command Grid */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-start pb-4">
          {/* 1. Medical Module Window (Jade Green Accent & Commissioner Font) */}
          <WindowFrame
            id="medical"
            title="Medical Charting & Triage ICU"
            module="medical"
            badge={medicalCount > 0 ? `${medicalCount} ACTIVE` : undefined}
            onRefresh={() => fetchProactiveEvents(1, 'Medical Emergency Update')}
            isRefreshing={isGeneratingEvent}
          >
            <MedicalModule onResolveSuccess={(res) => setResolutionResult(res)} />
          </WindowFrame>

          {/* 2. Investigation Module Window (Deep Navy Blue Accent & Alice Font) */}
          <WindowFrame
            id="investigation"
            title="Investigative Bureau & Forensics"
            module="investigation"
            badge={invCount > 0 ? `${invCount} ACTIVE` : undefined}
            onRefresh={() => fetchProactiveEvents(1, 'Forensic Case Update')}
            isRefreshing={isGeneratingEvent}
          >
            <InvestigationModule onResolveSuccess={(res) => setResolutionResult(res)} />
          </WindowFrame>

          {/* 3. Dispatch Module Window (Purple / Lavender Accent) */}
          <WindowFrame
            id="dispatch"
            title="Emergency Metro Dispatch 911"
            module="dispatch"
            badge={dispCount > 0 ? `${dispCount} ACTIVE` : undefined}
            onRefresh={() => fetchProactiveEvents(1, 'Metro 911 Trunk Update')}
            isRefreshing={isGeneratingEvent}
          >
            <DispatchModule onResolveSuccess={(res) => setResolutionResult(res)} />
          </WindowFrame>

          {/* Orchestrator, Stats, Notepad Windows if opened */}
          <WindowFrame id="orchestrator" title="AI Supervisor Feed & Inspector" module="orchestrator">
            <OrchestratorWindow />
          </WindowFrame>

          <WindowFrame id="stats" title="Shift Performance & Telemetry" module="stats">
            <StatsWindow />
          </WindowFrame>

          <WindowFrame id="notepad" title="Operator Shift Log & Scratchpad" module="notepad">
            <NotepadWindow />
          </WindowFrame>
        </div>
      ) : (
        /* Tabbed Full-Width Focus Mode */
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden mb-2">
          {/* Tab Navigation Header */}
          <div className="bg-slate-900 text-white px-3 pt-2 flex items-center gap-1 overflow-x-auto border-b border-slate-800 select-none">
            {[
              { id: 'medical', label: 'Medical Charting (Jade)', icon: <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />, badge: medicalCount, badgeColor: 'bg-emerald-500 text-slate-950' },
              { id: 'investigation', label: 'Investigation Forensics (Navy)', icon: <Search className="w-3.5 h-3.5 text-blue-400" />, badge: invCount, badgeColor: 'bg-blue-400 text-slate-950' },
              { id: 'dispatch', label: '911 City Dispatch (Purple)', icon: <Radio className="w-3.5 h-3.5 text-purple-400" />, badge: dispCount, badgeColor: 'bg-purple-400 text-slate-950' },
              { id: 'orchestrator', label: 'Supervisor Feed & AI Inspector', icon: <Cpu className="w-3.5 h-3.5 text-amber-400" /> },
              { id: 'stats', label: 'Shift Stats', icon: <BarChart2 className="w-3.5 h-3.5 text-sky-400" /> },
              { id: 'notepad', label: 'Scratchpad', icon: <FileText className="w-3.5 h-3.5 text-slate-300" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-xs font-medium rounded-t-md flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-50 text-slate-900 font-bold border-t-2 border-t-indigo-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`w-4 h-4 rounded-full font-mono text-[9px] font-bold flex items-center justify-center ${tab.badgeColor || 'bg-red-500 text-white'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
            {activeTab === 'medical' && <MedicalModule onResolveSuccess={(res) => setResolutionResult(res)} />}
            {activeTab === 'investigation' && <InvestigationModule onResolveSuccess={(res) => setResolutionResult(res)} />}
            {activeTab === 'dispatch' && <DispatchModule onResolveSuccess={(res) => setResolutionResult(res)} />}
            {activeTab === 'orchestrator' && <OrchestratorWindow />}
            {activeTab === 'stats' && <StatsWindow />}
            {activeTab === 'notepad' && <NotepadWindow />}
          </div>
        </div>
      )}

      {/* AI Evaluation Outcome Modal */}
      <ActionFeedbackModal
        result={resolutionResult}
        onClose={() => setResolutionResult(null)}
      />
    </main>
  );
};
