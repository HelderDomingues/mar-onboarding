
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Database, 
  AlertTriangle, 
  Loader2, 
  RefreshCcw,
  Wrench 
} from "lucide-react";
import { forceQuizRecovery } from "@/scripts/force-quiz-recovery";
import { testSupabaseStructure } from "@/utils/testSupabaseStructure";
import { supabase } from "@/integrations/supabase/client";
import { AdminRecoveryTools } from "@/components/admin/AdminRecoveryTools";

const DiagnosticoPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [recoveryResult, setRecoveryResult] = useState<any>(null);

  // Executar diagnóstico inicial ao carregar a página
  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      // Diagnóstico das tabelas
      const { data: modules, error: modulesError } = await supabase
        .from('quiz_modules')
        .select('*', { count: 'exact' });
      
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact' });
      
      const { data: options, error: optionsError } = await supabase
        .from('quiz_options')
        .select('*', { count: 'exact' });
      
      // Diagnóstico de submissões e respostas
      const { data: submissions, error: submissionsError } = await supabase
        .from('quiz_submissions')
        .select('*', { count: 'exact' });
      
      const { data: answers, error: answersError } = await supabase
        .from('quiz_answers')
        .select('*', { count: 'exact' });
      
      // Verificar erros de permissão ou acesso
      const hasPermissionIssue = 
        modulesError?.code === '42501' || 
        questionsError?.code === '42501' || 
        optionsError?.code === '42501' ||
        submissionsError?.code === '42501' ||
        answersError?.code === '42501';
      
      // Verificar problemas de estrutura
      const tablesExist = !modulesError && !questionsError && !optionsError;
      const tablesHaveData = 
        modules && modules.length > 0 && 
        questions && questions.length > 0 && 
        options && options.length > 0;
      
      // Determinar status geral
      let status = 'ok';
      if (hasPermissionIssue) status = 'permission_error';
      else if (!tablesExist) status = 'missing_tables';
      else if (!tablesHaveData) status = 'empty_tables';
      
      setDiagnosticResult({
        status,
        timestamp: new Date().toISOString(),
        details: {
          modules: {
            count: modules?.length || 0,
            error: modulesError ? (modulesError.message || modulesError.code) : null
          },
          questions: {
            count: questions?.length || 0,
            error: questionsError ? (questionsError.message || questionsError.code) : null
          },
          options: {
            count: options?.length || 0,
            error: optionsError ? (optionsError.message || optionsError.code) : null
          },
          submissions: {
            count: submissions?.length || 0,
            error: submissionsError ? (submissionsError.message || submissionsError.code) : null
          },
          answers: {
            count: answers?.length || 0,
            error: answersError ? (answersError.message || answersError.code) : null
          },
          hasPermissionIssue,
          tablesExist,
          tablesHaveData
        }
      });
      
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
      setDiagnosticResult({
        status: 'error',
        timestamp: new Date().toISOString(),
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      });
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao executar o diagnóstico",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForceRecovery = async () => {
    setIsProcessing(true);
    try {
      const result = await forceQuizRecovery();
      setRecoveryResult(result);
      
      toast({
        title: result.success ? 'Recuperação concluída' : 'Falha na recuperação',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      
      // Executar diagnóstico atualizado após a recuperação
      await runDiagnostic();
    } catch (error) {
      console.error('Erro ao executar recuperação forçada:', error);
      setRecoveryResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      
      toast({
        title: 'Erro',
        description: `Erro ao recuperar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const testModulesStructure = async () => {
    setIsProcessing(true);
    try {
      const result = await testSupabaseStructure();
      
      toast({
        title: result.success ? 'Teste concluído' : 'Falha no teste',
        description: result.success 
          ? `Estrutura verificada com sucesso: ${result.data?.modules || 0} módulos, ${result.data?.questions || 0} perguntas` 
          : `Falha: ${result.error}`,
        variant: result.success ? 'default' : 'destructive'
      });
      
      // Atualizar diagnóstico após o teste
      await runDiagnostic();
    } catch (error) {
      console.error('Erro ao testar estrutura:', error);
      toast({
        title: 'Erro',
        description: `Erro ao testar a estrutura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-500">Sistema OK</Badge>;
      case 'empty_tables':
        return <Badge className="bg-yellow-500">Dados Ausentes</Badge>;
      case 'missing_tables':
        return <Badge className="bg-red-500">Tabelas Ausentes</Badge>;
      case 'permission_error':
        return <Badge className="bg-red-500">Erro de Permissão</Badge>;
      default:
        return <Badge className="bg-red-500">Erro</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground">
            Ferramentas de teste e recuperação para o Sistema MAR
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostic} 
            disabled={isLoading || isProcessing}
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar Diagnóstico
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Executando diagnóstico do sistema...</p>
          <p className="text-sm text-muted-foreground">Verificando estrutura do banco de dados e questionários</p>
        </div>
      ) : (
        <>
          {diagnosticResult && (
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Status do Sistema</CardTitle>
                  <CardDescription>
                    Diagnóstico realizado em {new Date(diagnosticResult.timestamp).toLocaleString('pt-BR')}
                  </CardDescription>
                </div>
                {renderStatusBadge(diagnosticResult.status)}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                  <Card className="bg-gray-100">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-md">Módulos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          {diagnosticResult.details.modules.count}
                        </span>
                        {diagnosticResult.details.modules.error ? (
                          <XCircle className="h-6 w-6 text-red-500" />
                        ) : (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                      {diagnosticResult.details.modules.error && (
                        <p className="text-xs text-red-500 mt-1">{diagnosticResult.details.modules.error}</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-100">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-md">Perguntas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          {diagnosticResult.details.questions.count}
                        </span>
                        {diagnosticResult.details.questions.error ? (
                          <XCircle className="h-6 w-6 text-red-500" />
                        ) : (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                      {diagnosticResult.details.questions.error && (
                        <p className="text-xs text-red-500 mt-1">{diagnosticResult.details.questions.error}</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-100">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-md">Opções</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          {diagnosticResult.details.options.count}
                        </span>
                        {diagnosticResult.details.options.error ? (
                          <XCircle className="h-6 w-6 text-red-500" />
                        ) : (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                      {diagnosticResult.details.options.error && (
                        <p className="text-xs text-red-500 mt-1">{diagnosticResult.details.options.error}</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-100">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-md">Submissões</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          {diagnosticResult.details.submissions.count}
                        </span>
                        {diagnosticResult.details.submissions.error ? (
                          <XCircle className="h-6 w-6 text-red-500" />
                        ) : (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-100">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-md">Respostas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          {diagnosticResult.details.answers.count}
                        </span>
                        {diagnosticResult.details.answers.error ? (
                          <XCircle className="h-6 w-6 text-red-500" />
                        ) : (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {diagnosticResult.status === 'empty_tables' && (
                  <Alert className="mt-6 bg-yellow-50 text-yellow-800 border-yellow-300">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Dados ausentes detectados</AlertTitle>
                    <AlertDescription>
                      Uma ou mais tabelas do questionário estão vazias. Utilize a recuperação forçada para inserir os dados do questionário.
                    </AlertDescription>
                  </Alert>
                )}
                
                {diagnosticResult.status === 'missing_tables' && (
                  <Alert className="mt-6 bg-red-50 text-red-800 border-red-300">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Estrutura incompleta</AlertTitle>
                    <AlertDescription>
                      Uma ou mais tabelas necessárias estão ausentes ou inacessíveis. Verifique a estrutura do banco de dados.
                    </AlertDescription>
                  </Alert>
                )}
                
                {diagnosticResult.status === 'permission_error' && (
                  <Alert className="mt-6 bg-red-50 text-red-800 border-red-300">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erro de permissão</AlertTitle>
                    <AlertDescription>
                      Há problemas de permissão ao acessar o banco de dados. Verifique as políticas de RLS e configuração da chave service_role.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                  <Button 
                    onClick={testModulesStructure} 
                    variant="outline"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Testar Estrutura do Sistema
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleForceRecovery}
                    disabled={isProcessing}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recuperando...
                      </>
                    ) : (
                      <>
                        <Wrench className="mr-2 h-4 w-4" />
                        Recuperação Forçada do Questionário
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <AdminRecoveryTools />
          
          {recoveryResult && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{recoveryResult.success ? "Operação bem-sucedida" : "Falha na operação"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant={recoveryResult.success ? "default" : "destructive"}>
                  {recoveryResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{recoveryResult.success ? "Sucesso" : "Erro"}</AlertTitle>
                  <AlertDescription>
                    {recoveryResult.message}
                    {recoveryResult.success && recoveryResult.data && (
                      <div className="mt-2 text-xs">
                        <p>Módulos: {recoveryResult.data.modules}</p>
                        <p>Perguntas: {recoveryResult.data.questions}</p>
                        <p>Opções: {recoveryResult.data.options}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
              <CardDescription>
                Recomendações com base no diagnóstico do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnosticResult?.status === 'ok' ? (
                  <Alert className="bg-green-50 text-green-800 border-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Sistema Operacional</AlertTitle>
                    <AlertDescription>
                      O sistema está configurado corretamente e pronto para uso.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {(diagnosticResult?.status === 'empty_tables' || 
                      diagnosticResult?.status === 'missing_tables') && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 rounded-full p-2">
                            <ArrowRight className="h-4 w-4 text-blue-700" />
                          </div>
                          <span>Clique no botão <strong>Recuperação Forçada do Questionário</strong> acima.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 rounded-full p-2">
                            <ArrowRight className="h-4 w-4 text-blue-700" />
                          </div>
                          <span>Após a recuperação, verifique novamente o diagnóstico para confirmar que os dados foram carregados.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 rounded-full p-2">
                            <ArrowRight className="h-4 w-4 text-blue-700" />
                          </div>
                          <span>Navegue para o <a href="/admin/quiz-editor" className="text-blue-700 underline">Editor de Questionário</a> para confirmar que os dados estão visíveis e corretos.</span>
                        </div>
                      </div>
                    )}
                    
                    {diagnosticResult?.status === 'permission_error' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 rounded-full p-2">
                            <ArrowRight className="h-4 w-4 text-blue-700" />
                          </div>
                          <span>Verifique a configuração da chave <strong>service_role</strong> em <a href="/admin/settings" className="text-blue-700 underline">Configurações</a>.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 rounded-full p-2">
                            <ArrowRight className="h-4 w-4 text-blue-700" />
                          </div>
                          <span>Verifique as políticas de RLS no console do Supabase para garantir que os usuários tenham as permissões corretas.</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <Alert>
                  <AlertTitle>Precisa de mais ajuda?</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Você também pode experimentar ferramentas específicas para recuperação e teste:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <a href="/admin/recover-quiz" className="text-blue-700 underline">
                          Recuperação Manual do Questionário
                        </a>
                      </li>
                      <li>
                        <a href="/admin/seed-quiz" className="text-blue-700 underline">
                          Seed do Questionário MAR
                        </a>
                      </li>
                      <li>
                        <a href="/admin/quiz-editor" className="text-blue-700 underline">
                          Editor de Questionário
                        </a>
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DiagnosticoPage;
