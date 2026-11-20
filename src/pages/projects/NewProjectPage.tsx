import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, ArrowRight, Building, Sparkles, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { projectsApi, validationApi } from "../../api/client";

export const NewProjectPage: React.FC = () => {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("Information Technology");
  const [preferredStructure, setPreferredStructure] = useState("Private Limited Company");
  const [loading, setLoading] = useState(false);
  const [prescreenResult, setPrescreenResult] = useState<any | null>(null);

  const navigate = useNavigate();

  const handleNameBlur = async () => {
    if (name.trim().length >= 3) {
      try {
        const res = await validationApi.prescreenName(name, preferredStructure);
        setPrescreenResult(res);
      } catch (err) {
        console.error("Name prescreen error:", err);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const project = await projectsApi.create({
        name: name.trim(),
        domain,
        preferred_structure: preferredStructure,
      });
      navigate(`/projects/${project.id}/questionnaire`);
    } catch (err: any) {
      alert(err?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const domainOptions = [
    "Information Technology", "Software Development", "Hardware and Electronics",
    "Manufacturing", "Digital Marketing", "Business Consulting", "Retail",
    "Wholesale and Distribution", "Education and Training", "Healthcare",
    "Finance and Accounting", "E-commerce", "Construction", "Logistics",
    "Food and Hospitality", "Professional Services", "Other"
  ];

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Projects</span>
      </Link>

      <div className="glass-modal p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Step 0 • Project Genesis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Company Project</h1>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
            Enter your proposed entity name to activate preliminary MCA Rule 8 checks.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
              Proposed Company Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setPrescreenResult(null);
              }}
              onBlur={handleNameBlur}
              placeholder="e.g. Kaveri Cold Brew Technologies"
              className="w-full glass-input text-sm"
            />
            <span className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 block font-medium">
              Tip: Click outside the input box to run instant automated Rule 8 pre-screening.
            </span>
          </div>

          {/* Live Pre-screening Feedback Banner */}
          {prescreenResult && (
            <div className={`p-4 rounded-xl text-xs space-y-2 border ${
              prescreenResult.is_valid
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200"
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {prescreenResult.is_valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                  Preliminary Pre-screening Score: {prescreenResult.score}/100
                </span>
                <span className="text-[10px] uppercase font-mono text-slate-600 dark:text-slate-400">Rule 8 Check</span>
              </div>
              {prescreenResult.warnings.length > 0 && (
                <ul className="list-disc pl-4 space-y-1 text-amber-700 dark:text-amber-300">
                  {prescreenResult.warnings.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
              {prescreenResult.errors.length > 0 && (
                <ul className="list-disc pl-4 space-y-1 text-rose-700 dark:text-rose-300">
                  {prescreenResult.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                Business Domain *
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full glass-input text-xs"
              >
                {domainOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                Preferred Legal Structure
              </label>
              <select
                value={preferredStructure}
                onChange={(e) => setPreferredStructure(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="Private Limited Company">Private Limited Company</option>
                <option value="LLP">LLP (Limited Liability Partnership)</option>
                <option value="OPC">OPC (One Person Company)</option>
                <option value="Partnership Firm">Partnership Firm</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full glass-button-primary justify-center text-xs py-3.5 shadow-md font-bold"
            >
              {loading ? "Initializing Project..." : "Proceed to Questionnaire"}
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
