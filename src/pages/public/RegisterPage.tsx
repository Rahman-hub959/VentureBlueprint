import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  Phone,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Edit3,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/client";
import { CorpSetuLogo } from "../../components/CorpSetuLogo";

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  
  // 6-digit OTP state
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  
  // Resend countdown timer
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Timer countdown hook for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Clean phone input (digits only, max 10 or with +91)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d+]/g, "");
    setPhoneNumber(val);
  };

  // Step 1: Submit Details -> Request OTP
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const cleanDigits = phoneNumber.replace(/\D/g, "").slice(-10);
    if (cleanDigits.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.sendSignupOtp({
        phone_number: phoneNumber,
        email: email.trim(),
      });

      setMaskedPhone(res.masked_phone || `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`);
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setStep("otp");
      setCountdown(60);
      setCanResend(false);
      setSuccessMsg("Verification code dispatched to your mobile number.");
      // Focus first OTP input on next render
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle individual OTP box typing
  const handleOtpChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-advance to next box if character entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation across OTP boxes
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle clipboard paste (e.g. user copies 6-digit SMS code)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || "";
      }
      setOtp(newOtp);
      const nextIdx = Math.min(pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
    }
  };

  // Quick helper to fill test dev OTP
  const handleAutoFillDevOtp = (code: string) => {
    const chars = code.slice(0, 6).split("");
    const newOtp = ["", "", "", "", "", ""];
    chars.forEach((c, idx) => {
      newOtp[idx] = c;
    });
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setError("");
    setResending(true);

    try {
      const res = await authApi.sendSignupOtp({
        phone_number: phoneNumber,
        email: email.trim(),
      });
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setCountdown(60);
      setCanResend(false);
      setSuccessMsg("A fresh 6-digit code has been sent.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || "Failed to resend code. Please wait a moment.");
    } finally {
      setResending(false);
    }
  };

  // Step 2: Submit OTP & Complete Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email: email.trim(),
        password,
        phone_number: phoneNumber,
        otp: fullCode,
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "OTP verification failed. Please recheck the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-colors">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <CorpSetuLogo size="xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B2559] dark:text-white tracking-tight">
            {step === "details" ? "Create Your Account" : "Verify Mobile Number"}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {step === "details"
              ? "Join CorpSetu — Law, CS & CA compliance platform"
              : `Enter the 6-digit verification code sent to ${maskedPhone || phoneNumber}`}
          </p>
        </div>

        {/* Step Indicator Pill */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
              step === "details"
                ? "bg-[#0B2559] text-white"
                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {step === "otp" && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>1. Account Details</span>
          </div>
          <span className="text-slate-400">→</span>
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
              step === "otp"
                ? "bg-[#C59B27] text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Mobile OTP</span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Success / Status Notification */}
        {successMsg && !error && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Details Collection Form */}
        {step === "details" && (
          <form onSubmit={handleInitiateSignup} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                Full Name *
              </label>
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
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full glass-input !pl-11 focus:!border-[#C59B27]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                Email Address *
              </label>
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
                  placeholder="founder@yourcompany.in"
                  className="w-full glass-input !pl-11 focus:!border-[#C59B27]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Mobile Number *
                </label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Verified via OTP
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  autoComplete="off"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  className="w-full glass-input !pl-11 focus:!border-[#C59B27]"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Your direct advisory line for CA, CS, and Law consultations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                Password *
              </label>
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
              className="w-full corpsetu-btn-navy justify-center text-xs py-3 mt-2 shadow-md font-bold flex items-center gap-2"
            >
              {loading ? "Sending Verification Code..." : "Verify Mobile & Continue →"}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Verification Form */}
        {step === "otp" && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5 animate-fadeIn">
            {/* Phone Info & Edit Option */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Phone className="w-4 h-4 text-[#C59B27]" />
                <span className="font-mono font-bold">{maskedPhone || phoneNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-[#C59B27] hover:text-[#0B2559] dark:hover:text-[#E5B842] font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {/* Dev Sandbox Helper */}
            {devOtp && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C59B27] animate-pulse" />
                  <span>
                    Test OTP: <strong className="font-mono text-sm tracking-wider">{devOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAutoFillDevOtp(devOtp)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#C59B27] hover:bg-[#B38A20] text-white rounded-lg shadow-sm transition-colors"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* 6-box OTP Input */}
            <div>
              <label className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                Enter 6-Digit OTP
              </label>
              <div className="flex justify-center items-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono text-[#0B2559] dark:text-white bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#C59B27] focus:ring-2 focus:ring-[#C59B27]/20 outline-none transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* Resend Timer & Action */}
            <div className="text-center text-xs">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-[#C59B27] dark:text-[#E5B842] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  {resending ? "Resending code..." : "Resend OTP"}
                </button>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Resend code in <strong className="text-[#0B2559] dark:text-[#C59B27]">00:{countdown.toString().padStart(2, "0")}</strong>
                </span>
              )}
            </div>

            {/* Submit Verification */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="w-full corpsetu-btn-gold justify-center text-xs py-3 shadow-md font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying & Registering..." : "Verify & Complete Registration ✓"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setError("");
                  setSuccessMsg("");
                }}
                className="w-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs py-1.5 font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to edit details</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer links */}
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
