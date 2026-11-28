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
  X,
  MessageSquareWarning,
  Scale,
  CalendarCheck,
  Bell
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { projectsApi, notificationsApi, NotificationItem } from "../api/client";
import { CorpSetuLogo } from "../components/CorpSetuLogo";

export const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.list();
      setNotifications(data || []);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      if (link) {
        navigate(link);
        setNotificationsOpen(false);
      }
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

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
    ...(isAdmin
      ? [{ label: "All Client Projects", path: "/projects", icon: FolderKanban }]
      : [{ label: "My Projects", path: "/projects", icon: FolderKanban }]),
    { label: "Create Project", path: "/projects/new", icon: PlusCircle },
    ...(isAdmin
      ? [{ label: "Consultation Requests", path: "/admin/consultations", icon: CalendarCheck }]
      : [{ label: "Your Consultations", path: "/consultations", icon: CalendarCheck }]),
    { label: "Compliance Checklist", path: `/projects/${activeProjectId}/compliance`, icon: CheckSquare },
    { label: "Generated Documents", path: `/projects/${activeProjectId}/documents`, icon: FileText },
    { label: "Role Recommendations", path: `/projects/${activeProjectId}/roles`, icon: Users },
    { label: "Grievances & Support", path: "/complaints", icon: MessageSquareWarning },
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

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full p-4 flex flex-col z-10 shadow-2xl overflow-y-auto border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <Link
                to="/dashboard"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center justify-center flex-1"
              >
                <CorpSetuLogo size="md" className="justify-center mx-auto" />
              </Link>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Project Selector Box */}
            {projects.length > 0 && (
              <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Active Project
                </span>
                <select
                  aria-label="Active Project"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    navigate(`/projects/${e.target.value}`);
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 text-xs font-bold py-2 px-2.5 rounded-lg cursor-pointer truncate shadow-xs"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mobile Nav Links */}
            <nav className="flex-1 flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
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
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 glass-panel m-3 mr-0 rounded-2xl z-20 sticky top-3 h-[calc(100vh-24px)] p-4 shadow-sm">
        {/* Brand - Centered in Sidebar */}
        <Link
          to="/dashboard"
          className="flex items-center justify-center w-full px-2 py-3 mb-5 border-b border-slate-200 dark:border-slate-800 text-center"
        >
          <CorpSetuLogo size="lg" className="w-full justify-center mx-auto" />
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
            const isActive = (() => {
              if (item.path === "/projects") {
                return location.pathname === "/projects";
              }
              if (item.path === "/projects/new") {
                return location.pathname === "/projects/new";
              }
              if (item.path.endsWith("/compliance")) {
                return location.pathname.endsWith("/compliance");
              }
              if (item.path.endsWith("/documents")) {
                return location.pathname.endsWith("/documents");
              }
              if (item.path.endsWith("/roles")) {
                return location.pathname.endsWith("/roles");
              }
              return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            })();
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
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
                title="Notifications & Activity Updates"
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-800 dark:text-slate-100 relative cursor-pointer shadow-xs"
              >
                <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-11 w-80 sm:w-96 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#0B2559] dark:text-white">
                      <Bell className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>{isAdmin ? "Admin Live Activity Alerts" : "Your Updates"}</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id, n.link)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all space-y-1 ${
                            n.is_read
                              ? "bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              : "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-slate-900 dark:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="truncate pr-2">{n.title}</span>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="text-[10px] text-slate-400">
                            {new Date(n.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle Day/Night mode"
              title={resolvedTheme === "dark" ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-emerald-500 transition-all duration-300 active:scale-95 text-slate-800 dark:text-slate-100 group shadow-xs cursor-pointer"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 transform transition-transform duration-300 rotate-0 group-hover:rotate-90 group-hover:scale-110" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600 transform transition-transform duration-300 -rotate-12 group-hover:rotate-0 group-hover:scale-110" />
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
