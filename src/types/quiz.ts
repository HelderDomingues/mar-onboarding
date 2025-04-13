
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
  
  // Novos campos para compatibilidade com o questionário MAR
  category?: string; // Categoria da pergunta dentro do módulo
  max_options?: number; // Número máximo de opções selecionáveis (para checkbox)
  validation?: string; // Regras de validação específicas
  placeholder?: string; // Texto de placeholder para campos de texto
  prefix?: string; // Prefixo para campos como instagram, url, etc.
  dependency?: { // Para perguntas que dependem de respostas anteriores
    question_id: string;
    value: string | string[];
    condition: 'equals' | 'contains' | 'not_equals' | 'not_contains';
  }
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
  
  // Novos campos para análise
  module_id?: string;
  module_number?: number;
  module_title?: string;
  section_id?: string;
  section_name?: string;
  question_type?: string;
  answered_at?: string;
  time_spent?: number; // Tempo gasto na pergunta em segundos
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
  
  // Novos campos para análise
  modules_completed?: number[];
  last_question_id?: string;
  sessions?: number; // Número de sessões para completar o questionário
  total_time_spent?: number; // Tempo total gasto em segundos
  device_info?: string; // Informações do dispositivo usado
  last_active?: string; // Última atividade no questionário
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
  
  // Campos para análise
  modules_data?: Record<string, any>; // Dados agrupados por módulo
  analytics?: {
    completion_rate?: number; // Taxa de conclusão (perguntas respondidas/total)
    time_per_module?: Record<number, number>; // Tempo médio por módulo
    answers_by_type?: Record<string, number>; // Contagem de respostas por tipo
  };
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
  sections?: QuizSection[];
}

// Novas interfaces para suportar a estrutura completa do questionário MAR

// Interface para uma etapa do questionário, que pode ser um módulo ou uma seção
export interface QuizStep {
  id: string;
  title: string;
  order_number: number;
  type: 'module' | 'section';
  parent_id?: string; // Id do módulo pai, se for uma seção
  questions?: QuizQuestion[];
}

// Interface para registrar o progresso do usuário no questionário
export interface QuizProgress {
  user_id: string;
  completed_modules: number[];
  completed_sections: string[];
  completed_questions: string[];
  current_module: number;
  current_section?: string;
  current_question?: string;
  started_at: string;
  last_activity: string;
  completion_percentage: number;
}

// Interface para análise de respostas do questionário
export interface QuizAnalytics {
  user_id: string;
  submission_id: string;
  total_time: number;
  average_time_per_question: number;
  completion_rate: number;
  module_completion_times: Record<number, number>;
  question_counts: {
    total: number;
    answered: number;
    skipped: number;
  };
  device_info: {
    device_type: string;
    browser: string;
    os: string;
    screen_size: string;
  };
  session_data: {
    count: number;
    average_duration: number;
    timestamps: string[];
  };
}

// Interface para exportação de dados do questionário
export interface QuizExportConfig {
  format: 'pdf' | 'csv' | 'excel' | 'json';
  user_id?: string; // Se vazio, exportar todos (apenas admin)
  modules?: number[]; // Quais módulos exportar
  include_analytics?: boolean;
  include_timestamps?: boolean;
  include_user_info?: boolean;
  group_by_module?: boolean;
  filter_by_date?: {
    start: string;
    end: string;
  };
}
