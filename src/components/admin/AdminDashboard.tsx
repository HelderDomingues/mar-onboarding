import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, BarChart, ChevronRight, Users as UsersIcon, FileCheck, FileBarChart, LineChart, PieChart, ArrowUpRight, ArrowDown, TrendingUp, Layers, Search, Filter, User, Settings, LayoutDashboard, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizSubmission } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer, LineChart as ReLineChart, Line, Area, AreaChart } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { addLogEntry } from "@/utils/projectLog";
interface AdminDashboardProps {
  submission?: QuizSubmission | null;
  isAdmin: boolean;
}
export function AdminDashboard({
  submission,
  isAdmin
}: AdminDashboardProps) {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [stats, setStats] = useState({
    totalUsers: '...',
    completedSubmissions: '...',
    inProgressSubmissions: '...',
    completionRate: '...'
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Se não for admin, não fazemos as consultas
    if (!isAdmin) return;
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        addLogEntry('info', 'Carregando estatísticas do dashboard administrativo');

        // Buscar contagem de usuários
        const {
          count: usersCount,
          error: usersError
        } = await supabase.from('profiles').select('*', {
          count: 'exact',
          head: true
        });

        // Buscar submissões completas
        const {
          count: completedCount,
          error: completedError
        } = await supabase.from('quiz_submissions').select('*', {
          count: 'exact',
          head: true
        }).eq('completed', true);

        // Buscar submissões em progresso
        const {
          count: inProgressCount,
          error: inProgressError
        } = await supabase.from('quiz_submissions').select('*', {
          count: 'exact',
          head: true
        }).eq('completed', false);
        if (!usersError && !completedError && !inProgressError) {
          const usersTotal = usersCount || 0;
          const completed = completedCount || 0;
          const inProgress = inProgressCount || 0;
          const notStarted = usersTotal - (completed + inProgress);

          // Calcular taxa de conclusão
          const completionRate = usersTotal > 0 ? (completed / usersTotal * 100).toFixed(1) + '%' : '0%';
          setStats({
            totalUsers: usersCount?.toString() || '0',
            completedSubmissions: completedCount?.toString() || '0',
            inProgressSubmissions: inProgressCount?.toString() || '0',
            completionRate: completionRate
          });

          // Dados para o gráfico de barras
          setChartData([{
            name: 'Quiz MAR',
            Completos: completed,
            'Em Progresso': inProgress,
            'Não Iniciados': notStarted
          }]);

          // Dados para o gráfico de linha (dados simulados)
          const last7Days = Array.from({
            length: 7
          }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
              date: date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit'
              }),
              'Acessos': Math.floor(Math.random() * 10) + 5,
              'Submissões': Math.floor(Math.random() * 5) + 1
            };
          });
          setLineChartData(last7Days);
        } else {
          const errorMessage = usersError || completedError || inProgressError;
          console.error("Erro ao buscar estatísticas:", errorMessage);
          addLogEntry('error', 'Erro ao buscar estatísticas do dashboard', {
            error: errorMessage?.message
          });
          toast({
            title: "Erro ao carregar estatísticas",
            description: "Não foi possível carregar as estatísticas do dashboard.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error("Erro ao buscar estatísticas", error);
        addLogEntry('error', 'Erro ao buscar estatísticas do dashboard', {
          error: error.message
        });
        toast({
          title: "Erro ao carregar estatísticas",
          description: "Ocorreu um erro inesperado ao carregar os dados.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [isAdmin, toast]);
  return <div className="space-y-4 md:space-y-6 w-full font-sans overflow-x-hidden">
      {/* Cabeçalho da página */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">Dashboard Administrativo</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Visão geral do sistema MAR - Mapa para Alto Rendimento
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Pesquisar..." className="pl-9 w-full sm:w-[200px] h-9" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Filter className="h-4 w-4 mr-1" />
              <span className="sm:inline">Filtros</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/profile")} className="flex-1 sm:flex-none">
              <User className="h-4 w-4" />
              <span className="ml-1 sm:inline">Perfil</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Visão geral e ações rápidas */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            <LayoutDashboard className="h-5 w-5 inline-block mr-2 text-blue-600" />
            Visão Consolidada do Sistema
          </CardTitle>
          <CardDescription>
            Acompanhe os principais indicadores e acesse ações rápidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            <Card className="dashboard-card bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <CardContent className="p-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Usuários</p>
                    <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                      <h3 className="text-xl md:text-2xl font-bold">{stats.totalUsers}</h3>
                      <Badge variant="outline" className="font-medium bg-green-50 text-green-700 border-green-200 text-xs">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        12%
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-full p-2 bg-blue-100 text-blue-600 flex-shrink-0">
                    <UsersIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4 text-xs flex justify-between">
                  <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => navigate('/admin/users')}>
                    Ver detalhes <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardContent className="p-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Questionários Completos</p>
                    <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                      <h3 className="text-xl md:text-2xl font-bold">{stats.completedSubmissions}</h3>
                      <Badge variant="outline" className="font-medium bg-green-50 text-green-700 border-green-200 text-xs">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        8%
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-full p-2 bg-green-100 text-green-600 flex-shrink-0">
                    <FileCheck className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4 text-xs flex justify-between">
                  <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => navigate('/admin/reports')}>
                    Ver relatórios <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card bg-gradient-to-br from-amber-50 to-white border-amber-200">
              <CardContent className="p-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Em Progresso</p>
                    <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                      <h3 className="text-xl md:text-2xl font-bold">{stats.inProgressSubmissions}</h3>
                      <Badge variant="outline" className="font-medium bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        3%
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-full p-2 bg-amber-100 text-amber-600 flex-shrink-0">
                    <Clock className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4 text-xs flex justify-between">
                  <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => navigate('/admin/metrics')}>
                    Ver métricas <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
              <CardContent className="p-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Taxa de Conclusão</p>
                    <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                      <h3 className="text-xl md:text-2xl font-bold">{stats.completionRate}</h3>
                      <Badge variant="outline" className="font-medium bg-red-50 text-red-700 border-red-200 text-xs">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        2%
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-full p-2 bg-indigo-100 text-indigo-600 flex-shrink-0">
                    <BarChart className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4 text-xs flex justify-between">
                  <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => navigate('/admin/metrics')}>
                    Análise completa <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Botões de ação rápida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
            <Button onClick={() => navigate("/admin/users")} variant="outline" className="justify-start text-left h-auto py-3 px-3">
              <div className="rounded-full p-2 bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
                <UsersIcon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm md:text-base truncate">Gerenciar Usuários</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Cadastre, edite e visualize usuários
                </p>
              </div>
            </Button>
            
            <Button onClick={() => navigate("/admin/reports")} variant="outline" className="justify-start text-left h-auto py-3 px-3">
              <div className="rounded-full p-2 bg-green-100 text-green-600 mr-3 flex-shrink-0">
                <FileBarChart className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm md:text-base truncate">Relatórios e Análises</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Visualize relatórios de desempenho
                </p>
              </div>
            </Button>
            
            <Button onClick={() => navigate("/admin/seed-quiz")} variant="outline" className="justify-start text-left h-auto py-3 px-3">
              <div className="rounded-full p-2 bg-purple-100 text-purple-600 mr-3 flex-shrink-0">
                <Database className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm md:text-base truncate">Configurar Questionário</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Configure e recarregue os dados do quiz
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Cards de ações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card className="dashboard-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg font-medium">
              <Layers className="h-5 w-5 text-blue-600" />
              Gerenciar Questionário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs md:text-sm text-muted-foreground">
              Acesse o questionário MAR em modo administrador para editar questões e módulos.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => navigate("/quiz?admin=true")} 
                className="w-full sm:flex-1 justify-between text-slate-50 text-xs sm:text-sm"
              >
                <span className="truncate">Acessar Questionário</span>
                <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
              <Button 
                onClick={() => navigate("/admin/seed-quiz")} 
                variant="outline" 
                className="w-full sm:flex-1 justify-between text-xs sm:text-sm"
              >
                <span className="truncate">Configurar Questionário</span>
                <Database className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg font-medium">
              <FileBarChart className="h-5 w-5 text-blue-600" />
              Relatórios e Análises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs md:text-sm text-muted-foreground">
              Visualize relatórios de desempenho e análises das respostas dos usuários.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="default" 
                onClick={() => navigate("/admin/reports")} 
                className="w-full sm:flex-1 justify-between text-slate-50 text-xs sm:text-sm"
              >
                <span className="truncate">Ver Relatórios</span>
                <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:flex-1 justify-between text-xs sm:text-sm" 
                onClick={() => navigate("/admin/metrics")}
              >
                <span className="truncate">Ver Métricas</span>
                <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs de análises */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-600" />
            Análises
          </CardTitle>
          <CardDescription>
            Monitoramento de atividade e status dos questionários
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <Tabs defaultValue="status">
            <TabsList className="mb-4">
              <TabsTrigger value="status">Status dos Questionários</TabsTrigger>
              <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status">
              <div className="h-56 md:h-64 w-full overflow-x-auto">
                {isLoading ? <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div> : <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={chartData} margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Bar dataKey="Completos" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Em Progresso" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Não Iniciados" fill="#6b7280" radius={[4, 4, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>}
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="h-64 w-full">
                {isLoading ? <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div> : <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={lineChartData} margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0
                }}>
                      <defs>
                        <linearGradient id="colorAccess" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e88e5" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#1e88e5" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Area type="monotone" dataKey="Acessos" stroke="#1e88e5" fillOpacity={1} fill="url(#colorAccess)" />
                      <Area type="monotone" dataKey="Submissões" stroke="#10b981" fillOpacity={1} fill="url(#colorSubmissions)" />
                    </AreaChart>
                  </ResponsiveContainer>}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <p className="text-sm text-muted-foreground">
            Atualizado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/metrics")}>
              Ver Métricas
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" onClick={() => navigate("/admin/reports")} className="text-slate-50">
              Ver Relatórios
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>;
}
