import { createClient, PostgrestError, AuthError } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import { addLogEntry, LogOptions } from '@/utils/projectLog';

// Project-specific Supabase URL and keys
const SUPABASE_URL = 'https://btzvozqajqknqfoymxpg.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0enZvenFhanFrbnFmb3lteHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjYwNjEsImV4cCI6MjA1OTc0MjA2MX0.QdD7bEZBPvVNBhHqgAGtFaZOxJrdosFTElxRUCIrnL8';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0enZvenFhanFrbnFmb3lteHBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE2NjA2MSwiZXhwIjoyMDU5NzQyMDYxfQ.mZaY-sWwmHmtCQm16nMhF0bGnF8uVkPMSexEFbL5kpY';

// Validate URL and keys
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key is missing. Please check your Supabase configuration.');
}

// Implementação de padrão singleton para o cliente Supabase
// Isso evita criar múltiplas instâncias de GoTrueClient
let supabaseInstance = null;
let supabaseAdminInstance = null;

// Opções de configuração com headers explícitos e configurações otimizadas
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Função para criar/obter a instância do cliente Supabase
const getSupabaseClient = () => {
  if (!supabaseInstance) {
    logger.info('Criando nova instância do cliente Supabase');
    addLogEntry('info', 'Criando nova instância do cliente Supabase');
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions);
  }
  return supabaseInstance;
};

// Função para criar/obter a instância admin do cliente Supabase
const getSupabaseAdminClient = () => {
  if (!supabaseAdminInstance && SUPABASE_SERVICE_ROLE_KEY) {
    logger.info('Criando nova instância do cliente Supabase Admin');
    addLogEntry('info', 'Criando nova instância do cliente Supabase Admin');
    supabaseAdminInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      ...supabaseOptions,
      global: {
        ...supabaseOptions.global,
        headers: {
          ...supabaseOptions.global.headers,
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        }
      }
    });
  }
  return supabaseAdminInstance;
};

// Exporta o cliente Supabase como singleton
export const supabase = getSupabaseClient();

// Exporta o cliente Supabase Admin como singleton (se disponível)
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY ? getSupabaseAdminClient() : null;

// Função para formatar erro para log
export const formatErrorForLog = (error: PostgrestError | Error | AuthError | null): string => {
  if (!error) return '';
  
  if ('code' in error && 'message' in error) {
    return `${error.code}: ${error.message}`;
  }
  
  if ('message' in error) {
    return error.message;
  }
  
  return JSON.stringify(error);
};

/**
 * Função para obter emails de usuários (requer privilégios admin)
 * Esta função utiliza o cliente admin para acessar diretamente a tabela auth.users
 */
export const getUserEmails = async () => {
  try {
    if (!supabaseAdmin) {
      logger.warn('Tentativa de acessar emails sem cliente admin', {
        warning: 'Acesso a emails requer privilégios de admin'
      });
      addLogEntry('warning', 'Tentativa de acessar emails sem cliente admin configurado');
      return null;
    }
    
    addLogEntry('info', 'Buscando emails de usuários via cliente admin');
    
    // Usando RPC para reduzir superfície de ataque (ao invés de consultar diretamente auth.users)
    const { data, error } = await supabaseAdmin.rpc('get_user_emails');
    
    if (error) {
      logger.error('Erro ao buscar emails de usuários:', {
        error: formatErrorForLog(error)
      });
      addLogEntry('error', 'Erro ao buscar emails de usuários via RPC', { error: formatErrorForLog(error) });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exceção ao buscar emails de usuários:', {
      error: formatErrorForLog(error)
    });
    addLogEntry('error', 'Exceção ao buscar emails de usuários', { error: formatErrorForLog(error) });
    return null;
  }
};

/**
 * Verifica e configura o serviço de acesso aos emails
 * Esta função é chamada a partir da interface de configuração
 */
export const configureEmailAccess = async (serviceRoleKey?: string) => {
  try {
    // Se uma nova chave foi fornecida, atualiza a instância
    if (serviceRoleKey) {
      // Cria uma nova instância com a chave fornecida
      supabaseAdminInstance = createClient(SUPABASE_URL, serviceRoleKey, {
        ...supabaseOptions,
        global: {
          ...supabaseOptions.global,
          headers: {
            ...supabaseOptions.global.headers,
            'apikey': serviceRoleKey
          }
        }
      });
      
      addLogEntry('info', 'Instância admin do Supabase atualizada com nova chave');
      
      // Testa a nova instância
      const { data, error } = await supabaseAdminInstance.rpc('get_user_emails');
      
      if (error) {
        logger.error('Erro ao testar nova chave service_role:', {
          error: formatErrorForLog(error)
        });
        addLogEntry('error', 'Falha ao configurar acesso aos emails - chave inválida', { error: formatErrorForLog(error) });
        return {
          success: false,
          message: 'Chave service_role inválida ou sem permissões suficientes'
        };
      }
      
      // Se chegou aqui, a configuração foi bem-sucedida
      addLogEntry('info', 'Acesso aos emails configurado com sucesso');
      return {
        success: true,
        message: 'Acesso aos emails configurado com sucesso',
        data
      };
    } else {
      // Testa a instância existente, se houver
      if (!supabaseAdmin) {
        return {
          success: false,
          message: 'Nenhuma chave service_role configurada'
        };
      }
      
      const { data, error } = await supabaseAdmin.rpc('get_user_emails');
      
      if (error) {
        addLogEntry('error', 'Falha ao verificar acesso aos emails', { error: formatErrorForLog(error) });
        return {
          success: false,
          message: 'Chave service_role atual é inválida ou sem permissões suficientes'
        };
      }
      
      return {
        success: true,
        message: 'Acesso aos emails já está configurado corretamente',
        data
      };
    }
  } catch (error) {
    logger.error('Exceção ao configurar acesso aos emails:', {
      error: formatErrorForLog(error)
    });
    addLogEntry('error', 'Exceção ao configurar acesso aos emails', { error: formatErrorForLog(error) });
    return {
      success: false,
      message: 'Erro ao configurar acesso aos emails'
    };
  }
};

// Função para verificar a conexão com o Supabase
export const checkSupabaseConnection = async () => {
  try {
    addLogEntry('info', 'Testando conexão com Supabase');
    
    // Teste simples que não depende de autenticação
    const { data, error } = await supabase
      .from('quiz_modules')
      .select('count')
      .limit(1)
      .single();
    
    if (error) {
      addLogEntry('error', 'Falha ao testar conexão com Supabase', { error: JSON.stringify(error) });
      return {
        connected: false,
        error: error.message
      };
    }
    
    addLogEntry('info', 'Conexão com Supabase bem-sucedida');
    return {
      connected: true,
      data
    };
  } catch (error: any) {
    addLogEntry('error', 'Exceção ao testar conexão com Supabase', { error: error.message });
    return {
      connected: false,
      error: error.message
    };
  }
};
