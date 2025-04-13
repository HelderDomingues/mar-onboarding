
import React, { createContext, useContext, useEffect, useState } from "react";
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

  // Função para verificar status de administrador
  const checkAdminStatus = async (userId: string) => {
    if (!userId) return false;
    
    try {
      addLogEntry('auth', 'Verificando status de administrador', { userId }, userId);
      
      // Usar a função RPC is_admin com o contexto de autenticação atual
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        logger.error('Erro ao verificar papel de administrador:', {
          tag: 'Auth',
          data: { error, userId }
        });
        addLogEntry('error', 'Erro ao verificar papel de administrador', { error, userId }, userId);
        return false;
      }
      
      logger.info('Status de admin verificado', {
        tag: 'Auth',
        data: { isAdmin: !!data, userId }
      });
      
      addLogEntry('auth', 'Status de admin verificado', { isAdmin: !!data }, userId);
      return !!data;
    } catch (error) {
      logger.error('Exceção ao verificar papel de administrador:', {
        tag: 'Auth',
        data: { error, userId }
      });
      addLogEntry('error', 'Exceção ao verificar papel de administrador', { error }, userId);
      return false;
    }
  };

  // Manipulador de eventos de autenticação separado para evitar loops
  const handleAuthChange = (event: string, newSession: Session | null) => {
    logger.info(`Evento de autenticação detectado: ${event}`, { 
      tag: 'Auth', 
      data: { event, hasSession: !!newSession }
    });
    
    addLogEntry('auth', `Evento de autenticação detectado: ${event}`, { 
      hasSession: !!newSession 
    }, newSession?.user?.id);
    
    // Atualizar sessão e usuário de forma síncrona
    setSession(newSession);
    setUser(newSession?.user || null);
    
    // Verificar status de admin apenas se o usuário estiver autenticado
    // Usando setTimeout para evitar operações síncronas dentro do callback
    if (newSession?.user) {
      setTimeout(() => {
        checkAdminStatus(newSession.user.id).then(isUserAdmin => {
          setIsAdmin(isUserAdmin);
          setIsLoading(false);
        });
      }, 0);
    } else {
      setIsAdmin(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Configurar o listener de autenticação para detectar mudanças de estado
    addLogEntry('auth', 'Configurando listener de autenticação');
    logger.info('Configurando listener de autenticação', { tag: 'Auth' });
    
    // Primeiro, configuramos o listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    
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
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        if (data.session) {
          // Não chamamos handleAuthChange diretamente para evitar loops
          setSession(data.session);
          setUser(data.session.user || null);
          
          if (data.session.user) {
            const isUserAdmin = await checkAdminStatus(data.session.user.id);
            setIsAdmin(isUserAdmin);
          }
          setIsLoading(false);
        } else {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      } catch (error) {
        logger.error("Erro ao inicializar autenticação:", {
          tag: 'Auth',
          data: error
        });
        addLogEntry('error', 'Erro ao inicializar autenticação', { error });
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    // Verificar sessão atual
    checkCurrentSession();

    // Cleanup ao desmontar
    return () => {
      logger.info('Removendo listener de autenticação', { tag: 'Auth' });
      addLogEntry('auth', 'Removendo listener de autenticação');
      subscription.unsubscribe();
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
      
      // Não precisamos definir esses estados manualmente, o listener de autenticação cuidará disso
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
