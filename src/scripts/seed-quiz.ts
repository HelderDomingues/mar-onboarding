
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { logger } from "@/utils/logger";

// Função principal para inserção dos dados
export const seedQuizData = async () => {
  try {
    logger.info('Iniciando inserção de dados do questionário MAR...', { tag: 'Seed' });
    
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

    // Inserção dos módulos do questionário MAR
    const modules = [
      {
        title: "Informações Pessoais",
        description: "Informações básicas de contato",
        order_number: 1
      },
      {
        title: "Perfil Comportamental",
        description: "Questões sobre seu perfil e características",
        order_number: 2
      },
      {
        title: "Perfil da Empresa e Mercado",
        description: "Informações sobre sua empresa e o mercado de atuação",
        order_number: 3
      },
      {
        title: "Perfil dos Clientes",
        description: "Informações sobre seu público-alvo",
        order_number: 4
      },
      {
        title: "Concorrentes",
        description: "Análise da concorrência",
        order_number: 5
      },
      {
        title: "Marketing e Vendas",
        description: "Estratégias de marketing e vendas",
        order_number: 6
      },
      {
        title: "Objetivos e Desafios",
        description: "Metas e desafios do negócio",
        order_number: 7
      },
      {
        title: "Recursos Necessários",
        description: "Recursos para crescimento da empresa",
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
    
    // As perguntas do questionário MAR
    const questions = [
      // Módulo 1: Informações Pessoais
      {
        module_id: moduleIdMap[1],
        text: "Nome:",
        type: "text",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[1],
        text: "Sobrenome:",
        type: "text",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[1],
        text: "Telefone/Whatsapp:",
        type: "text",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleIdMap[1],
        text: "E-mail:",
        type: "email",
        required: true,
        order_number: 4
      },
      
      // Módulo 2: Perfil Comportamental
      {
        module_id: moduleIdMap[2],
        text: "Nome da Empresa:",
        type: "text",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[2],
        text: "Qual das seguintes características melhor descreve você?",
        type: "radio",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[2],
        text: "Para você, alcançar resultados exige principalmente:",
        type: "radio",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleIdMap[2],
        text: "Quando se trata de tomar decisões, você prefere:",
        type: "radio",
        required: true,
        order_number: 4
      },
      {
        module_id: moduleIdMap[2],
        text: "Em um dia ideal de trabalho, você se sente mais realizado quando:",
        type: "radio",
        required: true,
        order_number: 5
      },
      {
        module_id: moduleIdMap[2],
        text: "Qual destas opções melhor reflete sua abordagem frente a desafios?",
        type: "radio",
        required: true,
        order_number: 6
      },
      {
        module_id: moduleIdMap[2],
        text: "Como você acredita que sua personalidade influencia o sucesso do seu negócio?",
        type: "radio",
        required: true,
        order_number: 7
      },
      
      // Módulo 3: Perfil da Empresa e Mercado
      {
        module_id: moduleIdMap[3],
        text: "Nome da Empresa:",
        type: "text",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[3],
        text: "CNPJ:",
        type: "text",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[3],
        text: "Endereço:",
        type: "text",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleIdMap[3],
        text: "Qual a área geral de atuação da sua empresa?",
        type: "radio",
        required: true,
        order_number: 4
      },
      {
        module_id: moduleIdMap[3],
        text: "Descreva, brevemente, sua empresa. O que ela vende, produz ou qual serviço presta?",
        type: "textarea",
        required: true,
        order_number: 5
      },
      {
        module_id: moduleIdMap[3],
        text: "Sua empresa tem um website?",
        type: "radio",
        required: true,
        order_number: 6
      },
      {
        module_id: moduleIdMap[3],
        text: "Se sua empresa tem um website, digite o domínio (endereço na web):",
        type: "text",
        required: false,
        order_number: 7,
        hint: "Somente se você respondeu 'Sim' na pergunta anterior"
      },
      {
        module_id: moduleIdMap[3],
        text: "Instagram da empresa:",
        type: "text",
        required: false,
        order_number: 8
      },
      {
        module_id: moduleIdMap[3],
        text: "Tempo de Atuação no Mercado:",
        type: "radio",
        required: true,
        order_number: 9
      },
      {
        module_id: moduleIdMap[3],
        text: "Faturamento Mensal Aproximado:",
        type: "radio",
        required: true,
        order_number: 10
      },
      {
        module_id: moduleIdMap[3],
        text: "Número de Funcionários:",
        type: "radio",
        required: true,
        order_number: 11
      },
      {
        module_id: moduleIdMap[3],
        text: "Como você avalia o potencial de crescimento do seu negócio nos próximos 12 meses?",
        type: "radio",
        required: true,
        order_number: 12
      },
      {
        module_id: moduleIdMap[3],
        text: "Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?",
        type: "checkbox",
        required: true,
        order_number: 13,
        hint: "Marque todas que se aplicam"
      },
      
      // Módulo 4: Perfil dos Clientes
      {
        module_id: moduleIdMap[4],
        text: "Qual a faixa etária predominante dos seus clientes?",
        type: "radio",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[4],
        text: "Qual o gênero predominante dos seus clientes?",
        type: "radio",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleIdMap[4],
        text: "Qual a renda familiar média dos seus clientes?",
        type: "radio",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleIdMap[4],
        text: "Qual o nível de escolaridade predominante dos seus clientes?",
        type: "radio",
        required: true,
        order_number: 4
      },
      {
        module_id: moduleIdMap[4],
        text: "Com que frequência seus clientes compram seus produtos/serviços?",
        type: "radio",
        required: true,
        order_number: 5
      },
      {
        module_id: moduleIdMap[4],
        text: "Onde seus clientes costumam procurar informações sobre produtos/serviços semelhantes aos seus?",
        type: "checkbox",
        required: true,
        order_number: 6,
        hint: "Marque todas que se aplicam"
      },
      
      // Módulo 5: Concorrentes
      {
        module_id: moduleIdMap[5],
        text: "Concorrente A:",
        type: "text",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleIdMap[5],
        text: "Instagram Concorrente A:",
        type: "text",
        required: false,
        order_number: 2
      },
      {
        module_id: moduleIdMap[5],
        text: "Concorrente B:",
        type: "text",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleIdMap[5],
        text: "Instagram Concorrente B:",
        type: "text",
        required: false,
        order_number: 4
      },
      {
        module_id: moduleIdMap[5],
        text: "Concorrente C:",
        type: "text",
        required: true,
        order_number: 5
      },
      {
        module_id: moduleIdMap[5],
        text: "Instagram Concorrente C:",
        type: "text",
        required: false,
        order_number: 6
      },
      
      // Módulo 6: Marketing e Vendas
      {
        module_id: moduleIdMap[6],
        text: "Quais são os principais canais de venda utilizados?",
        type: "checkbox",
        required: true,
        order_number: 1,
        hint: "Marque todas que se aplicam"
      },
      {
        module_id: moduleIdMap[6],
        text: "Qual o grau de utilização das seguintes ferramentas digitais em sua empresa?",
        type: "checkbox",
        required: true,
        order_number: 2,
        hint: "Marque todas que se aplicam"
      },
      {
        module_id: moduleIdMap[6],
        text: "Qual o investimento mensal em marketing que você faz hoje, ou pretende fazer ao longo do ano?",
        type: "radio",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleIdMap[6],
        text: "Como você mede a satisfação dos seus clientes?",
        type: "checkbox",
        required: true,
        order_number: 4,
        hint: "Marque todas que se aplicam"
      },
      
      // Módulo 7: Objetivos e Desafios
      {
        module_id: moduleIdMap[7],
        text: "Quais são os principais objetivos da empresa para os próximos 12 meses?",
        type: "checkbox",
        required: true,
        order_number: 1,
        hint: "Marque todas que se aplicam"
      },
      {
        module_id: moduleIdMap[7],
        text: "Quais são os maiores desafios que você enfrenta para crescer seu negócio?",
        type: "checkbox",
        required: true,
        order_number: 2,
        hint: "Marque todas que se aplicam"
      },
      
      // Módulo 8: Recursos Necessários
      {
        module_id: moduleIdMap[8],
        text: "Quais recursos você considera mais importantes para o crescimento da sua empresa?",
        type: "checkbox",
        required: true,
        order_number: 1,
        hint: "Marque todas que se aplicam"
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
      // Módulo 2: Perfil Comportamental
      // Pergunta: Qual das seguintes características melhor descreve você?
      {
        question_id: questionMap.get('2-2'),
        text: "I – Idealista, criativo e visionário.",
        order_number: 1
      },
      {
        question_id: questionMap.get('2-2'),
        text: "C – Comunicativo, amigável e colaborativo.",
        order_number: 2
      },
      {
        question_id: questionMap.get('2-2'),
        text: "O – Organizado, meticuloso e confiável.",
        order_number: 3
      },
      {
        question_id: questionMap.get('2-2'),
        text: "A – Ambicioso, focado e determinado.",
        order_number: 4
      },
      
      // Pergunta: Para você, alcançar resultados exige principalmente:
      {
        question_id: questionMap.get('2-3'),
        text: "I – Inovação e liberdade para explorar novas ideias.",
        order_number: 1
      },
      {
        question_id: questionMap.get('2-3'),
        text: "C – Um ambiente harmonioso e colaboração com a equipe.",
        order_number: 2
      },
      {
        question_id: questionMap.get('2-3'),
        text: "O – Planejamento e controle rigoroso dos detalhes.",
        order_number: 3
      },
      {
        question_id: questionMap.get('2-3'),
        text: "A – Foco, disciplina e ação decidida.",
        order_number: 4
      },
      
      // Pergunta: Quando se trata de tomar decisões, você prefere:
      {
        question_id: questionMap.get('2-4'),
        text: "I – Arriscar e experimentar novas abordagens.",
        order_number: 1
      },
      {
        question_id: questionMap.get('2-4'),
        text: "C – Buscar consenso e ouvir opiniões diversas.",
        order_number: 2
      },
      {
        question_id: questionMap.get('2-4'),
        text: "O – Analisar cuidadosamente todas as informações.",
        order_number: 3
      },
      {
        question_id: questionMap.get('2-4'),
        text: "A – Agir rapidamente com firmeza.",
        order_number: 4
      },
      
      // Pergunta: Em um dia ideal de trabalho, você se sente mais realizado quando:
      {
        question_id: questionMap.get('2-5'),
        text: "I – Tem a oportunidade de criar e inovar.",
        order_number: 1
      },
      {
        question_id: questionMap.get('2-5'),
        text: "C – Conecta-se e colabora com outras pessoas.",
        order_number: 2
      },
      {
        question_id: questionMap.get('2-5'),
        text: "O – Segue um plano bem definido e atinge metas com precisão.",
        order_number: 3
      },
      {
        question_id: questionMap.get('2-5'),
        text: "A – Conquista desafios e lidera projetos com sucesso.",
        order_number: 4
      },
      
      // Pergunta: Qual destas opções melhor reflete sua abordagem frente a desafios?
      {
        question_id: questionMap.get('2-6'),
        text: "I – Encarar os desafios como oportunidades para inovar.",
        order_number: 1
      },
      {
        question_id: questionMap.get('2-6'),
        text: "C – Resolver desafios buscando apoio e mantendo o ambiente positivo.",
        order_number: 2
      },
      {
        question_id: questionMap.get('2-6'),
        text: "O – Planejar e minimizar riscos para garantir que tudo funcione.",
        order_number: 3
      },
      {
        question_id: questionMap.get('2-6'),
        text: "A – Tomar decisões rápidas e assertivas para superar obstáculos.",
        order_number: 4
      },
      
      // Pergunta: Como você acredita que sua personalidade influencia o sucesso do seu negócio?
      {
        question_id: questionMap.get('2-7'),
        text: "I – Minha criatividade e visão de futuro me permitem identificar oportunidades únicas.",
        order_number: 1
      },
      {
        question_id: questionMap.get('2-7'),
        text: "C – Minha habilidade de criar relações fortalece a cultura e a rede de contatos.",
        order_number: 2
      },
      {
        question_id: questionMap.get('2-7'),
        text: "O – Minha organização e precisão garantem a solidez dos processos.",
        order_number: 3
      },
      {
        question_id: questionMap.get('2-7'),
        text: "A – Minha determinação e foco impulsionam resultados consistentes.",
        order_number: 4
      },
      
      // Módulo 3: Perfil da Empresa e Mercado
      // Pergunta: Qual a área geral de atuação da sua empresa?
      {
        question_id: questionMap.get('3-4'),
        text: "Indústria",
        order_number: 1
      },
      {
        question_id: questionMap.get('3-4'),
        text: "Comércio",
        order_number: 2
      },
      {
        question_id: questionMap.get('3-4'),
        text: "Serviços",
        order_number: 3
      },
      {
        question_id: questionMap.get('3-4'),
        text: "Outros",
        order_number: 4
      },
      
      // Pergunta: Sua empresa tem um website?
      {
        question_id: questionMap.get('3-6'),
        text: "Sim",
        order_number: 1
      },
      {
        question_id: questionMap.get('3-6'),
        text: "Não",
        order_number: 2
      },
      
      // Pergunta: Tempo de Atuação no Mercado
      {
        question_id: questionMap.get('3-9'),
        text: "Menos de 1 ano",
        order_number: 1
      },
      {
        question_id: questionMap.get('3-9'),
        text: "1-3 anos",
        order_number: 2
      },
      {
        question_id: questionMap.get('3-9'),
        text: "3-5 anos",
        order_number: 3
      },
      {
        question_id: questionMap.get('3-9'),
        text: "5-10 anos",
        order_number: 4
      },
      {
        question_id: questionMap.get('3-9'),
        text: "Mais de 10 anos",
        order_number: 5
      },
      
      // Pergunta: Faturamento Mensal Aproximado
      {
        question_id: questionMap.get('3-10'),
        text: "Até R$ 20.000",
        order_number: 1
      },
      {
        question_id: questionMap.get('3-10'),
        text: "R$ 20.000 - R$ 100.000",
        order_number: 2
      },
      {
        question_id: questionMap.get('3-10'),
        text: "R$ 100.000 - R$ 500.000",
        order_number: 3
      },
      {
        question_id: questionMap.get('3-10'),
        text: "Acima de R$ 500.000",
        order_number: 4
      },
      
      // Pergunta: Número de Funcionários
      {
        question_id: questionMap.get('3-11'),
        text: "1-10",
        order_number: 1
      },
      {
        question_id: questionMap.get('3-11'),
        text: "11-50",
        order_number: 2
      },
      {
        question_id: questionMap.get('3-11'),
        text: "51-100",
        order_number: 3
      },
      {
        question_id: questionMap.get('3-11'),
        text: "Mais de 100",
        order_number: 4
      },
      
      // Pergunta: Como você avalia o potencial de crescimento do seu negócio
      {
        question_id: questionMap.get('3-12'),
        text: "Muito baixo",
        order_number: 1
      },
      {
        question_id: questionMap.get('3-12'),
        text: "Baixo",
        order_number: 2
      },
      {
        question_id: questionMap.get('3-12'),
        text: "Médio",
        order_number: 3
      },
      {
        question_id: questionMap.get('3-12'),
        text: "Alto",
        order_number: 4
      },
      
      // Pergunta: Motivo que faz clientes escolherem sua empresa
      {
        question_id: questionMap.get('3-13'),
        text: "Preço mais baixo",
        order_number: 1
      },
      {
        question_id: questionMap.get('3-13'),
        text: "Melhor qualidade",
        order_number: 2
      },
      {
        question_id: questionMap.get('3-13'),
        text: "Atendimento personalizado",
        order_number: 3
      },
      {
        question_id: questionMap.get('3-13'),
        text: "Maior variedade de produtos",
        order_number: 4
      },
      {
        question_id: questionMap.get('3-13'),
        text: "Localização",
        order_number: 5
      },
      {
        question_id: questionMap.get('3-13'),
        text: "Outros",
        order_number: 6
      },
      
      // Módulo 4: Perfil dos Clientes
      // Pergunta: Faixa etária predominante
      {
        question_id: questionMap.get('4-1'),
        text: "Abaixo de 18 anos",
        order_number: 1
      },
      {
        question_id: questionMap.get('4-1'),
        text: "18-25 anos",
        order_number: 2
      },
      {
        question_id: questionMap.get('4-1'),
        text: "26-35 anos",
        order_number: 3
      },
      {
        question_id: questionMap.get('4-1'),
        text: "36-45 anos",
        order_number: 4
      },
      {
        question_id: questionMap.get('4-1'),
        text: "46-55 anos",
        order_number: 5
      },
      {
        question_id: questionMap.get('4-1'),
        text: "Acima de 55 anos",
        order_number: 6
      },
      {
        question_id: questionMap.get('4-1'),
        text: "Todas as faixas etárias",
        order_number: 7
      },
      
      // Pergunta: Gênero predominante
      {
        question_id: questionMap.get('4-2'),
        text: "Masculino",
        order_number: 1
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Feminino",
        order_number: 2
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Ambos",
        order_number: 3
      },
      {
        question_id: questionMap.get('4-2'),
        text: "Não Binário",
        order_number: 4
      },
      
      // Pergunta: Renda familiar média
      {
        question_id: questionMap.get('4-3'),
        text: "Até R$ 2.000",
        order_number: 1
      },
      {
        question_id: questionMap.get('4-3'),
        text: "R$ 2.001 - R$ 4.000",
        order_number: 2
      },
      {
        question_id: questionMap.get('4-3'),
        text: "R$ 4.001 - R$ 8.000",
        order_number: 3
      },
      {
        question_id: questionMap.get('4-3'),
        text: "R$ 8.001 - R$ 15.000",
        order_number: 4
      },
      {
        question_id: questionMap.get('4-3'),
        text: "R$ 15.001 - R$ 30.000",
        order_number: 5
      },
      {
        question_id: questionMap.get('4-3'),
        text: "Acima de R$ 30.000",
        order_number: 6
      },
      
      // Pergunta: Nível de escolaridade
      {
        question_id: questionMap.get('4-4'),
        text: "Ensino fundamental",
        order_number: 1
      },
      {
        question_id: questionMap.get('4-4'),
        text: "Ensino médio",
        order_number: 2
      },
      {
        question_id: questionMap.get('4-4'),
        text: "Superior incompleto",
        order_number: 3
      },
      {
        question_id: questionMap.get('4-4'),
        text: "Superior completo",
        order_number: 4
      },
      {
        question_id: questionMap.get('4-4'),
        text: "Pós-graduação",
        order_number: 5
      },
      
      // Pergunta: Frequência de compra
      {
        question_id: questionMap.get('4-5'),
        text: "Diariamente",
        order_number: 1
      },
      {
        question_id: questionMap.get('4-5'),
        text: "Semanalmente",
        order_number: 2
      },
      {
        question_id: questionMap.get('4-5'),
        text: "Mensalmente",
        order_number: 3
      },
      {
        question_id: questionMap.get('4-5'),
        text: "Anualmente",
        order_number: 4
      },
      {
        question_id: questionMap.get('4-5'),
        text: "Ocasionalmente",
        order_number: 5
      },
      
      // Pergunta: Onde buscam informações
      {
        question_id: questionMap.get('4-6'),
        text: "Redes sociais",
        order_number: 1
      },
      {
        question_id: questionMap.get('4-6'),
        text: "Sites de busca",
        order_number: 2
      },
      {
        question_id: questionMap.get('4-6'),
        text: "Indicações de amigos e familiares",
        order_number: 3
      },
      {
        question_id: questionMap.get('4-6'),
        text: "Revistas e jornais",
        order_number: 4
      },
      {
        question_id: questionMap.get('4-6'),
        text: "Influenciadores digitais",
        order_number: 5
      },
      
      // Módulo 6: Marketing e Vendas
      // Pergunta: Canais de venda
      {
        question_id: questionMap.get('6-1'),
        text: "Loja física",
        order_number: 1
      },
      {
        question_id: questionMap.get('6-1'),
        text: "E-commerce",
        order_number: 2
      },
      {
        question_id: questionMap.get('6-1'),
        text: "Redes sociais",
        order_number: 3
      },
      {
        question_id: questionMap.get('6-1'),
        text: "Venda direta",
        order_number: 4
      },
      {
        question_id: questionMap.get('6-1'),
        text: "Outros",
        order_number: 5
      },
      
      // Pergunta: Ferramentas digitais
      {
        question_id: questionMap.get('6-2'),
        text: "Redes sociais para divulgação",
        order_number: 1
      },
      {
        question_id: questionMap.get('6-2'),
        text: "E-commerce",
        order_number: 2
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Sistemas de gestão (ERP, CRM)",
        order_number: 3
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Ferramentas de marketing digital (Google Analytics, etc.)",
        order_number: 4
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Pagamentos online",
        order_number: 5
      },
      {
        question_id: questionMap.get('6-2'),
        text: "Outros",
        order_number: 6
      },
      
      // Pergunta: Investimento em marketing
      {
        question_id: questionMap.get('6-3'),
        text: "Não invisto nada em marketing, atualmente",
        order_number: 1
      },
      {
        question_id: questionMap.get('6-3'),
        text: "Até R$ 500",
        order_number: 2
      },
      {
        question_id: questionMap.get('6-3'),
        text: "R$ 501 - R$ 1.000",
        order_number: 3
      },
      {
        question_id: questionMap.get('6-3'),
        text: "R$ 1.001 - R$ 5.000",
        order_number: 4
      },
      {
        question_id: questionMap.get('6-3'),
        text: "Acima de R$ 5.000",
        order_number: 5
      },
      
      // Pergunta: Medição de satisfação
      {
        question_id: questionMap.get('6-4'),
        text: "Pesquisas de satisfação",
        order_number: 1
      },
      {
        question_id: questionMap.get('6-4'),
        text: "Análise de redes sociais",
        order_number: 2
      },
      {
        question_id: questionMap.get('6-4'),
        text: "Indicadores de desempenho (KPIs)",
        order_number: 3
      },
      {
        question_id: questionMap.get('6-4'),
        text: "Frequência de compra/visita",
        order_number: 4
      },
      {
        question_id: questionMap.get('6-4'),
        text: "Outros",
        order_number: 5
      },
      
      // Módulo 7: Objetivos e Desafios
      // Pergunta: Objetivos da empresa
      {
        question_id: questionMap.get('7-1'),
        text: "Aumentar o faturamento",
        order_number: 1
      },
      {
        question_id: questionMap.get('7-1'),
        text: "Expandir a equipe",
        order_number: 2
      },
      {
        question_id: questionMap.get('7-1'),
        text: "Lançar novos produtos/serviços",
        order_number: 3
      },
      {
        question_id: questionMap.get('7-1'),
        text: "Melhorar a experiência do cliente",
        order_number: 4
      },
      {
        question_id: questionMap.get('7-1'),
        text: "Outros",
        order_number: 5
      },
      
      // Pergunta: Desafios para crescer
      {
        question_id: questionMap.get('7-2'),
        text: "Dificuldade em obter financiamento",
        order_number: 1
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Falta de tempo para gestão",
        order_number: 2
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Concorrência acirrada",
        order_number: 3
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Dificuldade em encontrar mão de obra qualificada",
        order_number: 4
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Falta de conhecimento em marketing digital",
        order_number: 5
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Dificuldade em inovar",
        order_number: 6
      },
      {
        question_id: questionMap.get('7-2'),
        text: "Outros",
        order_number: 7
      },
      
      // Módulo 8: Recursos Necessários
      // Pergunta: Recursos importantes
      {
        question_id: questionMap.get('8-1'),
        text: "Capital",
        order_number: 1
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Tecnologia",
        order_number: 2
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Equipe qualificada",
        order_number: 3
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Parcerias",
        order_number: 4
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Mentoria",
        order_number: 5
      },
      {
        question_id: questionMap.get('8-1'),
        text: "Outros",
        order_number: 6
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
