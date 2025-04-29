
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Função para testar a estrutura do banco de dados Supabase para o questionário MAR
 * Verifica se todas as tabelas e colunas necessárias existem
 */
export async function testSupabaseStructure(): Promise<{
  success: boolean;
  error?: string;
  stage?: string;
  details?: any;
  data?: {
    modules?: number;
    questions?: number;
    options?: number;
    questionTypes?: string[];
    permissions?: string;
  };
}> {
  try {
    logger.info('Iniciando teste de estrutura do Supabase para questionário MAR', {
      tag: 'TestStructure'
    });
    
    // Definir cliente (tentar usar admin se possível)
    const client = supabaseAdmin || supabase;
    
    // ETAPA 1: Verificar existência das tabelas principais
    let stage = 'verificação de tabelas';
    
    const { data: tableInfo, error: tableError } = await client.rpc('get_tables_info');
    
    if (tableError) {
      return {
        success: false,
        error: `Erro ao verificar tabelas: ${tableError.message}`,
        stage,
        details: { error: tableError }
      };
    }
    
    // Verificar se as tabelas necessárias existem
    const requiredTables = ['quiz_modules', 'quiz_questions', 'quiz_options', 'quiz_submissions', 'quiz_answers'];
    const missingTables = requiredTables.filter(tableName => 
      !tableInfo || !tableInfo.some(t => t.table_name === tableName)
    );
    
    if (missingTables.length > 0) {
      return {
        success: false,
        error: `Tabelas ausentes: ${missingTables.join(', ')}`,
        stage,
        details: { missingTables, tableInfo }
      };
    }
    
    // ETAPA 2: Verificar dados nas tabelas
    stage = 'verificação de dados';
    
    // Verificar módulos
    const { data: modulesData, error: modulesError } = await client
      .from('quiz_modules')
      .select('*');
      
    if (modulesError) {
      return {
        success: false,
        error: `Erro ao verificar módulos: ${modulesError.message}`,
        stage,
        details: { error: modulesError }
      };
    }
    
    // Verificar perguntas
    const { data: questionsData, error: questionsError } = await client
      .from('quiz_questions')
      .select('*');
      
    if (questionsError) {
      return {
        success: false,
        error: `Erro ao verificar perguntas: ${questionsError.message}`,
        stage,
        details: { error: questionsError }
      };
    }
    
    // Verificar opções
    const { data: optionsData, error: optionsError } = await client
      .from('quiz_options')
      .select('*');
      
    if (optionsError) {
      return {
        success: false,
        error: `Erro ao verificar opções: ${optionsError.message}`,
        stage,
        details: { error: optionsError }
      };
    }
    
    // Verificar tipos de pergunta para diversidade
    const questionTypes = questionsData ? [...new Set(questionsData.map(q => q.type))] : [];
    
    // ETAPA 3: Verificar permissões (políticas RLS)
    stage = 'verificação de permissões';
    
    let permissions = 'não verificadas';
    
    try {
      // Tentar buscar políticas RLS - isso só vai funcionar com acesso administrativo
      const { data: policies, error: policiesError } = await client.rpc('get_policies');
      
      if (!policiesError && policies) {
        const quizPolicies = policies.filter(p => 
          p.tablename.startsWith('quiz_') && 
          ['quiz_modules', 'quiz_questions', 'quiz_options', 'quiz_submissions', 'quiz_answers'].includes(p.tablename)
        );
        
        permissions = quizPolicies.length > 0 ? 'políticas encontradas' : 'sem políticas';
      }
    } catch (policiesError) {
      permissions = 'erro ao verificar';
      logger.error('Erro ao verificar políticas RLS:', {
        tag: 'TestStructure',
        data: { error: policiesError }
      });
    }
    
    // Se chegou até aqui, tudo está bem
    return {
      success: true,
      data: {
        modules: modulesData?.length || 0,
        questions: questionsData?.length || 0,
        options: optionsData?.length || 0,
        questionTypes,
        permissions
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Erro ao testar estrutura do Supabase:', {
      tag: 'TestStructure',
      data: { error }
    });
    
    return {
      success: false,
      error: `Erro geral: ${errorMessage}`,
      details: { error }
    };
  }
}

/**
 * RPCs necessárias no Supabase:
 *
 * - get_tables_info: 
 * create or replace function get_tables_info()
 * returns table (table_name text, row_count bigint)
 * language plpgsql security definer
 * as $$
 * begin
 *   return query
 *   select 
 *     table_name::text,
 *     (select count(*) from information_schema.columns where table_schema = 'public' and table_name = t.table_name)::bigint as row_count
 *   from 
 *     information_schema.tables t
 *   where 
 *     table_schema = 'public'
 *     and table_type = 'BASE TABLE';
 * end;
 * $$;
 *
 * - get_policies:
 * create or replace function get_policies()
 * returns table (tablename text, policyname text, permissive text, roles text[], cmd text, qual text, with_check text)
 * language plpgsql security definer
 * as $$
 * begin
 *   return query
 *   select
 *     p.tablename::text,
 *     p.policyname::text,
 *     p.permissive::text,
 *     p.roles,
 *     p.cmd::text,
 *     p.qual::text,
 *     p.with_check::text
 *   from
 *     pg_policies p
 *   where
 *     p.schemaname = 'public';
 * end;
 * $$;
 */
