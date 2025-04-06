
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { QuizReview as QuizReviewComponent } from "@/components/quiz/QuizReview";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { useToast } from "@/components/ui/use-toast";
import { completeQuizSubmission, sendQuizDataToWebhook } from "@/utils/supabaseUtils";
import { logger } from "@/utils/logger";

const QuizReviewPage = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
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

      if (modulesError) throw modulesError;
      
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
      
      const { data: answersData, error: answersError } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('user_id', user.id);

      if (answersError) throw answersError;
      
      const questionsWithOptions = questionsData.map(question => {
        const options = optionsData?.filter(opt => opt.question_id === question.id) || [];
        return { ...question, options } as unknown as QuizQuestion;
      });
      
      const processedAnswers: Record<string, string | string[]> = {};
      
      if (answersData && answersData.length > 0) {
        answersData.forEach(ans => {
          if (ans.answer !== null && ans.answer !== undefined) {
            const questionType = questionsWithOptions.find(q => q.id === ans.question_id)?.type;
            
            if (questionType === 'checkbox') {
              try {
                const parsed = JSON.parse(ans.answer);
                processedAnswers[ans.question_id] = Array.isArray(parsed) ? parsed : [ans.answer];
              } catch (e) {
                processedAnswers[ans.question_id] = ans.answer;
              }
            } else {
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
      
      setModules(modulesData as unknown as QuizModule[]);
      setQuestions(questionsWithOptions);
      setAnswers(processedAnswers);
      setError(null);
    } catch (error: any) {
      logger.error("Erro ao buscar dados do questionário:", {
        tag: 'Quiz',
        data: error
      });
      setError("Não foi possível carregar os dados do questionário. Por favor, tente novamente.");
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do questionário.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user || isCompleting) return;
    
    setIsCompleting(true);
    
    try {
      logger.info('Tentando completar o questionário', {
        tag: 'Quiz',
        data: { userId: user.id }
      });
      
      // Obter o ID da submissão atual para enviar para o webhook depois
      const { data: submissionData, error: submissionError } = await supabase
        .from('quiz_submissions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (submissionError) {
        logger.error('Erro ao obter ID da submissão do questionário', {
          tag: 'Quiz',
          data: submissionError
        });
        throw new Error('Erro ao obter ID da submissão do questionário');
      }
      
      if (!submissionData?.id) {
        throw new Error('Submissão do questionário não encontrada');
      }
      
      // Completar o questionário usando a função utilitária aprimorada
      const success = await completeQuizSubmission(user.id);
      
      if (!success) {
        throw new Error("Não foi possível completar o questionário");
      }
      
      logger.info('Questionário finalizado com sucesso', {
        tag: 'Quiz',
        data: { userId: user.id, submissionId: submissionData.id }
      });
      
      // Tentar enviar os dados para o webhook
      try {
        const webhookSuccess = await sendQuizDataToWebhook(submissionData.id);
        
        if (webhookSuccess) {
          logger.info('Dados enviados para webhook com sucesso', {
            tag: 'Quiz',
            data: { submissionId: submissionData.id }
          });
        } else {
          // Não falhar todo o processo se o webhook falhar
          logger.warn('O webhook falhou, mas o questionário foi finalizado com sucesso', {
            tag: 'Quiz',
            data: { submissionId: submissionData.id }
          });
        }
      } catch (webhookError) {
        // Não falhar todo o processo se o webhook falhar
        logger.error('Erro ao enviar dados para webhook, mas questionário foi finalizado', {
          tag: 'Quiz',
          data: webhookError
        });
      }
      
      toast({
        title: "Sucesso!",
        description: "Questionário concluído com sucesso!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      logger.error("Erro ao finalizar questionário:", {
        tag: 'Quiz',
        data: error
      });
      
      toast({
        title: "Erro ao finalizar questionário",
        description: "Não foi possível registrar a conclusão do questionário. Por favor, tente novamente.",
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
            <h2 className="text-xl font-bold text-red-600 mb-2">Erro ao carregar dados</h2>
            <p className="text-slate-600 mb-4">{error}</p>
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
