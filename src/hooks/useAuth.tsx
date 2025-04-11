
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

  // Função para verificar status de administrador
  const checkAdminStatus = async (userId: string) => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        logger.error('Erro ao verificar papel de administrador:', {
          tag: 'Auth',
          data: { error, userId }
        });
        return false;
      }
      
      logger.info('Status de admin verificado', {
        tag: 'Auth',
        data: { isAdmin: !!data, userId }
      });
      
      return !!data;
    } catch (error) {
      logger.error('Exceção ao verificar papel de administrador:', {
        tag: 'Auth',
        data: { error, userId }
      });
      return false;
    }
  };

  useEffect(() => {
    // Configurar o listener de autenticação para detectar mudanças de estado
    const setupAuthListener = () => {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          logger.info(`Evento de autenticação detectado: ${event}`, { 
            tag: 'Auth', 
            data: { event, hasSession: !!session }
          });
          
          const currentUser = session?.user || null;
          setUser(currentUser);
          
          // Verificar status de admin apenas se o usuário estiver autenticado
          if (currentUser) {
            // Usar setTimeout para evitar problemas de recursão com Supabase
            setTimeout(async () => {
              const isUserAdmin = await checkAdminStatus(currentUser.id);
              setIsAdmin(isUserAdmin);
            }, 0);
          } else {
            setIsAdmin(false);
          }
          
          setIsLoading(false);
        }
      );
      
      return authListener;
    };
    
    // Verificar a sessão atual
    const checkCurrentSession = async () => {
      try {
        logger.info('Verificando sessão atual', { tag: 'Auth' });
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Erro ao verificar sessão:', {
            tag: 'Auth',
            data: error
          });
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        const currentUser = data.session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          const isUserAdmin = await checkAdminStatus(currentUser.id);
          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        logger.error("Erro ao inicializar autenticação:", {
          tag: 'Auth',
          data: error
        });
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    // Primeiro configurar o listener, depois verificar a sessão atual
    const authListener = setupAuthListener();
    checkCurrentSession();

    // Cleanup ao desmontar
    return () => {
      logger.info('Removendo listener de autenticação', { tag: 'Auth' });
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      logger.info('Tentando fazer login', { 
        tag: 'Auth', 
        data: { email }
      });
      
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
      
      // Atualizar o estado de admin imediatamente após login bem-sucedido
      if (data.user) {
        const isUserAdmin = await checkAdminStatus(data.user.id);
        setIsAdmin(isUserAdmin);
      }
      
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
      logger.info('Iniciando processo de logout', { tag: 'Auth' });
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error("Erro ao fazer logout:", {
          tag: 'Auth',
          data: error
        });
        return;
      }
      
      logger.info('Logout realizado com sucesso', { tag: 'Auth' });
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      logger.error("Erro ao fazer logout:", {
        tag: 'Auth',
        data: error
      });
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
