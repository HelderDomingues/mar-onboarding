
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizModule, QuizQuestion, QuizAnswer } from "@/types/quiz";
import { Separator } from "@/components/ui/separator";
import { FileText, Mail, MessageSquare, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuizViewAnswers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{[key: string]: string | string[]}>({});
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Verificar se o questionário está completo
        const { data: submissionData, error: submissionError } = await supabase
          .from('quiz_submissions')
          .select('completed')
          .eq('user_id', user.id)
          .single();
          
        if (submissionError) {
          console.error("Erro ao verificar submissão:", submissionError);
          return;
        }
        
        setIsSubmissionComplete(submissionData?.completed || false);
        
        // Buscar módulos
        const { data: modulesData, error: modulesError } = await supabase
          .from('quiz_modules')
          .select('*')
          .order('order_number');
          
        if (modulesError) {
          console.error("Erro ao buscar módulos:", modulesError);
          return;
        }
        
        setModules(modulesData);
        
        // Buscar questões
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('order_number');
          
        if (questionsError) {
          console.error("Erro ao buscar questões:", questionsError);
          return;
        }
        
        setQuestions(questionsData);
        
        // Buscar respostas do usuário
        const { data: answersData, error: answersError } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('user_id', user.id);
          
        if (answersError) {
          console.error("Erro ao buscar respostas:", answersError);
          return;
        }
        
        const formattedAnswers: {[key: string]: string | string[]} = {};
        if (answersData) {
          answersData.forEach(answer => {
            try {
              const parsed = JSON.parse(answer.answer || '');
              if (Array.isArray(parsed)) {
                formattedAnswers[answer.question_id] = parsed;
              } else {
                formattedAnswers[answer.question_id] = answer.answer || '';
              }
            } catch (e) {
              formattedAnswers[answer.question_id] = answer.answer || '';
            }
          });
        }
        
        setAnswers(formattedAnswers);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderAnswerValue = (question: QuizQuestion, answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }
    
    if (question.type === "option" && question.options) {
      const option = question.options.find(opt => opt.id === answer);
      return option ? option.text : answer;
    }
    
    return answer;
  };

  const moduleQuestions = (moduleId: string) => {
    return questions.filter(q => q.module_id === moduleId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-md border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <CardTitle className="text-2xl">Suas Respostas do Questionário MAR</CardTitle>
          </div>
          <CardDescription className="text-blue-100">
            Veja abaixo as respostas que você enviou para o Mapa para Alto Rendimento
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {isSubmissionComplete ? (
            <div className="space-y-8">
              {modules.map(module => (
                <div key={module.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {module.order_number}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">{module.title}</h3>
                  </div>
                  
                  <div className="pl-10 space-y-4">
                    {moduleQuestions(module.id).map(question => (
                      <div key={question.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <h4 className="font-medium text-slate-800 mb-2">{question.text}</h4>
                        <div className="bg-gray-50 p-3 rounded text-slate-700">
                          {answers[question.id] ? 
                            renderAnswerValue(question, answers[question.id]) : 
                            <span className="text-slate-400 italic">Sem resposta</span>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {module !== modules[modules.length - 1] && (
                    <Separator className="my-6" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">Você ainda não completou o questionário MAR.</p>
              <Button 
                onClick={() => navigate("/quiz")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continuar Questionário
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t p-6 bg-gray-50 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 w-full">
            <Button 
              variant="default" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate("/dashboard")}
            >
              Voltar ao Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/quiz/review")}
            >
              Ver Análises e Resultados
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-3 text-slate-800">Precisa de ajuda com suas respostas?</h4>
            <div className="flex flex-wrap gap-3">
              <a href="mailto:contato@crievalor.com.br">
                <Button variant="outline" size="sm" className="flex gap-2">
                  <Mail className="h-4 w-4" />
                  <span>E-mail</span>
                </Button>
              </a>
              
              <a href="https://wa.me/5567999999999" target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="flex gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </Button>
              </a>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
