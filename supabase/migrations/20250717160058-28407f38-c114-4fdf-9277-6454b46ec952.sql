-- Função para marcar questionário como completo manualmente (correção de dados existentes)
CREATE OR REPLACE FUNCTION fix_quiz_completion(p_user_id uuid)
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
BEGIN
  -- Contar total de questões
  SELECT COUNT(*) INTO v_total_questions FROM quiz_questions;
  
  -- Buscar submissão do usuário
  SELECT id, user_email, user_name INTO v_submission_id, v_user_email, v_user_name
  FROM quiz_submissions 
  WHERE user_id = p_user_id;
  
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
      INSERT INTO quiz_respostas_completas (
        user_id, submission_id, user_email, user_name, respostas
      ) VALUES (
        p_user_id, 
        v_submission_id, 
        v_user_email, 
        v_user_name,
        (SELECT gerar_respostas_json(p_user_id))
      );
    END IF;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Corrigir dados do usuário específico
SELECT fix_quiz_completion('43b40c96-c661-4e97-b0d1-967c82c73709');

-- Atualizar trigger para completion automática
CREATE OR REPLACE FUNCTION auto_complete_quiz()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  v_total_questions INTEGER;
  v_answered_questions INTEGER;
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Contar total de questões
  SELECT COUNT(*) INTO v_total_questions FROM quiz_questions;
  
  -- Contar respostas desta submissão
  SELECT COUNT(*) INTO v_answered_questions 
  FROM quiz_answers 
  WHERE submission_id = NEW.submission_id;
  
  -- Se completou 90% ou mais, marcar como concluído
  IF v_answered_questions >= (v_total_questions * 0.9) THEN
    -- Buscar dados do usuário
    SELECT user_email, user_name INTO v_user_email, v_user_name
    FROM quiz_submissions 
    WHERE id = NEW.submission_id;
    
    -- Atualizar submissão
    UPDATE quiz_submissions 
    SET completed = true, completed_at = now()
    WHERE id = NEW.submission_id AND completed = false;
    
    -- Inserir respostas completas se não existir
    IF NOT EXISTS (SELECT 1 FROM quiz_respostas_completas WHERE submission_id = NEW.submission_id) THEN
      INSERT INTO quiz_respostas_completas (
        user_id, submission_id, user_email, user_name, respostas
      ) VALUES (
        (SELECT user_id FROM quiz_submissions WHERE id = NEW.submission_id),
        NEW.submission_id,
        v_user_email,
        v_user_name,
        (SELECT gerar_respostas_json((SELECT user_id FROM quiz_submissions WHERE id = NEW.submission_id)))
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_auto_complete_quiz ON quiz_answers;
CREATE TRIGGER trigger_auto_complete_quiz
  AFTER INSERT OR UPDATE ON quiz_answers
  FOR EACH ROW EXECUTE FUNCTION auto_complete_quiz();