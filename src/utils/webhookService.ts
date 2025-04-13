
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";

/**
 * Envia as respostas do questionário para um webhook externo
 * @param userId ID do usuário
 * @param respostas Objeto contendo as respostas
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export const enviarRespostasParaWebhook = async (userId: string, respostas: any): Promise<boolean> => {
  try {
    // Registrar tentativa de envio no log
    logger.info(`Iniciando envio de respostas para webhook`, {
      tag: 'Webhook',
      userId
    });
    
    addLogEntry('database', 'Iniciando envio de respostas para webhook', {}, userId);
    
    // Chamando a função do Supabase para enviar as respostas
    const { error } = await supabase.functions.invoke('enviar-webhook', {
      body: {
        userId,
        respostas
      }
    });
    
    if (error) {
      logger.error(`Erro ao enviar respostas para webhook`, {
        tag: 'Webhook',
        error,
        userId
      });
      
      addLogEntry('error', 'Erro ao enviar respostas para webhook', JSON.stringify(error), userId);
      return false;
    }
    
    // Registrar sucesso
    logger.info(`Respostas enviadas com sucesso para webhook`, {
      tag: 'Webhook',
      userId
    });
    
    addLogEntry('database', 'Respostas enviadas com sucesso para webhook', {}, userId);
    return true;
  } catch (error) {
    // Registrar erro
    logger.error(`Exceção ao enviar respostas para webhook`, {
      tag: 'Webhook', 
      error,
      userId
    });
    
    addLogEntry('error', 'Exceção ao enviar respostas para webhook', JSON.stringify(error), userId);
    return false;
  }
};

export default {
  enviarRespostasParaWebhook
};
