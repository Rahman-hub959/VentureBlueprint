import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Users,
  Calendar,
  CalendarCheck,
  Shield,
  Scale,
  ArrowUpRight,
  Check,
  AlertCircle,
  ChevronDown,
  Landmark,
  Building2,
  Calculator,
  Receipt,
  FileSpreadsheet,
  Download,
  Search,
  BookOpen,
  HelpCircle,
  PhoneCall,
  Lock,
  Award,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ComplianceScoreRing } from "../../components/ComplianceScoreRing";
import { projectsApi, documentsApi, complianceApi, consultationsApi } from "../../api/client";

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active Pillar: "CS" (Secretarial & Setup), "CA" (Tax & Accounting), "LAW" (Contracts & Advisory)
  const [activePillar, setActivePillar] = useState<"CS" | "CA" | "LAW">(() => {
    return (localStorage.getItem("corpsetu_active_pillar") as "CS" | "CA" | "LAW") || "CS";
  });

  const handleSelectPillar = (pillar: "CS" | "CA" | "LAW") => {
    setActivePillar(pillar);
    localStorage.setItem("corpsetu_active_pillar", pillar);
  };

  const [projects, setProjects] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [completedDeadlines, setCompletedDeadlines] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("vb_completed_deadlines");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // CA Tools State
  const [estimatedProfit, setEstimatedProfit] = useState<number>(1500000);
  const [taxTurnover, setTaxTurnover] = useState<number>(4500000);
  const [gstQuarter, setGstQuarter] = useState<string>("Q3 (Oct - Dec)");
  const [caConsultTopic, setCaConsultTopic] = useState<string>("GST & Advance Tax Planning");

  // LAW Tools State
  const [contractType, setContractType] = useState<string>("founder_agreement");
  const [founderCount, setFounderCount] = useState<number>(2);
  const [vestingYears, setVestingYears] = useState<number>(4);
  const [cliffMonths, setCliffMonths] = useState<number>(12);
  const [tmSearchQuery, setTmSearchQuery] = useState<string>("");
  const [tmSearchResult, setTmSearchResult] = useState<any>(null);

  // Dedicated Consultation & Registration Modals (CS, CA, LAW)
  const [activeConsultationModal, setActiveConsultationModal] = useState<"CS" | "CA" | "LAW" | null>(null);
  const [submittingConsultation, setSubmittingConsultation] = useState<boolean>(false);

  // CS Form State
  const [csForm, setCsForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    alternate_phone: "",
    company_name: "",
    preferred_entity_type: "Private Limited Company (Pvt Ltd)",
    service_category: "New Company Incorporation (SPICe+)",
    notes: ""
  });

  // CA Form State
  const [caForm, setCaForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    alternate_phone: "",
    company_name: "",
    service_category: "GST Registration & Monthly Filing (GSTR-1, 3B)",
    notes: ""
  });

  // LAW Form State
  const [lawForm, setLawForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    alternate_phone: "",
    company_name: "",
    service_category: "Founder Vesting & Co-founder Agreement",
    notes: ""
  });

  // Sync user details to forms when authenticated user is loaded
  useEffect(() => {
    if (user) {
      setCsForm((prev) => ({
        ...prev,
        full_name: prev.full_name || user.full_name || "",
        email: prev.email || user.email || "",
        phone_number: prev.phone_number || user.phone_number || "",
      }));
      setCaForm((prev) => ({
        ...prev,
        full_name: prev.full_name || user.full_name || "",
        email: prev.email || user.email || "",
        phone_number: prev.phone_number || user.phone_number || "",
      }));
      setLawForm((prev) => ({
        ...prev,
        full_name: prev.full_name || user.full_name || "",
        email: prev.email || user.email || "",
        phone_number: prev.phone_number || user.phone_number || "",
      }));
    }
  }, [user]);

  const [consultationSuccessModal, setConsultationSuccessModal] = useState<{
    id: string;
    expert: string;
    topic: string;
    email: string;
    pillar: string;
    pdf_url?: string;
  } | null>(null);

  const handleConsultationSubmit = async (pillar: "CS" | "CA" | "LAW") => {
    setSubmittingConsultation(true);
    try {
      let payload: any = { pillar };
      if (pillar === "CS") {
        if (!csForm.phone_number.trim()) {
          showToast("Please enter your contact phone number", "warning");
          setSubmittingConsultation(false);
          return;
        }
        payload = {
          pillar: "CS",
          full_name: csForm.full_name || user?.full_name || "Client",
          email: csForm.email || user?.email,
          phone_number: csForm.phone_number,
          alternate_phone: csForm.alternate_phone || undefined,
          company_name: csForm.company_name || undefined,
          preferred_entity_type: csForm.preferred_entity_type,
          service_category: csForm.service_category,
          topic: `${csForm.service_category} · ${csForm.company_name || "Proposed Entity"}`,
          notes: csForm.notes || `CS setup request under ${csForm.preferred_entity_type}`,
          preferred_time_slot: "Within 24 to 48 Hours",
        };
      } else if (pillar === "CA") {
        if (!caForm.phone_number.trim()) {
          showToast("Please enter your contact phone number", "warning");
          setSubmittingConsultation(false);
          return;
        }
        payload = {
          pillar: "CA",
          full_name: caForm.full_name || user?.full_name || "Client",
          email: caForm.email || user?.email,
          phone_number: caForm.phone_number,
          alternate_phone: caForm.alternate_phone || undefined,
          company_name: caForm.company_name || undefined,
          service_category: caForm.service_category,
          topic: `${caForm.service_category} · ${caForm.company_name || "Tax Advisory"}`,
          notes: caForm.notes || `CA consultation for ${caForm.service_category}`,
          preferred_time_slot: "Within 24 to 48 Hours",
        };
      } else if (pillar === "LAW") {
        if (!lawForm.phone_number.trim()) {
          showToast("Please enter your contact phone number", "warning");
          setSubmittingConsultation(false);
          return;
        }
        payload = {
          pillar: "LAW",
          full_name: lawForm.full_name || user?.full_name || "Client",
          email: lawForm.email || user?.email,
          phone_number: lawForm.phone_number,
          alternate_phone: lawForm.alternate_phone || undefined,
          company_name: lawForm.company_name || undefined,
          service_category: lawForm.service_category,
          topic: `${lawForm.service_category} · ${lawForm.company_name || "Legal Matter"}`,
          notes: lawForm.notes || `Legal counsel request for ${lawForm.service_category}`,
          preferred_time_slot: "Within 24 to 48 Hours",
        };
      }

      const res = await consultationsApi.create(payload);
      setActiveConsultationModal(null);
      setConsultationSuccessModal({
        id: res.id,
        expert: res.assigned_expert || (pillar === "CS" ? "CS Priyanjali Sen" : pillar === "CA" ? "CA Aniket Kulkarni" : "Adv. Rajesh Varma"),
        topic: res.topic,
        email: res.email || user?.email || "your email",
        pillar: res.pillar,
        pdf_url: res.pdf_summary_url || `/api/v1/consultations/${res.id}/pdf`,
      });
      showToast("Consultation registered! Structured PDF summary generated.", "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to submit consultation request", "warning");
    } finally {
      setSubmittingConsultation(false);
    }
  };

  const toggleDeadline = (id: string) => {
    setCompletedDeadlines((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("vb_completed_deadlines", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const projList = await projectsApi.list();
        setProjects(projList);

        if (projList.length > 0) {
          const firstProjId = projList[0].id;
          const [docList, taskList] = await Promise.all([
            documentsApi.list(firstProjId).catch(() => []),
            complianceApi.getTasks(firstProjId).catch(() => [])
          ]);
          setDocuments(docList);
          setTasks(taskList);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalProjects = projects.length;
  const completedAssessments = projects.filter(p => p.completion_percentage >= 80).length;
  const pendingTasks = tasks.filter(t => t.status !== "Completed").length;
  const activeProject = projects[0];

  // CS Roadmap Stages
  const roadmapStages = [
    {
      stage: 1,
      title: "SPICe+ Part A: Name Reservation",
      mca_form: "RUN / SPICe+ Part A",
      timeline: "1 - 2 Days",
      statutory_rule: "Rule 8, Companies (Incorporation) Rules, 2014",
      description: "Reservation of proposed corporate name with Central Registration Centre (CRC). Valid for 20 days upon approval.",
      action_items: [
        "Search trade mark registry (Class 1-45) for phonetic conflicts",
        "Submit up to 2 unique name choices via MCA21 portal",
        "Obtain SRN and Central Registration Centre approval letter"
      ],
      status: (activeProject?.completion_percentage || 0) >= 20 ? "Completed" : "In Progress"
    },
    {
      stage: 2,
      title: "DSC & DIN Preparation",
      mca_form: "Class 3 DSC & SPICe+ DIN",
      timeline: "2 - 3 Days",
      statutory_rule: "Section 153, Companies Act, 2013",
      description: "Digital Signature Certificates (Class 3 DSC) for all proposed directors and integrated Director Identification Number (DIN) allocation.",
      action_items: [
        "Procure USB token Class 3 DSC with encrypted private key",
        "Verify PAN, Aadhaar, and video verification of subscribers",
        "Apply for DIN for up to 3 directors directly inside SPICe+ Part B"
      ],
      status: (activeProject?.completion_percentage || 0) >= 40 ? "Completed" : (activeProject?.completion_percentage || 0) >= 20 ? "In Progress" : "Pending"
    },
    {
      stage: 3,
      title: "SPICe+ Part B, e-MOA & e-AOA",
      mca_form: "INC-32, INC-33, INC-34, AGILE-PRO-S",
      timeline: "3 - 5 Days",
      statutory_rule: "Section 7, Companies Act, 2013",
      description: "Unified incorporation filing: Memorandum of Association (MOA), Articles of Association (AOA), PAN, TAN, EPFO, ESIC, and Bank Account.",
      action_items: [
        "Execute electronic MOA (INC-33) and e-AOA (INC-34) with digital signatures",
        "Complete AGILE-PRO-S (INC-35) for GSTIN, EPFO, and ESIC registrations",
        "Attach registered office utility bill, owner NOC, and director declarations (INC-9)"
      ],
      status: (activeProject?.completion_percentage || 0) >= 80 ? "Completed" : (activeProject?.completion_percentage || 0) >= 40 ? "In Progress" : "Pending"
    },
    {
      stage: 4,
      title: "CRC Scrutiny & Certificate of Incorporation",
      mca_form: "COI, CIN, PAN & TAN",
      timeline: "2 - 4 Days",
      statutory_rule: "Section 7(2), Companies Act, 2013",
      description: "Central Registration Centre audits filings and issues the official Certificate of Incorporation (COI) containing 21-digit CIN.",
      action_items: [
        "CRC Registrar examination and verification of declarations",
        "Issuance of Certificate of Incorporation (Form INC-11) via email",
        "Allotment of Corporate Identity Number (CIN), Company PAN and TAN"
      ],
      status: activeProject?.status === "blueprint_ready" ? "In Progress" : "Pending"
    },
    {
      stage: 5,
      title: "Post-Incorporation Commencement",
      mca_form: "Form ADT-1 & Form INC-20A",
      timeline: "Within 30 to 180 Days",
      statutory_rule: "Section 10A & Section 139, Companies Act, 2013",
      description: "Mandatory statutory compliance to legally commence business operations and avoid non-filing penalties.",
      action_items: [
        "Open corporate current bank account and deposit subscriber capital",
        "Appoint Statutory Auditor via Form ADT-1 within 30 days",
        "File Declaration of Business Commencement via Form INC-20A within 180 days"
      ],
      status: "Upcoming"
    }
  ];

  // CS Statutory Deadlines
  const statutoryDeadlines = [
    {
      id: "adt_1",
      title: "Statutory Auditor Appointment",
      form_name: "Form ADT-1",
      deadline_window: "Within 30 Days of COI",
      statutory_provision: "Section 139(6), Companies Act, 2013",
      remaining_days: 28,
      severity: "critical",
      description: "Board of Directors must appoint the first independent Chartered Accountant within 30 days of registration.",
      consequence: "Statutory penalty under §147 on company and defaulting officers."
    },
    {
      id: "first_board_meeting",
      title: "Convene First Board Meeting",
      form_name: "Board Minutes & Resolutions",
      deadline_window: "Within 30 Days of COI",
      statutory_provision: "Section 173(1), Companies Act, 2013",
      remaining_days: 30,
      severity: "high",
      description: "First physical or VC board meeting to take on record COI, approve bank account opening, and authorize share certificates.",
      consequence: "Violation of mandatory Secretarial Standard-1 (SS-1)."
    },
    {
      id: "inc_20a",
      title: "Commencement of Business",
      form_name: "Form INC-20A",
      deadline_window: "Within 180 Days of COI",
      statutory_provision: "Section 10A & Rule 23A",
      remaining_days: 178,
      severity: "critical",
      description: "Verification that every subscriber has deposited their committed equity capital into the company bank account.",
      consequence: "Company liable to fine of ₹50,000 + ₹1,000/day and strike-off by ROC."
    },
    {
      id: "dir_3_kyc",
      title: "Annual Director KYC",
      form_name: "Form DIR-3 KYC / Web KYC",
      deadline_window: "Annually on or before 30th Sept",
      statutory_provision: "Rule 12A, Directors Rules, 2014",
      remaining_days: 220,
      severity: "medium",
      description: "Mandatory annual KYC verification for all individuals holding a valid DIN via mobile & email OTP.",
      consequence: "DIN deactivated and ₹5,000 statutory MCA reactivation fee."
    }
  ];

  // CA Compliance Schedule & Tax Calculations
  const calculatedTax = Math.round(estimatedProfit * 0.22 * 1.10); // 22% Corporate Tax + 10% Surcharge/Cess
  const advanceTaxQ1 = Math.round(calculatedTax * 0.15);
  const advanceTaxQ2 = Math.round(calculatedTax * 0.45);
  const advanceTaxQ3 = Math.round(calculatedTax * 0.75);
  const advanceTaxQ4 = calculatedTax;

  const caDeadlines = [
    {
      id: "gstr_1",
      title: "GSTR-1 (Outward Supplies)",
      period: "Monthly by 11th",
      due_date: "11th of each Month",
      status: "Up to Date",
      law: "Section 37, CGST Act, 2017",
      description: "Report all B2B and B2C sales invoices and generate automated invoice matches for recipients."
    },
    {
      id: "gstr_3b",
      title: "GSTR-3B (Summary Return & Tax Payment)",
      period: "Monthly by 20th",
      due_date: "20th of each Month",
      status: "Filing Ready",
      law: "Section 39, CGST Act, 2017",
      description: "Self-assessed summary of input tax credit (ITC) claimed and net tax liability settled in cash."
    },
    {
      id: "advance_tax_q3",
      title: "Advance Tax Q3 Installment (75%)",
      period: "15th December",
      due_date: "15-Dec-2026",
      status: "Upcoming",
      law: "Section 208 & 211, Income Tax Act, 1961",
      description: "Mandatory corporate tax installment for entities with estimated tax liability exceeding ₹10,000."
    },
    {
      id: "tds_challan_281",
      title: "TDS Payment (Challan 281)",
      period: "7th of each Month",
      due_date: "07th of each Month",
      status: "Verified",
      law: "Section 200(1), Income Tax Act",
      description: "Deposit of tax withheld on salaries, contractor payments (194C), professional fees (194J), and rent."
    }
  ];

  // Law Trademark Search Handler
  const handleTmSearch = () => {
    if (!tmSearchQuery.trim()) return;
    const query = tmSearchQuery.toLowerCase();
    const isConflict = ["tata", "apple", "google", "reliance", "corpset"].some(k => query.includes(k));
    setTmSearchResult({
      query: tmSearchQuery,
      isAvailable: !isConflict,
      recommendedClass: "Class 42 (Software & SaaS) & Class 35 (Business Consultancy)",
      riskLevel: isConflict ? "High (Phonetic / Direct Conflict Detected)" : "Low (Distinctive Corporate Mark)",
      registryStatus: isConflict ? "Likely Objection under §11(1) of TM Act" : "Clear for TM-A expedited filing"
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Welcome Banner with Spatial Surface */}
      <div className="spatial-surface p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-colors">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-corpset-navy dark:text-corpset-gold spatial-glass-pill px-3 py-1 rounded-full border border-corpset-gold/30">
            <Sparkles className="w-3.5 h-3.5 text-corpset-gold" />
            <span>CorpSetu Platform · Welcome Back, {user?.full_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Corporate Operations &amp; Compliance Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-xl font-medium leading-relaxed">
            One unified bridge for Law, Company Secretarial (CS), and Chartered Accountancy (CA). Select your active service pillar below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 w-full md:w-auto">
          <Link
            to="/projects/new"
            className="corpsetu-btn-navy text-xs py-3 px-5 shadow-sm justify-center font-bold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Company Project</span>
          </Link>
          <Link
            to="/complaints"
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 spatial-glass-pill"
            title="File Grievance / Ticket"
          >
            <HelpCircle className="w-4 h-4 text-corpset-gold" />
            <span>Support Desk</span>
          </Link>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3-PILLAR SERVICE SELECTOR (CS, CA, LAW) - PERFECT SQUARE CARDS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="spatial-surface p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#C59B27] animate-ping" />
            <span>Active Corporate Advisory Desk</span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[#C59B27] border border-amber-500/20">
            Unified Multi-Disciplinary Suite · One Company Record
          </span>
        </div>

        {/* 3 Perfect Square Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {/* Card 1: CS Services - Perfect Square */}
          <button
            type="button"
            onClick={() => {
              handleSelectPillar("CS");
              setActiveConsultationModal("CS");
            }}
            className={`w-full aspect-square p-5 sm:p-6 rounded-3xl text-left transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-md hover:shadow-xl ${
              activePillar === "CS"
                ? "spatial-card-gold ring-2 ring-emerald-500/50"
                : "spatial-surface border border-slate-200 dark:border-slate-800 hover:border-emerald-400"
            }`}
          >
            {/* Top Row: Icon & Status Indicator */}
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  activePillar === "CS"
                    ? "bg-emerald-600 text-white shadow-md scale-105"
                    : "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 group-hover:scale-105"
                }`}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Click to Consult</span>
              </span>
            </div>

            {/* Middle: Domain Details & Scope */}
            <div className="space-y-2 my-auto py-1">
              <div>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  CS Services
                </h4>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Company Secretarial &amp; MCA Setup
                </p>
              </div>

              <div className="text-[11px] font-extrabold text-[#C59B27] uppercase tracking-wide">
                Statutory MCA &amp; ROC Desk
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>SPICe+ Part A &amp; B Incorporation</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>ROC Annual Returns &amp; Registers</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Director DIN, DSC &amp; e-KYC Compliance</span>
                </li>
              </ul>
            </div>

            {/* Bottom: Action Trigger Button */}
            <div className="w-full pt-1">
              <div className="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold text-center transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2">
                <span>Book CS Consultation Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Card 2: CA Services - Perfect Square */}
          <button
            type="button"
            onClick={() => {
              handleSelectPillar("CA");
              setActiveConsultationModal("CA");
            }}
            className={`w-full aspect-square p-5 sm:p-6 rounded-3xl text-left transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-md hover:shadow-xl ${
              activePillar === "CA"
                ? "spatial-card-gold ring-2 ring-amber-500/50"
                : "spatial-surface border border-slate-200 dark:border-slate-800 hover:border-amber-400"
            }`}
          >
            {/* Top Row: Icon & Status Indicator */}
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  activePillar === "CA"
                    ? "bg-amber-600 text-white shadow-md scale-105"
                    : "bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 group-hover:scale-105"
                }`}
              >
                <Landmark className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Click to Consult</span>
              </span>
            </div>

            {/* Middle: Domain Details & Scope */}
            <div className="space-y-2 my-auto py-1">
              <div>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  CA Services
                </h4>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                  Chartered Accountant &amp; Tax Compliance
                </p>
              </div>

              <div className="text-[11px] font-extrabold text-[#C59B27] uppercase tracking-wide">
                Corporate Tax &amp; GST Advisory
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>GST Returns (GSTR-1, 3B) &amp; ITC Match</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Advance Tax, TDS &amp; Corporate ITR</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Monthly Bookkeeping &amp; Audit Schedules</span>
                </li>
              </ul>
            </div>

            {/* Bottom: Action Trigger Button */}
            <div className="w-full pt-1">
              <div className="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold text-center transition-all bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center justify-center gap-2">
                <span>Book CA Consultation Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Card 3: Corporate Law - Perfect Square */}
          <button
            type="button"
            onClick={() => {
              handleSelectPillar("LAW");
              setActiveConsultationModal("LAW");
            }}
            className={`w-full aspect-square p-5 sm:p-6 rounded-3xl text-left transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-md hover:shadow-xl ${
              activePillar === "LAW"
                ? "spatial-card-navy ring-2 ring-blue-500/50"
                : "spatial-surface border border-slate-200 dark:border-slate-800 hover:border-blue-400"
            }`}
          >
            {/* Top Row: Icon & Status Indicator */}
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  activePillar === "LAW"
                    ? "bg-[#0B2559] dark:bg-blue-600 text-white shadow-md scale-105"
                    : "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 group-hover:scale-105"
                }`}
              >
                <Scale className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Click to Consult</span>
              </span>
            </div>

            {/* Middle: Domain Details & Scope */}
            <div className="space-y-2 my-auto py-1">
              <div>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  Corporate Law
                </h4>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                  Contracts, IP &amp; Legal Advisory
                </p>
              </div>

              <div className="text-[11px] font-extrabold text-[#C59B27] uppercase tracking-wide">
                Corporate Law &amp; IP Protection
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Founder Vesting &amp; Bilateral NDAs</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Trademark Class Search &amp; IP Protection</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Commercial Contracts &amp; Dispute Shield</span>
                </li>
              </ul>
            </div>

            {/* Bottom: Action Trigger Button */}
            <div className="w-full pt-1">
              <div className="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold text-center transition-all bg-[#0B2559] hover:bg-[#153a80] text-white shadow-md flex items-center justify-center gap-2">
                <span>Book Legal Consultation Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* PILLAR 1: CS SERVICES (SECRETARIAL, INCORPORATION & MCA)      */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activePillar === "CS" && (
        <div className="space-y-6">
          {/* CS Metric Cards Grid - Spatial UI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="spatial-card p-5 group">
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FolderKanban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalProjects}</div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-semibold">Active venture workspaces</p>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(totalProjects * 10, 100)}%` }} />
              </div>
            </div>

            <div className="spatial-card p-5 group">
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Completed Assessments</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{completedAssessments}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">Ready for document compilation</p>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${totalProjects > 0 ? (completedAssessments / totalProjects) * 100 : 100}%` }} />
              </div>
            </div>

            <div className="spatial-card p-5 group">
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Generated Documents</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{documents.length}</div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-semibold">PDF &amp; DOCX corporate dossiers</p>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(documents.length * 20, 100)}%` }} />
              </div>
            </div>

            <div className="spatial-card p-5 group">
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Requirements</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{pendingTasks}</div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-1">Statutory actions requiring review</p>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(pendingTasks * 15, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* CS Quick Action Hub */}
          <div className="spatial-card p-6">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-4">CS Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link
                to="/projects/new"
                className="p-3.5 rounded-xl spatial-glass-pill hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
              >
                <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Create Project</span>
              </Link>

              {activeProject ? (
                <>
                  <Link
                    to={`/projects/${activeProject.id}/questionnaire`}
                    className="p-3.5 rounded-xl spatial-glass-pill hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
                  >
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Continue Intake</span>
                  </Link>
                  <Link
                    to={`/projects/${activeProject.id}/compliance`}
                    className="p-3.5 rounded-xl spatial-glass-pill hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">MCA Checklist</span>
                  </Link>
                  <Link
                    to={`/projects/${activeProject.id}/documents`}
                    className="p-3.5 rounded-xl spatial-glass-pill hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
                  >
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Generate Dossier</span>
                  </Link>
                  <Link
                    to={`/projects/${activeProject.id}/roles`}
                    className="p-3.5 rounded-xl spatial-glass-pill hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
                  >
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Role Matrix</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/projects"
                  className="p-3.5 rounded-xl spatial-glass-pill hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all flex flex-col items-center text-center gap-2 group"
                >
                  <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">My Projects</span>
                </Link>
              )}

              <Link
                to="/projects"
                className="p-3.5 rounded-xl spatial-glass-pill hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all flex flex-col items-center text-center gap-2 group"
              >
                <FolderKanban className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">All Projects</span>
              </Link>
            </div>
          </div>

          {/* Visual SPICe+ MCA Incorporation Roadmap */}
          <div className="spatial-card p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Landmark className="w-4 h-4" />
                  <span>Official Regulatory Incorporation Workflow</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  MCA SPICe+ Incorporation Roadmap
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  5-Stage statutory sequence under the Ministry of Corporate Affairs (MCA21) &amp; Companies Act, 2013.
                </p>
              </div>
              {activeProject && (
                <span className="self-start sm:self-auto glass-badge glass-badge-emerald text-xs">
                  Active Project: {activeProject.name}
                </span>
              )}
            </div>

            {/* 5-Step Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {roadmapStages.map((stg, idx) => {
                const isSelected = activeStage === idx;
                const isCompleted = stg.status === "Completed";
                const isInProgress = stg.status === "In Progress";

                return (
                  <button
                    key={stg.stage}
                    type="button"
                    onClick={() => setActiveStage(idx)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-300 dark:hover:border-emerald-700"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                          {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : stg.stage}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : isInProgress
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 animate-pulse"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          {stg.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                        {stg.title}
                      </h4>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {stg.mca_form}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>{stg.timeline}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Details &rarr;</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stage Detail Panel */}
            {roadmapStages[activeStage] && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Stage {roadmapStages[activeStage].stage} Detailed Dossier · {roadmapStages[activeStage].mca_form}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {roadmapStages[activeStage].title}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                    Statute: {roadmapStages[activeStage].statutory_rule}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {roadmapStages[activeStage].description}
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
                    Mandatory Deliverables &amp; Filing Action Items:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {roadmapStages[activeStage].action_items.map((action, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statutory Deadlines Countdown Cards */}
          <div className="spatial-card p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Critical Statutory Clock</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Post-Incorporation Statutory Deadlines
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Live countdown and compliance requirements following Certificate of Incorporation (COI) issuance.
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Click card to toggle completed status
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statutoryDeadlines.map((item) => {
                const isDone = completedDeadlines[item.id] || false;

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleDeadline(item.id)}
                    className={`p-5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md ${
                      isDone
                        ? "spatial-card bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 opacity-80"
                        : item.severity === "critical"
                        ? "spatial-card border-rose-300 dark:border-rose-900/60 hover:border-rose-400"
                        : "spatial-card"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {item.form_name}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isDone
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        }`}>
                          {isDone ? "✓ Completed" : item.deadline_window}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                            {item.statutory_provision}
                          </span>
                        </div>
                        {!isDone ? (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                            {item.remaining_days}d left
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            Recorded
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg font-medium">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Default Risk: </span>
                        <span>{item.consequence}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Grid: Recent Projects & Statutory Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 spatial-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Projects</h3>
                  <Link to="/projects" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
                    View All ({projects.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {projects.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-3">
                    <FolderKanban className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-sm font-medium">No company projects created yet.</p>
                    <Link to="/projects/new" className="corpsetu-btn-navy text-xs py-2 px-4 inline-flex font-bold">
                      Create First Project
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 4).map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl spatial-glass-pill hover:border-blue-300 transition-all flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{proj.name}</h4>
                            <span className="glass-badge glass-badge-emerald text-[10px]">
                              {proj.preferred_structure || "Private Limited"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Domain: {proj.domain}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{proj.completion_percentage}%</span>
                            <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${proj.completion_percentage}%` }}
                              />
                            </div>
                          </div>
                          <Link
                            to={`/projects/${proj.id}/questionnaire`}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-blue-700 shadow-xs transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 spatial-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Statutory Checklist</h3>
                  {activeProject && (
                    <Link to={`/projects/${activeProject.id}/compliance`} className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                      Full Checklist
                    </Link>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-medium">No active statutory tasks for current project.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((t) => (
                      <div key={t.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          t.status === "Completed" ? "bg-emerald-500" : "bg-blue-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.title}</h5>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize font-medium">{t.status}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">{t.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Verified Rules Engine</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Deterministic</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* PILLAR 2: CA SERVICES (CHARTERED ACCOUNTANT, TAX & AUDIT)     */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activePillar === "CA" && (
        <div className="space-y-6">
          {/* CA Command Banner */}
          <div className="spatial-card-gold p-6 sm:p-7 rounded-3xl border border-amber-500/30 dark:border-amber-500/20 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                <Landmark className="w-4 h-4" />
                <span>Chartered Accountant Financial Desk</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Tax, GST &amp; Statutory Bookkeeping Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl font-medium">
                Maintain accurate books of accounts, automate GST returns (GSTR-1, 3B), estimate advance taxes, and prepare statutory audit schedules.
              </p>
            </div>
            {user?.role === "Administrator" ? (
              <Link
                to="/admin/consultations"
                className="corpsetu-btn-gold px-4 py-2.5 text-xs font-bold whitespace-nowrap self-start md:self-auto inline-flex items-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Manage CA Inquiries &rarr;</span>
              </Link>
            ) : (
              <button
                onClick={() => { setCaConsultTopic("General CA Tax Strategy"); setActiveConsultationModal("CA"); }}
                className="corpsetu-btn-gold px-4 py-2.5 text-xs font-bold whitespace-nowrap self-start md:self-auto cursor-pointer"
              >
                Consult Empanelled CA · Advisory Review
              </button>
            )}
          </div>

          {/* CA 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">GST Status</span>
                <Receipt className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Active · GSTR-3B</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Due: 20th Nov · ₹0 Penalty</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Advance Tax Q3</span>
                <Calculator className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{advanceTaxQ3.toLocaleString("en-IN")}</div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-1">75% threshold · Due 15 Dec</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Ledger Reconciliation</span>
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">98% Synced</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-1">Bank statements up to date</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Statutory Audit</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Sec 139 Compliant</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Auditor Form ADT-1 Filed</p>
            </div>
          </div>

          {/* CA Interactive Tools & Calculators */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Advance Tax Estimator (7 cols) */}
            <div className="lg:col-span-7 spatial-card p-6 sm:p-7 rounded-3xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Advance Tax &amp; TDS Estimator (FY 2026-27)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Compute mandatory statutory corporate advance tax installments under Section 208</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-lg">
                  Base 22% + Surcharge
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Annual Business Turnover (₹)</label>
                  <input
                    type="number"
                    value={taxTurnover}
                    onChange={(e) => setTaxTurnover(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estimated Net Profit Before Tax (₹)</label>
                  <input
                    type="number"
                    value={estimatedProfit}
                    onChange={(e) => setEstimatedProfit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Estimated Annual Tax Liability:</span>
                  <span className="text-base font-extrabold text-amber-700 dark:text-amber-400">₹{calculatedTax.toLocaleString("en-IN")}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-500 block font-bold">15% by 15-Jun</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">₹{advanceTaxQ1.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-500 block font-bold">45% by 15-Sep</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">₹{advanceTaxQ2.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-400 dark:border-amber-600 text-center ring-1 ring-amber-400">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold">75% by 15-Dec ★</span>
                    <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">₹{advanceTaxQ3.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-500 block font-bold">100% by 15-Mar</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">₹{advanceTaxQ4.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Section 234B &amp; 234C interest penalty applies on delay</span>
                <button
                  onClick={() => alert(`Advance Tax Calculation of ₹${calculatedTax} for FY 2026-27 downloaded as schedule.`)}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Tax Computation</span>
                </button>
              </div>
            </div>

            {/* GST & Statutory Filing Calendar (5 cols) */}
            <div className="lg:col-span-5 spatial-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">GST &amp; Tax Compliance Calendar</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">Live</span>
                </div>

                <div className="space-y-3">
                  {caDeadlines.map((dl) => (
                    <div key={dl.id} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{dl.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          {dl.due_date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{dl.description}</p>
                      <span className="text-[10px] font-mono text-slate-500">{dl.law}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Need full financial audit?</span>
                {user?.role === "Administrator" ? (
                  <Link
                    to="/admin/consultations"
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    View Audit Requests in Admin &rarr;
                  </Link>
                ) : (
                  <button
                    onClick={() => { setCaConsultTopic("Statutory Audit under Section 139"); setActiveConsultationModal("CA"); }}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Book CA Review &rarr; Advisory Desk
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* PILLAR 3: CORPORATE LAW (CONTRACTS, IP & LEGAL ADVISORY)     */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activePillar === "LAW" && (
        <div className="space-y-6">
          {/* LAW Command Banner */}
          <div className="spatial-card-navy p-6 sm:p-7 rounded-3xl border border-blue-500/30 dark:border-blue-500/20 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>Corporate Legal &amp; Contracts Vault</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Contracts, Intellectual Property &amp; Legal Advisory
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl font-medium">
                Generate airtight founder vesting agreements, bilateral NDAs, conduct trademark searches, and safeguard corporate intellectual property.
              </p>
            </div>
            {user?.role === "Administrator" ? (
              <Link
                to="/admin/consultations"
                className="corpsetu-btn-navy px-4 py-2.5 text-xs font-bold whitespace-nowrap self-start md:self-auto inline-flex items-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4 text-[#C59B27]" />
                <span>Manage Legal Inquiries &rarr;</span>
              </Link>
            ) : (
              <button
                onClick={() => setActiveConsultationModal("LAW")}
                className="corpsetu-btn-navy px-4 py-2.5 text-xs font-bold whitespace-nowrap self-start md:self-auto cursor-pointer"
              >
                Consult High Court Advocate · Advisory Call
              </button>
            )}
          </div>

          {/* LAW 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Contracts</span>
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">4 Drafted</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Founders Agreement &amp; NDA Ready</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Trademark Status</span>
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Class 42 &amp; 35</div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1">Phonetic Clearance Completed</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Board Resolutions</span>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">3 Executed</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-1">Bank Mandate &amp; Shares Allotted</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Legal Health Score</span>
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">Low Risk Profile</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Statutory Protection Active</p>
              </div>
              <ComplianceScoreRing score={96} size={58} strokeWidth={5} />
            </div>
          </div>

          {/* Interactive Contract Drafting Studio & Trademark Search */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Legal Agreement Generator (7 cols) */}
            <div className="lg:col-span-7 spatial-card p-6 sm:p-7 rounded-3xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Interactive Legal Contract Drafter</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Generate tailored commercial agreements with enforceable statutory clauses</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setContractType("founder_agreement")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${contractType === "founder_agreement" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}
                  >
                    Founder Agreement
                  </button>
                  <button
                    onClick={() => setContractType("nda")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${contractType === "nda" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}
                  >
                    NDA
                  </button>
                </div>
              </div>

              {contractType === "founder_agreement" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Number of Co-Founders</label>
                      <select
                        value={founderCount}
                        onChange={(e) => setFounderCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value={1}>1 Founder (Single)</option>
                        <option value={2}>2 Co-Founders (Equal/Custom)</option>
                        <option value={3}>3 Co-Founders</option>
                        <option value={4}>4+ Co-Founders</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Equity Vesting Duration</label>
                      <select
                        value={vestingYears}
                        onChange={(e) => setVestingYears(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value={3}>3 Years (36 Months)</option>
                        <option value={4}>4 Years (Standard Tech)</option>
                        <option value={5}>5 Years</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cliff Period</label>
                      <select
                        value={cliffMonths}
                        onChange={(e) => setCliffMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value={6}>6 Months Cliff</option>
                        <option value={12}>12 Months Cliff (Standard)</option>
                        <option value={0}>No Cliff (Immediate)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-extrabold text-blue-900 dark:text-blue-300 block">Pre-Configured Enforceable Covenants Included:</span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li><strong>IP Assignment Clause:</strong> 100% intellectual property, code, and trade secrets assigned irrevocably to the company.</li>
                      <li><strong>Non-Compete &amp; Non-Solicit:</strong> 24-month post-exit restriction under Indian Contract Act §27 safe harbor.</li>
                      <li><strong>Good Leaver vs. Bad Leaver:</strong> Unvested shares subject to company clawback at nominal face value.</li>
                      <li><strong>Deadlock Resolution:</strong> Russian Roulette / Texas Shootout clause for equal 50:50 shareholdings.</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">Stamp Duty: Applicable state e-stamp required</span>
                    <button
                      onClick={() => alert("Founder Vesting Agreement draft successfully compiled into your project documents vault.")}
                      className="corpsetu-btn-navy px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Generate Statutory Agreement</span>
                    </button>
                  </div>
                </div>
              )}

              {contractType === "nda" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Non-Disclosure Agreement (Mutual Bilateral)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Standard 3-year mutual confidentiality agreement protecting business discussions, financial projections, software architecture, and client lists.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 block font-bold">Jurisdiction</span>
                        <span className="font-bold text-slate-900 dark:text-white">Bengaluru / High Court of Karnataka</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 block font-bold">Dispute Resolution</span>
                        <span className="font-bold text-slate-900 dark:text-white">Arbitration &amp; Conciliation Act, 1996</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">Ready for digital sign via e-Sign / Aadhaar OTP</span>
                    <button
                      onClick={() => alert("Bilateral NDA successfully compiled into your project documents vault.")}
                      className="corpsetu-btn-navy px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download NDA Template</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trademark Protection & Clearance Desk (5 cols) */}
            <div className="lg:col-span-5 spatial-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Trademark Conflict Checker</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">TM-A Desk</span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Verify brand name distinctiveness across IP India Registry Class 9, 35, 42, and 45 before filing.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter brand or company name..."
                      value={tmSearchQuery}
                      onChange={(e) => setTmSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleTmSearch}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>
                  </div>

                  {tmSearchResult && (
                    <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${tmSearchResult.isAvailable ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300" : "bg-rose-50/70 dark:bg-rose-950/40 border-rose-300"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">Search: {tmSearchResult.query}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tmSearchResult.isAvailable ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"}`}>
                          {tmSearchResult.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300"><strong>Classification:</strong> {tmSearchResult.recommendedClass}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300"><strong>Registry Evaluation:</strong> {tmSearchResult.registryStatus}</p>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Common Startup Trademark Classes:</span>
                    <div>• <strong>Class 9:</strong> Downloadable software, mobile apps, SaaS tokens</div>
                    <div>• <strong>Class 35:</strong> Advertising, retail business, marketplace</div>
                    <div>• <strong>Class 42:</strong> Software development, cloud hosting, AI services</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Need expedited TM-A filing?</span>
                {user?.role === "Administrator" ? (
                  <Link
                    to="/admin/consultations"
                    className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    View IP Filings in Admin &rarr;
                  </Link>
                ) : (
                  <button
                    onClick={() => setActiveConsultationModal("LAW")}
                    className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    File with IP Attorney &rarr; Legal Advisory
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. CS CONSULTATION & SETUP MODAL                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeConsultationModal === "CS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="spatial-surface rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-emerald-500/40 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">CS Services · Consultation &amp; Setup</h3>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Empanelled FCS #11428 · MCA &amp; ROC Secretarial Desk</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveConsultationModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed font-semibold">
              Fill in your incorporation &amp; compliance requirements below. A structured table PDF will be generated immediately, and our Company Secretary desk will contact you within 24 to 48 hours.
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConsultationSubmit("CS");
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={csForm.full_name}
                    onChange={(e) => setCsForm({ ...csForm, full_name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={csForm.email}
                    onChange={(e) => setCsForm({ ...csForm, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Primary Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={csForm.phone_number}
                    onChange={(e) => setCsForm({ ...csForm, phone_number: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Optional / Alternate Phone</label>
                  <input
                    type="tel"
                    value={csForm.alternate_phone}
                    onChange={(e) => setCsForm({ ...csForm, alternate_phone: e.target.value })}
                    placeholder="+91 9123456789 (optional)"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Proposed Company Name</label>
                  <input
                    type="text"
                    value={csForm.company_name}
                    onChange={(e) => setCsForm({ ...csForm, company_name: e.target.value })}
                    placeholder="e.g. Kaveri Tech Solutions Pvt Ltd"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Preferred Structure *</label>
                  <select
                    value={csForm.preferred_entity_type}
                    onChange={(e) => setCsForm({ ...csForm, preferred_entity_type: e.target.value })}
                    className="w-full glass-input text-xs !py-2"
                  >
                    <option value="Private Limited Company (Pvt Ltd)">Private Limited Company (Pvt Ltd)</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="One Person Company (OPC)">One Person Company (OPC)</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                    <option value="Section 8 Non-Profit Company">Section 8 Non-Profit Company</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Specific CS Service Required *</label>
                <select
                  value={csForm.service_category}
                  onChange={(e) => setCsForm({ ...csForm, service_category: e.target.value })}
                  className="w-full glass-input text-xs !py-2"
                >
                  <option value="New Company Incorporation (SPICe+)">New Company Incorporation (SPICe+ Part A &amp; B)</option>
                  <option value="LLP Formation & Agreement Drafting">LLP Formation &amp; Agreement Drafting</option>
                  <option value="ROC Annual Compliance & Form AOC-4/MGT-7">ROC Annual Compliance &amp; Form AOC-4 / MGT-7</option>
                  <option value="Director DIN, DSC & e-KYC Compliance">Director DIN, DSC &amp; e-KYC Compliance</option>
                  <option value="Share Capital Increase & Allotment (PAS-3)">Share Capital Increase &amp; Allotment (PAS-3)</option>
                  <option value="Registered Office / Director Change">Registered Office / Director Change</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Description of Incorporation / Secretarial Requirement *
                </label>
                <textarea
                  required
                  rows={3}
                  value={csForm.notes}
                  onChange={(e) => setCsForm({ ...csForm, notes: e.target.value })}
                  placeholder="Describe your business model, proposed directors, authorized share capital, or any specific MCA compliance assistance needed..."
                  className="w-full glass-input text-xs !py-2 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveConsultationModal(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingConsultation}
                  className="corpsetu-btn-emerald px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {submittingConsultation ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting &amp; Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit CS Consultation Request &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. CA CONSULTATION & TAX ADVISORY MODAL                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeConsultationModal === "CA" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="spatial-surface rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-amber-500/40 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">CA Services · Consultation &amp; Tax Desk</h3>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">Empanelled FCA #418290 · Chartered Accountant &amp; Statutory Audit</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveConsultationModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-950 dark:text-amber-200 leading-relaxed font-semibold">
              Fill in your taxation, GST, or audit requirements. A structured table PDF will be generated immediately, and our Chartered Accountant desk will contact you within 24 to 48 hours.
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConsultationSubmit("CA");
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={caForm.full_name}
                    onChange={(e) => setCaForm({ ...caForm, full_name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={caForm.email}
                    onChange={(e) => setCaForm({ ...caForm, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Primary Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={caForm.phone_number}
                    onChange={(e) => setCaForm({ ...caForm, phone_number: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Optional / Alternate Phone</label>
                  <input
                    type="tel"
                    value={caForm.alternate_phone}
                    onChange={(e) => setCaForm({ ...caForm, alternate_phone: e.target.value })}
                    placeholder="+91 9123456789 (optional)"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Company / Firm Name (if any)</label>
                <input
                  type="text"
                  value={caForm.company_name}
                  onChange={(e) => setCaForm({ ...caForm, company_name: e.target.value })}
                  placeholder="e.g. Bharat Logistics LLP / Startup Venture"
                  className="w-full glass-input text-xs !py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Specific CA Service Required *</label>
                <select
                  value={caForm.service_category}
                  onChange={(e) => setCaForm({ ...caForm, service_category: e.target.value })}
                  className="w-full glass-input text-xs !py-2"
                >
                  <option value="GST Registration & Monthly Filing (GSTR-1, 3B)">GST Registration &amp; Monthly Filing (GSTR-1, 3B)</option>
                  <option value="Corporate Tax Audit & Statutory Reporting (Sec 44AB)">Corporate Tax Audit &amp; Statutory Reporting (§44AB)</option>
                  <option value="Advance Tax Planning & Corporate ITR Filing (ITR-6)">Advance Tax Planning &amp; Corporate ITR Filing (ITR-6)</option>
                  <option value="Monthly Bookkeeping, MIS & Management Accounts">Monthly Bookkeeping, MIS &amp; Management Accounts</option>
                  <option value="TDS Return Filing & Form 26AS/AIS Reconciliation">TDS Return Filing &amp; Form 26AS/AIS Reconciliation</option>
                  <option value="Annual Balance Sheet, P&L & Audit Compilation">Annual Balance Sheet, P&amp;L &amp; Audit Compilation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Description of Tax / Financial Service Required *
                </label>
                <textarea
                  required
                  rows={3}
                  value={caForm.notes}
                  onChange={(e) => setCaForm({ ...caForm, notes: e.target.value })}
                  placeholder="Describe your turnover, accounting software used, pending tax notices, or specific audit guidance required..."
                  className="w-full glass-input text-xs !py-2 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveConsultationModal(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingConsultation}
                  className="corpsetu-btn-gold px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {submittingConsultation ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting &amp; Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit CA Consultation Request &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. CORPORATE LAW CONSULTATION & DISPUTE MODAL                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeConsultationModal === "LAW" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="spatial-surface rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-blue-500/40 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0B2559] text-white flex items-center justify-center font-bold shadow-xs">
                  <Scale className="w-5 h-5 text-[#C59B27]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Corporate Law · Counsel &amp; Legal Desk</h3>
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 font-bold">High Court Advocates · Bar Council Empanelled Counsel</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveConsultationModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-950 dark:text-blue-200 leading-relaxed font-semibold">
              Fill in your corporate contract, IP, or legal matter details. A structured table PDF will be generated immediately, and our Corporate Counsel desk will contact you within 24 to 48 hours.
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConsultationSubmit("LAW");
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={lawForm.full_name}
                    onChange={(e) => setLawForm({ ...lawForm, full_name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={lawForm.email}
                    onChange={(e) => setLawForm({ ...lawForm, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Primary Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={lawForm.phone_number}
                    onChange={(e) => setLawForm({ ...lawForm, phone_number: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Optional / Alternate Phone</label>
                  <input
                    type="tel"
                    value={lawForm.alternate_phone}
                    onChange={(e) => setLawForm({ ...lawForm, alternate_phone: e.target.value })}
                    placeholder="+91 9123456789 (optional)"
                    className="w-full glass-input text-xs !py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Company / Organization Name (if any)</label>
                <input
                  type="text"
                  value={lawForm.company_name}
                  onChange={(e) => setLawForm({ ...lawForm, company_name: e.target.value })}
                  placeholder="e.g. Apex Innovations Private Limited"
                  className="w-full glass-input text-xs !py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Legal Practice Area / Requirement *</label>
                <select
                  value={lawForm.service_category}
                  onChange={(e) => setLawForm({ ...lawForm, service_category: e.target.value })}
                  className="w-full glass-input text-xs !py-2"
                >
                  <option value="Founder Vesting & Co-founder Agreement">Founder Vesting &amp; Co-founder Agreement Drafting</option>
                  <option value="Trademark Search, Class Selection & IP Filing">Trademark Search, Class Selection &amp; IP Filing</option>
                  <option value="Commercial Contracts, MSA & Vendor Agreements">Commercial Contracts, MSA &amp; Vendor Agreements</option>
                  <option value="Non-Disclosure Agreements (NDA) & IP Assignment">Non-Disclosure Agreements (NDA) &amp; IP Assignment</option>
                  <option value="Dispute Resolution, ROC Defense & Legal Notices">Dispute Resolution, ROC Defense &amp; Legal Notices</option>
                  <option value="Shareholder Agreement (SHA) & Investment Term Sheets">Shareholder Agreement (SHA) &amp; Investment Term Sheets</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  What is the Problem / Matter Description? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={lawForm.notes}
                  onChange={(e) => setLawForm({ ...lawForm, notes: e.target.value })}
                  placeholder="Explain the background of the legal matter, dispute, trademark conflict, or agreement structure needed..."
                  className="w-full glass-input text-xs !py-2 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveConsultationModal(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingConsultation}
                  className="corpsetu-btn-navy px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {submittingConsultation ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting &amp; Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Legal Consultation Request &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. INSTANT REASSURANCE CONFIRMATION POPUP MODAL               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {consultationSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="spatial-surface rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-emerald-400/50 shadow-2xl space-y-5 text-center relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                ✓ Consultation Request Registered
              </span>
              <h3 className="text-xl font-extrabold text-[#0B2559] dark:text-white">
                Consultation Assigned &amp; Dispatched!
              </h3>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-bold leading-relaxed shadow-xs">
                Your consultation form is submitted successfully and our team will contact you within 24 to 48 hours.
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Official confirmation and structured details have been dispatched to{" "}
                <span className="font-extrabold text-[#0B2559] dark:text-[#E5B842] underline">
                  {consultationSuccessModal.email}
                </span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Tracking Reference:</span>
                <span className="font-mono font-extrabold text-[#0B2559] dark:text-white bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {consultationSuccessModal.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Assigned Specialist:</span>
                <span className="font-bold text-slate-900 dark:text-white">{consultationSuccessModal.expert}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Pillar / Topic:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">{consultationSuccessModal.topic}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Turnaround SLA:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Official Call within 24–48 Hours</span>
              </div>
            </div>

            {/* Mandatory Structured Table PDF Download Link */}
            <div className="pt-1">
              <a
                href={consultationSuccessModal.pdf_url || `/api/v1/consultations/${consultationSuccessModal.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full corpsetu-btn-gold py-3 text-xs font-extrabold justify-center flex items-center gap-2 shadow-md cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Download Structured PDF Summary (Table Format) &rarr;</span>
              </a>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConsultationSuccessModal(null);
                  navigate("/consultations");
                }}
                className="flex-1 corpsetu-btn-navy py-2.5 text-xs font-bold justify-center cursor-pointer"
              >
                Track in Your Consultations &rarr;
              </button>
              <button
                type="button"
                onClick={() => setConsultationSuccessModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
