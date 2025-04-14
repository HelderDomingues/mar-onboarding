
/**
 * Utilitário para formatação de dados e respostas do questionário
 */

/**
 * Formata respostas JSON para exibição amigável
 * @param answerStr String contendo a resposta (possivelmente em formato JSON)
 * @returns String formatada para exibição
 */
export const formatJsonAnswer = (answerStr: string | null): string => {
  if (!answerStr) return '';
  
  try {
    // Verifica se a resposta já é um array (respostas de checkbox)
    if (answerStr.startsWith('[') && answerStr.endsWith(']')) {
      const parsed = JSON.parse(answerStr);
      
      if (Array.isArray(parsed)) {
        // Se for um array vazio, retornar string vazia
        if (parsed.length === 0) return '';
        
        // Se for um array de strings, exibir como lista com marcadores
        if (typeof parsed[0] === 'string') {
          return parsed.map(item => `• ${item}`).join('\n');
        }
        
        // Se for um array de objetos complexos, exibir como JSON formatado
        return JSON.stringify(parsed, null, 2);
      }
    }
    
    // Tentar interpretar como JSON
    if (answerStr.includes('{') || answerStr.includes('[')) {
      try {
        const parsed = JSON.parse(answerStr);
        return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
      } catch (e) {
        // Se não for um JSON válido, continuar com o tratamento normal
      }
    }
    
    // Resposta comum (texto simples)
    return answerStr;
    
  } catch (error) {
    console.error('Erro ao formatar resposta:', error);
    return answerStr || '';
  }
};

/**
 * Normaliza e formata respostas antes de salvar no banco de dados
 * @param answer Resposta para formatar (string, array ou objeto)
 * @param questionType Tipo da pergunta
 * @returns String formatada para armazenamento
 */
export const normalizeAnswerForStorage = (answer: any, questionType?: string): string => {
  if (answer === null || answer === undefined) return '';
  
  // Para tipos checkbox, garantir que a resposta seja um array JSON
  if (questionType === 'checkbox') {
    if (Array.isArray(answer)) {
      return JSON.stringify(answer);
    } else if (typeof answer === 'string') {
      // Se já for uma string JSON de array, manter como está
      if (answer.startsWith('[') && answer.endsWith(']')) {
        try {
          JSON.parse(answer); // Validar que é um JSON válido
          return answer;
        } catch (e) {
          // Se não for um JSON válido, converter para array com um item
          return JSON.stringify([answer]);
        }
      }
      // Se for uma string comum, converter para array com um item
      return JSON.stringify([answer]);
    }
    // Para qualquer outro tipo, converter para array
    return JSON.stringify([String(answer)]);
  }
  
  // Para outros tipos de pergunta
  if (typeof answer === 'object') {
    return JSON.stringify(answer);
  }
  
  // Para valores simples, retornar como string
  return String(answer);
};

/**
 * Normaliza formato de resposta para exibição
 * @param answer Resposta a ser normalizada
 * @param questionType Tipo da pergunta
 * @returns Resposta normalizada para exibição
 */
export const normalizeAnswerForDisplay = (answer: any, questionType?: string): string | string[] => {
  if (!answer) return '';
  
  // Para tipos checkbox, garantir que a resposta seja um array
  if (questionType === 'checkbox') {
    if (typeof answer === 'string') {
      try {
        const parsed = JSON.parse(answer);
        return Array.isArray(parsed) ? parsed : [answer];
      } catch (e) {
        return [answer];
      }
    }
    return Array.isArray(answer) ? answer : [String(answer)];
  }
  
  // Para outros tipos, retornar a string diretamente
  if (typeof answer === 'object') {
    return JSON.stringify(answer);
  }
  
  return String(answer);
};
