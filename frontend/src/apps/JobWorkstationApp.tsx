import React, { useState, useEffect } from 'react';
import { useOSStore } from '../store/useOSStore';
import { useSystemStore } from '../store/useSystemStore';
import { SoundFX } from '../utils/audio';
import {
  Briefcase, Activity, ShieldAlert, Search, Radio, CheckCircle2, Clock, 
  Send, Users, MapPin, Truck, AlertTriangle, Play, Pause, RefreshCw, 
  Award, FileText, ChevronRight, DollarSign, Zap, Stethoscope, Compass, Lock
} from 'lucide-react';

export type CareerTrack = 'medical' | 'dga' | 'gov';

export interface JobShiftEvent {
  id: string;
  track: CareerTrack;
  title: string;
  location: string;
  severity: 'Routine' | 'Elevated' | 'Critical';
  summary: string;
  patientOrSubject?: string;
  symptomsOrThreat?: string;
  requiredAction: string;
  completed: boolean;
  rewardXP: number;
  salaryCredits: number;
}

const INITIAL_SHIFT_EVENTS: JobShiftEvent[] = [
  // Faith Medical Group Shift
  {
    id: 'med-01',
    track: 'medical',
    title: 'Triage Patient: Neural Desynchronization',
    location: 'Faith Medical Campus - Ward 04',
    severity: 'Elevated',
    summary: 'A Cyacademy student was admitted following high-stress spell synthesis with severe Veilwilt symptoms.',
    patientOrSubject: 'Student S. Mercer (Vertex House)',
    symptomsOrThreat: 'Aura Greying, 39.1°C Thermal Flux, Memory Fragmentation',
    requiredAction: 'Apply warm-essence stabilizing compress and synchronize telemetry.',
    completed: false,
    rewardXP: 140,
    salaryCredits: 200,
  },
  {
    id: 'med-02',
    track: 'medical',
    title: 'Emergency Frostlung Thermal Thaw',
    location: 'Faith Medical Campus - Trauma Lab',
    severity: 'Critical',
    summary: 'Citizen exposed to cryo-leak in Old Factory Ward sub-levels requires immediate bronchial thaw.',
    patientOrSubject: 'Technician K. Vance',
    symptomsOrThreat: 'Crystallized breath, -14.2% Aura integrity',
    requiredAction: 'Administer Kaji Ignis-essence infusion.',
    completed: false,
    rewardXP: 220,
    salaryCredits: 350,
  },

  // DGA Security & Dispatch Shift
  {
    id: 'dga-01',
    track: 'dga',
    title: 'Containment Callout: Sub-Aureline Data Bleed',
    location: 'Sub-Aureline Maintenance Tunnel 09',
    severity: 'Critical',
    summary: 'PRISM corruption thread PID 512 is leaking raw memory into physical subway signals.',
    patientOrSubject: 'PRISM Incursion Vector',
    symptomsOrThreat: 'Distorted reality physics, power flicker, signal hijack',
    requiredAction: 'Deploy Hazmat-01 & Patrol-12 squads with Seal Lock protocols.',
    completed: false,
    rewardXP: 280,
    salaryCredits: 400,
  },
  {
    id: 'dga-02',
    track: 'dga',
    title: 'District Surveillance Sweep: Glassline Towers',
    location: 'Glassline District Tram Hub',
    severity: 'Routine',
    summary: 'Inspect mesh network relays for unauthorized packet tapping by underground Netrunners.',
    patientOrSubject: 'Public Relay #GL-44',
    symptomsOrThreat: 'Encrypted packet rerouting detected',
    requiredAction: 'Re-flash firmware with DGA Directive 14-B compliance keys.',
    completed: false,
    rewardXP: 100,
    salaryCredits: 150,
  },

  // Governmental Civic Investigation Shift
  {
    id: 'gov-01',
    track: 'gov',
    title: 'Civic File Audit: Lineage Records Verification',
    location: 'Aureline Civic Identity Bureau',
    severity: 'Routine',
    summary: 'Cross-examine incoming resident registration packets against Purge-era census databases.',
    patientOrSubject: 'Provisional Registrations Batch #88',
    symptomsOrThreat: 'Unresolved Lightborn genealogical markers',
    requiredAction: 'Certify provisional status and issue citizen ID barcode.',
    completed: false,
    rewardXP: 120,
    salaryCredits: 180,
  },
  {
    id: 'gov-02',
    track: 'gov',
    title: 'Diplomatic Briefing: Meridion Delegation Arrival',
    location: 'Municipal Chamber Room 02',
    severity: 'Elevated',
    summary: 'Coordinate seasonal transit clearances and security escorts for Fross and Lumia ambassadors.',
    patientOrSubject: 'Ambassador Holly (Fross) & Lucia Envoy',
    symptomsOrThreat: 'High political friction over elemental module allocations',
    requiredAction: 'Draft mutual protocol agreement and archive sign-offs.',
    completed: false,
    rewardXP: 200,
    salaryCredits: 300,
  },
];

