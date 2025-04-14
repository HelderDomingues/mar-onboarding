import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, File, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { processQuizAnswersToSimplified } from "@/utils/supabaseUtils";
import { downloadQuizPDF, downloadQuizCSV } from "@/utils/pdfGenerator";
import { logger } from "@/utils/logger";
import { formatJsonAnswer } from "@/utils/formatUtils";
export function QuizViewAnswers() {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [answers, setAnswers] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);

        // Buscar informações dos módulos primeiro
        const {
          data: modulesData,
          error: modulesError
        } = await supabase.from('quiz_modules').select('id, title, order_number').order('order_number');
        if (modulesError) {
          throw modulesError;
        }
        setModules(modulesData || []);

        // Buscar diretamente da tabela quiz_answers
        const {
          data: answersData,
          error: answersError
        } = await supabase.from('quiz_answers').select('question_id, question_text, answer, module_id, module_title, module_number').eq('user_id', user.id);
        if (answersError) {
          throw answersError;
        }

        // Buscar submissão
        const {
          data: submissionData,
          error: submissionError
        } = await supabase.from('quiz_submissions').select('*').eq('user_id', user.id).maybeSingle();
        if (submissionError) {
          throw submissionError;
        }

        // Adicionar títulos de módulos às respostas, utilizando os dados obtidos
        const processedAnswers = answersData.map(answer => {
          // Se não tiver título ou número do módulo, buscar dos módulos carregados
          if (!answer.module_title || !answer.module_number) {
            const module = modulesData?.find(m => m.id === answer.module_id);
            if (module) {
              answer.module_title = module.title;
              answer.module_number = module.order_number;
            }
          }
          return answer;
        });
        logger.info('Respostas do questionário carregadas', {
          tag: 'Quiz',
          data: {
            userId: user.id,
            answersCount: processedAnswers.length,
            hasSubmission: !!submissionData
          }
        });
        setAnswers(processedAnswers);
        setSubmission(submissionData);
      } catch (error) {
        console.error("Erro ao buscar respostas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas respostas.",
          variant: "destructive"
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
        data: {
          userId: user.id
        }
      });
      await downloadQuizPDF(user.id, user.email || 'usuário');
      logger.info('PDF de respostas gerado e baixado com sucesso', {
        tag: 'Quiz'
      });
    } catch (error) {
      logger.error('Erro ao gerar PDF:', {
        tag: 'Quiz',
        data: {
          error
        }
      });
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive"
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
        data: {
          userId: user.id
        }
      });
      await downloadQuizCSV(user.id, user.email || 'usuário');
      logger.info('CSV de respostas gerado e baixado com sucesso', {
        tag: 'Quiz'
      });
    } catch (error) {
      logger.error('Erro ao gerar CSV:', {
        tag: 'Quiz',
        data: {
          error
        }
      });
      toast({
        title: "Erro ao gerar CSV",
        description: "Não foi possível gerar o arquivo CSV.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };
  if (isLoading) {
    return <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>;
  }
  if (!answers || answers.length === 0) {
    return <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma resposta encontrada</h3>
          <p className="text-gray-500 mb-6">Você ainda não completou o questionário MAR.</p>
          <Button onClick={() => window.location.href = '/quiz'}>
            Ir para o Questionário <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>;
  }

  // Agrupar respostas por módulo
  const modulePattern = /module_(\d+)/;
  const answersByModule: Record<string, any[]> = {};
  answers.forEach(answer => {
    const moduleNum = answer.module_number;
    if (moduleNum) {
      if (!answersByModule[moduleNum]) {
        answersByModule[moduleNum] = [];
      }
      answersByModule[moduleNum].push(answer);
    } else {
      const match = answer.question_id.match(modulePattern);
      if (match) {
        const moduleNum = match[1];
        if (!answersByModule[moduleNum]) {
          answersByModule[moduleNum] = [];
        }
        answersByModule[moduleNum].push(answer);
      }
    }
  });

  // Função auxiliar para buscar título do módulo
  const getModuleTitle = (moduleNumber: string) => {
    const moduleData = modules.find(m => m.order_number === parseInt(moduleNumber));
    return moduleData?.title || '';
  };
  return <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <Card>
        <CardHeader className="bg-sky-900 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-slate-300">Confira Suas Respostas Aqui</CardTitle>
              <CardDescription className="text-slate-300">
                Questionário MAR - {submission?.completed_at ? new Date(submission.completed_at).toLocaleDateString('pt-BR') : 'Em andamento'}
              </CardDescription>
            </div>
            
            {submission?.completed && <Badge variant="secondary" className="text-green-800 bg-lime-400">
                Completado
              </Badge>}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full divide-y">
            {Object.keys(answersByModule).sort((a, b) => parseInt(a) - parseInt(b)).map(moduleKey => {
            const moduleTitle = getModuleTitle(moduleKey);
            return <AccordionItem value={`module-${moduleKey}`} key={moduleKey}>
                  <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                    <span className="font-medium">
                      Módulo {moduleKey}{moduleTitle ? ` - ${moduleTitle}` : ''}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-2">
                    <div className="space-y-4 my-2">
                      {answersByModule[moduleKey].map((answer, index) => <div key={answer.question_id} className="border-b border-gray-100 pb-4 last:border-none">
                          
                          <p className="text-sm mb-2 font-semibold mx-[11px]">{answer.question_text}</p>
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            {formatJsonAnswer(answer.answer)}
                          </div>
                        </div>)}
                    </div>
                  </AccordionContent>
                </AccordionItem>;
          })}
          </Accordion>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6 rounded-lg bg-gray-500">
          
          
          <Button onClick={handleDownloadPDF} disabled={downloading} className="text-slate-50 bg-red-700 hover:bg-red-600 text-center">
            <File className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </CardFooter>
      </Card>
    </div>;
}