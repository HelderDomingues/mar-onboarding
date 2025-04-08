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
 * Utilitário para completar o questionário de um usuário
 * @param userId ID do usuário
 * @returns boolean indicando se a operação foi bem-sucedida
 */
export const completeQuizSubmission = async (userId: string): Promise<boolean> => {
  try {
    logger.info('Iniciando processo de finalização do questionário', {
      tag: 'Quiz'
    });
    
    // Obter ID da submissão atual
    const { data: submissionData, error: fetchError } = await supabase
      .from('quiz_submissions')
      .select('id, completed')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      logger.error('Erro ao obter dados da submissão', {
        tag: 'Quiz',
        error: fetchError
      });
      return false;
    }
    
    // Se não encontrou a submissão, falhar
    if (!submissionData) {
      logger.error('Submissão não encontrada para o usuário', {
        tag: 'Quiz',
        userId
      });
      return false;
    }
    
    // Se já está completada, retornar sucesso imediatamente
    if (submissionData.completed) {
      logger.info('Questionário já estava marcado como completo', {
        tag: 'Quiz',
        userId,
        submissionId: submissionData.id
      });
      return true;
    }
    
    // Abordagem principal: tentar RPC (função SQL específica)
    try {
      logger.info('Tentando completar questionário via RPC', {
        tag: 'Quiz',
        userId
      });
      
      const { data, error } = await supabase.rpc('complete_quiz_submission', {
        p_user_id: userId
      });
      
      if (!error) {
        logger.info('Questionário completado com sucesso via RPC', {
          tag: 'Quiz',
          userId,
          result: data
        });
        
        // Processar respostas para o formato simplificado
        await processQuizAnswersToSimplified(userId);
        return true;
      }
      
      logger.warn('Falha ao completar questionário via RPC', {
        tag: 'Quiz',
        error,
        userId
      });
    } catch (rpcAttemptError: any) {
      logger.error('Exceção ao tentar completar via RPC', {
        tag: 'Quiz',
        error: rpcAttemptError,
        userId
      });
    }
    
    // Abordagem de fallback: atualização direta
    try {
      logger.info('Tentando completar questionário via update direto', {
        tag: 'Quiz',
        userId,
        submissionId: submissionData.id
      });
      
      const { error: updateError } = await supabaseAdmin
        .from('quiz_submissions')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          contact_consent: true
        })
        .eq('id', submissionData.id);
      
      if (!updateError) {
        logger.info('Questionário completado com sucesso via update direto', {
          tag: 'Quiz',
          userId,
          submissionId: submissionData.id
        });
        
        // Processar respostas
        await processQuizAnswersToSimplified(userId);
        return true;
      }
      
      logger.error('Erro ao atualizar status de completude do questionário', {
        tag: 'Quiz',
        error: updateError,
        userId
      });
      return false;
    } catch (updateError: any) {
      logger.error('Erro ao completar questionário', {
        tag: 'Quiz',
        error: updateError,
        userId
      });
      return false;
    }
  } catch (error: any) {
    logger.error('Exceção não tratada ao completar questionário', {
      tag: 'Quiz',
      error
    });
    return false;
  }
};

/**
 * Utilitário para enviar dados do questionário para webhook
 * Versão atualizada que usa a edge function quiz-webhook diretamente
 * @param submissionId ID da submissão do questionário
 */
export const sendQuizDataToWebhook = async (submissionId: string): Promise<boolean> => {
  try {
    logger.info('Tentando enviar dados para webhook via função edge', {
      tag: 'Quiz'
    });
    
    // Usar a função edge diretamente para evitar problemas de permissão
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: { submissionId },
    });
    
    if (error) {
      logger.error("Erro ao invocar função quiz-webhook:", {
        tag: 'Quiz',
        error
      });
      return false;
    }
    
    logger.info('Dados enviados para webhook com sucesso', {
      tag: 'Quiz',
      submissionId,
      response: data
    });
    
    return true;
  } catch (error: any) {
    logger.error("Erro ao enviar dados para webhook:", {
      tag: 'Quiz',
      error
    });
    return false;
  }
};

/**
 * Utilitário para completar o questionário de um usuário manualmente
 * Método alternativo sem acessar a tabela auth.users
 * @param userId ID do usuário
 */
