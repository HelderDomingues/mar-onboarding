
// Tipos para funcionalidades administrativas

export type UserProfile = {
  id: string;
  email?: string;
  user_email?: string; // Nome atualizado da coluna
  full_name?: string;
  username?: string;
  created_at?: string;
  is_admin?: boolean;
  has_submission?: boolean;
};

export type ConfigResult = {
  success?: boolean;
  message?: string;
  detalhes?: string;
  codigo?: string;
};

export interface EmailData {
  user_id: string;
  user_email: string; // Nome atualizado da coluna
  user_created_at: string;
  user_name: string | null;
};

export interface UserRoleData {
  user_id: string;
  role: string;
  user_email?: string; // Nome atualizado da coluna
};

export interface SubmissionData {
  user_id: string;
  completed?: boolean;
};
