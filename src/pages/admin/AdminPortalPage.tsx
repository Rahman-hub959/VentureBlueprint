import React, { useState, useEffect } from "react";
import { ShieldAlert, Users, Database, FileText, CheckCircle2, Activity, RefreshCw } from "lucide-react";
import { adminApi } from "../../api/client";

export const AdminPortalPage: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "rules" | "audit" | "health">("overview");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, rulesData, auditData, healthData] = await Promise.all([
        adminApi.getStats().catch(() => null),
        adminApi.getUsers().catch(() => []),
        adminApi.getRegulatoryRules().catch(() => []),
        adminApi.getAuditLogs().catch(() => []),
        adminApi.getSystemHealth().catch(() => null)
      ]);
      setStats(statsData);
      setUsers(usersData);
      setRules(rulesData);
      setAuditLogs(auditData);
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Administrator Security Level</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            System Administration & Regulatory Governance
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Monitor users, review regulatory rules, inspect audit logs, and manage local storage.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="glass-button-secondary text-xs py-2 px-3.5 flex items-center gap-2 font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: "overview", label: "Overview Metrics" },
          { id: "users", label: `User Management (${users.length})` },
          { id: "rules", label: `Regulatory Rules (${rules.length})` },
          { id: "audit", label: "Audit Logs" },
          { id: "health", label: "System Health" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Total Users</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.total_users}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">Registered accounts</p>
            </div>
            <div className="glass-card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Total Projects</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.total_projects}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">Active company blueprints</p>
            </div>
            <div className="glass-card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Generated Documents</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.total_documents}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-bold">Stored locally in sandbox</p>
            </div>
            <div className="glass-card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Published Rules</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.active_regulatory_rules}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">Deterministic statutory provisions</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Local Storage & Filesystem Status</h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Private storage path: <code className="bg-slate-100 dark:bg-black/40 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400 font-mono font-bold">{stats.storage_directory}</code>
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Storage sandbox initialized and writable</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Projects</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{u.full_name}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === "Administrator" ? "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800" : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">Active</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{u.project_count}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Rules */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">{rule.rule_code}</span>
                <span className="glass-badge glass-badge-emerald text-[10px]">{rule.status}</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{rule.title}</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{rule.requirement_description}</p>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-medium">
                Legal Basis: <span className="text-slate-900 dark:text-white font-mono font-bold">{rule.legal_provision}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === "audit" && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Immutable Audit Trail</h3>
          <div className="space-y-2 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{log.action}</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] font-sans font-medium">{log.user_email} • {log.entity_type} {log.entity_id}</p>
                </div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap font-medium">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Health */}
      {activeTab === "health" && health && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">System Health & Diagnostic Status</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">Database Connectivity</span>
              <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{health.database}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">Local Storage Sandbox</span>
              <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                {health.storage?.writable ? "Writable & Operational" : "Read Only"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
