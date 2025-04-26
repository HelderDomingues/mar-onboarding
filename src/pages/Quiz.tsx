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
import { loadQuizModules, loadQuizQuestions, mapQuestionsWithOptions, loadQuestionOptions } from "@/utils/quizDataUtils";
import { QuizModule, QuizQuestion, QuizAnswer, QuizSubmission } from "@/types/quiz";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { isQuizComplete } from "@/utils/supabaseUtils";
import { formatJsonAnswer } from "@/utils/formatUtils";

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
  const [dataFetched, setDataFetched] = useState(false);

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
        logger.info("Verificando status do questionário", {
          tag: 'Quiz',
          data: { userId: user.id }
        });
        
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
        logger.error("Erro ao verificar status do questionário", {
          tag: 'Quiz',
          data: { userId: user.id, error }
        });
      }
    };
    
    if (user) {
      checkQuizStatus();
    }
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
      
      logger.info('Módulos carregados com sucesso', {
        tag: 'Quiz',
        data: { count: modulesData.length }
      });
      
      setModules(modulesData);
      
      const questionsData = await loadQuizQuestions();
      if (!questionsData) {
        throw new Error("Erro ao carregar perguntas do questionário.");
      }
      
      logger.info("Questões carregadas com sucesso", {
        tag: 'Quiz',
        data: { count: questionsData.length }
      });
      
      setQuestions(questionsData);
      
      const firstModule = modulesData[0];
      const firstModuleQuestions = questionsData.filter(q => q.module_id === firstModule.id);
      
      logger.info("Perguntas do primeiro módulo:", {
        tag: 'Quiz',
        data: { count: firstModuleQuestions.length }
      });
      
      setCurrentModuleIndex(0);
      setModuleQuestions(firstModuleQuestions);
      setCurrentQuestionIndex(0);
      
      if (moduleParam && modulesData.some(m => m.id === moduleParam)) {
        const moduleIndex = modulesData.findIndex(m => m.id === moduleParam);
        if (moduleIndex >= 0) {
          setCurrentModuleIndex(moduleIndex);
          const moduleQuestions = questionsData.filter(q => q.module_id === moduleParam);
          setModuleQuestions(moduleQuestions);
          
          if (questionParam) {
            const questionIndex = moduleQuestions.findIndex(q => q.id === questionParam);
            if (questionIndex >= 0) {
              setCurrentQuestionIndex(questionIndex);
            }
          }
        }
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
        logger.info("Submissão encontrada:", {
          tag: 'Quiz',
          data: { submissionId: submissionData.id }
        });
        
        const userSubmission = submissionData as unknown as QuizSubmission;
        setSubmission(userSubmission);
        
        const quizCompleted = userSubmission.completed === true;
        
        if (quizCompleted && !showAdmin && !forceMode && location.pathname === '/quiz' && !location.search) {
          navigate('/quiz/view-answers');
          return;
        } else if (userSubmission.current_module >= 8 && !showReview) {
          setShowReview(true);
        } else if (!moduleParam) {
          const moduleIndex = Math.max(0, userSubmission.current_module - 1);
          setCurrentModuleIndex(moduleIndex);
          
          if (modulesData[moduleIndex]) {
            const moduleQuestions = questionsData.filter(
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
          logger.error('Erro ao carregar respostas existentes', {
            tag: 'Quiz',
            data: { error: answersError }
          });
        }

        if (answersData && answersData.length > 0) {
          logger.info("Respostas encontradas:", {
            tag: 'Quiz',
            data: { count: answersData.length }
          });
          
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
          
          if (userSubmission.current_module >= 8 && !quizCompleted && !showReview) {
            setShowReview(true);
          }
        }
      } else {
        logger.info("Criando nova submissão para o usuário", {
          tag: 'Quiz',
          data: { userId: user.id }
        });
        
        const { data: newSubmission, error: createError } = await supabase
          .from('quiz_submissions')
          .insert([{
            user_id: user.id,
            current_module: 1,
            started_at: new Date().toISOString(),
            user_email: user.email
          }])
          .select();

        if (createError) {
          logger.error('Erro ao criar nova submissão', {
            tag: 'Quiz',
            data: { error: createError }
          });
          throw createError;
        }

        if (newSubmission && newSubmission.length > 0) {
          logger.info("Nova submissão criada com sucesso", {
            tag: 'Quiz',
            data: { submissionId: newSubmission[0].id }
          });
          setSubmission(newSubmission[0] as unknown as QuizSubmission);
        }
      }

      setLoadError(null);
      setDataFetched(true);
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
    if (isAuthenticated && user && !dataFetched) {
      console.log("Iniciando carregamento de dados...");
      fetchQuizData();
    } else if (!isAuthenticated) {
      console.log("Redirecionando para a página inicial (não autenticado)");
      navigate('/');
    }
  }, [isAuthenticated, user, dataFetched]);

  useEffect(() => {
    if (isAuthenticated && user && (moduleParam || questionParam)) {
      console.log("Recarregando dados devido a mudança de parâmetros da URL");
      fetchQuizData();
    }
  }, [moduleParam, questionParam]);

  const saveAnswer = async (questionId: string, answer: string | string[]) => {
    if (!user) return;
    try {
      logger.info('Tentando salvar resposta', {
        tag: 'Quiz',
        data: { questionId, userId: user.id }
      });
      
      const questionInfo = questions.find(q => q.id === questionId);
      if (!questionInfo) {
        throw new Error('Pergunta não encontrada');
      }
      
      const result = await saveQuizAnswer(user.id, questionId, answer, {
        question_text: questionInfo.text,
        module_id: questionInfo.module_id,
        type: questionInfo.type
      });
      
      if (!result.success) {
        throw result.error;
      }
      
      logger.info('Resposta salva com sucesso', {
        tag: 'Quiz',
        data: { questionId }
      });
    } catch (error: any) {
      logger.error('Erro ao salvar resposta', {
        tag: 'Quiz',
        data: { questionId, error }
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
        current_module: moduleNumber,
        user_email: user.email
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
        user_email: user.email
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
            {isLoading ? (
              <div className="text-center p-8 animate-pulse">
                <h2 className="text-2xl font-bold text-white mb-4">Carregando questionário...</h2>
                <p className="text-slate-300">
                  Por favor, aguarde enquanto preparamos o questionário para você.
                </p>
              </div>
            ) : loadError ? (
              <QuizConfigurationPanel
                isLoading={false}
                loadError={loadError}
                onRefresh={fetchQuizData}
                isAdmin={showAdmin}
              />
            ) : hasQuizData ? (
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
                isLoading={false}
                loadError="Nenhum dado do questionário foi encontrado. Tente novamente."
                onRefresh={fetchQuizData}
                isAdmin={showAdmin}
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
