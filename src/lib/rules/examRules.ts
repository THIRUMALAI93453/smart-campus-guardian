/**
 * Exam Malpractice Rule Engine
 * Detects violations based on detection data using temporal analysis
 * and rule-based logic. No automated punishment — advisory only.
 */

import type { TrackedObject } from "../tracker";
import type { Detection } from "../detection";

export type ViolationType =
  | "multiple_faces"
  | "no_face"
  | "unauthorized_person"
  | "prohibited_object"
  | "excessive_movement"
  | "candidate_absent";

export interface Violation {
  id: string;
  type: ViolationType;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  timestamp: number;
  timeFormatted: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export type ExamMode = "single" | "multi";

interface ExamConfig {
  mode: ExamMode;
  /** Expected candidate count (for multi mode) */
  expectedCandidates: number;
  /** Frames of no-face before flagging absence */
  absenceFrameThreshold: number;
  /** Frames of extra faces before flagging violation */
  extraFaceFrameThreshold: number;
  /** Prohibited COCO-SSD labels */
  prohibitedObjects: string[];
  /** Movement threshold (pixel distance between frames) */
  movementThreshold: number;
  /** Consecutive movement frames to trigger alert */
  movementFrameThreshold: number;
}

const DEFAULT_CONFIG: ExamConfig = {
  mode: "single",
  expectedCandidates: 1,
  absenceFrameThreshold: 15, // ~0.5s at 30fps
  extraFaceFrameThreshold: 10,
  prohibitedObjects: ["cell phone", "book", "laptop"],
  movementThreshold: 80,
  movementFrameThreshold: 20,
};

let violationCounter = 0;

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export class ExamRuleEngine {
  private config: ExamConfig;
  private noFaceFrames = 0;
  private extraFaceFrames = 0;
  private movementFrames = 0;
  private lastCentroids: Map<string, [number, number]> = new Map();
  private recentViolations: Violation[] = [];
  private cooldowns: Map<ViolationType, number> = new Map();
  private readonly COOLDOWN_MS = 5000; // Don't repeat same violation type within 5s

  constructor(config: Partial<ExamConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setMode(mode: ExamMode, expectedCandidates = 1): void {
    this.config.mode = mode;
    this.config.expectedCandidates = mode === "single" ? 1 : expectedCandidates;
  }

  /**
   * Analyze current frame tracks and raw detections.
   * Returns new violations (if any) for this frame.
   */
  analyze(
    tracks: TrackedObject[],
    detections: Detection[]
  ): Violation[] {
    const now = Date.now();
    const violations: Violation[] = [];
    const personTracks = tracks.filter((t) => t.label === "person" && t.isActive);
    const personCount = personTracks.length;
    const expected = this.config.expectedCandidates;

    // --- Rule 1: Face/Person count ---
    if (personCount === 0) {
      this.noFaceFrames++;
      this.extraFaceFrames = 0;
      if (this.noFaceFrames >= this.config.absenceFrameThreshold) {
        const v = this.createViolation(
          "candidate_absent",
          "high",
          "Candidate Absent",
          `No person detected for ${this.noFaceFrames} consecutive frames. Candidate may have left the exam area.`,
          0,
          now
        );
        if (v) violations.push(v);
      }
    } else if (this.config.mode === "single" && personCount > expected) {
      this.noFaceFrames = 0;
      this.extraFaceFrames++;
      if (this.extraFaceFrames >= this.config.extraFaceFrameThreshold) {
        const v = this.createViolation(
          "multiple_faces",
          "high",
          "Multiple Persons Detected",
          `${personCount} persons detected in single-candidate exam. Expected ${expected}. Possible unauthorized assistance.`,
          Math.max(...personTracks.map((t) => t.confidence)),
          now,
          { detected: personCount, expected }
        );
        if (v) violations.push(v);
      }
    } else if (this.config.mode === "multi" && personCount > expected + 1) {
      this.noFaceFrames = 0;
      this.extraFaceFrames++;
      if (this.extraFaceFrames >= this.config.extraFaceFrameThreshold) {
        const v = this.createViolation(
          "unauthorized_person",
          "medium",
          "Unauthorized Person Detected",
          `${personCount} persons detected, expected ${expected}. Possible unauthorized entry.`,
          Math.max(...personTracks.map((t) => t.confidence)),
          now,
          { detected: personCount, expected }
        );
        if (v) violations.push(v);
      }
    } else {
      this.noFaceFrames = 0;
      this.extraFaceFrames = 0;
    }

    // --- Rule 2: Prohibited objects ---
    for (const det of detections) {
      if (this.config.prohibitedObjects.includes(det.label)) {
        const v = this.createViolation(
          "prohibited_object",
          "high",
          `Prohibited Object: ${det.label}`,
          `A "${det.label}" was detected with ${(det.confidence * 100).toFixed(0)}% confidence. This item is not permitted during the exam.`,
          det.confidence,
          now,
          { object: det.label }
        );
        if (v) violations.push(v);
      }
    }

    // --- Rule 3: Excessive movement ---
    let totalMovement = 0;
    for (const track of personTracks) {
      const prev = this.lastCentroids.get(track.trackId);
      const curr: [number, number] = [track.centroidX, track.centroidY];
      if (prev) {
        const dist = Math.sqrt((curr[0] - prev[0]) ** 2 + (curr[1] - prev[1]) ** 2);
        totalMovement += dist;
      }
      this.lastCentroids.set(track.trackId, curr);
    }

    if (totalMovement > this.config.movementThreshold) {
      this.movementFrames++;
      if (this.movementFrames >= this.config.movementFrameThreshold) {
        const v = this.createViolation(
          "excessive_movement",
          "medium",
          "Excessive Movement Detected",
          `Sustained high movement detected over ${this.movementFrames} frames. Possible communication or restlessness.`,
          0.7,
          now
        );
        if (v) violations.push(v);
      }
    } else {
      this.movementFrames = Math.max(0, this.movementFrames - 1); // Decay
    }

    this.recentViolations.push(...violations);
    // Keep last 200 violations
    if (this.recentViolations.length > 200) {
      this.recentViolations = this.recentViolations.slice(-200);
    }

    return violations;
  }

  private createViolation(
    type: ViolationType,
    severity: Violation["severity"],
    title: string,
    description: string,
    confidence: number,
    timestamp: number,
    metadata?: Record<string, unknown>
  ): Violation | null {
    // Check cooldown
    const lastTime = this.cooldowns.get(type) ?? 0;
    if (timestamp - lastTime < this.COOLDOWN_MS) return null;

    this.cooldowns.set(type, timestamp);
    return {
      id: `viol_${++violationCounter}`,
      type,
      severity,
      title,
      description,
      timestamp,
      timeFormatted: formatTime(timestamp),
      confidence: parseFloat(confidence.toFixed(3)),
      metadata,
    };
  }

  getRecentViolations(): Violation[] {
    return [...this.recentViolations];
  }

  getViolationCount(): number {
    return this.recentViolations.length;
  }

  getMode(): ExamMode {
    return this.config.mode;
  }

  reset(): void {
    this.noFaceFrames = 0;
    this.extraFaceFrames = 0;
    this.movementFrames = 0;
    this.lastCentroids.clear();
    this.recentViolations = [];
    this.cooldowns.clear();
    violationCounter = 0;
  }
}
