// src/components/ClockDisplay.jsx
import { useTimeStore } from '../utils/timeEngine';

export default function ClockDisplay() {
  const { currentTime, day, season } = useTimeStore(state => ({
    currentTime: state.currentTime,
    day: state.day,
    season: state.season,
  }));

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-white/80">
      <span>{season.toUpperCase()}</span>
      <span>Day {day}</span>
      <span>{currentTime}</span>
    </div>
  );
}
