
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = "https://nmxfknwkhnengqqjtwru.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGZrbndraG5lbmdxcWp0d3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTUyMjgsImV4cCI6MjA1ODIzMTIyOH0.3I_qClajzP-s1j_GF2WRY7ZkVSWC4fcLgKMH8Ut-TbA";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGZrbndraG5lbmdxcWp0d3J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjY1NTIyOCwiZXhwIjoyMDU4MjMxMjI4fQ.DNLEMi5KENuma1LiC9q-Db9LkMkEeUfKxmN44R_88bc";

// Cliente padrão para uso em toda a aplicação - configurações simplificadas
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Cliente administrativo com service role - USAR APENAS EM CONTEXTOS ADMINISTRATIVOS
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

// Função simplificada para verificar se o questionário está completo
export const isQuizComplete = async (userId: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('quiz_submissions')
      .select('completed')
      .eq('user_id', userId)
      .maybeSingle();
      
    return data?.completed === true;
  } catch (error) {
    console.error("Erro ao verificar status do questionário:", error);
    return false;
  }
};

// Função simplificada para completar o questionário
export const completeQuiz = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('quiz_submissions')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        contact_consent: true
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error("Erro ao completar questionário:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao completar questionário:", error);
    return false;
  }
};
