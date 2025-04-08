
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { FileText, Download, User, Book, BarChart3 } from "lucide-react";

const MemberArea = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [quizStatus, setQuizStatus] = useState({
    completed: false,
    completedAt: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    
    fetchUserData();
  }, [isAuthenticated, user]);
  
  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      setUserProfile(profileData);
      
      // Buscar status do questionário
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_submissions')
        .select('completed, completed_at')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!quizError && quizData) {
        setQuizStatus({
          completed: quizData.completed || false,
          completedAt: quizData.completed_at,
        });
      }
      
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não disponível";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Área do Membro MAR</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-2 border-blue-200">
                  {userProfile?.full_name 
                    ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
                    : user?.email?.substring(0, 2).toUpperCase() || "ME"}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{userProfile?.full_name || "Membro MAR"}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  {userProfile?.company_name && (
                    <p className="text-gray-700 mt-1">{userProfile.company_name}</p>
                  )}
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Membro MAR
                    </span>
                    {quizStatus.completed && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Diagnóstico Completo
                      </span>
                    )}
                    {isAdmin && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Administrador
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Button variant="outline" className="mb-2 w-full md:w-auto">
                    <User className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="dashboard">Resumo</TabsTrigger>
                <TabsTrigger value="materials">Materiais</TabsTrigger>
                <TabsTrigger value="results">Resultados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        Status do Diagnóstico
                      </CardTitle>
                      <CardDescription>
                        Informações sobre seu diagnóstico MAR
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-sm font-medium">Status:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            quizStatus.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {quizStatus.completed ? 'Completo' : 'Pendente'}
                          </span>
                        </div>
                        
                        {quizStatus.completed && (
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-sm font-medium">Concluído em:</span>
                            <span className="text-sm">{formatDate(quizStatus.completedAt)}</span>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          {quizStatus.completed ? (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => navigate('/quiz/diagnostic')}
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Ver Diagnóstico
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              className="w-full"
                              onClick={() => navigate('/quiz')}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Completar Questionário
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5 text-blue-500" />
                        Materiais Exclusivos
                      </CardTitle>
                      <CardDescription>
                        Acesse recursos e materiais do programa MAR
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Acesse guias, planilhas e recursos exclusivos para membros do programa MAR.
                        </p>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => navigate('/materials')}
                            className="w-full"
                          >
                            <Book className="h-4 w-4 mr-2" />
                            Biblioteca de Materiais
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download de Recursos
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="materials">
                <Card>
                  <CardHeader>
                    <CardTitle>Materiais Exclusivos</CardTitle>
                    <CardDescription>
                      Acesse artigos, guias, planilhas e recursos para seu negócio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Book className="h-16 w-16 mx-auto text-blue-200 mb-4" />
                      <h3 className="text-xl font-medium mb-2">Materiais exclusivos para membros</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Acesse nossa biblioteca completa de materiais exclusivos para membros do programa MAR.
                      </p>
                      <Button onClick={() => navigate('/materials')}>
                        Acessar Biblioteca
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle>Resultados do Diagnóstico</CardTitle>
                    <CardDescription>
                      Visualize os resultados e recomendações do seu diagnóstico MAR
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {quizStatus.completed ? (
                      <div className="text-center py-8">
                        <BarChart3 className="h-16 w-16 mx-auto text-green-200 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Diagnóstico Completo!</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Você já completou o diagnóstico MAR. Clique abaixo para visualizar seus resultados e recomendações.
                        </p>
                        <Button onClick={() => navigate('/quiz/diagnostic')}>
                          Ver Diagnóstico Completo
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-16 w-16 mx-auto text-amber-200 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Diagnóstico Pendente</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Você ainda não completou o questionário diagnóstico MAR. Complete-o para receber recomendações personalizadas.
                        </p>
                        <Button onClick={() => navigate('/quiz')}>
                          Completar Questionário
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      <SiteFooter />
    </div>
  );
};

export default MemberArea;
