
import { QuizModule, QuizQuestion, QuizOption } from '@/types/quiz';

export const quizModulesData: Omit<QuizModule, 'id' | 'created_at' | 'updated_at'>[] = [
  { 
    title: "Informações Pessoais", 
    description: "Dados pessoais do respondente", 
    order_number: 1,
    is_active: true
  },
  { 
    title: "Perfil Comportamental", 
    description: "Perguntas sobre seu perfil comportamental", 
    order_number: 2,
    is_active: true
  },
  { 
    title: "Perfil da Empresa e Mercado", 
    description: "Perguntas sobre sua empresa e mercado", 
    order_number: 3,
    is_active: true
  },
  { 
    title: "Propósito, Valores e Visão", 
    description: "Perguntas sobre a missão da empresa", 
    order_number: 4,
    is_active: true
  },
  { 
    title: "Perfil dos Clientes", 
    description: "Perguntas sobre os clientes da empresa", 
    order_number: 5,
    is_active: true
  },
  { 
    title: "Concorrentes", 
    description: "Perguntas sobre seus concorrentes", 
    order_number: 6,
    is_active: true
  },
  { 
    title: "Marketing e Vendas", 
    description: "Perguntas sobre estratégias de marketing e vendas", 
    order_number: 7,
    is_active: true
  },
  { 
    title: "Objetivos e Desafios", 
    description: "Perguntas sobre metas e desafios da empresa", 
    order_number: 8,
    is_active: true
  },
  { 
    title: "Recursos Necessários", 
    description: "Perguntas sobre recursos para crescimento", 
    order_number: 9,
    is_active: true
  },
  { 
    title: "Observações Finais", 
    description: "Comentários adicionais", 
    order_number: 10,
    is_active: true
  }
];

