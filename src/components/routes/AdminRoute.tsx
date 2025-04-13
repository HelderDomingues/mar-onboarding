
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";

/**
 * Componente de rota para páginas administrativas
 * Apenas usuários com função de administrador podem acessar
 */
const AdminRoute = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Registrar tentativa de acesso à área administrativa
      addLogEntry('auth', 'Verificação de acesso administrativo', {
        userId: user?.id || 'não autenticado',
        isAdmin: isAdmin || false,
        isAuthenticated: isAuthenticated || false
      }, user?.id);
      
      logger.info('Verificação de acesso administrativo', {
        tag: 'Admin',
        userId: user?.id || 'não autenticado',
        isAdmin: isAdmin || false
      });
    }
  }, [user, isAuthenticated, isAdmin, isLoading]);

  // Enquanto carregando, mostrar nada
  if (isLoading) {
    return null;
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
  return <Outlet />;
};

export default AdminRoute;
