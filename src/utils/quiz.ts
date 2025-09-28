
import { supabase } from '@/integrations/supabase/client';
import { QuizModule, QuizQuestion, QuizOption, QuizSubmission, QuizAnswer } from '@/types/quiz';
import { sendQuizDataToWebhook } from '@/utils/webhookUtils';

export async function fetchModules(): Promise<QuizModule[]> {
  const { data, error } = await supabase
    .from('quiz_modules')
    .select('*')
    .order('order_number');
    
  if (error) throw error;
  return data || [];
}

export async function fetchQuestions(moduleId: string): Promise<QuizQuestion[]> {
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_number');
    
  if (questionsError) throw questionsError;
  
  // Mapeia os campos para manter compatibilidade
  const mappedQuestions = questions?.map(q => ({
    ...q,
    question_text: q.text,
    question_type: q.type
  })) || [];
  
  // Buscar opções para essas questões
  const questionIds = mappedQuestions.map(q => q.id);
  
  if (questionIds.length === 0) {
    return [];
  }
  
  const { data: options, error: optionsError } = await supabase
    .from('quiz_options')
    .select('*')
    .in('question_id', questionIds)
    .order('order_number');
    
  if (optionsError) throw optionsError;
  
  // Associa as opções às perguntas
  return mappedQuestions.map(question => ({
    ...question,
    options: options?.filter(opt => opt.question_id === question.id) || []
  }));
}

export async function fetchSubmission(userId: string): Promise<QuizSubmission | null> {
  // Primeiro, buscar a submissão
  const { data: submission, error } = await supabase
    .from('quiz_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error) throw error;
  
  // Se não encontrou submissão, retorna null
  if (!submission) return null;
  
  // Buscar as respostas para essa submissão
  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('submission_id', submission.id);
    
  if (answersError) throw answersError;
  
  // Retornar a submissão com as respostas, incluindo user_id para compatibilidade
  return {
    ...submission,
    answers: (answers || []).map(answer => ({
      ...answer,
      user_id: submission.user_id // Add required user_id field
    }))
  };
}

export async function saveAnswer(
  submissionId: string,
  questionId: string,
  answer: string | null
): Promise<void> {
  const { error } = await supabase
    .from('quiz_answers')
    .upsert({
      submission_id: submissionId,
      question_id: questionId,
      answer,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'submission_id,question_id'
    });
    
  if (error) throw error;
}

export async function completeQuiz(submissionId: string): Promise<void> {
  console.log('🎯 [CompleteQuiz] Iniciando processo de finalização:', { submissionId });
  
  const { error } = await supabase
    .from('quiz_submissions')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      webhook_processed: false
    })
    .eq('id', submissionId);
    
  if (error) {
    console.error('❌ [CompleteQuiz] Erro ao completar quiz:', error);
    throw error;
  }

  console.log('✅ [CompleteQuiz] Quiz marcado como completo com sucesso');
  
  // Tentar enviar dados para o webhook automaticamente  
  try {
    console.log('📤 [CompleteQuiz] Enviando dados para webhook...');
    await sendQuizDataToWebhook(submissionId);
    console.log('✅ [CompleteQuiz] Webhook enviado com sucesso');
  } catch (webhookError) {
    console.error('❌ [CompleteQuiz] Erro ao enviar dados para webhook:', webhookError);
    // Não interrompe o fluxo mesmo se o webhook falhar
  }
}

export async function isQuizComplete(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('is_quiz_complete', { p_user_id: userId });
    
  if (error) throw error;
  return data || false;
}
