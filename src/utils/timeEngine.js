// src/utils/timeEngine.js
import { create } from 'zustand';

export const SEASONS = ['winter', 'spring', 'summer', 'fall'];

const formatTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const useTimeStore = create((set, get) => ({
  minutes: 0,
  day: 1,
  seasonIndex: 0,
  season: SEASONS[0],
  currentTime: '00:00',
  speed: 1,
  paused: false,

  tick: () => {
    if (get().paused) return;
    set((state) => {
      let newMinutes = state.minutes + 1 * state.speed;
      let newDay = state.day;
      let newSeasonIdx = state.seasonIndex;

      if (newMinutes >= 1440) {
        newMinutes = newMinutes % 1440;
        newDay += 1;
        if (newDay % 30 === 0) {
          newSeasonIdx = (state.seasonIndex + 1) % SEASONS.length;
        }
      }

      return {
        minutes: newMinutes,
        day: newDay,
        seasonIndex: newSeasonIdx,
        season: SEASONS[newSeasonIdx],
        currentTime: formatTime(newMinutes),
      };
    });
  },
  setSpeed: (newSpeed) => set({ speed: newSpeed }),
  pause: () => set({ paused: true }),
  resume: () => set({ paused: false }),
}));
