import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { getSupabaseAdminClient } from '@/utils/supabaseAdminClient';

// Função para obter a URL do webhook da configuração do sistema
const DEFAULT_WEBHOOK = 'https://hook.eu2.make.com/amuls2ba837paniiscdb4hlero9pjpdi';

const getWebhookUrl = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('get_system_config', { 
      p_config_key: 'webhook_url'
    });

    if (error) {
      // If the RPC is admin-only (P0001) the client will not be allowed to call it.
      // This can happen in the browser for anonymous/authenticated non-admin users.
      // Fall back gracefully to the default webhook URL without noisy console.error.
      if (error.code === 'P0001' || (error.message && String(error.message).toLowerCase().includes('apenas administradores'))) {
        logger.info('get_system_config is admin-only; using default webhook URL', { tag: 'Webhook' });
        return DEFAULT_WEBHOOK;
      }

      // Other errors: log a warning and fall back to the default URL
      logger.warn('Erro ao obter URL do webhook (rpc get_system_config)', { tag: 'Webhook', data: { error } });
      return DEFAULT_WEBHOOK;
    }

    return (data as unknown as string) || DEFAULT_WEBHOOK;
  } catch (error) {
    logger.warn('Exceção ao obter URL do webhook', { tag: 'Webhook', data: { error } });
    return DEFAULT_WEBHOOK;
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

    // Buscar dados da submissão usando cliente administrativo
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: submission, error: submissionError } = await supabaseAdmin
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

    // Buscar dados do perfil usando cliente administrativo
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', submission.user_id)
      .single();

    // Buscar respostas completas da tabela específica
    const { data: respostas } = await supabaseAdmin
      .from('quiz_respostas_completas')
      .select('*')
      .eq('submission_id', submissionId)
      .single();

    let respostasFormatadas = {};
    let userEmail = submission.user_email;
    let userName = profile?.full_name || '';

    // Prefer to build an ordered, stable payload from quiz_answers (ordered by question)
    // even when consolidated respostas exist. This preserves Pergunta_N/Resposta_N pairing
    // and avoids unpredictable key ordering coming from jsonb objects.
    let answers: any[] | null = null;
    try {
      const { data: answersData, error: answersError } = await supabaseAdmin
        .from('quiz_answers')
        .select(`
          answer,
          quiz_questions!inner (
            id,
            text,
            type,
            order_number
          )
        `)
        .eq('submission_id', submissionId);

      if (!answersError && answersData && Array.isArray(answersData) && answersData.length > 0) {
        // Order server responses client-side by the related question's order_number to avoid
        // PostgREST parsing issues when ordering by related-table columns in the query string.
        answers = answersData.sort((a: any, b: any) => {
          const ao = a?.quiz_questions?.order_number ?? 0;
          const bo = b?.quiz_questions?.order_number ?? 0;
          return ao - bo;
        });
      } else {
        answers = null;
      }
    } catch (e) {
      answers = null;
      logger.warn('Falha ao buscar quiz_answers para montar payload ordenado', { tag: 'Webhook', data: { submissionId, error: e } });
    }

    if (answers && answers.length > 0) {
      // Build payload from ordered answers (stable Pergunta_N/Resposta_N keys)
      answers.forEach((item, index) => {
        if (item.quiz_questions) {
          const questionText = item.quiz_questions.text;
          const answer = item.answer || '';

          respostasFormatadas[`Pergunta_${index + 1}`] = questionText;
          respostasFormatadas[`Resposta_${index + 1}`] = answer;
          // Also include the question text key for compatibility
          respostasFormatadas[questionText] = answer;
        }
      });

      logger.info('Respostas estruturadas com sucesso (ordenadas)', {
        tag: 'Webhook',
        data: {
          submissionId,
          totalRespostas: answers.length,
          camposGerados: Object.keys(respostasFormatadas).length
        }
      });

      // prefer user info from consolidated table if present
      userEmail = respostas?.user_email || submission.user_email;
      userName = (respostas as any)?.full_name || userName;

    } else if (respostas?.respostas && typeof respostas.respostas === 'object' && Object.keys(respostas.respostas).length > 0) {
      // Fallback: use consolidated object (no ordering guarantees)
      respostasFormatadas = respostas.respostas;
      userEmail = respostas.user_email || submission.user_email;
      userName = (respostas as any).full_name || userName;

      logger.info('Usando respostas da tabela consolidada (fallback)', {
        tag: 'Webhook',
        data: { submissionId, questoesEncontradas: Object.keys(respostasFormatadas).length }
      });
    } else {
      // Buscar respostas individuais da tabela quiz_answers
      logger.info('Buscando respostas individuais da tabela quiz_answers', {
        tag: 'Webhook',
        data: { submissionId }
      });

      const { data: answers, error: answersError } = await supabaseAdmin
        .from('quiz_answers')
        .select(`
          answer,
          quiz_questions!inner (
            text,
            type,
            order_number
          )
        `)
        .eq('submission_id', submissionId);

      // Sort client-side to ensure stable ordering by question order_number
      if (answers && Array.isArray(answers)) {
        answers.sort((a: any, b: any) => (a?.quiz_questions?.order_number ?? 0) - (b?.quiz_questions?.order_number ?? 0));
      }

      if (answersError || !answers || answers.length === 0) {
        const message = 'Nenhuma resposta encontrada para esta submissão';
        logger.error(message, { tag: 'Webhook', data: { submissionId, answersError } });
        return { success: false, message };
      }

      // Estruturar respostas no formato adequado
      answers.forEach((item, index) => {
        if (item.quiz_questions) {
          const questionText = item.quiz_questions.text;
          const answer = item.answer || '';

          // Usar tanto o texto da pergunta quanto um identificador numerado
          respostasFormatadas[`Pergunta_${index + 1}`] = questionText;
          respostasFormatadas[`Resposta_${index + 1}`] = answer;
          respostasFormatadas[questionText] = answer;
        }
      });

      logger.info('Respostas estruturadas com sucesso', {
        tag: 'Webhook',
        data: {
          submissionId,
          totalRespostas: answers.length,
          camposGerados: Object.keys(respostasFormatadas).length
        }
      });
    }

    // Preparar payload otimizado para Make.com
    const payload = {
      // Metadados essenciais
      "ID_Submissao": submissionId,
      "ID_Usuario": submission.user_id,
      "Data_Submissao": submission.completed_at || submission.created_at,
      "Timestamp": new Date().toISOString(),
      "Origem": "Sistema MAR - Crie Valor Consultoria",

      // Dados do usuário
      "Email": userEmail,
      "Nome": userName,
      "Telefone": profile?.phone || '',

      // Respostas do questionário (estrutura plana)
      ...respostasFormatadas
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

    // Marcar como processado usando cliente administrativo
    const { error: updateError } = await supabaseAdmin
      .from('quiz_submissions')
      .update({ webhook_processed: true })
      .eq('id', submissionId);

    if (updateError) {
      logger.error('Erro ao marcar webhook como processado', {
        tag: 'Webhook',
        data: { submissionId, updateError }
      });
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