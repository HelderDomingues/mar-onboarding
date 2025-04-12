
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";

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
      addLogEntry('auth', 'Verificando status de administrador', { userId }, userId);
      
      // Importante: Usar setTimeout para evitar problemas de recursão com Supabase
      return new Promise<boolean>((resolve) => {
        setTimeout(async () => {
          try {
            const { data, error } = await supabase.rpc('is_admin');
            
            if (error) {
              logger.error('Erro ao verificar papel de administrador:', {
                tag: 'Auth',
                data: { error, userId }
              });
              addLogEntry('error', 'Erro ao verificar papel de administrador', { error, userId }, userId);
              resolve(false);
              return;
            }
            
            logger.info('Status de admin verificado', {
              tag: 'Auth',
              data: { isAdmin: !!data, userId }
            });
            
            addLogEntry('auth', 'Status de admin verificado', { isAdmin: !!data }, userId);
            resolve(!!data);
          } catch (error) {
            logger.error('Exceção ao verificar papel de administrador:', {
              tag: 'Auth',
              data: { error, userId }
            });
            addLogEntry('error', 'Exceção ao verificar papel de administrador', { error }, userId);
            resolve(false);
          }
        }, 0);
      });
    } catch (error) {
      logger.error('Exceção ao verificar papel de administrador:', {
        tag: 'Auth',
        data: { error, userId }
      });
      addLogEntry('error', 'Exceção ao verificar papel de administrador', { error }, userId);
      return false;
    }
  };

  useEffect(() => {
    // Configurar o listener de autenticação para detectar mudanças de estado
    const setupAuthListener = () => {
      addLogEntry('auth', 'Configurando listener de autenticação');
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          logger.info(`Evento de autenticação detectado: ${event}`, { 
            tag: 'Auth', 
            data: { event, hasSession: !!session }
          });
          
          addLogEntry('auth', `Evento de autenticação detectado: ${event}`, { 
            hasSession: !!session 
          }, session?.user?.id);
          
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
        addLogEntry('auth', 'Verificando sessão atual');
        logger.info('Verificando sessão atual', { tag: 'Auth' });
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Erro ao verificar sessão:', {
            tag: 'Auth',
            data: error
          });
          addLogEntry('error', 'Erro ao verificar sessão', { error });
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        const currentUser = data.session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          addLogEntry('auth', 'Usuário encontrado na sessão atual', {}, currentUser.id);
          // Importante: usar setTimeout aqui para evitar recursão
          setTimeout(async () => {
            const isUserAdmin = await checkAdminStatus(currentUser.id);
            setIsAdmin(isUserAdmin);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        logger.error("Erro ao inicializar autenticação:", {
          tag: 'Auth',
          data: error
        });
        addLogEntry('error', 'Erro ao inicializar autenticação', { error });
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    // Primeiro configurar o listener, depois verificar a sessão atual
    const authListener = setupAuthListener();
    
    // Importante: usar setTimeout para evitar problemas de timing
    setTimeout(() => {
      checkCurrentSession();
    }, 0);

    // Cleanup ao desmontar
    return () => {
      logger.info('Removendo listener de autenticação', { tag: 'Auth' });
      addLogEntry('auth', 'Removendo listener de autenticação');
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
      
      addLogEntry('auth', 'Tentativa de login', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Falha no login:', { 
          tag: 'Auth', 
          data: { error: error.message, email }
        });
        
        addLogEntry('error', 'Falha no login', { error: error.message, email });
        
        return {
          success: false,
          message: error.message,
        };
      }

      logger.info('Login realizado com sucesso', { 
        tag: 'Auth', 
        data: { email, userId: data.user?.id }
      });
      
      addLogEntry('auth', 'Login realizado com sucesso', { email }, data.user?.id);
      
      // Atualizar o estado de admin imediatamente após login bem-sucedido
      if (data.user) {
        // Usar setTimeout para evitar problemas de recursão
        setTimeout(async () => {
          const isUserAdmin = await checkAdminStatus(data.user.id);
          setIsAdmin(isUserAdmin);
        }, 0);
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
      
      addLogEntry('error', 'Erro inesperado no login', { error: error.message, email });
      
      return {
        success: false,
        message: error.message || "Erro ao fazer login",
      };
    }
  };

  const logout = async () => {
    try {
      logger.info('Iniciando processo de logout', { tag: 'Auth' });
      addLogEntry('auth', 'Iniciando processo de logout', {}, user?.id);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error("Erro ao fazer logout:", {
          tag: 'Auth',
          data: error
        });
        addLogEntry('error', 'Erro ao fazer logout', { error }, user?.id);
        return;
      }
      
      logger.info('Logout realizado com sucesso', { tag: 'Auth' });
      addLogEntry('auth', 'Logout realizado com sucesso', {}, user?.id);
      
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      logger.error("Erro ao fazer logout:", {
        tag: 'Auth',
        data: error
      });
      addLogEntry('error', 'Erro ao fazer logout', { error }, user?.id);
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
