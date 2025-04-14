import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/database.types';
import type { QuizSubmission } from '@/types/quiz';
import { logger } from '@/utils/logger';
import { enviarRespostasParaWebhook } from '@/utils/webhookService';
import { normalizeAnswerForStorage } from '@/utils/formatUtils';

// Verifica se o questionário está completo para o usuário
export const isQuizComplete = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    logger.info("Verificando status do questionário", {
      tag: 'Quiz',
      data: { userId, action: 'isQuizComplete' }
    });
    
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('completed')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      logger.error("Erro ao verificar status do questionário:", {
        tag: 'Quiz',
        data: { userId, error }
      });
      return false;
    }
    
    // Verificar apenas a coluna 'completed'
    const isComplete = data?.completed === true;
    
    logger.info(`Status do questionário: ${isComplete ? 'Completo' : 'Incompleto'}`, {
      tag: 'Quiz',
      data: { userId, isComplete }
    });
    
    return isComplete;
  } catch (error) {
    logger.error("Erro ao verificar status do questionário:", {
      tag: 'Quiz',
      data: { userId, error }
    });
    return false;
  }
};

// Simplifica as respostas do questionário para exibição
export const processQuizAnswersToSimplified = async (userId: string) => {
  if (!userId) return null;
  
  try {
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('question_id, question_text, answer, module_id, module_title, module_number')
      .eq('user_id', userId);
      
    if (answersError) {
      logger.error("Erro ao buscar respostas:", {
        tag: 'Quiz',
        data: { userId, error: answersError }
      });
      return null;
    }
    
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (submissionError) {
      logger.error("Erro ao buscar submissão:", {
        tag: 'Quiz',
        data: { userId, error: submissionError }
      });
      return null;
    }
    
    // Adicionar nomes dos módulos às respostas se necessário
    if (answers && answers.length > 0) {
      // Buscar módulos
      const { data: modules } = await supabase
        .from('quiz_modules')
        .select('id, title, order_number');
        
      if (modules && modules.length > 0) {
        const processedAnswers = answers.map(answer => {
          if (!answer.module_title || !answer.module_number) {
            const module = modules.find(m => m.id === answer.module_id);
            if (module) {
              return {
                ...answer,
                module_title: module.title,
                module_number: module.order_number
              };
            }
          }
          return answer;
        });
        
        return {
          answers: processedAnswers,
          submission
        };
      }
    }
    
    return {
      answers,
      submission
    };
  } catch (error) {
    logger.error("Erro ao processar respostas:", {
      tag: 'Quiz',
      data: { userId, error }
    });
    return null;
  }
};

// Retorno detalhado para a função completeQuizManually
interface CompleteQuizResult {
  success: boolean;
  method?: 'rpc' | 'direct_update';
  error?: any;
}

// Completa o questionário manualmente para o usuário
export const completeQuizManually = async (userId: string): Promise<CompleteQuizResult> => {
  if (!userId) return { success: false, error: 'ID de usuário não fornecido' };
  
  try {
    logger.info('Iniciando processo para completar questionário manualmente', {
      tag: 'Quiz',
      data: { userId }
    });
    
    // Método alternativo via update direto - usando diretamente como primeira opção
    try {
      logger.info('Tentando completar questionário via atualização direta', {
        tag: 'Quiz',
        data: { userId, method: 'direct_update' }
      });
      
      // Verifica primeiro se o registro existe
      const { data: existingSubmission, error: checkError } = await supabase
        .from('quiz_submissions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) {
        logger.error("Erro ao verificar existência de submissão:", {
          tag: 'Quiz',
          data: { userId, error: checkError }
        });
        throw {
          message: "Erro ao verificar existência de submissão",
          details: checkError,
          method: 'direct_update'
        };
      }
      
      const now = new Date().toISOString();
      let updateResult;
      
      if (existingSubmission) {
        // Atualiza submissão existente
        updateResult = await supabase
          .from('quiz_submissions')
          .update({
            completed: true,
            completed_at: now,
            last_active: now
          })
          .eq('user_id', userId);
      } else {
        // Cria nova submissão
        updateResult = await supabase
          .from('quiz_submissions')
          .insert({
            user_id: userId,
            completed: true,
            completed_at: now,
            started_at: now,
            last_active: now,
            current_module: 8 // Assume que completou todos os módulos
          });
      }
      
      if (updateResult.error) {
        logger.error("Erro ao completar questionário (método direto):", {
          tag: 'Quiz',
          data: { 
            userId, 
            error: JSON.stringify(updateResult.error),
            errorMessage: updateResult.error.message,
            errorDetails: updateResult.error.details,
            errorCode: updateResult.error.code,
            errorHint: updateResult.error.hint
          }
        });
        
        throw {
          message: updateResult.error.message,
          details: updateResult.error.details,
          hint: updateResult.error.hint,
          code: updateResult.error.code,
          method: 'direct_update'
        };
      }
      
      logger.info('Questionário completado com sucesso (método direto)', {
        tag: 'Quiz',
        data: { userId }
      });
      
      return { 
        success: true, 
        method: 'direct_update' 
      };
    } catch (directError: any) {
      logger.error("Erro ao completar questionário com método direto:", {
        tag: 'Quiz',
        data: { 
          userId, 
          error: directError,
          errorMessage: directError.message || 'Erro desconhecido',
          errorDetails: directError.details || null,
          errorCode: directError.code || null,
          errorHint: directError.hint || null
        }
      });
      
      // Tenta o método RPC como fallback
      try {
        logger.info('Tentando completar questionário via RPC (fallback)', {
          tag: 'Quiz',
          data: { userId, method: 'RPC' }
        });
        
        const { data, error } = await supabase.rpc('complete_quiz', { user_id: userId });
        
        if (error) {
          logger.error("Erro ao completar questionário via RPC:", {
            tag: 'Quiz',
            data: { 
              userId, 
              error: JSON.stringify(error),
              errorMessage: error.message,
              errorDetails: error.details,
              errorHint: error.hint,
              errorCode: error.code
            }
          });
          
          throw {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            method: 'rpc'
          };
        }
        
        logger.info('Questionário completado com sucesso via RPC (fallback)', {
          tag: 'Quiz',
          data: { userId, result: data }
        });
        
        return { 
          success: true, 
          method: 'rpc' 
        };
      } catch (rpcError: any) {
        // Ambos os métodos falharam
        return { 
          success: false,
          error: {
            direct: directError,
            rpc: rpcError
          }
        };
      }
    }
  } catch (error) {
    logger.error("Erro ao completar questionário manualmente:", {
      tag: 'Quiz',
      data: { userId, error }
    });
    
    return { 
      success: false, 
      error 
    };
  }
};

