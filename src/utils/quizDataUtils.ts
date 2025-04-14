
import { supabase } from '@/integrations/supabase/client';
import { QuizModule, QuizQuestion } from '@/types/quiz';
import { logger } from '@/utils/logger';

/**
 * Utilitário para carregamento e manipulação de dados do questionário
 */

// Função para carregar os módulos do questionário
export const loadQuizModules = async (): Promise<QuizModule[] | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_modules')
      .select('*')
      .order('order_number');
    
    if (error) {
      logger.error('Erro ao carregar módulos do questionário', {
        tag: 'Quiz',
        data: { error }
      });
      return null;
    }
    
    return data as QuizModule[];
  } catch (error) {
    logger.error('Exceção ao carregar módulos', {
      tag: 'Quiz',
      data: { error }
    });
    return null;
  }
};

// Função para carregar as perguntas do questionário
export const loadQuizQuestions = async (): Promise<QuizQuestion[] | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('order_number');
    
    if (error) {
      logger.error('Erro ao carregar perguntas do questionário', {
        tag: 'Quiz',
        data: { error }
      });
      return null;
    }
    
    return data as QuizQuestion[];
  } catch (error) {
    logger.error('Exceção ao carregar perguntas', {
      tag: 'Quiz',
      data: { error }
    });
    return null;
  }
};

// Função para carregar as opções das perguntas
export const loadQuizOptions = async () => {
  try {
    const { data, error } = await supabase
      .from('quiz_options')
      .select('*')
      .order('order_number');
    
    if (error) {
      logger.error('Erro ao carregar opções das perguntas', {
        tag: 'Quiz',
        data: { error }
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exceção ao carregar opções', {
      tag: 'Quiz',
      data: { error }
    });
    return null;
  }
};

// Função para mapear perguntas com suas opções
export const mapQuestionsWithOptions = (questions: any[], options: any[]): QuizQuestion[] => {
  return questions.map(question => {
    const questionOptions = options?.filter(opt => opt.question_id === question.id) || [];
    const mappedOptions = questionOptions.map(opt => opt.text);
    
    return {
      ...question,
      options: mappedOptions,
      hint: question.hint || undefined,
      max_options: question.max_options || undefined,
      prefix: question.prefix || undefined,
      validation: question.validation || undefined,
      placeholder: question.placeholder || undefined,
      text: question.question_text || question.text
    } as QuizQuestion;
  });
};

// Função para verificar consistência entre dados da UI e do banco
export const validateQuizDataConsistency = (modules: QuizModule[], questions: QuizQuestion[]): boolean => {
  try {
    // Verificar se todos os módulos têm pelo menos uma pergunta
    for (const module of modules) {
      const moduleQuestions = questions.filter(q => q.module_id === module.id);
      if (moduleQuestions.length === 0) {
        logger.warn(`Módulo sem perguntas: ${module.title}`, {
          tag: 'Quiz',
          data: { moduleId: module.id }
        });
        return false;
      }
    }
    
    // Verificar se todas as perguntas têm um módulo válido
    for (const question of questions) {
      const moduleExists = modules.some(m => m.id === question.module_id);
      if (!moduleExists) {
        logger.warn(`Pergunta com módulo inválido: ${question.text}`, {
          tag: 'Quiz',
          data: { questionId: question.id, moduleId: question.module_id }
        });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logger.error('Erro ao validar consistência dos dados', {
      tag: 'Quiz',
      data: { error }
    });
    return false;
  }
};
