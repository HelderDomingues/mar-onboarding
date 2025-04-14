
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
    
    // Carregar as opções para cada pergunta
    const questionsWithOptions = await Promise.all(
      data.map(async (question) => {
        const options = await loadQuestionOptions(question.id);
        return {
          ...question,
          options: options || []
        };
      })
    );
    
    return questionsWithOptions as QuizQuestion[];
  } catch (error) {
    logger.error('Exceção ao carregar perguntas', {
      tag: 'Quiz',
      data: { error }
    });
    return null;
  }
};

// Função para carregar as opções de uma pergunta específica
export const loadQuestionOptions = async (questionId: string): Promise<QuizOption[] | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_options')
      .select('*')
      .eq('question_id', questionId)
      .order('order_number');
    
    if (error) {
      logger.error('Erro ao carregar opções da pergunta', {
        tag: 'Quiz',
        data: { questionId, error }
      });
      return null;
    }
    
    return data as QuizOption[];
  } catch (error) {
    logger.error('Exceção ao carregar opções', {
      tag: 'Quiz',
      data: { questionId, error }
    });
    return null;
  }
};

// Função atualizada para mapear perguntas com suas opções
export const mapQuestionsWithOptions = (questions: any[]): QuizQuestion[] => {
  return questions.map(question => {
    // Usar options_json se disponível, caso contrário usar as opções carregadas
    let mappedOptions: QuizOption[] = [];
    
    if (question.options_json) {
      try {
        // Se options_json já é um objeto, não precisa parsear
        const optionsData = typeof question.options_json === 'string' 
          ? JSON.parse(question.options_json) 
          : question.options_json;
          
        if (Array.isArray(optionsData)) {
          // Converter para o formato QuizOption esperado
          mappedOptions = optionsData.map((option, index) => {
            if (typeof option === 'string') {
              return {
                id: `option-${question.id}-${index}`,
                text: option,
                question_id: question.id,
                order_number: index
              };
            } else if (typeof option === 'object') {
              return {
                id: option.id || `option-${question.id}-${index}`,
                text: option.text,
                question_id: question.id,
                order_number: option.order_number || index
              };
            }
            return null;
          }).filter(Boolean) as QuizOption[];
        }
      } catch (e) {
        logger.error('Erro ao processar options_json', {
          tag: 'Quiz',
          data: { questionId: question.id, error: e }
        });
      }
    }
    
    // Se temos opções já carregadas via JOIN, usar elas
    if (question.options && Array.isArray(question.options) && question.options.length > 0) {
      mappedOptions = question.options;
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

    // Processar opções a partir de options_json
    if (question.options_json) {
      try {
        const optionsData = typeof question.options_json === 'string'
          ? JSON.parse(question.options_json)
          : question.options_json;
          
        if (Array.isArray(optionsData)) {
          questionObj.options = optionsData;
        }
      } catch (e) {
        logger.error('Erro ao processar options_json em transformQuizData', {
          tag: 'Quiz',
          data: { questionId: question.id, error: e }
        });
        questionObj.options = [];
      }
    } else {
      questionObj.options = [];
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
