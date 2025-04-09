
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/database.types';
import type { QuizSubmission } from '@/types/quiz';

// Verifica se o questionário está completo para o usuário
export const isQuizComplete = async (userId: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('quiz_submissions')
      .select('completed')
      .eq('user_id', userId)
      .maybeSingle();
      
    return data?.completed === true;
  } catch (error) {
    console.error("Erro ao verificar status do questionário:", error);
    return false;
  }
};

// Simplifica as respostas do questionário para exibição
export const processQuizAnswersToSimplified = async (userId: string) => {
  try {
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('question_id, question_text, answer')
      .eq('user_id', userId);
      
    if (answersError) {
      console.error("Erro ao buscar respostas:", answersError);
      return null;
    }
    
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (submissionError) {
      console.error("Erro ao buscar submissão:", submissionError);
      return null;
    }
    
    return {
      answers,
      submission
    };
  } catch (error) {
    console.error("Erro ao processar respostas:", error);
    return null;
  }
};

// Envia dados do questionário para um webhook externo
export const sendQuizDataToWebhook = async (userId: string, submissionId: string) => {
  try {
    console.log("Enviando dados para webhook...");
    // Implementação simplificada - na prática, seria uma chamada para um endpoint
    return true;
  } catch (error) {
    console.error("Erro ao enviar dados para webhook:", error);
    return false;
  }
};

// Obter detalhes simplificados do questionário
export const getQuizDetails = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select(`
        *,
        user:user_id (
          email
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Erro ao buscar detalhes do questionário:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do questionário:", error);
    return null;
  }
};
