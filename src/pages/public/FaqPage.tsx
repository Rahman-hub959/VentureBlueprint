import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, HelpCircle } from "lucide-react";

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is VentureBlueprint?",
      a: "VentureBlueprint is a deterministic company formation, regulatory validation, and professional documentation platform designed for Indian businesses. It helps entrepreneurs understand how to establish a business based on their domain, proposed name, ownership structure, location, founders, and capital requirements."
    },
    {
      q: "Does VentureBlueprint rely on cloud AI services like OpenAI, Gemini, or Claude?",
      a: "No. VentureBlueprint is strictly AI-independent. It does not introduce dependencies on any external AI APIs or cloud LLM services. All recommendations, MCA Rule 8 checks, and document generation workflows execute locally using deterministic Python business logic and verified regulatory reference tables."
    },
    {
      q: "Does VentureBlueprint guarantee official government registration or legal approval?",
      a: "No. VentureBlueprint provides structured business planning, statutory pre-screening, and professional documentation. We do not claim official government approval or guarantee registration. Final filings must be submitted through official government portals (e.g. MCA SPICe+, GST portal) or completed in collaboration with practicing Chartered Accountants (CAs) or Company Secretaries (CSs)."
    },
    {
      q: "What document formats are generated?",
      a: "The platform generates authentic publication-quality PDF documents (using ReportLab) and editable Word documents (using python-docx). All documents include corporate cover pages, executive summaries, well-formatted tables, page numbering, and cryptographic SHA-256 checksums."
    },
    {
      q: "Which business structures are evaluated?",
      a: "The platform evaluates Private Limited Companies, Limited Liability Partnerships (LLPs), One Person Companies (OPCs), Partnership Firms, and Sole Proprietorships under Indian corporate law."
    },
    {
      q: "Can I update my inputs and regenerate documents?",
      a: "Yes. You can edit your company details and regenerate any of the 8 reports at any time. VentureBlueprint automatically increments document versions and preserves the full version history without silently overwriting older reports."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Frequently Asked Questions
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Questions, Answered Clearly
        </h1>
        <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed max-w-xl mx-auto font-medium">
          Understand how VentureBlueprint works, our local privacy architecture, and our regulatory verification methodology.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span className="font-extrabold text-slate-900 dark:text-white text-base">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-6 pb-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-8 text-center space-y-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm transition-colors">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Have additional questions?</h3>
        <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md mx-auto font-medium">
          Our team is available to assist with platform navigation and technical questions.
        </p>
        <Link to="/contact" className="glass-button-secondary text-xs py-2.5 px-5 inline-flex font-bold">
          Contact Support
        </Link>
      </div>
    </div>
  );
};
