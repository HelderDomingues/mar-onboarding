
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { logger } from '@/utils/logger';
import { addLogEntry } from '@/utils/projectLog';

// Chaves de acesso ao Supabase atualizadas
const SUPABASE_URL = "https://btzvozqajqknqfoymxpg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0enZvenFhanFrbnFmb3lteHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjYwNjEsImV4cCI6MjA1OTc0MjA2MX0.QdD7bEZBPvVNBhHqgAGtFaZOxJrdosFTElxRUCIrnL8";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0enZvenFhanFrbnFmb3lteHBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE2NjA2MSwiZXhwIjoyMDU5NzQyMDYxfQ.3Dv3h4JIfB5LZ37KIwwqw18AxtqElf17-a21kwXsryE";

// Cliente Supabase padrão com a chave anônima
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

// Cliente Supabase com a chave de serviço para operações administrativas
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para obter emails dos usuários (requer privilégios de admin)
export const getUserEmails = async () => {
  try {
    addLogEntry('database', 'Buscando emails de usuários');
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      addLogEntry('error', 'Erro ao buscar usuários', { error });
      return null;
    }
    
    // Retorna um array com id e email de cada usuário
    const userData = data.users.map(user => ({
      user_id: user.id,
      email: user.email
    }));
    
    addLogEntry('database', 'Emails de usuários obtidos com sucesso', { count: userData.length });
    return userData;
  } catch (error) {
    console.error("Erro ao buscar emails dos usuários:", error);
    addLogEntry('error', 'Erro ao buscar emails dos usuários', { error });
    return null;
  }
};

// Função para assegurar que o email do usuário esteja presente na tabela user_roles
export const ensureUserEmailInRoles = async (userId: string, userEmail: string, isAdmin: boolean = false) => {
  if (!userId || !userEmail) {
    addLogEntry('error', 'Tentativa de registrar email sem ID ou email válido', { userId, userEmail });
    return false;
  }
  
  try {
    addLogEntry('database', 'Verificando email do usuário em user_roles', { userId, userEmail });
    
    // Verificar se o usuário já tem um papel registrado
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id, role, email')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (roleError) {
      console.error("Erro ao verificar papel do usuário:", roleError);
      addLogEntry('error', 'Erro ao verificar papel do usuário', { roleError, userId });
      return false;
    }
    
    // Se já existe um registro, atualizar o email se necessário
    if (existingRole) {
      // Se o email já está correto, não precisamos fazer nada
      if (existingRole.email === userEmail) {
        addLogEntry('info', 'Email do usuário já está atualizado', { userId, userEmail });
        return true;
      }
      
      // Se não, atualizar o email
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ email: userEmail })
        .eq('id', existingRole.id);
        
      if (updateError) {
        console.error("Erro ao atualizar email do usuário:", updateError);
        addLogEntry('error', 'Erro ao atualizar email do usuário', { updateError, userId });
        return false;
      }
      
      addLogEntry('database', 'Email do usuário atualizado com sucesso', { userId, userEmail });
      return true;
    }
    
    // Se não existe, criar um novo registro
    const role = isAdmin ? 'admin' : 'user';
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role, email: userEmail });
      
    if (insertError) {
      console.error("Erro ao criar papel para usuário:", insertError);
      addLogEntry('error', 'Erro ao criar papel para usuário', { insertError, userId });
      return false;
    }
    
    addLogEntry('database', 'Papel de usuário criado com sucesso', { userId, userEmail, role });
    return true;
  } catch (error) {
    console.error("Erro ao processar email do usuário:", error);
    addLogEntry('error', 'Erro ao processar email do usuário', { error, userId });
    return false;
  }
};

// Função para enviar respostas para o webhook
export const enviarRespostasParaWebhook = async (submissionId: string) => {
  try {
    addLogEntry('database', 'Enviando respostas para webhook', { submissionId });
    
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: { submissionId }
    });
    
    if (error) {
      console.error("Erro ao invocar webhook:", error);
      addLogEntry('error', 'Erro ao invocar webhook', { error, submissionId });
      return { success: false, error };
    }
    
    addLogEntry('database', 'Respostas enviadas com sucesso para webhook', { submissionId });
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao enviar respostas para webhook:", error);
    addLogEntry('error', 'Erro ao enviar respostas para webhook', { error, submissionId });
    return { success: false, error };
  }
};

// Função para verificar se o usuário é admin
export const isUserAdmin = async (userId: string | undefined): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    addLogEntry('auth', 'Verificando se o usuário é admin', { userId });
    
    // Usar setTimeout para evitar problemas de recursão
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const { data, error } = await supabase.rpc('is_admin');
          
          if (error) {
            console.error("Erro ao verificar se o usuário é admin:", error);
            addLogEntry('error', 'Erro ao verificar se o usuário é admin', { error, userId });
            resolve(false);
            return;
          }
          
          addLogEntry('auth', 'Verificação de admin concluída', { isAdmin: !!data, userId });
          resolve(!!data);
        } catch (error) {
          console.error("Erro ao verificar status de admin:", error);
          addLogEntry('error', 'Erro ao verificar status de admin', { error, userId });
          resolve(false);
        }
      }, 0);
    });
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error);
    addLogEntry('error', 'Erro ao verificar status de admin', { error, userId });
    return false;
  }
};

