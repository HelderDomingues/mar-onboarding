
/**
 * Sistema de Log do Projeto MAR - Crie Valor
 * 
 * Este arquivo contém funções para registrar e consultar logs do sistema,
 * auxiliando no diagnóstico de problemas e na documentação do desenvolvimento.
 */

import { logger } from './logger';
import { supabase } from '@/integrations/supabase/client';

// Interface para os logs
export type LogType = 'error' | 'warning' | 'info' | 'build' | 'auth' | 'database' | 'admin' | 'navigation' | 'quiz' | 'validation';

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

// Tamanho máximo do log em memória para evitar vazamentos de memória
const MAX_LOG_SIZE = 500;

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
  
  // Adiciona ao log em memória (limitando o tamanho)
  if (inMemoryLogs.length >= MAX_LOG_SIZE) {
    inMemoryLogs.shift(); // Remove o item mais antigo
  }
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
    case 'validation':
      logger.warn(message, { ...details, userId, context, category: 'validation' });
      break;
    default:
      logger.info(message, { ...details, userId, context });
  }
  
  // Se estiver em ambiente de desenvolvimento, também salvar em localStorage
  try {
    if (typeof window !== 'undefined') {
      const existingLogs = JSON.parse(localStorage.getItem('mar_system_logs') || '[]');
      existingLogs.push(entry);
      // Limitar tamanho do localStorage para evitar estouro de quota
      localStorage.setItem('mar_system_logs', JSON.stringify(existingLogs.slice(-MAX_LOG_SIZE)));
    }
  } catch (e) {
    console.error('Erro ao salvar logs no localStorage:', e);
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
 * Nova função para registrar erros de validação
 */
export const logValidationError = (
  fieldName: string, 
  errorMessage: string, 
  value: any, 
  questionId?: string,
  moduleId?: string,
  userId?: string
): void => {
  addLogEntry(
    'validation',
    `Erro de validação no campo: ${fieldName}`,
    {
      field: fieldName,
      error: errorMessage,
      value,
      questionId,
      moduleId,
      timestamp: new Date().toISOString()
    },
    userId,
    'validation'
  );
};

/**
 * Função para limpar todos os logs em memória
 */
export const clearLogs = (): void => {
  inMemoryLogs.length = 0;
  if (typeof window !== 'undefined') {
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
if (typeof window !== 'undefined') {
  try {
    const savedLogs = localStorage.getItem('mar_system_logs');
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs);
      // Limitar o número de logs carregados para evitar sobrecarga de memória
      parsedLogs.slice(-MAX_LOG_SIZE).forEach((log: LogEntry) => inMemoryLogs.push(log));
    }
  } catch (e) {
    console.error('Erro ao carregar logs do localStorage:', e);
  }
}

// Registra inicialização do sistema de logs
addLogEntry('info', 'Sistema de logs inicializado', { 
  timestamp: new Date().toISOString(),
  environment: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
});

// Registra problemas encontrados com a configuração do service_role
addLogEntry('error', 'Problema persistente na configuração da chave service_role', { 
  detalhes: 'Após várias tentativas de correção, incluindo renomeação de colunas e atualização de funções no banco de dados, o problema persiste quando o botão de salvar configuração é clicado',
  dataTentativa: new Date().toISOString(),
  decisao: 'Adiado para focar em outras funcionalidades críticas'
});

// Registra problema com links quebrados no dashboard
addLogEntry('warning', 'Links quebrados no dashboard administrativo detectados', { 
  detalhes: 'Vários botões e links no dashboard administrativo estão levando a páginas 404',
  planoAcao: 'Revisar todos os links e criar as páginas necessárias'
});

// Registra a configuração do bucket de storage para materiais
addLogEntry('info', 'Bucket de storage para materiais configurado', {
  bucket: 'materials',
  detalhes: 'Bucket criado com sucesso, políticas de acesso configuradas e tabelas de metadados criadas',
  dataCriacao: new Date().toISOString()
});

// Registra a correção dos links no dashboard administrativo
addLogEntry('info', 'Links no dashboard administrativo corrigidos', {
  detalhes: 'Corrigidos links para Questionários Completos, Em Progresso, Taxa de Conclusão e Relatórios',
  paginasCriadas: ['Reports.tsx'],
  dataCorrecao: new Date().toISOString()
});
