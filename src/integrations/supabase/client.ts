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
 * Esta versão usa a nova função RPC segura get_users_with_emails
 */
export const getUserEmails = async () => {
  try {
    addLogEntry('info', 'Buscando emails de usuários via RPC (nova função)');
    
    // Usando a nova função RPC para get_users_with_emails
    const { data, error } = await supabase.rpc('get_users_with_emails');
    
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
 * Analisa o código de erro do Supabase e retorna uma mensagem de erro mais detalhada
 */
const analisarErroSupabase = (error: PostgrestError): { mensagem: string, detalhes: string, codigoHTTP?: number } => {
  // Códigos de erro comuns do PostgreSQL/Supabase com mensagens personalizadas
  const codigosErro = {
    '42501': {
      mensagem: 'Permissão negada no banco de dados',
      detalhes: 'A chave service_role fornecida não tem permissões suficientes para acessar este recurso. Verifique se a chave tem acesso ao schema auth.'
    },
    '42P01': {
      mensagem: 'Tabela ou view não encontrada',
      detalhes: 'A função está tentando acessar uma tabela que não existe. Pode indicar um problema na estrutura do banco de dados.'
    },
    '42883': {
      mensagem: 'Função não encontrada',
      detalhes: 'A função RPC que você está tentando chamar não existe no banco de dados. Verifique se a função get_user_emails foi criada corretamente.'
    },
    '42702': {
      mensagem: 'Referência ambígua a coluna',
      detalhes: 'Existe ambiguidade em uma coluna referenciada na função. Isso geralmente ocorre quando duas tabelas têm colunas com o mesmo nome e não foram especificadas corretamente na consulta SQL.'
    },
    '22P02': {
      mensagem: 'Sintaxe de entrada inválida',
      detalhes: 'Um dos parâmetros fornecidos tem formato inválido, como um UUID mal-formado.'
    },
    '23505': {
      mensagem: 'Violação de chave única',
      detalhes: 'Um registro com chave única já existe. Não é possível inserir um duplicado.'
    },
    '23503': {
      mensagem: 'Violação de chave estrangeira',
      detalhes: 'A operação viola uma restrição de chave estrangeira. O registro referenciado pode não existir.'
    },
    '28000': {
      mensagem: 'Autorização inválida',
      detalhes: 'A chave service_role fornecida é inválida ou foi rejeitada pelo servidor.'
    },
    '3D000': {
      mensagem: 'Banco de dados não existe',
      detalhes: 'O banco de dados referenciado não existe.'
    },
    '3F000': {
      mensagem: 'Schema não existe',
      detalhes: 'O schema referenciado não existe.'
    },
    '08006': {
      mensagem: 'Falha de conexão',
      detalhes: 'Houve uma falha na conexão com o banco de dados. Verifique se o URL do Supabase está correto.'
    }
  };

  const codigoHTTP = error.code?.startsWith('2') || error.code?.startsWith('4') ? 400 : 
                      error.code?.startsWith('5') ? 500 : 
                      error.code?.startsWith('08') ? 503 : undefined;

  // Obter mensagem específica para o código de erro ou usar mensagem genérica
  const infoErro = codigosErro[error.code] || {
    mensagem: `Erro no banco de dados (${error.code || 'código desconhecido'})`,
    detalhes: error.message || 'Erro desconhecido no banco de dados'
  };

  return {
    mensagem: infoErro.mensagem,
    detalhes: infoErro.detalhes,
    codigoHTTP
  };
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
          
          // Analisar o erro para fornecer uma mensagem mais detalhada
          const erroDetalhado = analisarErroSupabase(connectionError);
          
          addLogEntry('error', `Erro na consulta de teste: ${erroDetalhado.mensagem}`, { 
            error: formatErrorForLog(connectionError),
            detalhes: erroDetalhado.detalhes 
          });
          
          return {
            success: false,
            message: erroDetalhado.mensagem,
            detalhes: erroDetalhado.detalhes,
            codigo: connectionError.code
          };
        }
        
        // Agora testamos a RPC específica para emails
        const { data, error } = await adminClient.rpc('get_user_emails');
        
        if (error) {
          // Analisar o erro para fornecer uma mensagem mais detalhada
          const erroDetalhado = analisarErroSupabase(error);
          
          logger.error(`Erro ao testar função RPC get_user_emails: ${erroDetalhado.mensagem}`, {
            error: formatErrorForLog(error),
            detalhes: erroDetalhado.detalhes
          });
          
          addLogEntry('error', `Falha ao acessar emails: ${erroDetalhado.mensagem}`, { 
            error: formatErrorForLog(error),
            detalhes: erroDetalhado.detalhes,
            codigo: error.code 
          });
          
          // Mensagem mais específica se a função RPC não existe
          if (error.code === '42883' || error.message.includes('function') && error.message.includes('does not exist')) {
            return {
              success: false,
              message: 'A função get_user_emails não existe no banco de dados',
              detalhes: 'Verifique se a função RPC foi criada corretamente através do SQL. Esta função deve ter sido criada durante a configuração inicial do projeto.',
              codigo: error.code
            };
          }
          
          // Se for erro de ambiguidade de coluna (comum na função get_user_emails)
          if (error.code === '42702') {
            return {
              success: false,
              message: 'Erro de ambiguidade em coluna na função get_user_emails',
              detalhes: 'A função get_user_emails encontrou ambiguidade em uma coluna. Isso geralmente acontece quando há colunas com o mesmo nome em tabelas diferentes. Verifique se as colunas estão corretamente qualificadas com o nome da tabela.',
              codigo: error.code
            };
          }
          
          return {
            success: false,
            message: erroDetalhado.mensagem,
            detalhes: erroDetalhado.detalhes,
            codigo: error.code
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
          message: 'Erro ao testar a chave service_role fornecida',
          detalhes: testError instanceof Error ? testError.message : 'Erro desconhecido'
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
        // Analisar o erro para fornecer uma mensagem mais detalhada
        const erroDetalhado = analisarErroSupabase(error);
        
        addLogEntry('error', `Falha ao verificar acesso aos emails: ${erroDetalhado.mensagem}`, { 
          error: formatErrorForLog(error),
          detalhes: erroDetalhado.detalhes 
        });
        
        return {
          success: false,
          message: erroDetalhado.mensagem,
          detalhes: erroDetalhado.detalhes,
          codigo: error.code
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
      message: 'Erro ao configurar acesso aos emails',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
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
