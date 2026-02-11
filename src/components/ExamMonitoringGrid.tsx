import { Camera, AlertTriangle, User, ShieldCheck } from "lucide-react";

interface MonitoringCell {
  seatNumber: string;
  studentName: string;
  status: "normal" | "flagged" | "alert" | "verified";
}

const mockCells: MonitoringCell[] = [
  { seatNumber: "A1", studentName: "Aarav S.", status: "verified" },
  { seatNumber: "A2", studentName: "Priya P.", status: "normal" },
  { seatNumber: "A3", studentName: "Rohan G.", status: "flagged" },
  { seatNumber: "A4", studentName: "Sneha R.", status: "normal" },
  { seatNumber: "B1", studentName: "Vikram S.", status: "alert" },
  { seatNumber: "B2", studentName: "Ananya I.", status: "normal" },
  { seatNumber: "B3", studentName: "Karthik N.", status: "normal" },
  { seatNumber: "B4", studentName: "Meera D.", status: "flagged" },
  { seatNumber: "C1", studentName: "Arjun K.", status: "verified" },
  { seatNumber: "C2", studentName: "Divya J.", status: "normal" },
  { seatNumber: "C3", studentName: "Rahul M.", status: "normal" },
  { seatNumber: "C4", studentName: "Neha T.", status: "alert" },
];

const statusStyles = {
  normal: { border: "border-border", bg: "bg-card", icon: Camera, iconColor: "text-muted-foreground" },
  verified: { border: "border-success/40", bg: "bg-success/5", icon: ShieldCheck, iconColor: "text-success" },
  flagged: { border: "border-warning/40", bg: "bg-warning/5", icon: AlertTriangle, iconColor: "text-warning" },
  alert: { border: "border-destructive/40", bg: "bg-destructive/5", icon: AlertTriangle, iconColor: "text-destructive" },
};

export function ExamMonitoringGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
      {mockCells.map((cell) => {
        const style = statusStyles[cell.status];
        const Icon = style.icon;
        return (
          <div
            key={cell.seatNumber}
            className={`rounded-lg border-2 p-3 ${style.border} ${style.bg} transition-all hover:shadow-card`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">{cell.seatNumber}</span>
              <Icon className={`h-3.5 w-3.5 ${style.iconColor}`} />
            </div>
            <div className="aspect-video rounded bg-muted/50 flex items-center justify-center mb-2">
              <Camera className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium truncate">{cell.studentName}</p>
          </div>
        );
      })}
    </div>
  );
}
