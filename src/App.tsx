import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import ProfileCreation from "./pages/ProfileCreation";
import { useAccessibilitySettings } from "./components/voiceApplication/useAccessibilitySettings";
import { CVProvider } from './contexts/CVContext';

const queryClient = new QueryClient();

const App = () => {
  const { highContrast } = useAccessibilitySettings();
  
  return (
    <div className={highContrast ? "high-contrast-mode" : ""}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <CVProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/create" element={<ProfileCreation />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CVProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
