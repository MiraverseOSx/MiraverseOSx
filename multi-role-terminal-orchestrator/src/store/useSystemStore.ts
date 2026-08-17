import { create } from 'zustand';
import {
  ModuleType,
  OrchestratorEvent,
  ResolutionHistoryItem,
  DepartmentStats,
  SystemNotification,
  WindowState,
  ActionResolutionResult,
} from '../types/orchestrator';
import { SoundFX } from '../utils/audio';

const INITIAL_EVENTS: OrchestratorEvent[] = [
  {
    id: 'med_8492',
    module: 'medical',
    event_type: 'chart_update',
    urgency: 'critical',
    sender: 'ER Triage Bay 1',
    timestamp: '08:42:15',
    payload: {
      patient_name: 'Sarah Jenkins',
      age: 29,
      vitals: 'HR 140 bpm, BP 85/50 mmHg, SpO2 92%, Temp 37.8°C',
      symptoms: 'Severe hypotension, acute diffuse abdominal tenderness with guarding. Signs of early hemorrhagic shock.',
      history: 'Blunt abdominal trauma after motor scooter accident. Unknown blood type.',
      triage_category: 'Immediate / Red',
      actions_available: [
        'Push 2L IV Normal Saline Bolus STAT',
        'Order FAST Bedside Ultrasound & Cross-match 4 Units O-Neg PRBC',
        'Prepare for Emergency Diagnostic Laparotomy',
        'Administer IV Tranexamic Acid (TXA) 1g',
      ],
    },
  },
  {
    id: 'inv_3301',
    module: 'investigation',
    event_type: 'system_report',
    urgency: 'elevated',
    sender: 'Forensics Acoustic Lab',
    timestamp: '08:43:50',
    payload: {
      case_file_id: 'CF-994',
      suspect_name: 'Unknown Operator ("Specter")',
      evidence_summary: 'Audio analysis of intercepted ransom tape complete. The background acoustic harmonics match the 4th Street elevated subway junction at peak transit load.',
      clue_type: 'Acoustic Harmonics & Doppler Signature',
      confidence_level: '92.4%',
      actions_available: [
        'Pull CCTV Feeds for 4th St Subway Station (08:00 - 08:30)',
        'Issue Subpoena for Metro Transit Cellular Tower Dumps',
        'Cross-reference Audio with City Rail Frequency Database',
        'Deploy Tactical Surveillance Team to 4th St Depot',
      ],
    },
  },
  {
    id: 'disp_7210',
    module: 'dispatch',
    event_type: 'incoming_call',
    urgency: 'critical',
    sender: 'Central 911 Communications',
    timestamp: '08:45:02',
    payload: {
      system_alert: 'Structural fire and explosion reported at Harbor Logistics Container Yard. Multiple industrial chemical drums compromised.',
      required_action: 'Deploy Fire Engine 03, Ladder 09, Hazmat Response Unit, and route EMT units for burn casualties.',
      location: 'Harbor Pier 14, Industrial District',
      units_recommended: ['Engine-03', 'Ladder-09', 'Hazmat-01', 'Medic-04', 'Patrol-19'],
      actions_available: [
        'Dispatch Engine-03, Hazmat-01 & Medic-04 Code 3',
        'Issue 1-Mile Downwind Shelter-in-Place Alert',
        'Request Water Cannons & Harbor Fireboat Assistance',
        'Establish Multi-Agency Command Post at Gate B',
      ],
    },
  },
];

