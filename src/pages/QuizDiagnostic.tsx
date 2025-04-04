
import React from "react";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, Download } from "lucide-react";
import { Link } from "react-router-dom";

const QuizDiagnostic = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col quiz-container">
      <QuizHeader isAdmin={false} />
      
      <main className="flex-1 container py-8 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Meu Diagnóstico</CardTitle>
              <CardDescription>
                Veja os resultados do seu diagnóstico de marketing e recomendações personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-4">Diagnóstico em processamento</h3>
                <p className="text-muted-foreground mb-6">
                  Seus resultados personalizados estarão disponíveis em breve.
                  Nossa equipe está analisando suas respostas para criar um diagnóstico personalizado.
                </p>
                <div className="flex justify-center gap-4">
                  <Link to="/quiz/answers">
                    <Button variant="outline" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Ver questionário
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Principais aspectos analisados</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500 p-1 mt-1">
                      <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    </div>
                    <span>Estratégia de marketing digital</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500 p-1 mt-1">
                      <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    </div>
                    <span>Performance em redes sociais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500 p-1 mt-1">
                      <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    </div>
                    <span>Posicionamento de marca</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500 p-1 mt-1">
                      <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    </div>
                    <span>Estratégia de conteúdo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500 p-1 mt-1">
                      <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    </div>
                    <span>Conversão e vendas</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Link to="/member">
                <Button variant="outline">Área do Membro</Button>
              </Link>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2" disabled>
                  <BarChart2 className="h-4 w-4" />
                  Ver Relatório
                </Button>
                <Button variant="outline" className="flex items-center gap-2" disabled>
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="py-4 border-t border-[hsl(var(--quiz-border))] text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default QuizDiagnostic;

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
