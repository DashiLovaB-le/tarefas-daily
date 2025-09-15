
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UpdateNotification } from "@/components/UpdateNotification";
import { ShareNotification } from "@/components/ShareNotification";
import { versionChecker } from "@/lib/version-check";
import { analytics } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/useAnalytics";
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
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/today" element={<Today />} />
      <Route path="/upcoming" element={<Upcoming />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/starred" element={<Starred />} />
      <Route path="/completed" element={<Completed />} />
      <Route path="/settings" element={<Settings />} />
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
