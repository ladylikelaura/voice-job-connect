
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Jobs from "./pages/Jobs";
import SavedJobs from "./pages/SavedJobs";
import Status from "./pages/Status";
import Profile from "./pages/Profile";
import ProfileCreation from "./pages/ProfileCreation";
import { useAccessibilitySettings } from "./components/voiceApplication/useAccessibilitySettings";
import { LoadingSpinner } from "./components/LoadingSpinner";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-background"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }
  
  if (!user) {
    console.log("User not authenticated, redirecting to /auth from protected route");
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-background"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingSpinner message="Loading authentication..." />
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
      <Route path="/status" element={<ProtectedRoute><Status /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/create" element={<ProtectedRoute><ProfileCreation /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const { highContrast } = useAccessibilitySettings();
  
  return (
    <div 
      className={highContrast ? "high-contrast-mode" : ""}
      aria-label="Jobbify Application"
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
