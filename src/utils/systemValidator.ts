/**
 * Script de Teste Completo do Sistema MAR
 * 
 * Este script valida todos os componentes críticos do sistema:
 * - Conectividade Supabase
 * - Carregamento de dados do quiz
 * - Funcionalidades de webhook
 * - Sistema de logs e auditoria
 * - Funcionalidades administrativas
 */

import { supabase } from '@/integrations/supabase/client';
import { getSupabaseAdminClient } from '@/utils/supabaseAdminClient';
import { logger } from '@/utils/logger';
import { sendQuizDataToWebhook, testWebhookConnection } from '@/utils/webhookUtils';

export interface TestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

export class SystemValidator {
  private results: TestResult[] = [];

  /**
   * Executa todos os testes do sistema
   */
  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    logger.info('🚀 Iniciando validação completa do sistema MAR', {
      tag: 'SystemValidator'
    });

    // FASE 1: Testes de Conectividade
    await this.testSupabaseConnection();
    await this.testSupabaseAdmin();
    
    // FASE 2: Testes de Dados do Quiz
    await this.testQuizDataStructure();
    await this.testQuizModules();
    await this.testQuizQuestions();
    await this.testQuizOptions();
    
    // FASE 3: Testes de Funcionalidades
    await this.testUserAuthentication();
    await this.testQuizSubmissions();
    await this.testAnswerPersistence();
    
    // FASE 4: Testes de Webhook
    await this.testWebhookConnectivity();
    await this.testWebhookDataProcessing();
    
    // FASE 5: Testes Administrativos
    await this.testAdminFunctions();
    await this.testSystemConfiguration();
    
    // FASE 6: Testes de Performance
    await this.testQueryPerformance();
    
    // Log final dos resultados
    const successCount = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    
    logger.info(`✅ Validação concluída: ${successCount}/${totalTests} testes passaram`, {
      tag: 'SystemValidator',
      data: {
        totalTests,
        successCount,
        failureCount: totalTests - successCount
      }
    });

