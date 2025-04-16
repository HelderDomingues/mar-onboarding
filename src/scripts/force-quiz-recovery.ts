
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';
import { quizModulesData } from './quiz-modules-data';
import { quizQuestionsData } from './quiz-questions-data';
import { quizOptionsData } from './quiz-options-data';

/**
 * Script para forçar a recuperação completa do questionário MAR
 * 
 * Esta função limpa completamente os dados existentes e insere novos dados
 * para garantir consistência total. Não requer interação do usuário.
 */
export const forceQuizRecovery = async (): Promise<{
  success: boolean;
  message: string;
  data?: {
    modules?: number;
    questions?: number;
    options?: number;
  };
}> => {
  try {
    addLogEntry('info', 'Iniciando processo de recuperação forçada do questionário MAR');
    logger.info('Iniciando processo de recuperação forçada do questionário MAR', { tag: 'RecoveryTool' });
    
    // Fase 1: Limpar todos os dados existentes para evitar conflitos
    logger.info('Fase 1: Limpando dados existentes...', { tag: 'RecoveryTool' });
    
    // Limpar opções existentes
    const { error: deleteOptionsError } = await supabase
      .from('quiz_options')
      .delete()
      .gt('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteOptionsError) {
      logger.error('Erro ao limpar opções existentes:', {
        tag: 'RecoveryTool',
        data: { error: deleteOptionsError }
      });
      return {
        success: false,
        message: `Erro ao limpar opções existentes: ${deleteOptionsError.message}`
      };
    }
    
    // Limpar perguntas existentes
    const { error: deleteQuestionsError } = await supabase
      .from('quiz_questions')
      .delete()
      .gt('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteQuestionsError) {
      logger.error('Erro ao limpar perguntas existentes:', {
        tag: 'RecoveryTool',
        data: { error: deleteQuestionsError }
      });
      return {
        success: false,
        message: `Erro ao limpar perguntas existentes: ${deleteQuestionsError.message}`
      };
    }
    
    // Limpar módulos existentes
    const { error: deleteModulesError } = await supabase
      .from('quiz_modules')
      .delete()
      .gt('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteModulesError) {
      logger.error('Erro ao limpar módulos existentes:', {
        tag: 'RecoveryTool',
        data: { error: deleteModulesError }
      });
      return {
        success: false,
        message: `Erro ao limpar módulos existentes: ${deleteModulesError.message}`
      };
    }
    
    logger.info('Dados antigos removidos com sucesso', { tag: 'RecoveryTool' });
    
    // Fase 2: Inserir módulos
    logger.info('Fase 2: Inserindo módulos...', { tag: 'RecoveryTool' });
    
    const { data: modulesData, error: insertModulesError } = await supabase
      .from('quiz_modules')
      .insert(quizModulesData)
      .select();
      
    if (insertModulesError) {
      logger.error('Erro ao inserir módulos:', {
        tag: 'RecoveryTool',
        data: { error: insertModulesError }
      });
      return {
        success: false,
        message: `Erro ao inserir módulos: ${insertModulesError.message}`
      };
    }
    
    logger.info(`${modulesData?.length || 0} módulos inseridos com sucesso`, {
      tag: 'RecoveryTool'
    });
    
    // Mapear IDs dos módulos para uso nas perguntas
    const moduleMap = new Map();
    modulesData?.forEach(module => {
      moduleMap.set(module.order_number, module.id);
    });
    
    // Fase 3: Inserir perguntas com referências corretas aos módulos
    logger.info('Fase 3: Inserindo perguntas...', { tag: 'RecoveryTool' });
    
    // Preparar perguntas com os módulos corretos
    const questionsToInsert = quizQuestionsData.map(question => {
      // Determinar o módulo correto baseado no order_number da pergunta
      let moduleNumber;
      
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
      
      // Obter ID do módulo do mapa
      const moduleId = moduleMap.get(moduleNumber);
      
      if (!moduleId) {
        logger.warn(`Módulo não encontrado para a pergunta ${question.order_number}. Módulo esperado: ${moduleNumber}`, {
          tag: 'RecoveryTool'
        });
      }
      
      // Remove id se existir para evitar conflitos
      const { id, ...questionData } = question;
      
      return {
        ...questionData,
        module_id: moduleId || question.module_id
      };
    });
    
    const { data: questionsData, error: insertQuestionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select();
      
    if (insertQuestionsError) {
      logger.error('Erro ao inserir perguntas:', {
        tag: 'RecoveryTool',
        data: { error: insertQuestionsError }
      });
      return {
        success: false,
        message: `Erro ao inserir perguntas: ${insertQuestionsError.message}`
      };
    }
    
    logger.info(`${questionsData?.length || 0} perguntas inseridas com sucesso`, {
      tag: 'RecoveryTool'
    });
    
    // Fase 4: Inserir opções com referências corretas às perguntas
    logger.info('Fase 4: Inserindo opções...', { tag: 'RecoveryTool' });
    
    // Criar um mapa de perguntas por número
    const questionMap = new Map();
    questionsData?.forEach(question => {
      questionMap.set(question.order_number, question.id);
    });
    
    // Preparar opções com as perguntas corretas
    const optionsToInsert = quizOptionsData
      .filter(option => {
        // Verificar se a pergunta existe
        const hasQuestion = questionMap.has(option.question_number);
        if (!hasQuestion) {
          logger.warn(`Opção ignorada: Pergunta ${option.question_number} não encontrada`, {
            tag: 'RecoveryTool'
          });
        }
        return hasQuestion;
      })
      .map(option => ({
        text: option.text,
        question_id: questionMap.get(option.question_number),
        order_number: option.order_number
      }));
    
    const { data: optionsData, error: insertOptionsError } = await supabase
      .from('quiz_options')
      .insert(optionsToInsert)
      .select();
      
    if (insertOptionsError) {
      logger.error('Erro ao inserir opções:', {
        tag: 'RecoveryTool',
        data: { error: insertOptionsError }
      });
      return {
        success: false,
        message: `Erro ao inserir opções: ${insertOptionsError.message}`
      };
    }
    
    logger.info(`${optionsData?.length || 0} opções inseridas com sucesso`, {
      tag: 'RecoveryTool'
    });
    
    // Fase 5: Verificação final
    logger.info('Fase 5: Verificando consistência dos dados...', { tag: 'RecoveryTool' });
    
    // Contagens finais
    const modulesCount = modulesData?.length || 0;
    const questionsCount = questionsData?.length || 0;
    const optionsCount = optionsData?.length || 0;
    
    addLogEntry('info', 'Recuperação forçada do questionário MAR concluída com sucesso');
    logger.info('Recuperação forçada do questionário MAR concluída com sucesso', {
      tag: 'RecoveryTool',
      data: {
        modules: modulesCount,
        questions: questionsCount,
        options: optionsCount
      }
    });
    
    return {
      success: true,
      message: 'Dados do questionário recuperados com sucesso',
      data: {
        modules: modulesCount,
        questions: questionsCount,
        options: optionsCount
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Erro ao executar recuperação forçada do questionário:', {
      tag: 'RecoveryTool',
      data: { error }
    });
    addLogEntry('error', 'Erro ao executar recuperação forçada do questionário', { 
      error: errorMessage 
    });
    
    return {
      success: false,
      message: `Erro ao recuperar dados: ${errorMessage}`
    };
  }
};

export default forceQuizRecovery;
