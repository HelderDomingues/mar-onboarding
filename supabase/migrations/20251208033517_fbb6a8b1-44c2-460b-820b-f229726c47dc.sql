-- Adicionar coluna is_other à tabela quiz_options
ALTER TABLE public.quiz_options 
ADD COLUMN IF NOT EXISTS is_other boolean NOT NULL DEFAULT false;

-- Comentário explicativo
COMMENT ON COLUMN public.quiz_options.is_other IS 'Indica se esta opção é do tipo "Outros" que habilita campo de texto personalizado';

-- Atualizar opções existentes que já contêm "outro" no texto para marcar como is_other
UPDATE public.quiz_options 
SET is_other = true 
WHERE LOWER(text) LIKE '%outro%' OR LOWER(text) LIKE '%other%';