
import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";

/**
 * Componente de rota para páginas administrativas
 * Apenas usuários com função de administrador podem acessar
 */
const AdminRouteContent = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="min-h-screen w-full md:flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col w-full">
        {/* Header mobile com trigger */}
        <header className="md:hidden h-14 flex items-center border-b bg-background px-4 sticky top-0 z-30">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-semibold">Sistema MAR</h1>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 bg-gradient-to-b from-blue-50 to-white p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AdminRoute = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (!isLoading) {
      addLogEntry(
        "auth",
        "Verificação de acesso administrativo",
        {
          userId: user?.id || "não autenticado",
          isAdmin: isAdmin || false,
          isAuthenticated: isAuthenticated || false,
          path: location.pathname,
        },
        user?.id
      );
      logger.info("Verificação de acesso administrativo", {
        tag: "Admin",
        userId: user?.id || "não autenticado",
        isAdmin: isAdmin || false,
        path: location.pathname,
      });
    }
  }, [user, isAuthenticated, isAdmin, isLoading, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    logger.warn("Tentativa de acesso à área administrativa sem autenticação", {
      tag: "Admin",
    });
    addLogEntry(
      "auth",
      "Tentativa de acesso à área administrativa sem autenticação"
    );
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    logger.warn(
      "Tentativa de acesso à área administrativa por usuário sem permissão",
      {
        tag: "Admin",
        userId: user?.id,
      }
    );
    addLogEntry(
      "auth",
      "Tentativa de acesso à área administrativa por usuário sem permissão",
      {},
      user?.id
    );
    return <Navigate to="/dashboard" replace />;
  }

  addLogEntry("auth", "Acesso administrativo concedido", {}, user?.id);

  return (
    <SidebarProvider>
      <AdminRouteContent />
    </SidebarProvider>
  );
};

export default AdminRoute;
