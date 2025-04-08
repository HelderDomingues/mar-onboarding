
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, Users, FileText, HelpCircle } from "lucide-react";

const ReportsPage = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [quizCompletionData, setQuizCompletionData] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdmin) {
        fetchReportData();
      } else {
        navigate("/dashboard");
      }
    } else if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, user, isAdmin, navigate]);
  
  const fetchReportData = async () => {
    setIsLoading(true);
    
    try {
      // Obter dados dos questionários completados
      const { data: completedQuizData, error: completedQuizError } = await supabase
        .from('quiz_respostas_completas')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (completedQuizError) throw completedQuizError;
      
      setQuizCompletionData(completedQuizData || []);
      
      // Obter contagem total de usuários
      const { count: userCount, error: userCountError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      if (userCountError) throw userCountError;
      
      setTotalUsers(userCount || 0);
      
      // Obter contagem de questionários completados
      const { count: completedCount, error: completedCountError } = await supabase
        .from('quiz_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('completed', true);
      
      if (completedCountError) throw completedCountError;
      
      setCompletedQuizzes(completedCount || 0);
      
    } catch (error: any) {
      console.error('Erro ao buscar dados para relatórios:', error);
      toast({
        title: "Erro ao carregar relatórios",
        description: "Não foi possível obter os dados necessários. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const exportToCsv = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados serão exportados para CSV em breve.",
    });
    
    // Implementação futura para exportação real
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="p-6 bg-gray-50">
          <div className="container max-w-7xl mx-auto">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-bold">Relatórios</h1>
              <p className="text-muted-foreground">
                Acompanhe o desempenho do sistema e análise de dados
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Usuários registrados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Questionários Completos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedQuizzes}</div>
                  <p className="text-xs text-muted-foreground">Questionários finalizados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalUsers > 0 ? ((completedQuizzes / totalUsers) * 100).toFixed(1) + '%' : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">Usuários que completaram o questionário</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="quiz-completions" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="quiz-completions">Questionários Completos</TabsTrigger>
                <TabsTrigger value="users-activity">Atividade de Usuários</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quiz-completions">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Questionários Finalizados</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={exportToCsv}
                      >
                        <Download className="h-4 w-4" />
                        <span>Exportar</span>
                      </Button>
                    </div>
                    <CardDescription>
                      Últimos questionários concluídos por usuários
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <>
                        {quizCompletionData.length === 0 ? (
                          <div className="text-center p-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p>Nenhum questionário concluído ainda.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left pb-3 font-medium">Nome</th>
                                  <th className="text-left pb-3 font-medium">Email</th>
                                  <th className="text-left pb-3 font-medium">Empresa</th>
                                  <th className="text-left pb-3 font-medium">Data de Conclusão</th>
                                </tr>
                              </thead>
                              <tbody>
                                {quizCompletionData.map((record, index) => (
                                  <tr key={record.id} className={index !== quizCompletionData.length - 1 ? "border-b" : ""}>
                                    <td className="py-3 pr-4">{record.full_name || 'Nome não disponível'}</td>
                                    <td className="py-3 pr-4">{record.email || 'Email não disponível'}</td>
                                    <td className="py-3 pr-4">{record.company_name || 'Empresa não informada'}</td>
                                    <td className="py-3 pr-4 whitespace-nowrap">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span>{formatDate(record.completed_at)}</span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between text-xs text-muted-foreground border-t py-3">
                    <span>Atualizado em {new Date().toLocaleString('pt-BR')}</span>
                    {quizCompletionData.length > 0 && <span>Mostrando {quizCompletionData.length} de {completedQuizzes} registros</span>}
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="users-activity">
                <Card className="h-full flex items-center justify-center p-12">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Relatório de atividade dos usuários em desenvolvimento</p>
                    <Button variant="outline">Em breve</Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ReportsPage;
