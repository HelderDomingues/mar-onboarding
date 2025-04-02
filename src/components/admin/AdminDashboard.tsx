
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizSubmission } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";

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
  
  useEffect(() => {
    // Se não for admin, não fazemos as consultas
    if (!isAdmin) return;
    
    const fetchStats = async () => {
      try {
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
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
      }
    };
    
    fetchStats();
  }, [isAdmin]);
  
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema MAR - Mapa para Alto Rendimento
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <UsersIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Questionários Completos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.completedSubmissions}</div>
              <FileCheck className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Questionários em Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.inProgressSubmissions}</div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Cards de ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Questionário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Acesse o questionário MAR em modo administrador para editar questões e módulos.
            </p>
            <Button 
              onClick={() => navigate("/quiz?admin=true")}
              className="w-full justify-between bg-slate-800 hover:bg-slate-700"
            >
              Acessar Questionário
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Relatórios e Análises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Visualize relatórios de desempenho e análises das respostas dos usuários.
            </p>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => navigate("/dashboard?section=reports")}
            >
              Ver Relatórios
              <FileBarChart className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Área reservada para futuro dashboard de monitoramento */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Monitoramento</CardTitle>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-md">
          <p className="text-muted-foreground">
            Área reservada para dashboard de monitoramento/acompanhamento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
