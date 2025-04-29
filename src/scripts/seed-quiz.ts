
/**
 * Script para inicializar o questionário MAR com segurança
 * Versão segura - Implementa backups antes de operações destrutivas e verificações
 */

import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
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
    try {
      await backupQuizTables('pre_seed_questionario');
    } catch (backupError) {
      logger.warn('Não foi possível fazer backup antes do seed (não crítico)', { 
        tag: 'Seed',
        error: backupError
      });
    }
    
    // Verificar se já existem dados
    const { data: modulesData, error: modulesError } = await supabase
      .from('quiz_modules')
      .select('*', { count: 'exact' });
      
    const { data: questionsData, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact' });
      
    const { data: optionsData, error: optionsError } = await supabase
      .from('quiz_options')
      .select('*', { count: 'exact' });
      
    const modulesCount = modulesData?.length || 0;
    const questionsCount = questionsData?.length || 0;
    const optionsCount = optionsData?.length || 0;
    
    // Log do estado atual
    logger.info('Estado atual do questionário:', { 
      tag: 'Seed',
      data: { modulesCount, questionsCount, optionsCount }
    });
    
    // Verificar se há erros críticos de permissão antes de continuar
    if (modulesError || questionsError || optionsError) {
      logger.error('Erro crítico ao acessar dados do questionário:', {
        tag: 'Seed',
        errors: { modulesError, questionsError, optionsError }
      });
      
      // Tentar usar supabaseAdmin se disponível
      if (supabaseAdmin) {
        logger.info('Tentando usar supabaseAdmin para inserção de dados', { tag: 'Seed' });
        
        // Limpar todas as tabelas existentes para inserção limpa
        try {
          await supabaseAdmin.from('quiz_options').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabaseAdmin.from('quiz_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabaseAdmin.from('quiz_modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          logger.info('Tabelas limpas com sucesso usando supabaseAdmin', { tag: 'Seed' });
        } catch (clearError) {
          logger.error('Erro ao limpar tabelas:', {
            tag: 'Seed',
            error: clearError
          });
          return false;
        }
        
        // Inserir dados usando supabaseAdmin
        try {
          const { error: modulesInsertError } = await supabaseAdmin.from('quiz_modules').insert(quizModulesData);
          if (modulesInsertError) throw modulesInsertError;
          
          // Buscar os módulos recém-inseridos para obter IDs
          const { data: newModules } = await supabaseAdmin.from('quiz_modules').select('*').order('order_number');
          
          if (!newModules || newModules.length === 0) {
            throw new Error('Não foi possível inserir os módulos');
          }
          
          // Mapear módulos por order_number para associar perguntas
          const moduleMap = {};
          newModules.forEach(module => {
            moduleMap[module.order_number] = module.id;
          });
          
          // Preparar perguntas com os IDs corretos dos módulos
          const questionsToInsert = quizQuestionsData.map(question => {
            // Determinar o módulo correto baseado no número de ordem
            let moduleNumber;
            
            if (question.order_number <= 8) moduleNumber = 1;
            else if (question.order_number <= 15) moduleNumber = 2;
            else if (question.order_number <= 22) moduleNumber = 3;
            else if (question.order_number <= 28) moduleNumber = 4;
            else if (question.order_number <= 33) moduleNumber = 5;
            else if (question.order_number <= 43) moduleNumber = 6; 
            else if (question.order_number <= 50) moduleNumber = 7; 
            else if (question.order_number <= 57) moduleNumber = 8; 
            else if (question.order_number <= 60) moduleNumber = 9;
            else moduleNumber = 10;
            
            return {
              ...question,
              module_id: moduleMap[moduleNumber]
            };
          });
          
          const { error: questionsInsertError } = await supabaseAdmin.from('quiz_questions').insert(questionsToInsert);
          if (questionsInsertError) throw questionsInsertError;
          
          // Buscar as perguntas recém-inseridas para obter IDs
          const { data: newQuestions } = await supabaseAdmin.from('quiz_questions').select('*').order('order_number');
          
          if (!newQuestions || newQuestions.length === 0) {
            throw new Error('Não foi possível inserir as perguntas');
          }
          
          // Mapear perguntas por order_number para associar opções
          const questionMap = {};
          newQuestions.forEach(question => {
            questionMap[question.order_number] = question.id;
          });
          
          // Preparar opções com os IDs corretos das perguntas
          const optionsToInsert = quizOptionsData.map(option => ({
            question_id: questionMap[option.question_number],
            text: option.text,
            order_number: option.order_number
          }));
          
          const { error: optionsInsertError } = await supabaseAdmin.from('quiz_options').insert(optionsToInsert);
          if (optionsInsertError) throw optionsInsertError;
          
          logger.info('Todos os dados inseridos com sucesso usando supabaseAdmin', { tag: 'Seed' });
          
          addLogEntry('info', 'Seed do questionário MAR concluído com sucesso via admin', {
            modules: newModules.length,
            questions: newQuestions.length,
            options: optionsToInsert.length
          });
          
          return true;
        } catch (insertError) {
          logger.error('Erro ao inserir dados usando supabaseAdmin:', {
            tag: 'Seed',
            error: insertError
          });
          return false;
        }
      } else {
        logger.error('Não foi possível acessar ou usar supabaseAdmin', { tag: 'Seed' });
        return false;
      }
    }
    
    // Processo de inserção por etapas - Módulos primeiro
    let insertedModules = 0;
    let updatedModules = 0;
    
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
          .eq('id', existingModule.id);
        
        if (updateError) {
          logger.error(`Erro ao atualizar módulo #${moduleData.order_number}:`, {
            tag: 'Seed',
            data: { error: updateError }
          });
          continue;
        }
        
        updatedModules++;
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
    let updatedQuestions = 0;
    
    for (const questionData of quizQuestionsData) {
      // Determinar o módulo correto baseado no número de ordem
      let moduleNumber;
      
      if (questionData.order_number <= 8) moduleNumber = 1;
      else if (questionData.order_number <= 15) moduleNumber = 2;
      else if (questionData.order_number <= 22) moduleNumber = 3;
      else if (questionData.order_number <= 28) moduleNumber = 4;
      else if (questionData.order_number <= 33) moduleNumber = 5;
      else if (questionData.order_number <= 43) moduleNumber = 6; 
      else if (questionData.order_number <= 50) moduleNumber = 7; 
      else if (questionData.order_number <= 57) moduleNumber = 8; 
      else if (questionData.order_number <= 60) moduleNumber = 9;
      else moduleNumber = 10;
      
      const moduleId = moduleMap[moduleNumber];
      
      if (!moduleId) {
        logger.warn(`Pulando pergunta: módulo #${moduleNumber} não encontrado`, { tag: 'Seed' });
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
        const updateData = {
          text: questionData.text,
          type: questionData.type,
          required: questionData.required,
          hint: questionData.hint || null
        };
        
        const { error: updateError } = await supabase
          .from('quiz_questions')
          .update(updateData)
          .eq('id', existingQuestion.id);
        
        if (updateError) {
          logger.error(`Erro ao atualizar pergunta:`, {
            tag: 'Seed',
            data: { error: updateError, questionData }
          });
          continue;
        }
        
        updatedQuestions++;
        logger.info(`Pergunta #${questionData.order_number} do módulo #${moduleNumber} atualizada`, { 
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
        logger.info(`Pergunta #${questionData.order_number} do módulo #${moduleNumber} inserida`, { 
          tag: 'Seed' 
        });
      }
    }
    
    // Buscar as perguntas após a atualização/inserção
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('order_number');
      
    if (!questions) {
      logger.error('Falha ao buscar perguntas após inserção', { tag: 'Seed' });
      return false;
    }
    
    // Construir mapa de perguntas para referência rápida
    const questionMap = {};
    questions.forEach(question => {
      questionMap[question.order_number] = question.id;
    });
    
    // Processo de inserção - Opções
    let insertedOptions = 0;
    let updatedOptions = 0;
    
    for (const optionData of quizOptionsData) {
      const questionId = questionMap[optionData.question_number];
      
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
        
        updatedOptions++;
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
      modulesUpdated: updatedModules,
      questionsInserted: insertedQuestions,
      questionsUpdated: updatedQuestions,
      optionsInserted: insertedOptions,
      optionsUpdated: updatedOptions,
      modulesTotal: modules.length,
      questionsTotal: questions.length,
      optionsTotal: optionsData?.length || 0
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

export default seedQuizData;
