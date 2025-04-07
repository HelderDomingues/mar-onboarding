
// Função edge para processar dados do quiz e enviar para webhook externo
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://nmxfknwkhnengqqjtwru.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/wpbbjokh8cexvd1hql9i7ae6uyf32bzh'

Deno.serve(async (req) => {
  // Lidar com solicitações OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Analisar corpo da solicitação
    const { submissionId } = await req.json()
    
    console.log(`Processando submissão ID: ${submissionId}`)
    
    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'ID de submissão não fornecido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Inicializar cliente Supabase com chave de serviço para acesso completo
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Obter dados da submissão
    const { data: submissionData, error: submissionError } = await supabase
      .from('quiz_submissions')
      .select('*, user_id')
      .eq('id', submissionId)
      .single()
    
    if (submissionError || !submissionData) {
      console.error('Erro ao buscar dados da submissão:', submissionError)
      return new Response(JSON.stringify({ error: 'Erro ao buscar dados da submissão' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Buscar respostas simplificadas
    const { data: simplifiedData, error: simplifiedError } = await supabase
      .from('quiz_respostas_completas')
      .select('*')
      .eq('user_id', submissionData.user_id)
      .maybeSingle()
    
    if (simplifiedError) {
      console.error('Erro ao buscar respostas simplificadas:', simplifiedError)
    }
    
    // Buscar dados do perfil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', submissionData.user_id)
      .single()
    
    if (profileError || !profileData) {
      console.error('Erro ao buscar dados do perfil:', profileError)
    }
    
    // Enviar dados para o webhook
    const webhookData = {
      submission: submissionData,
      profile: profileData || null,
      respostas_completas: simplifiedData || null,
      timestamp: new Date().toISOString(),
    }
    
    console.log('Enviando dados para webhook:', JSON.stringify(webhookData).slice(0, 100) + '...')
    
    // Enviar para o webhook do Make.com via fetch
    const webhookResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    })
    
    if (!webhookResponse.ok) {
      const responseText = await webhookResponse.text()
      console.error('Erro na resposta do webhook:', webhookResponse.status, responseText)
      
      return new Response(JSON.stringify({ 
        error: 'Falha ao enviar dados para webhook', 
        status: webhookResponse.status,
        details: responseText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Marcar como processado
    const { error: updateError } = await supabase
      .from('quiz_submissions')
      .update({ webhook_processed: true })
      .eq('id', submissionId)
    
    if (updateError) {
      console.error('Erro ao marcar submissão como processada:', updateError)
    }
    
    const responseText = await webhookResponse.text()
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Dados enviados para webhook com sucesso',
      webhook_response: responseText
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Erro ao processar solicitação:', error)
    
    return new Response(JSON.stringify({ error: 'Erro interno do servidor', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
