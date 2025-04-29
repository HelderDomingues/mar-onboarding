
/**
 * Tipos para a área administrativa
 */

export interface UserProfile {
  id: string;
  created_at: string;
  full_name?: string | null;
  user_email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  email: string;
  is_admin: boolean;
  has_submission: boolean;
}

export interface ConfigResult {
  success: boolean;
  message: string;
  detalhes?: string;
  codigo?: string;
}
