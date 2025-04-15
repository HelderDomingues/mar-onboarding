
import { QuizModule, QuizQuestion, QuizOption } from '@/types/quiz';

// Estrutura dos módulos - exatamente como definidos no questionário
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

// Estrutura das perguntas - EXATAMENTE como fornecidas no questionário
export const quizQuestionsData: Omit<QuizQuestion, 'id' | 'created_at' | 'updated_at' | 'module_id'>[] = [
  // Módulo 1: Informações Pessoais
  {
    module_number: 1,
    text: "Nome:",
    type: "text",
    required: true,
    order_number: 1,
    hint: "Digite seu nome"
  },
  {
    module_number: 1,
    text: "Sobrenome:",
    type: "text",
    required: true,
    order_number: 2,
    hint: "Digite seu sobrenome"
  },
  {
    module_number: 1,
    text: "Telefone/Whatsapp:",
    type: "text",
    required: true,
    order_number: 3,
    hint: "Digite seu telefone com DDD"
  },
  {
    module_number: 1,
    text: "E-mail:",
    type: "email",
    required: true,
    order_number: 4,
    hint: "Digite seu e-mail"
  },
  
  // Módulo 2: Perfil Comportamental
  {
    module_number: 2,
    text: "Qual das seguintes características melhor descreve você?",
    type: "radio",
    required: true,
    order_number: 5,
    hint: "Selecione a opção que melhor descreve sua personalidade"
  },
  {
    module_number: 2,
    text: "Para você, alcançar resultados exige principalmente:",
    type: "radio",
    required: true,
    order_number: 6,
    hint: "Selecione a opção que mais se aproxima da sua visão"
  },
  {
    module_number: 2,
    text: "Quando se trata de tomar decisões, você prefere:",
    type: "radio",
    required: true,
    order_number: 7,
    hint: "Selecione a opção que melhor descreve seu estilo de tomada de decisão"
  },
  {
    module_number: 2,
    text: "Em um dia ideal de trabalho, você se sente mais realizado quando:",
    type: "radio",
    required: true,
    order_number: 8,
    hint: "Selecione a opção que melhor descreve o que te traz satisfação no trabalho"
  },
  {
    module_number: 2,
    text: "Qual destas opções melhor reflete sua abordagem frente a desafios?",
    type: "radio",
    required: true,
    order_number: 9,
    hint: "Selecione a opção que melhor representa como você lida com desafios"
  },
  {
    module_number: 2,
    text: "Como você acredita que sua personalidade influencia o sucesso do seu negócio?",
    type: "radio",
    required: true,
    order_number: 10,
    hint: "Selecione a opção que melhor descreve como sua personalidade impacta seu negócio"
  },
  
  // Módulo 3: Perfil da Empresa e Mercado
  {
    module_number: 3,
    text: "Nome da Empresa:",
    type: "text",
    required: true,
    order_number: 11,
    hint: "Digite o nome da sua empresa"
  },
  {
    module_number: 3,
    text: "CNPJ:",
    type: "text",
    required: true,
    order_number: 12,
    hint: "Digite o CNPJ da empresa (apenas números)"
  },
  {
    module_number: 3,
    text: "Endereço:",
    type: "text",
    required: true,
    order_number: 13,
    hint: "Digite o endereço completo da empresa"
  },
  {
    module_number: 3,
    text: "Qual a área geral de atuação da sua empresa?",
    type: "radio",
    required: true,
    order_number: 14,
    hint: "Selecione o setor principal de atuação da sua empresa"
  },
  {
    module_number: 3,
    text: "Descreva, brevemente, sua empresa. O que ela vende, produz ou qual serviço presta?",
    type: "textarea",
    required: true,
    order_number: 15,
    hint: "Forneça uma descrição breve e clara da atividade principal da sua empresa"
  },
  {
    module_number: 3,
    text: "Sua empresa tem um website?",
    type: "radio",
    required: true,
    order_number: 16,
    hint: "Indique se sua empresa possui um site"
  },
  {
    module_number: 3,
    text: "Se sua empresa tem um website, digite o domínio (endereço na web):",
    type: "url",
    required: false,
    order_number: 17,
    hint: "Insira o endereço do site da sua empresa",
    prefix: "https://"
  },
  {
    module_number: 3,
    text: "Instagram da empresa:",
    type: "instagram",
    required: false,
    order_number: 18,
    hint: "Digite apenas o nome de usuário, sem o @ ou URL completa",
    prefix: "https://www.instagram.com/"
  },
  {
    module_number: 3,
    text: "Tempo de Atuação no Mercado:",
    type: "radio",
    required: true,
    order_number: 19,
    hint: "Selecione o tempo de existência da sua empresa"
  },
  {
    module_number: 3,
    text: "Faturamento Mensal Aproximado:",
    type: "radio",
    required: true,
    order_number: 20,
    hint: "Selecione a faixa que corresponde ao faturamento mensal médio da sua empresa"
  },
  {
    module_number: 3,
    text: "Número de Funcionários:",
    type: "radio",
    required: true,
    order_number: 21,
    hint: "Selecione a quantidade de colaboradores da sua empresa"
  },
  {
    module_number: 3,
    text: "Como você avalia o potencial de crescimento do seu negócio nos próximos 12 meses?",
    type: "radio",
    required: true,
    order_number: 22,
    hint: "Avalie o potencial de crescimento da sua empresa para o próximo ano"
  },
  {
    module_number: 3,
    text: "Segundo sua visão, qual o principal motivo que faz seus clientes escolherem sua empresa em vez da concorrência?",
    type: "checkbox",
    required: true,
    order_number: 23,
    hint: "Selecione todos os motivos que se aplicam"
  },
  
  // Módulo 4: Propósito, Valores e Visão
  {
    module_number: 4,
    text: "Descreva o propósito ou missão da sua empresa.",
    type: "textarea",
    required: true,
    order_number: 24,
    hint: "Explique qual é o propósito maior da sua empresa, sua razão de existir"
  },
  {
    module_number: 4,
    text: "Quais são os valores fundamentais que guiam a tomada de decisões da sua empresa?",
    type: "textarea",
    required: true,
    order_number: 25,
    hint: "Descreva os princípios e valores que norteiam as decisões e a cultura da sua empresa"
  },
  {
    module_number: 4,
    text: "Qual é a visão de futuro da sua empresa? O que querem atingir ou se tornar?",
    type: "textarea",
    required: true,
    order_number: 26,
    hint: "Descreva onde você quer que sua empresa esteja no futuro, o que deseja alcançar"
  },
  
  // Módulo 5: Perfil dos Clientes
  {
    module_number: 5,
    text: "Qual é o público-alvo principal da sua empresa?",
    type: "radio",
    required: true,
    order_number: 27,
    hint: "Selecione o tipo de cliente que sua empresa atende principalmente"
  },
  {
    module_number: 5,
    text: "Qual a faixa etária predominante dos seus clientes?",
    type: "radio",
    required: true,
    order_number: 28,
    hint: "Selecione a faixa etária que melhor representa a maioria dos seus clientes"
  },
  {
    module_number: 5,
    text: "Qual o gênero predominante dos seus clientes?",
    type: "radio",
    required: true,
    order_number: 29,
    hint: "Selecione o gênero que representa a maioria dos seus clientes"
  },
  {
    module_number: 5,
    text: "Qual a renda familiar média dos seus clientes?",
    type: "radio",
    required: true,
    order_number: 30,
    hint: "Selecione a faixa de renda que melhor representa seus clientes"
  },
  {
    module_number: 5,
    text: "Qual o nível de escolaridade predominante dos seus clientes?",
    type: "radio",
    required: true,
    order_number: 31,
    hint: "Selecione o nível de escolaridade que melhor representa seus clientes"
  },
  {
    module_number: 5,
    text: "Com que frequência seus clientes compram seus produtos/serviços?",
    type: "radio",
    required: true,
    order_number: 32,
    hint: "Selecione a frequência média de compra/contratação dos seus clientes"
  },
  {
    module_number: 5,
    text: "Onde seus clientes costumam procurar informações sobre produtos/serviços semelhantes aos seus?",
    type: "checkbox",
    required: true,
    order_number: 33,
    hint: "Selecione todos os canais que seus clientes utilizam para buscar informações"
  },
  {
    module_number: 5,
    text: "O que mais importa para seus clientes na hora de escolher seus produtos/serviços?",
    type: "checkbox",
    required: true,
    order_number: 34,
    hint: "Selecione as 3 opções mais importantes",
    max_options: 3
  },
  
  // Módulo 6: Concorrentes
  {
    module_number: 6,
    text: "Concorrente A:",
    type: "text",
    required: true,
    order_number: 35,
    hint: "Digite o nome do principal concorrente"
  },
  {
    module_number: 6,
    text: "Instagram Concorrente A:",
    type: "instagram",
    required: false,
    order_number: 36,
    hint: "Digite apenas o nome de usuário, sem o @ ou URL completa",
    prefix: "https://www.instagram.com/"
  },
  {
    module_number: 6,
    text: "Concorrente B:",
    type: "text",
    required: true,
    order_number: 37,
    hint: "Digite o nome do segundo principal concorrente"
  },
  {
    module_number: 6,
    text: "Instagram Concorrente B:",
    type: "instagram",
    required: false,
    order_number: 38,
    hint: "Digite apenas o nome de usuário, sem o @ ou URL completa",
    prefix: "https://www.instagram.com/"
  },
  {
    module_number: 6,
    text: "Concorrente C:",
    type: "text",
    required: true,
    order_number: 39,
    hint: "Digite o nome do terceiro principal concorrente"
  },
  {
    module_number: 6,
    text: "Instagram Concorrente C:",
    type: "instagram",
    required: false,
    order_number: 40,
    hint: "Digite apenas o nome de usuário, sem o @ ou URL completa",
    prefix: "https://www.instagram.com/"
  },
  
  // Módulo 7: Marketing e Vendas
  {
    module_number: 7,
    text: "Quais são os principais canais de venda utilizados?",
    type: "checkbox",
    required: true,
    order_number: 41,
    hint: "Selecione todos os canais que sua empresa utiliza para vendas"
  },
  {
    module_number: 7,
    text: "Quais das seguintes ferramentas digitais sua empresa utiliza atualmente?",
    type: "checkbox",
    required: true,
    order_number: 42,
    hint: "Selecione todas as ferramentas digitais que sua empresa utiliza"
  },
  {
    module_number: 7,
    text: "Qual o investimento mensal em marketing que você faz hoje, ou pretende fazer ao longo do ano?",
    type: "radio",
    required: true,
    order_number: 43,
    hint: "Selecione a faixa que representa seu investimento em marketing"
  },
  {
    module_number: 7,
    text: "Como você mede a satisfação dos seus clientes?",
    type: "checkbox",
    required: true,
    order_number: 44,
    hint: "Selecione todos os métodos que você utiliza para medir a satisfação dos clientes"
  },
  
  // Módulo 8: Objetivos e Desafios
  {
    module_number: 8,
    text: "Quais são os objetivos da sua empresa para os próximos 12 meses?",
    type: "checkbox",
    required: true,
    order_number: 45,
    hint: "Selecione todos os objetivos relevantes para o próximo ano"
  },
  {
    module_number: 8,
    text: "Quais são os objetivos da sua empresa para os próximos 3-5 anos?",
    type: "checkbox",
    required: true,
    order_number: 46,
    hint: "Selecione todos os objetivos de médio prazo que se aplicam"
  },
  {
    module_number: 8,
    text: "Quais são os principais desafios que sua empresa enfrenta atualmente?",
    type: "checkbox",
    required: true,
    order_number: 47,
    hint: "Selecione todos os desafios relevantes para sua empresa"
  },
  {
    module_number: 8,
    text: "Dentre os desafios selecionados acima, qual você considera mais urgente resolver?",
    type: "textarea",
    required: true,
    order_number: 48,
    hint: "Escolha apenas um dos desafios que você selecionou na pergunta anterior"
  },
  {
    module_number: 8,
    text: "Como líder, quais são seus principais desafios pessoais na gestão do negócio?",
    type: "checkbox",
    required: true,
    order_number: 49,
    hint: "Selecione todos os desafios pessoais que você enfrenta como líder"
  },
  {
    module_number: 8,
    text: "Como esses desafios pessoais impactam o desenvolvimento do seu negócio?",
    type: "textarea",
    required: true,
    order_number: 50,
    hint: "Descreva como seus desafios pessoais afetam o crescimento e desenvolvimento da sua empresa"
  },
  
  // Módulo 9: Recursos Necessários
  {
    module_number: 9,
    text: "Quais recursos você considera mais importantes para o crescimento da sua empresa?",
    type: "checkbox",
    required: true,
    order_number: 51,
    hint: "Selecione todos os recursos que você considera cruciais para o crescimento"
  },
  
  // Módulo 10: Observações Finais
  {
    module_number: 10,
    text: "Observações adicionais ou comentários que gostaria de fazer:",
    type: "textarea",
    required: false,
    order_number: 52,
    hint: "Use este espaço para adicionar qualquer informação relevante que não foi abordada nas questões anteriores"
  }
];

