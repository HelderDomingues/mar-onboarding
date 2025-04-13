
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ConnectionStatus from '@/components/debug/ConnectionStatus';
import SecurityPolicyTester from '@/components/debug/SecurityPolicyTester';
import ConnectionTester from '@/components/debug/ConnectionTester';
import { testSupabaseConnection } from '@/utils/supabaseUtils';

const DiagnosticoSistema = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  // Teste simples para verificar se podemos acessar dados
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Executar o teste imediatamente quando o componente montar
    runConnectionTest();
  }, []);
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="bg-gray-50">
          <DashboardHeader isAdmin={true} />
          
          <main className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-bold">Diagnóstico do Sistema</h1>
              <p className="text-muted-foreground">
                Ferramentas para diagnosticar e testar o funcionamento do Sistema MAR.
              </p>
            </div>
            
            <Tabs defaultValue="status">
              <TabsList className="mb-4">
                <TabsTrigger value="status">Status do Sistema</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="status" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <ConnectionStatus />
                  
                  <ConnectionTester />
                  
                  <Card className="shadow-sm md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Informações do Sistema</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="font-medium">URL do Supabase:</div>
                        <div className="truncate">
                          {'https://btzvozqajqknqfoymxpg.supabase.co'}
                        </div>
                        
                        <div className="font-medium">Ambiente:</div>
                        <div>{process.env.NODE_ENV}</div>
                        
                        <div className="font-medium">Versão do App:</div>
                        <div>1.0.0</div>
                        
                        <div className="font-medium">Data de Build:</div>
                        <div>{new Date().toLocaleDateString('pt-BR')}</div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={runConnectionTest}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Testando...' : 'Testar Conexão'}
                      </Button>
                      
                      {testResult && (
                        <div className="ml-4 text-sm">
                          {testResult.success ? (
                            <span className="text-green-600">✓ {testResult.message}</span>
                          ) : (
                            <span className="text-red-600">✗ {testResult.message || testResult.error}</span>
                          )}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="security">
                <div className="space-y-6">
                  <SecurityPolicyTester />
                </div>
              </TabsContent>
              
              <TabsContent value="advanced">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Ferramentas Avançadas</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <Button variant="outline" onClick={() => navigate('/system-log')}>
                        Ver Logs do Sistema
                      </Button>
                      
                      <Button variant="outline" onClick={() => navigate('/test-connection')}>
                        Teste de Conexão Detalhado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
          
          <SiteFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DiagnosticoSistema;
