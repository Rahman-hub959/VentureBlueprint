import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { regulationsApi } from "../../api/client";

export const DomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDomains() {
      try {
        const data = await regulationsApi.getDomains();
        setDomains(data);
      } catch (err) {
        console.error("Failed to fetch domains:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDomains();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Comprehensive Industry Coverage
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Supported Business Domains
        </h1>
        <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium">
          VentureBlueprint dynamically tailors regulatory assessments, statutory licencing, and role recommendations across 17 distinct industry domains.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-700 dark:text-slate-300 font-semibold">Loading supported domains...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((d) => (
            <div key={d.id || d.slug} className="glass-card p-6 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-emerald-700 dark:text-emerald-400">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-xs font-mono font-bold tracking-wider uppercase">Active Domain</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">{d.name}</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-4 font-medium">{d.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <span>Customized Questionnaire</span>
                <Link to="/register" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                  Select <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
