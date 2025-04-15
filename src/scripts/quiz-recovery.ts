
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';
import { quizModulesData } from './quiz-modules-data';
import { quizQuestionsData, quizOptionsData } from './quiz-data';

/**
 * Script de recuperação de dados do questionário MAR
 * Este script foi criado especificamente para recuperar dados perdidos,
 * mantendo os IDs originais e as relações entre módulos, perguntas e opções.
 */
export const recoverQuizData = async (): Promise<{
  success: boolean;
  message: string;
  data?: {
    modules?: number;
    questions?: number;
    options?: number;
  };
}> => {
  try {
    addLogEntry('info', 'Iniciando processo de recuperação do questionário MAR');
    logger.info('Iniciando processo de recuperação do questionário MAR', { tag: 'RecoveryTool' });
    
    // Verificar módulos existentes
    const { data: existingModules, error: modulesCheckError } = await supabase
      .from('quiz_modules')
      .select('id, title, order_number')
      .order('order_number');
      
    if (modulesCheckError) {
      logger.error('Erro ao verificar módulos existentes:', {
        tag: 'RecoveryTool',
        data: { error: modulesCheckError }
      });
      return {
        success: false,
        message: `Erro ao verificar módulos existentes: ${modulesCheckError.message}`
      };
    }
    
    // Mapa de IDs dos módulos por número de ordem
    const moduleMap = new Map();
    
    // Primeiro, verificar se temos módulos no banco de dados
    if (existingModules && existingModules.length > 0) {
      logger.info(`Encontrados ${existingModules.length} módulos existentes no banco de dados`, {
        tag: 'RecoveryTool'
      });
      
      // Verificar se precisamos corrigir os módulos existentes
      const needsModuleCorrection = existingModules.some(existingModule => {
        const expectedModule = quizModulesData.find(m => m.order_number === existingModule.order_number);
        return expectedModule && existingModule.title !== expectedModule.title;
      });
      
      if (needsModuleCorrection) {
        logger.warn('Módulos existentes têm títulos incorretos. Corrigindo...', {
          tag: 'RecoveryTool'
        });
        
        // Atualizar módulos com informações corretas sem alterar IDs
        for (const existingModule of existingModules) {
          const expectedModule = quizModulesData.find(m => m.order_number === existingModule.order_number);
          
          if (expectedModule) {
            // Atualizar apenas se for diferente
            if (existingModule.title !== expectedModule.title) {
              const { error: updateError } = await supabase
                .from('quiz_modules')
                .update({
                  title: expectedModule.title,
                  description: expectedModule.description
                })
                .eq('id', existingModule.id);
                
              if (updateError) {
                logger.error(`Erro ao atualizar módulo ${existingModule.order_number}:`, {
                  tag: 'RecoveryTool',
                  data: { error: updateError }
                });
              } else {
                logger.info(`Módulo ${existingModule.order_number} atualizado com sucesso`, {
                  tag: 'RecoveryTool'
                });
              }
            }
          }
        }
      }
      
      // Mapear IDs dos módulos existentes
      existingModules.forEach(module => {
        moduleMap.set(module.order_number, module.id);
      });
    } else {
      logger.info('Nenhum módulo encontrado no banco de dados. Inserindo módulos...', {
        tag: 'RecoveryTool'
      });
      
      // Inserir módulos
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
      
      // Mapear os módulos recém-criados
      modulesData?.forEach(module => {
        moduleMap.set(module.order_number, module.id);
      });
    }
    
    // Verificar se temos perguntas no banco
    const { data: existingQuestions, error: questionsCheckError } = await supabase
      .from('quiz_questions')
      .select('id, order_number')
      .order('order_number');
      
    if (questionsCheckError) {
      logger.error('Erro ao verificar perguntas existentes:', {
        tag: 'RecoveryTool',
        data: { error: questionsCheckError }
      });
    }
    
    let hasExistingQuestions = existingQuestions && existingQuestions.length > 0;
    
    if (hasExistingQuestions) {
      logger.info(`Encontradas ${existingQuestions.length} perguntas existentes. Verificando consistência...`, {
        tag: 'RecoveryTool'
      });
      
      // Se temos menos perguntas que o esperado, vamos limpar e reinserir tudo
      if (existingQuestions.length < quizQuestionsData.length) {
        logger.warn(`Número inconsistente de perguntas: ${existingQuestions.length} vs ${quizQuestionsData.length} esperadas. Limparemos e recriaremos.`, {
          tag: 'RecoveryTool'
        });
        
        // Limpar dados inconsistentes
        const { error: deleteOptionsError } = await supabase
          .from('quiz_options')
          .delete()
          .gt('id', '00000000-0000-0000-0000-000000000000');
          
        if (deleteOptionsError) {
          logger.error('Erro ao limpar opções:', {
            tag: 'RecoveryTool',
            data: { error: deleteOptionsError }
          });
          return {
            success: false,
            message: `Erro ao limpar opções: ${deleteOptionsError.message}`
          };
        }
        
        const { error: deleteQuestionsError } = await supabase
          .from('quiz_questions')
          .delete()
          .gt('id', '00000000-0000-0000-0000-000000000000');
          
        if (deleteQuestionsError) {
          logger.error('Erro ao limpar perguntas:', {
            tag: 'RecoveryTool',
            data: { error: deleteQuestionsError }
          });
          return {
            success: false,
            message: `Erro ao limpar perguntas: ${deleteQuestionsError.message}`
          };
        }
        
        hasExistingQuestions = false;
      }
    }
    
    // Se não temos perguntas, inserir todas
    if (!hasExistingQuestions) {
      logger.info('Inserindo perguntas...', {
        tag: 'RecoveryTool'
      });
      
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
          logger.error(`Módulo não encontrado para a pergunta ${question.order_number}. Módulo esperado: ${moduleNumber}`, {
            tag: 'RecoveryTool'
          });
        }
        
        // Garantir que temos um module_id válido
        const validModuleId = moduleId || quizModulesData.find(m => m.order_number === moduleNumber)?.id;
        
        if (!validModuleId) {
          logger.error(`Não foi possível encontrar um ID de módulo válido para a pergunta ${question.order_number}`, {
            tag: 'RecoveryTool' 
          });
          // Não inserir perguntas sem um module_id válido
          return null;
        }
        
        return {
          ...question,
          module_id: validModuleId
        };
      }).filter(Boolean); // Remover quaisquer valores nulos
      
      // Inserir perguntas
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
      
      // Criar um mapa de perguntas por número de ordem
      const questionMap = new Map();
      questionsData?.forEach(question => {
        questionMap.set(question.order_number, question.id);
      });
      
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
      
      // Preparar opções com os IDs de perguntas corretos
      const optionsToInsert = quizOptionsData
        .filter(option => {
          // Filtrar apenas opções com números de pergunta válidos
          const hasQuestionId = questionMap.has(option.question_number);
          if (!hasQuestionId) {
            logger.warn(`Opção para pergunta inexistente ${option.question_number} será ignorada`, {
              tag: 'RecoveryTool'
            });
          }
          return hasQuestionId;
        })
        .map(option => ({
          text: option.text,
          question_id: questionMap.get(option.question_number),
          order_number: option.order_number
        }));
      
      // Inserir opções apenas se houver opções para inserir
      if (optionsToInsert.length > 0) {
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
      } else {
        logger.warn('Nenhuma opção válida para inserir', {
          tag: 'RecoveryTool'
        });
      }
    }
    
    // Verificar consistência dos dados
    const { data: modulesCount, error: modulesCountError } = await supabase
      .from('quiz_modules')
      .select('id', { count: 'exact' });
      
    const { data: questionsCount, error: questionsCountError } = await supabase
      .from('quiz_questions')
      .select('id', { count: 'exact' });
      
    const { data: optionsCount, error: optionsCountError } = await supabase
      .from('quiz_options')
      .select('id', { count: 'exact' });
    
    if (modulesCountError || questionsCountError || optionsCountError) {
      logger.error('Erro ao verificar contagem de dados:', {
        tag: 'RecoveryTool',
        data: { 
          modulesCountError, 
          questionsCountError, 
          optionsCountError 
        }
      });
    }
    
    const modulesTotal = modulesCount?.length || 0;
    const questionsTotal = questionsCount?.length || 0;
    const optionsTotal = optionsCount?.length || 0;
    
    addLogEntry('info', 'Recuperação dos dados do questionário MAR concluída com sucesso');
    logger.info('Recuperação dos dados do questionário MAR concluída com sucesso', {
      tag: 'RecoveryTool',
      data: {
        modules: modulesTotal,
        questions: questionsTotal,
        options: optionsTotal
      }
    });
    
    return {
      success: true,
      message: 'Dados do questionário recuperados com sucesso',
      data: {
        modules: modulesTotal,
        questions: questionsTotal,
        options: optionsTotal
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Erro ao executar recuperação do questionário:', {
      tag: 'RecoveryTool',
      data: { error }
    });
    addLogEntry('error', 'Erro ao executar recuperação do questionário', { 
      error: errorMessage
    });
    
    return {
      success: false,
      message: `Erro ao recuperar dados: ${errorMessage}`
    };
  }
};

export default recoverQuizData;
