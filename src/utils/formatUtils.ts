
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

/**
 * Converte uma resposta para um array de strings, independentemente do formato original
 * @param answer Resposta a ser convertida (string, array ou objeto)
 * @returns Array de strings
 */
export const normalizeAnswerToArray = (answer: any): string[] => {
  if (!answer) return [];
  
  if (Array.isArray(answer)) {
    return answer.map(item => String(item));
  }
  
  if (typeof answer === 'string') {
    // Tenta interpretar como JSON array
    if (answer.startsWith('[') && answer.endsWith(']')) {
      try {
        const parsed = JSON.parse(answer);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item));
        }
      } catch (e) {
        // Se falhar o parse, continua o processamento abaixo
      }
    }
    
    // Se contiver vírgulas e não parece ser JSON, divide por vírgulas
    if (answer.includes(',') && !answer.includes('{') && !answer.includes('"')) {
      return answer.split(',').map(item => item.trim());
    }
    
    // Caso contrário, retorna como array de um item
    return [answer];
  }
  
  // Para outros tipos, converte para string e retorna como array de um item
  return [String(answer)];
};

/**
 * Prepara a resposta para armazenamento considerando seu tipo
 * @param answer Resposta para ser preparada
 * @param isMultipleChoice Indica se é uma pergunta de múltipla escolha (checkbox/radio)
 * @returns String formatada para armazenamento
 */
export const prepareAnswerForStorage = (answer: any, isMultipleChoice: boolean): string => {
  if (answer === null || answer === undefined) return '';
  
  // Para perguntas de múltipla escolha
  if (isMultipleChoice) {
    if (Array.isArray(answer)) {
      return JSON.stringify(answer);
    } else if (typeof answer === 'string') {
      // Se já for uma string JSON de array, validar
      if (answer.startsWith('[') && answer.endsWith(']')) {
        try {
          JSON.parse(answer); // Validar que é um JSON válido
          return answer;
        } catch (e) {
          // Se não for um JSON válido, converter para array com um item
          return JSON.stringify([answer]);
        }
      }
      // Para strings que podem ser listas separadas por vírgula
      if (answer.includes(',')) {
        const items = answer.split(',').map(item => item.trim());
        return JSON.stringify(items);
      }
      // Se for uma string comum, converter para array com um item
      return JSON.stringify([answer]);
    }
    // Para qualquer outro tipo, converter para array
    return JSON.stringify([String(answer)]);
  }
  
  // Para outros tipos de resposta
  if (typeof answer === 'object' && !Array.isArray(answer)) {
    return JSON.stringify(answer);
  }
  
  // Para arrays não relacionados a múltipla escolha, converter para string
  if (Array.isArray(answer)) {
    return answer.join(', ');
  }
  
  // Para valores simples, retornar como string
  return String(answer);
};
