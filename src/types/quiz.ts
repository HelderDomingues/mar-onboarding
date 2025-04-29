
export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'number' | 'email' | 'url' | 'instagram' | string;

export interface QuizModule {
  id: string;
  title: string;
  description: string | null;
  order_number: number;
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  module_id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  hint?: string | null;
  order_number: number;
  created_at?: string;
  options?: QuizOption[];
  
  // Campos adicionais para compatibilidade com componentes existentes
  question_text?: string;  // Alias para text
  question_type?: string;  // Alias para type
  max_options?: number;    // Opcional para questões de checkbox
  prefix?: string;         // Para campos como instagram e url
  validation?: string;     // Validação adicional
  placeholder?: string;    // Texto de placeholder
  module_number?: number;  // Para indexação
  module_title?: string;   // Para exibição
}

export interface QuizOption {
  id: string;
  question_id: string;
  text: string;
  order_number: number;
  created_at?: string;
}

export interface QuizSubmission {
  id: string;
  user_id: string;
  user_email: string;
  current_module: number;
  completed: boolean;
  started_at: string;
  completed_at?: string | null;
  created_at?: string;
  total_time_spent?: number;  // Campo adicionado para resolver o erro
  
  // Add answers property to match usage in Quiz.tsx
  answers?: QuizAnswer[]; // New property
}

export interface QuizAnswer {
  id: string;
  submission_id: string;
  question_id: string;
  answer: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;        // Campo adicionado para resolver erros
  question_text?: string;  // Campo adicionado para resolver erros
  module_id?: string;      // Campo adicionado para resolver erros
  module_title?: string;   // Campo adicionado para resolver erros
  module_number?: number;  // Campo adicionado para resolver erros
}
