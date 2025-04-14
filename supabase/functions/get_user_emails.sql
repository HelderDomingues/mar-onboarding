
-- Função para obter emails de usuários
-- Esta é uma função de segurança definer para acessar a tabela auth.users
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE (user_id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id as user_id, email FROM auth.users;
$$;

-- Permissão para executar a função
GRANT EXECUTE ON FUNCTION public.get_user_emails() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_emails() TO service_role;
