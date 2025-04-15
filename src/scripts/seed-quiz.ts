
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';
import { quizModulesData, quizQuestionsData, quizOptionsData } from './quiz-data';

/**
 * Script para inicializar os dados do questionário MAR no Supabase
 * 
 * ATENÇÃO: Este script foi corrigido para resolver problemas de mapeamento de módulos
 * que causavam perda de dados. Use com cuidado em produção.
 */
export const seedQuizData = async (): Promise<boolean> => {
  try {
    addLogEntry('info', 'Iniciando processo de seed do questionário MAR');
    logger.info('Iniciando processo de seed do questionário MAR', { tag: 'Admin' });
    
    // ATENÇÃO: Verificar módulos existentes antes de criar novos
    // Isso evita problemas de duplicação ou perda de dados
    const { data: existingModules, error: modulesError } = await supabase
      .from('quiz_modules')
      .select('id, order_number')
      .order('order_number');
      
    if (modulesError) {
      logger.error('Erro ao verificar módulos existentes:', {
        tag: 'Admin',
        data: { error: modulesError }
      });
      return false;
    }
    
    // Criar um mapa de módulos por número de ordem
    const moduleMap = new Map();
    
    // Se os módulos já existem, usá-los
    if (existingModules && existingModules.length > 0) {
      existingModules.forEach(module => {
        moduleMap.set(module.order_number, module.id);
      });
      logger.info(`${existingModules.length} módulos existentes mapeados`, {
        tag: 'Admin'
      });
    } else {
      // Se não existem módulos, criar novos
      const { data: modulesData, error: insertModulesError } = await supabase
        .from('quiz_modules')
        .insert(quizModulesData)
        .select();
        
      if (insertModulesError) {
        logger.error('Erro ao inserir módulos:', {
          tag: 'Admin',
          data: { error: insertModulesError }
        });
        addLogEntry('error', 'Erro ao inserir módulos', { error: insertModulesError.message });
        return false;
      }
      
      logger.info(`${modulesData?.length || 0} módulos inseridos com sucesso`, {
        tag: 'Admin'
      });
      
      // Mapear os módulos recém-criados
      modulesData?.forEach(module => {
        moduleMap.set(module.order_number, module.id);
      });
    }
    
    // IMPORTANTE: Verificar perguntas existentes antes de excluir
    const { data: existingQuestions, error: questionsCheckError } = await supabase
      .from('quiz_questions')
      .select('id', { count: 'exact' });
      
    if (questionsCheckError) {
      logger.error('Erro ao verificar perguntas existentes:', {
        tag: 'Admin',
        data: { error: questionsCheckError }
      });
    }
    
    const hasExistingQuestions = existingQuestions && existingQuestions.length > 0;
    
    // IMPORTANTE: Só limpar dados existentes se explicitamente solicitado
    // ou se estamos em um estado inconsistente
    const shouldCleanExistingData = false; // Defina como true apenas se necessário!
    
    if (shouldCleanExistingData && hasExistingQuestions) {
      // Limpar as opções existentes para evitar duplicidade
      const { error: deleteOptionsError } = await supabase
        .from('quiz_options')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteOptionsError) {
        logger.error('Erro ao limpar opções existentes:', {
          tag: 'Admin',
          data: { error: deleteOptionsError }
        });
        addLogEntry('error', 'Erro ao limpar opções existentes', { error: deleteOptionsError.message });
        return false;
      }
      
      logger.info('Opções existentes removidas com sucesso', { tag: 'Admin' });
      
      // Limpar as perguntas existentes para evitar duplicidade
      const { error: deleteQuestionsError } = await supabase
        .from('quiz_questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteQuestionsError) {
        logger.error('Erro ao limpar perguntas existentes:', {
          tag: 'Admin',
          data: { error: deleteQuestionsError }
        });
        addLogEntry('error', 'Erro ao limpar perguntas existentes', { error: deleteQuestionsError.message });
        return false;
      }
      
      logger.info('Perguntas existentes removidas com sucesso', { tag: 'Admin' });
    }
    
    // Se já temos perguntas e não queremos limpar, não precisamos fazer nada
    if (hasExistingQuestions && !shouldCleanExistingData) {
      logger.info(`${existingQuestions.length} perguntas já existem no banco. Pulando inserção.`, {
        tag: 'Admin'
      });
      
      // Verificar consistência
      addLogEntry('info', 'Seed do questionário MAR concluído (dados existentes mantidos)');
      return true;
    }
    
    // Associar IDs de módulos às perguntas
    const questionsToInsert = quizQuestionsData.map(question => {
      // CORRIGIDO: Mapeamento claro e explícito de ordem para módulo
      let moduleNumber = 1;
      
      if (question.order_number <= 8) moduleNumber = 1;
      else if (question.order_number <= 15) moduleNumber = 2;
      else if (question.order_number <= 22) moduleNumber = 3;
      else if (question.order_number <= 28) moduleNumber = 4;
      else if (question.order_number <= 33) moduleNumber = 5;
      else if (question.order_number <= 43) moduleNumber = 6; 
      else if (question.order_number <= 50) moduleNumber = 7; 
      else if (question.order_number <= 57) moduleNumber = 8; 
      else if (question.order_number <= 60) moduleNumber = 9;
      else if (question.order_number <= 65) moduleNumber = 10;
      else if (question.order_number <= 70) moduleNumber = 11;
      else if (question.order_number <= 75) moduleNumber = 12;
      else moduleNumber = 13;
      
      const moduleId = moduleMap.get(moduleNumber);
      
      if (!moduleId) {
        logger.error(`Módulo não encontrado para a pergunta com número de ordem ${question.order_number}`, {
          tag: 'Admin'
        });
      }
      
      return {
        ...question,
        module_id: moduleId || question.module_id // Usar o ID mapeado ou manter o original
      };
    });
    
    // Inserir perguntas
    const { data: questionsData, error: insertQuestionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select();
      
    if (insertQuestionsError) {
      logger.error('Erro ao inserir perguntas:', {
        tag: 'Admin',
        data: { error: insertQuestionsError }
      });
      addLogEntry('error', 'Erro ao inserir perguntas', { error: insertQuestionsError.message });
      return false;
    }
    
    logger.info(`${questionsData?.length || 0} perguntas inseridas com sucesso`, {
      tag: 'Admin'
    });
    
    // Criar um mapa de perguntas por número global
    const questionMap = new Map();
    questionsData?.forEach(question => {
      const globalQuestionNumber = question.order_number;
      questionMap.set(globalQuestionNumber, question.id);
    });
    
    // Associar IDs de perguntas às opções
    const optionsToInsert = quizOptionsData
      .filter(option => questionMap.has(option.question_number))
      .map(option => ({
        text: option.text,
        question_id: questionMap.get(option.question_number),
        order_number: option.order_number
      }));
    
    // Inserir opções
    if (optionsToInsert.length > 0) {
      const { data: optionsData, error: insertOptionsError } = await supabase
        .from('quiz_options')
        .insert(optionsToInsert)
        .select();
        
      if (insertOptionsError) {
        logger.error('Erro ao inserir opções:', {
          tag: 'Admin',
          data: { error: insertOptionsError }
        });
        addLogEntry('error', 'Erro ao inserir opções', { error: insertOptionsError.message });
        return false;
      }
      
      logger.info(`${optionsData?.length || 0} opções inseridas com sucesso`, {
        tag: 'Admin'
      });
    }
    
    // Verificar se a inserção foi bem-sucedida
    const { data: totalQuestions, error: countError } = await supabase
      .from('quiz_questions')
      .select('id', { count: 'exact' });
      
    if (countError) {
      logger.error('Erro ao contar perguntas:', {
        tag: 'Admin',
        data: { error: countError }
      });
      return false;
    }
    
    const questionCount = totalQuestions?.length || 0;
    
    // Atualizamos a verificação para o número total de perguntas esperado
    const expectedQuestionCount = quizQuestionsData.length;
    
    if (questionCount !== expectedQuestionCount) {
      logger.error(`Erro: Número incorreto de perguntas após inserção. Esperado: ${expectedQuestionCount}, Encontrado: ${questionCount}`, {
        tag: 'Admin'
      });
      return false;
    }
    
    addLogEntry('info', 'Seed do questionário MAR concluído com sucesso');
    logger.info('Seed do questionário MAR concluído com sucesso', { 
      tag: 'Admin',
      data: {
        modules: moduleMap.size,
        questions: questionCount,
        options: optionsToInsert.length
      }
    });
    return true;
  } catch (error) {
    logger.error('Erro ao executar seed do questionário:', {
      tag: 'Admin',
      data: { error }
    });
    addLogEntry('error', 'Erro ao executar seed do questionário', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return false;
  }
};

export default seedQuizData;
