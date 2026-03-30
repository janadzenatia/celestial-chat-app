import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import CompatibilityPage from "./pages/CompatibilityPage";
import FamilyPage from "./pages/FamilyPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
};

const isNative = Capacitor.isNativePlatform();
const isPreview = window.location.hostname.includes("lovable.app") || window.location.hostname.includes("lovableproject.com") || window.location.hostname === "localhost";

const AppRoutes = () => (
  <Routes>
    {/* Native: AuthPage, Preview: skip to app, Production web: LandingPage */}
    <Route path="/" element={isNative ? <AuthPage /> : isPreview ? <Navigate to="/home" replace /> : <LandingPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/unsubscribe" element={<UnsubscribePage />} />

    {/* Auth routes — redirect to landing */}
    <Route path="/auth" element={<Navigate to="/" replace />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    {/* Onboarding — still needed for authenticated PWA users */}
    <Route path="/onboarding" element={<OnboardingPage />} />

    {/* Protected app routes — only for existing authenticated (PWA) users */}
    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/home" element={<Index />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/compatibility" element={<CompatibilityPage />} />
      <Route path="/family" element={<FamilyPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Route>

    {/* Catch-all: redirect to landing */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
