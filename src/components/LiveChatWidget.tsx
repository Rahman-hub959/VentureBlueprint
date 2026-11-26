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
      placeholder: "Ask Adv. Rajesh about contracts, equity sharing, trademark, IP...",
      faqs: [
        { q: "How should founder shares and equity be split?", topic: "vesting" },
        { q: "How do I trademark my brand name and logo?", topic: "trademark" },
        { q: "When do I need a Non-Disclosure Agreement (NDA)?", topic: "nda" },
        { q: "How do I protect my website or app source code?", topic: "ip_assignment" },
        { q: "Can an ex-founder start a competing business?", topic: "non_compete" },
        { q: "What happens if two 50-50 co-founders disagree?", topic: "deadlock" }
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
      placeholder: "Ask CS Priyanjali about company name, registration, DIN, ROC filings...",
      faqs: [
        { q: "How do I choose and approve my company name?", topic: "name_approval" },
        { q: "What is the 180-day bank deposit rule (INC-20A)?", topic: "inc_20a" },
        { q: "When should I appoint my first company auditor?", topic: "adt_1" },
        { q: "How do new directors get their DIN number?", topic: "din_spice" },
        { q: "What official registers and records must I keep?", topic: "registers" },
        { q: "What are the yearly ROC filing deadlines?", topic: "annual_roc" }
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
      placeholder: "Ask CA Aniket about GST, tax saving, audit, vendor payments...",
      faqs: [
        { q: "Do I need GST for my new business?", topic: "gst_threshold" },
        { q: "When do I have to pay Income Tax & Advance Tax?", topic: "advance_tax" },
        { q: "What are the monthly GST filing dates?", topic: "gst_dates" },
        { q: "How do I save tax and claim GST refunds (ITC)?", topic: "itc_reconciliation" },
        { q: "Do I need an audit if my company has zero revenue?", topic: "statutory_audit" },
        { q: "How much TDS should I cut when paying vendors or freelancers?", topic: "tds_rates" }
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
      if (q.includes("name") || q.includes("choose") || q.includes("rule 8") || q.includes("spice+ part a")) {
        return "Choosing and Approving Your Company Name:\n\n1. Name Structure: Must have a distinctive unique word + your main activity (e.g. Solutions, Technologies) + suffix 'Private Limited' or 'LLP'.\n2. Avoid Rejections: Check that your name is not identical to existing companies on MCA or active registered trademarks.\n3. Approval Window: We submit your top 2 name preferences via MCA SPICe+ Part A / RUN. Once approved, the name is reserved for 20 days to complete registration.";
      }
      if (q.includes("inc-20a") || q.includes("180") || q.includes("bank") || q.includes("commencement")) {
        return "The 180-Day Bank Deposit Rule (Form INC-20A):\n\n• What is it? Within 180 days of company registration, every shareholder must deposit their promised share capital money into the company bank account.\n• Proof needed: A bank statement showing the money deposit must be filed with MCA in Form INC-20A.\n• Why it matters: You cannot legally start business operations or borrow money before filing this. Filing on time avoids a ₹50,000 penalty.";
      }
      if (q.includes("adt-1") || q.includes("auditor") || q.includes("appoint") || q.includes("30 days")) {
        return "Appointing Your First Company Auditor:\n\n• Mandatory Deadline: The Board of Directors must appoint your first Statutory Auditor (Chartered Accountant) within 30 days of registration.\n• Form ADT-1: Filed with the ROC along with the CA's consent letter and eligibility certificate.\n• Tenure: The first auditor holds office until the conclusion of your first Annual General Meeting (AGM).";
      }
      if (q.includes("din") || q.includes("director")) {
        return "Getting a Director Identification Number (DIN):\n\n• Instant Application: Up to 3 new directors can apply for their DIN directly inside the company registration application (SPICe+ Part B).\n• Documents Needed: Self-attested PAN card, Identity proof (Aadhaar/Passport/Voter ID), and latest Address proof (Bank statement or utility bill < 2 months old).\n• Existing DIN: If you already have a DIN from another company, you simply enter your existing DIN number.";
      }
      if (q.includes("register") || q.includes("record") || q.includes("88")) {
        return "Mandatory Company Registers and Records:\n\nUnder Company Law, every registered company must keep organized registers at its registered office:\n1. Register of Members (Shareholders list and share counts)\n2. Register of Directors and Key Managerial Personnel\n3. Register of Charges (Bank loans / security created)\n4. Minutes Book: Signed records of Board Meetings and AGM decisions.";
      }
      if (q.includes("annual") || q.includes("yearly") || q.includes("deadline") || q.includes("aoc-4") || q.includes("mgt-7")) {
        return "Yearly ROC Filing Deadlines:\n\nEvery year, your company completes 3 main statutory filings:\n• Form AOC-4 (Financial Statements): Due within 30 days of AGM (usually by Oct 30).\n• Form MGT-7/7A (Annual Return): Due within 60 days of AGM (usually by Nov 29).\n• Form DIR-3 KYC (Director verification): Due every year by September 30.\n\nFiling on time saves ₹100/day per form in late penalty fees.";
      }
      return `Thank you for your secretarial query regarding "${text}". As your assigned Company Secretary, our team will review your requirements, draft the necessary board resolutions, and handle the official MCA/ROC filing smoothly for you.`;
    }

    if (expert === "CA") {
      if (q.includes("gst") && (q.includes("need") || q.includes("threshold") || q.includes("mandatory") || q.includes("turnover") || q.includes("new business"))) {
        return "Do you need GST for your new business?\n\n• For Service Businesses (Tech, Consulting, Agencies): Mandatory once your yearly sales cross ₹20 Lakhs (₹10L in special northeast states).\n• For Goods/Products (Trading, Manufacturing): Mandatory once your yearly sales cross ₹40 Lakhs.\n• Selling Online or Out of State: Mandatory from Day 1 if you sell via Amazon/Flipkart or sell to clients outside your home state.\n\n💡 Founder Tip: Even if your sales are ₹0, registering voluntarily lets you claim back all the 18% GST you spend on laptops, office rent, AWS servers, and consultant fees!";
      }
      if (q.includes("advance tax") || q.includes("income tax") || q.includes("pay") || q.includes("208") || q.includes("installment")) {
        return "When do you have to pay Income Tax & Advance Tax?\n\nIf your company's estimated tax for the year is over ₹10,000, you cannot wait until year-end. You pay Advance Tax in 4 quarterly installments:\n\n1. 15% of tax by June 15th\n2. 45% of tax by September 15th\n3. 75% of tax by December 15th\n4. 100% of tax by March 15th\n\n💡 Founder Tip: Paying these 4 installments on time avoids the 1% per month interest penalty.";
      }
      if (q.includes("date") || q.includes("monthly") || q.includes("gstr-1") || q.includes("gstr-3b")) {
        return "Monthly GST Filing Deadlines:\n\nEvery registered business has two routine monthly filings:\n\n• GSTR-1 (Sales Summary): Due by the 11th of every month (details of all bills you issued to clients).\n• GSTR-3B (Tax Payment): Due by the 20th of every month (you calculate sales GST, subtract input GST, and pay the balance).\n\n💡 Important: Even if you had ₹0 sales in a month, you must file a NIL return. Skipping it costs ₹50/day in late fees.";
      }
      if (q.includes("save") || q.includes("credit") || q.includes("itc") || q.includes("refund") || q.includes("gstr-2b")) {
        return "How to Save Tax with Input Tax Credit (ITC):\n\nWhenever you purchase business supplies (laptops, software, internet, rent, packaging), the GST you paid is NOT an expense — it is an asset!\n\n• How it works: If you collect ₹50,000 GST from a client, but already paid ₹30,000 GST on your expenses, you only pay ₹20,000 to the government!\n• Key Requirement: The vendor must file their GST return so the invoice reflects in your official GSTR-2B statement. Always give vendors your official company GST number.";
      }
      if (q.includes("audit") || q.includes("zero") || q.includes("revenue") || q.includes("loss") || q.includes("statutory audit")) {
        return "Do you need an audit if your company has zero revenue or losses?\n\n• Private Limited Company: YES, mandatory. Under Section 139 of the Companies Act, every Private Limited company MUST be audited annually by an independent Chartered Accountant, even with ₹0 income.\n• Limited Liability Partnership (LLP): Audit is only required if turnover exceeds ₹40 Lakhs or capital contribution exceeds ₹25 Lakhs.\n\n💡 Founder Tip: We offer affordable NIL annual audit and tax filing packages for early-stage startups.";
      }
      if (q.includes("tds") || q.includes("vendor") || q.includes("freelancer") || q.includes("contractor") || q.includes("cut") || q.includes("194")) {
        return "How much TDS should you cut when paying vendors or freelancers?\n\nWhen paying service providers, you must deduct tax (TDS) and deposit it with the government:\n\n• Freelancers & Technical Services (Section 194J): Deduct 2% for IT/tech development, or 10% for legal/accounting/marketing advisory.\n• Contractors & Vendors (Section 194C): Deduct 1% if paying an individual, or 2% if paying a company/firm (applicable if a bill is > ₹30,000 or annual payments > ₹1,00,000).\n• Due Date: Deposited by the 7th of the following month.";
      }
      return `Thank you for your tax inquiry regarding "${text}". As your empanelled Chartered Accountant, I will review your books, calculate your tax credits, and ensure all filings adhere strictly to ICAI standards.`;
    }

    // ADV (Corporate Law)
    if (q.includes("vesting") || q.includes("shares") || q.includes("equity") || q.includes("split")) {
      return "How should Founder Shares and Equity be split?\n\n• The standard best practice is a 4-Year Vesting Schedule with a 1-Year Cliff:\n1. Year 1 (Cliff): 0% vests until completing 12 months with the company.\n2. Month 12: 25% of total shares vest in a lump sum.\n3. Years 2-4: The remaining 75% vests gradually each month or quarter.\n\n💡 Why this matters: If a co-founder leaves after 6 months, they walk away without 50% of the company, protecting the active founders and future investors.";
    }
    if (q.includes("trademark") || q.includes("brand") || q.includes("logo") || q.includes("class")) {
      return "How to Trademark Your Brand Name and Logo:\n\n• Step 1: Conduct a trademark search across the IP India portal to ensure no matching phonetic names exist.\n• Step 2: Choose the right classes:\n  - Class 9: Mobile apps, downloadable software\n  - Class 35: E-commerce platforms, consulting services\n  - Class 42: SaaS, cloud software, IT development\n• Step 3: File TM-A. You can use the '™' symbol from Day 1 of filing!";
    }
    if (q.includes("nda") || q.includes("non-disclosure") || q.includes("confidential")) {
      return "When do you need a Non-Disclosure Agreement (NDA)?\n\n• You need an NDA before sharing business ideas, software code, customer lists, or financial data with:\n1. Potential co-founders or advisors\n2. External freelance developers or agencies\n3. Strategic vendors or corporate partners\n\nAn effective NDA defines what is confidential, restricts use solely to evaluating the project, and lasts for 2 to 3 years.";
    }
    if (q.includes("ip") || q.includes("code") || q.includes("source") || q.includes("website") || q.includes("app")) {
      return "Protecting Your Website or App Source Code (IP):\n\n• Common Pitfall: If founders write code or hire freelancers before the company is registered, the intellectual property legally belongs to the individuals, NOT the company!\n• Solution: Execute an IP Assignment Agreement transferring all software, designs, and domain rights to the company entity. Investors will insist on seeing this before funding.";
    }
    if (q.includes("non-compete") || q.includes("competing") || q.includes("ex-founder") || q.includes("compete")) {
      return "Can an ex-founder start a competing business?\n\n• Under Section 27 of the Indian Contract Act, non-compete clauses after leaving a job are generally not enforceable in court.\n• What IS Enforceable: Non-solicitation (they cannot poach your team or clients) and strict Non-Disclosure (they cannot use your code, trade secrets, or customer data). Also, non-compete clauses while they are still a director or shareholder are 100% enforceable.";
    }
    if (q.includes("deadlock") || q.includes("50:50") || q.includes("disagree") || q.includes("co-founders")) {
      return "What happens if two 50-50 Co-Founders disagree?\n\n• The 50:50 Trap: When two equal founders disagree on a major decision, the board reaches a deadlock and the company can become completely paralyzed.\n• Solutions we draft in your Founders Agreement:\n1. Casting Vote or Domain Split (e.g. CEO decides product, CTO decides tech).\n2. Independent Advisory Tie-Breaker.\n3. Shotgun / Buy-Sell Clause: One founder offers a set price to buy the other's shares, and the other can choose to sell or buy at that same price.";
    }
    return `Thank you for consulting on "${text}". As your corporate legal counsel, I will review your agreements, ensure founder protections, and prepare clear contracts to keep your business safe.`;
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
              Common Questions for {currentExpert.name} ({currentExpert.role.includes('&') ? currentExpert.role.split('&')[0].trim() : currentExpert.role}):
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
