
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { ServiceRoleConfig } from '@/config/serviceRole';

// URL e chave anônima são valores públicos seguros para o frontend
// Definindo valores padrão para evitar erros de inicialização
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btzvozqajqknqfoymxpg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0enZvenFhanFrbnFmb3lteHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjYwNjEsImV4cCI6MjA1OTc0MjA2MX0.QdD7bEZBPvVNBhHqgAGtFaZOxJrdosFTElxRUCIrnL8';

// Exportar a chave anônima para uso em componentes específicos (como testes de segurança)
export const SUPABASE_ANON_KEY = supabaseAnonKey;

// Cliente padrão com a chave anônima para uso no frontend
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});

// Cliente administrativo com service role, se configurado
// Será undefined se a service role não estiver configurada
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | undefined = undefined;

try {
  const serviceRoleKey = ServiceRoleConfig.get();
  
  if (serviceRoleKey && serviceRoleKey.length > 10) {
    _supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      }
    });
    
    // Log para confirmar inicialização, sem expor a chave
    console.log('supabaseAdmin client inicializado com sucesso');
  }
} catch (error) {
  console.error('Erro ao inicializar supabaseAdmin:', error);
}

// Exporta o cliente admin para uso interno com bypass de RLS
export const supabaseAdmin = _supabaseAdmin;
