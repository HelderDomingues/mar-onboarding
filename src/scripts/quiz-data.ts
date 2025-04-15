
import { v4 as uuidv4 } from 'uuid';

/**
 * Dados dos módulos do questionário MAR
 */
export const quizModulesData = [
  {
    title: "Informações Pessoais",
    description: "Informações básicas sobre você e sua empresa",
    order_number: 1
  },
  {
    title: "Marketing",
    description: "Análise da estratégia de marketing do seu negócio",
    order_number: 2
  },
  {
    title: "Vendas",
    description: "Avaliação do processo de vendas e conversão",
    order_number: 3
  },
  {
    title: "Atendimento",
    description: "Análise do atendimento ao cliente e suporte",
    order_number: 4
  },
  {
    title: "Financeiro",
    description: "Avaliação da gestão financeira do negócio",
    order_number: 5
  },
  {
    title: "Recursos Humanos",
    description: "Análise da gestão de pessoas e cultura organizacional",
    order_number: 6
  },
  {
    title: "Operacional",
    description: "Avaliação da estrutura operacional e processos",
    order_number: 7
  }
];

/**
 * Dados das perguntas do questionário MAR
 */
export const quizQuestionsData = [
  // Módulo 1: Informações Pessoais
  {
    text: "Qual é o seu nome completo?",
    type: "text",
    required: true,
    module_number: 1,
    order_number: 1
  },
  {
    text: "Qual é o seu e-mail para contato?",
    type: "email",
    required: true,
    module_number: 1,
    order_number: 2,
    validation: "email"
  },
  {
    text: "Qual é o seu telefone/WhatsApp?",
    type: "text",
    required: true,
    module_number: 1,
    order_number: 3,
    validation: "phone",
    placeholder: "Apenas números com DDD (ex: 11999999999)"
  },
  {
    text: "Qual é o nome da sua empresa?",
    type: "text",
    required: true,
    module_number: 1,
    order_number: 4
  },
  {
    text: "Qual é o segmento da sua empresa?",
    type: "text",
    required: true,
    module_number: 1,
    order_number: 5,
    hint: "Por exemplo: E-commerce, Consultoria, Tecnologia, Saúde, etc."
  },
  {
    text: "Há quanto tempo sua empresa está no mercado?",
    type: "radio",
    required: true,
    module_number: 1,
    order_number: 6
  },
  {
    text: "Quantos funcionários ou colaboradores sua empresa possui atualmente?",
    type: "radio",
    required: true,
    module_number: 1,
    order_number: 7
  },
  {
    text: "Qual é o seu faturamento anual aproximado?",
    type: "radio",
    required: true,
    module_number: 1,
    order_number: 8,
    hint: "Esta informação é confidencial e será usada apenas para análise"
  }
];

/**
 * Dados das opções de resposta do questionário MAR
 */
export const quizOptionsData = [
  // Opções para pergunta 6 (Tempo no mercado)
  {
    text: "Menos de 1 ano",
    question_number: 6,
    order_number: 1
  },
  {
    text: "Entre 1 e 3 anos",
    question_number: 6,
    order_number: 2
  },
  {
    text: "Entre 3 e 5 anos",
    question_number: 6,
    order_number: 3
  },
  {
    text: "Entre 5 e 10 anos",
    question_number: 6,
    order_number: 4
  },
  {
    text: "Mais de 10 anos",
    question_number: 6,
    order_number: 5
  },
  
  // Opções para pergunta 7 (Número de funcionários)
  {
    text: "Somente eu",
    question_number: 7,
    order_number: 1
  },
  {
    text: "2 a 5 colaboradores",
    question_number: 7,
    order_number: 2
  },
  {
    text: "6 a 10 colaboradores",
    question_number: 7,
    order_number: 3
  },
  {
    text: "11 a 20 colaboradores",
    question_number: 7,
    order_number: 4
  },
  {
    text: "21 a 50 colaboradores",
    question_number: 7,
    order_number: 5
  },
  {
    text: "Mais de 50 colaboradores",
    question_number: 7,
    order_number: 6
  },
  
  // Opções para pergunta 8 (Faturamento)
  {
    text: "Até R$ 100 mil",
    question_number: 8,
    order_number: 1
  },
  {
    text: "Entre R$ 100 mil e R$ 300 mil",
    question_number: 8,
    order_number: 2
  },
  {
    text: "Entre R$ 300 mil e R$ 1 milhão",
    question_number: 8,
    order_number: 3
  },
  {
    text: "Entre R$ 1 milhão e R$ 5 milhões",
    question_number: 8,
    order_number: 4
  },
  {
    text: "Acima de R$ 5 milhões",
    question_number: 8,
    order_number: 5
  },
  {
    text: "Prefiro não informar",
    question_number: 8,
    order_number: 6
  }
];
