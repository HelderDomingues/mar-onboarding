
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";
import { formatError } from "@/utils/errorUtils";

/**
 * Envia as respostas do questionário para um webhook externo
 * Versão otimizada para Make.com
 * 
 * @param userId ID do usuário
 * @param respostas Objeto contendo as respostas
 * @returns Promise<{success: boolean, message: string, details?: any}> indicando sucesso ou falha
 */
export const enviarRespostasParaWebhook = async (userId: string, respostas: any): Promise<{success: boolean, message: string, details?: any}> => {
  try {
    // Validar parâmetros
    if (!userId) {
      logger.error("enviarRespostasParaWebhook: ID do usuário não fornecido", {
        tag: 'Webhook',
        data: { timestamp: new Date().toISOString() }
      });
      return { 
        success: false, 
        message: "ID do usuário não fornecido" 
      };
    }
    
    if (!respostas || typeof respostas !== 'object') {
      logger.error("enviarRespostasParaWebhook: Respostas inválidas", {
        tag: 'Webhook',
        data: { userId, timestamp: new Date().toISOString() }
      });
      return { 
        success: false, 
        message: "Formato de respostas inválido" 
      };
    }
    
    // Registrar tentativa de envio no log
    logger.info(`Iniciando envio de respostas para webhook (Make.com)`, {
      tag: 'Webhook',
      data: {
        userId,
        timestamp: new Date().toISOString(),
        submissionId: respostas?.submissionId || respostas?.submission_id || respostas?.submission?.id
      }
    });
    
    addLogEntry('database', 'Iniciando envio de respostas para webhook (Make.com)', {
      timestamp: new Date().toISOString(),
      submissionId: respostas?.submissionId || respostas?.submission_id || respostas?.submission?.id
    }, userId);
    
    // Extrair ID da submissão do objeto de respostas
    const submissionId = respostas?.submissionId || respostas?.submission_id || respostas?.submission?.id;
    
    if (!submissionId) {
      logger.error(`ID de submissão não encontrado no objeto de respostas`, {
        tag: 'Webhook',
        data: {
          userId,
          timestamp: new Date().toISOString()
        }
      });
      
      return {
        success: false,
        message: "ID de submissão não encontrado no objeto de respostas"
      };
    }
    
    // Chamando a edge function para enviar as respostas
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: {
        userId,
        submissionId
      }
    });
    
    if (error) {
      logger.error(`Erro ao enviar respostas para webhook (Make.com)`, {
        tag: 'Webhook',
        data: {
          error,
          userId,
          submissionId,
          errorMessage: error.message || 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      });
      
      addLogEntry('error', 'Erro ao enviar respostas para webhook (Make.com)', {
        error: JSON.stringify(error),
        timestamp: new Date().toISOString()
      }, userId);
      
      return {
        success: false,
        message: `Erro: ${error.message || 'Erro desconhecido ao enviar dados'}`,
        details: error
      };
    }
    
    // Registrar sucesso
    logger.info(`Respostas enviadas com sucesso para webhook (Make.com)`, {
      tag: 'Webhook',
      data: {
        userId,
        submissionId,
        resultado: data,
        timestamp: new Date().toISOString()
      }
    });
    
    addLogEntry('database', 'Respostas enviadas com sucesso para webhook (Make.com)', {
      resultado: data ? JSON.stringify(data) : 'Sem dados retornados',
      timestamp: new Date().toISOString()
    }, userId);
    
    return {
      success: true,
      message: "Dados enviados com sucesso para o webhook (Make.com)",
      details: data
    };
  } catch (error) {
    // Registrar erro
    const formattedError = formatError(error, "enviarRespostasParaWebhook");
    
    logger.error(`Exceção ao enviar respostas para webhook (Make.com)`, {
      tag: 'Webhook', 
      data: {
        error: formattedError,
        userId,
        errorMessage: formattedError.message || 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }
    });
    
    addLogEntry('error', 'Exceção ao enviar respostas para webhook (Make.com)', {
      error: JSON.stringify(formattedError),
      timestamp: new Date().toISOString()
    }, userId);
    
    return {
      success: false,
      message: `Exceção: ${formattedError.message || 'Erro desconhecido'}`,
      details: formattedError
    };
  }
};

/**
 * Faz um teste de conexão com o webhook do Make.com
 * Útil para verificar se o webhook está configurado corretamente
 * 
 * @returns Promise<{success: boolean, message: string, details?: any}> indicando sucesso ou falha
 */
export const testarConexaoWebhook = async (): Promise<{success: boolean, message: string, details?: any}> => {
  try {
    logger.info(`Iniciando teste de conexão com webhook (Make.com)`, {
      tag: 'Webhook',
      data: {
        timestamp: new Date().toISOString()
      }
    });
    
    // Chamando a edge function para testar a conexão
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: {
        test: true
      }
    });
    
    if (error) {
      logger.error(`Erro no teste de conexão com webhook (Make.com)`, {
        tag: 'Webhook',
        data: {
          error,
          errorMessage: error.message || 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      });
      
      return {
        success: false, 
        message: `Erro na conexão com o webhook: ${error.message || 'Erro desconhecido'}`,
        details: error
      };
    }
    
    logger.info(`Teste de conexão bem-sucedido com webhook (Make.com)`, {
      tag: 'Webhook',
      data: {
        resultado: data,
        timestamp: new Date().toISOString()
      }
    });
    
    return {
      success: true,
      message: 'Conexão com webhook do Make.com realizada com sucesso!',
      details: data
    };
  } catch (error) {
    const formattedError = formatError(error, "testarConexaoWebhook");
    
    logger.error(`Exceção no teste de conexão com webhook (Make.com)`, {
      tag: 'Webhook',
      data: {
        error: formattedError,
        errorMessage: formattedError.message || 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }
    });
    
    return {
      success: false,
      message: `Exceção ao testar conexão com webhook: ${formattedError.message || 'Erro desconhecido'}`,
      details: formattedError
    };
  }
};

export default {
  enviarRespostasParaWebhook,
  testarConexaoWebhook
};
