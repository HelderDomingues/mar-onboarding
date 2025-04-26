
/**
 * Script para inicializar o questionário MAR com segurança
 * Versão segura - Implementa backups antes de operações destrutivas e verificações
 */

import { supabase } from '@/integrations/supabase/client';
import { quizModulesData, quizQuestionsData, quizOptionsData } from './quiz-data';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';
import { backupQuizTables } from '@/utils/backupUtils';

/**
 * Inicializa o questionário MAR de forma segura e incremental
 * @returns Promise<boolean> indicando sucesso ou falha
 */
export const seedQuizData = async (): Promise<boolean> => {
  try {
    logger.info('Iniciando seed de dados do questionário MAR', { tag: 'Seed' });
    addLogEntry('info', 'Iniciando seed de dados do questionário MAR');
    
    // Fazer backup do estado atual antes de qualquer operação
    await backupQuizTables('pre_seed_questionario');
    
    // Verificar se já existem dados
    const { count: modulesCount } = await supabase
      .from('quiz_modules')
      .select('*', { count: 'exact', head: true });
      
    const { count: questionsCount } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true });
      
    const { count: optionsCount } = await supabase
      .from('quiz_options')
      .select('*', { count: 'exact', head: true });
      
    // Log do estado atual
    logger.info('Estado atual do questionário:', { 
      tag: 'Seed',
      data: { modulesCount, questionsCount, optionsCount }
    });
    
    // Processo de inserção por etapas - Módulos primeiro
    let insertedModules = 0;
    
    for (const moduleData of quizModulesData) {
      // Verificar se já existe um módulo com este order_number
      const { data: existingModule } = await supabase
        .from('quiz_modules')
        .select('*')
        .eq('order_number', moduleData.order_number)
        .maybeSingle();
      
      if (existingModule) {
        // Atualizar módulo existente
        const { error: updateError } = await supabase
          .from('quiz_modules')
          .update({
            title: moduleData.title,
            description: moduleData.description
          })
          .eq('order_number', moduleData.order_number);
        
        if (updateError) {
          logger.error(`Erro ao atualizar módulo #${moduleData.order_number}:`, {
            tag: 'Seed',
            data: { error: updateError }
          });
          continue;
        }
        
        logger.info(`Módulo #${moduleData.order_number} atualizado com sucesso`, { tag: 'Seed' });
      } else {
        // Inserir novo módulo
        const { error: insertError } = await supabase
          .from('quiz_modules')
          .insert(moduleData);
        
        if (insertError) {
          logger.error(`Erro ao inserir módulo #${moduleData.order_number}:`, {
            tag: 'Seed',
            data: { error: insertError }
          });
          continue;
        }
        
        insertedModules++;
        logger.info(`Módulo #${moduleData.order_number} inserido com sucesso`, { tag: 'Seed' });
      }
    }
    
    // Buscar os módulos após a atualização/inserção para referência
    const { data: modules } = await supabase
      .from('quiz_modules')
      .select('*')
      .order('order_number');
      
    if (!modules || modules.length === 0) {
      logger.error('Falha ao buscar módulos após inserção', { tag: 'Seed' });
      return false;
    }
    
    // Construir mapa de módulos para referência rápida
    const moduleMap = {};
    modules.forEach(module => {
      moduleMap[module.order_number] = module.id;
    });
    
    // Processo de inserção - Perguntas
    let insertedQuestions = 0;
    
    for (const questionData of quizQuestionsData) {
      // Obter o ID do módulo correspondente
      const moduleId = moduleMap[questionData.module_number];
      
      if (!moduleId) {
        logger.warn(`Pulando pergunta: módulo #${questionData.module_number} não encontrado`, { tag: 'Seed' });
        continue;
      }
      
      // Verificar se já existe uma pergunta com o mesmo módulo e número de ordem
      const { data: existingQuestion } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('module_id', moduleId)
        .eq('order_number', questionData.order_number)
        .maybeSingle();
      
      if (existingQuestion) {
        // Atualizar pergunta existente
        const { error: updateError } = await supabase
          .from('quiz_questions')
          .update({
            text: questionData.text,
            type: questionData.type,
            required: questionData.required,
            hint: questionData.hint,
            max_options: questionData.max_options,
            prefix: questionData.prefix
          })
          .eq('id', existingQuestion.id);
        
        if (updateError) {
          logger.error(`Erro ao atualizar pergunta:`, {
            tag: 'Seed',
            data: { error: updateError, questionData }
          });
          continue;
        }
        
        logger.info(`Pergunta #${questionData.order_number} do módulo #${questionData.module_number} atualizada`, { 
          tag: 'Seed' 
        });
      } else {
        // Inserir nova pergunta
        const { error: insertError } = await supabase
          .from('quiz_questions')
          .insert({
            ...questionData,
            module_id: moduleId
          });
        
        if (insertError) {
          logger.error(`Erro ao inserir pergunta:`, {
            tag: 'Seed',
            data: { error: insertError, questionData }
          });
          continue;
        }
        
        insertedQuestions++;
        logger.info(`Pergunta #${questionData.order_number} do módulo #${questionData.module_number} inserida`, { 
          tag: 'Seed' 
        });
      }
    }
    
    // Buscar as perguntas após a atualização/inserção
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('module_id, order_number');
      
    // Construir mapa de perguntas para referência rápida
    const questionMap = {};
    questions.forEach(question => {
      // Criar uma chave composta para identificar a pergunta
      const key = `${question.module_id}_${question.order_number}`;
      questionMap[key] = question.id;
    });
    
    // Processo de inserção - Opções
    let insertedOptions = 0;
    
    for (const optionData of quizOptionsData) {
      // Encontrar o módulo correspondente à pergunta
      const moduleForQuestion = modules.find(m => m.order_number === optionData.question_number);
      
      if (!moduleForQuestion) {
        logger.warn(`Pulando opção: módulo para pergunta #${optionData.question_number} não encontrado`, { tag: 'Seed' });
        continue;
      }
      
      // Criar chave para buscar o ID da pergunta
      const questionKey = `${moduleForQuestion.id}_${optionData.question_number}`;
      const questionId = questionMap[questionKey];
      
      if (!questionId) {
        logger.warn(`Pulando opção: pergunta #${optionData.question_number} não encontrada`, { tag: 'Seed' });
        continue;
      }
      
      // Verificar se já existe uma opção com a mesma ordem para esta pergunta
      const { data: existingOption } = await supabase
        .from('quiz_options')
        .select('*')
        .eq('question_id', questionId)
        .eq('order_number', optionData.order_number)
        .maybeSingle();
      
      if (existingOption) {
        // Atualizar opção existente
        const { error: updateError } = await supabase
          .from('quiz_options')
          .update({
            text: optionData.text
          })
          .eq('id', existingOption.id);
        
        if (updateError) {
          logger.error(`Erro ao atualizar opção:`, {
            tag: 'Seed',
            data: { error: updateError, optionData }
          });
          continue;
        }
        
        logger.info(`Opção #${optionData.order_number} da pergunta #${optionData.question_number} atualizada`, { 
          tag: 'Seed' 
        });
      } else {
        // Inserir nova opção
        const { error: insertError } = await supabase
          .from('quiz_options')
          .insert({
            question_id: questionId,
            text: optionData.text,
            order_number: optionData.order_number
          });
        
        if (insertError) {
          logger.error(`Erro ao inserir opção:`, {
            tag: 'Seed',
            data: { error: insertError, optionData }
          });
          continue;
        }
        
        insertedOptions++;
        logger.info(`Opção #${optionData.order_number} da pergunta #${optionData.question_number} inserida`, { 
          tag: 'Seed' 
        });
      }
    }
    
    // Resultado final
    const result = {
      success: true,
      modulesInserted: insertedModules,
      questionsInserted: insertedQuestions,
      optionsInserted: insertedOptions,
      modulesTotal: modules.length,
      questionsTotal: questions.length
    };
    
    logger.info('Seed do questionário MAR concluído com sucesso', { 
      tag: 'Seed',
      data: result
    });
    
    addLogEntry('info', 'Seed do questionário MAR concluído com sucesso', result);
    
    return true;
  } catch (error) {
    logger.error('Erro durante seed do questionário MAR:', {
      tag: 'Seed',
      data: { error }
    });
    
    addLogEntry('error', 'Erro durante seed do questionário MAR', {
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return false;
  }
};

/**
 * Verifica a consistência do questionário
 * @returns Promise<{success: boolean, data: any}>
 */
export const verifyQuizConsistency = async (): Promise<{success: boolean, data: any}> => {
  try {
    logger.info('Verificando consistência do questionário', { tag: 'Seed' });
    
    // Verificar contagem de dados
    const { count: modulesCount } = await supabase
      .from('quiz_modules')
      .select('*', { count: 'exact', head: true });
      
    const { count: questionsCount } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true });
      
    const { count: optionsCount } = await supabase
      .from('quiz_options')
      .select('*', { count: 'exact', head: true });
    
    // Verificar se há pelo menos um módulo, uma pergunta e uma opção
    const hasBasicData = modulesCount > 0 && questionsCount > 0 && optionsCount > 0;
    
    // Verificar se todas as perguntas têm um módulo válido
    const { data: invalidQuestions, error: questionError } = await supabase
      .from('quiz_questions')
      .select('id')
      .not('module_id', 'in', `(select id from quiz_modules)`);
      
    const hasInvalidQuestions = invalidQuestions && invalidQuestions.length > 0;
    
    // Verificar se todas as opções têm uma pergunta válida
    const { data: invalidOptions, error: optionError } = await supabase
      .from('quiz_options')
      .select('id')
      .not('question_id', 'in', `(select id from quiz_questions)`);
      
    const hasInvalidOptions = invalidOptions && invalidOptions.length > 0;
    
    // Obter tipos de perguntas para verificar diversidade
    const { data: questionTypes } = await supabase
      .from('quiz_questions')
      .select('type')
      .is('type', 'not.null');
      
    const uniqueTypes = questionTypes ? [...new Set(questionTypes.map(q => q.type))] : [];
    
    const result = {
      success: hasBasicData && !hasInvalidQuestions && !hasInvalidOptions,
      data: {
        modules: modulesCount,
        questions: questionsCount,
        options: optionsCount,
        hasInvalidQuestions,
        hasInvalidOptions,
        questionTypes: uniqueTypes
      }
    };
    
    logger.info('Verificação de consistência concluída', { 
      tag: 'Seed',
      data: result
    });
    
    return result;
  } catch (error) {
    logger.error('Erro ao verificar consistência do questionário:', {
      tag: 'Seed',
      data: { error }
    });
    
    return {
      success: false,
      data: {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    };
  }
};
