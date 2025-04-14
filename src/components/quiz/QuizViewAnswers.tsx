
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, File, ArrowRight } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { processQuizAnswersToSimplified } from "@/utils/supabaseUtils";
import { downloadQuizPDF, downloadQuizCSV } from "@/utils/pdfGenerator";
import { logger } from "@/utils/logger";

// Função auxiliar para formatar respostas JSON
const formatJsonAnswer = (answer) => {
  if (!answer) return "Sem resposta";
  
  try {
    // Verifica se é uma resposta em formato JSON (array)
    if (answer.startsWith('[') && answer.endsWith(']')) {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }
    }
    return answer;
  } catch (e) {
    // Se não conseguir fazer o parse, retorna a resposta original
    return answer;
  }
};

export function QuizViewAnswers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<any[]>([]);
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const result = await processQuizAnswersToSimplified(user.id);
        
        if (result) {
          setAnswers(result.answers || []);
          setSubmission(result.submission || null);
        }
      } catch (error) {
        console.error("Erro ao buscar respostas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas respostas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  const handleDownloadPDF = async () => {
    if (!user || !user.id) return;
    
    try {
      setDownloading(true);
      logger.info('Iniciando download do PDF de respostas', { 
        tag: 'Quiz',
        data: { userId: user.id }
      });
      
      await downloadQuizPDF(user.id, user.email || 'usuário');
      
      logger.info('PDF de respostas gerado e baixado com sucesso', { 
        tag: 'Quiz' 
      });
    } catch (error) {
      logger.error('Erro ao gerar PDF:', { 
        tag: 'Quiz',
        data: { error }
      });
      
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };
  
  const handleDownloadCSV = async () => {
    if (!user || !user.id) return;
    
    try {
      setDownloading(true);
      logger.info('Iniciando download do CSV de respostas', { 
        tag: 'Quiz',
        data: { userId: user.id }
      });
      
      await downloadQuizCSV(user.id, user.email || 'usuário');
      
      logger.info('CSV de respostas gerado e baixado com sucesso', { 
        tag: 'Quiz' 
      });
    } catch (error) {
      logger.error('Erro ao gerar CSV:', { 
        tag: 'Quiz',
        data: { error }
      });
      
      toast({
        title: "Erro ao gerar CSV",
        description: "Não foi possível gerar o arquivo CSV.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  if (!answers || answers.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma resposta encontrada</h3>
          <p className="text-gray-500 mb-6">Você ainda não completou o questionário MAR.</p>
          <Button onClick={() => window.location.href = '/quiz'}>
            Ir para o Questionário <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  const modulePattern = /module_(\d+)/;
  const answersByModule: Record<string, any[]> = {};
  
  answers.forEach(answer => {
    const match = answer.question_id.match(modulePattern);
    if (match) {
      const moduleNum = match[1];
      if (!answersByModule[moduleNum]) {
        answersByModule[moduleNum] = [];
      }
      answersByModule[moduleNum].push(answer);
    }
  });
  
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <Card>
        <CardHeader className="bg-primary/5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">Suas Respostas</CardTitle>
              <CardDescription>
                Questionário MAR - {submission?.completed_at 
                  ? new Date(submission.completed_at).toLocaleDateString('pt-BR') 
                  : 'Em andamento'}
              </CardDescription>
            </div>
            
            {submission?.is_complete && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                Completado
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full divide-y">
            {Object.keys(answersByModule).sort((a, b) => parseInt(a) - parseInt(b)).map((moduleKey) => (
              <AccordionItem value={`module-${moduleKey}`} key={moduleKey}>
                <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                  <span className="font-medium">Módulo {moduleKey}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-2">
                  <div className="space-y-4 my-2">
                    {answersByModule[moduleKey].map((answer, index) => (
                      <div key={answer.question_id} className="border-b border-gray-100 pb-4 last:border-none">
                        <h4 className="font-medium text-sm text-slate-700 mb-1">
                          Pergunta {index + 1}
                        </h4>
                        <p className="text-sm mb-2">{answer.question_text}</p>
                        <div className="bg-blue-50 p-3 rounded text-sm">
                          {formatJsonAnswer(answer.answer)}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
          <Button 
            variant="outline" 
            onClick={handleDownloadCSV}
            disabled={downloading}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          
          <Button 
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            <File className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