// Estrutura das opções - EXATAMENTE como fornecidas no questionário
export const quizOptionsData: {
  question_number: number;
  text: string;
  order_number: number;
}[] = [
  // Pergunta 5: Características 
  {
    question_number: 5,
    text: "Idealista, criativo e visionário.",
    order_number: 1
  },
  {
    question_number: 5,
    text: "Comunicativo, amigável e colaborativo.",
    order_number: 2
  },
  {
    question_number: 5,
    text: "Organizado, meticuloso e confiável.",
    order_number: 3
  },
  {
    question_number: 5,
    text: "Ambicioso, focado e determinado",
    order_number: 4
  },
  
  // Pergunta 6: Alcançar resultados
  {
    question_number: 6,
    text: "Inovação e liberdade para explorar novas ideias.",
    order_number: 1
  },
  {
    question_number: 6,
    text: "Um ambiente harmonioso e colaboração com a equipe.",
    order_number: 2
  },
  {
    question_number: 6,
    text: "Planejamento e controle rigoroso dos detalhes.",
    order_number: 3
  },
  {
    question_number: 6,
    text: "Foco, disciplina e ação decidida.",
    order_number: 4
  },
  
  // Pergunta 7: Tomar decisões
  {
    question_number: 7,
    text: "Arriscar e experimentar novas abordagens.",
    order_number: 1
  },
  {
    question_number: 7,
    text: "Buscar consenso e ouvir opiniões diversas.",
    order_number: 2
  },
  {
    question_number: 7,
    text: "Analisar cuidadosamente todas as informações.",
    order_number: 3
  },
  {
    question_number: 7,
    text: "Agir rapidamente com firmeza.",
    order_number: 4
  },
  
  // Pergunta 8: Dia ideal
  {
    question_number: 8,
    text: "Tem a oportunidade de criar e inovar.",
    order_number: 1
  },
  {
    question_number: 8,
    text: "Conecta-se e colabora com outras pessoas.",
    order_number: 2
  },
  {
    question_number: 8,
    text: "Segue um plano bem definido e atinge metas com precisão.",
    order_number: 3
  },
  {
    question_number: 8,
    text: "Conquista desafios e lidera projetos com sucesso.",
    order_number: 4
  },
  
  // Pergunta 9: Desafios
  {
    question_number: 9,
    text: "Encarar os desafios como oportunidades para inovar.",
    order_number: 1
  },
  {
    question_number: 9,
    text: "Resolver desafios buscando apoio e mantendo o ambiente positivo.",
    order_number: 2
  },
  {
    question_number: 9,
    text: "Planejar e minimizar riscos para garantir que tudo funcione.",
    order_number: 3
  },
  {
    question_number: 9,
    text: "Tomar decisões rápidas e assertivas para superar obstáculos.",
    order_number: 4
  },
  
  // Pergunta 10: Personalidade
  {
    question_number: 10,
    text: "Minha criatividade e visão de futuro me permitem identificar oportunidades únicas.",
    order_number: 1
  },
  {
    question_number: 10,
    text: "Minha habilidade de criar relações fortalece a cultura e a rede de contatos.",
    order_number: 2
  },
  {
    question_number: 10,
    text: "Minha organização e precisão garantem a solidez dos processos.",
    order_number: 3
  },
  {
    question_number: 10,
    text: "Minha determinação e foco impulsionam resultados consistentes.",
    order_number: 4
  },
  
  // Pergunta 14: Área de atuação
  {
    question_number: 14,
    text: "Indústria",
    order_number: 1
  },
  {
    question_number: 14,
    text: "Comércio",
    order_number: 2
  },
  {
    question_number: 14,
    text: "Serviços",
    order_number: 3
  },
  {
    question_number: 14,
    text: "Outros",
    order_number: 4
  },
  
  // Pergunta 16: Website
  {
    question_number: 16,
    text: "Sim",
    order_number: 1
  },
  {
    question_number: 16,
    text: "Não",
    order_number: 2
  },
  
  // Pergunta 19: Tempo de mercado
  {
    question_number: 19,
    text: "Menos de 1 ano",
    order_number: 1
  },
  {
    question_number: 19,
    text: "1 a 3 anos",
    order_number: 2
  },
  {
    question_number: 19,
    text: "3 a 5 anos",
    order_number: 3
  },
  {
    question_number: 19,
    text: "5 a 10 anos",
    order_number: 4
  },
  {
    question_number: 19,
    text: "10 a 20 anos",
    order_number: 5
  },
  {
    question_number: 19,
    text: "mais de 20 anos",
    order_number: 6
  },
  
  // Pergunta 20: Faturamento
  {
    question_number: 20,
    text: "Até R$ 20.000",
    order_number: 1
  },
  {
    question_number: 20,
    text: "R$ 20.000 - R$ 100.000",
    order_number: 2
  },
  {
    question_number: 20,
    text: "R$ 100.000 - R$ 500.000",
    order_number: 3
  },
  {
    question_number: 20,
    text: "R$ 500.000 - R$ 1.000.000",
    order_number: 4
  },
  {
    question_number: 20,
    text: "Acima de R$ 1.000.000",
    order_number: 5
  },
  
  // Pergunta 21: Funcionários
  {
    question_number: 21,
    text: "1 a 10",
    order_number: 1
  },
  {
    question_number: 21,
    text: "11 a 50",
    order_number: 2
  },
  {
    question_number: 21,
    text: "51 a 100",
    order_number: 3
  },
  {
    question_number: 21,
    text: "101 a 200",
    order_number: 4
  },
  {
    question_number: 21,
    text: "Mais de 200",
    order_number: 5
  },
  
  // Pergunta 22: Potencial de crescimento
  {
    question_number: 22,
    text: "Muito Alto",
    order_number: 1
  },
  {
    question_number: 22,
    text: "Alto",
    order_number: 2
  },
  {
    question_number: 22,
    text: "Médio",
    order_number: 3
  },
  {
    question_number: 22,
    text: "Baixo",
    order_number: 4
  },
  {
    question_number: 22,
    text: "Muito baixo",
    order_number: 5
  },
  
  // Pergunta 23: Motivo de escolha (checkbox)
  {
    question_number: 23,
    text: "Preço Competitivo / Custo-Benefício",
    order_number: 1
  },
  {
    question_number: 23,
    text: "Qualidade Superior do Produto/Serviço",
    order_number: 2
  },
  {
    question_number: 23,
    text: "Atendimento/Suporte ao Cliente de Excelência",
    order_number: 3
  },
  {
    question_number: 23,
    text: "Relacionamento Próximo com o Cliente / Atendimento Personalizado",
    order_number: 4
  },
  {
    question_number: 23,
    text: "Ampla Variedade de Produtos/Serviços",
    order_number: 5
  },
  {
    question_number: 23,
    text: "Conveniência (localização, horários, facilidade de compra, entrega rápida)",
    order_number: 6
  },
  {
    question_number: 23,
    text: "Reputação da Marca / Confiança",
    order_number: 7
  },
  {
    question_number: 23,
    text: "Inovação / Tecnologia Diferenciada",
    order_number: 8
  },
  {
    question_number: 23,
    text: "Especialização / Expertise no Setor",
    order_number: 9
  },
  {
    question_number: 23,
    text: "Flexibilidade / Capacidade de Adaptação às Necessidades do Cliente",
    order_number: 10
  },
  {
    question_number: 23,
    text: "Prazos de Entrega / Agilidade na Prestação do Serviço",
    order_number: 11
  },
  {
    question_number: 23,
    text: "Suporte Pós-Venda / Garantia",
    order_number: 12
  },
  {
    question_number: 23,
    text: "Facilidade de Fazer Negócio (processos simples, plataforma online intuitiva)",
    order_number: 13
  },
  {
    question_number: 23,
    text: "Valores da Empresa / Responsabilidade Social/Ambiental",
    order_number: 14
  },
  {
    question_number: 23,
    text: "Indicações / Marketing Boca a Boca",
    order_number: 15
  },
  {
    question_number: 23,
    text: "Outro",
    order_number: 16
  },
  
  // Pergunta 27: Público-alvo
  {
    question_number: 27,
    text: "Consumidor final (B2C)",
    order_number: 1
  },
  {
    question_number: 27,
    text: "Outras empresas (B2B)",
    order_number: 2
  },
  {
    question_number: 27,
    text: "Governo (B2G)",
    order_number: 3
  },
  {
    question_number: 27,
    text: "Outro",
    order_number: 4
  },
  
  // Pergunta 28: Faixa etária
  {
    question_number: 28,
    text: "Abaixo de 18 anos",
    order_number: 1
  },
  {
    question_number: 28,
    text: "18 a 25 anos",
    order_number: 2
  },
  {
    question_number: 28,
    text: "26 a 35 anos",
    order_number: 3
  },
  {
    question_number: 28,
    text: "36 a 45 anos",
    order_number: 4
  },
  {
    question_number: 28,
    text: "46 a 55 anos",
    order_number: 5
  },
  {
    question_number: 28,
    text: "56 a 65 anos",
    order_number: 6
  },
  {
    question_number: 28,
    text: "Acima dos 65 anos",
    order_number: 7
  },
  {
    question_number: 28,
    text: "Todas as faixas etárias",
    order_number: 8
  },
  
  // Pergunta 29: Gênero
  {
    question_number: 29,
    text: "Masculino",
    order_number: 1
  },
  {
    question_number: 29,
    text: "Feminino",
    order_number: 2
  },
  {
    question_number: 29,
    text: "Ambos",
    order_number: 3
  },
  {
    question_number: 29,
    text: "Não Binário",
    order_number: 4
  },
  
  // Pergunta 30: Renda
  {
    question_number: 30,
    text: "Até R$ 2.000",
    order_number: 1
  },
  {
    question_number: 30,
    text: "R$ 2.001 - R$ 4.000",
    order_number: 2
  },
  {
    question_number: 30,
    text: "R$ 4.001 - R$ 8.000",
    order_number: 3
  },
  {
    question_number: 30,
    text: "R$ 8.001 - R$ 15.000",
    order_number: 4
  },
  {
    question_number: 30,
    text: "R$ 15.001 - R$ 30.000",
    order_number: 5
  },
  {
    question_number: 30,
    text: "R$ 30.000 - R$ 100.000",
    order_number: 6
  },
  {
    question_number: 30,
    text: "Acima de R$ 100.000",
    order_number: 7
  },
  
  // Pergunta 31: Escolaridade
  {
    question_number: 31,
    text: "Ensino fundamental",
    order_number: 1
  },
  {
    question_number: 31,
    text: "Ensino médio",
    order_number: 2
  },
  {
    question_number: 31,
    text: "Superior incompleto",
    order_number: 3
  },
  {
    question_number: 31,
    text: "Superior completo",
    order_number: 4
  },
  {
    question_number: 31,
    text: "Pós-graduação",
    order_number: 5
  },
  
  // Pergunta 32: Frequência
  {
    question_number: 32,
    text: "Diariamente",
    order_number: 1
  },
  {
    question_number: 32,
    text: "Semanalmente",
    order_number: 2
  },
  {
    question_number: 32,
    text: "Mensalmente",
    order_number: 3
  },
  {
    question_number: 32,
    text: "Anualmente",
    order_number: 4
  },
  {
    question_number: 32,
    text: "Ocasionalmente",
    order_number: 5
  },
  
  // Pergunta 33: Fontes de informação (checkbox)
  {
    question_number: 33,
    text: "Sites de busca (Google, Bing, etc.)",
    order_number: 1
  },
  {
    question_number: 33,
    text: "Redes sociais (Instagram, Facebook, LinkedIn, TikTok, etc.)",
    order_number: 2
  },
  {
    question_number: 33,
    text: "Indicações (amigos, familiares, colegas)",
    order_number: 3
  },
  {
    question_number: 33,
    text: "Website da própria empresa / Lojas online da marca",
    order_number: 4
  },
  {
    question_number: 33,
    text: "Marketplaces (Mercado Livre, Amazon, Shopee, etc.)",
    order_number: 5
  },
  {
    question_number: 33,
    text: "Sites de avaliação e comparação (Reclame Aqui, Google Reviews, Buscapé, Zoom, etc.)",
    order_number: 6
  },
  {
    question_number: 33,
    text: "Influenciadores digitais / Criadores de conteúdo",
    order_number: 7
  },
  {
    question_number: 33,
    text: "Blogs e sites especializados do setor",
    order_number: 8
  },
  {
    question_number: 33,
    text: "YouTube",
    order_number: 9
  },
  {
    question_number: 33,
    text: "Fóruns e comunidades online",
    order_number: 10
  },
  {
    question_number: 33,
    text: "Eventos, feiras e conferências do setor",
    order_number: 11
  },
  {
    question_number: 33,
    text: "Mídia tradicional (TV, rádio, jornais, revistas - impressos ou online)",
    order_number: 12
  },
  {
    question_number: 33,
    text: "Visita à loja física / Ponto de venda",
    order_number: 13
  },
  {
    question_number: 33,
    text: "Publicidade online (banners, anúncios em redes sociais/buscadores)",
    order_number: 14
  },
  {
    question_number: 33,
    text: "E-mail marketing / Newsletters",
    order_number: 15
  },
  {
    question_number: 33,
    text: "Consultores / Especialistas",
    order_number: 16
  },
  {
    question_number: 33,
    text: "Associações profissionais",
    order_number: 17
  },
  {
    question_number: 33,
    text: "Outros",
    order_number: 18
  },
  
  // Pergunta 34: O que importa (checkbox)
  {
    question_number: 34,
    text: "Qualidade do produto/serviço: A excelência e performance daquilo que é oferecido.",
    order_number: 1
  },
  {
    question_number: 34,
    text: "Preço / Custo-benefício: O valor percebido em relação ao custo.",
    order_number: 2
  },
  {
    question_number: 34,
    text: "Atendimento / Suporte ao cliente: A qualidade da interação e do apoio recebido.",
    order_number: 3
  },
  {
    question_number: 34,
    text: "Confiança / Reputação da marca: A credibilidade e imagem da empresa no mercado.",
    order_number: 4
  },
  {
    question_number: 34,
    text: "Conveniência: Facilidade de acesso, compra, localização, horários, entrega rápida.",
    order_number: 5
  },
  {
    question_number: 34,
    text: "Rapidez / Agilidade: Seja na entrega do produto ou na execução do serviço.",
    order_number: 6
  },
  {
    question_number: 34,
    text: "Relacionamento próximo / Atendimento personalizado: Sentir-se único e bem cuidado pela empresa.",
    order_number: 7
  },
  {
    question_number: 34,
    text: "Expertise / Conhecimento especializado: A percepção de que a empresa domina o assunto.",
    order_number: 8
  },
  {
    question_number: 34,
    text: "Inovação / Tecnologia: Acesso a soluções modernas ou diferenciadas.",
    order_number: 9
  },
  {
    question_number: 34,
    text: "Variedade de opções: Ter um portfólio amplo de produtos ou serviços.",
    order_number: 10
  },
  {
    question_number: 34,
    text: "Facilidade de uso / Processos simples: Intuitividade do produto ou simplicidade na contratação/compra.",
    order_number: 11
  },
  {
    question_number: 34,
    text: "Suporte pós-venda / Garantia: Segurança e apoio após a compra.",
    order_number: 12
  },
  {
    question_number: 34,
    text: "Flexibilidade / Customização: Capacidade da empresa de adaptar a oferta às necessidades específicas.",
    order_number: 13
  },
  {
    question_number: 34,
    text: "Alinhamento com valores / Responsabilidade social/ambiental: Identificação com os princípios da empresa.",
    order_number: 14
  },
  {
    question_number: 34,
    text: "Exclusividade / Diferenciação: Ter algo que a concorrência não oferece.",
    order_number: 15
  },
  {
    question_number: 34,
    text: "Outro",
    order_number: 16
  },
  
  // Pergunta 41: Canais de venda (checkbox)
  {
    question_number: 41,
    text: "Loja física própria: Ponto de venda físico operado pela empresa.",
    order_number: 1
  },
  {
    question_number: 41,
    text: "E-commerce (website ou aplicativo próprio): Plataforma de vendas online da empresa.",
    order_number: 2
  },
  {
    question_number: 41,
    text: "Marketplaces: Plataformas de terceiros (Ex: Mercado Livre, Amazon, Magazine Luiza, iFood, Rappi, marketplaces de nicho).",
    order_number: 3
  },
  {
    question_number: 41,
    text: "Redes sociais: Vendas realizadas diretamente via plataformas como Instagram Shopping, Facebook Marketplace, ou por mensagens diretas.",
    order_number: 4
  },
  {
    question_number: 41,
    text: "WhatsApp / Aplicativos de mensagem: Vendas e negociações concluídas através desses apps.",
    order_number: 5
  },
  {
    question_number: 41,
    text: "Venda direta: Por meio de consultores, representantes autônomos, venda porta a porta.",
    order_number: 6
  },
  {
    question_number: 41,
    text: "Equipe de vendas própria (interna ou externa): Vendedores contratados pela empresa, atuando no campo ou internamente.",
    order_number: 7
  },
  {
    question_number: 41,
    text: "Venda por telefone (Televendas): Vendas ativas ou receptivas realizadas por telefone.",
    order_number: 8
  },
  {
    question_number: 41,
    text: "Representantes comerciais / Agentes: Terceiros que representam a empresa e seus produtos/serviços.",
    order_number: 9
  },
  {
    question_number: 41,
    text: "Distribuidores / Atacadistas: Venda em volume para intermediários que revendem o produto.",
    order_number: 10
  },
  {
    question_number: 41,
    text: "Varejistas parceiros: Venda através de outras lojas (físicas ou online) que não pertencem à empresa.",
    order_number: 11
  },
  {
    question_number: 41,
    text: "Programa de afiliados / Parcerias: Vendas geradas por parceiros que promovem os produtos/serviços em troca de comissão.",
    order_number: 12
  },
  {
    question_number: 41,
    text: "Eventos / Feiras: Vendas realizadas durante feiras de negócios, exposições ou eventos próprios.",
    order_number: 13
  },
  {
    question_number: 41,
    text: "Catálogos / Mala direta: Vendas por meio de catálogos impressos ou digitais enviados aos clientes.",
    order_number: 14
  },
  {
    question_number: 41,
    text: "Franquias: (Aplicável se a empresa for franqueadora e vender através de unidades franqueadas).",
    order_number: 15
  },
  {
    question_number: 41,
    text: "Outros",
    order_number: 16
  },
  
  // Pergunta 42: Ferramentas digitais (checkbox)
  // Comunicação e Colaboração
  {
    question_number: 42,
    text: "E-mail corporativo (Ex: Google Workspace, Microsoft 365)",
    order_number: 1
  },
  {
    question_number: 42,
    text: "Plataformas de comunicação em equipe (Ex: Slack, Microsoft Teams, Google Chat)",
    order_number: 2
  },
  {
    question_number: 42,
    text: "Ferramentas de videoconferência (Ex: Zoom, Google Meet, Microsoft Teams)",
    order_number: 3
  },
  {
    question_number: 42,
    text: "Ferramentas de gestão de projetos e tarefas (Ex: Trello, Asana, Monday.com, Jira)",
    order_number: 4
  },
  {
    question_number: 42,
    text: "Armazenamento e compartilhamento de arquivos em nuvem (Ex: Google Drive, OneDrive, Dropbox)",
    order_number: 5
  },
  {
    question_number: 42,
    text: "Intranet ou portal do colaborador",
    order_number: 6
  },
  // Marketing e Vendas
  {
    question_number: 42,
    text: "Software de CRM (Gestão de Relacionamento com o Cliente - Ex: Salesforce, HubSpot, RD Station CRM, Agendor)",
    order_number: 7
  },
  {
    question_number: 42,
    text: "Plataforma de automação de marketing / E-mail marketing (Ex: RD Station Marketing, HubSpot, Mailchimp)",
    order_number: 8
  },
  {
    question_number: 42,
    text: "Ferramentas de gestão de redes sociais (Ex: mLabs, Etus, Hootsuite)",
    order_number: 9
  },
  {
    question_number: 42,
    text: "Plataformas de publicidade online (Ex: Google Ads, Meta Ads - Facebook/Instagram, LinkedIn Ads, TikTok Ads)",
    order_number: 10
  },
  {
    question_number: 42,
    text: "Ferramentas de análise de dados web e marketing (Ex: Google Analytics 4)",
    order_number: 11
  },
  {
    question_number: 42,
    text: "Plataforma de E-commerce (Ex: VTEX, Shopify, Nuvemshop, Loja Integrada, Magento, WooCommerce)",
    order_number: 12
  },
  {
    question_number: 42,
    text: "Ferramentas de SEO (Otimização para Buscadores - Ex: SEMrush, Google Search Console)",
    order_number: 13
  },
  {
    question_number: 42,
    text: "Ferramentas de criação de conteúdo digital (Ex: Canva, Adobe Creative Cloud, editores de vídeo)",
    order_number: 14
  },
  {
    question_number: 42,
    text: "Plataformas de marketing de afiliados",
    order_number: 15
  },
  {
    question_number: 42,
    text: "Ferramentas de inteligência de vendas / Sales Intelligence",
    order_number: 16
  },
  // Gestão e Operações
  {
    question_number: 42,
    text: "Sistema Integrado de Gestão Empresarial (ERP - Ex: TOTVS, SAP, Sankhya, Omie, Conta Azul)",
    order_number: 17
  },
  {
    question_number: 42,
    text: "Software de gestão financeira / Contabilidade online (Ex: Conta Azul, Omie, Quickbooks)",
    order_number: 18
  },
  {
    question_number: 42,
    text: "Software de gestão de estoque / WMS",
    order_number: 19
  },
  {
    question_number: 42,
    text: "Software de logística / Roteirização / Rastreamento",
    order_number: 20
  },
  {
    question_number: 42,
    text: "Internet Banking e meios de pagamento digitais (incluindo Pix para Empresas, Gateways de Pagamento)",
    order_number: 21
  },
  {
    question_number: 42,
    text: "Assinatura eletrônica de documentos (Ex: DocuSign, Clicksign, ZapSign)",
    order_number: 22
  },
  {
    question_number: 42,
    text: "Ferramentas de agendamento online",
    order_number: 23
  },
  {
    question_number: 42,
    text: "Software de gestão de frotas",
    order_number: 24
  },
  {
    question_number: 42,
    text: "Plataformas de Business Process Management (BPM)",
    order_number: 25
  },
  // Recursos Humanos
  {
    question_number: 42,
    text: "Software de gestão de RH / Departamento Pessoal / Folha de pagamento online",
    order_number: 26
  },
  {
    question_number: 42,
    text: "Plataformas de recrutamento e seleção (Ex: Gupy, Kenoby/PandaPé, LinkedIn Recruiter)",
    order_number: 27
  },
  {
    question_number: 42,
    text: "Plataformas de gestão de desempenho e feedback",
    order_number: 28
  },
  {
    question_number: 42,
    text: "Plataformas de treinamento e desenvolvimento online (LMS)",
    order_number: 29
  },
  {
    question_number: 42,
    text: "Ferramentas de pesquisa de clima organizacional",
    order_number: 30
  },
  // Atendimento ao Cliente
  {
    question_number: 42,
    text: "Plataforma de atendimento ao cliente omnichannel (Help Desk, Chat, Chatbots, Tickets - Ex: Zendesk, Movidesk, Intercom, JivoChat)",
    order_number: 31
  },
  {
    question_number: 42,
    text: "Software para pesquisas de satisfação (Ex: NPS - Net Promoter Score)",
    order_number: 32
  },
  {
    question_number: 42,
    text: "URA (Unidade de Resposta Audível) inteligente / Telefonia digital",
    order_number: 33
  },
  // Tecnologia, Dados e Inteligência
  {
    question_number: 42,
    text: "Ferramentas de Business Intelligence (BI) e Data Analytics (Ex: Power BI, Tableau, Google Looker Studio)",
    order_number: 34
  },
  {
    question_number: 42,
    text: "Ferramentas de Inteligência Artificial (para automação de tarefas, análise preditiva, chatbots avançados, criação de conteúdo, etc.)",
    order_number: 35
  },
  {
    question_number: 42,
    text: "Soluções de segurança cibernética (Antivírus corporativo, Firewall, VPN, Gestão de Identidade)",
    order_number: 36
  },
  {
    question_number: 42,
    text: "Serviços de computação em nuvem (IaaS, PaaS, SaaS - Ex: AWS, Microsoft Azure, Google Cloud Platform)",
    order_number: 37
  },
  {
    question_number: 42,
    text: "Ferramentas de monitoramento de infraestrutura de TI",
    order_number: 38
  },
  {
    question_number: 42,
    text: "Soluções de backup e recuperação de desastres",
    order_number: 39
  },
  {
    question_number: 42,
    text: "Outros",
    order_number: 40
  },
  
  // Pergunta 43: Investimento marketing
  {
    question_number: 43,
    text: "Não invisto nada em marketing, atualmente",
    order_number: 1
  },
  {
    question_number: 43,
    text: "Até R$ 500",
    order_number: 2
  },
  {
    question_number: 43,
    text: "R$ 501 - R$ 1.000",
    order_number: 3
  },
  {
    question_number: 43,
    text: "R$ 1.001 - R$ 5.000",
    order_number: 4
  },
  {
    question_number: 43,
    text: "R$ 5.001 - R$ 10.000",
    order_number: 5
  },
  {
    question_number: 43,
    text: "R$ 10.001 - R$ 20.000",
    order_number: 6
  },
  {
    question_number: 43,
    text: "R$ 20,001 - R$ 50.000",
    order_number: 7
  },
  {
    question_number: 43,
    text: "Acima de R$ 50.000",
    order_number: 8
  },
  
  // Pergunta 44: Satisfação dos clientes (checkbox)
  {
    question_number: 44,
    text: "Pesquisas de satisfação (online, por telefone, presenciais)",
    order_number: 1
  },
  {
    question_number: 44,
    text: "Análise de redes sociais (menções, comentários, sentimentos)",
    order_number: 2
  },
  {
    question_number: 44,
    text: "Indicadores de desempenho (KPIs) (ex: taxa de retenção, churn rate, ticket médio)",
    order_number: 3
  },
  {
    question_number: 44,
    text: "Frequência de compra/visita",
    order_number: 4
  },
  {
    question_number: 44,
    text: "Net Promoter Score (NPS)",
    order_number: 5
  },
  {
    question_number: 44,
    text: "Customer Effort Score (CES)",
    order_number: 6
  },
  {
    question_number: 44,
    text: "Análise de comentários e avaliações em plataformas online (ex: Google Meu Negócio, Reclame Aqui, marketplaces)",
    order_number: 7
  },
  {
    question_number: 44,
    text: "Monitoramento de e-mails e chats de atendimento ao cliente",
    order_number: 8
  },
  {
    question_number: 44,
    text: "Gravação e análise de ligações de atendimento ao cliente",
    order_number: 9
  },
  {
    question_number: 44,
    text: "Grupos focais com clientes",
    order_number: 10
  },
  {
    question_number: 44,
    text: "Testes de usabilidade de produtos/serviços digitais",
    order_number: 11
  },
  {
    question_number: 44,
    text: "Análise do comportamento do cliente em plataformas digitais (ex: tempo de permanência no site, páginas visitadas)",
    order_number: 12
  },
  {
    question_number: 44,
    text: "Feedback direto de vendedores e atendentes",
    order_number: 13
  },
  {
    question_number: 44,
    text: "Observação direta do comportamento do cliente no ponto de venda/prestação de serviço (ex: expressões faciais, linguagem corporal)",
    order_number: 14
  },
  {
    question_number: 44,
    text: "Feedback verbal espontâneo dos clientes durante o atendimento",
    order_number: 15
  },
  {
    question_number: 44,
    text: "Percepção do dono/gerente sobre o nível de satisfação dos clientes habituais",
    order_number: 16
  },
  {
    question_number: 44,
    text: "Taxa de recompra/recontratação de serviços",
    order_number: 17
  },
  {
    question_number: 44,
    text: "Número de indicações de novos clientes (boca a boca)",
    order_number: 18
  },
  {
    question_number: 44,
    text: "Outros",
    order_number: 19
  },
  
  // Pergunta 45: Objetivos próximos 12 meses (checkbox)
  {
    question_number: 45,
    text: "Aumentar o faturamento",
    order_number: 1
  },
  {
    question_number: 45,
    text: "Expandir base de clientes",
    order_number: 2
  },
  {
    question_number: 45,
    text: "Lançar novos produtos/serviços",
    order_number: 3
  },
  {
    question_number: 45,
    text: "Melhorar margens de lucro",
    order_number: 4
  },
  {
    question_number: 45,
    text: "Otimizar processos operacionais",
    order_number: 5
  },
  {
    question_number: 45,
    text: "Investir em marketing digital",
    order_number: 6
  },
  {
    question_number: 45,
    text: "Implementar sistema de gestão",
    order_number: 7
  },
  {
    question_number: 45,
    text: "Expandir equipe",
    order_number: 8
  },
  {
    question_number: 45,
    text: "Abrir nova unidade/filial",
    order_number: 9
  },
  {
    question_number: 45,
    text: "Desenvolver parcerias estratégicas",
    order_number: 10
  },
  {
    question_number: 45,
    text: "Melhorar a experiência do cliente",
    order_number: 11
  },
  {
    question_number: 45,
    text: "Não sei responder",
    order_number: 12
  },
  {
    question_number: 45,
    text: "Outro",
    order_number: 13
  },
  
  // Pergunta 46: Objetivos próximos 3-5 anos (checkbox)
  {
    question_number: 46,
    text: "Ser referência no segmento",
    order_number: 1
  },
  {
    question_number: 46,
    text: "Expandir para outros estados/países",
    order_number: 2
  },
  {
    question_number: 46,
    text: "Diversificar portfolio de produtos/serviços",
    order_number: 3
  },
  {
    question_number: 46,
    text: "Desenvolver nova linha de negócios",
    order_number: 4
  },
  {
    question_number: 46,
    text: "Automatizar processos principais",
    order_number: 5
  },
  {
    question_number: 46,
    text: "Criar franquia do negócio",
    order_number: 6
  },
  {
    question_number: 46,
    text: "Atrair investimentos externos",
    order_number: 7
  },
  {
    question_number: 46,
    text: "Realizar aquisições estratégicas",
    order_number: 8
  },
  {
    question_number: 46,
    text: "Desenvolver modelo de negócio escalável",
    order_number: 9
  },
  {
    question_number: 46,
    text: "Preparar empresa para venda/sucessão",
    order_number: 10
  },
  {
    question_number: 46,
    text: "Não sei responder",
    order_number: 11
  },
  {
    question_number: 46,
    text: "Outro",
    order_number: 12
  },
  
  // Pergunta 47: Principais desafios (checkbox)
  {
    question_number: 47,
    text: "Aumentar vendas/receita",
    order_number: 1
  },
  {
    question_number: 47,
    text: "Reduzir custos operacionais",
    order_number: 2
  },
  {
    question_number: 47,
    text: "Melhorar a qualidade dos produtos/serviços",
    order_number: 3
  },
  {
    question_number: 47,
    text: "Expandir para novos mercados",
    order_number: 4
  },
  {
    question_number: 47,
    text: "Desenvolver novos produtos/serviços",
    order_number: 5
  },
  {
    question_number: 47,
    text: "Contratar e reter talentos",
    order_number: 6
  },
  {
    question_number: 47,
    text: "Melhorar processos internos",
    order_number: 7
  },
  {
    question_number: 47,
    text: "Implementar tecnologias",
    order_number: 8
  },
  {
    question_number: 47,
    text: "Gestão financeira",
    order_number: 9
  },
  {
    question_number: 47,
    text: "Marketing e divulgação",
    order_number: 10
  },
  {
    question_number: 47,
    text: "Concorrência acirrada",
    order_number: 11
  },
  {
    question_number: 47,
    text: "Regulamentações e compliance",
    order_number: 12
  },
  {
    question_number: 47,
    text: "Outro",
    order_number: 13
  },
  
  // Pergunta 49: Desafios pessoais (checkbox)
  {
    question_number: 49,
    text: "Gerenciar tempo",
    order_number: 1
  },
  {
    question_number: 49,
    text: "Delegar responsabilidades",
    order_number: 2
  },
  {
    question_number: 49,
    text: "Tomar decisões estratégicas",
    order_number: 3
  },
  {
    question_number: 49,
    text: "Lidar com stress e pressão",
    order_number: 4
  },
  {
    question_number: 49,
    text: "Equilibrar vida pessoal e profissional",
    order_number: 5
  },
  {
    question_number: 49,
    text: "Desenvolver habilidades de liderança",
    order_number: 6
  },
  {
    question_number: 49,
    text: "Networking e relacionamentos",
    order_number: 7
  },
  {
    question_number: 49,
    text: "Manter-se atualizado com tendências do mercado",
    order_number: 8
  },
  {
    question_number: 49,
    text: "Gestão de conflitos",
    order_number: 9
  },
  {
    question_number: 49,
    text: "Comunicação efetiva",
    order_number: 10
  },
  {
    question_number: 49,
    text: "Atrair e reter talentos",
    order_number: 11
  },
  {
    question_number: 49,
    text: "Construir e manter uma cultura organizacional positiva",
    order_number: 12
  },
  {
    question_number: 49,
    text: "Fomentar a inovação e a criatividade na equipe",
    order_number: 13
  },
  {
    question_number: 49,
    text: "Gerenciar as finanças e a rentabilidade do negócio",
    order_number: 14
  },
  {
    question_number: 49,
    text: "Adaptar-se a mudanças no mercado e na tecnologia",
    order_number: 15
  },
  {
    question_number: 49,
    text: "Manter a motivação e o engajamento da equipe",
    order_number: 16
  },
  {
    question_number: 49,
    text: "Lidar com a incerteza e a ambiguidade",
    order_number: 17
  },
  {
    question_number: 49,
    text: "Manter a própria motivação e resiliência",
    order_number: 18
  },
  {
    question_number: 49,
    text: "Definir e comunicar a visão e os valores da empresa",
    order_number: 19
  },
  {
    question_number: 49,
    text: "Garantir a sustentabilidade e a responsabilidade social do negócio",
    order_number: 20
  },
  {
    question_number: 49,
    text: "Lidar com a burocracia e regulamentações",
    order_number: 21
  },
  {
    question_number: 49,
    text: "Encontrar o equilíbrio entre o curto e o longo prazo nas decisões",
    order_number: 22
  },
  {
    question_number: 49,
    text: "Construir confiança e transparência com a equipe",
    order_number: 23
  },
  {
    question_number: 49,
    text: "Gerenciar o crescimento do negócio de forma sustentável",
    order_number: 24
  },
  {
    question_number: 49,
    text: "Outros",
    order_number: 25
  },
  
  // Pergunta 51: Recursos para crescimento (checkbox)
  {
    question_number: 51,
    text: "Acesso a capital (investimento, financiamento, etc.)",
    order_number: 1
  },
  {
    question_number: 51,
    text: "Adoção de tecnologias inovadoras e adequadas",
    order_number: 2
  },
  {
    question_number: 51,
    text: "Talentos e equipe altamente qualificada e engajada",
    order_number: 3
  },
  {
    question_number: 51,
    text: "Estabelecimento de parcerias estratégicas e colaborativas",
    order_number: 4
  },
  {
    question_number: 51,
    text: "Acesso a mentoria e aconselhamento especializado",
    order_number: 5
  },
  {
    question_number: 51,
    text: "Marketing e Vendas eficazes",
    order_number: 6
  },
  {
    question_number: 51,
    text: "Infraestrutura adequada (física e digital)",
    order_number: 7
  },
  {
    question_number: 51,
    text: "Propriedade Intelectual (patentes, marcas, etc.)",
    order_number: 8
  },
  {
    question_number: 51,
    text: "Acesso a dados e análise para tomada de decisões",
    order_number: 9
  },
  {
    question_number: 51,
    text: "Marca forte e boa reputação",
    order_number: 10
  },
  {
    question_number: 51,
    text: "Cultura de inovação e investimento em Pesquisa e Desenvolvimento (P&D)",
    order_number: 11
  },
  {
    question_number: 51,
    text: "Acesso a novos mercados (nacionais e internacionais)",
    order_number: 12
  },
  {
    question_number: 51,
    text: "Processos de gestão eficientes",
    order_number: 13
  },
  {
    question_number: 51,
    text: "Cadeia de suprimentos confiável",
    order_number: 14
  },
  {
    question_number: 51,
    text: "Liderança visionária e estratégica",
    order_number: 15
  },
  {
    question_number: 51,
    text: "Flexibilidade e capacidade de adaptação",
    order_number: 16
  },
  {
    question_number: 51,
    text: "Conhecimento profundo do mercado e dos clientes",
    order_number: 17
  },
  {
    question_number: 51,
    text: "Sustentabilidade e práticas de ESG (Ambiental, Social e Governança)",
    order_number: 18
  },
  {
    question_number: 51,
    text: "Comunicação eficaz (interna e externa)",
    order_number: 19
  },
  {
    question_number: 51,
    text: "Cultura de aprendizado contínuo",
    order_number: 20
  },
  {
    question_number: 51,
    text: "Outros",
    order_number: 21
  }
];
