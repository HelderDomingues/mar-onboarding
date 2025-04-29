
/**
 * Script de recuperação forçada para o questionário MAR
 * Este script é usado em situações emergenciais para garantir que os dados do questionário existam
 */
import { recoverQuizData } from './quiz-recovery';
import { seedQuizData } from './seed-quiz';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';

/**
 * Função de recuperação forçada que garante a existência dos dados do questionário
 * Tenta primeiro recuperar os dados e, caso falhe, executa um seed completo
 */
export async function forceQuizRecovery(): Promise<{
  success: boolean;
  message: string;
  data?: {
    modules?: number;
    questions?: number;
    options?: number;
  };
}> {
  try {
    addLogEntry('info', 'Iniciando processo de recuperação forçada do questionário');
    logger.info('Iniciando processo de recuperação forçada do questionário', { tag: 'RecoveryForce' });

    // Primeiro tenta a recuperação normal
    const recoveryResult = await recoverQuizData();
    
    if (recoveryResult.success) {
      addLogEntry('info', 'Recuperação de dados do questionário realizada com sucesso', recoveryResult.data);
      return recoveryResult;
    }
    
    // Se falhar, faz um seed completo
    addLogEntry('warning', 'Recuperação falhou, tentando seed completo do questionário');
    logger.warn('Recuperação falhou, tentando seed completo', { tag: 'RecoveryForce' });
    
    const seedSuccess = await seedQuizData();
    
    if (seedSuccess) {
      // Verifica os dados inseridos usando supabaseAdmin se disponível para evitar problemas de RLS
      const client = supabaseAdmin || supabase;
      
      const { data: modulesData, error: modulesError } = await client
        .from('quiz_modules')
        .select('*');
        
      const { data: questionsData, error: questionsError } = await client
        .from('quiz_questions')
        .select('*');
        
      const { data: optionsData, error: optionsError } = await client
        .from('quiz_options')
        .select('*');
      
      // Verificar erros nas consultas
      if (modulesError || questionsError || optionsError) {
        logger.error('Erro ao verificar contagem de dados após seed:', { 
          modulesError, questionsError, optionsError,
          tag: 'RecoveryForce'
        });
      }
      
      const modulesCount = modulesData?.length || 0;
      const questionsCount = questionsData?.length || 0;
      const optionsCount = optionsData?.length || 0;
      
      const result = {
        success: true,
        message: 'Seed forçado do questionário concluído com sucesso',
        data: {
          modules: modulesCount,
          questions: questionsCount,
          options: optionsCount
        }
      };
      
      addLogEntry('info', 'Seed forçado do questionário concluído com sucesso', result.data);
      
      return result;
    }
    
    return {
      success: false,
      message: 'Todas as tentativas de recuperação do questionário falharam'
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    addLogEntry('error', 'Erro fatal na recuperação forçada do questionário', { error: errorMessage });
    logger.error('Erro fatal na recuperação forçada do questionário', {
      tag: 'RecoveryForce',
      data: { error }
    });
    
    return {
      success: false,
      message: `Erro fatal: ${errorMessage}`
    };
  }
}

export default forceQuizRecovery;
