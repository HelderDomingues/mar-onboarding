
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface GetStartedSectionProps {
  hasStartedQuiz: boolean;
  hasCompletedQuiz: boolean;
}

export const GetStartedSection: React.FC<GetStartedSectionProps> = ({
  hasStartedQuiz,
  hasCompletedQuiz
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-blue-800">Comece Aqui</CardTitle>
        <CardDescription>
          Siga os passos abaixo para aproveitar ao máximo o Sistema MAR
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {!hasCompletedQuiz && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium text-lg flex items-center">
                {hasStartedQuiz ? (
                  <span className="inline-block w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center mr-2">
                    1
                  </span>
                ) : (
                  <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
                    1
                  </span>
                )}
                Complete o Questionário MAR
              </h3>
              
              <p className="mt-2 text-muted-foreground">
                O Mapa para Alto Rendimento (MAR) ajuda a identificar pontos fortes e oportunidades de melhoria na sua estratégia de marketing. O questionário leva aproximadamente 15 minutos para ser respondido.
              </p>
              
              <div className="mt-4 aspect-video rounded-md overflow-hidden bg-gray-100 relative">
                <video
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
                  controls
                >
                  <source src="#" type="video/mp4" />
                  Seu navegador não suporta a reprodução de vídeos.
                </video>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <PlayCircle className="h-16 w-16 text-white opacity-80" />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Link to="/quiz">
                  <Button>
                    {hasStartedQuiz ? "Continuar Questionário" : "Iniciar Questionário"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {hasCompletedQuiz && (
            <div className="bg-white rounded-lg border border-green-200 p-4">
              <h3 className="font-medium text-lg flex items-center">
                <span className="inline-block w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">
                  <CheckSquare className="h-3.5 w-3.5" />
                </span>
                Questionário MAR Completo
              </h3>
              
              <p className="mt-2 text-muted-foreground">
                Você já completou o Questionário MAR. Seus resultados estão sendo analisados pela nossa equipe e em breve você receberá seu diagnóstico personalizado.
              </p>
              
              <div className="mt-4 flex justify-end space-x-3">
                <Link to="/quiz/review">
                  <Button variant="outline">
                    Ver Resultados
                  </Button>
                </Link>
                
                <Link to="/quiz">
                  <Button variant="secondary">
                    Revisar Respostas
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium text-lg flex items-center">
              <span className="inline-block w-6 h-6 rounded-full bg-gray-600 text-white flex items-center justify-center mr-2">
                2
              </span>
              Complete seu Perfil
            </h3>
            
            <p className="mt-2 text-muted-foreground">
              Mantenha suas informações atualizadas para receber conteúdos personalizados e acesso completo aos recursos exclusivos do sistema.
            </p>
            
            <div className="mt-4 flex justify-end">
              <Link to="/member">
                <Button variant="outline">
                  Acessar Perfil
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium text-lg flex items-center">
              <span className="inline-block w-6 h-6 rounded-full bg-gray-600 text-white flex items-center justify-center mr-2">
                3
              </span>
              Explore Materiais Exclusivos
            </h3>
            
            <p className="mt-2 text-muted-foreground">
              Acesse conteúdos exclusivos, materiais complementares e recursos para aprofundar seus conhecimentos e impulsionar seus resultados.
            </p>
            
            <div className="mt-4 flex justify-end">
              <Link to="/member?tab=materials">
                <Button variant="outline">
                  Ver Materiais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-blue-50 rounded-b-lg flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Precisa de ajuda? Entre em contato com nossa equipe de suporte
        </p>
        <Button variant="link" className="text-primary">
          Fale Conosco
        </Button>
      </CardFooter>
    </Card>
  );
};
