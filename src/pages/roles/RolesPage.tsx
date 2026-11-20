import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Users, CheckCircle2, Shield, Briefcase, Award } from "lucide-react";
import { complianceApi } from "../../api/client";

export const RolesPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRoles() {
      if (!projectId) return;
      try {
        setLoading(true);
        const data = await complianceApi.getRoles(projectId);
        setRoles(data);
      } catch (err) {
        console.error("Failed to load roles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, [projectId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Statutory & Operational Staffing Framework</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Organizational & Statutory Role Recommendations
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Tailored to your legal structure and business domain under Indian corporate law.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Evaluating staffing recommendations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    role.category === "Statutory Position"
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700"
                      : role.category === "External Professional Service"
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                      : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                  }`}>
                    {role.category}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{role.staffing_type}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{role.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{role.description}</p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                    Key Responsibilities:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {role.responsibilities?.map((resp: string, rIdx: number) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[200px]">{role.legal_basis}</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{role.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