export default function JobWorkstationApp() {
  const { soundEnabled } = useSystemStore();
  const [activeTab, setActiveTab] = useState<CareerTrack | 'stats'>('medical');
  const [events, setEvents] = useState<JobShiftEvent[]>(INITIAL_SHIFT_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>('med-01');
  const [shiftActive, setShiftActive] = useState<boolean>(true);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['Patrol-12', 'Medic-04']);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const player = useOSStore((s) => s.gameplay.player);
  const addCredits = useOSStore((s) => s.addCredits);
  const addXP = useOSStore((s) => s.addXP);

  const currentEvents = events.filter((e) => e.track === activeTab);
  const selectedEvent = events.find((e) => e.id === selectedEventId) || currentEvents[0] || null;

  const completedCount = events.filter((e) => e.completed).length;
  const totalEarnings = events.filter((e) => e.completed).reduce((acc, curr) => acc + curr.salaryCredits, 0);

  const handleResolveEvent = (eventId: string) => {
    if (soundEnabled) SoundFX.playButtonTap();
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId && !e.completed) {
          addCredits(e.salaryCredits);
          addXP(e.rewardXP);
          if (soundEnabled) SoundFX.playSuccess();
          setActionFeedback(`✅ Completed: ${e.title}! Earned +${e.salaryCredits} ₢ and +${e.rewardXP} Career XP.`);
          setTimeout(() => setActionFeedback(null), 4000);
          return { ...e, completed: true };
        }
        return e;
      })
    );
  };

  const toggleUnit = (unit: string) => {
    if (selectedUnits.includes(unit)) {
      setSelectedUnits(selectedUnits.filter((u) => u !== unit));
    } else {
      setSelectedUnits([...selectedUnits, unit]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] text-slate-800 font-sans select-none overflow-hidden border border-slate-300">
      
      {/* 1. TOP SHIFT HEADER & STATUS BAR */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Briefcase size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-amber-500 text-slate-950 px-2 py-0.2 font-bold rounded">
                CAREER WORKSTATION // AURELINE MUNICIPAL
              </span>
              <span className="text-xs text-slate-400 font-mono">§5E Official Shift Terminal</span>
            </div>
            <h1 className="text-sm font-bold text-slate-100 mt-0.5">
              Professional Service Operations & Incident Dispatch
            </h1>
          </div>
        </div>

        {/* Global Shift Telemetry */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-slate-400 text-[10px]">CURRENT SHIFT EARNINGS</div>
            <div className="text-emerald-400 font-bold font-mono">+{totalEarnings} ₢ Earned</div>
          </div>
          <div className="h-7 w-[1px] bg-slate-800" />
          <div className="text-right">
            <div className="text-slate-400 text-[10px]">TASKS RESOLVED</div>
            <div className="text-amber-400 font-bold">{completedCount} / {events.length}</div>
          </div>
        </div>
      </header>

      {/* 2. CAREER TRACK NAVIGATION BAR */}
      <div className="flex items-center justify-between px-6 py-2 bg-slate-100 border-b border-slate-300">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('medical'); setSelectedEventId('med-01'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
              activeTab === 'medical'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Stethoscope size={14} />
            <span>Faith Medical (Jade)</span>
          </button>

          <button
            onClick={() => { setActiveTab('dga'); setSelectedEventId('dga-01'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
              activeTab === 'dga'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Radio size={14} />
            <span>DGA Dispatch (Purple)</span>
          </button>

          <button
            onClick={() => { setActiveTab('gov'); setSelectedEventId('gov-01'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
              activeTab === 'gov'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Search size={14} />
            <span>Civic Investigation (Navy)</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
              activeTab === 'stats'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Activity size={14} />
            <span>Supervisor Analytics</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          Clearance Level: <strong className="text-slate-800">Tier 1 Certified Responder</strong>
        </span>
      </div>

      {/* Action Notification Banner */}
      {actionFeedback && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-mono text-emerald-900 font-bold flex items-center justify-between">
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 3. WORKSTATION MAIN SPLIT VIEW */}
      <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: ACTIVE INCIDENTS LIST */}
        {activeTab !== 'stats' ? (
          <>
            <div className="col-span-5 border-r border-slate-300 bg-white p-4 overflow-y-auto space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Active Shift Assignments ({currentEvents.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">Auto-Refreshed</span>
              </div>

              {currentEvents.map((evt) => {
                const isSelected = evt.id === selectedEvent?.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      if (soundEnabled) SoundFX.playSnap();
                      setSelectedEventId(evt.id);
                    }}
                    className={`p-3.5 border rounded-lg cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    } ${evt.completed ? 'opacity-60 bg-slate-50' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded border ${
                          evt.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          evt.severity === 'Elevated' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {evt.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-600">+{evt.salaryCredits} ₢</span>
                      </div>
                      <h4 className={`text-xs font-bold text-slate-900 mt-1 ${evt.completed ? 'line-through text-slate-400' : ''}`}>
                        {evt.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{evt.summary}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {evt.location.split('-')[0]}
                      </span>
                      {evt.completed ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} /> RESOLVED
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">ACTION PENDING</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT COLUMN: WORKBENCH & ACTION TERMINAL */}
            <div className="col-span-7 p-6 overflow-y-auto bg-[#fafafa] flex flex-col justify-between">
              {selectedEvent ? (
                <div className="space-y-6">
                  {/* Event Detail Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-2xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                          INCIDENT PROTOCOL // {selectedEvent.id.toUpperCase()}
                        </span>
                        <h2 className="text-base font-bold text-slate-900 mt-0.5">{selectedEvent.title}</h2>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        +{selectedEvent.rewardXP} Career XP
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{selectedEvent.summary}</p>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs font-mono">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-400 text-[10px] block">SUBJECT / TARGET</span>
                        <strong className="text-slate-800">{selectedEvent.patientOrSubject}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-400 text-[10px] block">OBSERVED SYMPTOM / THREAT</span>
                        <strong className="text-rose-700">{selectedEvent.symptomsOrThreat}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Operational Controls / Tactical Units */}
                  {selectedEvent.track === 'dga' && (
                    <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                        <Truck size={14} className="text-purple-600" />
                        Tactical Response Units Available
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        {['Patrol-12', 'Medic-04', 'Hazmat-01', 'Rescue-02'].map((unit) => {
                          const isSelected = selectedUnits.includes(unit);
                          return (
                            <button
                              key={unit}
                              onClick={() => toggleUnit(unit)}
                              className={`p-2.5 rounded-lg border text-left flex justify-between items-center transition ${
                                isSelected
                                  ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <span>{unit}</span>
                              <span className="text-[10px]">{isSelected ? 'ASSIGNED' : 'STANDBY'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Resolution Directive */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-amber-900 font-bold block">
                      REQUIRED INTERVENTION PROTOCOL
                    </span>
                    <p className="text-xs text-amber-950 font-medium leading-relaxed">
                      {selectedEvent.requiredAction}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 text-xs font-mono">
                  Select an incident protocol from the queue.
                </div>
              )}

              {/* Bottom Submit Action */}
              {selectedEvent && (
                <div className="pt-4 border-t border-slate-200 mt-6 flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-500">
                    Salary Compensation: <strong className="text-slate-900">+{selectedEvent.salaryCredits} ₢</strong>
                  </span>
                  <button
                    onClick={() => handleResolveEvent(selectedEvent.id)}
                    disabled={selectedEvent.completed}
                    className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition shadow-sm flex items-center gap-2 ${
                      selectedEvent.completed
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : activeTab === 'medical'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : activeTab === 'dga'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                        : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                    }`}
                  >
                    {selectedEvent.completed ? (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Shift Report Filed</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Execute Protocol & File Report</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* SUPERVISOR STATS TAB */
          <div className="col-span-12 p-6 overflow-y-auto space-y-6 bg-white">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                Career Performance & Supervisory Metrics (§5E)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of career identity, recurring mission throughput, and municipal stipend balances.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Total Shift Revenue</span>
                <div className="text-2xl font-bold font-mono text-emerald-600">{totalEarnings} ₢</div>
                <p className="text-[11px] text-slate-500">Credited to Aureline municipal balance.</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Incidents Cleared</span>
                <div className="text-2xl font-bold font-mono text-purple-600">{completedCount} / {events.length}</div>
                <p className="text-[11px] text-slate-500">100% resolution accuracy rating.</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Civic Standing</span>
                <div className="text-2xl font-bold font-mono text-blue-600">Tier 1 Certified</div>
                <p className="text-[11px] text-slate-500">Unlocks restricted district ward access.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 font-mono uppercase">
                Continuous Multi-Agent Shift Scheduler
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The supervisor daemon automatically injects dynamic emergency callouts based on your Sys-Cycle schedule and active Veil corruption levels. Complete shift assignments to advance your standing across Faith Medical, DGA, and Governmental career ladders.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
