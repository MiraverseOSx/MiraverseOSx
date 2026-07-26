import { create } from 'zustand';

const MENU_BAR_HEIGHT = 32;

// Cascade new windows so they don't stack perfectly on top of each other.
const spawnPosition = (count) => ({
  x: 120 + (count % 6) * 32,
  y: MENU_BAR_HEIGHT + 32 + (count % 6) * 32,
});

export const useOSStore = create((set) => ({
  windows: [],
  activeWindowId: null,
  wallpaper: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',

  // ------------------------------------------------------------------
  // Gameplay State Lane (Independent from Window OS State)
  // ------------------------------------------------------------------
  gameplay: {
    sessions: {},
    activeGameId: null,
    player: {
      level: 1,
      credits: 500,
      xp: 0,
      completedQuests: [],
      hackedNodes: 0,
      auraHealth: 100,
      conditions: ['Veilwilt'],
      forgedSpells: [],
      lineageDecrypted: false,
      skills: {
        Programming: { level: 1, xp: 0 },
        Networking: { level: 1, xp: 0 },
        Spellcasting: { level: 1, xp: 0 },
        Engineering: { level: 1, xp: 0 },
        Communication: { level: 1, xp: 0 },
        Creativity: { level: 1, xp: 0 },
        Research: { level: 1, xp: 0 },
        CyberSecurity: { level: 1, xp: 0 },
        Cryptography: { level: 1, xp: 0 },
      },
      careers: {
        medical: { rankIndex: 0, xp: 0 },
        dga: { rankIndex: 0, xp: 0 },
        gov: { rankIndex: 0, xp: 0 },
      },
      starterPhase: 0,
      appRanks: {
        explorer: 1,
        weaver: 1,
        investigator: 1,
        research: 1,
        influence: 1,
        clearance: 1,
      },
    },
  },

  startSession: (gameId, initialState = {}) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        activeGameId: gameId,
        sessions: {
          ...state.gameplay.sessions,
          [gameId]: state.gameplay.sessions[gameId] || {
            startedAt: Date.now(),
            score: 0,
            ...initialState,
          },
        },
      },
    })),

  updateSession: (gameId, sessionData) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        sessions: {
          ...state.gameplay.sessions,
          [gameId]: {
            ...(state.gameplay.sessions[gameId] || {}),
            ...sessionData,
            updatedAt: Date.now(),
          },
        },
      },
    })),

  endSession: (gameId) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        activeGameId: state.gameplay.activeGameId === gameId ? null : state.gameplay.activeGameId,
      },
    })),

  addCredits: (amount) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          credits: Math.max(0, state.gameplay.player.credits + amount),
        },
      },
    })),

  addXP: (amount) =>
    set((state) => {
      const newXP = state.gameplay.player.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            xp: newXP,
            level: newLevel,
          },
        },
      };
    }),

  completeQuest: (questId) =>
    set((state) => {
      if (state.gameplay.player.completedQuests.includes(questId)) return state;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            completedQuests: [...state.gameplay.player.completedQuests, questId],
          },
        },
      };
    }),

  incrementHackedNodes: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          hackedNodes: state.gameplay.player.hackedNodes + 1,
        },
      },
    })),

  damageAura: (amount) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          auraHealth: Math.max(0, state.gameplay.player.auraHealth - amount),
        },
      },
    })),

  healAura: (amount) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          auraHealth: Math.min(100, state.gameplay.player.auraHealth + amount),
        },
      },
    })),

  addCondition: (name) =>
    set((state) => {
      if (state.gameplay.player.conditions.includes(name)) return state;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            conditions: [...state.gameplay.player.conditions, name],
          },
        },
      };
    }),

  removeCondition: (name) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          conditions: state.gameplay.player.conditions.filter((c) => c !== name),
        },
      },
    })),

  clearConditions: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          conditions: [],
        },
      },
    })),

  addForgedSpell: (name) =>
    set((state) => {
      if (state.gameplay.player.forgedSpells.includes(name)) return state;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            forgedSpells: [...state.gameplay.player.forgedSpells, name],
          },
        },
      };
    }),

  decryptLineage: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          lineageDecrypted: true,
        },
      },
    })),

  addSkillXP: (skillName, amount) =>
    set((state) => {
      const current = state.gameplay.player.skills[skillName] || { level: 1, xp: 0 };
      let newXP = current.xp + amount;
      const nextLevelXP = current.level * 150;
      let newLevel = current.level;
      if (newXP >= nextLevelXP) {
        newXP -= nextLevelXP;
        newLevel += 1;
      }
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            skills: {
              ...state.gameplay.player.skills,
              [skillName]: { level: newLevel, xp: newXP },
            },
          },
        },
      };
    }),

  addCareerXP: (track, amount) =>
    set((state) => {
      const current = state.gameplay.player.careers[track] || { rankIndex: 0, xp: 0 };
      let newXP = current.xp + amount;
      let newRankIndex = current.rankIndex;
      if (newXP >= 100) {
        newXP -= 100;
        newRankIndex = Math.min(5, current.rankIndex + 1);
      }
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            careers: {
              ...state.gameplay.player.careers,
              [track]: { rankIndex: newRankIndex, xp: newXP },
            },
          },
        },
      };
    }),

  advanceStarterPhase: (targetPhase) =>
    set((state) => {
      const current = state.gameplay.player.starterPhase || 0;
      const nextPhase = targetPhase !== undefined ? targetPhase : Math.min(5, current + 1);
      if (nextPhase <= current) return state;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            starterPhase: nextPhase,
            credits: state.gameplay.player.credits + 100,
            xp: state.gameplay.player.xp + 50,
          },
        },
      };
    }),

  incrementAppRank: (appName) =>
    set((state) => {
      const currentRanks = state.gameplay.player.appRanks || {
        explorer: 1,
        weaver: 1,
        investigator: 1,
        research: 1,
        influence: 1,
        clearance: 1,
      };
      const newRank = (currentRanks[appName] || 1) + 1;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            appRanks: {
              ...currentRanks,
              [appName]: newRank,
            },
          },
        },
      };
    }),

  // ------------------------------------------------------------------
  // Window Management & OS Controls
  // ------------------------------------------------------------------
  addWindow: (app) => set((state) => {
    const existing = state.windows.find((w) => w.id === app.id);
    if (existing) {
      const maxZ = Math.max(0, ...state.windows.map((w) => w.zIndex));
      return {
        windows: state.windows.map((w) =>
          w.id === app.id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        activeWindowId: app.id,
      };
    }

    const newWindow = {
      title: app.title,
      contentKey: app.contentKey,
      ...app,
      id: app.id || Math.random().toString(36).substr(2, 9),
      zIndex: state.windows.length + 10,
      isMinimized: false,
      isMaximized: false,
      position: app.position || spawnPosition(state.windows.length),
      size: app.size || { width: 680, height: 480 },
    };
    return {
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    };
  }),

  toggleApp: (app) => set((state) => {
    const existing = state.windows.find((w) => w.id === app.id);
    if (existing) {
      if (state.activeWindowId === app.id && !existing.isMinimized) {
        const remaining = state.windows.filter((w) => w.id !== app.id);
        return {
          windows: remaining,
          activeWindowId:
            remaining.slice().sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null,
        };
      }
      const maxZ = Math.max(0, ...state.windows.map((w) => w.zIndex));
      return {
        windows: state.windows.map((w) =>
          w.id === app.id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        activeWindowId: app.id,
      };
    }

    const newWindow = {
      title: app.title,
      contentKey: app.contentKey,
      ...app,
      id: app.id || Math.random().toString(36).substr(2, 9),
      zIndex: state.windows.length + 10,
      isMinimized: false,
      isMaximized: false,
      position: app.position || spawnPosition(state.windows.length),
      size: app.size || { width: 680, height: 480 },
    };
    return {
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    };
  }),

  closeWindow: (id) => set((state) => {
    const remaining = state.windows.filter((w) => w.id !== id);
    return {
      windows: remaining,
      activeWindowId:
        state.activeWindowId === id
          ? (remaining.slice().sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null)
          : state.activeWindowId,
    };
  }),

  focusWindow: (id) => set((state) => {
    const maxZ = Math.max(0, ...state.windows.map((w) => w.zIndex));
    return {
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
      ),
      activeWindowId: id,
    };
  }),

  toggleMinimize: (id) => set((state) => ({
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
  })),

  toggleMaximize: (id) => set((state) => ({
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ),
  })),

  moveWindow: (id, position) => set((state) => ({
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, position } : w
    ),
  })),

  clearActive: () => set({ activeWindowId: null }),

  setWallpaper: (url) => set({ wallpaper: url }),
}));
