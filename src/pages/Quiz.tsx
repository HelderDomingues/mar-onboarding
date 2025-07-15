import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioWithOther } from '@/components/quiz/question-types/RadioWithOther';
import { CheckboxWithOther } from '@/components/quiz/question-types/CheckboxWithOther';
import { InstagramField } from '@/components/quiz/question-types/InstagramField';
import { UrlField } from '@/components/quiz/question-types/UrlField';
import { PrefixField } from '@/components/quiz/question-types/PrefixField';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  fetchModules, 
  fetchQuestions, 
  fetchSubmission, 
  saveAnswer, 
  completeQuiz, 
  isQuizComplete 
} from '@/utils/quiz';
import { saveQuizAnswer } from '@/utils/supabaseUtils';
import { supabase } from '@/integrations/supabase/client';
import { QuizModule, QuizQuestion } from '@/types/quiz';
import { logger } from '@/utils/logger';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  HelpCircle,
  Link as LinkIcon
} from "lucide-react";

const Quiz = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    document.title = "Questionário MAR - Crie Valor";
    
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        // Verificar se o questionário já foi completado
        if (user?.id) {
          const completed = await isQuizComplete(user.id);
          setQuizCompleted(completed);
          
          if (completed && !searchParams.get('admin')) {
            toast({
              title: "Questionário já completado",
              description: "Você já completou este questionário.",
            });
            return;
          }
        }
        
        // Carregar módulos e perguntas
        const fetchedModules = await fetchModules();
        setModules(fetchedModules);
        
        if (fetchedModules.length > 0) {
          const fetchedQuestions = await fetchQuestions(fetchedModules[0].id);
          setQuestions(fetchedQuestions);
        
          // Carregar submissão existente
          if (user?.id) {
            const submission = await fetchSubmission(user.id);
            if (submission) {
              setSubmissionId(submission.id);
              
              // Definir o módulo atual baseado na submissão
              if (submission.current_module && submission.current_module > 1) {
                setCurrentModuleIndex(submission.current_module - 1); // -1 porque array começa em 0
              }
              
              // Verificar se a submission tem uma propriedade answers antes de usá-la
              if (submission.answers && Array.isArray(submission.answers)) {
                const initialAnswers: Record<string, string | string[]> = {};
                fetchedQuestions.forEach(question => {
                  const answer = submission.answers?.find(a => a.question_id === question.id);
                  if (answer) {
                    initialAnswers[question.id] = answer.answer;
                  }
                });
                setAnswers(initialAnswers);
              }
            }
          }
        }
      } catch (error: any) {
        logger.error('Erro ao carregar dados do questionário', {
          tag: 'Quiz',
          data: error
        });
        
        toast({
          title: "Erro ao carregar questionário",
          description: error.message || "Ocorreu um erro ao carregar os dados do questionário.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, [user?.id, navigate, isAuthenticated, searchParams, toast]);
  
  const currentModule = modules[currentModuleIndex];
  
  useEffect(() => {
    const loadQuestions = async () => {
      if (currentModule) {
        try {
          setLoading(true);
          const fetchedQuestions = await fetchQuestions(currentModule.id);
          setQuestions(fetchedQuestions);
        } catch (error: any) {
          logger.error('Erro ao carregar perguntas do módulo', {
            tag: 'Quiz',
            data: { moduleId: currentModule.id, error }
          });
          
          toast({
            title: "Erro ao carregar perguntas",
            description: error.message || "Ocorreu um erro ao carregar as perguntas deste módulo.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadQuestions();
  }, [currentModule, toast]);
  
  // Cleanup do timeout quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  const updateCurrentModule = async (moduleNumber: number) => {
    try {
      if (!submissionId) return;
      
      const { error } = await supabase
        .from('quiz_submissions')
        .update({ current_module: moduleNumber })
        .eq('id', submissionId);
        
      if (error) {
        console.error('Erro ao atualizar módulo atual:', error);
        return;
      }
      
      console.log(`Módulo atual atualizado para: ${moduleNumber}`);
    } catch (error) {
      console.error('Erro ao atualizar módulo atual:', error);
    }
  };
  
  const handleNextModule = async () => {
    if (currentModuleIndex < modules.length - 1) {
      const nextModuleIndex = currentModuleIndex + 1;
      setCurrentModuleIndex(nextModuleIndex);
      
      // Atualizar o módulo atual no banco de dados
      if (submissionId) {
        await updateCurrentModule(nextModuleIndex + 1); // +1 porque módulos começam em 1
      }
    }
  };
  
  const handlePrevModule = async () => {
    if (currentModuleIndex > 0) {
      const prevModuleIndex = currentModuleIndex - 1;
      setCurrentModuleIndex(prevModuleIndex);
      
      // Atualizar o módulo atual no banco de dados
      if (submissionId) {
        await updateCurrentModule(prevModuleIndex + 1); // +1 porque módulos começam em 1
      }
    }
  };
  
  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Debounce para salvar automaticamente após 500ms de inatividade
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSaveAnswer(questionId, value);
    }, 500);
  };
  
  const handleCheckboxChange = async (questionId: string, value: string) => {
    let newAnswers: string[] = [];
    
    setAnswers(prev => {
      const currentAnswers = prev[questionId] as string[] || [];
      if (currentAnswers.includes(value)) {
        newAnswers = currentAnswers.filter(item => item !== value);
      } else {
        newAnswers = [...currentAnswers, value];
      }
      return {
        ...prev,
        [questionId]: newAnswers
      };
    });
    
    // Salvar automaticamente após mudança
    await handleSaveAnswer(questionId, newAnswers);
  };
  
  const handleCompleteQuiz = async () => {
    setIsCompleting(true);
    
    try {
      if (!submissionId) {
        throw new Error("Submissão não encontrada");
      }
      
      await completeQuiz(submissionId);
      setQuizCompleted(true);
      
      toast({
        title: "Questionário completado",
        description: "Parabéns! Você completou o questionário.",
      });
    } catch (error: any) {
      logger.error('Erro ao completar questionário', {
        tag: 'Quiz',
        data: error
      });
      
      toast({
        title: "Erro ao completar questionário",
        description: error.message || "Ocorreu um erro ao completar o questionário.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
      setShowConfirmation(false);
    }
  };

  const handleSaveAnswer = async (questionId: string, answer: string | string[]) => {
    setIsSubmitting(true);
    
    try {
      if (!user?.id) {
        console.error("Usuario não identificado:", user);
        throw new Error("Usuário não identificado");
      }
      
      console.log("Tentando salvar resposta:", { userId: user.id, questionId, answer });
      
      // Buscar informações da questão
      const question = questions.find(q => q.id === questionId);
      if (!question) {
        throw new Error("Questão não encontrada");
      }
      
      const questionInfo = {
        question_text: question.text,
        question_type: question.type,
        module_id: question.module_id,
        module_number: question.module_number,
        module_title: question.module_title
      };
      
      // Usar saveAnswer do utils/quiz.ts em vez de saveQuizAnswer
      if (!submissionId) {
        // Criar nova submissão primeiro
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error("Usuário não autenticado");
        }
        
        const { data: newSubmission, error: submissionError } = await supabase
          .from('quiz_submissions')
          .insert([{
            user_id: user.id,
            user_email: userData.user.email || '',
            current_module: 1,
            started_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (submissionError) {
          console.error("Erro ao criar submissão:", submissionError);
          throw submissionError;
        }
        
        setSubmissionId(newSubmission.id);
        console.log("Nova submissão criada:", newSubmission.id);
        
        // Agora salvar a resposta
        await saveAnswer(newSubmission.id, questionId, typeof answer === 'string' ? answer : JSON.stringify(answer));
      } else {
        // Usar submissão existente
        await saveAnswer(submissionId, questionId, typeof answer === 'string' ? answer : JSON.stringify(answer));
      }
      
      // Atualizar estado local das respostas
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
      
      console.log("Resposta salva com sucesso!");
      logger.info('Resposta salva com sucesso', {
        tag: 'Quiz',
        data: { questionId, userId: user.id }
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro detalhado ao salvar resposta:", error);
      logger.error('Erro ao salvar resposta', {
        tag: 'Quiz',
        data: { questionId, error }
      });
      
      toast({
        title: "Erro ao salvar resposta",
        description: error.message || "Ocorreu um problema ao salvar sua resposta",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderQuestion = (question: QuizQuestion) => {
    const answer = answers[question.id] || '';
    
    switch (question.type) {
      case 'text':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <Input
              type="text"
              id={question.id}
              value={answer as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              disabled={isSubmitting}
              placeholder={question.placeholder || undefined}
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <Textarea
              id={question.id}
              value={answer as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              disabled={isSubmitting}
              placeholder={question.placeholder || undefined}
            />
          </div>
        );
      case 'number':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <Input
              type="number"
              id={question.id}
              value={answer as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              disabled={isSubmitting}
              placeholder={question.placeholder || undefined}
            />
          </div>
        );
      case 'email':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <Input
              type="email"
              id={question.id}
              value={answer as string}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              disabled={isSubmitting}
              placeholder={question.placeholder || undefined}
            />
          </div>
        );
      case 'url':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <PrefixField
              id={question.id}
              value={answer as string}
              onChange={(value) => handleInputChange(question.id, value)}
              disabled={isSubmitting}
              hint={question.hint}
              prefix="https://"
              placeholder="exemplo.com.br"
              required={question.required}
            />
          </div>
        );
      case 'instagram':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <PrefixField
              id={question.id}
              value={answer as string}
              onChange={(value) => handleInputChange(question.id, value)}
              disabled={isSubmitting}
              hint={question.hint}
              prefix="www.instagram.com/"
              placeholder="perfildoinstagram"
              required={question.required}
            />
          </div>
        );
      case 'radio':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <RadioWithOther
              id={question.id}
              options={question.options || []}
              value={answer as string}
              onChange={(value) => handleInputChange(question.id, value)}
              disabled={isSubmitting}
              hint={question.hint}
            />
          </div>
        );
      case 'checkbox':
        // Para a questão 22 (Visão), limitar a 3 opções
        const maxOptions = question.order_number === 22 ? 3 : question.max_options;
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <CheckboxWithOther
              id={question.id}
              options={question.options || []}
              value={answer as string[] || []}
              onChange={async (value) => {
                setAnswers(prev => ({ ...prev, [question.id]: value }));
                await handleSaveAnswer(question.id, value);
              }}
              disabled={isSubmitting}
              hint={question.hint}
              maxOptions={maxOptions}
            />
          </div>
        );
      case 'select':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <Select onValueChange={(value) => handleInputChange(question.id, value)} defaultValue={answer as string} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option.id} value={option.text}>
                    {option.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return <p>Tipo de questão desconhecido.</p>;
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (quizCompleted && !searchParams.get('admin')) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <DashboardHeader isAdmin={isAdmin} />
        
        <div className="container flex-grow mx-auto p-4">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Questionário Concluído</CardTitle>
              <CardDescription>Você já completou este questionário.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mr-2" />
                <p className="text-lg">Obrigado por participar!</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
            </CardFooter>
          </Card>
        </div>
        
        <SiteFooter />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <div className="container flex-grow mx-auto p-4">
        {loading ? (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando questionário...
            </CardContent>
          </Card>
        ) : modules.length === 0 ? (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="text-center p-8">
              <p className="text-gray-500">Nenhum módulo encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{currentModule?.title}</CardTitle>
              <CardDescription>{currentModule?.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Progress value={((currentModuleIndex + 1) / modules.length) * 100} className="mb-4" />
              
              {questions.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-500">Nenhuma pergunta encontrada para este módulo.</p>
                </div>
              ) : (
                questions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    {renderQuestion(question)}
                  </div>
                ))
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={handlePrevModule}
                disabled={currentModuleIndex === 0 || isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-2">
                {currentModuleIndex === modules.length - 1 ? (
                  <Button 
                    onClick={() => navigate('/quiz/review')}
                    disabled={isSubmitting}
                  >
                    Revisar e Finalizar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextModule}
                    disabled={isSubmitting}
                  >
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
      
      <SiteFooter />
    </div>
  );
};

export default Quiz;
