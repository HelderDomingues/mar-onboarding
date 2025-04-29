
import { supabase } from "@/integrations/supabase/client";
import { logger } from "./logger";

/**
 * Verifica se a conexão do Supabase está funcionando
 * @returns Promise<boolean> - true se conectado, false caso contrário
 */
export async function verificarConexaoSupabase(): Promise<{
  conectado: boolean;
  erro?: string;
  url?: string;
}> {
  try {
    // Testa a conexão fazendo uma consulta simples
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    // Retorna o status da conexão
    return {
      conectado: !error,
      erro: error?.message,
      url: import.meta.env.VITE_SUPABASE_URL || 'Usando URL padrão'
    };
  } catch (error: any) {
    logger.error('Erro ao verificar conexão Supabase:', {
      data: { error },
      tag: 'Diagnóstico'
    });

    return {
      conectado: false,
      erro: error?.message || 'Erro desconhecido'
    };
  }
}

/**
 * Verifica e retorna as informações do ambiente
 */
export function obterInfoAmbiente() {
  const env = import.meta.env;
  
  return {
    mode: env.MODE,
    produção: env.PROD,
    desenvolvimento: env.DEV,
    supabaseUrl: env.VITE_SUPABASE_URL || 'Não definido',
    temAnonKey: !!env.VITE_SUPABASE_ANON_KEY,
    baseUrl: env.BASE_URL
  };
}

/**
 * Emite logs de diagnóstico para ajudar a depurar problemas de conexão
 */
export function diagnosticarConfiguracao() {
  const info = obterInfoAmbiente();
  
  logger.info('Diagnóstico de ambiente:', {
    tag: 'Diagnóstico',
    data: info
  });
  
  if (!info.supabaseUrl || info.supabaseUrl === 'Não definido') {
    logger.warn('VITE_SUPABASE_URL não está configurado, usando URL padrão', {
      tag: 'Diagnóstico'
    });
  }
  
  if (!info.temAnonKey) {
    logger.warn('VITE_SUPABASE_ANON_KEY não está configurado, usando chave padrão', {
      tag: 'Diagnóstico'
    });
  }
  
  return info;
}
