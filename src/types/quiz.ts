
export interface QuizModule {
  id: string;
  title: string;
  description: string | null;
  order_number: number;
}

export interface QuizSection {
  id: string;
  module_id: string;
  name: string;
  order_number: number;
}

export interface QuizQuestion {
  id: string;
  module_id: string;
  section_id?: string;
  text: string;
  type: 'text' | 'number' | 'email' | 'radio' | 'checkbox' | 'textarea' | 'select' | 'url' | 'instagram';
  required: boolean;
  order_number: number;
  hint: string | null;
  options?: QuizOption[];
  
  // Campos adicionais para a nova estrutura
  question_number?: number;
  question_text?: string;
  module_title?: string;
  module_number?: number;
  question_type?: string;
  
  // Campo para armazenar opções em formato JSON
  options_json?: string;
}

export interface QuizOption {
  id: string;
  question_id: string;
  text: string;
  order_number: number;
  value?: string; // Valor a ser armazenado quando esta opção for selecionada
}

export interface QuizAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer: string | null;
  
  // Campos adicionais para contextualizar a resposta
  question_text: string;
  user_email?: string;
  user_name?: string;
}

export interface QuizSubmission {
  id: string;
  user_id: string;
  current_module: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  contact_preference?: string | null;
  contact_consent?: boolean;
  
  // Campos adicionais
  user_email?: string;
  user_name?: string;
  webhook_processed?: boolean;
}

// Interface para respostas completas do quiz (formato JSON)
export interface QuizFullResponse {
  id: string;
  user_id: string;
  submission_id: string;
  respostas: Record<string, any>; // Objeto JSON com todas as respostas
  data_submissao: string;
  user_email?: string;
  user_name?: string;
  webhook_processed?: boolean;
}

// Enumeração para os tipos de perguntas suportados
export enum QuestionType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  URL = 'url',
  INSTAGRAM = 'instagram'
}

// Interface para representar um módulo do questionário com suas perguntas
export interface QuizModuleWithQuestions {
  module: QuizModule;
  questions: QuizQuestion[];
}
