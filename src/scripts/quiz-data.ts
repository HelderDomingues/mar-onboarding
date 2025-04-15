
import { QuizModule, QuizQuestion, QuizOption } from '@/types/quiz';

export const quizModulesData: Omit<QuizModule, 'id' | 'created_at' | 'updated_at'>[] = [
  { 
    title: "Mercado", 
    description: "Perguntas sobre seu mercado e posicionamento", 
    order_number: 1,
    is_active: true
  },
  { 
    title: "Atração", 
    description: "Perguntas sobre captação de clientes", 
    order_number: 2,
    is_active: true
  },
  { 
    title: "Relacionamento", 
    description: "Perguntas sobre relacionamento com clientes", 
    order_number: 3,
    is_active: true
  },
  { 
    title: "Monetização", 
    description: "Perguntas sobre modelos de monetização", 
    order_number: 4,
    is_active: true
  },
  { 
    title: "Produto", 
    description: "Perguntas sobre seu produto ou serviço", 
    order_number: 5,
    is_active: true
  },
  { 
    title: "Análise", 
    description: "Perguntas sobre análise de dados", 
    order_number: 6,
    is_active: true
  },
  { 
    title: "Revenue", 
    description: "Perguntas sobre receita e faturamento", 
    order_number: 7,
    is_active: true
  }
];

export const quizQuestionsData: Omit<QuizQuestion, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    module_id: 'module_1', // This will be replaced with actual module ID during seeding
    text: "Qual o nome da sua empresa?",
    type: "text",
    required: true,
    order_number: 1,
    hint: "Digite o nome completo da sua empresa conforme registro"
  },
  {
    module_id: 'module_1',
    text: "Há quanto tempo sua empresa existe?",
    type: "radio",
    required: true,
    order_number: 2,
    hint: "Selecione a opção que melhor representa o tempo de existência da sua empresa"
  }
  // Add more questions here, following the same pattern
];

export const quizOptionsData: Omit<QuizOption, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    question_id: 'question_1_2', // This will be replaced with actual question ID during seeding
    text: "Menos de 1 ano",
    order_number: 1
  },
  {
    question_id: 'question_1_2',
    text: "1-3 anos",
    order_number: 2
  }
  // Add more options here, following the same pattern
];