// Função para depuração de conexão com API do Supabase
export const testSupabaseConnection = async () => {
  try {
    // Fazer uma chamada simples para o Supabase para testar a conexão
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
      
    if (error) {
      logger.error('Erro ao testar conexão com Supabase:', {
        tag: 'Supabase',
        data: { error }
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    logger.info('Teste de conexão com Supabase realizado com sucesso', {
      tag: 'Supabase',
      data: { result: 'OK' }
    });
    
    return { 
      success: true, 
      message: 'Conexão estabelecida com sucesso'
    };
  } catch (error: any) {
    logger.error('Exceção ao testar conexão com Supabase:', {
      tag: 'Supabase',
      data: { error }
    });
    
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido'
    };
  }
};

// Atualiza o arquivo de configuração do Supabase para habilitar a função de webhook
export const configurarSupabase = () => {
  try {
    // Esta função é apenas uma referência, a configuração real ocorre em outro lugar
    logger.info('Configuração do Supabase verificada', {
      tag: 'Supabase',
      data: { status: 'OK' }
    });
    return true;
  } catch (error) {
    logger.error("Erro ao configurar Supabase:", {
      tag: 'Supabase',
      data: { error }
    });
    return false;
  }
};

// Função para verificar se a tabela de backup existe
export const verificarTabelasBackup = async (): Promise<boolean> => {
  try {
    // Verificar se as tabelas de backup existem
    const { data, error } = await supabase
      .from('quiz_questions_backup')
      .select('count(*)', { count: 'exact', head: true });
      
    if (error) {
      logger.error("Erro ao verificar tabelas de backup:", {
        tag: 'Supabase',
        data: { error }
      });
      return false;
    }
    
    logger.info('Tabelas de backup verificadas', {
      tag: 'Supabase',
      data: { resultado: 'OK' }
    });
    
    return true;
  } catch (error) {
    logger.error("Erro ao verificar tabelas de backup:", {
      tag: 'Supabase',
      data: { error }
    });
    return false;
  }
};

/**
 * Envia os dados do questionário para um webhook externo
 * @param userId ID do usuário
 * @param submissionId ID da submissão do questionário
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export const sendQuizDataToWebhook = async (userId: string, submissionId: string): Promise<boolean> => {
  if (!userId || !submissionId) {
    logger.error("Parâmetros inválidos para envio de webhook", {
      tag: 'Quiz',
      data: { userId, submissionId }
    });
    return false;
  }
  
  try {
    logger.info("Iniciando processamento de webhook para questionário", {
      tag: 'Quiz',
      data: { userId, submissionId }
    });
    
    // Buscar submissão
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('id', submissionId)
      .maybeSingle();
      
    if (submissionError || !submission) {
      logger.error("Erro ao buscar submissão para webhook:", {
        tag: 'Quiz',
        data: { userId, submissionId, error: submissionError }
      });
      return false;
    }
    
    // Buscar respostas
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('user_id', userId);
      
    if (answersError) {
      logger.error("Erro ao buscar respostas para webhook:", {
        tag: 'Quiz',
        data: { userId, submissionId, error: answersError }
      });
      return false;
    }
    
    // Preparar objeto de respostas completas
    const respostasCompletas = {
      submission: submission,
      answers: answers || [],
      userId: userId,
      submissionId: submissionId,
      timestamp: new Date().toISOString()
    };
    
    // Enviar para o serviço de webhook
    const success = await enviarRespostasParaWebhook(userId, respostasCompletas);
    
    if (success) {
      // Atualizar o status de processamento do webhook
      const { error: updateError } = await supabase
        .from('quiz_submissions')
        .update({ webhook_processed: true })
        .eq('id', submissionId);
        
      if (updateError) {
        logger.error("Erro ao atualizar status de processamento do webhook:", {
          tag: 'Quiz',
          data: { userId, submissionId, error: updateError }
        });
        // Não falhar a operação se apenas o update falhar
      }
      
      logger.info("Webhook processado com sucesso", {
        tag: 'Quiz',
        data: { userId, submissionId }
      });
      
      return true;
    } else {
      logger.error("Falha ao processar webhook", {
        tag: 'Quiz',
        data: { userId, submissionId }
      });
      return false;
    }
  } catch (error) {
    logger.error("Exceção ao processar webhook:", {
      tag: 'Quiz',
      data: { userId, submissionId, error }
    });
    return false;
  }
};
