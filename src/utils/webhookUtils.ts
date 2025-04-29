
/**
 * Utilitários para integração com webhooks externos (Make.com)
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';

// URL do webhook no Make.com (deve ser configurada no ambiente)
const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/seu-token-do-webhook';

/**
 * Envia as respostas do questionário para o webhook do Make.com
 * @param userId ID do usuário que completou o questionário
 * @param submissionId ID da submissão do questionário
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export const sendQuizDataToMakeWebhook = async (
  userId: string, 
  submissionId: string
): Promise<boolean> => {
  try {
    logger.info('Iniciando envio de dados para Make.com', {
      tag: 'Webhook',
      data: { userId, submissionId }
    });
    
    addLogEntry('info', `Iniciando envio de dados para Make.com - Submissão ${submissionId}`, { 
      origem: 'webhookUtils', 
      userId 
    });
    
    // Buscar os dados da submissão completa
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();
      
    if (submissionError || !submission) {
      throw new Error(`Erro ao buscar submissão: ${submissionError?.message || 'Submissão não encontrada'}`);
    }
    
    // Buscar todas as respostas
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select(`
        *,
        quiz_questions!inner (
          id, module_id, text, type
        )
      `)
      .eq('submission_id', submissionId);
      
    if (answersError) {
      throw new Error(`Erro ao buscar respostas: ${answersError.message}`);
    }
    
    // Organizar respostas por módulo
    const answersData = answers.map(answer => ({
      questionId: answer.question_id,
      questionText: answer.quiz_questions.text,
      answer: answer.answer,
      questionType: answer.quiz_questions.type,
      moduleId: answer.quiz_questions.module_id
    }));
    
    // Preparar payload para o webhook
    const payload = {
      userId,
      submissionId,
      userName: submission.user_name || 'Usuário sem nome',
      userEmail: submission.user_email || 'Sem email',
      completedAt: submission.completed_at || new Date().toISOString(),
      answers: answersData
    };
    
    // Enviar dados para o webhook externo
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'Sistema MAR - Crie Valor',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Resposta do webhook não foi bem-sucedida: ${response.status} ${response.statusText}`);
    }
    
    // Atualizar status de processamento do webhook
    const { error: updateError } = await supabase
      .from('quiz_submissions')
      .update({ webhook_processed: true })
      .eq('id', submissionId);
      
    if (updateError) {
      logger.warn('Erro ao atualizar status de processamento do webhook', {
        tag: 'Webhook',
        data: { submissionId, error: updateError }
      });
    }
    
    logger.info('Envio de dados para Make.com concluído com sucesso', {
      tag: 'Webhook',
      data: { userId, submissionId }
    });
    
    addLogEntry('info', `Dados enviados com sucesso para Make.com - Submissão ${submissionId}`, { 
      origem: 'webhookUtils', 
      userId 
    });
    
    return true;
  } catch (error) {
    logger.error('Erro ao enviar dados para Make.com', {
      tag: 'Webhook',
      data: { 
        userId, 
        submissionId, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    });
    
    addLogEntry('error', `Falha ao enviar dados para Make.com - Submissão ${submissionId}`, { 
      origem: 'webhookUtils',
      userId,
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return false;
  }
};

/**
 * Configura a URL do webhook do Make.com
 * @param webhookUrl URL completa do webhook
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export const configureMakeWebhookUrl = async (webhookUrl: string): Promise<boolean> => {
  try {
    // Validar formato básico da URL
    if (!webhookUrl || !webhookUrl.startsWith('https://hook.')) {
      throw new Error('URL do webhook inválida. Deve começar com "https://hook."');
    }
    
    // Em uma implementação real, salvaríamos em uma tabela de configurações
    // Por enquanto, apenas registramos no log
    logger.info('URL do webhook do Make.com configurada', {
      tag: 'Webhook Config'
    });
    
    addLogEntry('info', 'URL do webhook do Make.com configurada', { 
      origem: 'webhookUtils'
    });
    
    return true;
  } catch (error) {
    logger.error('Erro ao configurar URL do webhook', {
      tag: 'Webhook Config',
      data: { error: error instanceof Error ? error.message : 'Erro desconhecido' }
    });
    
    addLogEntry('error', 'Erro ao configurar URL do webhook', { 
      origem: 'webhookUtils',
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return false;
  }
};

/**
 * Testa a conexão com o webhook do Make.com
 * @param webhookUrl URL opcional para teste (se não fornecida, usa a URL configurada)
 * @returns Promise<{success: boolean, message: string}> resultado do teste
 */
export const testMakeWebhookConnection = async (
  webhookUrl?: string
): Promise<{success: boolean, message: string}> => {
  try {
    const url = webhookUrl || MAKE_WEBHOOK_URL;
    
    logger.info('Testando conexão com webhook do Make.com', {
      tag: 'Webhook Test'
    });
    
    addLogEntry('info', 'Iniciando teste de conexão com webhook', { 
      origem: 'webhookUtils'
    });
    
    // Preparar payload de teste
    const testPayload = {
      test: true,
      timestamp: new Date().toISOString(),
      source: 'Sistema MAR - Crie Valor (teste de conexão)'
    };
    
    // Enviar requisição de teste
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'Sistema MAR - Teste de Conexão',
      },
      body: JSON.stringify(testPayload)
    });
    
    if (!response.ok) {
      throw new Error(`Resposta do webhook não foi bem-sucedida: ${response.status} ${response.statusText}`);
    }
    
    logger.info('Teste de conexão com webhook concluído com sucesso', {
      tag: 'Webhook Test'
    });
    
    addLogEntry('info', 'Teste de conexão com webhook concluído com sucesso', { 
      origem: 'webhookUtils'
    });
    
    return {
      success: true,
      message: 'Conexão com o webhook do Make.com foi estabelecida com sucesso.'
    };
  } catch (error) {
    logger.error('Erro ao testar conexão com webhook', {
      tag: 'Webhook Test',
      data: { error: error instanceof Error ? error.message : 'Erro desconhecido' }
    });
    
    addLogEntry('error', 'Falha no teste de conexão com webhook', { 
      origem: 'webhookUtils',
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      message: `Falha ao conectar com o webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};
