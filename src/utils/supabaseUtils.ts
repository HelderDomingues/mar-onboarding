
import { supabase } from "@/integrations/supabase/client";
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
      
    if (error) throw error;
    
    return data?.completed === true;
  } catch (error: any) {
    logger.error("Erro ao verificar status do questionário:", { 
      error,
      tag: "QuizStatus" 
    });
    return false;
  }
};

/**
 * Utilitário simplificado para completar questionário
 */
export const completeQuizManually = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('quiz_submissions')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        contact_consent: true
      })
      .eq('user_id', userId);
    
    if (error) {
      logger.error('Erro ao atualizar submissão', {
        tag: 'Quiz',
        error,
        userId
      });
      return false;
    }
    
    return true;
  } catch (error: any) {
    logger.error('Erro ao completar questionário', {
      tag: 'Quiz',
      error
    });
    return false;
  }
};

/**
 * Utilitário para obter o conteúdo de onboarding ativo
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
 * Função para processar as respostas do questionário para um formato simplificado
 * Esta é uma versão simplificada que apenas devolve sucesso para compatibilidade
 */
export const processQuizAnswersToSimplified = async (userId: string): Promise<boolean> => {
  try {
    logger.info('Processando respostas do questionário', {
      tag: 'Quiz',
      userId
    });
    return true;
  } catch (error) {
    logger.error('Erro ao processar respostas do questionário', {
      tag: 'Quiz',
      error
    });
    return false;
  }
};

/**
 * Função para enviar dados do questionário para webhook
 * Esta é uma versão simplificada que apenas devolve sucesso para compatibilidade
 */
export const sendQuizDataToWebhook = async (submissionId: string): Promise<boolean> => {
  try {
    logger.info('Enviando dados do questionário para webhook', {
      tag: 'Quiz',
      submissionId
    });
    return true;
  } catch (error) {
    logger.error('Erro ao enviar dados para webhook', {
      tag: 'Quiz',
      error
    });
    return false;
  }
};

/**
 * Utilitário para registrar acesso a um material
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
    
    return true;
  } catch (error) {
    logger.error('Exceção ao registrar acesso ao material', {
      tag: 'Materials',
      data: error
    });
    return false;
  }
};
