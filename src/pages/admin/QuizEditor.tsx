
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileEdit, PlusCircle, FolderPlus, Edit, AlertCircle, Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuizModule, QuizQuestion, QuizOption } from "@/types/quiz";
import { useToast } from "@/components/ui/use-toast";
import { ReloadQuizDataButton } from "@/components/admin/ReloadQuizDataButton";

const QuizEditor = () => {
  const [selectedTab, setSelectedTab] = useState("modules");
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        const { data: modulesData, error: modulesError } = await supabase
          .from('quiz_modules')
          .select('*')
          .order('order_number');

        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('order_number');

        const { data: optionsData, error: optionsError } = await supabase
          .from('quiz_options')
          .select('*')
          .order('order_number');

        if (modulesError || questionsError || optionsError) {
          throw new Error('Erro ao carregar dados do questionário');
        }

        setModules(modulesData || []);
        setQuestions(questionsData || []);
        setOptions(optionsData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do questionário",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  // Função para obter as opções associadas a uma pergunta
  const getQuestionOptions = (questionId: string) => {
    return options.filter(option => option.question_id === questionId);
  };

  // Função para obter o módulo de uma pergunta
  const getQuestionModule = (moduleId: string) => {
    return modules.find(module => module.id === moduleId);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background font-sans">
        <AdminSidebar />
        
        <div className="flex-1">
          <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Editor do Questionário MAR</h1>
                <p className="text-muted-foreground">
                  Gerencie os módulos, questões e opções do questionário
                </p>
              </div>
              
              <div className="flex gap-2">
                <ReloadQuizDataButton />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Carregando dados do questionário...</p>
              </div>
            ) : (
              <Tabs defaultValue="modules" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="modules">Módulos ({modules.length})</TabsTrigger>
                  <TabsTrigger value="questions">Questões ({questions.length})</TabsTrigger>
                  <TabsTrigger value="options">Opções de Resposta ({options.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="modules">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FolderPlus className="h-5 w-5 text-primary" />
                        Módulos do Questionário
                      </CardTitle>
                      <CardDescription>
                        Gerencie os {modules.length} módulos do questionário MAR
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {modules.length === 0 ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Nenhum módulo encontrado</AlertTitle>
                          <AlertDescription>
                            Não foram encontrados módulos do questionário. Utilize o botão "Recarregar dados do questionário" para configurar o questionário MAR.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="grid gap-4">
                          {modules.map((module) => (
                            <div 
                              key={module.id} 
                              className="border p-4 rounded-md flex justify-between items-center"
                            >
                              <div>
                                <h3 className="font-semibold">{module.order_number}. {module.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {module.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Perguntas: {questions.filter(q => q.module_id === module.id).length}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="questions">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileEdit className="h-5 w-5 text-primary" />
                        Perguntas do Questionário
                      </CardTitle>
                      <CardDescription>
                        Gerencie as {questions.length} perguntas do questionário por módulo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {questions.length === 0 ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Nenhuma pergunta encontrada</AlertTitle>
                          <AlertDescription>
                            Não foram encontradas perguntas no questionário. Utilize o botão "Recarregar dados do questionário" para configurar o questionário MAR.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-6">
                          {modules.map((module) => {
                            const moduleQuestions = questions.filter(q => q.module_id === module.id);
                            
                            if (moduleQuestions.length === 0) {
                              return null;
                            }
                            
                            return (
                              <div key={module.id} className="space-y-2">
                                <h3 className="text-lg font-semibold border-b pb-2">
                                  Módulo {module.order_number}: {module.title}
                                </h3>
                                <div className="grid gap-4">
                                  {moduleQuestions.map((question) => (
                                    <div 
                                      key={question.id} 
                                      className="border p-4 rounded-md"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <h4 className="font-semibold">{question.order_number}. {question.text}</h4>
                                          <div className="flex gap-2 mt-1">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              Tipo: {question.type}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${question.required ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                              {question.required ? 'Obrigatório' : 'Opcional'}
                                            </span>
                                            {question.max_options && (
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                Máx: {question.max_options}
                                              </span>
                                            )}
                                          </div>
                                          {question.hint && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                              <span className="font-medium">Dica:</span> {question.hint}
                                            </p>
                                          )}
                                        </div>
                                        <Button variant="outline" size="sm">
                                          <Edit className="h-4 w-4 mr-2" />
                                          Editar
                                        </Button>
                                      </div>
                                      
                                      {(question.type === 'radio' || question.type === 'checkbox') && (
                                        <div className="mt-2 border-t pt-2">
                                          <p className="text-sm font-medium mb-1">Opções de resposta:</p>
                                          <ul className="space-y-1 pl-5 list-disc">
                                            {getQuestionOptions(question.id).map((option) => (
                                              <li key={option.id} className="text-sm">
                                                {option.text}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="options">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
                        Opções de Resposta
                      </CardTitle>
                      <CardDescription>
                        Gerencie as {options.length} opções de resposta para perguntas de múltipla escolha
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {options.length === 0 ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Nenhuma opção encontrada</AlertTitle>
                          <AlertDescription>
                            Não foram encontradas opções de resposta. Utilize o botão "Recarregar dados do questionário" para configurar o questionário MAR.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-6">
                          {modules.map((module) => {
                            const moduleQuestions = questions.filter(q => q.module_id === module.id && (q.type === 'radio' || q.type === 'checkbox'));
                            
                            if (moduleQuestions.length === 0) {
                              return null;
                            }
                            
                            return (
                              <div key={module.id} className="space-y-2">
                                <h3 className="text-lg font-semibold border-b pb-2">
                                  Módulo {module.order_number}: {module.title}
                                </h3>
                                
                                {moduleQuestions.map((question) => {
                                  const questionOptions = getQuestionOptions(question.id);
                                  
                                  if (questionOptions.length === 0) {
                                    return null;
                                  }
                                  
                                  return (
                                    <div key={question.id} className="border p-4 rounded-md mb-4">
                                      <h4 className="font-semibold mb-2">
                                        Pergunta {question.order_number}: {question.text}
                                      </h4>
                                      
                                      <div className="grid gap-2">
                                        {questionOptions.map((option) => (
                                          <div 
                                            key={option.id} 
                                            className="border p-2 rounded-md flex justify-between items-center"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs font-medium">
                                                {option.order_number}
                                              </span>
                                              <span>{option.text}</span>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default QuizEditor;
