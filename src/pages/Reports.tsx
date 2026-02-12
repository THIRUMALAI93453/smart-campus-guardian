import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";

/* ── Mock Data ──────────────────────────────────────────── */

const weeklyAttendance = [
  { day: "Mon", present: 142, absent: 8 },
  { day: "Tue", present: 138, absent: 12 },
  { day: "Wed", present: 145, absent: 5 },
  { day: "Thu", present: 140, absent: 10 },
  { day: "Fri", present: 136, absent: 14 },
];

const engagementTrend = [
  { time: "9 AM", high: 72, medium: 20, low: 8 },
  { time: "10 AM", high: 65, medium: 25, low: 10 },
  { time: "11 AM", high: 58, medium: 28, low: 14 },
  { time: "12 PM", high: 45, medium: 30, low: 25 },
  { time: "1 PM", high: 50, medium: 32, low: 18 },
  { time: "2 PM", high: 60, medium: 26, low: 14 },
  { time: "3 PM", high: 55, medium: 28, low: 17 },
];

const engagementBreakdown = [
  { name: "High", value: 58, color: "hsl(var(--success))" },
  { name: "Medium", value: 28, color: "hsl(var(--warning))" },
  { name: "Low", value: 14, color: "hsl(var(--destructive))" },
];

const examIncidents = [
  { id: 1, exam: "Mathematics Final", date: "2026-02-10", seat: "A-14", type: "Repeated head turning", severity: "Medium", status: "Reviewed", time: "10:23 AM" },
  { id: 2, exam: "Mathematics Final", date: "2026-02-10", seat: "C-07", type: "Unauthorized device", severity: "High", status: "Confirmed", time: "10:45 AM" },
  { id: 3, exam: "Physics Midterm", date: "2026-02-08", seat: "B-22", type: "Look-pause-write pattern", severity: "Low", status: "Dismissed", time: "11:12 AM" },
  { id: 4, exam: "Physics Midterm", date: "2026-02-08", seat: "D-03", type: "Paper passing attempt", severity: "High", status: "Confirmed", time: "11:30 AM" },
  { id: 5, exam: "Chemistry Lab", date: "2026-02-06", seat: "A-09", type: "Identity mismatch", severity: "High", status: "Reviewed", time: "09:15 AM" },
  { id: 6, exam: "English Literature", date: "2026-02-05", seat: "B-18", type: "Frequent eye movement", severity: "Low", status: "Dismissed", time: "02:40 PM" },
];

const severityColor: Record<string, string> = {
  High: "text-destructive bg-destructive/10",
  Medium: "text-warning bg-warning/10",
  Low: "text-muted-foreground bg-muted",
};

const statusIcon: Record<string, React.ReactNode> = {
  Confirmed: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  Reviewed: <Clock className="h-3.5 w-3.5 text-warning" />,
  Dismissed: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
};

/* ── Component ──────────────────────────────────────────── */

export default function Reports() {
  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Attendance, Engagement & Exam Incident Insights">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={Users} label="Avg Attendance" value="94.7%" variant="success" />
        <StatCard icon={TrendingUp} label="Avg Engagement" value="72%" variant="info" />
        <StatCard icon={AlertTriangle} label="Exam Incidents" value="6" variant="warning" />
        <StatCard icon={FileText} label="Reports Generated" value="23" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Weekly Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-lg border bg-card p-4 md:p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Weekly Attendance
            </h3>
            <button className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyAttendance} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="present" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Engagement Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-lg border bg-card p-4 md:p-5 shadow-card"
        >
          <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Engagement Split
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={engagementBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {engagementBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {engagementBreakdown.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                {e.name} {e.value}%
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Engagement Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border bg-card p-4 md:p-5 shadow-card mb-6"
      >
        <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" /> Engagement Trend (Today)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={engagementTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => `${value}%`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="High" />
            <Line type="monotone" dataKey="medium" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} name="Medium" />
            <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Low" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Exam Incident Log */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-lg border bg-card shadow-card overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 md:p-5 border-b">
          <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" /> Exam Incident Log
          </h3>
          <button className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3 w-3" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b">
                {["Exam", "Date", "Time", "Seat", "Incident Type", "Severity", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examIncidents.map((inc) => (
                <tr key={inc.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{inc.exam}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inc.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inc.time}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{inc.seat}</td>
                  <td className="px-4 py-3 text-foreground">{inc.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${severityColor[inc.severity]}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      {statusIcon[inc.status]}
                      <span className="text-muted-foreground">{inc.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
