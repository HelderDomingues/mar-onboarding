import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, BarChart, ChevronRight, Users as UsersIcon, FileCheck, FileBarChart, LineChart, PieChart, ArrowUpRight, ArrowDown, TrendingUp, Layers, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizSubmission } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer, LineChart as ReLineChart, Line, Area, AreaChart } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
interface AdminDashboardProps {
  submission?: QuizSubmission | null;
  isAdmin: boolean;
}
export function AdminDashboard({
  submission,
  isAdmin
}: AdminDashboardProps) {
  const navigate = useNavigate();
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
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [isAdmin]);
  return <div className="space-y-6 w-full font-sans">
      {/* Cabeçalho da página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard Administrativo</h1>
          <p className="text-muted-foreground text-sm">
            Visão geral do sistema MAR - Mapa para Alto Rendimento
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Pesquisar..." className="pl-9 w-full md:w-[200px] h-9" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                  <Badge variant="outline" className="font-medium bg-green-50 text-green-700 border-green-200">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    12%
                  </Badge>
                </div>
              </div>
              <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                <UsersIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-xs flex justify-between">
              <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => navigate('/admin/users')}>
                Ver detalhes <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Questionários Completos</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold">{stats.completedSubmissions}</h3>
                  <Badge variant="outline" className="font-medium bg-green-50 text-green-700 border-green-200">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    8%
                  </Badge>
                </div>
              </div>
              <div className="rounded-full p-2 bg-green-100 text-green-600">
                <FileCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-xs flex justify-between">
              <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => navigate('/admin/reports')}>
                Ver relatórios <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold">{stats.inProgressSubmissions}</h3>
                  <Badge variant="outline" className="font-medium bg-amber-50 text-amber-700 border-amber-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    3%
                  </Badge>
                </div>
              </div>
              <div className="rounded-full p-2 bg-amber-100 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-xs flex justify-between">
              <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => navigate('/admin/reports')}>
                Ver detalhes <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold">{stats.completionRate}</h3>
                  <Badge variant="outline" className="font-medium bg-red-50 text-red-700 border-red-200">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    2%
                  </Badge>
                </div>
              </div>
              <div className="rounded-full p-2 bg-indigo-100 text-indigo-600">
                <BarChart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-xs flex justify-between">
              <Button variant="ghost" size="sm" className="text-xs p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => navigate('/admin/reports')}>
                Análise completa <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Cards de ações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="dashboard-card">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Layers className="h-5 w-5 text-blue-600" />
              Gerenciar Questionário
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Acesse o questionário MAR em modo administrador para editar questões e módulos.
            </p>
            <Button onClick={() => navigate("/quiz?admin=true")} className="w-full justify-between text-slate-50">
              Acessar Questionário
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <FileBarChart className="h-5 w-5 text-blue-600" />
              Relatórios e Análises
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Visualize relatórios de desempenho e análises das respostas dos usuários.
            </p>
            <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/admin/reports")}>
              Ver Relatórios
              <ChevronRight className="h-4 w-4" />
            </Button>
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
              <div className="h-64 w-full">
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
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/reports")}>
            Ver mais análises
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>;
}