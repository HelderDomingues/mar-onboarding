import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SeedButton } from "@/components/quiz/SeedButton";
import { AlertCircle, Database, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface QuizConfigurationPanelProps {
  isLoading: boolean;
  loadError: string | null;
  onRefresh: () => void;
  isAdmin: boolean;
  modules?: any[];
  questions?: any[];
}
export function QuizConfigurationPanel({
  isLoading,
  loadError,
  onRefresh,
  isAdmin,
  modules = [],
  questions = []
}: QuizConfigurationPanelProps) {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };
  const handleNavigateToQuestion = () => {
    if (!selectedModule) return;

    // Formato da URL: /quiz?admin=true&module=X&question=Y
    let url = `/quiz?admin=true`;
    if (selectedModule) {
      url += `&module=${selectedModule}`;
      if (selectedQuestion) {
        url += `&question=${selectedQuestion}`;
      }
    }
    navigate(url);
  };
  const filteredQuestions = selectedModule ? questions.filter(q => q.module_id === selectedModule) : [];
  return <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Questionário MAR
      </h2>
      
      {isLoading ? <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg mb-6">Carregando questionário...</p>
        </div> : <>
          {isAdmin && modules.length > 0 ? <div className="mb-6">
              <Card className="border-violet-500 border-2 mb-6 bg-slate-100">
                <CardHeader className="pb-3 bg-zinc-600">
                  <CardTitle className="text-xl text-orange-700">
                    Painel de Navegação Administrativa
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-zinc-600">
                  <Tabs defaultValue="navigation" className="w-full">
                    <TabsList className="mb-4 bg-gray-950">
                      <TabsTrigger value="navigation" className="text-slate-800 font-light bg-zinc-800 hover:bg-zinc-700">Navegação</TabsTrigger>
                      <TabsTrigger value="actions" className="text-slate-800">Ações</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="navigation" className="space-y-4 bg-zinc-600">
                      <div className="grid grid-cols-1 gap-4 bg-zinc-400">
                        <div className="bg-zinc-600">
                          <label className="text-sm font-medium mb-1 block">Selecione um Módulo</label>
                          <Select value={selectedModule} onValueChange={setSelectedModule}>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha um módulo" />
                            </SelectTrigger>
                            <SelectContent>
                              {modules.map((module, index) => <SelectItem key={module.id} value={module.id}>
                                  Módulo {index + 1}: {module.title}
                                </SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedModule && <div>
                            <label className="text-sm font-medium mb-1 block">Selecione uma Questão</label>
                            <Select value={selectedQuestion} onValueChange={setSelectedQuestion} disabled={filteredQuestions.length === 0}>
                              <SelectTrigger>
                                <SelectValue placeholder={filteredQuestions.length === 0 ? "Nenhuma questão disponível" : "Escolha uma questão"} />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredQuestions.map((question, index) => <SelectItem key={question.id} value={question.id}>
                                    Questão {index + 1}: {question.text.substring(0, 30)}...
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>}
                      </div>
                      
                      <div className="flex gap-3 justify-between">
                        <Button variant="outline" onClick={handleNavigateToDashboard} className="flex-1 text-zinc-950">
                          <Home className="h-4 w-4 mr-2" /> Dashboard
                        </Button>
                        
                        <Button onClick={handleNavigateToQuestion} disabled={!selectedModule} className="flex-1 bg-gray-950 hover:bg-gray-800">
                          Ir para Questão
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="actions">
                      <div className="space-y-4">
                        <p className="text-sm mb-2 text-gray-950">
                          Ações administrativas para o questionário
                        </p>
                        
                        <div className="flex flex-col gap-3">
                          <Button variant="outline" onClick={onRefresh} className="justify-start">
                            Recarregar Dados
                          </Button>
                          
                          <SeedButton onComplete={onRefresh} />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div> : <>
              <p className="text-lg mb-6">
                {loadError || "Nenhum dado de questionário encontrado."}
              </p>
              
              {loadError && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>Ocorreu um erro ao carregar o questionário.</p>
                </div>}
              
              {isAdmin && <div className="mb-6">
                  <Button variant="outline" onClick={onRefresh} className="mb-4 mr-4">
                    Tentar novamente
                  </Button>
                  <SeedButton onComplete={onRefresh} />
                  
                  <div className="mt-4">
                    <Button variant="outline" onClick={handleNavigateToDashboard} className="w-full">
                      <Home className="h-4 w-4 mr-2" /> Voltar para Dashboard
                    </Button>
                  </div>
                </div>}
              
              {!isAdmin && loadError && <p className="text-muted-foreground mt-4">
                  Por favor, entre em contato com o administrador para configurar o questionário.
                </p>}
            </>}
        </>}
      
      <div className="flex justify-center mt-8">
        <img src="/lovable-uploads/98e55723-efb7-42e8-bc10-a429fdf04ffb.png" alt="MAR - Mapa para Alto Rendimento" className="max-w-full h-auto max-h-32 object-contain" />
      </div>
    </div>;
}