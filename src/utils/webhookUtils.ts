import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Envia dados do questionário para o webhook através da Edge Function segura
 * A Edge Function tem acesso à service role key no servidor, evitando exposição no frontend
 */
export async function sendQuizDataToWebhook(
  submissionId: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    logger.info('Chamando Edge Function quiz-webhook', {
      tag: 'Webhook',
      data: { submissionId }
    });

    // Chamar a Edge Function que já tem toda a lógica implementada de forma segura
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: { submissionId }
    });

    if (error) {
      logger.error('Erro ao chamar Edge Function quiz-webhook', {
        tag: 'Webhook',
        data: { submissionId, error }
      });
      
      return {
        success: false,
        message: `Erro ao processar webhook: ${error.message || 'Erro desconhecido'}`,
        details: error
      };
    }

    logger.info('Edge Function quiz-webhook executada com sucesso', {
      tag: 'Webhook',
      data: { submissionId, response: data }
    });

    return {
      success: data?.success || false,
      message: data?.message || 'Webhook processado',
      details: data
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Exceção ao chamar Edge Function quiz-webhook', {
      tag: 'Webhook',
      data: { submissionId, error: message }
    });
    
    return {
      success: false,
      message: `Erro: ${message}`,
      details: error
    };
  }
}

/**
 * Testa a conectividade com o webhook através da Edge Function
 */
export async function testWebhookConnection(): Promise<{ success: boolean; message: string }> {
  try {
    logger.info('Testando conexão com webhook via Edge Function', { tag: 'Webhook' });

    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: { test: true }
    });

    if (error) {
      return {
        success: false,
        message: `Erro ao testar webhook: ${error.message || 'Erro desconhecido'}`
      };
    }

    return {
      success: true,
      message: 'Conexão com webhook testada com sucesso via Edge Function!'
    };

  } catch (error) {
    return {
      success: false,
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}`
    };
  }
}