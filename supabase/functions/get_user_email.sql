
-- Função para obter o email do usuário diretamente da tabela auth.users
-- Isso é útil quando o email não está disponível em outros lugares
-- SECURITY DEFINER para poder acessar auth.users
CREATE OR REPLACE FUNCTION public.get_user_email(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Tentar obter o email da tabela auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id;
  
  RETURN v_email;
END;
$$;
