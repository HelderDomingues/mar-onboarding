
/**
 * Utilitário para testar a estrutura do banco de dados Supabase
 * Verifica se as tabelas e estruturas necessárias estão presentes
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Verifica a estrutura do banco de dados para o questionário MAR
 * @returns Promise<Object> Resultado do teste
 */
export const testSupabaseStructure = async () => {
  try {
    logger.info('Testando estrutura do Supabase para questionário MAR', { tag: 'Test' });
    
    // Stage 1: Verificar existência das tabelas principais
    logger.info('Etapa 1: Verificando tabelas principais', { tag: 'Test' });
    
    const requiredTables = [
      'quiz_modules',
      'quiz_questions',
      'quiz_options',
      'quiz_submissions',
      'quiz_answers',
      'profiles',
      'user_roles'
    ];
    
    // Utilizar a função RPC para verificar as tabelas
    const { data: tablesData, error: tablesError } = await supabase.rpc('get_database_tables');
    
    if (tablesError) {
      logger.error('Erro ao verificar tabelas:', { tag: 'Test', data: { error: tablesError } });
      return {
        success: false,
        stage: 'Verificação de tabelas',
        error: tablesError.message
      };
    }
    
    // Se a função RPC não estiver disponível, tentar método alternativo
    if (!tablesData) {
      // Tentar verificar cada tabela individualmente
      for (const table of requiredTables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        
        if (error && error.code === '42P01') { // Código para tabela não existente
          logger.error(`Tabela ${table} não existe`, { tag: 'Test' });
          return {
            success: false,
            stage: 'Verificação de tabelas',
            error: `Tabela ${table} não existe`
          };
        }
      }
    } else {
      // Verificar se todas as tabelas requeridas existem
      const existingTables = tablesData.map(t => t.table_name);
      
      for (const table of requiredTables) {
        if (!existingTables.includes(table)) {
          logger.error(`Tabela ${table} não existe`, { tag: 'Test' });
          return {
            success: false,
            stage: 'Verificação de tabelas',
            error: `Tabela ${table} não existe`
          };
        }
      }
    }
    
    // Stage 2: Verificar contagem de dados nas tabelas principais
    logger.info('Etapa 2: Verificando contagem de dados nas tabelas', { tag: 'Test' });
    
    const { count: modulesCount } = await supabase
      .from('quiz_modules')
      .select('*', { count: 'exact', head: true });
      
    const { count: questionsCount } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true });
      
    const { count: optionsCount } = await supabase
      .from('quiz_options')
      .select('*', { count: 'exact', head: true });
    
    // Stage 3: Verificar estrutura das perguntas
    logger.info('Etapa 3: Verificando tipos de perguntas', { tag: 'Test' });
    
    const { data: questionTypes } = await supabase
      .from('quiz_questions')
      .select('type')
      .is('type', 'not.null');
      
    const uniqueTypes = questionTypes ? [...new Set(questionTypes.map(q => q.type))] : [];
    
    // Stage 4: Verificar integridade referencial
    logger.info('Etapa 4: Verificando integridade referencial', { tag: 'Test' });
    
    // Verificar se todas as perguntas têm um módulo válido
    const { data: invalidQuestions } = await supabase
      .from('quiz_questions')
      .select('id')
      .not('module_id', 'in', `(select id from quiz_modules)`);
      
    const hasInvalidQuestions = invalidQuestions && invalidQuestions.length > 0;
    
    // Verificar se todas as opções têm uma pergunta válida
    const { data: invalidOptions } = await supabase
      .from('quiz_options')
      .select('id')
      .not('question_id', 'in', `(select id from quiz_questions)`);
      
    const hasInvalidOptions = invalidOptions && invalidOptions.length > 0;
    
    if (hasInvalidQuestions || hasInvalidOptions) {
      logger.warn('Problemas de integridade referencial detectados', { 
        tag: 'Test',
        data: { hasInvalidQuestions, hasInvalidOptions }
      });
    }
    
    // Stage 5: Verificar funções de banco de dados necessárias
    logger.info('Etapa 5: Verificando funções de banco de dados', { tag: 'Test' });
    
    const requiredFunctions = [
      'complete_quiz',
      'is_admin'
    ];
    
    // Tentar chamar uma função simples para verificar existência
    const { data: adminCheckResult, error: adminCheckError } = await supabase.rpc('is_admin');
    
    if (adminCheckError && adminCheckError.code === '42883') { // Código para função não existente
      logger.error('Funções essenciais não existem', { tag: 'Test' });
      return {
        success: false,
        stage: 'Verificação de funções',
        error: 'Funções essenciais não existem no banco de dados'
      };
    }
    
    // Tudo ok - retornar resultado final
    logger.info('Teste de estrutura concluído com sucesso', { tag: 'Test' });
    
    return {
      success: true,
      data: {
        modules: modulesCount || 0,
        questions: questionsCount || 0,
        options: optionsCount || 0,
        questionTypes: uniqueTypes,
        hasInvalidQuestions,
        hasInvalidOptions
      }
    };
  } catch (error) {
    logger.error('Erro ao testar estrutura do Supabase:', { tag: 'Test', data: { error } });
    return {
      success: false,
      stage: 'Teste geral',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error
    };
  }
};
