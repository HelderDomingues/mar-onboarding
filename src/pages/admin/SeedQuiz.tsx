
import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReloadQuizDataButton } from "@/components/admin/ReloadQuizDataButton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { seedQuizData } from "@/scripts/seed-quiz";
import { Database, LayoutGrid, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { quizModulesData, quizQuestionsData, quizOptionsData } from '@/scripts/quiz-data';

const SeedQuiz = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    modules?: number;
    questions?: number;
    options?: number;
  } | null>(null);

  const handleSeedQuiz = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      const success = await seedQuizData();
      
      if (success) {
        setResult({
          success: true,
          message: "Dados do questionário inseridos com sucesso!",
          modules: quizModulesData.length,
          questions: quizQuestionsData.length,
          options: quizOptionsData.length
        });
        toast({
          title: "Sucesso",
          description: "Questionário MAR configurado com sucesso!"
        });
      } else {
        setResult({
          success: false,
          message: "Erro ao inserir dados do questionário. Verifique o console para mais detalhes."
        });
        toast({
          title: "Erro",
          description: "Não foi possível inserir os dados do questionário.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao executar seed:", error);
      setResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao executar o seed do questionário.",
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
                <h1 className="text-2xl font-bold">Configuração do Questionário MAR</h1>
                <p className="text-muted-foreground">
                  Configure e recarregue os dados do questionário MAR
                </p>
              </div>
              
              <div className="flex gap-2">
                <ReloadQuizDataButton />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Seed do Questionário MAR
                  </CardTitle>
                  <CardDescription>
                    Executar o script para inserir ou atualizar os dados do questionário
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Dados a serem inseridos:</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-secondary/30 p-3 rounded-md text-center">
                        <p className="text-xl font-semibold">{quizModulesData.length}</p>
                        <p className="text-xs text-muted-foreground">Módulos</p>
                      </div>
                      <div className="bg-secondary/30 p-3 rounded-md text-center">
                        <p className="text-xl font-semibold">{quizQuestionsData.length}</p>
                        <p className="text-xs text-muted-foreground">Perguntas</p>
                      </div>
                      <div className="bg-secondary/30 p-3 rounded-md text-center">
                        <p className="text-xl font-semibold">{quizOptionsData.length}</p>
                        <p className="text-xs text-muted-foreground">Opções</p>
                      </div>
                    </div>
                  </div>
                  
                  {result && (
                    <Alert variant={result.success ? "default" : "destructive"}>
                      {result.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {result.success ? "Operação concluída" : "Erro"}
                      </AlertTitle>
                      <AlertDescription>
                        {result.message}
                        
                        {result.success && result.modules && result.questions && result.options && (
                          <div className="mt-2 text-xs">
                            <p>Módulos: {result.modules}</p>
                            <p>Perguntas: {result.questions}</p>
                            <p>Opções: {result.options}</p>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSeedQuiz}
                      disabled={isLoading}
                      className="bg-blue-700 hover:bg-blue-800"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Executando...
                        </>
                      ) : (
                        <>
                          <LayoutGrid className="mr-2 h-4 w-4" />
                          Executar Seed do Questionário
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
                    Informações sobre o processo de configuração do questionário MAR
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-900">
                    <h3 className="font-medium mb-2">O que esta página faz?</h3>
                    <p className="mb-2">
                      Esta página executa o script de configuração (seed) do questionário MAR, que:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Insere ou atualiza os módulos do questionário</li>
                      <li>Insere ou atualiza as 52 perguntas em seus respectivos módulos</li>
                      <li>Configura todas as opções de resposta para cada pergunta</li>
                      <li>Associa corretamente os módulos e as perguntas</li>
                    </ul>
                  </div>
                  
                  <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-900">
                    <h3 className="font-medium mb-2">Atenção</h3>
                    <p>
                      Executar este script várias vezes é seguro, pois ele foi projetado para não duplicar dados.
                      No entanto, ele irá substituir quaisquer alterações manuais feitas anteriormente nas perguntas
                      do questionário. Use apenas quando precisar resetar o questionário para seu estado original.
                    </p>
                  </div>
                  
                  <div className="rounded-md bg-green-50 p-4 text-sm text-green-900">
                    <h3 className="font-medium mb-2">Após a execução</h3>
                    <p>
                      Após executar o seed com sucesso, você pode visualizar e gerenciar todas as
                      perguntas e opções no <strong>Editor do Questionário</strong>.
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

export default SeedQuiz;
