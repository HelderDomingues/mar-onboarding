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
    // (Esta parte pode ser opcional se a função for chamada por outras, como o webhook)
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
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
    }

    // 1. Buscar dados da submissão
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('quiz_submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      throw new Error(`Submission with id ${submission_id} not found.`);
    }

    // 2. Buscar dados do perfil do usuário
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', submission.user_id)
      .single();

    // 3. Buscar as respostas, ordenadas por módulo e pergunta
    const { data: answers, error: answersError } = await supabaseAdmin
      .from('quiz_answers')
      .select(`
        answer,
        quiz_questions!inner (
          text,
          type,
          order_number,
          quiz_modules!inner (
            title,
            order_number
          )
        )
      `)
      .eq('submission_id', submission_id)
      .order('order_number', { foreignTable: 'quiz_questions.quiz_modules' })
      .order('order_number', { foreignTable: 'quiz_questions' });

    if (answersError) {
      throw new Error(`Failed to fetch answers for submission ${submission_id}`);
    }

    // Retorna o payload combinado
    const responsePayload = {
      submission,
      profile: profile || {}, // Retorna objeto vazio se não houver perfil
      answers: answers || [], // Retorna array vazio se não houver respostas
    };

    return new Response(JSON.stringify(responsePayload), {
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