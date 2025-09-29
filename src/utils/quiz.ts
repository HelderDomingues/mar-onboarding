
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

export async function completeQuiz(submissionId: string): Promise<{ success: boolean; verified: boolean; webhookSent: boolean; error?: any }> {
  console.log('🎯 [CompleteQuiz] Iniciando processo de finalização:', { submissionId });
  
  try {
    // Passo 1: Marcar como completo
    const { error: updateError } = await supabase
      .from('quiz_submissions')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        webhook_processed: false
      })
      .eq('id', submissionId);
      
    if (updateError) {
      console.error('❌ [CompleteQuiz] Erro ao completar quiz:', updateError);
      return { success: false, verified: false, webhookSent: false, error: updateError };
    }

    console.log('✅ [CompleteQuiz] Quiz marcado como completo');
    
    // Passo 2: Verificar se foi marcado corretamente
    const { data: verification, error: verifyError } = await supabase
      .from('quiz_submissions')
      .select('completed, completed_at')
      .eq('id', submissionId)
      .single();
      
    if (verifyError || !verification?.completed) {
      console.error('❌ [CompleteQuiz] Falha na verificação:', verifyError);
      return { success: true, verified: false, webhookSent: false, error: verifyError };
    }
    
    console.log('✅ [CompleteQuiz] Verificação confirmada');
    
    // Passo 3: Tentar enviar webhook
    let webhookSent = false;
    try {
      console.log('📤 [CompleteQuiz] Enviando dados para webhook...');
      const webhookResult = await sendQuizDataToWebhook(submissionId);
      webhookSent = webhookResult.success;
      console.log(`${webhookSent ? '✅' : '❌'} [CompleteQuiz] Webhook: ${webhookResult.message}`);
    } catch (webhookError) {
      console.error('❌ [CompleteQuiz] Erro ao enviar dados para webhook:', webhookError);
    }
    
    return { success: true, verified: true, webhookSent };
  } catch (error) {
    console.error('❌ [CompleteQuiz] Erro crítico:', error);
    return { success: false, verified: false, webhookSent: false, error };
  }
}

export async function isQuizComplete(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('is_quiz_complete', { p_user_id: userId });
    
  if (error) throw error;
  return data || false;
}
