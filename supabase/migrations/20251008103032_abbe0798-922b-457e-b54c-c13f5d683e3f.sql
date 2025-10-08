-- Solução 1: Modificar trigger registrar_respostas_completas para evitar INSERT com respostas NULL
-- Esta alteração previne o erro "null value in column 'respostas'" quando um novo usuário inicia o quiz

CREATE OR REPLACE FUNCTION public.registrar_respostas_completas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_respostas JSONB;
  v_user_email TEXT;
  v_full_name TEXT;
BEGIN
  -- Get user email and name from profiles or auth.users
  SELECT p.user_email, p.full_name
  INTO v_user_email, v_full_name
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  -- Fallback to auth.users email if not found in profiles
  IF v_user_email IS NULL THEN
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = NEW.user_id;
  END IF;

  -- Generate JSON with all user answers for the current submission
  SELECT jsonb_object_agg(
    COALESCE(q.text, 'Pergunta ' || q.order_number),
    a.answer
  ) INTO v_respostas
  FROM public.quiz_answers a
  JOIN public.quiz_questions q ON a.question_id = q.id
  WHERE a.submission_id = NEW.id;

  -- CRÍTICO: Só insere se houver respostas, evitando constraint NOT NULL
  IF v_respostas IS NULL OR jsonb_typeof(v_respostas) = 'null' THEN
    RETURN NEW;
  END IF;

  -- Insert or update into the consolidated answers table
  INSERT INTO public.quiz_respostas_completas
    (user_id, submission_id, user_email, full_name, respostas, data_submissao, webhook_processed)
  VALUES
    (NEW.user_id, NEW.id, COALESCE(v_user_email, NEW.user_email), COALESCE(v_full_name, NEW.full_name), v_respostas, NOW(), FALSE)
  ON CONFLICT (submission_id) DO UPDATE SET
    user_email = EXCLUDED.user_email,
    full_name = EXCLUDED.full_name,
    respostas = EXCLUDED.respostas,
    data_submissao = NOW(),
    webhook_processed = FALSE;

  RETURN NEW;
END;
$function$;