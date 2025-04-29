
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";

/**
 * Interface para usuário de importação
 */
export interface ImportUser {
  name: string;
  email: string;
  plan?: string;
  source?: string;
}

/**
 * Resultado da importação
 */
export interface ImportResult {
  success: boolean;
  inserted: number;
  errors: {
    email: string;
    error: string;
  }[];
  message: string;
}

/**
 * Valida um email
 */
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Importa usuários a partir de um CSV
 */
export async function importUsersFromCSV(csvData: string): Promise<ImportResult> {
  try {
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    const users: ImportUser[] = [];
    const errors: { email: string; error: string }[] = [];
    
    // Ignorar cabeçalho e processar linhas
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',');
      
      if (columns.length < 2) {
        errors.push({
          email: `Linha ${i + 1}`,
          error: 'Formato inválido, precisa ter pelo menos nome e email separados por vírgula'
        });
        continue;
      }
      
      const name = columns[0].trim();
      const email = columns[1].trim();
      const plan = columns.length > 2 ? columns[2].trim() : 'basic';
      
      if (!name) {
        errors.push({ email, error: 'Nome vazio' });
        continue;
      }
      
      if (!isValidEmail(email)) {
        errors.push({ email, error: 'Email inválido' });
        continue;
      }
      
      users.push({ name, email, plan, source: 'csv_import' });
    }
    
    let insertedCount = 0;
    
    // Chamar função RPC para criar usuários
    for (const user of users) {
      try {
        const { data, error } = await supabase.rpc('admin_create_user', {
          user_name: user.name,
          user_email: user.email,
          user_plan: user.plan || 'basic',
          user_source: user.source || 'csv_import'
        });
        
        if (error) {
          errors.push({
            email: user.email,
            error: error.message
          });
          continue;
        }
        
        insertedCount++;
      } catch (error: any) {
        errors.push({
          email: user.email,
          error: error.message || 'Erro desconhecido'
        });
      }
    }
    
    addLogEntry('admin', 'Importação de usuários', {
      total: users.length,
      inserted: insertedCount,
      errors: errors.length
    });
    
    return {
      success: insertedCount > 0,
      inserted: insertedCount,
      errors: errors,
      message: `${insertedCount} de ${users.length} usuários importados com sucesso.`
    };
  } catch (error: any) {
    logger.error('Erro na importação de usuários:', { error });
    
    return {
      success: false,
      inserted: 0,
      errors: [{ email: 'sistema', error: error.message || 'Erro desconhecido' }],
      message: 'Falha na importação. Por favor, verifique o formato do CSV.'
    };
  }
}

/**
 * Importa um único usuário manualmente
 */
export async function importSingleUser(user: ImportUser): Promise<ImportResult> {
  try {
    if (!user.name || !user.email) {
      return {
        success: false,
        inserted: 0,
        errors: [{
          email: user.email || 'Não fornecido',
          error: 'Nome e email são obrigatórios'
        }],
        message: 'Nome e email são obrigatórios'
      };
    }
    
    if (!isValidEmail(user.email)) {
      return {
        success: false,
        inserted: 0,
        errors: [{ email: user.email, error: 'Email inválido' }],
        message: 'Email inválido'
      };
    }
    
    const { data, error } = await supabase.rpc('admin_create_user', {
      user_name: user.name,
      user_email: user.email,
      user_plan: user.plan || 'basic',
      user_source: user.source || 'manual_import'
    });
    
    if (error) {
      return {
        success: false,
        inserted: 0,
        errors: [{ email: user.email, error: error.message }],
        message: `Erro ao importar usuário: ${error.message}`
      };
    }
    
    addLogEntry('admin', 'Importação de usuário manual', {
      email: user.email,
      success: true
    });
    
    return {
      success: true,
      inserted: 1,
      errors: [],
      message: `Usuário ${user.email} importado com sucesso!`
    };
  } catch (error: any) {
    logger.error('Erro na importação manual de usuário:', { error });
    
    return {
      success: false,
      inserted: 0,
      errors: [{ email: user.email || 'Não fornecido', error: error.message || 'Erro desconhecido' }],
      message: 'Falha na importação manual de usuário.'
    };
  }
}
