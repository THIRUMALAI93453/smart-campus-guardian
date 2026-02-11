import { AlertTriangle, Info, AlertCircle } from "lucide-react";

export type AlertSeverity = "low" | "medium" | "high";

interface AlertItemProps {
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  seatNumber?: string;
}

const severityConfig = {
  low: {
    icon: Info,
    bg: "bg-info/5 border-info/20",
    badge: "bg-info/10 text-info",
    label: "Low",
  },
  medium: {
    icon: AlertTriangle,
    bg: "bg-warning/5 border-warning/20",
    badge: "bg-warning/10 text-warning",
    label: "Medium",
  },
  high: {
    icon: AlertCircle,
    bg: "bg-destructive/5 border-destructive/20",
    badge: "bg-destructive/10 text-destructive",
    label: "High",
  },
};

export function AlertItem({ severity, title, description, timestamp, seatNumber }: AlertItemProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-3 md:p-4 ${config.bg} animate-slide-up`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm text-foreground">{title}</h4>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${config.badge}`}>
              {config.label}
            </span>
            {seatNumber && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                Seat {seatNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5">{timestamp}</p>
        </div>
      </div>
    </div>
  );
}
