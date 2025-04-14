
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

export interface QuizModule {
  id: string;
  title: string;
  description: string;
  order_number: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: string;
  module_id: string;
  text?: string;
  question_text?: string;
  type?: string;
  question_type?: string;
  required: boolean;
  hint?: string;
  order_number: number;
  created_at?: string;
  updated_at?: string;
  options?: (QuizOption | string)[];
  options_json?: string | any[];
  validation?: string;
  max_options?: number;
  prefix?: string;
  placeholder?: string;
  module_number?: number;
  module_title?: string;
}

export interface QuizOption {
  id: string;
  question_id: string;
  text: string;
  order_number: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuizAnswer {
  id?: string;
  user_id: string;
  question_id: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
  question_text?: string;
  module_id?: string;
  module_number?: number;
  module_title?: string;
  question_type?: string;
  user_email?: string;
}
