
import { supabase } from '@/integrations/supabase/client';
import { QuizModule, QuizQuestion, QuizOption, QuizSubmission, QuizAnswer } from '@/types/quiz';
import { sendQuizDataToWebhook } from '@/utils/webhookUtils';

interface QuizValidationResult {
  valid: boolean;
  total_required: number;
  total_answered: number;
  completion_percentage: number;
  missing_questions?: any[];
  error?: string;
}

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
  // Buscar o email do usuário da submissão
  const { data: submission } = await supabase
    .from('quiz_submissions')
    .select('user_email')
    .eq('id', submissionId)
    .single();
  
  const { error } = await supabase
    .from('quiz_answers')
    .upsert({
      submission_id: submissionId,
      question_id: questionId,
      answer,
      user_email: submission?.user_email || '',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'submission_id,question_id'
    });
    
  if (error) throw error;
}

export async function completeQuiz(submissionId: string): Promise<{ success: boolean; verified: boolean; webhookSent: boolean; error?: any; details?: any }> {
  console.log('🎯 [CompleteQuiz] Iniciando processo de finalização:', { submissionId });
  
  try {
    // CAMADA 3: Validar completude ANTES de marcar como completo
    const { data: submission } = await supabase
      .from('quiz_submissions')
      .select('user_id')
      .eq('id', submissionId)
      .single();
    
    if (!submission) {
      return {
        success: false,
        verified: false,
        webhookSent: false,
        error: 'Submissão não encontrada',
        details: { step: 'fetch_submission' }
      };
    }
    
    console.log('🔍 [CompleteQuiz] Validando completude para user_id:', submission.user_id);
    
    const { data: validationData, error: validationError } = await supabase
      .rpc('validate_quiz_completeness', { p_user_id: submission.user_id });
    
    if (validationError) {
      console.error('❌ [CompleteQuiz] Erro ao validar completude:', validationError);
      return {
        success: false,
        verified: false,
        webhookSent: false,
        error: validationError,
        details: { step: 'validation', error: validationError }
      };
    }
    
    const validation = validationData as unknown as QuizValidationResult;
    console.log('📊 [CompleteQuiz] Resultado da validação:', validation);
    
    if (!validation.valid) {
      console.warn('⚠️ [CompleteQuiz] Quiz incompleto:', validation);
      return {
        success: false,
        verified: false,
        webhookSent: false,
        error: 'Quiz incompleto',
        details: {
          step: 'validation_failed',
          validation,
          message: `Apenas ${validation.total_answered}/${validation.total_required} perguntas respondidas (${validation.completion_percentage}%)`
        }
      };
    }
    
    console.log('✅ [CompleteQuiz] Validação passou: 100% completo');
    
    const now = new Date().toISOString();
    
    // Passo 2: Marcar como completo com completed_at
    const { error: updateError } = await supabase
      .from('quiz_submissions')
      .update({
        completed: true,
        completed_at: now,
        webhook_processed: false
      })
      .eq('id', submissionId);
      
    if (updateError) {
      console.error('❌ [CompleteQuiz] Erro ao completar quiz:', updateError);
      return { 
        success: false, 
        verified: false, 
        webhookSent: false, 
        error: updateError,
        details: { step: 'update', error: updateError }
      };
    }

    console.log('✅ [CompleteQuiz] Quiz marcado como completo com completed_at:', now);
    
    // Passo 2: Verificar se foi marcado corretamente
    const { data: verification, error: verifyError } = await supabase
      .from('quiz_submissions')
      .select('completed, completed_at, webhook_processed')
      .eq('id', submissionId)
      .single();
      
    if (verifyError || !verification?.completed) {
      console.error('❌ [CompleteQuiz] Falha na verificação:', verifyError);
      return { 
        success: true, 
        verified: false, 
        webhookSent: false, 
        error: verifyError,
        details: { step: 'verification', error: verifyError, verification }
      };
    }
    
    console.log('✅ [CompleteQuiz] Verificação confirmada:', verification);
    
    // Passo 3: Tentar enviar webhook
    let webhookSent = false;
    let webhookResult: any = null;
    
    try {
      console.log('📤 [CompleteQuiz] Enviando dados para webhook...');
      webhookResult = await sendQuizDataToWebhook(submissionId);
      webhookSent = webhookResult.success;
      console.log(`${webhookSent ? '✅' : '❌'} [CompleteQuiz] Webhook: ${webhookResult.message}`, webhookResult);
      
      // Verificar novamente se webhook_processed foi marcado
      const { data: webhookVerification } = await supabase
        .from('quiz_submissions')
        .select('webhook_processed')
        .eq('id', submissionId)
        .single();
        
      console.log('🔍 [CompleteQuiz] Verificação webhook_processed:', webhookVerification);
      
    } catch (webhookError) {
      console.error('❌ [CompleteQuiz] Erro ao enviar dados para webhook:', webhookError);
      webhookResult = { success: false, message: webhookError instanceof Error ? webhookError.message : 'Erro desconhecido' };
    }
    
    return { 
      success: true, 
      verified: true, 
      webhookSent,
      details: {
        verification,
        webhook: webhookResult
      }
    };
  } catch (error) {
    console.error('❌ [CompleteQuiz] Erro crítico:', error);
    return { 
      success: false, 
      verified: false, 
      webhookSent: false, 
      error,
      details: { step: 'critical', error }
    };
  }
}

export async function isQuizComplete(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('is_quiz_complete', { p_user_id: userId });
    
  if (error) throw error;
  return data || false;
}
