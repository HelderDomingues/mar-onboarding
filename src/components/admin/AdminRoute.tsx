
import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";

/**
 * Componente de rota para páginas administrativas
 * Apenas usuários com função de administrador podem acessar
 */
const AdminRoute = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (!isLoading) {
      // Registrar tentativa de acesso à área administrativa
      addLogEntry('auth', 'Verificação de acesso administrativo', {
        userId: user?.id || 'não autenticado',
        isAdmin: isAdmin || false,
        isAuthenticated: isAuthenticated || false,
        path: location.pathname
      }, user?.id);
      
      logger.info('Verificação de acesso administrativo', {
        tag: 'Admin',
        userId: user?.id || 'não autenticado',
        isAdmin: isAdmin || false,
        path: location.pathname
      });
    }
  }, [user, isAuthenticated, isAdmin, isLoading, location.pathname]);

  // Enquanto carregando, mostrar nada
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    logger.warn('Tentativa de acesso à área administrativa sem autenticação', {
      tag: 'Admin'
    });
    addLogEntry('auth', 'Tentativa de acesso à área administrativa sem autenticação');
    return <Navigate to="/" replace />;
  }

  // Se não for administrador, redirecionar para o dashboard
  if (!isAdmin) {
    logger.warn('Tentativa de acesso à área administrativa por usuário sem permissão', {
      tag: 'Admin',
      userId: user?.id
    });
    addLogEntry('auth', 'Tentativa de acesso à área administrativa por usuário sem permissão', {}, user?.id);
    return <Navigate to="/dashboard" replace />;
  }

  // Se for administrador, permitir acesso
  addLogEntry('auth', 'Acesso administrativo concedido', {}, user?.id);
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminRoute;
