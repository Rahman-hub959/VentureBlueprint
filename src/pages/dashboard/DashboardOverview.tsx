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
  Shield,
  Scale,
  ArrowUpRight,
  Check,
  AlertCircle,
  ChevronDown,
  Landmark,
  Building2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { projectsApi, documentsApi, complianceApi } from "../../api/client";

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-colors">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Welcome Back, {user?.full_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Entrepreneur Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 max-w-xl font-medium leading-relaxed">
            Track company formation progress, evaluate MCA Rule 8 compliance, and compile professional documentation dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <Link
            to="/projects/new"
            className="glass-button-primary text-xs py-3 px-5 shadow-sm w-full sm:w-auto justify-center font-bold"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Company Project</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid with Enhanced Badges & Readiness Micro-bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
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

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
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

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Generated Documents</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{documents.length}</div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-semibold">PDF & DOCX corporate files</p>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(documents.length * 20, 100)}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
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

      {/* Quick Action Hub */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/projects/new"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-600 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
          >
            <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Create Project</span>
          </Link>

          {activeProject ? (
            <>
              <Link
                to={`/projects/${activeProject.id}/questionnaire`}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
              >
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Continue Intake</span>
              </Link>
              <Link
                to={`/projects/${activeProject.id}/compliance`}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-600 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">MCA Checklist</span>
              </Link>
              <Link
                to={`/projects/${activeProject.id}/documents`}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
              >
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Generate Dossier</span>
              </Link>
              <Link
                to={`/projects/${activeProject.id}/roles`}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
              >
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Role Matrix</span>
              </Link>
            </>
          ) : (
            <Link
              to="/projects"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 group"
            >
              <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">My Projects</span>
            </Link>
          )}

          <Link
            to="/projects"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <FolderKanban className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">All Projects</span>
          </Link>
        </div>
      </div>

      {/* Item 7: Visual SPICe+ MCA Incorporation Roadmap */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
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
              5-Stage statutory sequence under the Ministry of Corporate Affairs (MCA21) & Companies Act, 2013.
            </p>
          </div>
          {activeProject && (
            <span className="self-start sm:self-auto glass-badge glass-badge-emerald text-xs">
              Active Project: {activeProject.name}
            </span>
          )}
        </div>

        {/* 5-Step Horizontal / Responsive Stepper */}
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

        {/* Selected Stage Detail Panel */}
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

      {/* Item 8: Statutory Deadlines Countdown Cards */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
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
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md ${
                  isDone
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 opacity-80"
                    : item.severity === "critical"
                    ? "bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900/60 hover:border-rose-400"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
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
        {/* Recent Projects List (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
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
                <Link to="/projects/new" className="glass-button-primary text-xs py-2 px-4 inline-flex font-bold">
                  Create First Project
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all flex items-center justify-between gap-4"
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

        {/* Pending Statutory Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
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
  );
};
