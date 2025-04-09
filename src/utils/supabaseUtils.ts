
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
    // Obter a submissão atual
    const { data: submissionData, error: fetchError } = await supabase
      .from('quiz_submissions')
      .select('id, completed')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError || !submissionData) {
      logger.error('Erro ao obter dados da submissão', {
        tag: 'Quiz',
        error: fetchError,
        userId
      });
      return false;
    }
    
    // Se já está completa, retornar sucesso
    if (submissionData.completed) {
      return true;
    }

    // Atualizar para completado
    const { error } = await supabase
      .from('quiz_submissions')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        contact_consent: true
      })
      .eq('id', submissionData.id);
    
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