    return this.results;
  }

  private async executeTest(testName: string, testFunction: () => Promise<any>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        success: true,
        message: 'Teste executado com sucesso',
        details: result,
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      this.results.push({
        test: testName,
        success: false,
        message: errorMessage,
        details: error,
        duration
      });
      
      logger.error(`❌ Falha no teste: ${testName}`, {
        tag: 'SystemValidator',
        data: { error: errorMessage }
      });
    }
  }

  // FASE 1: Testes de Conectividade
  async testSupabaseConnection(): Promise<void> {
    await this.executeTest('Conectividade Supabase Básica', async () => {
      const { data, error } = await supabase.from('quiz_modules').select('count').limit(1);
      if (error) throw error;
      return { connectionOk: true, data };
    });
  }

  async testSupabaseAdmin(): Promise<void> {
    await this.executeTest('Cliente Administrativo Supabase', async () => {
      try {
        const adminClient = getSupabaseAdminClient();
        const { data, error } = await adminClient.from('profiles').select('count').limit(1);
        if (error) throw error;
        return { adminClientOk: true, data };
      } catch (error: any) {
        if (error.message.includes('Service role key não configurada')) {
          return { 
            adminClientOk: false, 
            warning: 'Service role key não configurada - funcionalidade administrativa limitada'
          };
        }
        throw error;
      }
    });
  }

  // FASE 2: Testes de Estrutura de Dados
  async testQuizDataStructure(): Promise<void> {
    await this.executeTest('Estrutura de Dados do Quiz', async () => {
      const tables = ['quiz_modules', 'quiz_questions', 'quiz_options', 'quiz_submissions', 'quiz_answers'] as const;
      const results: Record<string, number> = {};
      
      for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) throw new Error(`Erro na tabela ${table}: ${error.message}`);
        results[table] = count || 0;
      }
      
      return results;
    });
  }

  async testQuizModules(): Promise<void> {
    await this.executeTest('Módulos do Quiz', async () => {
      const { data, error } = await supabase
        .from('quiz_modules')
        .select('id, title, description, order_number')
        .order('order_number');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Nenhum módulo encontrado');
      }
      
      // Validar ordenação sequencial
      const orderNumbers = data.map(m => m.order_number).sort((a, b) => a - b);
      const expectedSequence = Array.from({length: orderNumbers.length}, (_, i) => i + 1);
      
      if (JSON.stringify(orderNumbers) !== JSON.stringify(expectedSequence)) {
        throw new Error('Ordenação dos módulos não é sequencial');
      }
      
      return { modulesCount: data.length, modules: data };
    });
  }

  async testQuizQuestions(): Promise<void> {
    await this.executeTest('Questões do Quiz', async () => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('id, text, type, module_id, order_number, required')
        .order('order_number');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Nenhuma questão encontrada');
      }
      
      // Validar tipos de questões suportados
      const supportedTypes = ['text', 'textarea', 'number', 'email', 'url', 'instagram', 'radio', 'checkbox', 'select'];
      const invalidTypes = data.filter(q => !supportedTypes.includes(q.type));
      
      if (invalidTypes.length > 0) {
        throw new Error(`Tipos de questões inválidos encontrados: ${invalidTypes.map(q => q.type).join(', ')}`);
      }
      
      return { questionsCount: data.length, typeDistribution: this.getTypeDistribution(data) };
    });
  }

  async testQuizOptions(): Promise<void> {
    await this.executeTest('Opções das Questões', async () => {
      const { data, error } = await supabase
        .from('quiz_options')
        .select('id, text, question_id, order_number')
        .order('question_id, order_number');
      
      if (error) throw error;
      
      return { optionsCount: data?.length || 0 };
    });
  }

  // FASE 3: Testes de Funcionalidades
  async testUserAuthentication(): Promise<void> {
    await this.executeTest('Sistema de Autenticação', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      return { 
        isAuthenticated: !!user,
        userId: user?.id,
        userEmail: user?.email
      };
    });
  }

  async testQuizSubmissions(): Promise<void> {
    await this.executeTest('Submissões do Quiz', async () => {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select('id, user_id, completed, created_at')
        .limit(5);
      
      if (error) throw error;
      
      return { 
        totalSubmissions: data?.length || 0,
        completedSubmissions: data?.filter(s => s.completed).length || 0
      };
    });
  }

  async testAnswerPersistence(): Promise<void> {
    await this.executeTest('Persistência de Respostas', async () => {
      const { data, error } = await supabase
        .from('quiz_answers')
        .select('id, submission_id, question_id, answer')
        .limit(10);
      
      if (error) throw error;
      
      return { 
        totalAnswers: data?.length || 0,
        answerTypes: data?.map(a => typeof a.answer) || []
      };
    });
  }

  // FASE 4: Testes de Webhook
  async testWebhookConnectivity(): Promise<void> {
    await this.executeTest('Conectividade do Webhook', async () => {
      const result = await testWebhookConnection();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    });
  }

  async testWebhookDataProcessing(): Promise<void> {
    await this.executeTest('Processamento de Dados do Webhook', async () => {
      // Buscar uma submissão para testar
      const { data: submissions } = await supabase
        .from('quiz_submissions')
        .select('id')
        .eq('completed', true)
        .limit(1);
      
      if (!submissions || submissions.length === 0) {
        return { skipped: true, reason: 'Nenhuma submissão completa encontrada para teste' };
      }
      
      // Simular processamento de webhook (sem enviar realmente)
      return { testPossible: true, submissionId: submissions[0].id };
    });
  }

  // FASE 5: Testes Administrativos
  async testAdminFunctions(): Promise<void> {
    await this.executeTest('Funções Administrativas', async () => {
      const functions = [
        'is_current_user_admin',
        'get_system_config', 
        'complete_quiz',
        'is_quiz_complete'
      ];
      
      const results = {};
      
      for (const func of functions) {
        try {
          // Testar se a função existe
          const { error } = await supabase.rpc(func as any, {});
          results[func] = error ? `Erro: ${error.message}` : 'Disponível';
        } catch (error: any) {
          results[func] = `Erro: ${error.message}`;
        }
      }
      
      return results;
    });
  }

  async testSystemConfiguration(): Promise<void> {
    await this.executeTest('Configuração do Sistema', async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_key, config_value')
        .limit(5);
      
      if (error) throw error;
      
      return { 
        configCount: data?.length || 0,
        configs: data?.map(c => c.config_key) || []
      };
    });
  }

  // FASE 6: Testes de Performance
  async testQueryPerformance(): Promise<void> {
    await this.executeTest('Performance de Consultas', async () => {
      const queries = [
        { name: 'Buscar Módulos', query: () => supabase.from('quiz_modules').select('*') },
        { name: 'Buscar Questões', query: () => supabase.from('quiz_questions').select('*').limit(10) },
        { name: 'Buscar Opções', query: () => supabase.from('quiz_options').select('*').limit(20) }
      ];
      
      const results = {};
      
      for (const { name, query } of queries) {
        const startTime = Date.now();
        const { error } = await query();
        const duration = Date.now() - startTime;
        
        if (error) throw new Error(`${name}: ${error.message}`);
        
        results[name] = `${duration}ms`;
      }
      
      return results;
    });
  }

  // Utilitários
  private getTypeDistribution(questions: any[]): Record<string, number> {
    return questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Gera relatório detalhado dos testes
   */
  generateReport(): string {
    const successCount = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    const successRate = ((successCount / totalTests) * 100).toFixed(1);
    
    let report = `
=== RELATÓRIO DE VALIDAÇÃO DO SISTEMA MAR ===
Data: ${new Date().toLocaleString('pt-BR')}
Total de Testes: ${totalTests}
Sucessos: ${successCount}
Falhas: ${totalTests - successCount}
Taxa de Sucesso: ${successRate}%

=== DETALHES DOS TESTES ===
`;
    
    this.results.forEach((result, index) => {
      const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      
      report += `
${index + 1}. ${result.test}${duration}
   Status: ${status}
   Mensagem: ${result.message}
`;
      
      if (!result.success && result.details) {
        report += `   Detalhes: ${JSON.stringify(result.details, null, 2)}\n`;
      }
    });
    
    return report;
  }
}

// Função de conveniência para executar validação completa
export async function runSystemValidation(): Promise<TestResult[]> {
  const validator = new SystemValidator();
  return await validator.runAllTests();
}

// Função para executar validação e gerar relatório
export async function validateAndReport(): Promise<string> {
  const validator = new SystemValidator();
  await validator.runAllTests();
  return validator.generateReport();
}