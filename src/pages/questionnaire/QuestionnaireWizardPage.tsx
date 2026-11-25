import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building,
  Users,
  MapPin,
  IndianRupee,
  Cpu,
  FileCheck2,
  Sparkles,
  Plus,
  Trash2,
  Info,
  Loader2
} from "lucide-react";
import { questionnairesApi, validationApi, complianceApi } from "../../api/client";
import { useToast } from "../../context/ToastContext";

export const QuestionnaireWizardPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [validationData, setValidationData] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Section 1
    company_name: "",
    alternative_names: "",
    business_domain: "Information Technology",
    business_description: "",
    products_and_services: "",
    target_audience: "",
    business_stage: "Idea",

    // Section 2
    founder_count: 2,
    founders_list: [
      { full_name: "Founder One", email: "", phone: "", proposed_shareholding_percentage: 60, is_resident_of_india: true, executive_role: "Managing Director" },
      { full_name: "Founder Two", email: "", phone: "", proposed_shareholding_percentage: 40, is_resident_of_india: true, executive_role: "Director" }
    ],
    preferred_structure: "Private Limited Company",
    has_foreign_founders: false,
    has_investor_participation: false,

    // Section 3
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    registered_office_address: "",
    postal_code: "",
    premise_type: "Rented",
    operation_mode: "Physical",
    multi_state_operations: false,
    secondary_state: "",
    secondary_city: "",
    secondary_office_address: "",

    // Section 4
    initial_investment_range: "₹1L – ₹5L",
    proposed_authorized_capital: 100000,
    proposed_paid_up_capital: 100000,
    revenue_models: ["Direct Product Sales", "Subscription / SaaS"],
    sales_channels: ["Own Website"],

    // Section 5
    expected_employee_count: "1-5 people",
    departments: ["Engineering/Tech", "Operations"],
    manufacturing_involved: false,

    // Section 6
    collects_personal_data: false,
    collects_personal_data_confirmed: false,
    imports_or_exports: false,
    requires_ca_cs_support: false,
    requires_ca_cs_support_confirmed: false,
  });

  const steps = [
    { id: "section_1_company", title: "Company Information", icon: Building },
    { id: "section_2_structure", title: "Ownership & Structure", icon: Users },
    { id: "section_3_location", title: "Registered Location", icon: MapPin },
    { id: "section_4_financial", title: "Financials & Capital", icon: IndianRupee },
    { id: "section_5_operational", title: "Operations & Team", icon: Cpu },
    { id: "section_6_compliance", title: "Regulatory Needs", icon: Shield },
    { id: "section_7_review", title: "Review & Synthesis", icon: FileCheck2 },
  ];

  useEffect(() => {
    async function loadData() {
      if (!projectId) return;
      try {
        const data = await questionnairesApi.getProjectAnswers(projectId);
        if (data) {
          const prof = data.profile || {};
          setFormData((prev) => ({
            ...prev,
            company_name: data.name || prev.company_name,
            business_domain: data.domain || prev.business_domain,
            preferred_structure: data.preferred_structure || prev.preferred_structure,
            ...prof,
            secondary_state: prof.secondary_state || "",
            secondary_city: prof.secondary_city || "",
            secondary_office_address: prof.secondary_office_address || "",
            collects_personal_data: Boolean(prof.collects_personal_data),
            collects_personal_data_confirmed: Boolean(prof.collects_personal_data_confirmed ?? prof.collects_personal_data),
            requires_ca_cs_support: Boolean(prof.requires_ca_cs_support),
            requires_ca_cs_support_confirmed: Boolean(prof.requires_ca_cs_support_confirmed ?? prof.requires_ca_cs_support),
            founders_list: data.founders?.length > 0 ? data.founders : prev.founders_list,
            founder_count: data.founders?.length || prev.founder_count
          }));
        }
      } catch (err) {
        console.error("Failed to load questionnaire data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  const handleSaveStep = async (stepIndex: number = activeStep) => {
    if (!projectId) return;
    setSaving(true);
    try {
      await questionnairesApi.saveAnswers(projectId, steps[stepIndex].id, formData);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    // Step 3 (index 2: Location & Registered Office) Validation
    if (activeStep === 2) {
      if (!formData.registered_office_address?.trim()) {
        showToast("Please enter the Complete Registered Office Address.", "warning");
        return;
      }
      if (!formData.postal_code?.trim()) {
        showToast("Please enter the Postal PIN Code.", "warning");
        return;
      }
      if (formData.multi_state_operations) {
        if (!formData.secondary_state) {
          showToast("Please select the operating state for your additional establishment.", "warning");
          return;
        }
        if (!formData.secondary_office_address?.trim()) {
          showToast("Detailed address of the additional establishment is mandatory.", "warning");
          return;
        }
      }
    }

    // Step 4 (index 3: Financials & Capital) Validation
    if (activeStep === 3) {
      if (formData.proposed_authorized_capital === "" || Number(formData.proposed_authorized_capital) < 100000) {
        showToast("Enter the amount more than 100000 for Proposed Authorized Share Capital.", "warning");
        return;
      }
      if (formData.proposed_paid_up_capital === "" || Number(formData.proposed_paid_up_capital) < 100000) {
        showToast("Enter the amount more than 100000 for Proposed Paid-Up Capital.", "warning");
        return;
      }
      if (Number(formData.proposed_paid_up_capital) > Number(formData.proposed_authorized_capital)) {
        showToast("Proposed Paid-Up Capital cannot exceed Proposed Authorized Share Capital.", "warning");
        return;
      }
    }

    // Step 6 (index 5: Regulatory & Statutory Needs) Validation
    if (activeStep === 5) {
      if (!formData.collects_personal_data_confirmed) {
        showToast("Please check and confirm the mandatory Digital Personal Data Collection acknowledgment to proceed.", "warning");
        return;
      }
      if (!formData.requires_ca_cs_support_confirmed) {
        showToast("Please check and confirm the mandatory External CA/CS Retainer Assistance acknowledgment to proceed.", "warning");
        return;
      }
    }

    await handleSaveStep(activeStep);
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const runValidation = async () => {
    if (!projectId) return;
    try {
      setValidating(true);
      const res = await validationApi.runProjectValidation(projectId);
      setValidationData(res);
      showToast("Statutory compliance validation completed successfully.", "success");
    } catch (err) {
      console.error("Validation error:", err);
      showToast("Compliance validation failed. Please check network/server.", "error");
    } finally {
      setValidating(false);
    }
  };

  const addFounder = () => {
    setFormData((prev) => ({
      ...prev,
      founder_count: prev.founders_list.length + 1,
      founders_list: [
        ...prev.founders_list,
        {
          full_name: `Co-Founder ${prev.founders_list.length + 1}`,
          email: "",
          phone: "",
          proposed_shareholding_percentage: 0,
          is_resident_of_india: true,
          executive_role: "Director"
        }
      ]
    }));
  };

  const removeFounder = (index: number) => {
    if (formData.founders_list.length <= 1) return;
    const updated = formData.founders_list.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      founder_count: updated.length,
      founders_list: updated
    }));
  };

  const handleFinishAssessment = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await handleSaveStep(activeStep);
      await complianceApi.assess(projectId);
      navigate(`/projects/${projectId}/compliance`);
    } catch (err) {
      alert("Failed to submit assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400 text-sm">Loading questionnaire dossier...</div>;
  }

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Top Stepper Navigation */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < activeStep;
            const isCurrent = idx === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => {
                  handleSaveStep();
                  setActiveStep(idx);
                }}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-all ${
                  isCurrent
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700"
                    : isDone
                    ? "text-slate-700 dark:text-slate-700 dark:text-slate-300 hover:text-emerald-600"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                  isCurrent
                    ? "bg-emerald-600 text-white"
                    : isDone
                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {idx + 1}
                </div>
                <span className="truncate">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Questionnaire Card */}
      <div className="glass-modal p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-8">
        {/* Step 1: Company Info */}
        {activeStep === 0 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Section 1</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Company Information</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">Set the foundational identity and commercial activities.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Proposed Legal Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Enter proposed company name..."
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Alternative Name Choices (for MCA SPICe+ reservation)</label>
                <input
                  type="text"
                  value={formData.alternative_names}
                  onChange={(e) => setFormData({ ...formData, alternative_names: e.target.value })}
                  placeholder="Enter alternative name choices (optional)..."
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Business Overview & Objectives *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.business_description}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  placeholder="Describe your core commercial activities, products, and customer value proposition..."
                  className="w-full glass-input resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Audience</label>
                  <input
                    type="text"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="e.g. Urban consumers, B2B SMEs"
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Current Business Stage</label>
                  <select
                    value={formData.business_stage}
                    onChange={(e) => setFormData({ ...formData, business_stage: e.target.value })}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Idea" className="bg-slate-900">Idea Stage</option>
                    <option value="Prototype" className="bg-slate-900">Prototype / POC Built</option>
                    <option value="Planning" className="bg-slate-900">Formal Incorporation Planning</option>
                    <option value="Already Operating" className="bg-slate-900">Commercial Operations Started</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Ownership & Structure */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Section 2</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Ownership & Legal Structure</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">Configure founder equity allocations, directors, and legal structure preferences.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Preferred Legal Structure</label>
                  <select
                    value={formData.preferred_structure}
                    onChange={(e) => setFormData({ ...formData, preferred_structure: e.target.value })}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Private Limited Company" className="bg-slate-900">Private Limited Company</option>
                    <option value="LLP" className="bg-slate-900">LLP (Limited Liability Partnership)</option>
                    <option value="OPC" className="bg-slate-900">OPC (One Person Company)</option>
                    <option value="Partnership Firm" className="bg-slate-900">Partnership Firm</option>
                    <option value="Sole Proprietorship" className="bg-slate-900">Sole Proprietorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Equity Fundraising Intent</label>
                  <select
                    value={formData.has_investor_participation ? "yes" : "no"}
                    onChange={(e) => setFormData({ ...formData, has_investor_participation: e.target.value === "yes" })}
                    className="w-full glass-input text-xs"
                  >
                    <option value="no" className="bg-slate-900">Bootstrapped / Founder Funded</option>
                    <option value="yes" className="bg-slate-900">Plan to raise Angel/VC Equity</option>
                  </select>
                </div>
              </div>

              {/* Founders List Builder */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Founders & Proposed Shareholding ({formData.founders_list.length})
                  </label>
                  <button
                    type="button"
                    onClick={addFounder}
                    className="glass-button-secondary text-xs py-1 px-3"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Founder
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.founders_list.map((f, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-slate-900 dark:text-white font-bold mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          value={f.full_name}
                          onChange={(e) => {
                            const updated = [...formData.founders_list];
                            updated[idx].full_name = e.target.value;
                            setFormData({ ...formData, founders_list: updated });
                          }}
                          className="w-full glass-input text-xs py-1.5"
                          placeholder="Founder Name"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-900 dark:text-white font-bold mb-1">Mobile / Phone Number</label>
                        <input
                          type="tel"
                          value={f.phone || ""}
                          onChange={(e) => {
                            const updated = [...formData.founders_list];
                            updated[idx].phone = e.target.value;
                            setFormData({ ...formData, founders_list: updated });
                          }}
                          className="w-full glass-input text-xs py-1.5"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-900 dark:text-white font-bold mb-1">Equity Stake (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={f.proposed_shareholding_percentage}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...formData.founders_list];
                            updated[idx].proposed_shareholding_percentage = val === "" ? ("" as any) : Number(val);
                            setFormData({ ...formData, founders_list: updated });
                          }}
                          className="w-full glass-input text-xs py-1.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-900 dark:text-white font-bold mb-1">Resident of India?</label>
                        <select
                          value={f.is_resident_of_india ? "yes" : "no"}
                          onChange={(e) => {
                            const updated = [...formData.founders_list];
                            updated[idx].is_resident_of_india = e.target.value === "yes";
                            setFormData({ ...formData, founders_list: updated });
                          }}
                          className="w-full glass-input text-xs py-1.5"
                        >
                          <option value="yes">Yes (&gt;182 days)</option>
                          <option value="no">No (NRI/Foreign)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeFounder(idx)}
                          className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Section 3</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Location & Registered Office</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">Determines Registrar of Companies (ROC) state jurisdiction and local municipal obligations.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">State of Registered Office *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full glass-input text-xs"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st} className="bg-slate-900">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru, Hyderabad, Mumbai"
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Complete Registered Office Address *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.registered_office_address}
                  onChange={(e) => setFormData({ ...formData, registered_office_address: e.target.value })}
                  placeholder="Building No, Street, Landmark, Pin code..."
                  className="w-full glass-input resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Postal PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="e.g. 560038"
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Premise Occupancy</label>
                  <select
                    value={formData.premise_type}
                    onChange={(e) => setFormData({ ...formData, premise_type: e.target.value })}
                    className="w-full glass-input text-xs"
                  >
                    <option value="Rented" className="bg-slate-900">Rented / Leased</option>
                    <option value="Owned" className="bg-slate-900">Owned by Director/Founder</option>
                    <option value="Shared" className="bg-slate-900">Shared / Co-working Space</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">State Operation *</label>
                  <select
                    value={formData.multi_state_operations ? "yes" : "no"}
                    onChange={(e) => setFormData({ ...formData, multi_state_operations: e.target.value === "yes" })}
                    className="w-full glass-input text-xs"
                  >
                    <option value="no" className="bg-slate-900">Single State (Primary registered office address specified above)</option>
                    <option value="yes" className="bg-slate-900">Multi-State Presence (Additional branch or establishment)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Multi-State Presence Branch Details */}
              {formData.multi_state_operations && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-3 transition-all">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Additional State / Branch Establishment Details *</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Operating in multiple states triggers separate State GSTIN registrations under the Central Goods and Services Tax Act (CGST Act §§ 22/24) and state-specific professional tax compliances.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Additional Operating State *</label>
                      <select
                        required
                        value={formData.secondary_state}
                        onChange={(e) => setFormData({ ...formData, secondary_state: e.target.value })}
                        className="w-full glass-input text-xs"
                      >
                        <option value="" className="bg-slate-900">-- Select State in India --</option>
                        {indianStates.map((st) => (
                          <option key={st} value={st} className="bg-slate-900">{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Additional Operating City / District *</label>
                      <input
                        type="text"
                        required
                        value={formData.secondary_city}
                        onChange={(e) => setFormData({ ...formData, secondary_city: e.target.value })}
                        placeholder="e.g. Hyderabad, Mumbai, Pune"
                        className="w-full glass-input text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Detailed Address of Additional Establishment / Branch *</label>
                    <textarea
                      rows={2}
                      required
                      value={formData.secondary_office_address}
                      onChange={(e) => setFormData({ ...formData, secondary_office_address: e.target.value })}
                      placeholder="Detailed branch/office address, building, street, landmark, PIN code..."
                      className="w-full glass-input resize-none text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Financials */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Section 4</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Financial Information & Capital</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">Establish corporate share capital and initial startup budgeting.</p>
            </div>

            {/* Informational Plain-Language Guide Box */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-xs">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>Plain-Language Guide: Understanding Corporate Share Capital</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900/60 shadow-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <span>🏛️</span>
                    <span>What is Proposed Authorized Share Capital?</span>
                  </div>
                  <p>
                    This is the <b>maximum statutory ceiling</b> of share capital your company is legally authorized to issue to shareholders under its Memorandum of Association (MOA).
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    💡 <b>MCA Zero-Fee Rule:</b> Under MCA SPICe+ norms, Government incorporation filing fees are <b>₹0 (100% free)</b> for authorized capital up to <b>₹15,00,000 (15 Lakhs)</b>. Setting ₹1,00,000 to ₹15,00,000 incurs no government fee.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900/60 shadow-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <span>💳</span>
                    <span>What is Proposed Paid-Up Capital?</span>
                  </div>
                  <p>
                    This is the <b>actual cash amount</b> that the founders and subscribers physically deposit into the newly opened company bank account in exchange for their allotted equity shares.
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    💡 <b>Statutory Rule:</b> Paid-up capital can never exceed authorized capital. Under current Companies Act rules, there is no mandatory minimum paid-up capital requirement (typically ₹1,00,000 for startup ventures).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Proposed Authorized Share Capital (INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.proposed_authorized_capital}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, proposed_authorized_capital: val === "" ? ("" as any) : Number(val) });
                    }}
                    placeholder="100000"
                    className="w-full glass-input"
                  />
                  {(formData.proposed_authorized_capital === "" || Number(formData.proposed_authorized_capital) < 100000) ? (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-[11px] font-semibold flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>enter the amount more than 100000</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 block font-medium">Standard MCA zero-fee ceiling up to ₹15 Lakhs capital.</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Proposed Paid-Up Capital (INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.proposed_paid_up_capital}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, proposed_paid_up_capital: val === "" ? ("" as any) : Number(val) });
                    }}
                    placeholder="100000"
                    className="w-full glass-input"
                  />
                  {(formData.proposed_paid_up_capital === "" || Number(formData.proposed_paid_up_capital) < 100000) ? (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-[11px] font-semibold flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>enter the amount more than 100000</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 block font-medium">Actual capital deposited in company bank account after incorporation.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Estimated Startup Expense Budget</label>
                <select
                  value={formData.initial_investment_range}
                  onChange={(e) => setFormData({ ...formData, initial_investment_range: e.target.value })}
                  className="w-full glass-input text-xs"
                >
                  <option value="₹1L – ₹5L" className="bg-slate-900">₹1 Lakh – ₹5 Lakhs</option>
                  <option value="₹5L – ₹10L" className="bg-slate-900">₹5 Lakhs – ₹10 Lakhs</option>
                  <option value="₹10L – ₹25L" className="bg-slate-900">₹10 Lakhs – ₹25 Lakhs</option>
                  <option value="₹25L – ₹50L" className="bg-slate-900">₹25 Lakhs – ₹50 Lakhs</option>
                  <option value="Above ₹50 Lakhs" className="bg-slate-900">Above ₹50 Lakhs</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Operations */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Section 5</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Operational Requirements</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">Staffing, department structures, and industrial facilities.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expected Employee Headcount</label>
                <select
                  value={formData.expected_employee_count}
                  onChange={(e) => setFormData({ ...formData, expected_employee_count: e.target.value })}
                  className="w-full glass-input text-xs"
                >
                  <option value="1-5 people" className="bg-slate-900">1–5 employees (Below ESIC/EPFO thresholds)</option>
                  <option value="6-15 people" className="bg-slate-900">6–15 employees (Triggers ESIC at 10 employees)</option>
                  <option value="16-50 people" className="bg-slate-900">16–50 employees (Triggers EPFO at 20 employees)</option>
                  <option value="More than 50" className="bg-slate-900">More than 50 employees</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Manufacturing / Assembly Involved?</label>
                <select
                  value={formData.manufacturing_involved ? "yes" : "no"}
                  onChange={(e) => setFormData({ ...formData, manufacturing_involved: e.target.value === "yes" })}
                  className="w-full glass-input text-xs"
                >
                  <option value="no" className="bg-slate-900">No (Software, Services, or Trading)</option>
                  <option value="yes" className="bg-slate-900">Yes (Requires Factory Rules & Pollution NOC evaluation)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Regulatory Needs */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Section 6</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Regulatory & Statutory Needs</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">Mandatory statutory declarations governing privacy, cross-border commerce, and secretarial auditing.</p>
            </div>

            <div className="space-y-4">
              {/* Mandatory: Digital Personal Data Collection */}
              <div className={`p-5 rounded-2xl border transition-all ${
                formData.collects_personal_data_confirmed
                  ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800"
                  : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
              }`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Digital Personal Data Collection *</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        Mandatory
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                      Does your business collect, store, or process personal user information (e.g. phone numbers, email addresses, KYC proofs, or customer profiles) under the Digital Personal Data Protection Act, 2023 (DPDP Act)?
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 cursor-pointer hover:border-emerald-500 transition-all shadow-xs">
                  <input
                    type="checkbox"
                    checked={formData.collects_personal_data_confirmed}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      collects_personal_data_confirmed: e.target.checked,
                      collects_personal_data: e.target.checked 
                    })}
                    className="w-4 h-4 mt-0.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      I confirm and acknowledge mandatory compliance under the DPDP Act, 2023
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block">
                      Our organization will maintain statutory consent notices, data fiduciary safeguards, and user grievance mechanisms for all digital personal data handled.
                    </span>
                  </div>
                </label>
              </div>

              {/* Cross-Border Trade / Import-Export */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cross-Border Trade / Import-Export</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Exports software, digital services, or imports foreign goods (Requires DGFT Import Export Code - IEC).</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.imports_or_exports}
                  onChange={(e) => setFormData({ ...formData, imports_or_exports: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Mandatory: External CA/CS Retainer Assistance */}
              <div className={`p-5 rounded-2xl border transition-all ${
                formData.requires_ca_cs_support_confirmed
                  ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800"
                  : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
              }`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">External CA/CS Retainer Assistance *</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        Mandatory
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                      Professional secretarial certification is mandatory for SPICe+ Part B incorporation filings, statutory auditor appointment (Form ADT-1 within 30 days under Section 139), and annual ROC returns (AOC-4, MGT-7).
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 cursor-pointer hover:border-emerald-500 transition-all shadow-xs">
                  <input
                    type="checkbox"
                    checked={formData.requires_ca_cs_support_confirmed}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      requires_ca_cs_support_confirmed: e.target.checked,
                      requires_ca_cs_support: e.target.checked 
                    })}
                    className="w-4 h-4 mt-0.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      I confirm and acknowledge mandatory CA/CS retainer assistance
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block">
                      Our company engages/will engage an external practicing Chartered Accountant (CA) or Company Secretary (CS) for required statutory attestations and filings.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Final Review & Synthesis */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Section 7</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Final Review & Regulatory Synthesis</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Cross-field checks executed by the deterministic validation engine.</p>
            </div>

            {/* Validation Findings */}
            {validating ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 mx-auto flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Running Statutory Compliance Validation...</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                    Evaluating regulatory cross-checks against Companies Act 2013, MCA Rule 8, foreign investment caps, DPDP Act 2023, and state establishment provisions.
                  </p>
                </div>
              </div>
            ) : validationData ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Validation Summary</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{validationData.total_checks} deterministic compliance checks executed.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="glass-badge glass-badge-emerald text-xs">
                      Recommended: {validationData.structure_recommendation?.recommended_structure}
                    </span>
                    <button
                      type="button"
                      onClick={runValidation}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Re-run Validation
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {validationData.validation_results?.map((res: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                        res.status === "Passed"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                          : res.status === "Warning"
                          ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200"
                          : "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200"
                      }`}
                    >
                      {res.status === "Passed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{res.explanation}</div>
                        <div className="text-[11px] opacity-90 mt-0.5 font-medium">Action: {res.corrective_action}</div>
                        {res.legal_reference && (
                          <div className="text-[10px] text-slate-700 dark:text-slate-300 font-mono mt-1 font-semibold">Provision: {res.legal_reference}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 mx-auto flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ready for Statutory Compliance Validation</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Click the button below to execute cross-field verification across your founders, foreign participation, multi-state presence, authorized capital, and regulatory declarations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={runValidation}
                  className="glass-button-primary text-xs py-2.5 px-6 inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Run Compliance Validation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeStep === 0}
            className={`glass-button-secondary text-xs py-2.5 px-4 ${
              activeStep === 0 ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveStep()}
              disabled={saving}
              className="glass-button-secondary text-xs py-2.5 px-4"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </button>

            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="glass-button-primary text-xs py-2.5 px-5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishAssessment}
                disabled={saving}
                className="glass-button-primary text-xs py-2.5 px-6"
              >
                <span>Submit & View Compliance</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
