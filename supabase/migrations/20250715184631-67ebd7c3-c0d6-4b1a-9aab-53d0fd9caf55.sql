-- Adicionar constraint única para submission_id e question_id na tabela quiz_answers
-- Isso permitirá que façamos upsert corretamente (uma resposta por questão por submissão)

ALTER TABLE public.quiz_answers 
ADD CONSTRAINT quiz_answers_submission_question_unique 
UNIQUE (submission_id, question_id);