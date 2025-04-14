
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Função para testar a estrutura do banco de dados do questionário MAR
 * Verifica se os módulos, perguntas e opções foram inseridos corretamente
 */
export const testSupabaseStructure = async () => {
  try {
    logger.info('Iniciando teste da estrutura do banco de dados', {
      tag: 'QuizTest',
      data: { timestamp: new Date().toISOString() }
    });
    
    // Verificar módulos
    const { data: modules, error: modulesError } = await supabase
      .from('quiz_modules')
      .select('*')
      .order('order_number');
    
    if (modulesError) {
      logger.error('Erro ao buscar módulos', {
        tag: 'QuizTest',
        data: { error: modulesError }
      });
      return { success: false, error: modulesError.message, stage: 'modules' };
    }
    
    if (!modules || modules.length !== 10) {
      logger.error('Número incorreto de módulos', {
        tag: 'QuizTest',
        data: { 
          expected: 10, 
          found: modules?.length || 0 
        }
      });
      return { 
        success: false, 
        error: `Número incorreto de módulos: esperado 10, encontrado ${modules?.length || 0}`,
        stage: 'modules'
      };
    }
    
    logger.info('Módulos verificados com sucesso', {
      tag: 'QuizTest',
      data: { count: modules.length }
    });
    
    // Verificar perguntas
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('question_number');
    
    if (questionsError) {
      logger.error('Erro ao buscar perguntas', {
        tag: 'QuizTest',
        data: { error: questionsError }
      });
      return { success: false, error: questionsError.message, stage: 'questions' };
    }
    
    if (!questions || questions.length !== 52) {
      logger.error('Número incorreto de perguntas', {
        tag: 'QuizTest',
        data: { 
          expected: 52, 
          found: questions?.length || 0 
        }
      });
      return { 
        success: false, 
        error: `Número incorreto de perguntas: esperado 52, encontrado ${questions?.length || 0}`,
        stage: 'questions'
      };
    }
    
    logger.info('Perguntas verificadas com sucesso', {
      tag: 'QuizTest',
      data: { count: questions.length }
    });
    
    // Verificar tipos de perguntas
    const questionTypes = new Set(questions.map(q => q.question_type));
    const expectedTypes = new Set(['text', 'textarea', 'radio', 'checkbox', 'email', 'url', 'instagram']);
    
    const missingTypes = Array.from(expectedTypes).filter(type => !questionTypes.has(type));
    if (missingTypes.length > 0) {
      logger.error('Tipos de perguntas ausentes', {
        tag: 'QuizTest',
        data: { missingTypes }
      });
      return { 
        success: false, 
        error: `Tipos de perguntas ausentes: ${missingTypes.join(', ')}`,
        stage: 'question_types'
      };
    }
    
    logger.info('Tipos de perguntas verificados com sucesso', {
      tag: 'QuizTest',
      data: { types: Array.from(questionTypes) }
    });
    
    // Verificar opções
    const { data: options, error: optionsError } = await supabase
      .from('quiz_options')
      .select('*');
    
    if (optionsError) {
      logger.error('Erro ao buscar opções', {
        tag: 'QuizTest',
        data: { error: optionsError }
      });
      return { success: false, error: optionsError.message, stage: 'options' };
    }
    
    if (!options || options.length === 0) {
      logger.error('Nenhuma opção encontrada', {
        tag: 'QuizTest',
        data: { found: options?.length || 0 }
      });
      return { 
        success: false, 
        error: 'Nenhuma opção encontrada',
        stage: 'options'
      };
    }
    
    logger.info('Opções verificadas com sucesso', {
      tag: 'QuizTest',
      data: { count: options.length }
    });
    
    // Teste concluído com sucesso
    logger.info('Teste da estrutura do banco de dados concluído com sucesso', {
      tag: 'QuizTest',
      data: {
        modules: modules.length,
        questions: questions.length,
        options: options.length,
        questionTypes: Array.from(questionTypes)
      }
    });
    
    return {
      success: true,
      data: {
        modules: modules.length,
        questions: questions.length,
        options: options.length,
        questionTypes: Array.from(questionTypes)
      }
    };
    
  } catch (error: any) {
    logger.error('Erro ao testar estrutura do banco de dados', {
      tag: 'QuizTest',
      data: { error }
    });
    
    return {
      success: false,
      error: error.message || 'Erro desconhecido',
      stage: 'unknown'
    };
  }
};