export const completeQuizManually = async (userId: string): Promise<boolean> => {
  try {
    logger.info('Tentando completar questionário manualmente', {
      tag: 'Quiz'
    });
    
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
      logger.info('Questionário já marcado como completo', {
        tag: 'Quiz',
        userId,
        submissionId: submissionData.id
      });
      return true;
    }
    
    // Atualizar diretamente a tabela quiz_submissions pelo ID 
    const { error: updateError } = await supabaseAdmin
      .from('quiz_submissions')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        contact_consent: true
      })
      .eq('id', submissionData.id);
    
    if (updateError) {
      logger.error('Erro ao atualizar status de completude do questionário', {
        tag: 'Quiz',
        error: updateError,
        userId
      });
      return false;
    }
    
    logger.info('Questionário marcado como completo com sucesso', {
      tag: 'Quiz',
      userId,
      submissionId: submissionData.id
    });
    
    // Tentar processar as respostas para o formato simplificado
    try {
      await processQuizAnswersToSimplified(userId);
    } catch (processingError: any) {
      // Não falhar completamente se ocorrer erro no processamento
      logger.warn('Aviso: Erro ao processar respostas para formato simplificado', {
        tag: 'Quiz',
        error: processingError,
        userId
      });
    }
    
    // Tentar enviar os dados para o webhook
    try {
      if (submissionData.id) {
        await sendQuizDataToWebhook(submissionData.id);
      }
    } catch (webhookError: any) {
      // Não falhar completamente se o webhook falhar
      logger.warn('Aviso: Erro ao enviar dados para webhook', {
        tag: 'Quiz',
        error: webhookError,
        userId
      });
    }
    
    return true;
  } catch (error: any) {
    logger.error('Erro ao completar questionário manualmente', {
      tag: 'Quiz',
      error
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
        error
      });
      throw error;
    }
    
    return data;
  } catch (error: any) {
    logger.error('Exceção ao importar usuário', {
      tag: 'Admin',
      error
    });
    throw error;
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

/**
 * Utilitário para verificar se existem respostas simplificadas para um usuário
 * @param userId ID do usuário
 * @returns boolean indicando se existem respostas simplificadas
 */
export const hasSimplifiedAnswers = async (userId: string): Promise<boolean> => {
  try {
    // Usando o método correto para compatibilidade
    const { data, error } = await supabase
      .from('quiz_respostas_completas')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      logger.error('Erro ao verificar respostas simplificadas', {
        tag: 'Quiz',
        data: error
      });
      return false;
    }
    
    return !!data;
  } catch (error) {
    logger.error('Exceção ao verificar respostas simplificadas', {
      tag: 'Quiz',
      data: error
    });
    return false;
  }
};

/**
 * Utilitário para processar manualmente respostas do quiz para o formato simplificado
 * @param userId ID do usuário
 * @returns boolean indicando se a operação foi bem-sucedida
 */
export const processQuizAnswersToSimplified = async (userId: string): Promise<boolean> => {
  try {
    // Tentar chamar a função RPC que processa as respostas
    try {
      logger.info('Processando respostas via RPC', {
        tag: 'Quiz',
        userId
      });
      
      await supabaseAdmin.rpc('process_quiz_completion', {
        p_user_id: userId
      });
      
      logger.info('Respostas processadas com sucesso para formato simplificado via RPC', {
        tag: 'Quiz',
        userId
      });
      
      return true;
    } catch (rpcError: any) {
      logger.error('Erro ao processar respostas via RPC', {
        tag: 'Quiz',
        error: rpcError,
        userId
      });
      
      // Se falhar, tentar fazer manualmente (análise de fallback)
      return await processAnswersManually(userId);
    }
  } catch (error: any) {
    logger.error('Exceção ao processar respostas para formato simplificado', {
      tag: 'Quiz',
      error,
      userId
    });
    return false;
  }
};

/**
 * Função auxiliar para processar respostas manualmente quando o RPC falha
 * @param userId ID do usuário
 * @returns boolean indicando se a operação foi bem-sucedida
 */
async function processAnswersManually(userId: string): Promise<boolean> {
  try {
    // Obter dados da submissão
    const { data: submissionData, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (submissionError || !submissionData) {
      logger.error('Erro ao buscar submissão para processamento manual', {
        tag: 'Quiz',
        error: submissionError,
        userId
      });
      return false;
    }
    
    // Verificar se já existe um registro em quiz_respostas_completas
    const { data: existingData, error: existingError } = await supabase
      .from('quiz_respostas_completas')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingError) {
      logger.error('Erro ao verificar existência de registro simplificado', {
        tag: 'Quiz',
        error: existingError,
        userId
      });
    }
    
    // Se já existir, apenas atualizar o status de completado
    if (existingData?.id) {
      const { error: updateError } = await supabaseAdmin
        .from('quiz_respostas_completas')
        .update({
          completed: submissionData.completed,
          completed_at: submissionData.completed_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);
      
      if (updateError) {
        logger.error('Erro ao atualizar registro simplificado existente', {
          tag: 'Quiz',
          error: updateError,
          userId
        });
        return false;
      }
      
      logger.info('Registro simplificado atualizado com sucesso', {
        tag: 'Quiz',
        userId
      });
      
      return true;
    }
    
    // Caso contrário, criar um novo registro básico
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      logger.error('Erro ao obter dados do usuário para processamento manual', {
        tag: 'Quiz',
        error: userError,
        userId
      });
      return false;
    }
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, company_name')
      .eq('id', userId)
      .maybeSingle();
    
    const { error: insertError } = await supabaseAdmin
      .from('quiz_respostas_completas')
      .insert({
        user_id: userId,
        submission_id: submissionData.id,
        email: userData.user.email,
        full_name: profileData?.full_name || '',
        company_name: profileData?.company_name || '',
        completed: submissionData.completed,
        completed_at: submissionData.completed_at
      });
    
    if (insertError) {
      logger.error('Erro ao inserir registro simplificado manual', {
        tag: 'Quiz',
        error: insertError,
        userId
      });
      return false;
    }
    
    logger.info('Registro simplificado básico criado manualmente', {
      tag: 'Quiz',
      userId
    });
    
    return true;
  } catch (error: any) {
    logger.error('Erro ao processar respostas manualmente', {
      tag: 'Quiz',
      error,
      userId
    });
    return false;
  }
}
