
/**
 * API para executar a recuperação forçada do questionário MAR
 * 
 * Esta API permite recuperar o questionário chamando diretamente uma URL,
 * sem necessidade de interação com botões na interface.
 * 
 * Exemplo de uso:
 * GET /api/recover-quiz?key=your_secret_key
 */
export default async function handler(req: any, res: any) {
  // Verificar método
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido'
    });
  }
  
  // Verificar chave de segurança básica
  const { key } = req.query;
  const securityKey = import.meta.env.VITE_QUIZ_RECOVERY_KEY || 'recover-quiz-mar';
  
  if (key !== securityKey) {
    const { logger } = await import('@/utils/logger');
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
    const { logger } = await import('@/utils/logger');
    const { runRecovery } = await import('@/scripts/run-recovery');
    
    logger.info('Iniciando recuperação do questionário via API', {
      tag: 'ApiRecovery'
    });
    
    const result = await runRecovery();
    
    logger.info('Recuperação via API concluída', {
      tag: 'ApiRecovery',
      data: result
    });
    
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    const { logger } = await import('@/utils/logger');
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Erro na API de recuperação', {
      tag: 'ApiRecovery',
      data: { error }
    });
    
    return res.status(500).json({
      success: false,
      message: `Erro ao processar a recuperação: ${errorMessage}`
    });
  }
}
