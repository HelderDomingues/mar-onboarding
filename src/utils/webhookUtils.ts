import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

// URL do webhook Make.com (fixo para simplicidade)
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/wpbbjokh8cexvd1hql9i7ae6uyf32bzh';

/**
 * Envia dados do questionário diretamente para o webhook do Make.com
 */
export async function sendQuizDataToWebhook(
  submissionId: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    logger.info('Iniciando envio para webhook Make.com', {
      tag: 'Webhook',
      data: { submissionId }
    });

    // Buscar dados da submissão
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      const message = 'Submissão não encontrada';
      logger.error(message, { tag: 'Webhook', data: { submissionId, submissionError } });
      return { success: false, message };
    }

    // Verificar se já foi processado
    if (submission.webhook_processed) {
      const message = 'Webhook já processado para esta submissão';
      logger.info(message, { tag: 'Webhook', data: { submissionId } });
      return { success: true, message };
    }

    // Buscar respostas completas
    const { data: respostas, error: respostasError } = await supabase
      .from('quiz_respostas_completas')
      .select('*')
      .eq('submission_id', submissionId)
      .single();

    if (respostasError || !respostas) {
      const message = 'Respostas não encontradas';
      logger.error(message, { tag: 'Webhook', data: { submissionId, respostasError } });
      return { success: false, message };
    }

    // Buscar dados do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', submission.user_id)
      .single();

    // Preparar payload otimizado para Make.com
    const payload = {
      // Metadados essenciais
      "ID_Submissao": submissionId,
      "ID_Usuario": submission.user_id,
      "Data_Submissao": submission.completed_at || submission.created_at,
      "Timestamp": new Date().toISOString(),
      "Origem": "Sistema MAR - Crie Valor Consultoria",
      
      // Dados do usuário
      "Email": respostas.user_email || submission.user_email,
      "Nome": respostas.user_name || profile?.full_name || '',
      "Telefone": profile?.phone || '',
      
      // Respostas do questionário (estrutura plana)
      ...(typeof respostas.respostas === 'object' && respostas.respostas ? respostas.respostas : {})
    };

    logger.info('Enviando payload para Make.com', {
      tag: 'Webhook',
      data: { 
        submissionId, 
        camposEnviados: Object.keys(payload).length,
        url: MAKE_WEBHOOK_URL.replace('wpbbjokh8cexvd1hql9i7ae6uyf32bzh', '***') 
      }
    });

    // Enviar para Make.com
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-MAR-Webhook/2.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const message = `Erro HTTP ${response.status}: ${response.statusText}`;
      logger.error('Falha no envio para Make.com', {
        tag: 'Webhook',
        data: { submissionId, status: response.status, message }
      });
      return { success: false, message };
    }

    // Marcar como processado
    const { error: updateError } = await supabase
      .from('quiz_submissions')
      .update({ webhook_processed: true })
      .eq('id', submissionId);

    if (updateError) {
      logger.error('Erro ao marcar webhook como processado', {
        tag: 'Webhook',
        data: { submissionId, updateError }
      });
    }

    const message = 'Dados enviados com sucesso para o Make.com';
    logger.info(message, {
      tag: 'Webhook',
      data: { submissionId, status: response.status }
    });

    return { 
      success: true, 
      message,
      details: { status: response.status, submissionId }
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Exceção ao enviar para webhook', {
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
 * Testa a conectividade com o webhook do Make.com
 */
export async function testWebhookConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const testPayload = {
      teste: true,
      timestamp: new Date().toISOString(),
      origem: "Sistema MAR - Teste de Conectividade"
    };

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-MAR-Webhook-Test/2.0'
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      return { 
        success: false, 
        message: `Erro na conexão: HTTP ${response.status}` 
      };
    }

    return { 
      success: true, 
      message: 'Conexão com Make.com bem-sucedida!' 
    };

  } catch (error) {
    return { 
      success: false, 
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}` 
    };
  }
}