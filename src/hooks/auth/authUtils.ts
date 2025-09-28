import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";
import { User } from "@supabase/supabase-js";

/**
 * Verifica o status de administrador de um usuário
 */
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try { // <--- Este é o bloco try principal
    logger.info('Verificando status de admin para usuário:', { 
      tag: 'Auth', 
      data: { userId } 
    });
    
    addLogEntry('auth', 'Verificando status de admin', { userId });
    
    // TEMPORARIAMENTE IGNORANDO RPC PARA ISOLAR O ERRO 406
    // O código original estava aqui: try/catch para supabase.rpc('is_current_user_admin')
    
    // Fallback: query direta na tabela user_roles
    // Já corrigida para buscar todas as roles, o que evita o 406 por falta de linha.
    const { data: rolesData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId); 
    
    if (error) {
      logger.error('Erro ao verificar status de admin via query direta:', { 
        tag: 'Auth', 
        data: { error, userId } 
      });
      addLogEntry('error', 'Erro ao verificar status de admin', { error, userId });
      return false;
    }
    
    // Usar .some() para verificar se a role 'admin' está presente no array de resultados
    const isAdmin = rolesData 
      ? rolesData.some(r => r.role === 'admin') 
      : false;

    logger.info('Status de admin verificado via query direta:', { 
      tag: 'Auth', 
      data: { userId, isAdmin } 
    });
    addLogEntry('auth', 'Status de admin verificado', { userId, isAdmin });
    
    return isAdmin; // <--- O RETORNO ESTÁ CORRETO AQUI
  } 
  // O catch deve estar diretamente após o fechamento do try principal.
  catch (error) { // <--- O CATCH PRINCIPAL DEVE FICAR AQUI
    logger.error('Exceção ao verificar status de admin:', { 
      tag: 'Auth', 
      data: { error, userId } 
    });
    addLogEntry('error', 'Exceção ao verificar status de admin', { error, userId });
    return false;
  } 
};
    
    // Fallback: query direta na tabela user_roles
    // ALTERAÇÃO CRÍTICA: Removido .eq('role', 'admin') e .limit(1) para evitar 406
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId); // Buscar todas as roles para o usuário
    
    if (error) {
      logger.error('Erro ao verificar status de admin via query direta:', { 
        tag: 'Auth', 
        data: { error, userId } 
      });
      addLogEntry('error', 'Erro ao verificar status de admin', { error, userId });
      return false;
    }
    
    // ALTERAÇÃO CRÍTICA: Usar .some() para verificar se a role 'admin' está presente no array de resultados
    const isAdmin = data 
      ? data.some(r => r.role === 'admin') 
      : false;

    logger.info('Status de admin verificado via query direta:', { 
      tag: 'Auth', 
      data: { userId, isAdmin } 
    });
    addLogEntry('auth', 'Status de admin verificado', { userId, isAdmin });
    
    return isAdmin;
  } catch (error) {
    logger.error('Exceção ao verificar status de admin:', { 
      tag: 'Auth', 
      data: { error, userId } 
    });
    addLogEntry('error', 'Exceção ao verificar status de admin', { error, userId });
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
