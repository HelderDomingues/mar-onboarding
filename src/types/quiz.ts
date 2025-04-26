
export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'number' | 'email' | 'url' | 'instagram';

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
}

export interface QuizAnswer {
  id: string;
  submission_id: string;
  question_id: string;
  answer: string | null;
  created_at?: string;
  updated_at?: string;
}
