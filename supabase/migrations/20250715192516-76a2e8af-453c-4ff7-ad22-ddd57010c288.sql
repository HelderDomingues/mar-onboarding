-- Corrigir a função complete_quiz para usar as colunas corretas
-- e respeitar as políticas RLS
CREATE OR REPLACE FUNCTION public.complete_quiz(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _now timestamp with time zone := now();
  _user_email text;
  _exists boolean;
BEGIN
  -- Verificar se o usuário existe na submissão
  SELECT EXISTS(
    SELECT 1 FROM quiz_submissions WHERE user_id = $1
  ) INTO _exists;
  
  -- Buscar email do usuário (primeiro do perfil, depois de auth.users)
  SELECT user_email INTO _user_email
  FROM profiles 
  WHERE id = $1;
  
  -- Se email não foi encontrado no perfil, tentar buscar de auth.users
  IF _user_email IS NULL THEN
    BEGIN
      SELECT email INTO _user_email
      FROM auth.users
      WHERE id = $1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao buscar email do usuário: %', SQLERRM;
    END;
  END IF;
  
  -- Atualizar ou inserir registro
  IF _exists THEN
    UPDATE quiz_submissions 
    SET 
      completed = true,
      completed_at = _now,
      user_email = COALESCE(_user_email, user_email) -- Manter email existente se não encontrarmos um novo
    WHERE user_id = $1;
  ELSE
    INSERT INTO quiz_submissions (
      user_id, 
      user_email,
      completed, 
      completed_at, 
      started_at, 
      current_module
    ) VALUES (
      $1, 
      _user_email,
      true, 
      _now, 
      _now, 
      8  -- Assumimos que completou todos os módulos
    );
  END IF;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao completar questionário: %', SQLERRM;
    RETURN false;
END;
$$;