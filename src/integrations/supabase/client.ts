
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Chaves de acesso ao Supabase atualizadas
const SUPABASE_URL = "https://btzvozqajqknqfoymxpg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0enZvenFhanFrbnFmb3lteHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjYwNjEsImV4cCI6MjA1OTc0MjA2MSwiZXhwIjoyMDU5NzQyMDYxfQ.QdD7bEZBPvVNBhHqgAGtFaZOxJrdosFTElxRUCIrnL8";
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
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      return null;
    }
    
    // Retorna um array com id e email de cada usuário
    return data.users.map(user => ({
      user_id: user.id,
      email: user.email
    }));
  } catch (error) {
    console.error("Erro ao buscar emails dos usuários:", error);
    return null;
  }
};

// Função para enviar respostas para o webhook
export const enviarRespostasParaWebhook = async (submissionId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('quiz-webhook', {
      body: { submissionId }
    });
    
    if (error) {
      console.error("Erro ao invocar webhook:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao enviar respostas para webhook:", error);
    return { success: false, error };
  }
};

// Função para verificar se o usuário é admin
export const isUserAdmin = async (userId: string | undefined): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error("Erro ao verificar se o usuário é admin:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error);
    return false;
  }
};

// Função para atualizar ou criar papel de admin para um usuário
export const setUserAsAdmin = async (userId: string, userEmail: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Verificar se o usuário já é admin
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (roleError) {
      console.error("Erro ao verificar papel atual:", roleError);
      return false;
    }
    
    if (existingRole) {
      // Atualizar o email se o usuário já for admin
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ email: userEmail })
        .eq('id', existingRole.id);
        
      if (updateError) {
        console.error("Erro ao atualizar email de admin:", updateError);
        return false;
      }
    } else {
      // Criar novo papel de admin
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin', email: userEmail });
        
      if (insertError) {
        console.error("Erro ao criar papel de admin:", insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao configurar usuário como admin:", error);
    return false;
  }
};

// Função para completar o questionário e enviar ao webhook
export const completarQuestionario = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Primeiro, completa o questionário usando a função RPC
    const { data: completeResult, error: completeError } = await supabase.rpc('complete_quiz', {
      user_id: userId
    });
    
    if (completeError) {
      console.error("Erro ao completar o questionário:", completeError);
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
      return false;
    }
    
    // Enviar para o webhook
    const webhookResult = await enviarRespostasParaWebhook(submission.id);
    
    return webhookResult.success;
  } catch (error) {
    console.error("Erro ao completar e enviar questionário:", error);
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
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao salvar resposta do questionário:", error);
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
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao atualizar progresso do questionário:", error);
    return false;
  }
};
