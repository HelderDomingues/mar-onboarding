
import { createClient, PostgrestError, AuthError } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import { addLogEntry, LogOptions } from '@/utils/projectLog';

// Project-specific Supabase URL and keys
const SUPABASE_URL = 'https://btzvozqajqknqfoymxpg.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0enZvenFhanFrbnFmb3lteHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjYwNjEsImV4cCI6MjA1OTc0MjA2MX0.QdD7bEZBPvVNBhHqgAGtFaZOxJrdosFTElxRUCIrnL8';

// Validate URL and keys
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key is missing. Please check your Supabase configuration.');
}

// Implementação de padrão singleton para o cliente Supabase
// Isso evita criar múltiplas instâncias de GoTrueClient
let supabaseInstance = null;
let supabaseAdminInstance = null;
let serviceRoleKey = null;

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
const getSupabaseAdminClient = (key = serviceRoleKey) => {
  // Se não temos key, não podemos criar o cliente admin
  if (!key) {
    return null;
  }
  
  // Se já temos uma instância e a key não mudou, retornamos a instância existente
  if (supabaseAdminInstance && key === serviceRoleKey) {
    return supabaseAdminInstance;
  }
  
  // Salva a nova key e cria uma nova instância
  serviceRoleKey = key;
  
  try {
    logger.info('Criando nova instância do cliente Supabase Admin');
    addLogEntry('info', 'Criando nova instância do cliente Supabase Admin');
    
    supabaseAdminInstance = createClient(SUPABASE_URL, key, {
      ...supabaseOptions,
      global: {
        ...supabaseOptions.global,
        headers: {
          ...supabaseOptions.global.headers,
          'apikey': key
        }
      }
    });
    
    return supabaseAdminInstance;
  } catch (error) {
    logger.error('Erro ao criar cliente Supabase Admin:', {
      error: formatErrorForLog(error)
    });
    addLogEntry('error', 'Erro ao criar cliente Supabase Admin', { error: formatErrorForLog(error) });
    return null;
  }
};

// Exporta o cliente Supabase como singleton
export const supabase = getSupabaseClient();

// Exporta o cliente Supabase Admin como singleton (se disponível)
export const supabaseAdmin = getSupabaseAdminClient();

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

// Função para validar formato de chave JWT do Supabase
const isValidSupabaseKey = (key: string): boolean => {
  // Formato básico: deve ser uma string não vazia com pelo menos 40 caracteres
  // E deve ter o formato padrão de JWT (3 seções separadas por pontos)
  if (!key || typeof key !== 'string' || key.length < 40) {
    return false;
  }
  
  // Deve ter formato de JWT (3 partes separadas por ponto)
  const parts = key.split('.');
  return parts.length === 3;
};

/**
 * Função para obter emails de usuários usando a nova função RPC
 * Esta versão usa a função RPC segura get_user_emails
 */
export const getUserEmails = async () => {
  try {
    addLogEntry('info', 'Buscando emails de usuários via RPC');
    
    // Usando a nova função RPC para get_user_emails
    const { data, error } = await supabase.rpc('get_user_emails');
    
    if (error) {
      logger.error('Erro ao buscar emails de usuários:', {
        error: formatErrorForLog(error)
      });
      
      addLogEntry('error', 'Erro ao buscar emails de usuários via RPC', { 
        error: formatErrorForLog(error),
        errorCode: error.code
      });
      
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exceção ao buscar emails de usuários:', {
      error: formatErrorForLog(error)
    });
    
    addLogEntry('error', 'Exceção ao buscar emails de usuários', { 
      error: formatErrorForLog(error) 
    });
    
    return null;
  }
};

/**
 * Verifica e configura o serviço de acesso aos emails
 * Esta função é chamada a partir da interface de configuração
 */
export const configureEmailAccess = async (serviceRoleKey?: string) => {
  try {
    // Se uma nova chave foi fornecida, validamos o formato
    if (serviceRoleKey) {
      // Validação básica do formato da chave
      if (!isValidSupabaseKey(serviceRoleKey)) {
        addLogEntry('error', 'Chave service_role fornecida tem formato inválido');
        return {
          success: false,
          message: 'A chave service_role fornecida parece ter um formato inválido. Verifique se copiou corretamente.'
        };
      }
      
      // Cria uma nova instância com a chave fornecida
      const adminClient = getSupabaseAdminClient(serviceRoleKey);
      
      if (!adminClient) {
        addLogEntry('error', 'Falha ao criar cliente admin com a nova chave');
        return {
          success: false,
          message: 'Erro ao inicializar cliente Supabase com a chave fornecida'
        };
      }
      
      // Testa a nova instância com uma consulta simples para verificar as permissões
      try {
        // Primeiro tentamos uma consulta simples para verificar se a conexão funciona
        const { error: connectionError } = await adminClient
          .from('profiles')
          .select('count', { count: 'exact', head: true });
        
        if (connectionError) {
          logger.error('Erro na consulta de teste com nova chave service_role:', {
            error: formatErrorForLog(connectionError)
          });
          
          // Se a consulta falhou por erro de permissão, a chave pode estar correta mas não ter permissões suficientes
          if (connectionError.code === '42501' || connectionError.message.includes('permission')) {
            addLogEntry('error', 'Chave service_role sem permissões suficientes', { error: formatErrorForLog(connectionError) });
            return {
              success: false,
              message: 'A chave service_role não tem permissões suficientes para acessar os dados necessários'
            };
          }
          
          // Outros tipos de erro
          addLogEntry('error', 'Falha na conexão com nova chave service_role', { error: formatErrorForLog(connectionError) });
          return {
            success: false,
            message: 'Erro ao testar a conexão com a chave service_role fornecida'
          };
        }
        
        // Agora testamos a RPC específica para emails
        const { data, error } = await adminClient.rpc('get_user_emails');
        
        if (error) {
          // Se a função RPC não existe, sugerimos criar
          if (error.code === '42883' || error.message.includes('function') && error.message.includes('does not exist')) {
            addLogEntry('error', 'Função RPC get_user_emails não encontrada no banco de dados', { error: formatErrorForLog(error) });
            return {
              success: false,
              message: 'A função get_user_emails não existe no seu banco de dados Supabase. Certifique-se de que a função foi criada corretamente.'
            };
          }
          
          logger.error('Erro ao testar nova chave service_role:', {
            error: formatErrorForLog(error)
          });
          addLogEntry('error', 'Falha ao configurar acesso aos emails - erro na RPC', { error: formatErrorForLog(error) });
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
      } catch (testError) {
        logger.error('Exceção ao testar nova chave service_role:', {
          error: formatErrorForLog(testError)
        });
        addLogEntry('error', 'Exceção ao testar chave service_role', { error: formatErrorForLog(testError) });
        return {
          success: false,
          message: 'Erro ao testar a chave service_role fornecida'
        };
      }
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
