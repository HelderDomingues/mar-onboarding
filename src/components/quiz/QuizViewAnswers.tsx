
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { QuizQuestion, QuizModule } from "@/types/quiz";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, MessageSquare, Mail } from "lucide-react";

export function QuizViewAnswers() {
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const { user } = useAuth();

  // Buscar dados do questionário
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Buscar módulos
        const { data: modulesData, error: modulesError } = await supabase
          .from('quiz_modules')
          .select('*')
          .order('order_number', { ascending: true });
          
        if (modulesError) throw modulesError;
        
        // Buscar perguntas
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('order_number', { ascending: true });
          
        if (questionsError) throw questionsError;
        
        // Buscar respostas do usuário
        const { data: answersData, error: answersError } = await supabase
          .from('quiz_answers')
          .select('question_id, answer_value')
          .eq('user_id', user.id);
          
        if (answersError) throw answersError;
        
        // Formatar as respostas em um objeto
        const answersObject: Record<string, any> = {};
        answersData?.forEach(item => {
          try {
            answersObject[item.question_id] = JSON.parse(item.answer_value);
          } catch (e) {
            answersObject[item.question_id] = item.answer_value;
          }
        });
        
        // Converter os tipos das perguntas para compatibilidade com QuizQuestion
        const typedQuestions = questionsData.map(q => ({
          ...q,
          type: convertQuestionType(q.type)
        })) as QuizQuestion[];
        
        setModules(modulesData || []);
        setQuestions(typedQuestions);
        setAnswers(answersObject);
      } catch (error) {
        console.error("Erro ao buscar dados do questionário:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [user]);
  
  // Função para converter tipos de string para os tipos específicos do QuizQuestion
  const convertQuestionType = (type: string): QuizQuestion['type'] => {
    switch (type) {
      case 'text': return 'text';
      case 'textarea': return 'textarea';
      case 'checkbox': return 'checkbox';
      case 'radio': return 'radio';
      case 'select': return 'select';
      case 'number': return 'number';
      case 'email': return 'email';
      case 'url': return 'url';
      case 'instagram': return 'instagram';
      default: return 'text'; // Fallback para text como padrão
    }
  };
  
  // Agrupar questões por módulo
  const questionsByModule = modules.map(module => ({
    module,
    questions: questions.filter(q => q.module_id === module.id)
  }));
  
  // Formatar a resposta para exibição
  const formatAnswer = (question: QuizQuestion, answer: any) => {
    if (answer === undefined || answer === null) {
      return <span className="text-slate-400 italic">Não respondido</span>;
    }
    
    if (question.type === 'checkbox' && Array.isArray(answer)) {
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {answer.map((option, index) => (
            <Badge key={index} variant="outline" className="bg-blue-50">
              {option}
            </Badge>
          ))}
        </div>
      );
    }
    
    if (typeof answer === 'string' && answer.startsWith('http')) {
      return (
        <a 
          href={answer} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline break-all"
        >
          {answer}
        </a>
      );
    }
    
    return <div className="break-words">{answer}</div>;
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (questionsByModule.length === 0 || Object.keys(answers).length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-6">
            <h3 className="text-lg font-medium mb-2">Nenhuma resposta encontrada</h3>
            <p className="text-slate-600 mb-4">
              Você ainda não respondeu ao questionário MAR ou houve um problema ao carregar suas respostas.
            </p>
            <Button onClick={() => window.location.href = "/quiz"}>
              Ir para o Questionário
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Suas Respostas</h2>
          <p className="text-slate-600 text-sm">
            Respostas enviadas no questionário MAR
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>
      
      <Accordion type="single" collapsible defaultValue="module-0" className="w-full">
        {questionsByModule.map((moduleData, index) => (
          <AccordionItem key={moduleData.module.id} value={`module-${index}`} className="border rounded-lg mb-4 overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2 py-1 px-2 bg-blue-50 text-blue-800 border-blue-100">
                  Módulo {index + 1}
                </Badge>
                <span className="font-medium text-slate-800">{moduleData.module.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4 pt-2 pb-4">
                {moduleData.questions.map((question) => (
                  <div key={question.id} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-medium text-slate-800 mb-2">{question.text}</h4>
                    {answers[question.id] !== undefined ? (
                      <div className="text-slate-700 pl-4 border-l-2 border-slate-200">
                        {formatAnswer(question, answers[question.id])}
                      </div>
                    ) : (
                      <div className="text-slate-400 italic pl-4 border-l-2 border-slate-200">
                        Não respondido
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <Card className="border bg-blue-50 border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-800">Precisa de ajuda?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 mb-4">
            Se você tiver dúvidas sobre suas respostas ou quiser discutir os resultados,
            entre em contato com nossa equipe.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="mailto:contato@crievalor.com.br">
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Enviar Email</span>
              </Button>
            </a>
            <a href="https://wa.me/5567999999999" target="_blank" rel="noreferrer">
              <Button variant="outline" className="flex items-center gap-2 border-blue-200 bg-white">
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
