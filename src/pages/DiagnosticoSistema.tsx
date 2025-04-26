import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Database, ArrowDown, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { QuizStructureTest } from '@/components/quiz/QuizStructureTest';
import { backupQuizTables, listAvailableBackups } from '@/utils/backupUtils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { addLogEntry } from '@/utils/projectLog';

const DiagnosticoSistema = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [backups, setBackups] = useState<{ [key: string]: string[] }>({});

  // Verificar status do sistema
  const checkSystemStatus = async () => {
    try {
      setLoading(true);
      
      // Verificar conexão com Supabase
      const { data: dbData, error: dbError } = await supabase.from('quiz_modules').select('count', { count: 'exact', head: true });
      
      // Verificar tabelas do questionário
      const { count: modulesCount } = await supabase.from('quiz_modules').select('*', { count: 'exact', head: true });
      const { count: questionsCount } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true });
      const { count: optionsCount } = await supabase.from('quiz_options').select('*', { count: 'exact', head: true });
      const { count: submissionsCount } = await supabase.from('quiz_submissions').select('*', { count: 'exact', head: true });
      const { count: answersCount } = await supabase.from('quiz_answers').select('*', { count: 'exact', head: true });
      
      // Verificar status dos backups
      await loadBackups();
      
      setSystemStatus({
        dbConnection: !dbError,
        questionario: {
          modules: modulesCount || 0,
          questions: questionsCount || 0,
          options: optionsCount || 0,
          submissions: submissionsCount || 0,
          answers: answersCount || 0
        },
        timestamp: new Date().toISOString()
      });
      
      addLogEntry('info', 'Diagnóstico do sistema executado', {
        dbConnection: !dbError,
        questionario: {
          modules: modulesCount || 0,
          questions: questionsCount || 0,
          options: optionsCount || 0,
          submissions: submissionsCount || 0,
          answers: answersCount || 0
        }
      });
      
    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível verificar o status do sistema",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar backups disponíveis
  const loadBackups = async () => {
    try {
      const quizTables = [
        'quiz_modules',
        'quiz_questions',
        'quiz_options',
        'quiz_submissions',
        'quiz_answers'
      ];
      
      const backupResults = {};
      
      for (const table of quizTables) {
        const tableBackups = await listAvailableBackups(table);
        backupResults[table] = tableBackups;
      }
      
      setBackups(backupResults);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    }
  };
  
  // Criar backup completo
  const handleBackupSystem = async () => {
    try {
      setBackupLoading(true);
      toast({
        title: "Criando backup",
        description: "Aguarde enquanto fazemos backup das tabelas do questionário...",
      });
      
      const success = await backupQuizTables('backup_manual_pagina_diagnostico');
      
      if (success) {
        toast({
          title: "Backup concluído",
          description: "Backup de todas as tabelas do questionário foi criado com sucesso.",
        });
        
        // Recarregar lista de backups
        await loadBackups();
      } else {
        toast({
          variant: "destructive",
          title: "Erro no backup",
          description: "Não foi possível criar backup de todas as tabelas. Verifique os logs.",
        });
      }
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o backup do sistema",
      });
    } finally {
      setBackupLoading(false);
    }
  };
  
  // Carregar status inicial
  useEffect(() => {
    checkSystemStatus();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Diagnóstico do Sistema</h1>
          <p className="mt-2 text-lg text-gray-600">
            Verifique o status do sistema e realize operações de manutenção.
          </p>
        </div>
        
        <Tabs defaultValue="status" className="space-y-6">
          <TabsList>
            <TabsTrigger value="status">Status do Sistema</TabsTrigger>
            <TabsTrigger value="questionario">Questionário</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
          </TabsList>
          
          {/* Tab: Status do Sistema */}
          <TabsContent value="status">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Status da Conexão
                  </CardTitle>
                  <CardDescription>
                    Verifica a conectividade com o banco de dados
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {systemStatus ? (
                    <Alert className={systemStatus.dbConnection ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                      {systemStatus.dbConnection ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertTitle>
                        {systemStatus.dbConnection ? "Conexão estabelecida" : "Falha na conexão"}
                      </AlertTitle>
                      <AlertDescription>
                        {systemStatus.dbConnection 
                          ? "O sistema está conectado corretamente ao banco de dados."
                          : "Não foi possível estabelecer conexão com o banco de dados."}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={checkSystemStatus} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : "Verificar Novamente"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Status do Questionário
                  </CardTitle>
                  <CardDescription>
                    Verifica a integridade dos dados do questionário
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {systemStatus ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-500">Módulos</p>
                          <p className="text-2xl font-bold">{systemStatus.questionario.modules}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-500">Perguntas</p>
                          <p className="text-2xl font-bold">{systemStatus.questionario.questions}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-500">Opções</p>
                          <p className="text-2xl font-bold">{systemStatus.questionario.options}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-500">Submissões</p>
                          <p className="text-2xl font-bold">{systemStatus.questionario.submissions}</p>
                        </div>
                      </div>
                      
                      {(systemStatus.questionario.modules < 10 ||
                       systemStatus.questionario.questions < 20 ||
                       systemStatus.questionario.options < 30) && (
                        <Alert className="bg-amber-50 border-amber-200">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertTitle>Dados possivelmente incompletos</AlertTitle>
                          <AlertDescription>
                            Os números sugerem que o questionário pode estar incompleto ou ausente.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab: Questionário */}
          <TabsContent value="questionario">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estrutura do Questionário</CardTitle>
                  <CardDescription>
                    Verifica a estrutura e consistência dos dados do questionário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuizStructureTest />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status das Tabelas do Questionário</CardTitle>
                  <CardDescription>
                    Informações detalhadas sobre as tabelas do questionário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {systemStatus ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Tabela</th>
                            <th className="text-center py-3 px-4 font-medium">Registros</th>
                            <th className="text-center py-3 px-4 font-medium">Status</th>
                            <th className="text-center py-3 px-4 font-medium">Backups</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2 px-4">quiz_modules</td>
                            <td className="py-2 px-4 text-center">{systemStatus.questionario.modules}</td>
                            <td className="py-2 px-4 text-center">
                              {systemStatus.questionario.modules > 0 ? (
                                <Badge className="bg-green-500">OK</Badge>
                              ) : (
                                <Badge variant="destructive">Vazio</Badge>
                              )}
                            </td>
                            <td className="py-2 px-4 text-center">
                              {backups['quiz_modules']?.length || 0}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-4">quiz_questions</td>
                            <td className="py-2 px-4 text-center">{systemStatus.questionario.questions}</td>
                            <td className="py-2 px-4 text-center">
                              {systemStatus.questionario.questions > 0 ? (
                                <Badge className="bg-green-500">OK</Badge>
                              ) : (
                                <Badge variant="destructive">Vazio</Badge>
                              )}
                            </td>
                            <td className="py-2 px-4 text-center">
                              {backups['quiz_questions']?.length || 0}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-4">quiz_options</td>
                            <td className="py-2 px-4 text-center">{systemStatus.questionario.options}</td>
                            <td className="py-2 px-4 text-center">
                              {systemStatus.questionario.options > 0 ? (
                                <Badge className="bg-green-500">OK</Badge>
                              ) : (
                                <Badge variant="destructive">Vazio</Badge>
                              )}
                            </td>
                            <td className="py-2 px-4 text-center">
                              {backups['quiz_options']?.length || 0}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-4">quiz_submissions</td>
                            <td className="py-2 px-4 text-center">{systemStatus.questionario.submissions}</td>
                            <td className="py-2 px-4 text-center">
                              <Badge className="bg-green-500">OK</Badge>
                            </td>
                            <td className="py-2 px-4 text-center">
                              {backups['quiz_submissions']?.length || 0}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4">quiz_answers</td>
                            <td className="py-2 px-4 text-center">{systemStatus.questionario.answers}</td>
                            <td className="py-2 px-4 text-center">
                              <Badge className="bg-green-500">OK</Badge>
                            </td>
                            <td className="py-2 px-4 text-center">
                              {backups['quiz_answers']?.length || 0}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab: Backups */}
          <TabsContent value="backups">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ArrowDown className="mr-2 h-5 w-5" />
                    Gerenciamento de Backups
                  </CardTitle>
                  <CardDescription>
                    Crie e gerencie backups do questionário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <AlertTitle>Sobre backups</AlertTitle>
                      <AlertDescription>
                        Os backups são armazenados como tabelas no banco de dados. É recomendável criar um backup antes de
                        realizar quaisquer alterações significativas no questionário.
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  <Button
                    onClick={handleBackupSystem}
                    disabled={backupLoading}
                    className="w-full"
                  >
                    {backupLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando backup...
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Criar Backup Completo Agora
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Backups Disponíveis</CardTitle>
                  <CardDescription>
                    Visualize e gerencie os backups disponíveis no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(backups).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(backups).map(([table, tableBackups]) => (
                        <div key={table} className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">{table}</h3>
                          {tableBackups.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                              {tableBackups.map((backup) => (
                                <li key={backup} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <span className="font-mono">{backup}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">Nenhum backup disponível</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      {loading ? (
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      ) : (
                        <p className="text-gray-500">Nenhum backup encontrado no sistema</p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={loadBackups} 
                    variant="outline"
                    className="w-full"
                  >
                    Atualizar Lista
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab: Ferramentas */}
          <TabsContent value="ferramentas">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Teste de Conexão</CardTitle>
                  <CardDescription>
                    Verificar conectividade com o Supabase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/test-connection')}
                    variant="outline"
                    className="w-full"
                  >
                    Ir para Teste de Conexão
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Logs do Sistema</CardTitle>
                  <CardDescription>
                    Visualize os logs de atividade do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/admin/logs')}
                    variant="outline"
                    className="w-full"
                  >
                    Ver Logs do Sistema
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recuperação de Questionário</CardTitle>
                  <CardDescription>
                    Ferramentas para recuperação do questionário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/admin/recover-quiz')}
                    variant="outline"
                    className="w-full"
                  >
                    Ir para Recuperação
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <SiteFooter />
    </div>
  );
};

export default DiagnosticoSistema;
