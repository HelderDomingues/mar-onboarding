
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = "https://nmxfknwkhnengqqjtwru.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGZrbndraG5lbmdxcWp0d3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTUyMjgsImV4cCI6MjA1ODIzMTIyOH0.3I_qClajzP-s1j_GF2WRY7ZkVSWC4fcLgKMH8Ut-TbA";
// Service role key - necessário para operações administrativas
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGZrbndraG5lbmdxcWp0d3J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjY1NTIyOCwiZXhwIjoyMDU4MjMxMjI4fQ.rFKeBrWpgm-0F24M37TXfFAb1Xrp3kxKMiQnj_ZSQiw";

// Configuração otimizada para o cliente Supabase principal
// Especificando explicitamente todas as configurações importantes
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Importante: mantém como false para evitar redirecionamentos indesejados
    storage: localStorage
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Cliente com permissões administrativas - configurado para não persistir sessão
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Função segura para obter emails dos usuários (apenas para admin)
export const getUserEmails = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_user_emails');
      
    if (error) {
      console.error("Erro ao buscar emails dos usuários:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar emails dos usuários:", error);
    return [];
  }
};

// Função segura para verificar status do questionário
export const isQuizComplete = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('completed')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Erro ao verificar status do questionário:", error);
      return false;
    }
    
    return data?.completed === true;
  } catch (error) {
    console.error("Erro ao verificar status do questionário:", error);
    return false;
  }
};

// Função segura para completar o questionário usando RPC
export const completeQuiz = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabaseAdmin
      .rpc('complete_quiz', { user_id: userId });
    
    if (error) {
      console.error("Erro ao completar questionário via RPC:", error);
      console.error("Detalhes do erro:", JSON.stringify(error));
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error("Erro ao completar questionário:", error);
    return false;
  }
};
