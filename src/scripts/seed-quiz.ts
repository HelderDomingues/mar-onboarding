
import { supabase } from "../integrations/supabase/client";

// Script para inserir os dados do questionário no Supabase
export async function seedQuizData() {
  try {
    // 1. Inserir módulos do questionário
    const modules = [
      {
        title: "Informações Pessoais",
        description: "Informações básicas de contato",
        order_number: 1
      },
      {
        title: "Módulo 1: Perfil Comportamental",
        description: "Entenda melhor o seu perfil de comportamento",
        order_number: 2
      },
      {
        title: "Módulo 2: Perfil da Empresa e Mercado",
        description: "Informações sobre sua empresa e seu mercado de atuação",
        order_number: 3
      },
      {
        title: "Módulo 3: Perfil dos Clientes",
        description: "Caracterização do seu público-alvo",
        order_number: 4
      },
      {
        title: "Módulo 4: Concorrentes",
        description: "Informações sobre seus principais concorrentes",
        order_number: 5
      },
      {
        title: "Módulo 5: Marketing e Vendas",
        description: "Estratégias e investimentos em marketing e vendas",
        order_number: 6
      },
      {
        title: "Módulo 6: Objetivos e Desafios",
        description: "Metas e obstáculos para o crescimento do seu negócio",
        order_number: 7
      },
      {
        title: "Módulo 7: Recursos Necessários",
        description: "Recursos que você considera importantes para o crescimento",
        order_number: 8
      }
    ];
    
    const { error: modulesError } = await supabase
      .from('quiz_modules')
      .upsert(modules, { onConflict: 'order_number' });
      
    if (modulesError) throw modulesError;
    console.log("✅ Módulos inseridos com sucesso");
    
    // 2. Buscar os módulos inseridos para obter os IDs
    const { data: insertedModules, error: fetchError } = await supabase
      .from('quiz_modules')
      .select('*')
      .order('order_number');
      
    if (fetchError) throw fetchError;
    if (!insertedModules) throw new Error("Nenhum módulo encontrado");
    
    // 3. Inserir as perguntas com base nos módulos inseridos
    const moduleMap: Record<number, string> = {};
    insertedModules.forEach(module => {
      moduleMap[module.order_number] = module.id;
    });
    
    // Definir as perguntas para cada módulo
    const questions = [
      // Módulo 1: Informações Pessoais
      {
        module_id: moduleMap[1],
        text: "Nome:",
        type: "text",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleMap[1],
        text: "Sobrenome:",
        type: "text",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleMap[1],
        text: "Telefone/Whatsapp:",
        type: "text",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleMap[1],
        text: "E-mail:",
        type: "email",
        required: true,
        order_number: 4
      },
      
      // Módulo 2: Perfil Comportamental
      {
        module_id: moduleMap[2],
        text: "Nome da Empresa:",
        type: "text",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleMap[2],
        text: "Qual das seguintes características melhor descreve você?",
        type: "radio",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleMap[2],
        text: "Para você, alcançar resultados exige principalmente:",
        type: "radio",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleMap[2],
        text: "Quando se trata de tomar decisões, você prefere:",
        type: "radio",
        required: true,
        order_number: 4
      },
      {
        module_id: moduleMap[2],
        text: "Em um dia ideal de trabalho, você se sente mais realizado quando:",
        type: "radio",
        required: true,
        order_number: 5
      },
      {
        module_id: moduleMap[2],
        text: "Qual destas opções melhor reflete sua abordagem frente a desafios?",
        type: "radio",
        required: true,
        order_number: 6
      },
      {
        module_id: moduleMap[2],
        text: "Como você acredita que sua personalidade influencia o sucesso do seu negócio?",
        type: "radio",
        required: true,
        order_number: 7
      },
      
      // Módulo 3: Perfil da Empresa e Mercado
      {
        module_id: moduleMap[3],
        text: "Nome da Empresa:",
        type: "text",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleMap[3],
        text: "CNPJ:",
        type: "text",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleMap[3],
        text: "Endereço:",
        type: "textarea",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleMap[3],
        text: "Qual a área geral de atuação da sua empresa?",
        type: "radio",
        required: true,
        order_number: 4
      },
      {
        module_id: moduleMap[3],
        text: "Descreva, brevemente, sua empresa. O que ela vende, produz ou qual serviço presta?",
        type: "textarea",
        required: true,
        order_number: 5
      },
      {
        module_id: moduleMap[3],
        text: "Sua empresa tem um website?",
        type: "radio",
        required: true,
        order_number: 6
      },
      {
        module_id: moduleMap[3],
        text: "Se sua empresa tem um website, digite o domínio (endereço na web):",
        type: "text",
        required: false,
        order_number: 7
      },
      {
        module_id: moduleMap[3],
        text: "Instagram da empresa:",
        type: "text",
        required: false,
        order_number: 8
      },
      {
        module_id: moduleMap[3],
        text: "Tempo de Atuação no Mercado:",
        type: "radio",
        required: true,
        order_number: 9
      },
      {
        module_id: moduleMap[3],
        text: "Faturamento Mensal Aproximado:",
        type: "radio",
        required: true,
        order_number: 10
      },
      {
        module_id: moduleMap[3],
        text: "Número de Funcionários:",
        type: "radio",
        required: true,
        order_number: 11
      },
      {
        module_id: moduleMap[3],
        text: "Como você avalia o potencial de crescimento do seu negócio nos próximos 12 meses?",
        type: "radio",
        required: true,
        order_number: 12
      },
      {
        module_id: moduleMap[3],
        text: "Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?",
        type: "checkbox",
        required: true,
        order_number: 13
      },
      
      // Módulo 4: Perfil dos Clientes
      {
        module_id: moduleMap[4],
        text: "Qual a faixa etária predominante dos seus clientes?",
        type: "radio",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleMap[4],
        text: "Qual o gênero predominante dos seus clientes?",
        type: "radio",
        required: true,
        order_number: 2
      },
      {
        module_id: moduleMap[4],
        text: "Qual a renda familiar média dos seus clientes?",
        type: "radio",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleMap[4],
        text: "Qual o nível de escolaridade predominante dos seus clientes?",
        type: "radio",
        required: true,
        order_number: 4
      },
      {
        module_id: moduleMap[4],
        text: "Com que frequência seus clientes compram seus produtos/serviços?",
        type: "radio",
        required: true,
        order_number: 5
      },
      {
        module_id: moduleMap[4],
        text: "Onde seus clientes costumam procurar informações sobre produtos/serviços semelhantes aos seus?",
        type: "checkbox",
        required: true,
        order_number: 6
      },
      {
        module_id: moduleMap[4],
        text: "O que mais importa para seus clientes na hora de escolher seus produtos/serviços?",
        type: "checkbox",
        required: true,
        hint: "Marque as 3 opções mais importantes",
        order_number: 7
      },
      
      // Módulo 5: Concorrentes
      {
        module_id: moduleMap[5],
        text: "Concorrente A:",
        type: "text",
        required: true,
        order_number: 1
      },
      {
        module_id: moduleMap[5],
        text: "Instagram Concorrente A:",
        type: "text",
        required: false,
        order_number: 2
      },
      {
        module_id: moduleMap[5],
        text: "Concorrente B:",
        type: "text",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleMap[5],
        text: "Instagram Concorrente B:",
        type: "text",
        required: false,
        order_number: 4
      },
      {
        module_id: moduleMap[5],
        text: "Concorrente C:",
        type: "text",
        required: true,
        order_number: 5
      },
      {
        module_id: moduleMap[5],
        text: "Instagram Concorrente C:",
        type: "text",
        required: false,
        order_number: 6
      },
      
      // Módulo 6: Marketing e Vendas
      {
        module_id: moduleMap[6],
        text: "Quais são os principais canais de venda utilizados?",
        type: "checkbox",
        required: true,
        hint: "Marque todas que se aplicam",
        order_number: 1
      },
      {
        module_id: moduleMap[6],
        text: "Qual o grau de utilização das seguintes ferramentas digitais em sua empresa?",
        type: "checkbox",
        required: true,
        hint: "Marque todas que se aplicam",
        order_number: 2
      },
      {
        module_id: moduleMap[6],
        text: "Qual o investimento mensal em marketing que você faz hoje, ou pretende fazer ao longo do ano?",
        type: "radio",
        required: true,
        order_number: 3
      },
      {
        module_id: moduleMap[6],
        text: "Como você mede a satisfação dos seus clientes?",
        type: "checkbox",
        required: true,
        hint: "Marque todas que se aplicam",
        order_number: 4
      },
      
      // Módulo 7: Objetivos e Desafios
      {
        module_id: moduleMap[7],
        text: "Quais são os principais objetivos da empresa para os próximos 12 meses?",
        type: "checkbox",
        required: true,
        hint: "Marque todas que se aplicam",
        order_number: 1
      },
      {
        module_id: moduleMap[7],
        text: "Quais são os maiores desafios que você enfrenta para crescer seu negócio?",
        type: "checkbox",
        required: true,
        hint: "Marque todas que se aplicam",
        order_number: 2
      },
      
      // Módulo 8: Recursos Necessários
      {
        module_id: moduleMap[8],
        text: "Quais recursos você considera mais importantes para o crescimento da sua empresa?",
        type: "checkbox",
        required: true,
        hint: "Marque todas que se aplicam",
        order_number: 1
      }
    ];
    
    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .upsert(questions);
      
    if (questionsError) throw questionsError;
    console.log("✅ Perguntas inseridas com sucesso");
    
    // 4. Buscar as perguntas inseridas para adicionar opções
    const { data: insertedQuestions, error: fetchQuestionsError } = await supabase
      .from('quiz_questions')
      .select('*');
      
    if (fetchQuestionsError) throw fetchQuestionsError;
    if (!insertedQuestions) throw new Error("Nenhuma pergunta encontrada");
    
    // 5. Mapear as perguntas por texto para facilitar a adição de opções
    const questionMap: Record<string, string> = {};
    insertedQuestions.forEach(question => {
      questionMap[question.text] = question.id;
    });
    
    // 6. Adicionar opções para perguntas de múltipla escolha
    const options = [
      // Perfil Comportamental
      {
        question_id: questionMap["Qual das seguintes características melhor descreve você?"],
        text: "I – Idealista, criativo e visionário.",
        order_number: 1
      },
      {
        question_id: questionMap["Qual das seguintes características melhor descreve você?"],
        text: "C – Comunicativo, amigável e colaborativo.",
        order_number: 2
      },
      {
        question_id: questionMap["Qual das seguintes características melhor descreve você?"],
        text: "O – Organizado, meticuloso e confiável.",
        order_number: 3
      },
      {
        question_id: questionMap["Qual das seguintes características melhor descreve você?"],
        text: "A – Ambicioso, focado e determinado",
        order_number: 4
      },
      
      {
        question_id: questionMap["Para você, alcançar resultados exige principalmente:"],
        text: "I – Inovação e liberdade para explorar novas ideias.",
        order_number: 1
      },
      {
        question_id: questionMap["Para você, alcançar resultados exige principalmente:"],
        text: "C – Um ambiente harmonioso e colaboração com a equipe.",
        order_number: 2
      },
      {
        question_id: questionMap["Para você, alcançar resultados exige principalmente:"],
        text: "O – Planejamento e controle rigoroso dos detalhes.",
        order_number: 3
      },
      {
        question_id: questionMap["Para você, alcançar resultados exige principalmente:"],
        text: "A – Foco, disciplina e ação decidida.",
        order_number: 4
      },
      
      {
        question_id: questionMap["Quando se trata de tomar decisões, você prefere:"],
        text: "I – Arriscar e experimentar novas abordagens.",
        order_number: 1
      },
      {
        question_id: questionMap["Quando se trata de tomar decisões, você prefere:"],
        text: "C – Buscar consenso e ouvir opiniões diversas.",
        order_number: 2
      },
      {
        question_id: questionMap["Quando se trata de tomar decisões, você prefere:"],
        text: "O – Analisar cuidadosamente todas as informações.",
        order_number: 3
      },
      {
        question_id: questionMap["Quando se trata de tomar decisões, você prefere:"],
        text: "A – Agir rapidamente com firmeza.",
        order_number: 4
      },
      
      {
        question_id: questionMap["Em um dia ideal de trabalho, você se sente mais realizado quando:"],
        text: "I – Tem a oportunidade de criar e inovar.",
        order_number: 1
      },
      {
        question_id: questionMap["Em um dia ideal de trabalho, você se sente mais realizado quando:"],
        text: "C – Conecta-se e colabora com outras pessoas.",
        order_number: 2
      },
      {
        question_id: questionMap["Em um dia ideal de trabalho, você se sente mais realizado quando:"],
        text: "O – Segue um plano bem definido e atinge metas com precisão.",
        order_number: 3
      },
      {
        question_id: questionMap["Em um dia ideal de trabalho, você se sente mais realizado quando:"],
        text: "A – Conquista desafios e lidera projetos com sucesso.",
        order_number: 4
      },
      
      {
        question_id: questionMap["Qual destas opções melhor reflete sua abordagem frente a desafios?"],
        text: "I – Encarar os desafios como oportunidades para inovar.",
        order_number: 1
      },
      {
        question_id: questionMap["Qual destas opções melhor reflete sua abordagem frente a desafios?"],
        text: "C – Resolver desafios buscando apoio e mantendo o ambiente positivo.",
        order_number: 2
      },
      {
        question_id: questionMap["Qual destas opções melhor reflete sua abordagem frente a desafios?"],
        text: "O – Planejar e minimizar riscos para garantir que tudo funcione.",
        order_number: 3
      },
      {
        question_id: questionMap["Qual destas opções melhor reflete sua abordagem frente a desafios?"],
        text: "A – Tomar decisões rápidas e assertivas para superar obstáculos.",
        order_number: 4
      },
      
      {
        question_id: questionMap["Como você acredita que sua personalidade influencia o sucesso do seu negócio?"],
        text: "I – Minha criatividade e visão de futuro me permitem identificar oportunidades únicas.",
        order_number: 1
      },
      {
        question_id: questionMap["Como você acredita que sua personalidade influencia o sucesso do seu negócio?"],
        text: "C – Minha habilidade de criar relações fortalece a cultura e a rede de contatos.",
        order_number: 2
      },
      {
        question_id: questionMap["Como você acredita que sua personalidade influencia o sucesso do seu negócio?"],
        text: "O – Minha organização e precisão garantem a solidez dos processos.",
        order_number: 3
      },
      {
        question_id: questionMap["Como você acredita que sua personalidade influencia o sucesso do seu negócio?"],
        text: "A – Minha determinação e foco impulsionam resultados consistentes.",
        order_number: 4
      },
      
      // Perfil da Empresa e Mercado
      {
        question_id: questionMap["Qual a área geral de atuação da sua empresa?"],
        text: "Indústria",
        order_number: 1
      },
      {
        question_id: questionMap["Qual a área geral de atuação da sua empresa?"],
        text: "Comércio",
        order_number: 2
      },
      {
        question_id: questionMap["Qual a área geral de atuação da sua empresa?"],
        text: "Serviços",
        order_number: 3
      },
      {
        question_id: questionMap["Qual a área geral de atuação da sua empresa?"],
        text: "Outros",
        order_number: 4
      },
      
      {
        question_id: questionMap["Sua empresa tem um website?"],
        text: "Sim",
        order_number: 1
      },
      {
        question_id: questionMap["Sua empresa tem um website?"],
        text: "Não",
        order_number: 2
      },
      
      {
        question_id: questionMap["Tempo de Atuação no Mercado:"],
        text: "Menos de 1 ano",
        order_number: 1
      },
      {
        question_id: questionMap["Tempo de Atuação no Mercado:"],
        text: "1-3 anos",
        order_number: 2
      },
      {
        question_id: questionMap["Tempo de Atuação no Mercado:"],
        text: "3-5 anos",
        order_number: 3
      },
      {
        question_id: questionMap["Tempo de Atuação no Mercado:"],
        text: "5-10 anos",
        order_number: 4
      },
      {
        question_id: questionMap["Tempo de Atuação no Mercado:"],
        text: "Mais de 10 anos",
        order_number: 5
      },
      
      {
        question_id: questionMap["Faturamento Mensal Aproximado:"],
        text: "Até R$ 20.000",
        order_number: 1
      },
      {
        question_id: questionMap["Faturamento Mensal Aproximado:"],
        text: "R$ 20.000 - R$ 100.000",
        order_number: 2
      },
      {
        question_id: questionMap["Faturamento Mensal Aproximado:"],
        text: "R$ 100.000 - R$ 500.000",
        order_number: 3
      },
      {
        question_id: questionMap["Faturamento Mensal Aproximado:"],
        text: "Acima de R$ 500.000",
        order_number: 4
      },
      
      {
        question_id: questionMap["Número de Funcionários:"],
        text: "1-10",
        order_number: 1
      },
      {
        question_id: questionMap["Número de Funcionários:"],
        text: "11-50",
        order_number: 2
      },
      {
        question_id: questionMap["Número de Funcionários:"],
        text: "51-100",
        order_number: 3
      },
      {
        question_id: questionMap["Número de Funcionários:"],
        text: "Mais de 100",
        order_number: 4
      },
      
      {
        question_id: questionMap["Como você avalia o potencial de crescimento do seu negócio nos próximos 12 meses?"],
        text: "Muito baixo",
        order_number: 1
      },
      {
        question_id: questionMap["Como você avalia o potencial de crescimento do seu negócio nos próximos 12 meses?"],
        text: "Baixo",
        order_number: 2
      },
      {
        question_id: questionMap["Como você avalia o potencial de crescimento do seu negócio nos próximos 12 meses?"],
        text: "Médio",
        order_number: 3
      },
      {
        question_id: questionMap["Como você avalia o potencial de crescimento do seu negócio nos próximos 12 meses?"],
        text: "Alto",
        order_number: 4
      },
      
      {
        question_id: questionMap["Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?"],
        text: "Preço mais baixo",
        order_number: 1
      },
      {
        question_id: questionMap["Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?"],
        text: "Melhor qualidade",
        order_number: 2
      },
      {
        question_id: questionMap["Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?"],
        text: "Atendimento personalizado",
        order_number: 3
      },
      {
        question_id: questionMap["Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?"],
        text: "Maior variedade de produtos",
        order_number: 4
      },
      {
        question_id: questionMap["Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?"],
        text: "Localização",
        order_number: 5
      },
      {
        question_id: questionMap["Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?"],
        text: "Outros",
        order_number: 6
      },
      
      // Perfil dos Clientes
      {
        question_id: questionMap["Qual a faixa etária predominante dos seus clientes?"],
        text: "Abaixo de 18 anos",
        order_number: 1
      },
      {
        question_id: questionMap["Qual a faixa etária predominante dos seus clientes?"],
        text: "18-25 anos",
        order_number: 2
      },
      {
        question_id: questionMap["Qual a faixa etária predominante dos seus clientes?"],
        text: "26-35 anos",
        order_number: 3
      },
      {
        question_id: questionMap["Qual a faixa etária predominante dos seus clientes?"],
        text: "36-45 anos",
        order_number: 4
      },
      {
        question_id: questionMap["Qual a faixa etária predominante dos seus clientes?"],
        text: "46-55 anos",
        order_number: 5
      },
      {
        question_id: questionMap["Qual a faixa etária predominante dos seus clientes?"],
        text: "Acima de 55 anos",
        order_number: 6
      },
      {
        question_id: questionMap["Qual a faixa etária predominante dos seus clientes?"],
        text: "Todas as faixas etárias",
        order_number: 7
      },
      
      {
        question_id: questionMap["Qual o gênero predominante dos seus clientes?"],
        text: "Masculino",
        order_number: 1
      },
      {
        question_id: questionMap["Qual o gênero predominante dos seus clientes?"],
        text: "Feminino",
        order_number: 2
      },
      {
        question_id: questionMap["Qual o gênero predominante dos seus clientes?"],
        text: "Ambos",
        order_number: 3
      },
      {
        question_id: questionMap["Qual o gênero predominante dos seus clientes?"],
        text: "Não Binário",
        order_number: 4
      },
      
      {
        question_id: questionMap["Qual a renda familiar média dos seus clientes?"],
        text: "Até R$ 2.000",
        order_number: 1
      },
      {
        question_id: questionMap["Qual a renda familiar média dos seus clientes?"],
        text: "R$ 2.001 - R$ 4.000",
        order_number: 2
      },
      {
        question_id: questionMap["Qual a renda familiar média dos seus clientes?"],
        text: "R$ 4.001 - R$ 8.000",
        order_number: 3
      },
      {
        question_id: questionMap["Qual a renda familiar média dos seus clientes?"],
        text: "R$ 8.001 - R$ 15.000",
        order_number: 4
      },
      {
        question_id: questionMap["Qual a renda familiar média dos seus clientes?"],
        text: "R$ 15.001 - R$ 30.000",
        order_number: 5
      },
      {
        question_id: questionMap["Qual a renda familiar média dos seus clientes?"],
        text: "Acima de R$ 30.000",
        order_number: 6
      },
      
      {
        question_id: questionMap["Qual o nível de escolaridade predominante dos seus clientes?"],
        text: "Ensino fundamental",
        order_number: 1
      },
      {
        question_id: questionMap["Qual o nível de escolaridade predominante dos seus clientes?"],
        text: "Ensino médio",
        order_number: 2
      },
      {
        question_id: questionMap["Qual o nível de escolaridade predominante dos seus clientes?"],
        text: "Superior incompleto",
        order_number: 3
      },
      {
        question_id: questionMap["Qual o nível de escolaridade predominante dos seus clientes?"],
        text: "Superior completo",
        order_number: 4
      },
      {
        question_id: questionMap["Qual o nível de escolaridade predominante dos seus clientes?"],
        text: "Pós-graduação",
        order_number: 5
      },
      
      {
        question_id: questionMap["Com que frequência seus clientes compram seus produtos/serviços?"],
        text: "Diariamente",
        order_number: 1
      },
      {
        question_id: questionMap["Com que frequência seus clientes compram seus produtos/serviços?"],
        text: "Semanalmente",
        order_number: 2
      },
      {
        question_id: questionMap["Com que frequência seus clientes compram seus produtos/serviços?"],
        text: "Mensalmente",
        order_number: 3
      },
      {
        question_id: questionMap["Com que frequência seus clientes compram seus produtos/serviços?"],
        text: "Anualmente",
        order_number: 4
      },
      {
        question_id: questionMap["Com que frequência seus clientes compram seus produtos/serviços?"],
        text: "Ocasionalmente",
        order_number: 5
      },
      
      {
        question_id: questionMap["Onde seus clientes costumam procurar informações sobre produtos/serviços semelhantes aos seus?"],
        text: "Redes sociais",
        order_number: 1
      },
      {
        question_id: questionMap["Onde seus clientes costumam procurar informações sobre produtos/serviços semelhantes aos seus?"],
        text: "Sites de busca",
        order_number: 2
      },
      {
        question_id: questionMap["Onde seus clientes costumam procurar informações sobre produtos/serviços semelhantes aos seus?"],
        text: "Indicações de amigos e familiares",
        order_number: 3
      },
      {
        question_id: questionMap["Onde seus clientes costumam procurar informações sobre produtos/serviços semelhantes aos seus?"],
        text: "Revistas e jornais",
        order_number: 4
      },
      {
        question_id: questionMap["Onde seus clientes costumam procurar informações sobre produtos/serviços semelhantes aos seus?"],
        text: "Influenciadores digitais",
        order_number: 5
      },
      
      {
        question_id: questionMap["O que mais importa para seus clientes na hora de escolher seus produtos/serviços?"],
        text: "Preço",
        order_number: 1
      },
      {
        question_id: questionMap["O que mais importa para seus clientes na hora de escolher seus produtos/serviços?"],
        text: "Qualidade",
        order_number: 2
      },
      {
        question_id: questionMap["O que mais importa para seus clientes na hora de escolher seus produtos/serviços?"],
        text: "Atendimento",
        order_number: 3
      },
      {
        question_id: questionMap["O que mais importa para seus clientes na hora de escolher seus produtos/serviços?"],
        text: "Reputação da marca",
        order_number: 4
      },
      {
        question_id: questionMap["O que mais importa para seus clientes na hora de escolher seus produtos/serviços?"],
        text: "Confiabilidade",
        order_number: 5
      },
      {
        question_id: questionMap["O que mais importa para seus clientes na hora de escolher seus produtos/serviços?"],
        text: "Disponibilidade/Prazo de entrega",
        order_number: 6
      },
      {
        question_id: questionMap["O que mais importa para seus clientes na hora de escolher seus produtos/serviços?"],
        text: "Personalização",
        order_number: 7
      },
      
      // Marketing e Vendas
      {
        question_id: questionMap["Quais são os principais canais de venda utilizados?"],
        text: "Loja física",
        order_number: 1
      },
      {
        question_id: questionMap["Quais são os principais canais de venda utilizados?"],
        text: "E-commerce",
        order_number: 2
      },
      {
        question_id: questionMap["Quais são os principais canais de venda utilizados?"],
        text: "Redes sociais",
        order_number: 3
      },
      {
        question_id: questionMap["Quais são os principais canais de venda utilizados?"],
        text: "Venda direta",
        order_number: 4
      },
      {
        question_id: questionMap["Quais são os principais canais de venda utilizados?"],
        text: "Outros",
        order_number: 5
      },
      
      {
        question_id: questionMap["Qual o grau de utilização das seguintes ferramentas digitais em sua empresa?"],
        text: "Redes sociais para divulgação",
        order_number: 1
      },
      {
        question_id: questionMap["Qual o grau de utilização das seguintes ferramentas digitais em sua empresa?"],
        text: "E-commerce",
        order_number: 2
      },
      {
        question_id: questionMap["Qual o grau de utilização das seguintes ferramentas digitais em sua empresa?"],
        text: "Sistemas de gestão (ERP, CRM)",
        order_number: 3
      },
      {
        question_id: questionMap["Qual o grau de utilização das seguintes ferramentas digitais em sua empresa?"],
        text: "Ferramentas de marketing digital (Google Analytics, etc.)",
        order_number: 4
      },
      {
        question_id: questionMap["Qual o grau de utilização das seguintes ferramentas digitais em sua empresa?"],
        text: "Pagamentos online",
        order_number: 5
      },
      {
        question_id: questionMap["Qual o grau de utilização das seguintes ferramentas digitais em sua empresa?"],
        text: "Outros",
        order_number: 6
      },
      
      {
        question_id: questionMap["Qual o investimento mensal em marketing que você faz hoje, ou pretende fazer ao longo do ano?"],
        text: "Não invisto nada em marketing, atualmente",
        order_number: 1
      },
      {
        question_id: questionMap["Qual o investimento mensal em marketing que você faz hoje, ou pretende fazer ao longo do ano?"],
        text: "Até R$ 500",
        order_number: 2
      },
      {
        question_id: questionMap["Qual o investimento mensal em marketing que você faz hoje, ou pretende fazer ao longo do ano?"],
        text: "R$ 501 - R$ 1.000",
        order_number: 3
      },
      {
        question_id: questionMap["Qual o investimento mensal em marketing que você faz hoje, ou pretende fazer ao longo do ano?"],
        text: "R$ 1.001 - R$ 5.000",
        order_number: 4
      },
      {
        question_id: questionMap["Qual o investimento mensal em marketing que você faz hoje, ou pretende fazer ao longo do ano?"],
        text: "Acima de R$ 5.000",
        order_number: 5
      },
      
      {
        question_id: questionMap["Como você mede a satisfação dos seus clientes?"],
        text: "Pesquisas de satisfação",
        order_number: 1
      },
      {
        question_id: questionMap["Como você mede a satisfação dos seus clientes?"],
        text: "Análise de redes sociais",
        order_number: 2
      },
      {
        question_id: questionMap["Como você mede a satisfação dos seus clientes?"],
        text: "Indicadores de desempenho (KPIs)",
        order_number: 3
      },
      {
        question_id: questionMap["Como você mede a satisfação dos seus clientes?"],
        text: "Frequëncia de compra/visita",
        order_number: 4
      },
      {
        question_id: questionMap["Como você mede a satisfação dos seus clientes?"],
        text: "Outros",
        order_number: 5
      },
      
      // Objetivos e Desafios
      {
        question_id: questionMap["Quais são os principais objetivos da empresa para os próximos 12 meses?"],
        text: "Aumentar o faturamento",
        order_number: 1
      },
      {
        question_id: questionMap["Quais são os principais objetivos da empresa para os próximos 12 meses?"],
        text: "Expandir a equipe",
        order_number: 2
      },
      {
        question_id: questionMap["Quais são os principais objetivos da empresa para os próximos 12 meses?"],
        text: "Lançar novos produtos/serviços",
        order_number: 3
      },
      {
        question_id: questionMap["Quais são os principais objetivos da empresa para os próximos 12 meses?"],
        text: "Melhorar a experiência do cliente",
        order_number: 4
      },
      {
        question_id: questionMap["Quais são os principais objetivos da empresa para os próximos 12 meses?"],
        text: "Outros",
        order_number: 5
      },
      
      {
        question_id: questionMap["Quais são os maiores desafios que você enfrenta para crescer seu negócio?"],
        text: "Dificuldade em obter financiamento",
        order_number: 1
      },
      {
        question_id: questionMap["Quais são os maiores desafios que você enfrenta para crescer seu negócio?"],
        text: "Falta de tempo para gestão",
        order_number: 2
      },
      {
        question_id: questionMap["Quais são os maiores desafios que você enfrenta para crescer seu negócio?"],
        text: "Concorrência acirrada",
        order_number: 3
      },
      {
        question_id: questionMap["Quais são os maiores desafios que você enfrenta para crescer seu negócio?"],
        text: "Dificuldade em encontrar mão de obra qualificada",
        order_number: 4
      },
      {
        question_id: questionMap["Quais são os maiores desafios que você enfrenta para crescer seu negócio?"],
        text: "Falta de conhecimento em marketing digital",
        order_number: 5
      },
      {
        question_id: questionMap["Quais são os maiores desafios que você enfrenta para crescer seu negócio?"],
        text: "Dificuldade em inovar",
        order_number: 6
      },
      {
        question_id: questionMap["Quais são os maiores desafios que você enfrenta para crescer seu negócio?"],
        text: "Outros",
        order_number: 7
      },
      
      // Recursos Necessários
      {
        question_id: questionMap["Quais recursos você considera mais importantes para o crescimento da sua empresa?"],
        text: "Capital",
        order_number: 1
      },
      {
        question_id: questionMap["Quais recursos você considera mais importantes para o crescimento da sua empresa?"],
        text: "Tecnologia",
        order_number: 2
      },
      {
        question_id: questionMap["Quais recursos você considera mais importantes para o crescimento da sua empresa?"],
        text: "Equipe qualificada",
        order_number: 3
      },
      {
        question_id: questionMap["Quais recursos você considera mais importantes para o crescimento da sua empresa?"],
        text: "Parcerias",
        order_number: 4
      },
      {
        question_id: questionMap["Quais recursos você considera mais importantes para o crescimento da sua empresa?"],
        text: "Mentoria",
        order_number: 5
      },
      {
        question_id: questionMap["Quais recursos você considera mais importantes para o crescimento da sua empresa?"],
        text: "Outros",
        order_number: 6
      },
    ];
    
    // Filtrar apenas opções com question_id definido (para caso alguma pergunta não esteja no mapa)
    const validOptions = options.filter(option => !!option.question_id);
    
    const { error: optionsError } = await supabase
      .from('quiz_options')
      .upsert(validOptions);
      
    if (optionsError) throw optionsError;
    console.log("✅ Opções inseridas com sucesso");
    
    console.log("✅ Dados do questionário inseridos com sucesso!");
    return true;
    
  } catch (error) {
    console.error("Erro ao inserir dados do questionário:", error);
    return false;
  }
}
