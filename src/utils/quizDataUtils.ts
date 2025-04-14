import { supabase } from '@/integrations/supabase/client';
import { QuizModule, QuizQuestion, QuizOption } from '@/types/quiz';
import { logger } from '@/utils/logger';

/**
 * Utilitário para carregamento e manipulação de dados do questionário
 */

// Função para carregar os módulos do questionário
export const loadQuizModules = async (): Promise<QuizModule[] | null> => {
  try {
    logger.info('Carregando módulos do questionário', { tag: 'Quiz', action: 'loadQuizModules' });
    
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
    
    if (!data || data.length === 0) {
      logger.warn('Nenhum módulo encontrado', { tag: 'Quiz', action: 'loadQuizModules' });
    } else {
      logger.info(`${data.length} módulos carregados com sucesso`, { 
        tag: 'Quiz', 
        action: 'loadQuizModules',
        count: data.length 
      });
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
    logger.info('Carregando perguntas do questionário', { tag: 'Quiz', action: 'loadQuizQuestions' });
    
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
    
    if (!data || data.length === 0) {
      logger.warn('Nenhuma pergunta encontrada', { tag: 'Quiz', action: 'loadQuizQuestions' });
      return [];
    }
    
    logger.info(`${data.length} perguntas carregadas com sucesso`, { 
      tag: 'Quiz', 
      action: 'loadQuizQuestions',
      count: data.length 
    });
    
    // Processar as perguntas com opções
    const questionsWithOptions = await mapQuestionsWithOptions(data);
    return questionsWithOptions;
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

// Função para mapear perguntas com suas opções
export const mapQuestionsWithOptions = async (questions: any[]): Promise<QuizQuestion[]> => {
  try {
    // Carregar todas as opções de uma vez para maior eficiência
    const { data: allOptions, error: optionsError } = await supabase
      .from('quiz_options')
      .select('*')
      .order('order_number');
      
    if (optionsError) {
      logger.error('Erro ao carregar todas as opções', {
        tag: 'Quiz',
        data: { error: optionsError }
      });
    }
    
    const optionsMap: Record<string, QuizOption[]> = {};
    
    // Organizar as opções por question_id
    if (allOptions) {
      allOptions.forEach(option => {
        if (!optionsMap[option.question_id]) {
          optionsMap[option.question_id] = [];
        }
        optionsMap[option.question_id].push(option);
      });
    }
    
    return questions.map(question => {
      // Usar options_json se disponível, caso contrário usar as opções carregadas
      let mappedOptions: QuizOption[] = [];
      
      // Primeiro verificar se temos opções no mapa
      if (optionsMap[question.id]) {
        mappedOptions = optionsMap[question.id];
      } 
      // Depois tentar usar options_json
      else if (question.options_json) {
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
      
      // Se nenhuma opção foi encontrada, manter o array vazio
      if (question.options && Array.isArray(question.options) && question.options.length > 0) {
        mappedOptions = question.options;
      }
      
      // Garantir que todas as propriedades importantes estejam presentes
      return {
        ...question,
        options: mappedOptions,
        type: question.question_type || question.type || 'text',
        hint: question.hint || undefined,
        max_options: question.max_options || undefined,
        prefix: question.prefix || undefined,
        validation: question.validation || undefined,
        placeholder: question.placeholder || undefined,
        text: question.question_text || question.text || ''
      } as QuizQuestion;
    });
  } catch (error) {
    logger.error('Erro ao mapear perguntas com opções', {
      tag: 'Quiz',
      data: { error }
    });
    return [];
  }
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
        // Verificar se a string parece ser um array JSON
        if (answer.startsWith('[') && answer.endsWith(']')) {
          // Tentar parsear string que pode ser array JSON
          const parsed = JSON.parse(answer);
          if (Array.isArray(parsed)) {
            // Converter cada elemento para string caso não seja
            formatted[key] = parsed.map(item => typeof item === 'string' ? item : String(item));
          } else {
            formatted[key] = answer;
          }
        } else if (answer.includes(',') && !answer.includes('{') && !answer.includes('"')) {
          // Se for uma string CSV simples e não um JSON complexo
          formatted[key] = answer.split(',').map(item => item.trim());
        } else {
          // Se não for um JSON válido, manter como string
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
