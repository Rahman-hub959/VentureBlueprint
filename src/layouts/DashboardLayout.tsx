import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  FileText,
  CheckSquare,
  Users,
  Settings,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { projectsApi } from "../api/client";

export const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const list = await projectsApi.list();
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    fetchProjects();
  }, []);

  const activeProjectId = selectedProjectId || (projects[0]?.id ?? "new");

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Projects", path: "/projects", icon: FolderKanban },
    { label: "Create Project", path: "/projects/new", icon: PlusCircle },
    { label: "Compliance Checklist", path: `/projects/${activeProjectId}/compliance`, icon: CheckSquare },
    { label: "Generated Documents", path: `/projects/${activeProjectId}/documents`, icon: FileText },
    { label: "Role Recommendations", path: `/projects/${activeProjectId}/roles`, icon: Users },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ label: "Admin Portal", path: "/admin", icon: ShieldAlert });
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="spatial-bg min-h-screen flex flex-col md:flex-row relative">
      {/* Background Soft Lighting Elements */}
      <div className="spatial-glow-top-right opacity-60" />
      <div className="spatial-glow-bottom-left opacity-60" />

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 glass-panel m-3 mr-0 rounded-2xl z-20 sticky top-3 h-[calc(100vh-24px)] p-4 shadow-sm">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white border border-emerald-400 shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">VentureBlueprint</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase">Workspace</div>
          </div>
        </Link>

        {/* Project Selector Box */}
        {projects.length > 0 && (
          <div className="mb-6 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Active Project
            </span>
            <select
              aria-label="Active Project"
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                navigate(`/projects/${e.target.value}`);
              }}
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 text-xs font-bold py-2 px-2.5 rounded-lg cursor-pointer truncate shadow-xs focus:ring-2 focus:ring-emerald-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-xs"
                    : "text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 px-6 glass-panel m-3 mb-0 rounded-2xl flex items-center justify-between z-10 sticky top-3 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 text-slate-700 dark:text-slate-200"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">
              {location.pathname.split("/")[1] || "Dashboard"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Day/Night mode"
              title={resolvedTheme === "dark" ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold transition-all hover:border-emerald-500"
            >
              {resolvedTheme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">Day Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold">Night Mode</span>
                </>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>India Jurisdiction (MCA)</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
