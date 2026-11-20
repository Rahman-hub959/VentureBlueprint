import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileCheck, Layers, ShieldCheck, Download } from "lucide-react";

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Structured Information Gathering",
      desc: "Move through a guided 7-section questionnaire covering your company name, business domain, ownership structure, registered office location, initial capitalization, and staffing goals."
    },
    {
      num: "02",
      title: "MCA Rule 8 Name Pre-Screening",
      desc: "Our automated pre-screening engine tests your proposed company name against Rule 8 of the Companies (Incorporation) Rules, 2014, checking for restricted words, prohibited emblems, and structure suffix alignment."
    },
    {
      num: "03",
      title: "Deterministic Structure Evaluation",
      desc: "Based on founder count, investor expectations, liability preferences, and capital commitments, our engine scores and recommends the optimal entity form (Private Limited, LLP, OPC, or Partnership)."
    },
    {
      num: "04",
      title: "Regulatory Cross-Validation",
      desc: "Identifies applicable statutory registrations: SPICe+ filing mandates, resident director eligibility, registered office utility proof, GST thresholds, Udyam MSME, and DPDP Act 2023 data compliance."
    },
    {
      num: "05",
      title: "Local PDF & DOCX Generation",
      desc: "Instantly compiles 8 publication-grade corporate formation reports locally with ReportLab and python-docx, complete with executive summaries, compliance matrices, and SHA-256 cryptographic checksums."
    },
    {
      num: "06",
      title: "Interactive Compliance Checklist",
      desc: "Track statutory incorporation tasks, assign responsibilities, record CA/CS review notes, and access direct links to official MCA, GST, and MSME portals."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          A Considered Process
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          From First Thought to Statutory Blueprint
        </h1>
        <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium">
          See how VentureBlueprint transforms disconnected thoughts into an integrated, compliant corporate foundation in 6 clear stages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((s) => (
          <div key={s.num} className="glass-card p-8 rounded-2xl flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="space-y-3">
              <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{s.num}</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{s.desc}</p>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Step {s.num} Verified</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-modal p-10 text-center space-y-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm transition-colors">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Ready to begin your company formation?</h2>
        <p className="text-slate-700 dark:text-slate-300 text-sm max-w-lg mx-auto font-medium">
          Start with the questionnaire today and generate your complete formation dossier in minutes.
        </p>
        <div className="pt-2">
          <Link to="/register" className="glass-button-primary text-sm py-3.5 px-6 inline-flex font-bold shadow-md">
            <span>Start Building Blueprint</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
};
