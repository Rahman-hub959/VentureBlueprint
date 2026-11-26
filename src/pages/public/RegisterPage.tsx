import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User, AlertCircle, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CorpSetuLogo } from "../../components/CorpSetuLogo";

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        phone_number: phoneNumber || undefined
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please check inputs.");
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
          <h1 className="text-2xl font-extrabold text-[#0B2559] dark:text-white tracking-tight">Create Your Account</h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Join CorpSetu — Law, CS & CA compliance platform
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoComplete="off"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full glass-input !pl-11 focus:!border-[#C59B27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full glass-input !pl-11 focus:!border-[#C59B27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Phone Number (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                autoComplete="off"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full glass-input !pl-11 focus:!border-[#C59B27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 8 characters)"
                className="w-full glass-input !pl-11 focus:!border-[#C59B27]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full corpsetu-btn-navy justify-center text-xs py-3 mt-2 shadow-md font-bold"
          >
            {loading ? "Creating Account..." : "Create CorpSetu Account"}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-[#C59B27] dark:text-[#E5B842] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