const INITIAL_WINDOWS: WindowState[] = [
  { id: 'medical', title: 'Medical Charting & Triage ICU', module: 'medical', isOpen: true, isMinimized: false, isMaximized: false, zIndex: 10 },
  { id: 'investigation', title: 'Investigative Bureau & Forensics', module: 'investigation', isOpen: true, isMinimized: false, isMaximized: false, zIndex: 9 },
  { id: 'dispatch', title: 'Emergency Metro Dispatch 911', module: 'dispatch', isOpen: true, isMinimized: false, isMaximized: false, zIndex: 8 },
  { id: 'orchestrator', title: 'AI Supervisor Feed & Inspector', module: 'orchestrator', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 11 },
  { id: 'stats', title: 'Shift Performance & Telemetry', module: 'stats', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 7 },
  { id: 'notepad', title: 'Operator Shift Log & Scratchpad', module: 'notepad', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 6 },
];

interface OSState {
  activeModule: ModuleType | null;
  activeEvents: OrchestratorEvent[];
  selectedEventId: string | null;
  resolvedHistory: ResolutionHistoryItem[];
  stats: DepartmentStats;
  windows: WindowState[];
  notifications: SystemNotification[];
  isLiveSimulation: boolean;
  simulationInterval: number; // in seconds
  isGeneratingEvent: boolean;
  isResolvingAction: boolean;
  activeScenario: string;
  scenarioBriefing: string;
  soundEnabled: boolean;
  lastOrchestratorPayload: any | null;
  rawJsonLogs: string[];

  // Actions
  dispatchIncomingEvent: (event: OrchestratorEvent) => void;
  openModule: (module: ModuleType | 'orchestrator' | 'stats' | 'notepad') => void;
  closeModule: (id: string) => void;
  minimizeModule: (id: string) => void;
  maximizeModule: (id: string) => void;
  bringToFront: (id: string) => void;
  setSelectedEvent: (id: string | null) => void;
  toggleLiveSimulation: () => void;
  setSimulationInterval: (interval: number) => void;
  toggleSound: () => void;
  fetchProactiveEvents: (count?: number, customTheme?: string) => Promise<void>;
  resolveEventAction: (eventId: string, actionTaken: string, playerNotes?: string) => Promise<ActionResolutionResult | null>;
  loadScenario: (scenarioKey: string) => Promise<void>;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  updateStats: (module: ModuleType, scoreGain: number) => void;
}

