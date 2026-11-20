import React from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle2, Award, Scale, Lock, Users, ArrowRight } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          About VentureBlueprint
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Democratizing Corporate Formation & Regulatory Clarity
        </h1>
        <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium">
          VentureBlueprint is an independent, deterministic platform designed to guide Indian entrepreneurs through the intricacies of company formation, regulatory verification, and statutory documentation.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Deterministic Logic</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            We reject probabilistic AI hallucinations for legal matters. Every recommendation is derived from exact statutory rules under the Companies Act 2013 and relevant Indian legislation.
          </p>
        </div>

        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">100% Local Privacy</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Your proprietary business models, cap table allocations, and director details remain completely private on your local filesystem without cloud exposure.
          </p>
        </div>

        <div className="glass-card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Professional Grade</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Our output documents are formatted to corporate publication standards, ready for immediate handover to practicing Chartered Accountants and Company Secretaries.
          </p>
        </div>
      </div>

      {/* The Story & Objective */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 transition-colors">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Why We Built VentureBlueprint</h2>
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
          Starting a business in India offers immense potential, yet founders routinely encounter fragmented information, generic templates, and misleading legal advice. Critical statutory requirements—such as resident director mandates, Rule 8 name pre-screening, and post-incorporation capital deposit timelines—are frequently discovered late, resulting in penalties and delays.
        </p>
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
          VentureBlueprint bridges the gap between raw entrepreneurial ideas and official statutory requirements. By structuring questionnaire data into deterministic rule evaluations and local document compilers, we empower founders to walk into professional consultations with absolute clarity and complete documentation.
        </p>
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <span>Jurisdiction: Republic of India</span>
          <Link to="/how-it-works" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
            See How It Works <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
