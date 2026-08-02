// src/components/ClockDisplay.jsx
import { useTimeStore } from '../utils/timeEngine';

export default function ClockDisplay() {
  const currentTime = useTimeStore((s) => s.currentTime);
  const day = useTimeStore((s) => s.day);
  const season = useTimeStore((s) => s.season);

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-white/80">
      <span>{season ? season.toUpperCase() : 'WINTER'}</span>
      <span>Day {day}</span>
      <span>{currentTime}</span>
    </div>
  );
}
