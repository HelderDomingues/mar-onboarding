
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  checkAdminRole: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Função otimizada para verificar papel de administrador
  const checkAdminRole = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Usar RPC é mais eficiente e seguro do que fazer SELECT diretamente
      const { data, error } = await supabase.rpc('check_if_user_is_admin', {
        user_id: user.id
      });
      
      if (error) {
        logger.error('Erro ao verificar permissões de administrador', {
          tag: 'Auth',
          data: error
        });
        return false;
      }
      
      const hasAdminRole = !!data;
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (error) {
      logger.error('Erro ao verificar permissões de administrador', {
        tag: 'Auth',
        data: error
      });
      return false;
    }
  };

  useEffect(() => {
    // Configurar o listener de mudanças de estado primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logger.info(`Evento de autenticação: ${event}`, { tag: 'Auth' });
        
        // Atualizações síncronas
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Verificações assíncronas usando setTimeout para evitar deadlocks
        if (currentSession?.user) {
          setTimeout(async () => {
            await checkAdminRole();
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      logger.info('Verificando sessão existente', { 
        tag: 'Auth', 
        data: currentSession ? 'Sessão encontrada' : 'Sem sessão' 
      });
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Verificar papel de admin quando inicializar
      if (currentSession?.user) {
        await checkAdminRole();
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    logger.info('Tentando fazer login', { tag: 'Auth', data: { email } });
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Erro ao fazer login', { tag: 'Auth', data: error });
        throw error;
      }

      logger.info('Login bem-sucedido', { tag: 'Auth', data: { userId: data.user?.id } });
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });
      
      // Verificar papel de admin após login
      if (data.user) {
        await checkAdminRole();
      }

      return;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Falha no login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    logger.info('Realizando logout', { tag: 'Auth' });
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Erro ao fazer logout', { tag: 'Auth', data: error });
        throw error;
      }

      // Redefinir estado de admin
      setIsAdmin(false);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      logger.error('Falha ao processar logout', { tag: 'Auth', data: error });
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message || "Ocorreu um erro ao tentar sair.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        isAdmin,
        checkAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
