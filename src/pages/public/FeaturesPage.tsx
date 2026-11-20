import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  FileCheck,
  CheckCircle,
  Users,
  Building,
  Scale,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  Layers
} from "lucide-react";

export const FeaturesPage: React.FC = () => {
  const featureList = [
    {
      title: "MCA Rule 8 Pre-Screening",
      desc: "Comprehensive pre-check against restricted prefixes, prohibited government emblems, financial keywords, and structure suffixes.",
      icon: Shield
    },
    {
      title: "Deterministic Legal Structure Scoring",
      desc: "Evaluates Private Limited Company vs LLP vs OPC vs Partnership Firm based on founder count, investor equity goals, and capital.",
      icon: Scale
    },
    {
      title: "8 Professional Output Documents",
      desc: "Compiles complete PDF and editable Word (.docx) formation blueprints, MCA reports, director reports, and roadmaps.",
      icon: FileCheck
    },
    {
      title: "Statutory Role Recommender",
      desc: "Recommends resident directors, managing directors, statutory CA auditors, and practicing CS advisors based on legal mandate.",
      icon: Users
    },
    {
      title: "Interactive Compliance Tasks",
      desc: "Full task management lifecycle (Not Started, In Progress, Pending Documents, Completed) with official portal links.",
      icon: CheckCircle
    },
    {
      title: "Audit Logging & Version History",
      desc: "Preserves historical snapshots of regenerated reports with cryptographic SHA-256 verification and immutable audit trails.",
      icon: Database
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Platform Capabilities
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Engineered for Enterprise-Grade Precision
        </h1>
        <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium">
          Explore the purpose-built modules that power VentureBlueprint's AI-independent company formation and compliance platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div key={idx} className="glass-card p-8 rounded-2xl flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-6 border border-emerald-200 dark:border-emerald-800">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{f.desc}</p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                Active in Core Platform
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Experience the full platform locally</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">Start your company project and test all features with zero cloud dependencies.</p>
        </div>
        <Link to="/register" className="glass-button-primary text-xs py-3 px-6 whitespace-nowrap font-bold shadow-md">
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>
    </div>
  );
};
