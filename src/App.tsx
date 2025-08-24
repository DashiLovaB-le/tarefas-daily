
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UpdateNotification } from "@/components/UpdateNotification";
import { ShareNotification } from "@/components/ShareNotification";
import { versionChecker } from "@/lib/version-check";
import { analytics } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/useAnalytics";
import LoginPage from "./pages/Login";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Today from "./pages/Today";
import Upcoming from "./pages/Upcoming";
import Projects from "./pages/Projects";
import Starred from "./pages/Starred";
import Completed from "./pages/Completed";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/today"
        element={
          <ProtectedRoute>
            <Today />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upcoming"
        element={
          <ProtectedRoute>
            <Upcoming />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/starred"
        element={
          <ProtectedRoute>
            <Starred />
          </ProtectedRoute>
        }
      />
      <Route
        path="/completed"
        element={
          <ProtectedRoute>
            <Completed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Iniciar verificação de versão
    console.log('App: Iniciando sistema de versionamento');
    versionChecker.start();
    
    // Inicializar analytics
    console.log('App: Sistema de analytics inicializado');
    trackEvent('App', 'initialized');
    
    // Detectar se é PWA instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      trackEvent('PWA', 'launched_as_app');
    }
    
    // Cleanup quando o componente for desmontado
    return () => {
      versionChecker.stop();
      analytics.sendAnalytics();
    };
  }, [trackEvent]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <UpdateNotification />
        <ShareNotification />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
