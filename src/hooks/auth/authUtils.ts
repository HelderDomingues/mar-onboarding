
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";
import { User } from "@supabase/supabase-js";

/**
 * Verifica o status de administrador de um usuário
 */
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
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
};

/**
 * Realiza login no sistema
 */
export const loginUser = async (email: string, password: string) => {
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

/**
 * Realiza logout no sistema
 */
export const logoutUser = async (userId?: string) => {
  try {
    logger.info('Iniciando processo de logout', { tag: 'Auth' });
    addLogEntry('auth', 'Iniciando processo de logout', {}, userId);
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error("Erro ao fazer logout:", {
        tag: 'Auth',
        data: error
      });
      addLogEntry('error', 'Erro ao fazer logout', { error }, userId);
      return;
    }
    
    logger.info('Logout realizado com sucesso', { tag: 'Auth' });
    addLogEntry('auth', 'Logout realizado com sucesso', {}, userId);
  } catch (error) {
    logger.error("Erro ao fazer logout:", {
      tag: 'Auth',
      data: error
    });
    addLogEntry('error', 'Erro ao fazer logout', { error }, userId);
  }
};
