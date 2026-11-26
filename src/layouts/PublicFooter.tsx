import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Scale, FileSpreadsheet, Building2 } from "lucide-react";
import { CorpSetuLogo } from "../components/CorpSetuLogo";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-slate-800 dark:text-slate-200 text-sm py-16 px-6 sm:px-12 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
        {/* Brand Col */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <CorpSetuLogo size="lg" />
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm text-xs sm:text-sm font-medium">
            One unified platform bridging Corporate Law, Company Secretarial (CS), and Chartered Accountancy (CA) services for startups, SMEs, and growing enterprises in India.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-[#0B2559] dark:text-[#E5B842] font-semibold bg-amber-50/80 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/60 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#C59B27] animate-pulse" />
            Law. CS, CA. One Bridge · 100% Statutory Assurance
          </div>
        </div>

        {/* Three Pillars */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-[#0B2559] dark:text-[#E5B842] uppercase tracking-wider">Three Pillars</span>
          <a href="/#pillars" className="hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#C59B27]" /> Corporate Law
          </a>
          <a href="/#pillars" className="hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#C59B27]" /> CS Secretarial
          </a>
          <a href="/#pillars" className="hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#C59B27]" /> CA & Taxation
          </a>
          <a href="/#compliance-calendar" className="hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">
            Compliance Calendar
          </a>
        </div>

        {/* Official Portals */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Official Portals</span>
          <a href="https://www.mca.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">
            MCA V3 Portal <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a href="https://www.gst.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">
            GST Portal <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a href="https://eportal.incometax.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">
            Income Tax e-Filing <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a href="https://ipindia.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">
            IP India Trademark <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

        {/* Legal & Governance */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Help & Legal</span>
          <a href="/#faq" className="hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">FAQ</a>
          <Link to="/complaints" className="hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">Register Grievance</Link>
          <Link to="/privacy" className="hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">Terms of Service</Link>
          <a href="/#book-consultation" className="hover:text-[#C59B27] dark:hover:text-[#E5B842] font-medium transition-colors">Book Consultation</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <p>© {new Date().getFullYear()} <strong className="text-slate-900 dark:text-white">CorpSetu</strong>. All rights reserved. www.corpsetu.com</p>
        <p className="max-w-xl text-center md:text-right text-slate-600 dark:text-slate-400">
          <b className="text-slate-900 dark:text-white">Law. CS, CA. One Bridge:</b> Integrated regulatory compliance, corporate law, secretarial governance, and accounting platform for Indian businesses.
        </p>
      </div>
    </footer>
  );
};
