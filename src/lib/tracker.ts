/**
 * Centroid-based Object Tracker
 * Assigns anonymous IDs and tracks detected objects across frames
 * using distance-based matching. No biometric storage.
 */

import type { Detection } from "./detection";

export interface TrackedObject {
  trackId: string;
  label: string;
  centroidX: number;
  centroidY: number;
  bbox: Detection["bbox"];
  confidence: number;
  firstSeenMs: number;
  lastSeenMs: number;
  framesSeen: number;
  framesLost: number;
  isActive: boolean;
}

interface TrackerConfig {
  maxDistance: number; // Max pixel distance for matching
  maxLostFrames: number; // Frames before removing a track
  minFramesForConfirmed: number; // Frames before a track is "confirmed"
}

const DEFAULT_CONFIG: TrackerConfig = {
  maxDistance: 120,
  maxLostFrames: 30,
  minFramesForConfirmed: 5,
};

let nextId = 1;

function generateTrackId(): string {
  return `anon_${String(nextId++).padStart(4, "0")}`;
}

function centroid(bbox: Detection["bbox"]): [number, number] {
  return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}

function euclidean(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

export class CentroidTracker {
  private tracks: Map<string, TrackedObject> = new Map();
  private config: TrackerConfig;

  constructor(config: Partial<TrackerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update tracker with new detections for the current frame.
   * Returns all currently tracked objects.
   */
  update(detections: Detection[], timestampMs: number = Date.now()): TrackedObject[] {
    const newCentroids = detections.map((d) => ({
      detection: d,
      centroid: centroid(d.bbox),
    }));

    // Mark all tracks as potentially lost this frame
    const unmatched = new Set(this.tracks.keys());
    const usedDetections = new Set<number>();

    // Greedy nearest-neighbor matching
    const pairs: { trackId: string; detIdx: number; dist: number }[] = [];

    for (const [trackId, track] of this.tracks) {
      for (let i = 0; i < newCentroids.length; i++) {
        if (newCentroids[i].detection.label !== track.label) continue;
        const dist = euclidean(
          [track.centroidX, track.centroidY],
          newCentroids[i].centroid
        );
        if (dist <= this.config.maxDistance) {
          pairs.push({ trackId, detIdx: i, dist });
        }
      }
    }

    // Sort by distance and greedily assign
    pairs.sort((a, b) => a.dist - b.dist);

    for (const pair of pairs) {
      if (!unmatched.has(pair.trackId) || usedDetections.has(pair.detIdx)) continue;
      
      const track = this.tracks.get(pair.trackId)!;
      const nc = newCentroids[pair.detIdx];
      
      track.centroidX = nc.centroid[0];
      track.centroidY = nc.centroid[1];
      track.bbox = nc.detection.bbox;
      track.confidence = nc.detection.confidence;
      track.lastSeenMs = timestampMs;
      track.framesSeen++;
      track.framesLost = 0;
      track.isActive = true;

      unmatched.delete(pair.trackId);
      usedDetections.add(pair.detIdx);
    }

    // Increment lost frames for unmatched tracks
    for (const trackId of unmatched) {
      const track = this.tracks.get(trackId)!;
      track.framesLost++;
      track.isActive = false;
      if (track.framesLost > this.config.maxLostFrames) {
        this.tracks.delete(trackId);
      }
    }

    // Create new tracks for unmatched detections
    for (let i = 0; i < newCentroids.length; i++) {
      if (usedDetections.has(i)) continue;
      const nc = newCentroids[i];
      const trackId = generateTrackId();
      this.tracks.set(trackId, {
        trackId,
        label: nc.detection.label,
        centroidX: nc.centroid[0],
        centroidY: nc.centroid[1],
        bbox: nc.detection.bbox,
        confidence: nc.detection.confidence,
        firstSeenMs: timestampMs,
        lastSeenMs: timestampMs,
        framesSeen: 1,
        framesLost: 0,
        isActive: true,
      });
    }

    return Array.from(this.tracks.values());
  }

  /** Get only confirmed tracks (seen for minimum frames) */
  getConfirmedTracks(): TrackedObject[] {
    return Array.from(this.tracks.values()).filter(
      (t) => t.framesSeen >= this.config.minFramesForConfirmed
    );
  }

  /** Get active tracks (seen this frame) */
  getActiveTracks(): TrackedObject[] {
    return Array.from(this.tracks.values()).filter((t) => t.isActive);
  }

  /** Get all tracks including lost */
  getAllTracks(): TrackedObject[] {
    return Array.from(this.tracks.values());
  }

  /** Count active persons */
  getActivePersonCount(): number {
    return this.getActiveTracks().filter((t) => t.label === "person").length;
  }

  /** Reset all tracking state */
  reset(): void {
    this.tracks.clear();
    nextId = 1;
  }
}
