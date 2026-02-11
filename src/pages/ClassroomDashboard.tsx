import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  TrendingUp,
  Clock,
  Smartphone,
  Moon,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { AlertItem } from "@/components/AlertItem";
import { EngagementRing } from "@/components/EngagementRing";
import { StudentTable } from "@/components/StudentTable";

const classroomAlerts = [
  {
    severity: "medium" as const,
    title: "Vikram Singh — Low Engagement",
    description: "Head-down posture detected for 8+ minutes. Possible sleeping or disengagement.",
    timestamp: "10:24 AM · Seat B1",
  },
  {
    severity: "low" as const,
    title: "Rohan Gupta — Mobile Usage",
    description: "Repeated phone usage pattern detected over 5-minute window.",
    timestamp: "10:18 AM · Seat A3",
  },
  {
    severity: "high" as const,
    title: "Karthik Nair — Proxy Alert",
    description: "Face data mismatch with registered profile. Manual verification recommended.",
    timestamp: "10:05 AM · Seat B3",
  },
  {
    severity: "low" as const,
    title: "Meera Das — Frequent Movement",
    description: "Repeated seat movement and turning detected. No immediate concern.",
    timestamp: "10:12 AM · Seat B4",
  },
];

const timelineData = [
  { time: "10:00", event: "Baseline period started", type: "info" },
  { time: "10:03", event: "Baseline complete — monitoring active", type: "success" },
  { time: "10:05", event: "Proxy alert flagged for B3", type: "alert" },
  { time: "10:12", event: "Movement pattern noted at B4", type: "info" },
  { time: "10:18", event: "Phone usage detected at A3", type: "warning" },
  { time: "10:24", event: "Low engagement alert for B1", type: "warning" },
];

const timelineColors = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  alert: "bg-destructive",
};

export default function ClassroomDashboard() {
  return (
    <DashboardLayout title="Classroom Mode" subtitle="Attendance & Class Observation">
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"
      >
        <StatCard icon={Users} label="Total Students" value={10} subtitle="Section A · Room 204" />
        <StatCard icon={UserCheck} label="Present" value={8} variant="success" subtitle="80% attendance" />
        <StatCard icon={UserX} label="Absent" value={2} variant="destructive" />
        <StatCard icon={AlertTriangle} label="Active Alerts" value={4} variant="warning" subtitle="Advisory only" />
      </motion.div>

      {/* Engagement + Timeline */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border rounded-lg p-5 shadow-card"
        >
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Class Engagement</h3>
          <div className="flex justify-center gap-6">
            <EngagementRing percentage={72} label="Overall" />
            <EngagementRing percentage={85} label="Attention" size={90} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "High", value: 5, color: "text-success" },
              { label: "Medium", value: 3, color: "text-warning" },
              { label: "Low", value: 2, color: "text-destructive" },
            ].map((item) => (
              <div key={item.label} className="bg-muted/50 rounded-lg p-2">
                <p className={`font-display font-bold text-lg ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-card border rounded-lg p-5 shadow-card lg:col-span-2"
        >
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Behavior Timeline</h3>
          <div className="space-y-3">
            {timelineData.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${timelineColors[item.type as keyof typeof timelineColors]} shrink-0 mt-1`} />
                  {i < timelineData.length - 1 && <div className="w-px h-5 bg-border" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">{item.time}</span>
                    <span className="text-xs text-foreground">{item.event}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alerts + Table */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="font-display font-semibold text-sm text-foreground mb-3">Advisory Alerts</h3>
          <div className="space-y-2">
            {classroomAlerts.map((alert, i) => (
              <AlertItem key={i} {...alert} />
            ))}
          </div>
        </motion.div>

        {/* Attendance Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h3 className="font-display font-semibold text-sm text-foreground mb-3">Attendance List</h3>
          <StudentTable />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
