import React, { useState } from "react";
import {
  LifeBuoy,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Scale,
  Building2,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Send,
  X
} from "lucide-react";
import { CorpSetuLogo } from "../../components/CorpSetuLogo";

interface GrievanceTicket {
  id: string;
  companyName: string;
  pillar: "CS" | "CA" | "LAW" | "GENERAL";
  category: string;
  priority: "Low" | "Standard" | "High" | "Critical";
  status: "Registered" | "In Review by Expert" | "Action In Progress" | "Resolved";
  assignedExpert: string;
  createdAt: string;
  description: string;
  resolutionNote?: string;
}

export const ComplaintsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [tickets, setTickets] = useState<GrievanceTicket[]>([
    {
      id: "CS-GRV-2026-8912",
      companyName: "Lumora Technologies Pvt Ltd",
      pillar: "CS",
      category: "MCA SPICe+ Name Approval Resubmission",
      priority: "Critical",
      status: "In Review by Expert",
      assignedExpert: "CS Priyanjali Sen (Senior Secretarial Lead)",
      createdAt: "Today, 10:15 AM",
      description: "Received an MCA resubmission notice requesting clarification on main business objects in MoA Clause 3(a). Need revised drafting within 15 days.",
      resolutionNote: "Revised MoA Clause 3(a) drafted according to NIC Code 62013 and resubmitted on MCA portal.",
    },
    {
      id: "CS-GRV-2026-8740",
      companyName: "Kaveri Cold Brew Pvt Ltd",
      pillar: "CA",
      category: "GSTR-3B Input Tax Credit Reconciliation Mismatch",
      priority: "High",
      status: "Action In Progress",
      assignedExpert: "CA Aniket Kulkarni (Tax Partner)",
      createdAt: "Yesterday, 04:30 PM",
      description: "Vendor invoice not reflecting in GSTR-2B for September 2026. Need reconciliation and communication with vendor accountant before filing.",
    },
    {
      id: "CS-GRV-2026-8511",
      companyName: "Zenith CleanTech LLP",
      pillar: "LAW",
      category: "Co-Founder Agreement Vesting Schedule Revision",
      priority: "Standard",
      status: "Resolved",
      assignedExpert: "Adv. Rajesh Varma (Corporate Counsel)",
      createdAt: "18 Nov 2026",
      description: "Add 1-year cliff and 48-month accelerated vesting clause in case of Series A acquisition.",
      resolutionNote: "Tri-party amended Founder Agreement executed on stamp paper and notarized. Case closed successfully.",
    },
  ]);

  // New Ticket Form State
  const [formData, setFormData] = useState({
    companyName: "",
    pillar: "CS" as "CS" | "CA" | "LAW" | "GENERAL",
    category: "MCA SPICe+ Filing Issue",
    priority: "High" as "Low" | "Standard" | "High" | "Critical",
    description: "",
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CS-GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: GrievanceTicket = {
      id: newId,
      companyName: formData.companyName || "My Venture",
      pillar: formData.pillar,
      category: formData.category,
      priority: formData.priority,
      status: "Registered",
      assignedExpert:
        formData.pillar === "CS"
          ? "CS Priyanjali Sen"
          : formData.pillar === "CA"
          ? "CA Aniket Kulkarni"
          : "Adv. Rajesh Varma",
      createdAt: "Just now",
      description: formData.description,
    };

    setTickets([newTicket, ...tickets]);
    setModalOpen(false);
    setFormData({
      companyName: "",
      pillar: "CS",
      category: "MCA SPICe+ Filing Issue",
      priority: "High",
      description: "",
    });
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "ACTIVE" && t.status === "Resolved") return false;
    if (activeTab === "RESOLVED" && t.status !== "Resolved") return false;
    if (searchQuery) {
      return (
        t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B2559] to-[#061838] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[#C59B27] text-xs font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Dedicated Grievance Redressal Mechanism</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Corporate Complaints & Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Have an issue with your MCA filings, GST reconciliation, contract dispute, or compliance deadlines? Register your grievance here. Every ticket is assigned to a certified senior CA, CS, or Advocate with guaranteed response within 2 hours.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="corpsetu-btn-gold text-xs py-3 px-6 shadow-md whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Complaint / Ticket</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { key: "ALL", label: `All Tickets (${tickets.length})` },
            { key: "ACTIVE", label: `Active (${tickets.filter((t) => t.status !== "Resolved").length})` },
            { key: "RESOLVED", label: `Resolved (${tickets.filter((t) => t.status === "Resolved").length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-[#0B2559] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ticket ID, Company or Category..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-[#C59B27]"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => {
          const isCritical = ticket.priority === "Critical";
          const isResolved = ticket.status === "Resolved";

          return (
            <div
              key={ticket.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-[#C59B27] transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-[#0B2559] dark:text-white tracking-wide">
                    {ticket.id}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      ticket.pillar === "CS"
                        ? "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200"
                        : ticket.pillar === "CA"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-200"
                    }`}
                  >
                    {ticket.pillar === "CS" ? "CS Secretarial" : ticket.pillar === "CA" ? "CA / Tax" : "Corporate Law"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isCritical
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-extrabold"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    Priority: {ticket.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">{ticket.createdAt}</span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      isResolved
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {isResolved ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>{ticket.status}</span>
                  </span>
                </div>
              </div>

              {/* Company & Category */}
              <div>
                <h3 className="text-base font-extrabold text-[#0B2559] dark:text-white">
                  {ticket.companyName} · <span className="text-[#C59B27]">{ticket.category}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-normal">
                  {ticket.description}
                </p>
              </div>

              {/* Resolution Note if present */}
              {ticket.resolutionNote && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <span className="font-extrabold text-[11px] uppercase tracking-wider block text-emerald-700 dark:text-emerald-400">
                    Resolution Memo:
                  </span>
                  <p>{ticket.resolutionNote}</p>
                </div>
              )}

              {/* Footer Meta */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-300">Assigned Professional:</span>
                  <span className="text-[#0B2559] dark:text-white font-bold">{ticket.assignedExpert}</span>
                </div>

                <button
                  onClick={() => {
                    const chatBtn = document.getElementById("corpsetu-chat-trigger");
                    if (chatBtn) chatBtn.click();
                  }}
                  className="text-xs font-bold text-[#C59B27] hover:underline flex items-center gap-1"
                >
                  <span>Chat with Expert on this Ticket</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Complaint Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#0B2559] dark:text-white">Register Corporate Grievance</h2>
              <p className="text-xs text-slate-500">
                Submit your complaint or escalation regarding your company. We assign a senior partner immediately.
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Company / Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Lumora Technologies Pvt Ltd"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Service Pillar *
                  </label>
                  <select
                    value={formData.pillar}
                    onChange={(e) => setFormData({ ...formData, pillar: e.target.value as any })}
                    className="w-full glass-input text-xs font-bold"
                  >
                    <option value="CS">CS Secretarial & MCA</option>
                    <option value="CA">CA & Tax Compliance</option>
                    <option value="LAW">Corporate Legal</option>
                    <option value="GENERAL">Billing & Governance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Urgency Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full glass-input text-xs font-bold"
                  >
                    <option value="Standard">Standard (Within 24h)</option>
                    <option value="High">High (Within 6h)</option>
                    <option value="Critical">Critical Statutory Risk (2h)</option>
                    <option value="Low">Low / General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Issue Category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. MCA Resubmission, GST ITC Mismatch, Contract Revision"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Detailed Grievance Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the statutory problem, notice received, or pending issue in detail..."
                  className="w-full glass-input text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full corpsetu-btn-navy text-xs py-3 justify-center shadow-md font-bold"
              >
                Submit Grievance & Dispatch to Expert
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
