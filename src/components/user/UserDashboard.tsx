
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, BarChart, CheckCircle, LineChart, Phone, Mail, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizSubmission } from "@/types/quiz";
import { Progress } from "@/components/ui/progress";
import { GetStartedSection } from "@/components/onboarding/GetStartedSection";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserDashboardProps {
  submission: QuizSubmission | null;
}

export function UserDashboard({ submission }: UserDashboardProps) {
  const navigate = useNavigate();
  
  // Calcular progresso se tiver submissão
  const progress = submission ? 
    (submission.completed ? 100 : (submission.current_module / 8) * 100) : 0;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Bem-vindo à sua Área MAR</h1>
        <p className="text-slate-600 max-w-3xl">Acesse o Mapa para Alto Rendimento e acompanhe seu progresso para transformar o marketing da sua empresa.</p>
      </div>

      {/* Seção "Comece Aqui" para novos usuários */}
      <GetStartedSection />
      
      {/* Card principal do questionário */}
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all rounded-xl bg-white">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white">Questionário MAR</h3>
              <p className="text-blue-100 mt-1">Mapa para Alto Rendimento</p>
            </div>
            {submission?.completed && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Concluído
              </div>
            )}
          </div>
        </div>
        <CardContent className="pt-6 px-8">
          {submission ? (
            <>
              <div className="mb-5">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Progresso</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2.5 bg-gray-100" 
                  indicatorClassName={submission.completed ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-blue-400 to-blue-600"} 
                />
              </div>
              
              {submission.completed ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Questionário finalizado em {new Date(submission.completed_at || '').toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-600">
                    Você pode revisar suas respostas ou consultar os resultados a qualquer momento.
                  </p>
                  
                  {/* Alerta informando que o questionário não pode ser alterado */}
                  <Alert className="bg-blue-50 border-blue-100 text-blue-800 mt-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      O questionário MAR já foi validado e não pode ser alterado. Se precisar atualizar alguma informação, entre em contato com nossa equipe.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Clock className="h-4 w-4" />
                    <span>Em progresso - Módulo {submission.current_module} de 8</span>
                  </div>
                  <p className="text-slate-600">
                    Continue de onde parou para completar seu questionário MAR.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BookOpen className="h-4 w-4" />
                <span>25 questões distribuídas em 8 módulos</span>
              </div>
              <p className="text-slate-600">
                O questionário MAR irá mapear seu nível atual e ajudá-lo a identificar oportunidades de crescimento.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-6 px-8 bg-gray-50">
          <div className="w-full flex flex-wrap gap-3">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:translate-y-[-2px]"
              onClick={() => navigate(submission?.completed ? "/quiz/view-answers" : "/quiz")}
            >
              {submission?.completed ? "Ver Minhas Respostas" : (submission ? "Continuar Questionário" : "Iniciar Questionário")}
            </Button>
            
            {submission?.completed && (
              <Button 
                variant="outline"
                className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg"
                onClick={() => navigate("/quiz/review")}
              >
                Ver Resultados
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Cards inferiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md rounded-xl overflow-hidden bg-white">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6">
            <CardTitle className="flex items-center gap-2 text-white">
              <LineChart className="h-5 w-5" />
              Resultados e Análises
            </CardTitle>
            <CardDescription className="text-purple-100 mt-1">Acompanhe sua evolução</CardDescription>
          </div>
          <CardContent className="pt-5 px-6">
            <div className="text-slate-600">
              Visualize análises e insights baseados em suas respostas ao questionário MAR.
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 p-5">
            <Button 
              variant="outline" 
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg"
              disabled={!submission?.completed}
              onClick={() => navigate("/quiz/review")}
            >
              Ver Análises
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-0 shadow-md rounded-xl overflow-hidden bg-white">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6">
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5" />
              Materiais Exclusivos
            </CardTitle>
            <CardDescription className="text-cyan-100 mt-1">Recursos para membros</CardDescription>
          </div>
          <CardContent className="pt-5 px-6">
            <div className="text-slate-600">
              Acesse conteúdos exclusivos, materiais complementares e recursos para aprofundar seus conhecimentos.
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 p-5">
            <Button 
              variant="outline" 
              className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50 rounded-lg"
              onClick={() => navigate("/member?tab=materials")}
            >
              Acessar Materiais
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Seção de Suporte */}
      <Card className="border-0 shadow-md rounded-xl overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <Phone className="h-5 w-5" />
            Precisa de ajuda?
          </CardTitle>
          <CardDescription className="text-emerald-100 mt-1">
            Estamos à disposição para ajudar
          </CardDescription>
        </div>
        <CardContent className="py-8 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:translate-y-[-2px]">
              <div className="rounded-full bg-emerald-100 w-12 h-12 flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-medium mb-2">Suporte por Email</h3>
              <p className="text-sm text-slate-500 mb-4 h-12">
                Envie sua dúvida e responderemos em até 24h úteis
              </p>
              <a href="mailto:contato@crievalor.com.br">
                <Button variant="outline" size="sm" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  contato@crievalor.com.br
                </Button>
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:translate-y-[-2px]">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">Atendimento Telefônico</h3>
              <p className="text-sm text-slate-500 mb-4 h-12">
                Segunda a sexta, das 9h às 18h
              </p>
              <a href="tel:+5511912345678">
                <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                  (11) 91234-5678
                </Button>
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:translate-y-[-2px]">
              <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium mb-2">Perguntas Frequentes</h3>
              <p className="text-sm text-slate-500 mb-4 h-12">
                Consulte nossa base de conhecimento
              </p>
              <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                Acessar FAQ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
