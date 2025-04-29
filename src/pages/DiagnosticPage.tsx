
import React from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useAuth } from '@/hooks/useAuth';
import ConnectionStatus from '@/components/debug/ConnectionStatus';
import ConnectionTester from '@/components/debug/ConnectionTester';
import SupabaseConnectionStatus from '@/components/debug/SupabaseConnectionStatus';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import ForceRecoveryButton from '@/components/admin/ForceRecoveryButton';
import { diagnosticarConfiguracao } from '@/utils/debugUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DiagnosticPage() {
  const { isAdmin } = useAuth();
  
  // Executar diagnóstico ao carregar a página
  React.useEffect(() => {
    diagnosticarConfiguracao();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Diagnóstico do Sistema</h1>
          <p className="mt-2 text-gray-600">
            Esta página permite verificar e diagnosticar problemas com a conexão do Supabase e a estrutura de dados.
          </p>
        </div>
        
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Página de Diagnóstico</AlertTitle>
          <AlertDescription>
            Esta página é destinada para resolução de problemas técnicos. Se você está enfrentando problemas de conexão 
            ou erros no questionário, use as ferramentas abaixo para diagnosticar e resolver.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SupabaseConnectionStatus />
            
            <Card>
              <CardHeader>
                <CardTitle>Recuperação Forçada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Se os dados do questionário estiverem corrompidos ou faltando, 
                  você pode usar a função de recuperação forçada para reiniá-los.
                </p>
                
                <ForceRecoveryButton 
                  variant="destructive" 
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <ConnectionStatus />
            <ConnectionTester />
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
