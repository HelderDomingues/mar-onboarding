import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { sendQuizDataToWebhook } from '@/utils/webhookUtils';
import { QuizAnswer, QuizQuestion } from '@/types/quiz';

/**
 * Verifica se o questionário está completo para um usuário
 */
export async function isQuizComplete(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('is_quiz_complete', { p_user_id: userId });
      
    if (error) {
      logger.error('Erro ao verificar status do questionário', {
        tag: 'Quiz',
        data: { userId, error }
      });
      throw error;
    }
    
    return data || false;
  } catch (error) {
    logger.error('Falha ao verificar status do questionário', {
      tag: 'Quiz',
      data: { userId, error }
    });
    return false;
  }
}

/**
 * Função para completar o questionário manualmente para um usuário
 */
export async function completeQuizManually(userId: string) {
  try {
    logger.info('Completando questionário manualmente', {
      tag: 'Quiz',
      data: { userId }
    });

    // Tenta usar RPC para completar o questionário primeiro (método preferido)
    try {
      // call RPC using parameter name p_user_id (matches updated function)
  const { data, error } = await supabase.rpc('complete_quiz', ({ p_user_id: userId } as any));

      if (error) {
        // RPC returned an error -> fallthrough to admin fallback
        logger.warn('RPC complete_quiz returned error', { tag: 'Quiz', data: { userId, error } });
        throw error;
      }

      // Some RPC implementations may return boolean true/false or more complex objects.
      // We expect a truthy success; otherwise consider it a failure so fallback runs.
      if (data === true || (data && (data as any).success)) {
        logger.info('Questionário completado via RPC', {
          tag: 'Quiz',
          data: { userId, method: 'rpc', rpcData: data }
        });

        // RPC confirmed completion — attempt best-effort webhook send by locating
        // the submission id and invoking the webhook sender. This ensures the
        // modal reflects webhook status even when RPC path was used.
        try {
          const { data: submissionRow, error: subErr } = await supabaseAdmin
            .from('quiz_submissions')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

          if (subErr) {
            logger.warn('Não foi possível obter submission id após RPC', { tag: 'Quiz', data: { userId, subErr } });
            return { success: true, method: 'rpc', webhookSent: false };
          }

          const submissionId = submissionRow?.id;
          if (!submissionId) {
            logger.warn('Nenhuma submissão encontrada para enviar webhook após RPC', { tag: 'Quiz', data: { userId } });
            return { success: true, method: 'rpc', webhookSent: false };
          }

          const webhookResult = await sendQuizDataToWebhook(submissionId);
          const webhookSent = !!webhookResult?.success;
          return { success: true, method: 'rpc', webhookSent };
        } catch (e) {
          logger.warn('Erro ao tentar enviar webhook após RPC', { tag: 'Quiz', data: { userId, error: e } });
          return { success: true, method: 'rpc', webhookSent: false };
        }
      }

      // If RPC returned falsy or did not confirm, throw to trigger fallback
      logger.warn('RPC complete_quiz did not confirm completion', { tag: 'Quiz', data: { userId, rpcData: data } });
      throw new Error('RPC did not confirm completion');
    } catch (rpcError) {
      logger.warn('Falha no método RPC para completar questionário, executando fallback admin', {
        tag: 'Quiz',
        data: { userId, error: rpcError }
      });
      // continue to admin fallback
    }

    // Método alternativo: atualização direta via admin
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('quiz_submissions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (submission) {
      const { error: updateError } = await supabaseAdmin
        .from('quiz_submissions')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      if (updateError) {
        throw updateError;
      }

      // Verificação: garantir que a linha foi efetivamente marcada
      const { data: verifyRow, error: verifyError } = await supabaseAdmin
        .from('quiz_submissions')
        .select('id, completed, completed_at')
        .eq('id', submission.id)
        .maybeSingle();

      if (verifyError) {
        throw verifyError;
      }

      if (!verifyRow || verifyRow.completed !== true) {
        throw new Error(`Admin update didn't persist completed flag for submission id=${submission.id}`);
      }

      logger.info('Questionário completado via atualização direta', {
        tag: 'Quiz',
        data: { userId, method: 'direct_update' }
      });

      // Build and upsert consolidated answers into quiz_respostas_completas
      try {
        // fetch profile to enrich data
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('full_name, user_email')
          .eq('id', userId)
          .maybeSingle();

        // fetch answers joined with questions
        const { data: answers, error: answersError } = await supabaseAdmin
          .from('quiz_answers')
          .select(`answer, question_id, quiz_questions!inner(text, order_number)`)
          .eq('submission_id', submission.id)
          .order('quiz_questions.order_number');

        if (answersError) {
          logger.warn('Erro ao buscar quiz_answers para consolidacao', { tag: 'Quiz', data: { submissionId: submission.id, error: answersError } });
        }

        // Build respostas object in the same flat shape used by webhookUtils
        const respostasObj: Record<string, any> = {};
        if (answers && Array.isArray(answers) && answers.length > 0) {
          answers.forEach((item: any, idx: number) => {
            const questionText = item.quiz_questions?.text || `Pergunta ${idx + 1}`;
            const answerVal = item.answer || '';
            respostasObj[`Pergunta_${idx + 1}`] = questionText;
            respostasObj[`Resposta_${idx + 1}`] = answerVal;
            respostasObj[questionText] = answerVal;
          });
        }

        // Ensure non-null (NOT NULL constraint). If empty, use empty object {}
        const respostasPayload = Object.keys(respostasObj).length > 0 ? respostasObj : {};

        const upsertRow = {
          submission_id: submission.id,
          user_id: userId,
          user_email: (submission as any).user_email || profile?.user_email || '',
          full_name: profile?.full_name || (submission as any).user_name || '',
          data_submissao: (submission as any).completed_at || (submission as any).created_at || new Date().toISOString(),
          respostas: respostasPayload
        };

        const { error: upsertError } = await supabaseAdmin
          .from('quiz_respostas_completas')
          .upsert(upsertRow, { onConflict: 'submission_id' });

        if (upsertError) {
          logger.warn('Falha ao upsert em quiz_respostas_completas', { tag: 'Quiz', data: { submissionId: submission.id, error: upsertError } });
        } else {
          logger.info('quiz_respostas_completas upsert realizado', { tag: 'Quiz', data: { submissionId: submission.id } });
        }
      } catch (e) {
        logger.error('Excecao ao consolidar respostas em quiz_respostas_completas', { tag: 'Quiz', data: { userId, error: e } });
      }

      // Try to send webhook (best-effort)
      try {
        const webhookResult = await sendQuizDataToWebhook(submission.id);
        const webhookSent = !!webhookResult?.success;
        return { success: true, method: 'direct_update', webhookSent };
      } catch (e) {
        logger.warn('Erro ao enviar webhook após atualização direta', { tag: 'Quiz', data: { userId, error: e } });
        return { success: true, method: 'direct_update', webhookSent: false };
      }
    } else {
      // Buscar email do usuário antes de criar submissão
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      const userEmail = userData?.user?.email || '';

      // Caso não encontre submissão, cria uma já completa
      const { data: newSubmission, error: createError } = await supabaseAdmin
        .from('quiz_submissions')
        .insert([{
          user_id: userId,
          user_email: userEmail,
          current_module: 11,
          completed: true,
          completed_at: new Date().toISOString()
        }])
        .select();

      if (createError) {
        throw createError;
      }

      // Verificação: garantir que a nova submissão foi criada com completed = true
      const createdId = newSubmission?.[0]?.id;
      if (!createdId) {
        throw new Error('New submission created but id not returned');
      }

      const { data: verifyCreated, error: verifyCreatedError } = await supabaseAdmin
        .from('quiz_submissions')
        .select('id, completed, completed_at')
        .eq('id', createdId)
        .maybeSingle();

      if (verifyCreatedError) {
        throw verifyCreatedError;
      }

      if (!verifyCreated || verifyCreated.completed !== true) {
        throw new Error(`Created submission id=${createdId} does not have completed=true`);
      }

      logger.info('Questionário completado via criação de submissão', {
        tag: 'Quiz',
        data: { userId, method: 'create_complete' }
      });

      // After creating a completed submission, also upsert consolidated responses
      try {
        // fetch profile to enrich data
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('full_name, user_email')
          .eq('id', userId)
          .maybeSingle();

        // fetch answers for this user/submission (may be none)
        const { data: answers, error: answersError } = await supabaseAdmin
          .from('quiz_answers')
          .select(`answer, question_id, quiz_questions!inner(text, order_number)`)
          .eq('submission_id', createdId)
          .order('quiz_questions.order_number');

        if (answersError) {
          logger.warn('Erro ao buscar quiz_answers apos criar submissao', { tag: 'Quiz', data: { submissionId: createdId, error: answersError } });
        }

        const respostasObj: Record<string, any> = {};
        if (answers && Array.isArray(answers) && answers.length > 0) {
          answers.forEach((item: any, idx: number) => {
            const questionText = item.quiz_questions?.text || `Pergunta ${idx + 1}`;
            const answerVal = item.answer || '';
            respostasObj[`Pergunta_${idx + 1}`] = questionText;
            respostasObj[`Resposta_${idx + 1}`] = answerVal;
            respostasObj[questionText] = answerVal;
          });
        }

        const respostasPayload = Object.keys(respostasObj).length > 0 ? respostasObj : {};

        const upsertRow = {
          submission_id: createdId,
          user_id: userId,
          user_email: userEmail || profile?.user_email || '',
          full_name: profile?.full_name || '',
          data_submissao: new Date().toISOString(),
          respostas: respostasPayload
        };

        const { error: upsertError } = await supabaseAdmin
          .from('quiz_respostas_completas')
          .upsert(upsertRow, { onConflict: 'submission_id' });

        if (upsertError) {
          logger.warn('Falha ao upsert em quiz_respostas_completas apos criar submissao', { tag: 'Quiz', data: { submissionId: createdId, error: upsertError } });
        } else {
          logger.info('quiz_respostas_completas upsert realizado apos criar submissao', { tag: 'Quiz', data: { submissionId: createdId } });
        }
      } catch (e) {
        logger.error('Excecao ao consolidar respostas apos criar submissao', { tag: 'Quiz', data: { userId, error: e } });
      }
      // Try to send webhook (best-effort)
      try {
        const webhookResult = await sendQuizDataToWebhook(createdId);
        const webhookSent = !!webhookResult?.success;
        return { success: true, method: 'create_complete', webhookSent };
      } catch (e) {
        logger.warn('Erro ao enviar webhook apos criação de submissão', { tag: 'Quiz', data: { userId, error: e } });
        return { success: true, method: 'create_complete', webhookSent: false };
      }
    }
  } catch (error) {
    logger.error('Erro ao completar questionário manualmente', {
      tag: 'Quiz',
      data: { userId, error }
    });
    
    return { 
      success: false, 
      error: {
        message: error.message || 'Erro ao completar questionário',
        code: error.code || 'UNKNOWN_ERROR',
        details: error.details || error
      }
    };
  }
}

