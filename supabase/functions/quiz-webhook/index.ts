
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const submissionId = body.submissionId;

    if (!submissionId) {
      return new Response(
        JSON.stringify({ error: 'Missing submissionId parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Cria uma conexão com o Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables for Supabase connection');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados da submissão
    const { data: submission, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select(`
        id,
        user_id,
        completed,
        completed_at,
        contact_consent,
        profiles(email, full_name, company_name, phone)
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      console.error('Error fetching submission data:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch submission data', details: submissionError }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar as respostas do questionário
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select(`
        question_id,
        answer,
        quiz_questions(text, type, module_id)
      `)
      .eq('user_id', submission.user_id);

    if (answersError) {
      console.error('Error fetching answers:', answersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch answers', details: answersError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar os módulos do questionário
    const { data: modules, error: modulesError } = await supabase
      .from('quiz_modules')
      .select('id, title')
      .order('order_number');

    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch modules', details: modulesError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Preparar os dados para envio
    const preparedData = {
      submission: {
        id: submission.id,
        completed: submission.completed,
        completedAt: submission.completed_at,
        contactConsent: submission.contact_consent
      },
      user: {
        id: submission.user_id,
        email: submission.profiles?.email || '',
        name: submission.profiles?.full_name || '',
        companyName: submission.profiles?.company_name || '',
        phone: submission.profiles?.phone || ''
      },
      answers: answers.map(answer => ({
        questionId: answer.question_id,
        moduleId: answer.quiz_questions?.module_id,
        questionText: answer.quiz_questions?.text || '',
        questionType: answer.quiz_questions?.type || '',
        answer: answer.answer
      })),
      modules: modules.reduce((acc, module) => {
        acc[module.id] = module.title;
        return acc;
      }, {})
    };

    // URL do webhook na plataforma Make.com
    const webhookUrl = Deno.env.get('MAKE_WEBHOOK_URL') || '';
    
    if (!webhookUrl) {
      console.error('Missing webhook URL configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing webhook URL' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enviar os dados para o webhook
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preparedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook response error:', response.status, errorText);
        return new Response(
          JSON.stringify({ 
            error: 'Webhook response error', 
            status: response.status, 
            details: errorText 
          }),
          { 
            status: 502, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const responseData = await response.json();
      
      console.log('Data sent successfully to webhook:', {
        submissionId,
        responseStatus: response.status
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Data sent successfully to webhook',
          response: responseData
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (fetchError) {
      console.error('Error sending data to webhook:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to send data to webhook', details: fetchError.message }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error in webhook function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
