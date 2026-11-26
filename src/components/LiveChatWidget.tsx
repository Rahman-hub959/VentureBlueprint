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
  FileSpreadsheet
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "expert" | "system";
  expertType?: "ADV" | "CS" | "CA";
  text: string;
  timestamp: string;
}

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeExpert, setActiveExpert] = useState<"ADV" | "CS" | "CA">("CS");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "system",
      text: "Welcome to CorpSetu Live Expert Desk. Our certified Advocate, CS, and CA professionals are online to assist you.",
      timestamp: "Just now",
    },
    {
      id: "msg-2",
      sender: "expert",
      expertType: "CS",
      text: "Hello! I am Priyanjali, Company Secretary. How can I help you with your company formation, MCA SPICe+ filing, or secretarial compliance today?",
      timestamp: "Just now",
    },
  ]);

  const expertDetails = {
    ADV: {
      name: "Adv. Rajesh Varma",
      role: "Corporate Advocate",
      avatarColor: "bg-blue-600",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: Scale,
      placeholder: "Ask about contracts, founder vesting, trademark, legal notices...",
    },
    CS: {
      name: "CS Priyanjali Sen",
      role: "Practicing Company Secretary",
      avatarColor: "bg-[#C59B27]",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      icon: Building2,
      placeholder: "Ask about company registration, SPICe+, ROC AOC-4, director KYC...",
    },
    CA: {
      name: "CA Aniket Kulkarni",
      role: "Chartered Accountant",
      avatarColor: "bg-emerald-600",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      icon: FileSpreadsheet,
      placeholder: "Ask about GST returns, advance tax, bookkeeping, financial audit...",
    },
  };

  const currentExpert = expertDetails[activeExpert];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputText.trim();
    setInputText("");
    setIsTyping(true);

    // Simulated intelligent expert response
    setTimeout(() => {
      let reply = "";
      if (activeExpert === "CS") {
        if (query.toLowerCase().includes("name") || query.toLowerCase().includes("spice")) {
          reply = "For company name reservation under SPICe+ Part A, MCA Rule 8 requires a unique prefix and specific activity suffix. I can run our compliance validator on your proposed name right now!";
        } else if (query.toLowerCase().includes("cost") || query.toLowerCase().includes("fee")) {
          reply = "Government SPICe+ incorporation fees are waived (₹0) up to ₹15 Lakhs authorized capital under Rule 38. You only pay nominal state stamp duty and Class 3 DSC tokens.";
        } else {
          reply = `Thank you for sharing. Regarding "${query}", as your assigned CS, I will review your project documents and prepare the required board resolutions or filings accordingly.`;
        }
      } else if (activeExpert === "CA") {
        if (query.toLowerCase().includes("gst")) {
          reply = "For GST registration, if your turnover exceeds ₹20 Lakhs (services) or ₹40 Lakhs (goods), registration is mandatory. GSTR-3B monthly return is due on the 20th of every month.";
        } else if (query.toLowerCase().includes("audit") || query.toLowerCase().includes("tax")) {
          reply = "Under Section 139 of the Companies Act, appointment of the first statutory auditor via Form ADT-1 is required within 30 days of incorporation.";
        } else {
          reply = `Noted. I have updated your CA compliance checklist for "${query}". Our accounting team can reconcile your ledger and prepare the statutory filing.`;
        }
      } else {
        // ADV (Legal)
        if (query.toLowerCase().includes("contract") || query.toLowerCase().includes("agreement") || query.toLowerCase().includes("founder")) {
          reply = "For founder agreements, we enforce 4-year vesting with a 1-year cliff, non-compete clauses, and IP assignment to the entity to protect equity against departures.";
        } else if (query.toLowerCase().includes("trademark")) {
          reply = "For brand protection, we file TM-A under the appropriate Nice Classification (e.g., Class 9/42 for software or Class 35 for commerce) with instant application priority.";
        } else {
          reply = `As your corporate legal counsel, I recommend drafting an official indemnity and NDA for "${query}" before formal signing.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `exp-${Date.now()}`,
          sender: "expert",
          expertType: activeExpert,
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          id="corpsetu-chat-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-3 p-3.5 sm:px-5 sm:py-3.5 rounded-full bg-[#0B2559] hover:bg-[#061838] text-white shadow-2xl border-2 border-[#C59B27] transition-all hover:scale-105 active:scale-95 group"
          aria-label="Open Live Chat"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-[#C59B27]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0B2559] animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Expert Live Desk</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#C59B27] text-white font-extrabold uppercase">
                3 Online
              </span>
            </span>
            <span className="text-[10px] text-slate-300">Law · CS · CA Assistance</span>
          </div>
        </button>
      </div>

      {/* Slide-in Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] h-[520px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#0B2559] text-white p-4 flex items-center justify-between border-b border-[#C59B27]/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-[#C59B27]">
                <currentExpert.icon className="w-5 h-5 text-[#C59B27]" />
              </div>
              <div>
                <div className="text-sm font-extrabold flex items-center gap-2">
                  <span>{currentExpert.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[11px] text-[#C59B27] font-semibold">{currentExpert.role}</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Expert Switcher Tabs */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 grid grid-cols-3 gap-1 border-b border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveExpert("CS")}
              className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeExpert === "CS"
                  ? "bg-white dark:bg-slate-900 text-[#0B2559] dark:text-[#C59B27] shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>CS Desk</span>
            </button>

            <button
              onClick={() => setActiveExpert("CA")}
              className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeExpert === "CA"
                  ? "bg-white dark:bg-slate-900 text-[#0B2559] dark:text-[#C59B27] shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CA Desk</span>
            </button>

            <button
              onClick={() => setActiveExpert("ADV")}
              className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeExpert === "ADV"
                  ? "bg-white dark:bg-slate-900 text-[#0B2559] dark:text-[#C59B27] shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Law Desk</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((m) => {
              if (m.sender === "system") {
                return (
                  <div key={m.id} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 text-center font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#C59B27] inline mr-1.5 -mt-0.5" />
                    {m.text}
                  </div>
                );
              }

              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      isUser
                        ? "bg-[#0B2559] text-white rounded-tr-xs"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    {!isUser && m.expertType && (
                      <div className="text-[10px] font-extrabold text-[#C59B27] uppercase tracking-wider mb-1">
                        {expertDetails[m.expertType].role}
                      </div>
                    )}
                    <p className="leading-relaxed font-normal">{m.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B27] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B27] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59B27] animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[10px] scrollbar-none">
            <button
              onClick={() => setInputText("What are MCA registration government fees?")}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-[#C59B27] hover:text-white transition-colors"
            >
              MCA Govt Fees?
            </button>
            <button
              onClick={() => setInputText("How do I draft a Co-Founder Agreement?")}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-[#C59B27] hover:text-white transition-colors"
            >
              Co-Founder Agreement
            </button>
            <button
              onClick={() => setInputText("When is GST GSTR-3B return due?")}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:bg-[#C59B27] hover:text-white transition-colors"
            >
              GST Due Date?
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={currentExpert.placeholder}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#C59B27]"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#0B2559] hover:bg-[#061838] disabled:opacity-50 text-white transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4 text-[#C59B27]" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;
