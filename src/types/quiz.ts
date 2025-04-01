
export interface QuizModule {
  id: string;
  title: string;
  description: string | null;
  order_number: number;
}

export interface QuizQuestion {
  id: string;
  module_id: string;
  text: string;
  type: 'text' | 'number' | 'email' | 'radio' | 'checkbox' | 'textarea' | 'select';
  required: boolean;
  order_number: number;
  hint: string | null;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  text: string;
  order_number: number;
}

export interface QuizAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer: string | null;
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
}
