
/**
 * Sistema de Log do Projeto MAR - Crie Valor
 * 
 * Este arquivo contém funções para registrar e consultar logs do sistema,
 * auxiliando no diagnóstico de problemas e na documentação do desenvolvimento.
 */

import { logger } from './logger';
import { supabase } from '@/integrations/supabase/client';

// Interface para os logs
export type LogType = 'error' | 'warning' | 'info' | 'build' | 'auth' | 'database' | 'admin' | 'navigation' | 'quiz';

export interface LogEntry {
  timestamp: string;
  type: LogType;
  message: string;
  details?: any; // Adicionado campo details para armazenar informações adicionais
  context?: string;
  userId?: string;
}

export interface LogOptions {
  status?: string;
  message?: string;
  code?: string;
  [key: string]: any;
}

// Armazenamento local dos logs (em memória)
const inMemoryLogs: LogEntry[] = [];

/**
 * Função para adicionar uma entrada no log
 */
export const addLogEntry = (
  type: LogEntry['type'], 
  message: string, 
  details?: any, 
  userId?: string,
  context?: string
): void => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    details,
    userId,
    context
  };
  
  // Adiciona ao log em memória
  inMemoryLogs.push(entry);
  
  // Também usa o sistema de logger existente
  switch(type) {
    case 'error':
      logger.error(message, { ...details, userId, context });
      break;
    case 'warning':
      logger.warn(message, { ...details, userId, context });
      break;
    case 'database':
      logger.db(message, { ...details, userId, context });
      break;
    default:
      logger.info(message, { ...details, userId, context });
  }
  
  // Se estiver em ambiente de desenvolvimento, também salvar em localStorage
  if (process.env.NODE_ENV !== 'production') {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('mar_system_logs') || '[]');
      existingLogs.push(entry);
      localStorage.setItem('mar_system_logs', JSON.stringify(existingLogs.slice(-500))); // Mantém os últimos 500 logs
    } catch (e) {
      console.error('Erro ao salvar logs no localStorage:', e);
    }
  }
};

/**
 * Função para obter todos os logs
 */
export const getAllLogs = (): LogEntry[] => {
  return [...inMemoryLogs];
};

/**
 * Função para obter logs por tipo
 */
export const getLogsByType = (type: LogEntry['type']): LogEntry[] => {
  return inMemoryLogs.filter(log => log.type === type);
};

/**
 * Função para obter logs por usuário
 */
export const getLogsByUser = (userId: string): LogEntry[] => {
  return inMemoryLogs.filter(log => log.userId === userId);
};

/**
 * Função para limpar todos os logs em memória
 */
export const clearLogs = (): void => {
  inMemoryLogs.length = 0;
  if (process.env.NODE_ENV !== 'production') {
    localStorage.removeItem('mar_system_logs');
  }
};

/**
 * Exportar logs para arquivo (utilizável apenas em ambiente admin)
 */
export const exportLogsToFile = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Verifica se o usuário é admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    
    if (adminError || !isAdmin) {
      addLogEntry('error', 'Tentativa não autorizada de exportar logs', { userId }, userId);
      return false;
    }
    
    const logText = JSON.stringify(inMemoryLogs, null, 2);
    const blob = new Blob([logText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mar_system_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    addLogEntry('info', 'Logs exportados com sucesso', {}, userId);
    
    return true;
  } catch (error) {
    addLogEntry('error', 'Erro ao exportar logs', { error }, userId);
    return false;
  }
};

// Inicialização: carrega logs do localStorage se disponível
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    const savedLogs = localStorage.getItem('mar_system_logs');
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs);
      parsedLogs.forEach((log: LogEntry) => inMemoryLogs.push(log));
    }
  } catch (e) {
    console.error('Erro ao carregar logs do localStorage:', e);
  }
}

// Registra inicialização do sistema de logs
addLogEntry('info', 'Sistema de logs inicializado', { 
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV 
});
