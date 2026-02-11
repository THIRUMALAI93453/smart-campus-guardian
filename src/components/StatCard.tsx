import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "destructive" | "info";
}

const variantStyles: Record<string, string> = {
  default: "bg-card border-border",
  success: "bg-card border-success/30",
  warning: "bg-card border-warning/30",
  destructive: "bg-card border-destructive/30",
  info: "bg-card border-info/30",
};

const iconVariantStyles: Record<string, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

export function StatCard({ icon: Icon, label, value, subtitle, variant = "default" }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 md:p-5 shadow-card ${variantStyles[variant]}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${iconVariantStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
