
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QuizModule, QuizQuestion, QuizAnswer } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function QuizViewAnswers() {
  const { user } = useAuth();
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchQuizData();
    }
  }, [user]);

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
        console.log("Respostas carregadas:", answersData);
        
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
      setError("Não foi possível carregar os dados. Por favor, tente novamente.");
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas respostas do questionário.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnswerValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "Sem resposta";
    }
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    if (typeof value === "string") {
      // Verifica se é um JSON string e tenta converter para array
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.join(", ");
        }
        return String(parsed);
      } catch (e) {
        // Se não for um JSON válido, retorna a string original
        return value;
      }
    }
    
    // Para outros tipos, converte para string
    return String(value);
  };

  const exportAnswers = () => {
    // Implementação para exportar respostas (PDF, CSV, etc.)
    toast({
      title: "Exportação em desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve."
    });
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600">Carregando suas respostas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center p-8">
        <h2 className="text-xl font-bold text-red-600 mb-2">Erro ao carregar respostas</h2>
        <p className="text-slate-600 mb-4">{error}</p>
        <Button onClick={fetchQuizData}>Tentar novamente</Button>
      </div>
    );
  }

  const questionsByModule = modules.map(module => ({
    module,
    questions: questions.filter(q => q.module_id === module.id)
  }));

  return (
    <div className="w-full space-y-6 max-w-3xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader className="px-6 py-5 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Minhas Respostas</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportAnswers}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          {questionsByModule.length === 0 ? (
            <p className="text-center text-slate-600 py-8">Nenhuma resposta encontrada.</p>
          ) : (
            <div className="space-y-8">
              {questionsByModule.map((moduleData, moduleIndex) => (
                <div 
                  key={moduleData.module.id} 
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50">
                      Módulo {moduleIndex + 1}
                    </Badge>
                    {moduleData.module.title}
                  </h3>
                  
                  <div className="space-y-4">
                    {moduleData.questions.map((question) => {
                      const answer = answers[question.id];
                      
                      return (
                        <div 
                          key={question.id} 
                          className="border-t border-slate-100 pt-3"
                        >
                          <p className="font-medium text-slate-800">{question.text}</p>
                          <p className="text-slate-600 mt-1">
                            {formatAnswerValue(answer)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
