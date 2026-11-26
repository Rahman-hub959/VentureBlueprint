import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";

// Public Pages
import { LandingPage } from "./pages/public/LandingPage";
import { AboutPage } from "./pages/public/AboutPage";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { FeaturesPage } from "./pages/public/FeaturesPage";
import { DomainsPage } from "./pages/public/DomainsPage";
import { FaqPage } from "./pages/public/FaqPage";
import { ContactPage } from "./pages/public/ContactPage";
import { PrivacyPolicyPage } from "./pages/public/PrivacyPolicyPage";
import { TermsPage } from "./pages/public/TermsPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { ForgotPasswordPage } from "./pages/public/ForgotPasswordPage";

// Authenticated Dashboard Pages
import { DashboardOverview } from "./pages/dashboard/DashboardOverview";
import { ProjectsListPage } from "./pages/projects/ProjectsListPage";
import { NewProjectPage } from "./pages/projects/NewProjectPage";
import { QuestionnaireWizardPage } from "./pages/questionnaire/QuestionnaireWizardPage";
import { CompliancePage } from "./pages/compliance/CompliancePage";
import { DocumentsPage } from "./pages/documents/DocumentsPage";
import { RolesPage } from "./pages/roles/RolesPage";
import { AdminPortalPage } from "./pages/admin/AdminPortalPage";
import SettingsPage from "./pages/SettingsPage";
import { ComplaintsPage } from "./pages/complaints/ComplaintsPage";
import { ConsultationsPage } from "./pages/consultations/ConsultationsPage";

// Global Widgets
import { LiveChatWidget } from "./components/LiveChatWidget";

// Application Error Boundary
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("VentureBlueprint App Caught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold shadow-xs">
              ✓
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Application Safe Recovery</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {this.state.error?.message || "An unexpected view error occurred. The application state has been preserved safely."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="glass-button-primary text-xs py-2.5 px-5 shadow-xs"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="glass-button-secondary text-xs py-2.5 px-5"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-medium text-sm">Verifying session...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-medium text-sm">Verifying permissions...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <LiveChatWidget />
            <BrowserRouter>
            <Routes>
              {/* Public Layout & Pages */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/domains" element={<DomainsPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/complaints" element={<ComplaintsPage />} />
                <Route path="/consultations" element={<ConsultationsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Authenticated Dashboard Experience */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardOverview />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/new" element={<NewProjectPage />} />
                <Route path="/projects/:id" element={<Navigate to="questionnaire" replace />} />
                <Route path="/projects/:id/questionnaire" element={<QuestionnaireWizardPage />} />
                <Route path="/projects/:id/compliance" element={<CompliancePage />} />
                <Route path="/projects/:id/documents" element={<DocumentsPage />} />
                <Route path="/projects/:id/roles" element={<RolesPage />} />
                <Route path="/complaints" element={<ComplaintsPage />} />
                <Route path="/consultations" element={<ConsultationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Admin Portal */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPortalPage />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
