
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Definir cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Função quiz-webhook v4.0 iniciada - Payload ordenado por número de pergunta");

// Obter token do webhook das variáveis de ambiente
const WEBHOOK_TOKEN = Deno.env.get("WEBHOOK_TOKEN") || "amuls2ba837paniiscdb4hlero9pjpdi";

// Configurações globais para maior segurança
const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 30; // Máximo de 30 requisições por minuto

// Rastreamento simples de taxa de requisições (em produção, use Redis ou similar)
const requestTracker = {
  requests: new Map<string, number[]>(),
  
  // Verifica se o IP está excedendo o limite de requisições
  isRateLimited(ipAddress: string): boolean {
    const now = Date.now();
    
    if (!this.requests.has(ipAddress)) {
      this.requests.set(ipAddress, [now]);
      return false;
    }
    
    // Filtrar timestamps dentro da janela atual
    const timestamps = this.requests.get(ipAddress)!.filter(
      timestamp => timestamp > now - RATE_LIMIT_WINDOW
    );
    
    // Atualizar lista de timestamps
    timestamps.push(now);
    this.requests.set(ipAddress, timestamps);
    
    // Verificar se excede o limite
    return timestamps.length > MAX_REQUESTS_PER_WINDOW;
  }
};

serve(async (req) => {
  // Extrair IP do cliente para limites de taxa
  const clientIP = req.headers.get("x-forwarded-for") || "unknown";
  
  // Verificar limite de taxa
  if (requestTracker.isRateLimited(clientIP)) {
    console.warn(`Rate limit excedido para IP: ${clientIP}`);
    return new Response(
      JSON.stringify({
        error: "Muitas requisições, tente novamente mais tarde",
        errorCode: "RATE_LIMIT_EXCEEDED",
        timestamp: new Date().toISOString()
      }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

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

  // Verificar tamanho do payload
  const contentLength = parseInt(req.headers.get("content-length") || "0");
  if (contentLength > MAX_PAYLOAD_SIZE) {
    console.error(`Payload excede tamanho máximo: ${contentLength} bytes`);
    return new Response(
      JSON.stringify({
        error: "Payload muito grande",
        errorCode: "PAYLOAD_TOO_LARGE",
        timestamp: new Date().toISOString()
      }),
      {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    console.log(`Nova requisição recebida - Método: ${req.method}, IP: ${clientIP}`);
    
    // Verificar se é apenas um teste de conexão
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Erro ao analisar JSON do corpo da requisição:", e);
      return new Response(
        JSON.stringify({
          error: "JSON inválido no corpo da requisição",
          errorCode: "INVALID_JSON",
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    if (body.test === true) {
      console.log("Teste de conexão com webhook recebido");
      return new Response(
        JSON.stringify({ 
          status: "success", 
          message: "Teste de conexão bem-sucedido",
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  
    // Obter dados da requisição para processamento real
    const { submissionId, userId } = body;
    
    // Validar campos obrigatórios
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
    
    // Obter dados da submissão (consulta simples) - não assumimos relacionamento PostgREST
    const { data: submission, error: submissionError } = await supabase
      .from("quiz_submissions")
      .select("*")
      .eq("id", submissionId)
      .maybeSingle();
    
    if (submissionError) {
      console.error("Erro ao buscar submissão:", submissionError);
      return new Response(
        JSON.stringify({ 
          error: "Erro ao buscar submissão", 
          details: submissionError,
          errorCode: "SUBMISSION_FETCH_ERROR",
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    if (!submission) {
      console.error(`Submissão ${submissionId} não encontrada`);
      return new Response(
        JSON.stringify({ 
          error: "Submissão não encontrada", 
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
    
    // CAMADA 5: Validar completude antes de enviar webhook
    console.log("🔍 [Webhook] Validando completude antes de enviar...");
    
    const { data: validation, error: validationError } = await supabase
      .rpc('validate_quiz_completeness', { p_user_id: submission.user_id });
    
    if (validationError) {
      console.error("❌ [Webhook] Erro ao validar completude:", validationError);
    } else if (!validation.valid) {
      console.warn(`⚠️ [Webhook] Quiz incompleto detectado: ${validation.total_answered}/${validation.total_required} (${validation.completion_percentage}%)`);
      
      return new Response(
        JSON.stringify({ 
          error: "Quiz incompleto - não é possível enviar webhook", 
          errorCode: "INCOMPLETE_QUIZ",
          submissionId,
          validation: {
            total_required: validation.total_required,
            total_answered: validation.total_answered,
            completion_percentage: validation.completion_percentage,
            missing_questions: validation.missing_questions
          },
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 422, // Unprocessable Entity
        }
      );
    }
    
    console.log(`✅ [Webhook] Validação passou: ${validation.total_answered}/${validation.total_required} (${validation.completion_percentage}%)`);
    
    // Buscar TODAS as perguntas com módulos para ordenação correta
    const { data: allQuestions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select(`
        id,
        text,
        order_number,
        module_id,
        quiz_modules!inner(order_number)
      `)
      .order("order_number", { ascending: true });
    
    if (questionsError) {
      console.error("Erro ao buscar perguntas:", questionsError);
    }
    
    // Criar mapeamento de question_id para número global ordenado
    const questionMap = new Map<string, { globalNumber: number; text: string }>();
    
    if (allQuestions) {
      // Ordenar perguntas por módulo e depois por order_number dentro do módulo
      const sortedQuestions = allQuestions.sort((a, b) => {
        const moduleA = (a as any).quiz_modules?.order_number || 0;
        const moduleB = (b as any).quiz_modules?.order_number || 0;
        if (moduleA !== moduleB) return moduleA - moduleB;
        return a.order_number - b.order_number;
      });
      
      // Atribuir número global sequencial
      sortedQuestions.forEach((q, index) => {
        questionMap.set(q.id, {
          globalNumber: index + 1,
          text: q.text
        });
      });
      
      console.log(`📋 Mapeadas ${questionMap.size} perguntas com numeração global`);
    }
    
    // Buscar respostas individuais da tabela quiz_answers
    const { data: answers, error: answersError } = await supabase
      .from("quiz_answers")
      .select("question_id, answer")
      .eq("submission_id", submissionId);
    
    if (answersError) {
      console.error("Erro ao buscar respostas:", answersError);
    }
    
    // Obter as respostas completas da tabela dedicada (como fallback)
    const { data: respostas, error: respostasError } = await supabase
      .from("quiz_respostas_completas")
      .select("*")
      .eq("submission_id", submissionId)
      .maybeSingle();
    
    if (respostasError) {
      console.error("Erro ao buscar respostas completas:", respostasError);
    }
    
    // Obter o perfil do usuário para informações complementares
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", submission?.user_id)
      .maybeSingle();
    
    if (profileError) {
      console.warn("Aviso: Perfil não encontrado:", profileError);
    }
    
    // Mesclar campos do perfil e submissão
    const userEmail = respostas?.user_email || submission.user_email || profile?.user_email || "";
    const userName = respostas?.full_name || submission.full_name || profile?.full_name || "";
    
    // ============ CONSTRUIR PAYLOAD ORDENADO ============
    // Formato: "NN - Título da Pergunta": "Resposta"
    
    const orderedAnswers: Record<string, string> = {};
    
    if (answers && answers.length > 0 && questionMap.size > 0) {
      // Usar quiz_answers com mapeamento de perguntas
      console.log(`📝 Processando ${answers.length} respostas com mapeamento ordenado`);
      
      // Criar array para ordenação
      const answersWithOrder: Array<{ key: string; order: number; value: string }> = [];
      
      answers.forEach(answer => {
        const questionInfo = questionMap.get(answer.question_id);
        if (questionInfo) {
          const paddedNumber = String(questionInfo.globalNumber).padStart(2, '0');
          const key = `${paddedNumber} - ${questionInfo.text}`;
          answersWithOrder.push({
            key,
            order: questionInfo.globalNumber,
            value: answer.answer || ""
          });
        }
      });
      
      // Ordenar pelo número da pergunta
      answersWithOrder.sort((a, b) => a.order - b.order);
      
      // Adicionar ao objeto ordenado
      answersWithOrder.forEach(item => {
        orderedAnswers[item.key] = item.value;
      });
      
    } else if (respostas?.respostas && typeof respostas.respostas === 'object') {
      // Fallback: usar respostas_completas e tentar ordenar pelo texto
      console.log("⚠️ Usando fallback com respostas_completas");
      
      const respostasObj = respostas.respostas as Record<string, any>;
      const entries = Object.entries(respostasObj);
      
      // Tentar encontrar correspondência com questionMap pelo texto
      const answersWithOrder: Array<{ key: string; order: number; value: string }> = [];
      
      entries.forEach(([questionText, answer]) => {
        // Buscar no mapa pelo texto da pergunta
        let foundOrder = 999;
        let finalKey = questionText;
        
        questionMap.forEach((info, questionId) => {
          if (info.text === questionText || questionText.includes(info.text) || info.text.includes(questionText)) {
            foundOrder = info.globalNumber;
            const paddedNumber = String(info.globalNumber).padStart(2, '0');
            finalKey = `${paddedNumber} - ${info.text}`;
          }
        });
        
        // Se não encontrou, tentar extrair número do início do texto
        if (foundOrder === 999) {
          const match = questionText.match(/^(\d+)/);
          if (match) {
            foundOrder = parseInt(match[1]);
          }
        }
        
        answersWithOrder.push({
          key: finalKey,
          order: foundOrder,
          value: typeof answer === 'string' ? answer : JSON.stringify(answer)
        });
      });
      
      // Ordenar
      answersWithOrder.sort((a, b) => a.order - b.order);
      
      // Adicionar ao objeto
      answersWithOrder.forEach(item => {
        orderedAnswers[item.key] = item.value;
      });
    }
    
    if (Object.keys(orderedAnswers).length === 0) {
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
    
    // Preparar dados para enviar para o Make.com - formato plano otimizado e ORDENADO
    const webhookPayload = {
      // Metadados da submissão (essenciais para tracking)
      "00_ID_Submissao": submissionId,
      "00_ID_Usuario": submission.user_id,
      "00_Data_Submissao": new Date(submission.completed_at || respostas?.data_submissao || new Date()).toISOString(),
      "00_Timestamp": new Date().toISOString(),
      "00_Origem": "Sistema MAR - Crie Valor Consultoria",
      
      // Dados do usuário
      "00_Email": userEmail,
      "00_Nome": userName,
      "00_Telefone": profile?.phone || '',
      
      // As respostas do questionário em formato ordenado
      ...orderedAnswers
    };
    
    console.log("📤 Enviando dados para webhook do Make.com no formato ordenado");
    console.log(`📊 Payload contém ${Object.keys(webhookPayload).length} campos`);
    console.log(`📋 Primeiras chaves: ${Object.keys(webhookPayload).slice(0, 5).join(', ')}`);
    
    // URL do webhook do Make.com
    const webhookUrl = `https://hook.eu2.make.com/${WEBHOOK_TOKEN}`;
    
    console.log(`Endpoint do webhook: ${webhookUrl.replace(WEBHOOK_TOKEN, '***token-oculto***')}`);
    
    // Enviar dados para o webhook do Make.com
    const makeResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Supabase Edge Function v4.0"
      },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log(`Status da resposta do Make.com: ${makeResponse.status}`);
    
    let responseText = "";
    try {
      responseText = await makeResponse.text();
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
          responseBody: responseText || null,
          errorCode: "WEBHOOK_DELIVERY_FAILED",
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }
    
    // Marcar submissão como processada pelo webhook
    console.log(`Tentando marcar submissão ${submissionId} como processada...`);
    const { error: updateError } = await supabase
      .from("quiz_submissions")
      .update({ webhook_processed: true })
      .eq("id", submissionId);
    
    let updateSuccess = false;
    if (updateError) {
      console.error("❌ ERRO CRÍTICO ao atualizar webhook_processed na submissão:", {
        error: updateError,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
        submissionId
      });
    } else {
      console.log(`✅ Submissão ${submissionId} marcada como processada com sucesso`);
      updateSuccess = true;
    }
    
    // Marcar respostas_completas como processada pelo webhook, se existir
    let updateRespostasSuccess = false;
    if (respostas && respostas.id) {
      const { error: updateRespostasError } = await supabase
        .from("quiz_respostas_completas")
        .update({ webhook_processed: true })
        .eq("submission_id", submissionId);
      
      if (updateRespostasError) {
        console.error("❌ Erro ao atualizar webhook_processed em respostas_completas:", {
          error: updateRespostasError,
          message: updateRespostasError.message,
          submissionId
        });
      } else {
        console.log(`✅ Respostas para submissão ${submissionId} marcadas como processadas`);
        updateRespostasSuccess = true;
      }
    }
    
    // Retornar resposta com status detalhado das atualizações
    return new Response(
      JSON.stringify({
        success: updateSuccess,
        message: updateSuccess 
          ? "Dados enviados com sucesso para o Make.com e submissão marcada como processada"
          : "Dados enviados para o Make.com, mas falha ao marcar como processada",
        submission_id: submissionId,
        timestamp: new Date().toISOString(),
        webhook_sent: true,
        payload_fields: Object.keys(webhookPayload).length,
        updates: {
          submission_updated: updateSuccess,
          respostas_updated: updateRespostasSuccess,
          update_error: updateError ? {
            message: updateError.message,
            code: updateError.code,
            details: updateError.details
          } : null
        },
        webhook_url: webhookUrl.replace(WEBHOOK_TOKEN, "***token-oculto***"),
        webhook_response: responseText || null
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: updateSuccess ? 200 : 207,
      }
    );
    
  } catch (error) {
    console.error("Erro não tratado:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno no servidor", 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
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
