import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Users,
  CheckCheck,
  Sparkles,
  Paperclip,
  Clock,
  ShieldCheck,
  Scale,
  Building2,
  FileSpreadsheet,
  Download,
  Search,
  Calendar,
  AlertCircle,
  HelpCircle,
  PhoneCall
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "expert" | "system";
  expertType?: "ADV" | "CS" | "CA";
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    action: () => void;
  };
}

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeExpert, setActiveExpert] = useState<"ADV" | "CS" | "CA">("CS");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const expertDetails = {
    ADV: {
      name: "Adv. Rajesh Varma",
      qual: "LL.M (Corporate Law) · Bar Council #KAR/2012/842",
      role: "Corporate & IP Advocate",
      experience: "14+ Yrs Practice",
      avatarColor: "bg-blue-600",
      badgeColor: "bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200 border-blue-200 dark:border-blue-700",
      icon: Scale,
      placeholder: "Ask Adv. Rajesh about contracts, vesting, trademark, IP protection...",
      faqs: [
        { q: "How does 4-year vesting with a 1-year cliff work?", topic: "vesting" },
        { q: "Which Trademark class applies to software & SaaS?", topic: "trademark" },
        { q: "What clauses are essential in an NDA?", topic: "nda" },
        { q: "How to legally assign pre-incorporation IP?", topic: "ip_assignment" },
        { q: "Are Non-Compete clauses enforceable in India?", topic: "non_compete" },
        { q: "How to resolve a 50:50 founder deadlock?", topic: "deadlock" }
      ]
    },
    CS: {
      name: "CS Priyanjali Sen",
      qual: "FCS #11428 · Practicing Company Secretary",
      role: "Company Secretary (MCA & ROC)",
      experience: "12+ Yrs Practice",
      avatarColor: "bg-[#C59B27]",
      badgeColor: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border-amber-200 dark:border-amber-700",
      icon: Building2,
      placeholder: "Ask CS Priyanjali about SPICe+, RUN name approval, INC-20A, ADT-1...",
      faqs: [
        { q: "What are the rules for SPICe+ Part A name approval?", topic: "name_approval" },
        { q: "How to file Form INC-20A within 180 days?", topic: "inc_20a" },
        { q: "When must Statutory Auditor Form ADT-1 be filed?", topic: "adt_1" },
        { q: "How many directors can get DIN in SPICe+ Part B?", topic: "din_spice" },
        { q: "What statutory registers are mandatory under §88?", topic: "registers" },
        { q: "What are the annual ROC filing deadlines (AOC-4 / MGT-7)?", topic: "annual_roc" }
      ]
    },
    CA: {
      name: "CA Aniket Kulkarni",
      qual: "FCA #418290 · Chartered Accountant",
      role: "Chartered Accountant & Tax Controller",
      experience: "15+ Yrs Practice",
      avatarColor: "bg-emerald-600",
      badgeColor: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
      icon: FileSpreadsheet,
      placeholder: "Ask CA Aniket about GST returns, advance tax, TDS, statutory audit...",
      faqs: [
        { q: "When is GST registration mandatory (₹20L vs ₹40L)?", topic: "gst_threshold" },
        { q: "How is Advance Tax calculated under Section 208?", topic: "advance_tax" },
        { q: "What are monthly due dates for GSTR-1 and GSTR-3B?", topic: "gst_dates" },
        { q: "How to match Input Tax Credit (ITC) with GSTR-2B?", topic: "itc_reconciliation" },
        { q: "Is Statutory Audit mandatory for Private Limited companies?", topic: "statutory_audit" },
        { q: "What TDS rate applies to contractors vs professionals?", topic: "tds_rates" }
      ]
    },
  };

  const currentExpert = expertDetails[activeExpert];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "system",
      text: "Welcome to CorpSetu Live Advisory Desk. Verified Advocate, CS, and CA professionals are online to assist with your statutory and legal inquiries.",
      timestamp: "Just now",
    },
    {
      id: "msg-2",
      sender: "expert",
      expertType: "CS",
      text: "Hello! I am CS Priyanjali Sen (FCS #11428). How can I assist you with company incorporation under MCA SPICe+, RUN name reservation, or post-incorporation ROC compliance today?",
      timestamp: "Just now",
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const switchExpert = (type: "ADV" | "CS" | "CA") => {
    setActiveExpert(type);
    const exp = expertDetails[type];
    const greeting: Message = {
      id: `sys-${Date.now()}`,
      sender: "expert",
      expertType: type,
      text: `Hello! I am ${exp.name} (${exp.qual}). You are now connected with our ${exp.role} desk. What can I help you resolve?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, greeting]);
  };

  const getExpertAnswer = (expert: "ADV" | "CS" | "CA", text: string): string => {
    const q = text.toLowerCase();

    if (expert === "CS") {
      if (q.includes("name") || q.includes("rule 8") || q.includes("spice+ part a")) {
        return "Under Rule 8 of the Companies (Incorporation) Rules 2014, your corporate name must have three parts: (1) A unique distinctive prefix, (2) An activity noun reflecting your main object (e.g. Technologies, Solutions), and (3) The statutory suffix 'Private Limited' or 'LLP'. SPICe+ Part A reservations are reviewed by the Central Registration Centre (CRC) and are valid for 20 days upon approval.";
      }
      if (q.includes("inc-20a") || q.includes("commencement") || q.includes("180")) {
        return "Section 10A requires every newly incorporated company to file Form INC-20A (Declaration of Commencement of Business) within 180 days of the Certificate of Incorporation (COI). Before filing, each subscriber must deposit their subscribed equity capital into the corporate bank account, and bank statement proofs must be attached. Failure to file attracts ₹50,000 fine and risk of ROC strike-off.";
      }
      if (q.includes("adt-1") || q.includes("auditor appointment") || q.includes("30 days")) {
        return "Under Section 139(6) of the Companies Act, 2013, the Board of Directors must appoint the company's first Statutory Auditor within 30 days of incorporation. Form ADT-1 should be filed with ROC within 15 days of that board meeting, attaching the auditor's written consent and eligibility certificate under Section 141.";
      }
      if (q.includes("din") || q.includes("director")) {
        return "Up to 3 new directors can apply for their Director Identification Number (DIN) directly inside the unified SPICe+ Part B form without needing separate DIR-3 filings. Ensure identity and address proofs (PAN, Aadhaar/Passport, Utility bill) are certified by a practicing CS or CA.";
      }
      if (q.includes("register") || q.includes("88") || q.includes("statutory registers")) {
        return "Under Section 88 of the Companies Act, companies must maintain: (1) Register of Members (Form MGT-1), (2) Register of Debenture holders, (3) Register of Directors & KMP, and (4) Register of Charges (CHG-7). These must be kept at the registered office and updated after every allotment or transfer.";
      }
      if (q.includes("annual") || q.includes("aoc-4") || q.includes("mgt-7")) {
        return "Annual ROC compliance requires convening an AGM within 6 months of fiscal close (by Sept 30), followed by filing Form AOC-4 (Financial Statements & Board's Report) within 30 days of AGM, and Form MGT-7/7A (Annual Return) within 60 days of AGM. Delays incur additional fees of ₹100 per day.";
      }
      return `Thank you for your secretarial query regarding "${text}". As your assigned CS, our team will review the applicable MCA21 regulations, prepare the requisite board minutes/resolutions, and guide you through the verified CRC statutory filing procedure.`;
    }

    if (expert === "CA") {
      if (q.includes("gst") && (q.includes("threshold") || q.includes("mandatory") || q.includes("turnover"))) {
        return "GST registration is mandatory under Section 22 of the CGST Act if aggregate annual turnover exceeds ₹20 Lakhs for service providers (₹10 Lakhs in Special Category states) or ₹40 Lakhs for goods suppliers. Voluntary registration is recommended for startups to claim Input Tax Credit (ITC) on capital assets, cloud hosting, and professional services.";
      }
      if (q.includes("advance tax") || q.includes("208") || q.includes("211")) {
        return "Under Section 208 of the Income Tax Act, every company whose estimated tax liability exceeds ₹10,000 must pay Advance Tax in 4 quarterly installments: 15% by 15th June, 45% by 15th September, 75% by 15th December, and 100% by 15th March. Late or deficient payments attract statutory interest under Sections 234B and 234C.";
      }
      if (q.includes("date") || q.includes("gstr-1") || q.includes("gstr-3b")) {
        return "Standard GST compliance schedule: Form GSTR-1 (monthly outward supplies) is due by the 11th of every month. Form GSTR-3B (summary return and net tax settlement) is due by the 20th of every month. Late filing attracts ₹50/day (₹20/day for NIL returns) plus 18% annual interest on delayed cash tax payments.";
      }
      if (q.includes("itc") || q.includes("gstr-2b") || q.includes("reconcil")) {
        return "Rule 36(4) restricts Input Tax Credit (ITC) claims strictly to invoices auto-populated in Form GSTR-2B. Invoices missing from your vendor's GSTR-1 cannot be claimed in GSTR-3B. We conduct automated two-way reconciliation each month to avoid tax mismatch notices (DRC-01C).";
      }
      if (q.includes("statutory audit") || q.includes("mandatory") || q.includes("zero")) {
        return "Yes, under Section 139 of the Companies Act, Statutory Audit is mandatory for all Private Limited companies, even with zero revenue or active losses. The independent Chartered Accountant must audit the books, verify compliance with Accounting Standards (AS), and issue an independent Auditor's Report.";
      }
      if (q.includes("tds") || q.includes("194c") || q.includes("194j")) {
        return "TDS deduction rates: Section 194C (contractors/vendors) is 1% for individuals/HUFs and 2% for corporate entities. Section 194J (technical and professional services) is 2% for technical fees and 10% for legal/accounting professional fees. Deposited via Challan 281 by the 7th of the following month.";
      }
      return `Thank you for your tax inquiry regarding "${text}". As your empanelled CA, we will calculate the applicable statutory tax liability, review your input tax credits, and ensure all filings adhere strictly to ICAI standards and CBDT/CBIC deadlines.`;
    }

    // ADV (Corporate Law)
    if (q.includes("vesting") || q.includes("cliff") || q.includes("equity")) {
      return "The market standard for startup founder agreements is a 4-year vesting schedule with a 1-year cliff. During the first 12 months, 0% of equity vests. On the 1-year milestone, 25% vests in lump sum, and the remaining 75% vests monthly or quarterly over the next 36 months. If a founder leaves early, unvested equity is repurchased by the company at nominal face value.";
    }
    if (q.includes("trademark") || q.includes("class") || q.includes("brand")) {
      return "For tech and internet companies, trademark protection under the Trade Marks Act 1999 typically spans: Class 9 (downloadable software, mobile apps, SaaS tokens), Class 35 (online business operations, digital marketing, corporate advisory), and Class 42 (software development, cloud computing, AI services). We conduct phonetic clearance search to avoid Section 11(1) conflict objections.";
    }
    if (q.includes("nda") || q.includes("non-disclosure") || q.includes("confidential")) {
      return "An enforceable Non-Disclosure Agreement (NDA) must clearly define: (1) Specific confidential information exclusions (public domain, independently developed), (2) Permitted use solely for evaluation, (3) Survival period (typically 2 to 3 years; perpetual for trade secrets), (4) Injunctive relief clause, and (5) Clear governing law and arbitration venue (e.g. Bengaluru/Mumbai).";
    }
    if (q.includes("ip") || q.includes("assignment") || q.includes("code")) {
      return "All software architecture, source code, designs, and business models created by founders prior to incorporation must be formally assigned to the corporate entity via a written IP Assignment Agreement. Without this, IP legally belongs to the individual founder, creating severe impediments during VC due diligence.";
    }
    if (q.includes("non-compete") || q.includes("27") || q.includes("restraint")) {
      return "Under Section 27 of the Indian Contract Act 1872, agreements in restraint of trade are void post-employment. However, non-compete covenants during the subsistence of founder directorship and shareholding are fully enforceable. Furthermore, non-solicitation and strict non-disclosure covenants remain enforceable post-exit.";
    }
    if (q.includes("deadlock") || q.includes("50:50") || q.includes("dispute")) {
      return "In equal 50:50 shareholding companies, statutory deadlocks prevent board decisions. We draft multi-tiered dispute resolution mechanisms in the Shareholders Agreement (SHA): (1) Executive negotiation, (2) Mediation, and (3) Russian Roulette / Texas Shootout buy-sell mechanism where one founder offers to buy the other's shares or sell theirs at a set valuation.";
    }
    return `Thank you for consulting on "${text}". As your corporate legal counsel, I will review the commercial implications under the Indian Contract Act and Companies Act, prepare protective indemnity and dispute resolution clauses, and ensure your business assets remain legally insulated.`;
  };

  const handleSend = (overrideQuery?: string) => {
    const query = overrideQuery || inputText.trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideQuery) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const replyText = getExpertAnswer(activeExpert, query);
      const expertMsg: Message = {
        id: `exp-${Date.now()}`,
        sender: "expert",
        expertType: activeExpert,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, expertMsg]);
      setIsTyping(false);
    }, 600);
  };

  const exportChat = () => {
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.sender === "user" ? "You" : m.expertType || "CorpSetu Desk"}: ${m.text}`
      )
      .join("\n\n");
    const blob = new Blob([`CorpSetu Advisory Desk Transcript\nGenerated: ${new Date().toLocaleString()}\n\n` + transcript], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CorpSetu_Advisory_Session_${Date.now()}.txt`;
    a.click();
  };

  return (
    <>
      {/* Floating Trigger Pill / Button */}
      {!isOpen && (
        <button
          id="corpsetu-chat-trigger"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 spatial-card-navy text-white px-5 py-3.5 rounded-full flex items-center gap-3 cursor-pointer group shadow-2xl hover:scale-105 transition-all duration-300"
          title="Open CorpSetu Live Expert Chat"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#C59B27] flex items-center justify-center font-bold text-slate-900 shadow-xs">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0B2559] animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0B2559]" />
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-extrabold tracking-tight">Live Advisory Desk</div>
            <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
              <span>Advocate · CS · CA Online</span>
            </div>
          </div>
        </button>
      )}

      {/* Spatial Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[440px] h-[85vh] sm:h-[620px] max-h-[720px] spatial-surface rounded-3xl flex flex-col overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0B2559] via-[#0D2E6E] to-[#0B2559] text-white flex flex-col gap-3 relative shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C59B27] flex items-center justify-center font-extrabold text-slate-950 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">CorpSetu Live Advisory</h3>
                  <div className="text-[10px] text-amber-200 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>3 Certified Practitioners Online</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={exportChat}
                  title="Export Transcript"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expert Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/20 rounded-xl backdrop-blur-xs text-xs">
              <button
                type="button"
                onClick={() => switchExpert("CS")}
                className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeExpert === "CS"
                    ? "bg-[#C59B27] text-white shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>CS Desk</span>
              </button>

              <button
                type="button"
                onClick={() => switchExpert("CA")}
                className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeExpert === "CA"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CA Desk</span>
              </button>

              <button
                type="button"
                onClick={() => switchExpert("ADV")}
                className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeExpert === "ADV"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Law Desk</span>
              </button>
            </div>

            {/* Active Expert Micro-Banner */}
            <div className="px-3 py-2 rounded-xl bg-white/10 text-[11px] flex items-center justify-between backdrop-blur-xs">
              <div className="min-w-0 pr-2">
                <div className="font-extrabold truncate text-white">{currentExpert.name}</div>
                <div className="text-[10px] text-amber-200 truncate">{currentExpert.qual}</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                {currentExpert.experience}
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              const isSys = msg.sender === "system";

              if (isSys) {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium inline-block shadow-2xs">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 font-semibold px-1">
                    <span>{isUser ? "You" : msg.expertType ? expertDetails[msg.expertType].name : "Practitioner"}</span>
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed shadow-xs ${
                      isUser
                        ? "bg-[#0B2559] text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs pl-2">
                <span className="font-semibold">{currentExpert.name} is typing response</span>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C59B27] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C59B27] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C59B27] animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* FAQ Quick-Prompt Chips */}
          <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block px-1">
              Quick Inquiries for {currentExpert.role}:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {currentExpert.faqs.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(f.q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/60 border border-slate-200 dark:border-slate-700 hover:border-[#C59B27] text-[11px] text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap transition-colors"
                >
                  {f.q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={currentExpert.placeholder}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#0B2559] text-white hover:bg-[#0D2E6E] disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default LiveChatWidget;
