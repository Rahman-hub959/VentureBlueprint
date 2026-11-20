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
  Users
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
            <FolderKanban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalProjects}</div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-semibold">Active venture workspaces</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Assessments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{completedAssessments}</div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">Ready for document compilation</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Generated Documents</span>
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{documents.length}</div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-semibold">PDF & DOCX corporate files</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Requirements</span>
            <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{pendingTasks}</div>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 font-bold mt-1">Statutory actions requiring review</p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/projects/new"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Create Project</span>
          </Link>

          {activeProject ? (
            <>
              <Link
                to={`/projects/${activeProject.id}/questionnaire`}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all flex flex-col items-center text-center gap-2 group"
              >
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Continue Intake</span>
              </Link>
              <Link
                to={`/projects/${activeProject.id}/compliance`}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 transition-all flex flex-col items-center text-center gap-2 group"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">MCA Checklist</span>
              </Link>
              <Link
                to={`/projects/${activeProject.id}/documents`}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all flex flex-col items-center text-center gap-2 group"
              >
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Generate Dossier</span>
              </Link>
              <Link
                to={`/projects/${activeProject.id}/roles`}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all flex flex-col items-center text-center gap-2 group"
              >
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Role Matrix</span>
              </Link>
            </>
          ) : (
            <Link
              to="/projects"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all flex flex-col items-center text-center gap-2 group"
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
