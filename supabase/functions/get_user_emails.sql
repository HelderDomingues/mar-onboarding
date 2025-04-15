
-- Função para completar o questionário de um usuário
-- Usa SECURITY DEFINER para ignorar políticas RLS
CREATE OR REPLACE FUNCTION public.complete_quiz(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _now timestamp with time zone := now();
  _user_email text;
  _user_name text;
  _exists boolean;
BEGIN
  -- Verificar se o usuário existe na submissão
  SELECT EXISTS(
    SELECT 1 FROM quiz_submissions WHERE user_id = $1
  ) INTO _exists;
  
  -- Buscar email e nome do usuário (se disponíveis)
  SELECT user_email, full_name INTO _user_email, _user_name
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
      last_active = _now,
      user_email = COALESCE(_user_email, user_email), -- Manter email existente se não encontrarmos um novo
      user_name = COALESCE(_user_name, user_name)     -- Manter nome existente se não encontrarmos um novo
    WHERE user_id = $1;
  ELSE
    INSERT INTO quiz_submissions (
      user_id, 
      user_email,
      user_name,
      completed, 
      completed_at, 
      started_at, 
      last_active, 
      current_module
    ) VALUES (
      $1, 
      _user_email,
      _user_name,
      true, 
      _now, 
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

-- Permissão para executar a função
GRANT EXECUTE ON FUNCTION public.complete_quiz(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_quiz(uuid) TO service_role;
