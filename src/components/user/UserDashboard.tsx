import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle, AlertCircle, Clock, BookOpen, LineChart, MessageSquare, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizSubmission } from "@/types/quiz";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SiteFooter } from "@/components/layout/SiteFooter";

interface UserDashboardProps {
  submission: QuizSubmission | null;
}

export function UserDashboard({
  submission
}: UserDashboardProps) {
  const navigate = useNavigate();
  const progress = submission ? submission.completed ? 100 : submission.current_module / 8 * 100 : 0;

  const getMainActionButton = () => {
    if (!submission) {
      return {
        text: "Iniciar Questionário",
        action: () => navigate("/quiz"),
        variant: "default" as const
      };
    }
    if (submission.completed) {
      return {
        text: "Ver Minhas Respostas",
        action: () => navigate("/quiz/view-answers"),
        variant: "default" as const
      };
    }
    if (progress === 100 && !submission.completed) {
      return {
        text: "Finalizar Questionário",
        action: () => navigate("/quiz"),
        variant: "default" as const
      };
    }
    return {
      text: "Continuar Questionário",
      action: () => navigate("/quiz"),
      variant: "default" as const
    };
  };

  const mainAction = getMainActionButton();

  return <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Bem-vindo à sua Área de Membro MAR</h1>
        <p className="text-slate-600 max-w-3xl mx-auto md:mx-0">Acesse o Mapa para Alto Rendimento e acompanhe seu progresso para dar clareza aos caminhos da sua empresa.</p>
      </div>

      <div className="space-y-8">
        <Card className="border-0 shadow-md rounded-xl overflow-hidden bg-gradient-to-br from-blue-800 to-indigo-900 text-white">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full font-medium text-sm w-fit mb-4">
              <div className="bg-blue-500 p-1 rounded-full">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
              Comece Aqui
            </div>
            
            <h3 className="text-2xl font-bold mb-4">Bem-vindo ao programa MAR</h3>
            
            <p className="text-blue-100 mb-6">
              Parabéns por dar este importante passo para transformar os resultados da sua empresa! O Mapa para Alto Rendimento é um programa completo que vai guiar você através de estratégias desenvolvidas especialmente para você. Se é o seu primeiro acesso, assista o vídeo de introdução e depois responda o questionário.
              
              Caso tenha alguma dúvida, sinta-se à vontade para contatar nossa equipe. Os canais de atendimento estão no final da página. 
              
              Também temos uma seção com materiais exclusivos para você. É só acessar a página e fazer o download do material escolhido. 
              
              Vamos iniciar sua jornada?
            </p>
            
            <div className="mb-6">
              <AspectRatio ratio={16 / 9} className="bg-slate-100 rounded-lg overflow-hidden mb-4">
                <iframe src="https://www.youtube.com/embed/Lr_L7MAIUnM" title="Vídeo de Introdução ao MAR" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" className="w-full h-full object-cover" />
              </AspectRatio>
              <h4 className="font-medium text-white mt-2">Vídeo de Introdução ao MAR</h4>
              <p className="text-blue-100 text-sm">
                Assista este vídeo para entender como funciona o programa e quais são os próximos passos.
              </p>
            </div>
            
            <Separator className="bg-white/20 my-6" />
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-blue-500/30 p-1.5 rounded-full text-white">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <p className="text-sm text-blue-100">
                  Responda ao questionário diagnóstico para receber sua análise personalizada
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-blue-500/30 p-1.5 rounded-full text-white">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <p className="text-sm text-blue-100">
                  Receba seu relatório MAR com estratégias personalizadas para o seu negócio
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-blue-500/30 p-1.5 rounded-full text-white">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <p className="text-sm text-blue-100">
                  Acesse materiais exclusivos desenvolvidos para a sua jornada de transformação
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all rounded-xl bg-white">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Questionário MAR</h3>
                <p className="text-blue-100 mt-1">Mapa para Alto Rendimento</p>
              </div>
              {submission?.completed && <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Concluído
                </div>}
            </div>
          </div>
          <CardContent className="pt-6 px-8">
            {submission ? <>
                <div className="mb-5">
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Progresso</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2.5 bg-gray-100" indicatorClassName={submission.completed ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-blue-400 to-blue-600"} />
                </div>
                
                {submission.completed ? <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Questionário finalizado em {new Date(submission.completed_at || '').toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-slate-600">
                      Você pode revisar suas respostas ou consultar os resultados a qualquer momento.
                    </p>
                    
                    <Alert className="bg-blue-50 border-blue-100 text-blue-800 mt-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700">
                        O questionário MAR já foi validado e não pode ser alterado. Se precisar atualizar alguma informação, entre em contato com nossa equipe.
                      </AlertDescription>
                    </Alert>
                  </div> : progress === 100 ? <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Clock className="h-4 w-4" />
                      <span>Módulo 8 de 8 completo - Finalize seu questionário</span>
                    </div>
                    <p className="text-slate-600">
                      Todas as perguntas foram respondidas! Agora você precisa revisar e validar suas respostas para concluir o questionário.
                    </p>
                    <Alert className="bg-amber-50 border-amber-100 text-amber-800 mt-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-700">
                        Por favor, revise e confirme suas respostas para finalizar o questionário e receber sua análise personalizada.
                      </AlertDescription>
                    </Alert>
                  </div> : <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Clock className="h-4 w-4" />
                      <span>Em progresso - Módulo {submission.current_module} de 11</span>
                    </div>
                    <p className="text-slate-600">
                      Continue de onde parou para completar seu questionário MAR.
                    </p>
                  </div>}
              </> : <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BookOpen className="h-4 w-4" />
                  <span>50 questões distribuídas em 10 módulos rápidos.</span>
                </div>
                <p className="text-slate-600">
                  O questionário MAR irá mapear seu nível atual e ajudá-lo a identificar oportunidades de crescimento.
                </p>
              </div>}
          </CardContent>
          <CardFooter className="border-t p-6 px-8 bg-gray-50">
            <div className="w-full flex flex-wrap gap-3">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:translate-y-[-2px]" onClick={mainAction.action}>
                {mainAction.text}
              </Button>
              
              {submission?.completed && <Button variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg" onClick={() => navigate("/quiz/review")}>
                  Ver Resultados
                </Button>}
            </div>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md rounded-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2 text-white">
              <LineChart className="h-5 w-5" />
              Materiais Exclusivos
            </CardTitle>
            <CardDescription className="text-purple-100">Recursos para membros</CardDescription>
          </CardHeader>
          <CardContent className="pt-5 px-6">
            <p className="text-slate-600 mb-4">
              Acesse conteúdos exclusivos, materiais complementares e recursos para aprofundar seus conhecimentos.
            </p>
            <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg" onClick={() => navigate("/materials")}>
              Acessar Materiais
            </Button>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md rounded-xl">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-purple-300 text-white">
            <CardTitle className="flex items-center gap-2 text-white">
              <HelpCircle className="h-5 w-5" />
              Tem dúvidas? Veja o FAQ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 px-6">
            <p className="text-slate-600 mb-4">
              Encontre respostas para as dúvidas mais comuns sobre o programa MAR.
            </p>
            <Button onClick={() => navigate("/faq")} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
              Ver Perguntas Frequentes
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md rounded-xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
            <CardTitle className="flex items-center gap-2 text-white">
              <HelpCircle className="h-5 w-5" />
              Precisa de Ajuda?
            </CardTitle>
            <CardDescription className="text-emerald-100 mt-1">
              Fale com a gente
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
                <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">WhatsApp</h3>
                <p className="text-sm text-slate-500 mb-4 h-12">
                  Atendimento rápido via WhatsApp
                </p>
                <a href="https://wa.me/5567996542991" target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                    (67) 99654-2991
                  </Button>
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:translate-y-[-2px]">
                <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">WhatsApp (SC)</h3>
                <p className="text-sm text-slate-500 mb-4 h-12">
                  Atendimento pelo WhatsApp em Santa Catarina
                </p>
                <a href="https://wa.me/554799215-0289" target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                    (47) 99215-0289
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}
