
import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, AlertTriangle, Database, HistoryIcon } from "lucide-react";
import { recoverQuizData } from "@/scripts/quiz-recovery";
import { forceQuizRecovery } from "@/scripts/force-quiz-recovery";
import { testSupabaseStructure } from "@/utils/testSupabaseStructure";

const RecoverQuiz = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const handleRecover = async () => {
    setIsLoading(true);
    try {
      const recoveryResult = await recoverQuizData();
      setResult(recoveryResult);
      
      toast({
        title: recoveryResult.success ? "Recuperação completa" : "Falha na recuperação",
        description: recoveryResult.message,
        variant: recoveryResult.success ? "default" : "destructive"
      });
      
      // Atualizar resultados do teste após a recuperação
      if (recoveryResult.success) {
        const newTestResult = await testSupabaseStructure();
        setTestResult(newTestResult);
      }
    } catch (error) {
      console.error("Erro ao recuperar questionário:", error);
      setResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao recuperar o questionário",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForceRecover = async () => {
    setIsLoading(true);
    try {
      const recoveryResult = await forceQuizRecovery();
      setResult(recoveryResult);
      
      toast({
        title: recoveryResult.success ? "Recuperação forçada completa" : "Falha na recuperação",
        description: recoveryResult.message,
        variant: recoveryResult.success ? "default" : "destructive"
      });
      
      // Atualizar resultados do teste após a recuperação
      if (recoveryResult.success) {
        const newTestResult = await testSupabaseStructure();
        setTestResult(newTestResult);
      }
    } catch (error) {
      console.error("Erro ao forçar recuperação:", error);
      setResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao forçar a recuperação do questionário",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestStructure = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseStructure();
      setTestResult(result);
      
      toast({
        title: result.success ? "Teste concluído" : "Falha no teste",
        description: result.success 
          ? "Estrutura verificada com sucesso"
          : `Falha: ${result.error}`,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Erro ao testar estrutura:", error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao testar a estrutura",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background font-sans">
        <AdminSidebar />
        
        <div className="flex-1">
          <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Recuperação do Questionário</h1>
                <p className="text-muted-foreground">
                  Resolva problemas com os dados do questionário MAR
                </p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="standard" className="flex items-center gap-2">
                  <HistoryIcon className="h-4 w-4" />
                  Recuperação Padrão
                </TabsTrigger>
                <TabsTrigger value="force" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Recuperação Forçada
                </TabsTrigger>
                <TabsTrigger value="test" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Teste de Estrutura
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recuperação Padrão</CardTitle>
                    <CardDescription>
                      Recupera os dados do questionário preservando o máximo possível da estrutura existente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert variant="warning">
                      <AlertTitle>Cuidado</AlertTitle>
                      <AlertDescription>
                        Esta operação tentará manter os dados existentes e apenas corrigir os problemas encontrados.
                        Respostas e submissões de usuários serão preservadas.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleRecover}
                        disabled={isLoading}
                        className="bg-blue-700 hover:bg-blue-800"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Recuperando...
                          </>
                        ) : (
                          <>Iniciar Recuperação Padrão</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="force" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recuperação Forçada</CardTitle>
                    <CardDescription>
                      Tenta recuperar os dados com abordagens mais agressivas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert variant="destructive">
                      <AlertTitle>Atenção</AlertTitle>
                      <AlertDescription>
                        Esta operação tentará restaurar o questionário usando métodos mais agressivos,
                        incluindo a possibilidade de limpar dados problemáticos. Use apenas se a recuperação
                        padrão falhar.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleForceRecover}
                        disabled={isLoading}
                        variant="destructive"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Forçando recuperação...
                          </>
                        ) : (
                          <>Iniciar Recuperação Forçada</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="test" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Teste de Estrutura</CardTitle>
                    <CardDescription>
                      Verifica a estrutura do questionário e seu estado atual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Esta ferramenta verifica se todas as tabelas, módulos, perguntas e opções necessárias
                      estão presentes no banco de dados.
                    </p>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleTestStructure}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          <>Testar Estrutura do Sistema</>
                        )}
                      </Button>
                    </div>
                    
                    {testResult && (
                      <Alert variant={testResult.success ? "default" : "destructive"} className="mt-4">
                        {testResult.success ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <AlertTitle>{testResult.success ? "Sucesso" : "Erro"}</AlertTitle>
                        <AlertDescription>
                          {testResult.success ? (
                            <div>
                              <p>Estrutura do banco de dados verificada com sucesso!</p>
                              <div className="mt-2 space-y-1 text-xs">
                                <p>Módulos: {testResult.data?.modules || 0}</p>
                                <p>Perguntas: {testResult.data?.questions || 0}</p>
                                <p>Opções: {testResult.data?.options || 0}</p>
                                {testResult.data?.questionTypes && (
                                  <p>Tipos de pergunta: {testResult.data.questionTypes.join(', ')}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p>Falha na verificação: {testResult.error}</p>
                              <p className="text-xs mt-1">Etapa: {testResult.stage || "Desconhecida"}</p>
                              {testResult.details && (
                                <pre className="mt-2 bg-red-50 p-2 rounded text-xs overflow-auto max-h-40">
                                  {JSON.stringify(testResult.details, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>{result.success ? "Operação bem-sucedida" : "Falha na operação"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant={result.success ? "default" : "destructive"}>
                    {result.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertTitle>{result.success ? "Sucesso" : "Erro"}</AlertTitle>
                    <AlertDescription>
                      {result.message}
                      {result.success && result.data && (
                        <div className="mt-2 text-xs">
                          <p>Módulos: {result.data.modules}</p>
                          <p>Perguntas: {result.data.questions}</p>
                          <p>Opções: {result.data.options}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RecoverQuiz;
