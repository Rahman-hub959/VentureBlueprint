import React from "react";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Legal & Compliance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Effective Date: November 2026 • Compliant with DPDP Act, 2023</p>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed transition-colors">
        <section className="space-y-2">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">1. Local Architecture & Zero Cloud Exposure</h2>
          <p className="font-medium">
            VentureBlueprint is architected to operate fully locally on your development and hosting infrastructure. We do not transmit your proprietary business plans, cap table information, or founder personally identifiable information (PII) to third-party artificial intelligence providers (such as OpenAI, Google Gemini, Anthropic, or cloud model brokers).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">2. Data Processed</h2>
          <p className="font-medium">
            The platform processes user-provided information for the sole purpose of evaluating company formation feasibility, statutory compliance checks, and compiling documentation dossiers. This includes proposed entity names, director designations, shareholding percentages, registered office addresses, and financial assumptions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">3. Storage & Cryptographic Verification</h2>
          <p className="font-medium">
            All generated documents and database records are held strictly within private local storage directories on your configured environment. Each generated document receives a SHA-256 cryptographic checksum to verify local data integrity.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">4. User Rights under Indian DPDP Act, 2023</h2>
          <p className="font-medium">
            Users maintain full ownership and control over their account data. You may delete projects, clear questionnaire responses, or export complete dossier histories at any time through your dashboard interface.
          </p>
        </section>
      </div>
    </div>
  );
};
