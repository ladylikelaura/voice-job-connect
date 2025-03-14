
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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

// Modified to allow access without authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Simply render children without authentication check
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/jobs" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/saved" element={<SavedJobs />} />
      <Route path="/status" element={<Status />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/create" element={<ProfileCreation />} />
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