// Função para atualizar ou criar papel de admin para um usuário
export const setUserAsAdmin = async (userId: string, userEmail: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    addLogEntry('database', 'Configurando usuário como admin', { userId, userEmail });
    return await ensureUserEmailInRoles(userId, userEmail, true);
  } catch (error) {
    console.error("Erro ao configurar usuário como admin:", error);
    addLogEntry('error', 'Erro ao configurar usuário como admin', { error, userId });
    return false;
  }
};

// Função específica para configurar o administrador principal
export const setupMainAdmin = async (): Promise<boolean> => {
  try {
    const adminEmail = "helder@crievalor.com.br";
    addLogEntry('database', 'Configurando administrador principal', { email: adminEmail });
    
    // Buscar o usuário pelo email
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Erro ao buscar usuários:", usersError);
      addLogEntry('error', 'Erro ao buscar usuários para configurar admin principal', { error: usersError });
      return false;
    }
    
    const adminUser = users.users.find(user => user.email === adminEmail);
    
    if (!adminUser) {
      console.error("Administrador principal não encontrado:", adminEmail);
      addLogEntry('error', 'Administrador principal não encontrado', { email: adminEmail });
      return false;
    }
    
    // Configurar como admin
    const success = await setUserAsAdmin(adminUser.id, adminEmail);
    
    if (success) {
      addLogEntry('database', 'Administrador principal configurado com sucesso', { userId: adminUser.id, email: adminEmail });
    }
    
    return success;
  } catch (error) {
    console.error("Erro ao configurar administrador principal:", error);
    addLogEntry('error', 'Erro ao configurar administrador principal', { error });
    return false;
  }
};

// Função para completar o questionário e enviar ao webhook
export const completarQuestionario = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    addLogEntry('database', 'Completando questionário', { userId });
    
    // Primeiro, completa o questionário usando a função RPC
    const { data: completeResult, error: completeError } = await supabase.rpc('complete_quiz', {
      user_id: userId
    });
    
    if (completeError) {
      console.error("Erro ao completar o questionário:", completeError);
      addLogEntry('error', 'Erro ao completar o questionário', { error: completeError, userId });
      return false;
    }
    
    // Busca o ID da submissão
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (submissionError || !submission) {
      console.error("Erro ao buscar a submissão:", submissionError);
      addLogEntry('error', 'Erro ao buscar a submissão', { error: submissionError, userId });
      return false;
    }
    
    // Enviar para o webhook
    const webhookResult = await enviarRespostasParaWebhook(submission.id);
    
    if (webhookResult.success) {
      addLogEntry('database', 'Questionário completado e enviado com sucesso', { userId, submissionId: submission.id });
    }
    
    return webhookResult.success;
  } catch (error) {
    console.error("Erro ao completar e enviar questionário:", error);
    addLogEntry('error', 'Erro ao completar e enviar questionário', { error, userId });
    return false;
  }
};

// Função para salvar uma resposta do questionário
export const salvarRespostaQuestionario = async (
  userId: string,
  questionId: string,
  questionText: string,
  answer: string,
  userEmail: string,
  userName: string
): Promise<boolean> => {
  if (!userId || !questionId) return false;
  
  try {
    addLogEntry('database', 'Salvando resposta do questionário', { userId, questionId });
    
    const { error } = await supabase
      .from('quiz_answers')
      .upsert({
        user_id: userId,
        question_id: questionId,
        question_text: questionText,
        answer,
        user_email: userEmail,
        user_name: userName,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,question_id'
      });
    
    if (error) {
      console.error("Erro ao salvar resposta:", error);
      addLogEntry('error', 'Erro ao salvar resposta do questionário', { error, userId, questionId });
      return false;
    }
    
    addLogEntry('database', 'Resposta do questionário salva com sucesso', { userId, questionId });
    return true;
  } catch (error) {
    console.error("Erro ao salvar resposta do questionário:", error);
    addLogEntry('error', 'Erro ao salvar resposta do questionário', { error, userId, questionId });
    return false;
  }
};

// Função para atualizar progresso do questionário
export const atualizarProgressoQuestionario = async (
  userId: string,
  currentModule: number,
  isComplete: boolean = false,
  userEmail: string,
  userName: string
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    addLogEntry('database', 'Atualizando progresso do questionário', { 
      userId, 
      currentModule, 
      isComplete 
    });
    
    const updateData: any = {
      user_id: userId,
      current_module: currentModule,
      user_email: userEmail,
      user_name: userName
    };
    
    if (isComplete) {
      updateData.is_complete = true;
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('quiz_submissions')
      .upsert(updateData, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error("Erro ao atualizar progresso:", error);
      addLogEntry('error', 'Erro ao atualizar progresso do questionário', { error, userId });
      return false;
    }
    
    addLogEntry('database', 'Progresso do questionário atualizado com sucesso', { 
      userId, 
      currentModule, 
      isComplete 
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao atualizar progresso do questionário:", error);
    addLogEntry('error', 'Erro ao atualizar progresso do questionário', { error, userId });
    return false;
  }
};

// Inicializar o sistema de logs para o cliente Supabase
addLogEntry('info', 'Cliente Supabase inicializado', {
  url: SUPABASE_URL.substring(0, 15) + '...',
  mode: process.env.NODE_ENV
});

// Configurar o administrador principal automaticamente
setTimeout(async () => {
  try {
    await setupMainAdmin();
  } catch (error) {
    console.error("Erro ao configurar administrador principal:", error);
    addLogEntry('error', 'Erro ao configurar administrador principal durante inicialização', { error });
  }
}, 1000);
