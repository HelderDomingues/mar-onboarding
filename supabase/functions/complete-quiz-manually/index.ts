import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Validação básica do UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id || !isValidUUID(user_id)) {
      return new Response(JSON.stringify({ error: 'user_id is required and must be a valid UUID' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser } } = await supabaseAdmin.auth.getUser(jwt);

    if (!callingUser || callingUser.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: User is not an admin' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Lógica principal migrada de `supabaseUtils.ts`
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('quiz_submissions')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (submission) {
      // Se a submissão existe, atualiza
      const { error: updateError } = await supabaseAdmin
        .from('quiz_submissions')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', submission.id);
      if (updateError) throw updateError;

    } else {
      // Se não existe, busca o email do usuário alvo e cria uma nova submissão completa
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
      if (userError) throw new Error(`Could not fetch user data for ID: ${user_id}`);

      const userEmail = userData?.user?.email || '';

      const { error: createError } = await supabaseAdmin
        .from('quiz_submissions')
        .insert([{
          user_id: user_id,
          user_email: userEmail,
          current_module: 8, // Assume que 8 é o último módulo
          completed: true,
          completed_at: new Date().toISOString()
        }]);
      if (createError) throw createError;
    }

    return new Response(JSON.stringify({ message: `Quiz for user ${user_id} marked as complete.` }), {
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