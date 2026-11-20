import React from "react";
import { Link } from "react-router-dom";
import { Shield, ExternalLink } from "lucide-react";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-slate-800 dark:text-slate-200 text-sm py-16 px-6 sm:px-12 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
        {/* Brand Col */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white border border-emerald-400 shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">VentureBlueprint</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-sm text-xs sm:text-sm font-medium">
            AI-independent, deterministic company formation planning, statutory MCA validation, and professional document generation platform for Indian enterprises.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            100% Deterministic Local Processing • Zero External AI Dependencies
          </div>
        </div>

        {/* Product Links */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Platform</span>
          <Link to="/how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">How It Works</Link>
          <Link to="/features" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Core Features</Link>
          <Link to="/domains" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Supported Domains</Link>
          <Link to="/register" className="hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold transition-colors">Start Questionnaire</Link>
        </div>

        {/* Regulatory Links */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Official Portals</span>
          <a href="https://www.mca.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            MCA Portal <ExternalLink className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </a>
          <a href="https://www.gst.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            GST Network <ExternalLink className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </a>
          <a href="https://udyamregistration.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            MSME Udyam <ExternalLink className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </a>
          <a href="https://www.startupindia.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            Startup India (DPIIT) <ExternalLink className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </a>
        </div>

        {/* Legal & Governance */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Governance</span>
          <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">About Us</Link>
          <Link to="/faq" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">FAQ</Link>
          <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Support & Contact</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <p>© {new Date().getFullYear()} VentureBlueprint. All rights reserved.</p>
        <p className="max-w-xl text-center md:text-right text-slate-600 dark:text-slate-400">
          <b className="text-slate-900 dark:text-white">Disclaimer:</b> VentureBlueprint provides automated regulatory guidance and business planning tools. We do not provide licensed legal, tax, or financial advice or guaranteed MCA registration.
        </p>
      </div>
    </footer>
  );
};
