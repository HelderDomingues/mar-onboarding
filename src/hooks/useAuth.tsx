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
    // IMPORTANTE: Primeiro configura o listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.info(`Evento de autenticação detectado: ${event}`, { 
          tag: 'Auth', 
          data: { event, hasSession: !!session }
        });
        
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        // Verificar se é admin apenas se o usuário estiver autenticado
        if (currentUser) {
          // Utilizar a função is_admin do Supabase para verificar o papel de admin
          setTimeout(async () => {
            try {
              const { data, error } = await supabase.rpc('is_admin');
              
              if (error) {
                logger.error('Erro ao verificar papel de administrador:', {
                  tag: 'Auth',
                  data: error
                });
                setIsAdmin(false);
                return;
              }
              
              setIsAdmin(!!data);
              logger.info('Status de admin atualizado', {
                tag: 'Auth',
                data: { isAdmin: !!data }
              });
            } catch (error) {
              logger.error('Erro ao verificar papel de administrador:', {
                tag: 'Auth',
                data: error
              });
              setIsAdmin(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // DEPOIS verifica a sessão atual
    const checkSession = async () => {
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
          try {
            const { data: roleData, error: roleError } = await supabase.rpc('is_admin');
              
            if (roleError) {
              logger.error('Erro ao verificar papel de administrador:', {
                tag: 'Auth',
                data: roleError
              });
              setIsAdmin(false);
            } else {
              setIsAdmin(!!roleData);
              logger.info('Status de admin verificado', {
                tag: 'Auth',
                data: { isAdmin: !!roleData }
              });
            }
          } catch (error) {
            logger.error('Erro ao verificar papel de administrador:', {
              tag: 'Auth',
              data: error
            });
            setIsAdmin(false);
          }
        } else {
          logger.info('Nenhum usuário na sessão atual', { tag: 'Auth' });
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

    checkSession();

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
      // Não precisamos chamar setUser(null) aqui porque o listener de autenticação já fará isso
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
