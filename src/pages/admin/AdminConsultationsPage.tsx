import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Building,
  User,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  X,
  FileText,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Edit3
} from "lucide-react";
import { consultationsApi, ConsultationItem } from "../../api/client";
import { useToast } from "../../context/ToastContext";

export const AdminConsultationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [domainFilter, setDomainFilter] = useState<string>("ALL");
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationItem | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [statusToUpdate, setStatusToUpdate] = useState<string>("Consulted");
  const [assignedExpertToUpdate, setAssignedExpertToUpdate] = useState<string>("");
  const [expertRoleToUpdate, setExpertRoleToUpdate] = useState<string>("");
  const [resolutionSummary, setResolutionSummary] = useState<string>("");
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const data = await consultationsApi.list();
      setConsultations(data || []);
    } catch (err: any) {
      showToast(err?.message || "Failed to load consultation requests", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
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

  const handleOpenActionModal = (item: ConsultationItem) => {
    setSelectedConsultation(item);
    setStatusToUpdate(item.status);
    setAssignedExpertToUpdate(item.assigned_expert || "Senior Advisory Desk");
    setExpertRoleToUpdate(item.expert_role || "Empanelled Practitioner");
    setResolutionSummary(item.resolution_summary || "");
    setActionModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation) return;

    setSubmittingAction(true);
    try {
      const updated = await consultationsApi.updateStatus(selectedConsultation.id, {
        status: statusToUpdate,
        assigned_expert: assignedExpertToUpdate,
        expert_role: expertRoleToUpdate,
        resolution_summary: resolutionSummary || undefined,
      });

      setConsultations((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      setActionModalOpen(false);
      showToast(`Consultation ${updated.id} status updated to '${statusToUpdate}'`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to update consultation", "warning");
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredConsultations = consultations.filter((item) => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (domainFilter !== "ALL" && item.pillar !== domainFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.full_name?.toLowerCase().includes(q);
      const matchEmail = item.email?.toLowerCase().includes(q);
      const matchPhone = item.phone_number?.toLowerCase().includes(q);
      const matchCompany = item.company_name?.toLowerCase().includes(q);
      const matchTopic = item.topic?.toLowerCase().includes(q);
      const matchId = item.id?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchCompany || matchTopic || matchId;
    }
    return true;
  });

  const totalCount = consultations.length;
  const requestedCount = consultations.filter((c) => c.status === "Requested").length;
  const consultedCount = consultations.filter((c) => c.status === "Consulted").length;
  const notAcceptedCount = consultations.filter((c) => c.status === "Not Accepted").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4 px-2 sm:px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Dispatch &amp; Client Inquiries Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2559] dark:text-white tracking-tight">
            Consultation Requests Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            View, assign, and manage all incoming advisory consultations. Use quick 👍 <strong>Consulted</strong> and 👎 <strong>Not Accepted</strong> to triage client outreach.
          </p>
        </div>

        <button
          onClick={fetchConsultations}
          className="glass-button-secondary text-xs py-2 px-4 flex items-center gap-2 font-bold self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Inquiries</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="spatial-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Inquiries</span>
          <div className="text-3xl font-extrabold text-[#0B2559] dark:text-white mt-1">{totalCount}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Logged across CA, CS &amp; Legal</p>
        </div>

        <div className="spatial-card p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Pending Callback</span>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{requestedCount}</div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-1">Awaiting admin outreach</p>
        </div>

        <div className="spatial-card p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Consulted</span>
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{consultedCount}</div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-1">Approached &amp; advisory delivered</p>
        </div>

        <div className="spatial-card p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block flex items-center gap-1.5">
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Not Accepted</span>
          </span>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{notAcceptedCount}</div>
          <p className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold mt-1">Consulted, proposal declined / closed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="spatial-surface p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { key: "ALL", label: `All (${totalCount})` },
            { key: "Requested", label: `Pending (${requestedCount})` },
            { key: "Consulted", label: `👍 Consulted (${consultedCount})` },
            { key: "Not Accepted", label: `👎 Not Accepted (${notAcceptedCount})` },
            { key: "Scheduled", label: "Scheduled" },
            { key: "Completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-[#0B2559] text-white shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Domain Filter & Search Input */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Pillars</option>
            <option value="CS">CS Secretarial</option>
            <option value="CA">CA &amp; Tax</option>
            <option value="LAW">Corporate Law</option>
            <option value="GENERAL">General</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, phone, ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#C59B27]"
            />
          </div>
        </div>
      </div>

      {/* Requests Table / List */}
      <div className="spatial-card rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden">
        {filteredConsultations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No Consultation Requests Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "ALL" || domainFilter !== "ALL"
                ? "Try adjusting your search criteria or domain filter."
                : "No client consultation requests logged yet in the database."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-4 px-5">Ref ID &amp; Pillar</th>
                  <th className="py-4 px-5">Client &amp; Contact</th>
                  <th className="py-4 px-5">Inquiry Topic</th>
                  <th className="py-4 px-5">Preferred Slot</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Quick Triage &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredConsultations.map((item) => {
                  const isPending = item.status === "Requested";
                  const isConsulted = item.status === "Consulted";
                  const isNotAccepted = item.status === "Not Accepted";
                  const isCompleted = item.status === "Completed";
                  const isCancelled = item.status === "Cancelled";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Ref ID & Domain Badge */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-sm text-[#0B2559] dark:text-white">
                          {item.id}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              item.pillar === "CS"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : item.pillar === "CA"
                                ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                                : item.pillar === "LAW"
                                ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300"
                            }`}
                          >
                            {item.pillar === "CS"
                              ? "CS Secretarial"
                              : item.pillar === "CA"
                              ? "CA & Tax"
                              : item.pillar === "LAW"
                              ? "Corporate Law"
                              : "General Advisory"}
                          </span>
                        </div>
                      </td>

                      {/* Client Contact Info */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {item.full_name || "Prospective Client"}
                        </div>
                        {item.company_name && (
                          <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{item.company_name}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <a href={`tel:${item.phone_number}`} className="hover:underline font-bold text-emerald-700 dark:text-emerald-400">
                              {item.phone_number}
                            </a>
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {item.email}
                        </div>
                      </td>

                      {/* Inquiry Topic & Notes */}
                      <td className="py-4 px-5 max-w-[240px]">
                        <div className="font-extrabold text-slate-900 dark:text-white truncate">
                          {item.topic}
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 font-normal">
                            {item.notes}
                          </p>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {new Date(item.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Preferred Slot */}
                      <td className="py-4 px-5">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.preferred_date || "Within 24 Hours"}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.preferred_time_slot || "Morning"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Assigned: <strong>{item.assigned_expert?.split(" ")[1] || "Senior Lead"}</strong>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                            isConsulted
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                              : isNotAccepted
                              ? "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                              : isPending
                              ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                              : isCompleted
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                              : isCancelled
                              ? "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                              : "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                          }`}
                        >
                          {isConsulted ? (
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : isNotAccepted ? (
                            <ThumbsDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isPending
                                  ? "bg-amber-500 animate-pulse"
                                  : isCompleted
                                  ? "bg-emerald-500"
                                  : isCancelled
                                  ? "bg-slate-500"
                                  : "bg-blue-500"
                              }`}
                            />
                          )}
                          <span>
                            {isConsulted
                              ? "Consulted"
                              : isNotAccepted
                              ? "Not Accepted"
                              : item.status}
                          </span>
                        </span>
                      </td>

                      {/* Actions: Quick 👍 and 👎 Buttons */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 👍 Consulted Button */}
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(item.id, "Consulted")}
                            disabled={updatingId === item.id || item.status === "Consulted"}
                            title="Admin talked / approached client. Mark as Consulted"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              item.status === "Consulted"
                                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/50"
                                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 shadow-xs"
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Consulted</span>
                          </button>

                          {/* 👎 Not Accepted Button */}
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(item.id, "Not Accepted")}
                            disabled={updatingId === item.id || item.status === "Not Accepted"}
                            title="Consulted, but not accepted by client or admin"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              item.status === "Not Accepted"
                                ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/50"
                                : "bg-rose-50 text-rose-800 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-700 shadow-xs"
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Not Accepted</span>
                          </button>

                          {/* Edit / Full Manage Modal Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(item)}
                            title="Full Record &amp; Specialist Assignment"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
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

      {/* Manage / Action Modal */}
      {actionModalOpen && selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="spatial-surface rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setActionModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C59B27] mb-1">
                <span>Reference: {selectedConsultation.id}</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0B2559] dark:text-white">
                Dispatch &amp; Status Management
              </h2>
              <p className="text-xs text-slate-500">
                Update client consultation workflow, assign designated CA/CS/Advocate, and log resolution summary.
              </p>
            </div>

            {/* Client Snapshot */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-extrabold text-slate-900 dark:text-white">
                <span>{selectedConsultation.full_name}</span>
                <span className="text-[#C59B27]">{selectedConsultation.pillar} Advisory</span>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Phone: <span className="font-bold">{selectedConsultation.phone_number}</span> · Email: {selectedConsultation.email}
              </div>
              <div className="text-slate-700 dark:text-slate-200 font-semibold pt-1">
                Topic: {selectedConsultation.topic}
              </div>
            </div>

            {/* Quick One-Click Thumbs Status Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Quick Decision (One-Click)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatusToUpdate("Consulted")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    statusToUpdate === "Consulted"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/50"
                      : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Mark 👍 Consulted</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusToUpdate("Not Accepted")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    statusToUpdate === "Not Accepted"
                      ? "bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/50"
                      : "bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Mark 👎 Not Accepted</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                  Workflow Status *
                </label>
                <select
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value)}
                  className="w-full glass-input text-xs font-bold"
                >
                  <option value="Requested">Requested (New / Pending)</option>
                  <option value="Consulted">👍 Consulted (Discussed / Confirmed)</option>
                  <option value="Not Accepted">👎 Not Accepted (Consulted but not accepted)</option>
                  <option value="Scheduled">Scheduled (Appointment Confirmed)</option>
                  <option value="In Progress">In Progress (Session Active / Under Review)</option>
                  <option value="Completed">Completed (Advisory Delivered)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                    Assigned Specialist
                  </label>
                  <input
                    type="text"
                    value={assignedExpertToUpdate}
                    onChange={(e) => setAssignedExpertToUpdate(e.target.value)}
                    placeholder="e.g. CS Priyanjali Sen"
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                    Specialist Role / Credentials
                  </label>
                  <input
                    type="text"
                    value={expertRoleToUpdate}
                    onChange={(e) => setExpertRoleToUpdate(e.target.value)}
                    placeholder="e.g. FCS #11428 · Secretarial Lead"
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                  Resolution / Advisory Summary Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Summarize key advice delivered, agreed statutory actions, or next steps..."
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="corpsetu-btn-navy text-xs py-2.5 px-5 font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingAction ? "Saving..." : "Save Workflow Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsultationsPage;
