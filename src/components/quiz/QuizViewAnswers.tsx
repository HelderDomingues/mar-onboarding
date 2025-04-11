import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { processQuizAnswersToSimplified } from "@/utils/supabaseUtils";
import { downloadQuizPDF } from "@/utils/pdfGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, File, FileSpreadsheet, CheckCircle, Circle } from "lucide-react";
import { logger } from "@/utils/logger";

interface Answer {
  question_id: string;
  question_text: string;
  answer: string;
}

interface Submission {
  id: string;
  user_id: string;
  current_module: number;
  is_complete: boolean;
  started_at: string;
  completed_at: string | null;
}

export function QuizViewAnswers() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  
  const queryParams = new URLSearchParams(location.search);
  const adminMode = queryParams.get('admin') === 'true' && isAdmin;
  const specificUserId = queryParams.get('id');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (specificUserId && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    fetchQuizData();
  }, [isAuthenticated, user, adminMode, specificUserId]);
  
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      const targetUserId = specificUserId && adminMode ? specificUserId : user?.id;
      
      if (!targetUserId) {
        throw new Error("ID do usuário não encontrado");
      }
      
      logger.info('Buscando dados do questionário para visualização', {
        tag: 'Quiz',
        data: { targetUserId, adminMode, specificUserId }
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
      
      const result = await processQuizAnswersToSimplified(targetUserId);
      
      if (!result) {
        throw new Error("Erro ao processar respostas do questionário");
      }
      
      setModules(modulesData as unknown as QuizModule[]);
      setQuestions(questionsData as unknown as QuizQuestion[]);
      setAnswers(result.answers as unknown as Answer[]);
      setSubmission(result.submission as unknown as Submission);
      setError(null);
    } catch (error: any) {
      logger.error("Erro ao buscar dados do questionário:", {
        tag: 'Quiz',
        data: error
      });
      
      setError("Não foi possível carregar as respostas do questionário. Por favor, tente novamente.");
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar as respostas do questionário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getModuleAnswers = (moduleId: string) => {
    const moduleQuestions = questions.filter(q => q.module_id === moduleId);
    const moduleQuestionIds = moduleQuestions.map(q => q.id);
    return answers.filter(a => moduleQuestionIds.includes(a.question_id))
      .sort((a, b) => {
        const questionA = questions.find(q => q.id === a.question_id);
        const questionB = questions.find(q => q.id === b.question_id);
        return (questionA?.order_number || 0) - (questionB?.order_number || 0);
      });
  };
  
  const formatAnswer = (answer: string | null, questionId: string): React.ReactNode => {
    if (!answer) return <span className="text-muted-foreground italic">Sem resposta</span>;
    
    const question = questions.find(q => q.id === questionId);
    
    try {
      if (answer.startsWith('[') && answer.endsWith(']')) {
        const options = JSON.parse(answer);
        if (Array.isArray(options)) {
          return (
            <ul className="list-disc pl-5 space-y-1">
              {options.map((option, index) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
          );
        }
      }
    } catch (e) {
    }
    
    if (question?.type === 'url' && !answer.includes('://')) {
      return (
        <a 
          href={`https://${answer}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline"
        >
          {answer}
        </a>
      );
    } else if (question?.type === 'instagram') {
      return (
        <a 
          href={`https://instagram.com/${answer}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline"
        >
          @{answer}
        </a>
      );
    }
    
    return answer;
  };
  
  const handlePDFDownload = async () => {
    try {
      setDownloadingPDF(true);
      
      const targetUserId = specificUserId && adminMode ? specificUserId : user?.id;
      
      if (!targetUserId) {
        throw new Error("ID do usuário não encontrado");
      }
      
      logger.info('Iniciando download do PDF do questionário', {
        tag: 'Quiz',
        data: { targetUserId, adminMode }
      });
      
      let userName = 'Usuário';
      
      if (submission?.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', submission.user_id)
          .single();
        
        if (!profileError && profile) {
          userName = profile.full_name || 'Usuário';
        }
      }
      
      const success = await downloadQuizPDF(
        targetUserId,
        userName,
        `questionario-mar-${userName.toLowerCase().replace(/\s+/g, '-')}`,
        adminMode
      );
      
      if (success) {
        toast({
          title: "Download iniciado",
          description: "O PDF com as respostas do questionário está sendo baixado.",
        });
      } else {
        throw new Error("Não foi possível gerar o PDF");
      }
    } catch (error: any) {
      logger.error("Erro ao baixar PDF:", {
        tag: 'Quiz',
        data: error
      });
      
      toast({
        title: "Erro ao gerar PDF",
        description: error.message || "Não foi possível gerar o PDF com as respostas.",
        variant: "destructive"
      });
    } finally {
      setDownloadingPDF(false);
    }
  };
  
  const handleCSVDownload = async () => {
    try {
      setDownloadingCSV(true);
      
      const targetUserId = specificUserId && adminMode ? specificUserId : user?.id;
      
      if (!targetUserId) {
        throw new Error("ID do usuário não encontrado");
      }
      
      const headers = ['Módulo', 'Pergunta', 'Resposta'];
      
      const rows = answers.map(answer => {
        const question = questions.find(q => q.id === answer.question_id);
        const module = modules.find(m => m.id === question?.module_id);
        
        let formattedAnswer = answer.answer || '';
        try {
          if (formattedAnswer.startsWith('[') && formattedAnswer.endsWith(']')) {
            const options = JSON.parse(formattedAnswer);
            if (Array.isArray(options)) {
              formattedAnswer = options.join('; ');
            }
          }
        } catch (e) {
        }
        
        return [
          module?.title || 'Desconhecido',
          answer.question_text,
          formattedAnswer
        ];
      });
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => 
          typeof cell === 'string' && (cell.includes(',') || cell.includes('\n')) 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      let userName = 'usuario';
      
      if (submission?.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', submission.user_id)
          .single();
        
        if (!profileError && profile && profile.full_name) {
          userName = profile.full_name.toLowerCase().replace(/\s+/g, '-');
        }
      }
      
      link.setAttribute('href', url);
      link.setAttribute('download', `respostas-questionario-${userName}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download iniciado",
        description: "O CSV com as respostas do questionário está sendo baixado.",
      });
    } catch (error: any) {
      logger.error("Erro ao baixar CSV:", {
        tag: 'Quiz',
        data: error
      });
      
      toast({
        title: "Erro ao gerar CSV",
        description: error.message || "Não foi possível gerar o CSV com as respostas.",
        variant: "destructive"
      });
    } finally {
      setDownloadingCSV(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={fetchQuizData} variant="outline">Tentar novamente</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (answers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Questionário não iniciado</CardTitle>
            <CardDescription>Você ainda não respondeu nenhuma pergunta do questionário.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Inicie o questionário para ver suas respostas aqui.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/quiz')}>Ir para o questionário</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Respostas do Questionário</h1>
          <p className="text-muted-foreground">
            {adminMode 
              ? "Visualizando respostas do usuário como administrador" 
              : "Revise suas respostas ao questionário MAR"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCSVDownload}
            disabled={downloadingCSV}
          >
            <FileSpreadsheet className={`h-4 w-4 mr-2 ${downloadingCSV ? 'animate-spin' : ''}`} />
            Exportar CSV
          </Button>
          
          <Button
            variant="default"
            onClick={handlePDFDownload}
            disabled={downloadingPDF}
          >
            <File className={`h-4 w-4 mr-2 ${downloadingPDF ? 'animate-spin' : ''}`} />
            Baixar PDF
          </Button>
        </div>
      </div>
      
      {submission && (
        <Card className="bg-slate-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status do questionário</p>
                <div className="flex items-center mt-1">
                  {submission.is_complete ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium">Concluído</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="font-medium">Em andamento</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Progresso</p>
                <div className="flex items-center mt-1">
                  <span className="font-medium">
                    {submission.is_complete 
                      ? "100% - Todos os módulos completos" 
                      : `Módulo ${submission.current_module} de 7`}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Iniciado em</p>
                <div className="mt-1">
                  <span className="font-medium">
                    {new Date(submission.started_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
              
              {submission.completed_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Concluído em</p>
                  <div className="mt-1">
                    <span className="font-medium">
                      {new Date(submission.completed_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">Todos os Módulos</TabsTrigger>
            {modules.map((module) => (
              <TabsTrigger key={module.id} value={module.id} className="hidden md:flex">
                {module.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value="all">
          <div className="space-y-8">
            {modules.map((module) => {
              const moduleAnswers = getModuleAnswers(module.id);
              if (moduleAnswers.length === 0) return null;
              
              return (
                <Card key={module.id} className="overflow-hidden">
                  <CardHeader className="bg-slate-50">
                    <CardTitle className="text-lg flex items-center">
                      {module.title}
                      <Badge 
                        variant="outline" 
                        className="ml-2 text-xs font-normal text-slate-600"
                      >
                        {moduleAnswers.length} {moduleAnswers.length === 1 ? 'resposta' : 'respostas'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {moduleAnswers.map((answer) => {
                        const question = questions.find(q => q.id === answer.question_id);
                        
                        return (
                          <div key={answer.question_id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                            <p className="font-medium mb-2">{answer.question_text}</p>
                            <div className="text-slate-700">
                              {formatAnswer(answer.answer, answer.question_id)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {modules.map((module) => (
          <TabsContent key={module.id} value={module.id}>
            <Card>
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
                {module.description && (
                  <CardDescription>{module.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getModuleAnswers(module.id).map((answer) => (
                    <div key={answer.question_id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <p className="font-medium mb-2">{answer.question_text}</p>
                      <div className="text-slate-700">
                        {formatAnswer(answer.answer, answer.question_id)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
        >
          Voltar para Dashboard
        </Button>
        
        {!submission?.is_complete && (
          <Button 
            onClick={() => navigate('/quiz')}
          >
            Continuar Questionário
          </Button>
        )}
      </div>
    </div>
  );
}
