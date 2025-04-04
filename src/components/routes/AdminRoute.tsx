
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface AdminRouteProps {
  component: React.ComponentType<any>;
}

export const AdminRoute = ({ component: Component }: AdminRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
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
          
        if (error) {
          logger.error('Erro ao verificar papel do usuário:', {
            tag: 'AdminRoute',
            data: error
          });
        }
          
        setIsAdmin(!!data);
      } catch (error) {
        logger.error('Erro ao verificar papel do usuário:', {
          tag: 'AdminRoute',
          data: error
        });
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
    return <Navigate to="/dashboard" state={{ from: location.pathname, message: "Você não tem permissão para acessar esta área." }} />;
  }
  
  return <Component />;
};
