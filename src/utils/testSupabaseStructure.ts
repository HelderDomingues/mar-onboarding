
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';

/**
 * Testa a estrutura do Supabase para o questionário MAR
 * Verifica se todas as tabelas e dados básicos estão configurados corretamente
 */
export async function testSupabaseStructure(): Promise<{
  success: boolean;
  stage?: string;
  error?: string;
  data?: any;
  details?: any;
}> {
  try {
    addLogEntry('info', 'Iniciando teste de estrutura do Supabase');
    
    // Teste 1: Verificar se as tabelas existem
    try {
      const { data: tableInfo, error: tableError } = await supabase.rpc('get_all_tables');
      
      if (tableError) {
        return {
          success: false,
          stage: 'Verificação de tabelas',
          error: tableError.message,
          details: tableError
        };
      }
      
      // Verificar tabelas específicas do questionário
      const requiredTables = ['quiz_modules', 'quiz_questions', 'quiz_options', 
                             'quiz_submissions', 'quiz_answers'];
      
      const missingTables = requiredTables.filter(table => 
        !tableInfo || !tableInfo.some((t: any) => t.table_name === table)
      );
      
      if (missingTables.length > 0) {
        return {
          success: false,
          stage: 'Verificação de tabelas',
          error: `Tabelas necessárias não encontradas: ${missingTables.join(', ')}`,
          details: { missingTables, tableInfo }
        };
      }
    } catch (error) {
      // Se a função RPC não existir, tentar uma abordagem alternativa
      try {
        for (const table of ['quiz_modules', 'quiz_questions', 'quiz_options']) {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            return {
              success: false,
              stage: `Verificação da tabela ${table}`,
              error: error.message,
              details: error
            };
          }
        }
      } catch (alternativeError) {
        return {
          success: false,
          stage: 'Verificação alternativa de tabelas',
          error: alternativeError instanceof Error ? alternativeError.message : 'Erro desconhecido',
          details: alternativeError
        };
      }
    }
    
    // Teste 2: Verificar se há dados nas tabelas principais
    const { data: modules, error: modulesError } = await supabase
      .from('quiz_modules')
      .select('id, title')
      .order('order_number');
      
    if (modulesError) {
      return {
        success: false,
        stage: 'Verificação de dados dos módulos',
        error: modulesError.message,
        details: modulesError
      };
    }
    
    if (!modules || modules.length === 0) {
      return {
        success: false,
        stage: 'Verificação de dados dos módulos',
        error: 'Nenhum módulo encontrado na tabela quiz_modules',
        details: { modules }
      };
    }
    
    // Teste 3: Verificar perguntas
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, text, type')
      .order('order_number')
      .limit(10);
      
    if (questionsError) {
      return {
        success: false,
        stage: 'Verificação de dados das perguntas',
        error: questionsError.message,
        details: questionsError
      };
    }
    
    if (!questions || questions.length === 0) {
      return {
        success: false,
        stage: 'Verificação de dados das perguntas',
        error: 'Nenhuma pergunta encontrada na tabela quiz_questions',
        details: { questions }
      };
    }
    
    // Teste 4: Verificar opções
    const { data: options, error: optionsError } = await supabase
      .from('quiz_options')
      .select('id, text')
      .order('order_number')
      .limit(10);
      
    if (optionsError) {
      return {
        success: false,
        stage: 'Verificação de dados das opções',
        error: optionsError.message,
        details: optionsError
      };
    }
    
    if (!options || options.length === 0) {
      return {
        success: false,
        stage: 'Verificação de dados das opções',
        error: 'Nenhuma opção encontrada na tabela quiz_options',
        details: { options }
      };
    }
    
    // Compilar informações sobre os tipos de perguntas para verificar diversidade
    const questionTypes = Array.from(new Set(questions.map(q => q.type)));
    
    // Todos os testes passaram
    return {
      success: true,
      data: {
        modules: modules.length,
        questions: questions.length,
        options: options.length,
        questionTypes
      }
    };
  } catch (error) {
    addLogEntry('error', 'Erro ao testar estrutura do Supabase', {
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      stage: 'Verificação geral',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error
    };
  }
}

export default testSupabaseStructure;
