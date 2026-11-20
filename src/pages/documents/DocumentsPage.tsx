import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Download,
  Sparkles,
  Clock,
  History,
  CheckCircle2,
  FileCheck,
  Building,
  Scale,
  RefreshCw,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  ChevronRight,
  Check
} from "lucide-react";
import { documentsApi } from "../../api/client";

interface SectionSummary {
  num: number;
  code: string;
  title: string;
  scope: string;
  page: string;
}

export const DocumentsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "docx">("pdf");
  const [downloading, setDownloading] = useState<boolean>(false);

  // The 18 Sections unified inside the 10-15 Page Company Startup Blueprint
  const unifiedSections: SectionSummary[] = [
    { num: 1, code: "SEC-1", title: "1. Executive Summary", scope: "Provisional shortlist, preferred option eligibility, and next three moves.", page: "Page 2" },
    { num: 2, code: "SEC-2", title: "2. Your Inputs", scope: "Provided facts, premises, capital, and identified missing items.", page: "Page 2" },
    { num: 3, code: "SEC-3", title: "3. Validation Results", scope: "Deterministic statutory rules pre-screening (Error, Warning, Info).", page: "Page 3" },
    { num: 4, code: "SEC-4", title: "4. Plain-Language Glossary", scope: "Legal terminology (Company, Director, Member, Nominee, DSC, SPICe+).", page: "Page 4" },
    { num: 5, code: "SEC-5", title: "5. Legal-Structure Comparison", scope: "Liability, ownership, compliance burden, and incorporation effort.", page: "Page 5" },
    { num: 6, code: "SEC-6", title: "6. Recommendation", scope: "Ranked shortlist, alternative structures, and scenario shift triggers.", page: "Page 6" },
    { num: 7, code: "SEC-7", title: "7. Registration Roadmap", scope: "12-step chronological statutory filing sequence with authorities.", page: "Page 7" },
    { num: 8, code: "SEC-8", title: "8. Your Planning Sequence", scope: "Phase A to E execution order (Decide, Prepare, Review, File, Set up).", page: "Page 8" },
    { num: 9, code: "SEC-9", title: "9. Document Checklist", scope: "Mandatory, conditional, and optional KYC & corporate proofs.", page: "Page 9" },
    { num: 10, code: "SEC-10", title: "10. Role Plan", scope: "Statutory positions separated from operational team hierarchy.", page: "Page 10" },
    { num: 11, code: "SEC-11", title: "11. Cost Estimate", scope: "Fee breakdown, stamp duty, DSC, and CA/CS professional retainers.", page: "Page 11" },
    { num: 12, code: "SEC-12", title: "12. Branding and Logo Brief", scope: "Audience parameters, design concept directions, and trademark notices.", page: "Page 11" },
    { num: 13, code: "SEC-13", title: "13. Funding Readiness Notes", scope: "Seed round cap table, IP assignment, and bank flow protocols.", page: "Page 12" },
    { num: 14, code: "SEC-14", title: "14. Risks", scope: "Operational and statutory risks (R-01 to R-05) with mitigations.", page: "Page 12" },
    { num: 15, code: "SEC-15", title: "15. Missing Information", scope: "Critical missing data items and their statutory blocking impact.", page: "Page 13" },
    { num: 16, code: "SEC-16", title: "16. Questions for Your CA/CS", scope: "Targeted consultation questions to ask practicing professional.", page: "Page 13" },
    { num: 17, code: "SEC-17", title: "17. Professional Review Flags", scope: "Mandatory regulatory flags and MOA/AOA review disclaimers.", page: "Page 13" },
    { num: 18, code: "SEC-18", title: "18. Sources and Rule Versions Used", scope: "Rule traceability matrix, content separations, and version history.", page: "Page 14" }
  ];

  const loadDocuments = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const list = await documentsApi.list(projectId);
      setDocuments(list);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  // Find the Master Dossier document
  const masterDoc = documents.find(
    d => (d.document_type === "formation_blueprint" || d.document_type === "master_dossier") && d.file_format === selectedFormat
  );

  const handleGenerateMaster = async () => {
    if (!projectId || generating) return;
    setGenerating(true);
    try {
      await documentsApi.generate(projectId, "formation_blueprint", selectedFormat);
      await loadDocuments();
    } catch (err: any) {
      alert(err?.message || "Document generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      setDownloading(true);
      const filename = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_v${doc.version}.${doc.file_format}`;
      await documentsApi.downloadFile(doc.id, filename);
    } catch (err: any) {
      console.error("Download error:", err);
      // Direct window location fallback with query token
      const fallbackUrl = documentsApi.getDownloadUrl(doc.id);
      window.location.href = fallbackUrl;
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* HERO SECTION: UNIFIED MASTER FORMATION DOSSIER (ALL 8 IN 1) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-emerald-300 dark:border-emerald-700/60 bg-gradient-to-b from-white via-emerald-50/20 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900 shadow-lg space-y-6 relative overflow-hidden">
        {/* Glow backdrop reflection */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="glass-badge glass-badge-emerald text-xs font-bold uppercase tracking-wider">
                ★ Reference SRS Specification Blueprint
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
                • 10 to 15 Pages Publication-Grade
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Company Startup Blueprint & Regulatory Dossier
            </h1>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              Combines all 18 statutory sections into a single, cohesive 10-15 page corporate dossier.
              Featuring an automated Table of Contents with dynamic page numbers, status labels guide,
              bold side headings, and verified rules under Indian jurisdiction.
            </p>
          </div>

          {/* Format Selector & Primary Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto relative z-10">
            {/* Format Pill */}
            <div className="flex items-center justify-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedFormat("pdf")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedFormat === "pdf"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-800 dark:text-slate-200 hover:text-emerald-600"
                }`}
              >
                PDF Format
              </button>
              <button
                onClick={() => setSelectedFormat("docx")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedFormat === "docx"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-800 dark:text-slate-200 hover:text-emerald-600"
                }`}
              >
                Word (.docx)
              </button>
            </div>

            {/* Generate / Download Action */}
            {masterDoc ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(masterDoc)}
                  disabled={downloading}
                  className="glass-button-primary px-6 py-2.5 text-xs font-bold shadow-md justify-center whitespace-nowrap"
                >
                  <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
                  <span>{downloading ? "Downloading..." : `Download Master ${selectedFormat.toUpperCase()}`}</span>
                </button>
                <button
                  onClick={handleGenerateMaster}
                  disabled={generating}
                  className="glass-button-secondary px-3.5 py-2.5 text-xs font-bold justify-center"
                  title="Re-generate with latest inputs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateMaster}
                disabled={generating}
                className="glass-button-primary px-6 py-2.5 text-xs font-bold shadow-md justify-center whitespace-nowrap"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Compiling 10-15 Page Master PDF...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 text-white" />
                    <span>⚡ Compile All 18 Sections (1 Single PDF)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Master Document Live Status Ribbon */}
        {masterDoc && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Company Startup Blueprint Ready • Version {masterDoc.version}.0 ({selectedFormat.toUpperCase()})
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  File Size: {(masterDoc.file_size_bytes / 1024).toFixed(1)} KB • SHA-256: <span className="font-mono">{masterDoc.checksum_sha256?.substring(0, 16)}...</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(masterDoc)}
              disabled={downloading}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1.5"
            >
              <span>Instant Download ({selectedFormat.toUpperCase()})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Feature Badges List */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Table of Contents with Dynamic Page #s</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Bold Side Headings in Every Chapter</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Exact 10–15 Pages Formatted Length</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Full User Details & Profile Pre-filled</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 18 CHAPTERS INCLUDED INSIDE THE SINGLE PDF */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              18 Sections Included in the Single Master Blueprint
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Modeled after the reference specification with status guide, glossary, scenarios, roadmaps, and statutory disclosures.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            18 Sections Unified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unifiedSections.map((item) => (
            <div
              key={item.num}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-start gap-3.5 transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                {item.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                    {item.page}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 line-clamp-1 font-medium">
                  {item.scope}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DOSSIER ARCHIVE & CRYPTOGRAPHIC VERIFICATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Generated Master Dossier Archive
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Immutable Cryptographic Versioning (SHA-256)
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              No reports compiled yet for this company project.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Click "⚡ Compile All 8 Reports (1 Single PDF)" above to generate your complete 10-15 page dossier.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                    <span className="glass-badge glass-badge-emerald text-[10px]">
                      v{doc.version}.0 • {doc.file_format.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      • {(doc.file_size_bytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Checksum SHA-256: <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.checksum_sha256}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={downloading}
                    className="glass-button-primary text-xs py-2 px-4 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
