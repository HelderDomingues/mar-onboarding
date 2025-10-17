-- Corrigir search_path da função admin_create_user para incluir schema extensions
-- Isso permite acesso às funções crypt() e gen_salt() do pgcrypto

CREATE OR REPLACE FUNCTION public.admin_create_user(
  admin_email text,
  new_user_email text,
  new_user_password text,
  new_user_name text,
  make_admin boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'  -- ✅ CORREÇÃO: incluir 'extensions'
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT is_current_user_admin() THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem criar usuários.',
      'error_code', 'permission_denied'
    );
  END IF;

  -- Criar novo usuário
  new_user_id := gen_random_uuid();
  
  -- Inserir no auth.users (requer privilégios de service_role)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    new_user_email,
    crypt(new_user_password, gen_salt('bf')),  -- Agora funcionará com extensions no search_path
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', new_user_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- O trigger handle_new_user criará automaticamente o registro em profiles
  
  -- Inserir role padrão 'user' na tabela user_roles
  INSERT INTO public.user_roles (user_id, user_email, role)
  VALUES (new_user_id, new_user_email, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Se make_admin = true, adicionar role 'admin'
  IF make_admin THEN
    INSERT INTO public.user_roles (user_id, user_email, role)
    VALUES (new_user_id, new_user_email, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Usuário criado com sucesso!',
    'user_id', new_user_id
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Usuário com este email já existe.',
      'error_code', 'user_already_exists'
    );
  WHEN others THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Erro interno ao criar usuário: ' || SQLERRM,
      'error_code', 'internal_error'
    );
END;
$function$;