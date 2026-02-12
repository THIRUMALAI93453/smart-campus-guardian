import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  FileCheck,
  Shield,
  Users,
  Eye,
  BarChart3,
  Smartphone,
  Brain,
  Camera,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
              <Brain className="h-4 w-4" />
              <span className="text-xs font-medium">AI-Assisted Monitoring</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
              SmartCampus AI
            </h1>
            <p className="text-base md:text-lg opacity-85 max-w-xl mx-auto leading-relaxed">
              Real-time computer vision with rule-based intelligence to analyze attendance patterns
              and detect exam malpractice in a privacy-preserving, industry-standard manner.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="container mx-auto px-4 -mt-8 md:-mt-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {/* Classroom Mode */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate("/classroom")}
            className="group bg-card rounded-xl border shadow-card hover:shadow-card-hover p-6 md:p-8 text-left transition-all duration-300 hover:-translate-y-1"
          >
            <div className="rounded-xl bg-primary/10 p-3 w-fit mb-4 group-hover:bg-primary/15 transition-colors">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-2">
              Classroom Mode
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Automated attendance, engagement analysis, and behavior observation using pattern-based AI monitoring.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Attendance", "Engagement", "Behavior"].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </motion.button>

          {/* Exam Hall Mode */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            onClick={() => navigate("/exam")}
            className="group bg-card rounded-xl border shadow-card hover:shadow-card-hover p-6 md:p-8 text-left transition-all duration-300 hover:-translate-y-1"
          >
            <div className="rounded-xl bg-accent/10 p-3 w-fit mb-4 group-hover:bg-accent/15 transition-colors">
              <FileCheck className="h-7 w-7 text-accent" />
            </div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-2">
              Exam Hall Mode
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Identity verification, malpractice prevention, and invigilator-assisted alert management for exam integrity.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Verification", "Integrity", "Alerts"].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-accent/10 text-accent">
                  {tag}
                </span>
              ))}
            </div>
          </motion.button>
        </div>

        {/* Live Detection Card */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onClick={() => navigate("/detection")}
          className="group max-w-4xl mx-auto mt-4 md:mt-6 w-full bg-card rounded-xl border shadow-card hover:shadow-card-hover p-5 md:p-6 text-left transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-info/10 p-3 group-hover:bg-info/15 transition-colors">
              <Camera className="h-7 w-7 text-info" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-bold text-lg md:text-xl text-foreground mb-1">
                Live Detection
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time webcam detection with feature extraction. Access your device camera for live object detection and analysis.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 hidden sm:flex">
              {["Webcam", "Real-time", "Features"].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-info/10 text-info">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.button>

        {/* Reports Card */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={() => navigate("/reports")}
          className="group max-w-4xl mx-auto mt-4 md:mt-6 w-full bg-card rounded-xl border shadow-card hover:shadow-card-hover p-5 md:p-6 text-left transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-warning/10 p-3 group-hover:bg-warning/15 transition-colors">
              <BarChart3 className="h-7 w-7 text-warning" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-bold text-lg md:text-xl text-foreground mb-1">
                Reports & Analytics
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Attendance summaries, engagement trends, and exam incident logs with exportable data views.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 hidden sm:flex">
              {["Attendance", "Trends", "Incidents"].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-warning/10 text-warning">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.button>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="font-display font-bold text-lg md:text-xl text-center text-foreground mb-8">
            Key Capabilities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Person Tracking", desc: "Centroid-based tracking" },
              { icon: Eye, label: "Rule Engine", desc: "Temporal pattern analysis" },
              { icon: BarChart3, label: "Live Analytics", desc: "Real-time dashboards" },
              { icon: Shield, label: "Privacy-First", desc: "No biometric storage" },
            ].map((feat, i) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                className="text-center p-4 rounded-lg bg-muted/50"
              >
                <feat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h4 className="font-display font-semibold text-sm text-foreground">{feat.label}</h4>
                <p className="text-[11px] text-muted-foreground mt-1">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">SmartCampus AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            <span>Session-based monitoring · No automated punishment · Privacy-first</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
