import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Users, CheckCircle2, Shield, Briefcase, Award, Info, Scale, Building2, UserCheck } from "lucide-react";
import { complianceApi } from "../../api/client";

const DEFAULT_ROLES = [
  {
    title: "Resident Director",
    category: "Statutory Position",
    type: "Mandatory by Law",
    staffing_type: "Founder / Full-time",
    legal_basis: "Section 149(3), Companies Act, 2013",
    description: "At least one director who stays in India for a total period of not less than 182 days during the financial year.",
    responsibilities: [
      "Ensure compliance with Indian regulatory filings and ROC submissions",
      "Sign statutory notices, board resolutions, and financial statements",
      "Represent the company before statutory authorities and tax tribunals"
    ],
    qualifications: "Must possess a valid DIN, PAN, and Digital Signature Certificate (Class 3 DSC)."
  },
  {
    title: "Managing Director / CEO",
    category: "Management Role",
    type: "Essential",
    staffing_type: "Full-time Executive",
    legal_basis: "Section 2(54), Companies Act, 2013",
    description: "Executive responsible for daily management, corporate strategy, operations, and leadership.",
    responsibilities: [
      "Execute board decisions and strategic commercial roadmaps",
      "Oversee budget allocations, bank operations, and commercial contracts",
      "Maintain investor relations and statutory corporate governance standards"
    ],
    qualifications: "Strong executive leadership and domain competency. Must hold valid DIN."
  },
  {
    title: "Statutory Auditor (Chartered Accountant)",
    category: "External Professional Service",
    type: "Mandatory by Law",
    staffing_type: "Outsourced CA Firm / Independent Practitioner",
    legal_basis: "Section 139(6), Companies Act, 2013",
    description: "Mandatory statutory auditor appointment within 30 days of company incorporation via Board Resolution and Form ADT-1.",
    responsibilities: [
      "Conduct independent annual financial audits of company balance sheet and P&L accounts",
      "Issue official statutory audit reports and notes for MCA Form AOC-4",
      "Verify internal financial controls and tax compliance"
    ],
    qualifications: "Practicing Chartered Accountant holding valid ICAI Certificate of Practice (COP)."
  },
  {
    title: "Practicing Company Secretary (PCS)",
    category: "External Professional Service",
    type: "Mandatory / Retainer Support",
    staffing_type: "Outsourced CS Firm / Secretarial Retainer",
    legal_basis: "Section 203 & 205, Companies Act, 2013",
    description: "Corporate law professional responsible for certifying SPICe+ Part B incorporation filings, MOA/AOA drafting, and annual ROC returns.",
    responsibilities: [
      "Certify annual returns (Form MGT-7/MGT-7A) and secretarial audit filings",
      "Draft and maintain mandatory board minutes, statutory registers, and share allotment (Form PAS-3)",
      "Ensure timely compliance with MCA21 portal statutory timelines to avoid late fees"
    ],
    qualifications: "Fellow or Associate Member of ICSI holding valid Certificate of Practice."
  },
  {
    title: "Data Protection Officer (DPO)",
    category: "Statutory Position",
    type: "Mandatory for Data Fiduciaries",
    staffing_type: "Internal Lead or Outsourced Privacy Counsel",
    legal_basis: "Section 8 & 10, Digital Personal Data Protection Act, 2023",
    description: "Mandatory officer overseeing user data rights, personal KYC proofs, consent records, and privacy regulatory disclosures.",
    responsibilities: [
      "Implement data protection impact assessments and data minimization protocols",
      "Establish and operate customer grievance redressal mechanisms under DPDP Act 2023",
      "Act as official liaison to the Data Protection Board of India in case of security notices"
    ],
    qualifications: "Expertise in Indian privacy jurisprudence, data governance, and information security."
  },
  {
    title: "Chief Technology Officer (CTO)",
    category: "Operational Leadership",
    type: "Recommended for Tech/Digital Ventures",
    staffing_type: "Co-Founder / Full-time",
    legal_basis: "Corporate Governance Best Practices & IT Act, 2000",
    description: "Executive responsible for technology architecture, software engineering, cyber resilience, and cloud systems.",
    responsibilities: [
      "Design scalable digital systems, APIs, and cloud infrastructure",
      "Implement statutory security controls under IT Act 2000 (Section 43A / Reasonable Security Practices)",
      "Protect enterprise intellectual property, source code, and data pipelines"
    ],
    qualifications: "Deep engineering leadership, systems architecture, and technical team management."
  },
  {
    title: "Head of Operations & Regulatory Affairs",
    category: "Operational Leadership",
    type: "Essential",
    staffing_type: "Full-time",
    legal_basis: "Operational Best Practice & State Labor Regulations",
    description: "Operational leader managing supply chain, state labor registrations (Shops & Establishments), commercial vendor contracts, and physical facilities.",
    responsibilities: [
      "Execute state-level establishment registrations, trade licenses, and professional tax compliance",
      "Negotiate and execute vendor agreements, NDAs, and customer service level agreements",
      "Oversee day-to-day administrative infrastructure, procurement, and workplace health standards"
    ],
    qualifications: "Proven background in operational management, contracts, and regulatory administration."
  }
];

