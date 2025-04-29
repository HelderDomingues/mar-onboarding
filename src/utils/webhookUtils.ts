
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';

/**
 * Configurar a URL do webhook do Make.com
 * @param webhookUrl URL do webhook do Make.com
 * @returns Resultado da operação
 */
export async function configureMakeWebhookUrl(webhookUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!webhookUrl) {
      return {
        success: false,
        message: 'URL do webhook não fornecida'
      };
    }

    // Validar se a URL parece ser do Make.com
    if (!webhookUrl.includes('hook.eu1.make.com') && !webhookUrl.includes('hook.us1.make.com')) {
      logger.warn('URL do webhook não parece ser do Make.com', { webhookUrl });
    }

    // Armazenar a URL do webhook no Supabase
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(
        { 
          key: 'make_webhook_url', 
          value: webhookUrl,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );

    if (error) {
      throw error;
    }

    // Registrar no log do sistema
    addLogEntry('webhook', 'URL do webhook do Make.com configurada', { webhookUrl });
    logger.info('URL do webhook do Make.com configurada com sucesso', { tag: 'webhook' });

    return {
      success: true,
      message: 'URL do webhook configurada com sucesso'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao configurar URL do webhook', { error: errorMessage });
    addLogEntry('error', 'Erro ao configurar URL do webhook', { error: errorMessage });
    
    return {
      success: false,
      message: `Erro ao configurar URL do webhook: ${errorMessage}`
    };
  }
}

/**
 * Testar conexão com o webhook do Make.com
 * @param webhookUrl URL do webhook a ser testada
 * @returns Resultado do teste
 */
export async function testMakeWebhookConnection(webhookUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!webhookUrl) {
      return {
        success: false,
        message: 'URL do webhook não fornecida'
      };
    }

    // Validar formato básico da URL
    try {
      new URL(webhookUrl);
    } catch (e) {
      return {
        success: false,
        message: 'URL do webhook inválida'
      };
    }

    // Validar se a URL parece ser do Make.com
    if (!webhookUrl.includes('hook.eu1.make.com') && !webhookUrl.includes('hook.us1.make.com')) {
      return {
        success: false,
        message: 'A URL não parece ser um webhook válido do Make.com'
      };
    }

    // Enviar uma requisição de teste para o webhook
    const testPayload = {
      event: 'test_connection',
      timestamp: new Date().toISOString(),
      system: 'Sistema MAR',
      test: true
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    // Verificar resposta
    if (response.ok) {
      // Registrar sucesso no log do sistema
      addLogEntry('webhook', 'Teste de conexão com webhook bem-sucedido', { webhookUrl });
      logger.info('Teste de conexão com webhook bem-sucedido', { tag: 'webhook' });

      return {
        success: true,
        message: 'Conexão com webhook testada com sucesso'
      };
    } else {
      const responseText = await response.text();
      
      // Registrar erro no log do sistema
      addLogEntry('error', 'Falha no teste de conexão com webhook', { 
        webhookUrl, 
        statusCode: response.status, 
        response: responseText 
      });
      
      logger.warn('Falha no teste de conexão com webhook', { 
        tag: 'webhook',
        statusCode: response.status,
        response: responseText
      });
      
      return {
        success: false,
        message: `A requisição falhou com status ${response.status}: ${responseText.substring(0, 100)}`
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Registrar erro no log do sistema
    addLogEntry('error', 'Erro ao testar conexão com webhook', { 
      webhookUrl, 
      error: errorMessage 
    });
    
    logger.error('Erro ao testar conexão com webhook', { 
      tag: 'webhook', 
      error: errorMessage 
    });
    
    return {
      success: false,
      message: `Erro ao testar conexão: ${errorMessage}`
    };
  }
}
