-- Adicionar coluna user_email na tabela quiz_answers
ALTER TABLE public.quiz_answers 
ADD COLUMN user_email TEXT;

-- Preencher user_email para registros existentes usando JOIN com quiz_submissions
UPDATE public.quiz_answers qa
SET user_email = qs.user_email
FROM public.quiz_submissions qs
WHERE qa.submission_id = qs.id
AND qa.user_email IS NULL;

-- Criar índice para melhor performance em queries agrupadas por email
CREATE INDEX idx_quiz_answers_user_email ON public.quiz_answers(user_email);

-- Comentário na coluna para documentação
COMMENT ON COLUMN public.quiz_answers.user_email IS 'Email do usuário que respondeu a questão, copiado de quiz_submissions para facilitar agrupamento e consultas';