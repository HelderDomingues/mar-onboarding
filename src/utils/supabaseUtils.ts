
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
  } catch (error) {
    logger.error("Erro ao verificar status do questionário:", error);
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
      tag: 'Quiz',
      data: { userId }
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
        data: fetchError
      });
      return false;
    }
    
    // Se não encontrou a submissão, falhar
    if (!submissionData) {
      logger.error('Submissão não encontrada para o usuário', {
        tag: 'Quiz',
        data: { userId }
      });
      return false;
    }
    
    // Se já está completada, retornar sucesso imediatamente
    if (submissionData.completed) {
      logger.info('Questionário já estava marcado como completo', {
        tag: 'Quiz',
        data: { userId, submissionId: submissionData.id }
      });
      return true;
    }
    
    // Tentativa 1: Via RPC (função SQL específica)
    try {
      logger.info('Tentando completar questionário via RPC', {
        tag: 'Quiz',
        data: { userId }
      });
      
      const { data, error } = await supabase.rpc('complete_quiz_submission', {
        p_user_id: userId
      });
      
      if (!error) {
        logger.info('Questionário completado com sucesso via RPC', {
          tag: 'Quiz',
          data: { userId, result: data }
        });
        
        // Processar respostas para o formato simplificado
        try {
          await supabaseAdmin.rpc('process_quiz_completion', {
            p_user_id: userId
          });
          
          logger.info('Respostas processadas com sucesso para formato simplificado após RPC', {
            tag: 'Quiz',
            data: { userId }
          });
        } catch (processingException) {
          logger.error('Exceção ao processar respostas para formato simplificado após RPC', {
            tag: 'Quiz',
            data: { error: processingException, userId }
          });
        }
        
        return true;
      }
      
      logger.warn('Falha ao completar questionário via RPC', {
        tag: 'Quiz',
        data: { error, userId }
      });
    } catch (rpcAttemptError) {
      logger.error('Exceção ao tentar completar via RPC', {
        tag: 'Quiz',
        data: { error: rpcAttemptError, userId }
      });
    }
    
    // Tentativa 2: Diretamente via admin client (mais poder)
    try {
      logger.info('Tentando completar questionário via cliente admin', {
        tag: 'Quiz',
        data: { userId, submissionId: submissionData.id }
      });
      
      const { error: adminError } = await supabaseAdmin
        .from('quiz_submissions')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          contact_consent: true
        })
        .eq('id', submissionData.id);
      
      if (!adminError) {
        logger.info('Questionário completado com sucesso via cliente admin', {
          tag: 'Quiz',
          data: { userId, submissionId: submissionData.id }
        });
        
        // Processar respostas para o formato simplificado após atualização
        try {
          await supabaseAdmin.rpc('process_quiz_completion', {
            p_user_id: userId
          });
          
          logger.info('Respostas processadas com sucesso após atualização admin', {
            tag: 'Quiz',
            data: { userId }
          });
        } catch (processingException) {
          logger.error('Exceção ao processar respostas após atualização admin', {
            tag: 'Quiz',
            data: { error: processingException, userId }
          });
        }
        
        return true;
      }
      
      logger.error('Falha ao completar questionário via cliente admin', {
        tag: 'Quiz',
        data: { adminError, userId, submissionId: submissionData.id }
      });
    } catch (adminAttemptError) {
      logger.error('Exceção ao tentar completar via cliente admin', {
        tag: 'Quiz',
        data: { error: adminAttemptError, userId }
      });
    }
    
    // Tentativa 3: Atualização direta via UPSERT
    try {
      logger.info('Tentando completar via método UPSERT', {
        tag: 'Quiz', 
        data: { userId }
      });
      
      // Tentar através do método INSERT no modo UPSERT
      const { error: upsertError } = await supabaseAdmin
        .from('quiz_submissions')
        .upsert({
          id: submissionData.id,
          user_id: userId,
          completed: true,
          completed_at: new Date().toISOString(),
          contact_consent: true
        });
      
      if (!upsertError) {
        logger.info('Questionário completado com sucesso via upsert', {
          tag: 'Quiz',
          data: { userId }
        });
        
        // Processar respostas para formato simplificado
        try {
          await supabaseAdmin.rpc('process_quiz_completion', {
            p_user_id: userId
          });
          
          logger.info('Respostas processadas com sucesso após UPSERT', {
            tag: 'Quiz',
            data: { userId }
          });
        } catch (processingError) {
          logger.error('Erro ao processar respostas após UPSERT', {
            tag: 'Quiz',
            data: { error: processingError, userId }
          });
        }
        
        return true;
      }
      
      logger.error('Todos os métodos falharam ao completar questionário', {
        tag: 'Quiz',
        data: { upsertError, userId, submissionId: submissionData.id }
      });
      return false;
    } catch (finalAttemptError) {
      logger.error('Exceção ao tentar método UPSERT', {
        tag: 'Quiz', 
        data: { error: finalAttemptError, userId }
      });
      return false;
    }
  } catch (error) {
    logger.error('Exceção não tratada ao completar questionário', {
      tag: 'Quiz',
      data: error
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
      tag: 'Quiz',
      data: { submissionId }
    });
    
    // Usar a função edge diretamente para evitar problemas de permissão
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: { submissionId },
    });
    
    if (error) {
      logger.error("Erro ao invocar função quiz-webhook:", {
        tag: 'Quiz',
        data: error
      });
      return false;
    }
    
    logger.info('Dados enviados para webhook com sucesso', {
      tag: 'Quiz',
      data: { submissionId, response: data }
    });
    
    return true;
  } catch (error) {
    logger.error("Erro ao enviar dados para webhook:", {
      tag: 'Quiz',
      data: error
    });
    return false;
  }
};

