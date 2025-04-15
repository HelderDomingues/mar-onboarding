import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Função para verificar status de administrador de forma independente
  const checkAdminStatus = useCallback(async (userId: string) => {
    if (!userId) return false;
    
    try {
      // Usar setTimeout para evitar que esta operação bloqueie a UI
      return new Promise<boolean>((resolve) => {
        setTimeout(async () => {
          try {
            addLogEntry('auth', 'Verificando status de administrador', { userId }, userId);
            
            // Usar somente a função RPC is_admin sem fallback para a tabela user_roles
            const { data, error } = await supabase.rpc('is_admin');
            
            if (error) {
              logger.error('Erro ao verificar papel de administrador via RPC:', {
                tag: 'Auth',
                data: { error, userId }
              });
              
              addLogEntry('error', 'Erro ao verificar papel de administrador', { error }, userId);
              resolve(false);
              return;
            }
            
            logger.info('Status de admin verificado via RPC:', {
              tag: 'Auth',
              data: { isAdmin: !!data, userId }
            });
            
            addLogEntry('auth', 'Status de admin verificado via RPC', { isAdmin: !!data }, userId);
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
  }, []);

  // Função independente para processar mudanças de autenticação
  const processAuthChange = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user || null);
    
    if (newSession?.user) {
      // Verificamos o status de admin de forma segura, com timeout
      setTimeout(async () => {
        try {
          const isUserAdmin = await checkAdminStatus(newSession.user.id);
          setIsAdmin(isUserAdmin);
        } finally {
          setIsLoading(false);
          setAuthChecked(true);
        }
      }, 0);
    } else {
      setIsAdmin(false);
      setIsLoading(false);
      setAuthChecked(true);
    }
  }, [checkAdminStatus]);

  // Manipulador de eventos de autenticação
  const handleAuthChange = useCallback((event: string, newSession: Session | null) => {
    logger.info(`Evento de autenticação detectado: ${event}`, { 
      tag: 'Auth', 
      data: { event, hasSession: !!newSession }
    });
    
    addLogEntry('auth', `Evento de autenticação detectado: ${event}`, { 
      hasSession: !!newSession 
    }, newSession?.user?.id);
    
    // Usar setTimeout para evitar operações síncronas dentro do callback
    setTimeout(() => {
      processAuthChange(newSession);
    }, 0);
  }, [processAuthChange]);

  // Configurar listener de autenticação uma vez durante a montagem
  useEffect(() => {
    addLogEntry('auth', 'Configurando listener de autenticação');
    logger.info('Configurando listener de autenticação', { tag: 'Auth' });
    
    let isMounted = true;
    
    // Primeiro, configuramos o listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (isMounted) {
        handleAuthChange(event, newSession);
      }
    });
    
    // Depois, verificamos a sessão atual
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
          
          if (isMounted) {
            setIsLoading(false);
            setAuthChecked(true);
          }
          return;
        }
        
        if (data.session && isMounted) {
          processAuthChange(data.session);
        } else if (isMounted) {
          setIsLoading(false);
          setAuthChecked(true);
        }
      } catch (error) {
        logger.error("Erro ao inicializar autenticação:", {
          tag: 'Auth',
          data: error
        });
        addLogEntry('error', 'Erro ao inicializar autenticação', { error });
        
        if (isMounted) {
          setIsLoading(false);
          setAuthChecked(true);
        }
      }
    };

    // Verificar sessão atual com um pequeno atraso
    setTimeout(() => {
      checkCurrentSession();
    }, 50);

    // Cleanup ao desmontar
    return () => {
      isMounted = false;
      logger.info('Removendo listener de autenticação', { tag: 'Auth' });
      addLogEntry('auth', 'Removendo listener de autenticação');
      subscription.unsubscribe();
    };
  }, [handleAuthChange, processAuthChange]);

  // Implementação de login melhorada
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

  // Implementação de logout
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
