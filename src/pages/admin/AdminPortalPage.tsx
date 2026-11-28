import React, { useState, useEffect } from "react";
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
  Mail,
  ThumbsUp,
  ThumbsDown,
  MessageSquareWarning,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search
} from "lucide-react";
import { adminApi, consultationsApi, complaintsApi, ConsultationItem, ComplaintItem } from "../../api/client";
import { useToast } from "../../context/ToastContext";

export const AdminPortalPage: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "consultations" | "users" | "grievances" | "audit" | "health">("overview");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, consultsData, complaintsData, auditData, healthData] = await Promise.all([
        adminApi.getStats().catch(() => null),
        adminApi.getUsers().catch(() => []),
        consultationsApi.list().catch(() => []),
        complaintsApi.list().catch(() => []),
        adminApi.getAuditLogs().catch(() => []),
        adminApi.getHealth().catch(() => null)
      ]);
      setStats(statsData);
      setUsers(usersData || []);
      setConsultations(consultsData || []);
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

  const pendingConsultationsCount = consultations.filter((c) => c.status === "Requested").length;
  const consultedCount = consultations.filter((c) => c.status === "Consulted").length;
  const notAcceptedCount = consultations.filter((c) => c.status === "Not Accepted").length;

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
            System Administration &amp; Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Manage real client consultations, registered entrepreneur accounts, support grievances, and system health.
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

      {/* Clean Business Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: "overview", label: "Operations Overview" },
          { id: "consultations", label: `Consultations (${consultations.length})` },
          { id: "users", label: `User Directory (${users.length})` },
          { id: "grievances", label: `Grievances (${complaints.length})` },
          { id: "audit", label: "Audit Logs" },
          { id: "health", label: "System Health" }
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
      {/* TAB 1: OPERATIONS OVERVIEW                                    */}
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
              <div className="text-3xl font-extrabold text-[#0B2559] dark:text-white mt-1">{stats?.total_projects || 0}</div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Active startup incorporation records</p>
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
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 font-semibold">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <a href={`tel:${item.phone_number}`} className="hover:underline">{item.phone_number}</a>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.email}</div>
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
      {/* TAB 2: CONSULTATIONS FULL VIEW                                */}
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

          <div className="spatial-card rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[11px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Ref ID &amp; Pillar</th>
                    <th className="py-3 px-4">Client Contact</th>
                    <th className="py-3 px-4">Topic &amp; Notes</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Triage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {consultations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-mono font-extrabold text-[#0B2559] dark:text-white block">{item.id}</span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{item.pillar} Advisory</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">{item.full_name}</div>
                        <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">{item.phone_number}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.email}</div>
                      </td>
                      <td className="py-3 px-4 max-w-[240px]">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{item.topic}</div>
                        {item.notes && <p className="text-[10px] text-slate-500 line-clamp-1">{item.notes}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.preferred_time_slot}</div>
                        <div className="text-[10px] text-slate-400">{item.preferred_date}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[11px] px-2.5 py-1 rounded-full border bg-slate-100 text-slate-800">
                          {item.status}
                        </span>
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
      {/* TAB 3: USER DIRECTORY                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="spatial-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-slate-700 dark:text-slate-300 font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Projects</th>
                  <th className="py-3 px-4">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{u.full_name}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        u.role === "Administrator"
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200"
                          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{u.project_count}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {new Date(u.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: GRIEVANCES & SUPPORT                                   */}
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
      {/* TAB 5: AUDIT TRAIL                                            */}
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
      {/* TAB 6: SYSTEM HEALTH                                          */}
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
