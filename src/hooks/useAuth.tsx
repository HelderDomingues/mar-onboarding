
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Configurar o listener de mudanças de estado primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        logger.info(`Evento de autenticação: ${event}`, { tag: 'Auth' });
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      logger.info('Verificando sessão existente', { tag: 'Auth', data: currentSession ? 'Sessão encontrada' : 'Sem sessão' });
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
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
