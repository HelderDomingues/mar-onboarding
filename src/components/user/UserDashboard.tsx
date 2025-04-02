
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, BarChart, CheckCircle, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizSubmission } from "@/types/quiz";
import { Progress } from "@/components/ui/progress";

interface UserDashboardProps {
  submission: QuizSubmission | null;
}

export function UserDashboard({ submission }: UserDashboardProps) {
  const navigate = useNavigate();
  
  // Calcular progresso se tiver submissão
  const progress = submission ? 
    (submission.completed ? 100 : (submission.current_module / 8) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bem-vindo à sua Área MAR</h1>
        <p className="text-gray-600 mb-6">Acesse o Mapa para Alto Rendimento e acompanhe seu progresso.</p>
      </div>
      
      {/* Card principal do questionário */}
      <Card className="shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Questionário MAR</CardTitle>
              <CardDescription>Mapa para Alto Rendimento</CardDescription>
            </div>
            {submission?.completed && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Concluído
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {submission ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {submission.completed ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Questionário finalizado em {new Date(submission.completed_at || '').toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Você pode revisar suas respostas ou consultar os resultados a qualquer momento.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Clock className="h-4 w-4" />
                    <span>Em progresso - Módulo {submission.current_module} de 8</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Continue de onde parou para completar seu questionário MAR.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>25 questões distribuídas em 8 módulos</span>
              </div>
              <p className="text-sm text-muted-foreground">
                O questionário MAR irá mapear seu nível atual e ajudá-lo a identificar oportunidades de crescimento.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex gap-3">
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => navigate("/quiz")}
          >
            {submission?.completed ? "Ver Respostas" : (submission ? "Continuar" : "Iniciar Questionário")}
          </Button>
          
          {submission?.completed && (
            <Button 
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/10"
              onClick={() => navigate("/quiz/review")}
            >
              Ver Resultados
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Cards inferiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Resultados e Análises
            </CardTitle>
            <CardDescription>Acompanhe sua evolução</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Visualize análises e insights baseados em suas respostas ao questionário MAR.
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              className="w-full border-primary text-primary hover:bg-primary/10"
              disabled={!submission?.completed}
            >
              Ver Análises
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Materiais Exclusivos
            </CardTitle>
            <CardDescription>Recursos para membros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Acesse conteúdos exclusivos, materiais complementares e recursos para aprofundar seus conhecimentos.
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              className="w-full border-primary text-primary hover:bg-primary/10"
            >
              Acessar Materiais
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
