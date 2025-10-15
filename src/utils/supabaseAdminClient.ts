import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { ServiceRoleConfig } from '@/config/serviceRole';

const SUPABASE_URL = "https://btzvozqajqknqfoymxpg.supabase.co";

/**
 * Cria um cliente Supabase com privilégios administrativos usando a service role key
 * Esta função sempre retorna um cliente atualizado com a chave configurada
 */
export const getSupabaseAdminClient = () => {
  const serviceRoleKey = ServiceRoleConfig.get();

  if (!serviceRoleKey) {
    throw new Error('Service role key não configurada. Configure a chave nas configurações de usuário.');
  }

  return createClient<Database>(
    SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: 'supabase-admin' // Storage key única para evitar conflitos com sessões de usuário
      }
    }
  );
};

/**
 * Verifica se o cliente admin está configurado corretamente
 */
export const isAdminClientConfigured = (): boolean => {
  return ServiceRoleConfig.exists();
};