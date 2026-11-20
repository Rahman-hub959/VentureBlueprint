import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoFounder = () => {
    setEmail("founder@ventureblueprint.in");
    setPassword("Founder@Venture2026!");
  };

  const fillDemoAdmin = () => {
    setEmail("admin@ventureblueprint.in");
    setPassword("Admin@Venture2026!");
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-colors">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white mx-auto border border-emerald-400 shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Sign in to your VentureBlueprint workspace</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@ventureblueprint.in"
                className="w-full glass-input pl-10"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button-primary justify-center text-xs py-3 mt-2 shadow-md font-bold"
          >
            {loading ? "Authenticating..." : "Sign In to Workspace"}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider block font-bold text-center">
            Quick-Fill Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoFounder}
              className="px-2.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 transition-colors"
            >
              Demo Founder
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="px-2.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-[11px] font-bold text-blue-800 dark:text-blue-300 transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
