
import React, { useState } from 'react';
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QuizStructureTest } from "@/components/quiz/QuizStructureTest";
import { ForceRecoveryButton } from "@/components/admin/ForceRecoveryButton";
import { Loader2, AlertCircle, CheckCircle, Database, Server, Webhook } from "lucide-react";
import { testSupabaseStructure } from "@/utils/testSupabaseStructure";
import { forceQuizRecovery } from "@/scripts/force-quiz-recovery";
import WebhookTester from '@/components/debug/WebhookTester';

const DiagnosticoSistema: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("estrutura");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [recoveryResult, setRecoveryResult] = useState<any>(null);
  
  const handleTestStructure = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseStructure();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForceRecovery = async () => {
    setIsLoading(true);
    try {
      const result = await forceQuizRecovery();
      setRecoveryResult(result);
      // Atualizar também os resultados de teste após a recuperação
      const testResult = await testSupabaseStructure();
      setTestResult(testResult);
    } catch (error) {
      setRecoveryResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader isAdmin={isAdmin} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Diagnóstico do Sistema</h1>
          <p className="text-gray-500">
            Verifique e corrija problemas do Sistema MAR
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="estrutura" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Estrutura do Banco
            </TabsTrigger>
            <TabsTrigger value="questionario" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Questionário
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhook
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="estrutura" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verificação de Estrutura do Banco de Dados</CardTitle>
                <CardDescription>
                  Verifica se todas as tabelas e estruturas necessárias estão presentes no banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Esta ferramenta verifica a existência e configuração das tabelas necessárias para o funcionamento do Sistema MAR.
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
                      <>Testar Estrutura do Banco</>
                    )}
                  </Button>
                </div>
                
                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"} className="mt-4">
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{testResult.success ? "Sucesso" : "Erro"}</AlertTitle>
                    <AlertDescription>
                      {testResult.success ? (
                        <div>
                          <p>Estrutura do banco de dados verificada com sucesso!</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p>Módulos: <Badge>{testResult.data?.modules || 0}</Badge></p>
                            <p>Perguntas: <Badge>{testResult.data?.questions || 0}</Badge></p>
                            <p>Opções: <Badge>{testResult.data?.options || 0}</Badge></p>
                            {testResult.data?.questionTypes && (
                              <p>Tipos de pergunta: {testResult.data.questionTypes.join(', ')}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p>Falha na verificação: {testResult.error}</p>
                          <p className="text-sm mt-1">Etapa: {testResult.stage || "Desconhecida"}</p>
                          {testResult.details && (
                            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(testResult.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              {!testResult?.success && testResult && (
                <CardFooter className="border-t pt-4">
                  <ForceRecoveryButton 
                    onComplete={(result) => {
                      setRecoveryResult(result);
                      handleTestStructure();
                    }}
                    variant="destructive"
                  />
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="questionario" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teste do Questionário MAR</CardTitle>
                <CardDescription>
                  Verifica se o questionário está configurado corretamente e seus dados estão consistentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuizStructureTest />
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-col items-start gap-4">
                <div className="text-sm text-gray-500 mb-2">
                  Se os testes apontarem problemas, você pode usar o botão abaixo para forçar uma recuperação dos dados do questionário.
                </div>
                <Button 
                  onClick={handleForceRecovery} 
                  disabled={isLoading}
                  variant="destructive"
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recuperando...
                    </>
                  ) : (
                    <>Recuperação Forçada do Questionário</>
                  )}
                </Button>
                
                {recoveryResult && (
                  <Alert variant={recoveryResult.success ? "default" : "destructive"} className="w-full mt-4">
                    {recoveryResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{recoveryResult.success ? "Recuperação Bem-sucedida" : "Falha na Recuperação"}</AlertTitle>
                    <AlertDescription>
                      {recoveryResult.message}
                      {recoveryResult.success && recoveryResult.data && (
                        <div className="mt-2 space-y-1 text-sm">
                          <p>Módulos: <Badge>{recoveryResult.data.modules || 0}</Badge></p>
                          <p>Perguntas: <Badge>{recoveryResult.data.questions || 0}</Badge></p>
                          <p>Opções: <Badge>{recoveryResult.data.options || 0}</Badge></p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="webhook">
            <WebhookTester />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DiagnosticoSistema;
