
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Utilitário para verificar se o questionário de um usuário está completo
 * @param userId ID do usuário
 * @returns boolean indicando se o questionário foi completado
 */
export const isQuizComplete = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('completed')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      logger.error('Erro ao verificar status do questionário', {
        tag: 'Quiz',
        data: error
      });
      return false;
    }
    
    return data?.completed || false;
  } catch (error) {
    logger.error('Exceção ao verificar status do questionário', {
      tag: 'Quiz',
      data: error
    });
    return false;
  }
};

/**
 * Utilitário para importar um usuário
 * Apenas administradores podem usar esta função
 */
export const importUser = async (userData: {
  email: string;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  asaas_id: string;
  password?: string;
}): Promise<any> => {
  try {
    const { data, error } = await supabaseAdmin.rpc('import_user_from_asaas', {
      p_email: userData.email,
      p_nome: userData.nome,
      p_cpf_cnpj: userData.cpf_cnpj,
      p_telefone: userData.telefone,
      p_asaas_id: userData.asaas_id,
      p_password: userData.password
    });
    
    if (error) {
      logger.error('Erro ao importar usuário', {
        tag: 'Admin',
        data: error
      });
      throw error;
    }
    
    return data;
  } catch (error) {
    logger.error('Exceção ao importar usuário', {
      tag: 'Admin',
      data: error
    });
    throw error;
  }
};

/**
 * Utilitário para enviar dados do questionário para webhook
 * @param submissionId ID da submissão do questionário
 */
export const sendQuizDataToWebhook = async (submissionId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: { submission_id: submissionId }
    });
    
    if (error) {
      logger.error('Erro ao enviar dados para webhook', {
        tag: 'Quiz',
        data: error
      });
      return false;
    }
    
    logger.info('Dados enviados com sucesso para webhook', {
      tag: 'Quiz',
      data
    });
    
    return true;
  } catch (error) {
    logger.error('Exceção ao enviar dados para webhook', {
      tag: 'Quiz',
      data: error
    });
    return false;
  }
};
