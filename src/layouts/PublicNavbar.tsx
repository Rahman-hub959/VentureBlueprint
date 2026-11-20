import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Sun, Moon, Menu, X, ArrowRight, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { label: "How It Works", path: "/how-it-works" },
    { label: "Features", path: "/features" },
    { label: "Business Domains", path: "/domains" },
    { label: "About", path: "/about" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 py-4 transition-all">
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 px-6 py-3.5 flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform border border-emerald-400">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              VentureBlueprint
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold tracking-wider uppercase">
              Regulatory & Formation
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 pb-0.5"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-800 dark:text-slate-100"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="glass-button-primary text-xs py-2 px-4 shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1 font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="glass-button-primary text-xs py-2 px-4 shadow-sm"
              >
                <span>Build Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 max-w-7xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl flex flex-col gap-4 border border-slate-200 dark:border-slate-800 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold py-1"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-slate-100 dark:border-slate-800 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">Theme</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="glass-button-primary justify-center text-center py-2.5 mt-2"
            >
              Open Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="glass-button-secondary justify-center text-center py-2.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="glass-button-primary justify-center text-center py-2.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
