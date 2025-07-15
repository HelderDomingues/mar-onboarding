
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { QuizReviewComponent } from "@/components/quiz/QuizReviewComponent";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { useToast } from "@/components/ui/use-toast";
import { completeQuizManually } from "@/utils/supabaseUtils";
import { logger } from "@/utils/logger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatQuizAnswers } from "@/utils/quizDataUtils";
import { SystemError } from "@/types/errors";
import { formatError, formatErrorForDisplay, formatTechnicalError } from "@/utils/errorUtils";

const QuizReviewPage = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<SystemError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Revisão do Questionário | MAR - Crie Valor";
    
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchQuizData();
    }
  }, [isAuthenticated, user]);

  const fetchQuizData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      logger.info('Buscando dados do questionário para revisão', {
        tag: 'Quiz',
        data: { userId: user.id }
      });
      
      const { data: modulesData, error: modulesError } = await supabase
        .from('quiz_modules')
        .select('*')
        .order('order_number');

      if (modulesError) {
        throw formatError(modulesError, 'fetchQuizData.modules');
      }
      
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('order_number');

      if (questionsError) {
        throw formatError(questionsError, 'fetchQuizData.questions');
      }
      
      const { data: optionsData, error: optionsError } = await supabase
        .from('quiz_options')
        .select('*')
        .order('order_number');

      if (optionsError) {
        throw formatError(optionsError, 'fetchQuizData.options');
      }
      
      // Fetch answers with simplified approach to avoid type recursion
      let answersData: any[] = [];
      let answersError: any = null;
      
      try {
        const rawResponse = await supabase.from('quiz_answers').select('*').eq('user_id', user.id);
        answersData = rawResponse.data || [];
        answersError = rawResponse.error;
      } catch (error) {
        answersError = error;
      }

      if (answersError) {
        throw formatError(answersError, 'fetchQuizData.answers');
      }
      
      const questionsWithOptions = questionsData.map(question => {
        const options = optionsData?.filter(opt => opt.question_id === question.id) || [];
        return { ...question, options } as unknown as QuizQuestion;
      });
      
      const processedAnswers: Record<string, string | string[]> = {};
      
      if (answersData && answersData.length > 0) {
        answersData.forEach(ans => {
          if (ans.answer !== null && ans.answer !== undefined) {
            const questionType = questionsWithOptions.find(q => q.id === ans.question_id)?.type || 
                              questionsWithOptions.find(q => q.id === ans.question_id)?.question_type;
            
            try {
              if (questionType === 'checkbox' || (ans.answer.startsWith('[') && ans.answer.endsWith(']'))) {
                try {
                  const parsed = JSON.parse(ans.answer);
                  processedAnswers[ans.question_id] = Array.isArray(parsed) ? parsed : [ans.answer];
                } catch (e) {
                  if (ans.answer.includes(',') && !ans.answer.includes('{') && !ans.answer.includes('"')) {
                    processedAnswers[ans.question_id] = ans.answer.split(',').map(item => item.trim());
                  } else {
                    processedAnswers[ans.question_id] = ans.answer;
                  }
                }
              } else {
                processedAnswers[ans.question_id] = ans.answer;
              }
            } catch (e) {
              processedAnswers[ans.question_id] = ans.answer;
            }
          } else {
            processedAnswers[ans.question_id] = "";
          }
        });
      }
      
      logger.info('Dados do questionário carregados com sucesso', {
        tag: 'Quiz',
        data: { 
          modulesCount: modulesData?.length || 0,
          questionsCount: questionsData?.length || 0,
          answersCount: answersData?.length || 0
        }
      });
      
      const formattedAnswers = formatQuizAnswers(processedAnswers);
      
      setModules(modulesData as unknown as QuizModule[]);
      setQuestions(questionsWithOptions);
      setAnswers(formattedAnswers);
      setError(null);
    } catch (error: any) {
      const formattedError = formatError(error, 'QuizReview.fetchQuizData');
      
      logger.error("Erro ao buscar dados do questionário:", {
        tag: 'Quiz',
        data: formattedError
      });
      
      setError(formatErrorForDisplay(formattedError));
      
      toast({
        title: "Erro",
        description: formatErrorForDisplay(formattedError),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user || isCompleting) return;
    
    setIsCompleting(true);
    setCompletionError(null);
    
    try {
      logger.info('Iniciando processo de conclusão do questionário', {
        tag: 'Quiz',
        data: { userId: user.id, userEmail: user.email }
      });
      
      if (!user.email) {
        throw formatError({
          message: "Email do usuário não encontrado", 
          code: "EMAIL_NOT_FOUND",
          details: "O email do usuário é necessário para finalizar o questionário",
        }, 'QuizReview.handleComplete');
      }
      
      const result = await completeQuizManually(user.id);
      
      if (result.success) {
        logger.info('Questionário completado com sucesso', {
          tag: 'Quiz',
          userId: user.id,
          data: { method: result.method }
        });
        
        toast({
          title: "Sucesso!",
          description: "Questionário concluído com sucesso!",
        });
        
        navigate('/dashboard');
      } else {
        throw result.error || formatError("Não foi possível completar o questionário", 'QuizReview.handleComplete');
      }
    } catch (error: any) {
      const formattedError = formatError(error, 'QuizReview.handleComplete');
      
      logger.error("Erro ao finalizar questionário:", {
        tag: 'Quiz',
        data: formattedError
      });
      
      setCompletionError(formattedError);
      
      toast({
        title: "Erro ao finalizar questionário",
        description: formatErrorForDisplay(formattedError),
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleEditQuestion = (moduleIndex: number, questionIndex: number) => {
    navigate(`/quiz?module=${modules[moduleIndex].id}&question=${questions.filter(q => q.module_id === modules[moduleIndex].id)[questionIndex].id}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <DashboardHeader isAdmin={isAdmin} />
        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <p className="text-slate-600">Carregando dados do questionário...</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <DashboardHeader isAdmin={isAdmin} />
        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Alert variant="destructive" className="mb-4 mx-auto max-w-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao carregar dados</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            
            <button 
              onClick={fetchQuizData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (completionError) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <DashboardHeader isAdmin={isAdmin} />
        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao finalizar questionário</AlertTitle>
              <AlertDescription>
                Não foi possível finalizar o questionário devido a um erro.
              </AlertDescription>
            </Alert>
            
            <div className="p-4 bg-red-900/30 border border-red-600/40 rounded-md text-sm text-white mt-4">
              <h4 className="font-semibold text-red-200 mb-2">Detalhes técnicos do erro:</h4>
              <div className="space-y-2 text-xs font-mono bg-black/30 p-3 rounded overflow-auto max-h-64">
                {completionError.message && <p><strong>Mensagem:</strong> {completionError.message}</p>}
                {completionError.code && <p><strong>Código:</strong> {completionError.code}</p>}
                {completionError.origin && <p><strong>Origem:</strong> {completionError.origin}</p>}
                {completionError.hint && <p><strong>Dica:</strong> {completionError.hint}</p>}
                {completionError.details && (
                  <p><strong>Detalhes:</strong> {
                    typeof completionError.details === 'object' 
                      ? JSON.stringify(completionError.details, null, 2) 
                      : completionError.details
                  }</p>
                )}
                {completionError.context && <p><strong>Contexto:</strong> {completionError.context}</p>}
                <pre className="whitespace-pre-wrap mt-2 text-slate-100">
                  {JSON.stringify(completionError, null, 2)}
                </pre>
              </div>
              <p className="mt-3 text-xs text-red-200">
                Por favor capture uma screenshot desta mensagem e envie para o suporte técnico.
              </p>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
              <button 
                onClick={() => setCompletionError(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Voltar para revisão
              </button>
              <button 
                onClick={handleComplete}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
        <QuizReviewComponent
          modules={modules}
          questions={questions}
          answers={answers}
          onComplete={handleComplete}
          onEdit={handleEditQuestion}
        />
      </div>
      
      <SiteFooter />
    </div>
  );
};

export default QuizReviewPage;
