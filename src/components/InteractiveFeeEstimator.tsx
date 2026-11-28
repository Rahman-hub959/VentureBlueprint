import React, { useState } from "react";
import {
  Building2,
  Scale,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Info
} from "lucide-react";

interface InteractiveFeeEstimatorProps {
  onSelectPlan: (summary: string, pillar: "CS" | "CA" | "LAW", startingFee: number) => void;
}

type EntityType = "pvt_ltd" | "llp" | "opc" | "proprietorship";

export const InteractiveFeeEstimator: React.FC<InteractiveFeeEstimatorProps> = ({ onSelectPlan }) => {
  const [entityType, setEntityType] = useState<EntityType>("pvt_ltd");
  const [authorizedCapital, setAuthorizedCapital] = useState<number>(1000000); // 10 Lakhs
  const [addons, setAddons] = useState<{
    gst: boolean;
    trademark: boolean;
    annualRetainer: boolean;
    expedited: boolean;
  }>({
    gst: true,
    trademark: false,
    annualRetainer: false,
    expedited: false,
  });

  const entities = [
    {
      id: "pvt_ltd" as EntityType,
      name: "Private Limited Company",
      tagline: "Best for startups & VC funding",
      turnaround: "5-7 Working Days",
      popular: true,
      features: [
        "2 Digital Signatures (DSC) + 2 DINs",
        "MoA & AoA Drafting via SPICe+ Part B",
        "PAN, TAN, EPFO, ESIC Registration",
        "Statutory First Board Meeting Minutes",
        "Bank Current Account Documentation",
      ],
      pillar: "CS" as const,
    },
    {
      id: "llp" as EntityType,
      name: "Limited Liability Partnership",
      tagline: "For professional & family firms",
      turnaround: "7-10 Working Days",
      popular: false,
      features: [
        "2 Designated Partner DPINs & DSCs",
        "LLP Agreement Drafting & State Stamping",
        "Form FiLLiP & Form 3 ROC Submissions",
        "Partnership Deed Regulatory Compliance",
      ],
      pillar: "CS" as const,
    },
    {
      id: "opc" as EntityType,
      name: "One Person Company",
      tagline: "For single solopreneurs",
      turnaround: "5-7 Working Days",
      popular: false,
      features: [
        "1 Director DSC + Nominee Consent Form",
        "Limited Liability Protection for Solopreneurs",
        "Seamless conversion to Pvt Ltd as you scale",
      ],
      pillar: "CS" as const,
    },
    {
      id: "proprietorship" as EntityType,
      name: "Sole Proprietorship",
      tagline: "Fastest entry for local trade",
      turnaround: "2-3 Working Days",
      popular: false,
      features: [
        "MSME / Udyam Registration Certificate",
        "GST Registration & Tax Setup",
        "Current Account Opening Resolution",
      ],
      pillar: "CA" as const,
    },
  ];

  const currentEntity = entities.find((e) => e.id === entityType) || entities[0];

  const handleCta = () => {
    const chosenAddons: string[] = [];
    if (addons.gst) chosenAddons.push("GST Registration");
    if (addons.trademark) chosenAddons.push("Trademark Filing");
    if (addons.annualRetainer) chosenAddons.push("1-Year Secretarial Retainer");
    if (addons.expedited) chosenAddons.push("Fast-Track Desk");

    const summary = `${currentEntity.name} Setup with ${chosenAddons.length > 0 ? chosenAddons.join(", ") : "Standard Statutory Scope"}`;
    onSelectPlan(summary, currentEntity.pillar, 0);
  };

  return (
    <div className="spatial-card rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-8">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full spatial-glass-pill text-xs font-bold text-[#C59B27] mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Multi-Disciplinary Scope · Certified Law, CS &amp; CA Desk</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2559] dark:text-white">
            Corporate Setup &amp; Advisory Scope Builder
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your business structure, statutory requirements, and empanelled advisory services for an end-to-end corporate roadmap.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Advisory Desk
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#0B2559] dark:text-white">
            {currentEntity.turnaround}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Direct Expert Callback &amp; Verification
          </div>
        </div>
      </div>

      {/* Step 1: Select Entity Type Grid */}
      <div className="space-y-3">
        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          1. Select Corporate Business Structure
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {entities.map((ent) => {
            const isSelected = ent.id === entityType;
            return (
              <button
                key={ent.id}
                onClick={() => setEntityType(ent.id)}
                type="button"
                className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#0B2559]/5 dark:bg-white/5 border-[#C59B27] shadow-md ring-2 ring-[#C59B27]/40"
                    : "spatial-surface border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {ent.popular && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#C59B27] text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs">
                    Recommended
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#0B2559] dark:text-white">
                      {ent.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {ent.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#C59B27]">
                    MCA Compliant
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {ent.turnaround}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Proposed Authorized Share Capital Bracket */}
      {entityType === "pvt_ltd" && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                2. Proposed Authorized Share Capital Bracket
              </span>
              <p className="text-[11px] text-slate-500">
                Select your planned authorized equity capital for incorporation documents and state stamp duty allocation.
              </p>
            </div>
            <span className="text-sm font-extrabold text-[#0B2559] dark:text-white px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              {(authorizedCapital / 100000).toFixed(0)} Lakhs Capital
            </span>
          </div>

          <div className="flex items-center gap-3">
            {[100000, 500000, 1000000, 1500000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAuthorizedCapital(val)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authorizedCapital === val
                    ? "bg-[#0B2559] text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#C59B27]"
                }`}
              >
                {(val / 100000).toFixed(0)} Lakh{val > 100000 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Add-on Services Checklist */}
      <div className="space-y-3">
        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          3. Combined CA &amp; Legal Advisory Modules
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              key: "gst" as const,
              title: "GST Registration & Certificate Issuance",
              desc: "Mandatory for inter-state supply, B2B invoicing, and eCommerce onboarding",
              badge: "Tax Desk",
            },
            {
              key: "trademark" as const,
              title: "Trademark Brand Filing & Class Search",
              desc: "Protects your corporate brand name & logo under Trade Marks Act, 1999",
              badge: "IP Legal",
            },
            {
              key: "annualRetainer" as const,
              title: "Annual ROC Secretarial & Governance Retainer",
              desc: "Form AOC-4, MGT-7, ADT-1, Director KYC, and quarterly statutory board resolutions",
              badge: "CS Retainer",
            },
            {
              key: "expedited" as const,
              title: "Expedited Priority Processing Desk",
              desc: "Dedicated senior CS assigned for priority SPICe+ preparation and submission",
              badge: "Priority",
            },
          ].map((addon) => {
            const isChecked = addons[addon.key];
            return (
              <div
                key={addon.key}
                onClick={() => setAddons({ ...addons, [addon.key]: !isChecked })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isChecked
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-xs"
                    : "spatial-surface border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                    isChecked
                      ? "bg-[#C59B27] border-[#C59B27] text-white"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {addon.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap ml-2">
                      {addon.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {addon.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Box & CTA */}
      <div className="p-5 sm:p-6 rounded-2xl spatial-card-navy text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-[#C59B27]" />
            <span>Selected Corporate Scope</span>
          </div>
          <div className="text-lg font-extrabold">
            {currentEntity.name} Setup
          </div>
          <ul className="text-xs text-slate-300 flex flex-wrap gap-x-4 gap-y-1 pt-1 font-medium">
            {currentEntity.features.slice(0, 3).map((f, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#C59B27]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCta}
          className="corpsetu-btn-gold text-xs py-3 px-6 shadow-xl whitespace-nowrap w-full md:w-auto"
        >
          <span>Request Corporate Advisory Proposal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
