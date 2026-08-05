// src/components/ClockDisplay.jsx
import { useEffect } from 'react';
import { useTimeStore } from '../utils/timeEngine';

const MONTH_TO_SEASON = {
  0: 'MID-WINTER',    // January
  1: 'LATE WINTER',   // February
  2: 'EARLY SPRING',  // March
  3: 'MID-SPRING',    // April
  4: 'LATE SPRING',   // May
  5: 'EARLY SUMMER',  // June
  6: 'MID-SUMMER',    // July
  7: 'LATE SUMMER',   // August
  8: 'EARLY AUTUMN',  // September
  9: 'MID-AUTUMN',    // October
  10: 'LATE AUTUMN',  // November
  11: 'EARLY WINTER', // December
};

export default function ClockDisplay({ monthIndex = 2 }) {
  const currentTime = useTimeStore((s) => s.currentTime);
  const day = useTimeStore((s) => s.day);
  const start = useTimeStore((s) => s.start);

  // Start the clock engine on mount
  useEffect(() => {
    start();
    return () => useTimeStore.getState().stop();
  }, [start]);

  const season = MONTH_TO_SEASON[monthIndex] || 'SPRING';

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-white/80">
      <span>{season}</span>
      <span>Day {day}</span>
      <span>{currentTime}</span>
    </div>
  );
}
