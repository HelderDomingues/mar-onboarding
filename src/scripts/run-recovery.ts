
import { forceQuizRecovery } from './force-quiz-recovery';
import { logger } from '@/utils/logger';

/**
 * Função para executar a recuperação forçada do questionário MAR
 * 
 * Esta função pode ser chamada diretamente ou importada e utilizada
 * em qualquer parte da aplicação.
 */
export const runRecovery = async () => {
  try {
    logger.info('Iniciando processo de recuperação automática via script...', {
      tag: 'AutoRecovery'
    });
    
    const result = await forceQuizRecovery();
    
    logger.info(`Recuperação automática concluída: ${result.success ? 'Sucesso' : 'Falha'}`, {
      tag: 'AutoRecovery',
      data: {
        message: result.message,
        ...result.data
      }
    });
    
    return result;
  } catch (error) {
    logger.error('Erro inesperado na execução da recuperação automática:', {
      tag: 'AutoRecovery',
      data: { error }
    });
    
    return {
      success: false,
      message: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Se este arquivo for executado diretamente, rodar a recuperação
if (require.main === module) {
  runRecovery()
    .then(result => {
      console.log('Resultado da recuperação automática:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erro fatal na recuperação automática:', error);
      process.exit(1);
    });
}

export default runRecovery;
