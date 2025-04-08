
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";

/**
 * Componente de rota para páginas administrativas
 * Apenas usuários com função de administrador podem acessar
 */
const AdminRoute = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (user && isAuthenticated && !loading) {
      // Registrar tentativa de acesso à área administrativa
      logger.info('Verificação de acesso administrativo', {
        tag: 'Admin',
        userId: user.id,
        isAdmin: isAdmin || false
      });
    }
  }, [user, isAuthenticated, isAdmin, loading]);

  // Enquanto carregando, mostrar nada
  if (loading) {
    return null;
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    logger.warn('Tentativa de acesso à área administrativa sem autenticação', {
      tag: 'Admin'
    });
    return <Navigate to="/login" replace />;
  }

  // Se não for administrador, redirecionar para o dashboard
  if (!isAdmin) {
    logger.warn('Tentativa de acesso à área administrativa por usuário sem permissão', {
      tag: 'Admin',
      userId: user?.id
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Se for administrador, permitir acesso
  return <Outlet />;
};

export default AdminRoute;
