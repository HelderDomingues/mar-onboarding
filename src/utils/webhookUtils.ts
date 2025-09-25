import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

// Função para obter a URL do webhook da configuração do sistema
const getWebhookUrl = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('get_system_config', { 
      p_config_key: 'webhook_url' 
    });
    
    if (error) {
      console.error('Erro ao obter URL do webhook:', error);
      // Fallback para URL padrão em caso de erro
      return 'https://hook.eu2.make.com/wpbbjokh8cexvd1hql9i7ae6uyf32bzh';
    }
    
    return data || 'https://hook.eu2.make.com/wpbbjokh8cexvd1hql9i7ae6uyf32bzh';
  } catch (error) {
    console.error('Exceção ao obter URL do webhook:', error);
    return 'https://hook.eu2.make.com/wpbbjokh8cexvd1hql9i7ae6uyf32bzh';
  }
};

/**
 * Envia dados do questionário para o webhook configurado dinamicamente
 */
export async function sendQuizDataToWebhook(
  submissionId: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    logger.info('Iniciando envio para webhook', {
      tag: 'Webhook',
      data: { submissionId }
    });

    const webhookUrl = await getWebhookUrl();

    // Invoca a Edge Function para buscar todos os dados da submissão de forma segura
    const { data: submissionDetails, error: functionError } = await supabase.functions.invoke(
      'get-submission-details',
      { body: { submission_id: submissionId } }
    );

    if (functionError) {
      const message = 'Erro ao buscar detalhes da submissão via Edge Function.';
      logger.error(message, { tag: 'Webhook', data: { submissionId, error: functionError.message } });
      return { success: false, message };
    }

    const { submission, profile, answers } = submissionDetails;

    // Verificar se a submissão já foi processada
    if (submission.webhook_processed) {
      const message = 'Webhook já processado para esta submissão';
      logger.info(message, { tag: 'Webhook', data: { submissionId } });
      return { success: true, message };
    }

    // Monta a estrutura aninhada a partir dos dados retornados
    const modulos: any = {};
    answers.forEach(item => {
      if (item.quiz_questions && item.quiz_questions.quiz_modules) {
        const modulo = item.quiz_questions.quiz_modules;
        const pergunta = item.quiz_questions;

        if (!modulos[modulo.order_number]) {
          modulos[modulo.order_number] = {
            NomeModulo: modulo.title,
            OrdemModulo: modulo.order_number,
            Respostas: []
          };
        }

        modulos[modulo.order_number].Respostas.push({
          Pergunta: pergunta.text,
          Resposta: item.answer || '',
          OrdemPergunta: pergunta.order_number
        });
      }
    });

    const modulosArray = Object.values(modulos);

    // Prepara o payload final
    const payload = {
      "ID_Submissao": submissionId,
      "ID_Usuario": submission.user_id,
      "Data_Submissao": submission.completed_at || submission.created_at,
      "Timestamp": new Date().toISOString(),
      "Origem": "Sistema MAR - Crie Valor Consultoria",
      "Email": submission.user_email,
      "Nome": profile?.full_name || '',
      "Telefone": profile?.phone || '',
      "Modulos": modulosArray
    };

    logger.info('Enviando payload para webhook', {
      tag: 'Webhook',
      data: { 
        submissionId, 
        camposEnviados: Object.keys(payload).length,
      }
    });

    // Enviar para webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-MAR-Webhook/2.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const message = `Erro HTTP ${response.status}: ${response.statusText}`;
      logger.error('Falha no envio para webhook', {
        tag: 'Webhook',
        data: { submissionId, status: response.status, message }
      });
      return { success: false, message };
    }

    // Invoca a Edge Function para marcar como processado
    const { error: updateError } = await supabase.functions.invoke(
      'mark-submission-processed',
      { body: { submission_id: submissionId } }
    );

    if (updateError) {
      logger.error('Erro ao invocar a função para marcar como processado', {
        tag: 'Webhook',
        data: { submissionId, error: updateError.message }
      });
      // Não tratamos como erro fatal, apenas logamos.
    }

    const message = 'Dados enviados com sucesso para o webhook';
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
 * Testa a conectividade com o webhook configurado
 */
export async function testWebhookConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const webhookUrl = await getWebhookUrl();
    const testPayload = {
      teste: true,
      timestamp: new Date().toISOString(),
      origem: "Sistema MAR - Teste de Conectividade"
    };

    const response = await fetch(webhookUrl, {
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
      message: 'Conexão com webhook bem-sucedida!' 
    };

  } catch (error) {
    return { 
      success: false, 
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}` 
    };
  }
}