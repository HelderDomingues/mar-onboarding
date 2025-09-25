import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { submission_id } = await req.json();

    if (!submission_id) {
      return new Response(JSON.stringify({ error: 'submission_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Esta função é chamada internamente por outra Edge Function (o webhook)
    // ou pelo frontend após um envio bem-sucedido.
    // A verificação de permissão pode ser mais flexível ou baseada em quem chama.
    // Por simplicidade aqui, vamos usar a chave de serviço diretamente.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabaseAdmin
      .from('quiz_submissions')
      .update({ webhook_processed: true })
      .eq('id', submission_id);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: 'Submission marked as processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});