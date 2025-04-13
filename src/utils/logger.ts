
/**
 * Sistema de Logs - MAR Crie Valor
 * 
 * Este módulo fornece funcionalidades abrangentes para registrar eventos do sistema,
 * permitindo rastreamento detalhado de ações, erros e interações do usuário.
 */

interface LogOptions {
  // Campos básicos
  tag?: string;
  data?: any;
  
  // Campos específicos (opcionais)
  error?: any;
  userId?: string;
  userEmail?: string;
  userName?: string;
  path?: string;
  component?: string;
  module?: string;
  question?: string;
  submissionId?: string;
  isAdmin?: boolean;
  result?: any;
  response?: any;
  status?: string;
  duration?: number; // em milissegundos
  
  // Campo dinâmico para outros dados
  [key: string]: any;
}

export const LogCategory = {
  AUTH: 'auth',          // Autenticação e autorização
  NAVIGATION: 'nav',     // Navegação entre páginas/rotas
  QUIZ: 'quiz',          // Interações com o questionário
  API: 'api',            // Chamadas de API
  DATABASE: 'db',        // Operações de banco de dados
  UI: 'ui',              // Interações de interface do usuário
  SYSTEM: 'system',      // Eventos do sistema
  ADMIN: 'admin',        // Ações administrativas
  EXPORT: 'export',      // Exportação de dados
  PERFORMANCE: 'perf'    // Métricas de performance
};

/**
 * Registra tempo de início para medição de performance
 */
const performanceMarkers: Record<string, number> = {};

export const startPerformanceMarker = (markerId: string): void => {
  performanceMarkers[markerId] = performance.now();
};

export const endPerformanceMarker = (markerId: string, category: string, message: string, options?: LogOptions): void => {
  if (performanceMarkers[markerId]) {
    const duration = performance.now() - performanceMarkers[markerId];
    logger.performance(message, { ...options, duration, category });
    delete performanceMarkers[markerId];
  } else {
    logger.warn(`Marcador de performance "${markerId}" não encontrado`, { category: LogCategory.PERFORMANCE });
  }
};

/**
 * Formata dados para log com informações de contexto consistentes
 */
const formatLogData = (options?: LogOptions): any => {
  if (!options) return {};
  
  // Extrair dados básicos
  const { error, ...restOptions } = options;
  
  // Adicionar timestamp
  const timestamp = new Date().toISOString();
  
  // Adicionar informações do usuário atual se disponível
  let userData = {};
  try {
    const storedUser = localStorage.getItem('supabase.auth.token');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      userData = {
        currentUserId: parsedUser?.user?.id || 'anonymous',
        currentUserEmail: parsedUser?.user?.email || 'unknown'
      };
    }
  } catch (e) {
    // Ignore errors accessing localStorage
  }
  
  // Adicionar informações da página atual
  const pageInfo = {
    currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };
  
  return {
    ...userData,
    ...pageInfo,
    ...restOptions,
    timestamp,
    environment: process.env.NODE_ENV || 'development'
  };
};

