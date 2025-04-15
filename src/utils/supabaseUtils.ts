
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/database.types';
import type { QuizSubmission } from '@/types/quiz';
import { logger } from '@/utils/logger';
import { enviarRespostasParaWebhook } from '@/utils/webhookService';
import { normalizeAnswerForStorage } from '@/utils/formatUtils';
import { SystemError, OperationResult, ErrorCategory } from '@/types/errors';
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

/**
 * Completa o questionário para o usuário atual
 * Versão otimizada da função com melhor tratamento de erros e sem métodos redundantes
 * 
 * @param userId ID do usuário para completar o questionário
 * @returns Resultado da operação com detalhes adicionais
 */
export const completeQuizManually = async (userId: string): Promise<OperationResult> => {
  // Validação inicial do ID do usuário
  if (!userId) {
    const error: SystemError = {
      message: 'ID de usuário não fornecido',
      code: 'USER_ID_REQUIRED',
      origin: 'client',
      context: 'completeQuizManually'
    };
    logError(error, 'Quiz');
    return { success: false, error, message: 'ID de usuário não fornecido' };
  }
  
  try {
    logger.info('Iniciando processo para completar questionário', {
      tag: 'Quiz',
      data: { userId, action: 'completeQuizManually', timestamp: new Date().toISOString() }
    });
    
    // Passo 1: Obter o email do usuário da sessão atual (essencial para completar o questionário)
    const { data: userSession, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError) {
      const error: SystemError = {
        message: "Erro ao obter dados da sessão do usuário",
        code: "SESSION_ERROR",
        details: sessionError.message,
        origin: 'supabase',
        context: 'completeQuizManually.getUserSession'
      };
      logError(error, 'Quiz');
      throw error;
    }
    
    const userEmail = userSession?.user?.email;
    
    logger.info('Informações da sessão obtidas', {
      tag: 'Quiz',
      data: { 
        userId, 
        hasEmail: !!userEmail,
        sessionUserId: userSession?.user?.id,
        timestamp: new Date().toISOString()
      }
    });
    
    if (!userEmail) {
      // Tentativa adicional: buscar email do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_email')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        logger.warn('Erro ao buscar email do perfil do usuário', {
          tag: 'Quiz',
          data: { userId, error: profileError }
        });
      } else if (profile?.user_email) {
        logger.info('Email obtido do perfil do usuário', {
          tag: 'Quiz',
          data: { userId, email: profile.user_email }
        });
        // Continuar com o email do perfil
      } else {
        // Última tentativa: buscar direto da tabela auth.users via função RPC
        const { data: authUser, error: authError } = await supabase
          .rpc('get_user_email', { p_user_id: userId });
          
        if (authError || !authUser) {
          logger.error('Falha em todas as tentativas de obter email do usuário', {
            tag: 'Quiz',
            data: { userId, authError }
          });
          
          throw {
            message: "Email do usuário não encontrado em nenhuma fonte",
            code: "EMAIL_NOT_FOUND",
            details: "O email do usuário é obrigatório para concluir o questionário",
            origin: 'client',
            context: 'completeQuizManually.getUserEmail'
          };
        }
        
        logger.info('Email obtido da tabela auth.users', {
          tag: 'Quiz',
          data: { userId, hasEmail: !!authUser }
        });
      }
    }
    
    // Passo 2: Buscar informações completas do perfil para ter o nome do usuário
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();
    
    // Não falharemos se o perfil não for encontrado, apenas logamos
    if (profileError) {
      logger.warn('Erro ao buscar perfil do usuário, continuando sem nome completo', {
        tag: 'Quiz',
        data: { userId, error: profileError }
      });
    }
    
    const userName = userProfile?.full_name || null;
    
    // Passo 3: Verificar se o usuário já respondeu todas as perguntas
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('id')
      .eq('user_id', userId);
      
    if (answersError) {
      logger.warn('Erro ao verificar respostas existentes', {
        tag: 'Quiz',
        data: { userId, error: answersError }
      });
    } else {
      logger.info('Verificação de respostas: usuário respondeu perguntas', {
        tag: 'Quiz',
        data: { userId, totalRespostas: answers?.length || 0 }
      });
    }
    
    // Passo 4: Usar a função complete_quiz do PostgreSQL via RPC
    // Esta função está configurada como SECURITY DEFINER e tem todas as validações necessárias
    logger.info('Chamando função RPC complete_quiz para finalizar questionário', {
      tag: 'Quiz',
      data: { 
        userId, 
        userEmail: userEmail || "não disponível", 
        userName: userName || "não disponível" 
      }
    });
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('complete_quiz', {
      user_id: userId
    });
    
    // Se houve erro na chamada RPC, registrar e retornar
    if (rpcError) {
      const formattedError: SystemError = {
        message: "Erro ao completar questionário via RPC",
        code: rpcError.code,
        details: rpcError.message,
        origin: 'supabase',
        context: 'completeQuizManually.rpcCall'
      };
      
      logError(formattedError, 'Quiz');
      throw formattedError;
    }
    
    // Se a RPC retornou false, algo deu errado internamente
    if (rpcResult === false) {
      const error: SystemError = {
        message: "Falha ao completar questionário",
        code: "RPC_RETURNED_FALSE",
        details: "A função RPC retornou false indicando falha interna",
        origin: 'supabase',
        context: 'completeQuizManually.rpcResult'
      };
      
      logError(error, 'Quiz');
      throw error;
    }
    
    // Passo 5: Obter a última submissão para processar webhook
    const { data: latestSubmission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (submissionError) {
      logger.warn('Erro ao obter ID da última submissão para webhook', {
        tag: 'Quiz',
        data: { userId, error: submissionError }
      });
    } else if (latestSubmission?.id) {
      logger.info('Iniciando processamento de webhook em segundo plano', {
        tag: 'Quiz',
        data: { userId, submissionId: latestSubmission.id }
      });
      
      // Processar webhook em segundo plano para não bloquear o usuário
      setTimeout(async () => {
        try {
          const webhookResult = await sendQuizDataToWebhook(userId, latestSubmission.id);
          logger.info('Processamento de webhook concluído', {
            tag: 'Quiz',
            data: { userId, success: webhookResult }
          });
        } catch (webhookError) {
          logger.error('Erro no processamento assíncrono do webhook', {
            tag: 'Quiz',
            data: { userId, error: webhookError }
          });
        }
      }, 500);
    }
    
    // Passo 6: Registrar sucesso e retornar
    logger.info('Questionário completado com sucesso via RPC', {
      tag: 'Quiz',
      data: { 
        userId, 
        timestamp: new Date().toISOString(),
        method: 'rpc'
      }
    });
    
    return { 
      success: true, 
      method: 'rpc',
      message: 'Questionário concluído com sucesso',
      data: { 
        userId, 
        timestamp: new Date().toISOString(),
        webhookInProgress: !!latestSubmission?.id
      }
    };
  } catch (error: any) {
    // Tratamento de erros unificado
    const formattedError = error.code 
      ? error // Já está no formato SystemError
      : formatError(error, 'completeQuizManually');
    
    logError(formattedError, 'Quiz');
    
    // Se for erro de permissão (42501), fornecer mensagem mais detalhada
    if (formattedError.code === '42501') {
      return { 
        success: false, 
        error: {
          ...formattedError,
          message: "Erro de permissão ao acessar dados do questionário",
          hint: "Verifique se as políticas RLS estão configuradas corretamente"
        },
        message: `Erro de permissão (42501): As políticas de segurança do banco de dados impediram a operação.`
      };
    }
    
    return { 
      success: false, 
      error: formattedError,
      message: `Erro ao completar questionário: ${formattedError.message}`
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
