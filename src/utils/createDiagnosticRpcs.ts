
/**
 * Estas funções devem ser executadas no SQL Editor do Supabase
 * para criar as funções RPC necessárias para diagnóstico
 * 
 * Podem ser copiadas e coladas diretamente no SQL Editor
 */

export const GET_TABLES_INFO_RPC = `
create or replace function public.get_tables_info()
returns table (table_name text, row_count bigint)
language plpgsql security definer
as $$
begin
  return query
  select 
    table_name::text,
    (select count(*) from information_schema.columns where table_schema = 'public' and table_name = t.table_name)::bigint as row_count
  from 
    information_schema.tables t
  where 
    table_schema = 'public'
    and table_type = 'BASE TABLE';
end;
$$;

-- Conceder permissão para todos os perfis autenticados usarem esta função
grant execute on function public.get_tables_info to authenticated;
`;

export const GET_POLICIES_RPC = `
create or replace function public.get_policies()
returns table (tablename text, policyname text, permissive text, roles text[], cmd text, qual text, with_check text)
language plpgsql security definer
as $$
begin
  return query
  select
    p.tablename::text,
    p.policyname::text,
    p.permissive::text,
    p.roles,
    p.cmd::text,
    p.qual::text,
    p.with_check::text
  from
    pg_policies p
  where
    p.schemaname = 'public';
end;
$$;

-- Conceder permissão apenas para admin usarem esta função
grant execute on function public.get_policies to authenticated;
`;

// Adicionar políticas RLS básicas para tabelas de questionário
export const CREATE_BASIC_RLS_POLICIES = `
-- Habilitar RLS nas tabelas principais do questionário
ALTER TABLE IF EXISTS public.quiz_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Políticas para quiz_modules (leitura para todos autenticados)
CREATE POLICY IF NOT EXISTS "Leitura de módulos para todos autenticados"
ON public.quiz_modules
FOR SELECT
TO authenticated
USING (true);

-- Políticas para quiz_questions (leitura para todos autenticados)
CREATE POLICY IF NOT EXISTS "Leitura de perguntas para todos autenticados"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (true);

-- Políticas para quiz_options (leitura para todos autenticados)
CREATE POLICY IF NOT EXISTS "Leitura de opções para todos autenticados"
ON public.quiz_options
FOR SELECT
TO authenticated
USING (true);

-- Políticas para quiz_submissions (leitura/escrita apenas para proprietários e admins)
CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias submissões"
ON public.quiz_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
));

CREATE POLICY IF NOT EXISTS "Usuários podem criar suas próprias submissões"
ON public.quiz_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem atualizar suas próprias submissões"
ON public.quiz_submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para quiz_answers
CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias respostas"
ON public.quiz_answers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_submissions 
    WHERE public.quiz_answers.submission_id = public.quiz_submissions.id
    AND public.quiz_submissions.user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY IF NOT EXISTS "Usuários podem criar suas próprias respostas"
ON public.quiz_answers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_submissions 
    WHERE public.quiz_answers.submission_id = public.quiz_submissions.id
    AND public.quiz_submissions.user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Usuários podem atualizar suas próprias respostas"
ON public.quiz_answers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_submissions 
    WHERE public.quiz_answers.submission_id = public.quiz_submissions.id
    AND public.quiz_submissions.user_id = auth.uid()
  )
);
`;
