
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Verifica se o questionário está completo para um usuário
 */
export async function isQuizComplete(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('is_quiz_complete', { p_user_id: userId });
      
    if (error) {
      logger.error('Erro ao verificar status do questionário', {
        tag: 'Quiz',
        data: { userId, error }
      });
      throw error;
    }
    
    return data || false;
  } catch (error) {
    logger.error('Falha ao verificar status do questionário', {
      tag: 'Quiz',
      data: { userId, error }
    });
    return false;
  }
}

/**
 * Função para completar o questionário manualmente para um usuário
 */
export async function completeQuizManually(userId: string) {
  try {
    logger.info('Completando questionário manualmente', {
      tag: 'Quiz',
      data: { userId }
    });
    
    // Tenta usar RPC para completar o questionário primeiro (método preferido)
    try {
      const { data, error } = await supabase.rpc('complete_quiz', { user_id: userId });
      
      if (!error) {
        logger.info('Questionário completado via RPC', {
          tag: 'Quiz',
          data: { userId, method: 'rpc' }
        });
        
        return { success: true, method: 'rpc' };
      }
    } catch (rpcError) {
      logger.warn('Falha no método RPC para completar questionário', {
        tag: 'Quiz',
        data: { userId, error: rpcError }
      });
    }
    
    // Método alternativo: atualização direta via admin
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('quiz_submissions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (submission) {
      const { error: updateError } = await supabaseAdmin
        .from('quiz_submissions')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', submission.id);
        
      if (updateError) {
        throw updateError;
      }
      
      logger.info('Questionário completado via atualização direta', {
        tag: 'Quiz',
        data: { userId, method: 'direct_update' }
      });
      
      return { success: true, method: 'direct_update' };
    } else {
      // Caso não encontre submissão, cria uma já completa
      const { data: newSubmission, error: createError } = await supabaseAdmin
        .from('quiz_submissions')
        .insert([{
          user_id: userId,
          current_module: 8,
          completed: true,
          completed_at: new Date().toISOString()
        }])
        .select();
        
      if (createError) {
        throw createError;
      }
      
      logger.info('Questionário completado via criação de submissão', {
        tag: 'Quiz',
        data: { userId, method: 'create_complete' }
      });
      
      return { success: true, method: 'create_complete' };
    }
  } catch (error) {
    logger.error('Erro ao completar questionário manualmente', {
      tag: 'Quiz',
      data: { userId, error }
    });
    
    return { 
      success: false, 
      error: {
        message: error.message || 'Erro ao completar questionário',
        code: error.code || 'UNKNOWN_ERROR',
        details: error.details || error
      }
    };
  }
}

/**
 * Wrapper para salvar resposta com tratamento de erros aprimorado
 */
export async function saveQuizAnswer(userId: string, questionId: string, answer: string | string[], questionInfo: any = {}) {
  try {
    // Verifica se já existe uma submissão para este usuário
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('id, user_email')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (submissionError) {
      throw submissionError;
    }
    
    let submissionId;
    let userEmail = '';
    
    // Se não existir submissão, cria uma
    if (!submission) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      userEmail = userData.user?.email || '';
      
      const { data: newSubmission, error: createError } = await supabase
        .from('quiz_submissions')
        .insert([{
          user_id: userId,
          user_email: userEmail,
          current_module: 1,
          started_at: new Date().toISOString()
        }])
        .select();
        
      if (createError) {
        throw createError;
      }
      
      submissionId = newSubmission[0].id;
    } else {
      submissionId = submission.id;
      userEmail = submission.user_email;
    }
    
    // Normaliza a resposta para string
    let normalizedAnswer: string;
    
    if (Array.isArray(answer)) {
      normalizedAnswer = JSON.stringify(answer);
    } else if (typeof answer === 'object') {
      normalizedAnswer = JSON.stringify(answer);
    } else {
      normalizedAnswer = answer;
    }
    
    // Salva a resposta
    const { error: saveError } = await supabase
      .from('quiz_answers')
      .upsert({
        submission_id: submissionId,
        question_id: questionId,
        answer: normalizedAnswer,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'submission_id,question_id'
      });
      
    if (saveError) {
      throw saveError;
    }
    
    return { success: true, submissionId };
  } catch (error) {
    logger.error('Erro ao salvar resposta', {
      tag: 'Quiz',
      data: { questionId, userId, error }
    });
    
    return { 
      success: false, 
      error: {
        message: error.message || 'Erro ao salvar resposta',
        code: error.code || 'UNKNOWN_ERROR',
        details: error.details || error
      }
    };
  }
}
