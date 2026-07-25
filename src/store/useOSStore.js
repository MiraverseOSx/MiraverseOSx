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

  addWindow: (app) => set((state) => {
    // If the app already has a window, just focus/restore it.
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
      zIndex: state.windows.length + 10, // Start with a buffer
      isMinimized: false,
      isMaximized: false,
      position: app.position || spawnPosition(state.windows.length),
      size: app.size || { width: 640, height: 440 },
    };
    return {
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    };
  }),

  toggleApp: (app) => set((state) => {
    const existing = state.windows.find((w) => w.id === app.id);
    if (existing) {
      // If the app is open and currently active, pressing its button closes it
      if (state.activeWindowId === app.id && !existing.isMinimized) {
        const remaining = state.windows.filter((w) => w.id !== app.id);
        return {
          windows: remaining,
          activeWindowId:
            remaining.slice().sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null,
        };
      }
      // If it's minimized or behind another window, focus & unminimize it
      const maxZ = Math.max(0, ...state.windows.map((w) => w.zIndex));
      return {
        windows: state.windows.map((w) =>
          w.id === app.id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        activeWindowId: app.id,
      };
    }

    // App is not open yet, create and open it
    const newWindow = {
      title: app.title,
      contentKey: app.contentKey,
      ...app,
      id: app.id || Math.random().toString(36).substr(2, 9),
      zIndex: state.windows.length + 10,
      isMinimized: false,
      isMaximized: false,
      position: app.position || spawnPosition(state.windows.length),
      size: app.size || { width: 640, height: 440 },
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

  // Persist a window's position after the user drags it.
  moveWindow: (id, position) => set((state) => ({
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, position } : w
    ),
  })),

  clearActive: () => set({ activeWindowId: null }),

  setWallpaper: (url) => set({ wallpaper: url }),
}));
