import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Eye,
  Camera,
  FileWarning,
  UserCheck,
  Clock,
  Download,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { AlertItem } from "@/components/AlertItem";
import { ExamMonitoringGrid } from "@/components/ExamMonitoringGrid";

const examAlerts = [
  {
    severity: "high" as const,
    title: "Repeated Head Movement Pattern",
    description: "Seat B1 — Frequent lateral head movements toward B2 detected over 4-minute window. Combined with look-pause-write behavior.",
    timestamp: "11:18 AM",
    seatNumber: "B1",
  },
  {
    severity: "medium" as const,
    title: "Unauthorized Device Detected",
    description: "Seat C4 — Possible smartwatch usage detected. Device visible in wrist area during writing.",
    timestamp: "11:12 AM",
    seatNumber: "C4",
  },
  {
    severity: "medium" as const,
    title: "Suspicious Hand Signals",
    description: "Seat A3 — Repeated hand gestures not consistent with normal writing. Pattern observed 3 times in 6 minutes.",
    timestamp: "11:08 AM",
    seatNumber: "A3",
  },
  {
    severity: "low" as const,
    title: "Paper Movement Noted",
    description: "Seat B4 — Answer sheet repositioned multiple times. No clear indicator of passing. Monitoring continues.",
    timestamp: "11:02 AM",
    seatNumber: "B4",
  },
  {
    severity: "high" as const,
    title: "Identity Verification Mismatch",
    description: "Seat C4 — Face data does not match registered student profile. Invigilator review required.",
    timestamp: "10:55 AM",
    seatNumber: "C4",
  },
];

export default function ExamHallDashboard() {
  return (
    <DashboardLayout title="Exam Hall Mode" subtitle="Malpractice Prevention & Integrity">
      {/* Human Decision Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 border border-primary/15 rounded-lg p-3 md:p-4 mb-6 flex items-center gap-3"
      >
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
        <p className="text-xs md:text-sm text-foreground">
          <span className="font-semibold">AI assists — human decision required.</span>{" "}
          All alerts are advisory. Final decisions on exam integrity are made by the invigilator.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"
      >
        <StatCard icon={UserCheck} label="Verified" value={10} variant="success" subtitle="Identity confirmed" />
        <StatCard icon={FileWarning} label="Flagged" value={2} variant="warning" subtitle="Under review" />
        <StatCard icon={AlertTriangle} label="Alerts" value={5} variant="destructive" subtitle="Pending review" />
        <StatCard icon={Clock} label="Elapsed" value="1h 18m" variant="info" subtitle="of 3h exam" />
      </motion.div>

      {/* Monitoring Grid + Alerts */}
      <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
        {/* Live Monitoring */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm text-foreground">Live Monitoring (Simulated)</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-success font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
              Live
            </span>
          </div>
          <ExamMonitoringGrid />
        </motion.div>

        {/* Alert List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm text-foreground">Alert Log</h3>
            <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <Download className="h-3 w-3" />
              Export
            </button>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {examAlerts.map((alert, i) => (
              <AlertItem key={i} {...alert} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Evidence Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-6"
      >
        <h3 className="font-display font-semibold text-sm text-foreground mb-3">Evidence Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { seat: "B1", time: "11:18 AM", type: "Head Movement" },
            { seat: "C4", time: "11:12 AM", type: "Device Detected" },
            { seat: "A3", time: "11:08 AM", type: "Hand Signals" },
            { seat: "C4", time: "10:55 AM", type: "ID Mismatch" },
          ].map((ev, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-3 shadow-card"
            >
              <div className="aspect-video rounded bg-muted/50 flex items-center justify-center mb-2">
                <Camera className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{ev.type}</p>
                  <p className="text-[10px] text-muted-foreground">Seat {ev.seat} · {ev.time}</p>
                </div>
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
