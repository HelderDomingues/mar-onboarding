import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { getSupabaseAdminClient } from '@/utils/supabaseAdminClient';

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

    let payload: any;

    // Verificar se as respostas estão estruturadas corretamente na tabela de respostas completas
    if (respostas?.respostas && 
        typeof respostas.respostas === 'object' && 
        Object.keys(respostas.respostas).length > 1) {
      
      // Usar respostas já consolidadas (estrutura antiga)
      respostasFormatadas = respostas.respostas;
      userEmail = respostas.user_email || submission.user_email;
      userName = respostas.user_name || userName;
      
      logger.info('Usando respostas da tabela consolidada (fallback)', {
        tag: 'Webhook',
        data: { submissionId, questoesEncontradas: Object.keys(respostasFormatadas).length }
      });
      
      payload = {
        "ID_Submissao": submissionId,
        "ID_Usuario": submission.user_id,
        "Data_Submissao": submission.completed_at || submission.created_at,
        "Timestamp": new Date().toISOString(),
        "Origem": "Sistema MAR - Crie Valor Consultoria",
        "Email": userEmail,
        "Nome": userName,
        "Telefone": profile?.phone || '',
        ...respostasFormatadas
      };

    } else {
      // Buscar respostas individuais e montar a nova estrutura aninhada
      logger.info('Buscando respostas individuais para montar payload aninhado', {
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
            order_number,
            quiz_modules!inner (
              title,
              order_number
            )
          )
        `)
        .eq('submission_id', submissionId)
        .order('order_number', { foreignTable: 'quiz_questions.quiz_modules' })
        .order('order_number', { foreignTable: 'quiz_questions' });

      if (answersError || !answers || answers.length === 0) {
        const message = 'Nenhuma resposta encontrada para esta submissão';
        logger.error(message, { tag: 'Webhook', data: { submissionId, answersError } });
        return { success: false, message };
      }

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

      logger.info('Respostas estruturadas com sucesso no formato aninhado', {
        tag: 'Webhook',
        data: { 
          submissionId, 
          totalRespostas: answers.length,
          modulosEncontrados: modulosArray.length
        }
      });

      payload = {
        "ID_Submissao": submissionId,
        "ID_Usuario": submission.user_id,
        "Data_Submissao": submission.completed_at || submission.created_at,
        "Timestamp": new Date().toISOString(),
        "Origem": "Sistema MAR - Crie Valor Consultoria",
        "Email": userEmail,
        "Nome": userName,
        "Telefone": profile?.phone || '',
        "Modulos": modulosArray
      };
    }

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