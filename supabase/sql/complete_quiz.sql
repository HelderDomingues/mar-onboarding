-- Safe replacement for complete_quiz that fails loudly when update/insert didn't mark completed
-- Use p_user_id parameter name to avoid conflicts

CREATE OR REPLACE FUNCTION public.complete_quiz(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _now timestamp with time zone := now();
  _user_email text;
  _exists boolean;
  _rows int := 0;
BEGIN
  -- Verificar se já existe submissão para este usuário
  SELECT EXISTS(SELECT 1 FROM quiz_submissions WHERE user_id = p_user_id) INTO _exists;

  -- Buscar email do usuário (profiles ou auth.users)
  SELECT user_email INTO _user_email
  FROM profiles
  WHERE id = p_user_id;

  IF _user_email IS NULL THEN
    BEGIN
      SELECT email INTO _user_email
      FROM auth.users
      WHERE id = p_user_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao buscar email do usuário: %', SQLERRM;
        _user_email := NULL;
    END;
  END IF;

  -- Garantir que user_email não seja nulo (coluna é NOT NULL)
  _user_email := COALESCE(_user_email, '');

  -- Atualizar ou inserir registro
  IF _exists THEN
    UPDATE quiz_submissions
    SET
      completed = true,
      completed_at = _now,
      user_email = COALESCE(NULLIF(_user_email, ''), user_email)
    WHERE user_id = p_user_id;

    GET DIAGNOSTICS _rows = ROW_COUNT;
    RAISE NOTICE 'complete_quiz: update rows = % for user %', _rows, p_user_id;
  ELSE
    INSERT INTO quiz_submissions (
      user_id,
      user_email,
      completed,
      completed_at,
      started_at,
      current_module
    ) VALUES (
      p_user_id,
      _user_email,
      true,
      _now,
      _now,
      11
    );

    -- Inserção bem sucedida: contar como 1 linha afetada
    _rows := 1;
    RAISE NOTICE 'complete_quiz: inserted new submission for user %', p_user_id;
  END IF;

  -- Verificação explícita: confirmar que a submissão está marcada como completed
  PERFORM 1 FROM quiz_submissions WHERE user_id = p_user_id AND completed = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'complete_quiz: verification failed, submission not marked completed for user %', p_user_id;
  END IF;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao completar questionário: %', SQLERRM;
    -- Repassar erro para o caller (RPC) como exception
    RAISE;
END;
$function$;
