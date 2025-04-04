
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { QuizReview as QuizReviewComponent } from "@/components/quiz/QuizReview";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { useToast } from "@/components/ui/use-toast";

const QuizReviewPage = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Atualiza o título da página
    document.title = "Revisão do Questionário | MAR - Crie Valor";
    
    // Redirecionar se não estiver autenticado
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
      // Buscar módulos
      const { data: modulesData, error: modulesError } = await supabase
        .from('quiz_modules')
        .select('*')
        .order('order_number');

      if (modulesError) throw modulesError;
      
      // Buscar perguntas
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
      
      // Processar perguntas com suas opções
      const questionsWithOptions = questionsData.map(question => {
        const options = optionsData?.filter(opt => opt.question_id === question.id) || [];
        return { ...question, options } as unknown as QuizQuestion;
      });
      
      // Processar respostas
      const processedAnswers: Record<string, string | string[]> = {};
      
      if (answersData && answersData.length > 0) {
        answersData.forEach(ans => {
          if (ans.answer !== null && ans.answer !== undefined) {
            const questionType = questionsWithOptions.find(q => q.id === ans.question_id)?.type;
            
            if (questionType === 'checkbox') {
              try {
                // Para checkbox, tentamos interpretar como array JSON
                const parsed = JSON.parse(ans.answer);
                processedAnswers[ans.question_id] = Array.isArray(parsed) ? parsed : [ans.answer];
              } catch (e) {
                // Se falhar ao analisar JSON, tratamos como uma string única
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
      
      console.log("Respostas processadas:", processedAnswers);
      
      setModules(modulesData as unknown as QuizModule[]);
      setQuestions(questionsWithOptions);
      setAnswers(processedAnswers);
      setError(null);
    } catch (error: any) {
      console.error("Erro ao buscar dados do questionário:", error);
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
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('quiz_submissions')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Questionário concluído com sucesso!",
      });
      
      // Redirecionar para o dashboard após completar
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Erro ao finalizar questionário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o questionário. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEditQuestion = (moduleIndex: number, questionIndex: number) => {
    navigate(`/quiz?module=${modules[moduleIndex].id}&question=${questions.filter(q => q.module_id === modules[moduleIndex].id)[questionIndex].id}`);
  };

  if (!isAuthenticated) {
    return null; // Será redirecionado no useEffect
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
