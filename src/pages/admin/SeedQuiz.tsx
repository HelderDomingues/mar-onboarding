
import React, { useState } from "react";
import { seedQuizData } from '@/scripts/seed-quiz';
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, BookCheck, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";

/**
 * Página administrativa para inicializar os dados do questionário MAR
 */
const SeedQuiz = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSeedQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await seedQuizData();
      
      if (result) {
        setIsComplete(true);
        toast({
          title: "Sucesso!",
          description: "Os dados do questionário MAR foram importados com sucesso.",
          variant: "default"
        });
      } else {
        throw new Error("Não foi possível importar os dados do questionário. Verifique os logs para mais detalhes.");
      }
    } catch (err) {
      console.error("Erro ao importar dados:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido ao importar dados");
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao importar os dados do questionário.",
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
          <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Inicializar Questionário MAR</h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookCheck className="h-5 w-5 text-primary" />
                  Importar Dados do Questionário
                </CardTitle>
                <CardDescription>
                  Esta ferramenta importará todos os módulos, perguntas e opções do questionário MAR para o banco de dados.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                      Esta ação irá limpar os dados existentes de opções e perguntas do questionário antes de importar os novos dados.
                      Certifique-se de que você deseja realmente executar esta operação.
                    </AlertDescription>
                  </Alert>
                  
                  {isComplete && (
                    <Alert variant="success" className="bg-green-50 border-green-300">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Importação Concluída</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Todos os dados do questionário MAR foram importados com sucesso.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro ao importar dados</AlertTitle>
                      <AlertDescription>
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={handleSeedQuiz} 
                  disabled={isLoading || isComplete}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando Dados...
                    </>
                  ) : isComplete ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Dados Importados
                    </>
                  ) : (
                    "Iniciar Importação"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SeedQuiz;
