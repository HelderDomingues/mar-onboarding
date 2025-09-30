import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  Download, 
  FileText, 
  Users, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Separator } from "@/components/ui/separator";
import { addLogEntry } from "@/utils/projectLog";
import { SidebarProvider } from "@/components/ui/sidebar";

const Reports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [completionStats, setCompletionStats] = useState({
    completed: 0,
    inProgress: 0,
    notStarted: 0
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");

  // Cores para gráficos
  const COLORS = ['#10b981', '#f97316', '#6b7280', '#3b82f6', '#ec4899', '#8b5cf6'];

  useEffect(() => {
    fetchReportData();
  }, [selectedTimeRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      addLogEntry('info', 'Carregando dados de relatórios', { timeRange: selectedTimeRange });

      // Buscar contagem de usuários
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;
      setUserCount(usersCount || 0);

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

      const completed = completedData?.length || 0;
      const inProgress = inProgressData?.length || 0;
      const notStarted = (usersCount || 0) - (completed + inProgress);

      setCompletionStats({
        completed,
        inProgress,
        notStarted
      });

      // Buscar submissões com respostas
      let query = supabase
        .from('quiz_submissions')
        .select(`
          id, 
          user_id, 
          user_email, 
          full_name, 
          completed, 
          current_module, 
          started_at, 
          completed_at
        `)
        .order('completed_at', { ascending: false });

      // Aplicar filtro por período se necessário
      if (selectedTimeRange !== "all") {
        const startDate = new Date();
        if (selectedTimeRange === "week") {
          startDate.setDate(startDate.getDate() - 7);
        } else if (selectedTimeRange === "month") {
          startDate.setMonth(startDate.getMonth() - 1);
        } else if (selectedTimeRange === "year") {
          startDate.setFullYear(startDate.getFullYear() - 1);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data: submissionsData, error: submissionsError } = await query;

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);

      setLoading(false);
    } catch (error: any) {
      console.error("Erro ao carregar dados do relatório:", error);
      addLogEntry('error', 'Erro ao carregar dados do relatório', { error: error.message });
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do relatório.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const generatePDF = () => {
    try {
      addLogEntry('info', 'Gerando relatório em PDF');
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text("Relatório MAR - Crie Valor Consultoria", 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);
      doc.text(`Total de usuários: ${userCount}`, 14, 42);
      doc.text(`Questionários completados: ${completionStats.completed}`, 14, 52);
      doc.text(`Questionários em progresso: ${completionStats.inProgress}`, 14, 62);
      doc.text(`Usuários sem iniciar: ${completionStats.notStarted}`, 14, 72);
      
      // Tabela de submissões
      const tableColumn = ["Usuário", "Email", "Status", "Data de conclusão"];
      const tableRows: any[][] = [];
      
      submissions.forEach(sub => {
        const status = sub.completed ? 'Completo' : 'Em progresso';
        const completionDate = sub.completed_at 
          ? new Date(sub.completed_at).toLocaleDateString('pt-BR') 
          : 'N/A';
        
        tableRows.push([
          sub.full_name || 'Sem nome',
          sub.user_email || 'Sem email',
          status,
          completionDate
        ]);
      });
      
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129] }
      });
      
      doc.save(`Relatório-MAR-${new Date().toLocaleDateString('pt-BR')}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O relatório foi gerado e baixado."
      });
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      addLogEntry('error', 'Erro ao gerar PDF', { error: error.message });
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório em PDF.",
        variant: "destructive"
      });
    }
  };

  const generateCSV = () => {
    try {
      addLogEntry('info', 'Gerando relatório em CSV');
      const headers = ["Nome", "Email", "Status", "Módulo atual", "Data de início", "Data de conclusão"];
      
      let csvContent = headers.join(";") + "\n";
      
      submissions.forEach(sub => {
        const status = sub.completed ? 'Completo' : 'Em progresso';
        const completionDate = sub.completed_at 
          ? new Date(sub.completed_at).toLocaleDateString('pt-BR') 
          : '';
        const startDate = sub.started_at 
          ? new Date(sub.started_at).toLocaleDateString('pt-BR') 
          : '';
        
        const row = [
          sub.full_name || 'Sem nome',
          sub.user_email || 'Sem email',
          status,
          sub.current_module || '0',
          startDate,
          completionDate
        ];
        
        csvContent += row.join(";") + "\n";
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Relatório-MAR-${new Date().toLocaleDateString('pt-BR')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "CSV gerado com sucesso",
        description: "O relatório foi gerado e baixado."
      });
    } catch (error: any) {
      console.error("Erro ao gerar CSV:", error);
      addLogEntry('error', 'Erro ao gerar CSV', { error: error.message });
      toast({
        title: "Erro ao gerar CSV",
        description: "Não foi possível gerar o relatório em CSV.",
        variant: "destructive"
      });
    }
  };

  // Preparar dados para os gráficos
  const pieData = [
    { name: 'Completos', value: completionStats.completed, color: '#10b981' },
    { name: 'Em Progresso', value: completionStats.inProgress, color: '#f97316' },
    { name: 'Não Iniciados', value: completionStats.notStarted, color: '#6b7280' }
  ];

  const barData = [
    {
      name: 'Status dos Questionários',
      Completos: completionStats.completed,
      'Em Progresso': completionStats.inProgress,
      'Não Iniciados': completionStats.notStarted
    }
  ];

  // Simulação de dados por módulos para o gráfico
  const moduleData = Array.from({ length: 8 }, (_, i) => {
    const completedCount = Math.floor(Math.random() * completionStats.completed);
    const inProgressCount = Math.floor(Math.random() * completionStats.inProgress);
    
    return {
      name: `Módulo ${i + 1}`,
      Completos: completedCount,
      'Em Progresso': inProgressCount
    };
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background font-sans">
        <AdminSidebar />
        
        <div className="flex-1">
          <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Relatórios e Análises</h1>
                <p className="text-muted-foreground">
                  Visualize dados e estatísticas do programa MAR
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setSelectedTimeRange("all")}
                >
                  <Filter className="h-4 w-4" />
                  Todos
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setSelectedTimeRange("week")}
                >
                  7 dias
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setSelectedTimeRange("month")}
                >
                  30 dias
                </Button>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Usuários
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {loading ? "..." : userCount}
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Questionários Completos
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-green-600">
                    {loading ? "..." : completionStats.completed}
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Em Progresso
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-amber-600">
                    {loading ? "..." : completionStats.inProgress}
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Conclusão
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-blue-600">
                    {loading ? "..." : userCount > 0 
                      ? ((completionStats.completed / userCount) * 100).toFixed(1) + "%" 
                      : "0%"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Status dos Questionários
                  </CardTitle>
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
              
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Status por Quantidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {loading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Completos" fill="#10b981" />
                          <Bar dataKey="Em Progresso" fill="#f97316" />
                          <Bar dataKey="Não Iniciados" fill="#6b7280" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Dados dos Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="table">
                  <TabsList className="mb-4">
                    <TabsTrigger value="table">Tabela</TabsTrigger>
                    <TabsTrigger value="graphs">Gráficos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="table">
                    <div className="border rounded-md">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Conclusão</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                              <tr>
                                <td colSpan={5} className="text-center py-6">Carregando...</td>
                              </tr>
                            ) : submissions.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center py-6">Nenhum dado encontrado</td>
                              </tr>
                            ) : (
                              submissions.map((sub) => (
                                <tr key={sub.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">{sub.full_name || 'Sem nome'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{sub.user_email || 'Sem email'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      sub.completed 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {sub.completed ? 'Completo' : 'Em progresso'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {sub.completed ? '100%' : `${Math.round((sub.current_module / 8) * 100)}%`}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {sub.completed_at 
                                      ? new Date(sub.completed_at).toLocaleDateString('pt-BR') 
                                      : 'Não concluído'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="graphs">
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={moduleData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Completos" fill="#10b981" />
                          <Bar dataKey="Em Progresso" fill="#f97316" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t pt-6 flex flex-wrap gap-3">
                <Button 
                  variant="default" 
                  className="flex items-center gap-2"
                  onClick={generatePDF}
                >
                  <FileText className="h-4 w-4" />
                  Exportar como PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={generateCSV}
                >
                  <Download className="h-4 w-4" />
                  Exportar como CSV
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
