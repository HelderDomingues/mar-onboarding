
import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { recoverQuizData } from "@/scripts/quiz-recovery";
import { forceQuizRecovery } from "@/scripts/force-quiz-recovery";
import { Loader2, AlertCircle, CheckCircle, RotateCcw, Tool } from "lucide-react";

const RecoverQuiz = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isForceLoading, setIsForceLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: {
      modules?: number;
      questions?: number;
      options?: number;
    };
  } | null>(null);

  const handleRecoverQuiz = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      const result = await recoverQuizData();
      
      setResult(result);
      toast({
        title: result.success ? "Sucesso" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Erro ao executar recuperação:", error);
      setResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao recuperar os dados do questionário.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceRecovery = async () => {
    try {
      setIsForceLoading(true);
      setResult(null);
      
      const result = await forceQuizRecovery();
      
      setResult(result);
      toast({
        title: result.success ? "Sucesso" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Erro ao executar recuperação forçada:", error);
      setResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao recuperar forçadamente os dados do questionário.",
        variant: "destructive"
      });
    } finally {
      setIsForceLoading(false);
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
                <h1 className="text-2xl font-bold">Recuperação do Questionário MAR</h1>
                <p className="text-muted-foreground">
                  Recupere os dados do questionário MAR após perda ou corrupção
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-primary" />
                    Recuperação de Dados
                  </CardTitle>
                  <CardDescription>
                    Execute a recuperação dos dados do questionário MAR para restaurar perguntas e opções perdidas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">                  
                  {result && (
                    <Alert variant={result.success ? "default" : "destructive"}>
                      {result.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {result.success ? "Recuperação concluída" : "Erro"}
                      </AlertTitle>
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
                  )}
                  
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button 
                      onClick={handleForceRecovery}
                      disabled={isForceLoading || isLoading}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      {isForceLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Executando...
                        </>
                      ) : (
                        <>
                          <Tool className="mr-2 h-4 w-4" />
                          Recuperação Forçada (Recomendado)
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={handleRecoverQuiz}
                      disabled={isLoading || isForceLoading}
                      className="bg-blue-700 hover:bg-blue-800"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Executando...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Recuperação Padrão
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Instruções</CardTitle>
                  <CardDescription>
                    Informações sobre o processo de recuperação do questionário MAR
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-900">
                    <h3 className="font-medium mb-2">O que esta página faz?</h3>
                    <p className="mb-2">
                      Esta página executa o script de recuperação do questionário MAR, que:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Verifica e corrige os módulos do questionário</li>
                      <li>Recupera as perguntas perdidas ou inconsistentes</li>
                      <li>Restaura as opções de resposta para cada pergunta</li>
                      <li>Garante a consistência entre módulos, perguntas e opções</li>
                    </ul>
                  </div>
                  
                  <div className="rounded-md bg-red-50 p-4 text-sm text-red-900">
                    <h3 className="font-medium mb-2">Recuperação Forçada (Recomendada)</h3>
                    <p>
                      Este método <strong>limpa completamente</strong> todos os dados existentes e insere novos dados
                      do zero. É o método mais confiável para resolver problemas persistentes.
                      Use esta opção se o método padrão não estiver funcionando.
                    </p>
                  </div>
                  
                  <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-900">
                    <h3 className="font-medium mb-2">Recuperação Padrão</h3>
                    <p>
                      Este método tenta preservar os dados existentes sempre que possível,
                      corrigindo apenas as inconsistências encontradas. É menos invasivo, 
                      mas pode não resolver todos os problemas.
                    </p>
                  </div>
                  
                  <div className="rounded-md bg-green-50 p-4 text-sm text-green-900">
                    <h3 className="font-medium mb-2">Após a execução</h3>
                    <p>
                      Após a recuperação com sucesso, você pode verificar os dados restaurados no
                      <strong> Editor do Questionário</strong>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RecoverQuiz;