export const useSystemStore = create<OSState>((set, get) => ({
  activeModule: 'medical',
  activeEvents: INITIAL_EVENTS,
  selectedEventId: INITIAL_EVENTS[0].id,
  resolvedHistory: [],
  stats: {
    medicalScore: 88,
    patientsTreated: 4,
    investigationScore: 92,
    casesResolved: 3,
    dispatchScore: 90,
    unitsDispatched: 12,
    overallRating: 90,
  },
  windows: INITIAL_WINDOWS,
  notifications: [
    {
      id: 'notif-welcome',
      title: 'Terminal Connected',
      message: 'Multi-Agent Supervisor connected to Medical, Investigation, and Dispatch channels.',
      module: 'system',
      urgency: 'routine',
      timestamp: '08:40:00',
    },
  ],
  isLiveSimulation: true,
  simulationInterval: 30, // Proactive pulse every 30s
  isGeneratingEvent: false,
  isResolvingAction: false,
  activeScenario: 'Standard Metropolitan Shift',
  scenarioBriefing: 'Supervise concurrent emergencies across Saint Jude ER, Metro Forensics Bureau, and 911 City Dispatch.',
  soundEnabled: true,
  lastOrchestratorPayload: { event_queue: INITIAL_EVENTS },
  rawJsonLogs: [
    JSON.stringify({ event_queue: INITIAL_EVENTS }, null, 2),
  ],

  dispatchIncomingEvent: (event: OrchestratorEvent) => {
    const state = get();
    const formattedTimestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    // Guard against any accidental duplicate ID across simulation pulses
    const isIdDuplicate = state.activeEvents.some((e) => e.id === event.id);
    const uniqueId = isIdDuplicate
      ? `${event.id}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
      : event.id;

    const stampedEvent = { ...event, id: uniqueId, timestamp: event.timestamp || formattedTimestamp };

    // Trigger sound
    if (state.soundEnabled) {
      if (event.module === 'medical') SoundFX.playMedicalBeep(event.urgency === 'critical');
      else if (event.module === 'investigation') SoundFX.playInvestigationClick();
      else SoundFX.playDispatchChime();
    }

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${event.module.toUpperCase()}: ${event.sender}`,
      message:
        event.payload.symptoms ||
        event.payload.evidence_summary ||
        event.payload.system_alert ||
        'New Priority Telemetry Incoming',
      module: event.module,
      urgency: event.urgency,
      timestamp: formattedTimestamp,
      eventId: uniqueId,
    };

    set((curr) => ({
      activeEvents: [stampedEvent, ...curr.activeEvents],
      notifications: [newNotif, ...curr.notifications.slice(0, 19)],
    }));
  },

  openModule: (moduleId) => {
    const highestZ = Math.max(...get().windows.map((w) => w.zIndex), 10);
    if (get().soundEnabled) SoundFX.playSnap();

    set((curr) => ({
      activeModule: moduleId as any,
      windows: curr.windows.map((w) =>
        w.id === moduleId
          ? { ...w, isOpen: true, isMinimized: false, zIndex: highestZ + 1 }
          : w
      ),
    }));
  },

  closeModule: (id) => {
    set((curr) => ({
      windows: curr.windows.map((w) => (w.id === id ? { ...w, isOpen: false } : w)),
    }));
  },

  minimizeModule: (id) => {
    set((curr) => ({
      windows: curr.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      ),
    }));
  },

  maximizeModule: (id) => {
    set((curr) => ({
      windows: curr.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }));
  },

  bringToFront: (id) => {
    const highestZ = Math.max(...get().windows.map((w) => w.zIndex), 10);
    set((curr) => ({
      activeModule: curr.windows.find((w) => w.id === id)?.module as any || curr.activeModule,
      windows: curr.windows.map((w) =>
        w.id === id ? { ...w, zIndex: highestZ + 1, isMinimized: false } : w
      ),
    }));
  },

  setSelectedEvent: (id) => {
    set({ selectedEventId: id });
  },

  toggleLiveSimulation: () => {
    set((curr) => ({ isLiveSimulation: !curr.isLiveSimulation }));
  },

  setSimulationInterval: (interval) => {
    set({ simulationInterval: Math.max(10, Math.min(120, interval)) });
  },

  toggleSound: () => {
    const nextState = !get().soundEnabled;
    set({ soundEnabled: nextState });
    if (nextState) {
      SoundFX.playSuccessTone();
    }
  },

  fetchProactiveEvents: async (count = 1, customTheme = '') => {
    const { activeEvents, resolvedHistory, activeScenario, isGeneratingEvent } = get();
    if (isGeneratingEvent) return;

    set({ isGeneratingEvent: true });
    try {
      const response = await fetch('/api/orchestrator/generate-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeEvents: activeEvents.map((e) => ({ id: e.id, module: e.module, urgency: e.urgency })),
          recentActions: resolvedHistory.slice(-4).map((h) => ({
            module: h.module,
            action: h.actionTaken,
            score: h.result.score,
          })),
          scenarioTheme: customTheme || activeScenario,
          count,
        }),
      });

      const data = await response.json();
      if (data.event_queue && Array.isArray(data.event_queue)) {
        data.event_queue.forEach((evt: OrchestratorEvent) => {
          get().dispatchIncomingEvent(evt);
        });

        set((curr) => ({
          lastOrchestratorPayload: data,
          rawJsonLogs: [JSON.stringify(data, null, 2), ...curr.rawJsonLogs.slice(0, 9)],
        }));
      }
    } catch (err) {
      console.error('Error fetching proactive orchestrator events:', err);
    } finally {
      set({ isGeneratingEvent: false });
    }
  },

  resolveEventAction: async (eventId, actionTaken, playerNotes = '') => {
    const { activeEvents, soundEnabled } = get();
    const targetEvent = activeEvents.find((e) => e.id === eventId);
    if (!targetEvent) return null;

    set({ isResolvingAction: true });
    try {
      const response = await fetch('/api/orchestrator/resolve-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: targetEvent,
          actionTaken,
          playerNotes,
        }),
      });

      const result: ActionResolutionResult = await response.json();

      if (soundEnabled) SoundFX.playSuccessTone();

      // Update Department Stats
      get().updateStats(targetEvent.module, result.score);

      const historyItem: ResolutionHistoryItem = {
        id: `res-${Date.now()}`,
        eventId: targetEvent.id,
        module: targetEvent.module,
        actionTaken,
        playerNotes,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        result,
        eventSummary:
          targetEvent.payload.patient_name ||
          targetEvent.payload.case_file_id ||
          targetEvent.payload.system_alert ||
          targetEvent.sender,
      };

      set((curr) => ({
        resolvedHistory: [historyItem, ...curr.resolvedHistory],
        activeEvents: curr.activeEvents.filter((e) => e.id !== eventId),
        selectedEventId:
          curr.activeEvents.filter((e) => e.id !== eventId)[0]?.id || null,
      }));

      return result;
    } catch (err) {
      console.error('Error resolving action:', err);
      return null;
    } finally {
      set({ isResolvingAction: false });
    }
  },

  loadScenario: async (scenarioKey) => {
    const scenarios: Record<string, { title: string; prompt: string }> = {
      midnight_surge: {
        title: 'Midnight Mass Casualty Surge',
        prompt: 'A catastrophic structural collapse at the downtown transit exchange with toxic dust cloud and mass trauma casualties.',
      },
      cyber_sabotage: {
        title: 'Metropolitan Grid & Cyber Sabotage',
        prompt: 'Coordinated cyber-attack hijacking city traffic systems, substation brownouts, and targeted assassinations.',
      },
      biotoxin_outbreak: {
        title: 'Chemical Contamination & Quarantine Protocol',
        prompt: 'Contaminated municipal water reservoir resulting in acute neurotoxin symptoms and panic across District 4.',
      },
      harbor_storm: {
        title: 'Harbor Pier 14 Industrial Conflagration',
        prompt: 'Category 3 gale forces triggering container ship collision, chemical fires, and maritime search-and-rescue.',
      },
    };

    const target = scenarios[scenarioKey] || scenarios.midnight_surge;
    set({
      activeScenario: target.title,
      scenarioBriefing: target.prompt,
      isGeneratingEvent: true,
    });

    try {
      const res = await fetch('/api/orchestrator/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioTitle: target.title }),
      });

      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        set({ activeEvents: data.events, selectedEventId: data.events[0]?.id || null });
        if (data.briefing) {
          set({ scenarioBriefing: data.briefing });
        }
      }
    } catch (err) {
      console.error('Failed to load scenario:', err);
    } finally {
      set({ isGeneratingEvent: false });
    }
  },

  dismissNotification: (id) => {
    set((curr) => ({
      notifications: curr.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  updateStats: (module, scoreGain) => {
    set((curr) => {
      const stats = { ...curr.stats };
      if (module === 'medical') {
        stats.patientsTreated += 1;
        stats.medicalScore = Math.min(100, Math.round((stats.medicalScore * 3 + scoreGain) / 4));
      } else if (module === 'investigation') {
        stats.casesResolved += 1;
        stats.investigationScore = Math.min(100, Math.round((stats.investigationScore * 3 + scoreGain) / 4));
      } else if (module === 'dispatch') {
        stats.unitsDispatched += 2;
        stats.dispatchScore = Math.min(100, Math.round((stats.dispatchScore * 3 + scoreGain) / 4));
      }

      stats.overallRating = Math.round(
        (stats.medicalScore + stats.investigationScore + stats.dispatchScore) / 3
      );

      return { stats };
    });
  },
}));
