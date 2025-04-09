
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute = ({ component: Component }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Apenas redirecionar se não estiver autenticado e não estiver carregando
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Mostrar nada durante o carregamento para evitar flashes
  if (isLoading) {
    return null;
  }
  
  // Renderizar o componente apenas se estiver autenticado
  return isAuthenticated ? <Component /> : null;
};
