-- Correção de Segurança: Proteger emails e dados sensíveis em quiz_submissions
-- Remove políticas antigas e cria novas com proteção adequada para admins

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias submissões" ON public.quiz_submissions;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias submissões" ON public.quiz_submissions;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias submissões" ON public.quiz_submissions;

-- Política SELECT: Usuário vê apenas suas próprias submissões OU admin vê todas
CREATE POLICY "Usuários podem ver suas submissões e admins veem todas"
ON public.quiz_submissions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  public.is_current_user_admin()
);

-- Política INSERT: Usuário pode criar apenas suas próprias submissões
CREATE POLICY "Usuários podem criar suas próprias submissões"
ON public.quiz_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política UPDATE: Usuário atualiza apenas suas próprias submissões OU admin atualiza todas
CREATE POLICY "Usuários podem atualizar suas submissões e admins atualizam todas"
ON public.quiz_submissions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  public.is_current_user_admin()
);

-- Comentário explicativo
COMMENT ON TABLE public.quiz_submissions IS 'Tabela de submissões de quiz com RLS protegendo emails e dados sensíveis. Usuários só veem suas próprias submissões, exceto administradores.';