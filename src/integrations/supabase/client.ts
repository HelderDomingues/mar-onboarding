
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

// Função para obter emails de usuários (requer Service Role)
export const getUserEmails = async () => {
  try {
    if (!supabaseAdmin) {
      logger.warn('Service Role Key não configurada para acesso administrativo', {
        tag: 'Supabase'
      });
      addLogEntry('warning', 'Service Role Key não configurada para acesso administrativo');
      return null;
    }
    
    const { data, error } = await supabaseAdmin.from('auth_users_view').select('user_id, email');
    
    if (error) {
      logger.error('Erro ao recuperar emails de usuários', {
        tag: 'Supabase', 
        error
      });
      addLogEntry('error', 'Erro ao recuperar emails de usuários', JSON.stringify(error));
      return null;
    }
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof AuthError 
      ? formatErrorForLog(error) 
      : JSON.stringify(error);
    
    logger.error('Exceção ao acessar emails de usuários', {
      error: errorMessage,
      tag: 'Supabase'
    });
    
    addLogEntry('error', 'Exceção ao acessar emails de usuários', errorMessage);
    return null;
  }
};

// Função para inicializar webhooks
export const initializeWebhooks = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('init-webhooks', {
      body: { action: 'initialize' }
    });
    
    if (error) {
      logger.error('Erro ao inicializar webhooks', {
        tag: 'Webhook',
        error
      });
      addLogEntry('error', 'Erro ao inicializar webhooks', JSON.stringify(error));
      return false;
    }
    
    logger.info('Webhooks inicializados com sucesso', {
      tag: 'Webhook'
    });
    addLogEntry('info', 'Webhooks inicializados com sucesso');
    return true;
  } catch (error) {
    logger.error('Exceção ao inicializar webhooks', {
      tag: 'Webhook',
      error
    });
    addLogEntry('error', 'Exceção ao inicializar webhooks', JSON.stringify(error));
    return false;
  }
};

// Função para criar chave de API
export const createApiKey = async (userId: string, description: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-api-key', {
      body: { userId, description }
    });
    
    if (error) {
      logger.error('Erro ao criar chave de API', {
        tag: 'API',
        error
      });
      addLogEntry('error', 'Erro ao criar chave de API', JSON.stringify(error));
      return null;
    }
    
    return data?.key || null;
  } catch (error) {
    logger.error('Exceção ao criar chave de API', {
      tag: 'API',
      error
    });
    addLogEntry('error', 'Exceção ao criar chave de API', JSON.stringify(error));
    return null;
  }
};

// Função para obter perfil do usuário por ID
export const getUserProfileById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      logger.error('Erro ao obter perfil de usuário', {
        tag: 'Perfil',
        userId,
        error
      });
      addLogEntry('error', `Erro ao obter perfil do usuário ${userId}`, JSON.stringify(error));
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exceção ao obter perfil de usuário', {
      tag: 'Perfil',
      userId,
      error
    });
    addLogEntry('error', `Exceção ao obter perfil do usuário ${userId}`, JSON.stringify(error));
    return null;
  }
};

// Função para enviar respostas do questionário para a API externa
export const enviarRespostasParaAPI = async (userId: string, respostas: any) => {
  try {
    const { data, error } = await supabase.functions.invoke('enviar-respostas', {
      body: { userId, respostas }
    });
    
    if (error) {
      logger.error('Erro ao enviar respostas para API externa', {
        tag: 'API',
        userId,
        error
      });
      addLogEntry('error', 'Erro ao enviar respostas para API externa', JSON.stringify(error));
      return false;
    }
    
    logger.info('Respostas enviadas com sucesso para API externa', {
      tag: 'API',
      userId
    });
    addLogEntry('info', 'Respostas enviadas com sucesso para API externa', undefined, userId);
    return true;
  } catch (error) {
    logger.error('Exceção ao enviar respostas para API externa', {
      tag: 'API',
      userId,
      error
    });
    addLogEntry('error', 'Exceção ao enviar respostas para API externa', JSON.stringify(error));
    return false;
  }
};

// Função de diagnóstico para testar a conexão com o Supabase
export const testApiKeyHeader = async () => {
  try {
    // Tentar uma requisição simples com headers explícitos
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      data
    };
  } catch (error: any) {
    return {
      error: error.message,
      details: error
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
