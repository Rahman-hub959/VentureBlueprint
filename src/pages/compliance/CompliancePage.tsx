import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronDown,
  Filter,
  Plus,
  ArrowRight,
  FileText
} from "lucide-react";
import { complianceApi } from "../../api/client";

export const CompliancePage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();

  const [assessment, setAssessment] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  const loadData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [assessData, taskList] = await Promise.all([
        complianceApi.getAssessment(projectId),
        complianceApi.getTasks(projectId)
      ]);
      setAssessment(assessData);
      setTasks(taskList);
    } catch (err) {
      console.error("Failed to load compliance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await complianceApi.updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert("Failed to update task status");
    }
  };

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "incorporation", label: "Incorporation (MCA)" },
    { id: "taxation", label: "Taxation (GST & IT)" },
    { id: "employment", label: "Labour & Employment" },
    { id: "data privacy", label: "Data Protection" },
    { id: "sectoral licence", label: "Sector Licences" }
  ];

  const filteredRules = assessment?.rule_results?.filter((r: any) => {
    if (activeCategory === "all") return true;
    return r.category?.toLowerCase().includes(activeCategory);
  }) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Official Regulatory Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            MCA & Regulatory Compliance Engine
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Assessed against the Companies Act 2013, LLP Act 2008, CGST Act 2017, and DPDP Act 2023.
          </p>
        </div>

        {projectId && (
          <Link
            to={`/projects/${projectId}/documents`}
            className="glass-button-primary text-xs py-2.5 px-4 font-bold shadow-sm"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Generate Official Reports</span>
          </Link>
        )}
      </div>

      {/* Compliance Overview Stat Ribbon */}
      {assessment && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-card p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Total Assessed</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{assessment.total_rules_assessed}</div>
          </div>
          <div className="glass-card p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">Passed Checks</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{assessment.passed_count}</div>
          </div>
          <div className="glass-card p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">Warnings</span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{assessment.warning_count}</div>
          </div>
          <div className="glass-card p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
            <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold">Failed Mandates</span>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{assessment.failed_count}</div>
          </div>
          <div className="glass-card p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold">Professional Review</span>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{assessment.professional_review_count}</div>
          </div>
          <div className="glass-card p-4 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Unverified</span>
            <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">{assessment.unverified_count}</div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeCategory === c.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Compliance Rules Expandable Cards */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Evaluating regulatory rules...</div>
      ) : (
        <div className="space-y-4">
          {filteredRules.map((rule: any) => {
            const isExpanded = expandedRuleId === rule.rule_code;
            const isPassed = rule.status === "Passed";
            const isWarning = rule.status === "Warning";
            const isFailed = rule.status === "Failed";

            return (
              <div
                key={rule.rule_code}
                className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors"
              >
                <div
                  onClick={() => setExpandedRuleId(isExpanded ? null : rule.rule_code)}
                  className="p-5 cursor-pointer flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <span className={`w-3 h-3 rounded-full mt-1 sm:mt-0 flex-shrink-0 ${
                      isPassed ? "bg-emerald-500" : isFailed ? "bg-rose-500" : "bg-amber-500"
                    }`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300">{rule.rule_code}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{rule.category}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{rule.rule_title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPassed
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                        : isFailed
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                    }`}>
                      {rule.status}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 space-y-4 text-xs transition-colors">
                    <div>
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 uppercase font-bold block mb-1">
                        Finding & Assessment Summary
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">{rule.finding_summary}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-bold block mb-1">
                        Required Corrective Action
                      </span>
                      <p className="text-emerald-900 dark:text-emerald-200 font-semibold">{rule.action_required}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-700 dark:text-slate-300 block font-bold">Legal Provision / Enactment:</span>
                        <span className="text-slate-900 dark:text-white font-mono font-semibold">{rule.legal_provision || "Official Notification"}</span>
                      </div>
                      {rule.official_source_url && (
                        <div>
                          <span className="text-slate-700 dark:text-slate-300 block font-bold">Official Authority Portal:</span>
                          <a
                            href={rule.official_source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>Open Official Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Compliance Task Board */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Interactive Statutory Task Board</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Track progress through filing milestones. Internal checklist completion is not equivalent to government approval.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h4>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60">
                    {task.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{task.description}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="glass-input text-xs font-semibold py-1.5 px-2.5 rounded-lg"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Documents">Pending Documents</option>
                  <option value="Awaiting Professional Review">Awaiting CA/CS Review</option>
                  <option value="Completed">Completed</option>
                </select>

                {task.official_url && (
                  <a
                    href={task.official_url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open official portal"
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