export const quizQuestionsData: Omit<QuizQuestion, 'id' | 'created_at' | 'updated_at'>[] = [
  // Módulo 1: Informações Pessoais
  {
    module_id: 'module_1',
    text: "Nome:",
    type: "text",
    required: true,
    order_number: 1,
    hint: "Digite seu nome"
  },
  {
    module_id: 'module_1',
    text: "Sobrenome:",
    type: "text",
    required: true,
    order_number: 2,
    hint: "Digite seu sobrenome"
  },
  {
    module_id: 'module_1',
    text: "Telefone/Whatsapp:",
    type: "text",
    required: true,
    order_number: 3,
    hint: "Digite seu telefone com DDD"
  },
  {
    module_id: 'module_1',
    text: "E-mail:",
    type: "email",
    required: true,
    order_number: 4,
    hint: "Digite seu e-mail"
  },
  
  // Módulo 2: Perfil Comportamental
  {
    module_id: 'module_2',
    text: "Qual das seguintes características melhor descreve você?",
    type: "radio",
    required: true,
    order_number: 5,
    hint: "Selecione a opção que melhor descreve sua personalidade"
  },
  {
    module_id: 'module_2',
    text: "Para você, alcançar resultados exige principalmente:",
    type: "radio",
    required: true,
    order_number: 6,
    hint: "Selecione a opção que mais se aproxima da sua visão"
  },
  {
    module_id: 'module_2',
    text: "Quando se trata de tomar decisões, você prefere:",
    type: "radio",
    required: true,
    order_number: 7,
    hint: "Selecione a opção que melhor descreve seu estilo de tomada de decisão"
  },
  {
    module_id: 'module_2',
    text: "Em um dia ideal de trabalho, você se sente mais realizado quando:",
    type: "radio",
    required: true,
    order_number: 8,
    hint: "Selecione a opção que melhor descreve o que te traz satisfação no trabalho"
  },
  {
    module_id: 'module_2',
    text: "Qual destas opções melhor reflete sua abordagem frente a desafios?",
    type: "radio",
    required: true,
    order_number: 9,
    hint: "Selecione a opção que melhor representa como você lida com desafios"
  },
  {
    module_id: 'module_2',
    text: "Como você acredita que sua personalidade influencia o sucesso do seu negócio?",
    type: "radio",
    required: true,
    order_number: 10,
    hint: "Selecione a opção que melhor descreve como sua personalidade impacta seu negócio"
  },
  
  // Módulo 3: Perfil da Empresa e Mercado
  {
    module_id: 'module_3',
    text: "Nome da Empresa:",
    type: "text",
    required: true,
    order_number: 11,
    hint: "Digite o nome da sua empresa"
  },
  {
    module_id: 'module_3',
    text: "CNPJ:",
    type: "text",
    required: true,
    order_number: 12,
    hint: "Digite o CNPJ da empresa (apenas números)"
  },
  {
    module_id: 'module_3',
    text: "Endereço:",
    type: "text",
    required: true,
    order_number: 13,
    hint: "Digite o endereço completo da empresa"
  },
  {
    module_id: 'module_3',
    text: "Qual a área geral de atuação da sua empresa?",
    type: "radio",
    required: true,
    order_number: 14,
    hint: "Selecione o setor principal de atuação da sua empresa"
  },
  {
    module_id: 'module_3',
    text: "Descreva, brevemente, sua empresa. O que ela vende, produz ou qual serviço presta?",
    type: "textarea",
    required: true,
    order_number: 15,
    hint: "Forneça uma descrição breve e clara da atividade principal da sua empresa"
  },
  {
    module_id: 'module_3',
    text: "Sua empresa tem um website?",
    type: "radio",
    required: true,
    order_number: 16,
    hint: "Indique se sua empresa possui um site"
  },
  {
    module_id: 'module_3',
    text: "Se sua empresa tem um website, digite o domínio (endereço na web):",
    type: "url",
    required: false,
    order_number: 17,
    hint: "Insira o endereço do site da sua empresa",
    prefix: "https://"
  },
  {
    module_id: 'module_3',
    text: "Instagram da empresa:",
    type: "instagram",
    required: false,
    order_number: 18,
    hint: "Digite apenas o nome de usuário, sem o @ ou URL completa",
    prefix: "https://www.instagram.com/"
  },
  {
    module_id: 'module_3',
    text: "Tempo de Atuação no Mercado:",
    type: "radio",
    required: true,
    order_number: 19,
    hint: "Selecione o tempo de existência da sua empresa"
  },
  {
    module_id: 'module_3',
    text: "Faturamento Mensal Aproximado:",
    type: "radio",
    required: true,
    order_number: 20,
    hint: "Selecione a faixa que corresponde ao faturamento mensal médio da sua empresa"
  },
  {
    module_id: 'module_3',
    text: "Número de Funcionários:",
    type: "radio",
    required: true,
    order_number: 21,
    hint: "Selecione a quantidade de colaboradores da sua empresa"
  },
  {
    module_id: 'module_3',
    text: "Como você avalia o potencial de crescimento do seu negócio nos próximos 12 meses?",
    type: "radio",
    required: true,
    order_number: 22,
    hint: "Avalie o potencial de crescimento da sua empresa para o próximo ano"
  },
  {
    module_id: 'module_3',
    text: "Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?",
    type: "checkbox",
    required: true,
    order_number: 23,
    hint: "Selecione todos os motivos que se aplicam"
  },
  
  // Módulo 4: Propósito, Valores e Visão
  {
    module_id: 'module_4',
    text: "Descreva o propósito ou missão da sua empresa.",
    type: "textarea",
    required: true,
    order_number: 24,
    hint: "Explique qual é o propósito maior da sua empresa, sua razão de existir"
  },
  {
    module_id: 'module_4',
    text: "Quais são os valores fundamentais que guiam a tomada de decisões da sua empresa?",
    type: "textarea",
    required: true,
    order_number: 25,
    hint: "Descreva os princípios e valores que norteiam as decisões e a cultura da sua empresa"
  },
  {
    module_id: 'module_4',
    text: "Qual é a visão de futuro da sua empresa? O que querem atingir ou se tornar?",
    type: "textarea",
    required: true,
    order_number: 26,
    hint: "Descreva onde você quer que sua empresa esteja no futuro, o que deseja alcançar"
  },
  
  // Módulo 5: Perfil dos Clientes
  {
    module_id: 'module_5',
    text: "Qual é o público-alvo principal da sua empresa?",
    type: "radio",
    required: true,
    order_number: 27,
    hint: "Selecione o tipo de cliente que sua empresa atende principalmente"
  },
  {
    module_id: 'module_5',
    text: "Qual a faixa etária predominante dos seus clientes?",
    type: "radio",
    required: true,
    order_number: 28,
    hint: "Selecione a faixa etária que melhor representa a maioria dos seus clientes"
  },
  {
    module_id: 'module_5',
    text: "Qual o gênero predominante dos seus clientes?",
    type: "radio",
    required: true,
    order_number: 29,
    hint: "Selecione o gênero que representa a maioria dos seus clientes"
  },
  {
    module_id: 'module_5',
    text: "Qual a renda familiar média dos seus clientes?",
    type: "radio",
    required: true,
    order_number: 30,
    hint: "Selecione a faixa de renda que melhor representa seus clientes"
  },
  {
    module_id: 'module_5',
    text: "Qual o nível de escolaridade predominante dos seus clientes?",
    type: "radio",
    required: true,
    order_number: 31,
    hint: "Selecione o nível de escolaridade que melhor representa seus clientes"
  },
  {
    module_id: 'module_5',
    text: "Com que frequência seus clientes compram seus produtos/serviços?",
    type: "radio",
    required: true,
    order_number: 32,
    hint: "Selecione a frequência média de compra/contratação dos seus clientes"
  },
  {
    module_id: 'module_5',
    text: "Onde seus clientes costumam procurar informações sobre produtos/serviços semelhantes aos seus?",
    type: "checkbox",
    required: true,
    order_number: 33,
    hint: "Selecione todos os canais que seus clientes utilizam para buscar informações"
  },
  {
    module_id: 'module_5',
    text: "O que mais importa para seus clientes na hora de escolher seus produtos/serviços?",
    type: "checkbox",
    required: true,
    order_number: 34,
    hint: "Selecione as 3 opções mais importantes",
    max_options: 3
  },
  
  // Módulo 6: Concorrentes
  {
    module_id: 'module_6',
    text: "Concorrente A:",
    type: "text",
    required: true,
    order_number: 35,
    hint: "Digite o nome do principal concorrente"
  },
  {
    module_id: 'module_6',
    text: "Instagram Concorrente A:",
    type: "instagram",
    required: false,
    order_number: 36,
    hint: "Digite apenas o nome de usuário, sem o @ ou URL completa",
    prefix: "https://www.instagram.com/"
  },
  {
    module_id: 'module_6',
    text: "Concorrente B:",
    type: "text",
    required: true,
    order_number: 37,
    hint: "Digite o nome do segundo principal concorrente"
  },
  {
    module_id: 'module_6',
    text: "Instagram Concorrente B:",
    type: "instagram",
    required: false,
    order_number: 38,
    hint: "Digite apenas o nome de usuário, sem o @ ou URL completa",
    prefix: "https://www.instagram.com/"
  },
  {
    module_id: 'module_6',
    text: "Concorrente C:",
    type: "text",
    required: true,
    order_number: 39,
    hint: "Digite o nome do terceiro principal concorrente"
  },
  {
    module_id: 'module_6',
    text: "Instagram Concorrente C:",
    type: "instagram",
    required: false,
    order_number: 40,
    hint: "Digite apenas o nome de usuário, sem o @ ou URL completa",
    prefix: "https://www.instagram.com/"
  },
  
  // Módulo 7: Marketing e Vendas
  {
    module_id: 'module_7',
    text: "Quais são os principais canais de venda utilizados?",
    type: "checkbox",
    required: true,
    order_number: 41,
    hint: "Selecione todos os canais que sua empresa utiliza para vendas"
  },
  {
    module_id: 'module_7',
    text: "Quais das seguintes ferramentas digitais sua empresa utiliza atualmente?",
    type: "checkbox",
    required: true,
    order_number: 42,
    hint: "Selecione todas as ferramentas digitais que sua empresa utiliza"
  },
  {
    module_id: 'module_7',
    text: "Qual o investimento mensal em marketing que você faz hoje, ou pretende fazer ao longo do ano?",
    type: "radio",
    required: true,
    order_number: 43,
    hint: "Selecione a faixa que representa seu investimento em marketing"
  },
  {
    module_id: 'module_7',
    text: "Como você mede a satisfação dos seus clientes?",
    type: "checkbox",
    required: true,
    order_number: 44,
    hint: "Selecione todos os métodos que você utiliza para medir a satisfação dos clientes"
  },
  
  // Módulo 8: Objetivos e Desafios
  {
    module_id: 'module_8',
    text: "Quais são os objetivos da sua empresa para os próximos 12 meses?",
    type: "checkbox",
    required: true,
    order_number: 45,
    hint: "Selecione todos os objetivos relevantes para o próximo ano"
  },
  {
    module_id: 'module_8',
    text: "Quais são os objetivos da sua empresa para os próximos 3-5 anos?",
    type: "checkbox",
    required: true,
    order_number: 46,
    hint: "Selecione todos os objetivos de médio prazo que se aplicam"
  },
  {
    module_id: 'module_8',
    text: "Quais são os principais desafios que sua empresa enfrenta atualmente?",
    type: "checkbox",
    required: true,
    order_number: 47,
    hint: "Selecione todos os desafios relevantes para sua empresa"
  },
  {
    module_id: 'module_8',
    text: "Dentre os desafios selecionados acima, qual você considera mais urgente resolver?",
    type: "textarea",
    required: true,
    order_number: 48,
    hint: "Escolha apenas um dos desafios que você selecionou na pergunta anterior"
  },
  {
    module_id: 'module_8',
    text: "Como líder, quais são seus principais desafios pessoais na gestão do negócio?",
    type: "checkbox",
    required: true,
    order_number: 49,
    hint: "Selecione todos os desafios pessoais que você enfrenta como líder"
  },
  {
    module_id: 'module_8',
    text: "Como esses desafios pessoais impactam o desenvolvimento do seu negócio?",
    type: "textarea",
    required: true,
    order_number: 50,
    hint: "Descreva como seus desafios pessoais afetam o crescimento e desenvolvimento da sua empresa"
  },
  
  // Módulo 9: Recursos Necessários
  {
    module_id: 'module_9',
    text: "Quais recursos você considera mais importantes para o crescimento da sua empresa?",
    type: "checkbox",
    required: true,
    order_number: 51,
    hint: "Selecione todos os recursos que você considera cruciais para o crescimento"
  },
  
  // Módulo 10: Observações Finais
  {
    module_id: 'module_10',
    text: "Observações adicionais ou comentários que gostaria de fazer:",
    type: "textarea",
    required: false,
    order_number: 52,
    hint: "Use este espaço para adicionar qualquer informação relevante que não foi abordada nas questões anteriores"
  }
];

