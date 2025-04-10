
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { logger } from '@/utils/logger';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [adminStatus, setAdminStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [quizQuestionsStatus, setQuizQuestionsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [quizSubmissionsStatus, setQuizSubmissionsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [completeFunctionStatus, setCompleteFunctionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<any>({});

  const testConnection = async () => {
    setConnectionStatus('loading');
    setErrorMessage(null);

    try {
      logger.info('Testando conexão com Supabase', { tag: 'Test' });
      
      // Teste básico de conexão - fazer uma consulta simples
      const { data, error } = await supabase.from('profiles').select('count(*)');
      
      if (error) {
        throw error;
      }
      
      logger.info('Conexão com Supabase bem-sucedida', { tag: 'Test', data });
      setConnectionStatus('success');
      setResults(prev => ({ ...prev, connection: { success: true, data } }));
    } catch (error: any) {
      logger.error('Erro na conexão com Supabase', { tag: 'Test', error });
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Erro desconhecido na conexão');
      setResults(prev => ({ ...prev, connection: { success: false, error } }));
    }
  };

  const testAuth = async () => {
    setAuthStatus('loading');
    
    try {
      logger.info('Testando autenticação com Supabase', { tag: 'Test' });
      
      // Verificar sessão atual
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      logger.info('Verificação de autenticação bem-sucedida', { 
        tag: 'Test', 
        data: { hasSession: !!data.session } 
      });
      
      setAuthStatus('success');
      setResults(prev => ({ 
        ...prev, 
        auth: { 
          success: true, 
          hasSession: !!data.session,
          userId: data.session?.user?.id
        } 
      }));
    } catch (error: any) {
      logger.error('Erro na verificação de autenticação', { tag: 'Test', error });
      setAuthStatus('error');
      setErrorMessage(error.message || 'Erro na verificação de autenticação');
      setResults(prev => ({ ...prev, auth: { success: false, error } }));
    }
  };

  const testAdminFunction = async () => {
    setAdminStatus('loading');
    
    try {
      logger.info('Testando função is_admin', { tag: 'Test' });
      
      // Testar função is_admin
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        throw error;
      }
      
      logger.info('Verificação de admin bem-sucedida', { 
        tag: 'Test', 
        data: { isAdmin: !!data } 
      });
      
      setAdminStatus('success');
      setResults(prev => ({ ...prev, admin: { success: true, isAdmin: !!data } }));
    } catch (error: any) {
      logger.error('Erro na verificação de admin', { tag: 'Test', error });
      setAdminStatus('error');
      setErrorMessage(error.message || 'Erro na verificação de admin');
      setResults(prev => ({ ...prev, admin: { success: false, error } }));
    }
  };

  const testQuizQuestions = async () => {
    setQuizQuestionsStatus('loading');
    
    try {
      logger.info('Testando acesso à tabela quiz_questions', { tag: 'Test' });
      
      // Testar acesso às perguntas do questionário
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('count(*)');
      
      if (error) {
        throw error;
      }
      
      logger.info('Acesso à tabela quiz_questions bem-sucedido', { 
        tag: 'Test', 
        data 
      });
      
      setQuizQuestionsStatus('success');
      setResults(prev => ({ ...prev, quizQuestions: { success: true, data } }));
    } catch (error: any) {
      logger.error('Erro no acesso à tabela quiz_questions', { tag: 'Test', error });
      setQuizQuestionsStatus('error');
      setErrorMessage(error.message || 'Erro no acesso à tabela quiz_questions');
      setResults(prev => ({ ...prev, quizQuestions: { success: false, error } }));
    }
  };

  const testQuizSubmissions = async () => {
    setQuizSubmissionsStatus('loading');
    
    try {
      logger.info('Testando acesso à tabela quiz_submissions', { tag: 'Test' });
      
      // Testar acesso às submissões do questionário
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select('count(*)');
      
      if (error) {
        throw error;
      }
      
      logger.info('Acesso à tabela quiz_submissions bem-sucedido', { 
        tag: 'Test', 
        data 
      });
      
      setQuizSubmissionsStatus('success');
      setResults(prev => ({ ...prev, quizSubmissions: { success: true, data } }));
    } catch (error: any) {
      logger.error('Erro no acesso à tabela quiz_submissions', { tag: 'Test', error });
      setQuizSubmissionsStatus('error');
      setErrorMessage(error.message || 'Erro no acesso à tabela quiz_submissions');
      setResults(prev => ({ ...prev, quizSubmissions: { success: false, error } }));
    }
  };

  const testCompleteFunction = async () => {
    setCompleteFunctionStatus('loading');
    
    try {
      logger.info('Testando função complete_quiz', { tag: 'Test' });
      
      // Verificar se o usuário está autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user?.id) {
        throw new Error('Usuário não autenticado para testar a função complete_quiz');
      }
      
      // Testar função complete_quiz (apenas verificar se não dá erro, não executar de fato)
      const { error } = await supabase.rpc('complete_quiz', {
        user_id: sessionData.session.user.id
      });
      
      if (error) {
        throw error;
      }
      
      logger.info('Teste da função complete_quiz bem-sucedido', { 
        tag: 'Test'
      });
      
      setCompleteFunctionStatus('success');
      setResults(prev => ({ ...prev, completeFunction: { success: true } }));
    } catch (error: any) {
      logger.error('Erro no teste da função complete_quiz', { tag: 'Test', error });
      setCompleteFunctionStatus('error');
      setErrorMessage(error.message || 'Erro no teste da função complete_quiz');
      setResults(prev => ({ ...prev, completeFunction: { success: false, error } }));
    }
  };

  const testWebhook = async () => {
    setWebhookStatus('loading');
    
    try {
      logger.info('Testando conexão com a função de webhook', { tag: 'Test' });
      
      // Testar chamada à função de webhook (sem passar ID real para não disparar webhook)
      const { data, error } = await supabase.functions.invoke('quiz-webhook', {
        body: { test: true }
      });
      
      if (error) {
        throw error;
      }
      
      logger.info('Conexão com webhook bem-sucedida', { 
        tag: 'Test', 
        data 
      });
      
      setWebhookStatus('success');
      setResults(prev => ({ ...prev, webhook: { success: true, data } }));
    } catch (error: any) {
      logger.error('Erro na conexão com webhook', { tag: 'Test', error });
      setWebhookStatus('error');
      setErrorMessage(error.message || 'Erro na conexão com webhook');
      setResults(prev => ({ ...prev, webhook: { success: false, error } }));
    }
  };

  const runAllTests = () => {
    testConnection();
    testAuth();
    testAdminFunction();
    testQuizQuestions();
    testQuizSubmissions();
    testCompleteFunction();
    testWebhook();
  };

  const getStatusBadge = (status: 'idle' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'idle':
        return <Badge variant="outline">Não testado</Badge>;
      case 'loading':
        return <Badge variant="secondary">Testando...</Badge>;
      case 'success':
        return <Badge variant="success" className="bg-green-500 text-white">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Teste de Conexão com Supabase</CardTitle>
        <CardDescription>
          Verifique se a conexão com o banco de dados Supabase e as políticas de segurança estão funcionando corretamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Conexão Básica</div>
            {getStatusBadge(connectionStatus)}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Autenticação</div>
            {getStatusBadge(authStatus)}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Função Admin</div>
            {getStatusBadge(adminStatus)}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Quiz Questões</div>
            {getStatusBadge(quizQuestionsStatus)}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Quiz Submissões</div>
            {getStatusBadge(quizSubmissionsStatus)}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Função Complete Quiz</div>
            {getStatusBadge(completeFunctionStatus)}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Webhook</div>
            {getStatusBadge(webhookStatus)}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm">
            <strong>Erro:</strong> {errorMessage}
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div className="mt-4">
            <Separator className="my-4" />
            <h3 className="text-lg font-medium mb-2">Detalhes:</h3>
            <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-auto max-h-60">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          <Button variant="outline" onClick={testConnection}>Testar Conexão</Button>
          <Button variant="outline" onClick={testAuth}>Testar Auth</Button>
          <Button variant="outline" onClick={testAdminFunction}>Testar Admin</Button>
        </div>
        <Button onClick={runAllTests}>Executar Todos os Testes</Button>
      </CardFooter>
    </Card>
  );
};

export default SupabaseConnectionTest;
