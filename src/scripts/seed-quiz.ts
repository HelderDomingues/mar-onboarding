
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';

/**
 * Script para inicializar os dados do questionário MAR no Supabase
 * Versão simplificada que não utiliza UUIDs fixos para evitar conflitos
 */
export const seedQuizData = async (): Promise<boolean> => {
  try {
    addLogEntry('info', 'Iniciando processo de seed do questionário MAR');
    logger.info('Iniciando processo de seed do questionário MAR', { tag: 'Admin' });
    
    // Definir módulos do questionário
    const modules = [
      { title: "Informações Pessoais", description: "Neste módulo, coletaremos algumas informações básicas sobre você para personalizar sua experiência.", order_number: 1 },
      { title: "Marketing", description: "Neste módulo, vamos avaliar suas estratégias e táticas de marketing atuais.", order_number: 2 },
      { title: "Vendas", description: "Neste módulo, vamos analisar seu processo de vendas e identificar oportunidades de melhoria.", order_number: 3 },
      { title: "Financeiro", description: "Neste módulo, vamos examinar suas finanças e contabilidade para garantir a saúde financeira da sua empresa.", order_number: 4 },
      { title: "Operações", description: "Neste módulo, vamos otimizar seus processos operacionais para aumentar a eficiência e reduzir custos.", order_number: 5 },
      { title: "Pessoas", description: "Neste módulo, vamos desenvolver sua equipe e cultura organizacional para atrair e reter talentos.", order_number: 6 },
      { title: "Perspectiva Financeira", description: "Como estamos financeiramente?", order_number: 7 },
      { title: "Perspectiva de Processos Internos", description: "Como fazemos o nosso trabalho?", order_number: 8 },
      { title: "Perspectiva de inovação, aprendizado e crescimento", description: "Como aprendemos e melhoramos?", order_number: 9 },
      { title: "Clientes e Perspectiva de Mercado", description: "Como nossos clientes nos enxergam?", order_number: 10 },
      { title: "Prioridades e Ações", description: "O que devemos priorizar em nossa empresa?", order_number: 11 },
      { title: "Acompanhamento e Medição", description: "Como acompanhamos nosso progresso?", order_number: 12 },
      { title: "Observações Finais", description: "Comentários adicionais e conclusão", order_number: 13 }
    ];
    
    // Inserir módulos
    const { data: modulesData, error: insertModulesError } = await supabase
      .from('quiz_modules')
      .insert(modules)
      .select();
      
    if (insertModulesError) {
      logger.error('Erro ao inserir módulos:', {
        tag: 'Admin',
        data: { error: insertModulesError }
      });
      addLogEntry('error', 'Erro ao inserir módulos', { error: insertModulesError.message });
      return false;
    }
    
    logger.info(`${modulesData?.length || 0} módulos inseridos com sucesso`, {
      tag: 'Admin'
    });
    
    // Mapear IDs dos módulos inseridos
    const moduleMap = new Map();
    modulesData?.forEach(module => {
      moduleMap.set(module.order_number, module.id);
    });
    
    // Definir perguntas do questionário (versão simplificada para teste)
    const questions = [
      { text: "Qual é o seu nome?", type: "text", required: true, order_number: 1, module_id: moduleMap.get(1), hint: "Digite seu nome completo" },
      { text: "Qual é o seu email?", type: "email", required: true, order_number: 2, module_id: moduleMap.get(1), hint: "Digite seu email profissional" },
      { text: "Quantos funcionários sua empresa possui?", type: "radio", required: true, order_number: 3, module_id: moduleMap.get(1), hint: "Selecione a faixa que melhor representa sua empresa" },
      { text: "Em qual setor sua empresa atua?", type: "radio", required: true, order_number: 4, module_id: moduleMap.get(1), hint: "Selecione o setor principal" },
      { text: "Descreva brevemente sua empresa", type: "textarea", required: false, order_number: 5, module_id: moduleMap.get(1), hint: "Uma breve descrição do seu negócio" },
      
      { text: "Qual é o seu orçamento de marketing anual?", type: "radio", required: true, order_number: 1, module_id: moduleMap.get(2), hint: "Selecione a faixa que melhor representa seu orçamento" },
      { text: "Quais canais de marketing você utiliza?", type: "checkbox", required: true, order_number: 2, module_id: moduleMap.get(2), hint: "Selecione todos os canais que você utiliza" },
      { text: "Como você mede o retorno sobre investimento (ROI) do marketing?", type: "radio", required: true, order_number: 3, module_id: moduleMap.get(2), hint: "Selecione a opção mais próxima da sua realidade" },
      
      { text: "Qual é o seu ciclo médio de vendas?", type: "radio", required: true, order_number: 1, module_id: moduleMap.get(3), hint: "Selecione a opção mais próxima da sua realidade" },
      { text: "Qual é a sua taxa de conversão de leads para clientes?", type: "radio", required: true, order_number: 2, module_id: moduleMap.get(3), hint: "Selecione a faixa que melhor representa sua taxa de conversão" },
      { text: "Quais ferramentas você usa para gerenciar vendas?", type: "checkbox", required: true, order_number: 3, module_id: moduleMap.get(3), hint: "Selecione todas as ferramentas que você utiliza" }
    ];
    
    // Inserir perguntas
    const { data: questionsData, error: insertQuestionsError } = await supabase
      .from('quiz_questions')
      .insert(questions)
      .select();
      
    if (insertQuestionsError) {
      logger.error('Erro ao inserir perguntas:', {
        tag: 'Admin',
        data: { error: insertQuestionsError }
      });
      addLogEntry('error', 'Erro ao inserir perguntas', { error: insertQuestionsError.message });
      return false;
    }
    
    logger.info(`${questionsData?.length || 0} perguntas inseridas com sucesso`, {
      tag: 'Admin'
    });
    
    // Mapear perguntas por texto para adicionar opções
    const questionMap = new Map();
    questionsData?.forEach(question => {
      questionMap.set(question.text, question.id);
    });
    
    // Definir opções para perguntas de múltipla escolha
    const options = [
      // Pergunta sobre número de funcionários
      { question_id: questionMap.get("Quantos funcionários sua empresa possui?"), text: "1-10 funcionários", order_number: 1 },
      { question_id: questionMap.get("Quantos funcionários sua empresa possui?"), text: "11-50 funcionários", order_number: 2 },
      { question_id: questionMap.get("Quantos funcionários sua empresa possui?"), text: "51-200 funcionários", order_number: 3 },
      { question_id: questionMap.get("Quantos funcionários sua empresa possui?"), text: "Mais de 200 funcionários", order_number: 4 },
      
      // Pergunta sobre setor
      { question_id: questionMap.get("Em qual setor sua empresa atua?"), text: "Tecnologia", order_number: 1 },
      { question_id: questionMap.get("Em qual setor sua empresa atua?"), text: "Saúde", order_number: 2 },
      { question_id: questionMap.get("Em qual setor sua empresa atua?"), text: "Educação", order_number: 3 },
      { question_id: questionMap.get("Em qual setor sua empresa atua?"), text: "Varejo", order_number: 4 },
      { question_id: questionMap.get("Em qual setor sua empresa atua?"), text: "Finanças", order_number: 5 },
      { question_id: questionMap.get("Em qual setor sua empresa atua?"), text: "Outro", order_number: 6 },
      
      // Pergunta sobre orçamento de marketing
      { question_id: questionMap.get("Qual é o seu orçamento de marketing anual?"), text: "Menos de R$ 10.000", order_number: 1 },
      { question_id: questionMap.get("Qual é o seu orçamento de marketing anual?"), text: "R$ 10.000 - R$ 50.000", order_number: 2 },
      { question_id: questionMap.get("Qual é o seu orçamento de marketing anual?"), text: "R$ 50.000 - R$ 200.000", order_number: 3 },
      { question_id: questionMap.get("Qual é o seu orçamento de marketing anual?"), text: "Mais de R$ 200.000", order_number: 4 },
      
      // Pergunta sobre canais de marketing
      { question_id: questionMap.get("Quais canais de marketing você utiliza?"), text: "Mídias sociais", order_number: 1 },
      { question_id: questionMap.get("Quais canais de marketing você utiliza?"), text: "Email marketing", order_number: 2 },
      { question_id: questionMap.get("Quais canais de marketing você utiliza?"), text: "SEO/SEM", order_number: 3 },
      { question_id: questionMap.get("Quais canais de marketing você utiliza?"), text: "Publicidade paga", order_number: 4 },
      { question_id: questionMap.get("Quais canais de marketing você utiliza?"), text: "Marketing de conteúdo", order_number: 5 },
      { question_id: questionMap.get("Quais canais de marketing você utiliza?"), text: "Eventos", order_number: 6 },
      
      // Pergunta sobre ROI de marketing
      { question_id: questionMap.get("Como você mede o retorno sobre investimento (ROI) do marketing?"), text: "Não medimos formalmente", order_number: 1 },
      { question_id: questionMap.get("Como você mede o retorno sobre investimento (ROI) do marketing?"), text: "Métricas básicas (cliques, visualizações)", order_number: 2 },
      { question_id: questionMap.get("Como você mede o retorno sobre investimento (ROI) do marketing?"), text: "Atribuição de receita a campanhas", order_number: 3 },
      { question_id: questionMap.get("Como você mede o retorno sobre investimento (ROI) do marketing?"), text: "Sistema completo de analytics", order_number: 4 },
      
      // Pergunta sobre ciclo de vendas
      { question_id: questionMap.get("Qual é o seu ciclo médio de vendas?"), text: "Menos de 1 semana", order_number: 1 },
      { question_id: questionMap.get("Qual é o seu ciclo médio de vendas?"), text: "1-4 semanas", order_number: 2 },
      { question_id: questionMap.get("Qual é o seu ciclo médio de vendas?"), text: "1-3 meses", order_number: 3 },
      { question_id: questionMap.get("Qual é o seu ciclo médio de vendas?"), text: "Mais de 3 meses", order_number: 4 },
      
      // Pergunta sobre taxa de conversão
      { question_id: questionMap.get("Qual é a sua taxa de conversão de leads para clientes?"), text: "Menos de 5%", order_number: 1 },
      { question_id: questionMap.get("Qual é a sua taxa de conversão de leads para clientes?"), text: "5-15%", order_number: 2 },
      { question_id: questionMap.get("Qual é a sua taxa de conversão de leads para clientes?"), text: "15-30%", order_number: 3 },
      { question_id: questionMap.get("Qual é a sua taxa de conversão de leads para clientes?"), text: "Mais de 30%", order_number: 4 },
      
      // Pergunta sobre ferramentas de vendas
      { question_id: questionMap.get("Quais ferramentas você usa para gerenciar vendas?"), text: "CRM", order_number: 1 },
      { question_id: questionMap.get("Quais ferramentas você usa para gerenciar vendas?"), text: "Planilhas", order_number: 2 },
      { question_id: questionMap.get("Quais ferramentas você usa para gerenciar vendas?"), text: "Software de automação de vendas", order_number: 3 },
      { question_id: questionMap.get("Quais ferramentas você usa para gerenciar vendas?"), text: "Ferramentas de email", order_number: 4 },
      { question_id: questionMap.get("Quais ferramentas você usa para gerenciar vendas?"), text: "Software de proposta", order_number: 5 }
    ];
    
    // Filtrar opções para perguntas existentes
    const validOptions = options.filter(option => option.question_id);
    
    if (validOptions.length > 0) {
      // Inserir opções
      const { data: optionsData, error: insertOptionsError } = await supabase
        .from('quiz_options')
        .insert(validOptions)
        .select();
        
      if (insertOptionsError) {
        logger.error('Erro ao inserir opções:', {
          tag: 'Admin',
          data: { error: insertOptionsError }
        });
        addLogEntry('error', 'Erro ao inserir opções', { error: insertOptionsError.message });
        return false;
      }
      
      logger.info(`${optionsData?.length || 0} opções inseridas com sucesso`, {
        tag: 'Admin'
      });
    }
    
    addLogEntry('info', 'Seed do questionário MAR concluído com sucesso');
    logger.info('Seed do questionário MAR concluído com sucesso', { 
      tag: 'Admin',
      data: {
        modules: modulesData?.length || 0,
        questions: questionsData?.length || 0,
        options: validOptions.length
      }
    });
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Erro ao executar seed do questionário:', {
      tag: 'Admin',
      data: { error }
    });
    addLogEntry('error', 'Erro ao executar seed do questionário', { error: errorMessage });
    return false;
  }
};

export default seedQuizData;
