-- Correção de Segurança: Remover política ALL redundante da tabela profiles
-- Esta política é redundante e potencialmente perigosa

-- Remover a política ALL que é redundante
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;

-- Adicionar política INSERT específica para permitir criação de perfil próprio
-- (caso ainda não exista via trigger)
CREATE POLICY "Usuários podem inserir seu próprio perfil"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Verificar políticas restantes (apenas para documentação, não executa nada):
-- ✅ "Admins podem gerenciar todos os perfis" - Command: ALL - CORRETO (apenas admins)
-- ✅ "Usuários podem editar seu próprio perfil" - Command: UPDATE - CORRETO
-- ✅ "Usuários podem ver seu próprio perfil" - Command: SELECT - CORRETO
-- ✅ "Usuários podem inserir seu próprio perfil" - Command: INSERT - NOVO