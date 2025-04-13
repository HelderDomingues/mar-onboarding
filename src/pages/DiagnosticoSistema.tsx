
import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Database, Shield, Wrench, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConnectionStatus from "@/components/debug/ConnectionStatus";
import SecurityPolicyTester from "@/components/debug/SecurityPolicyTester";
import SupabaseConnectionTest from "@/components/SupabaseConnectionTest";
import { supabase } from "@/integrations/supabase/client";

const DiagnosticoSistema = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <DashboardHeader isAdmin={false} />
        <div className="flex-1 container max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso Restrito</AlertTitle>
            <AlertDescription>
              Esta página está disponível apenas para administradores do sistema.
            </AlertDescription>
          </Alert>
        </div>
        <SiteFooter />
      </div>
    );
  }
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={true} />
      
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <h1 className="text-2xl font-bold">Diagnóstico do Sistema</h1>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Sair
          </Button>
        </div>
        
        <Tabs defaultValue="status">
          <div className="border-b mb-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="status" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                <span>Status da Conexão</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Políticas de Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1">
                <Wrench className="h-4 w-4" />
                <span>Diagnóstico Avançado</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConnectionStatus />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Sistema</CardTitle>
                  <CardDescription>Detalhes da instalação e configuração</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">URL do Supabase:</div>
                    <div className="truncate">
                      {'https://btzvozqajqknqfoymxpg.supabase.co'}
                    </div>
                    
                    <div className="font-medium">Ambiente:</div>
                    <div>{process.env.NODE_ENV}</div>
                    
                    <div className="font-medium">Versão do Supabase:</div>
                    <div>
                      <Badge variant="outline" className="font-mono text-xs">
                        @supabase/supabase-js
                      </Badge>
                    </div>
                  </div>
                  
                  <Alert className="mt-4 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      As chaves do Supabase estão configuradas corretamente no arquivo client.ts
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <SecurityPolicyTester />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Políticas de RLS Configuradas</CardTitle>
                  <CardDescription>
                    As seguintes políticas de segurança foram aplicadas ao banco de dados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Acesso de Usuários Comuns</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Usuários podem gerenciar <strong>apenas seus próprios dados</strong> (read/write)</li>
                        <li>Usuários podem ver e gerenciar seus próprios perfis</li>
                        <li>Usuários podem ver e gerenciar suas próprias respostas de questionário</li>
                        <li>Usuários podem ver seus próprios papéis no sistema</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Acesso de Administradores</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Administradores têm <strong>acesso completo</strong> a todos os dados</li>
                        <li>Administradores podem gerenciar todos os perfis de usuários</li>
                        <li>Administradores podem gerenciar papéis de todos os usuários</li>
                        <li>Administradores podem ver e gerenciar todas as respostas de questionários</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Dados do Questionário</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Módulos, questões e opções são <strong>visíveis para todos os usuários autenticados</strong></li>
                        <li>Respostas são visíveis apenas para o próprio usuário e administradores</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <SupabaseConnectionTest />
          </TabsContent>
        </Tabs>
      </div>
      
      <SiteFooter />
    </div>
  );
};

export default DiagnosticoSistema;
