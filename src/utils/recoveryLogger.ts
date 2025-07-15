/**
 * MAR Project Recovery Logger
 * Sistema de logging estruturado para rastrear progresso da recuperação
 */

interface RecoveryLogEntry {
  timestamp: string;
  phase: string;
  step: string;
  action: string;
  status: 'START' | 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  details?: any;
  error?: string;
}

class RecoveryLogger {
  private logs: RecoveryLogEntry[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = `recovery_${Date.now()}`;
    this.log('SYSTEM', 'INIT', 'Sistema de logging iniciado', 'START', {
      sessionId: this.sessionId,
      startTime: new Date().toISOString()
    });
  }

  log(phase: string, step: string, action: string, status: RecoveryLogEntry['status'], details?: any, error?: string) {
    const entry: RecoveryLogEntry = {
      timestamp: new Date().toISOString(),
      phase,
      step,
      action,
      status,
      details,
      error
    };

    this.logs.push(entry);
    
    // Console output com formatação colorida
    const emoji = this.getStatusEmoji(status);
    const color = this.getStatusColor(status);
    
    console.group(`🔧 MAR Recovery | ${emoji} ${phase}.${step}`);
    console.log(`%c${action}`, `color: ${color}; font-weight: bold;`);
    
    if (details) {
      console.log('📊 Detalhes:', details);
    }
    
    if (error) {
      console.error('❌ Erro:', error);
    }
    
    console.log(`⏰ ${entry.timestamp}`);
    console.groupEnd();

    // Salvar no localStorage para persistência
    this.saveToStorage();
  }

  private getStatusEmoji(status: RecoveryLogEntry['status']): string {
    switch (status) {
      case 'START': return '🚀';
      case 'SUCCESS': return '✅';
      case 'ERROR': return '❌';
      case 'WARNING': return '⚠️';
      case 'INFO': return 'ℹ️';
      default: return '📝';
    }
  }

  private getStatusColor(status: RecoveryLogEntry['status']): string {
    switch (status) {
      case 'START': return '#3b82f6';
      case 'SUCCESS': return '#10b981';
      case 'ERROR': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      case 'INFO': return '#6b7280';
      default: return '#374151';
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(`mar_recovery_logs_${this.sessionId}`, JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Não foi possível salvar logs no localStorage:', error);
    }
  }

  // Métodos de conveniência para diferentes tipos de log
  startStep(phase: string, step: string, action: string, details?: any) {
    this.log(phase, step, action, 'START', details);
  }

  successStep(phase: string, step: string, action: string, details?: any) {
    this.log(phase, step, action, 'SUCCESS', details);
  }

  errorStep(phase: string, step: string, action: string, error: string, details?: any) {
    this.log(phase, step, action, 'ERROR', details, error);
  }

  warningStep(phase: string, step: string, action: string, details?: any) {
    this.log(phase, step, action, 'WARNING', details);
  }

  infoStep(phase: string, step: string, action: string, details?: any) {
    this.log(phase, step, action, 'INFO', details);
  }

  // Relatório de progresso
  getProgress(): { total: number; success: number; errors: number; warnings: number } {
    return {
      total: this.logs.length,
      success: this.logs.filter(l => l.status === 'SUCCESS').length,
      errors: this.logs.filter(l => l.status === 'ERROR').length,
      warnings: this.logs.filter(l => l.status === 'WARNING').length
    };
  }

  // Exportar logs para revisão
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      logs: this.logs,
      summary: this.getProgress()
    }, null, 2);
  }

  // Limpar logs antigos
  clearOldLogs() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('mar_recovery_logs_') && key !== `mar_recovery_logs_${this.sessionId}`) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Instância global do logger
export const recoveryLogger = new RecoveryLogger();

// Log inicial do sistema
recoveryLogger.infoStep('SYSTEM', 'SETUP', 'Recovery Logger inicializado com sucesso', {
  version: '1.0.0',
  features: ['Console colorido', 'Persistência localStorage', 'Relatórios de progresso']
});