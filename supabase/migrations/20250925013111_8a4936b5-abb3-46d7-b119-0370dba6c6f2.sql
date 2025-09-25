-- ===================================================================
-- CORREÇÕES CRÍTICAS DE SEGURANÇA - SISTEMA DE ROLES E RLS
-- ===================================================================

-- 1. Criar função segura para verificar se usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Atualizar políticas da tabela user_roles para remover dependência do email hardcoded
DROP POLICY IF EXISTS "Apenas administradores podem atualizar papéis" ON public.user_roles;
DROP POLICY IF EXISTS "Apenas administradores podem excluir papéis" ON public.user_roles;
DROP POLICY IF EXISTS "Apenas administradores podem inserir papéis" ON public.user_roles;
DROP POLICY IF EXISTS "Os administradores podem visualizar todos os papéis" ON public.user_roles;

-- Criar políticas RLS seguras baseadas em roles, não em email
CREATE POLICY "Admin pode gerenciar todos os papéis" 
ON public.user_roles 
FOR ALL 
USING (public.is_current_user_admin());

CREATE POLICY "Usuários podem ver seus próprios papéis" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Atualizar políticas da tabela profiles para usar função consistente
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;

CREATE POLICY "Admins podem gerenciar todos os perfis" 
ON public.profiles 
FOR ALL 
USING (public.is_current_user_admin());

-- 4. Criar função para configuração dinâmica de webhook
CREATE TABLE IF NOT EXISTS public.system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text NOT NULL UNIQUE,
  config_value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de configuração
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Política RLS para configuração do sistema - apenas admins
CREATE POLICY "Apenas admins podem gerenciar configurações" 
ON public.system_config 
FOR ALL 
USING (public.is_current_user_admin());

-- Inserir configuração padrão do webhook
INSERT INTO public.system_config (config_key, config_value, description)
VALUES (
  'webhook_url', 
  'https://hook.us1.make.com/6vwc6a7pb7rhvp0kgvnkfg6hgk63cxqr',
  'URL do webhook para envio de dados do questionário'
) ON CONFLICT (config_key) DO NOTHING;

-- 5. Função para obter configuração do sistema
CREATE OR REPLACE FUNCTION public.get_system_config(p_config_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_config_value text;
BEGIN
  -- Verificar se é admin para acessar configurações sensíveis
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar configurações do sistema';
  END IF;
  
  SELECT config_value INTO v_config_value
  FROM public.system_config
  WHERE config_key = p_config_key;
  
  RETURN v_config_value;
END;
$$;

-- 6. Função para atualizar configuração do sistema
CREATE OR REPLACE FUNCTION public.update_system_config(p_config_key text, p_config_value text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem modificar configurações do sistema';
  END IF;
  
  -- Atualizar ou inserir configuração
  INSERT INTO public.system_config (config_key, config_value, updated_at)
  VALUES (p_config_key, p_config_value, now())
  ON CONFLICT (config_key) 
  DO UPDATE SET 
    config_value = EXCLUDED.config_value,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- 7. Criar tabela de auditoria para ações administrativas
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  target_table text,
  target_record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Política RLS para logs de auditoria - apenas admins podem ler
CREATE POLICY "Apenas admins podem ver logs de auditoria" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.is_current_user_admin());

-- 8. Função para registrar ações administrativas
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_target_table text DEFAULT NULL,
  p_target_record_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_current_user_admin() THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_table,
    target_record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_table,
    p_target_record_id,
    p_old_values,
    p_new_values
  );
  
  RETURN true;
END;
$$;

-- 9. Atualizar função de toggle admin role para incluir auditoria
CREATE OR REPLACE FUNCTION public.toggle_user_admin_role(p_user_id uuid, p_user_email text, p_make_admin boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_old_roles jsonb;
  v_new_roles jsonb;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem modificar papéis';
  END IF;
  
  -- Capturar estado anterior
  SELECT jsonb_agg(role) INTO v_old_roles
  FROM public.user_roles
  WHERE user_id = p_user_id;
  
  -- Executar ação
  IF p_make_admin THEN
    -- Adicionar role de admin se não existir
    INSERT INTO public.user_roles (user_id, user_email, role)
    VALUES (p_user_id, p_user_email, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Remover role de admin
    DELETE FROM public.user_roles
    WHERE user_id = p_user_id AND role = 'admin';
  END IF;
  
  -- Capturar estado posterior
  SELECT jsonb_agg(role) INTO v_new_roles
  FROM public.user_roles
  WHERE user_id = p_user_id;
  
  -- Registrar ação na auditoria
  PERFORM public.log_admin_action(
    CASE WHEN p_make_admin THEN 'GRANT_ADMIN_ROLE' ELSE 'REVOKE_ADMIN_ROLE' END,
    'user_roles',
    p_user_id,
    jsonb_build_object('roles', v_old_roles),
    jsonb_build_object('roles', v_new_roles)
  );
  
  RETURN true;
END;
$$;

-- 10. Garantir que há pelo menos um admin no sistema
-- Inserir role de admin para o usuário principal se não existir
DO $$
DECLARE
  v_admin_count integer;
  v_main_user_id uuid;
BEGIN
  -- Contar quantos admins existem
  SELECT COUNT(*) INTO v_admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  -- Se não há nenhum admin, tentar encontrar o usuário principal
  IF v_admin_count = 0 THEN
    SELECT id INTO v_main_user_id
    FROM public.profiles
    WHERE user_email = 'helder@crievalor.com.br'
    LIMIT 1;
    
    -- Se encontrou o usuário principal, torná-lo admin
    IF v_main_user_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, user_email, role)
      VALUES (v_main_user_id, 'helder@crievalor.com.br', 'admin')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END;
$$;

-- Conceder permissões para as novas funções
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_config(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_system_config(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, text, uuid, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_user_admin_role(uuid, text, boolean) TO authenticated;