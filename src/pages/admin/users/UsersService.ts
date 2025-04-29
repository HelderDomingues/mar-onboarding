
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { addLogEntry } from "@/utils/projectLog";
import { logger } from "@/utils/logger";
import type { UserProfile, ConfigResult } from "@/types/admin";
import { ServiceRoleConfig } from "@/config/serviceRole";

// Função para obter emails dos usuários usando client admin
export async function getUserEmails() {
  try {
    if (!supabaseAdmin) {
      throw new Error('Acesso admin não configurado');
    }
    
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    return data.users.map(user => ({
      user_id: user.id,
      user_email: user.email
    }));
  } catch (error) {
    console.error('Erro ao buscar emails dos usuários:', error);
    return [];
  }
}

// Função para configurar acesso aos emails
export async function configureEmailAccess(serviceRoleKey: string): Promise<ConfigResult> {
  try {
    // Validações básicas da chave
    if (!serviceRoleKey || serviceRoleKey.trim().length < 20) {
      return {
        success: false,
        message: "Chave inválida, muito curta",
        detalhes: "A chave service_role deve ter pelo menos 20 caracteres"
      };
    }
    
    if (!serviceRoleKey.startsWith('eyJ')) {
      return {
        success: false,
        message: "Formato de chave inválido",
        detalhes: "A chave service_role deve começar com 'eyJ'"
      };
    }
    
    // Tenta salvar a chave
    const saved = ServiceRoleConfig.set(serviceRoleKey);
    
    if (!saved) {
      return {
        success: false,
        message: "Não foi possível salvar a chave",
        detalhes: "Erro ao salvar no armazenamento local"
      };
    }
    
    // Recarrega a página para inicializar o cliente admin
    window.location.reload();
    
    return {
      success: true,
      message: "Chave configurada com sucesso"
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Erro ao configurar chave",
      detalhes: error.message || "Erro desconhecido",
      codigo: error.code
    };
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
      hasEmailAccess: emailMap.size > 0
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

export const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
  try {
    if (isCurrentlyAdmin) {
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
    } else {
      await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });
    }
    
    return true;
  } catch (error) {
    logger.error('Erro ao atualizar permissão:', {
      tag: 'Admin',
      data: { error }
    });
    throw error;
  }
};

export const setupEmailAccessService = async (serviceRoleKey: string): Promise<ConfigResult> => {
  try {
    return await configureEmailAccess(serviceRoleKey);
  } catch (error: any) {
    logger.error('Erro ao configurar acesso aos emails:', {
      tag: 'Admin',
      data: { error }
    });
    
    return {
      success: false,
      message: "Erro inesperado ao configurar acesso aos emails."
    };
  }
};

// Re-exportar a classe ServiceRoleConfig
export { ServiceRoleConfig } from '@/config/serviceRole';
