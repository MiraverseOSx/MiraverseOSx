import { create } from 'zustand';
import { get, set } from 'idb-keyval';

// Photino Bridge helper
const sendToPhotinoHost = (action, payload = {}) => {
  const msg = JSON.stringify({ action, payload });
  if (window.external && window.external.sendMessage) {
    window.external.sendMessage(msg);
  } else if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
    window.chrome.webview.postMessage(msg);
  } else {
    console.log('[Mock IPC Photino Outbound]:', action, payload);
  }
};

export const useGameStore = create((setStore, getStore) => ({
  // World & Ecosystem State
  tickCount: 0,
  worldState: {
    corruption_level: 12.4,
    prism_harmonic: 88.5,
    aether_density: 1024.0,
    astral_phase: "Solstice Alignment",
    weather_condition: "Aureline Clear",
    active_anomalies: 2,
    regional_health: {
      "Aureline Core": 94.2,
      "Orynvell Shallows": 76.5,
      "Versenet Verge": 63.8,
      "Shadow Grid": 31.0
    }
  },

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
    }
  ],

  // Dialogue Log
  dialogueHistory: [
    {
      npc: "Mai",
      source: "system",
      text: "Welcome to MiraverseOSx! Photino-Python bridge active."
    }
  ],

  // IPC Connection Status
  ipcConnected: false,

  // Actions
  initializeStore: async () => {
    // Load cached player profile from IndexedDB via idb-keyval
    try {
      const cachedPlayer = await get('miraverse_player_profile');
      if (cachedPlayer) {
        setStore({ player: cachedPlayer });
      }
    } catch (err) {
      console.warn('idb-keyval error loading profile:', err);
    }

    // Attach Photino message listener if available
    if (window.external && window.external.receiveMessage) {
      setStore({ ipcConnected: true });
      window.external.receiveMessage((rawMessage) => {
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
    sendToPhotinoHost('calculate_tick');
  },

  requestMission: () => {
    const p = getStore().player;
    sendToPhotinoHost('generate_mission', { level: p.level });
  },

  requestNPCDialogue: (npcName, prompt) => {
    sendToPhotinoHost('npc_dialogue', { npc: npcName, prompt });
  },

  requestSpellResolution: (element, power, runeLevel) => {
    const p = getStore().player;
    const corruption = getStore().worldState.corruption_level;
    sendToPhotinoHost('calculate_resolution', {
      type: 'spell',
      element,
      power,
      runeLevel,
      playerLevel: p.level,
      corruption
    });
  },

  // Process Host Responses
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
      console.log('Spell/Hack resolution result:', payload);
    }
  }
}));
