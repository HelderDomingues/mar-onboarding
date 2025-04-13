
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, CheckCircle, Code } from 'lucide-react';
import { testSupabaseConnection } from '@/utils/supabaseUtils';
import { supabase } from '@/integrations/supabase/client';

/**
 * Componente diagnóstico para testar a conexão com o Supabase
 * e identificar problemas comuns como headers incorretos ou falhas de autenticação
 */
const ConnectionTester = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [detailedResults, setDetailedResults] = useState<any[]>([]);
  
  const runTests = async () => {
    setStatus('testing');
    setDetailedResults([]);
    
    // Teste básico de conexão
    try {
      const connectionTest = await testSupabaseConnection();
      setDetailedResults(prev => [...prev, {
        name: 'Teste de conexão básico',
        success: connectionTest.success,
        message: connectionTest.success ? 'Conexão estabelecida com sucesso' : connectionTest.error
      }]);
      
      if (!connectionTest.success) {
        setStatus('error');
        setResult({
          message: 'Falha na conexão básica com o Supabase',
          error: connectionTest.error
        });
        return;
      }
      
      // Teste de sessão
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      setDetailedResults(prev => [...prev, {
        name: 'Verificação de sessão',
        success: !sessionError,
        message: sessionError ? sessionError.message : 'Sessão verificada com sucesso'
      }]);
      
      if (sessionError) {
        setStatus('error');
        setResult({
          message: 'Falha ao verificar sessão',
          error: sessionError.message
        });
        return;
      }
      
      if (sessionData.session) {
        setUserId(sessionData.session.user.id);
        
        // Teste de verificação de admin
        try {
          const { data: adminData, error: adminError } = await supabase.rpc('is_admin');
          
          setDetailedResults(prev => [...prev, {
            name: 'Verificação de função is_admin',
            success: !adminError,
            message: adminError ? adminError.message : `Resultado: ${adminData}`
          }]);
          
          if (!adminError) {
            setIsAdmin(adminData === true);
          }
        } catch (adminCheckError: any) {
          setDetailedResults(prev => [...prev, {
            name: 'Verificação de função is_admin',
            success: false,
            message: adminCheckError.message || 'Erro desconhecido'
          }]);
        }
        
        // Teste de acesso a uma tabela comum (profiles)
        const { error: profilesError } = await supabase
          .from('profiles')
          .select('count(*)', { count: 'exact', head: true });
          
        setDetailedResults(prev => [...prev, {
          name: 'Acesso à tabela profiles',
          success: !profilesError,
          message: profilesError ? profilesError.message : 'Acesso concedido'
        }]);
        
        // Teste de acesso a dados do questionário
        const { error: quizError } = await supabase
          .from('quiz_submissions')
          .select('count(*)', { count: 'exact', head: true })
          .eq('user_id', sessionData.session.user.id);
          
        setDetailedResults(prev => [...prev, {
          name: 'Acesso aos dados do questionário',
          success: !quizError,
          message: quizError ? quizError.message : 'Acesso concedido'
        }]);
      } else {
        setDetailedResults(prev => [...prev, {
          name: 'Autenticação',
          success: false,
          message: 'Usuário não está autenticado'
        }]);
      }
      
      setStatus('success');
      setResult({
        message: 'Testes de diagnóstico completados'
      });
      
    } catch (error: any) {
      setStatus('error');
      setResult({
        message: 'Erro inesperado nos testes',
        error: error.message || 'Erro desconhecido'
      });
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Diagnóstico de Conexão</span>
          {status === 'idle' ? (
            <Badge variant="outline" className="bg-slate-50 text-slate-700">
              Aguardando
            </Badge>
          ) : status === 'testing' ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              Testando...
            </Badge>
          ) : status === 'success' ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Concluído
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700">
              Falha
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status === 'idle' ? (
          <div className="py-6 text-center text-muted-foreground">
            <p>Clique em "Iniciar Diagnóstico" para verificar a conexão com o Supabase.</p>
          </div>
        ) : status === 'testing' ? (
          <div className="py-6 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : status === 'error' ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no diagnóstico</AlertTitle>
            <AlertDescription>
              {result?.message}: {result?.error}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="h-5 w-5 text-green-500" /> 
                <span>Diagnóstico completo</span>
              </div>
              
              {userId && (
                <div className="text-sm grid grid-cols-2 gap-x-2 border rounded-md p-3 bg-slate-50">
                  <span className="font-medium">ID do Usuário:</span>
                  <span className="font-mono text-xs overflow-hidden overflow-ellipsis">{userId}</span>
                  
                  <span className="font-medium">Status Admin:</span>
                  <span>{isAdmin === true ? 'Sim' : isAdmin === false ? 'Não' : 'Não verificado'}</span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Code className="h-4 w-4" /> Resultados Detalhados
              </h3>
              <div className="border rounded-md divide-y text-sm">
                {detailedResults.map((test, index) => (
                  <div key={index} className="px-3 py-2 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{test.name}: </span>
                      <span className="text-muted-foreground text-xs">{test.message}</span>
                    </div>
                    <Badge 
                      variant={test.success ? "outline" : "destructive"}
                      className={test.success ? "bg-green-50 text-green-700" : undefined}
                    >
                      {test.success ? 'OK' : 'Falha'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={runTests} 
          disabled={status === 'testing'} 
          className="w-full"
          variant={status === 'error' ? "destructive" : "default"}
        >
          {status === 'testing' ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Executando testes...
            </>
          ) : status === 'error' ? (
            'Tentar Novamente'
          ) : status === 'success' ? (
            'Executar Novamente'
          ) : (
            'Iniciar Diagnóstico'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectionTester;
