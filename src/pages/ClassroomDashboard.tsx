import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Camera,
  CameraOff,
  SwitchCamera,
  Zap,
  Eye,
  Loader2,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LiveCameraFeed, type LiveFeedHandle } from "@/components/LiveCameraFeed";
import { StatCard } from "@/components/StatCard";
import { EngagementRing } from "@/components/EngagementRing";
import { CentroidTracker } from "@/lib/tracker";
import { AttendanceRuleEngine, type AttendanceSnapshot } from "@/lib/rules/attendanceRules";
import { SessionLogger, type SessionEvent } from "@/lib/sessionLogger";
import type { DetectionResult } from "@/lib/detection";

export default function ClassroomDashboard() {
  const feedRef = useRef<LiveFeedHandle>(null);
  const trackerRef = useRef(new CentroidTracker({ maxDistance: 150, maxLostFrames: 45 }));
  const rulesRef = useRef(new AttendanceRuleEngine({ minPresenceDurationMs: 10_000 }));
  const loggerRef = useRef(new SessionLogger());

  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [fps, setFps] = useState(0);
  const [snapshot, setSnapshot] = useState<AttendanceSnapshot | null>(null);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [detectionCount, setDetectionCount] = useState(0);

  // Listen for logger events
  useEffect(() => {
    const unsub = loggerRef.current.onEvent(() => {
      setEvents(loggerRef.current.getEvents().slice(-50).reverse());
    });
    return unsub;
  }, []);

  const handleDetection = useCallback((result: DetectionResult) => {
    if (result.detections.length === 0 && !snapshot) return;

    const now = Date.now();
    const tracks = trackerRef.current.update(result.detections, now);
    const { snapshot: snap, entries, exits } = rulesRef.current.process(tracks);

    setSnapshot(snap);
    setDetectionCount(result.detections.length);

    // Log entry/exit events
    for (const id of entries) {
      loggerRef.current.log(
        "person_entered",
        "info",
        "Person Entered",
        `Tracked individual ${id} entered the frame.`,
        { trackId: id }
      );
    }
    for (const id of exits) {
      loggerRef.current.log(
        "person_exited",
        "low",
        "Person Exited",
        `Tracked individual ${id} left the frame.`,
        { trackId: id }
      );
    }
  }, [snapshot]);

  const handleStart = async () => {
    trackerRef.current.reset();
    rulesRef.current.reset();
    loggerRef.current.clear();
    loggerRef.current.log("session_start", "info", "Session Started", "Classroom monitoring session initiated.");
    await feedRef.current?.start();
    setIsMonitoring(true);
  };

  const handleStop = () => {
    feedRef.current?.stop();
    loggerRef.current.log("session_end", "info", "Session Ended", "Classroom monitoring session ended.");
    setIsMonitoring(false);
    setSnapshot(null);
    setDetectionCount(0);
  };

  const stabilityColor = snapshot?.classStability === "stable" ? "text-success" : snapshot?.classStability === "moderate" ? "text-warning" : "text-destructive";
  const presencePercent = snapshot && snapshot.totalDetected > 0
    ? Math.round((snapshot.presentCount / snapshot.totalDetected) * 100)
    : 0;

  const sessionDuration = snapshot
    ? `${Math.floor(snapshot.sessionDurationMs / 60000)}m ${Math.floor((snapshot.sessionDurationMs % 60000) / 1000)}s`
    : "0m 0s";

  const modelNotReady = modelStatus !== "ready";

  const severityColors: Record<string, string> = {
    info: "bg-info",
    low: "bg-success",
    medium: "bg-warning",
    high: "bg-destructive",
  };

  return (
    <DashboardLayout title="Classroom Mode" subtitle="Live Attendance & Behavior Analytics">
      {/* Model status */}
      {modelStatus === "loading" && (
        <div className="flex items-center gap-2 rounded-lg border bg-card p-3 mb-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading AI detection model…
        </div>
      )}
      {modelStatus === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-5 text-sm text-destructive">
          Failed to load ML model. Please refresh.
        </div>
      )}

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3 mb-5">
        {!isMonitoring ? (
          <button
            onClick={handleStart}
            disabled={modelNotReady}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-4 w-4" /> Start Monitoring
          </button>
        ) : (
          <button onClick={handleStop} className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors">
            <CameraOff className="h-4 w-4" /> Stop Monitoring
          </button>
        )}
        {isMonitoring && (
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Live</span>
            <span><Zap className="inline h-3 w-3 mr-0.5" />{fps} FPS</span>
            <span><Eye className="inline h-3 w-3 mr-0.5" />{detectionCount} objects</span>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={Users} label="Total Detected" value={snapshot?.totalDetected ?? 0} subtitle="Unique individuals" />
        <StatCard icon={UserCheck} label="Present" value={snapshot?.presentCount ?? 0} variant="success" subtitle={`${presencePercent}% attendance`} />
        <StatCard icon={UserX} label="Absent / New" value={snapshot?.absentCount ?? 0} variant="destructive" subtitle="Below threshold" />
        <StatCard icon={Clock} label="Session" value={sessionDuration} variant="info" subtitle={snapshot ? snapshot.classStability : "—"} />
      </motion.div>

      {/* Main grid: Camera + Sidebar */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
        {/* Camera Feed */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
          <LiveCameraFeed
            ref={feedRef}
            onDetection={handleDetection}
            onFpsUpdate={setFps}
            onModelStatus={setModelStatus}
          />
        </motion.div>

        {/* Right Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2 space-y-4">
          {/* Engagement Ring */}
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Attendance Rate
            </h3>
            <div className="flex justify-center">
              <EngagementRing percentage={presencePercent} label="Present" />
            </div>
            {snapshot && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="font-display font-bold text-lg text-success">{snapshot.presentCount}</p>
                  <p className="text-[10px] text-muted-foreground">Present</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="font-display font-bold text-lg text-destructive">{snapshot.absentCount}</p>
                  <p className="text-[10px] text-muted-foreground">Absent</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className={`font-display font-bold text-lg ${stabilityColor}`}>{snapshot.classStability}</p>
                  <p className="text-[10px] text-muted-foreground">Stability</p>
                </div>
              </div>
            )}
          </div>

          {/* Attendee List */}
          {snapshot && snapshot.attendees.length > 0 && (
            <div className="rounded-lg border bg-card shadow-card overflow-hidden">
              <div className="p-3 border-b bg-muted/30">
                <h3 className="font-display font-semibold text-xs text-foreground">Tracked Individuals</h3>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {snapshot.attendees.map((a) => (
                  <div key={a.trackId} className="flex items-center justify-between px-3 py-2 border-b last:border-0 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${a.isCurrentlyVisible ? "bg-success" : "bg-muted-foreground/30"}`} />
                      <span className="font-mono text-muted-foreground">{a.trackId}</span>
                    </div>
                    <span className={`font-semibold px-1.5 py-0.5 rounded-full text-[10px] ${
                      a.status === "present" ? "bg-success/10 text-success" :
                      a.status === "unstable" ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Event Log */}
      {events.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
          <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" /> Session Event Log
          </h3>
          <div className="rounded-lg border bg-card shadow-card overflow-hidden">
            <div className="max-h-[250px] overflow-y-auto">
              {events.map((evt) => (
                <div key={evt.id} className="flex items-start gap-3 px-4 py-2.5 border-b last:border-0 text-xs">
                  <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${severityColors[evt.severity]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">{evt.timeFormatted}</span>
                      <span className="font-semibold text-foreground">{evt.title}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
