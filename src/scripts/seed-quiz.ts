
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
    
    // Verificar se já existem dados, para evitar duplicação
    const { data: existingModules, error: modulesError } = await supabase
      .from('quiz_modules')
      .select('id')
      .limit(1);
      
    if (modulesError) {
      logger.error('Erro ao verificar módulos existentes:', {
        tag: 'Admin',
        data: { error: modulesError }
      });
      return false;
    }
    
    // Se já existem módulos, não duplicar dados
    if (existingModules && existingModules.length > 0) {
      logger.info('Dados do questionário já estão carregados no Supabase', {
        tag: 'Admin'
      });
      addLogEntry('info', 'Dados do questionário já estão carregados no Supabase');
      return true;
    }
    
    // Inserir módulos
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
    
    // Associar IDs de módulos às perguntas
    const moduleMap = new Map();
    modulesData?.forEach(module => {
      moduleMap.set(module.order_number, module.id);
    });
    
    const questionsToInsert = quizQuestionsData.map(question => {
      const moduleNumber = parseInt(question.module_id.replace('module_', ''));
      const moduleId = moduleMap.get(moduleNumber);
      
      return {
        ...question,
        module_id: moduleId
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
    
    // Associar IDs de perguntas às opções
    const questionMap = new Map();
    questionsData?.forEach(question => {
      // Buscamos a pergunta correspondente no array original
      const originalQuestionModule = question.module_id;
      const originalQuestionOrder = question.order_number;
      
      // Criamos uma chave para reconhecer a questão pelo formato usado nas opções
      const questionKey = `question_${moduleMap.get(originalQuestionOrder)}_${originalQuestionOrder}`;
      questionMap.set(questionKey, question.id);
    });
    
    const optionsToInsert = quizOptionsData
      .filter(option => questionMap.has(option.question_id))
      .map(option => ({
        ...option,
        question_id: questionMap.get(option.question_id)
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
    
    addLogEntry('info', 'Seed do questionário MAR concluído com sucesso');
    logger.info('Seed do questionário MAR concluído com sucesso', { tag: 'Admin' });
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