/**
 * Wrapper para salvar resposta com tratamento de erros aprimorado
 */
export async function saveQuizAnswer(userId: string, questionId: string, answer: string | string[], questionInfo: any = {}) {
  try {
    // Verifica se já existe uma submissão para este usuário
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('id, user_email')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (submissionError) {
      throw submissionError;
    }
    
    let submissionId;
    let userEmail = '';
    
    // Se não existir submissão, cria uma
    if (!submission) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      userEmail = userData.user?.email || '';
      
      const { data: newSubmission, error: createError } = await supabase
        .from('quiz_submissions')
        .insert([{
          user_id: userId,
          user_email: userEmail,
          current_module: 1,
          started_at: new Date().toISOString()
        }])
        .select();
        
      if (createError) {
        throw createError;
      }
      
      submissionId = newSubmission[0].id;
    } else {
      submissionId = submission.id;
      userEmail = submission.user_email;
    }
    
    // Normaliza a resposta para string
    let normalizedAnswer: string;
    
    if (Array.isArray(answer)) {
      normalizedAnswer = JSON.stringify(answer);
    } else if (typeof answer === 'object') {
      normalizedAnswer = JSON.stringify(answer);
    } else {
      normalizedAnswer = answer;
    }
    
    // Salva a resposta
    const { error: saveError } = await supabase
      .from('quiz_answers')
      .upsert({
        submission_id: submissionId,
        question_id: questionId,
        answer: normalizedAnswer,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'submission_id,question_id'
      });
      
    if (saveError) {
      throw saveError;
    }
    
    return { success: true, submissionId };
  } catch (error) {
    logger.error('Erro ao salvar resposta', {
      tag: 'Quiz',
      data: { questionId, userId, error }
    });
    
    return { 
      success: false, 
      error: {
        message: error.message || 'Erro ao salvar resposta',
        code: error.code || 'UNKNOWN_ERROR',
        details: error.details || error
      }
    };
  }
}

