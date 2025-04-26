
import { supabase } from '@/integrations/supabase/client';
import { QuizModule, QuizQuestion, QuizOption, QuizAnswer } from '@/types/quiz';
import { logger } from '@/utils/logger';

/**
 * Carrega os módulos do questionário
 */
export async function loadQuizModules(): Promise<QuizModule[]> {
  const { data, error } = await supabase
    .from('quiz_modules')
    .select('*')
    .order('order_number');
    
  if (error) {
    logger.error('Erro ao carregar módulos do questionário', { 
      error, 
      tag: 'QuizData' 
    });
    throw error;
  }
  
  return data || [];
}

/**
 * Carrega as questões do questionário
 */
export async function loadQuizQuestions(): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .order('order_number');
    
  if (error) {
    logger.error('Erro ao carregar perguntas do questionário', { 
      error, 
      tag: 'QuizData' 
    });
    throw error;
  }
  
  // Mapeamos os campos para manter compatibilidade com componentes existentes
  const questions = data?.map(q => ({
    ...q,
    question_text: q.text,
    question_type: q.type
  })) || [];
  
  return questions;
}

/**
 * Carrega as opções para as questões
 */
export async function loadQuestionOptions(): Promise<QuizOption[]> {
  const { data, error } = await supabase
    .from('quiz_options')
    .select('*')
    .order('order_number');
    
  if (error) {
    logger.error('Erro ao carregar opções de perguntas', { 
      error, 
      tag: 'QuizData' 
    });
    throw error;
  }
  
  return data || [];
}

/**
 * Mapeia questões com suas opções
 */
export function mapQuestionsWithOptions(
  questions: QuizQuestion[],
  options: QuizOption[]
): QuizQuestion[] {
  return questions.map(question => {
    const questionOptions = options.filter(opt => opt.question_id === question.id);
    return {
      ...question,
      options: questionOptions
    };
  });
}

/**
 * Formata as respostas do questionário para exibição
 */
export function formatQuizAnswers(answers: Record<string, string | string[]>): Record<string, string | string[]> {
  const formattedAnswers: Record<string, string | string[]> = {};
  
  Object.entries(answers).forEach(([questionId, answer]) => {
    formattedAnswers[questionId] = answer;
  });
  
  return formattedAnswers;
}

/**
 * Carrega a estrutura completa do questionário com módulos, questões e opções
 */
export async function loadFullQuizStructure() {
  const [modules, questions, options] = await Promise.all([
    loadQuizModules(),
    loadQuizQuestions(),
    loadQuestionOptions()
  ]);
  
  // Enriquecer módulos com metadados
  const modulesWithQuestions = modules.map((module) => {
    const moduleQuestions = questions.filter(q => q.module_id === module.id)
      .map(q => ({
        ...q,
        module_number: module.order_number,
        module_title: module.title
      }));
      
    const questionsWithOptions = mapQuestionsWithOptions(moduleQuestions, options);
    
    return {
      ...module,
      questions: questionsWithOptions
    };
  });
  
  // Retorna todas as questões mapeadas
  const allQuestionsWithOptions = mapQuestionsWithOptions(questions, options)
    .map(q => {
      const moduleData = modules.find(m => m.id === q.module_id);
      return {
        ...q,
        module_number: moduleData?.order_number,
        module_title: moduleData?.title
      };
    });
  
  return {
    modules,
    questions: allQuestionsWithOptions,
    options,
    modulesWithQuestions
  };
}
