
/**
 * Formatador de respostas JSON para exibição adequada
 */

/**
 * Formata uma resposta que pode estar em formato JSON para exibição legível
 * @param answer Resposta que pode estar em formato JSON
 * @returns String formatada para exibição
 */
export const formatJsonAnswer = (answer: string | string[] | null | undefined): string => {
  if (!answer) return "Sem resposta";
  
  // Se já for um array, processar diretamente
  if (Array.isArray(answer)) {
    return formatArrayAnswer(answer);
  }
  
  try {
    // Verificar se é uma string JSON
    if (typeof answer === 'string') {
      // Verificar se parece ser uma string em formato JSON
      if ((answer.startsWith('[') && answer.endsWith(']')) || 
          (answer.startsWith('{') && answer.endsWith('}'))) {
        try {
          const parsed = JSON.parse(answer);
          
          // Processar array
          if (Array.isArray(parsed)) {
            return formatArrayAnswer(parsed);
          }
          
          // Processar objeto
          if (typeof parsed === 'object' && parsed !== null) {
            return formatObjectAnswer(parsed);
          }
        } catch (e) {
          // Se o parse falhar, não era um JSON válido
          return answer;
        }
      }
    }
    
    // Se não for um JSON válido ou não precisar de formatação especial, retornar como está
    return answer.toString();
  } catch (e) {
    // Em caso de erro no parse, retornar a resposta original
    console.warn("Erro ao formatar resposta JSON:", e);
    return typeof answer === 'string' ? answer : String(answer);
  }
};

/**
 * Processa um array de respostas (usado para checkbox ou múltipla escolha)
 */
const formatArrayAnswer = (items: any[]): string => {
  if (items.length === 0) return "Nenhuma opção selecionada";
  
  return items.map(item => {
    if (typeof item === 'object' && item !== null) {
      // Extrai texto de objetos (opções)
      return item.text || item.label || item.valor || Object.values(item).join(', ');
    }
    return item; // Se for string ou outro tipo primitivo
  }).join(', ');
};

/**
 * Processa um objeto de resposta
 */
const formatObjectAnswer = (obj: Record<string, any>): string => {
  // Verificar se é uma resposta tipo "outro" 
  if (obj.other !== undefined && obj.value !== undefined) {
    return `${obj.value} (${obj.other})`;
  }
  
  // Para outros tipos de objetos, tentar extrair valores principais
  const values = Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  return values || JSON.stringify(obj);
};
