
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { addLogEntry } from "@/utils/projectLog";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute = ({ component: Component }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Apenas registrar tentativa após o carregamento
    if (!isLoading) {
      addLogEntry('auth', 'Tentativa de acesso à rota protegida', { 
        isAuthenticated,
        userId: user?.id || 'não autenticado'
      }, user?.id);
      
      // Apenas redirecionar se não estiver autenticado e não estiver carregando
      if (!isAuthenticated) {
        addLogEntry('auth', 'Redirecionando usuário não autenticado para página inicial', {}, user?.id);
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, user]);
  
  // Mostrar tela de carregamento durante a verificação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Renderizar o componente apenas se estiver autenticado
  return isAuthenticated ? <Component /> : null;
};
