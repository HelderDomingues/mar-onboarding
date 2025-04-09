
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
    // Primeiro configura o listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        // Verificar se é admin apenas se o usuário estiver autenticado
        if (currentUser) {
          try {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentUser.id)
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

    // Depois verifica a sessão atual
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentUser.id)
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
        logger.error('Falha no login:', { 
          tag: 'Auth', 
          data: { error: error.message, email }
        });
        
        return {
          success: false,
          message: error.message,
        };
      }

      logger.info('Login realizado com sucesso', { 
        tag: 'Auth', 
        data: { email, userId: data.user?.id }
      });
      
      return {
        success: true,
        message: "Login realizado com sucesso",
      };
    } catch (error: any) {
      logger.error('Erro inesperado no login:', { 
        tag: 'Auth', 
        data: { error: error.message, email }
      });
      
      return {
        success: false,
        message: error.message || "Erro ao fazer login",
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      logger.info('Logout realizado com sucesso', { tag: 'Auth' });
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
