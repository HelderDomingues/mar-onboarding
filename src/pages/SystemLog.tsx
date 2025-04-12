
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  getAllLogs, getLogsByType, getLogsByUser, 
  exportLogsToFile, LogEntry 
} from "@/utils/projectLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useToast } from "@/components/ui/use-toast";
import { Download, Filter, RefreshCw, Search } from "lucide-react";

const SystemLog = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdmin) {
        refreshLogs();
      } else {
        navigate("/dashboard");
      }
    } else if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, user, isAdmin, navigate]);

  const refreshLogs = () => {
    const allLogs = getAllLogs();
    setLogs(allLogs);
    applyFilters(allLogs, filterType, searchQuery);
  };

  const applyFilters = (logsList: LogEntry[], type: string, query: string) => {
    let filtered = logsList;
    
    // Filtrar por tipo
    if (type !== "all") {
      filtered = type === "user" && user?.id 
        ? getLogsByUser(user.id)
        : getLogsByType(type as LogEntry["type"]);
    }
    
    // Filtrar por busca
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(lowerQuery) || 
        (log.context && log.context.toLowerCase().includes(lowerQuery)) ||
        (log.userId && log.userId.includes(lowerQuery))
      );
    }
    
    setFilteredLogs(filtered);
  };

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value);
    applyFilters(logs, value, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(logs, filterType, query);
  };

  const handleExportLogs = async () => {
    if (!user?.id) return;
    
    setIsExporting(true);
    try {
      const success = await exportLogsToFile(user.id);
      if (success) {
        toast({
          title: "Logs exportados com sucesso",
          description: "O arquivo foi baixado para o seu computador.",
        });
      } else {
        toast({
          title: "Falha ao exportar logs",
          description: "Não foi possível exportar os logs do sistema.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao exportar logs",
        description: "Ocorreu um erro durante a exportação dos logs.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Função para formatar a data ISO para uma exibição mais amigável
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  // Função para determinar a cor do badge com base no tipo de log
  const getLogTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      case "build":
        return "bg-purple-100 text-purple-800";
      case "auth":
        return "bg-green-100 text-green-800";
      case "database":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="p-6 bg-gray-50">
          <div className="container max-w-7xl mx-auto">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-bold">Log do Sistema</h1>
              <p className="text-muted-foreground">
                Registro de eventos e ações realizadas no sistema.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                <Button 
                  onClick={refreshLogs}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Atualizar</span>
                </Button>
                
                <Button 
                  onClick={handleExportLogs}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4" />
                  <span>{isExporting ? "Exportando..." : "Exportar Logs"}</span>
                </Button>
              </div>
              
              <div className="flex gap-2 flex-grow max-w-md">
                <Select value={filterType} onValueChange={handleFilterTypeChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filtrar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="error">Erros</SelectItem>
                    <SelectItem value="warning">Avisos</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="build">Build</SelectItem>
                    <SelectItem value="auth">Autenticação</SelectItem>
                    <SelectItem value="database">Banco de Dados</SelectItem>
                    <SelectItem value="user">Usuário Atual</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9 w-full" 
                    placeholder="Buscar nos logs..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Entradas de Log</CardTitle>
                <CardDescription>
                  {filteredLogs.length} entradas encontradas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md overflow-auto max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-48">Timestamp</TableHead>
                        <TableHead className="w-24">Tipo</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead className="w-32">Usuário</TableHead>
                        <TableHead className="w-40">Contexto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                            Nenhuma entrada de log encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log, index) => (
                          <TableRow key={index} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-xs">
                              {formatDate(log.timestamp)}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogTypeColor(log.type)}`}>
                                {log.type}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-md truncate" title={log.message}>
                              {log.message}
                            </TableCell>
                            <TableCell className="truncate" title={log.userId}>
                              {log.userId ? log.userId.substring(0, 8) + "..." : "-"}
                            </TableCell>
                            <TableCell className="truncate" title={log.context}>
                              {log.context || "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t py-4 px-6 text-muted-foreground text-sm">
                <p>Logs em memória: {logs.length}</p>
                <p>Atualizado em: {new Date().toLocaleTimeString('pt-BR')}</p>
              </CardFooter>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SystemLog;
