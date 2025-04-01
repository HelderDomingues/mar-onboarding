import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuestionCard, Question } from "@/components/quiz/QuestionCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizComplete } from "@/components/quiz/QuizComplete";
import { SeedButton } from "@/components/quiz/SeedButton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { QuizModule, QuizQuestion, QuizOption, QuizAnswer, QuizSubmission } from "@/types/quiz";

interface AnswerMap {
  [key: string]: string | string[];
}

const Quiz = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
          
          if (modulesData.length > 0) {
            const firstModuleQuestions = questionsWithOptions.filter(
              q => q.module_id === modulesData[0].id
            );
            setModuleQuestions(firstModuleQuestions);
          }
        }
        
        const { data: submissionData, error: submissionError } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (submissionError && submissionError.code !== 'PGRST116') {
          throw submissionError;
        }
        
        if (submissionData) {
          setSubmission(submissionData as unknown as QuizSubmission);
          
          if (submissionData.completed) {
            setIsComplete(true);
          } else {
            const moduleIndex = Math.max(0, submissionData.current_module - 1);
            setCurrentModuleIndex(moduleIndex);
            
            if (modulesData[moduleIndex]) {
              const moduleQuestions = questionsWithOptions.filter(
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
            .insert([
              { user_id: user.id, current_module: 1, started_at: new Date().toISOString() }
            ])
            .select()
            .single();
            
          if (createError) {
            throw createError;
          }
          if (newSubmission) {
            setSubmission(newSubmission as unknown as QuizSubmission);
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
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchQuizData();
  }, [isAuthenticated, user]);
  
  const saveAnswer = async (questionId: string, answer: string | string[]) => {
    if (!user) return;
    
    try {
      let answerValue = typeof answer === 'string' ? answer : JSON.stringify(answer);
      
      const { error } = await supabase
        .from('quiz_answers')
        .upsert([
          {
            user_id: user.id,
            question_id: questionId,
            answer: answerValue,
          }
        ], { onConflict: 'user_id,question_id' });
        
      if (error) throw error;
      
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
        variant: "destructive",
      });
    }
  };
  
  const updateCurrentModule = async (moduleNumber: number) => {
    if (!user || !submission) return;
    
    try {
      const { error } = await supabase
        .from('quiz_submissions')
        .update({ current_module: moduleNumber })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      logger.info('Progresso do módulo atualizado', {
        tag: 'Quiz',
        data: { moduleNumber }
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
      const { error } = await supabase
        .from('quiz_submissions')
        .update({ 
          completed: true,
          completed_at: new Date().toISOString(),
          contact_consent: true
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      logger.info('Questionário marcado como concluído', {
        tag: 'Quiz',
        data: { userId: user.id }
      });
      
      setIsComplete(true);
    } catch (error: any) {
      logger.error('Erro ao completar questionário', { 
        tag: 'Quiz',
        data: error 
      });
      toast({
        title: "Erro ao finalizar questionário",
        description: "Não foi possível registrar a conclusão do questionário. Por favor, tente novamente.",
        variant: "destructive",
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
        
        const nextModuleQuestions = questions.filter(
          q => q.module_id === nextModule.id
        );
        
        setCurrentModuleIndex(nextModuleIndex);
        setModuleQuestions(nextModuleQuestions);
        setCurrentQuestionIndex(0);
        window.scrollTo(0, 0);
      } else {
        await completeQuiz();
        
        toast({
          title: "Questionário concluído!",
          description: "Suas respostas foram salvas com sucesso.",
        });
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
      
      const prevModuleQuestions = questions.filter(
        q => q.module_id === prevModule.id
      );
      
      setCurrentModuleIndex(prevModuleIndex);
      setModuleQuestions(prevModuleQuestions);
      setCurrentQuestionIndex(prevModuleQuestions.length - 1);
      window.scrollTo(0, 0);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <QuizHeader />
      
      <main className="flex-1 container py-8 px-4 flex flex-col items-center">
        {!isComplete ? (
          <>
            {modules.length > 0 && moduleQuestions.length > 0 ? (
              <>
                <div className="w-full max-w-2xl mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {modules[currentModuleIndex]?.title}
                  </h2>
                  {modules[currentModuleIndex]?.description && (
                    <p className="text-muted-foreground">
                      {modules[currentModuleIndex]?.description}
                    </p>
                  )}
                </div>
                
                <QuizProgress 
                  currentStep={currentQuestionIndex + 1} 
                  totalSteps={moduleQuestions.length}
                  currentModule={currentModuleIndex + 1}
                  totalModules={modules.length}
                />
                
                <QuestionCard
                  question={{
                    id: moduleQuestions[currentQuestionIndex].id,
                    text: moduleQuestions[currentQuestionIndex].text,
                    type: moduleQuestions[currentQuestionIndex].type,
                    options: moduleQuestions[currentQuestionIndex].options?.map(o => o.text),
                    required: moduleQuestions[currentQuestionIndex].required,
                    hint: moduleQuestions[currentQuestionIndex].hint || undefined
                  }}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                  onPrev={handlePrevious}
                  isFirst={currentModuleIndex === 0 && currentQuestionIndex === 0}
                  isLast={currentModuleIndex === modules.length - 1 && currentQuestionIndex === moduleQuestions.length - 1}
                  currentAnswer={answers[moduleQuestions[currentQuestionIndex].id]}
                />
              </>
            ) : (
              <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Configuração do Questionário</h2>
                <p className="text-lg mb-6">
                  {loadError || "Nenhum módulo de questionário encontrado."} 
                </p>
                {user && (
                  <div className="mb-6">
                    <SeedButton onComplete={fetchQuizData} />
                  </div>
                )}
                <div className="flex justify-center">
                  <img 
                    src="/lovable-uploads/e8129a1e-d4a7-471a-9d2f-80660199b08b.png" 
                    alt="Questionário MAR" 
                    className="max-w-full h-auto max-h-60 object-contain border rounded-md" 
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <QuizComplete />
        )}
      </main>
      
      <footer className="bg-white py-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Quiz;
