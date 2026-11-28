import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  ArrowRight,
  FileText,
  CheckCircle2
} from "lucide-react";
import { projectsApi } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export const ProjectsListPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.list(filter, search);
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [filter, search]);

  const handleDuplicate = async (id: string) => {
    try {
      await projectsApi.duplicate(id);
      loadProjects();
      setActionMenuId(null);
    } catch (err) {
      alert("Failed to duplicate project");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this project? This will remove all associated documents and questionnaire data.")) {
      try {
        await projectsApi.delete(id);
        loadProjects();
        setActionMenuId(null);
      } catch (err) {
        alert("Failed to delete project");
      }
    }
  };

  const handleArchive = async (id: string, currentArchived: boolean) => {
    try {
      await projectsApi.update(id, { is_archived: !currentArchived });
      loadProjects();
      setActionMenuId(null);
    } catch (err) {
      alert("Failed to update project archive status");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2559] dark:text-white tracking-tight">
            {isAdmin ? "All Client Projects Directory" : "Company Projects"}
          </h1>
          <p className="text-xs text-slate-800 dark:text-slate-300 font-medium">
            {isAdmin
              ? "Comprehensive registry of all company blueprints created by registered entrepreneurs across India."
              : "Manage all startup blueprints, assessments, and regulatory dossiers"}
          </p>
        </div>
        {isAdmin ? (
          <Link to="/admin" className="corpsetu-btn-gold text-xs py-2.5 px-4 font-bold shadow-sm inline-flex items-center gap-2">
            <span>Client Service Tracker &rarr;</span>
          </Link>
        ) : (
          <Link to="/projects/new" className="corpsetu-btn-navy text-xs py-2.5 px-4 font-bold shadow-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4 text-white" />
            <span>New Company Project</span>
          </Link>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="spatial-surface p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name..."
            className="w-full glass-input !pl-11 text-xs py-2 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Projects" },
            { id: "draft", label: "Drafts" },
            { id: "blueprint_ready", label: "Blueprint Ready" },
            { id: "archived", label: "Archived" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                filter === item.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="spatial-card p-16 rounded-3xl text-center space-y-4">
          <FolderKanban className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No projects found</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Get started by creating your first company formation project.
          </p>
          <Link to="/projects/new" className="corpsetu-btn-navy text-xs py-2.5 px-5 inline-flex font-bold">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="spatial-card p-6 flex flex-col justify-between relative group rounded-2xl">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{proj.name}</h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{proj.domain}</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuId(actionMenuId === proj.id ? null : proj.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {actionMenuId === proj.id && (
                      <div className="absolute right-0 top-8 w-44 glass-modal p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-30 shadow-xl space-y-1">
                        <button
                          onClick={() => handleDuplicate(proj.id)}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-600" /> Duplicate
                        </button>
                        <button
                          onClick={() => handleArchive(proj.id, proj.is_archived)}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2"
                        >
                          <Archive className="w-3.5 h-3.5 text-slate-600" /> {proj.is_archived ? "Unarchive" : "Archive"}
                        </button>
                        <hr className="border-slate-200 dark:border-slate-700 my-1" />
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-300 mb-4 line-clamp-2 font-medium">
                  {proj.business_profile?.business_description || "Company questionnaire intake in progress."}
                </p>

                {/* Admin Client Ownership Card */}
                {isAdmin && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs mb-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Client / Founder</span>
                      <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {proj.preferred_structure || "Pvt Ltd"}
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{proj.owner_name || "Client"}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span className="truncate max-w-[150px]">{proj.owner_email}</span>
                      {proj.owner_phone && <span className="font-bold text-emerald-600">{proj.owner_phone}</span>}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs text-slate-800 dark:text-slate-300 font-semibold">
                    <span>Intake Progress</span>
                    <span className="text-slate-900 dark:text-white font-bold">{proj.completion_percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${proj.completion_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Documents Generated Indicator */}
                <div className="mb-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Statutory Documents:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                    (proj.documents_count || 0) > 0
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                  }`}>
                    {(proj.documents_count || 0) > 0 ? `✓ Generated (${proj.documents_count})` : "Pending Intake"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to={`/projects/${proj.id}/questionnaire`}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Open Dossier <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/projects/${proj.id}/compliance`}
                    title="Compliance checklist"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/projects/${proj.id}/documents`}
                    title="Generated documents"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
