import React, { useState, useEffect } from 'react';
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
          const initialQuestions = await fetchQuestions(fetchedModules[0].id);
          setQuestions(initialQuestions);
        }
        
        // Carregar submissão existente
        if (user?.id) {
          const submission = await fetchSubmission(user.id);
          if (submission) {
            setSubmissionId(submission.id);
            setAnswers(prev => {
              const initialAnswers = {};
              initialQuestions.forEach(question => {
                const answer = submission.answers?.find(a => a.question_id === question.id);
                if (answer) {
                  initialAnswers[question.id] = answer.answer;
                }
              });
              return initialAnswers;
            });
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
  }, [currentModule]);
  
  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };
  
  const handlePrevModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };
  
  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const handleCheckboxChange = (questionId: string, value: string) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] as string[] || [];
      if (currentAnswers.includes(value)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [questionId]: [...currentAnswers, value]
        };
      }
    });
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
        throw new Error("Usuário não identificado");
      }
      
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
      
      // Usar a função saveQuizAnswer do utils
      const result = await saveQuizAnswer(user.id, questionId, answer, questionInfo);
      
      if (!result.success) {
        throw new Error(result.error?.message || "Falha ao salvar resposta");
      }
      
      // Atualizar estado local das respostas
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
      
      logger.info('Resposta salva com sucesso', {
        tag: 'Quiz',
        data: { questionId, userId: user.id }
      });
      
      return true;
    } catch (error: any) {
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
            <div className="relative">
              {question.prefix && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  {question.prefix}
                </div>
              )}
              <Input
                type="url"
                id={question.id}
                className={question.prefix ? "pl-10" : ""}
                value={answer as string}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                disabled={isSubmitting}
                placeholder={question.placeholder || undefined}
              />
            </div>
          </div>
        );
      case 'instagram':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <div className="relative">
              {question.prefix && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  {question.prefix}
                </div>
              )}
              <Input
                type="text"
                id={question.id}
                className={question.prefix ? "pl-10" : ""}
                value={answer as string}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                disabled={isSubmitting}
                placeholder={question.placeholder || undefined}
              />
            </div>
          </div>
        );
      case 'radio':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            <RadioGroup defaultValue={answer as string} onValueChange={(value) => handleInputChange(question.id, value)}>
              {question.options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.text} id={`${question.id}-${option.id}`} className="disabled:opacity-50" disabled={isSubmitting} />
                  <Label htmlFor={`${question.id}-${option.id}`} className="cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 'checkbox':
        return (
          <div className="grid gap-2">
            <Label htmlFor={question.id}>{question.text}</Label>
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option.id}`}
                  checked={(answer as string[])?.includes(option.text)}
                  onCheckedChange={(checked) => {
                    handleCheckboxChange(question.id, option.text);
                  }}
                  disabled={isSubmitting}
                />
                <Label htmlFor={`${question.id}-${option.id}`} className="cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        disabled={isCompleting || isSubmitting}
                      >
                        Concluir Questionário
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ao concluir, você não poderá mais alterar suas respostas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCompleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCompleteQuiz} disabled={isCompleting}>
                          {isCompleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Concluindo...
                            </>
                          ) : (
                            "Confirmar"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
