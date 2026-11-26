import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Phone,
  Mail,
  Building2,
  Landmark,
  Scale,
  Sparkles,
  Search,
  Filter,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Calendar,
  MessageSquare
} from "lucide-react";
import { consultationsApi, ConsultationItem } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { CorpSetuLogo } from "../../components/CorpSetuLogo";

export const ConsultationsPage: React.FC = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Success Popup State
  const [successPopup, setSuccessPopup] = useState<{
    show: boolean;
    consultationId: string;
    expertName: string;
    topic: string;
    userEmail: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    pillar: "CS" as "CS" | "CA" | "LAW" | "GENERAL",
    topic: "MCA SPICe+ Registration & Name Approval",
    phone_number: user?.phone_number || "",
    email: user?.email || "",
    full_name: user?.full_name || "",
    company_name: "",
    preferred_date: "Today / Earliest Available",
    preferred_time_slot: "Morning (10:00 AM - 1:00 PM)",
    notes: "",
  });

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const data = await consultationsApi.list();
      setConsultations(data);
    } catch (err) {
      console.error("Failed to load consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this consultation request?")) {
      try {
        await consultationsApi.cancel(id);
        await loadConsultations();
      } catch (err: any) {
        alert(err?.message || "Failed to cancel consultation");
      }
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone_number.trim()) {
      alert("Please provide a valid contact phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await consultationsApi.create({
        pillar: formData.pillar,
        topic: formData.topic,
        phone_number: formData.phone_number,
        email: formData.email || user?.email,
        full_name: formData.full_name || user?.full_name,
        company_name: formData.company_name,
        preferred_date: formData.preferred_date,
        preferred_time_slot: formData.preferred_time_slot,
        notes: formData.notes,
      });

      setModalOpen(false);
      setSuccessPopup({
        show: true,
        consultationId: res.id,
        expertName: res.assigned_expert || "Empanelled Lead",
        topic: res.topic,
        userEmail: res.email || formData.email || user?.email || "your registered email",
      });

      // Reload list
      await loadConsultations();
    } catch (err: any) {
      alert(err?.message || "Failed to submit consultation request");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter consultations
  const filteredList = consultations.filter((c) => {
    if (activeTab === "ACTIVE" && ["Completed", "Cancelled"].includes(c.status)) return false;
    if (activeTab === "COMPLETED" && !["Completed", "Cancelled"].includes(c.status)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        (c.assigned_expert && c.assigned_expert.toLowerCase().includes(q)) ||
        (c.company_name && c.company_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* HEADER BANNER                                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="spatial-card-navy p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[#C59B27] text-xs font-bold">
            <CalendarCheck className="w-4 h-4" />
            <span>Dedicated Professional Consultation Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your Consultations &amp; Expert Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Schedule and track your 1-on-1 strategy sessions with empanelled High Court Advocates, Company Secretaries, and Chartered Accountants. Every request is logged in the database and monitored by our dispatch team.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="corpsetu-btn-gold text-xs py-3 px-6 shadow-md whitespace-nowrap z-10 font-bold inline-flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUCCESS CONFIRMATION POPUP MODAL                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {successPopup?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="spatial-surface rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-emerald-400/50 shadow-2xl space-y-5 text-center relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Request Assigned Successfully
              </span>
              <h3 className="text-xl font-extrabold text-[#0B2559] dark:text-white">
                Consultation Assigned &amp; Dispatched!
              </h3>
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100 text-xs font-semibold leading-relaxed shadow-xs">
                Your request has been assigned and sent the details about your consultation to{" "}
                <span className="font-extrabold text-[#0B2559] dark:text-[#E5B842] underline">
                  {successPopup.userEmail}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                In a short period of time our team will contact you via phone &amp; email with meeting coordinates.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Tracking Reference:</span>
                <span className="font-mono font-extrabold text-[#0B2559] dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {successPopup.consultationId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Assigned Specialist:</span>
                <span className="font-bold text-slate-900 dark:text-white">{successPopup.expertName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Topic:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">{successPopup.topic}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSuccessPopup(null)}
                className="w-full corpsetu-btn-navy py-3 text-xs font-bold justify-center"
              >
                Track in Your Consultations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* FILTER & SEARCH TABS                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 spatial-surface p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { key: "ALL", label: `All Consultations (${consultations.length})` },
            {
              key: "ACTIVE",
              label: `Active (${consultations.filter((c) => !["Completed", "Cancelled"].includes(c.status)).length})`,
            },
            {
              key: "COMPLETED",
              label: `Completed / Past (${consultations.filter((c) => ["Completed", "Cancelled"].includes(c.status)).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-[#0B2559] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, topic, or expert..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-[#C59B27]"
          />
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CONSULTATIONS LIST                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm font-medium">
          Loading your consultation records from database...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="spatial-card p-12 sm:p-16 rounded-3xl text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-[#C59B27] flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {searchQuery ? "No matching consultations found" : "No consultations booked yet"}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Need guidance with company incorporation, GST advisory, Advance Tax calculation, or Founder agreements? Request a call with our certified partners.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="corpsetu-btn-navy text-xs py-2.5 px-5 inline-flex font-bold"
          >
            Schedule Free Strategy Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => {
            const isRequested = item.status === "Requested";
            const isCompleted = item.status === "Completed";
            const isCancelled = item.status === "Cancelled";

            return (
              <div
                key={item.id}
                className="spatial-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4 hover:border-[#C59B27] transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-extrabold text-sm text-[#0B2559] dark:text-white tracking-wide">
                      {item.id}
                    </span>
                    <button
                      onClick={() => handleCopyId(item.id)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                      title="Copy Reference ID"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        item.pillar === "CS"
                          ? "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200"
                          : item.pillar === "CA"
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : item.pillar === "LAW"
                          ? "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-200"
                          : "bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-200"
                      }`}
                    >
                      {item.pillar === "CS"
                        ? "CS Secretarial"
                        : item.pillar === "CA"
                        ? "CA / Taxation"
                        : item.pillar === "LAW"
                        ? "Corporate Law"
                        : "General Advisory"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : isCancelled
                          ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isCancelled ? (
                        <X className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                      )}
                      <span>
                        {isRequested
                          ? "Requested · Team Contacting You"
                          : item.status}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Content Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-7 space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {item.topic}
                    </h3>
                    {item.company_name && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Company: <strong>{item.company_name}</strong></span>
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.notes}
                      </p>
                    )}

                    {/* Reassurance Message */}
                    {!isCompleted && !isCancelled && (
                      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C59B27] flex-shrink-0" />
                        <span>
                          <strong>Status:</strong> In a short period of time our team will contact you via phone (<strong>{item.phone_number}</strong>) and email to coordinate the meeting.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expert & Booking Slot Box */}
                  <div className="md:col-span-5 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0B2559] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {item.assigned_expert?.split(" ")[1]?.charAt(0) || "E"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 dark:text-white truncate">
                          {item.assigned_expert}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.expert_role}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Preferred Slot:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{item.preferred_time_slot}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Target Date:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{item.preferred_date}</span>
                      </div>
                    </div>

                    {/* Meeting Link Action */}
                    {item.meeting_link && !isCancelled && (
                      <div className="pt-2 flex items-center gap-2">
                        <a
                          href={item.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-[11px] text-center hover:bg-blue-700 inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meeting Room</span>
                        </a>
                        {!isCompleted && (
                          <button
                            onClick={() => handleCancel(item.id)}
                            className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-[11px] font-bold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* BOOK NEW CONSULTATION MODAL                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="spatial-surface rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C59B27] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Empanelled Strategy Call</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0B2559] dark:text-white">
                Book a Professional Consultation
              </h2>
              <p className="text-xs text-slate-500">
                Connect directly with our certified CA, CS, or Corporate Lawyer. We assign an expert immediately.
              </p>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-3.5 text-left" autoComplete="off">
              {/* Pillar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Professional Domain *
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                  {[
                    { key: "CS", label: "CS / MCA" },
                    { key: "CA", label: "CA / Tax" },
                    { key: "LAW", label: "Legal" },
                    { key: "GENERAL", label: "All Three" },
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.key}
                      onClick={() => setFormData({ ...formData, pillar: tab.key as any })}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        formData.pillar === tab.key
                          ? "bg-[#0B2559] text-white border-[#0B2559]"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#C59B27]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Consultation Topic / Requirement *
                </label>
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. MCA Name Resubmission, GSTR-3B ITC Mismatch, Founder Vesting"
                  className="w-full glass-input text-xs"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Phone Number (for Callback) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. My Startup Pvt Ltd"
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              {/* Time Slot & Target Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={formData.preferred_time_slot}
                    onChange={(e) => setFormData({ ...formData, preferred_time_slot: e.target.value })}
                    className="w-full glass-input text-xs font-semibold"
                  >
                    <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                    <option value="Evening (6:00 PM - 8:00 PM)">Evening (6:00 PM - 8:00 PM)</option>
                    <option value="Earliest Available (~20 mins)">Earliest Available (~20 mins)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Target Date
                  </label>
                  <select
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    className="w-full glass-input text-xs font-semibold"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Within 48 Hours">Within 48 Hours</option>
                    <option value="This Weekend">This Weekend</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Specific Questions or Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Provide any context, MCA notices, or questions for the expert..."
                  className="w-full glass-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full corpsetu-btn-gold text-xs py-3 justify-center shadow-md font-bold disabled:opacity-50"
              >
                {submitting ? "Booking into Database..." : "Confirm Consultation & Dispatch to Expert"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationsPage;
