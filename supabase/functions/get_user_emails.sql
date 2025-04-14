
-- Função para obter emails de usuários
-- Esta é uma função de segurança definer para acessar a tabela auth.users
CREATE OR REPLACE FUNCTION public.complete_quiz(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _now timestamp with time zone := now();
  _exists boolean;
BEGIN
  -- Verificar se o usuário existe na submissão
  SELECT EXISTS(
    SELECT 1 FROM quiz_submissions WHERE user_id = $1
  ) INTO _exists;
  
  -- Atualizar ou inserir registro
  IF _exists THEN
    UPDATE quiz_submissions 
    SET 
      completed = true,
      completed_at = _now,
      last_active = _now
    WHERE user_id = $1;
  ELSE
    INSERT INTO quiz_submissions (
      user_id, completed, completed_at, started_at, last_active, current_module
    ) VALUES (
      $1, true, _now, _now, _now, 8
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
