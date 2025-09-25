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
    const { submission_id } = await req.json();

    if (!submission_id || !isValidUUID(submission_id)) {
      return new Response(JSON.stringify({ error: 'submission_id is required' }), {
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
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt);

    if (!user || user.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Lógica migrada de `getQuizCompletedAnswers` em `supabaseUtils.ts`
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('quiz_submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (submissionError) throw submissionError;

    const { data: answers, error: answersError } = await supabaseAdmin
      .from('quiz_answers')
      .select('*')
      .eq('submission_id', submission_id);

    if (answersError) throw answersError;

    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*, quiz_modules!inner(id, title, order_number)');

    if (questionsError) throw questionsError;

    const questionsMap = new Map(questions.map(q => [q.id, {
      ...q,
      module_title: q.quiz_modules.title,
      module_number: q.quiz_modules.order_number
    }]));

    const processedAnswers = answers.map(answer => {
      const question = questionsMap.get(answer.question_id);
      if (!question) return null;
      // ... (lógica de formatação da resposta pode ser adicionada aqui se necessário)
      return {
        question_id: answer.question_id,
        question_text: question.text,
        answer: answer.answer || '',
        question_type: question.type,
        module_id: question.module_id,
        module_title: question.module_title,
        module_number: question.module_number
      };
    }).filter(Boolean);

    processedAnswers.sort((a, b) => {
      if (a.module_number !== b.module_number) {
        return a.module_number - b.module_number;
      }
      return a.question_id.localeCompare(b.question_id);
    });

    const responsePayload = { ...submission, answers: processedAnswers };

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