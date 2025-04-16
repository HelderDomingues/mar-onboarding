
/**
 * API para executar a recuperação forçada do questionário MAR
 * 
 * Esta API permite recuperar o questionário chamando diretamente uma URL,
 * sem necessidade de interação com botões na interface.
 * 
 * Exemplo de uso:
 * GET /api/recover-quiz?key=recover-quiz-mar
 */
import { supabase } from '@/integrations/supabase/client';
import { seedQuizData } from '@/scripts/seed-quiz';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';

export default async function handler(req, res) {
  // Verificar método
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido'
    });
  }
  
  // Verificar chave de segurança básica
  const { key } = req.query;
  const securityKey = 'recover-quiz-mar';
  
  if (key !== securityKey) {
    logger.warn('Tentativa de recuperação com chave inválida', {
      tag: 'ApiRecovery',
      data: {
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });
    
    return res.status(401).json({
      success: false,
      message: 'Chave de acesso inválida'
    });
  }
  
  try {
    logger.info('Iniciando recuperação do questionário via API', {
      tag: 'ApiRecovery'
    });
    
    addLogEntry('info', 'Iniciando recuperação do questionário via API');
    
    // Limpar dados existentes primeiro
    await limparDadosQuiz();
    
    // Executar seed com dados limpos
    const success = await seedQuizData();
    
    const result = {
      success: success,
      message: success ? 'Questionário recuperado com sucesso' : 'Falha ao recuperar questionário',
      timestamp: new Date().toISOString()
    };
    
    logger.info('Recuperação via API concluída', {
      tag: 'ApiRecovery',
      data: result
    });
    
    addLogEntry('info', 'Recuperação via API concluída', { resultado: result });
    
    return res.status(success ? 200 : 500).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Erro na API de recuperação', {
      tag: 'ApiRecovery',
      data: { error }
    });
    
    addLogEntry('error', 'Erro na API de recuperação', { error: errorMessage });
    
    return res.status(500).json({
      success: false,
      message: `Erro ao processar a recuperação: ${errorMessage}`
    });
  }
}

// Função para limpar todos os dados do questionário
async function limparDadosQuiz() {
  try {
    logger.info('Limpando dados existentes do questionário', { tag: 'ApiRecovery' });
    
    // Limpar opções
    const { error: deleteOptionsError } = await supabase
      .from('quiz_options')
      .delete()
      .gt('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteOptionsError) {
      logger.error('Erro ao limpar opções', { tag: 'ApiRecovery', error: deleteOptionsError });
    }
    
    // Limpar perguntas
    const { error: deleteQuestionsError } = await supabase
      .from('quiz_questions')
      .delete()
      .gt('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteQuestionsError) {
      logger.error('Erro ao limpar perguntas', { tag: 'ApiRecovery', error: deleteQuestionsError });
    }
    
    // Limpar módulos
    const { error: deleteModulesError } = await supabase
      .from('quiz_modules')
      .delete()
      .gt('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteModulesError) {
      logger.error('Erro ao limpar módulos', { tag: 'ApiRecovery', error: deleteModulesError });
    }
    
    logger.info('Dados do questionário limpos com sucesso', { tag: 'ApiRecovery' });
    return true;
  } catch (error) {
    logger.error('Erro ao limpar dados do questionário', { tag: 'ApiRecovery', error });
    return false;
  }
}
