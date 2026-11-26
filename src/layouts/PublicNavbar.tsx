import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X, ArrowRight, User as UserIcon, Calendar, MessageSquareText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { CorpSetuLogo } from "../components/CorpSetuLogo";

export const PublicNavbar: React.FC<{ onBookConsultation?: () => void }> = ({ onBookConsultation }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { label: "Services", path: "/#services" },
    { label: "Three Pillars (Law · CS · CA)", path: "/#pillars" },
    { label: "Why Us", path: "/#why-us" },
    { label: "Compliance Calendar", path: "/#compliance-calendar" },
    { label: "FAQ", path: "/#faq" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-3 flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        {/* Brand */}
        <Link to="/" className="flex items-center group">
          <CorpSetuLogo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isAnchor = link.path.startsWith("/#");
            return (
              <a
                key={link.label}
                href={link.path}
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#C59B27] dark:hover:text-[#E5B842] transition-colors"
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle (Icon Only) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={resolvedTheme === "dark" ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-[#C59B27]/50 transition-all duration-300 hover:rotate-12 active:scale-95 text-slate-800 dark:text-slate-100 group shadow-xs"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 transform transition-transform duration-500 rotate-0 group-hover:rotate-90 group-hover:scale-110" />
            ) : (
              <Moon className="w-4 h-4 text-[#0B2559] dark:text-blue-400 transform transition-transform duration-500 -rotate-12 group-hover:rotate-0 group-hover:scale-110" />
            )}
          </button>

          {/* Book Consultation Button */}
          <button
            onClick={() => {
              if (onBookConsultation) {
                onBookConsultation();
              } else {
                const el = document.getElementById("book-consultation");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else window.location.href = "/#book-consultation";
              }
            }}
            className="corpsetu-btn-gold text-xs py-2 px-3.5 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Consultation</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="corpsetu-btn-navy text-xs py-2 px-3.5 shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold text-[#0B2559] dark:text-slate-200 hover:text-[#C59B27] px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="corpsetu-btn-navy text-xs py-2 px-3.5 shadow-sm"
              >
                <span>Get Started</span>
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
          <CorpSetuLogo size="md" />
          <hr className="border-slate-100 dark:border-slate-800 my-1" />
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-slate-800 dark:text-slate-200 hover:text-[#C59B27] dark:hover:text-[#E5B842] font-semibold py-1"
            >
              {link.label}
            </a>
          ))}
          <hr className="border-slate-100 dark:border-slate-800 my-1" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">Theme Mode</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition-all duration-300 hover:rotate-12 active:scale-95 group"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#0B2559]" />
              )}
            </button>
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              const el = document.getElementById("book-consultation");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else window.location.href = "/#book-consultation";
            }}
            className="corpsetu-btn-gold justify-center text-center py-2.5 mt-2"
          >
            <Calendar className="w-4 h-4" />
            Book Consultation
          </button>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="corpsetu-btn-navy justify-center text-center py-2.5 mt-1"
            >
              Open Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
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
                className="corpsetu-btn-navy justify-center text-center py-2.5"
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
