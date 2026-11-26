import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import { apiRequest } from "../../api/client";
import { CorpSetuLogo } from "../../components/CorpSetuLogo";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-colors">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <CorpSetuLogo size="lg" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B2559] dark:text-white tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Enter your email to receive recovery instructions</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2 text-center">
            <CheckCircle2 className="w-6 h-6 text-[#C59B27] mx-auto" />
            <p className="font-medium">If an account exists with this email, recovery instructions have been recorded.</p>
            <Link to="/login" className="text-[#0B2559] dark:text-white font-bold underline block pt-2">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@ventureblueprint.in"
                  className="w-full glass-input !pl-11 focus:!border-[#C59B27]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full corpsetu-btn-navy justify-center text-xs py-3 shadow-md font-bold"
            >
              {loading ? "Sending..." : "Send Reset Instructions"}
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
          Remember your password?{" "}
          <Link to="/login" className="text-[#C59B27] dark:text-[#E5B842] font-bold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
