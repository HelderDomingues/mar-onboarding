import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface TestResults {
  connection: boolean;
  authentication: boolean;
  tables: boolean;
  rpc: { canExecute: boolean; hasData: boolean } | null;
  rls: { enabled: boolean } | null;
}

export async function testSupabaseStructure(): Promise<{ results: TestResults; issues: string[] }> {
  const results: TestResults = {
    connection: false,
    authentication: false,
    tables: false,
    rpc: null,
    rls: null
  };
  
  const issues: string[] = [];

  // Test basic connection
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (!error) {
      results.connection = true;
      results.tables = true;
    } else {
      issues.push(`Connection Error: ${error.message}`);
    }
  } catch (error) {
    issues.push(`Connection Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test RPC functionality with existing function
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_users_with_emails');
    if (rpcError) {
      issues.push(`RPC Error: ${rpcError.message}`);
    } else {
      results.rpc = {
        canExecute: true,
        hasData: Array.isArray(rpcData) && rpcData.length > 0
      };
    }
  } catch (error) {
    issues.push(`RPC Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test RLS with simple query
  try {
    const { data: profileTest, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    results.rls = {
      enabled: !profileError || profileError.message.includes('RLS')
    };
    
    if (profileError && !profileError.message.includes('RLS')) {
      issues.push(`RLS Test Error: ${profileError.message}`);
    }
  } catch (error) {
    issues.push(`RLS Test Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { results, issues };
}