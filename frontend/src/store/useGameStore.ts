import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import { ecosystemEngine } from '../gameplay/EcosystemEngine';
import { missionDirector } from '../gameplay/MissionDirector';
import { harmonyEngine } from '../gameplay/HarmonyEngine';
import { npcEngine } from '../gameplay/NPCEngine';

declare global {
  interface Window {
    external?: {
      sendMessage?: (msg: string) => void;
      receiveMessage?: (callback: (rawMessage: string) => void) => void;
    };
    chrome?: {
      webview?: {
        postMessage?: (msg: string) => void;
      };
    };
  }
}

// Photino Bridge helper (optional native notifications)
const sendToPhotinoHost = (action: string, payload: Record<string, any> = {}) => {
  const msg = JSON.stringify({ action, payload });
  if (window.external && window.external.sendMessage) {
    window.external.sendMessage(msg);
  } else if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
    window.chrome.webview.postMessage(msg);
  }
};

export interface GameMission {
  id: string;
  title: string;
  type: string;
  region: string;
  faction: string;
  difficulty: string;
  description: string;
  rewards: { xp?: number; credits?: number; item?: string };
  status: string;
}

export interface DialogueEntry {
  npc: string;
  source: string;
  text: string;
}

export interface GameStoreState {
  tickCount: number;
  worldState: {
    corruption_level: number;
    prism_harmonic: number;
    aether_density: number;
    astral_phase: string;
    weather_condition: string;
    active_anomalies: number;
    regional_health: Record<string, number>;
  };
  player: {
    name: string;
    handle: string;
    class: string;
    level: number;
    xp: number;
    credits: number;
    biometrics: {
      dermalNodes: string;
      opticalGeometry: string;
      auraTelemetry: string;
    };
  };
  missions: GameMission[];
  dialogueHistory: DialogueEntry[];
  spellLog: any[];
  ipcConnected: boolean;

  initializeStore: () => Promise<void>;
  registerPlayer: (profileData: Partial<GameStoreState['player']>) => Promise<void>;
  requestTick: () => void;
  requestMission: () => void;
  completeMission: (missionId: string) => void;
  requestNPCDialogue: (npcName: string, prompt: string) => Promise<void>;
  requestSpellResolution: (element: string, power: number, runeLevel: number) => void;
  handlePhotinoResponse: (data: { action: string; payload: any }) => void;
}

