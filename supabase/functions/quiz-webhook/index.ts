
// Função Edge para processar dados do questionário e enviar para o Make.com
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Lidar com requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variáveis de ambiente do Supabase não configuradas");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Obter id da submissão do corpo da requisição ou usar o mais recente
    let submissionId;
    
    try {
      const body = await req.json();
      submissionId = body.submission_id;
    } catch (e) {
      // Se não houver corpo com ID, buscaremos a submissão mais recente
      console.log("Nenhum ID de submissão fornecido, buscando a mais recente");
    }
    
    // Consultar dados de submissão
    let query = supabase.from('quiz_responses_flat')
      .select('*');
    
    if (submissionId) {
      query = query.eq('submission_id', submissionId);
    } else {
      // Sem ID específico, pegar a submissão mais recente
      query = query.order('completed_at', { ascending: false }).limit(100);
    }
    
    const { data: quizResponses, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao buscar respostas: ${error.message}`);
    }
    
    if (!quizResponses || quizResponses.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Nenhuma resposta encontrada" 
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
          status: 404 
        }
      );
    }
    
    // Preparar dados para envio ao Make.com
    const makeData = {
      submission_id: quizResponses[0].submission_id,
      user_id: quizResponses[0].user_id,
      email: quizResponses[0].email,
      full_name: quizResponses[0].full_name,
      company_name: quizResponses[0].company_name,
      completed: quizResponses[0].completed,
      completed_at: quizResponses[0].completed_at,
      contact_consent: quizResponses[0].contact_consent,
      started_at: quizResponses[0].started_at,
      responses: quizResponses.map(r => ({
        question_id: r.question_id,
        question_text: r.question_text,
        answer: r.answer
      }))
    };
    
    // Enviar dados para o webhook do Make.com
    try {
      const webhookUrl = "https://hook.eu2.make.com/wpbbjokh8cexvd1hql9i7ae6uyf32bzh";
      const makeResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(makeData)
      });
      
      if (!makeResponse.ok) {
        throw new Error(`Make.com respondeu com status: ${makeResponse.status}`);
      }
      
      return new Response(
        JSON.stringify({ 
          message: "Dados enviados com sucesso para o Make.com",
          submission_id: quizResponses[0].submission_id
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
          status: 200 
        }
      );
      
    } catch (makeError) {
      console.error("Erro ao enviar dados para o Make.com:", makeError);
      throw new Error(`Falha ao enviar para o Make.com: ${makeError.message}`);
    }
    
  } catch (error) {
    console.error("Erro na função Edge:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500 
      }
    );
  }
});
