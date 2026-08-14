// src/utils/timeEngine.ts
import { create } from 'zustand';

export interface TimeState {
  minutes: number;
  day: number;
  currentTime: string;
  speed: number;
  paused: boolean;
  _intervalId: number | NodeJS.Timeout | null;

  start: () => void;
  stop: () => void;
  tick: () => void;
  setSpeed: (newSpeed: number) => void;
  pause: () => void;
  resume: () => void;
}

const formatTime = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const useTimeStore = create<TimeState>((set, get) => ({
  minutes: 0,
  day: 1,
  currentTime: '00:00',
  speed: 1,
  paused: false,
  _intervalId: null,

  start: () => {
    const existing = get()._intervalId;
    if (existing) return; // already running
    const id = setInterval(() => {
      get().tick();
    }, 1000); // tick once per second
    set({ _intervalId: id });
  },

  stop: () => {
    const id = get()._intervalId;
    if (id) clearInterval(id as number);
    set({ _intervalId: null });
  },

  tick: () => {
    if (get().paused) return;
    set((state) => {
      let newMinutes = state.minutes + 1 * state.speed;
      let newDay = state.day;

      if (newMinutes >= 1440) {
        newMinutes = newMinutes % 1440;
        newDay += 1;
      }

      return {
        minutes: newMinutes,
        day: newDay,
        currentTime: formatTime(newMinutes),
      };
    });
  },
  setSpeed: (newSpeed: number) => set({ speed: newSpeed }),
  pause: () => set({ paused: true }),
  resume: () => set({ paused: false }),
}));
