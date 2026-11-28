import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Users,
  Database,
  FileText,
  CheckCircle2,
  Activity,
  RefreshCw,
  CalendarCheck,
  Building,
  Phone,
  PhoneCall,
  Mail,
  ThumbsUp,
  ThumbsDown,
  MessageSquareWarning,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  Eye,
  X,
  AlertTriangle,
  FileCheck,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  FolderKanban,
  BadgeCheck,
  MapPin,
  Briefcase,
  Coins,
  Radio,
  Sliders,
  UserCheck,
  UserX,
  Globe,
  Send,
  Download,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  adminApi,
  consultationsApi,
  complaintsApi,
  projectsApi,
  ConsultationItem,
  ComplaintItem,
  ClientServiceDossier,
  ProjectItem,
  ClientEnquiryItem,
  UserActivityOverview,
  PlatformSettings
} from "../../api/client";
import { useToast } from "../../context/ToastContext";

export const AdminPortalPage: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [serviceDossiers, setServiceDossiers] = useState<ClientServiceDossier[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<ClientServiceDossier | null>(null);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [enquiries, setEnquiries] = useState<ClientEnquiryItem[]>([]);
  const [activityOverview, setActivityOverview] = useState<UserActivityOverview | null>(null);
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [activitySearch, setActivitySearch] = useState<string>("");
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platform_name: "CorpSetu",
    tagline: "Law · CS · CA — One Bridge",
    support_phone: "+91 98765 43210",
    support_email: "advisory@corpsetu.com",
    support_hours: "Mon - Sat: 9:00 AM - 7:00 PM IST",
    office_address: "Floor 4, CorpSetu Hub, Financial District, Hyderabad, Telangana 500032",
    announcement_banner: "Empanelled Senior Corporate Advisory & Multi-Disciplinary Practice Suite",
    consultation_turnaround: "Within 24 Hours",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState("ALL");
  const [enquiryPillarFilter, setEnquiryPillarFilter] = useState("ALL");
  const [enquirySearch, setEnquirySearch] = useState("");
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs: projects, tracker, enquiries, activity, controls, consultations, overview, grievances, audit
  const [activeTab, setActiveTab] = useState<"projects" | "tracker" | "enquiries" | "activity" | "controls" | "consultations" | "overview" | "grievances" | "audit" | "health">("projects");
  
  // Filters
  const [projectSearch, setProjectSearch] = useState<string>("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("ALL");
  const [projectStructureFilter, setProjectStructureFilter] = useState<string>("ALL");

  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [trackerSearch, setTrackerSearch] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, trackerData, projectsData, consultsData, enquiriesData, activityData, settingsData, complaintsData, auditData, healthData] = await Promise.all([
        adminApi.getStats().catch(() => null),
        adminApi.getUsers().catch(() => []),
        adminApi.getServiceTracker().catch(() => []),
        projectsApi.list().catch(() => []),
        consultationsApi.list().catch(() => []),
        adminApi.getEnquiries().catch(() => []),
        adminApi.getUserActivity().catch(() => null),
        adminApi.getPlatformSettings().catch(() => null),
        complaintsApi.list().catch(() => []),
        adminApi.getAuditLogs().catch(() => []),
        adminApi.getHealth().catch(() => null)
      ]);
      setStats(statsData);
      setUsers(usersData || []);
      setServiceDossiers(trackerData || []);
      setProjects(projectsData || []);
      setConsultations(consultsData || []);
      setEnquiries(enquiriesData || []);
      setActivityOverview(activityData);
      if (settingsData) setPlatformSettings(settingsData);
      setComplaints(complaintsData || []);
      setAuditLogs(auditData || []);
      setHealth(healthData);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Quick 1-click 👍 (Consulted) and 👎 (Not Accepted) handler
  const handleQuickStatus = async (id: string, newStatus: "Consulted" | "Not Accepted") => {
    try {
      setUpdatingId(id);
      const updated = await consultationsApi.updateStatus(id, {
        status: newStatus,
      });

      setConsultations((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );

      if (newStatus === "Consulted") {
        showToast(`Consultation ${id} marked as 'Consulted' 👍`, "success");
      } else {
        showToast(`Consultation ${id} marked as 'Not Accepted' 👎`, "info");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update consultation status", "warning");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendQuestionnaire = async (item: ConsultationItem) => {
    try {
      const updated = await consultationsApi.sendQuestionnaire(item.id, {
        pillar: item.pillar,
      });
      setConsultations((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      showToast(`Statutory Questionnaire link emailed to ${item.email} (${item.pillar})`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to send questionnaire link", "warning");
    }
  };

  const handleShareExpert = async (item: ConsultationItem) => {
    try {
      const expertName = item.assigned_expert || (
        item.pillar === "CS" ? "CS Priyanjali Sen" :
        item.pillar === "CA" ? "CA Aniket Kulkarni" :
        item.pillar === "LAW" ? "Adv. Rajesh Varma" : "CorpSetu Senior Partner Desk"
      );
      const expertRole = item.expert_role || (
        item.pillar === "CS" ? "FCS #11428 · Senior Secretarial Lead" :
        item.pillar === "CA" ? "FCA #418290 · Chartered Accountant & Tax Partner" :
        item.pillar === "LAW" ? "Bar Council KAR/2012/842 · High Court Advocate" : "Multi-Disciplinary Corporate Advisory Lead"
      );
      const updated = await consultationsApi.shareExpert(item.id, {
        expert_name: expertName,
        expert_role: expertRole,
      });
      setConsultations((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      showToast(`Specialist profile for ${expertName} dispatched to ${item.email}`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to share specialist details", "warning");
    }
  };

  const handleSendDocument = async (item: ConsultationItem) => {
    try {
      const docName = item.pillar === "CS" ? "Statutory SPICe+ MCA Blueprint" :
                      item.pillar === "CA" ? "Annual Tax & Audit Advisory Dossier" :
                      item.pillar === "LAW" ? "Master Shareholder & Founders Legal Charter" :
                      "Statutory Corporate Advisory Blueprint";
      const updated = await consultationsApi.sendDocument(item.id, {
        document_title: docName,
      });
      setConsultations((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      showToast(`Generated document dispatched to client: ${item.email}`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to send document to client", "warning");
    }
  };

  // Top horizontal scrollbar and navigation synchronization for Consultations
  const consultTopScrollRef = useRef<HTMLDivElement>(null);
  const consultTableContainerRef = useRef<HTMLDivElement>(null);
  const consultTableRef = useRef<HTMLTableElement>(null);
  const [consultScrollProgress, setConsultScrollProgress] = useState<number>(0);
  const [consultTableWidth, setConsultTableWidth] = useState<number>(1400);

  const updateConsultScrollProgress = () => {
    if (consultTableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = consultTableContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setConsultScrollProgress(Math.round((scrollLeft / maxScroll) * 100));
      } else {
        setConsultScrollProgress(0);
      }
    }
  };

  const handleConsultTopScroll = () => {
    if (consultTopScrollRef.current && consultTableContainerRef.current) {
      consultTableContainerRef.current.scrollLeft = consultTopScrollRef.current.scrollLeft;
      updateConsultScrollProgress();
    }
  };

  const handleConsultTableScroll = () => {
    if (consultTopScrollRef.current && consultTableContainerRef.current) {
      consultTopScrollRef.current.scrollLeft = consultTableContainerRef.current.scrollLeft;
      updateConsultScrollProgress();
    }
  };

  const scrollConsultTable = (offset: number) => {
    if (consultTableContainerRef.current) {
      consultTableContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const scrollConsultTableTo = (position: "start" | "end") => {
    if (consultTableContainerRef.current) {
      consultTableContainerRef.current.scrollTo({
        left: position === "start" ? 0 : consultTableContainerRef.current.scrollWidth,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const measureWidth = () => {
      if (consultTableRef.current) {
        setConsultTableWidth(Math.max(consultTableRef.current.scrollWidth, 1300));
      }
    };
    measureWidth();
    const timer = setTimeout(measureWidth, 150);
    window.addEventListener("resize", measureWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureWidth);
    };
  }, [consultations, activeTab]);

  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await adminApi.updateEnquiryStatus(id, { status: newStatus });
      setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
      showToast(`Enquiry ${id} updated to '${newStatus}'`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to update enquiry status", "warning");
    }
  };

  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const updated = await adminApi.updatePlatformSettings(platformSettings);
      setPlatformSettings(updated);
      showToast("Platform & Website Controls saved successfully! Changes are live across the site.", "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to save platform controls", "warning");
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered client projects
  const filteredProjects = projects.filter((p) => {
    if (projectStatusFilter === "READY" && p.completion_percentage !== 100) return false;
    if (projectStatusFilter === "DRAFT" && p.completion_percentage === 100) return false;
    if (projectStatusFilter === "WITH_DOCS" && (!p.documents_count || p.documents_count === 0)) return false;
    if (projectStructureFilter !== "ALL" && p.preferred_structure !== projectStructureFilter) return false;

    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchOwner = p.owner_name?.toLowerCase().includes(q);
      const matchEmail = p.owner_email?.toLowerCase().includes(q);
      const matchPhone = p.owner_phone?.toLowerCase().includes(q);
      const matchDomain = p.domain?.toLowerCase().includes(q);
      return matchName || matchOwner || matchEmail || matchPhone || matchDomain;
    }
    return true;
  });

  // Filtered service dossiers
  const filteredDossiers = serviceDossiers.filter((d) => {
    if (serviceFilter !== "ALL" && !d.active_pillars.includes(serviceFilter as any)) {
      return false;
    }
    if (trackerSearch.trim()) {
      const q = trackerSearch.toLowerCase();
      const matchName = d.full_name?.toLowerCase().includes(q);
      const matchEmail = d.email?.toLowerCase().includes(q);
      const matchPhone = d.phone_number?.toLowerCase().includes(q);
      const matchCompany = d.company_names?.some((c) => c.toLowerCase().includes(q));
      return matchName || matchEmail || matchPhone || matchCompany;
    }
    return true;
  });

  const pendingConsultationsCount = consultations.filter((c) => c.status === "Requested").length;
  const consultedCount = consultations.filter((c) => c.status === "Consulted").length;

  const totalProjectsCount = projects.length;
  const readyProjectsCount = projects.filter((p) => p.completion_percentage === 100).length;
  const withDocsCount = projects.filter((p) => (p.documents_count || 0) > 0).length;
  const inDraftCount = projects.filter((p) => p.completion_percentage < 100).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4 px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Administrator Security Level · Real-Time Operations Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2559] dark:text-white mt-1 tracking-tight">
            Client Services &amp; Platform Operations Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Monitor all <strong>{totalProjectsCount} client company blueprints</strong> saved in the database, inspect statutory documents, and track adoption across CA, CS &amp; Legal services.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/consultations"
            className="corpsetu-btn-navy text-xs py-2 px-3.5 flex items-center gap-2 font-bold shadow-sm"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Consultation Requests Console</span>
          </Link>
          <button
            onClick={loadAdminData}
            className="glass-button-secondary text-xs py-2 px-3.5 flex items-center gap-2 font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Clean Business Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: "projects", label: `Client Projects (${projects.length})` },
          { id: "tracker", label: `Client Services Tracker (${serviceDossiers.length})` },
          { id: "enquiries", label: `Enquiries & Leads (${enquiries.length})` },
          { id: "activity", label: `Active Users (${activityOverview?.online_count ?? 0} Online)` },
          { id: "controls", label: "Website Controls" },
          { id: "consultations", label: `Consultations (${consultations.length})` },
          { id: "overview", label: "Operations Overview" },
          { id: "grievances", label: `Grievances (${complaints.length})` },
          { id: "audit", label: "Audit Logs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#0B2559] text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: CLIENT PROJECTS DIRECTORY (ALL 59+ IN DATABASE)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {/* Projects KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Database Blueprints</span>
              <div className="text-3xl font-extrabold text-[#0B2559] dark:text-white mt-1">{totalProjectsCount}</div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Created by registered entrepreneurs</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Blueprint Ready (100%)</span>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{readyProjectsCount}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-1">Completed intake questionnaire</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>With Generated Documents</span>
              </span>
              <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{withDocsCount}</div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-1">MoA / AoA finalized</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">In Drafting / Intake</span>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{inDraftCount}</div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-1">Incomplete intake (&lt;100%)</p>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="spatial-surface p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {[
                { key: "ALL", label: `All Projects (${projects.length})` },
                { key: "READY", label: `Blueprint Ready (${readyProjectsCount})` },
                { key: "WITH_DOCS", label: `With Documents (${withDocsCount})` },
                { key: "DRAFT", label: `Drafts (${inDraftCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setProjectStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    projectStatusFilter === tab.key
                      ? "bg-[#0B2559] text-white shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Structure Filter Dropdown & Search Input */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={projectStructureFilter}
                onChange={(e) => setProjectStructureFilter(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Legal Structures</option>
                <option value="Private Limited Company">Private Limited Company</option>
                <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                <option value="One Person Company (OPC)">One Person Company (OPC)</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
              </select>

              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search by company, client, email..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#C59B27]"
                />
              </div>
            </div>
          </div>

          {/* Client Projects Table */}
          <div className="spatial-card rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-[#C59B27]" />
                  <span>All Client Company Formation Blueprints ({filteredProjects.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Every company creation record in the database with client contact details, preferred structure, and generated documents.
                </p>
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                No company projects match your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Company Name &amp; Domain</th>
                      <th className="py-3 px-4">Legal Structure</th>
                      <th className="py-3 px-4">Client / Founder Contact</th>
                      <th className="py-3 px-4">Intake Progress</th>
                      <th className="py-3 px-4">Statutory Documents</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProjects.map((p) => {
                      const hasDocs = (p.documents_count || 0) > 0;
                      const isReady = p.completion_percentage === 100;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Company Name */}
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {p.name}
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              {p.domain}
                            </span>
                          </td>

                          {/* Structure */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              {p.preferred_structure || "Private Limited"}
                            </span>
                          </td>

                          {/* Client Contact */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {p.owner_name || "Entrepreneur"}
                            </div>
                            {p.owner_phone && (
                              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <a href={`tel:${p.owner_phone}`} className="hover:underline">
                                  {p.owner_phone}
                                </a>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                              {p.owner_email}
                            </div>
                          </td>

                          {/* Progress */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isReady ? "bg-emerald-500" : "bg-amber-500"
                                  }`}
                                  style={{ width: `${p.completion_percentage}%` }}
                                />
                              </div>
                              <span className="font-bold text-[11px]">{p.completion_percentage}%</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                              {isReady ? "Blueprint Ready" : "Intake Drafting"}
                            </span>
                          </td>

                          {/* Documents */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                hasDocs
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {hasDocs ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Generated ({p.documents_count})</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pending Intake</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                            {new Date(p.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedProject(p)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B2559] hover:bg-[#071838] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#C59B27]" />
                                <span>View Details</span>
                              </button>
                              <Link
                                to={`/projects/${p.id}/questionnaire`}
                                title="Open Blueprint Questionnaire"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PROJECT DOSSIER VIEW DETAILS MODAL                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="spatial-surface rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Project Header */}
            <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#C59B27] uppercase tracking-wider">
                  Company Blueprint Record: {selectedProject.id}
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {selectedProject.status}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#0B2559] dark:text-white">
                {selectedProject.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {selectedProject.preferred_structure || "Private Limited Company"}
                </span>
                <span>Domain: <strong>{selectedProject.domain}</strong></span>
                <span>Completion: <strong>{selectedProject.completion_percentage}%</strong></span>
              </div>
            </div>

            {/* Client / Founder Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Client / Company Founder Details
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {selectedProject.owner_name || "Entrepreneur"}
                </div>
                <div className="flex items-center gap-3">
                  {selectedProject.owner_phone && (
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <a href={`tel:${selectedProject.owner_phone}`} className="hover:underline">
                        {selectedProject.owner_phone}
                      </a>
                    </span>
                  )}
                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedProject.owner_email}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Business Profile & Objects */}
            <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <h4 className="text-sm font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Business Activity &amp; Capital Structure</span>
              </h4>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">Business Description:</span>
                <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed">
                  {selectedProject.business_profile?.business_description || "Intake in progress. Detailed main business objects to be drafted in MoA Clause 3(a)."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Proposed Capital</span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Authorized: ₹{(selectedProject.business_profile?.proposed_authorized_capital || 100000).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Paid-up: ₹{(selectedProject.business_profile?.proposed_paid_up_capital || 100000).toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Business Stage &amp; Model</span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Stage: {selectedProject.business_profile?.business_stage || "Idea / Pre-incorporation"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Model: {selectedProject.business_profile?.business_model || "B2B / Technology Service"}
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Generated Documents */}
            <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Statutory Documentation &amp; Formation Blueprints</span>
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {selectedProject.documents_count || 0} Document(s)
                </span>
              </div>

              {(selectedProject.generated_documents && selectedProject.generated_documents.length > 0) ? (
                <div className="space-y-2">
                  {selectedProject.generated_documents.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">{doc.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Format: {doc.file_format?.toUpperCase()} · Status: {doc.status}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>No Documents Generated Yet</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    The client has initialized this company blueprint but has not finalized the questionnaire intake to trigger automated MoA/AoA document generation.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Link
                  to={`/projects/${selectedProject.id}/questionnaire`}
                  className="corpsetu-btn-navy text-xs py-2.5 px-4 font-bold inline-flex items-center gap-1.5"
                >
                  <span>Open Full Questionnaire Dossier &rarr;</span>
                </Link>
                {selectedProject.owner_phone && (
                  <a
                    href={`tel:${selectedProject.owner_phone}`}
                    className="glass-button-secondary text-xs py-2.5 px-4 font-bold inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Client</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: CLIENT SERVICES TRACKER (CA / CS / LAW)                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "tracker" && (
        <div className="space-y-6">
          {/* Tracker Filters & Search Bar */}
          <div className="spatial-surface p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Service Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {[
                { key: "ALL", label: `All Services (${serviceDossiers.length})` },
                {
                  key: "CS",
                  label: `CS Incorporation (${serviceDossiers.filter((d) => d.active_pillars.includes("CS")).length})`,
                },
                {
                  key: "CA",
                  label: `CA & Tax (${serviceDossiers.filter((d) => d.active_pillars.includes("CA")).length})`,
                },
                {
                  key: "LAW",
                  label: `Corporate Law (${serviceDossiers.filter((d) => d.active_pillars.includes("LAW")).length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setServiceFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    serviceFilter === tab.key
                      ? "bg-[#0B2559] text-white shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={trackerSearch}
                onChange={(e) => setTrackerSearch(e.target.value)}
                placeholder="Search by client name, email, phone, company..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#C59B27]"
              />
            </div>
          </div>

          {/* Client Service Tracker Table */}
          <div className="spatial-card rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#C59B27]" />
                  <span>Client Service Adoption &amp; Incorporation Registry</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Initial view shows client name, email, phone number, and document generation status. Click <strong>View Details</strong> to inspect desired company name, legal structure, and full dossier.
                </p>
              </div>
            </div>

            {filteredDossiers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                No clients match the selected service criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Email ID</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Active Services</th>
                      <th className="py-3 px-4">Desired Company Name</th>
                      <th className="py-3 px-4">Document Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDossiers.map((client) => {
                      const hasDocs = client.has_generated_documents;

                      return (
                        <tr key={client.user_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {client.full_name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Joined {new Date(client.joined_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                            {client.email}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <a href={`tel:${client.phone_number}`} className="hover:underline">
                                {client.phone_number}
                              </a>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {client.active_pillars.map((pillar) => (
                                <span
                                  key={pillar}
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                    pillar === "CS"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                      : pillar === "CA"
                                      ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                      : pillar === "LAW"
                                      ? "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                                      : "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                                  }`}
                                >
                                  {pillar === "CS"
                                    ? "CS Incorporation"
                                    : pillar === "CA"
                                    ? "CA & Tax"
                                    : pillar === "LAW"
                                    ? "Corporate Law"
                                    : "General"}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-[200px]">
                            {client.primary_company_name ? (
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white truncate block">
                                  {client.primary_company_name}
                                </span>
                                {client.preferred_structures[0] && (
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {client.preferred_structures[0]}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No blueprint started</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                hasDocs
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {hasDocs ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Generated ({client.generated_documents_count})</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Not Generated Yet</span>
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedDossier(client)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B2559] hover:bg-[#071838] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#C59B27]" />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CLIENT DOSSIER VIEW DETAILS MODAL                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="spatial-surface rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDossier(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dossier Header */}
            <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#C59B27] uppercase tracking-wider">
                  Client Profile &amp; Adoption Dossier
                </span>
                <div className="flex items-center gap-1">
                  {selectedDossier.active_pillars.map((p) => (
                    <span
                      key={p}
                      className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {p} Service
                    </span>
                  ))}
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-[#0B2559] dark:text-white">
                {selectedDossier.full_name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <a href={`tel:${selectedDossier.phone_number}`} className="hover:underline">
                    {selectedDossier.phone_number}
                  </a>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedDossier.email}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined {new Date(selectedDossier.joined_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </span>
              </div>
            </div>

            {/* SECTION 1: 🏢 CS SERVICES & COMPANY SETUP */}
            <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Company Secretarial (CS) &amp; Incorporation Services</span>
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedDossier.projects_count} Company Project(s)
                </span>
              </div>

              {selectedDossier.projects_count > 0 ? (
                <div className="space-y-3">
                  {selectedDossier.projects.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-extrabold text-slate-900 dark:text-white">
                        <span className="text-sm">{p.name}</span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 text-[11px]">{p.structure || "Private Limited"}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Industry Domain: <strong>{p.domain}</strong></span>
                        <span>Intake Completion: <strong>{p.completion_percentage}%</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs">
                  User has registered but not initialized a company formation blueprint yet.
                </div>
              )}

              {/* Statutory Documents Check */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Statutory Document Generation Status:
                </span>

                {selectedDossier.has_generated_documents ? (
                  <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-emerald-900 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Documents Successfully Generated ({selectedDossier.generated_documents_count})</span>
                    </div>
                    <div className="space-y-1">
                      {selectedDossier.generated_documents.map((d) => (
                        <div key={d.id} className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="font-bold">{d.title}</span>
                          <span className="font-mono text-[10px] uppercase font-bold text-emerald-600">{d.file_format}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-amber-900 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Statutory Documents Not Generated Yet</span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      Client has not finalized their MoA / AoA or statutory documentation. Team callback is recommended to guide them through the intake questionnaire.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: 🏛️ CA SERVICES & TAXATION */}
            <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>Chartered Accountant (CA) &amp; Tax Strategy</span>
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {selectedDossier.ca_inquiries_count} Inquiry(s)
                </span>
              </div>

              {selectedDossier.ca_inquiries_count > 0 ? (
                <div className="space-y-2">
                  {selectedDossier.ca_consultations.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{c.topic}</span>
                        <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">{c.status}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Slot: {c.preferred_time_slot || "Morning"} · Date: {c.preferred_date || "Within 24 Hours"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs">
                  No CA or Tax Strategy consultations requested yet by this user.
                </div>
              )}
            </div>

            {/* SECTION 3: ⚖️ CORPORATE LAW & CONTRACTS */}
            <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Corporate Law &amp; Intellectual Property (IP)</span>
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {selectedDossier.law_inquiries_count} Inquiry(s)
                </span>
              </div>

              {selectedDossier.law_inquiries_count > 0 ? (
                <div className="space-y-2">
                  {selectedDossier.law_consultations.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{c.topic}</span>
                        <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">{c.status}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Slot: {c.preferred_time_slot || "Morning"} · Date: {c.preferred_date || "Within 24 Hours"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs">
                  No Corporate Law or Founder Vesting contract inquiries logged yet.
                </div>
              )}
            </div>

            {/* SECTION 4: 🕒 RECENT ACTIVITY TIMELINE */}
            <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-sm font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Recorded Activity Timeline</span>
              </h4>

              <div className="space-y-1.5 font-mono text-[11px] max-h-44 overflow-y-auto">
                {selectedDossier.activity_timeline.length === 0 ? (
                  <div className="text-slate-400 text-xs font-sans">No recent activity logs found.</div>
                ) : (
                  selectedDossier.activity_timeline.map((act) => (
                    <div key={act.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{act.action}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedDossier.phone_number}`}
                  className="corpsetu-btn-navy text-xs py-2.5 px-4 font-bold inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {selectedDossier.phone_number}</span>
                </a>
                <a
                  href={`mailto:${selectedDossier.email}`}
                  className="glass-button-secondary text-xs py-2.5 px-4 font-bold inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Client</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDossier(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: OPERATIONS OVERVIEW                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Registered Users</span>
              <div className="text-3xl font-extrabold text-[#0B2559] dark:text-white mt-1">{users.length}</div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Founders &amp; corporate clients</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Company Blueprints</span>
              <div className="text-3xl font-extrabold text-[#0B2559] dark:text-white mt-1">{totalProjectsCount}</div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Saved in database</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Pending Outreach</span>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingConsultationsCount}</div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-1">Clients awaiting phone callback</p>
            </div>

            <div className="spatial-card p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Consulted Sessions</span>
              </span>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{consultedCount}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-1">Successfully approached &amp; advised</p>
            </div>
          </div>

          {/* Latest Client Projects Preview */}
          <div className="spatial-card rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-[#C59B27]" />
                  <span>Recent Client Projects in Database</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Total <strong>{totalProjectsCount} company blueprints</strong> saved in the database.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("projects")}
                className="text-xs font-bold text-[#0B2559] dark:text-[#E5B842] hover:underline flex items-center gap-1"
              >
                <span>View All ({projects.length}) &rarr;</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">Legal Structure</th>
                    <th className="py-3 px-4">Client Contact</th>
                    <th className="py-3 px-4">Intake Progress</th>
                    <th className="py-3 px-4">Documents</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {projects.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-[10px] text-emerald-600">{p.domain}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {p.preferred_structure || "Pvt Ltd"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{p.owner_name}</div>
                        <div className="text-[10px] text-slate-400">{p.owner_email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${p.completion_percentage === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                          {p.completion_percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          (p.documents_count || 0) > 0 ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}>
                          {(p.documents_count || 0) > 0 ? `✓ Generated (${p.documents_count})` : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedProject(p)}
                          className="px-2.5 py-1 rounded-lg bg-[#0B2559] text-white text-xs font-bold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Recent Consultation Inquiries Desk with Quick 👍 and 👎 */}
          <div className="spatial-card rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B2559] dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-[#C59B27]" />
                  <span>Recent Client Consultation Inquiries</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Triage client requests quickly using 👍 <strong>Consulted</strong> and 👎 <strong>Not Accepted</strong> buttons.
                </p>
              </div>

              <Link
                to="/admin/consultations"
                className="text-xs font-bold text-[#0B2559] dark:text-[#E5B842] hover:underline flex items-center gap-1"
              >
                <span>View All ({consultations.length})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {consultations.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-semibold">
                No active consultation requests found in database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Ref ID &amp; Pillar</th>
                      <th className="py-3 px-4">Client Contact</th>
                      <th className="py-3 px-4">Requirement Topic</th>
                      <th className="py-3 px-4">Preferred Slot</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Quick Triage (👍 / 👎)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {consultations.slice(0, 5).map((item) => {
                      const isConsulted = item.status === "Consulted";
                      const isNotAccepted = item.status === "Not Accepted";
                      const isPending = item.status === "Requested";

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4">
                            <span className="font-mono font-extrabold text-[#0B2559] dark:text-white block">
                              {item.id}
                            </span>
                            <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400">
                              {item.pillar} Advisory
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-slate-900 dark:text-white">{item.full_name}</div>
                            <div className="mt-1">
                              <a
                                href={`tel:${item.phone_number}`}
                                title={`Click to direct call ${item.phone_number}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[11px] shadow-xs transition-all cursor-pointer"
                              >
                                <PhoneCall className="w-3 h-3 text-white" />
                                <span>{item.phone_number}</span>
                              </a>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-1">{item.email}</div>
                          </td>
                          <td className="py-3 px-4 max-w-[200px]">
                            <div className="font-bold text-slate-900 dark:text-white truncate">{item.topic}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {new Date(item.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{item.preferred_time_slot}</div>
                            <div className="text-[10px] text-slate-400">{item.preferred_date}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                                isConsulted
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                  : isNotAccepted
                                  ? "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                                  : isPending
                                  ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {isConsulted ? (
                                <ThumbsUp className="w-3 h-3 text-emerald-600" />
                              ) : isNotAccepted ? (
                                <ThumbsDown className="w-3 h-3 text-rose-600" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              )}
                              <span>{isConsulted ? "Consulted" : isNotAccepted ? "Not Accepted" : item.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 📞 Green Direct Call Button */}
                              <a
                                href={`tel:${item.phone_number}`}
                                title={`Direct Call: ${item.phone_number}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
                              >
                                <PhoneCall className="w-3 h-3 text-white" />
                                <span>Call</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => handleQuickStatus(item.id, "Consulted")}
                                disabled={updatingId === item.id || item.status === "Consulted"}
                                title="Mark as Consulted"
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                  item.status === "Consulted"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Consulted</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleQuickStatus(item.id, "Not Accepted")}
                                disabled={updatingId === item.id || item.status === "Not Accepted"}
                                title="Mark as Not Accepted"
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                  item.status === "Not Accepted"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300"
                                }`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>Not Accepted</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: CONSULTATIONS FULL VIEW                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "consultations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-[#0B2559] dark:text-white">
              All Client Consultation Requests
            </h3>
            <Link
              to="/admin/consultations"
              className="corpsetu-btn-navy text-xs py-2 px-3.5 flex items-center gap-2 font-bold shadow-sm"
            >
              <span>Open Dedicated Management Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="spatial-card rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* ◄► Horizontal Navigation & Moving Control Bar at Top of List */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#C59B27]/15 border border-[#C59B27]/30 flex items-center justify-center text-[#C59B27]">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 text-[11px] uppercase tracking-wider">
                      Horizontal Navigation Bar
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-[#C59B27] border border-amber-500/20">
                      Scroll: {consultScrollProgress}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Drag the top scrollbar or use quick navigation buttons to view all columns
                  </span>
                </div>
              </div>

              {/* Quick Jump & Scroll Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollConsultTableTo("start")}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-extrabold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  title="Jump to Start (Client Contact)"
                >
                  <span>⇤ Start</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollConsultTable(-320)}
                  className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-extrabold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Left</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollConsultTable(320)}
                  className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-extrabold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  title="Scroll Right"
                >
                  <span>Right</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollConsultTableTo("end")}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-extrabold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  title="Jump to End (Actions & Triage)"
                >
                  <span>Actions ⇥</span>
                </button>
              </div>
            </div>

            {/* Synchronized Top Horizontal Scrollbar (Draggable bar at top of list) */}
            <div
              ref={consultTopScrollRef}
              onScroll={handleConsultTopScroll}
              className="w-full overflow-x-auto bg-slate-200/90 dark:bg-slate-700/90 border-b border-slate-300 dark:border-slate-600 cursor-ew-resize select-none"
              style={{ minHeight: "14px" }}
              title="Top Horizontal Scroll Bar (Drag to scroll table)"
            >
              <div style={{ width: `${consultTableWidth}px`, height: "1px" }} />
            </div>

            <div
              ref={consultTableContainerRef}
              onScroll={handleConsultTableScroll}
              className="overflow-x-auto p-4 sm:p-6"
            >
              <table ref={consultTableRef} className="w-full min-w-[1250px] text-left text-xs text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Ref ID &amp; Pillar</th>
                    <th className="py-3 px-4">Client Contact</th>
                    <th className="py-3 px-4">Service Scope &amp; Structured PDF</th>
                    <th className="py-3 px-4">Slot &amp; Status</th>
                    <th className="py-3 px-4">Fulfillment Actions</th>
                    <th className="py-3 px-4 text-right">Quick Triage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {consultations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-mono font-extrabold text-[#0B2559] dark:text-white block">{item.id}</span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">{item.pillar} Advisory</span>
                        {item.service_category && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-block mt-0.5">
                            {item.service_category}
                          </span>
                        )}
                        {item.preferred_entity_type && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-block mt-0.5 ml-1">
                            {item.preferred_entity_type}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">{item.full_name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.email}</div>
                        {/* Primary Phone with Green Call Button */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">{item.phone_number}</span>
                          <a
                            href={`tel:${item.phone_number}`}
                            title={`Call Primary: ${item.phone_number}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold shadow-2xs transition-all cursor-pointer"
                          >
                            <PhoneCall className="w-2.5 h-2.5" />
                            <span>Call</span>
                          </a>
                        </div>
                        {/* Optional / Alternate Phone with Green Call Button */}
                        {item.alternate_phone && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-mono">Alt: {item.alternate_phone}</span>
                            <a
                              href={`tel:${item.alternate_phone}`}
                              title={`Call Alternate: ${item.alternate_phone}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-extrabold shadow-2xs transition-all cursor-pointer"
                            >
                              <PhoneCall className="w-2 h-2" />
                              <span>Alt Call</span>
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-[240px]">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{item.topic}</div>
                        {item.notes && <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{item.notes}</p>}
                        {/* Structured Table PDF Download */}
                        <div className="mt-1.5">
                          <a
                            href={`/api/v1/consultations/${item.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[#C59B27] border border-amber-500/30 text-[10px] font-extrabold transition-all"
                          >
                            <Download className="w-3 h-3 text-[#C59B27]" />
                            <span>Structured Table PDF</span>
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.preferred_time_slot}</div>
                        <div className="text-[10px] text-slate-400">{item.preferred_date}</div>
                        <span className={`inline-block mt-1 font-extrabold text-[10px] px-2 py-0.5 rounded-full border ${
                          item.status === "Consulted"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : item.status === "Not Accepted"
                            ? "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {/* Send Questionnaire */}
                          <button
                            type="button"
                            onClick={() => handleSendQuestionnaire(item)}
                            title="Email questionnaire form link to client"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Send Form</span>
                            {item.questionnaire_sent_at && <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 ml-auto" />}
                          </button>
                          {/* Share Expert Profile */}
                          <button
                            type="button"
                            onClick={() => handleShareExpert(item)}
                            title="Email empanelled CA / Advocate credentials to client"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <UserCheck className="w-2.5 h-2.5" />
                            <span>Share {item.pillar === "CA" ? "CA" : item.pillar === "LAW" ? "Adv" : "CS"}</span>
                            {item.expert_shared_at && <CheckCircle2 className="w-2.5 h-2.5 text-purple-600 ml-auto" />}
                          </button>
                          {/* Send Document */}
                          <button
                            type="button"
                            onClick={() => handleSendDocument(item)}
                            title="Email generated blueprint to client"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <FileCheck className="w-2.5 h-2.5" />
                            <span>Send Doc</span>
                            {item.document_sent_at && <CheckCircle2 className="w-2.5 h-2.5 text-amber-600 ml-auto" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(item.id, "Consulted")}
                            disabled={updatingId === item.id || item.status === "Consulted"}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 cursor-pointer"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Consulted</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(item.id, "Not Accepted")}
                            disabled={updatingId === item.id || item.status === "Not Accepted"}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300 cursor-pointer"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span>Not Accepted</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB: CLIENT ENQUIRIES & LEADS                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "enquiries" && (
        <div className="space-y-6">
          {/* Enquiries KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enquiries</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{enquiries.length}</div>
              <span className="text-[11px] text-slate-400 font-medium">All logged leads</span>
            </div>
            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">New / Uncontacted</span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {enquiries.filter(e => e.status === "New").length}
              </div>
              <span className="text-[11px] text-emerald-700/80 font-medium">Awaiting callback</span>
            </div>
            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">In Discussion</span>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">
                {enquiries.filter(e => e.status === "Contacted").length}
              </div>
              <span className="text-[11px] text-blue-700/80 font-medium">Active conversations</span>
            </div>
            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Converted</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {enquiries.filter(e => e.status === "Converted").length}
              </div>
              <span className="text-[11px] text-amber-700/80 font-medium">Client onboarded</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="spatial-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, phone..."
                value={enquirySearch}
                onChange={(e) => setEnquirySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={enquiryPillarFilter}
                onChange={(e) => setEnquiryPillarFilter(e.target.value)}
                className="text-xs rounded-xl glass-input py-2 px-3 font-semibold"
              >
                <option value="ALL">All Practices</option>
                <option value="CS">CS / Incorporation</option>
                <option value="CA">CA / Tax</option>
                <option value="LAW">Corporate Law</option>
                <option value="GENERAL">General</option>
              </select>
              <select
                value={enquiryStatusFilter}
                onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                className="text-xs rounded-xl glass-input py-2 px-3 font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Enquiries Table */}
          <div className="spatial-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-slate-700 dark:text-slate-300 font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Lead ID &amp; Practice</th>
                    <th className="py-3 px-4">Client Details</th>
                    <th className="py-3 px-4">Topic / Requirements</th>
                    <th className="py-3 px-4">Received On</th>
                    <th className="py-3 px-4">Lead Status</th>
                    <th className="py-3 px-4 text-right">Direct Call Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {enquiries
                    .filter((e) => {
                      if (enquiryPillarFilter !== "ALL" && e.service_pillar !== enquiryPillarFilter) return false;
                      if (enquiryStatusFilter !== "ALL" && e.status !== enquiryStatusFilter) return false;
                      if (enquirySearch.trim()) {
                        const s = enquirySearch.toLowerCase();
                        return (
                          e.full_name?.toLowerCase().includes(s) ||
                          e.email?.toLowerCase().includes(s) ||
                          e.phone_number?.includes(s) ||
                          e.topic?.toLowerCase().includes(s)
                        );
                      }
                      return true;
                    })
                    .map((enq) => (
                      <tr key={enq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-extrabold text-[#0B2559] dark:text-white block">{enq.id}</span>
                          <span className="text-[10px] font-extrabold text-[#C59B27]">{enq.service_pillar} Practice</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">{enq.full_name}</div>
                          {enq.company_name && (
                            <div className="text-[11px] text-slate-500 font-semibold">{enq.company_name}</div>
                          )}
                          <div className="mt-1">
                            <a
                              href={`tel:${enq.phone_number}`}
                              title={`Direct Call: ${enq.phone_number}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[11px] shadow-xs cursor-pointer"
                            >
                              <PhoneCall className="w-3 h-3 text-white" />
                              <span>{enq.phone_number}</span>
                            </a>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">{enq.email}</div>
                        </td>
                        <td className="py-3 px-4 max-w-[240px]">
                          <div className="font-bold text-slate-900 dark:text-white">{enq.topic}</div>
                          {enq.message && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{enq.message}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {new Date(enq.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={enq.status}
                            onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                            className="text-xs font-bold rounded-xl py-1 px-2.5 glass-input cursor-pointer"
                          >
                            <option value="New">🟢 New</option>
                            <option value="Contacted">🟡 Contacted</option>
                            <option value="Converted">🔵 Converted</option>
                            <option value="Closed">⚪ Closed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`tel:${enq.phone_number}`}
                            title={`Make a direct call to ${enq.full_name}: ${enq.phone_number}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
                            <span>Call Now</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB: ACTIVE & INACTIVE USER TRACKER                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          {/* Active / Inactive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Online / Active Now</span>
                <Radio className="w-4 h-4 text-emerald-500 animate-ping" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                {activityOverview?.online_count ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">Active within past 30 mins</span>
            </div>

            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Recently Active</span>
                <UserCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600 mt-2">
                {activityOverview?.recently_active_count ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">Active within last 7 days</span>
            </div>

            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inactive / Dormant</span>
                <UserX className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300 mt-2">
                {activityOverview?.inactive_count ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">No activity in over 7 days</span>
            </div>

            <div className="spatial-card p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B2559] dark:text-white uppercase tracking-wider">Total Registered</span>
                <Users className="w-4 h-4 text-[#C59B27]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0B2559] dark:text-white mt-2">
                {activityOverview?.total_users ?? users.length}
              </div>
              <span className="text-[11px] text-slate-500">Verified platform accounts</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="spatial-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, email, phone..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {[
                { id: "all", label: "All Users" },
                { id: "online", label: `🟢 Online (${activityOverview?.online_count ?? 0})` },
                { id: "recently_active", label: `🟡 Recent (${activityOverview?.recently_active_count ?? 0})` },
                { id: "inactive", label: `⚪ Inactive (${activityOverview?.inactive_count ?? 0})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActivityFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    activityFilter === btn.id
                      ? "bg-[#0B2559] text-white shadow-xs"
                      : "spatial-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Users Table */}
          <div className="spatial-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-slate-700 dark:text-slate-300 font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Live Presence</th>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Contact Phone &amp; Direct Call</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Projects / Consultations</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(activityOverview?.users || []).filter((u) => {
                    if (activityFilter === "online" && u.activity_state !== "online") return false;
                    if (activityFilter === "recently_active" && u.activity_state !== "recently_active") return false;
                    if (activityFilter === "inactive" && u.activity_state !== "inactive") return false;
                    if (activitySearch.trim()) {
                      const s = activitySearch.toLowerCase();
                      return u.full_name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || (u.phone_number && u.phone_number.includes(s));
                    }
                    return true;
                  }).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        {u.activity_state === "online" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Online Now</span>
                          </span>
                        ) : u.activity_state === "recently_active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Recently Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">{u.full_name}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        {u.phone_number ? (
                          <a
                            href={`tel:${u.phone_number}`}
                            title={`Direct Call ${u.full_name}: ${u.phone_number}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-xs cursor-pointer"
                          >
                            <PhoneCall className="w-3 h-3 text-white" />
                            <span>{u.phone_number}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">No Phone</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          u.role === "Administrator"
                            ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {u.projects_count} Project(s) · {u.consultations_count} Call(s)
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {u.last_active_at
                          ? new Date(u.last_active_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(u.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB: WEBSITE CONTROLS & PLATFORM SETTINGS                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "controls" && (
        <form onSubmit={handleSavePlatformSettings} className="space-y-6 max-w-4xl">
          <div className="spatial-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C59B27] uppercase tracking-wider mb-1">
                <Sliders className="w-4 h-4" />
                <span>Live Website Controls · Instant Global Propagation</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0B2559] dark:text-white">
                Platform Contact &amp; Public Desk Configuration
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Updating these values instantly updates the header, footer, support links, and consultation communications across the entire portal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Official Support Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  <input
                    type="text"
                    value={platformSettings.support_phone}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, support_phone: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl glass-input font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Official Advisory Support Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={platformSettings.support_email}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, support_email: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl glass-input font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Advisory Desk Operating Hours
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type="text"
                    value={platformSettings.support_hours}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, support_hours: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl glass-input font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Consultation Response SLA
                </label>
                <div className="relative">
                  <Sparkles className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C59B27]" />
                  <input
                    type="text"
                    value={platformSettings.consultation_turnaround}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, consultation_turnaround: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl glass-input font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Corporate Office / Registered Headquarters Address
              </label>
              <textarea
                rows={2}
                value={platformSettings.office_address}
                onChange={(e) => setPlatformSettings({ ...platformSettings, office_address: e.target.value })}
                required
                className="w-full p-3 text-xs rounded-xl glass-input font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Platform Announcement &amp; Advisory Notice Banner
              </label>
              <input
                type="text"
                value={platformSettings.announcement_banner}
                onChange={(e) => setPlatformSettings({ ...platformSettings, announcement_banner: e.target.value })}
                className="w-full p-3 text-xs rounded-xl glass-input font-medium"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="corpsetu-btn-gold text-xs py-2.5 px-6 font-bold shadow-md disabled:opacity-60 cursor-pointer"
              >
                {savingSettings ? "Saving Settings..." : "Save & Apply Website Controls"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 6: GRIEVANCES & SUPPORT                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "grievances" && (
        <div className="spatial-card rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-extrabold text-[#0B2559] dark:text-white">
                Client Grievances &amp; Support Escalations
              </h3>
              <p className="text-xs text-slate-500">
                Track formal statutory filings and client dispute tickets.
              </p>
            </div>
            <Link
              to="/complaints"
              className="corpsetu-btn-navy text-xs py-2 px-3.5 flex items-center gap-2 font-bold"
            >
              <span>Open Grievances Desk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {complaints.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-semibold">
              No active grievances logged by clients. Support queue is clear.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Category &amp; Pillar</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {complaints.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-extrabold text-[#0B2559] dark:text-white">{item.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.company_name}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.category}</div>
                        <div className="text-[10px] text-amber-700">{item.pillar} Advisory</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 7: AUDIT TRAIL                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "audit" && (
        <div className="spatial-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-[#0B2559] dark:text-white">Immutable Platform Audit Trail</h3>
          <div className="space-y-2 font-mono text-xs max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-sans text-xs">No audit logs recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{log.action}</span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] font-sans font-medium">
                      {log.user_email} • {log.entity_type} {log.entity_id}
                    </p>
                  </div>
                  <span className="text-slate-500 text-[11px] whitespace-nowrap font-medium">
                    {new Date(log.timestamp).toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 8: SYSTEM HEALTH                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "health" && (
        <div className="spatial-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">System Infrastructure &amp; Security Status</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block mb-1">Database Connectivity</span>
              <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                {health?.database === "Connected" ? "Connected & Healthy" : health?.database || "Connected"}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">SQLite Local Vault</p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <span className="text-xs text-blue-800 dark:text-blue-300 font-bold block mb-1">API &amp; Dispatch Engine</span>
              <div className="text-base font-extrabold text-blue-700 dark:text-blue-400">Operational (FastAPI)</div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">Active on localhost:8000</p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <span className="text-xs text-purple-800 dark:text-purple-300 font-bold block mb-1">Authentication Guard</span>
              <div className="text-base font-extrabold text-purple-700 dark:text-purple-400">JWT Bearer Protected</div>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">Role-Based Access Control</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortalPage;
