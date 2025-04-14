
-- Função para obter emails dos usuários com segurança
-- Esta função deve ser executada diretamente no SQL Editor do Supabase
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE (user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Verifica se o usuário atual tem permissão de admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar emails de usuários';
  END IF;
  
  RETURN QUERY
  SELECT au.id as user_id, au.email
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Garante que apenas funções autorizadas podem chamar esta função
REVOKE ALL ON FUNCTION public.get_user_emails() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_emails() TO authenticated;
