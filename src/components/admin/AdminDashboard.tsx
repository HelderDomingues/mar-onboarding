
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  BookOpen, 
  BarChart, 
  ChevronRight,
  Users as UsersIcon,
  FileCheck,
  FileBarChart,
  LineChart,
  PieChart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizSubmission } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  submission?: QuizSubmission | null;
  isAdmin: boolean;
}

export function AdminDashboard({ submission, isAdmin }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: '...',
    completedSubmissions: '...',
    inProgressSubmissions: '...',
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Se não for admin, não fazemos as consultas
    if (!isAdmin) return;
    
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Buscar contagem de usuários
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        // Buscar submissões completas
        const { count: completedCount, error: completedError } = await supabase
          .from('quiz_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('completed', true);
          
        // Buscar submissões em progresso
        const { count: inProgressCount, error: inProgressError } = await supabase
          .from('quiz_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('completed', false);
          
        if (!usersError && !completedError && !inProgressError) {
          setStats({
            totalUsers: usersCount?.toString() || '0',
            completedSubmissions: completedCount?.toString() || '0',
            inProgressSubmissions: inProgressCount?.toString() || '0',
          });
          
          // Dados para o gráfico
          setChartData([
            {
              name: 'Quiz MAR',
              Completos: completedCount || 0,
              'Em Progresso': inProgressCount || 0,
              'Não Iniciados': (usersCount || 0) - ((completedCount || 0) + (inProgressCount || 0))
            }
          ]);
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [isAdmin]);
  
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema MAR - Mapa para Alto Rendimento
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-primary" />
              Usuários Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={() => navigate('/admin/users')}
              >
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-green-600" />
              Questionários Completos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.completedSubmissions}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={() => navigate('/admin/reports')}
              >
                Ver relatórios
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Questionários em Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.inProgressSubmissions}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={() => navigate('/admin/reports')}
              >
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Cards de ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Gerenciar Questionário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Acesse o questionário MAR em modo administrador para editar questões e módulos.
            </p>
            <Button 
              onClick={() => navigate("/quiz?admin=true")}
              className="w-full justify-between bg-primary hover:bg-primary/90"
            >
              Acessar Questionário
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-primary" />
              Relatórios e Análises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Visualize relatórios de desempenho e análises das respostas dos usuários.
            </p>
            <Button 
              variant="outline" 
              className="w-full justify-between border-primary text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => navigate("/admin/reports")}
            >
              Ver Relatórios
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráfico de status dos questionários */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Status dos Questionários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Completos" fill="#10b981" />
                  <Bar dataKey="Em Progresso" fill="#f97316" />
                  <Bar dataKey="Não Iniciados" fill="#6b7280" />
                </ReBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Seção adicional de monitoramento */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Dashboard de Monitoramento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-md bg-muted/10">
            <p className="text-muted-foreground text-center mb-4">
              Área reservada para dashboard de monitoramento/acompanhamento
            </p>
            <Button variant="outline">
              Configurar Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
