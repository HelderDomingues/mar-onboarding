-- 2025-09-29: Fix gerar_respostas_json and defensive coalesce in insertions
-- Ensure gerar_respostas_json never returns NULL (returns '{}' instead)
-- and make trigger/functions use COALESCE when inserting into quiz_respostas_completas

BEGIN;

-- 1) Replace gerar_respostas_json to return '{}' when no rows
CREATE OR REPLACE FUNCTION public.gerar_respostas_json(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  resultado JSONB;
BEGIN
  SELECT jsonb_object_agg(q.text, a.answer) INTO resultado
  FROM public.quiz_answers a
  JOIN public.quiz_questions q ON a.question_id = q.id
  WHERE a.user_id = p_user_id;

  -- Retornar objeto vazio ao invés de NULL para evitar violação de NOT NULL
  RETURN COALESCE(resultado, '{}'::jsonb);
END;
$$;

-- 2) Replace auto_complete_quiz trigger function to defensively COALESCE generated JSON
CREATE OR REPLACE FUNCTION public.auto_complete_quiz()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  v_total_questions INTEGER;
  v_answered_questions INTEGER;
  v_user_email TEXT;
  v_user_name TEXT;
  v_user_id uuid;
  v_submission_id uuid;
  v_respostas jsonb;
BEGIN
  -- Contar total de questões
  SELECT COUNT(*) INTO v_total_questions FROM quiz_questions;

  -- Contar respostas desta submissão
  SELECT COUNT(*) INTO v_answered_questions 
  FROM quiz_answers 
  WHERE submission_id = NEW.submission_id;

  -- Se completou 90% ou mais, marcar como concluído
  IF v_answered_questions >= (v_total_questions * 0.9) THEN
    v_submission_id := NEW.submission_id;
    v_user_id := (SELECT user_id FROM quiz_submissions WHERE id = v_submission_id);

    -- Buscar dados do usuário
    SELECT user_email, COALESCE(user_name, '') INTO v_user_email, v_user_name
    FROM quiz_submissions 
    WHERE id = v_submission_id;

    -- Atualizar submissão (somente quando ainda não estiver completa)
    UPDATE quiz_submissions 
    SET completed = true, completed_at = now()
    WHERE id = v_submission_id AND completed = false;

    -- Gerar respostas com segurança (garantir objeto não nulo)
    v_respostas := COALESCE(gerar_respostas_json(v_user_id), '{}'::jsonb);

    -- Inserir respostas completas se não existir
    IF NOT EXISTS (SELECT 1 FROM quiz_respostas_completas WHERE submission_id = v_submission_id) THEN
      INSERT INTO quiz_respostas_completas (
        user_id, submission_id, user_email, user_name, respostas
      ) VALUES (
        v_user_id,
        v_submission_id,
        v_user_email,
        v_user_name,
        v_respostas
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Replace fix_quiz_completion to use COALESCE as well
CREATE OR REPLACE FUNCTION public.fix_quiz_completion(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_total_questions INTEGER;
  v_answered_questions INTEGER;
  v_submission_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
  v_respostas jsonb;
BEGIN
  -- Contar total de questões
  SELECT COUNT(*) INTO v_total_questions FROM quiz_questions;
  
  -- Buscar submissão do usuário
  SELECT id, user_email, COALESCE(user_name, '') INTO v_submission_id, v_user_email, v_user_name
  FROM quiz_submissions 
  WHERE user_id = p_user_id
  LIMIT 1;
  
  IF v_submission_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Contar respostas do usuário
  SELECT COUNT(*) INTO v_answered_questions 
  FROM quiz_answers 
  WHERE submission_id = v_submission_id;
  
  -- Se respondeu pelo menos 90% das questões, marcar como completo
  IF v_answered_questions >= (v_total_questions * 0.9) THEN
    UPDATE quiz_submissions 
    SET completed = true, completed_at = now()
    WHERE id = v_submission_id;
    
    -- Gerar respostas completas se não existir
    IF NOT EXISTS (SELECT 1 FROM quiz_respostas_completas WHERE submission_id = v_submission_id) THEN
      v_respostas := COALESCE(gerar_respostas_json(p_user_id), '{}'::jsonb);
      INSERT INTO quiz_respostas_completas (
        user_id, submission_id, user_email, user_name, respostas
      ) VALUES (
        p_user_id, 
        v_submission_id, 
        v_user_email, 
        v_user_name,
        v_respostas
      );
    END IF;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 4) Defensive update of existing NULL resposta rows: set to empty object
UPDATE public.quiz_respostas_completas
SET respostas = '{}'::jsonb
WHERE respostas IS NULL;

COMMIT;
