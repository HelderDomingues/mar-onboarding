
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
    // Registrar tentativa de acesso à rota protegida
    if (!isLoading) {
      addLogEntry('navigation', 'Tentativa de acesso à rota protegida', { 
        isAuthenticated,
        userId: user?.id || 'não autenticado'
      }, user?.id);
    }
    
    // Apenas redirecionar se não estiver autenticado e não estiver carregando
    if (!isAuthenticated && !isLoading) {
      addLogEntry('navigation', 'Redirecionando usuário não autenticado para página inicial', {}, user?.id);
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate, user]);
  
  // Mostrar nada durante o carregamento para evitar flashes
  if (isLoading) {
    return null;
  }
  
  // Renderizar o componente apenas se estiver autenticado
  return isAuthenticated ? <Component /> : null;
};
