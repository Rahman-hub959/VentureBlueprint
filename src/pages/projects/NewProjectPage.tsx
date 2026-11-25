import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, ArrowRight, Building, Sparkles, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, XCircle } from "lucide-react";
import { projectsApi, validationApi } from "../../api/client";

export const NewProjectPage: React.FC = () => {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("Information Technology");
  const [preferredStructure, setPreferredStructure] = useState("Private Limited Company");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [prescreenResult, setPrescreenResult] = useState<any | null>(null);

  const navigate = useNavigate();

  // Instant real-time pre-screening as the user types (with 350ms debounce)
  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setPrescreenResult(null);
      setValidating(false);
      return;
    }

    setValidating(true);
    const timer = setTimeout(async () => {
      try {
        const res = await validationApi.prescreenName(trimmed, preferredStructure);
        setPrescreenResult(res);
      } catch (err) {
        console.error("Name prescreen error:", err);
      } finally {
        setValidating(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [name, preferredStructure]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (prescreenResult && !prescreenResult.is_valid) {
      alert("Cannot create project: Proposed name conflicts with an existing registered entity or protected trademark. Please revise your company name to proceed.");
      return;
    }

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

  const hasConflict = prescreenResult && (!prescreenResult.is_valid || prescreenResult.score === 0);

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
            Enter your proposed entity name for real-time validation across Indian registered companies and trademark databases.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                Proposed Company Name *
              </label>
              {validating ? (
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Live Checking MCA & Trademark Registry...
                </span>
              ) : prescreenResult ? (
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  prescreenResult.is_valid && prescreenResult.score >= 80
                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200"
                }`}>
                  {prescreenResult.is_valid ? "✓ Validated" : "✗ Conflict Flagged"}
                </span>
              ) : null}
            </div>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter proposed company name..."
              className={`w-full glass-input text-sm transition-all ${
                hasConflict
                  ? "border-rose-500 focus:ring-rose-500 bg-rose-50/20"
                  : prescreenResult?.is_valid
                  ? "border-emerald-500 focus:ring-emerald-500"
                  : ""
              }`}
            />
            <span className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 block font-medium">
              Real-time validation evaluates against Companies Act 2013 (Section 4), MCA Rule 8, and the Trade Marks Act 1999 (Section 11).
            </span>
          </div>

          {/* Live Pre-screening Feedback Banner */}
          {prescreenResult && (
            <div className={`p-4 rounded-2xl text-xs space-y-3 border transition-all ${
              prescreenResult.is_valid && prescreenResult.score >= 80
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100"
                : prescreenResult.score > 0
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100"
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-2">
                  {prescreenResult.is_valid && prescreenResult.score >= 80 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span className="text-sm font-extrabold">
                    Pre-screening Score: {prescreenResult.score}/100
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    prescreenResult.score >= 80
                      ? "bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200"
                      : prescreenResult.score > 0
                      ? "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200"
                      : "bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200"
                  }`}>
                    {prescreenResult.score >= 80 ? "Available" : prescreenResult.score > 0 ? "Needs Review" : "Copyright / Entity Conflict"}
                  </span>
                </span>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-600 dark:text-slate-400">
                  MCA Rule 8 & TM Check
                </span>
              </div>

              {/* Blocking Errors: Trademark or Existing Company */}
              {prescreenResult.errors.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-xl bg-rose-100/70 dark:bg-rose-900/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200">
                  <span className="font-extrabold text-[11px] uppercase tracking-wider block">
                    Statutory Blocking Violations (ROC Will Reject):
                  </span>
                  <ul className="list-disc pl-4 space-y-1 font-semibold text-[11px]">
                    {prescreenResult.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {prescreenResult.warnings.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-xl bg-amber-100/70 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                  <span className="font-extrabold text-[11px] uppercase tracking-wider block">
                    Advisory Flags:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 font-semibold text-[11px]">
                    {prescreenResult.warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {prescreenResult.recommendations.length > 0 && (
                <div className="space-y-1 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                  <span className="font-bold text-[10px] uppercase tracking-wider block">
                    Recommended Fix:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] font-medium">
                    {prescreenResult.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Statutory Checks Breakdown Table */}
              {prescreenResult.checks && prescreenResult.checks.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Statutory Checks Breakdown ({prescreenResult.checks.length} rules):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {prescreenResult.checks.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[10px]"
                      >
                        <span className="font-medium truncate mr-2 text-slate-800 dark:text-slate-200">
                          {c.check}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-extrabold flex-shrink-0 ${
                          c.status === "Passed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                            : c.status === "Warning"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
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
              disabled={loading || !name.trim() || hasConflict}
              className={`w-full justify-center text-xs py-3.5 shadow-md font-bold rounded-xl flex items-center gap-2 transition-all ${
                hasConflict
                  ? "bg-rose-600 text-white cursor-not-allowed opacity-90 shadow-rose-600/20"
                  : "glass-button-primary"
              }`}
            >
              {hasConflict ? (
                <>
                  <XCircle className="w-4 h-4 text-white" />
                  <span>Conflict Detected • Rename Required</span>
                </>
              ) : loading ? (
                "Initializing Project..."
              ) : (
                <>
                  <span>Proceed to Questionnaire</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
