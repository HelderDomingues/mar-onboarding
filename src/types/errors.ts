
/**
 * Tipos de erro padronizados para o sistema MAR - Crie Valor
 * 
 * Este arquivo define interfaces para padronizar a estrutura de erros
 * em todo o sistema, facilitando o tratamento e exibição consistente.
 */

/**
 * Interface para erros do sistema
 */
export interface SystemError {
  message: string;            // Mensagem principal do erro
  code?: string;              // Código de erro (ex: "42501", "EMAIL_NOT_FOUND")
  details?: string | any;     // Detalhes adicionais sobre o erro
  hint?: string;              // Dica para resolver o erro
  origin?: 'direct' | 'rpc' | 'supabase' | 'client' | 'validation' | string; // Origem do erro
  timestamp?: string;         // Momento em que o erro ocorreu
  context?: string;           // Contexto adicional (módulo, função, etc)
  debugInfo?: any;            // Informações técnicas para depuração (não exibidas ao usuário)
}

/**
 * Interface para respostas de operações que podem falhar
 */
export interface OperationResult<T = any> {
  success: boolean;           // Se a operação foi bem-sucedida
  data?: T;                   // Dados retornados (se bem-sucedido)
  error?: SystemError;        // Informações de erro (se falhou)
  message?: string;           // Mensagem amigável para o usuário
  method?: string;            // Método usado na operação
}

/**
 * Enum para categorias de erro
 */
export enum ErrorCategory {
  PERMISSION = 'permission',  // Erros de permissão
  VALIDATION = 'validation',  // Erros de validação
  DATABASE = 'database',      // Erros de banco de dados
  AUTH = 'auth',              // Erros de autenticação
  NETWORK = 'network',        // Erros de rede/comunicação
  UNKNOWN = 'unknown'         // Erros desconhecidos
}

/**
 * Códigos de erro conhecidos do Supabase
 */
export enum SupabaseErrorCode {
  PERMISSION_DENIED = '42501',   // Permissão negada
  FOREIGN_KEY_VIOLATION = '23503', // Violação de chave estrangeira
  UNIQUE_VIOLATION = '23505',    // Violação de unicidade
  NOT_NULL_VIOLATION = '23502',  // Violação de not null
  CHECK_VIOLATION = '23514',     // Violação de restrição check
}

/**
 * Função auxiliar para determinar a categoria de um erro com base no código
 */
export const getErrorCategory = (code?: string): ErrorCategory => {
  if (!code) return ErrorCategory.UNKNOWN;
  
  if (code === SupabaseErrorCode.PERMISSION_DENIED) 
    return ErrorCategory.PERMISSION;
  
  if (['VALIDATION_ERROR', 'INVALID_INPUT'].includes(code))
    return ErrorCategory.VALIDATION;
  
  if (code.startsWith('23') || code.startsWith('42'))
    return ErrorCategory.DATABASE;
  
  if (['AUTH_ERROR', 'EMAIL_NOT_FOUND', 'INVALID_CREDENTIALS'].includes(code))
    return ErrorCategory.AUTH;
  
  if (['NETWORK_ERROR', 'TIMEOUT'].includes(code))
    return ErrorCategory.NETWORK;
  
  return ErrorCategory.UNKNOWN;
};
