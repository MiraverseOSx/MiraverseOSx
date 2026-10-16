export interface TimeState {
  realTime: string;
  localTime: string;
  utcTime: string;
  sessionStartTime: string;
  lastActiveTime: string;
  elapsedSessionSeconds: number;
}

export function getCurrentTimeState(sessionStartTime?: string): TimeState {
  const now = new Date();
  const start = sessionStartTime ? new Date(sessionStartTime) : now;
  const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);

  return {
    realTime: now.toISOString(),
    localTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    utcTime: now.toISOString().slice(11, 19) + ' UTC',
    sessionStartTime: start.toISOString(),
    lastActiveTime: now.toISOString(),
    elapsedSessionSeconds: Math.max(0, elapsed)
  };
}

export function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  } catch {
    return isoString;
  }
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function calculateOfflineGap(lastActiveAt: string): {
  isOfflineGap: boolean;
  elapsedMs: number;
  elapsedFormatted: string;
} {
  try {
    const last = new Date(lastActiveAt).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - last);

    // Consider offline gap if inactive for more than 3 minutes
    const isOfflineGap = diff >= 3 * 60 * 1000;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let elapsedFormatted = `${minutes}m`;
    if (hours > 0) {
      elapsedFormatted = `${hours}h ${minutes}m`;
    }

    return {
      isOfflineGap,
      elapsedMs: diff,
      elapsedFormatted
    };
  } catch {
    return { isOfflineGap: false, elapsedMs: 0, elapsedFormatted: '0m' };
  }
}
