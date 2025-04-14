
import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Clock, 
  Users, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ListFilter, 
  Calendar, 
  Download, 
  Smartphone, 
  Laptop, 
  TabletSmartphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { addLogEntry } from "@/utils/projectLog";

const Metrics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  });
  const [completionStats, setCompletionStats] = useState({
    completed: 0,
    inProgress: 0,
    notStarted: 0
  });
  const [deviceStats, setDeviceStats] = useState({
    mobile: 65,
    desktop: 25,
    tablet: 10
  });
  const [timeStats, setTimeStats] = useState([
    { name: 'Módulo 1', tempo: 15 },
    { name: 'Módulo 2', tempo: 22 },
    { name: 'Módulo 3', tempo: 18 },
    { name: 'Módulo 4', tempo: 25 },
    { name: 'Módulo 5', tempo: 30 },
    { name: 'Módulo 6', tempo: 20 },
    { name: 'Módulo 7', tempo: 17 },
    { name: 'Módulo 8', tempo: 23 }
  ]);

  // Cores para gráficos
  const COLORS = ['#10b981', '#f97316', '#6b7280', '#3b82f6', '#ec4899', '#8b5cf6'];

  useEffect(() => {
    fetchMetricsData();
  }, []);

  const fetchMetricsData = async () => {
    try {
      setLoading(true);
      addLogEntry('info', 'Carregando dados de métricas administrativas');

      // Buscar contagem de usuários
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Buscar estatísticas de conclusão
      const { data: completedData, error: completedError } = await supabase
        .from('quiz_submissions')
        .select('id')
        .eq('completed', true);

      const { data: inProgressData, error: inProgressError } = await supabase
        .from('quiz_submissions')
        .select('id')
        .eq('completed', false);

      if (completedError || inProgressError) throw completedError || inProgressError;

      // Buscar novos usuários deste mês
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersCount, error: newUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      if (newUsersError) throw newUsersError;

      const completed = completedData?.length || 0;
      const inProgress = inProgressData?.length || 0;
      const notStarted = (usersCount || 0) - (completed + inProgress);

      setUserStats({
        total: usersCount || 0,
        active: completed + inProgress,
        newThisMonth: newUsersCount || 0
      });

      setCompletionStats({
        completed,
        inProgress,
        notStarted
      });

      setLoading(false);
    } catch (error: any) {
      console.error("Erro ao carregar dados de métricas:", error);
      addLogEntry('error', 'Erro ao carregar dados de métricas', { error: error.message });
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de métricas.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Dados para os gráficos
  const pieData = [
    { name: 'Completos', value: completionStats.completed, color: '#10b981' },
    { name: 'Em Progresso', value: completionStats.inProgress, color: '#f97316' },
    { name: 'Não Iniciados', value: completionStats.notStarted, color: '#6b7280' }
  ];

  const deviceData = [
    { name: 'Mobile', value: deviceStats.mobile, color: '#3b82f6' },
    { name: 'Desktop', value: deviceStats.desktop, color: '#8b5cf6' },
    { name: 'Tablet', value: deviceStats.tablet, color: '#ec4899' }
  ];

  // Dados simulados de progresso ao longo do tempo
  const progressData = [
    { name: 'Janeiro', Completos: 5, 'Em Progresso': 10 },
    { name: 'Fevereiro', Completos: 12, 'Em Progresso': 15 },
    { name: 'Março', Completos: 20, 'Em Progresso': 18 },
    { name: 'Abril', Completos: 30, 'Em Progresso': 22 },
    { name: 'Maio', Completos: 45, 'Em Progresso': 20 },
    { name: 'Junho', Completos: 55, 'Em Progresso': 15 }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background font-sans">
        <AdminSidebar />
        
        <div className="flex-1">
          <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Métricas e Análises</h1>
                <p className="text-muted-foreground">
                  Visualize métricas detalhadas do programa MAR
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Últimos 30 dias
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  Filtros
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="users">
              <TabsList className="mb-4">
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="completion">Conclusão</TabsTrigger>
                <TabsTrigger value="time">Tempo</TabsTrigger>
                <TabsTrigger value="devices">Dispositivos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Usuários
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold">
                        {loading ? "..." : userStats.total}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Usuários Ativos
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold">
                        {loading ? "..." : userStats.active}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Novos Usuários (Mês)
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold">
                        {loading ? "..." : userStats.newThisMonth}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-primary" />
                      Evolução de Usuários
                    </CardTitle>
                    <CardDescription>
                      Progressão de usuários ao longo do tempo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="Completos" 
                              stroke="#10b981" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="Em Progresso" 
                              stroke="#f97316" 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="completion">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-primary" />
                        Status de Conclusão
                      </CardTitle>
                      <CardDescription>
                        Distribuição dos status dos questionários
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {loading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [value, "Quantidade"]} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Status por Módulo
                      </CardTitle>
                      <CardDescription>
                        Progresso por módulo do questionário
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {loading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timeStats}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="tempo" fill="#10b981" name="Tempo Médio (min)" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="time">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Tempo Médio por Módulo
                    </CardTitle>
                    <CardDescription>
                      Tempo médio gasto pelos usuários em cada módulo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={timeStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="tempo" fill="#3b82f6" name="Tempo Médio (min)" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="devices">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        Distribuição de Dispositivos
                      </CardTitle>
                      <CardDescription>
                        Tipos de dispositivos usados pelos usuários
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {loading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={deviceData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {deviceData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [value, "Percentual"]} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Resumo de Dispositivos
                      </CardTitle>
                      <CardDescription>
                        Detalhes dos dispositivos utilizados
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="flex items-center gap-4 p-4 border rounded-md">
                          <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">Mobile</p>
                            <p className="text-sm text-muted-foreground">
                              {deviceStats.mobile}% dos usuários
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 border rounded-md">
                          <div className="rounded-full p-2 bg-purple-100 text-purple-600">
                            <Laptop className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">Desktop</p>
                            <p className="text-sm text-muted-foreground">
                              {deviceStats.desktop}% dos usuários
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 border rounded-md">
                          <div className="rounded-full p-2 bg-pink-100 text-pink-600">
                            <TabletSmartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">Tablet</p>
                            <p className="text-sm text-muted-foreground">
                              {deviceStats.tablet}% dos usuários
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Metrics;
