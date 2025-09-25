import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Validação básica do UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

Deno.serve(async (req) => {
  // Trata a requisição OPTIONS para o CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { submission_id } = await req.json();

    if (!submission_id || !isValidUUID(submission_id)) {
      return new Response(JSON.stringify({ error: 'submission_id is required and must be a valid UUID' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Cria um cliente Supabase com a role de serviço
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verifica a permissão do usuário que está chamando a função
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt);

    if (!user || user.user_metadata?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: User is not an admin' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Inicia uma transação para garantir a atomicidade
    // 1. Deleta as respostas associadas
    const { error: deleteAnswersError } = await supabaseAdmin
      .from('quiz_answers')
      .delete()
      .eq('submission_id', submission_id);

    if (deleteAnswersError) {
      console.error('Error deleting quiz answers:', deleteAnswersError);
      throw new Error(`Failed to delete answers for submission ${submission_id}`);
    }

    // 2. Deleta a submissão principal
    const { error: deleteSubmissionError } = await supabaseAdmin
      .from('quiz_submissions')
      .delete()
      .eq('id', submission_id);

    if (deleteSubmissionError) {
      console.error('Error deleting quiz submission:', deleteSubmissionError);
      throw new Error(`Failed to delete submission ${submission_id}`);
    }

    return new Response(JSON.stringify({ message: `Submission ${submission_id} and associated answers deleted successfully.` }), {
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