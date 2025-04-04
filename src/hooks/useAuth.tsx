
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ success: false, message: "Contexto de autenticação não inicializado" }),
  signOut: async () => {},
  login: async () => ({ success: false, message: "Contexto de autenticação não inicializado" }),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verifica se há uma sessão ativa
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Configura listener para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Verifica se o usuário é administrador
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        if (!error && data) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        setIsAdmin(false);
      }
    };
    
    checkUserRole();
  }, [user]);

  const signIn = async (email: string, password: string) => {
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

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Aliases para compatibilidade com o código existente
  const login = signIn;
  const logout = signOut;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        isAdmin,
        isLoading: loading,
        signIn,
        signOut,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
