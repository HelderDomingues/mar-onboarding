
import { NextApiRequest, NextApiResponse } from 'next';
import { runRecovery } from '@/scripts/run-recovery';
import { logger } from '@/utils/logger';

/**
 * API para executar a recuperação forçada do questionário MAR
 * 
 * Esta API permite recuperar o questionário chamando diretamente uma URL,
 * sem necessidade de interação com botões na interface.
 * 
 * Exemplo de uso:
 * GET /api/recover-quiz?key=your_secret_key
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar método
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido'
    });
  }
  
  // Verificar chave de segurança básica
  const { key } = req.query;
  const securityKey = process.env.QUIZ_RECOVERY_KEY || 'recover-quiz-mar';
  
  if (key !== securityKey) {
    logger.warn('Tentativa de recuperação com chave inválida', {
      tag: 'ApiRecovery',
      data: {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
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
    
    const result = await runRecovery();
    
    logger.info('Recuperação via API concluída', {
      tag: 'ApiRecovery',
      data: result
    });
    
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
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
