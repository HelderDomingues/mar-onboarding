-- Corrigir função gerar_respostas_json para usar colunas corretas
CREATE OR REPLACE FUNCTION public.gerar_respostas_json(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  resultado JSONB;
BEGIN
  -- Criar um objeto JSON com todas as respostas do usuário
  SELECT jsonb_object_agg(
    q.text, 
    a.answer
  ) INTO resultado
  FROM public.quiz_answers a
  JOIN public.quiz_questions q ON a.question_id = q.id
  WHERE a.user_id = p_user_id;
  
  RETURN resultado;
END;
$$;

-- Simplificar correção manual do usuário específico
UPDATE quiz_submissions 
SET completed = true, completed_at = now()
WHERE user_id = '43b40c96-c661-4e97-b0d1-967c82c73709' AND completed = false;

-- Inserir manualmente em quiz_respostas_completas
INSERT INTO quiz_respostas_completas (
  user_id, 
  submission_id, 
  user_email, 
  user_name, 
  respostas
) 
SELECT 
  qs.user_id,
  qs.id,
  qs.user_email,
  COALESCE(qs.user_name, 'N/A'),
  (SELECT gerar_respostas_json(qs.user_id))
FROM quiz_submissions qs
WHERE qs.user_id = '43b40c96-c661-4e97-b0d1-967c82c73709'
AND NOT EXISTS (
  SELECT 1 FROM quiz_respostas_completas qrc 
  WHERE qrc.submission_id = qs.id
);