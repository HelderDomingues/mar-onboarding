import { supabase } from '@/integrations/supabase/client';
import { getSupabaseAdminClient } from '@/utils/supabaseAdminClient';
import { logger } from '@/utils/logger';
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
    logger.info('Invocando função para completar questionário manualmente', {
      tag: 'Quiz',
      data: { userId }
    });

    const { data, error } = await supabase.functions.invoke('complete-quiz-manually', {
      body: { user_id: userId },
    });

    if (error) {
      throw error;
    }

    return { success: true, ...data };
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
    const { data, error } = await supabase.functions.invoke('get-quiz-completed-answers', {
      body: { submission_id: submissionId },
    });

    if (error) {
      throw error;
    }
    return data;
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
    usuario: completedAnswers.user_name || 'N/A',
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
