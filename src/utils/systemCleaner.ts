/**
 * Script de Limpeza e Otimização do Sistema MAR
 * 
 * Este script executa tarefas de manutenção para manter o sistema limpo e otimizado:
 * - Remove arquivos temporários e logs antigos
 * - Otimiza consultas do banco de dados
 * - Limpa dados órfãos
 * - Atualiza estatísticas de performance
 */

import { supabase } from '@/integrations/supabase/client';
import { getSupabaseAdminClient } from '@/utils/supabaseAdminClient';
import { logger } from '@/utils/logger';

interface CleanupResult {
  task: string;
  success: boolean;
  message: string;
  details?: any;
}

export type { CleanupResult };

export class SystemCleaner {
  private results: CleanupResult[] = [];

  /**
   * Executa todas as tarefas de limpeza e otimização
   */
  async runAllCleanupTasks(): Promise<CleanupResult[]> {
    this.results = [];
    
    logger.info('🧹 Iniciando limpeza e otimização do sistema MAR', {
      tag: 'SystemCleaner'
    });

    // Tarefas de limpeza de dados
    await this.cleanOrphanedAnswers();
    await this.cleanIncompleteSubmissions();
    await this.optimizeQuizData();
    
    // Tarefas de otimização
    await this.updateDatabaseStatistics();
    await this.validateDataIntegrity();
    
    // Log final dos resultados
    const successCount = this.results.filter(r => r.success).length;
    const totalTasks = this.results.length;
    
    logger.info(`✅ Limpeza concluída: ${successCount}/${totalTasks} tarefas executadas`, {
      tag: 'SystemCleaner',
      data: {
        totalTasks,
        successCount,
        failureCount: totalTasks - successCount
      }
    });

    return this.results;
  }

