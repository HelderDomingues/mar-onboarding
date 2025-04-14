
export interface QuizSubmission {
  id: string;
  user_id: string;
  current_module: number;
  completed: boolean;  // Changed from is_complete
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
