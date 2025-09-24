-- Adicionar campo webhook_processed à tabela quiz_submissions
ALTER TABLE public.quiz_submissions 
ADD COLUMN IF NOT EXISTS webhook_processed boolean DEFAULT false;

-- Criar índice para otimizar consultas por webhook_processed
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_webhook_processed 
ON public.quiz_submissions(webhook_processed);

-- Comentário na tabela
COMMENT ON COLUMN public.quiz_submissions.webhook_processed IS 'Indica se os dados desta submissão já foram enviados para o webhook';