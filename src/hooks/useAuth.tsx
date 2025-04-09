
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  isAdmin: false,
  login: async () => ({ success: false, message: "Contexto de autenticação não inicializado" }),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Configurar listener para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        // Verificar se é admin apenas se o usuário estiver autenticado
        if (session?.user) {
          try {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .eq('role', 'admin');
              
            setIsAdmin(roleData && roleData.length > 0);
          } catch (error) {
            logger.error('Erro ao verificar papel do usuário:', error);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // Verificar sessão atual ao inicializar
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          try {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', data.session.user.id)
              .eq('role', 'admin');
              
            setIsAdmin(roleData && roleData.length > 0);
          } catch (error) {
            logger.error('Erro ao verificar papel do usuário:', error);
            setIsAdmin(false);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        logger.error("Erro ao inicializar autenticação:", error);
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: true,
        message: "Login realizado com sucesso",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Erro ao fazer login",
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      logger.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
