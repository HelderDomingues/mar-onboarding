
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooler } from "@/components/layout/SiteFooter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Download, Share2, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const QuizReviewPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Atualiza o título da página
    document.title = "Análises e Resultados | MAR - Crie Valor";
  }, []);
  
  useEffect(() => {
    const checkQuizCompletion = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('quiz_submissions')
          .select('completed')
          .eq('user_id', user.id)
          .single();
          
        if (!error && data) {
          setHasCompletedQuiz(data.completed);
        }
      } catch (error) {
        console.error('Erro ao verificar conclusão do questionário:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkQuizCompletion();
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // Dados de exemplo para os gráficos
  const barChartData = {
    labels: ['Estratégia', 'Operação', 'Pessoas', 'Finanças', 'Inovação'],
    datasets: [
      {
        label: 'Maturidade atual',
        data: [65, 45, 70, 55, 40],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Média do mercado',
        data: [70, 60, 65, 60, 55],
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }
    ]
  };
  
  const pieChartData = {
    labels: ['Pontos Fortes', 'Oportunidades', 'Pontos Fracos', 'Ameaças'],
    datasets: [
      {
        data: [35, 30, 20, 15],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const lineChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Projeção Q1', 'Projeção Q2'],
    datasets: [
      {
        label: 'Desempenho atual',
        data: [30, 45, 57, 70, null, null],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      },
      {
        label: 'Projeção com MAR',
        data: [null, null, null, 70, 85, 92],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderDash: [5, 5],
        tension: 0.3
      }
    ]
  };
  
  const areaChartData = {
    labels: ['Visibilidade', 'Engajamento', 'Conversão', 'Retenção', 'Recorrência'],
    datasets: [
      {
        label: 'Estado atual',
        data: [40, 35, 30, 45, 25],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Objetivo',
        data: [70, 75, 65, 80, 60],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const strengthsAndWeaknesses = [
    { type: 'strength', label: 'Forte presença digital', description: 'Sua empresa possui boa presença em canais digitais, gerando visibilidade de marca.' },
    { type: 'strength', label: 'Bom relacionamento com clientes', description: 'Seu atendimento ao cliente é um ponto forte reconhecido pelo mercado.' },
    { type: 'weakness', label: 'Estratégia de conteúdo', description: 'A estratégia de conteúdo precisa ser mais consistente e direcionada ao público-alvo.' },
    { type: 'weakness', label: 'Conversão de leads', description: 'A taxa de conversão de leads está abaixo da média do setor.' },
    { type: 'strength', label: 'Qualidade do produto', description: 'Seu produto/serviço tem reconhecimento de qualidade superior.' },
    { type: 'weakness', label: 'Mensuração de resultados', description: 'Os processos de análise e mensuração de resultados precisam ser aprimorados.' },
  ];

  const recommendations = [
    { id: 1, title: 'Implementar estratégia de conteúdo orientada a dados', difficulty: 'Média', impact: 'Alto', timeframe: '60 dias' },
    { id: 2, title: 'Otimizar funil de conversão para melhorar taxa de leads', difficulty: 'Alta', impact: 'Alto', timeframe: '90 dias' },
    { id: 3, title: 'Desenvolver programa de fidelização de clientes', difficulty: 'Média', impact: 'Médio', timeframe: '45 dias' },
    { id: 4, title: 'Implementar automação de marketing para nutrição de leads', difficulty: 'Alta', impact: 'Alto', timeframe: '60 dias' },
    { id: 5, title: 'Aprimorar dashboards de análise de desempenho', difficulty: 'Baixa', impact: 'Médio', timeframe: '30 dias' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <SiteFooler />
      </div>
    );
  }

  if (!hasCompletedQuiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md border-0 shadow-md">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle>Questionário não concluído</CardTitle>
              <CardDescription className="text-blue-100">
                É necessário completar o questionário para acessar as análises
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-600 mb-4">
                Para acessar as análises e recomendações personalizadas, você precisa completar o questionário MAR primeiro.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <Button 
                onClick={() => navigate("/quiz")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ir para o Questionário
              </Button>
            </CardFooter>
          </Card>
        </div>
        <SiteFooler />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Análises e Resultados</h1>
            <p className="text-slate-600">Diagnóstico personalizado baseado em suas respostas ao questionário MAR.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md mb-8 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Visão Geral do Seu Marketing</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>Exportar PDF</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  <span>Compartilhar</span>
                </Button>
              </div>
            </div>
            
            <p className="text-slate-600 mb-6">
              Este diagnóstico é baseado nas respostas fornecidas no questionário MAR. Use estas análises para identificar oportunidades de melhoria e orientar suas estratégias de marketing.
            </p>
            
            <Alert className="mb-6 bg-blue-50 border-blue-100">
              <AlertDescription className="text-blue-800">
                Esta análise foi gerada em 04/04/2025 e reflete o estado atual do seu marketing. Recomendamos reavaliar periodicamente para acompanhar sua evolução.
              </AlertDescription>
            </Alert>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Níveis de Maturidade</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <BarChart data={barChartData} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Análise SWOT</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <PieChart data={pieChartData} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="w-full justify-start bg-white border mb-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="strengths">Pontos Fortes e Fracos</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
              <TabsTrigger value="projections">Projeções</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Resumo do Diagnóstico</h3>
              <p className="text-slate-600 mb-4">
                Sua empresa apresenta um bom nível de maturidade em aspectos estratégicos e de pessoas, com oportunidades de melhoria em operações, finanças e inovação. Os principais destaques são a presença digital e relacionamento com clientes, enquanto as áreas que demandam mais atenção são a estratégia de conteúdo e conversão de leads.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Pontuação Geral</h4>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-blue-600">67</div>
                    <div className="ml-2 text-sm text-slate-500">/100</div>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Acima da média do setor (62/100)</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Nível de Maturidade</h4>
                  <div className="text-xl font-medium text-blue-600">Em desenvolvimento</div>
                  <p className="text-sm text-slate-600 mt-1">Próximo estágio: Otimizado (75+)</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="strengths" className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Pontos Fortes e Fracos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-600 mb-3 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                    Pontos Fortes
                  </h4>
                  <div className="space-y-3">
                    {strengthsAndWeaknesses.filter(item => item.type === 'strength').map((item, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div className="font-medium text-slate-800">{item.label}</div>
                        <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-orange-600 mb-3 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                    Pontos Fracos
                  </h4>
                  <div className="space-y-3">
                    {strengthsAndWeaknesses.filter(item => item.type === 'weakness').map((item, index) => (
                      <div key={index} className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <div className="font-medium text-slate-800">{item.label}</div>
                        <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Recomendações Estratégicas</h3>
              <p className="text-slate-600 mb-4">
                Com base no seu diagnóstico, identificamos as seguintes recomendações prioritárias para melhorar o desempenho do seu marketing:
              </p>
              
              <div className="space-y-4 mt-6">
                {recommendations.map((item) => (
                  <div key={item.id} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-800">{item.title}</h4>
                      <div className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Prioridade {item.id}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500 block">Dificuldade</span>
                        <span className="font-medium text-slate-700">{item.difficulty}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Impacto</span>
                        <span className="font-medium text-slate-700">{item.impact}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Prazo</span>
                        <span className="font-medium text-slate-700">{item.timeframe}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="projections" className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Projeções de Desempenho</h3>
              <p className="text-slate-600 mb-4">
                Baseado nos dados fornecidos e na implementação das recomendações, projetamos o seguinte desempenho para os próximos períodos:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Evolução de Desempenho</h4>
                  <div className="h-64">
                    <LineChart data={lineChartData} />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Áreas de Melhoria</h4>
                  <div className="h-64">
                    <AreaChart data={areaChartData} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Próximos Passos</h3>
            <p className="text-slate-600 mb-6">
              Para aproveitar ao máximo este diagnóstico, sugerimos os seguintes passos:
            </p>
            
            <ol className="space-y-3 ml-4 mb-6">
              <li className="text-slate-700">Revisar detalhadamente todas as recomendações</li>
              <li className="text-slate-700">Priorizar as ações com maior impacto e menor dificuldade</li>
              <li className="text-slate-700">Desenvolver um plano de implementação com prazos definidos</li>
              <li className="text-slate-700">Acompanhar regularmente os indicadores para medir progresso</li>
              <li className="text-slate-700">Agendar uma consultoria para detalhar a implementação</li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Agende uma consultoria personalizada</h4>
              <p className="text-slate-600 mb-3">
                Nossa equipe de especialistas pode ajudar a implementar estas recomendações de forma eficaz.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="mailto:contato@crievalor.com.br">
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Solicitar consultoria</span>
                  </Button>
                </a>
                <a href="https://wa.me/5567999999999" target="_blank" rel="noreferrer">
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SiteFooler />
    </div>
  );
};

export default QuizReviewPage;
