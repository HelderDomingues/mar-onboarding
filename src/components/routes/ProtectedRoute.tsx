
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { addLogEntry } from "@/utils/projectLog";
import { logger } from "@/utils/logger";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute = ({ component: Component }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Aguardar o carregamento da autenticação
    if (!isLoading) {
      // Registrar tentativa apenas após o carregamento
      addLogEntry('auth', 'Tentativa de acesso à rota protegida', { 
        isAuthenticated,
        userId: user?.id || 'não autenticado',
        path: window.location.pathname
      }, user?.id);
      
      logger.info('Tentativa de acesso à rota protegida', {
        tag: 'Auth',
        data: {
          isAuthenticated,
          userId: user?.id || 'não autenticado',
          path: window.location.pathname
        }
      });
      
      // Apenas redirecionar se não estiver autenticado e não estiver carregando
      if (!isAuthenticated) {
        addLogEntry('auth', 'Redirecionando usuário não autenticado para página inicial', {
          path: window.location.pathname
        }, user?.id);
        
        logger.warn('Redirecionando usuário não autenticado', {
          tag: 'Auth',
          data: {
            path: window.location.pathname
          }
        });
        
        navigate("/", { replace: true });
      } else {
        // Se autenticado, marcar verificação como concluída
        setIsCheckingAuth(false);
      }
    }
  }, [isAuthenticated, isLoading, navigate, user]);
  
  // Mostrar tela de carregamento durante a verificação
  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-600">Verificando autenticação...</p>
      </div>
    );
  }
  
  // Se não estiver autenticado, mostrar loading (o redirect já foi acionado)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-600">Redirecionando...</p>
      </div>
    );
  }
  
  // Renderizar o componente apenas se estiver autenticado
  return <Component />;
};