/**
 * Utilitário para completar o questionário de um usuário manualmente
 * Método alternativo sem acessar a tabela auth.users
 * @param userId ID do usuário
 * @returns boolean indicando se a operação foi bem-sucedida
 */
export const completeQuizManually = async (userId: string): Promise<boolean> => {
  try {
    logger.info('Tentando completar questionário manualmente', {
      tag: 'Quiz',
      data: { userId }
    });
    
    // Obter a submissão atual
    const { data: submissionData, error: fetchError } = await supabase
      .from('quiz_submissions')
      .select('id, completed')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      logger.error('Erro ao obter dados da submissão', {
        tag: 'Quiz',
        data: fetchError
      });
      return false;
    }
    
    if (!submissionData) {
      logger.error('Submissão não encontrada', {
        tag: 'Quiz',
        data: { userId }
      });
      return false;
    }
    
    // Se já está completa, retornar sucesso
    if (submissionData.completed) {
      logger.info('Questionário já marcado como completo', {
        tag: 'Quiz',
        data: { userId, submissionId: submissionData.id }
      });
      return true;
    }
    
    // Atualizar diretamente a tabela quiz_submissions sem usar auth.users
    const { error: updateError } = await supabase
      .from('quiz_submissions')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        contact_consent: true
      })
      .eq('user_id', userId);
    
    if (updateError) {
      logger.error('Erro ao atualizar status de completude do questionário', {
        tag: 'Quiz',
        data: { updateError, userId }
      });
      return false;
    }
    
    logger.info('Questionário marcado como completo com sucesso', {
      tag: 'Quiz',
      data: { userId, submissionId: submissionData.id }
    });
    
    // Tentar processar as respostas para o formato simplificado
    try {
      await processQuizAnswersToSimplified(userId);
    } catch (processingError) {
      // Não falhar completamente se ocorrer erro no processamento
      logger.warn('Aviso: Erro ao processar respostas para formato simplificado', {
        tag: 'Quiz',
        data: { processingError, userId }
      });
    }
    
    // Tentar enviar os dados para o webhook
    try {
      if (submissionData.id) {
        await sendQuizDataToWebhook(submissionData.id);
      }
    } catch (webhookError) {
      // Não falhar completamente se o webhook falhar
      logger.warn('Aviso: Erro ao enviar dados para webhook', {
        tag: 'Quiz',
        data: { webhookError, userId }
      });
    }
    
    return true;
  } catch (error) {
    logger.error('Erro ao completar questionário manualmente', {
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
      await supabaseAdmin.rpc('process_quiz_completion', {
        p_user_id: userId
      });
      
      logger.info('Respostas processadas com sucesso para formato simplificado via RPC', {
        tag: 'Quiz',
        data: { userId }
      });
      
      return true;
    } catch (rpcError) {
      logger.error('Erro ao processar respostas via RPC', {
        tag: 'Quiz',
        data: { error: rpcError, userId }
      });
      
      // Se falhar, tentar fazer manualmente (análise de fallback)
      const { data: submissionData, error: submissionError } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (submissionError || !submissionData) {
        logger.error('Erro ao buscar submissão para processamento manual', {
          tag: 'Quiz',
          data: { error: submissionError, userId }
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
          data: { error: existingError, userId }
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
            data: { error: updateError, userId }
          });
          return false;
        }
        
        logger.info('Registro simplificado atualizado com sucesso', {
          tag: 'Quiz',
          data: { userId }
        });
        
        return true;
      }
      
      // Caso contrário, criar um novo registro básico
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        logger.error('Erro ao obter dados do usuário para processamento manual', {
          tag: 'Quiz',
          data: { error: userError, userId }
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
          data: { error: insertError, userId }
        });
        return false;
      }
      
      logger.info('Registro simplificado básico criado manualmente', {
        tag: 'Quiz',
        data: { userId }
      });
      
      return true;
    }
  } catch (error) {
    logger.error('Exceção ao processar respostas para formato simplificado', {
      tag: 'Quiz',
      data: { error, userId }
    });
    return false;
  }
};

