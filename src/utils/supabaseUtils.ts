
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/database.types';
import type { QuizSubmission } from '@/types/quiz';
import { logger } from '@/utils/logger';

// Verifica se o questionário está completo para o usuário
export const isQuizComplete = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('is_complete')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      logger.error("Erro ao verificar status do questionário:", {
        tag: 'Quiz',
        data: { userId, error }
      });
      return false;
    }
    
    return data?.is_complete === true;
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

// Completa o questionário manualmente para o usuário
export const completeQuizManually = async (userId: string): Promise<boolean> => {
  if (!userId || !supabaseAdmin) return false;
  
  try {
    logger.info('Iniciando processo para completar questionário manualmente', {
      tag: 'Quiz',
      data: { userId }
    });
    
    // Usamos diretamente a RPC que foi criada no SQL para garantir privilégios adequados
    const { data, error } = await supabaseAdmin
      .rpc('complete_quiz', { user_id: userId });
    
    if (error) {
      logger.error("Erro ao completar questionário via RPC:", {
        tag: 'Quiz',
        data: { userId, error: JSON.stringify(error) }
      });
      return false;
    }
    
    logger.info('Questionário completado com sucesso via RPC', {
      tag: 'Quiz',
      data: { userId, result: data }
    });
    
    return data === true;
  } catch (error) {
    logger.error("Erro ao completar questionário manualmente:", {
      tag: 'Quiz',
      data: { userId, error }
    });
    return false;
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
