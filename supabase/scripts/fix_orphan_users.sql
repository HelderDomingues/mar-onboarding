-- Este script corrige perfis de usuários que não foram criados automaticamente.
-- Ele deve ser executado UMA VEZ no editor SQL do Supabase para sincronizar os dados.

-- Inserir perfis faltantes na tabela public.profiles
-- Ele busca todos os usuários da auth.users que ainda não têm um perfil
-- e cria um para eles, preenchendo os dados básicos.
INSERT INTO public.profiles (id, user_email, full_name, username)
SELECT
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'username'
FROM
    auth.users u
LEFT JOIN
    public.profiles p ON u.id = p.id
WHERE
    p.id IS NULL;

-- Após executar este script, você pode querer verificar o perfil do seu usuário admin
-- e garantir que a coluna 'role' está correta, se ela não for gerenciada por outro mecanismo.
-- Exemplo para verificar seu usuário:
-- SELECT * FROM public.profiles WHERE user_email = 'helder@crievalor.com.br';

-- Se necessário, para atualizar a role manualmente para um usuário específico:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'SEU_USER_ID';