/**
 * Função para testar conexão com o Supabase
 */
export async function testSupabaseConnection() {
  try {
    // Teste básico de ping para verificar conexão
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
      
    if (error) {
      return {
        success: false,
        error: `Erro de conexão: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Conexão com o Supabase estabelecida com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: `Falha na conexão: ${error.message || 'Erro desconhecido'}`
    };
  }
}

/**
 * Função para processar as respostas do questionário para formato simplificado
 */
export function processQuizAnswersToSimplified(questions, answers) {
  const result = [];
  
  // Se não há perguntas ou respostas, retorna array vazio
  if (!questions || !questions.length || !answers || !answers.length) {
    return result;
  }
  
  // Mapear perguntas por ID para acesso rápido
  const questionsMap = new Map();
  questions.forEach(q => {
    questionsMap.set(q.id, q);
  });
  
  // Processar cada resposta
  answers.forEach(answer => {
    const question = questionsMap.get(answer.question_id);
    if (!question) return; // Ignora se pergunta não existe
    
    let displayAnswer = answer.answer || '';
    
    // Para respostas do tipo JSON (como checkboxes)
    try {
      if (displayAnswer.startsWith('[') || displayAnswer.startsWith('{')) {
        const parsed = JSON.parse(displayAnswer);
        if (Array.isArray(parsed)) {
          displayAnswer = parsed.join(', ');
        } else if (typeof parsed === 'object') {
          displayAnswer = Object.values(parsed).join(', ');
        }
      }
    } catch (e) {
      // Mantém como string se falhar o parsing
    }
    
    result.push({
      id: question.id,
      question: question.text,
      answer: displayAnswer,
      type: question.type,
      module: question.module_id
    });
  });
  
  return result;
}

/**
 * Função para obter respostas completas do questionário
 */
export async function getQuizCompletedAnswers(submissionId: string) {
  try {
    // Buscar detalhes da submissão
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('quiz_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      throw submissionError || new Error('Submissão não encontrada');
    }

    // Buscar todas as respostas
    const { data: answers, error: answersError } = await supabaseAdmin
      .from('quiz_answers')
      .select('*')
      .eq('submission_id', submissionId);

    if (answersError) {
      throw answersError;
    }

    // Buscar todas as perguntas
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select(`
        *,
        quiz_modules!inner(
          id, title, order_number
        )
      `);

    if (questionsError) {
      throw questionsError;
    }

    // Mapear perguntas por ID para acesso rápido
    const questionsMap = new Map();
    questions.forEach(q => {
      questionsMap.set(q.id, {
        ...q,
        module_title: q.quiz_modules.title,
        module_number: q.quiz_modules.order_number
      });
    });

    // Processar respostas
    const processedAnswers = answers.map(answer => {
      const question = questionsMap.get(answer.question_id);
      if (!question) return null;

      let formattedAnswer = answer.answer || '';

      // Tentar formatar JSON
      try {
        if (formattedAnswer.startsWith('[') || formattedAnswer.startsWith('{')) {
          const parsed = JSON.parse(formattedAnswer);
          if (Array.isArray(parsed)) {
            formattedAnswer = parsed.join(', ');
          } else if (typeof parsed === 'object') {
            formattedAnswer = Object.values(parsed).join(', ');
          }
        }
      } catch (e) {
        // Manter como está se falhar
      }

      return {
        question_id: answer.question_id,
        question_text: question.text,
        answer: formattedAnswer,
        question_type: question.type,
        module_id: question.module_id,
        module_title: question.module_title,
        module_number: question.module_number
      };
    }).filter(Boolean);

    // Organizar por módulo e número da pergunta
    processedAnswers.sort((a, b) => {
      if (a.module_number !== b.module_number) {
        return a.module_number - b.module_number;
      }
      return a.question_id.localeCompare(b.question_id);
    });

    return {
      ...submission,
      answers: processedAnswers
    };
  } catch (error) {
    logger.error('Erro ao obter respostas completas do questionário', {
      tag: 'Admin',
      data: { submissionId, error }
    });
    return null;
  }
}

/**
 * Função para formatar respostas para CSV
 */
export function formatCompletedAnswersToCSV(completedAnswers) {
  if (!completedAnswers || !completedAnswers.answers || !completedAnswers.answers.length) {
    return null;
  }
  
  // Cabeçalho do CSV
  const headers = [
    'ID da Pergunta',
    'Módulo',
    'Pergunta',
    'Tipo',
    'Resposta'
  ].join(',');
  
  // Linhas de dados
  const rows = completedAnswers.answers.map(answer => {
    // Escapar aspas em textos para formato CSV
    const escapeCsv = (text) => {
      if (!text) return '';
      const escaped = text.toString().replace(/"/g, '""');
      return `"${escaped}"`;
    };
    
    return [
      escapeCsv(answer.question_id),
      escapeCsv(`${answer.module_number} - ${answer.module_title}`),
      escapeCsv(answer.question_text),
      escapeCsv(answer.question_type),
      escapeCsv(answer.answer)
    ].join(',');
  });
  
  // Criar conteúdo CSV
  return [
    `"Dados do Usuário: ${completedAnswers.user_email || 'N/A'}","Data: ${new Date(completedAnswers.completed_at || completedAnswers.created_at).toLocaleDateString('pt-BR')}"`,
    '',
    headers,
    ...rows
  ].join('\n');
}

/**
 * Função para formatar respostas para PDF
 */
export function formatCompletedAnswersForPDF(completedAnswers) {
  if (!completedAnswers || !completedAnswers.answers || !completedAnswers.answers.length) {
    return null;
  }
  
  // Agrupar respostas por módulo
  const moduleAnswers = {};
  completedAnswers.answers.forEach(answer => {
    const moduleKey = `${answer.module_number} - ${answer.module_title}`;
    if (!moduleAnswers[moduleKey]) {
      moduleAnswers[moduleKey] = [];
    }
    moduleAnswers[moduleKey].push(answer);
  });
  
  // Formatar cabeçalho
  const cabecalho = {
    usuario: completedAnswers.full_name || 'N/A',
    email: completedAnswers.user_email || 'N/A',
    dataSubmissao: new Date(completedAnswers.completed_at || completedAnswers.created_at).toLocaleDateString('pt-BR')
  };
  
  // Formatar respostas
  const respostas = completedAnswers.answers.map(answer => ({
    modulo: `${answer.module_number} - ${answer.module_title}`,
    pergunta: answer.question_text,
    resposta: answer.answer || 'Sem resposta'
  }));
  
  return {
    cabecalho,
    respostas
  };
}

/**
 * Função para atualizar o progresso da submissão
 */
export async function updateSubmissionProgress(submissionId: string, currentModule: number): Promise<void> {
  const { error } = await supabase
    .from('quiz_submissions')
    .update({
      current_module: currentModule,
      updated_at: new Date().toISOString()
    })
    .eq('id', submissionId);
    
  if (error) throw error;
}
