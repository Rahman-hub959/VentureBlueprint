import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Get in Touch
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Contact & Support</h1>
        <p className="text-slate-800 dark:text-slate-200 text-sm max-w-lg mx-auto font-medium">
          Need technical assistance with your local deployment or have questions about VentureBlueprint? Reach out to our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-6 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Email Inquiries</h4>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">support@ventureblueprint.in</p>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 block font-semibold">Response within 24 business hours</span>
        </div>

        <div className="glass-card p-6 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Regulatory Support</h4>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">+91 (080) 4567-8900</p>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 block font-semibold">Monday to Friday, 9:30 AM – 6:30 PM IST</span>
        </div>

        <div className="glass-card p-6 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Headquarters</h4>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">Bengaluru, Karnataka, India</p>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 block font-semibold">Tech Operations Hub</span>
        </div>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        {submitted ? (
          <div className="text-center py-10 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Thank You for Reaching Out</h3>
            <p className="text-sm text-slate-800 dark:text-slate-200 max-w-md mx-auto font-medium">
              Your inquiry has been recorded. Our team will review your message and reply via email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Iyer"
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. priya@example.com"
                  className="w-full glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Question regarding Private Limited incorporation dossier"
                className="w-full glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can our regulatory and tech team help?"
                className="w-full glass-input"
              />
            </div>

            <button
              type="submit"
              className="glass-button-primary text-xs py-3.5 px-6 font-bold shadow-md inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Send Support Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
