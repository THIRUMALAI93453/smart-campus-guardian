/**
 * Shared live camera feed component with detection overlay.
 * Used by both Classroom and Exam Hall modes.
 */

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Camera } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import {
  loadModel,
  isModelLoaded,
  runDetection,
  drawDetections,
  type DetectionResult,
} from "@/lib/detection";

export interface LiveFeedHandle {
  start: () => Promise<void>;
  stop: () => void;
  isActive: boolean;
}

interface LiveFeedProps {
  onDetection?: (result: DetectionResult) => void;
  onFpsUpdate?: (fps: number) => void;
  onModelStatus?: (status: "idle" | "loading" | "ready" | "error") => void;
  className?: string;
}

export const LiveCameraFeed = forwardRef<LiveFeedHandle, LiveFeedProps>(
  ({ onDetection, onFpsUpdate, onModelStatus, className = "" }, ref) => {
    const { videoRef, state, startCamera, stopCamera, toggleFacingMode } = useCamera();
    const overlayRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number>(0);
    const detectingRef = useRef(false);
    const fpsCounter = useRef({ frames: 0, lastTime: performance.now() });

    // Load model
    useEffect(() => {
      if (isModelLoaded()) {
        onModelStatus?.("ready");
        return;
      }
      onModelStatus?.("loading");
      loadModel()
        .then(() => onModelStatus?.("ready"))
        .catch(() => onModelStatus?.("error"));
    }, []);

    const detectionLoop = useCallback(async () => {
      if (!detectingRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        if (detectingRef.current) rafRef.current = requestAnimationFrame(detectionLoop);
        return;
      }

      const det = await runDetection(videoRef.current);
      onDetection?.(det);

      // Draw overlay
      if (overlayRef.current) {
        const canvas = overlayRef.current;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const ctx = canvas.getContext("2d");
        if (ctx && det.frameWidth > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawDetections(ctx, det.detections, canvas.width / det.frameWidth, canvas.height / det.frameHeight);
        }
      }

      // FPS
      fpsCounter.current.frames++;
      const now = performance.now();
      if (now - fpsCounter.current.lastTime >= 1000) {
        onFpsUpdate?.(fpsCounter.current.frames);
        fpsCounter.current = { frames: 0, lastTime: now };
      }

      if (detectingRef.current) rafRef.current = requestAnimationFrame(detectionLoop);
    }, [videoRef, onDetection, onFpsUpdate]);

    const start = useCallback(async () => {
      await startCamera();
      detectingRef.current = true;
      rafRef.current = requestAnimationFrame(detectionLoop);
    }, [startCamera, detectionLoop]);

    const stop = useCallback(() => {
      detectingRef.current = false;
      cancelAnimationFrame(rafRef.current);
      stopCamera();
      onFpsUpdate?.(0);
      if (overlayRef.current) {
        const ctx = overlayRef.current.getContext("2d");
        ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
      }
    }, [stopCamera, onFpsUpdate]);

    useImperativeHandle(ref, () => ({
      start,
      stop,
      get isActive() { return state.isActive; },
    }), [start, stop, state.isActive]);

    useEffect(() => {
      return () => {
        detectingRef.current = false;
        cancelAnimationFrame(rafRef.current);
      };
    }, []);

    return (
      <div className={`relative aspect-video rounded-lg overflow-hidden bg-muted/50 border shadow-card ${className}`}>
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
        <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        {!state.isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Camera className="h-10 w-10 opacity-30" />
            <p className="text-sm">Click "Start Monitoring" to begin</p>
          </div>
        )}
        {state.error && (
          <div className="absolute bottom-2 left-2 right-2 rounded bg-destructive/90 px-3 py-1.5 text-xs text-destructive-foreground">
            {state.error}
          </div>
        )}
      </div>
    );
  }
);

LiveCameraFeed.displayName = "LiveCameraFeed";
