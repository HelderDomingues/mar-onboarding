
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
    
    return data?.completed === true; // Verifica se é exatamente true
  } catch (error) {
    logger.error('Exceção ao verificar status do questionário', {
      tag: 'Quiz',
      data: error
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
      tag: 'Quiz',
      data: { userId }
    });
    
    // Obter ID da submissão atual para referência em logs
    const { data: submissionData, error: fetchError } = await supabase
      .from('quiz_submissions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      logger.error('Erro ao obter ID da submissão antes de completar', {
        tag: 'Quiz',
        data: fetchError
      });
    }
    
    const submissionId = submissionData?.id;
    logger.info('ID da submissão obtido', {
      tag: 'Quiz',
      data: { submissionId }
    });
    
    // Tentativa 1: Via RPC (função SQL específica) - Esta é a mais recomendada
    try {
      logger.info('Tentando completar questionário via RPC', {
        tag: 'Quiz',
        data: { userId, submissionId }
      });
      
      const { data, error } = await supabase.rpc('complete_quiz_submission', {
        p_user_id: userId
      });
      
      if (!error && data) {
        logger.info('Questionário completado com sucesso via RPC', {
          tag: 'Quiz',
          data: { userId, submissionId, result: data }
        });
        
        // Após completar o questionário, vamos processar as respostas para o formato simplificado
        try {
          const { data: processingResult, error: processingError } = await supabase.rpc('process_quiz_completion', {
            p_user_id: userId
          });
          
          if (processingError) {
            logger.error('Erro ao processar respostas para formato simplificado', {
              tag: 'Quiz',
              data: { error: processingError, userId }
            });
          } else {
            logger.info('Respostas processadas com sucesso para formato simplificado', {
              tag: 'Quiz',
              data: { userId, resultId: processingResult }
            });
          }
        } catch (processingException) {
          logger.error('Exceção ao processar respostas para formato simplificado', {
            tag: 'Quiz',
            data: { error: processingException, userId }
          });
        }
        
        return true;
      }
      
      logger.warn('Falha ao completar questionário via RPC', {
        tag: 'Quiz',
        data: { error, userId, submissionId }
      });
    } catch (rpcAttemptError) {
      logger.error('Exceção ao tentar completar via RPC', {
        tag: 'Quiz',
        data: { error: rpcAttemptError, userId, submissionId }
      });
    }
    
    // Tentativa 2: Diretamente via cliente normal com RLS
    try {
      logger.info('Tentando completar questionário via cliente normal', {
        tag: 'Quiz',
        data: { userId, submissionId }
      });
      
      const { error: updateError } = await supabase
        .from('quiz_submissions')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          contact_consent: true
        })
        .eq('user_id', userId);
      
      if (!updateError) {
        logger.info('Questionário completado com sucesso via cliente normal', {
          tag: 'Quiz',
          data: { userId, submissionId }
        });
        
        // Processamento manual para o formato simplificado após atualização
        try {
          const { data: processingResult, error: processingError } = await supabase.rpc('process_quiz_completion', {
            p_user_id: userId
          });
          
          if (processingError) {
            logger.error('Erro ao processar respostas para formato simplificado após atualização', {
              tag: 'Quiz',
              data: { error: processingError, userId }
            });
          } else {
            logger.info('Respostas processadas com sucesso para formato simplificado após atualização', {
              tag: 'Quiz',
              data: { userId, resultId: processingResult }
            });
          }
        } catch (processingException) {
          logger.error('Exceção ao processar respostas para formato simplificado após atualização', {
            tag: 'Quiz',
            data: { error: processingException, userId }
          });
        }
        
        return true;
      }
      
      logger.error('Falha ao completar questionário via cliente normal', {
        tag: 'Quiz',
        data: { updateError, userId, submissionId }
      });
    } catch (updateAttemptError) {
      logger.error('Exceção ao tentar completar via cliente normal', {
        tag: 'Quiz',
        data: { error: updateAttemptError, userId, submissionId }
      });
    }
    
    // Tentativa 3: Via cliente admin (última opção)
    try {
      logger.info('Tentando completar questionário via cliente admin', {
        tag: 'Quiz',
        data: { userId, submissionId }
      });
      
      const { error: adminError } = await supabaseAdmin
        .from('quiz_submissions')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          contact_consent: true
        })
        .eq('user_id', userId);
      
      if (!adminError) {
        logger.info('Questionário completado com sucesso via cliente admin', {
          tag: 'Quiz',
          data: { userId, submissionId }
        });
        
        // Processamento manual para o formato simplificado após atualização admin
        try {
          await supabaseAdmin.rpc('process_quiz_completion', {
            p_user_id: userId
          });
          
          logger.info('Respostas processadas com sucesso para formato simplificado após atualização admin', {
            tag: 'Quiz',
            data: { userId }
          });
        } catch (processingException) {
          logger.error('Exceção ao processar respostas para formato simplificado após atualização admin', {
            tag: 'Quiz',
            data: { error: processingException, userId }
          });
        }
        
        return true;
      }
      
      logger.error('Todos os métodos falharam ao completar questionário', {
        tag: 'Quiz',
        data: { adminError, userId, submissionId }
      });
      return false;
    } catch (adminAttemptError) {
      logger.error('Exceção ao tentar completar via cliente admin', {
        tag: 'Quiz',
        data: { error: adminAttemptError, userId, submissionId }
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
 * @param submissionId ID da submissão do questionário
 */
export const sendQuizDataToWebhook = async (submissionId: string): Promise<boolean> => {
  try {
    logger.info('Enviando dados para webhook', {
      tag: 'Quiz',
      data: { submissionId, timestamp: new Date().toISOString() }
    });
    
    // Tentativa 1
    let retries = 2;
    let success = false;
    let lastError = null;
    let lastResponse = null;
    
    while (retries >= 0 && !success) {
      try {
        const { data, error } = await supabase.functions.invoke('quiz-webhook', {
          body: { submission_id: submissionId }
        });
        
        if (error) throw error;
        
        lastResponse = data;
        success = true;
        logger.info('Dados enviados com sucesso para webhook', {
          tag: 'Quiz',
          data
        });
        
        return true;
      } catch (error) {
        lastError = error;
        retries--;
        
        if (retries >= 0) {
          logger.warn(`Erro ao enviar dados para webhook, tentando novamente. Tentativas restantes: ${retries}`, {
            tag: 'Quiz',
            data: error
          });
          
          // Esperar 1 segundo antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!success) {
      // Tentar um método alternativo: chamada direta à URL do webhook
      try {
        logger.warn('Tentando método alternativo: chamada direta ao webhook', {
          tag: 'Quiz',
          data: { submissionId }
        });
        
        const response = await fetch('https://nmxfknwkhnengqqjtwru.supabase.co/functions/v1/quiz-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
          },
          body: JSON.stringify({ submission_id: submissionId })
        });
        
        if (!response.ok) {
          throw new Error(`Resposta HTTP não-OK: ${response.status}`);
        }
        
        const data = await response.json();
        logger.info('Dados enviados com sucesso para webhook (método alternativo)', {
          tag: 'Quiz',
          data
        });
        
        return true;
      } catch (directError) {
        logger.error('Também falhou o método alternativo de envio para webhook', {
          tag: 'Quiz',
          data: directError
        });
        
        logger.error('Todas as tentativas de envio para webhook falharam', {
          tag: 'Quiz',
          data: { lastError, lastResponse }
        });
        return false;
      }
    }
    
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
    const { data, error } = await supabase
      .from('quiz_respostas_completas')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      logger.error('Erro ao verificar respostas simplificadas', {
        tag: 'Quiz',
        data: error
      });
      return false;
    }
    
    return data?.id !== undefined;
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
    const { data, error } = await supabase.rpc('process_quiz_completion', {
      p_user_id: userId
    });
    
    if (error) {
      logger.error('Erro ao processar respostas para formato simplificado', {
        tag: 'Quiz',
        data: { error, userId }
      });
      return false;
    }
    
    logger.info('Respostas processadas com sucesso para formato simplificado', {
      tag: 'Quiz',
      data: { userId, resultId: data }
    });
    
    return data !== null;
  } catch (error) {
    logger.error('Exceção ao processar respostas para formato simplificado', {
      tag: 'Quiz',
      data: { error, userId }
    });
    return false;
  }
};
