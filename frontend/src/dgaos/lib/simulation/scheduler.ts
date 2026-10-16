import { ScheduledEvent, ScheduledEventType } from '@/lib/dga-types';

export function createScheduledEvent(
  type: ScheduledEventType,
  delaySeconds: number,
  payload: Record<string, unknown> = {},
  caseId?: string,
  actorId?: string
): ScheduledEvent {
  const now = new Date();
  const scheduledTime = new Date(now.getTime() + delaySeconds * 1000);

  return {
    id: `SCHED-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    caseId,
    actorId,
    createdAt: now.toISOString(),
    scheduledAt: scheduledTime.toISOString(),
    status: 'scheduled',
    payload
  };
}

export function filterDueEvents(
  events: ScheduledEvent[],
  targetTimeMs: number = Date.now()
): { due: ScheduledEvent[]; remaining: ScheduledEvent[] } {
  const due: ScheduledEvent[] = [];
  const remaining: ScheduledEvent[] = [];

  for (const ev of events) {
    if (ev.status === 'scheduled') {
      const scheduledTime = new Date(ev.scheduledAt).getTime();
      if (scheduledTime <= targetTimeMs) {
        due.push({ ...ev, status: 'triggered' });
      } else {
        remaining.push(ev);
      }
    } else {
      // keep non-scheduled for history or drop if expired
      remaining.push(ev);
    }
  }

  return { due, remaining };
}
