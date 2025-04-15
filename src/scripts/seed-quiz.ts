
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';
import { quizModulesData, quizQuestionsData, quizOptionsData } from './quiz-data';

/**
 * Script para inicializar os dados do questionário MAR no Supabase
 */
export const seedQuizData = async (): Promise<boolean> => {
  try {
    addLogEntry('info', 'Iniciando processo de seed do questionário MAR');
    logger.info('Iniciando processo de seed do questionário MAR', { tag: 'Admin' });
    
    // Primeiro, limpar as opções existentes para evitar duplicidade
    const { error: deleteOptionsError } = await supabase
      .from('quiz_options')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Uma condição que sempre é verdadeira para deletar tudo
    
    if (deleteOptionsError) {
      logger.error('Erro ao limpar opções existentes:', {
        tag: 'Admin',
        data: { error: deleteOptionsError }
      });
      addLogEntry('error', 'Erro ao limpar opções existentes', { error: deleteOptionsError.message });
      return false;
    }
    
    logger.info('Opções existentes removidas com sucesso', { tag: 'Admin' });
    
    // Verificar se os módulos já existem
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
    
    // Associar IDs de módulos às perguntas
    const questionsToInsert = quizQuestionsData.map(question => {
      // Correção: Usando order_number do módulo em vez de module_number que não existe
      const moduleNumber = question.order_number <= 8 ? 1 : 
                          question.order_number <= 15 ? 2 :
                          question.order_number <= 22 ? 3 :
                          question.order_number <= 28 ? 4 :
                          question.order_number <= 33 ? 5 :
                          question.order_number <= 38 ? 6 : 7;
      
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
    
    // Criar um mapa de perguntas por número global (1-50)
    const questionMap = new Map();
    questionsData?.forEach(question => {
      // A ordem global da pergunta seria o question_number
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
    
    if (questionCount !== 50) {
      logger.error(`Erro: Número incorreto de perguntas após inserção. Esperado: 50, Encontrado: ${questionCount}`, {
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