export const logger = {
  info: (message: string, options?: LogOptions) => {
    console.info(`[INFO] ${message}`, formatLogData(options));
    // Enviar para armazenamento persistente (localStorage ou Supabase)
    storeLog('info', message, options);
  },
  
  warn: (message: string, options?: LogOptions) => {
    console.warn(`[WARN] ${message}`, formatLogData(options));
    storeLog('warn', message, options);
  },
  
  error: (message: string, options?: LogOptions) => {
    console.error(`[ERROR] ${message}`, formatLogData(options));
    
    // Log da stack trace para facilitar a depuração
    if (options?.error instanceof Error) {
      console.error(`[ERROR STACK] ${options.error.stack}`);
    }
    
    storeLog('error', message, {
      ...options,
      stack: options?.error instanceof Error ? options.error.stack : undefined
    });
  },
  
  debug: (message: string, options?: LogOptions) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, formatLogData(options));
      storeLog('debug', message, options);
    }
  },
  
  // Log específico para autenticação
  auth: (message: string, options?: LogOptions) => {
    console.info(`[AUTH] ${message}`, formatLogData({ ...options, category: LogCategory.AUTH }));
    storeLog('auth', message, { ...options, category: LogCategory.AUTH });
  },
  
  // Log específico para navegação
  navigation: (message: string, options?: LogOptions) => {
    console.info(`[NAV] ${message}`, formatLogData({ ...options, category: LogCategory.NAVIGATION }));
    storeLog('navigation', message, { ...options, category: LogCategory.NAVIGATION });
  },
  
  // Log específico para questionário
  quiz: (message: string, options?: LogOptions) => {
    console.info(`[QUIZ] ${message}`, formatLogData({ ...options, category: LogCategory.QUIZ }));
    storeLog('quiz', message, { ...options, category: LogCategory.QUIZ });
  },
  
  // Log específico para API
  api: (message: string, options?: LogOptions) => {
    console.info(`[API] ${message}`, formatLogData({ ...options, category: LogCategory.API }));
    storeLog('api', message, { ...options, category: LogCategory.API });
  },
  
  // Log específico para banco de dados
  db: (message: string, options?: LogOptions) => {
    console.info(`[DATABASE] ${message}`, formatLogData({ ...options, category: LogCategory.DATABASE }));
    storeLog('database', message, { ...options, category: LogCategory.DATABASE });
  },
  
  // Log específico para UI
  ui: (message: string, options?: LogOptions) => {
    console.info(`[UI] ${message}`, formatLogData({ ...options, category: LogCategory.UI }));
    storeLog('ui', message, { ...options, category: LogCategory.UI });
  },
  
  // Log específico para ações administrativas
  admin: (message: string, options?: LogOptions) => {
    console.info(`[ADMIN] ${message}`, formatLogData({ ...options, category: LogCategory.ADMIN }));
    storeLog('admin', message, { ...options, category: LogCategory.ADMIN });
  },
  
  // Log específico para performance
  performance: (message: string, options?: LogOptions) => {
    console.info(`[PERF] ${message}`, formatLogData({ ...options, category: LogCategory.PERFORMANCE }));
    storeLog('performance', message, { ...options, category: LogCategory.PERFORMANCE });
  }
};

// Limite de logs armazenados em localStorage
const MAX_LOCAL_LOGS = 500;

// Função para armazenar logs (primeiro em localStorage, depois em Supabase se possível)
function storeLog(level: string, message: string, options?: LogOptions): void {
  try {
    if (typeof window === 'undefined') return;
    
    // Formatar o log para armazenamento
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...formatLogData(options)
    };
    
    // Armazenar no localStorage
    const existingLogs = JSON.parse(localStorage.getItem('mar_system_logs') || '[]');
    existingLogs.push(logEntry);
    
    // Limitar o número de logs armazenados
    const trimmedLogs = existingLogs.slice(-MAX_LOCAL_LOGS);
    localStorage.setItem('mar_system_logs', JSON.stringify(trimmedLogs));
    
    // TODO: Implementar envio para Supabase em lote
    // Esta funcionalidade será implementada posteriormente
  } catch (e) {
    console.error('Erro ao armazenar log:', e);
  }
}

// Exportar utilitários adicionais
export const logNavigation = (path: string, userId?: string) => {
  logger.navigation(`Navegação para: ${path}`, { path, userId });
};

export const logAuth = (action: string, success: boolean, userId?: string, error?: any) => {
  logger.auth(`Ação de autenticação: ${action} - ${success ? 'Sucesso' : 'Falha'}`, { 
    action, success, userId, error 
  });
};

export const logQuizAction = (action: string, moduleId?: string, questionId?: string, userId?: string) => {
  logger.quiz(`Ação no questionário: ${action}`, { action, moduleId, questionId, userId });
};

export const logError = (error: Error, context: string, userId?: string) => {
  logger.error(`Erro em ${context}`, { error, context, userId });
};

// Inicializar
logger.info('Sistema de logs inicializado', { 
  timestamp: new Date().toISOString(),
  version: '2.0.0'
});
