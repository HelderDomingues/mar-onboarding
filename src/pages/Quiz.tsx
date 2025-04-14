import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuizComplete } from "@/components/quiz/QuizComplete";
import { QuizConfigurationPanel } from "@/components/quiz/QuizConfigurationPanel";
import { QuizContent } from "@/components/quiz/QuizContent";
import { QuizSuccess } from "@/components/quiz/QuizSuccess";
import { useToast } from "@/components/ui/use-toast";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { loadQuizModules, loadQuizQuestions, mapQuestionsWithOptions } from "@/utils/quizDataUtils";
import { QuizModule, QuizQuestion, QuizAnswer, QuizSubmission } from "@/types/quiz";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { isQuizComplete } from "@/utils/supabaseUtils";

interface AnswerMap {
  [key: string]: string | string[];
}

const Quiz = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const queryParams = new URLSearchParams(location.search);
  const adminParam = queryParams.get('admin');
  const moduleParam = queryParams.get('module');
  const questionParam = queryParams.get('question');
  const forceMode = queryParams.get('mode');
  
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [moduleQuestions, setModuleQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user && isAdmin) {
        setShowAdmin(adminParam === 'true');
      } else {
        setShowAdmin(false);
      }
    };
    
    checkAdmin();
  }, [user, adminParam, isAdmin]);

  useEffect(() => {
    const checkQuizStatus = async () => {
      if (!user) return;
      
      try {
        const completed = await isQuizComplete(user.id);
        console.log("Status do questionário:", completed ? "Completo" : "Incompleto");
        
        if (completed && !forceMode && !showAdmin) {
          setIsComplete(true);
          
          if (forceMode === 'review') {
            setShowReview(true);
          } else if (location.pathname === '/quiz' && !location.search) {
            navigate('/quiz/view-answers');
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status do questionário:", error);
      }
    };
    
    checkQuizStatus();
  }, [user, navigate, location, showAdmin, forceMode]);

  const fetchQuizData = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setIsLoading(true);
      logger.info('Iniciando carregamento de dados do questionário', {
        tag: 'Quiz',
        data: { userId: user.id }
      });
      
      const modulesData = await loadQuizModules();
      if (!modulesData || modulesData.length === 0) {
        throw new Error("Nenhum módulo de questionário encontrado.");
      }
      
      setModules(modulesData);
      
      const questionsData = await loadQuizQuestions();
      if (!questionsData) {
        throw new Error("Erro ao carregar perguntas do questionário.");
      }
      
      const questionsWithOptions = mapQuestionsWithOptions(questionsData);
      setQuestions(questionsWithOptions);
      
      if (moduleParam && modulesData.some(m => m.id === moduleParam)) {
        const moduleIndex = modulesData.findIndex(m => m.id === moduleParam);
        if (moduleIndex >= 0) {
          setCurrentModuleIndex(moduleIndex);
          const moduleQuestions = questionsWithOptions.filter(q => q.module_id === moduleParam);
          setModuleQuestions(moduleQuestions);
          
          if (questionParam) {
            const questionIndex = moduleQuestions.findIndex(q => q.id === questionParam);
            if (questionIndex >= 0) {
              setCurrentQuestionIndex(questionIndex);
            }
          }
        }
      } else if (modulesData.length > 0) {
        const firstModuleQuestions = questionsWithOptions.filter(
          q => q.module_id === modulesData[0].id
        );
        setModuleQuestions(firstModuleQuestions);
      }
      
      const { data: submissionData, error: submissionError } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (submissionError && submissionError.code !== "PGRST116") {
        logger.error('Erro ao buscar submissão do quiz', {
          tag: 'Quiz',
          data: submissionError
        });
      }

      if (submissionData) {
        const userSubmission = submissionData as unknown as QuizSubmission;
        setSubmission(userSubmission);
        
        if (userSubmission.completed) {
          setIsComplete(true);
          
          if (!showAdmin && !forceMode && location.pathname === '/quiz' && !location.search) {
            navigate('/quiz/view-answers');
            return;
          }
        } else if (userSubmission.current_module >= 8 && !showReview) {
          setShowReview(true);
        } else if (!moduleParam) {
          const moduleIndex = Math.max(0, userSubmission.current_module - 1);
          setCurrentModuleIndex(moduleIndex);
          
          if (modulesData[moduleIndex]) {
            const moduleQuestions = questions.filter(
              q => q.module_id === modulesData[moduleIndex].id
            );
            setModuleQuestions(moduleQuestions);
          }
        }

        const { data: answersData, error: answersError } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('user_id', user.id);

        if (answersError) {
          throw answersError;
        }

        if (answersData) {
          const loadedAnswers: AnswerMap = {};
          answersData.forEach(ans => {
            try {
              if (ans.answer) {
                try {
                  const parsed = JSON.parse(ans.answer);
                  loadedAnswers[ans.question_id] = parsed;
                } catch (e) {
                  loadedAnswers[ans.question_id] = ans.answer;
                }
              }
            } catch (e) {
              loadedAnswers[ans.question_id] = ans.answer || '';
            }
          });
          setAnswers(loadedAnswers);
          
          if (userSubmission.current_module >= 8 && !userSubmission.completed && !showReview) {
            setShowReview(true);
          }
        }
      } else {
        const { data: newSubmission, error: createError } = await supabase
          .from('quiz_submissions')
          .insert([{
            user_id: user.id,
            current_module: 1,
            started_at: new Date().toISOString()
          }])
          .select();

        if (createError) {
          throw createError;
        }

        if (newSubmission && newSubmission.length > 0) {
          setSubmission(newSubmission[0] as unknown as QuizSubmission);
        }
      }

      setLoadError(null);
    } catch (error: any) {
      logger.error('Erro ao carregar dados do questionário', {
        tag: 'Quiz',
        data: error
      });
      setLoadError(error.message || "Não foi possível carregar os dados do questionário.");
      toast({
        title: "Erro ao carregar questionário",
        description: error.message || "Não foi possível carregar os dados do questionário.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchQuizData();
    } else if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, user, moduleParam, questionParam]);

  const saveAnswer = async (questionId: string, answer: string | string[]) => {
    if (!user) return;
    try {
      let answerValue = typeof answer === 'string' ? answer : JSON.stringify(answer);
      const {
        error
      } = await supabase.from('quiz_answers').upsert([{
        user_id: user.id,
        question_id: questionId,
        answer: answerValue
      }], {
        onConflict: 'user_id,question_id'
      });
      if (error) throw error;
      logger.info('Resposta salva com sucesso', {
        tag: 'Quiz',
        data: {
          questionId
        }
      });
    } catch (error: any) {
      logger.error('Erro ao salvar resposta', {
        tag: 'Quiz',
        data: {
          questionId,
          error
        }
      });
      toast({
        title: "Erro ao salvar resposta",
        description: "Não foi possível salvar sua resposta. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  const updateCurrentModule = async (moduleNumber: number) => {
    if (!user || !submission) return;
    try {
      const {
        error
      } = await supabase.from('quiz_submissions').update({
        current_module: moduleNumber
      }).eq('user_id', user.id);
      if (error) throw error;
      logger.info('Progresso do módulo atualizado', {
        tag: 'Quiz',
        data: {
          moduleNumber
        }
      });
    } catch (error: any) {
      logger.error('Erro ao atualizar progresso', {
        tag: 'Quiz',
        data: error
      });
    }
  };

  const completeQuiz = async () => {
    if (!user || !submission) return;
    try {
      logger.info('Tentando completar o questionário', {
        tag: 'Quiz',
        data: { userId: user.id }
      });
      
      const { error } = await supabaseAdmin.from('quiz_submissions').update({
        completed: true,
        completed_at: new Date().toISOString(),
        contact_consent: true
      }).eq('user_id', user.id);
      
      if (error) throw error;
      
      logger.info('Questionário marcado como concluído com sucesso', {
        tag: 'Quiz',
        data: { userId: user.id }
      });
      
      setIsComplete(true);
      setShowSuccess(true);
    } catch (error: any) {
      logger.error('Erro ao completar questionário', {
        tag: 'Quiz',
        data: error
      });
      toast({
        title: "Erro ao finalizar questionário",
        description: "Não foi possível registrar a conclusão do questionário. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    saveAnswer(questionId, answer);
  };

  const handleNext = async () => {
    if (currentQuestionIndex < moduleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      if (currentModuleIndex < modules.length - 1) {
        const nextModuleIndex = currentModuleIndex + 1;
        const nextModule = modules[nextModuleIndex];
        await updateCurrentModule(nextModule.order_number);
        const nextModuleQuestions = questions.filter(q => q.module_id === nextModule.id);
        setCurrentModuleIndex(nextModuleIndex);
        setModuleQuestions(nextModuleQuestions);
        setCurrentQuestionIndex(0);
        window.scrollTo(0, 0);
      } else {
        setShowReview(true);
        window.scrollTo(0, 0);
        await updateCurrentModule(8);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    } else if (currentModuleIndex > 0) {
      const prevModuleIndex = currentModuleIndex - 1;
      const prevModule = modules[prevModuleIndex];
      const prevModuleQuestions = questions.filter(q => q.module_id === prevModule.id);
      setCurrentModuleIndex(prevModuleIndex);
      setModuleQuestions(prevModuleQuestions);
      setCurrentQuestionIndex(prevModuleQuestions.length - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleEditQuestion = (moduleIndex: number, questionIndex: number) => {
    setShowReview(false);
    setCurrentModuleIndex(moduleIndex);
    
    const moduleId = modules[moduleIndex].id;
    const moduleQuestions = questions.filter(q => q.module_id === moduleId);
    setModuleQuestions(moduleQuestions);
    
    setCurrentQuestionIndex(questionIndex);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    document.title = "Questionário MAR | Crie Valor";
    
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (isComplete && !showAdmin && !forceMode && !showSuccess) {
    navigate('/quiz/view-answers');
    return null;
  }

  const hasQuizData = modules.length > 0 && moduleQuestions.length > 0;
  const isFirstQuestion = currentModuleIndex === 0 && currentQuestionIndex === 0;
  const isLastQuestion = currentModuleIndex === modules.length - 1 && currentQuestionIndex === moduleQuestions.length - 1;

  return (
    <div className="min-h-screen flex flex-col quiz-container">
      <DashboardHeader isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        {showSuccess ? (
          <QuizSuccess />
        ) : !isComplete ? (
          <>
            {hasQuizData ? (
              <QuizContent
                currentModule={modules[currentModuleIndex]}
                moduleQuestions={moduleQuestions}
                currentQuestionIndex={currentQuestionIndex}
                onAnswer={handleAnswer}
                onNext={handleNext}
                onPrev={handlePrevious}
                isFirst={isFirstQuestion}
                isLast={isLastQuestion}
                currentAnswers={answers}
                totalModules={modules.length}
                currentModuleIndex={currentModuleIndex}
                showReview={showReview}
                onReviewComplete={completeQuiz}
                onEditQuestion={handleEditQuestion}
                allModules={modules}
                allQuestions={questions}
                isAdmin={showAdmin}
              />
            ) : (
              <QuizConfigurationPanel
                isLoading={isLoading}
                loadError={loadError}
                onRefresh={fetchQuizData}
                isAdmin={showAdmin}
                modules={modules}
                questions={questions}
              />
            )}
          </>
        ) : (
          <QuizSuccess />
        )}
      </main>
      
      <SiteFooter />
    </div>
  );
};

export default Quiz;
