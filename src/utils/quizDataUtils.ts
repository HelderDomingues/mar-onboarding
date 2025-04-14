
import { supabase } from '@/integrations/supabase/client';
import { QuizModule, QuizQuestion, QuizOption } from '@/types/quiz';
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
    
    // Extrair texto das opções para compatibilidade com o componente QuestionCard
    let mappedOptions: string[] = [];
    if (questionOptions && questionOptions.length > 0) {
      mappedOptions = questionOptions.map(opt => opt.text);
    } else if (question.options_json) {
      try {
        // Tentar extrair opções do campo options_json
        const parsedOptions = JSON.parse(question.options_json);
        if (Array.isArray(parsedOptions)) {
          mappedOptions = parsedOptions;
        }
      } catch (e) {
        logger.error('Erro ao parsear options_json', {
          tag: 'Quiz',
          data: { questionId: question.id, error: e }
        });
      }
    }
    
    // Criar objeto de pergunta com todas as propriedades necessárias
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

// Função para compatibilidade com diferentes formatos de dados
export const transformQuizData = (questions: any[]): QuizQuestion[] => {
  return questions.map(question => {
    let questionObj: QuizQuestion = {
      ...question,
      text: question.question_text || question.text,
      type: question.question_type || question.type,
      id: question.id,
      module_id: question.module_id,
      required: question.required !== false,
      order_number: question.order_number || question.question_number || 0
    };

    // Processar opções se disponíveis
    if (question.options) {
      questionObj.options = Array.isArray(question.options) 
        ? question.options
        : typeof question.options === 'string' 
          ? JSON.parse(question.options) 
          : [];
    }

    return questionObj;
  });
};

// Função para garantir a formatação correta das respostas
export const formatQuizAnswers = (answers: Record<string, any>): Record<string, string | string[]> => {
  const formatted: Record<string, string | string[]> = {};
  
  for (const key in answers) {
    const answer = answers[key];
    
    if (typeof answer === 'string') {
      try {
        // Tentar parsear string que pode ser array JSON
        const parsed = JSON.parse(answer);
        if (Array.isArray(parsed)) {
          formatted[key] = parsed;
        } else {
          formatted[key] = answer;
        }
      } catch (e) {
        // Se não for um JSON válido, manter como string
        formatted[key] = answer;
      }
    } else if (Array.isArray(answer)) {
      formatted[key] = answer;
    } else if (answer !== null && answer !== undefined) {
      formatted[key] = String(answer);
    } else {
      formatted[key] = '';
    }
  }
  
  return formatted;
};
