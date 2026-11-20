import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const previewTabs = [
    {
      title: "Business Planning",
      step: "01",
      heading: "Strategic Opportunity & Market Model",
      desc: "Structures your core value proposition, revenue channels, target demographics, and initial unit economics.",
      metric1: "Revenue Model",
      val1: "Recurring B2B",
      metric2: "Initial Stage",
      val2: "Planning & Prototype"
    },
    {
      title: "Corporate Structure",
      step: "02",
      heading: "Legal Form & Shareholder Allocation",
      desc: "Evaluates Private Limited vs LLP vs OPC based on founder count, equity fundraising plans, and liability protection.",
      metric1: "Recommended Entity",
      val1: "Private Limited",
      metric2: "Director Quorum",
      val2: "2 Required (1 Resident)"
    },
    {
      title: "MCA Regulatory Guidance",
      step: "03",
      heading: "Statutory Pre-Screening & Filing Matrix",
      desc: "Cross-checks company name against MCA Rule 8 guidelines, SPICe+ requirements, and statutory director appointments.",
      metric1: "Rule 8 Compliance",
      val1: "Passed (No conflicts)",
      metric2: "Portal Channel",
      val2: "SPICe+ Part A / B"
    },
    {
      title: "Statutory Documentation",
      step: "04",
      heading: "Corporate Dossiers in PDF & DOCX",
      desc: "Generates 8 comprehensive corporate reports locally with executive summaries, compliance matrices, and source citations.",
      metric1: "File Formats",
      val1: "PDF & Editable Word",
      metric2: "Integrity",
      val2: "SHA-256 Checksummed"
    }
  ];

  const curr = previewTabs[activeTab];

  return (
    <div className="flex flex-col gap-24 overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 pt-12 text-center lg:text-left flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-center lg:self-start px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Deterministic Indian Corporate Formation & Regulatory Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Turn your business idea into an{" "}
            <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-300 dark:decoration-emerald-600 decoration-wavy decoration-2">
              enterprise-ready blueprint.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed max-w-2xl font-medium">
            VentureBlueprint guides entrepreneurs through company formation, MCA Rule 8 pre-screening, statutory compliance checklists, and generates 8 professional corporate formation documents—completely locally with zero external AI dependencies.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
            <Link
              to="/register"
              className="glass-button-primary text-sm py-3.5 px-7 shadow-md w-full sm:w-auto justify-center font-bold"
            >
              <span>Build Company Blueprint</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="glass-button-secondary text-sm py-3.5 px-6 w-full sm:w-auto justify-center font-bold"
            >
              Explore How It Works
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-8 justify-center lg:justify-start text-xs text-slate-800 dark:text-slate-300 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Companies Act 2013</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>MCA SPICe+ Integrated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% Local PDF & Word Engine</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative z-10 transition-colors">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Formation Dossier v1.0
                </span>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Republic of India</span>
            </div>

            <div className="py-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold">Target Entity</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Northstar Technologies Pvt. Ltd.</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">Recommended: Private Limited Company</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">Authorized Capital</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">₹10,00,000 INR</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">Filing Channel</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">SPICe+ (INC-32)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <b className="text-slate-900 dark:text-white block font-bold">Rule 8 Pre-screening Passed</b>
                  Proposed name satisfies MCA distinctiveness and structure suffix criteria.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span>8 Dossier Reports Ready</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Deterministic</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Blueprint Preview Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Interactive Working Dossier
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4">
            Every layer of your venture, connected.
          </h2>
          <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base mt-3 font-medium">
            Explore how VentureBlueprint links strategy, corporate structure, statutory MCA compliance, and financial assumptions into actionable working documents.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 transition-colors">
          {/* Aside navigation */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Blueprint Sections
            </span>
            {previewTabs.map((tab, idx) => (
              <button
                key={tab.title}
                onClick={() => setActiveTab(idx)}
                className={`text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                  activeTab === idx
                    ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{tab.step}</span>
                  <span>{tab.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === idx ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400"}`} />
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                  SECTION {curr.step} • STATUTORY FOUNDATION
                </span>
                <span className="glass-badge glass-badge-emerald text-[11px]">Ready to Model</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{curr.heading}</h3>
              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">{curr.desc}</p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{curr.metric1}</span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{curr.val1}</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{curr.metric2}</span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{curr.val2}</div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Validated against Indian Companies Act, 2013</span>
              <Link to="/register" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
                Customize in Blueprint <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8 Official Report Documents Grid */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            Professional Deliverables
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4">
            8 Production-Grade Reports Generated Locally
          </h2>
          <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base mt-3 font-medium">
            Every assessment outputs authentic, publication-quality PDF and editable Word (.docx) files ready for your founders, investors, and chartered accountants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: "A", title: "Company Formation Blueprint", desc: "Core entity roadmap, capitalization, and statutory milestones." },
            { id: "B", title: "MCA Compliance Assessment", desc: "Rule 8 name checks, SPICe+ requirements, and statutory findings." },
            { id: "C", title: "Founder & Director Report", desc: "Director eligibility, DIN allocations, and proposed shareholding." },
            { id: "D", title: "Document Requirement Report", desc: "Pre-incorporation evidence checklist (PAN, utility bill, NOC, DIR-2)." },
            { id: "E", title: "Organizational Structure Report", desc: "Statutory resident directors, management hierarchy, and CA/CS retainers." },
            { id: "F", title: "Industry Compliance Report", desc: "Sectoral licencing (FSSAI, DPDP Act 2023, GST thresholds, and Udyam)." },
            { id: "G", title: "Financial Planning Report", desc: "Charter capital, ROC filing fee estimates, and annual compliance budgets." },
            { id: "H", title: "Establishment Roadmap", desc: "Chronological 30-day Gantt timeline from name reservation to launch." }
          ].map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-600 transition-all">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center mb-4">
                  {doc.id}
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">{doc.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{doc.desc}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                <span>PDF + DOCX</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">ReportLab & python-docx</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 w-full">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 items-center transition-colors">
          <div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Clarity, Not False Certainty
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
              Deterministic Rules. Zero Hallucinations.
            </h2>
            <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mt-4 font-medium">
              VentureBlueprint does not rely on third-party generative LLMs or external AI APIs for legal research. All recommendations are derived from reviewed, deterministic Python rule engines and structured statutory reference tables under Indian law.
            </p>
            <div className="space-y-3 mt-6">
              {[
                "Every statutory requirement cites the exact Act, Section, and official portal URL.",
                "Internal task completion is never conflated with official government approval.",
                "Direct links to official MCA RUN, GST, Udyam, and FoSCoS portals are provided.",
                "All company records and generated documents stay in your private local storage."
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Official Regulatory Sources Registry</span>
            </div>
            <div className="space-y-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                <span>Ministry of Corporate Affairs (MCA)</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">Companies Act 2013</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                <span>Central Board of Indirect Taxes (CBIC)</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">CGST Act 2017</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                <span>Ministry of MSME</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">MSMED Act 2006</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                <span>DPIIT Startup India</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">Section 80-IAC</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Ministry of Electronics & IT (MeitY)</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">DPDP Act 2023</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-6 text-center pb-12">
        <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-blue-950 p-10 sm:p-14 rounded-3xl border border-blue-800 shadow-xl relative overflow-hidden text-white">
          <div className="relative z-10 space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Begin Your Venture
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
              Give your business the foundation it deserves.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto font-medium">
              Answer the guided questionnaire, run preliminary MCA Rule 8 checks, and generate your 8 corporate dossiers.
            </p>
            <div className="pt-4">
              <Link
                to="/register"
                className="glass-button-primary text-sm py-4 px-8 shadow-xl inline-flex font-bold"
              >
                <span>Start Your Blueprint Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
