
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Database, RefreshCw, CheckCircle } from "lucide-react";
import { ForceRecoveryButton } from "@/components/admin/ForceRecoveryButton";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const RecoverQuizPage = () => {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("recovery");

  const checkConnection = async () => {
    try {
      setChecking(true);
      setCheckResult(null);
      
      // Verificar conexão com Supabase
      const { data, error, connected } = await supabase
        .from('quiz_modules')
        .select('count', { count: 'exact', head: true });
        
      if (error) {
        console.error("Erro na conexão:", error);
        setCheckResult({
          success: false,
          message: `Falha na conexão: ${error.message}`,
          details: error
        });
        
        toast({
          title: "Erro na conexão",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      // Verificar contagem de dados
      const { count: modulesCount } = await supabase
        .from('quiz_modules')
        .select('*', { count: 'exact', head: true });
        
      const { count: questionsCount } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true });
        
      const { count: optionsCount } = await supabase
        .from('quiz_options')
        .select('*', { count: 'exact', head: true });
      
      setCheckResult({
        success: true,
        message: "Conexão bem-sucedida!",
        data: {
          modules: modulesCount || 0,
          questions: questionsCount || 0, 
          options: optionsCount || 0
        }
      });
      
      toast({
        title: "Conexão verificada",
        description: "Conexão com o banco de dados está funcionando corretamente.",
      });
    } catch (error) {
      console.error("Erro ao verificar conexão:", error);
      setCheckResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        error
      });
      
      toast({
        title: "Erro ao verificar conexão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  const handleRecoveryComplete = (result: any) => {
    if (result.success) {
      toast({
        title: "Recuperação concluída",
        description: `Dados recuperados: ${result.data?.modules || 0} módulos, ${result.data?.questions || 0} questões, ${result.data?.options || 0} opções.`,
      });
    } else {
      toast({
        title: "Falha na recuperação",
        description: result.message,
        variant: "destructive"
      });
    }
    
    // Após recuperação, verificar estado do banco
    checkConnection();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Centro de Recuperação do Questionário</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="recovery">Recuperação</TabsTrigger>
                <TabsTrigger value="diagnostics">Diagnóstico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recovery">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      Recuperação Forçada do Questionário
                    </CardTitle>
                    <CardDescription>
                      Esta operação limpará e recriará completamente todos os dados do questionário MAR.
                      Use apenas em caso de dados corrompidos ou inconsistentes.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Alert className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Atenção</AlertTitle>
                      <AlertDescription>
                        Esta operação remove todos os dados existentes do questionário antes de inserir novos.
                        As respostas dos usuários serão preservadas, mas podem ficar desalinhadas se a estrutura das perguntas mudar.
                      </AlertDescription>
                    </Alert>
                    
                    {checkResult && (
                      <div className="mb-6 p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Estado atual do banco de dados:</h3>
                        <div className="text-sm">
                          <p>Módulos: {checkResult.data?.modules || 0}</p>
                          <p>Questões: {checkResult.data?.questions || 0}</p>
                          <p>Opções: {checkResult.data?.options || 0}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={checkConnection}
                      disabled={checking}
                    >
                      {checking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Verificar Banco de Dados
                        </>
                      )}
                    </Button>
                    
                    <ForceRecoveryButton
                      onComplete={handleRecoveryComplete}
                      variant="destructive"
                    />
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="diagnostics">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Diagnóstico da Conexão
                    </CardTitle>
                    <CardDescription>
                      Verifique se a conexão com o banco de dados está funcionando corretamente
                      e se os dados do questionário estão presentes.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {checkResult ? (
                      <div className={`p-4 border rounded-md ${checkResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-start gap-3">
                          {checkResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          )}
                          
                          <div>
                            <h3 className="font-medium mb-1">
                              {checkResult.success ? 'Conexão estabelecida' : 'Falha na conexão'}
                            </h3>
                            <p className="text-sm mb-3">{checkResult.message}</p>
                            
                            {checkResult.success ? (
                              <div className="bg-white p-3 rounded border text-sm">
                                <p className="font-medium mb-1">Contagem de registros:</p>
                                <ul className="space-y-1 pl-2">
                                  <li>Módulos: {checkResult.data?.modules || 0}</li>
                                  <li>Questões: {checkResult.data?.questions || 0}</li>
                                  <li>Opções: {checkResult.data?.options || 0}</li>
                                </ul>
                                
                                {(checkResult.data?.modules === 0 || 
                                  checkResult.data?.questions === 0 || 
                                  checkResult.data?.options === 0) && (
                                  <Alert className="mt-3 bg-amber-50">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <AlertTitle>Dados insuficientes</AlertTitle>
                                    <AlertDescription>
                                      Alguns dados estão faltando. Recomendamos executar a recuperação forçada.
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            ) : (
                              <div className="bg-white p-3 rounded border text-sm">
                                <p className="font-medium mb-1">Detalhes do erro:</p>
                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                  {JSON.stringify(checkResult.details || checkResult.error, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Database className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-muted-foreground">Clique no botão abaixo para verificar a conexão</p>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      onClick={checkConnection}
                      disabled={checking}
                      className="w-full"
                    >
                      {checking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando conexão...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Verificar Conexão com o Banco de Dados
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RecoverQuizPage;
