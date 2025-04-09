import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizModule, QuizQuestion, QuizOption } from "@/types/quiz";
import { logger } from "@/utils/logger";

export function QuizViewAnswers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        logger.info('Buscando dados para exibir respostas do questionário', {
          tag: 'QuizAnswers',
          data: { userId: user.id }
        });
        
        // Buscar módulos
        const { data: modulesData, error: modulesError } = await supabase
          .from('quiz_modules')
          .select('*')
          .order('order_number');
        
        if (modulesError) throw modulesError;
        
        // Buscar perguntas com opções
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('order_number');
          
        if (questionsError) throw questionsError;
        
        const { data: optionsData, error: optionsError } = await supabase
          .from('quiz_options')
          .select('*')
          .order('order_number');
          
        if (optionsError) throw optionsError;
        
        // Buscar respostas do usuário
        const { data: answersData, error: answersError } = await supabase
          .from('quiz_answers')
          .select('question_id, answer')
          .eq('user_id', user.id);
          
        if (answersError) throw answersError;
        
        // Processar dados
        const questionsWithOptions: QuizQuestion[] = questionsData.map(question => {
          // Garantir que o tipo seja um dos valores aceitos pela interface QuizQuestion
          const validType = validateQuestionType(question.type);
          
          const options = optionsData?.filter(opt => opt.question_id === question.id) || [];
          return { 
            ...question, 
            type: validType,
            options: options as QuizOption[] 
          };
        });
        
        const answerMap: Record<string, string | string[]> = {};
        
        if (answersData) {
          answersData.forEach(answer => {
            const questionType = questionsWithOptions.find(q => q.id === answer.question_id)?.type;
            
            if (questionType === 'checkbox' && answer.answer) {
              try {
                answerMap[answer.question_id] = JSON.parse(answer.answer);
              } catch (e) {
                answerMap[answer.question_id] = answer.answer || '';
              }
            } else {
              answerMap[answer.question_id] = answer.answer || '';
            }
          });
        }
        
        setModules(modulesData);
        setQuestions(questionsWithOptions);
        setAnswers(answerMap);
        
        if (modulesData.length > 0) {
          setExpandedModule(modulesData[0].id);
        }
        
        logger.info('Dados carregados com sucesso', {
          tag: 'QuizAnswers',
          data: { 
            modulesCount: modulesData.length, 
            questionsCount: questionsWithOptions.length,
            answersCount: Object.keys(answerMap).length
          }
        });
      } catch (error: any) {
        logger.error('Erro ao buscar dados do questionário', {
          tag: 'QuizAnswers',
          data: error
        });
        
        toast({
          title: "Erro ao carregar respostas",
          description: "Não foi possível carregar suas respostas. Por favor, tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [user, toast]);

  const validateQuestionType = (type: string): QuizQuestion['type'] => {
    const validTypes: QuizQuestion['type'][] = ['text', 'number', 'email', 'radio', 'checkbox', 'textarea', 'select', 'url', 'instagram'];
    return validTypes.includes(type as any) ? (type as QuizQuestion['type']) : 'text';
  };

  const renderAnswer = (question: QuizQuestion, answer: string | string[]) => {
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      return <span className="text-gray-400 italic">Não respondido</span>;
    }

    if (question.type === 'checkbox' && Array.isArray(answer)) {
      return (
        <ul className="list-disc ml-5 space-y-1">
          {answer.map((option, idx) => {
            const optionText = question.options?.find(opt => opt.id === option)?.text || option;
            return <li key={idx}>{optionText}</li>;
          })}
        </ul>
      );
    } else if (question.type === 'radio') {
      const optionText = question.options?.find(opt => opt.id === answer)?.text || answer;
      return <span>{optionText}</span>;
    } else if (question.type === 'textarea') {
      return <div className="whitespace-pre-wrap">{answer}</div>;
    } else if (question.type === 'instagram') {
      return (
        <a 
          href={`https://instagram.com/${answer}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          @{answer}
        </a>
      );
    } else if (question.type === 'url') {
      return (
        <a 
          href={answer.toString()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {answer}
        </a>
      );
    }

    return <span>{answer}</span>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {modules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Não foram encontradas respostas para o questionário.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion 
          type="single" 
          collapsible 
          value={expandedModule || undefined}
          onValueChange={(value) => setExpandedModule(value)}
        >
          {modules.map((module) => {
            const moduleQuestions = questions.filter(q => q.module_id === module.id);
            
            return (
              <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-1 mb-4">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-lg">Módulo {module.order_number}: {module.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-6">
                    {moduleQuestions.length === 0 ? (
                      <p className="text-gray-500 italic">Não há perguntas neste módulo.</p>
                    ) : (
                      moduleQuestions.map((question) => (
                        <div key={question.id} className="space-y-2">
                          <h4 className="font-medium text-gray-800">{question.text}</h4>
                          <div className="pl-4 pb-2 pt-1 border-l-2 border-gray-200">
                            {renderAnswer(question, answers[question.id] || '')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
