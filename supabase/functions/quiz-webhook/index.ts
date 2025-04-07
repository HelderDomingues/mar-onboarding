
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
    console.log("Função quiz-webhook iniciada");
    
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
      console.log("ID da submissão recebido:", submissionId);
    } catch (e) {
      console.log("Nenhum ID de submissão fornecido ou erro ao ler o corpo", e);
    }
    
    if (!submissionId) {
      console.log("Nenhum ID de submissão fornecido, buscando a mais recente");
    }
    
    // Vamos tentar primeiro buscar na nova tabela simplificada
    let simplifiedData = null;
    
    if (submissionId) {
      const { data: simplifiedResult, error: simplifiedError } = await supabase
        .from('quiz_respostas_completas')
        .select('*')
        .eq('submission_id', submissionId)
        .maybeSingle();
      
      if (!simplifiedError && simplifiedResult) {
        console.log("Encontrados dados simplificados para a submissão:", submissionId);
        simplifiedData = simplifiedResult;
      } else {
        console.log("Nenhum dado simplificado encontrado para a submissão:", submissionId);
      }
    }
    
    // Se temos dados simplificados, enviamos diretamente para o webhook
    if (simplifiedData) {
      console.log("Enviando dados simplificados para webhook do Make.com");
      
      // Marcar como processado
      await supabase
        .from('quiz_respostas_completas')
        .update({ webhook_processed: true })
        .eq('id', simplifiedData.id);
      
      // Enviando diretamente para o Make.com usando fetch
      try {
        const webhookUrl = "https://hook.eu2.make.com/wpbbjokh8cexvd1hql9i7ae6uyf32bzh";
        const makeResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(simplifiedData)
        });
        
        if (!makeResponse.ok) {
          console.error(`Make.com respondeu com status: ${makeResponse.status}`);
          const responseText = await makeResponse.text();
          console.error(`Resposta do Make.com: ${responseText}`);
          throw new Error(`Make.com respondeu com status: ${makeResponse.status}`);
        }
        
        console.log("Dados enviados com sucesso para o Make.com via edge function");
      } catch (makeError) {
        console.error("Erro ao enviar para o Make.com:", makeError);
        throw makeError;
      }
      
      return new Response(
        JSON.stringify({ 
          message: "Dados simplificados enviados para o webhook",
          data_type: "simplified",
          submission_id: submissionId
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
          status: 200 
        }
      );
    }
    
    // Se não temos dados simplificados, continuamos com o fluxo normal
    console.log("Continuando com a busca de respostas detalhadas...");
    
    // Consultar dados de submissão
    let query = supabase.from('quiz_responses_flat')
      .select('*');
    
    if (submissionId) {
      query = query.eq('submission_id', submissionId);
    } else {
      // Sem ID específico, pegar a submissão mais recente (limitado a 100 para segurança)
      query = query.order('completed_at', { ascending: false }).limit(100);
    }
    
    const { data: quizResponses, error } = await query;
    
    if (error) {
      console.error("Erro ao buscar respostas:", error);
      throw new Error(`Erro ao buscar respostas: ${error.message}`);
    }
    
    if (!quizResponses || quizResponses.length === 0) {
      console.log("Nenhuma resposta encontrada");
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
    
    console.log(`Encontradas ${quizResponses.length} respostas para a submissão`);
    
    // Agrupar respostas por submissão
    const submissionGroups = quizResponses.reduce((acc, curr) => {
      const submissionId = curr.submission_id;
      if (!acc[submissionId]) {
        acc[submissionId] = [];
      }
      acc[submissionId].push(curr);
      return acc;
    }, {});
    
    // Processar cada grupo de submissão
    const results = [];
    
    for (const [submissionId, responses] of Object.entries(submissionGroups)) {
      if (!Array.isArray(responses) || responses.length === 0) continue;
      
      const firstResponse = responses[0];
      
      // Verificar se a submissão já foi processada anteriormente
      // Isso evita envios duplicados para o Make.com
      const { data: processedCheck, error: processedError } = await supabase
        .from('quiz_submissions')
        .select('webhook_processed')
        .eq('id', submissionId)
        .maybeSingle();
        
      if (processedError) {
        console.error(`Erro ao verificar status de processamento para submissão ${submissionId}:`, processedError);
      }
      
      // Se já foi processado pelo webhook, pular para evitar duplicação
      if (processedCheck?.webhook_processed === true) {
        console.log(`Submissão ${submissionId} já foi processada pelo webhook anteriormente, pulando.`);
        results.push({
          submission_id: submissionId,
          status: "skipped",
          reason: "already_processed"
        });
        continue;
      }
      
      // Primeiro, vamos verificar se temos uma versão simplificada das respostas
      const { data: simplifiedData, error: simplifiedError } = await supabase
        .from('quiz_respostas_completas')
        .select('*')
        .eq('submission_id', submissionId)
        .maybeSingle();
        
      if (!simplifiedError && simplifiedData) {
        console.log(`Encontrada versão simplificada para submissão ${submissionId}, enviando...`);
        
        // Enviar dados simplificados para o webhook do Make.com
        try {
          const webhookUrl = "https://hook.eu2.make.com/wpbbjokh8cexvd1hql9i7ae6uyf32bzh";
          const makeResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(simplifiedData)
          });
          
          if (!makeResponse.ok) {
            console.error(`Make.com respondeu com status: ${makeResponse.status}`);
            const responseText = await makeResponse.text();
            console.error(`Resposta do Make.com: ${responseText}`);
            throw new Error(`Make.com respondeu com status: ${makeResponse.status}`);
          }
          
          console.log(`Dados simplificados enviados com sucesso para o Make.com para submissão ${submissionId}`);
          
          // Marcar ambas as tabelas como processadas
          await supabase
            .from('quiz_respostas_completas')
            .update({ webhook_processed: true })
            .eq('id', simplifiedData.id);
            
          await supabase
            .from('quiz_submissions')
            .update({ webhook_processed: true })
            .eq('id', submissionId);
          
          results.push({
            submission_id: submissionId,
            status: "success",
            data_type: "simplified"
          });
          
          continue; // Vamos para a próxima submissão
        } catch (makeError) {
          console.error("Erro ao enviar dados simplificados para o Make.com:", makeError);
          // Continuamos para tentar o formato detalhado abaixo
        }
      }
      
      // Se chegamos aqui, não temos dados simplificados ou falhou o envio
      // Preparar dados detalhados para envio ao Make.com
      const makeData = {
        submission_id: submissionId,
        user_id: firstResponse.user_id,
        email: firstResponse.email,
        full_name: firstResponse.full_name,
        company_name: firstResponse.company_name,
        completed: firstResponse.completed,
        completed_at: firstResponse.completed_at,
        contact_consent: firstResponse.contact_consent,
        started_at: firstResponse.started_at,
        responses: responses.map(r => ({
          question_id: r.question_id,
          question_text: r.question_text,
          answer: r.answer
        }))
      };
      
      console.log(`Enviando dados detalhados para o Make.com para submissão ${submissionId}`);
      
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
          console.error(`Make.com respondeu com status: ${makeResponse.status}`);
          const responseText = await makeResponse.text();
          console.error(`Resposta do Make.com: ${responseText}`);
          throw new Error(`Make.com respondeu com status: ${makeResponse.status}`);
        }
        
        console.log(`Dados detalhados enviados com sucesso para o Make.com para submissão ${submissionId}`);
        
        // Marcar a submissão como processada pelo webhook para evitar duplicações
        const { error: updateError } = await supabase
          .from('quiz_submissions')
          .update({ webhook_processed: true })
          .eq('id', submissionId);
          
        if (updateError) {
          console.error(`Erro ao marcar submissão ${submissionId} como processada:`, updateError);
        } else {
          console.log(`Submissão ${submissionId} marcada como processada com sucesso`);
        }
        
        results.push({
          submission_id: submissionId,
          status: "success",
          data_type: "detailed"
        });
      } catch (makeError) {
        console.error("Erro ao enviar dados para o Make.com:", makeError);
        
        results.push({
          submission_id: submissionId,
          status: "error",
          error: makeError.message
        });
        
        throw new Error(`Falha ao enviar para o Make.com: ${makeError.message}`);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: "Processamento concluído",
        results: results,
        submissions_processed: Object.keys(submissionGroups).length
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200 
      }
    );
    
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
