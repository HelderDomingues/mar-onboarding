
/**
 * Utilitários para gerenciamento de erros no sistema MAR - Crie Valor
 * 
 * Este arquivo contém funções para formatação, conversão e manipulação de erros
 * seguindo os padrões definidos no sistema.
 */

import { SystemError, ErrorCategory, getErrorCategory } from '@/types/errors';
import { logger } from '@/utils/logger';

/**
 * Formata um erro em um objeto SystemError padronizado
 */
export const formatError = (
  error: any, 
  context: string = 'unknown',
  extraInfo: Record<string, any> = {}
): SystemError => {
  // Se já for um SystemError, apenas complementa informações faltantes
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: error.message || 'Erro desconhecido',
      code: error.code || error.errorCode || extraInfo.code,
      details: error.details || error.errorDetails || extraInfo.details,
      hint: error.hint || error.errorHint || extraInfo.hint,
      origin: error.origin || extraInfo.origin || determineErrorOrigin(error),
      timestamp: new Date().toISOString(),
      context,
      ...extraInfo
    };
  }
  
  // Se for uma string, cria SystemError com ela como mensagem
  if (typeof error === 'string') {
    return {
      message: error,
      timestamp: new Date().toISOString(),
      context,
      ...extraInfo
    };
  }
  
  // Se for um erro PostgreSQL/Supabase (tem código, mensagem, detalhes e hint)
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return {
      message: error.message,
      code: error.code,
      details: error.details || extraInfo.details,
      hint: error.hint || extraInfo.hint,
      origin: 'supabase',
      timestamp: new Date().toISOString(),
      context,
      ...extraInfo
    };
  }
  
  // Último caso: erro desconhecido
  return {
    message: error instanceof Error ? error.message : 'Erro desconhecido',
    details: error instanceof Error ? error.stack : JSON.stringify(error),
    origin: 'unknown',
    timestamp: new Date().toISOString(),
    context,
    ...extraInfo
  };
};

/**
 * Tenta determinar a origem do erro com base na sua estrutura
 */
const determineErrorOrigin = (error: any): string => {
  if (error.direct) return 'direct';
  if (error.rpc) return 'rpc';
  if (error.code && typeof error.code === 'string' && error.code.match(/^[0-9]+$/)) return 'supabase';
  if (error.name === 'ValidationError') return 'validation';
  if (error.name === 'TypeError' || error.name === 'ReferenceError') return 'client';
  return 'unknown';
};

/**
 * Formata um erro para exibição ao usuário
 */
export const formatErrorForDisplay = (error: SystemError): string => {
  let message = error.message || 'Ocorreu um erro inesperado';
  
  // Adiciona código se existir
  if (error.code) {
    message += ` (Código: ${error.code})`;
  }
  
  // Adiciona dica se existir
  if (error.hint) {
    message += `. Dica: ${error.hint}`;
  }
  
  return message;
};

/**
 * Formata uma mensagem de erro técnica para desenvolvedores
 */
export const formatTechnicalError = (error: SystemError): string => {
  const parts: string[] = [];
  
  // Mensagem principal
  parts.push(`Erro: ${error.message}`);
  
  // Código
  if (error.code) {
    parts.push(`Código: ${error.code}`);
  }
  
  // Categoria
  const category = error.code ? getErrorCategory(error.code) : ErrorCategory.UNKNOWN;
  parts.push(`Categoria: ${category}`);
  
  // Origem
  if (error.origin) {
    parts.push(`Origem: ${error.origin}`);
  }
  
  // Dica
  if (error.hint) {
    parts.push(`Dica: ${error.hint}`);
  }
  
  // Detalhes
  if (error.details) {
    parts.push(`Detalhes: ${typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}`);
  }
  
  // Contexto
  if (error.context) {
    parts.push(`Contexto: ${error.context}`);
  }
  
  return parts.join('\n');
};

/**
 * Registra um erro no sistema de log
 */
export const logError = (error: SystemError, tag: string = 'Error'): void => {
  logger.error(error.message, {
    tag,
    data: {
      ...error,
      category: error.code ? getErrorCategory(error.code) : ErrorCategory.UNKNOWN
    }
  });
};

/**
 * Analisa um erro do Supabase e o converte para SystemError
 */
export const parseSupabaseError = (error: any, context: string = 'supabase'): SystemError => {
  // Caso de erro nulo ou indefinido
  if (!error) {
    return {
      message: 'Erro desconhecido do Supabase',
      origin: 'supabase',
      context,
      timestamp: new Date().toISOString()
    };
  }
  
  // Caso específico para a estrutura de erro do Supabase
  return {
    message: error.message || 'Erro no Supabase',
    code: error.code,
    details: error.details || null,
    hint: error.hint || null,
    origin: 'supabase',
    context,
    timestamp: new Date().toISOString(),
    debugInfo: error
  };
};

/**
 * Verifica se o erro é um erro de permissão do Supabase (código 42501)
 */
export const isPermissionError = (error: any): boolean => {
  if (!error) return false;
  
  return (
    (error.code === '42501') || 
    (error.message && error.message.includes('permission denied')) ||
    (error.details && error.details.includes('permission denied'))
  );
};

/**
 * Cria um erro de validação padronizado
 */
export const createValidationError = (message: string, field?: string): SystemError => {
  return {
    message,
    code: 'VALIDATION_ERROR',
    origin: 'validation',
    context: 'validation',
    details: field ? { field } : undefined,
    timestamp: new Date().toISOString()
  };
};
