/**
 * Session Logger
 * Logs events with timestamps, session IDs, and confidence values.
 * All data is session-scoped — nothing persists beyond the session.
 */

export type EventType =
  | "session_start"
  | "session_end"
  | "person_entered"
  | "person_exited"
  | "attendance_marked"
  | "violation_detected"
  | "face_count_change"
  | "prohibited_object"
  | "movement_alert"
  | "gaze_deviation"
  | "system_info";

export type EventSeverity = "info" | "low" | "medium" | "high";

export interface SessionEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  timeFormatted: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

let eventCounter = 0;

function generateEventId(): string {
  return `evt_${++eventCounter}_${Date.now()}`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export class SessionLogger {
  private sessionId: string;
  private events: SessionEvent[] = [];
  private maxEvents: number;
  private listeners: Set<(event: SessionEvent) => void> = new Set();

  constructor(maxEvents = 500) {
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.maxEvents = maxEvents;
  }

  log(
    type: EventType,
    severity: EventSeverity,
    title: string,
    description: string,
    metadata?: Record<string, unknown>
  ): SessionEvent {
    const now = Date.now();
    const event: SessionEvent = {
      id: generateEventId(),
      sessionId: this.sessionId,
      timestamp: now,
      timeFormatted: formatTime(now),
      type,
      severity,
      title,
      description,
      metadata,
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    this.listeners.forEach((fn) => fn(event));
    return event;
  }

  onEvent(fn: (event: SessionEvent) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getEvents(): SessionEvent[] {
    return [...this.events];
  }

  getEventsByType(type: EventType): SessionEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  getEventsBySeverity(severity: EventSeverity): SessionEvent[] {
    return this.events.filter((e) => e.severity === severity);
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getSessionDurationMs(): number {
    if (this.events.length === 0) return 0;
    return Date.now() - this.events[0].timestamp;
  }

  clear(): void {
    this.events = [];
    eventCounter = 0;
  }
}
