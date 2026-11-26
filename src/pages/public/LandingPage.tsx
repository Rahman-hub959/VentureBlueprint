import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Scale,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Star,
  Users,
  ShieldCheck,
  MessageSquare,
  ChevronDown,
  Sparkles,
  FileText,
  BadgeCheck,
  Send,
  X,
  Phone,
  Mail,
  Building
} from "lucide-react";
import { CorpSetuLogo } from "../../components/CorpSetuLogo";

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<"ALL" | "LAW" | "CS" | "CA">("ALL");
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [consultationSubmitted, setConsultationSubmitted] = useState(false);

  // Consultation Form state
  const [consultData, setConsultData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "CS",
    companyName: "",
    notes: "",
  });

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultationSubmitted(true);
    setTimeout(() => {
      // Auto close after 2.5s
      setTimeout(() => {
        setConsultationModalOpen(false);
        setConsultationSubmitted(false);
      }, 2500);
    }, 500);
  };

  const faqs = [
    {
      q: "Do you help with new company registration?",
      a: "Yes. We support entrepreneurs and founders with the entire company registration process, drafting MoA & AoA, structural selection, MCA SPICe+ filings, PAN/TAN issuance, and initial 30-day compliance requirements."
    },
    {
      q: "Do you work with existing companies?",
      a: "Yes. We provide ongoing corporate secretarial, accounting, tax filing, and legal advisory support for existing Private Limited companies, LLPs, and SMEs across all 28 states in India."
    },
    {
      q: "Can you help with more than one requirement?",
      a: "Absolutely. Our platform is built on the 'One Bridge' philosophy: your Corporate Law, CS, and CA services are coordinated under one roof and one dashboard without needing to juggle 3 separate offices or advisors."
    },
    {
      q: "Will I receive advice specific to my business?",
      a: "Yes. Every consultation and compliance blueprint is tailored to your company's domain, operational jurisdiction, turnover bracket, founder shareholding, and specific statutory deadlines under Indian law."
    },
    {
      q: "What should I bring to the consultation?",
      a: "Bring any relevant company details, registration documents, notices, contracts, financial information, or questions you want to discuss. If you are starting a new company, a summary of your proposed business idea and preferred structure is helpful."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Ambient Background Elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-amber-100/40 via-blue-50/50 to-transparent dark:from-amber-950/15 dark:via-blue-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-xs">
                <BadgeCheck className="w-4 h-4 text-[#C59B27]" />
                <span>Trusted by 2000+ Startups & MSMEs Across India</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-extrabold text-[#0B2559] dark:text-white tracking-tight leading-[1.15]">
                CA, CS & Legal Services for Businesses That Want to Grow with Confidence
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl font-bold text-[#C59B27] dark:text-[#E5B842]">
                Start your company right. Run it right. Stay compliant.
              </p>

              {/* Description */}
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                From new company registration to ongoing compliance, corporate advisory, and legal support, we help startups, SMEs, and established companies handle their business responsibilities with clarity and confidence.
              </p>

              {/* Search / Service Discovery Box (As seen in Reference UI) */}
              <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center gap-2 max-w-xl">
                <div className="flex items-center gap-2.5 px-3 w-full text-slate-400">
                  <Search className="w-5 h-5 text-[#C59B27]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search: Company Registration, GST, ROC Filing, Trademark..."
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium"
                  />
                </div>
                <button
                  onClick={() => setConsultationModalOpen(true)}
                  className="corpsetu-btn-gold text-xs py-2.5 px-5 w-full sm:w-auto whitespace-nowrap"
                >
                  Check Price Instantly
                </button>
              </div>

              {/* Popular tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
                <span className="font-bold text-slate-900 dark:text-white">Popular:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  Pvt Ltd ₹6,999
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  GST ₹499/mo
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  Trademark ₹4,999
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  ROC Annual ₹1,499
                </span>
              </div>

              {/* Call-to-action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={() => setConsultationModalOpen(true)}
                  className="corpsetu-btn-gold text-sm py-3 px-6 shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Your Consultation</span>
                </button>
                <Link
                  to="/register"
                  className="corpsetu-btn-navy text-sm py-3 px-6 shadow-md"
                >
                  <span>Build Company Blueprint</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Mockup: Live Dashboard & Expert Preview (Matches Reference 2 & 3) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative z-10 space-y-5">
                {/* Header of Preview Box */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Compliance Dashboard
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Live Active
                  </span>
                </div>

                {/* Score Widget */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B2559] text-white flex flex-col items-center justify-center font-extrabold shadow-sm">
                    <span className="text-lg leading-none">96</span>
                    <span className="text-[9px] text-[#C59B27]">/100</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Compliance Health Score</h2>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                      Excellent — All major MCA & GST filings up to date
                    </p>
                  </div>
                </div>

                {/* Upcoming statutory cards */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Upcoming Statutory Deadlines
                  </span>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-[#C59B27]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">ROC Form AOC-4 Filing</div>
                        <div className="text-[10px] text-slate-500">Financial Statement Submission</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                      Due in 3 Days
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">GST GSTR-3B Return</div>
                        <div className="text-[10px] text-slate-500">Filed on 18 Oct · Acknowledged</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200">
                      Completed
                    </span>
                  </div>
                </div>

                {/* 3 Experts Online Section (From reference image) */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B2559] dark:text-[#E5B842] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#C59B27]" />
                      3 Professional Experts Online
                    </span>
                    <span className="text-[10px] text-slate-500">Avg response: ~2 min</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="w-7 h-7 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 text-[#0B2559] dark:text-blue-300 font-bold text-xs flex items-center justify-center mb-1">
                        ADV
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Advocate</div>
                      <div className="text-[9px] text-emerald-600 font-semibold">Online</div>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 dark:bg-amber-900 text-[#C59B27] font-bold text-xs flex items-center justify-center mb-1">
                        CS
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Company Sec</div>
                      <div className="text-[9px] text-emerald-600 font-semibold">Online</div>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 font-bold text-xs flex items-center justify-center mb-1">
                        CA
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Chartered Acc</div>
                      <div className="text-[9px] text-emerald-600 font-semibold">Online</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const chatBtn = document.getElementById("corpsetu-chat-trigger");
                      if (chatBtn) chatBtn.click();
                    }}
                    className="w-full corpsetu-btn-navy text-xs py-2.5 justify-center shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Live Chat with Experts</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Stats Banner */}
          <div className="mt-14 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-[#C59B27]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C59B27]" />
                ))}
              </div>
              <div className="text-xl font-extrabold text-[#0B2559] dark:text-white">4.9 Star Rating</div>
              <div className="text-xs text-slate-500 font-medium">From 1,200+ Founder Reviews</div>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-extrabold text-[#0B2559] dark:text-white">2000+ Clients</div>
              <div className="text-xs text-slate-500 font-medium">Startups & MSMEs Trust Us</div>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-extrabold text-[#0B2559] dark:text-white">100% On-Time</div>
              <div className="text-xs text-slate-500 font-medium">No MCA or GST Penalties Guarantee</div>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-extrabold text-[#0B2559] dark:text-white">Pan India Coverage</div>
              <div className="text-xs text-slate-500 font-medium">Active in 28+ States & UTs</div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          THREE PILLARS OF COMPLIANCE SECTION (Matches Reference Mockup)
          ========================================================================= */}
      <section id="pillars" className="py-16 md:py-24 bg-slate-50/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#C59B27] dark:text-[#E5B842]">
              All Your Compliance · One Dashboard · One Team
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0B2559] dark:text-white tracking-tight">
              Three Pillars of Corporate Compliance
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Lawyer + CS + CA — No more juggling 3 separate offices, 3 calls, and 3 confusing fees.
            </p>
          </div>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Card 1: Corporate Law */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:border-[#C59B27] transition-all hover:-translate-y-1 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-[#C59B27]">
                  <Scale className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#0B2559] dark:text-white">Corporate Law</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    Company registration, contracts, founder agreements, regulatory & compliance advisory.
                  </p>
                </div>
                <div className="text-sm font-bold text-[#C59B27]">Starting from ₹999</div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Business agreements & contracts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Trademark & IP protection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Regulatory notices & dispute prevention</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Restructuring and founder equity agreements</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setConsultData(prev => ({ ...prev, serviceType: "LAW" }));
                  setConsultationModalOpen(true);
                }}
                className="w-full corpsetu-btn-navy text-xs py-3 justify-center"
              >
                Request Legal Service
              </button>
            </div>

            {/* Card 2: CS Services */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-[#C59B27] dark:border-[#C59B27] shadow-xl relative space-y-6 flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C59B27] text-white px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
                Built-in Blueprint Engine
              </div>

              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#0B2559] dark:text-blue-300">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#0B2559] dark:text-white">CS Services</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    ROC filings, board meetings, secretarial compliance, MCA SPICe+ dossiers.
                  </p>
                </div>
                <div className="text-sm font-bold text-[#C59B27]">Starting from ₹1,499</div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Complete Company Setup Blueprint generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Form ADT-1, INC-20A, AOC-4, MGT-7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Board & shareholder resolutions & minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Statutory registers & director appointments</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="w-full corpsetu-btn-gold text-xs py-3 justify-center"
              >
                <span>Launch CS Blueprint Wizard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3: CA Services */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:border-[#C59B27] transition-all hover:-translate-y-1 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#0B2559] dark:text-white">CA Services</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    GST filing, taxation, financial reporting, bookkeeping and audit assistance.
                  </p>
                </div>
                <div className="text-sm font-bold text-[#C59B27]">Starting from ₹499</div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Accounting & monthly bookkeeping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>GST GSTR-1 & 3B return filing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Income tax returns (ITR-6, ITR-5)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Annual financial statements & audit support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setConsultData(prev => ({ ...prev, serviceType: "CA" }));
                  setConsultationModalOpen(true);
                }}
                className="w-full corpsetu-btn-navy text-xs py-3 justify-center"
              >
                Request CA Service
              </button>
            </div>
          </div>

          {/* How It Works (1-2-3 Pipeline) */}
          <div className="pt-8 max-w-4xl mx-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-8">
              How It Works
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#C59B27] text-white font-extrabold flex items-center justify-center mx-auto text-sm">
                  1
                </div>
                <h5 className="font-extrabold text-sm text-[#0B2559] dark:text-white">Tell Your Need</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Share your requirement in seconds via search or questionnaire form.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#0B2559] text-white font-extrabold flex items-center justify-center mx-auto text-sm">
                  2
                </div>
                <h5 className="font-extrabold text-sm text-[#0B2559] dark:text-white">Get Expert Assigned</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Matched certified CA, CS, or Lawyer assigned to your case immediately.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center mx-auto text-sm">
                  3
                </div>
                <h5 className="font-extrabold text-sm text-[#0B2559] dark:text-white">Track & Stay Compliant</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Download certified dossiers, track deadlines, and avoid statutory penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          PROFESSIONAL SUPPORT FOR EVERY STAGE (User Copy)
          ========================================================================= */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#C59B27] dark:text-[#E5B842]">
              Professional Support For Every Stage Of Your Business
            </h2>
            <h3 className="text-3xl font-extrabold text-[#0B2559] dark:text-white tracking-tight">
              Running a business involves more than serving customers and generating revenue.
            </h3>
          </div>

          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed text-center max-w-3xl mx-auto">
            You also need the right structure, accurate documentation, timely compliance, and sound legal guidance.
            Our CA, CS, and legal professionals provide practical support for both new company registration and existing business operations, so you can make important decisions with greater confidence.
            Whether you are launching a new venture, expanding an existing company, or resolving a corporate or legal requirement, we help you move forward with a clear plan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-base font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-[#C59B27]" />
                Company Registration and Business Setup
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Turn your business idea into a properly structured company with support throughout the registration process.
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2">
                <li>• Company and business registration guidance</li>
                <li>• Selection of the appropriate business structure (Pvt Ltd, LLP, OPC)</li>
                <li>• Documentation and application support</li>
                <li>• Startup compliance planning</li>
                <li>• Assistance for founders and first-time business owners</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-base font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0B2559] dark:text-blue-300" />
                Corporate Secretarial Services
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Keep your company’s records, filings, and statutory responsibilities organized.
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2">
                <li>• Annual compliance support</li>
                <li>• Corporate documentation and SPICe+ dossiers</li>
                <li>• Board and shareholder resolutions</li>
                <li>• Statutory registers and records</li>
                <li>• Company changes and updates (Directors, Capital, Office)</li>
                <li>• Compliance calendars and reminders</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-base font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Accounting and Financial Support
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Get better visibility into your business finances and make decisions based on accurate information.
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2">
                <li>• Accounting and bookkeeping support</li>
                <li>• Financial reporting and statements</li>
                <li>• Tax planning and GST compliance assistance</li>
                <li>• Business financial reviews</li>
                <li>• Support with financial documentation for banking and investors</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-base font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C59B27]" />
                Legal and Business Advisory
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Protect your business with practical legal guidance for everyday decisions and important transactions.
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2">
                <li>• Business agreements and commercial contracts</li>
                <li>• Founder agreements, vesting, and NDA documentation</li>
                <li>• Corporate legal support & regulatory guidance</li>
                <li>• Risk identification and prevention</li>
                <li>• Support for business restructuring and expansion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          WHY BUSINESSES CHOOSE US (User Copy)
          ========================================================================= */}
      <section id="why-us" className="py-16 md:py-24 bg-slate-50/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#C59B27] dark:text-[#E5B842]">
              Why Businesses Choose Us
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0B2559] dark:text-white tracking-tight">
              One Professional Partner for Multiple Business Needs
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              CA, CS, and legal requirements often overlap. Our integrated approach helps reduce confusion and saves you from coordinating with multiple disconnected providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-[#C59B27] flex items-center justify-center font-bold">
                01
              </div>
              <h4 className="font-extrabold text-base text-[#0B2559] dark:text-white">Clear Advice Without Unnecessary Complexity</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Business compliance and legal processes can feel overwhelming. We explain your options in straightforward language, so you understand what needs to happen and why.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#0B2559] dark:text-blue-300 flex items-center justify-center font-bold">
                02
              </div>
              <h4 className="font-extrabold text-base text-[#0B2559] dark:text-white">Support for Both New and Established Companies</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Whether you are registering your first company or managing an established business, our services can be tailored to your current stage and priorities.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                03
              </div>
              <h4 className="font-extrabold text-base text-[#0B2559] dark:text-white">Practical, Business-Focused Solutions</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                We focus on solutions that support your actual business goals, not just paperwork. Our aim is to help you remain compliant while building a stronger foundation for growth.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          COMPLIANCE SUPPORT FOR EXISTING COMPANIES & SMES (User Copy)
          ========================================================================= */}
      <section id="compliance-calendar" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#0B2559] to-[#061838] rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
              Ongoing Governance Assistance
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Compliance Support for Existing Companies and SMEs
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Staying compliant is an ongoing responsibility, not a one-time task. Our compliance support helps existing companies and SMEs manage their corporate, financial, and legal obligations in an organized and timely manner. We help you stay focused on your business while keeping essential compliance work on track.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-200">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C59B27] flex-shrink-0 mt-0.5" />
              <span>Annual and periodic statutory filings (MCA, ROC, Income Tax, GST)</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C59B27] flex-shrink-0 mt-0.5" />
              <span>Corporate records and statutory registers maintenance</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C59B27] flex-shrink-0 mt-0.5" />
              <span>Board meeting and shareholder documentation</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C59B27] flex-shrink-0 mt-0.5" />
              <span>Preparation of board resolutions and minutes</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C59B27] flex-shrink-0 mt-0.5" />
              <span>Changes to directors, shareholders, or registered office details</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C59B27] flex-shrink-0 mt-0.5" />
              <span>Compliance calendars and automated deadline tracking</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                setConsultData(prev => ({ ...prev, serviceType: "ALL", notes: "Existing SME Annual Compliance Review" }));
                setConsultationModalOpen(true);
              }}
              className="corpsetu-btn-gold text-xs py-3 px-6 shadow-md"
            >
              Book Compliance Review Consultation
            </button>
            <Link
              to="/complaints"
              className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors"
            >
              Have a Grievance? Register Complaint
            </Link>
          </div>
        </div>
      </section>


      {/* =========================================================================
          FAQ ACCORDION (Exact User Copy)
          ========================================================================= */}
      <section id="faq" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">Frequently Asked Questions</h2>
            <h3 className="text-3xl font-extrabold text-[#0B2559] dark:text-white">Have Questions About Your Business Requirements?</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-[#0B2559] dark:text-white hover:text-[#C59B27] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-[#C59B27]" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* =========================================================================
          TAKE THE NEXT STEP / FINAL CTA (Exact User Copy)
          ========================================================================= */}
      <section id="book-consultation" className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <CorpSetuLogo size="lg" className="justify-center" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2559] dark:text-white tracking-tight">
            Take the Next Step with Confidence
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
            Whether you are starting a new company or managing an existing business, the right professional guidance can help you avoid confusion and make better decisions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="corpsetu-btn-gold text-sm py-3.5 px-8 shadow-lg text-base"
            >
              <Calendar className="w-5 h-5" />
              <span>Book a Consultation Today</span>
            </button>
            <Link
              to="/register"
              className="corpsetu-btn-navy text-sm py-3.5 px-8 shadow-md text-base"
            >
              <span>Start Company Registration</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>


      {/* =========================================================================
          CONSULTATION BOOKING MODAL
          ========================================================================= */}
      {consultationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => setConsultationModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CorpSetuLogo size="sm" showTagline={false} />
              </div>
              <h3 className="text-xl font-extrabold text-[#0B2559] dark:text-white">Book a Professional Consultation</h3>
              <p className="text-xs text-slate-500">
                Discuss your CA, CS, corporate, accounting, compliance, or legal requirements with our certified experts.
              </p>
            </div>

            {consultationSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-base text-emerald-900 dark:text-emerald-100">Consultation Scheduled!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Our compliance officer will reach out via WhatsApp and phone within 15 minutes with meeting details.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-3.5 text-left">
                {/* Service Selection Tabs */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Select Required Service Pillar
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    {[
                      { key: "CS", label: "CS / MCA" },
                      { key: "CA", label: "CA / Tax" },
                      { key: "LAW", label: "Legal" },
                      { key: "ALL", label: "All Three" },
                    ].map((tab) => (
                      <button
                        type="button"
                        key={tab.key}
                        onClick={() => setConsultData({ ...consultData, serviceType: tab.key })}
                        className={`py-2 px-1 rounded-xl border text-center transition-all ${
                          consultData.serviceType === tab.key
                            ? "bg-[#0B2559] text-white border-[#0B2559]"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#C59B27]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={consultData.name}
                      onChange={(e) => setConsultData({ ...consultData, name: e.target.value })}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={consultData.phone}
                      onChange={(e) => setConsultData({ ...consultData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={consultData.email}
                      onChange={(e) => setConsultData({ ...consultData, email: e.target.value })}
                      placeholder="founder@company.in"
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Company / Idea Name</label>
                    <input
                      type="text"
                      value={consultData.companyName}
                      onChange={(e) => setConsultData({ ...consultData, companyName: e.target.value })}
                      placeholder="e.g. Lumora Technologies"
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Brief Requirements</label>
                  <textarea
                    rows={2}
                    value={consultData.notes}
                    onChange={(e) => setConsultData({ ...consultData, notes: e.target.value })}
                    placeholder="Describe your registration, GST, secretarial, or legal requirement..."
                    className="w-full glass-input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full corpsetu-btn-gold text-xs py-3 justify-center shadow-md font-bold"
                >
                  Confirm Free Consultation Call
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
