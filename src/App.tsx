import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ApiConfigProvider } from "@/contexts/ApiConfigContext";
import { supabase } from '@/integrations/supabase/client';

// Páginas
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

// Componente de proteção de rota
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  if (isAuthenticated === null) {
    // Ainda está carregando
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
}

const queryClient = new QueryClient();

const App = () => (
  <ApiConfigProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes" 
              element={
                <ProtectedRoute>
                  <Pacientes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracoes" 
              element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ApiConfigProvider>
);

export default App;
