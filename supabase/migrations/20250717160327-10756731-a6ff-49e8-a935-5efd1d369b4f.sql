-- Correção manual simples para o usuário específico
UPDATE quiz_submissions 
SET completed = true, completed_at = now()
WHERE user_id = '43b40c96-c661-4e97-b0d1-967c82c73709' AND completed = false;

-- Inserir em respostas completas usando dados disponíveis
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
  'N/A',
  (SELECT gerar_respostas_json(qs.user_id))
FROM quiz_submissions qs
WHERE qs.user_id = '43b40c96-c661-4e97-b0d1-967c82c73709'
AND NOT EXISTS (
  SELECT 1 FROM quiz_respostas_completas qrc 
  WHERE qrc.submission_id = qs.id
);