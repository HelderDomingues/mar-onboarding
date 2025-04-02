
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizSubmission } from "@/types/quiz";

interface UserDashboardProps {
  submission: QuizSubmission | null;
}

export function UserDashboard({ submission }: UserDashboardProps) {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Bem-vindo à sua Área MAR</h1>
        <p className="text-gray-600 mb-6">Acesse o questionário MAR - Mapa para Alto Rendimento abaixo.</p>
      </div>
      
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
      </div>
    </div>
  );
}
