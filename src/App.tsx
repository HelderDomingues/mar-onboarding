
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import QuizReviewPage from "./pages/QuizReview";
import NotFound from "./pages/NotFound";
import UsersPage from "./pages/admin/Users";
import SettingsPage from "./pages/admin/Settings";
import { QuizSuccess } from "./components/quiz/QuizSuccess";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Erro ao verificar papel do usuário:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      checkAdminRole();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Rotas protegidas por autenticação */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/quiz/review"
              element={
                <ProtectedRoute>
                  <QuizReviewPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/quiz/success"
              element={
                <ProtectedRoute>
                  <QuizSuccess />
                </ProtectedRoute>
              }
            />
            
            {/* Rotas Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/users/new"
              element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <SettingsPage />
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/data"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/help"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
