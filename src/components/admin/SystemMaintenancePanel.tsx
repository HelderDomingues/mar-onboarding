import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  FileText,
  Trash2,
  Shield,
  Activity,
  Download
} from 'lucide-react';
import { runSystemValidation, validateAndReport, type TestResult } from '@/utils/systemValidator';
import { runSystemCleanup, cleanupAndReport, type CleanupResult } from '@/utils/systemCleaner';

interface SystemMaintenancePanelProps {
  isAdmin: boolean;
}

export const SystemMaintenancePanel: React.FC<SystemMaintenancePanelProps> = ({ isAdmin }) => {
  const { toast } = useToast();
  const [isRunningValidation, setIsRunningValidation] = useState(false);
  const [isRunningCleanup, setIsRunningCleanup] = useState(false);
  const [validationResults, setValidationResults] = useState<TestResult[]>([]);
  const [cleanupResults, setCleanupResults] = useState<CleanupResult[]>([]);
  const [validationReport, setValidationReport] = useState<string>('');
  const [cleanupReport, setCleanupReport] = useState<string>('');

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Acesso restrito a administradores</p>
        </CardContent>
      </Card>
    );
  }

  const handleRunValidation = async () => {
    setIsRunningValidation(true);
    try {
      toast({
        title: "Iniciando validação do sistema",
        description: "Executando testes de integridade e funcionalidade...",
      });

      const results = await runSystemValidation();
      setValidationResults(results);

      const report = await validateAndReport();
      setValidationReport(report);

      const successCount = results.filter(r => r.success).length;
      const totalTests = results.length;

      toast({
        title: "Validação concluída",
        description: `${successCount}/${totalTests} testes passaram`,
        variant: successCount === totalTests ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro na validação",
        description: "Ocorreu um erro durante a validação do sistema",
        variant: "destructive",
      });
    } finally {
      setIsRunningValidation(false);
    }
  };

  const handleRunCleanup = async () => {
    setIsRunningCleanup(true);
    try {
      toast({
        title: "Iniciando limpeza do sistema",
        description: "Executando tarefas de manutenção e otimização...",
      });

      const results = await runSystemCleanup();
      setCleanupResults(results);

      const report = await cleanupAndReport();
      setCleanupReport(report);

      const successCount = results.filter(r => r.success).length;
      const totalTasks = results.length;

      toast({
        title: "Limpeza concluída",
        description: `${successCount}/${totalTasks} tarefas executadas`,
        variant: successCount === totalTasks ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro na limpeza",
        description: "Ocorreu um erro durante a limpeza do sistema",
        variant: "destructive",
      });
    } finally {
      setIsRunningCleanup(false);
    }
  };

  const downloadReport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Sucesso
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Falha
      </Badge>
    );
  };

  const validationSuccessRate = validationResults.length > 0 
    ? ((validationResults.filter(r => r.success).length / validationResults.length) * 100)
    : 0;

  const cleanupSuccessRate = cleanupResults.length > 0 
    ? ((cleanupResults.filter(r => r.success).length / cleanupResults.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Painel de Manutenção do Sistema
          </CardTitle>
          <CardDescription>
            Ferramentas para validação, limpeza e otimização do Sistema MAR
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Validação
          </TabsTrigger>
          <TabsTrigger value="cleanup" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Limpeza
          </TabsTrigger>
        </TabsList>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Validação do Sistema</CardTitle>
              <CardDescription>
                Executa testes abrangentes para verificar a integridade e funcionalidade do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={handleRunValidation}
                  disabled={isRunningValidation}
                  className="flex items-center gap-2"
                >
                  {isRunningValidation ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  {isRunningValidation ? 'Executando...' : 'Executar Validação'}
                </Button>

                {validationReport && (
                  <Button 
                    variant="outline"
                    onClick={() => downloadReport(validationReport, `relatorio-validacao-${new Date().toISOString().split('T')[0]}.txt`)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar Relatório
                  </Button>
                )}
              </div>

              {validationResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa de Sucesso</span>
                    <span className="text-sm text-muted-foreground">
                      {validationResults.filter(r => r.success).length}/{validationResults.length}
                    </span>
                  </div>
                  <Progress value={validationSuccessRate} className="h-2" />

                  <ScrollArea className="h-64 border rounded p-4">
                    <div className="space-y-3">
                      {validationResults.map((result, index) => (
                        <div key={index} className="flex items-start justify-between gap-4 p-3 border rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{result.test}</span>
                              {result.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {result.duration}ms
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                          </div>
                          {getStatusBadge(result.success)}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleanup">
          <Card>
            <CardHeader>
              <CardTitle>Limpeza e Otimização</CardTitle>
              <CardDescription>
                Remove dados desnecessários e otimiza a performance do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={handleRunCleanup}
                  disabled={isRunningCleanup}
                  className="flex items-center gap-2"
                  variant="secondary"
                >
                  {isRunningCleanup ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isRunningCleanup ? 'Executando...' : 'Executar Limpeza'}
                </Button>

                {cleanupReport && (
                  <Button 
                    variant="outline"
                    onClick={() => downloadReport(cleanupReport, `relatorio-limpeza-${new Date().toISOString().split('T')[0]}.txt`)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar Relatório
                  </Button>
                )}
              </div>

              {cleanupResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa de Sucesso</span>
                    <span className="text-sm text-muted-foreground">
                      {cleanupResults.filter(r => r.success).length}/{cleanupResults.length}
                    </span>
                  </div>
                  <Progress value={cleanupSuccessRate} className="h-2" />

                  <ScrollArea className="h-64 border rounded p-4">
                    <div className="space-y-3">
                      {cleanupResults.map((result, index) => (
                        <div key={index} className="flex items-start justify-between gap-4 p-3 border rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{result.task}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                            {result.details && result.details.skipped && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Obs: {result.details.reason}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(result.success)}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};