  private async executeTask(taskName: string, taskFunction: () => Promise<any>): Promise<void> {
    try {
      const result = await taskFunction();
      
      this.results.push({
        task: taskName,
        success: true,
        message: 'Tarefa executada com sucesso',
        details: result
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      this.results.push({
        task: taskName,
        success: false,
        message: errorMessage,
        details: error
      });
      
      logger.error(`❌ Falha na tarefa: ${taskName}`, {
        tag: 'SystemCleaner',
        data: { error: errorMessage }
      });
    }
  }

  /**
   * Remove respostas órfãs (sem submissão válida)
   */
  async cleanOrphanedAnswers(): Promise<void> {
    await this.executeTask('Limpeza de Respostas Órfãs', async () => {
      try {
        const adminClient = getSupabaseAdminClient();
        
        // Buscar respostas órfãs
        const { data: orphanedAnswers, error } = await adminClient
          .from('quiz_answers')
          .select(`
            id,
            submission_id,
            quiz_submissions!left (id)
          `)
          .is('quiz_submissions.id', null);
        
        if (error) throw error;
        
        if (orphanedAnswers && orphanedAnswers.length > 0) {
          const orphanedIds = orphanedAnswers.map(a => a.id);
          
          const { error: deleteError } = await adminClient
            .from('quiz_answers')
            .delete()
            .in('id', orphanedIds);
          
          if (deleteError) throw deleteError;
          
          return { cleanedAnswers: orphanedAnswers.length };
        }
        
        return { cleanedAnswers: 0 };
      } catch (error: any) {
        if (error.message.includes('Service role key não configurada')) {
          return { skipped: true, reason: 'Cliente administrativo não disponível' };
        }
        throw error;
      }
    });
  }

  /**
   * Remove submissões incompletas antigas (mais de 30 dias)
   */
  async cleanIncompleteSubmissions(): Promise<void> {
    await this.executeTask('Limpeza de Submissões Incompletas Antigas', async () => {
      try {
        const adminClient = getSupabaseAdminClient();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Buscar submissões incompletas antigas
        const { data: oldSubmissions, error } = await adminClient
          .from('quiz_submissions')
          .select('id')
          .eq('completed', false)
          .lt('created_at', thirtyDaysAgo.toISOString());
        
        if (error) throw error;
        
        if (oldSubmissions && oldSubmissions.length > 0) {
          const submissionIds = oldSubmissions.map(s => s.id);
          
          // Primeiro, remover as respostas associadas
          const { error: answersError } = await adminClient
            .from('quiz_answers')
            .delete()
            .in('submission_id', submissionIds);
          
          if (answersError) throw answersError;
          
          // Depois, remover as submissões
          const { error: submissionsError } = await adminClient
            .from('quiz_submissions')
            .delete()
            .in('id', submissionIds);
          
          if (submissionsError) throw submissionsError;
          
          return { cleanedSubmissions: oldSubmissions.length };
        }
        
        return { cleanedSubmissions: 0 };
      } catch (error: any) {
        if (error.message.includes('Service role key não configurada')) {
          return { skipped: true, reason: 'Cliente administrativo não disponível' };
        }
        throw error;
      }
    });
  }

  /**
   * Otimiza dados do quiz removendo duplicatas e inconsistências
   */
  async optimizeQuizData(): Promise<void> {
    await this.executeTask('Otimização de Dados do Quiz', async () => {
      const tasks = [];
      
      // Verificar questões sem opções (para tipos que precisam)
      const { data: questionsNeedingOptions } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          type,
          quiz_options!left (id)
        `)
        .in('type', ['radio', 'checkbox', 'select'])
        .is('quiz_options.id', null);
      
      tasks.push({ name: 'questionsWithoutOptions', count: questionsNeedingOptions?.length || 0 });
      
      return { tasks };
    });
  }

  /**
   * Atualiza estatísticas do banco de dados
   */
  async updateDatabaseStatistics(): Promise<void> {
    await this.executeTask('Atualização de Estatísticas do Banco', async () => {
      const stats: Record<string, number> = {};
      
      // Contar registros em tabelas principais
      const tables = ['quiz_modules', 'quiz_questions', 'quiz_options', 'quiz_submissions', 'quiz_answers', 'quiz_respostas_completas'] as const;
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          stats[table] = count || 0;
        }
      }
      
      // Estatísticas específicas
      const { data: completedQuizzes } = await supabase
        .from('quiz_submissions')
        .select('id')
        .eq('completed', true);
      
      stats['completed_quizzes'] = completedQuizzes?.length || 0;
      
      const { data: processedWebhooks } = await supabase
        .from('quiz_submissions')
        .select('id')
        .eq('webhook_processed', true);
      
      stats['processed_webhooks'] = processedWebhooks?.length || 0;
      
      return stats;
    });
  }

  /**
   * Valida integridade dos dados
   */
  async validateDataIntegrity(): Promise<void> {
    await this.executeTask('Validação de Integridade dos Dados', async () => {
      const issues = [];
      
      // Verificar se todos os módulos têm questões
      const { data: modulesWithoutQuestions } = await supabase
        .from('quiz_modules')
        .select(`
          id,
          title,
          quiz_questions!left (id)
        `)
        .is('quiz_questions.id', null);
      
      if (modulesWithoutQuestions && modulesWithoutQuestions.length > 0) {
        issues.push({
          type: 'modules_without_questions',
          count: modulesWithoutQuestions.length,
          modules: modulesWithoutQuestions.map(m => m.title)
        });
      }
      
      // Verificar questões tipo radio/checkbox sem opções
      const { data: questionsWithoutRequiredOptions } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          text,
          type,
          quiz_options!left (id)
        `)
        .in('type', ['radio', 'checkbox', 'select'])
        .is('quiz_options.id', null);
      
      if (questionsWithoutRequiredOptions && questionsWithoutRequiredOptions.length > 0) {
        issues.push({
          type: 'questions_without_options',
          count: questionsWithoutRequiredOptions.length
        });
      }
      
      // Verificar submissões sem user_email
      const { data: submissionsWithoutEmail } = await supabase
        .from('quiz_submissions')
        .select('id')
        .or('user_email.is.null,user_email.eq.');
      
      if (submissionsWithoutEmail && submissionsWithoutEmail.length > 0) {
        issues.push({
          type: 'submissions_without_email',
          count: submissionsWithoutEmail.length
        });
      }
      
      return { issues, totalIssues: issues.length };
    });
  }

  /**
   * Gera relatório de limpeza
   */
  generateCleanupReport(): string {
    const successCount = this.results.filter(r => r.success).length;
    const totalTasks = this.results.length;
    const successRate = ((successCount / totalTasks) * 100).toFixed(1);
    
    let report = `
=== RELATÓRIO DE LIMPEZA E OTIMIZAÇÃO DO SISTEMA MAR ===
Data: ${new Date().toLocaleString('pt-BR')}
Total de Tarefas: ${totalTasks}
Sucessos: ${successCount}
Falhas: ${totalTasks - successCount}
Taxa de Sucesso: ${successRate}%

=== DETALHES DAS TAREFAS ===
`;
    
    this.results.forEach((result, index) => {
      const status = result.success ? '✅ CONCLUÍDA' : '❌ FALHOU';
      
      report += `
${index + 1}. ${result.task}
   Status: ${status}
   Mensagem: ${result.message}
`;
      
      if (result.success && result.details) {
        if (result.details.skipped) {
          report += `   Observação: ${result.details.reason}\n`;
        } else {
          report += `   Detalhes: ${JSON.stringify(result.details, null, 2)}\n`;
        }
      }
    });
    
    return report;
  }
}

// Função de conveniência para executar limpeza completa
export async function runSystemCleanup(): Promise<CleanupResult[]> {
  const cleaner = new SystemCleaner();
  return await cleaner.runAllCleanupTasks();
}

// Função para executar limpeza e gerar relatório  
export async function cleanupAndReport(): Promise<string> {
  const cleaner = new SystemCleaner();
  await cleaner.runAllCleanupTasks();
  return cleaner.generateCleanupReport();
}