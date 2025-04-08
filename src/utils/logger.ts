
interface LogOptions {
  // Campos básicos
  tag?: string;
  data?: any;
  
  // Campos específicos (opcionais)
  error?: any;
  userId?: string;
  submissionId?: string;
  isAdmin?: boolean;
  result?: any;
  response?: any;
  
  // Campo dinâmico para outros dados
  [key: string]: any;
}

export const logger = {
  info: (message: string, options?: LogOptions) => {
    console.info(`[INFO] ${message}`, options);
  },
  warn: (message: string, options?: LogOptions) => {
    console.warn(`[WARN] ${message}`, options);
  },
  error: (message: string, options?: LogOptions) => {
    console.error(`[ERROR] ${message}`, options?.error || options);
    
    // Log da stack trace para facilitar a depuração
    if (options?.error instanceof Error) {
      console.error(`[ERROR STACK] ${options.error.stack}`);
    }
  },
  debug: (message: string, options?: LogOptions) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, options);
    }
  }
};
