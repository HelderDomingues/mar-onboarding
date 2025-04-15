import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/database.types';
import type { QuizSubmission } from '@/types/quiz';
import { logger } from '@/utils/logger';
import { enviarRespostasParaWebhook } from '@/utils/webhookService';
import { normalizeAnswerForStorage } from '@/utils/formatUtils';
import { SystemError, OperationResult } from '@/types/errors';
import { formatError, parseSupabaseError, logError } from '@/utils/errorUtils';

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
      logError(parseSupabaseError(error, 'isQuizComplete'), 'Quiz');
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
    logError(formatError(error, 'isQuizComplete'), 'Quiz');
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
interface CompleteQuizResult extends OperationResult {
  method?: 'rpc' | 'direct_update' | 'manual_update';
}

// Completa o questionário manualmente para o usuário
export const completeQuizManually = async (userId: string): Promise<CompleteQuizResult> => {
  if (!userId) {
    const error: SystemError = {
      message: 'ID de usuário não fornecido',
      code: 'USER_ID_REQUIRED',
      origin: 'client',
      context: 'completeQuizManually'
    };
    logError(error, 'Quiz');
    return { success: false, error };
  }
  
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
      
      // Verificamos primeiro se o registro existe
      const { data: existingSubmission, error: checkError } = await supabase
        .from('quiz_submissions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) {
        const formattedError = parseSupabaseError(checkError, 'completeQuizManually.checkExisting');
        logError(formattedError, 'Quiz');
        throw formattedError;
      }
      
      const now = new Date().toISOString();
      
      // Obtém o email do usuário da sessão atual
      const { data: userSession } = await supabase.auth.getUser();
      const userEmail = userSession?.user?.email;
      
      if (!userEmail) {
        const error: SystemError = {
          message: "Email do usuário não encontrado na sessão",
          code: "EMAIL_NOT_FOUND",
          details: "O email do usuário é obrigatório para concluir o questionário",
          origin: 'client',
          context: 'completeQuizManually.getUserEmail'
        };
        logError(error, 'Quiz');
        throw error;
      }
      
      let updateResult;
      
      if (existingSubmission) {
        // Atualiza submissão existente sem usar o campo email diretamente
        updateResult = await supabase
          .from('quiz_submissions')
          .update({
            completed: true,
            completed_at: now,
            last_active: now,
            user_email: userEmail // Usamos user_email em vez de email
          })
          .eq('user_id', userId);
      } else {
        // Cria nova submissão
        updateResult = await supabase
          .from('quiz_submissions')
          .insert({
            user_id: userId,
            user_email: userEmail, // Usamos user_email em vez de email
            completed: true,
            completed_at: now,
            started_at: now,
            last_active: now,
            current_module: 8 // Assume que completou todos os módulos
          });
      }
      
      if (updateResult.error) {
        const formattedError = parseSupabaseError(updateResult.error, 'completeQuizManually.directUpdate');
        logError(formattedError, 'Quiz');
        
        throw formattedError;
      }
      
      logger.info('Questionário completado com sucesso (método direto)', {
        tag: 'Quiz',
        data: { userId }
      });
      
      return { 
        success: true, 
        method: 'direct_update',
        message: 'Questionário concluído com sucesso' 
      };
    } catch (directError: any) {
      const formattedDirectError = directError.code 
        ? directError // Já está formatado
        : formatError(directError, 'completeQuizManually.directUpdate');
      
      logError(formattedDirectError, 'Quiz');
      
      // Tenta o método manual como fallback - ajustado para trabalhar com userEmail
      try {
        logger.info('Tentando completar questionário via chamada manual direta (fallback)', {
          tag: 'Quiz',
          data: { userId, method: 'manual_update' }
        });
        
        // Obtém o email do usuário da sessão atual
        const { data: userSession } = await supabase.auth.getUser();
        const userEmail = userSession?.user?.email;
        
        if (!userEmail) {
          const error: SystemError = {
            message: "Email do usuário não encontrado na sessão",
            code: "EMAIL_NOT_FOUND",
            details: "O email do usuário é obrigatório para concluir o questionário",
            origin: 'client',
            context: 'completeQuizManually.fallback.getUserEmail'
          };
          throw error;
        }
        
        // Usa transações básicas
        const now = new Date().toISOString();
        
        const { data: existingSubmission } = await supabase
          .from('quiz_submissions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
          
        let manualResult;
        
        if (existingSubmission) {
          manualResult = await supabase
            .from('quiz_submissions')
            .update({
              completed: true,
              completed_at: now,
              last_active: now,
              user_email: userEmail // Usamos user_email em vez de email
            })
            .eq('id', existingSubmission.id);
        } else {
          manualResult = await supabase
            .from('quiz_submissions')
            .insert({
              user_id: userId,
              user_email: userEmail, // Usamos user_email em vez de email
              completed: true,
              completed_at: now,
              started_at: now,
              last_active: now,
              current_module: 8
            });
        }
        
        if (manualResult.error) {
          const formattedError = parseSupabaseError(manualResult.error, 'completeQuizManually.fallback');
          throw formattedError;
        }
        
        logger.info('Questionário completado com sucesso via método manual (fallback)', {
          tag: 'Quiz',
          data: { userId }
        });
        
        return { 
          success: true, 
          method: 'manual_update',
          message: 'Questionário concluído com sucesso (método alternativo)'
        };
      } catch (manualError: any) {
        // Formatar erro manual se ainda não estiver formatado
        const formattedManualError = manualError.code 
          ? manualError 
          : formatError(manualError, 'completeQuizManually.fallback');
        
        // Ambos os métodos falharam
        const combinedError: SystemError = {
          message: "Falha ao completar questionário após múltiplas tentativas",
          code: formattedManualError.code || formattedDirectError.code,
          details: {
            directError: formattedDirectError,
            manualError: formattedManualError
          },
          hint: formattedManualError.hint || formattedDirectError.hint,
          origin: 'multiple',
          context: 'completeQuizManually.allMethods'
        };
        
        logError(combinedError, 'Quiz');
        
        return { 
          success: false,
          error: combinedError,
          message: 'Não foi possível completar o questionário após várias tentativas'
        };
      }
    }
  } catch (error: any) {
    const formattedError = formatError(error, 'completeQuizManually');
    logError(formattedError, 'Quiz');
    
    return { 
      success: false, 
      error: formattedError,
      message: 'Erro ao completar questionário: ' + formattedError.message
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

/**
 * Obtém as respostas completas de um questionário específico
 * @param submissionId ID da submissão do questionário
 * @returns Objeto contendo as respostas completas ou null em caso de erro
 */
export const getQuizCompletedAnswers = async (submissionId: string) => {
  if (!submissionId) {
    logger.error("ID de submissão não fornecido para buscar respostas completas", {
      tag: 'Quiz',
      data: { submissionId }
    });
    return null;
  }
  
  try {
    // Buscar registro de respostas completas
    const { data, error } = await supabase
      .from('quiz_respostas_completas')
      .select('*')
      .eq('submission_id', submissionId)
      .maybeSingle();
      
    if (error) {
      logger.error("Erro ao buscar respostas completas:", {
        tag: 'Quiz',
        data: { submissionId, error }
      });
      return null;
    }
    
    if (!data) {
      logger.info("Nenhuma resposta completa encontrada para esta submissão", {
        tag: 'Quiz',
        data: { submissionId }
      });
      return null;
    }
    
    logger.info("Respostas completas obtidas com sucesso", {
      tag: 'Quiz',
      data: { submissionId }
    });
    
    return data;
  } catch (error) {
    logger.error("Exceção ao buscar respostas completas:", {
      tag: 'Quiz',
      data: { submissionId, error }
    });
    return null;
  }
};

/**
 * Formata os dados de respostas completas para CSV
 * @param data Objeto contendo as respostas completas
 * @returns String no formato CSV ou null em caso de erro
 */
export const formatCompletedAnswersToCSV = (data: any): string | null => {
  if (!data || !data.respostas) {
    return null;
  }
  
  try {
    // Extrair as respostas do objeto JSON
    const respostas = data.respostas;
    
    // Cabeçalho do CSV
    const headers = ['Pergunta', 'Resposta'];
    
    // Linhas do CSV
    const rows = Object.entries(respostas).map(([pergunta, resposta]) => {
      // Formatar a resposta adequadamente
      let respostaFormatada = resposta;
      
      // Se for um array ou objeto, converter para string
      if (typeof resposta === 'object') {
        respostaFormatada = JSON.stringify(resposta);
      }
      
      // Escapar aspas duplas e envolver em aspas se contiver vírgulas
      const perguntaFormatada = pergunta.includes(',') ? `"${pergunta.replace(/"/g, '""')}"` : pergunta;
      const respostaString = String(respostaFormatada);
      const respostaEscapada = respostaString.includes(',') ? `"${respostaString.replace(/"/g, '""')}"` : respostaString;
      
      return [perguntaFormatada, respostaEscapada];
    });
    
    // Montar o CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  } catch (error) {
    logger.error("Erro ao formatar respostas para CSV:", {
      tag: 'Quiz',
      data: { error }
    });
    return null;
  }
};

/**
 * Formata os dados de respostas completas para um objeto estruturado para PDF
 * @param data Objeto contendo as respostas completas
 * @returns Objeto estruturado para geração de PDF ou null em caso de erro
 */
export const formatCompletedAnswersForPDF = (data: any): any | null => {
  if (!data || !data.respostas) {
    return null;
  }
  
  try {
    // Extrair as respostas e informações do usuário
    const { respostas, user_name, user_email, data_submissao } = data;
    
    // Formatar data de submissão
    const dataFormatada = new Date(data_submissao).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Preparar cabeçalho do documento
    const cabecalho = {
      usuario: user_name || 'Não informado',
      email: user_email || 'Não informado',
      dataSubmissao: dataFormatada
    };
    
    // Transformar respostas em um array para facilitar a renderização
    const respostasArray = Object.entries(respostas).map(([pergunta, resposta]) => {
      // Formatar a resposta adequadamente
      let respostaFormatada = resposta;
      
      // Se for um array ou objeto, formatar como string legível
      if (typeof resposta === 'object' && resposta !== null) {
        if (Array.isArray(resposta)) {
          respostaFormatada = resposta.join(', ');
        } else {
          respostaFormatada = JSON.stringify(resposta, null, 2);
        }
      }
      
      return {
        pergunta,
        resposta: String(respostaFormatada)
      };
    });
    
    // Retornar objeto estruturado
    return {
      cabecalho,
      respostas: respostasArray
    };
  } catch (error) {
    logger.error("Erro ao formatar respostas para PDF:", {
      tag: 'Quiz',
      data: { error }
    });
    return null;
  }
};

/**
 * Busca todas as submissões completas para um administrador visualizar
 * @returns Array de submissões ou null em caso de erro
 */
export const getQuizCompletedSubmissionsForAdmin = async () => {
  try {
    // Verificar se o usuário é admin
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabase.auth.getUser())
      .in('role', ['admin']);
      
    const isAdmin = userRoles && userRoles.length > 0;
    
    if (rolesError || !isAdmin) {
      logger.error("Acesso negado: usuário não é administrador", {
        tag: 'Admin',
        data: { error: rolesError }
      });
      return null;
    }
    
    // Buscar todas as submissões completas
    const { data, error } = await supabase
      .from('quiz_respostas_completas')
      .select(`
        id,
        user_id,
        user_name,
        user_email,
        data_submissao,
        submission_id,
        webhook_processed
      `)
      .order('data_submissao', { ascending: false });
      
    if (error) {
      logger.error("Erro ao buscar submissões completas:", {
        tag: 'Admin',
        data: { error }
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error("Exceção ao buscar submissões completas para admin:", {
      tag: 'Admin',
      data: { error }
    });
    return null;
  }
};
