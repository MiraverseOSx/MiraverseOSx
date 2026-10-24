export type DGAEventType =
  | 'CASE_CREATED'
  | 'CASE_STATUS_CHANGED'
  | 'STATUS_CHANGED'
  | 'OBJECTIVE_COMPLETED'
  | 'TASK_COMPLETED'
  | 'TASK_CREATED'
  | 'FORENSIC_REQUEST_CREATED'
  | 'EVIDENCE_LOGGED'
  | 'TRACE_EXAM_COMPLETE'
  | 'FORENSIC_RESULT'
  | 'COMMUNICATION_RECEIVED'
  | 'COMMUNICATION_ATTACHED_TO_CASE'
  | 'ALERT_DISMISSED'
  | 'WORKSTATION_LOCK_TOGGLED'
  | 'NOTE_ADDED'
  | 'WORLD_RESET'
  | 'SYSTEM_CASE_RECEIVED'
  | 'SYSTEM_REQUEST_CREATED'
  | 'SYSTEM_REQUEST_UPDATED'
  | 'SYSTEM_FINDING_RETURNED'
  | 'SYSTEM_DOCUMENT_ATTACHED'
  | 'SYSTEM_CASE_UPDATED'
  | 'SYSTEM_SIGNAL'
  | 'EVIDENCE_OPENED'
  | 'INCOMING_CALL_TRIGGERED'
  | 'CALL_MISSED'
  | 'VOICEMAIL_RECEIVED'
  | 'VOICEMAIL_LISTENED'
  | 'DOCUMENT_ANALYZED'
  | 'CASE_CLOSURE_REVIEW_INITIATED';

export interface DGAEvent<T = any> {
  id: string;
  type: DGAEventType;
  caseId?: string;
  timestamp: string;
  actor: string;
  payload: T;
}

export type DGAEventInput<T = any> = Omit<DGAEvent<T>, 'id' | 'timestamp'> & { timestamp?: string; id?: string };

type EventListener<T = any> = (event: DGAEvent<T>) => void;

class DGAEventBus {
  private listeners: Map<DGAEventType | '*', Set<EventListener>> = new Map();
  private history: DGAEvent[] = [];
  private maxHistory: number = 100;

  /**
   * Subscribe to a specific event type or '*' for all events.
   * Returns an unsubscribe function.
   */
  subscribe<T = any>(type: DGAEventType | '*', listener: EventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener as EventListener);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(listener as EventListener);
      }
    };
  }

  /**
   * Emit an event across the workstation bus.
   */
  emit<T = any>(eventInput: Omit<DGAEvent<T>, 'id' | 'timestamp'> & { timestamp?: string; id?: string }): DGAEvent<T> {
    const event: DGAEvent<T> = {
      id: eventInput.id || `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: eventInput.timestamp || new Date().toISOString(),
      ...eventInput
    };

    // Store in history
    this.history.unshift(event);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // Notify specific listeners
    const specificListeners = this.listeners.get(event.type);
    if (specificListeners) {
      specificListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error(`[DGA-EVENT-BUS] Error in listener for ${event.type}:`, err);
        }
      });
    }

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error(`[DGA-EVENT-BUS] Error in wildcard listener for ${event.type}:`, err);
        }
      });
    }

    return event;
  }

  getHistory(): DGAEvent[] {
    return [...this.history];
  }
}

// Global Singleton Event Bus
export const dgaEventBus = new DGAEventBus();

export function emitDgaEvent<T = any>(
  eventInput: Omit<DGAEvent<T>, 'id' | 'timestamp'> & { timestamp?: string; id?: string }
): DGAEvent<T> {
  return dgaEventBus.emit<T>(eventInput);
}

export function subscribeDgaEvent<T = any>(
  type: DGAEventType | '*',
  listener: EventListener<T>
): () => void {
  return dgaEventBus.subscribe<T>(type, listener);
}
