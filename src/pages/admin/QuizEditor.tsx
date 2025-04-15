
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
        setLoading(false);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do questionário",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

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
                <Button variant="outline" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Novo Módulo
                </Button>
                <Button className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4" />
                  Nova Questão
                </Button>
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
                        <div className="border rounded-md p-6 text-center">
                          <p className="text-muted-foreground mb-4">
                            Nenhum módulo encontrado. Adicione seu primeiro módulo.
                          </p>
                          <Button variant="outline">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Adicionar Módulo
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {modules.map((module) => (
                            <div 
                              key={module.id} 
                              className="border p-4 rounded-md flex justify-between items-center"
                            >
                              <div>
                                <h3 className="font-semibold">{module.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {module.description}
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
                        Perguntas ({questions.length})
                      </CardTitle>
                      <CardDescription>
                        Gerencie as perguntas do questionário por módulo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {questions.length === 0 ? (
                        <div className="border rounded-md p-6 text-center">
                          <p className="text-muted-foreground mb-4">
                            Nenhuma pergunta encontrada. Adicione sua primeira pergunta.
                          </p>
                          <Button variant="outline">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Adicionar Pergunta
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {questions.map((question) => (
                            <div 
                              key={question.id} 
                              className="border p-4 rounded-md flex justify-between items-center"
                            >
                              <div>
                                <h3 className="font-semibold">{question.text}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Tipo: {question.type}, Obrigatório: {question.required ? 'Sim' : 'Não'}
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
                
                <TabsContent value="options">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
                        Opções de Resposta ({options.length})
                      </CardTitle>
                      <CardDescription>
                        Gerencie as opções de resposta para perguntas de múltipla escolha
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {options.length === 0 ? (
                        <div className="border rounded-md p-6 text-center">
                          <p className="text-muted-foreground mb-4">
                            Nenhuma opção de resposta encontrada.
                          </p>
                          <Button variant="outline">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Adicionar Opção
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {options.map((option) => (
                            <div 
                              key={option.id} 
                              className="border p-4 rounded-md flex justify-between items-center"
                            >
                              <div>
                                <h3 className="font-semibold">{option.text}</h3>
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
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default QuizEditor;
