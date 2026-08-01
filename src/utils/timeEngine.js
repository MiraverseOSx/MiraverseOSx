// src/utils/timeEngine.js
import create from 'zustand';

// Define seasons
const SEASONS = ['winter', 'spring', 'summer', 'fall'];

export const useTimeStore = create((set, get) => ({
  // In‑game minutes (0‑1439 for a 24‑hour day)
  minutes: 0,
  day: 1,
  seasonIndex: 0, // 0 = winter
  speed: 1, // multiplier: real seconds per in‑game minute
  paused: false,

  // Get derived values
  get currentTime() {
    const hrs = Math.floor(this.minutes / 60);
    const mins = this.minutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },
  get season() {
    return SEASONS[this.seasonIndex];
  },

  // Actions
  tick() {
    if (get().paused) return;
    set(state => {
      let newMinutes = state.minutes + 1 * state.speed;
      let newDay = state.day;
      let newSeasonIdx = state.seasonIndex;

      if (newMinutes >= 1440) {
        newMinutes = newMinutes % 1440;
        newDay += 1;
        // Advance season every 30 days (example)
        if (newDay % 30 === 0) {
          newSeasonIdx = (state.seasonIndex + 1) % SEASONS.length;
        }
      }

      return {
        minutes: newMinutes,
        day: newDay,
        seasonIndex: newSeasonIdx,
      };
    });
  },
  setSpeed(newSpeed) {
    set({ speed: newSpeed });
  },
  pause() {
    set({ paused: true });
  },
  resume() {
    set({ paused: false });
  },
}));