export const RolesPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [roles, setRoles] = useState<any[]>(DEFAULT_ROLES);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function loadRoles() {
      if (!projectId || projectId === "new") {
        setRoles(DEFAULT_ROLES);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await complianceApi.getRoles(projectId);
        if (data && Array.isArray(data) && data.length > 0) {
          setRoles(data);
        } else {
          setRoles(DEFAULT_ROLES);
        }
      } catch (err) {
        console.error("Failed to load roles from backend, falling back to statutory defaults:", err);
        setRoles(DEFAULT_ROLES);
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, [projectId]);

  const categories = [
    { id: "all", label: "All Roles", count: roles.length },
    { id: "Statutory Position", label: "Statutory Mandates", count: roles.filter(r => r.category === "Statutory Position").length },
    { id: "External Professional Service", label: "External CA/CS Retainers", count: roles.filter(r => r.category === "External Professional Service").length },
    { id: "Management / Operational", label: "Operational & Management", count: roles.filter(r => r.category !== "Statutory Position" && r.category !== "External Professional Service").length }
  ];

  const filteredRoles = roles.filter(r => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "Management / Operational") {
      return r.category !== "Statutory Position" && r.category !== "External Professional Service";
    }
    return r.category === selectedCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <Scale className="w-4 h-4" />
          <span>Statutory & Operational Staffing Framework</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Organizational & Statutory Role Recommendations
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Tailored to your legal structure and business domain under Indian corporate law (Companies Act, 2013 & DPDP Act, 2023).
        </p>
      </div>

      {/* Explanatory Legal Guide Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Why Role Planning is Essential for Indian Startups
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              Under Indian Corporate Law, an incorporated company is an independent legal entity distinct from its founders. The law establishes strict statutory appointments:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">1. Mandatory Statutory Officers</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Every company must have at least one <b>Resident Director</b> (≥182 days in India under §149(3)) and minimum 2 directors for Private Limited (§149(1)). Failure to appoint attracts heavy MCA penalties.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">2. Statutory Auditor & CA/CS</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              A practicing Chartered Accountant must be appointed as <b>Statutory Auditor</b> within 30 days via <b>Form ADT-1</b> under §139. A CS is mandatory for SPICe+ certification and annual returns (§203).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">3. Operational Startup Leaders</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Key operational roles (CEO, CTO, Operations Head, DPO) translate founding strategy into daily execution, IP development, and customer privacy compliance under the DPDP Act 2023.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedCategory === cat.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Evaluating staffing recommendations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRoles.map((role, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      role.category === "Statutory Position"
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700"
                        : role.category === "External Professional Service"
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                    }`}
                  >
                    {role.category}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{role.staffing_type}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{role.title}</span>
                  {role.type === "Mandatory by Law" && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      Mandatory
                    </span>
                  )}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{role.description}</p>

                {role.qualifications && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">Credentials & Eligibility: </span>
                    <span>{role.qualifications}</span>
                  </div>
                )}

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
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[260px]">
                  {role.legal_basis}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{role.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
