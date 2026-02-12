import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Camera,
  CameraOff,
  Zap,
  Eye,
  Loader2,
  UserCheck,
  FileWarning,
  Clock,
  Download,
  Users,
  User,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LiveCameraFeed, type LiveFeedHandle } from "@/components/LiveCameraFeed";
import { StatCard } from "@/components/StatCard";
import { AlertItem } from "@/components/AlertItem";
import { CentroidTracker } from "@/lib/tracker";
import { ExamRuleEngine, type Violation, type ExamMode } from "@/lib/rules/examRules";
import { SessionLogger, type SessionEvent } from "@/lib/sessionLogger";
import type { DetectionResult } from "@/lib/detection";

export default function ExamHallDashboard() {
  const feedRef = useRef<LiveFeedHandle>(null);
  const trackerRef = useRef(new CentroidTracker({ maxDistance: 100, maxLostFrames: 20 }));
  const rulesRef = useRef(new ExamRuleEngine());
  const loggerRef = useRef(new SessionLogger());

  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [fps, setFps] = useState(0);
  const [examMode, setExamMode] = useState<ExamMode>("single");
  const [expectedCandidates, setExpectedCandidates] = useState(1);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [personCount, setPersonCount] = useState(0);
  const [detectionCount, setDetectionCount] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [, forceUpdate] = useState(0);

  // Timer for elapsed display
  useEffect(() => {
    if (!isMonitoring) return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const handleDetection = useCallback((result: DetectionResult) => {
    const now = Date.now();
    const tracks = trackerRef.current.update(result.detections, now);
    const newViolations = rulesRef.current.analyze(tracks, result.detections);

    const activePersons = tracks.filter((t) => t.label === "person" && t.isActive).length;
    setPersonCount(activePersons);
    setDetectionCount(result.detections.length);

    if (newViolations.length > 0) {
      for (const v of newViolations) {
        loggerRef.current.log(
          "violation_detected",
          v.severity === "high" ? "high" : v.severity === "medium" ? "medium" : "low",
          v.title,
          v.description,
          { type: v.type, confidence: v.confidence }
        );
      }
      setViolations(rulesRef.current.getRecentViolations().slice().reverse());
    }
  }, []);

  const handleStart = async () => {
    trackerRef.current.reset();
    rulesRef.current.reset();
    rulesRef.current.setMode(examMode, expectedCandidates);
    loggerRef.current.clear();
    loggerRef.current.log(
      "session_start",
      "info",
      "Exam Session Started",
      `${examMode === "single" ? "Single-candidate" : `Multi-candidate (${expectedCandidates})`} exam monitoring initiated.`
    );
    await feedRef.current?.start();
    setIsMonitoring(true);
    setViolations([]);
  };

  const handleStop = () => {
    feedRef.current?.stop();
    loggerRef.current.log("session_end", "info", "Exam Session Ended", "Exam monitoring session ended.");
    setIsMonitoring(false);
    setPersonCount(0);
    setDetectionCount(0);
  };

  const elapsedMs = isMonitoring ? Date.now() - sessionStartTime : 0;
  const elapsedStr = `${Math.floor(elapsedMs / 60000)}m ${Math.floor((elapsedMs % 60000) / 1000)}s`;
  const highViolations = violations.filter((v) => v.severity === "high").length;
  const modelNotReady = modelStatus !== "ready";

  return (
    <DashboardLayout title="Exam Hall Mode" subtitle="Malpractice Prevention & Integrity Monitoring">
      {/* Human Decision Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 border border-primary/15 rounded-lg p-3 md:p-4 mb-5 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
        <p className="text-xs md:text-sm text-foreground">
          <span className="font-semibold">AI assists — human decision required.</span>{" "}
          All alerts are advisory. Final decisions on exam integrity are made by the invigilator.
        </p>
      </motion.div>

      {/* Model status */}
      {modelStatus === "loading" && (
        <div className="flex items-center gap-2 rounded-lg border bg-card p-3 mb-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading AI detection model…
        </div>
      )}

      {/* Mode Selection + Controls */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3 mb-5">
        {!isMonitoring ? (
          <>
            {/* Mode selector */}
            <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
              <button
                onClick={() => { setExamMode("single"); setExpectedCandidates(1); }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  examMode === "single" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-3.5 w-3.5" /> Single
              </button>
              <button
                onClick={() => { setExamMode("multi"); setExpectedCandidates(10); }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  examMode === "multi" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-3.5 w-3.5" /> Multi
              </button>
            </div>

            {examMode === "multi" && (
              <div className="flex items-center gap-2 text-xs">
                <label className="text-muted-foreground">Expected:</label>
                <input
                  type="number"
                  min={2}
                  max={100}
                  value={expectedCandidates}
                  onChange={(e) => setExpectedCandidates(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-16 rounded-md border bg-card px-2 py-1 text-xs text-foreground"
                />
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={modelNotReady}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="h-4 w-4" /> Start Monitoring
            </button>
          </>
        ) : (
          <button onClick={handleStop} className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors">
            <CameraOff className="h-4 w-4" /> Stop Monitoring
          </button>
        )}

        {isMonitoring && (
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Live</span>
            <span><Zap className="inline h-3 w-3 mr-0.5" />{fps} FPS</span>
            <span><Eye className="inline h-3 w-3 mr-0.5" />{personCount} persons</span>
            <span className="hidden sm:inline text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">
              {examMode === "single" ? "SINGLE" : `MULTI (${expectedCandidates})`}
            </span>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={UserCheck} label="Persons" value={personCount} variant="success" subtitle={`of ${expectedCandidates} expected`} />
        <StatCard icon={FileWarning} label="Violations" value={violations.length} variant="warning" subtitle={`${highViolations} high severity`} />
        <StatCard icon={AlertTriangle} label="High Alerts" value={highViolations} variant="destructive" subtitle="Require review" />
        <StatCard icon={Clock} label="Elapsed" value={elapsedStr} variant="info" subtitle={examMode === "single" ? "Single candidate" : "Multi candidate"} />
      </motion.div>

      {/* Main grid: Camera + Violations */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
        {/* Camera */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
          <LiveCameraFeed
            ref={feedRef}
            onDetection={handleDetection}
            onFpsUpdate={setFps}
            onModelStatus={setModelStatus}
          />

          {/* Real-time status indicator */}
          {isMonitoring && (
            <div className={`mt-3 rounded-lg border p-3 text-center text-sm font-semibold ${
              personCount === 0
                ? "border-destructive/30 bg-destructive/5 text-destructive"
                : examMode === "single" && personCount > 1
                ? "border-destructive/30 bg-destructive/5 text-destructive"
                : personCount === expectedCandidates
                ? "border-success/30 bg-success/5 text-success"
                : "border-warning/30 bg-warning/5 text-warning"
            }`}>
              {personCount === 0
                ? "⚠ No person detected — candidate may have left"
                : examMode === "single" && personCount > 1
                ? `⚠ ${personCount} persons detected — violation`
                : personCount === expectedCandidates
                ? `✓ ${personCount} person(s) — valid`
                : `${personCount} person(s) detected — expected ${expectedCandidates}`
              }
            </div>
          )}
        </motion.div>

        {/* Violation Log */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm text-foreground">Violation Log</h3>
            {violations.length > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {violations.length} total
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {violations.length > 0 ? (
              violations.map((v) => (
                <AlertItem
                  key={v.id}
                  severity={v.severity}
                  title={v.title}
                  description={v.description}
                  timestamp={v.timeFormatted}
                />
              ))
            ) : (
              <div className="rounded-lg border bg-card p-6 text-center shadow-card">
                <ShieldCheck className="h-8 w-8 text-success mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">
                  {isMonitoring ? "No violations detected — monitoring active" : "Start monitoring to begin violation detection"}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
