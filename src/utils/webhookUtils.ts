import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Sends quiz completion data to configured webhook
 */
export async function sendQuizDataToWebhook(
  userId: string,
  submissionId: string
): Promise<boolean> {
  try {
    // For webhook configuration, use environment variables
    const webhookUrl = process.env.WEBHOOK_URL || '';
    const webhookSecret = process.env.WEBHOOK_SECRET || '';

    if (!webhookUrl) {
      logger.warn('URL do webhook não configurada');
      return false;
    }

    // Get quiz completion data
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_respostas_completas')
      .select('*')
      .eq('submission_id', submissionId)
      .single();

    if (quizError || !quizData) {
      logger.error('Erro ao buscar dados do questionário para webhook:', quizError);
      return false;
    }

    // Prepare payload
    const payload = {
      user_id: userId,
      user_email: quizData.user_email,
      user_name: quizData.user_name,
      submission_id: submissionId,
      completed_at: quizData.data_submissao,
      quiz_answers: quizData.respostas
    };

    // Generate signature if secret is available
    let signature = '';
    if (webhookSecret && typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const key = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await window.crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(JSON.stringify(payload))
      );
      signature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    // Send webhook request
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-MAR-Webhook/1.0',
        ...(signature && { 'X-Signature': `sha256=${signature}` })
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook response error: ${response.status} ${response.statusText}`);
    }

    logger.info('Dados enviados para webhook com sucesso', {
      tag: 'Webhook',
      data: { userId, submissionId, status: response.status }
    });

    return true;

  } catch (error) {
    logger.error('Erro ao enviar dados para webhook:', {
      tag: 'Webhook',
      data: { userId, submissionId, error: error instanceof Error ? error.message : 'Unknown error' }
    });
    return false;
  }
}