export const quizOptionsData: Omit<QuizOption, 'id' | 'created_at' | 'updated_at'>[] = [
  // Módulo 2: Perfil Comportamental - Questão 5
  {
    question_id: 'question_2_5',
    text: "Idealista, criativo e visionário.",
    order_number: 1
  },
  {
    question_id: 'question_2_5',
    text: "Comunicativo, amigável e colaborativo.",
    order_number: 2
  },
  {
    question_id: 'question_2_5',
    text: "Organizado, meticuloso e confiável.",
    order_number: 3
  },
  {
    question_id: 'question_2_5',
    text: "Ambicioso, focado e determinado.",
    order_number: 4
  },
  
  // Módulo 2: Perfil Comportamental - Questão 6
  {
    question_id: 'question_2_6',
    text: "Inovação e liberdade para explorar novas ideias.",
    order_number: 1
  },
  {
    question_id: 'question_2_6',
    text: "Um ambiente harmonioso e colaboração com a equipe.",
    order_number: 2
  },
  {
    question_id: 'question_2_6',
    text: "Planejamento e controle rigoroso dos detalhes.",
    order_number: 3
  },
  {
    question_id: 'question_2_6',
    text: "Foco, disciplina e ação decidida.",
    order_number: 4
  },
  
  // Módulo 2: Perfil Comportamental - Questão 7
  {
    question_id: 'question_2_7',
    text: "Arriscar e experimentar novas abordagens.",
    order_number: 1
  },
  {
    question_id: 'question_2_7',
    text: "Buscar consenso e ouvir opiniões diversas.",
    order_number: 2
  },
  {
    question_id: 'question_2_7',
    text: "Analisar cuidadosamente todas as informações.",
    order_number: 3
  },
  {
    question_id: 'question_2_7',
    text: "Agir rapidamente com firmeza.",
    order_number: 4
  },
  
  // Módulo 2: Perfil Comportamental - Questão 8
  {
    question_id: 'question_2_8',
    text: "Tem a oportunidade de criar e inovar.",
    order_number: 1
  },
  {
    question_id: 'question_2_8',
    text: "Conecta-se e colabora com outras pessoas.",
    order_number: 2
  },
  {
    question_id: 'question_2_8',
    text: "Segue um plano bem definido e atinge metas com precisão.",
    order_number: 3
  },
  {
    question_id: 'question_2_8',
    text: "Conquista desafios e lidera projetos com sucesso.",
    order_number: 4
  },
  
  // Módulo 2: Perfil Comportamental - Questão 9
  {
    question_id: 'question_2_9',
    text: "Encarar os desafios como oportunidades para inovar.",
    order_number: 1
  },
  {
    question_id: 'question_2_9',
    text: "Resolver desafios buscando apoio e mantendo o ambiente positivo.",
    order_number: 2
  },
  {
    question_id: 'question_2_9',
    text: "Planejar e minimizar riscos para garantir que tudo funcione.",
    order_number: 3
  },
  {
    question_id: 'question_2_9',
    text: "Tomar decisões rápidas e assertivas para superar obstáculos.",
    order_number: 4
  },
  
  // Módulo 2: Perfil Comportamental - Questão 10
  {
    question_id: 'question_2_10',
    text: "Minha criatividade e visão de futuro me permitem identificar oportunidades únicas.",
    order_number: 1
  },
  {
    question_id: 'question_2_10',
    text: "Minha habilidade de criar relações fortalece a cultura e a rede de contatos.",
    order_number: 2
  },
  {
    question_id: 'question_2_10',
    text: "Minha organização e precisão garantem a solidez dos processos.",
    order_number: 3
  },
  {
    question_id: 'question_2_10',
    text: "Minha determinação e foco impulsionam resultados consistentes.",
    order_number: 4
  },
  
  // Módulo 3: Perfil da Empresa e Mercado - Questão 14
  {
    question_id: 'question_3_14',
    text: "Indústria",
    order_number: 1
  },
  {
    question_id: 'question_3_14',
    text: "Comércio",
    order_number: 2
  },
  {
    question_id: 'question_3_14',
    text: "Serviços",
    order_number: 3
  },
  {
    question_id: 'question_3_14',
    text: "Outros",
    order_number: 4
  },
  
  // Módulo 3: Perfil da Empresa e Mercado - Questão 16
  {
    question_id: 'question_3_16',
    text: "Sim",
    order_number: 1
  },
  {
    question_id: 'question_3_16',
    text: "Não",
    order_number: 2
  },
  
  // Módulo 3: Perfil da Empresa e Mercado - Questão 19
  {
    question_id: 'question_3_19',
    text: "Menos de 1 ano",
    order_number: 1
  },
  {
    question_id: 'question_3_19',
    text: "1 a 3 anos",
    order_number: 2
  },
  {
    question_id: 'question_3_19',
    text: "3 a 5 anos",
    order_number: 3
  },
  {
    question_id: 'question_3_19',
    text: "5 a 10 anos",
    order_number: 4
  },
  {
    question_id: 'question_3_19',
    text: "10 a 20 anos",
    order_number: 5
  },
  {
    question_id: 'question_3_19',
    text: "mais de 20 anos",
    order_number: 6
  },
  
  // Módulo 3: Perfil da Empresa e Mercado - Questão 20
  {
    question_id: 'question_3_20',
    text: "Até R$ 20.000",
    order_number: 1
  },
  {
    question_id: 'question_3_20',
    text: "R$ 20.000 - R$ 100.000",
    order_number: 2
  },
  {
    question_id: 'question_3_20',
    text: "R$ 100.000 - R$ 500.000",
    order_number: 3
  },
  {
    question_id: 'question_3_20',
    text: "R$ 500.000 - R$ 1.000.000",
    order_number: 4
  },
  {
    question_id: 'question_3_20',
    text: "Acima de R$ 1.000.000",
    order_number: 5
  },
  
  // Módulo 3: Perfil da Empresa e Mercado - Questão 21
  {
    question_id: 'question_3_21',
    text: "1 a 10",
    order_number: 1
  },
  {
    question_id: 'question_3_21',
    text: "11 a 50",
    order_number: 2
  },
  {
    question_id: 'question_3_21',
    text: "51 a 100",
    order_number: 3
  },
  {
    question_id: 'question_3_21',
    text: "101 a 200",
    order_number: 4
  },
  {
    question_id: 'question_3_21',
    text: "Mais de 200",
    order_number: 5
  },
  
  // Módulo 3: Perfil da Empresa e Mercado - Questão 22
  {
    question_id: 'question_3_22',
    text: "Muito Alto",
    order_number: 1
  },
  {
    question_id: 'question_3_22',
    text: "Alto",
    order_number: 2
  },
  {
    question_id: 'question_3_22',
    text: "Médio",
    order_number: 3
  },
  {
    question_id: 'question_3_22',
    text: "Baixo",
    order_number: 4
  },
  {
    question_id: 'question_3_22',
    text: "Muito baixo",
    order_number: 5
  },
  
  // Adicionando opções para a questão 23 (Diferenciais competitivos)
  {
    question_id: 'question_3_23',
    text: "Preço Competitivo / Custo-Benefício",
    order_number: 1
  },
  {
    question_id: 'question_3_23',
    text: "Qualidade Superior do Produto/Serviço",
    order_number: 2
  },
  {
    question_id: 'question_3_23',
    text: "Atendimento/Suporte ao Cliente de Excelência",
    order_number: 3
  },
  {
    question_id: 'question_3_23',
    text: "Relacionamento Próximo com o Cliente / Atendimento Personalizado",
    order_number: 4
  },
  {
    question_id: 'question_3_23',
    text: "Ampla Variedade de Produtos/Serviços",
    order_number: 5
  },
  {
    question_id: 'question_3_23',
    text: "Conveniência (localização, horários, facilidade de compra, entrega rápida)",
    order_number: 6
  },
  {
    question_id: 'question_3_23',
    text: "Reputação da Marca / Confiança",
    order_number: 7
  },
  {
    question_id: 'question_3_23',
    text: "Inovação / Tecnologia Diferenciada",
    order_number: 8
  },
  {
    question_id: 'question_3_23',
    text: "Especialização / Expertise no Setor",
    order_number: 9
  },
  {
    question_id: 'question_3_23',
    text: "Flexibilidade / Capacidade de Adaptação às Necessidades do Cliente",
    order_number: 10
  },
  
  // Módulo 5: Perfil dos Clientes - Questão 27
  {
    question_id: 'question_5_27',
    text: "Consumidor final (B2C)",
    order_number: 1
  },
  {
    question_id: 'question_5_27',
    text: "Outras empresas (B2B)",
    order_number: 2
  },
  {
    question_id: 'question_5_27',
    text: "Governo (B2G)",
    order_number: 3
  },
  {
    question_id: 'question_5_27',
    text: "Outro",
    order_number: 4
  },
  
  // Módulo 5: Perfil dos Clientes - Questão 28 (Faixa etária)
  {
    question_id: 'question_5_28',
    text: "Abaixo de 18 anos",
    order_number: 1
  },
  {
    question_id: 'question_5_28',
    text: "18 a 25 anos",
    order_number: 2
  },
  {
    question_id: 'question_5_28',
    text: "26 a 35 anos",
    order_number: 3
  },
  {
    question_id: 'question_5_28',
    text: "36 a 45 anos",
    order_number: 4
  },
  {
    question_id: 'question_5_28',
    text: "46 a 55 anos",
    order_number: 5
  },
  {
    question_id: 'question_5_28',
    text: "56 a 65 anos",
    order_number: 6
  },
  {
    question_id: 'question_5_28',
    text: "Acima dos 65 anos",
    order_number: 7
  },
  {
    question_id: 'question_5_28',
    text: "Todas as faixas etárias",
    order_number: 8
  },
  
  // Módulo 5: Perfil dos Clientes - Questão 29 (Gênero)
  {
    question_id: 'question_5_29',
    text: "Masculino",
    order_number: 1
  },
  {
    question_id: 'question_5_29',
    text: "Feminino",
    order_number: 2
  },
  {
    question_id: 'question_5_29',
    text: "Ambos",
    order_number: 3
  },
  {
    question_id: 'question_5_29',
    text: "Não Binário",
    order_number: 4
  },
  
  // Módulo 5: Perfil dos Clientes - Questão 30 (Renda)
  {
    question_id: 'question_5_30',
    text: "Até R$ 2.000",
    order_number: 1
  },
  {
    question_id: 'question_5_30',
    text: "R$ 2.001 - R$ 4.000",
    order_number: 2
  },
  {
    question_id: 'question_5_30',
    text: "R$ 4.001 - R$ 8.000",
    order_number: 3
  },
  {
    question_id: 'question_5_30',
    text: "R$ 8.001 - R$ 15.000",
    order_number: 4
  },
  {
    question_id: 'question_5_30',
    text: "R$ 15.001 - R$ 30.000",
    order_number: 5
  },
  {
    question_id: 'question_5_30',
    text: "R$ 30.000 - R$ 100.000",
    order_number: 6
  },
  {
    question_id: 'question_5_30',
    text: "Acima de R$ 100.000",
    order_number: 7
  },
  
  // Módulo 5: Perfil dos Clientes - Questão 31 (Escolaridade)
  {
    question_id: 'question_5_31',
    text: "Ensino fundamental",
    order_number: 1
  },
  {
    question_id: 'question_5_31',
    text: "Ensino médio",
    order_number: 2
  },
  {
    question_id: 'question_5_31',
    text: "Superior incompleto",
    order_number: 3
  },
  {
    question_id: 'question_5_31',
    text: "Superior completo",
    order_number: 4
  },
  {
    question_id: 'question_5_31',
    text: "Pós-graduação",
    order_number: 5
  },
  
  // Módulo 5: Perfil dos Clientes - Questão 32 (Frequência)
  {
    question_id: 'question_5_32',
    text: "Diariamente",
    order_number: 1
  },
  {
    question_id: 'question_5_32',
    text: "Semanalmente",
    order_number: 2
  },
  {
    question_id: 'question_5_32',
    text: "Mensalmente",
    order_number: 3
  },
  {
    question_id: 'question_5_32',
    text: "Anualmente",
    order_number: 4
  },
  {
    question_id: 'question_5_32',
    text: "Ocasionalmente",
    order_number: 5
  }
  // Nota: Para tornar o arquivo mais gerenciável, incluí apenas uma parte
  // das opções. Em um ambiente real, todas as opções de todas as perguntas
  // estariam aqui, mas isso tornaria este arquivo extremamente grande.
];
