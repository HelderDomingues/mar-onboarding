
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogEntry, getAllLogs, getLogsByType, getLogsByUser, clearLogs, exportLogsToFile } from "@/utils/projectLog";
import { Ban, Download, Loader2, RefreshCw, Trash, Home, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const SystemLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(50);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      let loadedLogs = getAllLogs();

      if (typeFilter !== "all") {
        loadedLogs = getLogsByType(typeFilter as LogEntry['type']);
      }

      if (dateFilter) {
        loadedLogs = loadedLogs.filter(log => log.timestamp.startsWith(dateFilter));
      }

      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        loadedLogs = loadedLogs.filter(log =>
          log.message.toLowerCase().includes(lowerSearchTerm) ||
          (log.details && JSON.stringify(log.details).toLowerCase().includes(lowerSearchTerm)) ||
          (log.userId && log.userId.toLowerCase().includes(lowerSearchTerm)) ||
          (log.context && log.context.toLowerCase().includes(lowerSearchTerm))
        );
      }

      setLogs(loadedLogs.slice(0, limit));
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, dateFilter, searchTerm, limit]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleClearLogs = () => {
    clearLogs();
    setLogs([]);
    toast({
      title: "Logs limpos",
      description: "Todos os logs foram removidos do sistema.",
    });
  };

  const handleExportLogs = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const success = await exportLogsToFile(user.id);
      if (success) {
        toast({
          title: "Logs exportados",
          description: "Os logs foram exportados com sucesso para um arquivo JSON.",
        });
      } else {
        toast({
          title: "Erro ao exportar",
          description: "Não foi possível exportar os logs.",
          variant: "destructive",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link to="/admin/users">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Log do Sistema</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadLogs}
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </span>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </>
            )}
          </Button>
          <Button
            onClick={handleExportLogs}
            disabled={logs.length === 0 || isExporting}
            className="flex items-center"
          >
            {isExporting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </span>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="flex items-center"
          >
            <Trash className="mr-2 h-4 w-4" />
            Limpar
          </Button>
          <Link to="/dashboard">
            <Button variant="default" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="type-filter">Filtrar por tipo</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="warning">Alerta</SelectItem>
              <SelectItem value="info">Informação</SelectItem>
              <SelectItem value="auth">Autenticação</SelectItem>
              <SelectItem value="database">Banco de dados</SelectItem>
              <SelectItem value="navigation">Navegação</SelectItem>
              <SelectItem value="quiz">Questionário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date-filter">Filtrar por data</Label>
          <Input
            type="date"
            id="date-filter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="search-filter">Buscar</Label>
          <Input
            type="text"
            id="search-filter"
            placeholder="Buscar nos logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="limit-filter">Limite de registros</Label>
          <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Limite de registros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 registros</SelectItem>
              <SelectItem value="100">100 registros</SelectItem>
              <SelectItem value="200">200 registros</SelectItem>
              <SelectItem value="500">500 registros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-10">
          <Ban className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum registro de log encontrado</p>
          <Button onClick={loadLogs} className="mt-4">
            Carregar logs
          </Button>
        </div>
      ) : (
        <Table>
          <TableCaption>Registros de log do sistema.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Timestamp</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Contexto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow key={`${log.timestamp}-${index}`}>
                <TableCell className="font-medium">{log.timestamp}</TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  {log.details ? JSON.stringify(log.details, null, 2) : "N/A"}
                </TableCell>
                <TableCell>{log.userId || "N/A"}</TableCell>
                <TableCell>{log.context || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default SystemLog;
