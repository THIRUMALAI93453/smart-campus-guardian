import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  CameraOff,
  SwitchCamera,
  Activity,
  Layers,
  Zap,
  Eye,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useCamera } from "@/hooks/useCamera";
import {
  loadModel,
  isModelLoaded,
  runDetection,
  drawDetections,
  type DetectionResult,
} from "@/lib/detection";

export default function LiveDetection() {
  const { videoRef, state, startCamera, stopCamera, toggleFacingMode } = useCamera();
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [fps, setFps] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const fpsCounter = useRef({ frames: 0, lastTime: performance.now() });
  const detectingRef = useRef(false);

  // Load model on mount
  useEffect(() => {
    if (isModelLoaded()) {
      setModelStatus("ready");
      return;
    }
    setModelStatus("loading");
    loadModel()
      .then(() => setModelStatus("ready"))
      .catch(() => setModelStatus("error"));
  }, []);

  const detectionLoop = useCallback(async () => {
    if (!detectingRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      if (detectingRef.current) rafRef.current = requestAnimationFrame(detectionLoop);
      return;
    }

    const det = await runDetection(videoRef.current);
    setResult(det);

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
      setFps(fpsCounter.current.frames);
      fpsCounter.current = { frames: 0, lastTime: now };
    }

    if (detectingRef.current) rafRef.current = requestAnimationFrame(detectionLoop);
  }, [videoRef]);

  const handleStart = async () => {
    await startCamera();
    detectingRef.current = true;
    setIsDetecting(true);
    rafRef.current = requestAnimationFrame(detectionLoop);
  };

  const handleStop = () => {
    detectingRef.current = false;
    setIsDetecting(false);
    cancelAnimationFrame(rafRef.current);
    stopCamera();
    setResult(null);
    setFps(0);
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext("2d");
      ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }
  };

  useEffect(() => {
    return () => {
      detectingRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const modelNotReady = modelStatus !== "ready";

  return (
    <DashboardLayout title="Live Detection" subtitle="Real-time COCO-SSD Object Detection & Feature Extraction">
      {/* Model status */}
      {modelStatus === "loading" && (
        <div className="flex items-center gap-2 rounded-lg border bg-card p-3 mb-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading TensorFlow.js COCO-SSD model… This may take a moment on first load.
        </div>
      )}
      {modelStatus === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-5 text-sm text-destructive">
          Failed to load the ML model. Please refresh and try again.
        </div>
      )}

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3 mb-5">
        {!state.isActive ? (
          <button
            onClick={handleStart}
            disabled={modelNotReady}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-4 w-4" /> Start Camera
          </button>
        ) : (
          <>
            <button onClick={handleStop} className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors">
              <CameraOff className="h-4 w-4" /> Stop Camera
            </button>
            <button onClick={toggleFacingMode} className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              <SwitchCamera className="h-4 w-4" /> Flip
            </button>
          </>
        )}

        {state.isActive && (
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Live</span>
            <span><Zap className="inline h-3 w-3 mr-0.5" />{fps} FPS</span>
            {result && <span><Eye className="inline h-3 w-3 mr-0.5" />{result.detections.length} detections</span>}
            {result && <span className="hidden sm:inline">{result.processingTimeMs}ms</span>}
          </div>
        )}
      </motion.div>

      {state.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-5 text-sm text-destructive">{state.error}</div>
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
        {/* Video feed */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/50 border shadow-card">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
            <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            {!state.isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Camera className="h-10 w-10 opacity-30" />
                <p className="text-sm">{modelNotReady ? "Loading model…" : 'Click "Start Camera" to begin live detection'}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Detection results */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Detections
              {modelStatus === "ready" && <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">COCO-SSD</span>}
            </h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {result && result.detections.length > 0 ? (
                result.detections.map((det) => (
                  <div key={det.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
                    <span className="font-semibold text-foreground capitalize">{det.label}</span>
                    <span className={`font-mono font-bold ${det.confidence > 0.75 ? "text-success" : det.confidence > 0.6 ? "text-warning" : "text-destructive"}`}>
                      {(det.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {state.isActive ? "Analyzing…" : "No active feed"}
                </p>
              )}
            </div>
          </div>

          {result && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Frame", value: `${result.frameWidth}×${result.frameHeight}` },
                { label: "Objects", value: result.detections.length },
                { label: "Latency", value: `${result.processingTimeMs}ms` },
                { label: "FPS", value: fps },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border bg-card p-3 text-center shadow-card">
                  <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Feature Extraction Panel */}
      {result && result.features.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
          <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" /> Extracted Features
          </h3>
          <div className="rounded-lg border bg-card shadow-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Label", "Edge", "Aspect", "Area", "CX", "CY", "Brightness", "Contrast", "Hue", "Keypoints", "Texture"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.features.map((f) => (
                  <tr key={f.detectionId} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2 font-semibold text-foreground capitalize">{f.label}</td>
                    <td className="px-3 py-2 font-mono">{f.edgeIntensity}</td>
                    <td className="px-3 py-2 font-mono">{f.aspectRatio}</td>
                    <td className="px-3 py-2 font-mono">{f.area}</td>
                    <td className="px-3 py-2 font-mono">{f.centroidX}</td>
                    <td className="px-3 py-2 font-mono">{f.centroidY}</td>
                    <td className="px-3 py-2 font-mono">{f.meanBrightness}</td>
                    <td className="px-3 py-2 font-mono">{f.contrast}</td>
                    <td className="px-3 py-2 font-mono">{f.dominantHue}</td>
                    <td className="px-3 py-2 font-mono">{f.keypointCount}</td>
                    <td className="px-3 py-2 font-mono">{f.textureDensity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
