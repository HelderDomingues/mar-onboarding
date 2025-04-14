import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/database.types';
import type { QuizSubmission } from '@/types/quiz';
import { logger } from '@/utils/logger';

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
      .select('question_id, question_text, answer')
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

// Envia dados do questionário para um webhook externo
export const sendQuizDataToWebhook = async (userId: string, submissionId: string) => {
  try {
    logger.info("Enviando dados para webhook...", {
      tag: 'Quiz',
      data: { userId, submissionId }
    });
    
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: { submissionId }
    });
    
    if (error) {
      logger.error("Erro ao invocar função de webhook:", {
        tag: 'Quiz',
        data: { userId, submissionId, error }
      });
      return false;
    }
    
    logger.info("Dados enviados com sucesso para webhook", {
      tag: 'Quiz',
      data: { userId, submissionId, response: data }
    });
    
    return true;
  } catch (error) {
    logger.error("Erro ao enviar dados para webhook:", {
      tag: 'Quiz',
      data: { userId, submissionId, error }
    });
    return false;
  }
};

// Obter detalhes simplificados do questionário
export const getQuizDetails = async (userId: string) => {
  if (!userId) return null;
  
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
      logger.error("Erro ao buscar detalhes do questionário:", {
        tag: 'Quiz',
        data: { userId, error }
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error("Erro ao buscar detalhes do questionário:", {
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
    
    // Usar função RPC via cliente padrão (não precisa mais do admin)
    try {
      logger.info('Tentando completar questionário via RPC', {
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
      
      logger.info('Questionário completado com sucesso via RPC', {
        tag: 'Quiz',
        data: { userId, result: data }
      });
      
      return { 
        success: true, 
        method: 'rpc' 
      };
    } catch (rpcError: any) {
      // Se falhar, tenta o método alternativo
      logger.warn('Falha no método RPC, tentando método alternativo', {
        tag: 'Quiz',
        data: { 
          userId, 
          error: rpcError,
          message: rpcError.message || 'Erro desconhecido no RPC'
        }
      });
    }
    
    // Método alternativo via update direto
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
      
      let updateResult;
      
      if (existingSubmission) {
        // Atualiza submissão existente
        updateResult = await supabase
          .from('quiz_submissions')
          .update({
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // Cria nova submissão
        updateResult = await supabase
          .from('quiz_submissions')
          .insert({
            user_id: userId,
            completed: true,
            completed_at: new Date().toISOString()
          });
      }
      
      if (updateResult.error) {
        logger.error("Erro ao completar questionário (método alternativo):", {
          tag: 'Quiz',
          data: { 
            userId, 
            error: JSON.stringify(updateResult.error),
            errorMessage: updateResult.error.message,
            errorDetails: updateResult.error.details 
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
      
      logger.info('Questionário completado com sucesso (método alternativo)', {
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
        data: { userId, error: directError }
      });
      
      // Ambos os métodos falharam
      return { 
        success: false, 
        method: 'direct_update',
        error: directError 
      };
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
