
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Definir cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Função quiz-webhook iniciada.");

serve(async (req) => {
  // Lidar com requisições OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      status: 204,
    });
  }

  try {
    // Verificar se é apenas um teste de conexão
    const body = await req.json();
    if (body.test === true) {
      console.log("Teste de conexão com webhook recebido");
      return new Response(
        JSON.stringify({ status: "success", message: "Teste de conexão bem-sucedido" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  
    // Obter dados da requisição para processamento real
    const { submissionId } = body;
    
    if (!submissionId) {
      console.error("Erro: ID de submissão não fornecido");
      return new Response(
        JSON.stringify({ error: "ID de submissão é obrigatório" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Processando submissão ID: ${submissionId}`);
    
    // Criar cliente Supabase com chave de serviço
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Obter dados da submissão
    const { data: submission, error: submissionError } = await supabase
      .from("quiz_submissions")
      .select("*, user:user_id(email)")
      .eq("id", submissionId)
      .single();
    
    if (submissionError || !submission) {
      console.error("Erro ao buscar submissão:", submissionError);
      return new Response(
        JSON.stringify({ error: "Submissão não encontrada", details: submissionError }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }
    
    // Verifica se a submissão já foi processada pelo webhook
    if (submission.webhook_processed) {
      console.log(`Submissão ${submissionId} já foi processada anteriormente`);
      return new Response(
        JSON.stringify({ message: "Submissão já processada", status: "already_processed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Obter as respostas completas
    const { data: respostas, error: respostasError } = await supabase
      .from("quiz_respostas_completas")
      .select("*")
      .eq("submission_id", submissionId)
      .maybeSingle();
    
    // Obter o perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", submission.user_id)
      .single();
    
    if (profileError) {
      console.warn("Aviso: Perfil não encontrado:", profileError);
    }
    
    // Preparar dados para enviar para o webhook externo
    const webhookPayload = {
      submission_id: submissionId,
      user_id: submission.user_id,
      email: submission.user_email || submission.email || (profile ? profile.email : null),
      nome: submission.user_name || (profile ? profile.full_name : null),
      empresa: profile ? profile.company_name : null,
      completed_at: submission.completed_at,
      respostas: respostas ? respostas.respostas : null
    };
    
    console.log("Enviando dados para webhook externo (Make.com)");
    
    // URL do webhook do Make.com
    const webhookToken = "wpbbjokh8cexvd1hql9i7ae6uyf32bzh";
    const webhookUrl = `https://hook.eu2.make.com/${webhookToken}`;
    
    console.log(`Endpoint do webhook: ${webhookUrl}`);
    
    // Enviar dados para o webhook externo
    const makeResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log(`Status da resposta do Make.com: ${makeResponse.status}`);
    
    if (!makeResponse.ok) {
      const errorText = await makeResponse.text();
      console.error("Erro ao enviar para webhook externo:", errorText);
      return new Response(
        JSON.stringify({ error: "Falha ao enviar para webhook externo", details: errorText }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    // Marcar submissão como processada pelo webhook
    const { error: updateError } = await supabase
      .from("quiz_submissions")
      .update({ webhook_processed: true })
      .eq("id", submissionId);
    
    if (updateError) {
      console.error("Erro ao atualizar status de processamento:", updateError);
    } else {
      console.log(`Submissão ${submissionId} marcada como processada com sucesso`);
    }
    
    // Marcar respostas_completas como processada pelo webhook se existir
    if (respostas) {
      const { error: updateRespostasError } = await supabase
        .from("quiz_respostas_completas")
        .update({ webhook_processed: true })
        .eq("submission_id", submissionId);
      
      if (updateRespostasError) {
        console.error("Erro ao atualizar status de processamento em respostas_completas:", updateRespostasError);
      }
    }
    
    return new Response(
      JSON.stringify({
        message: "Dados enviados com sucesso para o Make.com",
        submission_id: submissionId,
        status: "success"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Erro não tratado:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno", details: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
