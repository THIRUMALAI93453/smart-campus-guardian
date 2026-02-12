/**
 * Attendance Rule Engine
 * Applies rule-based logic on top of tracking data to determine
 * attendance status, presence duration, and class stability.
 */

import type { TrackedObject } from "../tracker";

export interface AttendeeRecord {
  trackId: string;
  status: "present" | "absent" | "unstable";
  presenceDurationMs: number;
  firstSeenMs: number;
  lastSeenMs: number;
  disappearanceCount: number;
  isCurrentlyVisible: boolean;
}

export interface AttendanceSnapshot {
  totalDetected: number;
  presentCount: number;
  absentCount: number;
  unstableCount: number;
  attendees: AttendeeRecord[];
  classStability: "stable" | "moderate" | "unstable";
  sessionDurationMs: number;
}

interface AttendanceConfig {
  /** Minimum presence duration (ms) to be marked "Present" */
  minPresenceDurationMs: number;
  /** Max disappearance count before marking "Unstable" */
  maxDisappearanceCount: number;
  /** Threshold for class instability (fraction of unstable attendees) */
  instabilityThreshold: number;
}

const DEFAULT_CONFIG: AttendanceConfig = {
  minPresenceDurationMs: 10_000, // 10 seconds
  maxDisappearanceCount: 5,
  instabilityThreshold: 0.3,
};

export class AttendanceRuleEngine {
  private config: AttendanceConfig;
  private records: Map<string, AttendeeRecord> = new Map();
  private sessionStartMs: number = Date.now();
  private previousActiveIds: Set<string> = new Set();

  constructor(config: Partial<AttendanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Process tracked objects and return attendance snapshot.
   * Returns entry/exit events for the logger.
   */
  process(
    tracks: TrackedObject[]
  ): {
    snapshot: AttendanceSnapshot;
    entries: string[]; // trackIds that just entered
    exits: string[]; // trackIds that just exited
  } {
    const personTracks = tracks.filter((t) => t.label === "person");
    const currentActiveIds = new Set(
      personTracks.filter((t) => t.isActive).map((t) => t.trackId)
    );

    const entries: string[] = [];
    const exits: string[] = [];

    // Update records for all person tracks
    for (const track of personTracks) {
      let record = this.records.get(track.trackId);

      if (!record) {
        record = {
          trackId: track.trackId,
          status: "absent",
          presenceDurationMs: 0,
          firstSeenMs: track.firstSeenMs,
          lastSeenMs: track.lastSeenMs,
          disappearanceCount: 0,
          isCurrentlyVisible: track.isActive,
        };
        this.records.set(track.trackId, record);
      }

      record.presenceDurationMs = track.lastSeenMs - track.firstSeenMs;
      record.lastSeenMs = track.lastSeenMs;
      record.isCurrentlyVisible = track.isActive;

      // Detect disappearance transitions
      if (this.previousActiveIds.has(track.trackId) && !track.isActive) {
        record.disappearanceCount++;
      }

      // Apply rules
      if (record.disappearanceCount >= this.config.maxDisappearanceCount) {
        record.status = "unstable";
      } else if (record.presenceDurationMs >= this.config.minPresenceDurationMs) {
        record.status = "present";
      } else {
        record.status = "absent";
      }
    }

    // Detect entries and exits
    for (const id of currentActiveIds) {
      if (!this.previousActiveIds.has(id)) entries.push(id);
    }
    for (const id of this.previousActiveIds) {
      if (!currentActiveIds.has(id)) exits.push(id);
    }

    this.previousActiveIds = currentActiveIds;

    // Build snapshot
    const attendees = Array.from(this.records.values());
    const presentCount = attendees.filter((a) => a.status === "present").length;
    const unstableCount = attendees.filter((a) => a.status === "unstable").length;
    const absentCount = attendees.filter((a) => a.status === "absent").length;

    const unstableRatio = attendees.length > 0 ? unstableCount / attendees.length : 0;
    const classStability: AttendanceSnapshot["classStability"] =
      unstableRatio > this.config.instabilityThreshold
        ? "unstable"
        : unstableRatio > 0.1
        ? "moderate"
        : "stable";

    return {
      snapshot: {
        totalDetected: attendees.length,
        presentCount,
        absentCount,
        unstableCount,
        attendees,
        classStability,
        sessionDurationMs: Date.now() - this.sessionStartMs,
      },
      entries,
      exits,
    };
  }

  reset(): void {
    this.records.clear();
    this.previousActiveIds.clear();
    this.sessionStartMs = Date.now();
  }
}
