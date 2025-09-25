import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Trata a requisição OPTIONS para o CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Cria um cliente Supabase com a role de serviço para ter acesso administrativo
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Pega o token de autorização do header da requisição
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }
    const jwt = authHeader.replace('Bearer ', '');

    // Obtém os dados do usuário a partir do JWT
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    if (userError) {
      console.error('User fetch error:', userError);
      throw new Error('Failed to fetch user from JWT');
    }
    if (!user) {
      throw new Error('User not found or JWT is invalid');
    }

    // Verifica se o usuário tem a role de 'admin'
    // A role está armazenada no `user_metadata`
    if (user.user_metadata?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: User is not an admin' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Se o usuário é admin, busca a lista de todos os usuários
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('List users error:', listError);
      throw listError;
    }

    // Retorna a lista de usuários
    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});