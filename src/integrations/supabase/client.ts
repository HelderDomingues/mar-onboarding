
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { ServiceRoleConfig } from '@/config/serviceRole';

// URL e chave anônima são valores públicos seguros para o frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