export const useGameStore = create<GameStoreState>((setStore, getStore) => ({
  // World & Ecosystem State (Initialized from EcosystemEngine)
  tickCount: 1,
  worldState: ecosystemEngine.getState(),

  // Player Profile
  player: {
    name: "Netrunner One",
    handle: "Cipher-9",
    class: "Aether Scholar",
    level: 1,
    xp: 250,
    credits: 1500,
    biometrics: {
      dermalNodes: "Synchronized",
      opticalGeometry: "Calibrated",
      auraTelemetry: "Alpha 4"
    }
  },

  // Active Missions
  missions: [
    {
      id: "MIS-INIT-01",
      title: "Operation Glass Shadow",
      type: "Infiltration",
      region: "Aureline Core",
      faction: "DGA High Command",
      difficulty: "Novice",
      description: "Bypass regional firewalls and sync your biometric profile.",
      rewards: { xp: 200, credits: 350, item: "Aura Credits" },
      status: "Available"
    },
    {
      id: "MIS-INIT-02",
      title: "Aether Matrix Stabilization",
      type: "Aether Purification",
      region: "Orynvell Shallows",
      faction: "Aureline Academy",
      difficulty: "Adept",
      description: "Purge corruption spores infecting the regional node with SpellForge runes.",
      rewards: { xp: 350, credits: 600, item: "Elemental Runes" },
      status: "Available"
    }
  ],

  // Dialogue Log
  dialogueHistory: [
    {
      npc: "Mai",
      source: "system",
      text: "Welcome to MiraverseOSx! Celestial native TypeScript simulation active."
    }
  ],

  // Cast Spell Log
  spellLog: [],

  // IPC Connection Status
  ipcConnected: false,

  // Actions
  initializeStore: async () => {
    try {
      const cachedPlayer = await get('miraverse_player_profile');
      if (cachedPlayer) {
        setStore({ player: cachedPlayer });
      }
    } catch (err) {
      console.warn('idb-keyval error loading profile:', err);
    }

    if (window.external && window.external.receiveMessage) {
      setStore({ ipcConnected: true });
      window.external.receiveMessage((rawMessage: string) => {
        try {
          const data = JSON.parse(rawMessage);
          getStore().handlePhotinoResponse(data);
        } catch (e) {
          console.error('Error parsing Photino message:', e);
        }
      });
    }
  },

  registerPlayer: async (profileData) => {
    const updatedPlayer = { ...getStore().player, ...profileData };
    setStore({ player: updatedPlayer });
    try {
      await set('miraverse_player_profile', updatedPlayer);
    } catch (err) {
      console.warn('idb-keyval error saving profile:', err);
    }
  },

  requestTick: () => {
    const tickRes = ecosystemEngine.processTick(1.0);
    setStore({
      tickCount: tickRes.tick,
      worldState: tickRes.state
    });
    sendToPhotinoHost('tick_result', tickRes);
  },

  requestMission: () => {
    const p = getStore().player;
    const newMission = missionDirector.generateMission(p.level);
    setStore((state) => ({
      missions: [newMission, ...state.missions.slice(0, 4)]
    }));
    sendToPhotinoHost('mission_result', newMission);
  },

  completeMission: (missionId) => {
    const state = getStore();
    const mission = state.missions.find((m) => m.id === missionId);
    if (!mission) return;

    const rewardXP = mission.rewards?.xp || 200;
    const rewardCredits = mission.rewards?.credits || 300;
    const newXP = state.player.xp + rewardXP;
    const newLevel = Math.floor(newXP / 500) + 1;
    const newCredits = state.player.credits + rewardCredits;

    const updatedWorld = {
      ...state.worldState,
      corruption_level: Math.max(0, Math.round((state.worldState.corruption_level - 1.5) * 10) / 10),
      prism_harmonic: Math.min(100, Math.round((state.worldState.prism_harmonic + 1.2) * 10) / 10)
    };

    setStore({
      player: {
        ...state.player,
        xp: newXP,
        level: newLevel,
        credits: newCredits
      },
      worldState: updatedWorld,
      missions: state.missions.filter((m) => m.id !== missionId)
    });

    getStore().registerPlayer({});
  },

  requestNPCDialogue: async (npcName, prompt) => {
    const response = await npcEngine.generateDialogue(npcName, prompt);
    const entry: DialogueEntry = {
      npc: response.npc,
      source: response.source,
      text: response.text
    };
    setStore((state) => ({
      dialogueHistory: [entry, ...state.dialogueHistory.slice(0, 9)]
    }));
    sendToPhotinoHost('npc_dialogue', entry);
  },

  requestSpellResolution: (element, power, runeLevel) => {
    const p = getStore().player;
    const corruption = getStore().worldState.corruption_level;
    const resolution = harmonyEngine.calculateSpellPower(element, power, runeLevel, p.level, corruption);
    setStore((state) => ({
      spellLog: [resolution, ...state.spellLog.slice(0, 4)]
    }));
    sendToPhotinoHost('resolution_result', resolution);
  },

  handlePhotinoResponse: (data) => {
    const { action, payload } = data;
    if (action === 'tick_result') {
      setStore({
        tickCount: payload.tick,
        worldState: payload.state
      });
    } else if (action === 'mission_result') {
      setStore((state) => ({
        missions: [payload, ...state.missions.slice(0, 4)]
      }));
    } else if (action === 'npc_result') {
      setStore((state) => ({
        dialogueHistory: [payload, ...state.dialogueHistory.slice(0, 9)]
      }));
    } else if (action === 'resolution_result') {
      setStore((state) => ({
        spellLog: [payload, ...state.spellLog.slice(0, 4)]
      }));
    }
  }
}));
