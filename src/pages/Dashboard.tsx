
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, BarChart, DatabaseIcon } from "lucide-react";
import { seedQuizData } from "@/scripts/seed-quiz";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface QuizSubmission {
  id: string;
  current_module: number;
  completed: boolean;
  completed_at: string | null;
}

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      try {
        // Verificar se o usuário é admin
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        if (!error && data) {
          setIsAdmin(true);
        }
        
        // Buscar submissão atual
        const { data: submissionData, error: submissionError } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!submissionError && submissionData) {
          setSubmission(submissionData);
        }
      } catch (error) {
        logger.error('Erro ao verificar papel do usuário', { tag: 'Dashboard', data: error });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkUserRole();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleSeedData = async () => {
    if (!isAdmin) return;
    
    setIsSeeding(true);
    try {
      const result = await seedQuizData();
      
      if (result) {
        toast({
          title: "Dados inseridos com sucesso",
          description: "Os dados do questionário foram inseridos no banco de dados.",
        });
      } else {
        toast({
          title: "Erro ao inserir dados",
          description: "Ocorreu um erro ao inserir os dados do questionário.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao inserir dados",
        description: error.message || "Ocorreu um erro ao inserir os dados do questionário.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <QuizHeader />
        <main className="flex-1 container py-8 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-quiz"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <QuizHeader />
      
      <main className="flex-1 container max-w-5xl py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo à sua Área MAR</h1>
        <p className="text-gray-600 mb-8">Acesse o questionário MAR - Mapa para Alto Rendimento abaixo.</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Questionário MAR</CardTitle>
              <CardDescription>Mapa para Alto Rendimento</CardDescription>
            </CardHeader>
            <CardContent>
              {submission ? (
                submission.completed ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Questionário concluído</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span>Em progresso - Módulo {submission.current_module}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>Retomar questionário</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>25 questões em 8 módulos</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-quiz hover:bg-quiz-dark"
                onClick={() => navigate("/quiz")}
              >
                {submission?.completed ? "Ver Respostas" : (submission ? "Continuar" : "Iniciar Questionário")}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Resultados Anteriores</CardTitle>
              <CardDescription>Revise suas submissões anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart className="h-4 w-4" />
                <span>Visualize análises e insights</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full border-quiz text-quiz hover:bg-quiz/10"
                disabled={!submission?.completed}
              >
                Ver Resultados
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Materiais para Membros</CardTitle>
              <CardDescription>Recursos adicionais e guias</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Acesse recursos exclusivos e materiais complementares para membros.
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full border-quiz text-quiz hover:bg-quiz/10"
              >
                Acessar Materiais
              </Button>
            </CardFooter>
          </Card>
          
          {isAdmin && (
            <Card className="hover:shadow-md transition-shadow col-span-full bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DatabaseIcon className="h-5 w-5" /> 
                  Área do Administrador
                </CardTitle>
                <CardDescription>Ferramentas administrativas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Estas opções estão disponíveis apenas para administradores do sistema.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleSeedData}
                    disabled={isSeeding}
                    className="flex items-center gap-2"
                  >
                    {isSeeding ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></span>
                        Inserindo dados...
                      </>
                    ) : (
                      <>
                        <DatabaseIcon className="h-4 w-4" /> 
                        Inserir Dados do Questionário
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
