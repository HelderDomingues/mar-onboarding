
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Definir cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Função quiz-webhook v2.0 iniciada - Otimizada para Make.com");

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
        JSON.stringify({ 
          error: "ID de submissão é obrigatório",
          errorCode: "MISSING_SUBMISSION_ID",
          timestamp: new Date().toISOString()
        }),
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
        JSON.stringify({ 
          error: "Configuração do servidor incompleta",
          errorCode: "MISSING_ENV_VARS",
          timestamp: new Date().toISOString()
        }),
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
        JSON.stringify({ 
          error: "Submissão não encontrada", 
          details: submissionError,
          errorCode: "SUBMISSION_NOT_FOUND",
          timestamp: new Date().toISOString()
        }),
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
        JSON.stringify({ 
          message: "Submissão já processada", 
          status: "already_processed",
          submissionId,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Obter as respostas completas - otimizado para Make.com
    const { data: respostas, error: respostasError } = await supabase
      .from("quiz_respostas_completas")
      .select("*")
      .eq("submission_id", submissionId)
      .maybeSingle();
    
    if (respostasError) {
      console.error("Erro ao buscar respostas completas:", respostasError);
      return new Response(
        JSON.stringify({ 
          error: "Erro ao buscar respostas", 
          details: respostasError,
          errorCode: "ANSWERS_FETCH_ERROR",
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    if (!respostas) {
      console.error(`Nenhuma resposta encontrada para submissão ${submissionId}`);
      return new Response(
        JSON.stringify({ 
          error: "Respostas não encontradas para esta submissão", 
          errorCode: "ANSWERS_NOT_FOUND",
          submissionId,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }
    
    // Obter o perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", submission.user_id)
      .single();
    
    if (profileError) {
      console.warn("Aviso: Perfil não encontrado:", profileError);
    }
    
    // Preparar dados para enviar para o Make.com
    // Formato otimizado conforme visto nas imagens
    const webhookPayload = {
      // Metadados da submissão (essenciais para tracking)
      "ID_Submissao": submissionId,
      "ID_Usuario": submission.user_id,
      "Data_Submissao": new Date(submission.completed_at || new Date()).toISOString(),
      "Timestamp": new Date().toISOString(),
      "Origem": "Sistema MAR - Crie Valor Consultoria",
      
      // Dados do usuário
      "Email": submission.user_email || (profile?.user_email) || '',
      "Nome": submission.user_name || (profile?.full_name) || '',
      "Telefone": profile?.phone || '',
      
      // As respostas do questionário vêm diretamente do objeto JSON
      // Sem aninhamento, cada pergunta é uma chave direta no objeto
      ...respostas.respostas
    };
    
    console.log("Enviando dados para webhook do Make.com no formato otimizado");
    
    // URL do webhook do Make.com
    const webhookToken = "wpbbjokh8cexvd1hql9i7ae6uyf32bzh";
    const webhookUrl = `https://hook.eu2.make.com/${webhookToken}`;
    
    console.log(`Endpoint do webhook: ${webhookUrl}`);
    console.log(`Payload contém ${Object.keys(webhookPayload).length} campos`);
    
    // Enviar dados para o webhook do Make.com
    const makeResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log(`Status da resposta do Make.com: ${makeResponse.status}`);
    
    try {
      const responseText = await makeResponse.text();
      console.log(`Resposta do Make.com: ${responseText}`);
    } catch (e) {
      console.warn("Não foi possível ler corpo da resposta:", e);
    }
    
    if (!makeResponse.ok) {
      console.error(`Erro ao enviar para Make.com: ${makeResponse.status} ${makeResponse.statusText}`);
      
      return new Response(
        JSON.stringify({ 
          error: "Falha ao enviar para webhook externo", 
          statusCode: makeResponse.status,
          statusText: makeResponse.statusText,
          errorCode: "WEBHOOK_DELIVERY_FAILED",
          timestamp: new Date().toISOString()
        }),
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
      console.error("Erro ao atualizar status de processamento da submissão:", updateError);
    } else {
      console.log(`Submissão ${submissionId} marcada como processada com sucesso`);
    }
    
    // Marcar respostas_completas como processada pelo webhook
    const { error: updateRespostasError } = await supabase
      .from("quiz_respostas_completas")
      .update({ webhook_processed: true })
      .eq("submission_id", submissionId);
    
    if (updateRespostasError) {
      console.error("Erro ao atualizar status de processamento em respostas_completas:", updateRespostasError);
    } else {
      console.log(`Respostas para submissão ${submissionId} marcadas como processadas`);
    }
    
    return new Response(
      JSON.stringify({
        message: "Dados enviados com sucesso para o Make.com",
        submission_id: submissionId,
        timestamp: new Date().toISOString(),
        status: "success",
        webhook_url: webhookUrl.replace(webhookToken, "***token-oculto***")
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Erro não tratado:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno no servidor", 
        details: error.message,
        errorCode: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
