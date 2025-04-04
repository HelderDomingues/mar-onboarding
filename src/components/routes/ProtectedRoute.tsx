
import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute = ({ component: Component }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location.pathname]);
  
  if (!isAuthenticated) {
    return null; // Será redirecionado no useEffect
  }
  
  return <Component />;
};
