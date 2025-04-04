import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuizComplete } from "@/components/quiz/QuizComplete";
import { QuizConfigurationPanel } from "@/components/quiz/QuizConfigurationPanel";
import { QuizContent } from "@/components/quiz/QuizContent";
import { QuizSuccess } from "@/components/quiz/QuizSuccess";
import { useToast } from "@/components/ui/use-toast";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { QuizModule, QuizQuestion, QuizAnswer, QuizSubmission } from "@/types/quiz";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

interface AnswerMap {
  [key: string]: string | string[];
}

const Quiz = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const queryParams = new URLSearchParams(location.search);
  const adminParam = queryParams.get('admin');
  const moduleParam = queryParams.get('module');
  const questionParam = queryParams.get('question');
  
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const checkUserIsAdmin = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
        
      return !error && data;
    } catch (error) {
      logger.error('Erro ao verificar permissões de administrador', {
        tag: 'Quiz',
        data: error
      });
      return false;
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const userIsAdmin = await checkUserIsAdmin();
        setIsAdmin(userIsAdmin && adminParam === 'true');
      }
    };
    
    checkAdmin();
  }, [user, adminParam]);

  const fetchQuizData = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setIsLoading(true);
      
      const { data: modulesData, error: modulesError } = await supabase
        .from('quiz_modules')
        .select('*')
        .order('order_number');

      if (modulesError) {
        throw modulesError;
      }

      if (modulesData && modulesData.length > 0) {
        setModules(modulesData as unknown as QuizModule[]);

        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('order_number');

        if (questionsError) {
          throw questionsError;
        }

        if (questionsData) {
          const { data: optionsData, error: optionsError } = await supabase
            .from('quiz_options')
            .select('*')
            .order('order_number');

          if (optionsError) {
            throw optionsError;
          }

          const questionsWithOptions = questionsData.map(question => {
            const options = optionsData?.filter(opt => opt.question_id === question.id) || [];
            return { ...question, options } as unknown as QuizQuestion;
          });

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
        }

        const { data: submissionData, error: submissionError } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('user_id', user.id);

        if (submissionError) {
          logger.error('Erro ao buscar submissão do quiz', {
            tag: 'Quiz',
            data: submissionError
          });
        }

        if (submissionData && submissionData.length > 0) {
          const userSubmission = submissionData[0] as unknown as QuizSubmission;
          setSubmission(userSubmission);
          
          if (userSubmission.completed) {
            setIsComplete(true);
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
                const parsed = JSON.parse(ans.answer || '');
                if (Array.isArray(parsed)) {
                  loadedAnswers[ans.question_id] = parsed;
                } else {
                  loadedAnswers[ans.question_id] = ans.answer || '';
                }
              } catch (e) {
                loadedAnswers[ans.question_id] = ans.answer || '';
              }
            });
            setAnswers(loadedAnswers);
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
      } else {
        setLoadError("Nenhum módulo de questionário encontrado.");
      }
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
    fetchQuizData();
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

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (isComplete && !isAdmin && !showSuccess) {
    return <Navigate to="/quiz/view-answers" />;
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
                isAdmin={isAdmin}
              />
            ) : (
              <QuizConfigurationPanel
                isLoading={isLoading}
                loadError={loadError}
                onRefresh={fetchQuizData}
                isAdmin={isAdmin}
                modules={modules}
                questions={questions}
              />
            )}
          </>
        ) : (
          <QuizSuccess />
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
