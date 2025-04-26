import * as React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";
import { User, Session } from "@supabase/supabase-js";
import { AuthContextType, AuthState } from "./auth/types";
import { checkAdminStatus, loginUser, logoutUser } from "./auth/authUtils";

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  isAdmin: false,
  login: async () => ({ success: false, message: "Contexto de autenticação não inicializado" }),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = React.useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
    authChecked: false
  });

  // Função independente para processar mudanças de autenticação
  const processAuthChange = useCallback((newSession: Session | null) => {
    setAuthState(prev => ({
      ...prev,
      session: newSession,
      user: newSession?.user || null,
    }));
    
    if (newSession?.user) {
      // Verificamos o status de admin de forma segura, com timeout
      setTimeout(async () => {
        try {
          const isUserAdmin = await checkAdminStatus(newSession.user.id);
          setAuthState(prev => ({
            ...prev,
            isAdmin: isUserAdmin,
            isLoading: false,
            authChecked: true
          }));
        } catch (error) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            authChecked: true
          }));
        }
      }, 0);
    } else {
      setAuthState(prev => ({
        ...prev,
        isAdmin: false,
        isLoading: false,
        authChecked: true
      }));
    }
  }, []);

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
  React.useEffect(() => {
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
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              authChecked: true
            }));
          }
          return;
        }
        
        if (data.session && isMounted) {
          processAuthChange(data.session);
        } else if (isMounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            authChecked: true
          }));
        }
      } catch (error) {
        logger.error("Erro ao inicializar autenticação:", {
          tag: 'Auth',
          data: error
        });
        addLogEntry('error', 'Erro ao inicializar autenticação', { error });
        
        if (isMounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            authChecked: true
          }));
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

  // Funções públicas expostas pelo contexto
  const login = async (email: string, password: string) => {
    return loginUser(email, password);
  };

  const logout = async () => {
    return logoutUser(authState.user?.id);
  };

  // Valor do contexto exposto
  const contextValue = {
    isAuthenticated: !!authState.user,
    user: authState.user,
    isLoading: authState.isLoading,
    isAdmin: authState.isAdmin,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
