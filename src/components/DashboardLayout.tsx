import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  privacyNotice?: boolean;
}

export function DashboardLayout({ title, subtitle, children, privacyNotice = true }: DashboardLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-lg md:text-xl text-foreground truncate">{title}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1.5 text-xs text-success bg-success/10 px-2.5 py-1 rounded-full font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
              Session Active
            </span>
          </div>
        </div>
      </header>

      {/* Privacy Notice */}
      {privacyNotice && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="container mx-auto px-4 py-2 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              Monitoring active during session only · Data is encrypted & institution-controlled · AI assists — human decision required
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
