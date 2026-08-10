import { create } from 'zustand';
import missionsData from '../data/missions.json' with { type: 'json' };

const MENU_BAR_HEIGHT = 70;
const DEFAULT_WINDOW_SIZE = { width: 960, height: 640 };

const spawnPosition = (count) => ({
  x: 140 + (count % 6) * 32,
  y: MENU_BAR_HEIGHT + 32 + (count % 6) * 32,
});

export const useOSStore = create((set) => ({
  isLoggedIn: false,
  isSanctuary: false,
  toggleSanctuary: () => set((s) => ({ isSanctuary: !s.isSanctuary })),
  windows: [],
  activeWindowId: null,
  wallpaper: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
  browserUrl: null,
  browserState: {
    tabs: [
      { id: 1, url: 'https://search.aure', title: 'New Tab' }
    ],
    activeTabId: 1,
    nextTabId: 2,
    historyMap: { 1: { stack: ['https://search.aure'], index: 0 } },
  },

  setBrowserUrl: (url) => set((s) => {
    if (!url) return { browserUrl: null };
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }

    const tabs = s.browserState.tabs;
    const existing = tabs.find((t) => t.url === formattedUrl);
    let newTabs = tabs;
    let newActiveId = s.browserState.activeTabId;
    let newNextId = s.browserState.nextTabId;
    let newHistoryMap = s.browserState.historyMap;

    if (existing) {
      newActiveId = existing.id;
    } else {
      const newTab = { id: newNextId, url: formattedUrl, title: formattedUrl.replace(/^https?:\/\//, '').split('/')[0] };
      newTabs = [...tabs, newTab];
      newActiveId = newNextId;
      newNextId = newNextId + 1;
      newHistoryMap = {
        ...s.browserState.historyMap,
        [newActiveId]: { stack: [formattedUrl], index: 0 },
      };
    }

    return {
      browserUrl: formattedUrl,
      browserState: {
        ...s.browserState,
        tabs: newTabs,
        activeTabId: newActiveId,
        nextTabId: newNextId,
        historyMap: newHistoryMap,
      },
    };
  }),

  openBrowserTab: (url = 'https://search.aure', title = 'New Tab') => set((s) => {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }
    const tabs = s.browserState.tabs;
    const existing = tabs.find((t) => t.url === formattedUrl);
    if (existing) {
      return {
        browserState: {
          ...s.browserState,
          activeTabId: existing.id,
        },
      };
    }
    if (tabs.length >= 6) return s;
    const newTabId = s.browserState.nextTabId;
    const newTab = { id: newTabId, url: formattedUrl, title };
    return {
      browserState: {
        ...s.browserState,
        tabs: [...tabs, newTab],
        activeTabId: newTabId,
        nextTabId: newTabId + 1,
        historyMap: {
          ...s.browserState.historyMap,
          [newTabId]: { stack: [formattedUrl], index: 0 },
        },
      },
    };
  }),

  closeBrowserTab: (id) => set((s) => {
    const tabs = s.browserState.tabs;
    if (tabs.length <= 1) return s;
    const idx = tabs.findIndex((t) => t.id === id);
    const newTabs = tabs.filter((t) => t.id !== id);
    let newActiveId = s.browserState.activeTabId;
    if (id === s.browserState.activeTabId) {
      newActiveId = newTabs[Math.min(idx, newTabs.length - 1)].id;
    }
    return {
      browserState: {
        ...s.browserState,
        tabs: newTabs,
        activeTabId: newActiveId,
      },
    };
  }),

  setActiveBrowserTab: (id) => set((s) => ({
    browserState: {
      ...s.browserState,
      activeTabId: id,
    },
  })),

  navigateBrowserTab: (url, title = 'Browsing') => set((s) => {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }
    const activeTabId = s.browserState.activeTabId;
    const newTabs = s.browserState.tabs.map((t) =>
      t.id === activeTabId ? { ...t, url: formattedUrl, title } : t
    );
    const h = s.browserState.historyMap[activeTabId] || { stack: [], index: -1 };
    const newStack = h.stack.slice(0, h.index + 1).concat(formattedUrl);
    const newHistoryMap = {
      ...s.browserState.historyMap,
      [activeTabId]: { stack: newStack, index: newStack.length - 1 },
    };
    return {
      browserState: {
        ...s.browserState,
        tabs: newTabs,
        historyMap: newHistoryMap,
      },
    };
  }),

  goBrowserBack: () => set((s) => {
    const activeTabId = s.browserState.activeTabId;
    const h = s.browserState.historyMap[activeTabId];
    if (!h || h.index <= 0) return s;
    const newIndex = h.index - 1;
    const newUrl = h.stack[newIndex];
    const newTabs = s.browserState.tabs.map((t) =>
      t.id === activeTabId ? { ...t, url: newUrl } : t
    );
    return {
      browserState: {
        ...s.browserState,
        tabs: newTabs,
        historyMap: {
          ...s.browserState.historyMap,
          [activeTabId]: { ...h, index: newIndex },
        },
      },
    };
  }),

  goBrowserForward: () => set((s) => {
    const activeTabId = s.browserState.activeTabId;
    const h = s.browserState.historyMap[activeTabId];
    if (!h || h.index >= h.stack.length - 1) return s;
    const newIndex = h.index + 1;
    const newUrl = h.stack[newIndex];
    const newTabs = s.browserState.tabs.map((t) =>
      t.id === activeTabId ? { ...t, url: newUrl } : t
    );
    return {
      browserState: {
        ...s.browserState,
        tabs: newTabs,
        historyMap: {
          ...s.browserState.historyMap,
          [activeTabId]: { ...h, index: newIndex },
        },
      },
    };
  }),

  loginUser: (userData) =>
    set((s) => ({
      isLoggedIn: true,
      gameplay: {
        ...s.gameplay,
        player: {
          ...s.gameplay.player,
          name: userData.name || s.gameplay.player.name,
          clearanceLevel: userData.clearance || 1,
          credits: userData.credits !== undefined ? userData.credits : s.gameplay.player.credits,
          level: userData.level !== undefined ? userData.level : s.gameplay.player.level,
        },
      },
    })),

  logoutUser: () => set({ isLoggedIn: false }),

  // ------------------------------------------------------------------
  // Gameplay State Lane (Cross-App Progression & Mechanics)
  // ------------------------------------------------------------------
  gameplay: {
    sessions: {},
    activeGameId: null,
    prismCorruptionLevel: 14.8,
    claimedComms: [],
    timeSegmentIndex: 2, // 0: Morning, 1: Afternoon, 2: Evening, 3: Night
    timeCycleCount: 28,
    onboardingPhase: 1, // 1: Boot, 2: Emails Read, 3: Identity Verified, 4: Pulse Created, 5: Comms Unlocked, 6: Completed
    lockedApps: ['passport', 'pulse', 'comms'], // Apps locked until onboarding steps are completed
    identity: {
      fingerprint: false,
      facial: false,
      auraBaseline: false,
      citizenId: null,
      barcode: null,
      signalSignature: 'Aura-Code-Alpha',
      profileTags: ['#Netrunner', '#Scholar'],
      declaredRegion: 'Aureline Central',
    },
    pulseProfile: {
      displayName: null,
      houseTag: 'Vector',
      visibility: 'Public',
      theme: 'purple',
    },
    maiTone: null, // 'friendly' | 'neutral' | 'cold'
    player: {
      level: 1,
      credits: 500,
      xp: 0,
      rewardItems: [],
      completedQuests: [],
      hackedNodes: 0,
      auraHealth: 100,
      conditions: ['Veilwilt'],
      forgedSpells: [],
      lineageDecrypted: false,
      dgaVerified: false,
      npcVectors: {
        jeremie: { friendship: 60, trust: 75, rivalry: 10, sync: 80, corruption: 0 },
        sissi: { friendship: 30, trust: 40, rivalry: 75, sync: 40, corruption: 0 },
        aelita: { friendship: 85, trust: 90, rivalry: 5, sync: 85, corruption: 5 },
        odd: { friendship: 95, trust: 85, rivalry: 15, sync: 80, corruption: 0 },
        voss: { friendship: 50, trust: 80, rivalry: 20, sync: 90, corruption: 0 },
        riven: { friendship: 65, trust: 60, rivalry: 45, sync: 75, corruption: 10 },
        mara: { friendship: 55, trust: 75, rivalry: 30, sync: 65, corruption: 0 },
        tali: { friendship: 80, trust: 70, rivalry: 10, sync: 70, corruption: 0 },
        liora: { friendship: 40, trust: 50, rivalry: 65, sync: 55, corruption: 0 },
        ember: { friendship: 45, trust: 45, rivalry: 70, sync: 60, corruption: 0 },
        ulrich: { friendship: 50, trust: 55, rivalry: 80, sync: 70, corruption: 0 },
        franz: { friendship: 60, trust: 85, rivalry: 0, sync: 90, corruption: 15 },
        rowan: { friendship: 70, trust: 90, rivalry: 5, sync: 65, corruption: 0 },
        ilyra: { friendship: 75, trust: 85, rivalry: 0, sync: 75, corruption: 0 },
        maris: { friendship: 65, trust: 70, rivalry: 10, sync: 60, corruption: 0 },
        kael: { friendship: 55, trust: 65, rivalry: 25, sync: 70, corruption: 5 },
        nyx: { friendship: 20, trust: 40, rivalry: 50, sync: 45, corruption: 60 },
        null: { friendship: 10, trust: 30, rivalry: 60, sync: 30, corruption: 85 },
      },
      reputation: {
        campus: 50,
        dga: 40,
        faith: 50,
        archive: 30,
        vector: 35,
        delegation: 25,
        orynvell: 10,
      },
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
        medical: { rankIndex: 0, xp: 0, title: 'Faith Medical Healthcare & Diagnostics' },
        dga: { rankIndex: 0, xp: 0, title: 'DGA Security & Containment Ops' },
        gov: { rankIndex: 0, xp: 0, title: 'Governmental Civic Administration' },
      },
      starterPhase: 0,
      houseAffiliation: null,
      dormComfort: 50,
      starterCompletedLoops: [],
      currentMonthIndex: 2, // Default: March (Early Spring / Founding Day)
      dailyRewardLastClaimed: 0,
      worldEvents: [
        { id: 'EVT-MAR6', name: 'Founding Day Protocol (March 6)', monthReq: 'March', active: true, desc: 'Unlocks Orynvell archives, coronation lore, ceremonial quests, and hidden AETHERCORE records.', reward: 'Orynvell Key + 500 Credits' },
        { id: 'EVT-FLUX', name: 'Aura Flux Outbreak', monthReq: 'July', active: true, desc: 'Faith Medical diagnostic emergency. Triage student aura profiles and collect recovery materials.', reward: 'Faith Medical Commendation + 300 XP' },
        { id: 'EVT-HACK', name: 'Cyacademy Netrunner Hackathon', monthReq: 'All', active: true, desc: 'Competitive coding event with Credit prizes, Programming XP, and rare exploit tools.', reward: '400 Credits + Rare Exploit' },
        { id: 'EVT-LEAK', name: 'Purge Archive Leak', monthReq: 'November', active: true, desc: 'Lightborn genealogy history leak. Encrypted files appear in Central Library archives.', reward: 'Lineage Fragment #09' },
        { id: 'EVT-EXCH', name: 'Regional Exchange Week', monthReq: 'September', active: true, desc: 'Delegates from Fross, Lumia, Marlowe, Brisland, and Kaji visit Cyacademy.', reward: 'Regional Reputation Boost' }
      ],
      activities: missionsData,
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

  advanceTime: () =>
    set((state) => {
      const nextIndex = (state.gameplay.timeSegmentIndex + 1) % 4;
      const isNight = nextIndex === 3;
      const nextCycle = nextIndex === 0 ? state.gameplay.timeCycleCount + 1 : state.gameplay.timeCycleCount;
      const newCorruption = isNight
        ? Number((state.gameplay.prismCorruptionLevel + 5.0).toFixed(1))
        : state.gameplay.prismCorruptionLevel;
      const newAura = isNight
        ? Math.max(20, state.gameplay.player.auraHealth - 5)
        : state.gameplay.player.auraHealth;

      return {
        gameplay: {
          ...state.gameplay,
          timeSegmentIndex: nextIndex,
          timeCycleCount: nextCycle,
          prismCorruptionLevel: newCorruption,
          player: {
            ...state.gameplay.player,
            auraHealth: newAura,
          },
        },
      };
    }),

  restInDorm: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        timeSegmentIndex: 0, // Morning
        timeCycleCount: state.gameplay.timeCycleCount + 1,
        player: {
          ...state.gameplay.player,
          auraHealth: 100,
        },
      },
    })),

  updateNPCVector: (npcId, vectorName, delta) =>
    set((state) => {
      const current = state.gameplay.player.npcVectors[npcId] || { friendship: 50, trust: 50, rivalry: 0, sync: 50, corruption: 0 };
      const val = Math.max(0, Math.min(100, (current[vectorName] || 0) + delta));
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            npcVectors: {
              ...state.gameplay.player.npcVectors,
              [npcId]: {
                ...current,
                [vectorName]: val,
              },
            },
          },
        },
      };
    }),

  updateReputationTrack: (trackName, delta) =>
    set((state) => {
      const currentReps = state.gameplay.player.reputation || { campus: 50, dga: 40, faith: 50, archive: 30, vector: 35, delegation: 25, orynvell: 10 };
      const val = Math.max(0, Math.min(100, (currentReps[trackName] || 0) + delta));
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            reputation: {
              ...currentReps,
              [trackName]: val,
            },
          },
        },
      };
    }),

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

  completeActivity: (id) =>
    set((state) => {
      const activities = state.gameplay.player.activities || [];
      const item = activities.find((a) => a.id === id);
      if (!item || item.status !== 'IN_PROGRESS') return state;

      const newActivities = activities.map((a) =>
        a.id === id ? { ...a, status: 'COMPLETED' } : a
      );

      const addedCredits = Number(item.rewards?.credits ?? item.credits ?? 0);
      const addedXP = Number(item.rewards?.xp ?? item.xp ?? 0);
      const rewardItem = item.rewards?.item ?? item.item;
      const rewardItems = state.gameplay.player.rewardItems || [];
      const newXP = state.gameplay.player.xp + addedXP;
      const newLevel = Math.floor(newXP / 100) + 1;

      let newLocked = state.gameplay.lockedApps || [];
      const unlockApp = item.rewards?.unlockApp ?? item.unlockApp;
      if (unlockApp && newLocked.includes(unlockApp)) {
        newLocked = newLocked.filter((app) => app !== unlockApp);
      }

      return {
        gameplay: {
          ...state.gameplay,
          lockedApps: newLocked,
          player: {
            ...state.gameplay.player,
            credits: state.gameplay.player.credits + addedCredits,
            xp: newXP,
            level: newLevel,
            rewardItems: rewardItem && !rewardItems.includes(rewardItem)
              ? [...rewardItems, rewardItem]
              : rewardItems,
            activities: newActivities,
          },
        },
      };
    }),

  claimCommsAttachment: (commId, credits, xp) =>
    set((state) => {
      if (state.gameplay.claimedComms.includes(commId)) return state;
      const newXP = state.gameplay.player.xp + (xp || 50);
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        gameplay: {
          ...state.gameplay,
          claimedComms: [...state.gameplay.claimedComms, commId],
          player: {
            ...state.gameplay.player,
            credits: state.gameplay.player.credits + (credits || 100),
            xp: newXP,
            level: newLevel,
          },
        },
      };
    }),

  advanceAppRank: (appKey) =>
    set((state) => {
      const currentRanks = state.gameplay.appRanks || { explorer: 1, weaver: 1, investigator: 1, research: 1, influence: 1, clearance: 1 };
      const currentRank = currentRanks[appKey] || 1;
      if (currentRank >= 5) return state;
      const nextRank = currentRank + 1;
      const addedXP = nextRank * 50;
      const newXP = state.gameplay.player.xp + addedXP;
      const newLevel = Math.floor(newXP / 100) + 1;

      return {
        gameplay: {
          ...state.gameplay,
          appRanks: {
            ...currentRanks,
            [appKey]: nextRank,
          },
          player: {
            ...state.gameplay.player,
            xp: newXP,
            level: newLevel,
          },
        },
      };
    }),

  completeStarterLoop: (loopKey) =>
    set((state) => {
      const completed = state.gameplay.starterCompletedLoops || [];
      if (completed.includes(loopKey)) return state;
      const addedCredits = 150;
      const addedXP = 100;
      const newXP = state.gameplay.player.xp + addedXP;
      const newLevel = Math.floor(newXP / 100) + 1;

      return {
        gameplay: {
          ...state.gameplay,
          starterCompletedLoops: [...completed, loopKey],
          player: {
            ...state.gameplay.player,
            credits: state.gameplay.player.credits + addedCredits,
            xp: newXP,
            level: newLevel,
          },
        },
      };
    }),

  purgePrismCorruption: (amount) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        prismCorruptionLevel: Math.max(2.0, Number((state.gameplay.prismCorruptionLevel - amount).toFixed(1))),
      },
    })),

  verifyDGAIdentity: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        lockedApps: state.gameplay.lockedApps.filter((a) => a !== 'passport' && a !== 'pulse'),
        player: {
          ...state.gameplay.player,
          dgaVerified: true,
          starterPhase: Math.max(1, state.gameplay.player.starterPhase),
        },
      },
    })),

  unlockApp: (appId) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        lockedApps: state.gameplay.lockedApps.filter((a) => a !== appId),
      },
    })),

  completeIdentityScan: (data) =>
    set((state) => {
      const newLocked = state.gameplay.lockedApps.filter((a) => a !== 'passport' && a !== 'pulse');
      return {
        gameplay: {
          ...state.gameplay,
          lockedApps: newLocked,
          onboardingPhase: Math.max(3, state.gameplay.onboardingPhase),
          identity: {
            ...state.gameplay.identity,
            ...data,
            citizenId: data.citizenId || `CY-${Math.floor(1000 + Math.random() * 9000)}-CITIZEN`,
            barcode: data.barcode || `||| |||| || ||| ${Math.floor(100000 + Math.random() * 900000)}`,
          },
          player: {
            ...state.gameplay.player,
            dgaVerified: true,
            credits: state.gameplay.player.credits + 150,
            xp: state.gameplay.player.xp + 100,
            activities: state.gameplay.player.activities.map((act) => {
              if (act.id === 'Q_DAY1_3') return { ...act, status: 'COMPLETED' };
              if (act.id === 'Q_DAY1_4') return { ...act, status: 'IN_PROGRESS' };
              return act;
            }),
          },
        },
      };
    }),

  createPulseProfile: (profileData) =>
    set((state) => {
      const newLocked = state.gameplay.lockedApps.filter((a) => a !== 'pulse' && a !== 'comms');
      return {
        gameplay: {
          ...state.gameplay,
          lockedApps: newLocked,
          onboardingPhase: Math.max(4, state.gameplay.onboardingPhase),
          pulseProfile: {
            ...state.gameplay.pulseProfile,
            ...profileData,
          },
          player: {
            ...state.gameplay.player,
            credits: state.gameplay.player.credits + 100,
            xp: state.gameplay.player.xp + 75,
            activities: state.gameplay.player.activities.map((act) => {
              if (act.id === 'Q_DAY1_4') return { ...act, status: 'COMPLETED' };
              if (act.id === 'Q_DAY1_5') return { ...act, status: 'IN_PROGRESS' };
              return act;
            }),
          },
        },
      };
    }),

  selectMAITone: (tone) =>
    set((state) => {
      let trustDelta = 0;
      let friendshipDelta = 0;
      let rivalryDelta = 0;
      if (tone === 'friendly') { trustDelta = 15; friendshipDelta = 20; }
      else if (tone === 'neutral') { trustDelta = 5; }
      else if (tone === 'cold') { rivalryDelta = 25; trustDelta = -10; }

      return {
        gameplay: {
          ...state.gameplay,
          maiTone: tone,
          onboardingPhase: Math.max(5, state.gameplay.onboardingPhase),
          player: {
            ...state.gameplay.player,
            xp: state.gameplay.player.xp + 100,
            npcVectors: {
              ...state.gameplay.player.npcVectors,
              jeremie: {
                ...state.gameplay.player.npcVectors.jeremie,
                trust: Math.min(100, Math.max(0, state.gameplay.player.npcVectors.jeremie.trust + trustDelta)),
                friendship: Math.min(100, Math.max(0, state.gameplay.player.npcVectors.jeremie.friendship + friendshipDelta)),
                rivalry: Math.min(100, Math.max(0, state.gameplay.player.npcVectors.jeremie.rivalry + rivalryDelta)),
              },
            },
            activities: state.gameplay.player.activities.map((act) => {
              if (act.id === 'Q_DAY1_5') return { ...act, status: 'COMPLETED' };
              return act;
            }),
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

  setHouseAffiliation: (house) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          houseAffiliation: house,
        },
      },
    })),

  completeStarterLoop: (loopId) =>
    set((state) => {
      const current = state.gameplay.player.starterCompletedLoops || [];
      if (current.includes(loopId)) return state;
      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            starterCompletedLoops: [...current, loopId],
            xp: state.gameplay.player.xp + 25,
            credits: state.gameplay.player.credits + 50,
          },
        },
      };
    }),

  updateActivityStatus: (activityId, status) =>
    set((state) => {
      const allowedStatuses = ['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED'];
      if (!allowedStatuses.includes(status)) return state;

      const activities = state.gameplay.player.activities || [];
      const activity = activities.find((act) => act.id === activityId);
      if (!activity || activity.status === 'COMPLETED' || status === 'COMPLETED') return state;

      return {
        gameplay: {
          ...state.gameplay,
          player: {
            ...state.gameplay.player,
            activities: activities.map((act) =>
              act.id === activityId ? { ...act, status } : act
            ),
          },
        },
      };
    }),

  setMonth: (monthIndex) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          currentMonthIndex: (monthIndex + 12) % 12,
        },
      },
    })),

  advanceMonth: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          currentMonthIndex: ((state.gameplay.player.currentMonthIndex || 0) + 1) % 12,
        },
      },
    })),

  claimDailyReward: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          credits: state.gameplay.player.credits + 200,
          xp: state.gameplay.player.xp + 100,
          dailyRewardLastClaimed: Date.now(),
        },
      },
    })),

  joinWorldEvent: (eventId) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        player: {
          ...state.gameplay.player,
          credits: state.gameplay.player.credits + 300,
          xp: state.gameplay.player.xp + 150,
        },
      },
    })),

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
    const maxZ = Math.max(100, ...state.windows.map((w) => w.zIndex || 100));
    const existing = state.windows.find((w) => w.id === app.id);
    if (existing) {
      return {
        windows: state.windows.map((w) =>
          w.id === app.id ? { ...w, size: DEFAULT_WINDOW_SIZE, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        activeWindowId: app.id,
      };
    }

    const newWindow = {
      title: app.title,
      contentKey: app.contentKey,
      ...app,
      id: app.id || Math.random().toString(36).substr(2, 9),
      zIndex: maxZ + 1,
      isMinimized: false,
      isMaximized: app.isMaximized ?? false,
      position: app.position || spawnPosition(state.windows.length),
      windowOffset: { x: 0, y: 0 },
      size: app.size || DEFAULT_WINDOW_SIZE,
    };
    return {
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    };
  }),

  toggleApp: (app) => set((state) => {
    const maxZ = Math.max(100, ...state.windows.map((w) => w.zIndex || 100));
    const existing = state.windows.find((w) => w.id === app.id);
    if (existing) {
      if (state.activeWindowId === app.id && !existing.isMinimized) {
        return {
          windows: state.windows.map((w) =>
            w.id === app.id ? { ...w, isMinimized: true } : w
          ),
          activeWindowId: state.windows.filter((w) => w.id !== app.id && !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null,
        };
      }
      return {
        windows: state.windows.map((w) =>
          w.id === app.id ? { ...w, size: DEFAULT_WINDOW_SIZE, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        activeWindowId: app.id,
      };
    }

    const newWindow = {
      title: app.title,
      contentKey: app.contentKey,
      ...app,
      id: app.id || Math.random().toString(36).substr(2, 9),
      zIndex: maxZ + 1,
      isMinimized: false,
      isMaximized: app.isMaximized ?? false,
      position: app.position || spawnPosition(state.windows.length),
      windowOffset: { x: 0, y: 0 },
      size: app.size || DEFAULT_WINDOW_SIZE,
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
    const maxZ = Math.max(100, ...state.windows.map((w) => w.zIndex || 100));
    return {
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size: DEFAULT_WINDOW_SIZE, zIndex: maxZ + 1, isMinimized: false } : w
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
      w.id === id ? { ...w, windowOffset: position } : w
    ),
  })),

  clearActive: () => set({ activeWindowId: null }),

  setWallpaper: (url) => set({ wallpaper: url }),
}));
