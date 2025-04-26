
export interface QuizSubmission {
  id: string;
  user_id: string;
  user_email: string;
  current_module: number;
  completed: boolean;
  started_at: string;
  completed_at?: string | null;
  created_at?: string;
  
  // Add answers property to match usage in Quiz.tsx
  answers?: QuizAnswer[]; // New property
}
