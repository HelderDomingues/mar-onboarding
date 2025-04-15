
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";

/**
 * Envia as respostas do questionário para um webhook externo
 * Versão otimizada para Make.com
 * 
 * @param userId ID do usuário
 * @param respostas Objeto contendo as respostas
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export const enviarRespostasParaWebhook = async (userId: string, respostas: any): Promise<boolean> => {
  try {
    // Registrar tentativa de envio no log
    logger.info(`Iniciando envio de respostas para webhook (Make.com)`, {
      tag: 'Webhook',
      data: {
        userId,
        timestamp: new Date().toISOString(),
        submissionId: respostas?.submissionId
      }
    });
    
    addLogEntry('database', 'Iniciando envio de respostas para webhook (Make.com)', {
      timestamp: new Date().toISOString(),
      submissionId: respostas?.submissionId
    }, userId);
    
    // Chamando a edge function para enviar as respostas
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: {
        userId,
        submissionId: respostas.submissionId || respostas.submission_id
      }
    });
    
    if (error) {
      logger.error(`Erro ao enviar respostas para webhook (Make.com)`, {
        tag: 'Webhook',
        data: {
          error,
          userId,
          errorMessage: error.message || 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      });
      
      addLogEntry('error', 'Erro ao enviar respostas para webhook (Make.com)', {
        error: JSON.stringify(error),
        timestamp: new Date().toISOString()
      }, userId);
      
      return false;
    }
    
    // Registrar sucesso
    logger.info(`Respostas enviadas com sucesso para webhook (Make.com)`, {
      tag: 'Webhook',
      data: {
        userId,
        resultado: data,
        timestamp: new Date().toISOString()
      }
    });
    
    addLogEntry('database', 'Respostas enviadas com sucesso para webhook (Make.com)', {
      resultado: data ? 'Sucesso' : 'Sem dados retornados',
      timestamp: new Date().toISOString()
    }, userId);
    
    return true;
  } catch (error) {
    // Registrar erro
    logger.error(`Exceção ao enviar respostas para webhook (Make.com)`, {
      tag: 'Webhook', 
      data: {
        error,
        userId,
        errorMessage: error.message || 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }
    });
    
    addLogEntry('error', 'Exceção ao enviar respostas para webhook (Make.com)', {
      error: JSON.stringify(error),
      timestamp: new Date().toISOString()
    }, userId);
    
    return false;
  }
};

/**
 * Faz um teste de conexão com o webhook do Make.com
 * Útil para verificar se o webhook está configurado corretamente
 * 
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export const testarConexaoWebhook = async (): Promise<{success: boolean, message: string}> => {
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
        message: `Erro na conexão com o webhook: ${error.message || 'Erro desconhecido'}`
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
      message: 'Conexão com webhook do Make.com realizada com sucesso!'
    };
  } catch (error) {
    logger.error(`Exceção no teste de conexão com webhook (Make.com)`, {
      tag: 'Webhook',
      data: {
        error,
        errorMessage: error.message || 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }
    });
    
    return {
      success: false,
      message: `Exceção ao testar conexão com webhook: ${error.message || 'Erro desconhecido'}`
    };
  }
};

export default {
  enviarRespostasParaWebhook,
  testarConexaoWebhook
};
