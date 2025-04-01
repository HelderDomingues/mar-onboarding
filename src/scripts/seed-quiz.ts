import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { logger } from "@/utils/logger";

// Função principal para inserção dos dados
export const seedQuizData = async () => {
  try {
    logger.info('Iniciando inserção de dados do questionário...', { tag: 'Seed' });
    
    // =========================================
    // Inserção dos módulos
    // =========================================
    logger.info('Inserindo módulos...', { tag: 'Seed' });
    
    // Deletar todos os dados existentes primeiro
    const { error: deleteOptionsError } = await supabase
      .from('quiz_options')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteOptionsError) {
      logger.error('Erro ao deletar opções existentes', { tag: 'Seed', data: deleteOptionsError });
    }
    
    const { error: deleteAnswersError } = await supabase
      .from('quiz_answers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteAnswersError) {
      logger.error('Erro ao deletar respostas existentes', { tag: 'Seed', data: deleteAnswersError });
    }
    
    const { error: deleteQuestionsError } = await supabase
      .from('quiz_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteQuestionsError) {
      logger.error('Erro ao deletar perguntas existentes', { tag: 'Seed', data: deleteQuestionsError });
    }
    
    const { error: deleteModulesError } = await supabase
      .from('quiz_modules')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteModulesError) {
      logger.error('Erro ao deletar módulos existentes', { tag: 'Seed', data: deleteModulesError });
    }

    // Inserção dos módulos
    const modules = [
      {
        title: "Informações Gerais",
        description: "Algumas perguntas básicas sobre você e sua empresa",
        order_number: 1
      },
      {
        title: "Objetivos e Valores",
        description: "Entendendo seus objetivos e valores essenciais",
        order_number: 2
      },
      {
        title: "Cultura Organizacional",
        description: "Avaliando a cultura atual da sua empresa",
        order_number: 3
      },
      {
        title: "Liderança",
        description: "Questões sobre estilos e práticas de liderança",
        order_number: 4
      },
      {
        title: "Comunicação",
        description: "Avaliação de fluxos e estratégias de comunicação",
        order_number: 5
      },
      {
        title: "Inovação",
        description: "Explorando como a inovação acontece na sua empresa",
        order_number: 6
      },
      {
        title: "Desempenho",
        description: "Métricas e avaliação de desempenho",
        order_number: 7
      },
      {
        title: "Próximos Passos",
        description: "Planejando as próximas etapas",
        order_number: 8
      }
    ];
    
    const { data: insertedModules, error: modulesError } = await supabase
      .from('quiz_modules')
      .insert(modules as any)
      .select();
      
    if (modulesError) {
      logger.error('Erro ao inserir módulos', { tag: 'Seed', data: modulesError });
      return false;
    }
    
    logger.info(`${insertedModules.length} módulos inseridos com sucesso!`, { tag: 'Seed' });
    
    // =========================================
    // Inserção das perguntas
    // =========================================
    logger.info('Inserindo perguntas...', { tag: 'Seed' });
    
    // Mapeamento de IDs de módulos para uso posterior
    const moduleIdMap: Record<number, string> = {};
    insertedModules.forEach(module => {
      moduleIdMap[module.order_number] = module.id;
    });
    
    // As perguntas do questionário
    const questions = [
      // Módulo 1: Informações Gerais
      {
        module_id: moduleIdMap[1],
        text: "Qual o seu nome completo?",
        type: "text",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[1],
        text: "Qual o seu cargo na empresa?",
        type: "text",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[1],
        text: "Há quanto tempo você trabalha na empresa?",
        type: "radio",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleIdMap[1],
        text: "Qual é o tamanho da sua empresa?",
        type: "radio",
        required: true,
        order_number: 4
      },
      {
        module_id: moduleIdMap[1],
        text: "Em qual setor sua empresa atua?",
        type: "text",
        required: true,
        order_number: 5
      },
      
      // Módulo 2: Objetivos e Valores
      {
        module_id: moduleIdMap[2],
        text: "Quais são os principais objetivos de negócio da sua empresa para os próximos 12 meses?",
        type: "textarea",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[2],
        text: "Sua empresa tem valores claramente definidos?",
        type: "radio",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[2],
        text: "Se sim, quais são os principais valores da empresa?",
        type: "textarea",
        required: false,
        order_number: 3,
        hint: "Se sua empresa não tem valores formalmente definidos, pode pular esta pergunta."
      },
      
      // Módulo 3: Cultura Organizacional
      {
        module_id: moduleIdMap[3],
        text: "Como você descreveria a cultura atual da sua empresa?",
        type: "textarea",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[3],
        text: "Quais aspectos da cultura organizacional você acha que funcionam bem?",
        type: "textarea",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[3],
        text: "Quais aspectos da cultura organizacional você gostaria de melhorar?",
        type: "textarea",
        required: true,
        order_number: 3
      },
      
      // Módulo 4: Liderança
      {
        module_id: moduleIdMap[4],
        text: "Como você classificaria a eficácia da liderança na sua empresa?",
        type: "radio",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[4],
        text: "Quais qualidades de liderança você considera mais importantes para sua empresa?",
        type: "checkbox",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[4],
        text: "Como a liderança na sua empresa poderia ser melhorada?",
        type: "textarea",
        required: true,
        order_number: 3
      },
      
      // Módulo 5: Comunicação
      {
        module_id: moduleIdMap[5],
        text: "Como você avalia a comunicação interna na sua empresa?",
        type: "radio",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[5],
        text: "Quais canais de comunicação são mais utilizados na sua empresa?",
        type: "checkbox",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[5],
        text: "O que poderia ser melhorado na comunicação da empresa?",
        type: "textarea",
        required: true,
        order_number: 3
      },
      
      // Módulo 6: Inovação
      {
        module_id: moduleIdMap[6],
        text: "Sua empresa incentiva a inovação?",
        type: "radio",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[6],
        text: "Quais processos de inovação existem na sua empresa?",
        type: "checkbox",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[6],
        text: "Como a inovação poderia ser mais estimulada na sua organização?",
        type: "textarea",
        required: true,
        order_number: 3
      },
      
      // Módulo 7: Desempenho
      {
        module_id: moduleIdMap[7],
        text: "Sua empresa tem KPIs claramente definidos?",
        type: "radio",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[7],
        text: "Com que frequência o desempenho é avaliado?",
        type: "radio",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[7],
        text: "Quais métricas são mais importantes para seu negócio?",
        type: "textarea",
        required: true,
        order_number: 3,
        hint: "Mencione as principais métricas que você acompanha regularmente"
      },
      
      // Módulo 8: Próximos Passos
      {
        module_id: moduleIdMap[8],
        text: "Quais áreas você gostaria de priorizar para melhorias?",
        type: "checkbox",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[8],
        text: "Como você prefere ser contatado para discutir os resultados deste questionário?",
        type: "radio",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[8],
        text: "Algum comentário adicional ou expectativa sobre este processo de consultoria?",
        type: "textarea",
        required: false,
        order_number: 3
      }
    ];
    
    const { data: insertedQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questions as any)
      .select();
      
    if (questionsError) {
      logger.error('Erro ao inserir perguntas', { tag: 'Seed', data: questionsError });
      return false;
    }
    
    logger.info(`${insertedQuestions.length} perguntas inseridas com sucesso!`, { tag: 'Seed' });
    
    // =========================================
    // Inserção das opções para perguntas de múltipla escolha
    // =========================================
    
    logger.info('Inserindo opções de respostas...', { tag: 'Seed' });
    
    // Mapeamento de perguntas para uso posterior
    const questionMap = new Map();
    
    insertedQuestions.forEach(question => {
      const moduleOrder = insertedModules.find(m => m.id === question.module_id)?.order_number || 0;
      const key = `${moduleOrder}-${question.order_number}`;
      questionMap.set(key, question.id);
    });
    
    // Opções para as perguntas de múltipla escolha
    const options = [
      // Módulo 1, Pergunta 3: Tempo na empresa
      {
        question_id: questionMap.get('1-3'),
        text: "Menos de 1 ano",
        order_number: 1
      },
      {
        question_id: questionMap.get('1-3'),
        text: "1-3 anos",
        order_number: 2
      },
      {
        question_id: questionMap.get('1-3'),
        text: "3-5 anos",
        order_number: 3
      },
      {
        question_id: questionMap.get('1-3'),
        text: "5-10 anos",
        order_number: 4
      },
      {
        question_id: questionMap.get('1-3'),
        text: "Mais de 10 anos",
        order_number: 5
      },
      
      // Módulo 1, Pergunta 4: Tamanho da empresa
      {
        question_id: questionMap.get('1-4'),
        text: "1-10 funcionários",
        order_number: 1
      },
      {
        question_id: questionMap.get('1-4'),
        text: "11-50 funcionários",
        order_number: 2
      },
      {
        question_id: questionMap.get('1-4'),
        text: "51-200 funcionários",
        order_number: 3
      },
      {
        question_id: questionMap.get('1-4'),
        text: "201-500 funcionários",
        order_number: 4
      },
      {
        question_id: questionMap.get('1-4'),
        text: "Mais de 500 funcionários",
        order_number: 5
      },
      
      // Módulo 2, Pergunta 2: Valores definidos
      {
        question_id: questionMap.get('2-2'),
        text: "Sim, temos valores claramente definidos e documentados",
        order_number: 1
      },
      {
        question_id: questionMap.get('2-2'),
        text: "Temos valores informais, mas não documentados",
        order_number: 2
      },
      {
        question_id: questionMap.get('2-2'),
        text: "Não, não temos valores definidos",
        order_number: 3
      },
      
      // Módulo 4, Pergunta 1: Eficácia da liderança
      {
        question_id: questionMap.get('4-1'),
        text: "Extremamente eficaz",
        order_number: 1
      },
      {
        question_id: questionMap.get('4-1'),
        text: "Muito eficaz",
        order_number: 2
      },
      {
        question_id: questionMap.get('4-1'),
        text: "Moderadamente eficaz",
        order_number: 3
      },
      {
        question_id: questionMap.get('4-1'),
        text: "Pouco eficaz",
        order_number: 4
      },
      {
        question_id: questionMap.get('4-1'),
        text: "Nada eficaz",
        order_number: 5
      },
      
      // Módulo 4, Pergunta 2: Qualidades de liderança
      {
        question_id: questionMap.get('4-2'),
        text: "Visão estratégica",
        order_number: 1
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Capacidade de motivar equipes",
        order_number: 2
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Conhecimento técnico",
        order_number: 3
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Habilidades de comunicação",
        order_number: 4
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Inteligência emocional",
        order_number: 5
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Capacidade de resolver problemas",
        order_number: 6
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Foco em resultados",
        order_number: 7
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Capacidade de desenvolver talentos",
        order_number: 8
      },
      
      // Módulo 5, Pergunta 1: Comunicação interna
      {
        question_id: questionMap.get('5-1'),
        text: "Excelente",
        order_number: 1
      },
      {
        question_id: questionMap.get('5-1'),
        text: "Boa",
        order_number: 2
      },
      {
        question_id: questionMap.get('5-1'),
        text: "Regular",
        order_number: 3
      },
      {
        question_id: questionMap.get('5-1'),
        text: "Ruim",
        order_number: 4
      },
      {
        question_id: questionMap.get('5-1'),
        text: "Péssima",
        order_number: 5
      },
      
      // Módulo 5, Pergunta 2: Canais de comunicação
      {
        question_id: questionMap.get('5-2'),
        text: "E-mail",
        order_number: 1
      },
      {
        question_id: questionMap.get('5-2'),
        text: "Reuniões presenciais",
        order_number: 2
      },
      {
        question_id: questionMap.get('5-2'),
        text: "Videoconferências",
        order_number: 3
      },
      {
        question_id: questionMap.get('5-2'),
        text: "Aplicativos de mensagens instantâneas (WhatsApp, Slack, etc.)",
        order_number: 4
      },
      {
        question_id: questionMap.get('5-2'),
        text: "Intranet corporativa",
        order_number: 5
      },
      {
        question_id: questionMap.get('5-2'),
        text: "Quadros de avisos físicos",
        order_number: 6
      },
      {
        question_id: questionMap.get('5-2'),
        text: "Documentos impressos",
        order_number: 7
      },
      
      // Módulo 6, Pergunta 1: Incentivo à inovação
      {
        question_id: questionMap.get('6-1'),
        text: "Sim, fortemente",
        order_number: 1
      },
      {
        question_id: questionMap.get('6-1'),
        text: "Sim, moderadamente",
        order_number: 2
      },
      {
        question_id: questionMap.get('6-1'),
        text: "Apenas em algumas áreas",
        order_number: 3
      },
      {
        question_id: questionMap.get('6-1'),
        text: "Muito pouco",
        order_number: 4
      },
      {
        question_id: questionMap.get('6-1'),
        text: "Não incentiva",
        order_number: 5
      },
      
      // Módulo 6, Pergunta 2: Processos de inovação
      {
        question_id: questionMap.get('6-2'),
        text: "Programas de sugestões de funcionários",
        order_number: 1
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Hackathons ou sprints de inovação",
        order_number: 2
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Parcerias com startups ou universidades",
        order_number: 3
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Departamento ou equipe dedicada à inovação",
        order_number: 4
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Tempo alocado para projetos paralelos",
        order_number: 5
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Recompensas por ideias inovadoras",
        order_number: 6
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Não temos processos formais de inovação",
        order_number: 7
      },
      
      // Módulo 7, Pergunta 1: KPIs definidos
      {
        question_id: questionMap.get('7-1'),
        text: "Sim, muito bem definidos e implementados",
        order_number: 1
      },
      {
        question_id: questionMap.get('7-1'),
        text: "Sim, mas precisam de melhorias",
        order_number: 2
      },
      {
        question_id: questionMap.get('7-1'),
        text: "Apenas para algumas áreas",
        order_number: 3
      },
      {
        question_id: questionMap.get('7-1'),
        text: "Não, mas estamos desenvolvendo",
        order_number: 4
      },
      {
        question_id: questionMap.get('7-1'),
        text: "Não temos KPIs definidos",
        order_number: 5
      },
      
      // Módulo 7, Pergunta 2: Frequência de avaliação
      {
        question_id: questionMap.get('7-2'),
        text: "Semanalmente",
        order_number: 1
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Mensalmente",
        order_number: 2
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Trimestralmente",
        order_number: 3
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Semestralmente",
        order_number: 4
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Anualmente",
        order_number: 5
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Não avaliamos regularmente",
        order_number: 6
      },
      
      // Módulo 8, Pergunta 1: Áreas para melhoria
      {
        question_id: questionMap.get('8-1'),
        text: "Liderança",
        order_number: 1
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Cultura organizacional",
        order_number: 2
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Processos internos",
        order_number: 3
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Comunicação",
        order_number: 4
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Inovação",
        order_number: 5
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Gestão de desempenho",
        order_number: 6
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Desenvolvimento de equipes",
        order_number: 7
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Estratégia de negócios",
        order_number: 8
      },
      
      // Módulo 8, Pergunta 2: Contato preferido
      {
        question_id: questionMap.get('8-2'),
        text: "E-mail",
        order_number: 1
      },
      {
        question_id: questionMap.get('8-2'),
        text: "Telefone",
        order_number: 2
      },
      {
        question_id: questionMap.get('8-2'),
        text: "Videoconferência",
        order_number: 3
      },
      {
        question_id: questionMap.get('8-2'),
        text: "Reunião presencial",
        order_number: 4
      },
      {
        question_id: questionMap.get('8-2'),
        text: "WhatsApp ou outro mensageiro",
        order_number: 5
      }
    ];
    
    const { data: insertedOptions, error: optionsError } = await supabase
      .from('quiz_options')
      .insert(options as any)
      .select();
      
    if (optionsError) {
      logger.error('Erro ao inserir opções', { tag: 'Seed', data: optionsError });
      return false;
    }
    
    logger.info(`${insertedOptions.length} opções inseridas com sucesso!`, { tag: 'Seed' });
    
    return true;
  } catch (error) {
    logger.error('Erro ao inserir dados do questionário', { tag: 'Seed', data: error });
    return false;
  }
};
