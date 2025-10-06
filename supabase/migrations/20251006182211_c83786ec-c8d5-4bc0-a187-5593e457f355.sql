-- Função RPC para validar completude do quiz
CREATE OR REPLACE FUNCTION public.validate_quiz_completeness(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_submission_id uuid;
  v_total_required integer;
  v_total_answered integer;
  v_missing_questions jsonb;
  v_completion_percentage numeric;
BEGIN
  -- Buscar a submissão mais recente do usuário
  SELECT id INTO v_submission_id
  FROM quiz_submissions
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_submission_id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'total_required', 0,
      'total_answered', 0,
      'completion_percentage', 0,
      'missing_questions', '[]'::jsonb,
      'error', 'Nenhuma submissão encontrada para este usuário'
    );
  END IF;
  
  -- Contar total de perguntas obrigatórias
  SELECT COUNT(*) INTO v_total_required
  FROM quiz_questions
  WHERE required = true;
  
  -- Contar quantas perguntas obrigatórias foram respondidas
  SELECT COUNT(DISTINCT qa.question_id) INTO v_total_answered
  FROM quiz_answers qa
  JOIN quiz_questions qq ON qa.question_id = qq.id
  WHERE qa.submission_id = v_submission_id
    AND qq.required = true
    AND qa.answer IS NOT NULL
    AND qa.answer != '';
  
  -- Calcular porcentagem
  IF v_total_required > 0 THEN
    v_completion_percentage := ROUND((v_total_answered::numeric / v_total_required::numeric) * 100, 2);
  ELSE
    v_completion_percentage := 100;
  END IF;
  
  -- Buscar perguntas obrigatórias não respondidas
  SELECT jsonb_agg(
    jsonb_build_object(
      'question_id', qq.id,
      'question_text', qq.text,
      'module_id', qq.module_id,
      'order_number', qq.order_number
    )
  ) INTO v_missing_questions
  FROM quiz_questions qq
  LEFT JOIN quiz_answers qa ON qq.id = qa.question_id AND qa.submission_id = v_submission_id
  WHERE qq.required = true
    AND (qa.id IS NULL OR qa.answer IS NULL OR qa.answer = '');
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'valid', v_total_answered >= v_total_required,
    'total_required', v_total_required,
    'total_answered', v_total_answered,
    'completion_percentage', v_completion_percentage,
    'missing_questions', COALESCE(v_missing_questions, '[]'::jsonb)
  );
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.validate_quiz_completeness(uuid) IS 'Valida se todas as perguntas obrigatórias do quiz foram respondidas e retorna detalhes de completude';