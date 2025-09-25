
import { supabase } from "@/integrations/supabase/client";
import { addLogEntry } from "@/utils/projectLog";
import { logger } from "@/utils/logger";
import type { UserProfile, ConfigResult } from "@/types/admin";

// Função para obter emails dos usuários usando a Edge Function segura
export async function getUserEmails() {
  try {
    // Invoca a Edge Function 'get-all-users'
    const { data, error } = await supabase.functions.invoke('get-all-users');

    if (error) {
      // Trata erros de rede ou da própria função
      console.error('Erro ao invocar a Edge Function get-all-users:', error);
      throw error;
    }
    
    // A Edge Function retorna um objeto { users: [...] }
    if (!data.users || !Array.isArray(data.users)) {
      console.error('Resposta inesperada da Edge Function:', data);
      throw new Error('Formato de resposta inválido da função de usuários.');
    }

    // Mapeia os dados para o formato esperado pelo resto da aplicação
    return data.users.map(user => ({
      user_id: user.id,
      user_email: user.email
    }));
  } catch (error) {
    console.error('Erro ao buscar emails dos usuários via Edge Function:', error);
    // Retorna um array vazio em caso de erro para não quebrar a UI
    return [];
  }
}

export const fetchUserProfiles = async (userId: string | undefined) => {
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }
  
  try {
    addLogEntry('admin', 'Carregando perfis de usuários', {}, userId);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      addLogEntry('error', 'Erro ao carregar perfis de usuários', { 
        error: profilesError.message
      }, userId);
      throw new Error(profilesError.message);
    }
    
    const emailData = await getUserEmails();
    
    // Verificar se realmente obteve dados do admin
    const hasEmailAccess = emailData && Array.isArray(emailData) && emailData.length > 0;
    
    const { data: adminRolesData, error: adminRolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    
    if (adminRolesError) {
      logger.error('Erro ao buscar papéis de administrador:', {
        tag: 'Auth',
        data: { error: adminRolesError }
      });
      addLogEntry('error', 'Erro ao buscar papéis de administrador', { 
        error: adminRolesError.message
      }, userId);
    }
    
    const { data: submissions, error: submissionsError } = await supabase
      .from('quiz_submissions')
      .select('user_id');
      
    const adminUserIds = Array.isArray(adminRolesData) 
      ? adminRolesData.map(role => role.user_id) 
      : [];
      
    const submissionUserIds = submissions?.map(sub => sub.user_id) || [];
    
    const emailMap = new Map<string, string>();
    if (emailData && Array.isArray(emailData)) {
      emailData.forEach((item: any) => {
        if (item && item.user_id && item.user_email) {
          emailMap.set(item.user_id, item.user_email);
        }
      });
    }
    
    const profilesArray = Array.isArray(profilesData) ? profilesData : [];
    const processedUsers = profilesArray.map(profile => {
      return {
        ...profile,
        email: emailMap.get(profile.id) || profile.user_email || "Email não disponível",
        is_admin: adminUserIds.includes(profile.id),
        has_submission: submissionUserIds.includes(profile.id)
      } as UserProfile;
    });
    
    return {
      users: processedUsers,
      hasEmailAccess: hasEmailAccess
    };
  } catch (error: any) {
    logger.error('Erro ao buscar usuários:', {
      tag: 'Admin',
      data: { error }
    });
    
    addLogEntry('error', 'Erro ao buscar lista de usuários', { 
      error: error.message
    }, userId);
    
    throw error;
  }
};

// Função para obter email do usuário
const getUserEmail = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_email')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao obter email do usuário:', error);
      return null;
    }
    
    return data?.user_email || null;
  } catch (error) {
    console.error('Exceção ao obter email do usuário:', error);
    return null;
  }
};

export const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean): Promise<boolean> => {
  try {
    // Obter o email do usuário
    const userEmail = await getUserEmail(userId);
    if (!userEmail) {
      throw new Error('Não foi possível obter o email do usuário');
    }
    
    // Usar a nova função segura que inclui auditoria
    const { data, error } = await supabase.rpc('toggle_user_admin_role', {
      p_user_id: userId,
      p_user_email: userEmail,
      p_make_admin: !isCurrentlyAdmin
    });
    
    if (error) {
      console.error('Erro ao alterar papel de admin:', error);
      throw error;
    }
    
    return data === true;
  } catch (error) {
    console.error('Erro ao alterar papel de admin:', error);
    return false;
  }
};

