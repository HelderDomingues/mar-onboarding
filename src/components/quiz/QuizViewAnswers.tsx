
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { FileText, ChevronLeft, FileSpreadsheet, Download, Printer } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export const QuizViewAnswers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Buscar módulos
        const { data: modulesData, error: modulesError } = await supabase
          .from('quiz_modules')
          .select('*')
          .order('order_number');
          
        if (modulesError) throw modulesError;
        
        // Buscar questões
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('order_number');
          
        if (questionsError) throw questionsError;
        
        // Buscar opções
        const { data: optionsData, error: optionsError } = await supabase
          .from('quiz_options')
          .select('*')
          .order('order_number');
          
        if (optionsError) throw optionsError;
        
        // Buscar respostas do usuário
        const { data: answersData, error: answersError } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('user_id', user.id);
          
        if (answersError) throw answersError;
        
        setModules(modulesData || []);
        setQuestions(questionsData || []);
        setOptions(optionsData || []);
        setAnswers(answersData || []);
      } catch (error: any) {
        console.error('Erro ao buscar dados do questionário:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do questionário",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, [user, toast]);
  
  const getAnswerForQuestion = (questionId: string) => {
    return answers.find(answer => answer.question_id === questionId)?.answer || '';
  };
  
  const getOptionsForQuestion = (questionId: string) => {
    return options.filter(option => option.question_id === questionId);
  };
  
  const formatAnswer = (question: any, answerValue: string) => {
    if (!answerValue) return 'Não respondido';
    
    switch (question.type) {
      case 'radio':
      case 'select': {
        const option = getOptionsForQuestion(question.id).find(opt => opt.id === answerValue);
        return option ? option.text : answerValue;
      }
      case 'checkbox': {
        try {
          const selectedOptions = JSON.parse(answerValue);
          if (Array.isArray(selectedOptions) && selectedOptions.length > 0) {
            const optionTexts = selectedOptions.map(optId => {
              const option = getOptionsForQuestion(question.id).find(opt => opt.id === optId);
              return option ? option.text : optId;
            });
            return optionTexts.join(', ');
          }
          return 'Nenhuma opção selecionada';
        } catch (e) {
          return answerValue;
        }
      }
      default:
        return answerValue;
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (modules.length === 0 || questions.length === 0) {
    return (
      <Card className="my-8 bg-white shadow-md border-0">
        <CardHeader>
          <CardTitle>Questionário não encontrado</CardTitle>
          <CardDescription>
            Não foi possível encontrar as perguntas do questionário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Tente novamente mais tarde ou entre em contato com o suporte.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/dashboard')}>Voltar para o Dashboard</Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (answers.length === 0) {
    return (
      <Card className="my-8 bg-white shadow-md border-0">
        <CardHeader>
          <CardTitle>Nenhuma resposta encontrada</CardTitle>
          <CardDescription>
            Você ainda não respondeu ao questionário MAR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Complete o questionário para visualizar suas respostas.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/quiz')}>Iniciar Questionário</Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Ver Diagnóstico
          </Button>
        </div>
      </div>
      
      <Card className="bg-white shadow-md border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardTitle className="text-2xl">Suas Respostas ao Questionário MAR</CardTitle>
          <CardDescription className="text-blue-100">
            Abaixo estão todas as suas respostas ao questionário Mapa para Alto Rendimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800">
              <p className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Importante:</span> As respostas do questionário não podem ser alteradas após a conclusão.
                Se precisar atualizar alguma informação, entre em contato com nossa equipe de suporte.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {modules.map(module => {
                // Filtrar questões deste módulo
                const moduleQuestions = questions.filter(q => q.module_id === module.id);
                
                return (
                  <AccordionItem key={module.id} value={module.id} className="border border-slate-200 rounded-lg mb-4 overflow-hidden">
                    <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline px-4 hover:bg-slate-50 data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700">
                      Módulo {module.order_number}: {module.title}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2 px-4">
                      <div className="space-y-6">
                        {module.description && (
                          <div className="text-slate-600 bg-slate-50 p-4 rounded-md">
                            {module.description}
                          </div>
                        )}
                        
                        {moduleQuestions.map((question, qIndex) => (
                          <div key={question.id} className="border border-slate-200 rounded-md p-5 bg-white">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-slate-800">
                                {module.order_number}.{question.order_number}. {question.text}
                              </h4>
                            </div>
                            
                            {question.hint && (
                              <p className="text-sm text-slate-500 mt-1 italic">
                                {question.hint}
                              </p>
                            )}
                            
                            <Separator className="my-4" />
                            
                            <div className="space-y-1">
                              <div className="text-sm text-slate-500">Sua resposta:</div>
                              <div className="font-medium text-slate-700 p-3 bg-blue-50 rounded-md">
                                {formatAnswer(question, getAnswerForQuestion(question.id))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6 p-6 bg-slate-50">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
          <Link to="/quiz/review">
            <Button>
              Ver Resultados
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
