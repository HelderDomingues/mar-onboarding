import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { OnboardingContent } from "@/types/onboarding";

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
      .maybeSingle();
      
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
 * Utilitário para obter o conteúdo de onboarding ativo
 * @returns OnboardingContent ou null se não houver conteúdo ativo
 */
export const getActiveOnboardingContent = async (): Promise<OnboardingContent | null> => {
  try {
    const { data, error } = await supabase
      .from('onboarding_content')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
      
    if (error) {
      logger.error('Erro ao buscar conteúdo de onboarding', {
        tag: 'Onboarding',
        data: error
      });
      return null;
    }
    
    return data as OnboardingContent;
  } catch (error) {
    logger.error('Exceção ao buscar conteúdo de onboarding', {
      tag: 'Onboarding',
      data: error
    });
    return null;
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

/**
 * Utilitário para registrar acesso a um material
 * @param materialId ID do material
 * @param userId ID do usuário
 */
export const registerMaterialAccess = async (materialId: string, userId: string): Promise<boolean> => {
  try {
    // Inserir um registro de acesso
    const { error } = await supabase
      .from('material_accesses')
      .insert({
        material_id: materialId,
        user_id: userId,
        accessed_at: new Date().toISOString()
      });
      
    if (error) {
      logger.error('Erro ao registrar acesso ao material', {
        tag: 'Materials',
        data: error
      });
      return false;
    }
    
    // Incrementar o contador de acessos do material
    await supabase.rpc('increment_material_access_count', { 
      material_id: materialId 
    });
    
    return true;
  } catch (error) {
    logger.error('Exceção ao registrar acesso ao material', {
      tag: 'Materials',
      data: error
    });
    return false;
  }
};
