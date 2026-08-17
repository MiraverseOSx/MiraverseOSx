import React, { useState } from 'react';
import {
  Radio,
  MapPin,
  Truck,
  ShieldAlert,
  Send,
  Flame,
  AlertOctagon,
  Navigation,
  CheckCircle2,
  Users,
  Compass,
  Zap,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { SoundFX } from '../../utils/audio';

interface DispatchModuleProps {
  onResolveSuccess?: (result: any) => void;
}

export const DispatchModule: React.FC<DispatchModuleProps> = ({ onResolveSuccess }) => {
  const {
    activeEvents,
    selectedEventId,
    setSelectedEvent,
    resolveEventAction,
    isResolvingAction,
    fetchProactiveEvents,
    isGeneratingEvent,
    soundEnabled,
  } = useSystemStore();

  const dispatchEvents = activeEvents.filter((e) => e.module === 'dispatch');
  const activeEvent =
    dispatchEvents.find((e) => e.id === selectedEventId) || dispatchEvents[0] || null;

  const [customCommand, setCustomCommand] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['Engine-03', 'Medic-04']);

  const unitsList = [
    { id: 'Engine-03', type: 'Fire Engine', status: 'Available', eta: '3 mins' },
    { id: 'Medic-04', type: 'Paramedic ALS', status: 'Available', eta: '4 mins' },
    { id: 'Hazmat-01', type: 'Special Hazards', status: 'Standby', eta: '6 mins' },
    { id: 'Patrol-12', type: 'Police Unit', status: 'Patrolling', eta: '2 mins' },
    { id: 'Rescue-02', type: 'Heavy Technical', status: 'Available', eta: '5 mins' },
  ];

  const toggleUnit = (unitId: string) => {
    if (soundEnabled) SoundFX.playDispatchRadioStatic();
    if (selectedUnits.includes(unitId)) {
      setSelectedUnits(selectedUnits.filter((u) => u !== unitId));
    } else {
      setSelectedUnits([...selectedUnits, unitId]);
    }
  };

  const handleExecuteDispatch = async (actionText: string) => {
    if (!activeEvent || isResolvingAction) return;

    if (soundEnabled) {
      const lower = actionText.toLowerCase();
      if (lower.includes('siren') || lower.includes('evac') || lower.includes('priority') || lower.includes('rescue') || lower.includes('hazmat') || lower.includes('dispatch')) {
        SoundFX.playDispatchSirenWail();
      } else {
        SoundFX.playDispatchRadioStatic();
      }
    }

    const finalAction = `${actionText} [Assigned Units: ${selectedUnits.join(', ') || 'Default Task Force'}]`;
    const res = await resolveEventAction(activeEvent.id, finalAction);
    if (res && onResolveSuccess) {
      onResolveSuccess(res);
    }
    setCustomCommand('');
  };

  if (!activeEvent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border-2 border-dashed border-purple-300">
        <div className="p-4 bg-purple-50 rounded-full text-purple-600 mb-3">
          <Radio className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 font-commissioner">
          Central 911 Metro Dispatch: Channels Clear
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 font-commissioner">
          All active city sector incidents have been routed. Municipal priority patrol units are standing by.
        </p>
        <button
          id="btn-request-dispatch-event"
          onClick={() => {
            if (soundEnabled) SoundFX.playPulse();
            fetchProactiveEvents(1, 'Priority 911 Mass Transit Incident');
          }}
          disabled={isGeneratingEvent}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          {isGeneratingEvent ? 'Supervisor Routing...' : 'Scan 911 Trunk Line'}
        </button>
      </div>
    );
  }

  const payload = activeEvent.payload;
  const isCritical = activeEvent.urgency === 'critical';

  return (
    <div className="flex flex-col gap-4 font-commissioner">
      {/* Incident Switcher Bar */}
      {dispatchEvents.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          <span className="text-[11px] font-mono uppercase text-purple-800 font-bold whitespace-nowrap">
            Active Incidents ({dispatchEvents.length}):
          </span>
          {dispatchEvents.map((evt) => (
            <button
              key={evt.id}
              id={`disp-incident-tab-${evt.id}`}
              onClick={() => {
                if (soundEnabled) SoundFX.playDispatchChime();
                setSelectedEvent(evt.id);
              }}
              className={`px-2.5 py-1 text-xs rounded border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeEvent.id === evt.id
                  ? 'bg-purple-700 text-white border-purple-800 shadow-xs font-semibold'
                  : 'bg-white text-slate-700 border-purple-200 hover:border-purple-400'
              }`}
            >
              <Radio className="w-3 h-3 text-purple-300" />
              <span>{evt.payload.location || 'Incident Route'}</span>
              <span className="text-[10px] opacity-75 font-mono">[{evt.id}]</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Dispatch Card with Purple / Lavender Border */}
      <div className="bg-white rounded-lg border-2 border-purple-600/90 shadow-sm overflow-hidden">
        {/* Priority Incident Banner */}
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-700 text-white rounded-md shadow-xs">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-purple-200 text-purple-900 border border-purple-300 px-1.5 py-0.5 rounded font-bold uppercase">
                  911 TRUNK PRIORITY
                </span>
                <span className="text-xs text-slate-600 font-mono">
                  LOCATION: <strong className="text-slate-900">{payload.location || 'Sector 4 Junction'}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {activeEvent.sender} — {activeEvent.event_type.replace('_', ' ').toUpperCase()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wide flex items-center gap-1.5 border shadow-xs ${
                isCritical
                  ? 'bg-red-600 text-white border-red-700 animate-pulse'
                  : 'bg-purple-600 text-white border-purple-700'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              ALERT LEVEL: {activeEvent.urgency.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tactical Map Grid + Incident Telemetry */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white">
          {/* Simulated Sector Radar / Map */}
          <div className="bg-slate-900 rounded-lg p-3 border border-purple-900/60 flex flex-col justify-between relative overflow-hidden h-52">
            {/* Grid background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

            <div className="flex items-center justify-between z-10 text-[10px] font-mono text-purple-300">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-purple-400" />
                METRO SECTOR GRID 04
              </span>
              <span className="text-slate-400">GPS: 40.7128° N, 74.0060° W</span>
            </div>

            {/* Radar Center Incident Pin */}
            <div className="my-auto flex flex-col items-center justify-center z-10 relative">
              <div className="w-12 h-12 rounded-full border border-purple-500/40 flex items-center justify-center animate-ping absolute pointer-events-none" />
              <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400 flex items-center justify-center text-white relative shadow-lg">
                <MapPin className="w-4 h-4 text-purple-300 animate-bounce" />
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-200 mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded border border-purple-700/50">
                {payload.location || 'Incident Ground Zero'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
              <span>Perimeter: 500m</span>
              <span className="text-emerald-400">Route Clearance: 84%</span>
            </div>
          </div>

          {/* System Alert & Protocol Orders */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="p-3 bg-purple-50/70 rounded-lg border border-purple-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                Emergency Incident Broadcast
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {payload.system_alert || 'Priority alert broadcast active on emergency bands.'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1">
                <Navigation className="w-3.5 h-3.5 text-slate-600" />
                Required Incident Protocol Directives
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {payload.required_action || 'Authorize multi-unit deployment and establish perimeter containment.'}
              </p>
            </div>
          </div>
        </div>

        {/* Fleet Deployment Matrix */}
        <div className="px-4 py-3 bg-purple-50/30 border-t border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-purple-700" />
              Assign Responding Units to Incident
            </span>
            <span className="text-[11px] text-purple-900 font-mono">
              Selected: <strong>{selectedUnits.length} Units</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {unitsList.map((unit) => {
              const isSelected = selectedUnits.includes(unit.id);
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => toggleUnit(unit.id)}
                  className={`p-2 rounded border text-left text-xs transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px]">{unit.id}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-purple-200" />}
                  </div>
                  <div className="text-[10px] opacity-80 mt-1">{unit.type}</div>
                  <div className="text-[9px] font-mono mt-1 text-purple-200">ETA: {unit.eta}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dispatch Action Execution Panel */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-purple-700" />
              Dispatch Orders & Field Commands
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              Evaluated by Supervisor AI
            </span>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {(payload.actions_available && payload.actions_available.length > 0
              ? payload.actions_available
              : [
                  'Dispatch Full Hazmat & Rescue Task Force',
                  'Issue 1-Mile Downwind Shelter-in-Place Alert',
                  'Request Water Cannons & Harbor Fireboat Assistance',
                  'Establish Multi-Agency Command Post at Gate B',
                ]
            ).map((action, idx) => (
              <button
                key={idx}
                id={`btn-disp-action-${idx}`}
                disabled={isResolvingAction}
                onClick={() => handleExecuteDispatch(action)}
                className="text-left px-3 py-2.5 bg-white hover:bg-purple-50 text-slate-800 hover:text-purple-950 border border-slate-300 hover:border-purple-600 rounded-md text-xs font-medium transition-all shadow-2xs flex items-center justify-between group disabled:opacity-60"
              >
                <span className="pr-2">{action}</span>
                <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-700 shrink-0" />
              </button>
            ))}
          </div>

          {/* Custom Dispatch Input */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              id="input-custom-dispatch-order"
              type="text"
              placeholder="Broadcast custom dispatch command (e.g. 'Reroute Metro Line 4 and deploy Hazmat-01')..."
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customCommand.trim()) {
                  handleExecuteDispatch(customCommand);
                }
              }}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-purple-600 font-commissioner"
            />
            <button
              id="btn-submit-custom-dispatch"
              disabled={!customCommand.trim() || isResolvingAction}
              onClick={() => handleExecuteDispatch(customCommand)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isResolvingAction ? 'Broadcasting...' : 'Broadcast Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
