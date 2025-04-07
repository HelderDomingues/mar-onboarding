
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  tag?: string;
  data?: any;
  error?: any;
  userId?: string;
  submissionId?: string;
  result?: any;
  response?: any;
}

class Logger {
  private enabled: boolean;
  private logToConsole: boolean;

  constructor() {
    this.enabled = true;
    this.logToConsole = true;
  }

  enableLogging(enable: boolean) {
    this.enabled = enable;
  }

  enableConsoleOutput(enable: boolean) {
    this.logToConsole = enable;
  }

  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const tag = options?.tag ? `[${options.tag}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${tag} ${message}`;
  }

  info(message: string, options?: LogOptions) {
    if (!this.enabled) return;
    
    const formattedMessage = this.formatMessage('info', message, options);
    
    if (this.logToConsole) {
      console.info(formattedMessage, options?.data || '');
    }
    
    // Aqui podemos adicionar lógica para salvar logs em localStorage ou enviar para o backend
  }

  warn(message: string, options?: LogOptions) {
    if (!this.enabled) return;
    
    const formattedMessage = this.formatMessage('warn', message, options);
    
    if (this.logToConsole) {
      console.warn(formattedMessage, options?.data || '');
    }
  }

  error(message: string, options?: LogOptions) {
    if (!this.enabled) return;
    
    const formattedMessage = this.formatMessage('error', message, options);
    
    if (this.logToConsole) {
      console.error(formattedMessage, options?.data || '');
    }
  }

  debug(message: string, options?: LogOptions) {
    if (!this.enabled) return;
    
    const formattedMessage = this.formatMessage('debug', message, options);
    
    if (this.logToConsole) {
      console.debug(formattedMessage, options?.data || '');
    }
  }
}

// Exporta uma instância única para uso em toda a aplicação
export const logger = new Logger();
