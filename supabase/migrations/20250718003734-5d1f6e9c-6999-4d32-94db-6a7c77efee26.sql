-- Adicionar permissões de edição para administradores nas tabelas do quiz
-- Isso permitirá que admins editem módulos, questões e opções

-- Política para admins editarem módulos
CREATE POLICY "Administradores podem editar módulos"
ON public.quiz_modules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Política para admins editarem questões
CREATE POLICY "Administradores podem editar questões"
ON public.quiz_questions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Política para admins editarem opções
CREATE POLICY "Administradores podem editar opções"
ON public.quiz_options
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);