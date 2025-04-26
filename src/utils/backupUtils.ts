/**
 * Utilitários para gerenciamento de backups do questionário MAR
 * Estas funções garantem que operações destrutivas sejam sempre precedidas de backups
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';

/**
 * Realiza backup de uma tabela antes de operações destrutivas
 * @param tableName Nome da tabela a ser copiada
 * @param reason Motivo do backup
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export const backupTable = async (
  tableName: string, 
  reason: string = 'backup_preventivo'
): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupTableName = `${tableName}_backup_${timestamp}`;
    
    logger.info(`Iniciando backup da tabela ${tableName} para ${backupTableName}`, {
      tag: 'Backup',
      data: { tableName, backupTableName, reason }
    });
    
    addLogEntry('info', `Iniciando backup da tabela ${tableName}`, { 
      origem: 'backupUtils', 
      motivo: reason 
    });

    // Criar tabela de backup com mesma estrutura e dados
    const { error } = await supabase.rpc('create_table_backup', { 
      source_table: tableName,
      target_table: backupTableName,
      backup_reason: reason
    });
    
    if (error) {
      logger.error(`Falha no backup da tabela ${tableName}`, {
        tag: 'Backup',
        data: { error }
      });
      
      addLogEntry('error', `Falha no backup da tabela ${tableName}`, { 
        origem: 'backupUtils', 
        erro: error.message 
      });
      
      return false;
    }

    logger.info(`Backup da tabela ${tableName} concluído com sucesso`, {
      tag: 'Backup',
      data: { tableName, backupTableName }
    });
    
    addLogEntry('info', `Backup da tabela ${tableName} concluído com sucesso`, { 
      origem: 'backupUtils', 
      tabela_backup: backupTableName 
    });
    
    return true;
  } catch (error) {
    logger.error(`Exceção ao realizar backup da tabela ${tableName}`, {
      tag: 'Backup',
      data: { error }
    });
    
    addLogEntry('error', `Exceção ao realizar backup da tabela ${tableName}`, { 
      origem: 'backupUtils',
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return false;
  }
};

/**
 * Realiza backup de todas as tabelas do questionário MAR
 * @param reason Motivo do backup
 * @returns Promise<boolean> indicando sucesso ou falha global
 */
export const backupQuizTables = async (reason: string = 'backup_completo'): Promise<boolean> => {
  try {
    logger.info('Iniciando backup completo das tabelas do questionário', {
      tag: 'Backup',
      data: { reason }
    });
    
    addLogEntry('info', 'Iniciando backup completo das tabelas do questionário', { 
      origem: 'backupUtils', 
      motivo: reason 
    });
    
    // Lista das tabelas principais do questionário
    const quizTables = [
      'quiz_modules',
      'quiz_questions',
      'quiz_options',
      'quiz_submissions',
      'quiz_answers',
      'quiz_respostas_completas'
    ];
    
    const results = await Promise.all(
      quizTables.map(table => backupTable(table, reason))
    );
    
    const allSuccessful = results.every(result => result === true);
    
    if (allSuccessful) {
      logger.info('Backup completo das tabelas do questionário realizado com sucesso', {
        tag: 'Backup'
      });
      
      addLogEntry('info', 'Backup completo das tabelas do questionário realizado com sucesso');
      
      return true;
    } else {
      logger.info('Backup completo das tabelas do questionário finalizado com falhas', {
        tag: 'Backup',
        data: { results }
      });
      
      addLogEntry('warning', 'Backup completo das tabelas do questionário finalizado com falhas');
      
      return false;
    }
  } catch (error) {
    logger.error('Exceção ao realizar backup completo do questionário', {
      tag: 'Backup',
      data: { error }
    });
    
    addLogEntry('error', 'Exceção ao realizar backup completo do questionário', { 
      origem: 'backupUtils',
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return false;
  }
};

/**
 * Verifica se existem backups disponíveis para uma tabela
 * @param tableName Nome da tabela original
 * @returns Promise<string[]> Array com nomes das tabelas de backup disponíveis
 */
export const listAvailableBackups = async (tableName: string): Promise<string[]> => {
  try {
    // Buscar tabelas que começam com o padrão de nome de backup
    const { data, error } = await supabase.rpc('list_table_backups', {
      table_name_pattern: `${tableName}_backup_%`
    });
    
    if (error) {
      logger.error(`Erro ao listar backups da tabela ${tableName}`, {
        tag: 'Backup',
        data: { error }
      });
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error(`Exceção ao listar backups da tabela ${tableName}`, {
      tag: 'Backup',
      data: { error }
    });
    return [];
  }
};

/**
 * Restaura uma tabela a partir de um backup
 * @param backupTableName Nome da tabela de backup
 * @param targetTableName Nome da tabela de destino (geralmente a original)
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export const restoreFromBackup = async (
  backupTableName: string, 
  targetTableName: string
): Promise<boolean> => {
  try {
    logger.info(`Iniciando restauração da tabela ${targetTableName} a partir de ${backupTableName}`, {
      tag: 'Backup',
      data: { backupTableName, targetTableName }
    });
    
    addLogEntry('info', `Iniciando restauração da tabela ${targetTableName}`, { 
      origem: 'backupUtils', 
      tabela_backup: backupTableName 
    });

    // Primeiro fazer backup da tabela atual como medida de segurança adicional
    await backupTable(targetTableName, `pre_restauracao_de_${backupTableName}`);
    
    // Restaurar a partir do backup
    const { error } = await supabase.rpc('restore_table_from_backup', { 
      backup_table: backupTableName,
      target_table: targetTableName
    });
    
    if (error) {
      logger.error(`Falha na restauração da tabela ${targetTableName}`, {
        tag: 'Backup',
        data: { error }
      });
      
      addLogEntry('error', `Falha na restauração da tabela ${targetTableName}`, { 
        origem: 'backupUtils', 
        erro: error.message 
      });
      
      return false;
    }

    logger.info(`Restauração da tabela ${targetTableName} concluída com sucesso`, {
      tag: 'Backup',
      data: { backupTableName, targetTableName }
    });
    
    addLogEntry('info', `Restauração da tabela ${targetTableName} concluída com sucesso`, { 
      origem: 'backupUtils' 
    });
    
    return true;
  } catch (error) {
    logger.error(`Exceção ao restaurar tabela ${targetTableName}`, {
      tag: 'Backup',
      data: { error }
    });
    
    addLogEntry('error', `Exceção ao restaurar tabela ${targetTableName}`, { 
      origem: 'backupUtils',
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return false;
  }
};
